import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { quizzes, quizAttempts, studyProgress, chapters } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { QuizQuestion } from "@/lib/validations/quiz";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { quizId, answers } = await request.json(); // answers is array of selected option indexes
    if (!quizId || !Array.isArray(answers)) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, quizId));
    if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

    const questions = quiz.questions as QuizQuestion[];
    if (answers.length !== questions.length) {
      return NextResponse.json({ error: "Incomplete quiz answers" }, { status: 400 });
    }

    // Grade
    let score = 0;
    for (let i = 0; i < questions.length; i++) {
      if (answers[i] === questions[i].correctIndex) {
        score++;
      }
    }

    const maxScore = questions.length;
    const percentage = (score / maxScore) * 100;

    const [chapter] = await db.select().from(chapters).where(eq(chapters.id, quiz.chapterId));
    let weakTopics: string[] = [];
    if (percentage < 60) {
      weakTopics = [chapter.name];
    }

    // Insert attempt
    const [attempt] = await db.insert(quizAttempts).values({
      userId: user.id,
      quizId,
      answers,
      score,
      weakTopics
    }).returning();

    // Upsert study_progress
    let status = "weak";
    if (percentage >= 80) status = "mastered";
    else if (percentage >= 60) status = "in_progress";

    await db.insert(studyProgress).values({
      userId: user.id,
      chapterId: quiz.chapterId,
      status
    }).onConflictDoUpdate({
      target: [studyProgress.userId, studyProgress.chapterId],
      set: { status, updatedAt: new Date() }
    });

    return NextResponse.json({ 
      success: true, 
      attemptId: attempt.id,
      score,
      maxScore
    });

  } catch (error) {
    console.error("Submit quiz error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
