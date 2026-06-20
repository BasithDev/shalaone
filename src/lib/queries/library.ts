"use server";

import { db } from "@/lib/db";
import { chapters, subjects, books } from "@/db/schema";
import { eq, inArray, asc } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { getSelectedSubjectIds } from "./selected";

export type LibraryChapter = {
  id: string;
  name: string;
  order: number | null;
  bookTitle: string | null;
  fileUrl: string | null;
};

export type LibrarySubject = {
  subjectId: string;
  subjectName: string;
  chapters: LibraryChapter[];
  bookCount: number;
};

/**
 * The student's "book bag": every subject in their class with its chapters and
 * the textbook PDF (if uploaded) so they can read or download it.
 */
export async function getStudentLibrary(): Promise<LibrarySubject[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // Only the subjects the student actually selected — not all class subjects.
  const subjectIds = await getSelectedSubjectIds(user.id);
  if (subjectIds.length === 0) return [];

  const classSubjects = await db
    .select()
    .from(subjects)
    .where(inArray(subjects.id, subjectIds))
    .orderBy(asc(subjects.name));
  if (classSubjects.length === 0) return [];

  const rows = await db
    .select({
      id: chapters.id,
      name: chapters.name,
      order: chapters.order,
      subjectId: chapters.subjectId,
      bookTitle: books.title,
      fileUrl: books.fileUrl,
    })
    .from(chapters)
    .leftJoin(books, eq(books.chapterId, chapters.id))
    .where(inArray(chapters.subjectId, subjectIds))
    .orderBy(asc(chapters.order), asc(chapters.id));

  return classSubjects
    .map((s) => {
      const list: LibraryChapter[] = rows
        .filter((r) => r.subjectId === s.id)
        .map((r) => ({ id: r.id, name: r.name, order: r.order, bookTitle: r.bookTitle, fileUrl: r.fileUrl }));
      return {
        subjectId: s.id,
        subjectName: s.name,
        chapters: list,
        bookCount: list.filter((c) => c.fileUrl).length,
      };
    })
    .filter((s) => s.chapters.length > 0);
}
