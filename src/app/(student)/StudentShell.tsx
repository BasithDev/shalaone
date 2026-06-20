"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  MessageCircle, 
  FileText, 
  Brain, 
  Compass, 
  Settings, 
  LogOut,
  BookOpen,
  Check
} from "lucide-react";
import { logout } from "@/app/(student)/settings/actions";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Doubts", href: "/doubts", icon: MessageCircle },
  { name: "Notes", href: "/notes", icon: FileText },
  { name: "Quizzes", href: "/quizzes", icon: Brain },
  { name: "Subjects", href: "/subjects", icon: BookOpen },
  { name: "Progress", href: "/progress", icon: Compass },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface StudentShellProps {
  children: React.ReactNode;
  profile: {
    fullName: string | null;
    className: string | null;
    boardName: string | null;
  } | null;
}

export default function StudentShell({ children, profile }: StudentShellProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f9f9ff] text-gray-900 selection:bg-indigo-500/10">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 bg-white flex-col shrink-0 sticky top-0 h-screen border-r border-gray-100/80 z-20">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 px-6 py-5 border-b border-gray-100/80">
          <div className="w-9 h-9 bg-[#4f46e5] rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/10 shrink-0">
            <Check className="text-white stroke-[3.5px]" size={20} />
          </div>
          <span className="text-xl font-black text-gray-900 tracking-tight">ShalaOne</span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-6 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
            return (
              <Link
                key={item.name + "-" + item.href}
                href={item.href}
                className={`flex items-center gap-3.5 px-5 py-3 border-l-[3.5px] transition-all duration-200 group text-sm ${
                  isActive
                    ? "border-[#4f46e5] bg-indigo-50/50 text-[#4f46e5] font-bold"
                    : "border-transparent text-gray-500 hover:text-gray-950 hover:bg-gray-50/60 font-semibold"
                }`}
              >
                <Icon 
                  size={20} 
                  className={`transition-transform duration-200 group-hover:scale-105 ${
                    isActive ? "text-[#4f46e5] stroke-[2.5px]" : "text-gray-400 group-hover:text-gray-600 stroke-[2px]"
                  }`} 
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer User Profile Card */}
        {profile && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between gap-3 bg-white">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shrink-0">
                {(profile.fullName || "Student").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 leading-tight">
                <span className="text-sm font-bold text-gray-900 block truncate">{profile.fullName || "Student"}</span>
                <span className="text-[11px] text-gray-400 font-semibold block truncate">
                  {profile.className || "Class 10"} • {profile.boardName || "CBSE"}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all duration-200"
              title="Log Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-white text-gray-900 px-6 py-4 flex items-center justify-between sticky top-0 z-50 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#4f46e5] rounded-lg flex items-center justify-center shadow-md shadow-indigo-600/10">
            <Check className="text-white stroke-[3.5px]" size={16} />
          </div>
          <span className="text-lg font-black tracking-tight">ShalaOne</span>
        </div>
        <button 
          onClick={handleLogout} 
          className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
          title="Log Out"
        >
          <LogOut size={18} />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-0 min-h-[calc(100vh-64px)] md:min-h-screen flex flex-col">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 py-2 flex justify-around items-center z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
        {navItems.filter(item => item.name !== "Progress").map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
          return (
            <Link
              key={"mobile-" + item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors min-w-[56px] ${
                isActive ? "text-[#4f46e5]" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon size={20} className={isActive ? "stroke-[2.5px]" : "stroke-[2px]"} />
              <span className="text-[10px] font-bold tracking-tight">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
