"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

/** Branded full-area loading screen with a gently pulsing logo. */
export function FullPageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] w-full flex-1 flex-col items-center justify-center gap-5">
      <div className="relative">
        <motion.span
          className="absolute inset-0 rounded-2xl bg-[#4f46e5]/30"
          animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="relative flex size-14 items-center justify-center rounded-2xl bg-[#4f46e5] shadow-lg shadow-indigo-600/20"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Check className="text-white" size={28} strokeWidth={3.5} />
        </motion.div>
      </div>
      <p className="text-sm font-bold tracking-wide text-gray-400">{label}</p>
    </div>
  );
}
