import { db } from "@/lib/db";
import { boards, classes, subjects, chapters, books, profiles } from "@/db/schema";
import { eq, isNull, sql } from "drizzle-orm";
import Link from "next/link";
import {
  Users,
  Layers,
  GraduationCap,
  BookOpen,
  BookMarked,
  Library,
  Radar,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { Card, PageHeader, StatusChip } from "./components/ui";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [studentCount, boardCount, classCount, subjectCount, chapterCount, bookCount] =
    await Promise.all([
      db.$count(profiles, eq(profiles.role, "student")),
      db.$count(boards),
      db.$count(classes),
      db.$count(subjects),
      db.$count(chapters),
      db.$count(books),
    ]);

  const [gapRow] = await db
    .select({ c: sql<number>`count(*)` })
    .from(chapters)
    .leftJoin(books, eq(chapters.id, books.chapterId))
    .where(isNull(books.id));
  const gapCount = Number(gapRow?.c ?? 0);

  const stats: {
    label: string;
    value: number;
    href: string;
    icon: LucideIcon;
  }[] = [
    { label: "Students", value: studentCount, href: "/admin/analytics", icon: Users },
    { label: "Boards", value: boardCount, href: "/admin/boards", icon: Layers },
    { label: "Classes", value: classCount, href: "/admin/classes", icon: GraduationCap },
    { label: "Subjects", value: subjectCount, href: "/admin/subjects", icon: BookOpen },
    { label: "Chapters", value: chapterCount, href: "/admin/chapters", icon: BookMarked },
    { label: "Books uploaded", value: bookCount, href: "/admin/chapters", icon: Library },
  ];

  return (
    <div className="space-y-10">
      <PageHeader
        title="Welcome back"
        description="Manage the curriculum that powers every student's AI study companion."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {stats.map(({ label, value, href, icon: Icon }) => (
          <Link key={label} href={href}>
            <Card className="h-full p-5 transition hover:-translate-y-0.5 hover:shadow-soft-lg md:p-6">
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary-container/12 text-primary">
                <Icon className="size-5" strokeWidth={2.25} />
              </span>
              <p className="mt-4 text-[32px] font-extrabold leading-none tracking-[-0.01em] text-on-surface">
                {value}
              </p>
              <p className="mt-1.5 text-sm font-semibold text-on-surface-variant">
                {label}
              </p>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-tertiary-container/20 text-tertiary">
            <Radar className="size-6" strokeWidth={2.25} />
          </span>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-[18px] font-bold tracking-[-0.01em] text-on-surface">
                Content gaps
              </h2>
              {gapCount > 0 ? (
                <StatusChip tone="danger">{gapCount} missing</StatusChip>
              ) : (
                <StatusChip tone="success">All covered</StatusChip>
              )}
            </div>
            <p className="mt-1 max-w-xl text-sm text-on-surface-variant">
              {gapCount > 0
                ? "Some chapters are still missing a textbook PDF and can't power AI features yet."
                : "Every chapter has a book uploaded. Nice work!"}
            </p>
          </div>
        </div>
        <Link
          href="/admin/books"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-primary-sheen px-6 py-2.5 text-sm font-semibold text-on-primary shadow-soft transition hover:shadow-soft-lg hover:brightness-105 active:scale-[0.98]"
        >
          Review gaps
          <ArrowRight className="size-4" strokeWidth={2.25} />
        </Link>
      </Card>
    </div>
  );
}
