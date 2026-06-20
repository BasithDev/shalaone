import { db } from "@/lib/db";
import { boards, classes, subjects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { BookOpen } from "lucide-react";
import { createSubject, deleteSubject } from "../actions";
import { DeleteButton } from "../components/DeleteButton";
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

export default async function SubjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string; boardId?: string }>;
}) {
  const allBoards = await db.select().from(boards);
  const { boardId: selectedBoardId, classId: selectedClassId } =
    await searchParams;

  const filteredClasses = selectedBoardId
    ? await db.select().from(classes).where(eq(classes.boardId, selectedBoardId))
    : [];

  const filteredSubjects = selectedClassId
    ? await db.select().from(subjects).where(eq(subjects.classId, selectedClassId))
    : [];

  return (
    <div className="space-y-10">
      <PageHeader
        title="Subjects"
        description="Drill down from board to class, then add the subjects taught at that level."
        icon={<BookOpen className="size-6" strokeWidth={2.25} />}
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
                  href={`/admin/subjects?boardId=${b.id}`}
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
              <Hint>No classes found in this board.</Hint>
            ) : (
              <div className="flex flex-wrap gap-2">
                {filteredClasses.map((c) => (
                  <SelectorPill
                    key={c.id}
                    href={`/admin/subjects?boardId=${selectedBoardId}&classId=${c.id}`}
                    active={selectedClassId === c.id}
                  >
                    {c.name}
                  </SelectorPill>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

      {selectedClassId && (
        <>
          <Card className="p-6 md:p-8">
            <CardHeading>Add a new subject</CardHeading>
            <form
              action={async (formData) => {
                "use server";
                await createSubject(
                  formData.get("name") as string,
                  selectedClassId
                );
              }}
              className="mt-5 flex flex-col gap-3 sm:flex-row"
            >
              <input
                type="text"
                name="name"
                required
                placeholder="Subject name (e.g. Mathematics)"
                className={inputClass}
              />
              <SubmitButton label="Add subject" />
            </form>
          </Card>

          <Card className="overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 md:px-8">
              <CardHeading>Subjects in this class</CardHeading>
              <StatusChip tone="neutral">{filteredSubjects.length} total</StatusChip>
            </div>
            {filteredSubjects.length === 0 ? (
              <EmptyState
                icon={<BookOpen className="size-6" />}
                title="No subjects yet"
                description="Add the first subject for this class above."
              />
            ) : (
              <ul className="divide-y divide-outline-variant/30 border-t border-outline-variant/30">
                {filteredSubjects.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-surface-container-low/60 md:px-8"
                  >
                    <span className="font-semibold text-on-surface">{s.name}</span>
                    <form
                      action={async () => {
                        "use server";
                        await deleteSubject(s.id);
                      }}
                    >
                      <DeleteButton warning="This will delete this subject and all chapters under it. Proceed?" />
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
