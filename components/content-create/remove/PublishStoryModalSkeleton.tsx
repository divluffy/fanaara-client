// components/content-create/PublishStoryModalSkeleton.tsx
"use client";

import * as React from "react";
import { cn } from "@/utils/cn";

export default function PublishStoryModalSkeleton() {
  return (
    <div className="flex max-h-[min(82vh,720px)] flex-col" aria-hidden="true">
      <div className="flex-1 overflow-hidden pb-4">
        <div className="grid gap-4 md:grid-cols-[minmax(0,360px)_minmax(0,1fr)] md:gap-5">
          {/* Preview skeleton */}
          <div className="space-y-3">
            <div
              className={cn(
                "overflow-hidden rounded-[16px] border border-border-subtle bg-background-elevated",
                "shadow-[var(--shadow-sm)]",
              )}
            >
              <div className="aspect-[9/16] w-full animate-pulse bg-background-soft/60" />
            </div>

            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="h-3 w-[55%] animate-pulse rounded-full bg-background-soft/60" />
                <div className="mt-2 h-2 w-[72%] animate-pulse rounded-full bg-background-soft/60" />
              </div>
              <div className="h-6 w-20 animate-pulse rounded-full bg-background-soft/60" />
            </div>
          </div>

          {/* Controls skeleton */}
          <div
            className={cn(
              "rounded-[16px] border border-border-subtle bg-background-elevated",
              "p-4 md:p-5",
              "shadow-[var(--shadow-sm)]",
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 animate-pulse rounded-[12px] bg-background-soft/60" />
                <div>
                  <div className="h-3 w-28 animate-pulse rounded-full bg-background-soft/60" />
                  <div className="mt-2 h-2 w-52 animate-pulse rounded-full bg-background-soft/60" />
                </div>
              </div>
              <div className="h-9 w-24 animate-pulse rounded-full bg-background-soft/60" />
            </div>

            <div className="mt-5 border-t border-border-subtle pt-5">
              <div className="flex items-start gap-2.5">
                <div className="h-9 w-9 animate-pulse rounded-[12px] bg-background-soft/60" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="h-3 w-24 animate-pulse rounded-full bg-background-soft/60" />
                    <div className="h-3 w-12 animate-pulse rounded-full bg-background-soft/60" />
                  </div>
                  <div className="mt-3 h-20 w-full animate-pulse rounded-[14px] bg-background-soft/60" />
                  <div className="mt-2 h-2 w-52 animate-pulse rounded-full bg-background-soft/60" />
                </div>
              </div>

              <div className="mt-5 grid gap-2 md:grid-cols-2 md:gap-3">
                <div className="h-16 w-full animate-pulse rounded-[14px] bg-background-soft/60" />
                <div className="h-16 w-full animate-pulse rounded-[14px] bg-background-soft/60" />
              </div>

              <div className="mt-5 h-20 w-full animate-pulse rounded-[16px] bg-background-soft/60" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer skeleton */}
      <div className="border-t border-border-subtle bg-background-elevated/80 px-3 py-3 md:px-4">
        <div className="flex items-center justify-between gap-3">
          <div className="h-2 w-56 animate-pulse rounded-full bg-background-soft/60" />
          <div className="flex items-center gap-2">
            <div className="h-10 w-24 animate-pulse rounded-full bg-background-soft/60" />
            <div className="h-10 w-28 animate-pulse rounded-full bg-background-soft/60" />
          </div>
        </div>
      </div>
    </div>
  );
}
