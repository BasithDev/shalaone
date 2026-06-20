import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { books, bookChunks, quizzes, chapters } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { generateQuizFromChunks } from "@/lib/ai/quiz-prompt";
import { quizSchema } from "@/lib/validations/quiz";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { chapterId } = await request.json();
    if (!chapterId) return NextResponse.json({ error: "Missing chapterId" }, { status: 400 });

    const [chapter] = await db.select().from(chapters).where(eq(chapters.id, chapterId));
    if (!chapter) return NextResponse.json({ error: "Chapter not found" }, { status: 404 });

    const [book] = await db.select().from(books).where(eq(books.chapterId, chapterId));
    if (!book) return NextResponse.json({ error: "No content available yet" }, { status: 400 });

    const chunks = await db.select()
      .from(bookChunks)
      .where(eq(bookChunks.bookId, book.id))
      .orderBy(asc(bookChunks.chunkIndex));

    if (chunks.length === 0) return NextResponse.json({ error: "No content available yet" }, { status: 400 });

    // MVP limitation: chunks are sampled evenly to stay within the prompt token budget (~8000 chars).
    // A production implementation would use semantic clustering or hierarchical summarization.
    const MAX_CHARS = 8000;
    let chunksText = "";
    if (chunks.reduce((sum, c) => sum + c.content.length, 0) <= MAX_CHARS) {
      chunksText = chunks.map(c => c.content).join("\n\n");
    } else {
      const avgChunkLen = chunks.reduce((sum, c) => sum + c.content.length, 0) / chunks.length;
      const targetCount = Math.floor(MAX_CHARS / avgChunkLen);
      const step = Math.max(1, Math.floor(chunks.length / targetCount));
      const sampled = chunks.filter((_, i) => i % step === 0).slice(0, targetCount);
      chunksText = sampled.map(c => c.content).join("\n\n");
    }

    let parsedResult;
    let attempts = 0;
    
    while (attempts < 2) {
      try {
        const rawJson = await generateQuizFromChunks(chapter.name, chunksText);
        parsedResult = quizSchema.parse(rawJson);
        break; // Success
      } catch (e) {
        console.error(`Quiz generation attempt ${attempts + 1} failed:`, e);
        attempts++;
      }
    }

    if (!parsedResult) {
      return NextResponse.json({ error: "Couldn't generate a quiz right now, try again in a moment" }, { status: 500 });
    }

    // Save to quizzes table
    const [newQuiz] = await db.insert(quizzes).values({
      chapterId,
      questions: parsedResult.questions
    }).returning();

    return NextResponse.json({ success: true, quizId: newQuiz.id });
  } catch (error) {
    console.error("Generate quiz error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
