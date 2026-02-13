

// app\(logged)\chat\_components\MessagesSkeleton.tsx
import React from "react";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";

export default function Loading() {
  return (
    <div className="relative h-[100svh] w-full overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(900px 520px at 12% 12%, color-mix(in srgb, var(--color-brand-400) 35%, transparent) 0%, transparent 60%), radial-gradient(820px 520px at 88% 18%, color-mix(in srgb, var(--color-extra-purple) 22%, transparent) 0%, transparent 62%)",
        }}
      />

      <div className="relative flex h-full min-h-0 w-full gap-2 p-2 md:gap-3 md:p-3">
        {/* Sidebar skeleton */}
        <aside className="flex h-full min-h-0 w-full flex-col rounded-3xl border border-nav-border bg-nav/80 backdrop-blur-xl shadow-[var(--shadow-glass)] lg:w-[380px]">
          <div className="px-3 pt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="grid size-10 place-items-center rounded-2xl border border-border-subtle bg-background-elevated">
                  <IoChatbubbleEllipsesOutline className="size-5 text-accent" />
                </div>
                <div>
                  <div className="h-3 w-24 rounded bg-surface-muted animate-pulse" />
                  <div className="mt-2 h-2 w-36 rounded bg-surface-muted animate-pulse" />
                </div>
              </div>
              <div className="size-10 rounded-2xl border border-border-subtle bg-surface-soft animate-pulse" />
            </div>

            <div className="mt-3 h-10 rounded-2xl border border-border-subtle bg-surface-soft animate-pulse" />
            <div className="mt-3 h-12 rounded-2xl border border-border-subtle bg-surface-soft animate-pulse" />
          </div>

          <div className="mt-2 min-h-0 flex-1 overflow-y-auto app-scroll has-scroll px-2 pb-2">
            <div className="space-y-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[76px] rounded-3xl border border-border-subtle bg-background-elevated/70 animate-pulse"
                />
              ))}
            </div>
          </div>
        </aside>

        {/* Chat skeleton */}
        <main className="hidden lg:flex h-full min-h-0 flex-1 flex-col rounded-3xl border border-nav-border bg-nav/80 backdrop-blur-xl shadow-[var(--shadow-glass)]">
          <div className="border-b border-border-subtle px-3 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-12 rounded-2xl border border-border-subtle bg-surface-soft animate-pulse" />
                <div>
                  <div className="h-3 w-44 rounded bg-surface-muted animate-pulse" />
                  <div className="mt-2 h-2 w-28 rounded bg-surface-muted animate-pulse" />
                </div>
              </div>
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="size-10 rounded-2xl border border-border-subtle bg-surface-soft animate-pulse" />
                ))}
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto app-scroll has-scroll p-3">
            <div className="mx-auto max-w-3xl space-y-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className={`flex ${i % 3 === 0 ? "justify-end" : "justify-start"}`}>
                  <div className="h-16 w-[min(420px,70%)] rounded-3xl border border-border-subtle bg-background-elevated/70 animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border-subtle p-2">
            <div className="h-14 rounded-[26px] border border-border-subtle bg-background-elevated animate-pulse" />
          </div>
        </main>
      </div>
    </div>
  );
}

