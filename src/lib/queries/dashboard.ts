import { db } from "@/lib/db";
import { notes, quizAttempts, doubtSessions, studyProgress, chapters, subjects, quizzes } from "@/db/schema";
import { eq, desc, and, gte, sql, inArray } from "drizzle-orm";
import { getSelectedSubjectIds } from "./selected";

export async function getStreak(userId: string) {
  const userNotes = await db.select({ createdAt: notes.createdAt })
    .from(notes)
    .where(eq(notes.userId, userId))
    .orderBy(desc(notes.createdAt));

  if (userNotes.length === 0) return 0;

  const dates = [...new Set(userNotes.map(n => {
    const d = new Date(n.createdAt!);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }))];

  let streak = 0;
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`;

  if (dates[0] !== todayStr && dates[0] !== yesterdayStr) {
    return 0; 
  }

  const currentDate = new Date(dates[0]); 
  
  for (let i = 0; i < dates.length; i++) {
    const dStr = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`;
    if (dates[i] === dStr) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export async function getQuizStats(userId: string) {
  const attempts = await db.select({
    score: quizAttempts.score,
    answers: quizAttempts.answers
  })
  .from(quizAttempts)
  .where(eq(quizAttempts.userId, userId));

  const total = attempts.length;
  if (total === 0) return { total: 0, avgPercentage: 0 };

  const totalPercentage = attempts.reduce((acc, attempt) => {
    const maxScore = (attempt.answers as any[]).length || 10;
    return acc + (attempt.score / maxScore) * 100;
  }, 0);

  return {
    total,
    avgPercentage: Math.round(totalPercentage / total)
  };
}

export async function getDoubtCount(userId: string) {
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);
  firstDayOfMonth.setHours(0, 0, 0, 0);

  const sessions = await db.select()
    .from(doubtSessions)
    .where(and(eq(doubtSessions.userId, userId), gte(doubtSessions.createdAt, firstDayOfMonth)));
    
  return sessions.length;
}

export async function getNoteStats(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const allNotes = await db.select({ createdAt: notes.createdAt })
    .from(notes)
    .where(eq(notes.userId, userId));

  const uploadedToday = allNotes.filter(n => new Date(n.createdAt!) >= today).length;

  return {
    total: allNotes.length,
    todayCount: uploadedToday
  };
}


export async function getRecentActivity(userId: string) {
  const recentDoubt = await db.select({
    chapterId: doubtSessions.chapterId,
    chapterName: chapters.name,
    createdAt: doubtSessions.createdAt,
    type: sql<string>`'doubt'`
  })
  .from(doubtSessions)
  .innerJoin(chapters, eq(doubtSessions.chapterId, chapters.id))
  .where(eq(doubtSessions.userId, userId))
  .orderBy(desc(doubtSessions.createdAt))
  .limit(1);

  const recentQuiz = await db.select({
    chapterId: quizzes.chapterId,
    chapterName: chapters.name,
    createdAt: quizAttempts.createdAt,
    type: sql<string>`'quiz'`
  })
  .from(quizAttempts)
  .innerJoin(quizzes, eq(quizAttempts.quizId, quizzes.id))
  .innerJoin(chapters, eq(quizzes.chapterId, chapters.id))
  .where(eq(quizAttempts.userId, userId))
  .orderBy(desc(quizAttempts.createdAt))
  .limit(1);

  if (recentDoubt.length === 0 && recentQuiz.length === 0) return null;
  if (recentDoubt.length === 0) return recentQuiz[0];
  if (recentQuiz.length === 0) return recentDoubt[0];

  const doubtTime = recentDoubt[0].createdAt ? new Date(recentDoubt[0].createdAt).getTime() : 0;
  const quizTime = recentQuiz[0].createdAt ? new Date(recentQuiz[0].createdAt).getTime() : 0;

  return doubtTime > quizTime ? recentDoubt[0] : recentQuiz[0];
}

export async function getFocusAreas(userId: string) {
  return await db.select({
    chapterId: chapters.id,
    chapterName: chapters.name,
    subjectName: subjects.name
  })
  .from(studyProgress)
  .innerJoin(chapters, eq(studyProgress.chapterId, chapters.id))
  .innerJoin(subjects, eq(chapters.subjectId, subjects.id))
  .where(and(eq(studyProgress.userId, userId), eq(studyProgress.status, "weak")))
  .limit(3);
}

export async function getSubjectProgress(userId: string) {
  // Only the subjects the student selected — not every subject in their class.
  const selectedIds = await getSelectedSubjectIds(userId);
  if (selectedIds.length === 0) return [];

  const classSubjects = await db.select().from(subjects).where(inArray(subjects.id, selectedIds));

  const results = [];
  for (const sub of classSubjects) {
    const subChapters = await db.select({ id: chapters.id }).from(chapters).where(eq(chapters.subjectId, sub.id));
    const chapterIds = subChapters.map(c => c.id);

    if (chapterIds.length === 0) {
      results.push({ subjectName: sub.name, percentage: 0 });
      continue;
    }

    const mastered = await db.select()
      .from(studyProgress)
      .where(and(
        eq(studyProgress.userId, userId),
        eq(studyProgress.status, "mastered"),
        inArray(studyProgress.chapterId, chapterIds)
      ));
      
    results.push({
      subjectName: sub.name,
      percentage: Math.round((mastered.length / chapterIds.length) * 100)
    });
  }

  return results;
}
