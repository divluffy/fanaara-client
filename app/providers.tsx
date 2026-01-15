// app\providers.tsx
"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { ModalStackProvider } from "./ModalProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ModalStackProvider>{children}</ModalStackProvider>
    </ThemeProvider>
  );
}
