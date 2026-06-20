import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { GraduationCap, LogOut } from "lucide-react";
import { AdminNav } from "./components/AdminNav";
import { logout } from "@/app/(student)/settings/actions";

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-10 items-center justify-center rounded-xl bg-primary-sheen text-on-primary shadow-soft">
        <GraduationCap className="size-5" strokeWidth={2.25} />
      </span>
      <div className="leading-tight">
        <p className="text-[15px] font-extrabold tracking-[-0.01em] text-on-surface">
          ShalaOne
        </p>
        <p className="text-xs font-semibold text-on-surface-variant">
          Admin Console
        </p>
      </div>
    </div>
  );
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-surface md:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-outline-variant/40 bg-surface-container-lowest px-5 py-6 md:flex">
        <Brand />
        <div className="mt-8 mb-3 px-2 text-[11px] font-bold uppercase tracking-[0.08em] text-on-surface-variant/70">
          Menu
        </div>
        <AdminNav variant="sidebar" />
        <div className="mt-auto flex items-center justify-between gap-2 rounded-xl bg-surface-container-low p-4">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-on-surface-variant">
              Signed in as
            </p>
            <p className="truncate text-sm font-semibold text-on-surface">
              {user.email}
            </p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              aria-label="Log out"
              title="Log out"
              className="flex size-9 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-error-container hover:text-on-error-container active:scale-95"
            >
              <LogOut className="size-4" strokeWidth={2.25} />
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-10 border-b border-outline-variant/40 bg-surface-container-lowest/90 px-4 py-3 backdrop-blur md:hidden">
        <div className="mb-3 flex items-center justify-between">
          <Brand />
          <form action={logout}>
            <button
              type="submit"
              aria-label="Log out"
              title="Log out"
              className="flex size-9 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-error-container hover:text-on-error-container active:scale-95"
            >
              <LogOut className="size-4" strokeWidth={2.25} />
            </button>
          </form>
        </div>
        <AdminNav variant="topbar" />
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-10 md:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
