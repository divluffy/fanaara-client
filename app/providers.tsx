// app\providers.tsx
"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { ModalStackProvider } from "./ModalProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      themes={["light", "dark", "onepiece"]}
      disableTransitionOnChange
    >
      <ModalStackProvider>{children}</ModalStackProvider>
    </ThemeProvider>
  );
}
