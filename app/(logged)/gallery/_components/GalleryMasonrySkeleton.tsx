// app\(logged)\gallery\_components\GalleryMasonrySkeleton.tsx
"use client";

import React, { useMemo } from "react";
import { useReducedMotion } from "framer-motion";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Props = {
  columns: number;
  blocksPerColumn?: number;
  className?: string;
};

export default function GalleryMasonrySkeleton({
  columns,
  blocksPerColumn = 6,
  className,
}: Props) {
  const reduce = useReducedMotion();

  const heights = useMemo(() => {
    const rnd = mulberry32(columns * 1000 + blocksPerColumn * 17 + 42);
    return Array.from({ length: columns }).map(() =>
      Array.from({ length: blocksPerColumn }).map(() => {
        // Deterministic variety (no hydration mismatch)
        const base = 140 + Math.floor(rnd() * 120);
        const extra = rnd() > 0.72 ? 120 : 0;
        return base + extra;
      }),
    );
  }, [columns, blocksPerColumn]);

  return (
    <div className={cn("flex w-full gap-4", className)}>
      {Array.from({ length: columns }).map((_, colIndex) => (
        <div key={colIndex} className="flex-1 space-y-4">
          {Array.from({ length: blocksPerColumn }).map((__, i) => (
            <div
              key={i}
              className={cn(
                "relative overflow-hidden rounded-3xl border border-border-subtle bg-surface-soft",
                !reduce && "animate-pulse",
              )}
              style={{ height: heights[colIndex]?.[i] ?? 180 }}
              aria-hidden="true"
            >
              {/* subtle halftone */}
              <div className="absolute inset-0 opacity-[0.14] [background:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.22)_1px,transparent_1px)] [background-size:16px_16px] dark:opacity-[0.08]" />
              {/* ink-ish fade */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background-elevated/35" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
