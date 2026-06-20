import { ai, TEXT_MODEL } from "./gemini";

const OCR_PROMPT = `You are an OCR engine. Transcribe ALL readable text from this PDF, preserving reading order.
Rules:
- Begin each page's text with a line exactly: ===PAGE n=== (n is the page number, starting at 1).
- Transcribe text faithfully. Render mathematical equations in readable form (plain text or LaTeX-like).
- For images/diagrams with no text, insert a short note like [Figure: brief description].
- Do NOT add explanations, summaries, or any commentary of your own.`;

/**
 * OCR a (likely scanned/image-based) PDF using Gemini's multimodal model.
 * Returns one string per page so it slots straight into chunkPages().
 * Uses the same free-tier Gemini model as the rest of the app — no extra cost.
 */
export async function extractPdfTextWithGemini(buffer: Buffer): Promise<string[]> {
  const base64 = buffer.toString("base64");

  let retries = 2;
  while (true) {
    try {
      const response = await ai.models.generateContent({
        model: TEXT_MODEL,
        contents: [
          { inlineData: { mimeType: "application/pdf", data: base64 } },
          { text: OCR_PROMPT },
        ],
      });
      return splitPages(response.text ?? "");
    } catch (error) {
      // Free tier returns 429 (rate limit) / 503 (overloaded) under load — retry.
      if (retries-- <= 0) throw error;
      await new Promise((res) => setTimeout(res, 2000));
    }
  }
}

// Split the model output on the ===PAGE n=== markers. Order is preserved, so the
// array index maps to the page number (matching how chunkPages numbers pages).
function splitPages(text: string): string[] {
  const pages = text
    .split(/===PAGE\s+\d+===/i)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  // Fallback: model didn't emit markers but did return text — treat as a single page.
  if (pages.length === 0) {
    const whole = text.trim();
    return whole ? [whole] : [];
  }
  return pages;
}
