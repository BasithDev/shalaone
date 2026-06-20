import { db } from "@/lib/db";
import { profiles, boards, classes } from "@/db/schema";
import { eq, sql, desc } from "drizzle-orm";

export async function getAdminAnalytics() {
  // All scalar counts in a single round trip — far faster than 16 separate
  // queries against the remote pooler, and every value is coerced to a number.
  const scalarsPromise = db.execute(sql`
    select
      (select count(*) from profiles where role = 'student')::int as students,
      (select count(*) from profiles where role = 'admin')::int as admins,
      (select count(*) from profiles where role = 'student' and board_id is not null)::int as onboarded,
      (select count(*) from boards)::int as boards,
      (select count(*) from classes)::int as classes,
      (select count(*) from subjects)::int as subjects,
      (select count(*) from chapters)::int as chapters,
      (select count(*) from books)::int as books,
      (select count(*) from book_chunks)::int as book_chunks,
      (select count(*) from note_chunks)::int as note_chunks,
      (select count(*) from quizzes)::int as quizzes,
      (select count(*) from quiz_attempts)::int as attempts,
      (select count(*) from doubt_sessions)::int as doubts,
      (select count(*) from notes)::int as notes,
      (select count(*) from chapters c left join books b on c.id = b.chapter_id where b.id is null)::int as chapters_without_book,
      coalesce((select avg((score::float / nullif(jsonb_array_length(answers), 0)) * 100) from quiz_attempts), 0) as avg_quiz_score
  `);

  const studentsByClassPromise = db
    .select({
      className: classes.name,
      boardName: boards.name,
      count: sql<number>`count(${profiles.id})::int`,
    })
    .from(profiles)
    .innerJoin(classes, eq(profiles.classId, classes.id))
    .innerJoin(boards, eq(classes.boardId, boards.id))
    .where(eq(profiles.role, "student"))
    .groupBy(classes.id, classes.name, boards.name)
    .orderBy(desc(sql`count(${profiles.id})`));

  const studentsByBoardPromise = db
    .select({
      boardName: boards.name,
      count: sql<number>`count(${profiles.id})::int`,
    })
    .from(profiles)
    .innerJoin(boards, eq(profiles.boardId, boards.id))
    .where(eq(profiles.role, "student"))
    .groupBy(boards.id, boards.name)
    .orderBy(desc(sql`count(${profiles.id})`));

  const recentStudentsPromise = db
    .select({
      fullName: profiles.fullName,
      createdAt: profiles.createdAt,
      className: classes.name,
      boardName: boards.name,
    })
    .from(profiles)
    .leftJoin(classes, eq(profiles.classId, classes.id))
    .leftJoin(boards, eq(profiles.boardId, boards.id))
    .where(eq(profiles.role, "student"))
    .orderBy(desc(profiles.createdAt))
    .limit(8);

  const [scalarRows, studentsByClass, studentsByBoard, recentStudents] = await Promise.all([
    scalarsPromise,
    studentsByClassPromise,
    studentsByBoardPromise,
    recentStudentsPromise,
  ]);

  const s = (scalarRows as unknown as Record<string, unknown>[])[0] ?? {};
  const n = (key: string) => Number(s[key]) || 0;

  const chapterCount = n("chapters");
  const chaptersWithoutBook = n("chapters_without_book");
  const chaptersWithBook = chapterCount - chaptersWithoutBook;
  const coverage = chapterCount > 0 ? Math.round((chaptersWithBook / chapterCount) * 100) : 0;

  return {
    students: n("students"),
    admins: n("admins"),
    onboardedStudents: n("onboarded"),
    boardCount: n("boards"),
    classCount: n("classes"),
    subjectCount: n("subjects"),
    chapterCount,
    bookCount: n("books"),
    chaptersWithBook,
    chaptersWithoutBook,
    coverage,
    bookChunkCount: n("book_chunks"),
    noteChunkCount: n("note_chunks"),
    quizCount: n("quizzes"),
    attemptCount: n("attempts"),
    avgQuizScore: Math.round(n("avg_quiz_score")),
    doubtCount: n("doubts"),
    noteCount: n("notes"),
    studentsByClass: studentsByClass.map((r) => ({ ...r, count: Number(r.count) || 0 })),
    studentsByBoard: studentsByBoard.map((r) => ({ ...r, count: Number(r.count) || 0 })),
    recentStudents,
  };
}
