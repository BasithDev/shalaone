import { db } from "@/lib/db";
import { boards, classes, subjects, chapters, books } from "@/db/schema";
import { eq, isNull } from "drizzle-orm";
import Link from "next/link";
import { Radar, PartyPopper, ArrowRight } from "lucide-react";
import { Card, EmptyState, PageHeader, StatusChip } from "../components/ui";

export default async function ContentGapTrackerPage() {
  const gaps = await db
    .select({
      chapterId: chapters.id,
      chapterName: chapters.name,
      subjectName: subjects.name,
      className: classes.name,
      boardName: boards.name,
      subjectId: subjects.id,
      classId: classes.id,
      boardId: boards.id,
    })
    .from(chapters)
    .leftJoin(books, eq(chapters.id, books.chapterId))
    .innerJoin(subjects, eq(chapters.subjectId, subjects.id))
    .innerJoin(classes, eq(subjects.classId, classes.id))
    .innerJoin(boards, eq(classes.boardId, boards.id))
    .where(isNull(books.id));

  const groupedGaps: Record<string, typeof gaps> = {};
  gaps.forEach((g) => {
    const key = `${g.boardName} › ${g.className} › ${g.subjectName}`;
    if (!groupedGaps[key]) groupedGaps[key] = [];
    groupedGaps[key].push(g);
  });

  const groups = Object.entries(groupedGaps);

  return (
    <div className="space-y-10">
      <PageHeader
        title="Content Gaps"
        description="Chapters that are still missing a textbook PDF. These won't power AI doubts or quizzes until a book is uploaded."
        icon={<Radar className="size-6" strokeWidth={2.25} />}
        action={
          gaps.length > 0 ? (
            <StatusChip tone="danger">{gaps.length} chapters need a book</StatusChip>
          ) : undefined
        }
      />

      {groups.length === 0 ? (
        <Card className="p-2">
          <EmptyState
            icon={<PartyPopper className="size-6 text-primary" />}
            title="All caught up!"
            description="Every chapter in your curriculum has a book uploaded."
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {groups.map(([subjectPath, missingChapters]) => (
            <Card key={subjectPath} className="overflow-hidden">
              <div className="flex items-center justify-between gap-4 border-b border-outline-variant/30 px-6 py-5 md:px-8">
                <h2 className="text-[15px] font-bold tracking-[-0.01em] text-on-surface">
                  {subjectPath}
                </h2>
                <StatusChip tone="warning">{missingChapters.length} missing</StatusChip>
              </div>
              <ul className="divide-y divide-outline-variant/30">
                {missingChapters.map((ch) => (
                  <li
                    key={ch.chapterId}
                    className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-surface-container-low/60 md:px-8"
                  >
                    <span className="font-semibold text-on-surface">
                      {ch.chapterName}
                    </span>
                    <Link
                      href={`/admin/chapters?boardId=${ch.boardId}&classId=${ch.classId}&subjectId=${ch.subjectId}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary-container/10 active:scale-[0.98]"
                    >
                      Upload book
                      <ArrowRight className="size-4" strokeWidth={2.25} />
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
