"use server";

import { db } from "@/lib/db";
import { quizAttempts, quizzes, chapters, subjects } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

export async function getQuizHistory() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const history = await db.select({
    attemptId: quizAttempts.id,
    quizId: quizzes.id,
    chapterId: chapters.id,
    chapterName: chapters.name,
    subjectName: subjects.name,
    score: quizAttempts.score,
    questions: quizzes.questions,
    createdAt: quizAttempts.createdAt,
    weakTopics: quizAttempts.weakTopics,
  })
  .from(quizAttempts)
  .innerJoin(quizzes, eq(quizAttempts.quizId, quizzes.id))
  .innerJoin(chapters, eq(quizzes.chapterId, chapters.id))
  .innerJoin(subjects, eq(chapters.subjectId, subjects.id))
  .where(eq(quizAttempts.userId, user.id))
  .orderBy(desc(quizAttempts.createdAt));

  return history.map(h => {
    const maxScore = Array.isArray(h.questions) ? h.questions.length : 10;
    return {
      ...h,
      maxScore,
      percentage: (h.score / maxScore) * 100
    };
  });
}
