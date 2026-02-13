// app\(logged)\gallery\_components\FiltersDrawer.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  IoCheckmarkCircle,
  IoClose,
  IoCompass,
  IoCrop,
  IoFilter,
  IoImage,
  IoPeople,
  IoShuffle,
  IoTime,
  IoTrendingUp,
} from "react-icons/io5";

import type {
  GalleryCategory,
  GalleryFilters,
  Orientation,
  SortMode,
  WorkKind,
} from "./_data/galleryTypes";
import { cn } from "./_data/galleryUtils";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;

  categories: GalleryCategory[];
  kinds: Array<{ id: WorkKind; label: string }>;

  value: GalleryFilters;
  onApply: (next: GalleryFilters) => void;
  onReset: () => void;
};

export default function FiltersDrawer({
  open,
  onOpenChange,
  categories,
  kinds,
  value,
  onApply,
  onReset,
}: Props) {
  const reduce = useReducedMotion();
  const [draft, setDraft] = useState<GalleryFilters>(value);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  const badge = useMemo(() => {
    let n = 0;
    if (value.q.trim()) n++;
    if (value.tag.trim()) n++;
    if (value.cat !== "all") n++;
    if (value.kind !== "all") n++;
    if (value.sort !== "trending") n++;
    if (value.o !== "all") n++;
    if (value.verified) n++;
    if (value.following) n++;
    if (value.multi) n++;
    return n;
  }, [value]);

  const pill = (active: boolean) =>
    cn(
      "rounded-full border px-3 py-2 text-[12px] font-black transition",
      active
        ? "border-transparent bg-foreground-strong text-background shadow-[var(--shadow-sm)]"
        : "border-border-subtle bg-surface-soft text-foreground-strong hover:bg-surface",
    );

  const toggle = (
    key: keyof Pick<GalleryFilters, "verified" | "following" | "multi">,
  ) => {
    setDraft((d) => ({ ...d, [key]: !d[key] }));
  };

  const setSort = (s: SortMode) => setDraft((d) => ({ ...d, sort: s }));
  const setOrientation = (o: Orientation) => setDraft((d) => ({ ...d, o }));
  const setCategory = (cat: string) => setDraft((d) => ({ ...d, cat }));
  const setKind = (kind: WorkKind) => setDraft((d) => ({ ...d, kind }));

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[80] bg-black/55 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reduce ? { duration: 0 } : { duration: 0.18 }}
            onClick={() => onOpenChange(false)}
          />

          <motion.aside
            className={cn(
              "fixed z-[90] top-0 bottom-0 end-0 w-[min(92vw,560px)]",
              "border-s border-border-subtle bg-background-elevated shadow-[var(--shadow-elevated)]",
              "flex flex-col",
            )}
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={
              reduce
                ? { duration: 0 }
                : { type: "spring", stiffness: 420, damping: 38 }
            }
            role="dialog"
            aria-label="Filters"
          >
            {/* Header */}
            <div className="border-b border-border-subtle p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="grid size-10 place-items-center rounded-2xl border border-border-subtle bg-surface-soft">
                      <IoFilter className="text-[18px]" />
                    </span>
                    <div>
                      <div className="text-sm font-black text-foreground-strong">
                        Filters
                      </div>
                      <div className="mt-0.5 text-[11px] text-foreground-muted">
                        {badge ? `${badge} active` : "No active filters"}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="grid size-10 place-items-center rounded-2xl border border-border-subtle bg-surface-soft hover:bg-surface"
                  onClick={() => onOpenChange(false)}
                  aria-label="Close"
                >
                  <IoClose className="text-[18px]" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="app-scroll flex-1 space-y-6 p-4">
              {/* Sort */}
              <div className="rounded-3xl border border-border-subtle bg-surface-soft p-4">
                <div className="mb-3 flex items-center gap-2 text-[12px] font-black text-foreground-strong">
                  <IoShuffle className="text-[16px]" />
                  <span>Sort</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    className={pill(draft.sort === "trending")}
                    onClick={() => setSort("trending")}
                    type="button"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <IoTrendingUp /> Trending
                    </span>
                  </button>
                  <button
                    className={pill(draft.sort === "new")}
                    onClick={() => setSort("new")}
                    type="button"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <IoTime /> New
                    </span>
                  </button>
                  <button
                    className={pill(draft.sort === "top")}
                    onClick={() => setSort("top")}
                    type="button"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <IoCheckmarkCircle /> Top
                    </span>
                  </button>
                </div>
              </div>

              {/* Orientation */}
              <div className="rounded-3xl border border-border-subtle bg-surface-soft p-4">
                <div className="mb-3 flex items-center gap-2 text-[12px] font-black text-foreground-strong">
                  <IoCrop className="text-[16px]" />
                  <span>Orientation</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    className={pill(draft.o === "all")}
                    onClick={() => setOrientation("all")}
                    type="button"
                  >
                    All
                  </button>
                  <button
                    className={pill(draft.o === "portrait")}
                    onClick={() => setOrientation("portrait")}
                    type="button"
                  >
                    Portrait
                  </button>
                  <button
                    className={pill(draft.o === "square")}
                    onClick={() => setOrientation("square")}
                    type="button"
                  >
                    Square
                  </button>
                  <button
                    className={pill(draft.o === "landscape")}
                    onClick={() => setOrientation("landscape")}
                    type="button"
                  >
                    Landscape
                  </button>
                </div>
              </div>

              {/* Kind */}
              <div className="rounded-3xl border border-border-subtle bg-surface-soft p-4">
                <div className="mb-3 flex items-center gap-2 text-[12px] font-black text-foreground-strong">
                  <IoImage className="text-[16px]" />
                  <span>Type</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {kinds.map((k) => (
                    <button
                      key={k.id}
                      type="button"
                      className={pill(draft.kind === k.id)}
                      onClick={() => setKind(k.id)}
                    >
                      {k.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category with thumbnails */}
              <div className="rounded-3xl border border-border-subtle bg-surface-soft p-4">
                <div className="mb-3 flex items-center gap-2 text-[12px] font-black text-foreground-strong">
                  <IoCompass className="text-[16px]" />
                  <span>Category</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {categories.map((c) => {
                    const active = draft.cat === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCategory(c.id)}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl border p-3 text-start transition",
                          active
                            ? "border-transparent bg-foreground-strong text-background shadow-[var(--shadow-sm)]"
                            : "border-border-subtle bg-background-elevated hover:bg-surface",
                        )}
                      >
                        <div className="relative size-11 overflow-hidden rounded-2xl border border-border-subtle bg-surface-soft">
                          <Image
                            src={c.cover}
                            alt={c.label}
                            fill
                            className="object-cover"
                            sizes="44px"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div
                            className={cn(
                              "truncate text-[12px] font-black",
                              active
                                ? "text-background"
                                : "text-foreground-strong",
                            )}
                          >
                            {c.label}
                          </div>
                          <div
                            className={cn(
                              "truncate text-[11px]",
                              active
                                ? "text-background/80"
                                : "text-foreground-muted",
                            )}
                          >
                            {c.id}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Toggles */}
              <div className="rounded-3xl border border-border-subtle bg-surface-soft p-4">
                <div className="mb-3 flex items-center gap-2 text-[12px] font-black text-foreground-strong">
                  <IoPeople className="text-[16px]" />
                  <span>Extra</span>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => toggle("verified")}
                    className={cn(
                      "w-full rounded-2xl border px-4 py-3 text-start transition",
                      draft.verified
                        ? "border-accent-border bg-accent-soft"
                        : "border-border-subtle bg-background-elevated hover:bg-surface",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-[12px] font-black text-foreground-strong">
                          <VerifiedBadge size={16} />
                          <span>Verified only</span>
                        </div>
                        <div className="mt-1 text-[11px] text-foreground-muted">
                          Show verified creators only.
                        </div>
                      </div>
                      <span
                        className={cn(
                          "text-[11px] font-black",
                          draft.verified
                            ? "text-accent"
                            : "text-foreground-muted",
                        )}
                      >
                        {draft.verified ? "ON" : "OFF"}
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggle("following")}
                    className={cn(
                      "w-full rounded-2xl border px-4 py-3 text-start transition",
                      draft.following
                        ? "border-accent-border bg-accent-soft"
                        : "border-border-subtle bg-background-elevated hover:bg-surface",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[12px] font-black text-foreground-strong">
                          Following only
                        </div>
                        <div className="mt-1 text-[11px] text-foreground-muted">
                          Local mock following list.
                        </div>
                      </div>
                      <span
                        className={cn(
                          "text-[11px] font-black",
                          draft.following
                            ? "text-accent"
                            : "text-foreground-muted",
                        )}
                      >
                        {draft.following ? "ON" : "OFF"}
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggle("multi")}
                    className={cn(
                      "w-full rounded-2xl border px-4 py-3 text-start transition",
                      draft.multi
                        ? "border-accent-border bg-accent-soft"
                        : "border-border-subtle bg-background-elevated hover:bg-surface",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[12px] font-black text-foreground-strong">
                          Multi images only
                        </div>
                        <div className="mt-1 text-[11px] text-foreground-muted">
                          Works with more than 1 image.
                        </div>
                      </div>
                      <span
                        className={cn(
                          "text-[11px] font-black",
                          draft.multi ? "text-accent" : "text-foreground-muted",
                        )}
                      >
                        {draft.multi ? "ON" : "OFF"}
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border-subtle p-4 pb-[env(safe-area-inset-bottom)]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex-1 rounded-2xl border border-border-subtle bg-surface-soft px-4 py-3 text-[12px] font-black text-foreground-strong hover:bg-surface"
                  onClick={() => {
                    onReset();
                    onOpenChange(false);
                  }}
                >
                  Reset
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-2xl bg-foreground-strong px-4 py-3 text-[12px] font-black text-background shadow-[var(--shadow-sm)] hover:opacity-95"
                  onClick={() => {
                    onApply(draft);
                    onOpenChange(false);
                  }}
                >
                  Apply
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
