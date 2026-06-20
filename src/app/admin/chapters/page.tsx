import { db } from "@/lib/db";
import { boards, classes, subjects, chapters, books } from "@/db/schema";
import { eq } from "drizzle-orm";
import { BookMarked, CheckCircle2, CircleDashed } from "lucide-react";
import { createChapter, deleteChapter } from "../actions";
import { DeleteButton } from "../components/DeleteButton";
import { BookUploadForm } from "../components/BookUploadForm";
import { SubmitButton } from "../components/SubmitButton";
import {
  Card,
  CardHeading,
  EmptyState,
  Hint,
  PageHeader,
  SelectorPill,
  StatusChip,
  StepLabel,
  inputClass,
} from "../components/ui";

export default async function ChaptersPage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string; boardId?: string; subjectId?: string }>;
}) {
  const allBoards = await db.select().from(boards);
  const {
    boardId: selectedBoardId,
    classId: selectedClassId,
    subjectId: selectedSubjectId,
  } = await searchParams;

  const filteredClasses = selectedBoardId
    ? await db.select().from(classes).where(eq(classes.boardId, selectedBoardId))
    : [];

  const filteredSubjects = selectedClassId
    ? await db.select().from(subjects).where(eq(subjects.classId, selectedClassId))
    : [];

  const filteredChapters = selectedSubjectId
    ? await db
        .select()
        .from(chapters)
        .where(eq(chapters.subjectId, selectedSubjectId))
        .orderBy(chapters.order)
    : [];

  const allBooks = await db.select().from(books);
  const booksMap = allBooks.reduce<Record<string, (typeof allBooks)[number]>>(
    (acc, book) => {
      acc[book.chapterId] = book;
      return acc;
    },
    {}
  );

  const base = `/admin/chapters?boardId=${selectedBoardId}`;

  return (
    <div className="space-y-10">
      <PageHeader
        title="Chapters & Books"
        description="Add chapters in order, then upload the textbook PDF that powers AI doubts and quizzes for each one."
        icon={<BookMarked className="size-6" strokeWidth={2.25} />}
      />

      <Card className="space-y-8 p-6 md:p-8">
        <div>
          <StepLabel step={1}>Select a board</StepLabel>
          {allBoards.length === 0 ? (
            <Hint>Create a board first.</Hint>
          ) : (
            <div className="flex flex-wrap gap-2">
              {allBoards.map((b) => (
                <SelectorPill
                  key={b.id}
                  href={`/admin/chapters?boardId=${b.id}`}
                  active={selectedBoardId === b.id}
                >
                  {b.name}
                </SelectorPill>
              ))}
            </div>
          )}
        </div>

        {selectedBoardId && (
          <div>
            <StepLabel step={2}>Select a class</StepLabel>
            {filteredClasses.length === 0 ? (
              <Hint>No classes found.</Hint>
            ) : (
              <div className="flex flex-wrap gap-2">
                {filteredClasses.map((c) => (
                  <SelectorPill
                    key={c.id}
                    href={`${base}&classId=${c.id}`}
                    active={selectedClassId === c.id}
                  >
                    {c.name}
                  </SelectorPill>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedClassId && (
          <div>
            <StepLabel step={3}>Select a subject</StepLabel>
            {filteredSubjects.length === 0 ? (
              <Hint>No subjects found.</Hint>
            ) : (
              <div className="flex flex-wrap gap-2">
                {filteredSubjects.map((s) => (
                  <SelectorPill
                    key={s.id}
                    href={`${base}&classId=${selectedClassId}&subjectId=${s.id}`}
                    active={selectedSubjectId === s.id}
                  >
                    {s.name}
                  </SelectorPill>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

      {selectedSubjectId && (
        <>
          <Card className="p-6 md:p-8">
            <CardHeading>Add a new chapter</CardHeading>
            <form
              action={async (formData) => {
                "use server";
                await createChapter(
                  formData.get("name") as string,
                  selectedSubjectId,
                  parseInt(formData.get("order") as string)
                );
              }}
              className="mt-5 flex flex-col gap-3 sm:flex-row"
            >
              <input
                type="text"
                name="name"
                required
                placeholder="Chapter name"
                className={inputClass}
              />
              <input
                type="number"
                name="order"
                required
                placeholder="Order"
                defaultValue={filteredChapters.length + 1}
                className={`${inputClass} sm:w-28`}
              />
              <SubmitButton label="Add chapter" />
            </form>
          </Card>

          <Card className="overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 md:px-8">
              <CardHeading>Chapters</CardHeading>
              <StatusChip tone="neutral">{filteredChapters.length} total</StatusChip>
            </div>
            {filteredChapters.length === 0 ? (
              <EmptyState
                icon={<BookMarked className="size-6" />}
                title="No chapters yet"
                description="Add the first chapter for this subject above."
              />
            ) : (
              <ul className="divide-y divide-outline-variant/30 border-t border-outline-variant/30">
                {filteredChapters.map((ch) => {
                  const hasBook = !!booksMap[ch.id];
                  return (
                    <li
                      key={ch.id}
                      className="flex flex-col gap-4 px-6 py-5 transition hover:bg-surface-container-low/60 md:flex-row md:items-center md:justify-between md:px-8"
                    >
                      <div className="flex items-center gap-4">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-container text-sm font-bold text-on-surface-variant">
                          {ch.order}
                        </span>
                        <div>
                          <p className="font-semibold text-on-surface">{ch.name}</p>
                          {hasBook ? (
                            <StatusChip tone="success">
                              <CheckCircle2 className="size-3.5" />
                              Book uploaded
                            </StatusChip>
                          ) : (
                            <StatusChip tone="warning">
                              <CircleDashed className="size-3.5" />
                              No book yet
                            </StatusChip>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-end md:self-auto">
                        <BookUploadForm
                          chapterId={ch.id}
                          chapterName={ch.name}
                          hasBook={hasBook}
                        />
                        <form
                          action={async () => {
                            "use server";
                            await deleteChapter(ch.id);
                          }}
                        >
                          <DeleteButton warning="Delete this chapter?" />
                        </form>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
