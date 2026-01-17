// features/signup/steps/step05.tsx
"use client";

import React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { Button } from "@/design/button";
import { cn } from "@/utils";
import { useAppSelector } from "@/redux/hooks";
import type { SignupStep1Props } from "@/types";

type FollowKind = "creator" | "channel";

type FollowItem = {
  id: string;
  kind: FollowKind;
  title: string; // display name
  subtitle: string; // handle or hashtag
  tag: string; // type label
  emoji: string;
  gradient: string;
};

const BASE_ITEMS: readonly FollowItem[] = [
  // Creators
  { id: "c1", kind: "creator", title: "KitsuneArtist", subtitle: "@kitsune", tag: "Fanart", emoji: "🦊", gradient: "bg-gradient-to-br from-fuchsia-500 via-violet-500 to-sky-500" },
  { id: "c2", kind: "creator", title: "OniReviews", subtitle: "@oni_reviews", tag: "Reviews", emoji: "👹", gradient: "bg-gradient-to-br from-rose-500 via-red-500 to-orange-500" },
  { id: "c3", kind: "creator", title: "ShonenDaily", subtitle: "@shonen_daily", tag: "News", emoji: "⚡", gradient: "bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500" },
  { id: "c4", kind: "creator", title: "MoonManga", subtitle: "@moon_manga", tag: "Manga", emoji: "🌙", gradient: "bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500" },
  { id: "c5", kind: "creator", title: "MechaLab", subtitle: "@mecha_lab", tag: "Mecha", emoji: "🤖", gradient: "bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600" },
  { id: "c6", kind: "creator", title: "SliceClub", subtitle: "@slice_club", tag: "Slice of Life", emoji: "🍡", gradient: "bg-gradient-to-br from-emerald-400 via-sky-500 to-indigo-500" },
  { id: "c7", kind: "creator", title: "CosplayForge", subtitle: "@cosplay_forge", tag: "Cosplay", emoji: "🧵", gradient: "bg-gradient-to-br from-orange-400 via-amber-500 to-yellow-500" },
  { id: "c8", kind: "creator", title: "PanelBreakdown", subtitle: "@panel_breakdown", tag: "Analysis", emoji: "🧩", gradient: "bg-gradient-to-br from-violet-500 via-fuchsia-500 to-rose-500" },
  { id: "c9", kind: "creator", title: "GhibliFrames", subtitle: "@ghibli_frames", tag: "Shots", emoji: "🎞️", gradient: "bg-gradient-to-br from-teal-400 via-cyan-500 to-sky-600" },
  { id: "c10", kind: "creator", title: "DubOrSub", subtitle: "@dub_or_sub", tag: "Debates", emoji: "🎙️", gradient: "bg-gradient-to-br from-slate-500 via-indigo-500 to-violet-600" },
  { id: "c11", kind: "creator", title: "LoreArchivist", subtitle: "@lore_archivist", tag: "Lore", emoji: "📜", gradient: "bg-gradient-to-br from-lime-400 via-emerald-500 to-teal-600" },
  { id: "c12", kind: "creator", title: "SpeedLines", subtitle: "@speed_lines", tag: "Art Tips", emoji: "✍️", gradient: "bg-gradient-to-br from-pink-500 via-rose-500 to-orange-500" },

  // Channels
  { id: "h1", kind: "channel", title: "One Piece", subtitle: "#onepiece", tag: "Channel", emoji: "🏴‍☠️", gradient: "bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500" },
  { id: "h2", kind: "channel", title: "Jujutsu Kaisen", subtitle: "#jjk", tag: "Channel", emoji: "🌀", gradient: "bg-gradient-to-br from-indigo-500 via-sky-500 to-cyan-400" },
  { id: "h3", kind: "channel", title: "Attack on Titan", subtitle: "#aot", tag: "Channel", emoji: "🧱", gradient: "bg-gradient-to-br from-stone-500 via-slate-600 to-zinc-700" },
  { id: "h4", kind: "channel", title: "RomCom", subtitle: "#romcom", tag: "Channel", emoji: "💞", gradient: "bg-gradient-to-br from-pink-500 via-fuchsia-500 to-violet-600" },
  { id: "h5", kind: "channel", title: "Isekai", subtitle: "#isekai", tag: "Channel", emoji: "🚪", gradient: "bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600" },
  { id: "h6", kind: "channel", title: "Manhwa", subtitle: "#manhwa", tag: "Channel", emoji: "📱", gradient: "bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700" },
  { id: "h7", kind: "channel", title: "AMV / Edits", subtitle: "#amv", tag: "Channel", emoji: "🎧", gradient: "bg-gradient-to-br from-fuchsia-500 via-violet-500 to-indigo-600" },
  { id: "h8", kind: "channel", title: "Cosplay", subtitle: "#cosplay", tag: "Channel", emoji: "🪡", gradient: "bg-gradient-to-br from-amber-400 via-orange-500 to-red-600" },
];

function shuffle<T>(arr: T[]) {
  // Fisher–Yates (called AFTER mount => no hydration issues)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function Step05({ onSuccess }: SignupStep1Props) {
  const reduceMotionPref = useReducedMotion();
  const { isRTL, direction } = useAppSelector((s) => s.state);

  // hydration-safe direction + motion
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const safeDirection = mounted ? direction : "ltr";
  const safeIsRTL = mounted ? isRTL : false;
  const safeReduceMotion = mounted ? reduceMotionPref : true;

  const [items, setItems] = React.useState<FollowItem[]>(() => [...BASE_ITEMS]); // deterministic first render
  React.useEffect(() => {
    // randomize only on client after hydration
    setItems((prev) => shuffle([...prev]));
  }, []);

  const [followed, setFollowed] = React.useState<Set<string>>(() => new Set());
  const [followAllUsed, setFollowAllUsed] = React.useState(false);

  const total = items.length;
  const followedCount = followed.size;

  const toggleOne = (id: string) => {
    setFollowed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const followAll = () => {
    setFollowed(new Set(items.map((x) => x.id)));
    setFollowAllUsed(true); // hide forever (even if user unfollows later)
  };

  const listVariants = safeReduceMotion
    ? undefined
    : {
        hidden: { opacity: 1 },
        show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.02 } },
      };

  const itemVariants = safeReduceMotion
    ? undefined
    : {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 },
      };

  return (
    <div dir={safeDirection} className="space-y-4" suppressHydrationWarning>
      <motion.header
        initial={false}
        animate={safeReduceMotion ? undefined : { opacity: 1, y: 0 }}
        className="text-center space-y-1"
      >
        <h2 className="text-[18px] sm:text-[20px] font-extrabold text-foreground-strong">
          Follow creators & channels
        </h2>
        <p className="text-[12.5px] text-foreground-muted">Quick picks to shape your feed.</p>
      </motion.header>

      {/* top row (no extra container wrapper) */}
      <div className={cn("flex items-center justify-between gap-2", safeIsRTL && "flex-row-reverse")}>
        <div className="text-xs text-foreground-muted">
          {followedCount} / {total}
        </div>

        <AnimatePresence initial={false}>
          {!followAllUsed && (
            <motion.div
              key="follow-all"
              initial={safeReduceMotion ? false : { opacity: 0, y: -6 }}
              animate={safeReduceMotion ? undefined : { opacity: 1, y: 0 }}
              exit={safeReduceMotion ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
            >
              <Button type="button" variant="soft" tone="brand" onClick={followAll}>
                Follow all
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* scroll list (full width cards) */}
      <motion.div
        variants={listVariants}
        initial={listVariants ? "hidden" : false}
        animate={listVariants ? "show" : undefined}
        className="max-h-[420px] overflow-y-auto pr-1 space-y-2"
        layout
      >
        {items.map((it) => {
          const isFollowing = followed.has(it.id);

          return (
            <motion.div
              key={it.id}
              variants={itemVariants}
              layout
              whileHover={safeReduceMotion ? undefined : { y: -2 }}
              transition={{ duration: 0.14, ease: "easeOut" }}
              className={cn(
                "w-full rounded-3xl border border-border-subtle bg-surface p-3",
                "shadow-[var(--shadow-xs)] hover:shadow-[var(--shadow-sm)]"
              )}
            >
              <div className={cn("flex items-center gap-3", safeIsRTL && "flex-row-reverse")}>
                <div
                  className={cn(
                    "h-12 w-12 shrink-0 rounded-2xl grid place-items-center text-xl",
                    "ring-1 ring-black/5 shadow-[var(--shadow-sm)]",
                    it.gradient
                  )}
                  aria-hidden
                >
                  {it.emoji}
                </div>

                <div className={cn("min-w-0 flex-1", safeIsRTL && "text-right")}>
                  <div className={cn("flex items-center gap-2", safeIsRTL && "justify-end")}>
                    <div className="truncate text-sm font-extrabold text-foreground-strong">
                      <bdi>{it.title}</bdi>
                    </div>

                    <span
                      className={cn(
                        "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                        it.kind === "creator"
                          ? "border-accent-border bg-accent-soft text-accent"
                          : "border-border-subtle bg-surface/70 text-foreground-muted"
                      )}
                    >
                      <bdi>{it.tag}</bdi>
                    </span>
                  </div>

                  <div className="truncate text-xs text-foreground-muted">
                    <bdi>{it.subtitle}</bdi>
                  </div>
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant={isFollowing ? "outline" : "solid"}
                  tone="brand"
                  onClick={() => toggleOne(it.id)}
                  className="shrink-0"
                >
                  {isFollowing ? "Following" : "Follow"}
                </Button>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="pt-1">
        <Button type="button" variant="gradient" gradient="ocean" size="xl" fullWidth onClick={onSuccess}>
          Continue
        </Button>
      </div>
    </div>
  );
}
