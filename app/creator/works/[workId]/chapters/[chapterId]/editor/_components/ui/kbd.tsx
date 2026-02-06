// app\creator\works\[workId]\chapters\[chapterId]\editor\_components\ui\kbd.tsx
"use client";

import React from "react";
import { cn } from "./cn";

export function Kbd({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center rounded-md border border-zinc-200 bg-white px-2 py-0.5 text-[11px] font-mono text-zinc-700 shadow-sm",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
