// features/signup/steps/step05.tsx
"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLocale } from "next-intl";

import { Button } from "@/design/button";
import { cn } from "@/utils";
import { useAppSelector } from "@/redux/hooks";
import type { SignupStep1Props } from "@/types";

type Suggestion = {
  id: string;
  name: string;
  handle: string;
  badge?: string;
  avatarEmoji: string;
  gradient: string;
};

const SUGGESTIONS: readonly Suggestion[] = [
  { id: "1", name: "KitsuneArtist", handle: "@kitsune", badge: "Fanart", avatarEmoji: "🦊", gradient: "bg-gradient-to-br from-fuchsia-500 via-violet-500 to-sky-500" },
  { id: "2", name: "OniReviews", handle: "@oni_reviews", badge: "Reviews", avatarEmoji: "👹", gradient: "bg-gradient-to-br from-rose-500 via-red-500 to-orange-500" },
  { id: "3", name: "ShonenDaily", handle: "@shonen_daily", badge: "News", avatarEmoji: "⚡", gradient: "bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500" },
  { id: "4", name: "MoonManga", handle: "@moon_manga", badge: "Manga", avatarEmoji: "🌙", gradient: "bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500" },
  { id: "5", name: "MechaLab", handle: "@mecha_lab", badge: "Mecha", avatarEmoji: "🤖", gradient: "bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600" },
  { id: "6", name: "SliceClub", handle: "@slice_club", badge: "Slice", avatarEmoji: "🍡", gradient: "bg-gradient-to-br from-emerald-400 via-sky-500 to-indigo-500" },
];

const COPY = {
  ar: {
    title: "تابع ناس مثل ذوقك",
    subtitle: "اقتراحات خفيفة لتبدأ الفيد بسرعة.",
    followAll: "متابعة الكل",
    unfollowAll: "إلغاء متابعة الكل",
    follow: "متابعة",
    following: "متابَع",
    continue: "متابعة",
    empty: "لا توجد اقتراحات الآن.",
  },
  en: {
    title: "Follow creators you’ll like",
    subtitle: "Quick picks to shape your feed.",
    followAll: "Follow all",
    unfollowAll: "Unfollow all",
    follow: "Follow",
    following: "Following",
    continue: "Continue",
    empty: "No suggestions right now.",
  },
  tr: {
    title: "Seveceğin kişileri takip et",
    subtitle: "Feed’ini hızlıca şekillendir.",
    followAll: "Hepsini takip et",
    unfollowAll: "Hepsini bırak",
    follow: "Takip et",
    following: "Takip ediliyor",
    continue: "Devam",
    empty: "Şu an öneri yok.",
  },
} as const;

type CopyLocale = keyof typeof COPY;

export default function Step05({ onSuccess }: SignupStep1Props) {
  const reduceMotion = useReducedMotion();
  const { isRTL, direction } = useAppSelector((s) => s.state);

  const locale = useLocale();
  const copy = COPY[(locale as CopyLocale) ?? "en"] ?? COPY.en;

  const [followed, setFollowed] = React.useState<Set<string>>(() => new Set());

  const allIds = React.useMemo(() => SUGGESTIONS.map((s) => s.id), []);
  const allFollowed = followed.size === allIds.length && allIds.length > 0;

  const toggleOne = (id: string) => {
    setFollowed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setFollowed((prev) => {
      if (prev.size === allIds.length) return new Set();
      return new Set(allIds);
    });
  };

  const listVariants = reduceMotion
    ? undefined
    : {
        hidden: { opacity: 1 },
        show: {
          opacity: 1,
          transition: { staggerChildren: 0.06, delayChildren: 0.02 },
        },
      };

  const itemVariants = reduceMotion
    ? undefined
    : {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 },
      };

  return (
    <div dir={direction} className="space-y-4">
      <motion.header
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="text-center space-y-1"
      >
        <h2 className="text-[18px] sm:text-[20px] font-extrabold text-foreground-strong">
          <bdi>{copy.title}</bdi>
        </h2>
        <p className="text-[12.5px] text-foreground-muted">
          <bdi>{copy.subtitle}</bdi>
        </p>
      </motion.header>

      {SUGGESTIONS.length === 0 ? (
        <div className="rounded-2xl border border-border-subtle bg-surface/60 p-4 text-center text-sm text-foreground-muted">
          <bdi>{copy.empty}</bdi>
        </div>
      ) : (
        <>
          <div className={cn("flex items-center justify-between gap-2", isRTL && "flex-row-reverse")}>
            <div className="text-xs text-foreground-muted">
              <bdi>{followed.size} / {SUGGESTIONS.length}</bdi>
            </div>
            <Button
              type="button"
              variant={allFollowed ? "outline" : "soft"}
              tone="brand"
              onClick={toggleAll}
            >
              {allFollowed ? copy.unfollowAll : copy.followAll}
            </Button>
          </div>

          <motion.div
            variants={listVariants}
            initial={listVariants ? "hidden" : false}
            animate={listVariants ? "show" : undefined}
            className="space-y-2"
          >
            {SUGGESTIONS.map((s) => {
              const isFollowing = followed.has(s.id);

              return (
                <motion.div
                  key={s.id}
                  variants={itemVariants}
                  className={cn(
                    "rounded-3xl border border-border-subtle bg-surface p-3 shadow-[var(--shadow-xs)]",
                    "flex items-center gap-3",
                    isRTL && "flex-row-reverse"
                  )}
                  whileHover={reduceMotion ? undefined : { y: -1 }}
                  transition={{ duration: 0.12 }}
                >
                  <div
                    className={cn(
                      "h-12 w-12 shrink-0 rounded-2xl grid place-items-center text-xl",
                      "ring-1 ring-black/5 shadow-[var(--shadow-sm)]",
                      s.gradient
                    )}
                    aria-hidden
                  >
                    {s.avatarEmoji}
                  </div>

                  <div className={cn("min-w-0 flex-1", isRTL && "text-right")}>
                    <div className="flex items-center gap-2">
                      <div className="truncate text-sm font-extrabold text-foreground-strong">
                        <bdi>{s.name}</bdi>
                      </div>
                      {s.badge ? (
                        <span className="rounded-full border border-accent-border bg-accent-soft px-2 py-0.5 text-[10px] font-semibold text-accent">
                          <bdi>{s.badge}</bdi>
                        </span>
                      ) : null}
                    </div>
                    <div className="truncate text-xs text-foreground-muted">
                      <bdi>{s.handle}</bdi>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant={isFollowing ? "outline" : "solid"}
                    tone="brand"
                    onClick={() => toggleOne(s.id)}
                  >
                    {isFollowing ? copy.following : copy.follow}
                  </Button>
                </motion.div>
              );
            })}
          </motion.div>
        </>
      )}

      <div className="pt-1">
        <Button type="button" variant="gradient" gradient="ocean" size="xl" fullWidth onClick={onSuccess}>
          {copy.continue}
        </Button>
      </div>
    </div>
  );
}
