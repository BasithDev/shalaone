import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export const ai = new GoogleGenAI({ apiKey: apiKey || "dummy" });

// Single source of truth for the text/multimodal model. Configured via GEMINI_MODEL
// (currently gemini-3.1-flash-lite-preview); gemini-2.5-flash is deprecated.
export const TEXT_MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
