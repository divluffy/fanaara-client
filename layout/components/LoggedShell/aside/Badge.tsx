"use client";

import * as React from "react";
import { cn } from "@/utils";

export const Badge = React.memo(function Badge({ value }: { value?: number }) {
  if (!value || value <= 0) return null;

  return (
    <span
      className={cn(
        "min-w-6 h-6 px-2 rounded-full grid place-items-center",
        "text-[11px] font-semibold leading-none",
        "bg-accent text-accent-foreground border border-accent-border",
        "shadow-[var(--shadow-sm)]"
      )}
    >
      {value > 99 ? "99+" : value}
    </span>
  );
});
