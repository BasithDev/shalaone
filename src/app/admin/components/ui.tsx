import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ── Shared class tokens (DESIGN.md › Components) ───────────────────── */

// Input Fields: 8px radius, soft grey fill, 1px border → indigo on focus
export const inputClass =
  "w-full rounded-[8px] border border-outline-variant bg-surface-container-low px-4 py-2.5 text-[15px] text-on-surface placeholder:text-on-surface-variant/60 outline-none transition focus:border-primary focus:bg-surface-container-lowest focus:ring-4 focus:ring-primary/10";

export const labelClass =
  "mb-2 block text-sm font-semibold tracking-[0.01em] text-on-surface-variant";

/* ── Page header ────────────────────────────────────────────────────── */

export function PageHeader({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-start gap-4">
        {icon && (
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-container/12 text-primary">
            {icon}
          </span>
        )}
        <div>
          <h1 className="text-[32px] font-extrabold leading-[40px] tracking-[-0.01em] text-on-surface">
            {title}
          </h1>
          {description && (
            <p className="mt-1 max-w-2xl text-[16px] leading-6 text-on-surface-variant">
              {description}
            </p>
          )}
        </div>
      </div>
      {action}
    </header>
  );
}

/* ── Card (Surface Level 1) ─────────────────────────────────────────── */

export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-xl border border-outline-variant/40 bg-surface-container-lowest shadow-soft",
        className
      )}
      {...props}
    />
  );
}

export function CardHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-[18px] font-bold tracking-[-0.01em] text-on-surface">
      {children}
    </h2>
  );
}

/* ── Step label for cascading selectors ─────────────────────────────── */

export function StepLabel({
  step,
  children,
}: {
  step: number;
  children: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-on-primary">
        {step}
      </span>
      <span className="text-sm font-semibold tracking-[0.01em] text-on-surface-variant">
        {children}
      </span>
    </div>
  );
}

/* ── Selector pill (chip-style navigation via querystring) ──────────── */

export function SelectorPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full px-4 py-2 text-sm font-semibold transition active:scale-[0.98]",
        active
          ? "bg-primary-sheen text-on-primary shadow-soft"
          : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
      )}
    >
      {children}
    </Link>
  );
}

/* ── Status chip ────────────────────────────────────────────────────── */

const chipTones = {
  success: "bg-primary-container/12 text-primary",
  warning: "bg-tertiary-container/20 text-tertiary",
  danger: "bg-error-container text-on-error-container",
  neutral: "bg-surface-container-high text-on-surface-variant",
} as const;

export function StatusChip({
  tone = "neutral",
  children,
}: {
  tone?: keyof typeof chipTones;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        chipTones[tone]
      )}
    >
      {children}
    </span>
  );
}

/* ── Empty state ────────────────────────────────────────────────────── */

export function EmptyState({
  icon,
  title,
  description,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      {icon && (
        <span className="flex size-14 items-center justify-center rounded-full bg-surface-container text-on-surface-variant">
          {icon}
        </span>
      )}
      <div>
        <p className="text-[16px] font-bold text-on-surface">{title}</p>
        {description && (
          <p className="mt-1 text-sm text-on-surface-variant">{description}</p>
        )}
      </div>
    </div>
  );
}

/* ── Hint / inline notice ───────────────────────────────────────────── */

export function Hint({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-[8px] bg-tertiary-container/15 px-4 py-2.5 text-sm font-medium text-tertiary">
      {children}
    </p>
  );
}
