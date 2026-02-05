// app/(logged)/ranks/_components/RanksListSkeleton.tsx
import React from "react";

function cx(...v: Array<string | false | null | undefined>) {
  return v.filter(Boolean).join(" ");
}

export function RanksTop3Skeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className={cx(
            "rounded-3xl p-[1px]",
            "bg-gradient-to-br from-black/10 via-black/5 to-black/10",
            "dark:from-white/10 dark:via-white/5 dark:to-white/10",
          )}
        >
          <div className="relative overflow-hidden rounded-3xl border border-border-subtle bg-background-elevated/70 p-4">
            <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="relative flex items-start gap-3">
              <div className="h-16 w-12 shrink-0 rounded-xl bg-surface-soft animate-pulse" />
              <div className="min-w-0 flex-1">
                <div className="h-4 w-2/3 rounded bg-surface-soft animate-pulse" />
                <div className="mt-2 h-3 w-1/2 rounded bg-surface-soft animate-pulse" />
                <div className="mt-3 flex gap-2">
                  <div className="h-5 w-14 rounded-full bg-surface-soft animate-pulse" />
                  <div className="h-5 w-16 rounded-full bg-surface-soft animate-pulse" />
                </div>
              </div>
              <div className="h-10 w-16 rounded-xl bg-surface-soft animate-pulse" />
            </div>
            <div className="mt-4 h-10 w-full rounded-2xl bg-surface-soft animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function RanksListSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="relative overflow-hidden rounded-2xl border border-border-subtle bg-background-elevated/60 p-3"
        >
          <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_bottom,rgba(255,255,255,0.22)_1px,transparent_1px)] [background-size:100%_10px]" />
          <div className="relative flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-surface-soft animate-pulse" />
            <div className="h-14 w-11 rounded-xl bg-surface-soft animate-pulse" />
            <div className="min-w-0 flex-1">
              <div className="h-4 w-2/3 rounded bg-surface-soft animate-pulse" />
              <div className="mt-2 h-3 w-1/2 rounded bg-surface-soft animate-pulse" />
              <div className="mt-3 flex gap-2">
                <div className="h-5 w-16 rounded-full bg-surface-soft animate-pulse" />
                <div className="h-5 w-14 rounded-full bg-surface-soft animate-pulse" />
                <div className="h-5 w-12 rounded-full bg-surface-soft animate-pulse" />
              </div>
            </div>
            <div className="h-10 w-20 rounded-xl bg-surface-soft animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
