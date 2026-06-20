import {
  Users,
  UserCheck,
  ShieldCheck,
  Target,
  Layers,
  GraduationCap,
  BookOpen,
  BookMarked,
  Library,
  Radar,
  Brain,
  ListChecks,
  MessageCircle,
  FileText,
  Database,
  type LucideIcon,
} from "lucide-react";
import { getAdminAnalytics } from "@/lib/queries/admin-analytics";
import { Card, PageHeader, StatusChip } from "../components/ui";

export const dynamic = "force-dynamic";

function formatDate(d: Date | string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone = "primary",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
  tone?: "primary" | "tertiary";
}) {
  return (
    <Card className="p-5 md:p-6">
      <span
        className={
          tone === "tertiary"
            ? "flex size-11 items-center justify-center rounded-xl bg-tertiary-container/20 text-tertiary"
            : "flex size-11 items-center justify-center rounded-xl bg-primary-container/12 text-primary"
        }
      >
        <Icon className="size-5" strokeWidth={2.25} />
      </span>
      <p className="mt-4 text-[32px] font-extrabold leading-none tracking-[-0.01em] text-on-surface">
        {value}
      </p>
      <p className="mt-1.5 text-sm font-semibold text-on-surface-variant">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-on-surface-variant/70">{sub}</p>}
    </Card>
  );
}

export default async function AdminAnalyticsPage() {
  const a = await getAdminAnalytics();

  const curriculum: { icon: LucideIcon; label: string; value: number }[] = [
    { icon: Layers, label: "Boards", value: a.boardCount },
    { icon: GraduationCap, label: "Classes", value: a.classCount },
    { icon: BookOpen, label: "Subjects", value: a.subjectCount },
    { icon: BookMarked, label: "Chapters", value: a.chapterCount },
    { icon: Library, label: "Books uploaded", value: a.bookCount },
  ];

  const engagement: { icon: LucideIcon; label: string; value: number }[] = [
    { icon: Brain, label: "Quizzes generated", value: a.quizCount },
    { icon: ListChecks, label: "Quiz attempts", value: a.attemptCount },
    { icon: MessageCircle, label: "Doubts asked", value: a.doubtCount },
    { icon: FileText, label: "Notes uploaded", value: a.noteCount },
  ];

  return (
    <div className="space-y-10">
      <PageHeader
        title="Analytics"
        description="A full picture of your platform — students, curriculum coverage, and learning activity."
      />

      {/* People */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-[0.06em] text-on-surface-variant/70">People</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={Users} label="Students" value={a.students} sub={`${a.onboardedStudents} onboarded`} />
          <StatCard icon={UserCheck} label="Onboarded" value={a.onboardedStudents} sub="finished setup" />
          <StatCard icon={ShieldCheck} label="Admins" value={a.admins} />
          <StatCard icon={Target} label="Avg quiz score" value={`${a.avgQuizScore}%`} tone="tertiary" />
        </div>
      </section>

      {/* Curriculum */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-[0.06em] text-on-surface-variant/70">Curriculum</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {curriculum.map((s) => (
            <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} />
          ))}
        </div>

        {/* Coverage */}
        <Card className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-tertiary-container/20 text-tertiary">
              <Radar className="size-6" strokeWidth={2.25} />
            </span>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-[18px] font-bold tracking-[-0.01em] text-on-surface">Content coverage</h3>
                <StatusChip tone={a.chaptersWithoutBook === 0 ? "success" : "warning"}>
                  {a.coverage}% covered
                </StatusChip>
              </div>
              <p className="mt-1 text-sm text-on-surface-variant">
                {a.chaptersWithBook} of {a.chapterCount} chapters have a textbook uploaded
                {a.chaptersWithoutBook > 0 ? ` · ${a.chaptersWithoutBook} still missing` : ""}.
              </p>
            </div>
          </div>
          <div className="w-full md:w-72">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-container-high">
              <div className="h-full rounded-full bg-primary-sheen" style={{ width: `${a.coverage}%` }} />
            </div>
          </div>
        </Card>
      </section>

      {/* Engagement */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-[0.06em] text-on-surface-variant/70">Learning activity</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {engagement.map((s) => (
            <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} />
          ))}
        </div>
        <Card className="flex items-center gap-4 p-5 md:p-6">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary-container/12 text-primary">
            <Database className="size-5" strokeWidth={2.25} />
          </span>
          <div>
            <p className="text-sm font-semibold text-on-surface">AI knowledge base</p>
            <p className="text-sm text-on-surface-variant">
              {a.bookChunkCount.toLocaleString()} textbook chunks · {a.noteChunkCount.toLocaleString()} note chunks indexed for search.
            </p>
          </div>
        </Card>
      </section>

      {/* Breakdown tables */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="border-b border-outline-variant/30 px-6 py-5 md:px-8">
            <h3 className="text-[15px] font-bold tracking-[-0.01em] text-on-surface">Students by class</h3>
          </div>
          {a.studentsByClass.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-on-surface-variant md:px-8">No enrolled students yet.</p>
          ) : (
            <ul className="divide-y divide-outline-variant/30">
              {a.studentsByClass.map((r, i) => (
                <li key={i} className="flex items-center justify-between gap-4 px-6 py-3.5 md:px-8">
                  <span className="text-sm font-semibold text-on-surface">
                    {r.className} <span className="font-normal text-on-surface-variant/70">· {r.boardName}</span>
                  </span>
                  <StatusChip tone="neutral">{r.count} students</StatusChip>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b border-outline-variant/30 px-6 py-5 md:px-8">
            <h3 className="text-[15px] font-bold tracking-[-0.01em] text-on-surface">Recent signups</h3>
          </div>
          {a.recentStudents.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-on-surface-variant md:px-8">No students yet.</p>
          ) : (
            <ul className="divide-y divide-outline-variant/30">
              {a.recentStudents.map((s, i) => (
                <li key={i} className="flex items-center justify-between gap-4 px-6 py-3.5 md:px-8">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-on-surface">{s.fullName || "Unnamed student"}</p>
                    <p className="truncate text-xs text-on-surface-variant/70">
                      {s.className ? `${s.className} · ${s.boardName}` : "Not onboarded"}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-on-surface-variant">{formatDate(s.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>
    </div>
  );
}
