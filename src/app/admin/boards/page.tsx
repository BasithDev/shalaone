import { db } from "@/lib/db";
import { boards } from "@/db/schema";
import { Layers } from "lucide-react";
import { createBoard, deleteBoard } from "../actions";
import { DeleteButton } from "../components/DeleteButton";
import { SubmitButton } from "../components/SubmitButton";
import {
  Card,
  CardHeading,
  EmptyState,
  PageHeader,
  StatusChip,
  inputClass,
} from "../components/ui";

export default async function BoardsPage() {
  const allBoards = await db.select().from(boards);

  return (
    <div className="space-y-10">
      <PageHeader
        title="Boards"
        description="Educational boards sit at the top of the curriculum. Everything else — classes, subjects, chapters — branches out from here."
        icon={<Layers className="size-6" strokeWidth={2.25} />}
      />

      <Card className="p-6 md:p-8">
        <CardHeading>Add a new board</CardHeading>
        <form
          action={async (formData) => {
            "use server";
            await createBoard(formData.get("name") as string);
          }}
          className="mt-5 flex flex-col gap-3 sm:flex-row"
        >
          <input
            type="text"
            name="name"
            required
            placeholder="Board name (e.g. CBSE)"
            className={inputClass}
          />
          <SubmitButton label="Add board" />
        </form>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 md:px-8">
          <CardHeading>All boards</CardHeading>
          <StatusChip tone="neutral">{allBoards.length} total</StatusChip>
        </div>
        {allBoards.length === 0 ? (
          <EmptyState
            icon={<Layers className="size-6" />}
            title="No boards yet"
            description="Add your first board above to start building the curriculum."
          />
        ) : (
          <ul className="divide-y divide-outline-variant/30 border-t border-outline-variant/30">
            {allBoards.map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-surface-container-low/60 md:px-8"
              >
                <span className="font-semibold text-on-surface">{b.name}</span>
                <form
                  action={async () => {
                    "use server";
                    await deleteBoard(b.id);
                  }}
                >
                  <DeleteButton warning="This will also delete classes under it. Proceed?" />
                </form>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
