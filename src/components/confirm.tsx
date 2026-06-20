"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  tone?: "danger" | "primary";
};

const ConfirmContext = createContext<(opts: ConfirmOptions) => Promise<boolean>>(
  async () => false
);

export function useConfirm() {
  return useContext(ConfirmContext);
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<ConfirmOptions>({ message: "" });
  const resolver = useRef<(v: boolean) => void>(() => {});

  const confirm = useCallback((options: ConfirmOptions) => {
    setOpts(options);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = (value: boolean) => {
    setOpen(false);
    resolver.current(value);
  };

  // Lock background scroll while the dialog is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const danger = opts.tone !== "primary";

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[110] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => close(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="relative w-full max-w-sm rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl"
            >
              <div
                className={`mb-4 flex size-12 items-center justify-center rounded-2xl ${
                  danger ? "bg-red-50 text-red-500" : "bg-indigo-50 text-[#4f46e5]"
                }`}
              >
                <AlertTriangle size={22} />
              </div>
              <h3 className="text-lg font-extrabold text-gray-900">{opts.title ?? "Are you sure?"}</h3>
              <p className="mt-1.5 text-sm font-medium leading-relaxed text-gray-500">{opts.message}</p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => close(false)}
                  className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-50"
                >
                  {opts.cancelText ?? "Cancel"}
                </button>
                <button
                  onClick={() => close(true)}
                  className={`rounded-full px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-px active:translate-y-0 ${
                    danger ? "bg-red-600 hover:bg-red-700" : "bg-[#4f46e5] hover:bg-[#3b32c0]"
                  }`}
                >
                  {opts.confirmText ?? "Confirm"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}
