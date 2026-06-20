import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { db } from "@/lib/db";
import { notes, noteChunks } from "@/db/schema";
import { PDFParse, type PageTextResult } from "pdf-parse";
import { chunkPages } from "@/lib/ai/chunk";
import { embedText } from "@/lib/ai/embed";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const chapterId = formData.get("chapterId") as string;

    if (!file || !chapterId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type)) {
      return NextResponse.json({ error: "Only PDF, JPG, and PNG files are allowed" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be under 10MB" }, { status: 400 });
    }

    // 1. Upload to Supabase Storage (bucket: notes) using admin client to bypass RLS policies
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${chapterId}-${Date.now()}.${fileExt}`;
    
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

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("notes")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json({ error: "Failed to upload file to storage" }, { status: 500 });
    }

    // Store the path so we can generate signed URLs later
    const fileUrl = uploadData.path;

    // 2. Extract text if PDF
    let extractedText = null;
    let chunksToInsert: { content: string; embedding: number[]; chunkIndex: number }[] = [];

    if (file.type === "application/pdf") {
      try {
        const parser = new PDFParse({ data: buffer });
        const parsedPdf = await parser.getText();

        // Cap stored raw text to avoid giant rows, chunks hold the real searchable data
        extractedText = parsedPdf.text.substring(0, 10000); 
        
        const pages = parsedPdf.pages.map((p: PageTextResult) => p.text);
        const chunks = chunkPages(pages, 700, 100);

        if (chunks.length > 0) {
          const chunkContents = chunks.map(c => c.content);
          const embeddings = await embedText(chunkContents);

          if (embeddings.length === chunks.length) {
            chunksToInsert = chunks.map((c, i) => ({
              content: c.content,
              embedding: embeddings[i],
              chunkIndex: c.chunkIndex,
            }));
          }
        }
      } catch (parseErr) {
        console.error("PDF parse/embedding error:", parseErr);
        // Do not block upload, just skip extraction
      }
    }

    // 3. Insert Note Row
    const [newNote] = await db.insert(notes).values({
      userId: user.id,
      chapterId,
      fileUrl,
      extractedText
    }).returning();

    // 4. Insert Chunks
    if (chunksToInsert.length > 0) {
      const dbChunks = chunksToInsert.map(c => ({
        ...c,
        noteId: newNote.id
      }));
      await db.insert(noteChunks).values(dbChunks);
    }

    return NextResponse.json({ 
      success: true, 
      noteId: newNote.id,
      isSearchable: chunksToInsert.length > 0
    });

  } catch (error) {
    console.error("Upload handler error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
