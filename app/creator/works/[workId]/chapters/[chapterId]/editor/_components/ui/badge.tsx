// app\creator\works\[workId]\chapters\[chapterId]\editor\_components\ui\badge.tsx
"use client";

import React from "react";
import { cn } from "./cn";

type BadgeVariant = "neutral" | "success" | "warn" | "danger" | "info";

const variants: Record<BadgeVariant, string> = {
  neutral: "bg-zinc-100 text-zinc-800 border-zinc-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warn: "bg-amber-50 text-amber-800 border-amber-200",
  danger: "bg-rose-50 text-rose-700 border-rose-200",
  info: "bg-sky-50 text-sky-700 border-sky-200",
};

export function Badge({
  children,
  className,
  variant = "neutral",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: BadgeVariant;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
