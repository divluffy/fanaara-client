// features\anime\AnimeMainPage.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import {
  IoAdd,
  IoCalendarOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoCheckmarkCircle,
  IoEyeOutline,
  IoFlameOutline,
  IoHeartOutline,
  IoInformationCircleOutline,
  IoShieldCheckmarkOutline,
  IoStar,
  IoTimeOutline,
  IoTrendingUpOutline,
  IoWarningOutline,
} from "react-icons/io5";

import { Button } from "@/design/DeButton";
import { Avatar } from "@/design/DeAvatar";
import { SmartSelect, type SelectOption } from "@/design/DeSelect";

/* =========================================================
   Types (Jikan minimal)
   ========================================================= */

type JikanResponse<T> = { data: T };

type JikanImageUrls = {
  image_url?: string | null;
  small_image_url?: string | null;
  large_image_url?: string | null;
};

type JikanImages = {
  jpg?: JikanImageUrls;
  webp?: JikanImageUrls;
};

type JikanNamed = {
  mal_id: number;
  type?: string;
  name: string;
  url: string;
};

type JikanTrailer = {
  url?: string | null;
  embed_url?: string | null;
  youtube_id?: string | null;
};

type JikanBroadcast = {
  day?: string | null;
  time?: string | null;
  timezone?: string | null;
  string?: string | null;
};

type JikanAnime = {
  mal_id: number;
  url: string;

  images: JikanImages;

  title: string;
  title_english?: string | null;
  title_japanese?: string | null;

  type?: string | null;
  source?: string | null;
  episodes?: number | null;
  duration?: string | null;

  rating?: string | null;
  score?: number | null;
  scored_by?: number | null;

  rank?: number | null;
  popularity?: number | null;
  members?: number | null;
  favorites?: number | null;

  synopsis?: string | null;

  season?: string | null;
  year?: number | null;

  studios?: JikanNamed[];
  genres?: JikanNamed[];
  themes?: JikanNamed[];
  demographics?: JikanNamed[];

  broadcast?: JikanBroadcast | null;
  trailer?: JikanTrailer | null;

  // present in /full
  streaming?: Array<{ name: string; url: string }> | null;
};

type JikanGenre = {
  mal_id: number;
  name: string;
  url: string;
  count: number;
};

/* =========================================================
   Constants / Helpers
   ========================================================= */

const JIKAN_BASE = "https://api.jikan.moe/v4";

// Lightweight in-memory cache (client)
const jikanCache = new Map<string, any>();

function cn(...x: Array<string | false | null | undefined>) {
  return x.filter(Boolean).join(" ");
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchJson<T>(url: string, signal?: AbortSignal, attempt = 0) {
  if (jikanCache.has(url)) return jikanCache.get(url) as T;

  const res = await fetch(url, {
    signal,
    headers: { Accept: "application/json" },
  });

  // Jikan rate limit can return 429. Retry a few times.
  if (res.status === 429 && attempt < 3) {
    await sleep(650 * (attempt + 1));
    return fetchJson<T>(url, signal, attempt + 1);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Jikan error ${res.status}: ${text.slice(0, 140)}`);
  }

  const json = (await res.json()) as T;
  jikanCache.set(url, json);
  return json;
}

function jikanGet<T>(path: string, signal?: AbortSignal) {
  return fetchJson<T>(`${JIKAN_BASE}${path}`, signal);
}

function pickImage(images?: JikanImages | null) {
  return (
    images?.jpg?.large_image_url ||
    images?.webp?.large_image_url ||
    images?.jpg?.image_url ||
    images?.webp?.image_url ||
    ""
  );
}

function compactNumber(n?: number | null) {
  if (!n || n <= 0) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

function cap(s?: string | null) {
  if (!s) return "";
  return s.slice(0, 1).toUpperCase() + s.slice(1);
}

function toArabicSeason(season?: string | null) {
  const s = (season ?? "").toLowerCase();
  if (s === "winter") return "شتاء";
  if (s === "spring") return "ربيع";
  if (s === "summer") return "صيف";
  if (s === "fall" || s === "autumn") return "خريف";
  return season ? cap(season) : "—";
}

function inferSeasonNumber(title: string) {
  // Best-effort parsing for "Season 2", "2nd Season", "Part 2"...
  const patterns: RegExp[] = [
    /season\s*(\d+)/i,
    /(\d+)(?:st|nd|rd|th)\s*season/i,
    /part\s*(\d+)/i,
    /(\d+)\s*part/i,
  ];

  for (const re of patterns) {
    const m = title.match(re);
    if (m?.[1]) {
      const n = Number(m[1]);
      if (Number.isFinite(n) && n > 0 && n < 20) return n;
    }
  }
  return 1;
}

function clampText(text?: string | null, max = 220) {
  const t = (text ?? "").replace(/\s+/g, " ").trim();
  if (!t) return "";
  if (t.length <= max) return t;
  return t.slice(0, max - 1).trimEnd() + "…";
}

type ContentChip = {
  key: string;
  label: string;
  tone: "success" | "warning" | "danger" | "info";
  icon: React.ReactNode;
};

function contentWarnings(anime: JikanAnime): ContentChip[] {
  const rating = (anime.rating ?? "").toLowerCase();
  const out: ContentChip[] = [];

  // Simple heuristics based on MAL rating string
  const isExplicit =
    rating.includes("rx") || rating.includes("hentai") || rating.includes("r+");
  const isMature17 = rating.includes("r - 17") || rating.includes("17");
  const isTeen = rating.includes("pg-13") || rating.includes("teens");

  if (isExplicit) {
    out.push({
      key: "adult",
      label: "محتوى للكبار",
      tone: "danger",
      icon: <IoWarningOutline className="size-4" />,
    });
    out.push({
      key: "sexual",
      label: "محتوى جنسي",
      tone: "danger",
      icon: <IoWarningOutline className="size-4" />,
    });
    out.push({
      key: "violence",
      label: "عنف قوي",
      tone: "warning",
      icon: <IoFlameOutline className="size-4" />,
    });
    return out;
  }

  if (isMature17) {
    out.push({
      key: "violence",
      label: "عنف / مشاهد قوية",
      tone: "warning",
      icon: <IoFlameOutline className="size-4" />,
    });
    out.push({
      key: "lang",
      label: "لغة قوية",
      tone: "warning",
      icon: <IoWarningOutline className="size-4" />,
    });
    return out;
  }

  if (isTeen) {
    out.push({
      key: "mild",
      label: "عنف خفيف",
      tone: "info",
      icon: <IoInformationCircleOutline className="size-4" />,
    });
    out.push({
      key: "teen",
      label: "مناسب للمراهقين",
      tone: "info",
      icon: <IoInformationCircleOutline className="size-4" />,
    });
    return out;
  }

  // default safe
  out.push({
    key: "safe",
    label: "آمن للمشاهدة (غالبًا)",
    tone: "success",
    icon: <IoShieldCheckmarkOutline className="size-4" />,
  });

  return out;
}

function chipToneClasses(tone: ContentChip["tone"]) {
  if (tone === "success")
    return "bg-success-soft border-success-soft-border text-foreground-strong";
  if (tone === "warning")
    return "bg-warning-soft border-warning-soft-border text-foreground-strong";
  if (tone === "danger")
    return "bg-danger-soft border-danger-soft-border text-foreground-strong";
  return "bg-info-soft border-info-soft-border text-foreground-strong";
}

function resolveWatchUrl(a: JikanAnime) {
  const streamingUrl = a.streaming?.[0]?.url;
  const trailerUrl = a.trailer?.url ?? a.trailer?.embed_url;
  // If no streaming/trailer, we consider MAL page as "read more" only
  return streamingUrl || trailerUrl || "";
}

type Dir = "rtl" | "ltr";

function useDocDir(fallback: Dir = "rtl") {
  const [dir, setDir] = useState<Dir>(fallback);

  useEffect(() => {
    const d = document?.documentElement?.getAttribute("dir");
    setDir(d === "ltr" ? "ltr" : "rtl");
  }, []);

  return dir;
}

/* =========================================================
   Page Tabs
   ========================================================= */

type HomeTabId = "latest" | "genres" | "season" | "schedule";

const HOME_TABS: Array<{
  id: HomeTabId;
  label: string;
  icon: React.ReactNode;
}> = [
  {
    id: "latest",
    label: "آخر المضاف",
    icon: <IoTrendingUpOutline className="size-4" />,
  },
  {
    id: "genres",
    label: "التصنيفات",
    icon: <IoStar className="size-4" />,
  },
  {
    id: "season",
    label: "أنميات الموسم",
    icon: <IoCalendarOutline className="size-4" />,
  },
  {
    id: "schedule",
    label: "جدول العرض",
    icon: <IoTimeOutline className="size-4" />,
  },
];

/* =========================================================
   Demo “friends / editors” (real images from internet)
   Replace later with your real users.
   ========================================================= */

type Person = {
  id: string;
  name: string;
  avatar: string;
  blurHash?: string;
};

const FRIENDS: Person[] = [
  {
    id: "u1",
    name: "Mina",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    id: "u2",
    name: "Omar",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: "u3",
    name: "Sara",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: "u4",
    name: "Yousef",
    avatar: "https://randomuser.me/api/portraits/men/76.jpg",
  },
  {
    id: "u5",
    name: "Lina",
    avatar: "https://randomuser.me/api/portraits/women/12.jpg",
  },
  {
    id: "u6",
    name: "Khaled",
    avatar: "https://randomuser.me/api/portraits/men/13.jpg",
  },
];

const EDITORS: Person[] = [
  {
    id: "e1",
    name: "Fanaara Team",
    avatar: "https://randomuser.me/api/portraits/men/54.jpg",
  },
  {
    id: "e2",
    name: "Aya",
    avatar: "https://randomuser.me/api/portraits/women/39.jpg",
  },
  {
    id: "e3",
    name: "Hassan",
    avatar: "https://randomuser.me/api/portraits/men/8.jpg",
  },
];

/* =========================================================
   Main Page
   ========================================================= */

export default function AnimeHomePage() {
  const dir = useDocDir("rtl");
  const reduceMotion = useReducedMotion();

  const [tab, setTab] = useState<HomeTabId>("latest");

  // Quick-add state (for demo)
  const [quickAddedIds, setQuickAddedIds] = useState<Set<number>>(
    () => new Set(),
  );

  const toggleQuickAdd = (id: number) => {
    setQuickAddedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div dir={dir} className="min-h-screen bg-background text-foreground">
      {/* Subtle background layer (uses your theme tokens) */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_0%,color-mix(in_srgb,var(--brand-400)_18%,transparent),transparent_70%)]" />
        {!reduceMotion && (
          <div className="absolute -top-20 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_30%_30%,color-mix(in_srgb,var(--purple-500)_22%,transparent),transparent_55%),radial-gradient(circle_at_70%_30%,color-mix(in_srgb,var(--brand-400)_18%,transparent),transparent_55%),radial-gradient(circle_at_50%_70%,color-mix(in_srgb,var(--pink-500)_14%,transparent),transparent_60%)] blur-3xl opacity-60 animate-aurora-lite" />
        )}
      </div>

      <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 lg:px-6">
        {/* HERO */}
        <HeroFeatured
          dir={dir}
          quickAddedIds={quickAddedIds}
          onToggleQuickAdd={toggleQuickAdd}
        />

        {/* Tabs section (Buttons only) */}
        <section className="mt-5">
          <TabsBar dir={dir} tab={tab} onChange={setTab} />
        </section>

        {/* Content (based on selected tab) */}
        <section className="mt-5 pb-14 sm:pb-16">
          <AnimatePresence mode="wait" initial={false}>
            {tab === "latest" && (
              <motion.div
                key="latest"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: reduceMotion ? 0 : 0.18 }}
                className="space-y-8"
              >
                <LatestTab
                  dir={dir}
                  quickAddedIds={quickAddedIds}
                  onToggleQuickAdd={toggleQuickAdd}
                />
              </motion.div>
            )}

            {tab === "genres" && (
              <motion.div
                key="genres"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: reduceMotion ? 0 : 0.18 }}
                className="space-y-8"
              >
                <GenresTab
                  dir={dir}
                  quickAddedIds={quickAddedIds}
                  onToggleQuickAdd={toggleQuickAdd}
                />
              </motion.div>
            )}

            {tab === "season" && (
              <motion.div
                key="season"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: reduceMotion ? 0 : 0.18 }}
                className="space-y-8"
              >
                <SeasonTab
                  dir={dir}
                  quickAddedIds={quickAddedIds}
                  onToggleQuickAdd={toggleQuickAdd}
                />
              </motion.div>
            )}

            {tab === "schedule" && (
              <motion.div
                key="schedule"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: reduceMotion ? 0 : 0.18 }}
                className="space-y-8"
              >
                <ScheduleTab dir={dir} />
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
}

/* =========================================================
   HERO SECTION
   - height <= 70% viewport
   - background slider (Embla) + fixed overlay content
   - mini slider fixed on md & mobile (lg:hidden)
   ========================================================= */

function HeroFeatured(props: {
  dir: Dir;
  quickAddedIds: Set<number>;
  onToggleQuickAdd: (id: number) => void;
}) {
  const { dir, quickAddedIds, onToggleQuickAdd } = props;
  const reduceMotion = useReducedMotion();

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    skipSnaps: false,
  });

  const [featured, setFeatured] = useState<JikanAnime[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [selectedIndex, setSelectedIndex] = useState(0);

  // Autoplay (gentle)
  const autoPlayRef = useRef<number | null>(null);
  const stopAuto = () => {
    if (autoPlayRef.current) window.clearInterval(autoPlayRef.current);
    autoPlayRef.current = null;
  };
  const startAuto = () => {
    stopAuto();
    if (reduceMotion) return;
    autoPlayRef.current = window.setInterval(() => {
      emblaApi?.scrollNext();
    }, 6200);
  };

  // Fetch featured list (Top 7) then enrich with /full for richer fields
  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const top = await jikanGet<JikanResponse<JikanAnime[]>>(
          `/top/anime?limit=7`,
          ac.signal,
        );

        const ids = (top.data ?? []).slice(0, 7).map((a) => a.mal_id);

        const full: JikanAnime[] = [];
        for (const id of ids) {
          const res = await jikanGet<JikanResponse<JikanAnime>>(
            `/anime/${id}/full`,
            ac.signal,
          );
          full.push(res.data);
          // throttle a bit
          await sleep(210);
        }

        if (!ac.signal.aborted) setFeatured(full);
      } catch (e: any) {
        if (!ac.signal.aborted) setErr(e?.message || "Failed to load featured");
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();

    return () => ac.abort();
  }, []);

  // Sync selected index with Embla
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      const idx = emblaApi.selectedScrollSnap();
      setSelectedIndex(idx);
      startAuto();
    };

    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    // initial
    onSelect();
    startAuto();

    return () => {
      stopAuto();
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, reduceMotion]);

  const active = featured[selectedIndex] ?? null;

  const scrollPrev = () => {
    stopAuto();
    emblaApi?.scrollPrev();
  };
  const scrollNext = () => {
    stopAuto();
    emblaApi?.scrollNext();
  };

  const goTo = (idx: number) => {
    stopAuto();
    emblaApi?.scrollTo(idx);
  };

  return (
    <section className="mt-4">
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl border border-border-subtle",
          "bg-background-elevated shadow-[var(--shadow-elevated)]",
        )}
        style={{
          // strict: hero <= 70% viewport height
          height: "70svh",
          maxHeight: "70svh",
          minHeight: 420,
        }}
        onMouseEnter={() => stopAuto()}
        onMouseLeave={() => startAuto()}
      >
        {/* Background slider */}
        <div className="absolute inset-0">
          <div className="h-full w-full overflow-hidden" ref={emblaRef}>
            <div className="flex h-full">
              {(featured.length ? featured : new Array(7).fill(null)).map(
                (a, i) => (
                  <div
                    key={a?.mal_id ?? `sk-${i}`}
                    className="relative h-full min-w-0 flex-[0_0_100%]"
                  >
                    {a ? (
                      <img
                        src={pickImage(a.images)}
                        alt={a.title}
                        className="absolute inset-0 h-full w-full object-cover"
                        loading={i === 0 ? "eager" : "lazy"}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_10%,color-mix(in_srgb,var(--brand-400)_22%,transparent),transparent_60%)]" />
                    )}

                    {/* Soft overlay gradient from corner to corner (text readability) */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/70 via-black/35 to-black/55" />
                    <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_55%_30%,transparent,rgba(0,0,0,0.35))]" />
                  </div>
                ),
              )}
            </div>
          </div>

          {/* Subtle “glass edge” */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />
        </div>

        {/* Overlay content (fixed) */}
        <div className="absolute inset-0">
          {/* Top controls */}
          <div className="absolute inset-x-0 top-0 z-20 p-3 sm:p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Button
                  iconOnly
                  aria-label="Prev"
                  variant="inverse"
                  size="md"
                  onClick={scrollPrev}
                  className="backdrop-blur-md"
                >
                  <IoChevronBackOutline className="size-5 rtl:rotate-180" />
                </Button>
                <Button
                  iconOnly
                  aria-label="Next"
                  variant="inverse"
                  size="md"
                  onClick={scrollNext}
                  className="backdrop-blur-md"
                >
                  <IoChevronForwardOutline className="size-5 rtl:rotate-180" />
                </Button>
              </div>

              <div className="hidden sm:flex items-center gap-2">
                <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] text-white/90 backdrop-blur-md">
                  عرض خاص •{" "}
                  {featured.length
                    ? `${selectedIndex + 1}/${featured.length}`
                    : "—"}
                </div>
                <Link href="/anime">
                  <Button
                    variant="inverse"
                    size="sm"
                    className="backdrop-blur-md"
                  >
                    رؤية المزيد
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Main hero body */}
          <div className="relative z-10 flex h-full items-end lg:items-center">
            <div className="w-full px-3 pb-24 sm:px-4 sm:pb-20 lg:px-6 lg:pb-0">
              <div className="mx-auto w-full max-w-7xl">
                <AnimatePresence mode="wait" initial={false}>
                  {loading ? (
                    <HeroSkeleton key="hero-skel" />
                  ) : err ? (
                    <HeroError key="hero-err" msg={err} />
                  ) : active ? (
                    <HeroDetails
                      key={active.mal_id}
                      dir={dir}
                      anime={active}
                      selectedIndex={selectedIndex}
                      total={featured.length}
                      isQuickAdded={quickAddedIds.has(active.mal_id)}
                      onToggleQuickAdd={() => onToggleQuickAdd(active.mal_id)}
                    />
                  ) : (
                    <HeroError
                      key="hero-empty"
                      msg="No featured anime found."
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Mini slider over slider (fixed) - md & phone only */}
          <div className="absolute inset-x-0 bottom-0 z-30 lg:hidden">
            <div className="px-3 pb-3 sm:px-4 sm:pb-4">
              <MiniThumbs
                dir={dir}
                items={featured}
                selectedIndex={selectedIndex}
                onSelect={goTo}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
      <div className="space-y-3">
        <div className="h-9 w-3/4 rounded-xl bg-white/10" />
        <div className="h-4 w-2/3 rounded-lg bg-white/10" />
        <div className="h-5 w-1/2 rounded-lg bg-white/10" />
        <div className="h-16 w-full rounded-2xl bg-white/10" />
        <div className="flex flex-wrap gap-2">
          {new Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-8 w-28 rounded-full bg-white/10" />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="h-24 w-full rounded-2xl bg-white/10" />
        <div className="h-12 w-full rounded-2xl bg-white/10" />
      </div>
    </div>
  );
}

function HeroError({ msg }: { msg: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/35 p-4 text-white backdrop-blur-md">
      <div className="text-sm font-semibold">تعذر تحميل العرض الخاص</div>
      <div className="mt-1 text-xs text-white/80">{msg}</div>
      <div className="mt-3">
        <Link href="/anime">
          <Button variant="inverse" size="sm">
            فتح صفحة الأنميات
          </Button>
        </Link>
      </div>
    </div>
  );
}

function HeroDetails(props: {
  dir: Dir;
  anime: JikanAnime;
  selectedIndex: number;
  total: number;
  isQuickAdded: boolean;
  onToggleQuickAdd: () => void;
}) {
  const { dir, anime, isQuickAdded, onToggleQuickAdd } = props;
  const reduceMotion = useReducedMotion();

  const title = anime.title_english || anime.title;
  const genres = (anime.genres ?? []).slice(0, 4).map((g) => g.name);
  const studio = anime.studios?.[0]?.name || "—";
  const score = anime.score ?? null;

  const seasonLabel = toArabicSeason(anime.season);
  const year = anime.year ?? "—";
  const type = anime.type ?? "—";
  const episodes = anime.episodes ?? "—";
  const rating = anime.rating ?? "—";
  const seasonNo = inferSeasonNumber(anime.title);

  const synopsis = clampText(anime.synopsis, 220);

  const watchUrl = resolveWatchUrl(anime);
  const hasWatch = Boolean(watchUrl);

  const warn = contentWarnings(anime);

  const addedAt = useMemo(() => {
    // Demo: use today's date
    try {
      return new Date().toLocaleDateString("ar", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
    } catch {
      return "اليوم";
    }
  }, []);

  // “friends who liked it” — demo picks 4
  const friends = useMemo(() => {
    const shuffled = [...FRIENDS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4);
  }, [anime.mal_id]);

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
      transition={{ duration: reduceMotion ? 0 : 0.18, ease: "easeOut" }}
      className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr] lg:items-end"
    >
      {/* Left */}
      <div className="min-w-0 space-y-3">
        {/* Title + score */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-[22px] font-extrabold leading-tight text-white sm:text-[28px] lg:text-[32px]">
              <bdi className="block truncate">{title}</bdi>
            </h1>

            <div className="mt-1 text-xs text-white/75">
              <bdi className="truncate">
                {anime.title_japanese ? anime.title_japanese : ""}
              </bdi>
            </div>
          </div>

          <div className="shrink-0">
            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-white backdrop-blur-md">
              <IoStar className="size-4 text-yellow-300" />
              <span className="text-sm font-bold tabular-nums">
                {score ? score.toFixed(1) : "—"}
              </span>
              <span className="text-xs text-white/70">
                {anime.scored_by ? `(${compactNumber(anime.scored_by)})` : ""}
              </span>
            </div>

            <div className="mt-2 flex justify-end">
              <div className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] text-white/80 backdrop-blur-md">
                رتبة #{anime.rank ?? "—"} • شعبية #{anime.popularity ?? "—"}
              </div>
            </div>
          </div>
        </div>

        {/* Genres line */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-white/85">
          {genres.length ? (
            <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 backdrop-blur-md">
              {genres.join(" • ")}
            </span>
          ) : (
            <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 backdrop-blur-md">
              بدون تصنيفات واضحة
            </span>
          )}
        </div>

        {/* Facts line (direct values) */}
        <div className="flex flex-wrap items-center gap-2 text-[12px] text-white/85">
          <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 backdrop-blur-md">
            {seasonLabel} {year}
          </span>
          <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 backdrop-blur-md">
            {type}
          </span>
          <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 backdrop-blur-md">
            {episodes} حلقة
          </span>
          <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 backdrop-blur-md">
            {rating}
          </span>
          <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 backdrop-blur-md">
            S{seasonNo}
          </span>
        </div>

        {/* Synopsis (max 2 lines visually) */}
        <p
          className="text-[13px] leading-relaxed text-white/80 sm:text-sm"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {synopsis || "لا يوجد وصف متاح حالياً."}
        </p>

        {/* Info “buttons” (non-click) */}
        <div className="flex flex-wrap gap-2">
          <InfoPill icon={<IoInformationCircleOutline className="size-4" />}>
            استوديو: {studio}
          </InfoPill>
          <InfoPill icon={<IoEyeOutline className="size-4" />}>
            مشاهدات: {compactNumber(anime.members)}
          </InfoPill>
          <InfoPill icon={<IoTrendingUpOutline className="size-4" />}>
            الشعبية: #{anime.popularity ?? "—"}
          </InfoPill>
          <InfoPill icon={<IoStar className="size-4" />}>
            التقييم: {anime.score ? anime.score.toFixed(1) : "—"}
          </InfoPill>
          <InfoPill icon={<IoHeartOutline className="size-4" />}>
            إعجابات: {compactNumber(anime.favorites)}
          </InfoPill>
        </div>

        {/* Warnings */}
        <div className="mt-1 flex flex-wrap gap-2">
          {warn.map((w) => (
            <span
              key={w.key}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[12px] backdrop-blur-md",
                "bg-black/25 border-white/10 text-white/90",
              )}
            >
              <span
                className={cn(
                  "inline-flex",
                  w.tone === "danger"
                    ? "text-rose-200"
                    : w.tone === "warning"
                      ? "text-amber-200"
                      : w.tone === "success"
                        ? "text-emerald-200"
                        : "text-sky-200",
                )}
              >
                {w.icon}
              </span>
              <span>{w.label}</span>
            </span>
          ))}
        </div>

        {/* Social proof row */}
        <div className="mt-2 rounded-2xl border border-white/10 bg-black/25 p-3 backdrop-blur-md">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs font-semibold text-white/90">
              أعجب به أشخاص تتابعهم
            </div>
            <div className="text-[11px] text-white/70">
              +{Math.floor(Math.random() * 120) + 12} تفاعل
            </div>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <div className="flex -space-x-2 rtl:space-x-reverse">
              {friends.map((p) => (
                <Avatar
                  key={p.id}
                  src={p.avatar}
                  size="10"
                  rounded
                  effects
                  className="ring-2 ring-black/25"
                  name={p.name}
                />
              ))}
            </div>
            <div className="min-w-0 text-[12px] text-white/80">
              <bdi className="truncate">
                {friends.map((f) => f.name).join("، ")} وغيرهم
              </bdi>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {hasWatch ? (
            <a href={watchUrl} target="_blank" rel="noreferrer">
              <Button variant="gradient" tone="brand" size="lg">
                مشاهدة الآن
              </Button>
            </a>
          ) : (
            <Button variant="inverse" tone="neutral" size="lg" disabled>
              مشاهدة الآن (غير متاح)
            </Button>
          )}

          <Button
            iconOnly
            aria-label="Quick add"
            variant={isQuickAdded ? "solid" : "inverse"}
            tone={isQuickAdded ? "success" : "neutral"}
            size="lg"
            onClick={onToggleQuickAdd}
            className="backdrop-blur-md"
          >
            {isQuickAdded ? (
              <IoCheckmarkCircle className="size-6" />
            ) : (
              <IoAdd className="size-6" />
            )}
          </Button>

          <Link href={`/anime/${anime.mal_id}`}>
            <Button variant="inverse" size="lg" className="backdrop-blur-md">
              قراءة المزيد
            </Button>
          </Link>
        </div>
      </div>

      {/* Right: “added by” card + quick meta */}
      <div className="space-y-3">
        {/* Added by card */}
        <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-white backdrop-blur-md">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 text-sm font-bold">
                <IoCheckmarkCircle className="size-5 text-emerald-300" />
                <span>تمت الإضافة</span>
              </div>
              <div className="mt-1 text-xs text-white/75">
                بواسطة:{" "}
                <bdi className="font-semibold text-white/90">
                  {EDITORS.map((e) => e.name)
                    .slice(0, 2)
                    .join(" • ")}
                </bdi>{" "}
                • {addedAt}
              </div>
            </div>

            <div className="flex -space-x-2 rtl:space-x-reverse">
              {EDITORS.map((p) => (
                <Avatar
                  key={p.id}
                  src={p.avatar}
                  size="10"
                  rounded
                  effects
                  className="ring-2 ring-black/25"
                  name={p.name}
                />
              ))}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <MiniMetaPill label="المصدر" value={anime.source || "—"} />
            <MiniMetaPill
              label="البث"
              value={
                anime.broadcast?.string ? anime.broadcast.string : "غير محدد"
              }
            />
            <MiniMetaPill
              label="المدة"
              value={anime.duration ? anime.duration : "—"}
            />
          </div>
        </div>

        {/* Extra highlight cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-white backdrop-blur-md">
            <div className="text-xs text-white/75">لماذا هذا العمل؟</div>
            <div className="mt-1 text-sm font-semibold">
              ترند عالي + تقييم قوي + تفاعل مجتمع
            </div>
            <div className="mt-2 text-[12px] text-white/75">
              استكشف المراجعات والنقاشات داخل Fanaara.
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-white backdrop-blur-md">
            <div className="flex items-center gap-2">
              <IoFlameOutline className="size-5 text-amber-200" />
              <div className="text-sm font-semibold">Hot this week</div>
            </div>
            <div className="mt-2 flex items-center justify-between text-[12px] text-white/75">
              <span>مشاهدات</span>
              <span className="tabular-nums">
                {compactNumber((anime.members ?? 0) + 340_000)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function InfoPill(props: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full",
        "border border-white/10 bg-white/10 px-3 py-1.5",
        "text-[12px] text-white/90 backdrop-blur-md",
      )}
    >
      <span className="text-white/80">{props.icon}</span>
      <span className="font-semibold">{props.children}</span>
    </span>
  );
}

function MiniMetaPill(props: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-white/10 bg-black/25 px-3 py-2">
      <div className="text-[10px] text-white/70">{props.label}</div>
      <div className="mt-0.5 truncate text-[12px] font-semibold text-white/90">
        <bdi className="truncate">{props.value}</bdi>
      </div>
    </div>
  );
}

function MiniThumbs(props: {
  dir: Dir;
  items: JikanAnime[];
  selectedIndex: number;
  onSelect: (idx: number) => void;
}) {
  const { items, selectedIndex, onSelect } = props;

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/35 p-2 backdrop-blur-md">
        <div className="h-14 rounded-xl bg-white/10" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-black/35 p-2 backdrop-blur-md">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {items.map((a, idx) => {
          const active = idx === selectedIndex;
          return (
            <button
              key={a.mal_id}
              type="button"
              onClick={() => onSelect(idx)}
              className={cn(
                "relative shrink-0 overflow-hidden rounded-xl border transition",
                "h-14 w-[92px]",
                active
                  ? "border-white/40 shadow-[0_0_0_2px_rgba(255,255,255,0.15)]"
                  : "border-white/10 opacity-85 hover:opacity-100",
              )}
              aria-label={`Select ${a.title}`}
            >
              <img
                src={pickImage(a.images)}
                alt={a.title}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
              <div className="absolute inset-x-2 bottom-1">
                <div className="truncate text-[11px] font-semibold text-white">
                  <bdi className="truncate">{a.title_english || a.title}</bdi>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   Tabs bar (Buttons only)
   ========================================================= */

function TabsBar(props: {
  dir: Dir;
  tab: HomeTabId;
  onChange: (tab: HomeTabId) => void;
}) {
  const { tab, onChange } = props;

  return (
    <div
      className={cn(
        "rounded-2xl border border-border-subtle bg-background-elevated",
        "shadow-[var(--shadow-sm)]",
        "p-2 sm:p-2.5",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        {HOME_TABS.map((t) => {
          const active = t.id === tab;
          return (
            <Button
              key={t.id}
              variant={active ? "solid" : "soft"}
              tone={active ? "brand" : "neutral"}
              size="md"
              leftIcon={t.icon}
              onClick={() => onChange(t.id)}
              className={cn(
                "transition",
                active ? "shadow-[var(--shadow-glow-brand)]" : "",
              )}
            >
              {t.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   Shared Carousel Section + AnimeCard
   - arrows side-by-side
   - title/note on the other side
   - see more button included
   ========================================================= */

function SectionCarousel(props: {
  dir: Dir;
  title: string;
  note: string;
  hrefMore: string;
  items: JikanAnime[];
  loading?: boolean;
  emptyText?: string;

  quickAddedIds: Set<number>;
  onToggleQuickAdd: (id: number) => void;
}) {
  const {
    dir,
    title,
    note,
    hrefMore,
    items,
    loading,
    emptyText,
    quickAddedIds,
    onToggleQuickAdd,
  } = props;
  const reduceMotion = useReducedMotion();

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    skipSnaps: false,
    dragFree: true,
  });

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  const hasItems = items?.length > 0;

  return (
    <div className="space-y-3">
      {/* Header row: arrows + title/note + see more */}
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-bold text-foreground-strong sm:text-base">
            {title}
          </div>
          <div
            className="mt-1 text-xs text-foreground-muted"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {note}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="flex items-center gap-1">
            <Button
              iconOnly
              aria-label="Prev"
              variant="soft"
              tone="neutral"
              size="sm"
              onClick={scrollPrev}
            >
              <IoChevronBackOutline className="size-5 rtl:rotate-180" />
            </Button>
            <Button
              iconOnly
              aria-label="Next"
              variant="soft"
              tone="neutral"
              size="sm"
              onClick={scrollNext}
            >
              <IoChevronForwardOutline className="size-5 rtl:rotate-180" />
            </Button>
          </div>

          <Link href={hrefMore}>
            <Button variant="plain" tone="neutral" size="sm">
              رؤية المزيد
            </Button>
          </Link>
        </div>
      </div>

      {/* Carousel body */}
      <div
        className={cn(
          "rounded-2xl border border-border-subtle bg-background-elevated",
          "shadow-[var(--shadow-sm)]",
          "p-2 sm:p-3",
        )}
      >
        {loading ? (
          <div className="flex gap-3 overflow-hidden">
            {new Array(6).fill(0).map((_, i) => (
              <div
                key={i}
                className="h-[230px] w-[160px] rounded-2xl bg-surface-soft"
              />
            ))}
          </div>
        ) : !hasItems ? (
          <div className="p-6 text-center text-sm text-foreground-muted">
            {emptyText ?? "لا توجد بيانات حالياً."}
          </div>
        ) : (
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-3">
              {items.map((a) => (
                <div
                  key={a.mal_id}
                  className={cn(
                    "min-w-0 flex-[0_0_46%]",
                    "sm:flex-[0_0_32%]",
                    "md:flex-[0_0_24%]",
                    "lg:flex-[0_0_18%]",
                  )}
                >
                  <AnimeCard
                    dir={dir}
                    anime={a}
                    isQuickAdded={quickAddedIds.has(a.mal_id)}
                    onToggleQuickAdd={() => onToggleQuickAdd(a.mal_id)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {!reduceMotion && hasItems ? (
        <div className="h-px w-full bg-gradient-to-r from-transparent via-divider to-transparent" />
      ) : null}
    </div>
  );
}

function AnimeCard(props: {
  dir: Dir;
  anime: JikanAnime;
  isQuickAdded: boolean;
  onToggleQuickAdd: () => void;
}) {
  const { anime, isQuickAdded, onToggleQuickAdd } = props;

  const title = anime.title_english || anime.title;
  const image = pickImage(anime.images);

  const seasonLabel = anime.season ? toArabicSeason(anime.season) : "";
  const year = anime.year ? String(anime.year) : "";
  const metaLine = [seasonLabel, year, anime.type ?? ""]
    .filter(Boolean)
    .join(" • ");

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-card-border bg-card shadow-[var(--shadow-sm)] transition hover:shadow-[var(--shadow-md)]">
      <Link href={`/anime/${anime.mal_id}`} className="block">
        {/* Image */}
        <div className="relative aspect-[3/4] w-full overflow-hidden">
          {image ? (
            <img
              src={image}
              alt={title}
              className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 bg-surface-soft" />
          )}

          {/* Top badges */}
          <div className="absolute inset-x-2 top-2 flex items-center justify-between gap-2">
            <span className="rounded-full border border-white/10 bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
              {anime.type ?? "Anime"}
            </span>

            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
              <IoStar className="size-4 text-yellow-300" />
              <span className="tabular-nums">
                {anime.score ? anime.score.toFixed(1) : "—"}
              </span>
            </span>
          </div>

          {/* Quick added overlay */}
          {isQuickAdded && (
            <div className="absolute bottom-2 start-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-emerald-500/25 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
              <IoCheckmarkCircle className="size-4 text-emerald-200" />
              تمت الإضافة
            </div>
          )}

          {/* bottom gradient */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
        </div>

        {/* Content */}
        <div className="p-3">
          <div
            className="text-[13px] font-bold text-foreground-strong"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: "2.6em",
            }}
          >
            <bdi>{title}</bdi>
          </div>

          <div className="mt-1 text-[11px] text-foreground-muted">
            {metaLine || "—"}
          </div>

          {/* Stats (as “buttons” / chips) */}
          <div className="mt-2 flex flex-wrap gap-2">
            <StatChip icon={<IoTrendingUpOutline className="size-4" />}>
              #{anime.rank ?? "—"}
            </StatChip>
            <StatChip icon={<IoHeartOutline className="size-4" />}>
              {compactNumber(anime.favorites)}
            </StatChip>
            <StatChip icon={<IoEyeOutline className="size-4" />}>
              {compactNumber(anime.members)}
            </StatChip>
          </div>
        </div>
      </Link>

      {/* Productivity action: quick add (tiny) */}
      <div className="absolute bottom-2 end-2">
        <Button
          iconOnly
          aria-label="Quick add"
          size="sm"
          variant={isQuickAdded ? "solid" : "soft"}
          tone={isQuickAdded ? "success" : "neutral"}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleQuickAdd();
          }}
        >
          {isQuickAdded ? (
            <IoCheckmarkCircle className="size-5" />
          ) : (
            <IoAdd className="size-5" />
          )}
        </Button>
      </div>
    </div>
  );
}

function StatChip(props: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface-soft px-2.5 py-1 text-[11px] font-semibold text-foreground">
      <span className="text-foreground-muted">{props.icon}</span>
      <span className="tabular-nums">{props.children}</span>
    </span>
  );
}

/* =========================================================
   Tabs Content
   ========================================================= */

function LatestTab(props: {
  dir: Dir;
  quickAddedIds: Set<number>;
  onToggleQuickAdd: (id: number) => void;
}) {
  const { dir, quickAddedIds, onToggleQuickAdd } = props;

  const [airing, setAiring] = useState<JikanAnime[]>([]);
  const [upcoming, setUpcoming] = useState<JikanAnime[]>([]);
  const [action, setAction] = useState<JikanAnime[]>([]);
  const [isekai, setIsekai] = useState<JikanAnime[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      try {
        setLoading(true);

        // 1) Airing (as “آخر المضاف/حاليًا”)
        const r1 = await jikanGet<JikanResponse<JikanAnime[]>>(
          `/top/anime?filter=airing&limit=20`,
          ac.signal,
        );
        await sleep(160);

        // 2) Upcoming
        const r2 = await jikanGet<JikanResponse<JikanAnime[]>>(
          `/top/anime?filter=upcoming&limit=20`,
          ac.signal,
        );
        await sleep(160);

        // 3) Action genre (mal_id 1)
        const r3 = await jikanGet<JikanResponse<JikanAnime[]>>(
          `/anime?genres=1&order_by=score&sort=desc&limit=20`,
          ac.signal,
        );
        await sleep(160);

        // 4) Isekai (theme id 62 on MAL/Jikan genres list)
        const r4 = await jikanGet<JikanResponse<JikanAnime[]>>(
          `/anime?genres=62&order_by=score&sort=desc&limit=20`,
          ac.signal,
        );

        if (ac.signal.aborted) return;

        setAiring(r1.data ?? []);
        setUpcoming(r2.data ?? []);
        setAction(r3.data ?? []);
        setIsekai(r4.data ?? []);
      } catch {
        // Keep silent; show empty states
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();

    return () => ac.abort();
  }, []);

  return (
    <>
      <SectionCarousel
        dir={dir}
        title="آخر الأعمال النشطة (Airing)"
        note="أعمال تُعرض الآن — مثالية للمتابعة الأسبوعية والنقاشات."
        hrefMore="/anime?filter=airing"
        items={airing}
        loading={loading}
        emptyText="لم يتم العثور على أعمال حالياً."
        quickAddedIds={quickAddedIds}
        onToggleQuickAdd={onToggleQuickAdd}
      />

      <SectionCarousel
        dir={dir}
        title="أنميات قادمة (Upcoming)"
        note="تجهّز لقائمة المتابعة… أعمال قادمة وتوقعات المجتمع."
        hrefMore="/anime?filter=upcoming"
        items={upcoming}
        loading={loading}
        emptyText="لا توجد أعمال قادمة حالياً."
        quickAddedIds={quickAddedIds}
        onToggleQuickAdd={onToggleQuickAdd}
      />

      <SectionCarousel
        dir={dir}
        title="أكشن"
        note="اختيارات سريعة من الأكشن — بطاقات بسيطة + إحصائيات واضحة."
        hrefMore="/anime/genre/1"
        items={action}
        loading={loading}
        emptyText="لا توجد نتائج للأكشن حالياً."
        quickAddedIds={quickAddedIds}
        onToggleQuickAdd={onToggleQuickAdd}
      />

      <SectionCarousel
        dir={dir}
        title="إيسكاي"
        note="أفضل أعمال الإيسكاي — عالم آخر، مغامرات، وتقييمات عالية."
        hrefMore="/anime/genre/62"
        items={isekai}
        loading={loading}
        emptyText="لا توجد نتائج للإيسكاي حالياً."
        quickAddedIds={quickAddedIds}
        onToggleQuickAdd={onToggleQuickAdd}
      />
    </>
  );
}

function GenresTab(props: {
  dir: Dir;
  quickAddedIds: Set<number>;
  onToggleQuickAdd: (id: number) => void;
}) {
  const { dir, quickAddedIds, onToggleQuickAdd } = props;

  const [genres, setGenres] = useState<JikanGenre[]>([]);
  const [genreId, setGenreId] = useState<string>("1"); // default Action
  const [items, setItems] = useState<JikanAnime[]>([]);
  const [loading, setLoading] = useState(true);

  // Load genres list
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const res = await jikanGet<JikanResponse<JikanGenre[]>>(
          `/genres/anime`,
          ac.signal,
        );

        if (ac.signal.aborted) return;

        // Keep it curated & useful: most used first
        const sorted = [...(res.data ?? [])].sort((a, b) => b.count - a.count);
        setGenres(sorted);
      } catch {
        // ignore
      }
    })();
    return () => ac.abort();
  }, []);

  // Load list for selected genre
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const res = await jikanGet<JikanResponse<JikanAnime[]>>(
          `/anime?genres=${encodeURIComponent(genreId)}&order_by=score&sort=desc&limit=20`,
          ac.signal,
        );
        if (ac.signal.aborted) return;
        setItems(res.data ?? []);
      } catch {
        if (!ac.signal.aborted) setItems([]);
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [genreId]);

  const options: SelectOption[] = useMemo(() => {
    // Keep list reasonable (avoid 1000 options)
    const slice = (genres ?? []).slice(0, 40);
    return slice.map((g) => ({
      value: String(g.mal_id),
      label: g.name,
      description: `${compactNumber(g.count)} عمل`,
      group: "Genres",
    }));
  }, [genres]);

  const selectedGenreName =
    genres.find((g) => String(g.mal_id) === genreId)?.name ?? "التصنيف";

  return (
    <div className="space-y-5">
      {/* Select (uses your SmartSelect component) */}
      <div className="rounded-2xl border border-border-subtle bg-background-elevated p-3 shadow-[var(--shadow-sm)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="text-sm font-bold text-foreground-strong">
              تصفّح حسب التصنيفات
            </div>
            <div className="mt-1 text-xs text-foreground-muted">
              اختر تصنيفًا واحدًا وسيتم تحديث القوائم بالأسفل فورًا.
            </div>
          </div>

          <div className="w-full sm:max-w-sm">
            <SmartSelect
              options={options}
              value={genreId}
              onChange={(v) => setGenreId(String(v ?? "1"))}
              label="التصنيف"
              placeholder="اختر تصنيف…"
              searchable
              disabled={!options.length}
              maxHeight={320}
            />
          </div>
        </div>
      </div>

      <SectionCarousel
        dir={dir}
        title={`مختارات: ${selectedGenreName}`}
        note="قائمة مبنية على أعلى التقييمات داخل التصنيف المحدد."
        hrefMore={`/anime/genre/${genreId}`}
        items={items}
        loading={loading}
        emptyText="لا توجد أعمال لهذا التصنيف."
        quickAddedIds={quickAddedIds}
        onToggleQuickAdd={onToggleQuickAdd}
      />
    </div>
  );
}

function SeasonTab(props: {
  dir: Dir;
  quickAddedIds: Set<number>;
  onToggleQuickAdd: (id: number) => void;
}) {
  const { dir, quickAddedIds, onToggleQuickAdd } = props;

  const [now, setNow] = useState<JikanAnime[]>([]);
  const [up, setUp] = useState<JikanAnime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      try {
        setLoading(true);

        const r1 = await jikanGet<JikanResponse<JikanAnime[]>>(
          `/seasons/now?limit=20`,
          ac.signal,
        );
        await sleep(170);

        const r2 = await jikanGet<JikanResponse<JikanAnime[]>>(
          `/seasons/upcoming?limit=20`,
          ac.signal,
        );

        if (ac.signal.aborted) return;
        setNow(r1.data ?? []);
        setUp(r2.data ?? []);
      } catch {
        // ignore
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();

    return () => ac.abort();
  }, []);

  return (
    <>
      <SectionCarousel
        dir={dir}
        title="أعمال هذا الموسم"
        note="مباشر من الموسم الحالي — مناسب للمتابعة والتقييمات الأسبوعية."
        hrefMore="/anime/season/now"
        items={now}
        loading={loading}
        emptyText="لا توجد أعمال موسم حالي."
        quickAddedIds={quickAddedIds}
        onToggleQuickAdd={onToggleQuickAdd}
      />

      <SectionCarousel
        dir={dir}
        title="الموسم القادم"
        note="جهّز قائمتك — الأعمال القادمة للموسم التالي."
        hrefMore="/anime/season/upcoming"
        items={up}
        loading={loading}
        emptyText="لا توجد بيانات للموسم القادم."
        quickAddedIds={quickAddedIds}
        onToggleQuickAdd={onToggleQuickAdd}
      />
    </>
  );
}

function ScheduleTab(props: { dir: Dir }) {
  const { dir } = props;

  const DAYS: Array<{ key: string; label: string }> = [
    { key: "monday", label: "الاثنين" },
    { key: "tuesday", label: "الثلاثاء" },
    { key: "wednesday", label: "الأربعاء" },
    { key: "thursday", label: "الخميس" },
    { key: "friday", label: "الجمعة" },
    { key: "saturday", label: "السبت" },
    { key: "sunday", label: "الأحد" },
  ];

  const [day, setDay] = useState(DAYS[0]!.key);
  const [items, setItems] = useState<JikanAnime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      try {
        setLoading(true);

        const res = await jikanGet<JikanResponse<JikanAnime[]>>(
          `/schedules?filter=${encodeURIComponent(day)}&limit=24`,
          ac.signal,
        );

        if (ac.signal.aborted) return;
        setItems(res.data ?? []);
      } catch {
        if (!ac.signal.aborted) setItems([]);
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [day]);

  return (
    <div className="space-y-4">
      {/* Day buttons */}
      <div className="rounded-2xl border border-border-subtle bg-background-elevated p-3 shadow-[var(--shadow-sm)]">
        <div className="flex flex-wrap items-center gap-2">
          {DAYS.map((d) => {
            const active = d.key === day;
            return (
              <Button
                key={d.key}
                variant={active ? "solid" : "soft"}
                tone={active ? "brand" : "neutral"}
                size="sm"
                onClick={() => setDay(d.key)}
              >
                {d.label}
              </Button>
            );
          })}
        </div>

        <div className="mt-2 text-xs text-foreground-muted">
          يعرض الأعمال حسب يوم البث (حسب بيانات المصدر). قد تختلف التوقيتات حسب
          المنطقة.
        </div>
      </div>

      {/* Schedule list */}
      <div className="rounded-2xl border border-border-subtle bg-background-elevated p-3 shadow-[var(--shadow-sm)]">
        {loading ? (
          <div className="space-y-2">
            {new Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-16 rounded-2xl bg-surface-soft" />
            ))}
          </div>
        ) : !items.length ? (
          <div className="p-8 text-center text-sm text-foreground-muted">
            لا توجد أعمال مجدولة لهذا اليوم حالياً.
          </div>
        ) : (
          <div className="space-y-2">
            {items.slice(0, 18).map((a) => (
              <ScheduleRow key={a.mal_id} dir={dir} anime={a} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ScheduleRow(props: { dir: Dir; anime: JikanAnime }) {
  const { anime } = props;
  const title = anime.title_english || anime.title;
  const image = pickImage(anime.images);

  const timeStr =
    anime.broadcast?.time && anime.broadcast?.day
      ? `${anime.broadcast.day} • ${anime.broadcast.time}`
      : anime.broadcast?.string || "—";

  return (
    <Link
      href={`/anime/${anime.mal_id}`}
      className={cn(
        "group flex items-center gap-3 rounded-2xl border border-border-subtle",
        "bg-surface-soft/60 p-2.5 transition hover:bg-surface-soft",
      )}
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border-subtle">
        {image ? (
          <img
            src={image}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover transition group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-surface-muted" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold text-foreground-strong">
          <bdi className="truncate">{title}</bdi>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-foreground-muted">
          <span className="inline-flex items-center gap-1">
            <IoTimeOutline className="size-4" />
            <bdi>{timeStr}</bdi>
          </span>

          <span className="inline-flex items-center gap-1">
            <IoStar className="size-4" />
            <span className="tabular-nums">
              {anime.score ? anime.score.toFixed(1) : "—"}
            </span>
          </span>

          <span className="inline-flex items-center gap-1">
            <IoEyeOutline className="size-4" />
            {compactNumber(anime.members)}
          </span>
        </div>
      </div>

      <div className="shrink-0">
        <Button
          variant="soft"
          tone="neutral"
          size="sm"
          rightIcon={
            <IoChevronForwardOutline className="size-4 rtl:rotate-180" />
          }
        >
          فتح
        </Button>
      </div>
    </Link>
  );
}
