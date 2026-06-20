import { ai, TEXT_MODEL } from "./gemini";
import type { ContextChunk } from "./retrieve";

export async function generateGroundedResponseStream(question: string, chunks: ContextChunk[]) {
  const contextText = chunks
    .map((c) => {
      const label =
        c.sourceType === "note"
          ? "Your notes"
          : c.pageNumber
          ? `Page ${c.pageNumber}`
          : "Textbook";
      return `[${label}]\n${c.content}`;
    })
    .join("\n\n");

  const prompt = `You are a friendly, encouraging study tutor for a school student. Answer the student's question using the chapter material below.

How to answer:
- Be clear, detailed and well-structured. Use short paragraphs, and use headings or bullet points when they make the answer easier to follow. Explain in simple language suited to a school student.
- Base your answer ONLY on the chapter material provided. Do not add facts from outside the chapter. If the material genuinely does not cover the question, say so briefly and mention what the chapter does cover instead.
- Do NOT mention page numbers or sources in your answer UNLESS the student explicitly asks where something comes from (e.g. "which page", "what's the source"). Only then, cite it like "(page X)".
- Write naturally, speaking directly to the student. Never refer to "the provided material", "the context", or "the chunks".

Chapter material:
${contextText}

Student's question:
${question}`;

  const responseStream = await ai.models.generateContentStream({
    model: TEXT_MODEL,
    contents: prompt,
  });

  return responseStream;
}
