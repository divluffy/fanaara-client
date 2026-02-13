// app\(logged)\gallery\_components\KeywordRail.tsx
"use client";

import React from "react";
import { cn } from "./_data/galleryUtils";

type Props = {
  keywords: string[];
  value: string;
  onChange: (next: string) => void;
};

export default function KeywordRail({ keywords, value, onChange }: Props) {
  const selected = value?.trim() ?? "";

  return (
    <div className="relative">
      {/* subtle edge fades (not buttons) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 start-0 w-10 bg-gradient-to-r from-bg-page via-bg-page/80 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 end-0 w-10 bg-gradient-to-l from-bg-page via-bg-page/80 to-transparent"
      />

      <div
        className={cn(
          "app-scroll flex gap-2 overflow-x-auto px-2 py-1",
          "rounded-2xl border border-border-subtle bg-bg-page/40",
        )}
      >
        {keywords.map((k) => {
          const active = k.toLowerCase() === selected.toLowerCase();
          return (
            <button
              key={k}
              type="button"
              onClick={() => onChange(active ? "" : k)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-[12px] font-black transition",
                active
                  ? "border-transparent bg-foreground-strong text-background shadow-[var(--shadow-sm)]"
                  : "border-border-subtle bg-surface-soft text-foreground-strong hover:bg-surface",
              )}
            >
              #{k}
            </button>
          );
        })}
      </div>
    </div>
  );
}
