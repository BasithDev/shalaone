import { db } from "@/lib/db";
import { studyProgress, chapters, subjects } from "@/db/schema";
import { eq, and, asc, inArray } from "drizzle-orm";
import { getSelectedSubjectIds } from "./selected";

export async function getFullSyllabusMap(userId: string) {
  // Only the subjects the student selected — not every subject in their class.
  const selectedIds = await getSelectedSubjectIds(userId);
  if (selectedIds.length === 0) return [];

  const classSubjects = await db.select().from(subjects).where(inArray(subjects.id, selectedIds));

  const map = [];

  for (const sub of classSubjects) {
    const subChapters = await db.select({
      id: chapters.id,
      name: chapters.name,
      order: chapters.order
    })
    .from(chapters)
    .where(eq(chapters.subjectId, sub.id))
    .orderBy(asc(chapters.order), asc(chapters.id));

    if (subChapters.length === 0) continue;

    const chapterIds = subChapters.map(c => c.id);

    const progressRecords = await db.select()
      .from(studyProgress)
      .where(and(eq(studyProgress.userId, userId), inArray(studyProgress.chapterId, chapterIds)));
      
    const progressMap = new Map(progressRecords.map(p => [p.chapterId, p.status]));
    
    let masteredCount = 0;
    const chaptersWithStatus = subChapters.map(ch => {
      const status = progressMap.get(ch.id) || "not_started";
      if (status === "mastered") masteredCount++;
      return {
        ...ch,
        status
      };
    });

    map.push({
      subjectId: sub.id,
      subjectName: sub.name,
      chapters: chaptersWithStatus,
      percentage: Math.round((masteredCount / subChapters.length) * 100),
      totalChapters: subChapters.length,
      masteredCount
    });
  }

  return map;
}
