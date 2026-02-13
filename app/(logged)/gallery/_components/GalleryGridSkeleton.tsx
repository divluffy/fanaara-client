// app\(logged)\gallery\_components\GalleryGridSkeleton.tsx
"use client";

import React, { useMemo } from "react";
import { Masonry } from "masonic";
import { useReducedMotion } from "framer-motion";
import { cn, mulberry32 } from "./_data/galleryUtils";

type SkeletonItem = { id: string; h: number; tone: number };

export default function GalleryGridSkeleton({
  className,
}: {
  className?: string;
}) {
  const reduce = useReducedMotion();

  const items = useMemo<SkeletonItem[]>(() => {
    const rnd = mulberry32(991);
    return Array.from({ length: 28 }).map((_, i) => {
      const base = 180 + Math.floor(rnd() * 180);
      const extra = rnd() > 0.82 ? 220 : 0;
      return { id: `sk-${i}`, h: base + extra, tone: Math.floor(rnd() * 4) };
    });
  }, []);

  return (
    <div className={cn("w-full", className)}>
      <Masonry
        items={items}
        columnWidth={280}
        columnGutter={16}
        overscanBy={1.5}
        itemKey={(it) => it.id}
        render={({ data }) => (
          <div
            className={cn(
              "relative overflow-hidden rounded-3xl border border-border-subtle",
              "bg-background-elevated shadow-[var(--shadow-xs)]",
            )}
            style={{ height: data.h }}
            aria-hidden="true"
          >
            {/* base gradient */}
            <div
              className={cn(
                "absolute inset-0",
                data.tone === 0 &&
                  "bg-gradient-to-br from-extra-cyan-soft/35 via-surface-soft to-extra-pink-soft/30",
                data.tone === 1 &&
                  "bg-gradient-to-br from-extra-pink-soft/35 via-surface-soft to-extra-cyan-soft/30",
                data.tone === 2 &&
                  "bg-gradient-to-br from-accent/10 via-surface-soft to-extra-pink-soft/20",
                data.tone === 3 &&
                  "bg-gradient-to-br from-extra-cyan-soft/25 via-surface-soft to-accent/12",
              )}
            />

            {/* shimmer */}
            <div
              className={cn(
                "absolute inset-0 sk-shimmer",
                reduce && "sk-reduce",
              )}
            />

            {/* tiny noise grid */}
            <div className="absolute inset-0 opacity-[0.10] [background:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.22)_1px,transparent_1px)] [background-size:18px_18px]" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background-elevated/55" />
          </div>
        )}
      />

      <style jsx>{`
        .sk-shimmer::before {
          content: "";
          position: absolute;
          inset: 0;
          transform: translateX(-120%);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.18),
            transparent
          );
          animation: skShimmer 1.25s linear infinite;
        }

        .sk-reduce::before {
          animation: none;
          opacity: 0;
        }

        @keyframes skShimmer {
          0% {
            transform: translateX(-120%);
          }
          100% {
            transform: translateX(120%);
          }
        }
      `}</style>
    </div>
  );
}
