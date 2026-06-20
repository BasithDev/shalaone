import { db } from "@/lib/db";
import { studyProgress, chapters } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * The subjects a student has actually enrolled in (chosen at onboarding or in
 * settings). Source of truth = the subjects of chapters that have a
 * study_progress row for this user. NOT every subject in their class.
 */
export async function getSelectedSubjectIds(userId: string): Promise<string[]> {
  const rows = await db
    .select({ subjectId: chapters.subjectId })
    .from(studyProgress)
    .innerJoin(chapters, eq(studyProgress.chapterId, chapters.id))
    .where(eq(studyProgress.userId, userId));

  return [...new Set(rows.map((r) => r.subjectId))];
}
