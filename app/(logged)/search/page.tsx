// app/search/page.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  IoAlbumsOutline,
  IoBookOutline,
  IoBusinessOutline,
  IoChatbubbleEllipsesOutline,
  IoCloseOutline,
  IoCompassOutline,
  IoFilmOutline,
  IoFlashOutline,
  IoPeopleOutline,
  IoSearchOutline,
  IoSparklesOutline,
  IoTimeOutline,
  IoTrendingUpOutline,
} from "react-icons/io5";

import { cn } from "@/utils/cn";
import { Button } from "@/design/DeButton";
import { SmartSelect, type SelectOption } from "@/design/DeSelect";
import { AppInputBase } from "@/design/DeInput";

import {
  COMMUNITIES,
  POSTS,
  STUDIO_COUNTRIES,
  STUDIOS,
  TRENDING_QUERIES,
  USERS,
  WORK_GENRES,
  WORK_YEARS,
  WORKS,
  type CommunityEntity,
  type PostEntity,
  type PostType,
  type StudioEntity,
  type UserEntity,
  type UserRole,
  type WorkEntity,
  type WorkStatus,
} from "./mock-data";

/* ──────────────────────────────────────────────────────────────
  Utils
────────────────────────────────────────────────────────────── */

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function safeId(prefix = "id") {
  const r =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? (crypto as any).randomUUID()
      : `${Date.now()}_${Math.random().toString(16).slice(2)}`;
  return `${prefix}_${String(r).replace(/[^a-zA-Z0-9_-]/g, "")}`;
}

function normalizeText(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u064B-\u065F]/g, "")
    .replace(/[^\p{L}\p{N}\s._-]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function splitTerms(q: string) {
  return normalizeText(q).split(" ").filter(Boolean);
}

function formatCompactNumber(n: number) {
  const abs = Math.abs(n);
  if (abs < 1000) return String(n);
  if (abs < 1_000_000) return `${(n / 1000).toFixed(abs < 10_000 ? 1 : 0)}K`;
  if (abs < 1_000_000_000) return `${(n / 1_000_000).toFixed(abs < 10_000_000 ? 1 : 0)}M`;
  return `${(n / 1_000_000_000).toFixed(1)}B`;
}

function timeAgo(ts: number, dir: "rtl" | "ltr") {
  const delta = Math.max(0, Date.now() - ts);
  const s = Math.floor(delta / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);

  if (dir === "rtl") {
    if (s < 45) return "الآن";
    if (m < 60) return `قبل ${m} دقيقة`;
    if (h < 24) return `قبل ${h} ساعة`;
    return `قبل ${d} يوم`;
  }

  if (s < 45) return "now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

/* ──────────────────────────────────────────────────────────────
  Doc dir/theme hooks
────────────────────────────────────────────────────────────── */

function useDocDir() {
  const [dir, setDir] = useState<"rtl" | "ltr">("ltr");
  useEffect(() => {
    if (typeof document === "undefined") return;
    const el = document.documentElement;
    const update = () => setDir(el.dir === "rtl" ? "rtl" : "ltr");
    update();
    const mo = new MutationObserver(update);
    mo.observe(el, { attributes: true, attributeFilter: ["dir"] });
    return () => mo.disconnect();
  }, []);
  return dir;
}

function useDocTheme() {
  const [isDark, setIsDark] = useState(false);
  const [isOnePiece, setIsOnePiece] = useState(false);
  useEffect(() => {
    if (typeof document === "undefined") return;
    const el = document.documentElement;
    const update = () => {
      setIsDark(el.classList.contains("dark"));
      setIsOnePiece(el.classList.contains("onepiece"));
    };
    update();
    const mo = new MutationObserver(update);
    mo.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);
  return { isDark, isOnePiece };
}

/* ──────────────────────────────────────────────────────────────
  Search model
────────────────────────────────────────────────────────────── */

type SearchScope =
  | "all"
  | "anime"
  | "manga"
  | "comics"
  | "users"
  | "influencers"
  | "posts"
  | "communities"
  | "studios";

type TypeGroup = "all" | "works" | "people" | "content" | "industry";

type SortMode = "relevance" | "newest" | "top";

type SearchFilters = {
  verifiedOnly: boolean;
  hideSpoilers: boolean;

  // works
  workGenres: string[]; // multi
  workStatus: "any" | WorkStatus;
  workYear: "any" | string; // year string
  minRating: "any" | string; // numeric string

  // people
  peopleRole: "any" | UserRole;
  minFollowers: "any" | string; // numeric string

  // posts
  postType: "any" | PostType;
  postTags: string[]; // multi
  postSort: SortMode;

  // communities
  communityKind: "any" | "official" | "community";
  communityMinMembers: "any" | string; // numeric string
  communityActivity: "any" | string; // numeric string

  // studios
  studioCountry: "any" | string;
};

type SearchEntity = UserEntity | WorkEntity | StudioEntity | CommunityEntity | PostEntity;

type SearchResults = {
  query: string;
  tookMs: number;
  total: number;
  groups: {
    anime: WorkEntity[];
    manga: WorkEntity[];
    comics: WorkEntity[];
    users: UserEntity[];
    influencers: UserEntity[];
    posts: PostEntity[];
    communities: CommunityEntity[];
    studios: StudioEntity[];
  };
  top?: SearchEntity;
};

type HistoryEntry = {
  id: string;
  query: string;
  executedAt: number;
  total: number;
  counts: Partial<Record<Exclude<SearchScope, "all">, number>>;
  filters: SearchFilters;
};

type SuggestionKind = "history" | "trending" | "entity" | "hint";

type SuggestionItem = {
  id: string;
  kind: SuggestionKind;
  label: string;
  query: string;
  meta?: string;
  icon?: React.ReactNode;
  // to restore a previous search accurately
  applyFilters?: SearchFilters;
};

const DEFAULT_FILTERS: SearchFilters = {
  verifiedOnly: false,
  hideSpoilers: true,

  workGenres: [],
  workStatus: "any",
  workYear: "any",
  minRating: "any",

  peopleRole: "any",
  minFollowers: "any",

  postType: "any",
  postTags: [],
  postSort: "relevance",

  communityKind: "any",
  communityMinMembers: "any",
  communityActivity: "any",

  studioCountry: "any",
};

const GROUP_TABS: Record<TypeGroup, SearchScope[]> = {
  all: ["all", "anime", "manga", "comics", "users", "influencers", "posts", "communities", "studios"],
  works: ["anime", "manga", "comics"],
  people: ["users", "influencers"],
  content: ["posts", "communities"],
  industry: ["studios"],
};

function scopeLabel(scope: SearchScope, dir: "rtl" | "ltr") {
  const rtl: Record<SearchScope, string> = {
    all: "الكل",
    anime: "أنمي",
    manga: "مانغا",
    comics: "كوميكس",
    users: "مستخدمين",
    influencers: "مؤثرين",
    posts: "منشورات",
    communities: "مجتمعات",
    studios: "استوديوهات",
  };
  const ltr: Record<SearchScope, string> = {
    all: "All",
    anime: "Anime",
    manga: "Manga",
    comics: "Comics",
    users: "Users",
    influencers: "Influencers",
    posts: "Posts",
    communities: "Communities",
    studios: "Studios",
  };
  return dir === "rtl" ? rtl[scope] : ltr[scope];
}

function scopeIcon(scope: SearchScope) {
  switch (scope) {
    case "all":
      return <IoSparklesOutline className="size-4" />;
    case "anime":
      return <IoFilmOutline className="size-4" />;
    case "manga":
      return <IoBookOutline className="size-4" />;
    case "comics":
      return <IoAlbumsOutline className="size-4" />;
    case "users":
      return <IoPeopleOutline className="size-4" />;
    case "influencers":
      return <IoFlashOutline className="size-4" />;
    case "posts":
      return <IoChatbubbleEllipsesOutline className="size-4" />;
    case "communities":
      return <IoPeopleOutline className="size-4" />;
    case "studios":
      return <IoBusinessOutline className="size-4" />;
  }
}

function scoreText(haystack: string, terms: string[]) {
  const h = normalizeText(haystack);
  if (!terms.length) return 0;

  let score = 0;
  for (const t of terms) {
    if (!t) continue;
    if (h === t) score += 60;
    else if (h.startsWith(t)) score += 18;
    else if (h.includes(` ${t}`)) score += 12;
    else if (h.includes(t)) score += 8;
    else return 0; // strict AND across terms
  }
  score += clamp(16 - Math.floor(h.length / 14), 0, 16);
  return score;
}

/* ──────────────────────────────────────────────────────────────
  Filtering helpers (all mock)
────────────────────────────────────────────────────────────── */

function parseNumOrNull(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function passesMinThreshold(value: number, threshold: "any" | string) {
  if (threshold === "any") return true;
  const t = parseNumOrNull(threshold);
  if (t == null) return true;
  return value >= t;
}

/* ──────────────────────────────────────────────────────────────
  Search functions
────────────────────────────────────────────────────────────── */

function searchUsers(q: string, f: SearchFilters) {
  const terms = splitTerms(q);

  const ranked = USERS.map((u) => {
    const s = scoreText(`${u.displayName} ${u.username} ${u.bio} ${u.role}`, terms);
    return { u, s };
  })
    .filter((x) => x.s > 0)
    .filter((x) => (f.verifiedOnly ? Boolean(x.u.verified) : true))
    .filter((x) => (f.peopleRole !== "any" ? x.u.role === f.peopleRole : true))
    .filter((x) => (f.minFollowers !== "any" ? x.u.followers >= Number(f.minFollowers) : true))
    .sort((a, b) => b.s - a.s || b.u.followers - a.u.followers)
    .map((x) => x.u);

  return {
    users: ranked.filter((u) => u.role !== "influencer"),
    influencers: ranked.filter((u) => u.role === "influencer"),
  };
}

function searchWorks(q: string, f: SearchFilters) {
  const terms = splitTerms(q);

  const ranked = WORKS.map((w) => {
    const s = scoreText(
      `${w.title} ${w.workType} ${(w.genres ?? []).join(" ")} ${w.studio ?? ""} ${w.year ?? ""} ${w.status ?? ""}`,
      terms,
    );
    return { w, s };
  })
    .filter((x) => x.s > 0)
    .filter((x) => {
      if (!f.workGenres.length) return true;
      return f.workGenres.some((g) => x.w.genres.includes(g));
    })
    .filter((x) => (f.workStatus !== "any" ? x.w.status === f.workStatus : true))
    .filter((x) => (f.workYear !== "any" ? x.w.year === Number(f.workYear) : true))
    .filter((x) => passesMinThreshold(x.w.rating, f.minRating))
    .sort((a, b) => b.s - a.s || b.w.rating - a.w.rating)
    .map((x) => x.w);

  return {
    anime: ranked.filter((w) => w.workType === "anime"),
    manga: ranked.filter((w) => w.workType === "manga"),
    comics: ranked.filter((w) => w.workType === "comic"),
  };
}

function searchStudios(q: string, f: SearchFilters) {
  const terms = splitTerms(q);

  return STUDIOS.map((s) => {
    const sc = scoreText(`${s.name} ${s.country} ${s.worksCount}`, terms);
    return { s, sc };
  })
    .filter((x) => x.sc > 0)
    .filter((x) => (f.studioCountry !== "any" ? x.s.country === f.studioCountry : true))
    .filter((x) => (f.verifiedOnly ? Boolean(x.s.verified) : true))
    .sort((a, b) => b.sc - a.sc || b.s.worksCount - a.s.worksCount)
    .map((x) => x.s);
}

function searchCommunities(q: string, f: SearchFilters) {
  const terms = splitTerms(q);

  return COMMUNITIES.map((c) => {
    const sc = scoreText(`${c.name} ${c.description}`, terms);
    return { c, sc };
  })
    .filter((x) => x.sc > 0)
    .filter((x) => {
      if (f.communityKind === "any") return true;
      if (f.communityKind === "official") return Boolean(x.c.isOfficial);
      return !x.c.isOfficial;
    })
    .filter((x) => (f.communityMinMembers !== "any" ? x.c.members >= Number(f.communityMinMembers) : true))
    .filter((x) => (f.communityActivity !== "any" ? x.c.postsPerDay >= Number(f.communityActivity) : true))
    .sort((a, b) => b.sc - a.sc || b.c.members - a.c.members)
    .map((x) => x.c);
}

function searchPosts(q: string, f: SearchFilters) {
  const terms = splitTerms(q);

  const ranked = POSTS.map((p) => {
    const sc = scoreText(`${p.title} ${p.excerpt} ${p.tags.join(" ")} ${p.type}`, terms);
    return { p, sc };
  })
    .filter((x) => x.sc > 0)
    .filter((x) => (f.hideSpoilers ? !x.p.hasSpoiler : true))
    .filter((x) => (f.postType !== "any" ? x.p.type === f.postType : true))
    .filter((x) => {
      if (!f.postTags.length) return true;
      return f.postTags.some((t) => x.p.tags.includes(t));
    });

  ranked.sort((a, b) => {
    if (f.postSort === "newest") return b.p.createdAt - a.p.createdAt;
    if (f.postSort === "top") return b.p.reactions - a.p.reactions;
    return b.sc - a.sc || b.p.reactions - a.p.reactions;
  });

  return ranked.map((x) => x.p);
}

function buildTopEntity(r: SearchResults): SearchEntity | undefined {
  const candidates: Array<{ e: SearchEntity; w: number }> = [];
  const push = (e: SearchEntity | undefined, w: number) => {
    if (!e) return;
    candidates.push({ e, w });
  };

  // Works first
  push(r.groups.anime[0], 92);
  push(r.groups.manga[0], 90);
  push(r.groups.comics[0], 88);

  // People next
  push(r.groups.influencers[0], 86);
  push(r.groups.users[0], 84);

  // Content / Industry
  push(r.groups.posts[0], 82);
  push(r.groups.communities[0], 80);
  push(r.groups.studios[0], 78);

  candidates.sort((a, b) => b.w - a.w);
  return candidates[0]?.e;
}

function runSearchAll(q: string, f: SearchFilters): SearchResults {
  const t0 = typeof performance !== "undefined" ? performance.now() : Date.now();

  const works = searchWorks(q, f);
  const people = searchUsers(q, f);
  const studios = searchStudios(q, f);
  const communities = searchCommunities(q, f);
  const posts = searchPosts(q, f);

  const groups: SearchResults["groups"] = {
    anime: works.anime,
    manga: works.manga,
    comics: works.comics,
    users: people.users,
    influencers: people.influencers,
    posts,
    communities,
    studios,
  };

  const total =
    groups.anime.length +
    groups.manga.length +
    groups.comics.length +
    groups.users.length +
    groups.influencers.length +
    groups.posts.length +
    groups.communities.length +
    groups.studios.length;

  const tookMs =
    typeof performance !== "undefined"
      ? Math.max(1, Math.round(performance.now() - t0))
      : Math.max(1, Math.round(Date.now() - t0));

  const out: SearchResults = { query: q, tookMs, total, groups, top: undefined };
  out.top = buildTopEntity(out);
  return out;
}

function buildHistoryEntry(r: SearchResults, f: SearchFilters): HistoryEntry {
  const counts: HistoryEntry["counts"] = {};
  if (r.groups.anime.length) counts.anime = r.groups.anime.length;
  if (r.groups.manga.length) counts.manga = r.groups.manga.length;
  if (r.groups.comics.length) counts.comics = r.groups.comics.length;
  if (r.groups.users.length) counts.users = r.groups.users.length;
  if (r.groups.influencers.length) counts.influencers = r.groups.influencers.length;
  if (r.groups.posts.length) counts.posts = r.groups.posts.length;
  if (r.groups.communities.length) counts.communities = r.groups.communities.length;
  if (r.groups.studios.length) counts.studios = r.groups.studios.length;

  return {
    id: safeId("h"),
    query: r.query,
    executedAt: Date.now(),
    total: r.total,
    counts,
    filters: f,
  };
}

/* ──────────────────────────────────────────────────────────────
  Suggestions (history/trending/entities)
────────────────────────────────────────────────────────────── */

function buildSuggestions(args: {
  query: string;
  dir: "rtl" | "ltr";
  history: HistoryEntry[];
  filters: SearchFilters;
}) {
  const { query, dir, history, filters } = args;
  const q = query.trim();
  const out: SuggestionItem[] = [];

  if (!q) {
    out.push(
      ...history.slice(0, 7).map((h) => ({
        id: `hist_${h.id}`,
        kind: "history" as const,
        label: h.query,
        query: h.query,
        meta:
          dir === "rtl"
            ? `${timeAgo(h.executedAt, dir)} • ${h.total} نتيجة`
            : `${timeAgo(h.executedAt, dir)} • ${h.total} results`,
        icon: <IoTimeOutline className="size-4" />,
        applyFilters: h.filters,
      })),
    );

    out.push(
      ...TRENDING_QUERIES.map((t) => ({
        id: `trend_${t.q}`,
        kind: "trending" as const,
        label: t.q,
        query: t.q,
        meta: t.meta,
        icon: <IoTrendingUpOutline className="size-4" />,
      })),
    );

    out.push({
      id: "hint_enter",
      kind: "hint",
      label: dir === "rtl" ? "اضغط Enter للبحث" : "Press Enter to search",
      query: "",
      meta: dir === "rtl" ? "اختصار" : "Shortcut",
      icon: <IoSparklesOutline className="size-4" />,
    });

    return out.slice(0, 12);
  }

  const terms = splitTerms(q);

  const candidates: Array<{
    label: string;
    query: string;
    meta: string;
    score: number;
    icon: React.ReactNode;
  }> = [];

  for (const w of WORKS) {
    const s = scoreText(`${w.title} ${w.workType} ${(w.genres ?? []).join(" ")} ${w.studio ?? ""}`, terms);
    if (!s) continue;
    candidates.push({
      label: w.title,
      query: w.title,
      meta: w.workType.toUpperCase(),
      score: s + Math.round(w.rating),
      icon:
        w.workType === "anime" ? (
          <IoFilmOutline className="size-4" />
        ) : w.workType === "manga" ? (
          <IoBookOutline className="size-4" />
        ) : (
          <IoAlbumsOutline className="size-4" />
        ),
    });
  }

  for (const u of USERS) {
    const s = scoreText(`${u.displayName} ${u.username} ${u.bio} ${u.role}`, terms);
    if (!s) continue;
    if (filters.verifiedOnly && !u.verified) continue;
    candidates.push({
      label: u.displayName,
      query: u.displayName,
      meta: `@${u.username}`,
      score: s + (u.verified ? 10 : 0),
      icon: u.role === "influencer" ? <IoFlashOutline className="size-4" /> : <IoPeopleOutline className="size-4" />,
    });
  }

  for (const s0 of STUDIOS) {
    const s = scoreText(`${s0.name} ${s0.country}`, terms);
    if (!s) continue;
    if (filters.studioCountry !== "any" && s0.country !== filters.studioCountry) continue;
    candidates.push({
      label: s0.name,
      query: s0.name,
      meta: dir === "rtl" ? "استوديو" : "Studio",
      score: s + (s0.verified ? 8 : 0),
      icon: <IoBusinessOutline className="size-4" />,
    });
  }

  for (const c of COMMUNITIES) {
    const s = scoreText(`${c.name} ${c.description}`, terms);
    if (!s) continue;
    candidates.push({
      label: c.name,
      query: c.name,
      meta: dir === "rtl" ? "مجتمع" : "Community",
      score: s + Math.round(Math.log10(c.members + 10) * 4),
      icon: <IoPeopleOutline className="size-4" />,
    });
  }

  for (const p of POSTS) {
    const s = scoreText(`${p.title} ${p.tags.join(" ")}`, terms);
    if (!s) continue;
    if (filters.hideSpoilers && p.hasSpoiler) continue;
    candidates.push({
      label: p.title,
      query: p.title,
      meta: dir === "rtl" ? "منشور" : "Post",
      score: s + Math.round(Math.log10(p.reactions + 10) * 5),
      icon: <IoChatbubbleEllipsesOutline className="size-4" />,
    });
  }

  candidates.sort((a, b) => b.score - a.score);

  out.push(
    ...candidates.slice(0, 9).map((c, i) => ({
      id: `ent_${i}_${c.label}`,
      kind: "entity" as const,
      label: c.label,
      query: c.query,
      meta: c.meta,
      icon: c.icon,
    })),
  );

  out.push({
    id: "hint_tab",
    kind: "hint",
    label: dir === "rtl" ? "Tab للإكمال" : "Tab to autocomplete",
    query: "",
    meta: dir === "rtl" ? "اختصار" : "Shortcut",
    icon: <IoSparklesOutline className="size-4" />,
  });

  return out.slice(0, 12);
}

/* ──────────────────────────────────────────────────────────────
  UI atoms
────────────────────────────────────────────────────────────── */

function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-glass-border bg-glass shadow-[var(--shadow-glass)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent dark:from-white/5" />
      <div className="relative">{children}</div>
    </div>
  );
}

function AvatarImg({ src, alt, className, fallback }: { src?: string; alt: string; className?: string; fallback?: string }) {
  const [err, setErr] = useState(false);
  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-border-subtle bg-surface-soft", className)}>
      {!src || err ? (
        <div className="grid h-full w-full place-items-center text-xs font-extrabold text-foreground-strong">
          {fallback ?? alt.trim().slice(0, 2).toUpperCase()}
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" onError={() => setErr(true)} />
      )}
    </div>
  );
}

function CoverImg({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [err, setErr] = useState(false);
  return (
    <div className={cn("relative overflow-hidden rounded-xl border border-border-subtle bg-surface-soft", className)}>
      {!err ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" onError={() => setErr(true)} />
      ) : (
        <div className="grid h-full w-full place-items-center text-xs font-semibold text-foreground-muted">{alt}</div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
  Cards (use DeButton)
────────────────────────────────────────────────────────────── */

function UserCard({ u, dir }: { u: UserEntity; dir: "rtl" | "ltr" }) {
  const isRTL = dir === "rtl";
  return (
    <motion.div
      layout
      whileHover={{ y: -2 }}
      className={cn(
        "rounded-2xl border border-card-border bg-card p-3 shadow-[var(--shadow-sm)] transition",
        "hover:shadow-[var(--shadow-md)] hover:border-accent-border",
      )}
    >
      <div className={cn("flex items-start gap-3", isRTL ? "flex-row-reverse text-right" : "flex-row text-left")}>
        <AvatarImg src={u.avatarUrl} alt={u.displayName} className="size-12 shrink-0" fallback={u.displayName[0]} />

        <div className="min-w-0 flex-1">
          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <bdi className="truncate text-sm font-extrabold text-foreground-strong">{u.displayName}</bdi>
            {u.verified ? (
              <span className="rounded-full border border-info-soft-border bg-info-soft px-2 py-0.5 text-[11px] font-bold text-foreground-strong">
                ✓ {dir === "rtl" ? "موثّق" : "Verified"}
              </span>
            ) : null}
            {u.role === "influencer" ? (
              <span className="rounded-full border border-accent-border bg-accent-soft px-2 py-0.5 text-[11px] font-bold text-foreground-strong">
                <span className={cn("inline-flex items-center gap-1", isRTL && "flex-row-reverse")}>
                  <IoFlashOutline className="size-3.5" />
                  <span>{dir === "rtl" ? "مؤثر" : "Influencer"}</span>
                </span>
              </span>
            ) : null}
          </div>

          <div className="mt-0.5 text-xs text-foreground-muted">
            <bdi>@{u.username}</bdi> • <bdi>{formatCompactNumber(u.followers)}</bdi>{" "}
            {dir === "rtl" ? "متابع" : "followers"}
          </div>

          <p className="mt-2 line-clamp-2 text-xs text-foreground">
            <bdi>{u.bio}</bdi>
          </p>

          <div className={cn("mt-3 flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Button tone="brand" variant="soft" size="sm" leftIcon={<IoPeopleOutline className="size-4" />}>
              {dir === "rtl" ? "متابعة" : "Follow"}
            </Button>
            <Button tone="neutral" variant="outline" size="sm" leftIcon={<IoChatbubbleEllipsesOutline className="size-4" />}>
              {dir === "rtl" ? "رسالة" : "Message"}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function WorkCard({ w, dir }: { w: WorkEntity; dir: "rtl" | "ltr" }) {
  const isRTL = dir === "rtl";
  const typeIcon =
    w.workType === "anime" ? (
      <IoFilmOutline className="size-4" />
    ) : w.workType === "manga" ? (
      <IoBookOutline className="size-4" />
    ) : (
      <IoAlbumsOutline className="size-4" />
    );

  return (
    <motion.div
      layout
      whileHover={{ y: -2 }}
      className={cn(
        "overflow-hidden rounded-2xl border border-card-border bg-card shadow-[var(--shadow-sm)] transition",
        "hover:shadow-[var(--shadow-md)] hover:border-accent-border",
      )}
    >
      <div className={cn("flex", isRTL ? "flex-row-reverse" : "flex-row")}>
        <div className="w-24 shrink-0 p-3">
          <CoverImg src={w.coverUrl} alt={w.title} className="h-28 w-full" />
        </div>

        <div className="min-w-0 flex-1 p-3 ps-0 rtl:ps-3 rtl:pe-0">
          <div className={cn("flex items-start justify-between gap-2", isRTL && "flex-row-reverse text-right")}>
            <div className="min-w-0">
              <bdi className="line-clamp-1 text-sm font-extrabold text-foreground-strong">{w.title}</bdi>
              <div className="mt-0.5 text-xs text-foreground-muted">
                <bdi>{w.year ?? "—"}</bdi>
                {w.studio ? (
                  <>
                    {" "}
                    • <bdi>{w.studio}</bdi>
                  </>
                ) : null}
              </div>
            </div>

            <span className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-soft/70 px-2 py-1 text-[11px] font-bold text-foreground-strong">
              {typeIcon}
              <span className="uppercase">{w.workType}</span>
              <span className="opacity-60">•</span>
              <span>{w.rating.toFixed(1)}</span>
            </span>
          </div>

          <div className={cn("mt-2 flex flex-wrap gap-1.5", isRTL && "justify-end")}>
            {w.genres.slice(0, 3).map((g) => (
              <span
                key={g}
                className="inline-flex items-center rounded-full border border-border-subtle bg-background-elevated px-2 py-1 text-[11px] font-semibold text-foreground"
              >
                {g}
              </span>
            ))}
            {w.genres.length > 3 ? (
              <span className="inline-flex items-center rounded-full border border-border-subtle bg-background-elevated px-2 py-1 text-[11px] font-semibold text-foreground">
                +{w.genres.length - 3}
              </span>
            ) : null}
          </div>

          <div className={cn("mt-3 flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Button tone="brand" variant="soft" size="sm">
              {dir === "rtl" ? "إضافة" : "Add"}
            </Button>
            <Button tone="neutral" variant="outline" size="sm">
              {dir === "rtl" ? "تفاصيل" : "Details"}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StudioCard({ s, dir }: { s: StudioEntity; dir: "rtl" | "ltr" }) {
  const isRTL = dir === "rtl";
  return (
    <motion.div
      layout
      whileHover={{ y: -2 }}
      className={cn(
        "rounded-2xl border border-card-border bg-card p-3 shadow-[var(--shadow-sm)] transition",
        "hover:shadow-[var(--shadow-md)] hover:border-accent-border",
      )}
    >
      <div className={cn("flex items-center gap-3", isRTL ? "flex-row-reverse text-right" : "flex-row text-left")}>
        <AvatarImg src={s.logoUrl} alt={s.name} className="h-12 w-16 shrink-0 rounded-xl" fallback={s.name.slice(0, 2)} />

        <div className="min-w-0 flex-1">
          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <bdi className="truncate text-sm font-extrabold text-foreground-strong">{s.name}</bdi>
            {s.verified ? (
              <span className="rounded-full border border-info-soft-border bg-info-soft px-2 py-0.5 text-[11px] font-bold text-foreground-strong">
                ✓ {dir === "rtl" ? "موثّق" : "Verified"}
              </span>
            ) : null}
          </div>

          <div className="mt-0.5 text-xs text-foreground-muted">
            <bdi>{s.country}</bdi> • <bdi>{formatCompactNumber(s.worksCount)}</bdi> {dir === "rtl" ? "عمل" : "works"}
          </div>
        </div>

        <Button tone="neutral" variant="soft" size="sm">
          {dir === "rtl" ? "عرض" : "View"}
        </Button>
      </div>
    </motion.div>
  );
}

function CommunityCard({ c, dir }: { c: CommunityEntity; dir: "rtl" | "ltr" }) {
  const isRTL = dir === "rtl";
  return (
    <motion.div
      layout
      whileHover={{ y: -2 }}
      className={cn(
        "overflow-hidden rounded-2xl border border-card-border bg-card shadow-[var(--shadow-sm)] transition",
        "hover:shadow-[var(--shadow-md)] hover:border-accent-border",
      )}
    >
      <CoverImg src={c.bannerUrl} alt={c.name} className="h-24 w-full rounded-none border-0" />
      <div className="p-3">
        <div className={cn("flex items-start justify-between gap-2", isRTL && "flex-row-reverse text-right")}>
          <div className="min-w-0">
            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <bdi className="truncate text-sm font-extrabold text-foreground-strong">{c.name}</bdi>
              {c.isOfficial ? (
                <span className="rounded-full border border-accent-border bg-accent-soft px-2 py-0.5 text-[11px] font-bold text-foreground-strong">
                  {dir === "rtl" ? "رسمي" : "Official"}
                </span>
              ) : null}
            </div>
            <p className="mt-1 line-clamp-2 text-xs text-foreground">
              <bdi>{c.description}</bdi>
            </p>
          </div>

          <span className="inline-flex items-center gap-1 rounded-full border border-border-subtle bg-surface-soft/70 px-2 py-1 text-[11px] font-bold text-foreground-strong">
            <IoPeopleOutline className="size-4" />
            {formatCompactNumber(c.members)}
          </span>
        </div>

        <div className={cn("mt-3 flex items-center gap-2", isRTL && "flex-row-reverse")}>
          <Button tone="brand" variant="soft" size="sm">
            {dir === "rtl" ? "انضمام" : "Join"}
          </Button>
          <Button tone="neutral" variant="outline" size="sm">
            {dir === "rtl" ? "استكشاف" : "Explore"}
          </Button>

          <span className={cn("ms-auto rtl:ms-0 rtl:me-auto text-[11px] font-semibold text-foreground-muted")}>
            <bdi>{formatCompactNumber(c.postsPerDay)}</bdi>/{dir === "rtl" ? "يوم" : "day"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function PostCard({ p, dir }: { p: PostEntity; dir: "rtl" | "ltr" }) {
  const isRTL = dir === "rtl";
  const author = USERS.find((u) => u.id === p.authorId);

  return (
    <motion.div
      layout
      whileHover={{ y: -2 }}
      className={cn(
        "rounded-2xl border border-card-border bg-card p-3 shadow-[var(--shadow-sm)] transition",
        "hover:shadow-[var(--shadow-md)] hover:border-accent-border",
      )}
    >
      <div className={cn("flex items-start gap-3", isRTL ? "flex-row-reverse text-right" : "flex-row text-left")}>
        <AvatarImg
          src={author?.avatarUrl}
          alt={author?.displayName ?? "User"}
          className="size-11 shrink-0"
          fallback={(author?.displayName ?? "U")[0]}
        />

        <div className="min-w-0 flex-1">
          <div className={cn("flex items-start justify-between gap-2", isRTL && "flex-row-reverse")}>
            <div className="min-w-0">
              <bdi className="line-clamp-1 text-sm font-extrabold text-foreground-strong">{p.title}</bdi>
              <div className="mt-0.5 text-xs text-foreground-muted">
                <bdi>{author?.displayName ?? "—"}</bdi> • <bdi>{timeAgo(p.createdAt, dir)}</bdi> •{" "}
                <bdi className="uppercase">{p.type}</bdi>
              </div>
            </div>

            {p.hasSpoiler ? (
              <span className="rounded-full border border-warning-soft-border bg-warning-soft px-2 py-0.5 text-[11px] font-bold text-foreground-strong">
                {dir === "rtl" ? "حرق" : "Spoiler"}
              </span>
            ) : null}
          </div>

          <p className="mt-2 line-clamp-2 text-xs text-foreground">
            <bdi>{p.excerpt}</bdi>
          </p>

          <div className={cn("mt-2 flex flex-wrap gap-1.5", isRTL && "justify-end")}>
            {p.tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="inline-flex items-center rounded-full border border-border-subtle bg-background-elevated px-2 py-1 text-[11px] font-semibold text-foreground"
              >
                {t}
              </span>
            ))}
          </div>

          <div className={cn("mt-3 flex items-center justify-between text-xs text-foreground-muted", isRTL && "flex-row-reverse")}>
            <span className="inline-flex items-center gap-2">
              <span className="inline-flex items-center gap-1">
                <IoSparklesOutline className="size-4" />
                <bdi>{formatCompactNumber(p.reactions)}</bdi>
              </span>
              <span className="inline-flex items-center gap-1">
                <IoChatbubbleEllipsesOutline className="size-4" />
                <bdi>{formatCompactNumber(p.comments)}</bdi>
              </span>
            </span>

            <Button tone="neutral" variant="soft" size="sm">
              {dir === "rtl" ? "فتح" : "Open"}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────────
  Suggestions dropdown
────────────────────────────────────────────────────────────── */

function SuggestionsDropdown({
  open,
  dir,
  anchorRef,
  items,
  activeIndex,
  onSelect,
  onHover,
  onClose,
}: {
  open: boolean;
  dir: "rtl" | "ltr";
  anchorRef: React.RefObject<HTMLDivElement>;
  items: SuggestionItem[];
  activeIndex: number;
  onSelect: (item: SuggestionItem) => void;
  onHover: (index: number) => void;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();
  const isRTL = dir === "rtl";

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const a = anchorRef.current;
      if (!a) return;
      const t = e.target as Node;
      if (a.contains(t)) return;
      onClose();
    };
    document.addEventListener("pointerdown", onDown, true);
    return () => document.removeEventListener("pointerdown", onDown, true);
  }, [open, anchorRef, onClose]);

  return (
    <AnimatePresence>
      {open && items.length > 0 && (
        <motion.div
          initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          animate={reduce ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: reduce ? 0 : 0.14, ease: "easeOut" }}
          className={cn("absolute z-50 mt-2 w-full", isRTL ? "right-0" : "left-0")}
        >
          <div className="overflow-hidden rounded-2xl border border-border-strong bg-background-elevated shadow-[var(--shadow-elevated)]">
            <div className="flex items-center justify-between gap-2 border-b border-border-subtle bg-surface-soft/60 px-3 py-2">
              <div className={cn("flex items-center gap-2 text-xs text-foreground-muted", isRTL && "flex-row-reverse")}>
                <IoCompassOutline className="size-4" />
                <span>
                  <bdi>{dir === "rtl" ? "اقتراحات" : "Suggestions"}</bdi>
                </span>
              </div>

              <Button
                iconOnly
                aria-label={dir === "rtl" ? "إغلاق" : "Close"}
                variant="soft"
                tone="neutral"
                size="sm"
                onClick={onClose}
              >
                <IoCloseOutline className="size-4" />
              </Button>
            </div>

            <ul className="max-h-[340px] overflow-y-auto app-scroll">
              {items.map((it, idx) => {
                const isActive = idx === activeIndex;

                const tone =
                  it.kind === "trending"
                    ? "bg-warning-soft/55"
                    : it.kind === "history"
                      ? "bg-info-soft/45"
                      : it.kind === "entity"
                        ? "bg-accent-soft/45"
                        : "bg-surface-soft/45";

                return (
                  <li key={it.id}>
                    <button
                      type="button"
                      onMouseEnter={() => onHover(idx)}
                      onFocus={() => onHover(idx)}
                      onClick={() => onSelect(it)}
                      className={cn(
                        "w-full px-3 py-2 text-left transition",
                        "hover:bg-surface-soft/70 active:bg-surface-soft/90",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)]",
                        isActive && "bg-surface-soft/80",
                        isRTL && "text-right",
                      )}
                    >
                      <div className={cn("flex items-start gap-2", isRTL ? "flex-row-reverse" : "flex-row")}>
                        <span className={cn("mt-0.5 grid size-9 place-items-center rounded-xl border border-border-subtle text-foreground-strong", tone)}>
                          {it.icon ?? <IoSparklesOutline className="size-4" />}
                        </span>

                        <div className="min-w-0 flex-1">
                          <bdi className="block truncate text-xs font-bold text-foreground-strong">{it.label}</bdi>
                          {it.meta ? (
                            <div className="mt-0.5 text-[11px] text-foreground-muted">
                              <bdi>{it.meta}</bdi>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="border-t border-border-subtle bg-surface-soft/50 px-3 py-2">
              <div className={cn("flex items-center gap-2 text-[11px] text-foreground-muted", isRTL && "flex-row-reverse")}>
                <span className="rounded-full border border-border-subtle bg-background-elevated px-2 py-1 font-bold">Tab</span>
                <span>
                  <bdi>{dir === "rtl" ? "للإكمال • ↑↓ للتنقل • Enter للبحث" : "to autocomplete • ↑↓ to navigate • Enter to search"}</bdi>
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ──────────────────────────────────────────────────────────────
  Filters UI (SmartSelect + DeButton)
────────────────────────────────────────────────────────────── */

function FiltersBar({
  dir,
  typeGroup,
  filters,
  onChange,
  onReset,
}: {
  dir: "rtl" | "ltr";
  typeGroup: TypeGroup;
  filters: SearchFilters;
  onChange: (next: SearchFilters) => void;
  onReset: () => void;
}) {
  const isRTL = dir === "rtl";

  const genreOptions = useMemo<SelectOption[]>(
    () => [
      { value: "__any__", label: dir === "rtl" ? "أي نوع" : "Any genre", group: dir === "rtl" ? "عام" : "General" },
      ...WORK_GENRES.map((g) => ({
        value: g,
        label: g,
        group: dir === "rtl" ? "الأنواع" : "Genres",
      })),
    ],
    [dir],
  );

  const statusOptions = useMemo<SelectOption[]>(
    () => [
      { value: "any", label: dir === "rtl" ? "أي حالة" : "Any status", group: dir === "rtl" ? "عام" : "General" },
      { value: "ongoing", label: dir === "rtl" ? "مستمر" : "Ongoing", group: dir === "rtl" ? "الحالة" : "Status" },
      { value: "completed", label: dir === "rtl" ? "مكتمل" : "Completed", group: dir === "rtl" ? "الحالة" : "Status" },
      { value: "hiatus", label: dir === "rtl" ? "متوقف" : "Hiatus", group: dir === "rtl" ? "الحالة" : "Status" },
    ],
    [dir],
  );

  const yearOptions = useMemo<SelectOption[]>(
    () => [
      { value: "any", label: dir === "rtl" ? "أي سنة" : "Any year", group: dir === "rtl" ? "عام" : "General" },
      ...WORK_YEARS.map((y) => ({
        value: String(y),
        label: String(y),
        group: dir === "rtl" ? "السنوات" : "Years",
      })),
    ],
    [dir],
  );

  const ratingOptions = useMemo<SelectOption[]>(
    () => [
      { value: "any", label: dir === "rtl" ? "أي تقييم" : "Any rating", group: dir === "rtl" ? "عام" : "General" },
      { value: "7.5", label: "7.5+", group: dir === "rtl" ? "الحد الأدنى" : "Minimum" },
      { value: "8", label: "8.0+", group: dir === "rtl" ? "الحد الأدنى" : "Minimum" },
      { value: "8.5", label: "8.5+", group: dir === "rtl" ? "الحد الأدنى" : "Minimum" },
      { value: "9", label: "9.0+", group: dir === "rtl" ? "الحد الأدنى" : "Minimum" },
    ],
    [dir],
  );

  const peopleRoleOptions = useMemo<SelectOption[]>(
    () => [
      { value: "any", label: dir === "rtl" ? "أي دور" : "Any role", group: dir === "rtl" ? "عام" : "General" },
      { value: "user", label: dir === "rtl" ? "مستخدم" : "User", group: dir === "rtl" ? "الدور" : "Role" },
      { value: "creator", label: dir === "rtl" ? "صانع" : "Creator", group: dir === "rtl" ? "الدور" : "Role" },
      { value: "influencer", label: dir === "rtl" ? "مؤثر" : "Influencer", group: dir === "rtl" ? "الدور" : "Role" },
    ],
    [dir],
  );

  const followersOptions = useMemo<SelectOption[]>(
    () => [
      { value: "any", label: dir === "rtl" ? "أي عدد" : "Any", group: dir === "rtl" ? "عام" : "General" },
      { value: "1000", label: "1K+", group: dir === "rtl" ? "حد أدنى" : "Minimum" },
      { value: "10000", label: "10K+", group: dir === "rtl" ? "حد أدنى" : "Minimum" },
      { value: "50000", label: "50K+", group: dir === "rtl" ? "حد أدنى" : "Minimum" },
      { value: "100000", label: "100K+", group: dir === "rtl" ? "حد أدنى" : "Minimum" },
    ],
    [dir],
  );

  const postTypeOptions = useMemo<SelectOption[]>(
    () => [
      { value: "any", label: dir === "rtl" ? "أي نوع" : "Any type", group: dir === "rtl" ? "عام" : "General" },
      { value: "post", label: dir === "rtl" ? "منشور" : "Post", group: dir === "rtl" ? "النوع" : "Type" },
      { value: "review", label: dir === "rtl" ? "مراجعة" : "Review", group: dir === "rtl" ? "النوع" : "Type" },
      { value: "article", label: dir === "rtl" ? "مقال" : "Article", group: dir === "rtl" ? "النوع" : "Type" },
    ],
    [dir],
  );

  const postTagsOptions = useMemo<SelectOption[]>(
    () => {
      const tags = Array.from(new Set(POSTS.flatMap((p) => p.tags))).sort((a, b) => a.localeCompare(b));
      return tags.map((t) => ({
        value: t,
        label: t,
        group: dir === "rtl" ? "وسوم" : "Tags",
      }));
    },
    [dir],
  );

  const postSortOptions = useMemo<SelectOption[]>(
    () => [
      { value: "relevance", label: dir === "rtl" ? "الأكثر صلة" : "Relevance", group: dir === "rtl" ? "ترتيب" : "Sort" },
      { value: "newest", label: dir === "rtl" ? "الأحدث" : "Newest", group: dir === "rtl" ? "ترتيب" : "Sort" },
      { value: "top", label: dir === "rtl" ? "الأعلى" : "Top", group: dir === "rtl" ? "ترتيب" : "Sort" },
    ],
    [dir],
  );

  const communityKindOptions = useMemo<SelectOption[]>(
    () => [
      { value: "any", label: dir === "rtl" ? "الكل" : "Any", group: dir === "rtl" ? "عام" : "General" },
      { value: "official", label: dir === "rtl" ? "رسمي" : "Official", group: dir === "rtl" ? "النوع" : "Kind" },
      { value: "community", label: dir === "rtl" ? "مجتمع" : "Community", group: dir === "rtl" ? "النوع" : "Kind" },
    ],
    [dir],
  );

  const communityMembersOptions = useMemo<SelectOption[]>(
    () => [
      { value: "any", label: dir === "rtl" ? "أي حجم" : "Any size", group: dir === "rtl" ? "عام" : "General" },
      { value: "5000", label: "5K+", group: dir === "rtl" ? "حد أدنى" : "Minimum" },
      { value: "10000", label: "10K+", group: dir === "rtl" ? "حد أدنى" : "Minimum" },
      { value: "20000", label: "20K+", group: dir === "rtl" ? "حد أدنى" : "Minimum" },
      { value: "50000", label: "50K+", group: dir === "rtl" ? "حد أدنى" : "Minimum" },
    ],
    [dir],
  );

  const communityActivityOptions = useMemo<SelectOption[]>(
    () => [
      { value: "any", label: dir === "rtl" ? "أي نشاط" : "Any activity", group: dir === "rtl" ? "عام" : "General" },
      { value: "10", label: dir === "rtl" ? "10+ منشور/يوم" : "10+ posts/day", group: dir === "rtl" ? "حد أدنى" : "Minimum" },
      { value: "25", label: dir === "rtl" ? "25+ منشور/يوم" : "25+ posts/day", group: dir === "rtl" ? "حد أدنى" : "Minimum" },
      { value: "50", label: dir === "rtl" ? "50+ منشور/يوم" : "50+ posts/day", group: dir === "rtl" ? "حد أدنى" : "Minimum" },
      { value: "100", label: dir === "rtl" ? "100+ منشور/يوم" : "100+ posts/day", group: dir === "rtl" ? "حد أدنى" : "Minimum" },
    ],
    [dir],
  );

  const studioCountryOptions = useMemo<SelectOption[]>(
    () => [
      { value: "any", label: dir === "rtl" ? "أي دولة" : "Any country", group: dir === "rtl" ? "عام" : "General" },
      ...STUDIO_COUNTRIES.map((c) => ({
        value: c,
        label: c,
        group: dir === "rtl" ? "الدولة" : "Country",
      })),
    ],
    [dir],
  );

  const SelectCol = ({ children }: { children: React.ReactNode }) => (
    <div className="w-full">{children}</div>
  );

  const showWorks = typeGroup === "works" || typeGroup === "all";
  const showPeople = typeGroup === "people" || typeGroup === "all";
  const showContent = typeGroup === "content" || typeGroup === "all";
  const showIndustry = typeGroup === "industry" || typeGroup === "all";
  const showCommunities = typeGroup === "content" || typeGroup === "all";

  return (
    <div className="mt-3 rounded-2xl border border-border-subtle bg-surface-soft/60 p-3">
      <div className={cn("flex items-start justify-between gap-3", isRTL && "flex-row-reverse text-right")}>
        <div className="min-w-0">
          <div className="text-xs font-extrabold text-foreground-strong">
            <bdi>{dir === "rtl" ? "الفلاتر" : "Filters"}</bdi>
          </div>
          <div className="mt-0.5 text-[11px] text-foreground-muted">
            <bdi>{dir === "rtl" ? "كل فلتر له بيانات Mock ويؤثر فعليًا على النتائج" : "All selectors are mock-backed and affect results"}</bdi>
          </div>
        </div>

        <Button tone="neutral" variant="plain" size="sm" onClick={onReset} leftIcon={<IoCloseOutline className="size-4" />}>
          {dir === "rtl" ? "إعادة ضبط" : "Reset"}
        </Button>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Works filters */}
        {showWorks ? (
          <SelectCol>
            <SmartSelect
              label={dir === "rtl" ? "الأنواع" : "Genres"}
              options={genreOptions.filter((o) => o.value !== "__any__")}
              value={filters.workGenres}
              multiple
              onChange={(v) => {
                const arr = Array.isArray(v) ? (v as string[]) : v ? [String(v)] : [];
                onChange({ ...filters, workGenres: arr });
              }}
              placeholder={dir === "rtl" ? "أي نوع" : "Any genre"}
              searchable
              size="sm"
              variant="solid"
            />
          </SelectCol>
        ) : null}

        {showWorks ? (
          <SelectCol>
            <SmartSelect
              label={dir === "rtl" ? "الحالة" : "Status"}
              options={statusOptions}
              value={filters.workStatus}
              onChange={(v) => onChange({ ...filters, workStatus: (typeof v === "string" ? v : "any") as any })}
              searchable={false}
              size="sm"
              variant="solid"
            />
          </SelectCol>
        ) : null}

        {showWorks ? (
          <SelectCol>
            <SmartSelect
              label={dir === "rtl" ? "السنة" : "Year"}
              options={yearOptions}
              value={filters.workYear}
              onChange={(v) => onChange({ ...filters, workYear: typeof v === "string" ? v : "any" })}
              searchable
              size="sm"
              variant="solid"
            />
          </SelectCol>
        ) : null}

        {showWorks ? (
          <SelectCol>
            <SmartSelect
              label={dir === "rtl" ? "أقل تقييم" : "Min rating"}
              options={ratingOptions}
              value={filters.minRating}
              onChange={(v) => onChange({ ...filters, minRating: typeof v === "string" ? v : "any" })}
              searchable={false}
              size="sm"
              variant="solid"
            />
          </SelectCol>
        ) : null}

        {/* People filters */}
        {showPeople ? (
          <SelectCol>
            <SmartSelect
              label={dir === "rtl" ? "الدور" : "Role"}
              options={peopleRoleOptions}
              value={filters.peopleRole}
              onChange={(v) => onChange({ ...filters, peopleRole: (typeof v === "string" ? v : "any") as any })}
              searchable={false}
              size="sm"
              variant="solid"
            />
          </SelectCol>
        ) : null}

        {showPeople ? (
          <SelectCol>
            <SmartSelect
              label={dir === "rtl" ? "أقل متابعين" : "Min followers"}
              options={followersOptions}
              value={filters.minFollowers}
              onChange={(v) => onChange({ ...filters, minFollowers: typeof v === "string" ? v : "any" })}
              searchable={false}
              size="sm"
              variant="solid"
            />
          </SelectCol>
        ) : null}

        {/* Content filters */}
        {showContent ? (
          <SelectCol>
            <SmartSelect
              label={dir === "rtl" ? "نوع المنشور" : "Post type"}
              options={postTypeOptions}
              value={filters.postType}
              onChange={(v) => onChange({ ...filters, postType: (typeof v === "string" ? v : "any") as any })}
              searchable={false}
              size="sm"
              variant="solid"
            />
          </SelectCol>
        ) : null}

        {showContent ? (
          <SelectCol>
            <SmartSelect
              label={dir === "rtl" ? "وسوم" : "Tags"}
              options={postTagsOptions}
              value={filters.postTags}
              multiple
              onChange={(v) => {
                const arr = Array.isArray(v) ? (v as string[]) : v ? [String(v)] : [];
                onChange({ ...filters, postTags: arr });
              }}
              placeholder={dir === "rtl" ? "أي وسم" : "Any tag"}
              searchable
              size="sm"
              variant="solid"
            />
          </SelectCol>
        ) : null}

        {showContent ? (
          <SelectCol>
            <SmartSelect
              label={dir === "rtl" ? "ترتيب المنشورات" : "Post sort"}
              options={postSortOptions}
              value={filters.postSort}
              onChange={(v) => onChange({ ...filters, postSort: (typeof v === "string" ? v : "relevance") as SortMode })}
              searchable={false}
              size="sm"
              variant="solid"
            />
          </SelectCol>
        ) : null}

        {/* Communities filters */}
        {showCommunities ? (
          <SelectCol>
            <SmartSelect
              label={dir === "rtl" ? "نوع المجتمع" : "Community kind"}
              options={communityKindOptions}
              value={filters.communityKind}
              onChange={(v) => onChange({ ...filters, communityKind: (typeof v === "string" ? v : "any") as any })}
              searchable={false}
              size="sm"
              variant="solid"
            />
          </SelectCol>
        ) : null}

        {showCommunities ? (
          <SelectCol>
            <SmartSelect
              label={dir === "rtl" ? "أقل أعضاء" : "Min members"}
              options={communityMembersOptions}
              value={filters.communityMinMembers}
              onChange={(v) => onChange({ ...filters, communityMinMembers: typeof v === "string" ? v : "any" })}
              searchable={false}
              size="sm"
              variant="solid"
            />
          </SelectCol>
        ) : null}

        {showCommunities ? (
          <SelectCol>
            <SmartSelect
              label={dir === "rtl" ? "أقل نشاط" : "Min activity"}
              options={communityActivityOptions}
              value={filters.communityActivity}
              onChange={(v) => onChange({ ...filters, communityActivity: typeof v === "string" ? v : "any" })}
              searchable={false}
              size="sm"
              variant="solid"
            />
          </SelectCol>
        ) : null}

        {/* Industry filters */}
        {showIndustry ? (
          <SelectCol>
            <SmartSelect
              label={dir === "rtl" ? "الدولة" : "Country"}
              options={studioCountryOptions}
              value={filters.studioCountry}
              onChange={(v) => onChange({ ...filters, studioCountry: typeof v === "string" ? v : "any" })}
              searchable={false}
              size="sm"
              variant="solid"
            />
          </SelectCol>
        ) : null}
      </div>

      <div className={cn("mt-3 flex flex-wrap items-center gap-2", isRTL && "justify-end")}>
        <Button
          tone={filters.verifiedOnly ? "info" : "neutral"}
          variant={filters.verifiedOnly ? "soft" : "outline"}
          size="sm"
          leftIcon={<IoFlashOutline className="size-4" />}
          onClick={() => onChange({ ...filters, verifiedOnly: !filters.verifiedOnly })}
        >
          {dir === "rtl" ? "موثّق فقط" : "Verified only"}
        </Button>

        <Button
          tone={filters.hideSpoilers ? "warning" : "neutral"}
          variant={filters.hideSpoilers ? "soft" : "outline"}
          size="sm"
          leftIcon={<IoCloseOutline className="size-4" />}
          onClick={() => onChange({ ...filters, hideSpoilers: !filters.hideSpoilers })}
        >
          {dir === "rtl" ? "إخفاء الحرق" : "Hide spoilers"}
        </Button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
  Page
────────────────────────────────────────────────────────────── */

const HISTORY_KEY = "fanaara.search.history.v3";

function tabCount(scope: SearchScope, r: SearchResults | null) {
  if (!r) return 0;
  if (scope === "all") return r.total;
  return (r.groups as any)[scope]?.length ?? 0;
}

export default function SearchPage() {
  const reduce = useReducedMotion();
  const dir = useDocDir();
  const { isDark, isOnePiece } = useDocTheme();
  const isRTL = dir === "rtl";

  // selectors
  const [typeGroup, setTypeGroup] = useState<TypeGroup>("all");
  const [tab, setTab] = useState<SearchScope>("all");

  // filters
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);

  // search
  const [query, setQuery] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResults | null>(null);

  // history
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const historyReadyRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(HISTORY_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as HistoryEntry[];
        if (Array.isArray(parsed)) setHistory(parsed);
      }
    } catch {
      // ignore
    } finally {
      historyReadyRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!historyReadyRef.current) return;
    try {
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 24)));
    } catch {
      // ignore
    }
  }, [history]);

  // suggestions
  const anchorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [activeSug, setActiveSug] = useState(-1);

  const suggestions = useMemo(
    () => buildSuggestions({ query, dir, history, filters }),
    [query, dir, history, filters],
  );

  // keep tab valid for selected type group
  useEffect(() => {
    const allowed = GROUP_TABS[typeGroup];
    if (allowed.includes(tab)) return;
    setTab(typeGroup === "all" ? "all" : allowed[0] ?? "all");
  }, [typeGroup, tab]);

  // Re-run search when filters change (without adding a new history entry)
  useEffect(() => {
    if (!results) return;
    const q = results.query?.trim();
    if (!q) return;
    const r0 = runSearchAll(q, filters);
    setResults(r0);
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const executeSearch = useCallback(
    async (opts?: { q?: string; from?: "enter" | "button" | "history" | "suggestion"; applyFilters?: SearchFilters }) => {
      const q = (opts?.q ?? query).trim();
      const f = opts?.applyFilters ?? filters;

      if (!q) {
        setInputError(dir === "rtl" ? "اكتب كلمة للبحث أولًا." : "Type something first.");
        setResults(null);
        return;
      }

      setInputError(null);
      setIsSearching(true);
      setSuggestOpen(false);
      setActiveSug(-1);

      // keep UI in sync if the search came from history (stored filters)
      if (opts?.applyFilters) setFilters(opts.applyFilters);

      const started = typeof performance !== "undefined" ? performance.now() : Date.now();
      await new Promise((r) => setTimeout(r, 180 + Math.random() * 200));
      const took =
        typeof performance !== "undefined"
          ? Math.max(1, Math.round(performance.now() - started))
          : Math.max(1, Math.round(Date.now() - started));

      const r0 = runSearchAll(q, f);
      const finalR: SearchResults = { ...r0, tookMs: took };

      setResults(finalR);
      setIsSearching(false);

      // requirement: after any search, show main mixed results
      setTypeGroup("all");
      setTab("all");

      // update history (dedupe by query)
      const entry = buildHistoryEntry(finalR, f);

      setHistory((prev) => {
        const nq = normalizeText(q);
        const next = prev.filter((h) => normalizeText(h.query) !== nq);
        return [entry, ...next].slice(0, 24);
      });
    },
    [query, dir, filters],
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      window.localStorage.removeItem(HISTORY_KEY);
    } catch {
      // ignore
    }
  }, []);

  // "/" focuses search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/") return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      const isInput = tag === "INPUT" || tag === "TEXTAREA";
      if (isInput) return;
      e.preventDefault();
      inputRef.current?.focus();
      setSuggestOpen(true);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const visibleTabs = GROUP_TABS[typeGroup];

  const groupBtn = (i: number, len: number) => (i === 0 ? "start" : i === len - 1 ? "end" : "middle") as const;

  return (
    <main dir={dir} className="relative min-h-[100svh] bg-background text-foreground">
      {/* subtle background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className={cn(
            "absolute -top-40 -start-40 h-[520px] w-[520px] rounded-full blur-3xl",
            "bg-gradient-to-br from-accent/20 via-extra-purple/15 to-extra-pink/15",
            isDark ? "opacity-80" : "opacity-70",
            "animate-aurora-lite",
          )}
        />
        <div
          className={cn(
            "absolute -bottom-44 -end-44 h-[560px] w-[560px] rounded-full blur-3xl",
            isOnePiece
              ? "bg-gradient-to-br from-op-sky/25 via-op-straw/20 to-op-pirate/10"
              : "bg-gradient-to-br from-extra-cyan/16 via-accent/12 to-warning-500/10",
            isDark ? "opacity-80" : "opacity-70",
            "animate-aurora-lite",
          )}
        />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-3 py-6 sm:px-6 lg:px-8">
        {/* FIRST SECTION: search + selectors (no header) */}
        <GlassCard className="p-4">
          <div className="space-y-3">
            {/* search input + suggestions */}
            <div ref={anchorRef} className="relative">
              <AppInputBase
                ref={(el) => {
                  inputRef.current = el as HTMLInputElement | null;
                }}
                label={dir === "rtl" ? "بحث" : "Search"}
                placeholder={dir === "rtl" ? "ابحث عن أنمي، مانغا، مستخدم، مجتمع، منشور…" : "Search anime, manga, users, communities, posts…"}
                startIcon={IoSearchOutline}
                variant="outline"
                size="lg"
                intent={inputError ? "danger" : "brand"}
                errorMessage={inputError ?? undefined}
                value={query}
                onFocus={() => setSuggestOpen(true)}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSuggestOpen(true);
                  setActiveSug(-1);
                  if (inputError) setInputError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    if (suggestOpen) {
                      e.preventDefault();
                      setSuggestOpen(false);
                      setActiveSug(-1);
                      return;
                    }
                    if (query) {
                      e.preventDefault();
                      setQuery("");
                      setInputError(null);
                      return;
                    }
                  }

                  if (e.key === "ArrowDown") {
                    if (!suggestOpen) setSuggestOpen(true);
                    if (suggestions.length) {
                      e.preventDefault();
                      setActiveSug((i) => clamp(i + 1, 0, suggestions.length - 1));
                    }
                    return;
                  }

                  if (e.key === "ArrowUp") {
                    if (!suggestOpen) setSuggestOpen(true);
                    if (suggestions.length) {
                      e.preventDefault();
                      setActiveSug((i) => clamp(i - 1, 0, suggestions.length - 1));
                    }
                    return;
                  }

                  if (e.key === "Tab") {
                    const pick =
                      activeSug >= 0 ? suggestions[activeSug] : suggestions.find((s) => s.kind === "entity") ?? suggestions[0];
                    if (pick?.query) {
                      e.preventDefault();
                      setQuery(pick.query);
                      setSuggestOpen(false);
                      setActiveSug(-1);
                    }
                    return;
                  }

                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (suggestOpen && activeSug >= 0 && suggestions[activeSug]?.query) {
                      const it = suggestions[activeSug]!;
                      executeSearch({ q: it.query, from: "suggestion", applyFilters: it.applyFilters });
                      return;
                    }
                    executeSearch({ from: "enter" });
                  }
                }}
                action={{
                  ariaLabel: dir === "rtl" ? "بحث" : "Search",
                  icon: IoSearchOutline,
                  appearance: "solid",
                  tone: "brand",
                  onClick: () => executeSearch({ from: "button" }),
                  loading: isSearching,
                }}
              />

              <SuggestionsDropdown
                open={suggestOpen}
                dir={dir}
                anchorRef={anchorRef}
                items={suggestions}
                activeIndex={activeSug}
                onHover={(i) => setActiveSug(i)}
                onClose={() => {
                  setSuggestOpen(false);
                  setActiveSug(-1);
                }}
                onSelect={(it) => {
                  if (!it.query) return;
                  setQuery(it.query);
                  setSuggestOpen(false);
                  setActiveSug(-1);
                  executeSearch({ q: it.query, from: it.kind === "history" ? "history" : "suggestion", applyFilters: it.applyFilters });
                }}
              />
            </div>

            {/* Type group (special UI) — uses DeButton */}
            <div className={cn("flex w-full flex-wrap gap-0", isRTL && "flex-row-reverse")}>
              {(
                [
                  { id: "all" as const, label: dir === "rtl" ? "الكل" : "All", icon: <IoSparklesOutline className="size-4" /> },
                  { id: "works" as const, label: dir === "rtl" ? "الأعمال" : "Works", icon: <IoFilmOutline className="size-4" /> },
                  { id: "people" as const, label: dir === "rtl" ? "الأشخاص" : "People", icon: <IoPeopleOutline className="size-4" /> },
                  { id: "content" as const, label: dir === "rtl" ? "المحتوى" : "Content", icon: <IoChatbubbleEllipsesOutline className="size-4" /> },
                  { id: "industry" as const, label: dir === "rtl" ? "الصناعة" : "Industry", icon: <IoBusinessOutline className="size-4" /> },
                ] as const
              ).map((g, i, arr) => {
                const active = typeGroup === g.id;
                return (
                  <Button
                    key={g.id}
                    group={groupBtn(i, arr.length)}
                    size="sm"
                    tone={active ? "brand" : "neutral"}
                    variant={active ? "soft" : "outline"}
                    leftIcon={g.icon}
                    onClick={() => setTypeGroup(g.id)}
                    className="rounded-none"
                  >
                    {g.label}
                  </Button>
                );
              })}
            </div>

            {/* Category tabs (special UI) — uses DeButton + badgeCount */}
            <div className={cn("flex gap-2 overflow-x-auto no-scrollbar pb-1", isRTL && "flex-row-reverse")}>
              {visibleTabs.map((s) => {
                const active = tab === s;
                const n = tabCount(s, results);
                return (
                  <Button
                    key={s}
                    size="sm"
                    tone={active ? "brand" : "neutral"}
                    variant={active ? "soft" : "outline"}
                    leftIcon={scopeIcon(s)}
                    onClick={() => setTab(s)}
                    badgeCount={results ? n : undefined}
                    badgeMax={999}
                    badgeTone={active ? "brand" : "neutral"}
                    badgeAnchor="content"
                    badgePlacement="top-end"
                    badgeOffset={{ x: -4, y: 0 }}
                    className="shrink-0"
                  >
                    {scopeLabel(s, dir)}
                  </Button>
                );
              })}
            </div>

            {/* Filters — SmartSelect (real) + DeButton toggles */}
            <FiltersBar
              dir={dir}
              typeGroup={typeGroup}
              filters={filters}
              onChange={setFilters}
              onReset={() => setFilters(DEFAULT_FILTERS)}
            />
          </div>
        </GlassCard>

        {/* CONTENT SECTION: history auto OR results */}
        <div className="mt-4">
          {!results ? (
            <GlassCard className="p-4">
              <div className={cn("flex items-start justify-between gap-3", isRTL && "flex-row-reverse text-right")}>
                <div className="min-w-0">
                  <div className="text-sm font-extrabold text-foreground-strong">
                    <bdi>{dir === "rtl" ? "سجل البحث" : "Search history"}</bdi>
                  </div>
                  <div className="mt-1 text-xs text-foreground-muted">
                    <bdi>{dir === "rtl" ? "يظهر تلقائيًا هنا. اضغط على أي استعلام لإعادة البحث." : "Auto-shows here. Click any query to search again."}</bdi>
                  </div>
                </div>

                {history.length ? (
                  <Button tone="neutral" variant="plain" size="sm" leftIcon={<IoCloseOutline className="size-4" />} onClick={clearHistory}>
                    {dir === "rtl" ? "مسح" : "Clear"}
                  </Button>
                ) : null}
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-12">
                <div className="lg:col-span-7">
                  {history.length === 0 ? (
                    <div className="rounded-2xl border border-border-subtle bg-surface-soft/60 p-4">
                      <div className="text-sm font-bold text-foreground-strong">
                        <bdi>{dir === "rtl" ? "لا يوجد سجل بعد" : "No history yet"}</bdi>
                      </div>
                      <div className="mt-1 text-xs text-foreground-muted">
                        <bdi>{dir === "rtl" ? "ابدأ بالبحث وسيظهر آخر ما بحثت عنه هنا." : "Start searching — your recent queries will show here."}</bdi>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {history.slice(0, 10).map((h) => (
                        <button
                          key={h.id}
                          type="button"
                          onClick={() => {
                            setQuery(h.query);
                            executeSearch({ q: h.query, from: "history", applyFilters: h.filters });
                          }}
                          className={cn(
                            "w-full rounded-2xl border border-card-border bg-card p-3 text-left shadow-[var(--shadow-sm)] transition",
                            "hover:shadow-[var(--shadow-md)] hover:border-accent-border",
                            isRTL && "text-right",
                          )}
                        >
                          <div className={cn("flex items-start justify-between gap-3", isRTL && "flex-row-reverse")}>
                            <div className="min-w-0">
                              <div className="text-sm font-extrabold text-foreground-strong">
                                <bdi className="line-clamp-1">{h.query}</bdi>
                              </div>
                              <div className="mt-1 text-xs text-foreground-muted">
                                <bdi>{timeAgo(h.executedAt, dir)}</bdi> • <bdi>{h.total}</bdi> {dir === "rtl" ? "نتيجة" : "results"}
                              </div>

                              {Object.keys(h.counts).length ? (
                                <div className={cn("mt-2 flex flex-wrap gap-2", isRTL && "justify-end")}>
                                  {(
                                    ["anime", "manga", "comics", "users", "influencers", "posts", "communities", "studios"] as const
                                  )
                                    .filter((k) => (h.counts as any)[k])
                                    .slice(0, 6)
                                    .map((k) => (
                                      <span
                                        key={k}
                                        className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-soft/60 px-2 py-1 text-[11px] font-semibold text-foreground"
                                      >
                                        {scopeIcon(k)}
                                        <bdi>{(h.counts as any)[k]}</bdi>
                                      </span>
                                    ))}
                                </div>
                              ) : null}
                            </div>

                            <span className="inline-flex items-center rounded-full border border-accent-border bg-accent-soft px-2 py-1 text-[11px] font-bold text-foreground-strong">
                              {dir === "rtl" ? "إعادة" : "Run"}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Trending */}
                <div className="lg:col-span-5">
                  <div className="rounded-2xl border border-border-subtle bg-surface-soft/60 p-4">
                    <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                      <IoTrendingUpOutline className="size-4 text-foreground-strong" />
                      <div className="text-sm font-extrabold text-foreground-strong">
                        <bdi>{dir === "rtl" ? "ترند" : "Trending"}</bdi>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
                      {TRENDING_QUERIES.map((t) => (
                        <Button
                          key={t.q}
                          tone="neutral"
                          variant="outline"
                          size="sm"
                          leftIcon={<IoTrendingUpOutline className="size-4" />}
                          onClick={() => {
                            setQuery(t.q);
                            executeSearch({ q: t.q, from: "suggestion" });
                          }}
                          className="justify-start"
                          fullWidth
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <bdi className="truncate">{t.q}</bdi>
                            <span className="text-[11px] text-foreground-muted">• {t.meta}</span>
                          </span>
                        </Button>
                      ))}
                    </div>

                    <div className="mt-3 text-[11px] font-semibold text-foreground-muted">
                      <bdi>{dir === "rtl" ? "تلميح: اضغط / للتركيز" : "Tip: press / to focus"}</bdi>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          ) : (
            <GlassCard className="p-4">
              <div className={cn("flex items-start justify-between gap-3", isRTL && "flex-row-reverse text-right")}>
                <div className="min-w-0">
                  <div className="text-xs text-foreground-muted">
                    <bdi>{dir === "rtl" ? "استعلام" : "Query"}</bdi>
                  </div>
                  <div className="mt-1 text-lg font-extrabold text-foreground-strong">
                    <bdi className="line-clamp-1">{results.query}</bdi>
                  </div>
                  <div className="mt-1 text-xs text-foreground-muted">
                    <bdi>{dir === "rtl" ? `${results.total} نتيجة • ${results.tookMs}ms` : `${results.total} results • ${results.tookMs}ms`}</bdi>
                  </div>
                </div>

                <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  {isSearching ? (
                    <span className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-soft/70 px-3 py-2 text-xs font-bold text-foreground-strong">
                      <span className="inline-flex size-2 animate-pulse rounded-full bg-accent shadow-[var(--shadow-glow-brand)]" />
                      <bdi>{dir === "rtl" ? "جاري…" : "Searching…"}</bdi>
                    </span>
                  ) : null}

                  <Button
                    tone="neutral"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setResults(null);
                      setTypeGroup("all");
                      setTab("all");
                      inputRef.current?.focus();
                    }}
                  >
                    {dir === "rtl" ? "عرض السجل" : "Show history"}
                  </Button>
                </div>
              </div>

              <div className="mt-4">
                {results.total === 0 ? (
                  <div className={cn("rounded-2xl border border-border-subtle bg-surface-soft/60 p-4", isRTL && "text-right")}>
                    <div className="text-sm font-extrabold text-foreground-strong">
                      <bdi>{dir === "rtl" ? "لا توجد نتائج" : "No results"}</bdi>
                    </div>
                    <div className="mt-1 text-xs text-foreground-muted">
                      <bdi>{dir === "rtl" ? "جرّب كلمات مختلفة أو غيّر الفلاتر." : "Try different keywords or adjust filters."}</bdi>
                    </div>
                  </div>
                ) : (
                  <ResultsRenderer dir={dir} tab={tab} results={results} />
                )}
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </main>
  );
}

/* ──────────────────────────────────────────────────────────────
  Results renderer
────────────────────────────────────────────────────────────── */

function ResultsRenderer({
  dir,
  tab,
  results,
}: {
  dir: "rtl" | "ltr";
  tab: SearchScope;
  results: SearchResults;
}) {
  const reduce = useReducedMotion();
  const isRTL = dir === "rtl";

  const sectionAnim = reduce
    ? { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 } }
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.16, ease: "easeOut" } },
      };

  const Section = ({
    title,
    icon,
    count,
    children,
  }: {
    title: string;
    icon: React.ReactNode;
    count: number;
    children: React.ReactNode;
  }) => (
    <motion.div {...sectionAnim} className="rounded-2xl border border-border-subtle bg-background-elevated p-4">
      <div className={cn("flex items-start justify-between gap-3", isRTL && "flex-row-reverse text-right")}>
        <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
          <span className="grid size-9 place-items-center rounded-xl border border-border-subtle bg-surface-soft/70 text-foreground-strong">
            {icon}
          </span>
          <div className="min-w-0">
            <div className="text-sm font-extrabold text-foreground-strong">
              <bdi>{title}</bdi>
            </div>
            <div className="mt-0.5 text-xs text-foreground-muted">
              <bdi>{count}</bdi> {dir === "rtl" ? "نتيجة" : "results"}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3">{children}</div>
    </motion.div>
  );

  const g = results.groups;

  // Custom tab view
  if (tab !== "all") {
    if (tab === "anime") {
      return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {g.anime.map((w) => (
            <WorkCard key={w.id} w={w} dir={dir} />
          ))}
        </div>
      );
    }
    if (tab === "manga") {
      return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {g.manga.map((w) => (
            <WorkCard key={w.id} w={w} dir={dir} />
          ))}
        </div>
      );
    }
    if (tab === "comics") {
      return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {g.comics.map((w) => (
            <WorkCard key={w.id} w={w} dir={dir} />
          ))}
        </div>
      );
    }
    if (tab === "users") {
      return (
        <div className="space-y-3">
          {g.users.map((u) => (
            <UserCard key={u.id} u={u} dir={dir} />
          ))}
        </div>
      );
    }
    if (tab === "influencers") {
      return (
        <div className="space-y-3">
          {g.influencers.map((u) => (
            <UserCard key={u.id} u={u} dir={dir} />
          ))}
        </div>
      );
    }
    if (tab === "posts") {
      return (
        <div className="space-y-3">
          {g.posts.map((p) => (
            <PostCard key={p.id} p={p} dir={dir} />
          ))}
        </div>
      );
    }
    if (tab === "communities") {
      return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {g.communities.map((c) => (
            <CommunityCard key={c.id} c={c} dir={dir} />
          ))}
        </div>
      );
    }
    if (tab === "studios") {
      return (
        <div className="space-y-3">
          {g.studios.map((s) => (
            <StudioCard key={s.id} s={s} dir={dir} />
          ))}
        </div>
      );
    }
  }

  // Main view: show all types grouped
  const top = results.top;

  return (
    <div className="space-y-4">
      {top ? (
        <motion.div {...sectionAnim} className="rounded-2xl border border-accent-border bg-accent-soft/40 p-4">
          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse text-right")}>
            <span className="grid size-9 place-items-center rounded-xl border border-accent-border bg-accent-soft text-foreground-strong shadow-[var(--shadow-glow-brand)]">
              <IoSparklesOutline className="size-4" />
            </span>
            <div>
              <div className="text-sm font-extrabold text-foreground-strong">
                <bdi>{dir === "rtl" ? "أفضل نتيجة" : "Top match"}</bdi>
              </div>
              <div className="mt-0.5 text-xs text-foreground-muted">
                <bdi>{dir === "rtl" ? "تطابق واحد بارز" : "One highlighted result"}</bdi>
              </div>
            </div>
          </div>

          <div className="mt-3">
            {top.kind === "user" ? (
              <UserCard u={top} dir={dir} />
            ) : top.kind === "work" ? (
              <WorkCard w={top} dir={dir} />
            ) : top.kind === "studio" ? (
              <StudioCard s={top} dir={dir} />
            ) : top.kind === "community" ? (
              <CommunityCard c={top} dir={dir} />
            ) : (
              <PostCard p={top} dir={dir} />
            )}
          </div>
        </motion.div>
      ) : null}

      {g.anime.length ? (
        <Section title={scopeLabel("anime", dir)} icon={<IoFilmOutline className="size-4" />} count={g.anime.length}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {g.anime.slice(0, 4).map((w) => (
              <WorkCard key={w.id} w={w} dir={dir} />
            ))}
          </div>
        </Section>
      ) : null}

      {g.manga.length ? (
        <Section title={scopeLabel("manga", dir)} icon={<IoBookOutline className="size-4" />} count={g.manga.length}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {g.manga.slice(0, 4).map((w) => (
              <WorkCard key={w.id} w={w} dir={dir} />
            ))}
          </div>
        </Section>
      ) : null}

      {g.comics.length ? (
        <Section title={scopeLabel("comics", dir)} icon={<IoAlbumsOutline className="size-4" />} count={g.comics.length}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {g.comics.slice(0, 4).map((w) => (
              <WorkCard key={w.id} w={w} dir={dir} />
            ))}
          </div>
        </Section>
      ) : null}

      {g.users.length ? (
        <Section title={scopeLabel("users", dir)} icon={<IoPeopleOutline className="size-4" />} count={g.users.length}>
          <div className="space-y-3">
            {g.users.slice(0, 4).map((u) => (
              <UserCard key={u.id} u={u} dir={dir} />
            ))}
          </div>
        </Section>
      ) : null}

      {g.influencers.length ? (
        <Section title={scopeLabel("influencers", dir)} icon={<IoFlashOutline className="size-4" />} count={g.influencers.length}>
          <div className="space-y-3">
            {g.influencers.slice(0, 4).map((u) => (
              <UserCard key={u.id} u={u} dir={dir} />
            ))}
          </div>
        </Section>
      ) : null}

      {g.posts.length ? (
        <Section title={scopeLabel("posts", dir)} icon={<IoChatbubbleEllipsesOutline className="size-4" />} count={g.posts.length}>
          <div className="space-y-3">
            {g.posts.slice(0, 4).map((p) => (
              <PostCard key={p.id} p={p} dir={dir} />
            ))}
          </div>
        </Section>
      ) : null}

      {g.communities.length ? (
        <Section title={scopeLabel("communities", dir)} icon={<IoPeopleOutline className="size-4" />} count={g.communities.length}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {g.communities.slice(0, 4).map((c) => (
              <CommunityCard key={c.id} c={c} dir={dir} />
            ))}
          </div>
        </Section>
      ) : null}

      {g.studios.length ? (
        <Section title={scopeLabel("studios", dir)} icon={<IoBusinessOutline className="size-4" />} count={g.studios.length}>
          <div className="space-y-3">
            {g.studios.slice(0, 5).map((s) => (
              <StudioCard key={s.id} s={s} dir={dir} />
            ))}
          </div>
        </Section>
      ) : null}
    </div>
  );
}
