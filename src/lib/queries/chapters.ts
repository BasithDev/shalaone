"use server";

import { db } from "@/lib/db";
import { chapters, subjects, books } from "@/db/schema";
import { eq, inArray, asc } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { getSelectedSubjectIds } from "./selected";

export async function getStudentChapters() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Only the subjects the student selected — not every subject in their class.
  const subjectIds = await getSelectedSubjectIds(user.id);
  if (subjectIds.length === 0) return [];

  const studentChapters = await db.select({
     id: chapters.id,
     name: chapters.name,
     order: chapters.order,
     subjectId: chapters.subjectId,
     subjectName: subjects.name
  })
  .from(chapters)
  .innerJoin(subjects, eq(chapters.subjectId, subjects.id))
  .where(inArray(chapters.subjectId, subjectIds))
  .orderBy(asc(subjects.name), asc(chapters.order));

  const allBooks = await db.select().from(books);
  const bookChapterIds = new Set(allBooks.map(b => b.chapterId));

  return studentChapters.map(ch => ({
    ...ch,
    hasBook: bookChapterIds.has(ch.id)
  }));
}
