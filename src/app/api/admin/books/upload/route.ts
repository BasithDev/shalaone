import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { db } from "@/lib/db";
import { books, bookChunks } from "@/db/schema";
import { PDFParse, type PageTextResult } from "pdf-parse";
import { chunkPages } from "@/lib/ai/chunk";
import { embedText } from "@/lib/ai/embed";
import { extractPdfTextWithGemini } from "@/lib/ai/ocr";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    // Verify admin
    if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const chapterId = formData.get("chapterId") as string;
    const title = formData.get("title") as string;

    if (!file || !chapterId || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDFs allowed" }, { status: 400 });
    }

    // 1. Upload to Supabase Storage (bucket: books) using admin client to bypass RLS policies
    const fileExt = file.name.split('.').pop();
    const fileName = `${chapterId}-${Date.now()}.${fileExt}`;
    
    // Convert the file to a buffer for both upload and pdf-parse
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { error: uploadError } = await supabaseAdmin.storage
      .from("books")
      .upload(fileName, buffer, {
        contentType: "application/pdf",
        upsert: true
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json({ error: "Failed to upload file to storage bucket 'books'" }, { status: 500 });
    }

    const { data: publicUrlData } = supabaseAdmin.storage.from("books").getPublicUrl(fileName);
    const fileUrl = publicUrlData.publicUrl;

    // 2. Database cleanup (if replacing existing book)
    const existingBook = await db.select().from(books).where(eq(books.chapterId, chapterId));
    if (existingBook.length > 0) {
      // cascade deletes chunks
      await db.delete(books).where(eq(books.chapterId, chapterId)); 
    }

    // Insert new book row
    const [newBook] = await db.insert(books).values({
      chapterId,
      title,
      fileUrl
    }).returning();

    // 3. Extract text with page breaks (fast path: embedded text layer)
    let pages: string[] = [];
    try {
      const parser = new PDFParse({ data: buffer });
      const parsedPdf = await parser.getText();
      pages = parsedPdf.pages.map((p: PageTextResult) => p.text);
    } catch (parseErr) {
      console.error("PDF parse error:", parseErr);
      pages = [];
    }

    // 3b. If the PDF has essentially no embedded text, it's a scanned/image PDF —
    //     fall back to OCR via Gemini (same free-tier model, no extra cost).
    const textChars = pages.reduce((sum, p) => sum + p.replace(/\s/g, "").length, 0);
    if (textChars < 50) {
      try {
        pages = await extractPdfTextWithGemini(buffer);
      } catch (ocrErr) {
        console.error("OCR error:", ocrErr);
        return NextResponse.json(
          { error: "Couldn't read this PDF even with OCR. It may be too large, password-protected, or corrupted." },
          { status: 400 }
        );
      }
    }

    // 4. Chunk
    const chunks = chunkPages(pages, 700, 100);

    if (chunks.length === 0) {
      return NextResponse.json({ error: "No text could be extracted from the PDF." }, { status: 400 });
    }

    // 5. Embed
    const chunkContents = chunks.map(c => c.content);
    let embeddings;
    try {
      embeddings = await embedText(chunkContents);
    } catch (embedErr) {
      console.error("Embedding error:", embedErr);
      return NextResponse.json({ error: "Failed to generate embeddings via Gemini API. Check rate limits or API key." }, { status: 500 });
    }

    if (embeddings.length !== chunks.length) {
      return NextResponse.json({ error: "Embedding length mismatch" }, { status: 500 });
    }

    // 6. Insert chunks
    const chunkInserts = chunks.map((c, i) => ({
      bookId: newBook.id,
      content: c.content,
      embedding: embeddings[i],
      pageNumber: c.pageNumber,
      chunkIndex: c.chunkIndex,
    }));

    // Batch insert if needed, but <1000 rows is fine for postgres
    if (chunkInserts.length > 0) {
       await db.insert(bookChunks).values(chunkInserts);
    }

    return NextResponse.json({ 
      success: true, 
      chunkCount: chunks.length,
      pageCount: pages.length > 0 ? pages.length - 1 : 0
    });

  } catch (error) {
    console.error("Upload handler error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
