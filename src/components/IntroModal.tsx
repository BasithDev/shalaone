"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";

// Bump the version suffix if you want the modal to show again for everyone.
const STORAGE_KEY = "shalaone_intro_v1";
const HIDDEN_PATHS = ["/", "/login", "/signup"];

const NOTES: { title: string; body: string }[] = [
  {
    title: "Built on a tight timeline",
    body: "This is a focused MVP. A few features are intentionally simplified — they're noted below so nothing feels like a surprise.",
  },
  {
    title: "Email verification & password reset",
    body: "Use one-time codes (OTP) sent via email. Delivery depends on the configured mail provider; check spam on the first email.",
  },
  {
    title: "Notes search",
    body: "You can upload PDFs and images, but only PDF notes are made AI-searchable in Doubt Chat (image OCR for notes is a planned addition).",
  },
  {
    title: "How progress works",
    body: "Progress is driven by quiz scores: 80%+ = Mastered, 60–79% = In Progress, below 60% = Weak. Reading or asking doubts doesn't change it.",
  },
  {
    title: "AI is grounded in your textbook",
    body: "Doubt answers come only from the chapter's content (not the open internet), so they stay on-syllabus. It runs on free-tier AI, so very large uploads may occasionally rate-limit.",
  },
];

export function IntroModal() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (HIDDEN_PATHS.includes(pathname)) return;
    try {
      if (localStorage.getItem(STORAGE_KEY) !== "dismissed") setOpen(true);
    } catch {
      /* localStorage unavailable — just don't show */
    }
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "dismissed");
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={dismiss} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 bg-[#4f46e5] px-6 py-5 text-white">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-white/15">
                  <Sparkles size={20} />
                </span>
                <div>
                  <h2 className="text-lg font-black tracking-tight">Welcome to ShalaOne</h2>
                  <p className="text-xs font-semibold text-white/80">A quick note before you start</p>
                </div>
              </div>
              <button onClick={dismiss} aria-label="Close" className="text-white/70 transition-colors hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
              {NOTES.map((n) => (
                <div key={n.title} className="flex gap-3">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[#4f46e5]" />
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-900">{n.title}</h3>
                    <p className="text-xs font-medium leading-relaxed text-gray-500">{n.body}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 px-6 py-4">
              <button
                onClick={dismiss}
                className="w-full rounded-full bg-[#4f46e5] py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/10 transition-all hover:bg-[#3b32c0] active:scale-[0.99]"
              >
                Got it — don&apos;t show this again
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
