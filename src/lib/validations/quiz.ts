import { z } from "zod";

export const quizQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()).length(4),
  correctIndex: z.number().int().min(0).max(3),
});

export const quizSchema = z.object({
  questions: z.array(quizQuestionSchema).min(1).max(10), // PRD asks for 10
});

export type QuizQuestion = z.infer<typeof quizQuestionSchema>;
export type Quiz = z.infer<typeof quizSchema>;
