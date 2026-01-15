// features/signup/steps/step06.tsx
"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useLocale } from "next-intl";
import { FiArrowRight } from "react-icons/fi";

import { Button } from "@/design/button";
import { cn } from "@/utils";
import { useAppSelector } from "@/redux/hooks";

const COPY = {
  ar: {
    title: "أهلًا بك في منصّتنا 🎉",
    subtitle: "جاهز لرحلة أنمي ومانجا ممتعة؟ خلّينا نبدأ!",
    cta: "ابدأ الاستكشاف",
    note: "تقدر تعدّل تفضيلاتك لاحقًا من الإعدادات.",
  },
  en: {
    title: "Welcome aboard 🎉",
    subtitle: "Ready for an anime & manga journey? Let’s go!",
    cta: "Start exploring",
    note: "You can change your preferences later in settings.",
  },
  tr: {
    title: "Hoş geldin 🎉",
    subtitle: "Anime & manga yolculuğuna hazır mısın? Haydi!",
    cta: "Keşfetmeye başla",
    note: "Tercihlerini daha sonra ayarlardan değiştirebilirsin.",
  },
} as const;

type CopyLocale = keyof typeof COPY;

export default function Step06() {
  const reduceMotion = useReducedMotion();
  const { isRTL, direction } = useAppSelector((s) => s.state);

  const locale = useLocale();
  const copy = COPY[(locale as CopyLocale) ?? "en"] ?? COPY.en;

  // arrow points to inline-end
  const arrowCls = isRTL ? "rotate-180" : "";

  return (
    <div dir={direction} className="space-y-4">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className={cn(
          "relative overflow-hidden rounded-3xl border border-border-subtle bg-surface p-5",
          "shadow-[var(--shadow-md)]"
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.18),transparent_45%),radial-gradient(circle_at_90%_0%,rgba(236,72,153,0.14),transparent_45%)]"
        />

        <div className={cn("relative", isRTL && "text-right")}>
          <div className="inline-flex items-center gap-2 rounded-full border border-accent-border bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
            <span aria-hidden>✨</span>
            <bdi>Anime UI</bdi>
          </div>

          <h2 className="mt-3 text-[20px] font-extrabold text-foreground-strong">
            <bdi>{copy.title}</bdi>
          </h2>

          <p className="mt-1 text-sm text-foreground-muted">
            <bdi>{copy.subtitle}</bdi>
          </p>

          <p className="mt-3 text-[12px] text-foreground-muted">
            <bdi>{copy.note}</bdi>
          </p>
        </div>
      </motion.div>

      <Link href="/" className="block">
        <Button
          type="button"
          variant="gradient"
          gradient="sunset"
          size="xl"
          fullWidth
          rightIcon={<FiArrowRight aria-hidden className={arrowCls} />}
        >
          {copy.cta}
        </Button>
      </Link>
    </div>
  );
}
