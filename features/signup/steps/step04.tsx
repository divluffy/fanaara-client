// features/signup/steps/step04.tsx
"use client";

import React from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { motion, useReducedMotion } from "framer-motion";
import { useLocale } from "next-intl";

import { LocalizedSelect, type SelectOption } from "@/design/Select";
import { Button } from "@/design/button";
import { cn } from "@/utils";
import { useAppSelector } from "@/redux/hooks";
import type { SignupStep1Props } from "@/types";

type Step04Values = {
  purpose: string | null;
  interests: string[];
  genres: string[];
};

const PURPOSE: SelectOption[] = [
  { value: "community", label: "Community", description: "Meet fans & make friends", group: "Purpose" },
  { value: "discover", label: "Discover", description: "Find new anime & manga", group: "Purpose" },
  { value: "share", label: "Share", description: "Post reviews & edits", group: "Purpose" },
  { value: "track", label: "Track", description: "Watchlist / reading list", group: "Purpose" },
];

const INTERESTS: SelectOption[] = [
  { value: "news", label: "News", description: "Industry updates", group: "Interests" },
  { value: "memes", label: "Memes", description: "Fun & chaos", group: "Interests" },
  { value: "cosplay", label: "Cosplay", description: "Looks & builds", group: "Interests" },
  { value: "fanart", label: "Fanart", description: "Illustrations & sketches", group: "Interests" },
  { value: "analysis", label: "Analysis", description: "Deep dives", group: "Interests" },
  { value: "collecting", label: "Collecting", description: "Figures & merch", group: "Interests" },
  { value: "gaming", label: "Gaming", description: "Anime games", group: "Interests" },
  { value: "events", label: "Events", description: "Conventions & meetups", group: "Interests" },
];

const GENRES: SelectOption[] = [
  { value: "shonen", label: "Shonen", description: "Action & friendship", group: "Genres" },
  { value: "seinen", label: "Seinen", description: "Mature themes", group: "Genres" },
  { value: "isekai", label: "Isekai", description: "Another world", group: "Genres" },
  { value: "romance", label: "Romance", description: "Love stories", group: "Genres" },
  { value: "slice", label: "Slice of Life", description: "Everyday vibes", group: "Genres" },
  { value: "mecha", label: "Mecha", description: "Robots", group: "Genres" },
  { value: "fantasy", label: "Fantasy", description: "Magic & worlds", group: "Genres" },
  { value: "horror", label: "Horror", description: "Dark & scary", group: "Genres" },
  { value: "sports", label: "Sports", description: "Competition", group: "Genres" },
];

const COPY = {
  ar: {
    title: "خلّينا نفهم ذوقك",
    subtitle: "اختيارات بسيطة تساعدنا نرتّب تجربتك.",
    purpose: "ليش انضمّيت؟",
    interests: "إيش تهتم تتابع؟ (اختر 3 على الأقل)",
    genres: "إيش الأنواع اللي تحبها؟ (اختر 3 على الأقل)",
    continue: "متابعة",
    req: "مطلوب",
    min3: "اختر 3 عناصر على الأقل.",
  },
  en: {
    title: "Tell us your vibe",
    subtitle: "A few picks to personalize your feed.",
    purpose: "Why did you join?",
    interests: "What are you into? (pick at least 3)",
    genres: "Preferred genres (pick at least 3)",
    continue: "Continue",
    req: "Required",
    min3: "Pick at least 3 items.",
  },
  tr: {
    title: "Tarzını söyle",
    subtitle: "Deneyimini kişiselleştirelim.",
    purpose: "Neden katıldın?",
    interests: "Neler ilgini çekiyor? (en az 3)",
    genres: "Sevdiğin türler (en az 3)",
    continue: "Devam",
    req: "Gerekli",
    min3: "En az 3 öğe seç.",
  },
} as const;

type CopyLocale = keyof typeof COPY;

function toArray(value: string | string[] | null): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export default function Step04({ onSuccess }: SignupStep1Props) {
  const reduceMotion = useReducedMotion();
  const { isRTL, direction } = useAppSelector((s) => s.state);

  const locale = useLocale();
  const copy = COPY[(locale as CopyLocale) ?? "en"] ?? COPY.en;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<Step04Values>({
    mode: "onChange",
    defaultValues: { purpose: null, interests: [], genres: [] },
  });

  const onSubmit: SubmitHandler<Step04Values> = async () => {
    // لا يوجد API هنا — فقط تقدم للخطوة التالية
    onSuccess?.();
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* Purpose (single) */}
        <Controller
          control={control}
          name="purpose"
          rules={{ required: copy.req }}
          render={({ field }) => (
            <div>
              <LocalizedSelect
                label={copy.purpose}
                placeholder="Select…"
                options={PURPOSE}
                value={field.value}
                onChange={(val) => field.onChange(typeof val === "string" ? val : null)}
                searchable
                variant="solid"
              />
              {errors.purpose?.message ? (
                <p className="mt-1 text-xs text-danger-solid">
                  <bdi>{String(errors.purpose.message)}</bdi>
                </p>
              ) : null}
            </div>
          )}
        />

        {/* Interests (multi min 3) */}
        <Controller
          control={control}
          name="interests"
          rules={{
            validate: (v) => (Array.isArray(v) && v.length >= 3 ? true : copy.min3),
          }}
          render={({ field }) => (
            <div>
              <LocalizedSelect
                label={copy.interests}
                placeholder="Select…"
                options={INTERESTS}
                value={field.value}
                multiple
                searchable
                variant="solid"
                onChange={(val) => field.onChange(toArray(val))}
              />
              {errors.interests?.message ? (
                <p className="mt-1 text-xs text-danger-solid">
                  <bdi>{String(errors.interests.message)}</bdi>
                </p>
              ) : null}
            </div>
          )}
        />

        {/* Genres (multi min 3) */}
        <Controller
          control={control}
          name="genres"
          rules={{
            validate: (v) => (Array.isArray(v) && v.length >= 3 ? true : copy.min3),
          }}
          render={({ field }) => (
            <div>
              <LocalizedSelect
                label={copy.genres}
                placeholder="Select…"
                options={GENRES}
                value={field.value}
                multiple
                searchable
                variant="solid"
                onChange={(val) => field.onChange(toArray(val))}
              />
              {errors.genres?.message ? (
                <p className="mt-1 text-xs text-danger-solid">
                  <bdi>{String(errors.genres.message)}</bdi>
                </p>
              ) : null}
            </div>
          )}
        />

        <div className="pt-1">
          <Button
            type="submit"
            variant="gradient"
            gradient="aurora"
            size="xl"
            fullWidth
            isLoading={isSubmitting}
            loadingText="..."
            disabled={!isValid}
            className={cn("shadow-[var(--shadow-glow-brand)]")}
          >
            {copy.continue}
          </Button>
        </div>

        <div
          className={cn(
            "rounded-2xl border border-border-subtle bg-surface/60 p-3 text-[12px] text-foreground-muted",
            isRTL && "text-right"
          )}
        >
          <bdi>✨ Anime UI tip: هذه الاختيارات تتحول لاحقًا لتغذية (Feed) مخصصة + اقتراحات متابعة.</bdi>
        </div>
      </form>
    </div>
  );
}
