import { db } from "@/lib/db";
import { boards, classes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { GraduationCap } from "lucide-react";
import { createClass, deleteClass } from "../actions";
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

export default async function ClassesPage({
  searchParams,
}: {
  searchParams: Promise<{ boardId?: string }>;
}) {
  const allBoards = await db.select().from(boards);
  const { boardId: selectedBoardId } = await searchParams;

  const filteredClasses = selectedBoardId
    ? await db.select().from(classes).where(eq(classes.boardId, selectedBoardId))
    : [];

  return (
    <div className="space-y-10">
      <PageHeader
        title="Classes"
        description="Pick a board, then add the grade levels that belong to it."
        icon={<GraduationCap className="size-6" strokeWidth={2.25} />}
      />

      <Card className="p-6 md:p-8">
        <StepLabel step={1}>Select a board</StepLabel>
        {allBoards.length === 0 ? (
          <Hint>Create a board first to start adding classes.</Hint>
        ) : (
          <div className="flex flex-wrap gap-2">
            {allBoards.map((b) => (
              <SelectorPill
                key={b.id}
                href={`/admin/classes?boardId=${b.id}`}
                active={selectedBoardId === b.id}
              >
                {b.name}
              </SelectorPill>
            ))}
          </div>
        )}
      </Card>

      {selectedBoardId && (
        <>
          <Card className="p-6 md:p-8">
            <CardHeading>Add a new class</CardHeading>
            <form
              action={async (formData) => {
                "use server";
                await createClass(formData.get("name") as string, selectedBoardId);
              }}
              className="mt-5 flex flex-col gap-3 sm:flex-row"
            >
              <input
                type="text"
                name="name"
                required
                placeholder="Class name (e.g. Class 10)"
                className={inputClass}
              />
              <SubmitButton label="Add class" />
            </form>
          </Card>

          <Card className="overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 md:px-8">
              <CardHeading>Classes in this board</CardHeading>
              <StatusChip tone="neutral">{filteredClasses.length} total</StatusChip>
            </div>
            {filteredClasses.length === 0 ? (
              <EmptyState
                icon={<GraduationCap className="size-6" />}
                title="No classes yet"
                description="Add the first class for this board above."
              />
            ) : (
              <ul className="divide-y divide-outline-variant/30 border-t border-outline-variant/30">
                {filteredClasses.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-surface-container-low/60 md:px-8"
                  >
                    <span className="font-semibold text-on-surface">{c.name}</span>
                    <form
                      action={async () => {
                        "use server";
                        await deleteClass(c.id);
                      }}
                    >
                      <DeleteButton warning="This will delete this class and all subjects/chapters under it. Proceed?" />
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
