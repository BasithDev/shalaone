import { ai } from "./gemini";

// Must match the `vector("embedding", { dimensions: ... })` column width in src/db/schema.ts.
export const EMBEDDING_DIMENSIONS = 768;

// text-embedding-004 was retired on the Generative Language API; gemini-embedding-001
// is the current model. It defaults to 3072 dims, so we request 768 to fit the schema.
const EMBEDDING_MODEL = "gemini-embedding-001";

export async function embedText(texts: string[]): Promise<number[][]> {
  const embeddings: number[][] = [];

  for (const text of texts) {
    let retries = 2;
    let success = false;

    while (!success && retries >= 0) {
      try {
        const response = await ai.models.embedContent({
          model: EMBEDDING_MODEL,
          contents: text,
          config: { outputDimensionality: EMBEDDING_DIMENSIONS },
        });

        if (response.embeddings && response.embeddings.length > 0 && response.embeddings[0].values) {
          embeddings.push(response.embeddings[0].values);
          success = true;
        } else {
          throw new Error("No embedding values returned");
        }
      } catch (error) {
        retries--;
        if (retries < 0) throw error;
        await new Promise((res) => setTimeout(res, 1000)); // wait 1s before retry
      }
    }
  }

  return embeddings;
}
