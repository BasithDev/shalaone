import { ai, TEXT_MODEL } from "./gemini";
import { Schema, Type } from "@google/genai";

const quizResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          correctIndex: { type: Type.INTEGER },
        },
        required: ["question", "options", "correctIndex"],
      },
    },
  },
  required: ["questions"],
};

export async function generateQuizFromChunks(chapterName: string, chunksText: string) {
  const prompt = `You are an expert teacher. Generate exactly 10 multiple-choice questions for the chapter "${chapterName}" based strictly on the provided textbook content. 
Each question must have exactly 4 options.
The correctIndex must be an integer between 0 and 3 indicating the correct option in the options array.

Textbook Content:
${chunksText}`;

  const response = await ai.models.generateContent({
    model: TEXT_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: quizResponseSchema,
      temperature: 0.2, // Low temp for factual accuracy
    }
  });

  const text = response.text;
  if (!text) throw new Error("No text returned from Gemini");
  return JSON.parse(text);
}
