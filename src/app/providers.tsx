"use client";

import { type ReactNode } from "react";
import { ToastProvider } from "@/components/toast";
import { ConfirmProvider } from "@/components/confirm";
import { IntroModal } from "@/components/IntroModal";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <ConfirmProvider>
        {children}
        <IntroModal />
      </ConfirmProvider>
    </ToastProvider>
  );
}
