"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Layers,
  GraduationCap,
  BookOpen,
  BookMarked,
  Radar,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/boards", label: "Boards", icon: Layers },
  { href: "/admin/classes", label: "Classes", icon: GraduationCap },
  { href: "/admin/subjects", label: "Subjects", icon: BookOpen },
  { href: "/admin/chapters", label: "Chapters & Books", icon: BookMarked },
  { href: "/admin/books", label: "Content Gaps", icon: Radar },
];

export function AdminNav({ variant }: { variant: "sidebar" | "topbar" }) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        variant === "sidebar"
          ? "flex flex-col gap-1"
          : "flex gap-2 overflow-x-auto pb-1"
      )}
    >
      {NAV.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/admin"
            ? pathname === "/admin"
            : pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "group flex items-center gap-3 rounded-full text-sm font-semibold transition active:scale-[0.98]",
              variant === "sidebar" ? "px-4 py-3" : "shrink-0 px-4 py-2",
              active
                ? "bg-primary-sheen text-on-primary shadow-soft"
                : "text-on-surface-variant hover:bg-surface-container"
            )}
          >
            <Icon
              className={cn(
                "size-[18px]",
                active ? "text-on-primary" : "text-on-surface-variant"
              )}
              strokeWidth={2.25}
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
