import { db } from "@/lib/db";
import { bookChunks, books, noteChunks, notes } from "@/db/schema";
import { eq, sql, asc, and } from "drizzle-orm";
import { embedText } from "./embed";

export type ContextChunk = {
  content: string;
  pageNumber: number | null;
  sourceType: "book" | "note";
};

// ~15k tokens of context. A single chapter comfortably fits; the cap just keeps
// an unusually large chapter (e.g. a whole OCR'd book) from blowing the request.
const CONTEXT_CHAR_BUDGET = 60000;

/**
 * Build the context the AI answers from. By default it returns the ENTIRE chapter
 * (all book chunks in reading order + the student's own note chunks), so the model
 * can summarize or explain anything in the chapter — not just a few excerpts.
 * If the chapter is larger than the budget, it falls back to semantic top-k.
 */
export async function getChapterContext(
  chapterId: string,
  userId: string | null,
  question: string
): Promise<ContextChunk[]> {
  const bookRows = await db
    .select({ content: bookChunks.content, pageNumber: bookChunks.pageNumber })
    .from(bookChunks)
    .innerJoin(books, eq(bookChunks.bookId, books.id))
    .where(eq(books.chapterId, chapterId))
    .orderBy(asc(bookChunks.chunkIndex));

  const noteRows = userId
    ? await db
        .select({ content: noteChunks.content })
        .from(noteChunks)
        .innerJoin(notes, eq(noteChunks.noteId, notes.id))
        .where(and(eq(notes.chapterId, chapterId), eq(notes.userId, userId)))
        .orderBy(asc(noteChunks.chunkIndex))
    : [];

  const all: ContextChunk[] = [
    ...bookRows.map((r) => ({
      content: r.content,
      pageNumber: r.pageNumber,
      sourceType: "book" as const,
    })),
    ...noteRows.map((r) => ({
      content: r.content,
      pageNumber: null,
      sourceType: "note" as const,
    })),
  ];

  const totalChars = all.reduce((sum, c) => sum + c.content.length, 0);

  // Normal case: the whole chapter fits — hand the model everything, in order.
  if (totalChars <= CONTEXT_CHAR_BUDGET) {
    return all;
  }

  // Large chapter: fall back to semantic search, filling up to the budget.
  return retrieveTopK(chapterId, userId, question, CONTEXT_CHAR_BUDGET);
}

async function retrieveTopK(
  chapterId: string,
  userId: string | null,
  question: string,
  budget: number
): Promise<ContextChunk[]> {
  const [qEmbedding] = await embedText([question]);
  const vec = JSON.stringify(qEmbedding);

  const bDistance = sql<number>`${bookChunks.embedding} <=> ${vec}::vector`;
  const bookResults = await db
    .select({
      content: bookChunks.content,
      pageNumber: bookChunks.pageNumber,
      distance: bDistance,
    })
    .from(bookChunks)
    .innerJoin(books, eq(bookChunks.bookId, books.id))
    .where(eq(books.chapterId, chapterId))
    .orderBy(asc(bDistance))
    .limit(60);

  const ranked: (ContextChunk & { distance: number })[] = bookResults.map((r) => ({
    content: r.content,
    pageNumber: r.pageNumber,
    sourceType: "book" as const,
    distance: r.distance,
  }));

  if (userId) {
    const nDistance = sql<number>`${noteChunks.embedding} <=> ${vec}::vector`;
    const noteResults = await db
      .select({ content: noteChunks.content, distance: nDistance })
      .from(noteChunks)
      .innerJoin(notes, eq(noteChunks.noteId, notes.id))
      .where(and(eq(notes.chapterId, chapterId), eq(notes.userId, userId)))
      .orderBy(asc(nDistance))
      .limit(60);

    for (const r of noteResults) {
      ranked.push({
        content: r.content,
        pageNumber: null,
        sourceType: "note" as const,
        distance: r.distance,
      });
    }
  }

  ranked.sort((a, b) => a.distance - b.distance);

  const selected: ContextChunk[] = [];
  let used = 0;
  for (const c of ranked) {
    if (used + c.content.length > budget && selected.length > 0) break;
    selected.push({ content: c.content, pageNumber: c.pageNumber, sourceType: c.sourceType });
    used += c.content.length;
  }
  return selected;
}
