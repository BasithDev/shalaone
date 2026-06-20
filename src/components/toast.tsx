"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";
type Toast = { id: number; type: ToastType; message: string };

const ToastContext = createContext<(message: string, type?: ToastType) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

const styles: Record<ToastType, { icon: typeof Info; ring: string; iconColor: string }> = {
  success: { icon: CheckCircle2, ring: "border-emerald-200", iconColor: "text-emerald-500" },
  error: { icon: AlertCircle, ring: "border-red-200", iconColor: "text-red-500" },
  info: { icon: Info, ring: "border-indigo-200", iconColor: "text-[#4f46e5]" },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, type, message }]);
      setTimeout(() => remove(id), 4500);
    },
    [remove]
  );

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed top-4 right-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2.5">
        <AnimatePresence>
          {toasts.map((t) => {
            const s = styles[t.type];
            const Icon = s.icon;
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, x: 40, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={`pointer-events-auto flex items-start gap-3 rounded-2xl border ${s.ring} bg-white px-4 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)]`}
              >
                <Icon size={18} className={`mt-0.5 shrink-0 ${s.iconColor}`} />
                <p className="flex-1 text-sm font-semibold leading-snug text-gray-800">{t.message}</p>
                <button
                  onClick={() => remove(t.id)}
                  className="shrink-0 text-gray-300 transition-colors hover:text-gray-600"
                  aria-label="Dismiss"
                >
                  <X size={16} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
