// app/(logged)/ranks/_components/RanksClient.tsx
"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  IoBookOutline,
  IoBookmarkOutline,
  IoChatbubbleEllipsesOutline,
  IoEllipsisHorizontal,
  IoFilter,
  IoHeartOutline,
  IoPeopleOutline,
  IoPlayCircleOutline,
  IoShareSocialOutline,
  IoStar,
  IoTimeOutline,
  IoTrendingDown,
  IoTrendingUp,
  IoRemove,
  IoAlertCircleOutline,
  IoRefreshOutline,
} from "react-icons/io5";

import { Button as DeButton } from "@/design/DeButton";
import {
  RanksListSkeleton,
  RanksTop3Skeleton,
} from "./_components/RanksListSkeleton";

/* -------------------------------------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------------------------------------- */

type Dir = "rtl" | "ltr";

type RankKind = "anime" | "manga" | "character" | "studio" | "episode" | "user";

type TimeRangeId = "24h" | "week" | "month" | "all";
type SortId = "top" | "worst" | "rising" | "falling";

type MetricId =
  | "score"
  | "hype"
  | "saves"
  | "discussed"
  | "favorites"
  | "followers"
  | "output"
  | "reactions"
  | "senko"
  | "ashbiya";

type FilterValue = "all" | string;

type RankItemBase = {
  id: string;
  kind: RankKind;
  href: string;
  title: string;
  titleEn: string;
  image: string; // data URI (safe mock)
  tags: string[];
  metricValue: number; // value for currently-selected metric
  metricLabel: { ar: string; en: string };
  trend: number; // -N..+N (position movement proxy)
  // computed
  rank: number;
  prevRank: number;
};

type AnimeItem = RankItemBase & {
  kind: "anime";
  format: "TV" | "Movie" | "ONA" | "Special";
  status: "Airing" | "Finished";
  episodes: number;
  studio: string;
};

type MangaItem = RankItemBase & {
  kind: "manga";
  format: "Manga" | "Manhwa" | "Novel" | "One-shot";
  status: "Publishing" | "Finished";
  volumes: number;
  magazine: string;
};

type CharacterItem = RankItemBase & {
  kind: "character";
  role: "Hero" | "Villain" | "Support";
  origin: string;
};

type StudioItem = RankItemBase & {
  kind: "studio";
  region: "JP" | "KR" | "US";
  knownFor: string;
};

type EpisodeItem = RankItemBase & {
  kind: "episode";
  seriesTitle: string;
  number: number;
  type: "Episode" | "Chapter";
};

type UserItem = RankItemBase & {
  kind: "user";
  handle: string;
  level: number;
  badge: "Creator" | "Fan" | "Moderator";
};

type RankItem =
  | AnimeItem
  | MangaItem
  | CharacterItem
  | StudioItem
  | EpisodeItem
  | UserItem;

type TabConfig = {
  id: RankKind;
  label: { ar: string; en: string };
  icon: React.ComponentType<{ className?: string }>;
  defaultMetric: MetricId;
  metrics: Array<{
    id: MetricId;
    label: { ar: string; en: string };
    icon: React.ComponentType<{ className?: string }>;
    format?: "score" | "compact";
  }>;
  filters: Array<{
    id: "filterA" | "filterB";
    label: { ar: string; en: string };
    options: Array<{ id: FilterValue; label: { ar: string; en: string } }>;
    defaultValue: FilterValue;
  }>;
};

/* -------------------------------------------------------------------------------------------------
 * Small Utils (no extra deps)
 * ------------------------------------------------------------------------------------------------- */

function cx(...v: Array<string | false | null | undefined>) {
  return v.filter(Boolean).join(" ");
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

// Deterministic hashing for stable mock
function hashStringToInt(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Mulberry32 PRNG
function mulberry32(seed: number) {
  return function rand() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function svgToDataUri(svg: string) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function pick<T>(r: () => number, arr: T[]) {
  return arr[Math.floor(r() * arr.length)]!;
}

function compactNumber(n: number, dir: Dir) {
  try {
    const locale = dir === "rtl" ? "ar" : "en";
    return new Intl.NumberFormat(locale, {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(n);
  } catch {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
    return String(n);
  }
}

function formatMetricValue(
  v: number,
  fmt: "score" | "compact" | undefined,
  dir: Dir,
) {
  if (fmt === "score") return v.toFixed(2);
  return compactNumber(Math.round(v), dir);
}

function useDocumentDir(): Dir {
  const [dir, setDir] = useState<Dir>("rtl");

  useEffect(() => {
    const el = document.documentElement;

    const read = () => {
      const d = (el.getAttribute("dir") || "ltr").toLowerCase();
      setDir(d === "rtl" ? "rtl" : "ltr");
    };

    read();

    const obs = new MutationObserver(() => read());
    obs.observe(el, { attributes: true, attributeFilter: ["dir"] });

    return () => obs.disconnect();
  }, []);

  return dir;
}

/* -------------------------------------------------------------------------------------------------
 * Config (Tabs, Metrics, Filters, Time, Sort)
 * ------------------------------------------------------------------------------------------------- */

const TIME_RANGES: Array<{
  id: TimeRangeId;
  label: { ar: string; en: string };
}> = [
  { id: "24h", label: { ar: "آخر 24 ساعة", en: "Last 24h" } },
  { id: "week", label: { ar: "هذا الأسبوع", en: "This week" } },
  { id: "month", label: { ar: "هذا الشهر", en: "This month" } },
  { id: "all", label: { ar: "كل الوقت", en: "All time" } },
];

const SORTS: Array<{
  id: SortId;
  label: { ar: string; en: string };
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "top", label: { ar: "الأعلى", en: "Top" }, icon: IoTrendingUp },
  { id: "worst", label: { ar: "الأسوأ", en: "Worst" }, icon: IoTrendingDown },
  {
    id: "rising",
    label: { ar: "الأكثر صعودًا", en: "Rising" },
    icon: IoTrendingUp,
  },
  {
    id: "falling",
    label: { ar: "الأكثر هبوطًا", en: "Falling" },
    icon: IoTrendingDown,
  },
];

const TABS: TabConfig[] = [
  {
    id: "anime",
    label: { ar: "أنمي", en: "Anime" },
    icon: IoPlayCircleOutline,
    defaultMetric: "score",
    metrics: [
      {
        id: "score",
        label: { ar: "التقييم", en: "Score" },
        icon: IoStar,
        format: "score",
      },
      {
        id: "hype",
        label: { ar: "الزخم", en: "Hype" },
        icon: IoTrendingUp,
        format: "compact",
      },
      {
        id: "saves",
        label: { ar: "الحفظ", en: "Saves" },
        icon: IoBookmarkOutline,
        format: "compact",
      },
      {
        id: "discussed",
        label: { ar: "النقاش", en: "Discussed" },
        icon: IoChatbubbleEllipsesOutline,
        format: "compact",
      },
    ],
    filters: [
      {
        id: "filterA",
        label: { ar: "النوع", en: "Format" },
        defaultValue: "all",
        options: [
          { id: "all", label: { ar: "الكل", en: "All" } },
          { id: "TV", label: { ar: "TV", en: "TV" } },
          { id: "Movie", label: { ar: "فيلم", en: "Movie" } },
          { id: "ONA", label: { ar: "ONA", en: "ONA" } },
          { id: "Special", label: { ar: "Special", en: "Special" } },
        ],
      },
      {
        id: "filterB",
        label: { ar: "الحالة", en: "Status" },
        defaultValue: "all",
        options: [
          { id: "all", label: { ar: "الكل", en: "All" } },
          { id: "Airing", label: { ar: "يعرض الآن", en: "Airing" } },
          { id: "Finished", label: { ar: "مكتمل", en: "Finished" } },
        ],
      },
    ],
  },
  {
    id: "manga",
    label: { ar: "قصص مصورة", en: "Comics" },
    icon: IoBookOutline,
    defaultMetric: "score",
    metrics: [
      {
        id: "score",
        label: { ar: "التقييم", en: "Score" },
        icon: IoStar,
        format: "score",
      },
      {
        id: "saves",
        label: { ar: "الحفظ", en: "Saves" },
        icon: IoBookmarkOutline,
        format: "compact",
      },
      {
        id: "discussed",
        label: { ar: "النقاش", en: "Discussed" },
        icon: IoChatbubbleEllipsesOutline,
        format: "compact",
      },
      {
        id: "hype",
        label: { ar: "الزخم", en: "Hype" },
        icon: IoTrendingUp,
        format: "compact",
      },
    ],
    filters: [
      {
        id: "filterA",
        label: { ar: "الصنف", en: "Type" },
        defaultValue: "all",
        options: [
          { id: "all", label: { ar: "الكل", en: "All" } },
          { id: "Manga", label: { ar: "Manga", en: "Manga" } },
          { id: "Manhwa", label: { ar: "Manhwa", en: "Manhwa" } },
          { id: "Novel", label: { ar: "Novel", en: "Novel" } },
          { id: "One-shot", label: { ar: "One-shot", en: "One-shot" } },
        ],
      },
      {
        id: "filterB",
        label: { ar: "الحالة", en: "Status" },
        defaultValue: "all",
        options: [
          { id: "all", label: { ar: "الكل", en: "All" } },
          { id: "Publishing", label: { ar: "ينشر الآن", en: "Publishing" } },
          { id: "Finished", label: { ar: "مكتمل", en: "Finished" } },
        ],
      },
    ],
  },
  {
    id: "character",
    label: { ar: "شخصيات", en: "Characters" },
    icon: IoPeopleOutline,
    defaultMetric: "favorites",
    metrics: [
      {
        id: "favorites",
        label: { ar: "المفضلة", en: "Favorites" },
        icon: IoHeartOutline,
        format: "compact",
      },
      {
        id: "hype",
        label: { ar: "الزخم", en: "Hype" },
        icon: IoTrendingUp,
        format: "compact",
      },
      {
        id: "discussed",
        label: { ar: "الذكر", en: "Mentions" },
        icon: IoChatbubbleEllipsesOutline,
        format: "compact",
      },
    ],
    filters: [
      {
        id: "filterA",
        label: { ar: "الدور", en: "Role" },
        defaultValue: "all",
        options: [
          { id: "all", label: { ar: "الكل", en: "All" } },
          { id: "Hero", label: { ar: "بطل", en: "Hero" } },
          { id: "Villain", label: { ar: "خصم", en: "Villain" } },
          { id: "Support", label: { ar: "مساعد", en: "Support" } },
        ],
      },
      {
        id: "filterB",
        label: { ar: "الأصل", en: "Origin" },
        defaultValue: "all",
        options: [
          { id: "all", label: { ar: "الكل", en: "All" } },
          { id: "Fanaara", label: { ar: "فاناارا", en: "Fanaara" } },
          { id: "Shonen", label: { ar: "شونين", en: "Shonen" } },
          { id: "Seinen", label: { ar: "سينين", en: "Seinen" } },
        ],
      },
    ],
  },
  {
    id: "studio",
    label: { ar: "استوديوهات", en: "Studios" },
    icon: IoShareSocialOutline,
    defaultMetric: "followers",
    metrics: [
      {
        id: "followers",
        label: { ar: "المتابعون", en: "Followers" },
        icon: IoPeopleOutline,
        format: "compact",
      },
      {
        id: "output",
        label: { ar: "الإنتاج", en: "Output" },
        icon: IoTrendingUp,
        format: "compact",
      },
      {
        id: "score",
        label: { ar: "متوسط التقييم", en: "Avg score" },
        icon: IoStar,
        format: "score",
      },
    ],
    filters: [
      {
        id: "filterA",
        label: { ar: "المنطقة", en: "Region" },
        defaultValue: "all",
        options: [
          { id: "all", label: { ar: "الكل", en: "All" } },
          { id: "JP", label: { ar: "JP", en: "JP" } },
          { id: "KR", label: { ar: "KR", en: "KR" } },
          { id: "US", label: { ar: "US", en: "US" } },
        ],
      },
      {
        id: "filterB",
        label: { ar: "أسلوب", en: "Style" },
        defaultValue: "all",
        options: [
          { id: "all", label: { ar: "الكل", en: "All" } },
          { id: "Action", label: { ar: "أكشن", en: "Action" } },
          { id: "Drama", label: { ar: "دراما", en: "Drama" } },
          { id: "Fantasy", label: { ar: "خيال", en: "Fantasy" } },
        ],
      },
    ],
  },
  {
    id: "episode",
    label: { ar: "حلقات/فصول", en: "Episodes/Ch." },
    icon: IoTimeOutline,
    defaultMetric: "reactions",
    metrics: [
      {
        id: "reactions",
        label: { ar: "التفاعل", en: "Reactions" },
        icon: IoHeartOutline,
        format: "compact",
      },
      {
        id: "discussed",
        label: { ar: "التعليقات", en: "Comments" },
        icon: IoChatbubbleEllipsesOutline,
        format: "compact",
      },
      {
        id: "hype",
        label: { ar: "الزخم", en: "Hype" },
        icon: IoTrendingUp,
        format: "compact",
      },
    ],
    filters: [
      {
        id: "filterA",
        label: { ar: "التصنيف", en: "Type" },
        defaultValue: "all",
        options: [
          { id: "all", label: { ar: "الكل", en: "All" } },
          { id: "Episode", label: { ar: "حلقة", en: "Episode" } },
          { id: "Chapter", label: { ar: "فصل", en: "Chapter" } },
        ],
      },
      {
        id: "filterB",
        label: { ar: "الموسم", en: "Season" },
        defaultValue: "all",
        options: [
          { id: "all", label: { ar: "الكل", en: "All" } },
          { id: "S1", label: { ar: "S1", en: "S1" } },
          { id: "S2", label: { ar: "S2", en: "S2" } },
          { id: "S3", label: { ar: "S3", en: "S3" } },
        ],
      },
    ],
  },
  {
    id: "user",
    label: { ar: "مستخدمون", en: "Users" },
    icon: IoPeopleOutline,
    defaultMetric: "senko",
    metrics: [
      {
        id: "senko",
        label: { ar: "سينكو", en: "Senko" },
        icon: IoStar,
        format: "compact",
      },
      {
        id: "ashbiya",
        label: { ar: "العشبية", en: "Ashbiya" },
        icon: IoTrendingUp,
        format: "compact",
      },
      {
        id: "followers",
        label: { ar: "المتابعون", en: "Followers" },
        icon: IoPeopleOutline,
        format: "compact",
      },
      {
        id: "discussed",
        label: { ar: "التفاعل", en: "Engagement" },
        icon: IoChatbubbleEllipsesOutline,
        format: "compact",
      },
    ],
    filters: [
      {
        id: "filterA",
        label: { ar: "النوع", en: "Type" },
        defaultValue: "all",
        options: [
          { id: "all", label: { ar: "الكل", en: "All" } },
          { id: "Creator", label: { ar: "صانع", en: "Creator" } },
          { id: "Fan", label: { ar: "متابع", en: "Fan" } },
          { id: "Moderator", label: { ar: "مشرف", en: "Moderator" } },
        ],
      },
      {
        id: "filterB",
        label: { ar: "المستوى", en: "Level" },
        defaultValue: "all",
        options: [
          { id: "all", label: { ar: "الكل", en: "All" } },
          { id: "1-20", label: { ar: "1-20", en: "1-20" } },
          { id: "21-50", label: { ar: "21-50", en: "21-50" } },
          { id: "51+", label: { ar: "51+", en: "51+" } },
        ],
      },
    ],
  },
];

/* -------------------------------------------------------------------------------------------------
 * Mock Data Generator (deterministic + per tab)
 * ------------------------------------------------------------------------------------------------- */

function makePoster(seed: string) {
  const s = hashStringToInt(seed);
  const r = mulberry32(s);

  const accents = [
    { a: "#7C3AED", b: "#06B6D4" }, // violet / cyan
    { a: "#F97316", b: "#EC4899" }, // orange / pink
    { a: "#22C55E", b: "#A3E635" }, // green / lime
    { a: "#0EA5E9", b: "#8B5CF6" }, // sky / violet
  ];
  const { a, b } = accents[s % accents.length]!;

  const glyphs = ["F", "★", "◼", "◆", "✦", "⟡", "⚡", "✶"];
  const g = glyphs[Math.floor(r() * glyphs.length)]!;

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="220" height="320" viewBox="0 0 220 320">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${a}" stop-opacity="0.95"/>
        <stop offset="1" stop-color="${b}" stop-opacity="0.95"/>
      </linearGradient>
      <radialGradient id="r" cx="30%" cy="20%" r="80%">
        <stop offset="0" stop-color="#ffffff" stop-opacity="0.20"/>
        <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
      </radialGradient>
      <pattern id="dots" width="10" height="10" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1" fill="#0B1220" opacity="0.22"/>
      </pattern>
    </defs>

    <rect x="0" y="0" width="220" height="320" rx="22" fill="#0B1220"/>
    <rect x="8" y="8" width="204" height="304" rx="18" fill="url(#g)" opacity="0.26"/>
    <rect x="8" y="8" width="204" height="304" rx="18" fill="url(#dots)" opacity="0.22"/>
    <rect x="8" y="8" width="204" height="304" rx="18" fill="url(#r)"/>

    <!-- panel lines -->
    <path d="M16 90H204" stroke="#ffffff" stroke-opacity="0.22"/>
    <path d="M16 210H204" stroke="#ffffff" stroke-opacity="0.16"/>
    <path d="M110 16V304" stroke="#ffffff" stroke-opacity="0.10"/>

    <!-- glyph -->
    <text x="110" y="175" text-anchor="middle"
      font-family="ui-sans-serif, system-ui"
      font-size="84"
      font-weight="900"
      fill="#ffffff"
      opacity="0.88">${g}</text>

    <text x="18" y="40"
      font-family="ui-sans-serif, system-ui"
      font-size="16"
      font-weight="800"
      fill="#ffffff"
      opacity="0.9">FANAARA</text>
  </svg>`;
  return svgToDataUri(svg);
}

function generateRankItems(params: {
  kind: RankKind;
  metric: MetricId;
  timeRange: TimeRangeId;
  sort: SortId;
  filterA: FilterValue;
  filterB: FilterValue;
}): RankItem[] {
  const { kind, metric, timeRange, sort, filterA, filterB } = params;

  const seed = `${kind}|${metric}|${timeRange}|${sort}|${filterA}|${filterB}`;
  const rand = mulberry32(hashStringToInt(seed));

  const titleAtomsAr = [
    "أسطورة",
    "شظايا",
    "ليلة",
    "نار",
    "قمر",
    "ظلال",
    "عاصفة",
    "ومضة",
    "نجم",
    "بوابة",
  ];
  const titleAtomsEn = [
    "Legend",
    "Shards",
    "Night",
    "Ember",
    "Moon",
    "Shadows",
    "Storm",
    "Spark",
    "Star",
    "Gate",
  ];

  const tagsPool = [
    "أكشن",
    "خيال",
    "دراما",
    "غموض",
    "رومانسي",
    "قوى خارقة",
    "مغامرات",
    "نفسي",
    "كوميدي",
    "ملحمي",
  ];

  const studios = [
    "MAPPA-ish",
    "Kyoto-ish",
    "Bones-ish",
    "Wit-ish",
    "Clover-ish",
  ];
  const magazines = ["Jump-ish", "Young-ish", "Ultra-ish", "Edge-ish"];
  const origins = ["Fanaara", "Shonen", "Seinen"];

  // volatility: 24h > week > month > all
  const trendMax =
    timeRange === "24h"
      ? 12
      : timeRange === "week"
        ? 9
        : timeRange === "month"
          ? 6
          : 3;

  const count = 100;

  // Build base items (kind-specific)
  const base: RankItem[] = Array.from({ length: count }).map((_, i) => {
    const idx = i + 1;

    const a = pick(rand, titleAtomsAr);
    const b = pick(rand, titleAtomsAr);
    const ae = pick(rand, titleAtomsEn);
    const be = pick(rand, titleAtomsEn);

    const poster = makePoster(`${seed}|poster|${idx}`);

    const tags = Array.from({ length: 3 }).map(() => pick(rand, tagsPool));
    const uniqueTags = Array.from(new Set(tags)).slice(0, 3);

    // Trend (movement proxy)
    const trendRoll = rand();
    const trend =
      trendRoll < 0.55
        ? 0
        : trendRoll < 0.78
          ? Math.round(rand() * (trendMax * 0.5))
          : -Math.round(rand() * trendMax);

    // Metric value (tab-aware)
    const scoreBase = 9.85 - idx * 0.025 + (rand() - 0.5) * 0.18;
    const hypeBase =
      (count - idx) *
        (timeRange === "24h"
          ? 180
          : timeRange === "week"
            ? 120
            : timeRange === "month"
              ? 80
              : 40) +
      rand() * 90;
    const savesBase =
      (count - idx) *
        (timeRange === "24h"
          ? 70
          : timeRange === "week"
            ? 90
            : timeRange === "month"
              ? 110
              : 150) +
      rand() * 120;
    const discussedBase =
      (count - idx) *
        (timeRange === "24h"
          ? 45
          : timeRange === "week"
            ? 60
            : timeRange === "month"
              ? 85
              : 120) +
      rand() * 70;
    const favoritesBase = (count - idx) * 120 + rand() * 240;
    const followersBase = (count - idx) * 220 + rand() * 500;
    const outputBase = (count - idx) * 4 + rand() * 8;
    const reactionsBase = (count - idx) * 140 + rand() * 260;
    const senkoBase = (count - idx) * 310 + rand() * 900;
    const ashbiyaBase = (count - idx) * 260 + rand() * 700;

    const metricValueMap: Record<MetricId, number> = {
      score: clamp(scoreBase, 6.5, 9.98),
      hype: Math.max(0, hypeBase + trend * 50),
      saves: Math.max(0, savesBase + trend * 30),
      discussed: Math.max(0, discussedBase + trend * 24),
      favorites: Math.max(0, favoritesBase + trend * 20),
      followers: Math.max(0, followersBase + trend * 35),
      output: Math.max(0, outputBase + trend * 0.2),
      reactions: Math.max(0, reactionsBase + trend * 22),
      senko: Math.max(0, senkoBase + trend * 40),
      ashbiya: Math.max(0, ashbiyaBase + trend * 35),
    };

    const metricLabels: Record<MetricId, { ar: string; en: string }> = {
      score: { ar: "التقييم", en: "Score" },
      hype: { ar: "الزخم", en: "Hype" },
      saves: { ar: "الحفظ", en: "Saves" },
      discussed: { ar: "النقاش", en: "Discussed" },
      favorites: { ar: "المفضلة", en: "Favorites" },
      followers: { ar: "المتابعون", en: "Followers" },
      output: { ar: "الإنتاج", en: "Output" },
      reactions: { ar: "التفاعل", en: "Reactions" },
      senko: { ar: "سينكو", en: "Senko" },
      ashbiya: { ar: "العشبية", en: "Ashbiya" },
    };

    const common: Omit<RankItemBase, "rank" | "prevRank"> = {
      id: `${kind}-${idx}`,
      kind,
      href:
        kind === "anime"
          ? `/anime/${idx}`
          : kind === "manga"
            ? `/manga/${idx}`
            : kind === "character"
              ? `/character/${idx}`
              : kind === "studio"
                ? `/studio/${idx}`
                : kind === "episode"
                  ? `/episodes/${idx}`
                  : `/users/${idx}`,
      title: kind === "user" ? `Nakama ${idx}` : `${a} ${b} ${idx}`,
      titleEn: kind === "user" ? `Nakama ${idx}` : `${ae} ${be} #${idx}`,
      image: poster,
      tags: uniqueTags,
      metricValue: metricValueMap[metric],
      metricLabel: metricLabels[metric],
      trend,
    };

    // Build kind-specific item
    if (kind === "anime") {
      const format = pick(rand, ["TV", "Movie", "ONA", "Special"] as const);
      const status = pick(rand, ["Airing", "Finished"] as const);
      const episodes = format === "Movie" ? 1 : Math.floor(rand() * 24) + 8;
      const studio = pick(rand, studios);

      const it: AnimeItem = {
        ...common,
        kind: "anime",
        format,
        status,
        episodes,
        studio,
        rank: 0,
        prevRank: 0,
      };
      return it;
    }

    if (kind === "manga") {
      const format = pick(rand, [
        "Manga",
        "Manhwa",
        "Novel",
        "One-shot",
      ] as const);
      const status = pick(rand, ["Publishing", "Finished"] as const);
      const volumes = format === "One-shot" ? 1 : Math.floor(rand() * 22) + 2;
      const magazine = pick(rand, magazines);

      const it: MangaItem = {
        ...common,
        kind: "manga",
        format,
        status,
        volumes,
        magazine,
        rank: 0,
        prevRank: 0,
      };
      return it;
    }

    if (kind === "character") {
      const role = pick(rand, ["Hero", "Villain", "Support"] as const);
      const origin = pick(rand, origins);

      const it: CharacterItem = {
        ...common,
        kind: "character",
        role,
        origin,
        rank: 0,
        prevRank: 0,
      };
      return it;
    }

    if (kind === "studio") {
      const region = pick(rand, ["JP", "KR", "US"] as const);
      const knownFor = pick(rand, ["Action", "Drama", "Fantasy"] as const);

      const it: StudioItem = {
        ...common,
        kind: "studio",
        region,
        knownFor,
        rank: 0,
        prevRank: 0,
      };
      return it;
    }

    if (kind === "episode") {
      const type = pick(rand, ["Episode", "Chapter"] as const);
      const seriesTitle = `${pick(rand, titleAtomsAr)} ${pick(rand, titleAtomsAr)}`;
      const number = Math.floor(rand() * 24) + 1;

      const it: EpisodeItem = {
        ...common,
        kind: "episode",
        type,
        seriesTitle,
        number,
        rank: 0,
        prevRank: 0,
      };
      return it;
    }

    // user
    const badge = pick(rand, ["Creator", "Fan", "Moderator"] as const);
    const handle = `@nakama_${idx}`;
    const level = Math.floor(rand() * 70) + 1;

    const it: UserItem = {
      ...common,
      kind: "user",
      badge,
      handle,
      level,
      rank: 0,
      prevRank: 0,
    };
    return it;
  });

  // Apply contextual filters
  const filtered = base.filter((it) => {
    // filterA
    if (filterA !== "all") {
      if (it.kind === "anime" && it.format !== filterA) return false;
      if (it.kind === "manga" && it.format !== filterA) return false;
      if (it.kind === "character" && it.role !== filterA) return false;
      if (it.kind === "studio" && it.region !== filterA) return false;
      if (it.kind === "episode" && it.type !== filterA) return false;
      if (it.kind === "user" && it.badge !== filterA) return false;
    }

    // filterB
    if (filterB !== "all") {
      if (it.kind === "anime" && it.status !== filterB) return false;
      if (it.kind === "manga" && it.status !== filterB) return false;
      if (it.kind === "character" && it.origin !== filterB) return false;
      if (it.kind === "studio" && it.knownFor !== filterB) return false;
      if (it.kind === "episode") {
        // Season filter is mock-based; map by modulo
        const season = it.number <= 8 ? "S1" : it.number <= 16 ? "S2" : "S3";
        if (season !== filterB) return false;
      }
      if (it.kind === "user") {
        const bucket =
          it.level <= 20 ? "1-20" : it.level <= 50 ? "21-50" : "51+";
        if (bucket !== filterB) return false;
      }
    }

    return true;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    // Rising/Falling sort by trend first (purposeful interaction)
    if (sort === "rising") {
      const d = (b.trend ?? 0) - (a.trend ?? 0);
      if (d !== 0) return d;
      return b.metricValue - a.metricValue;
    }
    if (sort === "falling") {
      const d = (a.trend ?? 0) - (b.trend ?? 0);
      if (d !== 0) return d;
      return b.metricValue - a.metricValue;
    }

    // Top/Worst by metricValue
    const metricDiff = b.metricValue - a.metricValue;
    if (sort === "top") return metricDiff;
    return -metricDiff;
  });

  // Assign ranks + prev ranks based on trend
  const finalCount = sorted.length;
  const withRanks = sorted.map((it, idx) => {
    const rank = idx + 1;
    const prevRank = clamp(rank + (it.trend ?? 0), 1, Math.max(1, finalCount));
    return { ...it, rank, prevRank };
  });

  return withRanks;
}

/* -------------------------------------------------------------------------------------------------
 * UI Pieces
 * ------------------------------------------------------------------------------------------------- */

function RankDelta({
  rank,
  prevRank,
  dir,
}: {
  rank: number;
  prevRank: number;
  dir: Dir;
}) {
  const delta = prevRank - rank;

  if (delta === 0) {
    return (
      <span
        className={cx(
          "inline-flex items-center gap-1 rounded-full border border-border-subtle bg-surface-soft px-2 py-1",
          "text-[11px] font-semibold text-foreground-muted",
        )}
        aria-label={dir === "rtl" ? "لا تغيير" : "No change"}
      >
        <IoRemove className="text-[14px]" />
        <span className="tabular-nums">0</span>
      </span>
    );
  }

  const up = delta > 0;

  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full border px-2 py-1",
        "text-[11px] font-semibold tabular-nums",
        up
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
          : "border-rose-500/20 bg-rose-500/10 text-rose-600",
      )}
      aria-label={
        dir === "rtl"
          ? up
            ? `صعود ${delta}`
            : `هبوط ${Math.abs(delta)}`
          : up
            ? `Up ${delta}`
            : `Down ${Math.abs(delta)}`
      }
    >
      {up ? (
        <IoTrendingUp className="text-[14px]" />
      ) : (
        <IoTrendingDown className="text-[14px]" />
      )}
      <span>{Math.abs(delta)}</span>
    </span>
  );
}

function RankEmblem({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <span aria-hidden className="text-base">
        👑
      </span>
    );
  if (rank === 2)
    return (
      <span aria-hidden className="text-base">
        🥈
      </span>
    );
  if (rank === 3)
    return (
      <span aria-hidden className="text-base">
        🥉
      </span>
    );
  if (rank <= 10)
    return (
      <span aria-hidden className="text-base">
        ✦
      </span>
    );
  return (
    <span aria-hidden className="text-base">
      •
    </span>
  );
}

function MangaBackdrop({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Gradient blobs (subtle, reduce-motion safe) */}
      <motion.div
        className="absolute -top-28 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-500/20 blur-[120px]"
        animate={
          reduceMotion
            ? undefined
            : { scale: [1, 1.08, 1], opacity: [0.65, 1, 0.65] }
        }
        transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-24 right-[-60px] h-[380px] w-[380px] rounded-full bg-cyan-400/14 blur-[130px]"
        animate={
          reduceMotion
            ? undefined
            : { scale: [1, 1.06, 1], opacity: [0.55, 0.9, 0.55] }
        }
        transition={{ duration: 9.2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Halftone dots */}
      <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:18px_18px]" />
      {/* Manga panel lines */}
      <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_bottom,rgba(255,255,255,0.25)_1px,transparent_1px)] [background-size:100%_12px]" />

      {/* Soft vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10 dark:to-black/30" />
    </div>
  );
}

function Pill({
  active,
  disabled,
  onClick,
  children,
  ariaLabel,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={active}
      className={cx(
        "relative inline-flex items-center gap-2 rounded-full px-3 py-2",
        "text-xs font-semibold transition-all",
        "outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30",
        disabled && "opacity-50 pointer-events-none",
        active
          ? "bg-background-elevated text-foreground-strong border border-border-subtle shadow-[0_10px_30px_-18px_rgba(124,58,237,0.35)]"
          : "bg-surface-soft text-foreground-muted border border-border-subtle hover:bg-surface-muted",
      )}
    >
      {children}
      {active && (
        <span
          aria-hidden
          className="absolute -bottom-[6px] left-1/2 h-[3px] w-10 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-500/90 to-cyan-400/70"
        />
      )}
    </button>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className={cx(
        "shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold",
        "border transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30",
        active
          ? "border-brand-500/25 bg-brand-500/10 text-foreground-strong"
          : "border-border-subtle bg-background-elevated/50 text-foreground-muted hover:bg-surface-soft",
      )}
      aria-pressed={active}
    >
      {children}
    </motion.button>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Cards (tab-specific)
 * ------------------------------------------------------------------------------------------------- */

const spring = {
  type: "spring" as const,
  stiffness: 520,
  damping: 36,
  mass: 0.9,
};

function RowCard({
  item,
  metricFormat,
  dir,
  reduceMotion,
}: {
  item: RankItem;
  metricFormat: "score" | "compact" | undefined;
  dir: Dir;
  reduceMotion: boolean;
}) {
  const isTop3 = item.rank <= 3;
  const isTop10 = item.rank <= 10;

  const wrapperGradient = isTop3
    ? "bg-gradient-to-br from-amber-400/35 via-brand-500/25 to-cyan-400/25"
    : isTop10
      ? "bg-gradient-to-br from-brand-500/25 via-transparent to-cyan-400/20"
      : "bg-gradient-to-br from-black/10 via-black/5 to-black/10 dark:from-white/10 dark:via-white/5 dark:to-white/10";

  const rankBadge = isTop3
    ? "bg-gradient-to-br from-amber-300/30 via-background-elevated to-background-elevated border border-amber-400/20"
    : isTop10
      ? "bg-brand-500/10 border border-brand-500/15"
      : "bg-surface-soft border border-border-subtle";

  const metricValueText = formatMetricValue(
    item.metricValue,
    metricFormat,
    dir,
  );

  const actionStop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const title = (
    <div className="min-w-0">
      <div className="flex items-center gap-2 min-w-0">
        <span className="shrink-0">{/* emblem */}</span>
        <h3 className="min-w-0 truncate text-[13px] sm:text-sm font-extrabold text-foreground-strong">
          <bdi>{item.title}</bdi>
        </h3>
      </div>
      <p className="mt-0.5 truncate text-[11px] font-medium text-foreground-muted">
        <bdi>{item.titleEn}</bdi>
      </p>
    </div>
  );

  const meta = (() => {
    if (item.kind === "anime") {
      const it = item as AnimeItem;
      return (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-foreground-muted">
          <span className="inline-flex items-center gap-1">
            <IoPlayCircleOutline className="text-[14px] text-brand-500" />
            <span className="font-semibold">{it.format}</span>
            <span className="opacity-70">•</span>
            <span>
              {it.episodes}
              {dir === "rtl" ? " حلقة" : " eps"}
            </span>
          </span>
          <span className="opacity-60">•</span>
          <span className="font-semibold">
            {it.status === "Airing"
              ? dir === "rtl"
                ? "يعرض الآن"
                : "Airing"
              : dir === "rtl"
                ? "مكتمل"
                : "Finished"}
          </span>
          <span className="opacity-60">•</span>
          <span className="truncate max-w-[160px]">{it.studio}</span>
        </div>
      );
    }

    if (item.kind === "manga") {
      const it = item as MangaItem;
      return (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-foreground-muted">
          <span className="inline-flex items-center gap-1">
            <IoBookOutline className="text-[14px] text-brand-500" />
            <span className="font-semibold">{it.format}</span>
            <span className="opacity-70">•</span>
            <span>
              {it.volumes}
              {dir === "rtl" ? " مجلد" : " vols"}
            </span>
          </span>
          <span className="opacity-60">•</span>
          <span className="font-semibold">
            {it.status === "Publishing"
              ? dir === "rtl"
                ? "ينشر الآن"
                : "Publishing"
              : dir === "rtl"
                ? "مكتمل"
                : "Finished"}
          </span>
          <span className="opacity-60">•</span>
          <span className="truncate max-w-[160px]">{it.magazine}</span>
        </div>
      );
    }

    if (item.kind === "character") {
      const it = item as CharacterItem;
      return (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-foreground-muted">
          <span className="inline-flex items-center gap-1">
            <IoPeopleOutline className="text-[14px] text-brand-500" />
            <span className="font-semibold">
              {it.role === "Hero"
                ? dir === "rtl"
                  ? "بطل"
                  : "Hero"
                : it.role === "Villain"
                  ? dir === "rtl"
                    ? "خصم"
                    : "Villain"
                  : dir === "rtl"
                    ? "مساعد"
                    : "Support"}
            </span>
          </span>
          <span className="opacity-60">•</span>
          <span className="font-semibold">
            {dir === "rtl" ? "الأصل:" : "Origin:"}
          </span>
          <span>{it.origin}</span>
        </div>
      );
    }

    if (item.kind === "studio") {
      const it = item as StudioItem;
      return (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-foreground-muted">
          <span className="inline-flex items-center gap-1">
            <IoShareSocialOutline className="text-[14px] text-brand-500" />
            <span className="font-semibold">
              {dir === "rtl" ? "منطقة" : "Region"}
            </span>
            <span className="opacity-70">•</span>
            <span>{it.region}</span>
          </span>
          <span className="opacity-60">•</span>
          <span className="font-semibold">
            {dir === "rtl" ? "معروف بـ" : "Known for"}
          </span>
          <span>{it.knownFor}</span>
        </div>
      );
    }

    if (item.kind === "episode") {
      const it = item as EpisodeItem;
      const season = it.number <= 8 ? "S1" : it.number <= 16 ? "S2" : "S3";
      return (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-foreground-muted">
          <span className="inline-flex items-center gap-1">
            <IoTimeOutline className="text-[14px] text-brand-500" />
            <span className="font-semibold">
              {it.type === "Episode"
                ? dir === "rtl"
                  ? "حلقة"
                  : "Episode"
                : dir === "rtl"
                  ? "فصل"
                  : "Chapter"}
            </span>
            <span className="opacity-70">•</span>
            <span>#{it.number}</span>
            <span className="opacity-70">•</span>
            <span>{season}</span>
          </span>
          <span className="opacity-60">•</span>
          <span className="truncate max-w-[180px]">{it.seriesTitle}</span>
        </div>
      );
    }

    // user
    const it = item as UserItem;
    return (
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-foreground-muted">
        <span className="inline-flex items-center gap-1">
          <IoPeopleOutline className="text-[14px] text-brand-500" />
          <span className="font-semibold">{it.handle}</span>
        </span>
        <span className="opacity-60">•</span>
        <span className="font-semibold">{dir === "rtl" ? "Lv" : "Lv"}</span>
        <span>{it.level}</span>
        <span className="opacity-60">•</span>
        <span className="font-semibold">
          {it.badge === "Creator"
            ? dir === "rtl"
              ? "صانع"
              : "Creator"
            : it.badge === "Moderator"
              ? dir === "rtl"
                ? "مشرف"
                : "Moderator"
              : dir === "rtl"
                ? "متابع"
                : "Fan"}
        </span>
      </div>
    );
  })();

  return (
    <motion.li layout transition={spring} className="list-none">
      <div className={cx("rounded-2xl p-[1px]", wrapperGradient)}>
        <Link
          href={item.href}
          className={cx(
            "group relative block overflow-hidden rounded-2xl border border-border-subtle bg-background-elevated/70",
            "px-3 py-3 sm:px-4",
            "transition-all",
            "hover:bg-background-elevated/90",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30",
          )}
        >
          {/* subtle panel overlay */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:18px_100%]" />

          <div
            className={cx(
              "relative flex items-center gap-3",
              dir === "rtl" ? "flex-row-reverse" : "flex-row",
            )}
          >
            {/* Rank */}
            <div className="shrink-0 flex flex-col items-center gap-2">
              <div
                className={cx(
                  "grid place-items-center rounded-2xl px-3 py-2",
                  "text-sm font-black tabular-nums text-foreground-strong",
                  rankBadge,
                )}
              >
                <div className="flex items-center gap-1">
                  <RankEmblem rank={item.rank} />
                  <span>{item.rank}</span>
                </div>
              </div>

              <RankDelta rank={item.rank} prevRank={item.prevRank} dir={dir} />
            </div>

            {/* Image */}
            <div className="relative shrink-0 overflow-hidden rounded-xl border border-border-subtle bg-surface-soft">
              <Image
                src={item.image}
                alt={item.title}
                width={44}
                height={62}
                className="h-[62px] w-[44px] object-cover"
                unoptimized
              />
              {isTop10 && (
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
              )}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                {title}

                {/* Metric */}
                <div
                  className={cx(
                    "shrink-0 rounded-2xl border border-border-subtle bg-surface-soft px-3 py-2",
                    "text-right ltr:text-left",
                  )}
                >
                  <div className="text-[10px] font-semibold text-foreground-muted">
                    {dir === "rtl" ? item.metricLabel.ar : item.metricLabel.en}
                  </div>
                  <div className="mt-0.5 text-sm font-black tabular-nums text-foreground-strong">
                    {metricValueText}
                  </div>
                </div>
              </div>

              <div className="mt-1">{meta}</div>

              {/* tags */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {item.tags.slice(0, 3).map((t) => (
                  <span
                    key={t}
                    className={cx(
                      "inline-flex items-center rounded-full px-2 py-1",
                      "text-[10px] font-semibold",
                      "border border-border-subtle bg-background-elevated/50 text-foreground-muted",
                    )}
                  >
                    <bdi>{t}</bdi>
                  </span>
                ))}
              </div>
            </div>

            {/* Hover actions (purposeful: appear only when user intends) */}
            <div
              className={cx(
                "shrink-0 flex items-center gap-1.5",
                "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:transition-opacity",
              )}
            >
              <div className="hidden sm:flex items-center gap-1.5">
                <DeButton
                  iconOnly
                  aria-label="Save"
                  variant="soft"
                  tone="neutral"
                  size="sm"
                  onClick={actionStop}
                  tooltip={dir === "rtl" ? "حفظ" : "Save"}
                >
                  <IoBookmarkOutline className="text-[18px]" />
                </DeButton>

                <DeButton
                  iconOnly
                  aria-label="Like"
                  variant="soft"
                  tone="neutral"
                  size="sm"
                  onClick={actionStop}
                  tooltip={dir === "rtl" ? "إعجاب" : "Like"}
                >
                  <IoHeartOutline className="text-[18px]" />
                </DeButton>

                <DeButton
                  iconOnly
                  aria-label="More"
                  variant="soft"
                  tone="neutral"
                  size="sm"
                  onClick={actionStop}
                  tooltip={dir === "rtl" ? "المزيد" : "More"}
                >
                  <IoEllipsisHorizontal className="text-[18px]" />
                </DeButton>
              </div>

              {/* mobile hint (no clutter): one icon */}
              <div className="sm:hidden">
                <span className="grid size-10 place-items-center rounded-2xl border border-border-subtle bg-surface-soft text-foreground-muted">
                  <IoEllipsisHorizontal className="text-[18px]" />
                </span>
              </div>
            </div>
          </div>

          {/* Top3/Top10 edge glow */}
          {!reduceMotion && (isTop3 || isTop10) && (
            <motion.div
              aria-hidden
              className={cx(
                "pointer-events-none absolute -inset-10 opacity-0 blur-2xl",
                isTop3 ? "bg-amber-400/20" : "bg-brand-500/16",
                "group-hover:opacity-100",
              )}
              transition={{ duration: 0.25 }}
            />
          )}
        </Link>
      </div>
    </motion.li>
  );
}

function PodiumTop3({
  items,
  metricFormat,
  dir,
  reduceMotion,
}: {
  items: RankItem[];
  metricFormat: "score" | "compact" | undefined;
  dir: Dir;
  reduceMotion: boolean;
}) {
  const top3 = items.slice(0, 3);

  if (top3.length < 3) return null;

  return (
    <div className="relative">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-black text-foreground-strong">
          <span className="rounded-full border border-border-subtle bg-surface-soft px-2 py-1">
            {dir === "rtl" ? "منصة التوب" : "Top podium"}
          </span>
          <span className="text-foreground-muted">
            {dir === "rtl" ? "أفضل 3 الآن" : "Top 3 right now"}
          </span>
        </div>

        <div className="text-[11px] font-semibold text-foreground-muted">
          {dir === "rtl"
            ? "تلميح: غيّر المعيار لإعادة الترتيب"
            : "Tip: change metric to re-rank"}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {top3.map((it, index) => {
          const big = index === 0;

          const metricValueText = formatMetricValue(
            it.metricValue,
            metricFormat,
            dir,
          );

          const accent =
            it.rank === 1
              ? "from-amber-400/45 via-brand-500/30 to-cyan-400/30"
              : it.rank === 2
                ? "from-slate-400/30 via-brand-500/25 to-cyan-400/20"
                : "from-orange-400/30 via-brand-500/25 to-cyan-400/20";

          return (
            <motion.div
              key={it.id}
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={spring}
              className={cx(
                "rounded-3xl p-[1px]",
                `bg-gradient-to-br ${accent}`,
              )}
            >
              <Link
                href={it.href}
                className={cx(
                  "group relative block overflow-hidden rounded-3xl border border-border-subtle bg-background-elevated/80",
                  "p-4",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30",
                )}
              >
                <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:18px_18px]" />

                <div
                  className={cx(
                    "relative flex items-start gap-3",
                    dir === "rtl" ? "flex-row-reverse" : "flex-row",
                  )}
                >
                  <div className="relative shrink-0 overflow-hidden rounded-2xl border border-border-subtle bg-surface-soft">
                    <Image
                      src={it.image}
                      alt={it.title}
                      width={big ? 76 : 64}
                      height={big ? 108 : 92}
                      className={cx(
                        "object-cover",
                        big ? "h-[108px] w-[76px]" : "h-[92px] w-[64px]",
                      )}
                      unoptimized
                      priority={it.rank === 1}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div
                      className={cx(
                        "flex items-center gap-2",
                        dir === "rtl" ? "justify-end" : "justify-start",
                      )}
                    >
                      <span className="grid size-9 place-items-center rounded-2xl border border-border-subtle bg-surface-soft text-sm font-black tabular-nums">
                        {it.rank}
                      </span>
                      <span className="text-base" aria-hidden>
                        {it.rank === 1 ? "👑" : it.rank === 2 ? "🥈" : "🥉"}
                      </span>
                      <RankDelta
                        rank={it.rank}
                        prevRank={it.prevRank}
                        dir={dir}
                      />
                    </div>

                    <h3
                      className={cx(
                        "mt-2 truncate text-sm font-extrabold text-foreground-strong",
                        dir === "rtl" ? "text-right" : "text-left",
                      )}
                    >
                      <bdi>{it.title}</bdi>
                    </h3>
                    <p
                      className={cx(
                        "mt-0.5 truncate text-[11px] font-medium text-foreground-muted",
                        dir === "rtl" ? "text-right" : "text-left",
                      )}
                    >
                      <bdi>{it.titleEn}</bdi>
                    </p>

                    <div
                      className={cx(
                        "mt-3 flex items-end justify-between gap-3",
                        dir === "rtl" ? "flex-row-reverse" : "flex-row",
                      )}
                    >
                      <div className="min-w-0">
                        <div className="text-[10px] font-semibold text-foreground-muted">
                          {dir === "rtl"
                            ? it.metricLabel.ar
                            : it.metricLabel.en}
                        </div>
                        <div className="mt-0.5 text-lg font-black tabular-nums text-foreground-strong">
                          {metricValueText}
                        </div>
                      </div>

                      <DeButton
                        variant="soft"
                        tone="brand"
                        size="sm"
                        rightIcon={
                          dir === "rtl" ? (
                            <span aria-hidden>←</span>
                          ) : (
                            <span aria-hidden>→</span>
                          )
                        }
                        className="shrink-0"
                      >
                        {dir === "rtl" ? "فتح" : "Open"}
                      </DeButton>
                    </div>
                  </div>
                </div>

                {!reduceMotion && (
                  <motion.div
                    aria-hidden
                    className="pointer-events-none absolute -left-1/2 top-0 h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-all duration-700 group-hover:left-[120%] group-hover:opacity-100"
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Main Component
 * ------------------------------------------------------------------------------------------------- */

type LoadState = "loading" | "ready" | "empty" | "error";

export default function RanksClient() {
  const dir = useDocumentDir();
  const reduceMotion = useReducedMotion();

  const [activeTab, setActiveTab] = useState<RankKind>("anime");
  const tab = useMemo(() => TABS.find((t) => t.id === activeTab)!, [activeTab]);

  const [timeRange, setTimeRange] = useState<TimeRangeId>("24h");
  const [metric, setMetric] = useState<MetricId>(tab.defaultMetric);
  const [sort, setSort] = useState<SortId>("top");

  const [filterA, setFilterA] = useState<FilterValue>(
    tab.filters[0]?.defaultValue ?? "all",
  );
  const [filterB, setFilterB] = useState<FilterValue>(
    tab.filters[1]?.defaultValue ?? "all",
  );

  const [state, setState] = useState<LoadState>("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [items, setItems] = useState<RankItem[]>([]);

  // Progressive rendering (for large lists / future growth)
  const [visibleCount, setVisibleCount] = useState(28);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Sort menu
  const [sortOpen, setSortOpen] = useState(false);
  const sortBtnRef = useRef<HTMLButtonElement | null>(null);

  const metricFormat = useMemo(
    () => tab.metrics.find((m) => m.id === metric)?.format,
    [tab.metrics, metric],
  );

  const ui = useMemo(() => {
    const isRTL = dir === "rtl";
    return {
      title: isRTL ? "Ranks" : "Ranks",
      subtitle: isRTL
        ? "اكتشف أعلى 100 عنصر حسب الفترة + المعيار — مع إعادة ترتيب سلسة."
        : "Explore Top 100 by time & metric — with smooth re-ranking.",
      tabsLabel: isRTL ? "الأقسام" : "Sections",
      filtersLabel: isRTL ? "الفلاتر" : "Filters",
      sortLabel: isRTL ? "الترتيب" : "Sort",
      top100: isRTL ? "Top 100" : "Top 100",
      loadMore: isRTL ? "عرض المزيد" : "Load more",
      retry: isRTL ? "إعادة المحاولة" : "Retry",
      reset: isRTL ? "إعادة ضبط الفلاتر" : "Reset filters",
      emptyTitle: isRTL
        ? "لا توجد نتائج بهذه التصفية"
        : "No results for this filter",
      emptyDesc: isRTL
        ? "جرّب تغيير المعيار أو الفلاتر."
        : "Try changing metric or filters.",
      errorTitle: isRTL ? "تعذّر تحميل التصنيفات" : "Couldn't load ranks",
      errorDesc: isRTL
        ? "تحقق من الإعدادات وحاول مجددًا."
        : "Check settings and try again.",
      hint: isRTL
        ? "تلميح: غيّر المعيار لتشاهد إعادة الترتيب"
        : "Tip: change metric to watch re-ranking",
    };
  }, [dir]);

  // Reset metric & filters when tab changes
  useEffect(() => {
    const t = TABS.find((x) => x.id === activeTab)!;
    setMetric(t.defaultMetric);
    setFilterA(t.filters[0]?.defaultValue ?? "all");
    setFilterB(t.filters[1]?.defaultValue ?? "all");
    setVisibleCount(28);
  }, [activeTab]);

  const load = useCallback(() => {
    setState("loading");
    setErrorMsg(null);

    const shouldFail =
      activeTab === "studio" &&
      timeRange === "24h" &&
      metric === "output" &&
      sort === "worst"; // deterministic (for testing error state)

    const t = window.setTimeout(() => {
      try {
        if (shouldFail) {
          throw new Error("mock-fail");
        }

        const next = generateRankItems({
          kind: activeTab,
          metric,
          timeRange,
          sort,
          filterA,
          filterB,
        });

        if (!next.length) {
          setItems([]);
          setState("empty");
          return;
        }

        setItems(next);
        setState("ready");
      } catch {
        setItems([]);
        setErrorMsg("mock-error");
        setState("error");
      }
    }, 420);

    return () => window.clearTimeout(t);
  }, [activeTab, metric, timeRange, sort, filterA, filterB]);

  // Load on changes
  useEffect(() => {
    const cancel = load();
    return cancel;
  }, [load]);

  // Close sort menu on outside click / esc
  useEffect(() => {
    if (!sortOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSortOpen(false);
    };
    const onDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (sortBtnRef.current?.contains(target)) return;

      // Click inside menu?
      const menu = document.getElementById("ranks-sort-menu");
      if (menu?.contains(target)) return;

      setSortOpen(false);
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onDown);

    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onDown);
    };
  }, [sortOpen]);

  // Progressive load more using IntersectionObserver
  useEffect(() => {
    if (state !== "ready") return;
    if (!sentinelRef.current) return;

    const el = sentinelRef.current;
    const obs = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (!e?.isIntersecting) return;

        setVisibleCount((c) => {
          const next = Math.min(items.length, c + 18);
          return next;
        });
      },
      { root: null, threshold: 0.1 },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [state, items.length]);

  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount],
  );
  const canLoadMore = state === "ready" && visibleCount < items.length;

  const ActiveTabIcon = tab.icon;

  return (
    <div
      className={cx(
        "min-h-screen",
        "bg-bg-page bg-background",
        "text-fg-default text-foreground",
        "pb-16",
        "selection:bg-brand-500/20",
      )}
      dir={dir}
    >
      {/* Header */}
      <header className="relative overflow-hidden border-b border-border-subtle">
        <MangaBackdrop reduceMotion={Boolean(reduceMotion)} />

        <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div
            className={cx(
              "flex items-start justify-between gap-4",
              dir === "rtl" ? "flex-row-reverse" : "flex-row",
            )}
          >
            <div className="min-w-0">
              <div
                className={cx(
                  "inline-flex items-center gap-2 rounded-full border border-border-subtle bg-background-elevated/60 px-3 py-1.5",
                  "text-[11px] font-black text-foreground-muted",
                )}
              >
                <IoTrendingUp className="text-[14px] text-brand-500" />
                <span>
                  {dir === "rtl" ? "تصنيفات فمنارة" : "Fanaara Ranks"}
                </span>
                <span className="opacity-60">•</span>
                <span className="inline-flex items-center gap-1">
                  <IoTimeOutline className="text-[14px]" />
                  {
                    TIME_RANGES.find((t) => t.id === timeRange)?.label[
                      dir === "rtl" ? "ar" : "en"
                    ]
                  }
                </span>
              </div>

              <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground-strong sm:text-4xl">
                {dir === "rtl" ? "Ranks" : "Ranks"}
                <span className="ml-2 rtl:ml-0 rtl:mr-2 inline-block rounded-xl bg-brand-500/10 px-2 py-1 align-middle text-xs font-black text-foreground-strong">
                  {ui.top100}
                </span>
              </h1>

              <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-foreground-muted">
                {ui.subtitle}
              </p>
            </div>

            {/* Mini badge */}
            <div className="shrink-0 hidden sm:flex">
              <div className="rounded-3xl border border-border-subtle bg-background-elevated/60 p-3">
                <div className="text-[11px] font-semibold text-foreground-muted">
                  {ui.hint}
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Tabs */}
          <div className="mt-6">
            <div
              className={cx(
                "sticky top-0 z-40 -mx-4 sm:-mx-6",
                "bg-bg-page/70 bg-background/70 backdrop-blur-xl",
                "border-y border-border-subtle",
              )}
            >
              <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <div
                  className={cx(
                    "flex items-center gap-2 overflow-x-auto py-3 no-scrollbar",
                    dir === "rtl" ? "flex-row-reverse" : "flex-row",
                  )}
                  role="tablist"
                  aria-label={ui.tabsLabel}
                >
                  {TABS.map((t) => {
                    const isActive = t.id === activeTab;
                    const Icon = t.icon;

                    return (
                      <button
                        key={t.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setActiveTab(t.id)}
                        className={cx(
                          "relative shrink-0 rounded-full px-4 py-2",
                          "text-xs font-black",
                          "border transition-colors",
                          "outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30",
                          isActive
                            ? "border-brand-500/25 bg-background-elevated text-foreground-strong"
                            : "border-border-subtle bg-surface-soft text-foreground-muted hover:bg-surface-muted",
                        )}
                      >
                        <span
                          className={cx(
                            "inline-flex items-center gap-2",
                            dir === "rtl" ? "flex-row-reverse" : "flex-row",
                          )}
                        >
                          <Icon
                            className={cx(
                              "text-[16px]",
                              isActive
                                ? "text-brand-500"
                                : "text-foreground-muted",
                            )}
                          />
                          <span>{t.label[dir === "rtl" ? "ar" : "en"]}</span>
                        </span>

                        {isActive && (
                          <motion.span
                            layoutId="ranks-active-tab"
                            className="absolute inset-x-3 -bottom-[6px] h-[3px] rounded-full bg-gradient-to-r from-brand-500/90 to-cyan-400/70"
                            transition={spring}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Filters Tray */}
          <div className="mt-6 rounded-3xl border border-border-subtle bg-background-elevated/55 p-3 backdrop-blur-xl">
            <div
              className={cx(
                "flex flex-col gap-3",
                dir === "rtl" ? "text-right" : "text-left",
              )}
            >
              {/* Row 1: time + sort */}
              <div
                className={cx(
                  "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
                  dir === "rtl" ? "sm:flex-row-reverse" : "sm:flex-row",
                )}
              >
                <div
                  className={cx(
                    "flex items-center gap-2 overflow-x-auto no-scrollbar",
                    dir === "rtl" ? "flex-row-reverse" : "flex-row",
                  )}
                >
                  <div
                    className={cx(
                      "inline-flex items-center gap-2 text-[11px] font-bold text-foreground-muted",
                      dir === "rtl" ? "flex-row-reverse" : "flex-row",
                    )}
                  >
                    <IoTimeOutline className="text-[14px]" />
                    <span>{dir === "rtl" ? "الوقت:" : "Time:"}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {TIME_RANGES.map((t) => (
                      <Pill
                        key={t.id}
                        active={t.id === timeRange}
                        onClick={() => setTimeRange(t.id)}
                        ariaLabel={t.label[dir === "rtl" ? "ar" : "en"]}
                      >
                        <span>{t.label[dir === "rtl" ? "ar" : "en"]}</span>
                      </Pill>
                    ))}
                  </div>
                </div>

                <div
                  className={cx(
                    "flex items-center gap-2",
                    dir === "rtl" ? "flex-row-reverse" : "flex-row",
                  )}
                >
                  <div
                    className={cx(
                      "inline-flex items-center gap-2 text-[11px] font-bold text-foreground-muted",
                      dir === "rtl" ? "flex-row-reverse" : "flex-row",
                    )}
                  >
                    <IoFilter className="text-[14px]" />
                    <span>{ui.sortLabel}:</span>
                  </div>

                  <div className="relative">
                    <button
                      ref={(n) => {
                        sortBtnRef.current = n;
                      }}
                      type="button"
                      onClick={() => setSortOpen((v) => !v)}
                      className={cx(
                        "inline-flex items-center gap-2 rounded-full px-3 py-2",
                        "border border-border-subtle bg-surface-soft",
                        "text-xs font-black text-foreground-strong",
                        "hover:bg-surface-muted transition-colors",
                        "outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30",
                      )}
                      aria-expanded={sortOpen}
                      aria-haspopup="menu"
                    >
                      {(() => {
                        const SIcon =
                          SORTS.find((s) => s.id === sort)?.icon ??
                          IoTrendingUp;
                        return <SIcon className="text-[16px] text-brand-500" />;
                      })()}
                      <span>
                        {
                          SORTS.find((s) => s.id === sort)?.label[
                            dir === "rtl" ? "ar" : "en"
                          ]
                        }
                      </span>
                      <span aria-hidden className="text-[12px] opacity-70">
                        {dir === "rtl" ? "▾" : "▾"}
                      </span>
                    </button>

                    <AnimatePresence>
                      {sortOpen && (
                        <motion.div
                          id="ranks-sort-menu"
                          initial={{ opacity: 0, y: 8, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.98 }}
                          transition={spring}
                          className={cx(
                            "absolute z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-border-subtle bg-background-elevated shadow-[var(--shadow-elevated)]",
                            dir === "rtl" ? "right-0" : "left-0",
                          )}
                          role="menu"
                        >
                          {SORTS.map((s) => {
                            const Icon = s.icon;
                            const active = s.id === sort;

                            return (
                              <button
                                key={s.id}
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                  setSort(s.id);
                                  setSortOpen(false);
                                }}
                                className={cx(
                                  "w-full px-3 py-2.5",
                                  "flex items-center justify-between gap-2",
                                  dir === "rtl"
                                    ? "flex-row-reverse text-right"
                                    : "flex-row text-left",
                                  "border-b border-border-subtle last:border-b-0",
                                  active
                                    ? "bg-brand-500/10"
                                    : "hover:bg-surface-soft",
                                  "transition-colors",
                                )}
                              >
                                <div
                                  className={cx(
                                    "flex items-center gap-2",
                                    dir === "rtl"
                                      ? "flex-row-reverse"
                                      : "flex-row",
                                  )}
                                >
                                  <span
                                    className={cx(
                                      "grid size-9 place-items-center rounded-xl border",
                                      active
                                        ? "border-brand-500/25 bg-brand-500/10"
                                        : "border-border-subtle bg-surface-soft",
                                    )}
                                  >
                                    <Icon
                                      className={cx(
                                        "text-[16px]",
                                        active
                                          ? "text-brand-500"
                                          : "text-foreground-muted",
                                      )}
                                    />
                                  </span>
                                  <span
                                    className={cx(
                                      "text-[12px] font-bold",
                                      active
                                        ? "text-foreground-strong"
                                        : "text-foreground-muted",
                                    )}
                                  >
                                    {s.label[dir === "rtl" ? "ar" : "en"]}
                                  </span>
                                </div>

                                {active && (
                                  <span
                                    aria-hidden
                                    className="text-[12px] font-black text-brand-500"
                                  >
                                    ✓
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Row 2: metrics + contextual filters */}
              <div className="flex flex-col gap-3">
                {/* Metric chips */}
                <div
                  className={cx(
                    "flex items-center gap-2 overflow-x-auto no-scrollbar",
                    dir === "rtl" ? "flex-row-reverse" : "flex-row",
                  )}
                >
                  <div
                    className={cx(
                      "inline-flex items-center gap-2 text-[11px] font-bold text-foreground-muted",
                      dir === "rtl" ? "flex-row-reverse" : "flex-row",
                    )}
                  >
                    <ActiveTabIcon className="text-[14px]" />
                    <span>{dir === "rtl" ? "المعيار:" : "Metric:"}</span>
                  </div>

                  {tab.metrics.map((m) => {
                    const Icon = m.icon;
                    const active = m.id === metric;

                    return (
                      <Chip
                        key={m.id}
                        active={active}
                        onClick={() => {
                          setMetric(m.id);
                          setVisibleCount(28);
                        }}
                      >
                        <span
                          className={cx(
                            "inline-flex items-center gap-2",
                            dir === "rtl" ? "flex-row-reverse" : "flex-row",
                          )}
                        >
                          <Icon
                            className={cx(
                              "text-[14px]",
                              active
                                ? "text-brand-500"
                                : "text-foreground-muted",
                            )}
                          />
                          <span>{m.label[dir === "rtl" ? "ar" : "en"]}</span>

                          {/* for user metrics show emoji hint */}
                          {activeTab === "user" && m.id === "senko" && (
                            <span aria-hidden>🪙</span>
                          )}
                          {activeTab === "user" && m.id === "ashbiya" && (
                            <span aria-hidden>🌿</span>
                          )}
                        </span>
                      </Chip>
                    );
                  })}
                </div>

                {/* Context filters */}
                <div
                  className={cx(
                    "flex items-center gap-2 overflow-x-auto no-scrollbar",
                    dir === "rtl" ? "flex-row-reverse" : "flex-row",
                  )}
                >
                  <div
                    className={cx(
                      "inline-flex items-center gap-2 text-[11px] font-bold text-foreground-muted",
                      dir === "rtl" ? "flex-row-reverse" : "flex-row",
                    )}
                  >
                    <IoFilter className="text-[14px]" />
                    <span>{ui.filtersLabel}:</span>
                  </div>

                  {tab.filters.map((g) => {
                    const value = g.id === "filterA" ? filterA : filterB;
                    const setValue =
                      g.id === "filterA" ? setFilterA : setFilterB;

                    return (
                      <div
                        key={g.id}
                        className={cx(
                          "flex items-center gap-2",
                          dir === "rtl" ? "flex-row-reverse" : "flex-row",
                        )}
                      >
                        <span className="text-[11px] font-semibold text-foreground-muted">
                          {g.label[dir === "rtl" ? "ar" : "en"]}
                        </span>

                        <div className="flex items-center gap-2">
                          {g.options.map((o) => (
                            <Chip
                              key={o.id}
                              active={o.id === value}
                              onClick={() => {
                                setValue(o.id);
                                setVisibleCount(28);
                              }}
                            >
                              {o.label[dir === "rtl" ? "ar" : "en"]}
                            </Chip>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {/* Reset */}
                  <div className="shrink-0">
                    <DeButton
                      variant="soft"
                      tone="neutral"
                      size="sm"
                      leftIcon={<IoRefreshOutline className="text-[16px]" />}
                      onClick={() => {
                        setFilterA(tab.filters[0]?.defaultValue ?? "all");
                        setFilterB(tab.filters[1]?.defaultValue ?? "all");
                        setSort("top");
                        setMetric(tab.defaultMetric);
                        setVisibleCount(28);
                      }}
                    >
                      {ui.reset}
                    </DeButton>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="mt-6">
            {state === "loading" && (
              <div className="space-y-4">
                <RanksTop3Skeleton />
                <RanksListSkeleton rows={10} />
              </div>
            )}

            {state === "error" && (
              <div className="rounded-3xl border border-border-subtle bg-background-elevated/60 p-6">
                <div
                  className={cx(
                    "flex items-start gap-4",
                    dir === "rtl"
                      ? "flex-row-reverse text-right"
                      : "flex-row text-left",
                  )}
                >
                  <div className="grid size-12 shrink-0 place-items-center rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-600">
                    <IoAlertCircleOutline className="text-[22px]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-base font-black text-foreground-strong">
                      {ui.errorTitle}
                    </div>
                    <div className="mt-1 text-sm font-medium text-foreground-muted">
                      {ui.errorDesc}
                    </div>

                    <div className="mt-4 flex gap-2">
                      <DeButton
                        variant="solid"
                        tone="brand"
                        leftIcon={<IoRefreshOutline className="text-[16px]" />}
                        onClick={() => load()}
                      >
                        {ui.retry}
                      </DeButton>

                      <DeButton
                        variant="soft"
                        tone="neutral"
                        onClick={() => {
                          setSort("top");
                          setMetric(tab.defaultMetric);
                          setFilterA(tab.filters[0]?.defaultValue ?? "all");
                          setFilterB(tab.filters[1]?.defaultValue ?? "all");
                        }}
                      >
                        {ui.reset}
                      </DeButton>
                    </div>

                    {/* dev hint: deterministic error combo */}
                    {errorMsg && (
                      <div className="mt-3 text-[11px] font-semibold text-foreground-muted">
                        {dir === "rtl"
                          ? "ملاحظة (للاختبار): استوديوهات + 24h + Output + Worst يفعّل حالة الخطأ."
                          : "Dev note: Studios + 24h + Output + Worst triggers error state."}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {state === "empty" && (
              <div className="rounded-3xl border border-border-subtle bg-background-elevated/60 p-6">
                <div
                  className={cx(
                    "flex items-start gap-4",
                    dir === "rtl"
                      ? "flex-row-reverse text-right"
                      : "flex-row text-left",
                  )}
                >
                  <div className="grid size-12 shrink-0 place-items-center rounded-2xl border border-border-subtle bg-surface-soft text-foreground-muted">
                    <IoFilter className="text-[22px]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-base font-black text-foreground-strong">
                      {ui.emptyTitle}
                    </div>
                    <div className="mt-1 text-sm font-medium text-foreground-muted">
                      {ui.emptyDesc}
                    </div>

                    <div className="mt-4">
                      <DeButton
                        variant="solid"
                        tone="brand"
                        leftIcon={<IoRefreshOutline className="text-[16px]" />}
                        onClick={() => {
                          setFilterA("all");
                          setFilterB("all");
                          setSort("top");
                          setMetric(tab.defaultMetric);
                        }}
                      >
                        {ui.reset}
                      </DeButton>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {state === "ready" && (
              <div className="space-y-5">
                <PodiumTop3
                  items={items}
                  metricFormat={metricFormat}
                  dir={dir}
                  reduceMotion={Boolean(reduceMotion)}
                />

                {/* List */}
                <div className="rounded-3xl border border-border-subtle bg-background-elevated/45 p-3">
                  <div
                    className={cx(
                      "mb-3 flex items-center justify-between gap-2",
                      dir === "rtl" ? "flex-row-reverse" : "flex-row",
                    )}
                  >
                    <div className="flex items-center gap-2 text-xs font-black text-foreground-strong">
                      <span className="rounded-full border border-border-subtle bg-surface-soft px-2 py-1">
                        {ui.top100}
                      </span>
                      <span className="text-foreground-muted">
                        {dir === "rtl" ? "قائمة كاملة" : "Full list"}
                      </span>
                    </div>

                    <div className="text-[11px] font-semibold text-foreground-muted">
                      {dir === "rtl"
                        ? `المعروض: ${visibleItems.length} / ${items.length}`
                        : `Showing: ${visibleItems.length} / ${items.length}`}
                    </div>
                  </div>

                  <motion.ul
                    className="flex flex-col gap-2"
                    initial={false}
                    animate="visible"
                    variants={{
                      visible: {
                        transition: reduceMotion
                          ? undefined
                          : {
                              staggerChildren: 0.02,
                            },
                      },
                    }}
                  >
                    <AnimatePresence mode="popLayout" initial={false}>
                      {visibleItems.map((it) => (
                        <motion.div
                          key={it.id}
                          layout
                          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                          animate={
                            reduceMotion ? undefined : { opacity: 1, y: 0 }
                          }
                          exit={reduceMotion ? undefined : { opacity: 0, y: 8 }}
                          transition={{
                            ...spring,
                            delay:
                              !reduceMotion && it.rank <= 10
                                ? Math.min(0.05 * it.rank, 0.5)
                                : 0,
                          }}
                        >
                          <RowCard
                            item={it}
                            metricFormat={metricFormat}
                            dir={dir}
                            reduceMotion={Boolean(reduceMotion)}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.ul>

                  {/* Sentinel for progressive rendering */}
                  <div ref={sentinelRef} className="h-6" />

                  {/* Load more */}
                  {canLoadMore && (
                    <div className="mt-4 flex justify-center">
                      <DeButton
                        variant="soft"
                        tone="neutral"
                        onClick={() =>
                          setVisibleCount((c) => Math.min(items.length, c + 18))
                        }
                        leftIcon={<IoTrendingUp className="text-[16px]" />}
                      >
                        {ui.loadMore}
                      </DeButton>
                    </div>
                  )}

                  {!canLoadMore && (
                    <div className="mt-4 text-center text-[11px] font-semibold text-foreground-muted">
                      {dir === "rtl" ? "وصلت للنهاية ✨" : "That’s all ✨"}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}
