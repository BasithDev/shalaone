"use client";

import { useFormStatus } from "react-dom";
import { Trash2, Loader2 } from "lucide-react";
import { useConfirm } from "@/components/confirm";

export function DeleteButton({ warning }: { warning: string }) {
  const { pending } = useFormStatus();
  const confirm = useConfirm();

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const form = e.currentTarget.form;
    const ok = await confirm({
      title: "Delete this?",
      message: warning,
      tone: "danger",
      confirmText: "Delete",
    });
    if (ok) form?.requestSubmit();
  };

  return (
    <button
      type="submit"
      disabled={pending}
      aria-label="Delete"
      onClick={handleClick}
      className="inline-flex size-9 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-error-container hover:text-on-error-container active:scale-95 disabled:opacity-50"
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Trash2 className="size-4" strokeWidth={2.25} />
      )}
    </button>
  );
}
