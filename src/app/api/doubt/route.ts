import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { doubtSessions } from "@/db/schema";
import { getChapterContext } from "@/lib/ai/retrieve";
import { generateGroundedResponseStream } from "@/lib/ai/generate";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { chapterId, question } = await request.json();
  if (!chapterId || !question) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  try {
    const chunks = await getChapterContext(chapterId, user.id, question);

    if (chunks.length === 0) {
      return NextResponse.json({ error: "This chapter's content isn't ready yet" }, { status: 400 });
    }

    const genStream = await generateGroundedResponseStream(question, chunks);

    const stream = new ReadableStream({
      async start(controller) {
        let fullAnswer = "";
        try {
          for await (const chunk of genStream) {
             const text = chunk.text;
             if (text) {
               fullAnswer += text;
               controller.enqueue(new TextEncoder().encode(text));
             }
          }
          controller.close();
        } catch (e) {
          console.error("Stream error", e);
          controller.error(e);
        }

        // Save session after stream closes to ensure it persists even on client disconnect.
        // Store just the distinct pages used, so the row stays small.
        const pages = [...new Set(chunks.map(c => c.pageNumber).filter((p): p is number => p != null))];
        const sourceChunks = { pages };
        await db.insert(doubtSessions).values({
           userId: user.id,
           chapterId,
           question,
           answer: fullAnswer,
           sourceChunks: sourceChunks
        }).catch(err => {
           console.error("Failed to save doubt session:", err);
        });
      }
    });

    return new Response(stream, { headers: { "Content-Type": "text/plain" } });

  } catch (err) {
    console.error("Doubt processing error", err);
    return NextResponse.json({ error: "Something went wrong generating a response — try again" }, { status: 500 });
  }
}
