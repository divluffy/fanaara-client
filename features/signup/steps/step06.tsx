// features/signup/steps/step06.tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import {
  FiArrowRight,
  FiStar,
  FiUsers,
  FiTrendingUp,
  FiCpu,
  FiLayers,
} from "react-icons/fi";

import { Button } from "@/design";
import { cn } from "@/utils";
import { useAppSelector } from "@/store/hooks";

const COPY = {
  ar: {
    badge: "أنت جاهز ✨",
    title: "مرحبًا بك في Fanaara",
    subtitle: "مجتمع أنمي • مانجا • كوميكس + Workspace للبرامج والتحديات.",
    blocksTitle: "ماذا نقدم لك؟",
    blocks: [
      {
        t: "مجتمع و نوادي",
        d: "غرف نقاش، نوادي أعمال، أصدقاء بنفس ذوقك، وتحكم بالسبويلر.",
        icon: "users",
      },
      {
        t: "AI مساعدك",
        d: "اقتراحات حسب المزاج، تلخيصات غير حرق، وترتيب قراءة ذكي.",
        icon: "ai",
      },
      {
        t: "Trends & Discover",
        d: "الأكثر رواجًا أسبوعيًا: أعمال، شخصيات، ومواضيع يتكلم عنها الجميع.",
        icon: "trends",
      },
      {
        t: "Workspace Programs",
        d: "قراءة جماعية، تحديات، مهام أسبوعية، ومشاريع فان-آرت مع الفريق.",
        icon: "work",
      },
    ],
    cta: "ادخل Fanaara",
    note: "تقدر تعدّل تفضيلاتك لاحقًا من الإعدادات.",
  },
  en: {
    badge: "You’re in ✨",
    title: "Welcome to Fanaara",
    subtitle:
      "Anime • Manga • Comics community + a Workspace for programs & challenges.",
    blocksTitle: "What you get",
    blocks: [
      {
        t: "Community & Clubs",
        d: "Discussion rooms, title clubs, friends with your taste, spoiler controls.",
        icon: "users",
      },
      {
        t: "AI Companion",
        d: "Mood-based recommendations, spoiler-safe summaries, smart reading order.",
        icon: "ai",
      },
      {
        t: "Trends & Discover",
        d: "Weekly what’s hot: titles, characters, topics everyone’s talking about.",
        icon: "trends",
      },
      {
        t: "Workspace Programs",
        d: "Group reads, quests, weekly missions, and fan-collabs with your crew.",
        icon: "work",
      },
    ],
    cta: "Enter Fanaara",
    note: "You can change your preferences later in settings.",
  },
  tr: {
    badge: "Hazırsın ✨",
    title: "Fanaara’ya hoş geldin",
    subtitle:
      "Anime • Manga • Çizgi roman topluluğu + programlar için Workspace.",
    blocksTitle: "Sana ne sunuyoruz?",
    blocks: [
      {
        t: "Topluluk & Kulüpler",
        d: "Sohbet odaları, eser kulüpleri, zevkine uygun arkadaşlar, spoiler kontrolü.",
        icon: "users",
      },
      {
        t: "AI Asistan",
        d: "Ruh haline göre öneriler, spoiler’sız özetler, akıllı okuma sırası.",
        icon: "ai",
      },
      {
        t: "Trends & Keşfet",
        d: "Haftalık trendler: eserler, karakterler, herkesin konuştuğu konular.",
        icon: "trends",
      },
      {
        t: "Workspace Programs",
        d: "Toplu okuma, görevler, haftalık meydan okumalar ve fan projeleri.",
        icon: "work",
      },
    ],
    cta: "Fanaara’ya gir",
    note: "Tercihlerini sonra ayarlardan değiştirebilirsin.",
  },
} as const;

type CopyLocale = keyof typeof COPY;

function pickIcon(key: string) {
  switch (key) {
    case "users":
      return FiUsers;
    case "ai":
      return FiCpu;
    case "trends":
      return FiTrendingUp;
    case "work":
      return FiLayers;
    default:
      return FiStar;
  }
}

export default function Step06() {
  const reduceMotion = useReducedMotion();
  const router = useRouter();
  const { isRTL, direction } = useAppSelector((s) => s.state);

  const locale = useLocale();
  const copy = COPY[(locale as CopyLocale) ?? "en"] ?? COPY.en;

  const arrowCls = isRTL ? "rotate-180" : "";

  return (
    <div dir={direction} className="space-y-4">
      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className={cn(
          "relative overflow-hidden rounded-3xl border border-border-subtle bg-surface p-5",
          "shadow-[var(--shadow-md)]",
        )}
      >
        {/* background */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(99,102,241,0.22),transparent_45%),radial-gradient(circle_at_90%_0%,rgba(236,72,153,0.16),transparent_45%),radial-gradient(circle_at_70%_85%,rgba(16,185,129,0.12),transparent_55%)]"
        />

        <div className={cn("relative", isRTL && "text-right")}>
          {/* badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-accent-border bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
            <FiStar aria-hidden className="opacity-90" />
            <bdi>{copy.badge}</bdi>
          </div>

          {/* title */}
          <h2 className="mt-3 text-[22px] font-extrabold leading-snug text-foreground-strong">
            <span className="bg-[linear-gradient(90deg,rgba(99,102,241,1),rgba(236,72,153,1),rgba(16,185,129,1))] bg-clip-text text-transparent">
              <bdi>{copy.title}</bdi>
            </span>
          </h2>

          <p className="mt-1 text-sm text-foreground-muted">
            <bdi>{copy.subtitle}</bdi>
          </p>

          {/* what you get */}
          <div className="mt-4">
            <p className="text-xs font-semibold text-foreground-muted">
              <bdi>{copy.blocksTitle}</bdi>
            </p>

            <div className="mt-2 grid gap-2">
              {copy.blocks.map((b) => {
                const Icon = pickIcon(b.icon);
                return (
                  <div
                    key={b.t}
                    className="flex items-start gap-3 rounded-2xl border border-border-subtle bg-surface/60 p-3"
                  >
                    <div className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-accent-border bg-accent-soft text-accent">
                      <Icon aria-hidden />
                    </div>

                    <div className={cn("min-w-0", isRTL && "text-right")}>
                      <p className="text-sm font-bold text-foreground-strong">
                        <bdi>{b.t}</bdi>
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed text-foreground-muted">
                        <bdi>{b.d}</bdi>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="mt-4 text-[12px] text-foreground-muted">
            <bdi>{copy.note}</bdi>
          </p>
        </div>
      </motion.section>

      <Button
        type="button"
        variant="gradient"
        gradient="sunset"
        size="xl"
        fullWidth
        rightIcon={<FiArrowRight aria-hidden className={arrowCls} />}
        onClick={() => router.push("/")}
      >
        {copy.cta}
      </Button>
    </div>
  );
}
