"use client";

import { useFormStatus } from "react-dom";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function SubmitButton({
  label = "Add",
  className,
}: {
  label?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-primary-sheen px-6 py-2.5 text-sm font-semibold text-on-primary shadow-soft transition hover:shadow-soft-lg hover:brightness-105 active:scale-[0.98] disabled:opacity-60",
        className
      )}
    >
      <Plus className="size-4" strokeWidth={2.5} />
      {pending ? "Adding…" : label}
    </button>
  );
}
