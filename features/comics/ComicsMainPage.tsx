/* app/anime/page.tsx */
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import useEmblaCarousel from "embla-carousel-react";
import {
  IoAdd,
  IoCalendarOutline,
  IoCheckmarkCircleOutline,
  IoChevronBack,
  IoChevronForward,
  IoEllipsisHorizontal,
  IoEyeOutline,
  IoFlame,
  IoGridOutline,
  IoHeartOutline,
  IoInformationCircleOutline,
  IoPlay,
  IoSparkles,
  IoStar,
  IoTimeOutline,
  IoTrophyOutline,
  IoWarningOutline,
} from "react-icons/io5";
import { FaPeopleGroup } from "react-icons/fa6";

import { Button } from "@/design/DeButton";
import { Avatar } from "@/design/DeAvatar";
import DeModal from "@/design/DeModal";
import OptionsSheet, { type OptionsSheetOption } from "@/design/DeOptions";
import { cn } from "@/utils/cn";

/* =========================================================
   Types
   ========================================================= */

type Dir = "rtl" | "ltr";
type HubTab = "latest" | "genres" | "season" | "schedule";

type MediaSeason = "WINTER" | "SPRING" | "SUMMER" | "FALL";
type MediaFormat =
  | "TV"
  | "TV_SHORT"
  | "MOVIE"
  | "SPECIAL"
  | "OVA"
  | "ONA"
  | "MUSIC"
  | string;

type AniListMedia = {
  id: number;
  siteUrl?: string | null;

  title?: {
    romaji?: string | null;
    english?: string | null;
    native?: string | null;
  } | null;

  description?: string | null;
  genres?: string[] | null;

  bannerImage?: string | null;
  coverImage?: {
    extraLarge?: string | null;
    large?: string | null;
    color?: string | null;
  } | null;

  format?: MediaFormat | null;
  episodes?: number | null;
  season?: MediaSeason | null;
  seasonYear?: number | null;

  averageScore?: number | null;
  popularity?: number | null;
  favourites?: number | null;
  isAdult?: boolean | null;

  studios?: { nodes?: Array<{ name: string }> } | null;

  rankings?: Array<{
    rank: number;
    type: string; // RATED / POPULAR
    allTime?: boolean | null;
    context?: string | null;
    year?: number | null;
    season?: MediaSeason | null;
  }> | null;

  nextAiringEpisode?: {
    airingAt: number;
    timeUntilAiring: number;
    episode: number;
  } | null;

  trailer?: {
    site?: string | null; // youtube
    id?: string | null;
    thumbnail?: string | null;
  } | null;

  tags?: Array<{ name: string }> | null;
};

type AiringScheduleItem = {
  airingAt: number;
  timeUntilAiring: number;
  episode: number;
  media: AniListMedia;
};

/* =========================================================
   Helpers
   ========================================================= */

function getDocDir(): Dir {
  if (typeof document === "undefined") return "rtl";
  return document.documentElement.dir === "ltr" ? "ltr" : "rtl";
}

function stripHtml(input?: string | null) {
  if (!input) return "";
  return input
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getTitle(m: AniListMedia) {
  return (
    m.title?.english ||
    m.title?.romaji ||
    m.title?.native ||
    "Unknown Title"
  );
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function formatCompact(n?: number | null) {
  if (n === null || n === undefined) return "—";
  try {
    return new Intl.NumberFormat(undefined, {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(n);
  } catch {
    return String(n);
  }
}

const SEASON_AR: Record<MediaSeason, string> = {
  WINTER: "شتاء",
  SPRING: "ربيع",
  SUMMER: "صيف",
  FALL: "خريف",
};

function getCurrentSeason(date: Date): { season: MediaSeason; seasonYear: number } {
  const m = date.getMonth() + 1; // 1..12
  if (m <= 3) return { season: "WINTER", seasonYear: date.getFullYear() };
  if (m <= 6) return { season: "SPRING", seasonYear: date.getFullYear() };
  if (m <= 9) return { season: "SUMMER", seasonYear: date.getFullYear() };
  return { season: "FALL", seasonYear: date.getFullYear() };
}

function pickRank(m?: AniListMedia | null) {
  const r = m?.rankings ?? [];
  const ratedAllTime = r.find((x) => x.type === "RATED" && x.allTime);
  const popAllTime = r.find((x) => x.type === "POPULAR" && x.allTime);
  return ratedAllTime?.rank ?? popAllTime?.rank ?? r[0]?.rank ?? null;
}

function guessSeasonNumberFromTitle(title: string) {
  const t = title.toLowerCase();

  if (/season\s*2|2nd\s*season|second\s*season/.test(t)) return 2;
  if (/season\s*3|3rd\s*season|third\s*season/.test(t)) return 3;
  if (/season\s*4|4th\s*season|fourth\s*season/.test(t)) return 4;

  if (/\bii\b/.test(t)) return 2;
  if (/\biii\b/.test(t)) return 3;
  if (/\biv\b/.test(t)) return 4;

  return 1;
}

function formatFormatShort(format?: string | null) {
  if (!format) return "—";
  switch (format) {
    case "TV":
      return "TV";
    case "TV_SHORT":
      return "TV Short";
    case "MOVIE":
      return "Movie";
    case "OVA":
      return "OVA";
    case "ONA":
      return "ONA";
    case "SPECIAL":
      return "Special";
    case "MUSIC":
      return "Music";
    default:
      return String(format);
  }
}

function secondsToHuman(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);

  if (d > 0) return `${d} يوم ${h} س`;
  if (h > 0) return `${h} س ${m} د`;
  return `${m} د`;
}

type WarningChip = { tone: "success" | "warning" | "danger"; label: string };

function buildWarnings(m: AniListMedia): WarningChip[] {
  const g = new Set((m.genres ?? []).map((x) => x.toLowerCase()));
  const tags = new Set((m.tags ?? []).map((x) => x.name.toLowerCase()));

  const out: WarningChip[] = [];

  if (m.isAdult) out.push({ tone: "danger", label: "+18" });

  // very rough heuristics (static demo)
  if (g.has("horror") || g.has("psychological") || tags.has("gore")) {
    out.push({ tone: "warning", label: "عنف" });
  }
  if (g.has("ecchi") || tags.has("nudity") || tags.has("sexual content")) {
    out.push({ tone: "warning", label: "إيحاءات" });
  }

  if (out.length === 0) out.push({ tone: "success", label: "آمن للمشاهدة" });

  return out.slice(0, 3);
}

async function safeCopyToClipboard(text: string) {
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

/* =========================================================
   Static demo data (NO APIs)
   ========================================================= */

type MiniUser = {
  id: string;
  name: string;
  handle: string;
  avatar: string;
};

const USERS: MiniUser[] = [
  { id: "u1", name: "Sora", handle: "@sora", avatar: "https://i.pravatar.cc/120?img=32" },
  { id: "u2", name: "Kaito", handle: "@kaito", avatar: "https://i.pravatar.cc/120?img=12" },
  { id: "u3", name: "Hana", handle: "@hana", avatar: "https://i.pravatar.cc/120?img=47" },
  { id: "u4", name: "Rin", handle: "@rin", avatar: "https://i.pravatar.cc/120?img=5" },
  { id: "u5", name: "Akira", handle: "@akira", avatar: "https://i.pravatar.cc/120?img=19" },
  { id: "u6", name: "Yumi", handle: "@yumi", avatar: "https://i.pravatar.cc/120?img=9" },
];

function makeMediaBase(over: Partial<AniListMedia>): AniListMedia {
  const id = over.id ?? Math.floor(Math.random() * 100000);
  return {
    id,
    siteUrl: over.siteUrl ?? `https://example.com/anime/${id}`,
    title: over.title ?? { english: "Untitled" },
    description:
      over.description ??
      "وصف تجريبي مؤقت للعرض داخل Fanaara. هذا النص ثابت للتجربة بدون أي API.",
    genres: over.genres ?? ["Action", "Adventure"],
    bannerImage: over.bannerImage ?? null,
    coverImage:
      over.coverImage ?? {
        extraLarge: over.bannerImage ?? "https://images.unsplash.com/photo-1520975958225-1c0c5d6a8f9b?auto=format&fit=crop&w=1200&q=80",
        large: over.bannerImage ?? "https://images.unsplash.com/photo-1520975958225-1c0c5d6a8f9b?auto=format&fit=crop&w=800&q=80",
        color: "#3b82f6",
      },
    format: over.format ?? "TV",
    episodes: over.episodes ?? 12,
    season: over.season ?? "WINTER",
    seasonYear: over.seasonYear ?? new Date().getFullYear(),
    averageScore: over.averageScore ?? 82,
    popularity: over.popularity ?? 250_000,
    favourites: over.favourites ?? 45_000,
    isAdult: over.isAdult ?? false,
    studios: over.studios ?? { nodes: [{ name: "Fanaara Studio" }] },
    rankings:
      over.rankings ??
      [
        { rank: 12, type: "RATED", allTime: true },
        { rank: 35, type: "POPULAR", allTime: true },
      ],
    nextAiringEpisode: over.nextAiringEpisode ?? null,
    trailer: over.trailer ?? { site: "youtube", id: "dQw4w9WgXcQ" },
    tags: over.tags ?? [{ name: "Shounen" }, { name: "Hype" }],
  };
}

function buildStaticDataset() {
  const now = new Date();
  const { season, seasonYear } = getCurrentSeason(now);

  // صور ثابتة (مش APIs) — Unsplash ثابتة عبر روابط مباشرة
  const heroBanners = [
    "https://images.unsplash.com/photo-1541560052-3744e48ab80b?auto=format&fit=crop&w=2000&q=80",
    "https://images.unsplash.com/photo-1520975682038-6f1a932d7e84?auto=format&fit=crop&w=2000&q=80",
    "https://images.unsplash.com/photo-1520975958225-1c0c5d6a8f9b?auto=format&fit=crop&w=2000&q=80",
    "https://images.unsplash.com/photo-1520975746461-9e8e8e7b1a5a?auto=format&fit=crop&w=2000&q=80",
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=2000&q=80",
    "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?auto=format&fit=crop&w=2000&q=80",
    "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=2000&q=80",
  ];

  const titles = [
    "Crimson Eclipse",
    "Neon Ronin",
    "Skyward Arc",
    "Frostbound Saga",
    "Ashen Bloom",
    "Starlit Requiem",
    "Kitsune Protocol",
    "Iron Petals",
    "Phantom Tide",
    "Glass Horizon",
    "Azure Knights",
    "Moonlit Circuit",
    "Shogun Byte",
    "Zero Dawnline",
  ];

  const genresPool = [
    ["Action", "Adventure", "Fantasy"],
    ["Sci-Fi", "Action", "Drama"],
    ["Romance", "Slice of Life"],
    ["Mystery", "Psychological"],
    ["Comedy", "School"],
    ["Fantasy", "Isekai"],
    ["Sports", "Shounen"],
  ];

  const featured: AniListMedia[] = Array.from({ length: 7 }).map((_, i) => {
    const g = genresPool[i % genresPool.length];
    const eps = 12 + (i % 3) * 1;
    const score = 76 + i * 2;
    const pop = 120_000 + i * 55_000;

    return makeMediaBase({
      id: 1000 + i,
      title: { english: titles[i] },
      bannerImage: heroBanners[i],
      coverImage: {
        extraLarge: heroBanners[i],
        large: heroBanners[i],
        color: "#60a5fa",
      },
      genres: g,
      episodes: eps,
      season,
      seasonYear,
      averageScore: score,
      popularity: pop,
      favourites: 15_000 + i * 7_000,
      studios: { nodes: [{ name: i % 2 ? "Studio Kumo" : "Studio Hana" }] },
      nextAiringEpisode:
        i % 2 === 0
          ? {
              airingAt: Math.floor(Date.now() / 1000) + (i + 1) * 60 * 60 * 18,
              timeUntilAiring: (i + 1) * 60 * 60 * 18,
              episode: 3 + i,
            }
          : null,
      trailer: { site: "youtube", id: "dQw4w9WgXcQ" },
      tags: [{ name: "Hype" }, { name: i % 2 ? "Isekai" : "Shounen" }],
    });
  });

  const pool: AniListMedia[] = Array.from({ length: 14 }).map((_, i) => {
    const base = featured[i % featured.length];
    const g = genresPool[(i + 2) % genresPool.length];
    return makeMediaBase({
      id: 2000 + i,
      title: { english: titles[(i + 7) % titles.length] },
      bannerImage: base.bannerImage,
      coverImage: base.coverImage,
      genres: g,
      season,
      seasonYear,
      format: i % 5 === 0 ? "MOVIE" : "TV",
      episodes: i % 5 === 0 ? 1 : 12 + (i % 4),
      averageScore: 70 + (i % 10) * 2,
      popularity: 80_000 + i * 25_000,
      favourites: 8_000 + i * 2_000,
      studios: { nodes: [{ name: i % 3 ? "Studio Astra" : "Studio Nami" }] },
      rankings: [{ rank: 20 + i, type: i % 2 ? "POPULAR" : "RATED", allTime: true }],
      tags: [{ name: g.includes("Isekai") ? "Isekai" : "Classic" }],
    });
  });

  const lists = {
    trending: pool.slice(0, 14),
    topRated: [...pool].sort((a, b) => (b.averageScore ?? 0) - (a.averageScore ?? 0)).slice(0, 14),
    action: pool.filter((x) => (x.genres ?? []).includes("Action")).slice(0, 14),
    isekai: pool.filter((x) => (x.genres ?? []).includes("Isekai") || (x.tags ?? []).some((t) => t.name === "Isekai")).slice(0, 14),
    seasonal: [...pool].sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0)).slice(0, 14),
  };

  // schedule next 7 days
  const baseEpoch = Math.floor(Date.now() / 1000);
  const schedule: AiringScheduleItem[] = Array.from({ length: 18 }).map((_, i) => {
    const dayOffset = i % 7;
    const hour = 18 + (i % 4) * 2; // 18,20,22,24-ish
    const airingAt =
      Math.floor((Date.now() + dayOffset * 86400000) / 1000) +
      (hour - new Date().getHours()) * 3600;

    const media = lists.trending[i % lists.trending.length];
    const t = Math.max(3600, airingAt - baseEpoch);

    return {
      airingAt,
      timeUntilAiring: t,
      episode: 1 + (i % 12),
      media: {
        ...media,
        nextAiringEpisode: {
          airingAt,
          timeUntilAiring: t,
          episode: 1 + (i % 12),
        },
      },
    };
  });

  return { featured, lists, schedule, seasonInfo: { season, seasonYear } };
}

/* =========================================================
   Page
   ========================================================= */

export default function AnimeHomePage() {
  const reduceMotion = useReducedMotion();

  const [dir, setDir] = useState<Dir>("rtl");
  useEffect(() => setDir(getDocDir()), []);

  const data = useMemo(() => buildStaticDataset(), []);
  const seasonInfo = data.seasonInfo;

  const [activeTab, setActiveTab] = useState<HubTab>("latest");

  const [featured] = useState<AniListMedia[]>(data.featured);
  const [lists] = useState<{
    trending: AniListMedia[];
    topRated: AniListMedia[];
    action: AniListMedia[];
    isekai: AniListMedia[];
    seasonal: AniListMedia[];
  }>(data.lists);
  const [schedule] = useState<AiringScheduleItem[]>(data.schedule);

  // lightweight user state
  const [savedById, setSavedById] = useState<Record<number, boolean>>({});
  const [watchLaterById, setWatchLaterById] = useState<Record<number, boolean>>({});

  // toast
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
  const popToast = useCallback((msg: string) => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = window.setTimeout(() => setToast(null), 1100);
  }, []);

  // modals
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsMedia, setDetailsMedia] = useState<AniListMedia | null>(null);

  const [trailerOpen, setTrailerOpen] = useState(false);
  const [trailerMedia, setTrailerMedia] = useState<AniListMedia | null>(null);

  const [optionsOpen, setOptionsOpen] = useState(false);
  const [optionsMedia, setOptionsMedia] = useState<AniListMedia | null>(null);

  // hero slider state
  const [heroIndex, setHeroIndex] = useState(0);
  const heroCount = featured.length;
  const heroActive = featured[clamp(heroIndex, 0, Math.max(0, heroCount - 1))];

  // autoplay hero (respects reduced motion)
  const [heroPaused, setHeroPaused] = useState(false);
  useEffect(() => {
    if (reduceMotion) return;
    if (!heroCount) return;
    if (heroPaused) return;

    const t = window.setInterval(() => {
      setHeroIndex((i) => (i + 1) % heroCount);
    }, 8500);

    return () => window.clearInterval(t);
  }, [heroCount, heroPaused, reduceMotion]);

  const heroPrev = useCallback(() => {
    if (!heroCount) return;
    setHeroIndex((i) => (i - 1 + heroCount) % heroCount);
  }, [heroCount]);

  const heroNext = useCallback(() => {
    if (!heroCount) return;
    setHeroIndex((i) => (i + 1) % heroCount);
  }, [heroCount]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => (dir === "rtl" ? heroPrev() : heroNext()),
    onSwipedRight: () => (dir === "rtl" ? heroNext() : heroPrev()),
    trackMouse: false,
    preventScrollOnSwipe: true,
  });

  // options sheet actions
  const options = useMemo<OptionsSheetOption[]>(() => {
    if (!optionsMedia) return [];
    const id = optionsMedia.id;

    return [
      {
        id: "toggle_save",
        value: Boolean(savedById[id]),
        label: Boolean(savedById[id]) ? "إزالة من المحفوظات" : "حفظ",
      },
      {
        id: "toggle_watch_later",
        value: Boolean(watchLaterById[id]),
        label: Boolean(watchLaterById[id]) ? "إزالة من شاهد لاحقاً" : "شاهد لاحقاً",
      },
      { id: "share", label: "مشاركة" },
      {
        id: "copy_link",
        value: optionsMedia.siteUrl ?? "",
        label: "نسخ رابط",
      },
    ];
  }, [optionsMedia, savedById, watchLaterById]);

  const onOptionsAction = useCallback(
    async (actionId: any, nextValue?: boolean | string) => {
      if (!optionsMedia) return;
      const id = optionsMedia.id;

      if (actionId === "toggle_save") {
        setSavedById((s) => ({ ...s, [id]: Boolean(nextValue) }));
        popToast(Boolean(nextValue) ? "تم الحفظ" : "تمت الإزالة");
        return;
      }

      if (actionId === "toggle_watch_later") {
        setWatchLaterById((s) => ({ ...s, [id]: Boolean(nextValue) }));
        popToast(Boolean(nextValue) ? "أضيف إلى شاهد لاحقاً" : "أزيل من شاهد لاحقاً");
        return;
      }

      if (actionId === "share") {
        const url = optionsMedia.siteUrl ?? "";
        try {
          // @ts-ignore
          if (navigator?.share && url) {
            // @ts-ignore
            await navigator.share({ title: getTitle(optionsMedia), url });
            popToast("تمت المشاركة");
          } else {
            popToast("المشاركة غير مدعومة هنا");
          }
        } catch {
          popToast("تعذر المشاركة");
        }
        return;
      }

      if (actionId === "copy_link") {
        const url = String(nextValue ?? optionsMedia.siteUrl ?? "");
        const ok = await safeCopyToClipboard(url);
        popToast(ok ? "تم النسخ ✅" : "تعذر النسخ");
      }
    },
    [optionsMedia, popToast],
  );

  // schedule grouping
  const scheduleGroups = useMemo(() => {
    const items = [...schedule].sort((a, b) => a.airingAt - b.airingAt);
    const byDay = new Map<string, AiringScheduleItem[]>();

    for (const it of items) {
      const d = new Date(it.airingAt * 1000);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate(),
      ).padStart(2, "0")}`;
      const arr = byDay.get(key) ?? [];
      arr.push(it);
      byDay.set(key, arr);
    }

    return [...byDay.entries()].map(([key, dayItems]) => {
      const any = dayItems[0];
      const date = new Date(any.airingAt * 1000);

      const dayLabel = date.toLocaleDateString(undefined, { weekday: "long" });
      const dateLabel = date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

      return { key, dayLabel, dateLabel, items: dayItems };
    });
  }, [schedule]);

  return (
    <main dir={dir} className="min-h-[100svh] bg-background text-foreground">
      {/* page container */}
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* HERO */}
        <section className="relative">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div
              className={cn(
                "flex items-center gap-2",
                dir === "rtl" ? "flex-row-reverse text-right" : "flex-row text-left",
              )}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface px-3 py-1 text-xs font-semibold text-foreground-strong shadow-soft">
                <IoSparkles className="size-4 text-accent" />
                <span>الصفحة الرئيسية للأنمي</span>
              </div>

              <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-soft px-3 py-1 text-[11px] text-foreground-muted">
                <IoFlame className="size-4" />
                <span>بيانات ثابتة (Demo) بدون APIs</span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <Button
                iconOnly
                aria-label="خيارات"
                variant="soft"
                tone="neutral"
                size="md"
                leftIcon={null as any}
                onClick={() => {
                  if (!heroActive) return;
                  setOptionsMedia(heroActive);
                  setOptionsOpen(true);
                }}
              >
                <IoEllipsisHorizontal className="size-5" />
              </Button>
            </div>
          </div>

          <div
            className={cn(
              "relative overflow-hidden rounded-3xl border border-border-subtle bg-surface shadow-[var(--shadow-elevated)]",
              "isolate",
            )}
            onMouseEnter={() => setHeroPaused(true)}
            onMouseLeave={() => setHeroPaused(false)}
            {...swipeHandlers}
          >
            {/* HERO HEIGHT <= 70% */}
            <div className="relative h-[70svh] max-h-[760px] min-h-[520px]">
              {/* background slide */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={heroActive?.id ?? "hero-skeleton"}
                  className="absolute inset-0"
                  initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
                  animate={reduceMotion ? { opacity: 1 } : { opacity: 1 }}
                  exit={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                >
                  {heroActive ? (
                    <>
                      <img
                        src={
                          heroActive.bannerImage ||
                          heroActive.coverImage?.extraLarge ||
                          heroActive.coverImage?.large ||
                          ""
                        }
                        alt={getTitle(heroActive)}
                        className="h-full w-full object-cover"
                        loading="eager"
                      />
                      {/* overlay gradient (corner-to-corner) */}
                      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,0,0,0.62),rgba(0,0,0,0.25),rgba(0,0,0,0.65))]" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
                      {/* subtle aura */}
                      <div className="pointer-events-none absolute -inset-24 opacity-60 blur-3xl animate-aurora-lite">
                        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-extra-purple-soft/25 to-extra-pink-soft/25" />
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-surface-muted via-surface-soft to-surface" />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* content */}
              <div className="absolute inset-0 z-10 p-4 sm:p-6 lg:p-8">
                <div className={cn("flex h-full flex-col", dir === "rtl" ? "text-right" : "text-left")}>
                  {/* top row: nav + indicator */}
                  <div className={cn("flex items-center justify-between gap-3", dir === "rtl" ? "flex-row-reverse" : "flex-row")}>
                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white">
                        <IoSparkles className="size-4 text-[color:var(--brand-aqua)]" />
                        <span>عرض خاص</span>
                      </div>

                      {heroActive?.averageScore ? (
                        <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white">
                          <IoStar className="size-4 text-[color:var(--accent-yellow)]" />
                          <span>{(heroActive.averageScore / 10).toFixed(1)}</span>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="hidden sm:inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] text-white/90">
                        <span className="font-semibold">{heroCount ? heroIndex + 1 : 0}</span>
                        <span className="opacity-70">/</span>
                        <span>{heroCount || 7}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button iconOnly aria-label="السابق" variant="inverse" tone="neutral" size="sm" onClick={heroPrev}>
                          {dir === "rtl" ? <IoChevronForward className="size-5" /> : <IoChevronBack className="size-5" />}
                        </Button>
                        <Button iconOnly aria-label="التالي" variant="inverse" tone="neutral" size="sm" onClick={heroNext}>
                          {dir === "rtl" ? <IoChevronBack className="size-5" /> : <IoChevronForward className="size-5" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* main block */}
                  <div className="mt-4 lg:mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-8 flex-1 min-h-0">
                    {/* LEFT: text + actions */}
                    <motion.div
                      key={`hero-content-${heroActive?.id ?? "skeleton"}`}
                      className={cn("min-w-0 flex flex-col", "pb-24 lg:pb-0")}
                      initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                      animate={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                      <div className="space-y-3">
                        <h1 className="text-[22px] sm:text-[28px] lg:text-[34px] font-extrabold tracking-tight text-white drop-shadow">
                          {heroActive ? getTitle(heroActive) : "—"}
                        </h1>

                        {/* season + genres row */}
                        <div className={cn("flex flex-wrap items-center gap-2", dir === "rtl" ? "justify-end" : "justify-start")}>
                          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white">
                            {heroActive?.season && heroActive?.seasonYear
                              ? `${SEASON_AR[heroActive.season]} ${heroActive.seasonYear}`
                              : `${SEASON_AR[seasonInfo.season]} ${seasonInfo.seasonYear}`}
                          </span>

                          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] text-white/90">
                            {heroActive?.genres?.slice(0, 3).join(" • ") || "تصنيفات متنوعة"}
                          </span>
                        </div>

                        {/* direct details line */}
                        {heroActive ? (
                          <div className="text-[12px] sm:text-[13px] text-white/85">
                            {heroActive.season ? SEASON_AR[heroActive.season] : SEASON_AR[seasonInfo.season]}
                            {heroActive.seasonYear ? ` ${heroActive.seasonYear}` : ` ${seasonInfo.seasonYear}`}
                            {" • "}
                            {formatFormatShort(heroActive.format)}
                            {" • "}
                            {heroActive.episodes ? `${heroActive.episodes} حلقة` : "؟ حلقة"}
                            {" • "}
                            {heroActive.isAdult ? "+18" : "+13"}
                            {" • "}
                            {`الموسم ${guessSeasonNumberFromTitle(getTitle(heroActive))}`}
                          </div>
                        ) : (
                          <div className="h-4 w-64 rounded bg-white/10" />
                        )}

                        {/* warnings */}
                        <div className={cn("flex flex-wrap items-center gap-2", dir === "rtl" ? "justify-end" : "justify-start")}>
                          {(heroActive ? buildWarnings(heroActive) : [{ tone: "success", label: "آمن للمشاهدة" }]).map((w, idx) => (
                            <span
                              key={`${w.label}-${idx}`}
                              className={cn(
                                "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                                w.tone === "success" && "border-emerald-400/30 bg-emerald-400/15 text-emerald-50",
                                w.tone === "warning" && "border-amber-300/30 bg-amber-300/15 text-amber-50",
                                w.tone === "danger" && "border-rose-400/30 bg-rose-400/15 text-rose-50",
                              )}
                            >
                              <IoWarningOutline className="size-4" />
                              <span>{w.label}</span>
                            </span>
                          ))}
                        </div>

                        {/* short description */}
                        <p className="text-[13px] sm:text-[14px] text-white/85 leading-relaxed line-clamp-2 max-w-2xl">
                          {heroActive ? stripHtml(heroActive.description) || "لا يوجد وصف متاح حالياً." : "—"}
                        </p>
                      </div>

                      {/* info pills (buttons-looking) */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        <InfoPill
                          icon={<IoGridOutline className="size-4" />}
                          text={
                            heroActive?.studios?.nodes?.[0]?.name
                              ? `إنتاج: ${heroActive.studios.nodes[0].name}`
                              : "إنتاج: —"
                          }
                          variant="glass"
                        />
                        <InfoPill
                          icon={<IoEyeOutline className="size-4" />}
                          text={`مشاهدات: ${formatCompact(heroActive?.popularity)}`}
                          variant="glass"
                        />
                        <InfoPill
                          icon={<IoTrophyOutline className="size-4" />}
                          text={pickRank(heroActive) ? `الترتيب: #${pickRank(heroActive)}` : "الترتيب: —"}
                          variant="glass"
                          className="hidden sm:inline-flex"
                        />
                        <InfoPill
                          icon={<IoHeartOutline className="size-4" />}
                          text={`إعجابات: ${formatCompact(heroActive?.favourites)}`}
                          variant="glass"
                          className="hidden md:inline-flex"
                        />
                        <InfoPill
                          icon={<IoFlame className="size-4" />}
                          text={`الشعبية: ${formatCompact(heroActive?.popularity)}`}
                          variant="glass"
                          className="hidden md:inline-flex"
                        />
                      </div>

                      {/* actions row */}
                      <div className={cn("mt-auto pt-4 flex flex-wrap items-center gap-2", dir === "rtl" ? "justify-end" : "justify-start")}>
                        {heroActive?.trailer?.site?.toLowerCase() === "youtube" && heroActive.trailer.id ? (
                          <Button
                            variant="gradient"
                            tone="brand"
                            size="lg"
                            leftIcon={<IoPlay className="size-4" />}
                            onClick={() => {
                              setTrailerMedia(heroActive);
                              setTrailerOpen(true);
                            }}
                          >
                            شاهد الآن
                          </Button>
                        ) : (
                          <Button
                            variant="solid"
                            tone="brand"
                            size="lg"
                            leftIcon={<IoInformationCircleOutline className="size-4" />}
                            onClick={() => {
                              setDetailsMedia(heroActive);
                              setDetailsOpen(true);
                            }}
                          >
                            قراءة المزيد
                          </Button>
                        )}

                        <Button
                          iconOnly
                          aria-label="إضافة سريعة"
                          variant="soft"
                          tone="success"
                          size="lg"
                          onClick={() => {
                            const id = heroActive.id;
                            setSavedById((s) => ({ ...s, [id]: true }));
                            popToast("تمت الإضافة سريعاً ✅");
                          }}
                        >
                          <IoAdd className="size-6" />
                        </Button>

                        <Button
                          variant="soft"
                          tone="neutral"
                          size="lg"
                          leftIcon={<IoInformationCircleOutline className="size-4" />}
                          onClick={() => {
                            setDetailsMedia(heroActive);
                            setDetailsOpen(true);
                          }}
                        >
                          التفاصيل
                        </Button>

                        <Button
                          iconOnly
                          aria-label="خيارات"
                          variant="soft"
                          tone="neutral"
                          size="lg"
                          onClick={() => {
                            setOptionsMedia(heroActive);
                            setOptionsOpen(true);
                          }}
                        >
                          <IoEllipsisHorizontal className="size-6" />
                        </Button>
                      </div>

                      {/* Added by card */}
                      <div className="mt-4">
                        <AddedByCard
                          dir={dir}
                          user={USERS[(heroActive?.id ?? 0) % USERS.length]}
                          dateLabel={new Date().toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                        />
                      </div>

                      {/* Friends row */}
                      <div className="mt-3">
                        <FriendsRow dir={dir} users={USERS.slice(0, 5)} />
                      </div>
                    </motion.div>

                    {/* RIGHT: poster + next airing */}
                    <div className="hidden lg:flex items-end justify-end">
                      {heroActive ? (
                        <div className="w-full max-w-sm">
                          <div className="rounded-3xl border border-white/10 bg-white/10 p-3 shadow-[var(--shadow-2xl)] backdrop-blur-[10px]">
                            <div className="flex items-start gap-3">
                              <div className="relative aspect-[2/3] w-28 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                                <img
                                  src={heroActive.coverImage?.extraLarge || heroActive.coverImage?.large || ""}
                                  alt={getTitle(heroActive)}
                                  className="h-full w-full object-cover"
                                />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-extrabold text-white truncate">{getTitle(heroActive)}</div>

                                <div className="mt-1 text-xs text-white/75">
                                  {formatFormatShort(heroActive.format)}
                                  {" • "}
                                  {heroActive.episodes ? `${heroActive.episodes} حلقة` : "؟ حلقة"}
                                  {" • "}
                                  {heroActive.averageScore ? `⭐ ${(heroActive.averageScore / 10).toFixed(1)}` : "⭐ —"}
                                </div>

                                <div className="mt-3 flex flex-wrap gap-2">
                                  <MiniStat icon={<IoTrophyOutline className="size-4" />} label={pickRank(heroActive) ? `#${pickRank(heroActive)}` : "—"} />
                                  <MiniStat icon={<IoEyeOutline className="size-4" />} label={formatCompact(heroActive.popularity)} />
                                  <MiniStat icon={<IoHeartOutline className="size-4" />} label={formatCompact(heroActive.favourites)} />
                                </div>

                                {heroActive.nextAiringEpisode ? (
                                  <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-3">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-white">
                                      <IoTimeOutline className="size-4" />
                                      <span>
                                        الحلقة {heroActive.nextAiringEpisode.episode} خلال{" "}
                                        {secondsToHuman(heroActive.nextAiringEpisode.timeUntilAiring)}
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3 text-xs text-white/70">
                                    لا يوجد موعد عرض قريب.
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* mini slider strip (md + phone ONLY) */}
                  <div className="absolute inset-x-0 bottom-3 sm:bottom-4 lg:hidden px-3 sm:px-6">
                    <HeroMiniStrip dir={dir} items={featured} activeIndex={heroIndex} onPick={(i) => setHeroIndex(i)} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* simple note (no API) */}
          <div className="mt-3">
            <div className="rounded-2xl border border-border-subtle bg-surface-soft px-4 py-3 text-sm text-foreground-muted">
              هذه الصفحة تستخدم بيانات ثابتة مؤقتة (Demo) — بدون أي API.
            </div>
          </div>
        </section>

        {/* TABS */}
        <section className="mt-8">
          <div className="rounded-3xl border border-border-subtle bg-surface shadow-soft">
            <div className="p-3 sm:p-4">
              <div className={cn("flex flex-wrap items-center justify-between gap-3", dir === "rtl" ? "flex-row-reverse" : "flex-row")}>
                <div
                  className={cn(
                    "flex items-center gap-2 overflow-x-auto no-scrollbar",
                    "w-full sm:w-auto",
                    dir === "rtl" ? "flex-row-reverse" : "flex-row",
                  )}
                >
                  <HubTabButton active={activeTab === "latest"} label="آخر المضاف" icon={<IoSparkles className="size-4" />} onClick={() => setActiveTab("latest")} />
                  <HubTabButton active={activeTab === "genres"} label="التصنيفات" icon={<IoGridOutline className="size-4" />} onClick={() => setActiveTab("genres")} />
                  <HubTabButton active={activeTab === "season"} label="أنميات الموسم" icon={<IoFlame className="size-4" />} onClick={() => setActiveTab("season")} />
                  <HubTabButton active={activeTab === "schedule"} label="جدول العرض" icon={<IoCalendarOutline className="size-4" />} onClick={() => setActiveTab("schedule")} />
                </div>

                <div className="hidden sm:flex items-center gap-2 text-xs text-foreground-muted">
                  <IoCheckmarkCircleOutline className="size-4 text-accent" />
                  <span>التبويب يغير القوائم أسفل هذا القسم</span>
                </div>
              </div>
            </div>
          </div>

          {/* CONTENT based on tab */}
          <div className="mt-6 space-y-10">
            <AnimatePresence mode="wait">
              {activeTab === "latest" && (
                <motion.div
                  key="tab-latest"
                  initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                  animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="space-y-10"
                >
                  <AnimeCarousel
                    dir={dir}
                    title="الأكثر رواجاً الآن"
                    note="Demo Trending"
                    items={lists.trending}
                    onOpenDetails={(m) => {
                      setDetailsMedia(m);
                      setDetailsOpen(true);
                    }}
                    onOpenOptions={(m) => {
                      setOptionsMedia(m);
                      setOptionsOpen(true);
                    }}
                    onQuickSave={(m) => {
                      setSavedById((s) => ({ ...s, [m.id]: true }));
                      popToast("تم الحفظ ✅");
                    }}
                    moreHref="/anime/trending"
                  />

                  <AnimeCarousel
                    dir={dir}
                    title="الأعلى تقييماً"
                    note="Demo Top Rated"
                    items={lists.topRated}
                    onOpenDetails={(m) => {
                      setDetailsMedia(m);
                      setDetailsOpen(true);
                    }}
                    onOpenOptions={(m) => {
                      setOptionsMedia(m);
                      setOptionsOpen(true);
                    }}
                    onQuickSave={(m) => {
                      setSavedById((s) => ({ ...s, [m.id]: true }));
                      popToast("تم الحفظ ✅");
                    }}
                    moreHref="/anime/top-rated"
                  />
                </motion.div>
              )}

              {activeTab === "genres" && (
                <motion.div
                  key="tab-genres"
                  initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                  animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="space-y-10"
                >
                  <AnimeCarousel
                    dir={dir}
                    title="أكشن"
                    note="Demo Action"
                    items={lists.action}
                    onOpenDetails={(m) => {
                      setDetailsMedia(m);
                      setDetailsOpen(true);
                    }}
                    onOpenOptions={(m) => {
                      setOptionsMedia(m);
                      setOptionsOpen(true);
                    }}
                    onQuickSave={(m) => {
                      setSavedById((s) => ({ ...s, [m.id]: true }));
                      popToast("تم الحفظ ✅");
                    }}
                    moreHref="/anime/genre/action"
                  />

                  <AnimeCarousel
                    dir={dir}
                    title="إيسكاي"
                    note="Demo Isekai"
                    items={lists.isekai}
                    onOpenDetails={(m) => {
                      setDetailsMedia(m);
                      setDetailsOpen(true);
                    }}
                    onOpenOptions={(m) => {
                      setOptionsMedia(m);
                      setOptionsOpen(true);
                    }}
                    onQuickSave={(m) => {
                      setSavedById((s) => ({ ...s, [m.id]: true }));
                      popToast("تم الحفظ ✅");
                    }}
                    moreHref="/anime/tag/isekai"
                  />
                </motion.div>
              )}

              {activeTab === "season" && (
                <motion.div
                  key="tab-season"
                  initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                  animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="space-y-6"
                >
                  <div className="rounded-3xl border border-border-subtle bg-surface shadow-soft p-4 sm:p-5">
                    <div className={cn("flex items-start justify-between gap-3", dir === "rtl" ? "flex-row-reverse text-right" : "flex-row text-left")}>
                      <div className="min-w-0">
                        <div className="text-base sm:text-lg font-extrabold text-foreground-strong">أنميات الموسم الحالي</div>
                        <div className="mt-1 text-xs text-foreground-muted">
                          {SEASON_AR[seasonInfo.season]} {seasonInfo.seasonYear} • Demo
                        </div>
                      </div>

                      <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-soft px-3 py-1 text-xs font-semibold">
                        <IoFlame className="size-4 text-accent" />
                        <span>Season Hub</span>
                      </div>
                    </div>
                  </div>

                  <AnimeCarousel
                    dir={dir}
                    title="قائمة الموسم"
                    note="Demo Seasonal"
                    items={lists.seasonal}
                    onOpenDetails={(m) => {
                      setDetailsMedia(m);
                      setDetailsOpen(true);
                    }}
                    onOpenOptions={(m) => {
                      setOptionsMedia(m);
                      setOptionsOpen(true);
                    }}
                    onQuickSave={(m) => {
                      setSavedById((s) => ({ ...s, [m.id]: true }));
                      popToast("تم الحفظ ✅");
                    }}
                    moreHref="/anime/season"
                  />
                </motion.div>
              )}

              {activeTab === "schedule" && (
                <motion.div
                  key="tab-schedule"
                  initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                  animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="space-y-6"
                >
                  <div className="rounded-3xl border border-border-subtle bg-surface shadow-soft p-4 sm:p-5">
                    <div className={cn("flex items-start justify-between gap-3", dir === "rtl" ? "flex-row-reverse text-right" : "flex-row text-left")}>
                      <div className="min-w-0">
                        <div className="text-base sm:text-lg font-extrabold text-foreground-strong">جدول نزول الأعمال (7 أيام)</div>
                        <div className="mt-1 text-xs text-foreground-muted">مواعيد تجريبية ثابتة • Demo</div>
                      </div>

                      <Link href="/anime/schedule" className="shrink-0">
                        <Button variant="soft" tone="brand" size="md" rightIcon={<IoChevronBack className="size-4" />}>
                          رؤية المزيد
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {scheduleGroups.map((g) => (
                      <div key={g.key} className="rounded-3xl border border-border-subtle bg-surface shadow-soft p-4">
                        <div className={cn("flex items-center justify-between gap-2", dir === "rtl" ? "flex-row-reverse text-right" : "flex-row text-left")}>
                          <div className="min-w-0">
                            <div className="text-sm font-extrabold text-foreground-strong truncate">{g.dayLabel}</div>
                            <div className="text-xs text-foreground-muted">{g.dateLabel}</div>
                          </div>

                          <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-soft px-3 py-1 text-[11px]">
                            <IoTimeOutline className="size-4" />
                            <span>{g.items.length} حلقات</span>
                          </div>
                        </div>

                        <div className="mt-3 space-y-2">
                          {g.items.slice(0, 6).map((it) => (
                            <ScheduleRow
                              key={`${it.media.id}-${it.episode}-${it.airingAt}`}
                              dir={dir}
                              item={it}
                              onOpenDetails={() => {
                                setDetailsMedia(it.media);
                                setDetailsOpen(true);
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </div>

      {/* DETAILS MODAL */}
      <DeModal
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        title={detailsMedia ? getTitle(detailsMedia) : "تفاصيل"}
        subtitle="مصدر البيانات: Static Demo"
        mode={{ desktop: "center", mobile: "sheet" }}
        maxWidthClass="max-w-2xl"
        panelClassName="bg-background-elevated"
      >
        {detailsMedia ? (
          <div className="space-y-4">
            <div className={cn("flex items-start gap-4", dir === "rtl" ? "flex-row-reverse text-right" : "flex-row text-left")}>
              <div className="relative aspect-[2/3] w-28 overflow-hidden rounded-2xl border border-border-subtle bg-surface-soft">
                <img
                  src={detailsMedia.coverImage?.extraLarge || detailsMedia.coverImage?.large || ""}
                  alt={getTitle(detailsMedia)}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-foreground-strong">{getTitle(detailsMedia)}</div>

                <div className="mt-1 text-xs text-foreground-muted">
                  {detailsMedia.season && detailsMedia.seasonYear ? `${SEASON_AR[detailsMedia.season]} ${detailsMedia.seasonYear}` : "—"}
                  {" • "}
                  {formatFormatShort(detailsMedia.format)}
                  {" • "}
                  {detailsMedia.episodes ? `${detailsMedia.episodes} حلقة` : "؟ حلقة"}
                  {" • "}
                  {detailsMedia.averageScore ? `⭐ ${(detailsMedia.averageScore / 10).toFixed(1)}` : "⭐ —"}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <InfoPill icon={<IoTrophyOutline className="size-4" />} text={pickRank(detailsMedia) ? `الترتيب: #${pickRank(detailsMedia)}` : "الترتيب: —"} />
                  <InfoPill icon={<IoEyeOutline className="size-4" />} text={`مشاهدات: ${formatCompact(detailsMedia.popularity)}`} />
                  <InfoPill icon={<IoHeartOutline className="size-4" />} text={`إعجابات: ${formatCompact(detailsMedia.favourites)}`} />
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {(detailsMedia.genres ?? []).slice(0, 6).map((g) => (
                    <span
                      key={g}
                      className="inline-flex items-center rounded-full border border-border-subtle bg-surface-soft px-3 py-1 text-[11px] font-semibold text-foreground"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border-subtle bg-surface p-4">
              <div className="text-sm font-bold text-foreground-strong mb-2">الوصف</div>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {stripHtml(detailsMedia.description) || "لا يوجد وصف متاح."}
              </p>
            </div>

            <div className={cn("flex flex-wrap items-center gap-2", dir === "rtl" ? "justify-end" : "justify-start")}>
              <Link href={`/anime/${detailsMedia.id}`} className="shrink-0">
                <Button variant="solid" tone="brand" size="lg">
                  فتح صفحة الأنمي داخل المنصة
                </Button>
              </Link>

              {detailsMedia.siteUrl ? (
                <a href={detailsMedia.siteUrl} target="_blank" rel="noreferrer" className="shrink-0">
                  <Button variant="soft" tone="neutral" size="lg">
                    فتح الرابط الخارجي
                  </Button>
                </a>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="p-4 text-sm text-foreground-muted">لا يوجد محتوى.</div>
        )}
      </DeModal>

      {/* TRAILER MODAL */}
      <DeModal
        open={trailerOpen}
        onOpenChange={setTrailerOpen}
        title={trailerMedia ? `Trailer • ${getTitle(trailerMedia)}` : "Trailer"}
        mode={{ desktop: "center", mobile: "sheet" }}
        maxWidthClass="max-w-3xl"
        panelClassName="bg-background-elevated"
      >
        {trailerMedia?.trailer?.site?.toLowerCase() === "youtube" && trailerMedia.trailer.id ? (
          <div className="space-y-3">
            <div className="rounded-2xl border border-border-subtle bg-surface overflow-hidden">
              <div className="relative aspect-video w-full">
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src={`https://www.youtube.com/embed/${trailerMedia.trailer.id}`}
                  title="YouTube trailer"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>

            <div className={cn("flex items-center justify-between gap-2", dir === "rtl" ? "flex-row-reverse text-right" : "flex-row text-left")}>
              <div className="text-xs text-foreground-muted">إذا لم يظهر الفيديو، افتحه من YouTube مباشرة.</div>

              <a href={`https://www.youtube.com/watch?v=${trailerMedia.trailer.id}`} target="_blank" rel="noreferrer">
                <Button variant="soft" tone="brand" size="md">
                  فتح على YouTube
                </Button>
              </a>
            </div>
          </div>
        ) : (
          <div className="p-4 text-sm text-foreground-muted">لا يوجد Trailer متاح.</div>
        )}
      </DeModal>

      {/* OPTIONS SHEET */}
      <OptionsSheet open={optionsOpen} onOpenChange={setOptionsOpen} dir={dir} options={options} onAction={onOptionsAction} />

      {/* TOAST */}
      <div
        className={cn(
          "pointer-events-none fixed inset-x-0 bottom-6 z-[9999] flex justify-center",
          toast ? "opacity-100" : "opacity-0",
          "transition-opacity duration-150",
        )}
      >
        <div className="rounded-full border border-border-subtle bg-background-elevated/95 px-4 py-2 text-xs font-bold text-foreground-strong shadow-[var(--shadow-elevated)]">
          {toast ?? ""}
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   Components (all in same file)
   ========================================================= */

function HubTabButton({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold transition",
        active
          ? "border-accent-border bg-accent-soft text-foreground-strong shadow-soft"
          : "border-border-subtle bg-surface-soft text-foreground-muted hover:bg-surface-muted",
      )}
    >
      <span className="text-[color:var(--brand-aqua)]">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function InfoPill({
  icon,
  text,
  variant = "soft",
  className,
}: {
  icon: React.ReactNode;
  text: string;
  variant?: "soft" | "glass";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold",
        variant === "glass"
          ? "border-white/10 bg-white/10 text-white"
          : "border-border-subtle bg-surface-soft text-foreground-muted",
        className,
      )}
    >
      <span className="opacity-95">{icon}</span>
      <span className="truncate">{text}</span>
    </span>
  );
}

function MiniStat({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white">
      {icon}
      <span className="tabular-nums">{label}</span>
    </span>
  );
}

function AddedByCard({ dir, user, dateLabel }: { dir: Dir; user: MiniUser; dateLabel: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-[10px]">
      <div className={cn("flex items-center justify-between gap-3", dir === "rtl" ? "flex-row-reverse text-right" : "flex-row text-left")}>
        <div className="flex items-center gap-2">
          <Avatar src={user.avatar} size="9" rounded name={user.name} className="ring-2 ring-white/10" />
          <div className="min-w-0">
            <div className="text-[12px] font-extrabold text-white truncate">تمت الإضافة بواسطة {user.name}</div>
            <div className="text-[11px] text-white/70">
              {user.handle} • {dateLabel}
            </div>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-semibold text-white">
          <IoCheckmarkCircleOutline className="size-4 text-emerald-300" />
          تم التوثيق
        </span>
      </div>
    </div>
  );
}

function FriendsRow({ dir, users }: { dir: Dir; users: MiniUser[] }) {
  return (
    <div className={cn("flex items-center justify-between gap-3", dir === "rtl" ? "flex-row-reverse text-right" : "flex-row text-left")}>
      <div className="flex items-center">
        <div className={cn("flex", dir === "rtl" ? "flex-row-reverse" : "flex-row")}>
          {users.slice(0, 5).map((u, i) => (
            <div key={u.id} className={cn("relative", dir === "rtl" ? (i ? "-me-2" : "") : i ? "-ms-2" : "")}>
              <Avatar src={u.avatar} size="8" rounded name={u.name} className="ring-2 ring-black/20" />
            </div>
          ))}
        </div>

        <div className={cn("ms-3 text-[11px] text-white/85", dir === "rtl" && "ms-0 me-3")}>
          هذا العمل أعجب أشخاص تتابعهم وتابعوه.
        </div>
      </div>

      <span className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white">
        <FaPeopleGroup className="size-4" />
        <span>Friends</span>
      </span>
    </div>
  );
}

function HeroMiniStrip({
  dir,
  items,
  activeIndex,
  onPick,
}: {
  dir: Dir;
  items: AniListMedia[];
  activeIndex: number;
  onPick: (idx: number) => void;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    dragFree: true,
    containScroll: "trimSnaps",
    align: "start",
    direction: dir,
  });

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.scrollTo(activeIndex);
  }, [emblaApi, activeIndex]);

  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 backdrop-blur-[10px] p-2 shadow-[var(--shadow-lg)]">
      <div className={cn("flex items-center justify-between gap-2 mb-2 px-1", dir === "rtl" ? "flex-row-reverse text-right" : "flex-row text-left")}>
        <div className="text-[11px] font-extrabold text-white">أعمال مختارة</div>
        <div className="text-[10px] text-white/70">اسحب للتنقل • اضغط للاختيار</div>
      </div>

      <div ref={emblaRef} className="overflow-hidden" dir={dir}>
        <div className="flex gap-2">
          {items.map((m, idx) => {
            const active = idx === activeIndex;
            const thumb = m.coverImage?.large || m.coverImage?.extraLarge || m.bannerImage || "";

            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onPick(idx)}
                className={cn(
                  "shrink-0 rounded-xl overflow-hidden border transition",
                  "w-[78px] sm:w-[86px] aspect-[2/3]",
                  active ? "border-[color:var(--brand-aqua)] shadow-[var(--shadow-glow-brand)]" : "border-white/10 opacity-90 hover:opacity-100",
                )}
                aria-label={`Pick ${getTitle(m)}`}
              >
                <img src={thumb} alt={getTitle(m)} className="h-full w-full object-cover" loading="lazy" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AnimeCarousel({
  dir,
  title,
  note,
  items,
  onOpenDetails,
  onOpenOptions,
  onQuickSave,
  moreHref,
}: {
  dir: Dir;
  title: string;
  note?: string;
  items: AniListMedia[];
  onOpenDetails: (m: AniListMedia) => void;
  onOpenOptions: (m: AniListMedia) => void;
  onQuickSave: (m: AniListMedia) => void;
  moreHref?: string;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    dragFree: true,
    containScroll: "trimSnaps",
    align: "start",
    direction: dir,
  });

  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateArrows = useCallback(() => {
    if (!emblaApi) return;
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    updateArrows();
    emblaApi.on("select", updateArrows);
    emblaApi.on("reInit", updateArrows);
    return () => {
      try {
        emblaApi.off("select", updateArrows);
        emblaApi.off("reInit", updateArrows);
      } catch {}
    };
  }, [emblaApi, updateArrows]);

  return (
    <section className="space-y-3">
      <div className={cn("flex flex-wrap items-end justify-between gap-3", dir === "rtl" ? "flex-row-reverse text-right" : "flex-row text-left")}>
        <div className="flex items-center gap-1">
          <Button iconOnly aria-label="Prev" variant="soft" tone="neutral" size="md" disabled={!canPrev} onClick={() => emblaApi?.scrollPrev()}>
            {dir === "rtl" ? <IoChevronForward className="size-5" /> : <IoChevronBack className="size-5" />}
          </Button>
          <Button iconOnly aria-label="Next" variant="soft" tone="neutral" size="md" disabled={!canNext} onClick={() => emblaApi?.scrollNext()}>
            {dir === "rtl" ? <IoChevronBack className="size-5" /> : <IoChevronForward className="size-5" />}
          </Button>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="min-w-0 text-sm sm:text-base font-extrabold text-foreground-strong truncate">{title}</div>
            {note ? <div className="hidden sm:block min-w-0 text-xs text-foreground-muted truncate">{note}</div> : null}
          </div>
        </div>

        {moreHref ? (
          <Link href={moreHref} className="shrink-0">
            <Button variant="soft" tone="brand" size="md">
              رؤية المزيد
            </Button>
          </Link>
        ) : null}
      </div>

      <div className="rounded-3xl border border-border-subtle bg-surface shadow-soft p-3 sm:p-4">
        <div ref={emblaRef} className="overflow-hidden" dir={dir}>
          <div className="flex gap-3">
            {items.length ? (
              items.map((m) => (
                <div key={m.id} className="shrink-0 basis-[160px] sm:basis-[180px] md:basis-[200px]">
                  <AnimeCard dir={dir} media={m} onOpenDetails={() => onOpenDetails(m)} onOpenOptions={() => onOpenOptions(m)} onQuickSave={() => onQuickSave(m)} />
                </div>
              ))
            ) : (
              <div className="w-full py-10 text-center text-sm text-foreground-muted">لا توجد عناصر حالياً.</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function AnimeCard({
  dir,
  media,
  onOpenDetails,
  onOpenOptions,
  onQuickSave,
}: {
  dir: Dir;
  media: AniListMedia;
  onOpenDetails: () => void;
  onOpenOptions: () => void;
  onQuickSave: () => void;
}) {
  const title = getTitle(media);
  const img = media.coverImage?.extraLarge || media.coverImage?.large || "";
  const rank = pickRank(media);

  return (
    <div className="group relative">
      <div className="rounded-2xl border border-border-subtle bg-background-elevated overflow-hidden shadow-soft">
        <button type="button" onClick={onOpenDetails} className="relative block w-full text-left">
          <div className="relative aspect-[2/3] w-full overflow-hidden">
            <img
              src={img}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

            <div className={cn("absolute top-2 inset-x-2 flex items-center justify-between gap-2", dir === "rtl" ? "flex-row-reverse" : "flex-row")}>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-2 py-1 text-[10px] font-bold text-white">
                <IoStar className="size-3 text-[color:var(--accent-yellow)]" />
                {media.averageScore ? (media.averageScore / 10).toFixed(1) : "—"}
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickSave();
                  }}
                  className="grid size-8 place-items-center rounded-full border border-white/10 bg-black/25 text-white transition hover:bg-black/35"
                  aria-label="Quick add"
                >
                  <IoAdd className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenOptions();
                  }}
                  className="grid size-8 place-items-center rounded-full border border-white/10 bg-black/25 text-white transition hover:bg-black/35"
                  aria-label="Options"
                >
                  <IoEllipsisHorizontal className="size-4" />
                </button>
              </div>
            </div>

            <div className="absolute bottom-2 inset-x-3">
              <div className="text-[12px] font-extrabold text-white line-clamp-2">{title}</div>
              <div className="mt-1 text-[10px] text-white/80">
                {media.seasonYear ?? "—"} • {formatFormatShort(media.format)} {media.episodes ? `• ${media.episodes} ep` : ""}
              </div>
            </div>
          </div>
        </button>

        <div className="p-3">
          <div className={cn("flex items-center justify-between gap-2", dir === "rtl" ? "flex-row-reverse text-right" : "flex-row text-left")}>
            <StatChip icon={<IoTrophyOutline className="size-4" />} label={rank ? `#${rank}` : "—"} />
            <StatChip icon={<IoEyeOutline className="size-4" />} label={formatCompact(media.popularity)} />
            <StatChip icon={<IoFlame className="size-4" />} label={formatCompact(media.favourites)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border-subtle bg-surface-soft px-2.5 py-1 text-[11px] font-bold text-foreground-strong">
      <span className="text-foreground-muted">{icon}</span>
      <span className="tabular-nums">{label}</span>
    </span>
  );
}

function ScheduleRow({ dir, item, onOpenDetails }: { dir: Dir; item: AiringScheduleItem; onOpenDetails: () => void }) {
  const title = getTitle(item.media);
  const img = item.media.coverImage?.large || item.media.coverImage?.extraLarge || "";

  const d = new Date(item.airingAt * 1000);
  const time = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

  return (
    <button
      type="button"
      onClick={onOpenDetails}
      className={cn("w-full rounded-2xl border border-border-subtle bg-surface-soft/60 p-2", "hover:bg-surface-soft/85 transition")}
    >
      <div className={cn("flex items-center gap-3", dir === "rtl" ? "flex-row-reverse text-right" : "flex-row text-left")}>
        <div className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-border-subtle bg-surface">
          <img src={img} alt={title} className="h-full w-full object-cover" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-[12px] font-extrabold text-foreground-strong truncate">{title}</div>
          <div className="mt-0.5 text-[11px] text-foreground-muted">
            الحلقة {item.episode} • {time} • خلال {secondsToHuman(item.timeUntilAiring)}
          </div>
        </div>

        <span className="shrink-0 inline-flex items-center gap-2 rounded-full border border-border-subtle bg-background-elevated px-3 py-1 text-[11px] font-bold text-foreground-strong">
          <IoTimeOutline className="size-4 text-foreground-muted" />
          <span>تنبيه</span>
        </span>
      </div>
    </button>
  );
}
