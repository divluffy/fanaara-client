// app/search/page.tsx
"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
  IoAlbumsOutline,
  IoBookOutline,
  IoBusinessOutline,
  IoChatbubbleEllipsesOutline,
  IoChevronDown,
  IoCloseOutline,
  IoCompassOutline,
  IoFilmOutline,
  IoFlashOutline,
  IoGridOutline,
  IoHeartOutline,
  IoListOutline,
  IoPeopleOutline,
  IoSearchOutline,
  IoSparklesOutline,
  IoTimeOutline,
  IoTrendingUpOutline,
} from "react-icons/io5";

import { Avatar } from "@/design/DeAvatar";
import { Button } from "@/design/DeButton";
import { SmartSelect, type SelectOption } from "@/design/DeSelect";
import { AppInputBase } from "@/design/DeInput";

/* ──────────────────────────────────────────────────────────────
  Utils
────────────────────────────────────────────────────────────── */

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function safeId(prefix = "id") {
  // crypto.randomUUID is not always available in older browsers.
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
    .replace(/[\u064B-\u065F]/g, "") // Arabic harakat
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
  if (abs < 1_000_000_000)
    return `${(n / 1_000_000).toFixed(abs < 10_000_000 ? 1 : 0)}M`;
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

/** data-url avatar/cover (works without any assets) */
function svgDataUrl(opts: {
  label: string;
  hue: number;
  shape?: "circle" | "square";
  sub?: string;
}) {
  const { label, hue, shape = "circle", sub } = opts;
  const initial = (label || "?").trim().slice(0, 1).toUpperCase();
  const bg1 = `hsl(${hue} 85% 55%)`;
  const bg2 = `hsl(${(hue + 40) % 360} 85% 45%)`;
  const ink = "rgba(255,255,255,0.95)";
  const ink2 = "rgba(255,255,255,0.78)";
  const r = shape === "circle" ? 999 : 28;

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256">
    <defs>
      <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="${bg1}"/>
        <stop offset="1" stop-color="${bg2}"/>
      </linearGradient>
      <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="10" result="b"/>
        <feColorMatrix in="b" type="matrix"
          values="1 0 0 0 0
                  0 1 0 0 0
                  0 0 1 0 0
                  0 0 0 .35 0" result="c"/>
        <feMerge>
          <feMergeNode in="c"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <rect x="0" y="0" width="256" height="256" rx="${r}" fill="url(#g)"/>
    <circle cx="64" cy="54" r="34" fill="rgba(255,255,255,0.18)" filter="url(#glow)"/>
    <circle cx="214" cy="210" r="42" fill="rgba(0,0,0,0.14)"/>
    <text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle"
      font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto"
      font-size="108" font-weight="800" fill="${ink}">
      ${initial}
    </text>
    ${
      sub
        ? `<text x="50%" y="76%" text-anchor="middle"
            font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto"
            font-size="24" font-weight="700" fill="${ink2}">
            ${sub.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
          </text>`
        : ""
    }
  </svg>`.trim();

  const encoded = encodeURIComponent(svg).replace(/%20/g, " ");
  return `data:image/svg+xml,${encoded}`;
}

/* ──────────────────────────────────────────────────────────────
  Doc dir/theme hooks (RTL/LTR + Dark/Light)
────────────────────────────────────────────────────────────── */

function getDocDir(): "rtl" | "ltr" {
  if (typeof document === "undefined") return "ltr";
  return document.documentElement.dir === "rtl" ? "rtl" : "ltr";
}

function useDocDir() {
  const [dir, setDir] = useState<"rtl" | "ltr">(() => "ltr");

  useEffect(() => {
    if (typeof document === "undefined") return;

    const el = document.documentElement;
    const update = () => setDir(el.dir === "rtl" ? "rtl" : "ltr");
    update();

    const mo = new MutationObserver(() => update());
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

    const mo = new MutationObserver(() => update());
    mo.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);

  return { isDark, isOnePiece };
}

/* ──────────────────────────────────────────────────────────────
  Domain types + mock dataset (replace with API later)
────────────────────────────────────────────────────────────── */

type SearchScope =
  | "all"
  | "users"
  | "influencers"
  | "anime"
  | "manga"
  | "comics"
  | "studios"
  | "posts"
  | "communities";

type UserRole = "user" | "creator" | "influencer";

type UserEntity = {
  kind: "user";
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
  verified?: boolean;
  followers: number;
  bio: string;
  badges?: Array<"pro" | "creator" | "mod" | "founder">;
  hue: number;
};

type WorkType = "anime" | "manga" | "comic";

type WorkEntity = {
  kind: "work";
  id: string;
  workType: WorkType;
  title: string;
  altTitle?: string;
  year?: number;
  genres: string[];
  rating: number; // 0..10
  studio?: string;
  status?: "ongoing" | "completed" | "hiatus";
  hue: number;
};

type StudioEntity = {
  kind: "studio";
  id: string;
  name: string;
  country: string;
  verified?: boolean;
  worksCount: number;
  hue: number;
};

type PostEntity = {
  kind: "post";
  id: string;
  title: string;
  excerpt: string;
  authorId: string;
  type: "post" | "review" | "article";
  createdAt: number;
  reactions: number;
  comments: number;
  tags: string[];
  hasSpoiler?: boolean;
};

type CommunityEntity = {
  kind: "community";
  id: string;
  name: string;
  description: string;
  members: number;
  postsPerDay: number;
  isOfficial?: boolean;
  hue: number;
};

type SearchEntity = UserEntity | WorkEntity | StudioEntity | PostEntity | CommunityEntity;

const USERS: UserEntity[] = [
  {
    kind: "user",
    id: "u_1",
    username: "dev.luffy",
    displayName: "dev.luffy",
    role: "creator",
    verified: true,
    followers: 48210,
    bio: "Founder @ Fanaara • Building anime community systems • Clean Architecture",
    badges: ["founder", "creator", "pro"],
    hue: 190,
  },
  {
    kind: "user",
    id: "u_2",
    username: "aki.senpai",
    displayName: "Aki Senpai",
    role: "influencer",
    verified: true,
    followers: 129004,
    bio: "Daily anime edits • Weekly reviews • Spoiler-safe threads",
    badges: ["creator", "pro"],
    hue: 320,
  },
  {
    kind: "user",
    id: "u_3",
    username: "mika_reads",
    displayName: "Mika",
    role: "creator",
    verified: false,
    followers: 22140,
    bio: "Manga critic • Seinen addict • Panel-by-panel breakdowns",
    badges: ["creator"],
    hue: 275,
  },
  {
    kind: "user",
    id: "u_4",
    username: "zayed.otaku",
    displayName: "Zayed",
    role: "user",
    verified: false,
    followers: 2210,
    bio: "I watch anything with great OST 🎧",
    hue: 28,
  },
  {
    kind: "user",
    id: "u_5",
    username: "studio_scouter",
    displayName: "Studio Scouter",
    role: "influencer",
    verified: false,
    followers: 9870,
    bio: "Tracking studios, staff, PVs • Production nerd",
    badges: ["creator"],
    hue: 210,
  },
];

const WORKS: WorkEntity[] = [
  {
    kind: "work",
    id: "w_a_1",
    workType: "anime",
    title: "Skyforge Academy",
    altTitle: "天空鍛造アカデミア",
    year: 2024,
    genres: ["Action", "Fantasy", "School"],
    rating: 8.6,
    studio: "KairoWorks",
    status: "ongoing",
    hue: 200,
  },
  {
    kind: "work",
    id: "w_a_2",
    workType: "anime",
    title: "Neon Ronin",
    year: 2023,
    genres: ["Cyberpunk", "Action"],
    rating: 8.1,
    studio: "PulseFrame",
    status: "completed",
    hue: 160,
  },
  {
    kind: "work",
    id: "w_m_1",
    workType: "manga",
    title: "Crimson Panels",
    year: 2022,
    genres: ["Seinen", "Thriller"],
    rating: 8.9,
    studio: "—",
    status: "ongoing",
    hue: 10,
  },
  {
    kind: "work",
    id: "w_m_2",
    workType: "manga",
    title: "Kitsune Contract",
    altTitle: "狐の契約",
    year: 2021,
    genres: ["Mystery", "Supernatural"],
    rating: 8.0,
    studio: "—",
    status: "hiatus",
    hue: 45,
  },
  {
    kind: "work",
    id: "w_c_1",
    workType: "comic",
    title: "Starlight Rangers",
    year: 2020,
    genres: ["Sci‑Fi", "Adventure"],
    rating: 7.7,
    studio: "—",
    status: "completed",
    hue: 280,
  },
  {
    kind: "work",
    id: "w_c_2",
    workType: "comic",
    title: "Ink & Thunder",
    year: 2024,
    genres: ["Superhero", "Drama"],
    rating: 7.9,
    studio: "—",
    status: "ongoing",
    hue: 120,
  },
];

const STUDIOS: StudioEntity[] = [
  {
    kind: "studio",
    id: "s_1",
    name: "KairoWorks",
    country: "JP",
    verified: true,
    worksCount: 22,
    hue: 195,
  },
  {
    kind: "studio",
    id: "s_2",
    name: "PulseFrame",
    country: "KR",
    verified: false,
    worksCount: 9,
    hue: 155,
  },
  {
    kind: "studio",
    id: "s_3",
    name: "AmberKey Studio",
    country: "US",
    verified: false,
    worksCount: 5,
    hue: 32,
  },
];

const COMMUNITIES: CommunityEntity[] = [
  {
    kind: "community",
    id: "c_1",
    name: "Spoiler‑Safe Zone",
    description: "تجارب مشاهدة بدون حرق • نقاشات بعد كل حلقة مع فلاتر سبويلر صارمة.",
    members: 50210,
    postsPerDay: 146,
    isOfficial: true,
    hue: 200,
  },
  {
    kind: "community",
    id: "c_2",
    name: "Manga Lab",
    description: "تحليلات الفصول • نظريات • مقارنات اقتباس الأنمي.",
    members: 18340,
    postsPerDay: 57,
    hue: 290,
  },
  {
    kind: "community",
    id: "c_3",
    name: "Studios & Staff",
    description: "Production deep dives • staff trackers • PV breakdowns.",
    members: 9250,
    postsPerDay: 18,
    hue: 165,
  },
];

const POSTS: PostEntity[] = [
  {
    kind: "post",
    id: "p_1",
    title: "Why production schedules matter (and how to spot issues early)",
    excerpt:
      "A practical guide to reading PVs, staff credits, and episode pacing without doomposting…",
    authorId: "u_5",
    type: "article",
    createdAt: Date.now() - 1000 * 60 * 60 * 6,
    reactions: 1280,
    comments: 194,
    tags: ["Production", "Studios", "Guide"],
  },
  {
    kind: "post",
    id: "p_2",
    title: "Skyforge Academy — Episode 9 review (NO SPOILERS)",
    excerpt:
      "The animation cuts were clean, but the directing choices did the heavy lifting…",
    authorId: "u_2",
    type: "review",
    createdAt: Date.now() - 1000 * 60 * 60 * 30,
    reactions: 9320,
    comments: 865,
    tags: ["Review", "Anime"],
  },
  {
    kind: "post",
    id: "p_3",
    title: "Crimson Panels: chapter 84 theory thread (SPOILERS)",
    excerpt:
      "If panel 17 is intentional foreshadowing, then the next arc flips the protagonist’s motive…",
    authorId: "u_3",
    type: "post",
    createdAt: Date.now() - 1000 * 60 * 60 * 55,
    reactions: 4210,
    comments: 512,
    tags: ["Theory", "Manga"],
    hasSpoiler: true,
  },
  {
    kind: "post",
    id: "p_4",
    title: "Best OST moments this week",
    excerpt:
      "A small playlist of scenes where the soundtrack carried the emotion — drop your picks!",
    authorId: "u_4",
    type: "post",
    createdAt: Date.now() - 1000 * 60 * 120,
    reactions: 740,
    comments: 88,
    tags: ["OST", "Weekly"],
  },
];

/* ──────────────────────────────────────────────────────────────
  Search engine + History model
────────────────────────────────────────────────────────────── */

type SortMode = "relevance" | "newest" | "top";

type RefineState = {
  sort: SortMode;
  verifiedOnly: boolean;
  hideSpoilers: boolean;
};

type SearchResults = {
  query: string;
  scope: SearchScope;
  tookMs: number;
  total: number;

  groups: {
    users: UserEntity[];
    influencers: UserEntity[];
    anime: WorkEntity[];
    manga: WorkEntity[];
    comics: WorkEntity[];
    studios: StudioEntity[];
    posts: PostEntity[];
    communities: CommunityEntity[];
  };

  top?: SearchEntity;
};

type HistoryEntry = {
  id: string;
  query: string;
  scope: SearchScope;
  refined: Pick<RefineState, "sort" | "verifiedOnly" | "hideSpoilers">;
  executedAt: number;
  total: number;
  counts: Partial<Record<Exclude<SearchScope, "all">, number>>;
  preview: Array<{
    kind: SearchEntity["kind"];
    id: string;
    label: string;
    sub?: string;
    hue: number;
  }>;
};

function scoreText(haystack: string, terms: string[]) {
  const h = normalizeText(haystack);
  if (!terms.length) return 0;

  let score = 0;
  for (const t of terms) {
    if (!t) continue;

    if (h === t) score += 50;
    else if (h.startsWith(t)) score += 18;
    else if (h.includes(` ${t}`)) score += 12;
    else if (h.includes(t)) score += 8;
    else return 0; // MUST match all terms
  }

  // slight boost for shorter matches
  score += clamp(18 - Math.floor(h.length / 14), 0, 18);
  return score;
}

function searchUsers(q: string, refine: RefineState) {
  const terms = splitTerms(q);
  const items = USERS.map((u) => {
    const s = scoreText(
      `${u.displayName} ${u.username} ${u.bio} ${(u.badges ?? []).join(" ")}`,
      terms,
    );
    return { u, s };
  })
    .filter((x) => x.s > 0)
    .filter((x) => (refine.verifiedOnly ? Boolean(x.u.verified) : true))
    .sort((a, b) => b.s - a.s || b.u.followers - a.u.followers)
    .map((x) => x.u);

  const influencers = items.filter((u) => u.role === "influencer");
  const users = items.filter((u) => u.role !== "influencer");
  return { users, influencers };
}

function searchWorks(q: string) {
  const terms = splitTerms(q);
  const items = WORKS.map((w) => {
    const s = scoreText(
      `${w.title} ${w.altTitle ?? ""} ${(w.genres ?? []).join(" ")} ${
        w.studio ?? ""
      } ${w.workType} ${w.year ?? ""}`,
      terms,
    );
    return { w, s };
  })
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || b.w.rating - a.w.rating)
    .map((x) => x.w);

  return {
    anime: items.filter((w) => w.workType === "anime"),
    manga: items.filter((w) => w.workType === "manga"),
    comics: items.filter((w) => w.workType === "comic"),
  };
}

function searchStudios(q: string) {
  const terms = splitTerms(q);
  return STUDIOS.map((s) => {
    const sc = scoreText(`${s.name} ${s.country} ${s.worksCount}`, terms);
    return { s, sc };
  })
    .filter((x) => x.sc > 0)
    .sort((a, b) => b.sc - a.sc || b.s.worksCount - a.s.worksCount)
    .map((x) => x.s);
}

function searchCommunities(q: string) {
  const terms = splitTerms(q);
  return COMMUNITIES.map((c) => {
    const sc = scoreText(`${c.name} ${c.description}`, terms);
    return { c, sc };
  })
    .filter((x) => x.sc > 0)
    .sort((a, b) => b.sc - a.sc || b.c.members - a.c.members)
    .map((x) => x.c);
}

function searchPosts(q: string, refine: RefineState) {
  const terms = splitTerms(q);
  const items = POSTS.map((p) => {
    const sc = scoreText(
      `${p.title} ${p.excerpt} ${p.tags.join(" ")} ${p.type}`,
      terms,
    );
    return { p, sc };
  })
    .filter((x) => x.sc > 0)
    .filter((x) => (refine.hideSpoilers ? !x.p.hasSpoiler : true))
    .sort((a, b) => {
      if (refine.sort === "newest") return b.p.createdAt - a.p.createdAt;
      if (refine.sort === "top") return b.p.reactions - a.p.reactions;
      return b.sc - a.sc || b.p.reactions - a.p.reactions;
    })
    .map((x) => x.p);

  return items;
}

function buildTopEntity(r: SearchResults): SearchEntity | undefined {
  const candidates: Array<{ e: SearchEntity; w: number }> = [];

  // simple weighting by type (we want "top match" to be meaningful)
  const push = (e: SearchEntity | undefined, w: number) => {
    if (!e) return;
    candidates.push({ e, w });
  };

  push(r.groups.users[0], 80);
  push(r.groups.influencers[0], 78);

  push(r.groups.anime[0], 75);
  push(r.groups.manga[0], 74);
  push(r.groups.comics[0], 72);

  push(r.groups.posts[0], 70);
  push(r.groups.communities[0], 68);
  push(r.groups.studios[0], 66);

  candidates.sort((a, b) => b.w - a.w);
  return candidates[0]?.e;
}

function runSearch(q: string, scope: SearchScope, refine: RefineState): SearchResults {
  const t0 = performance.now();

  // Always compute all groups; UI decides what to render (keeps "All" instant).
  const { users, influencers } = searchUsers(q, refine);
  const works = searchWorks(q);
  const studios = searchStudios(q);
  const communities = searchCommunities(q);
  const posts = searchPosts(q, refine);

  // Apply scope by zeroing irrelevant groups (so counts/total are coherent)
  const groups = {
    users: scope === "users" || scope === "all" ? users : [],
    influencers: scope === "influencers" || scope === "all" ? influencers : [],
    anime: scope === "anime" || scope === "all" ? works.anime : [],
    manga: scope === "manga" || scope === "all" ? works.manga : [],
    comics: scope === "comics" || scope === "all" ? works.comics : [],
    studios: scope === "studios" || scope === "all" ? studios : [],
    posts: scope === "posts" || scope === "all" ? posts : [],
    communities: scope === "communities" || scope === "all" ? communities : [],
  };

  const total =
    groups.users.length +
    groups.influencers.length +
    groups.anime.length +
    groups.manga.length +
    groups.comics.length +
    groups.studios.length +
    groups.posts.length +
    groups.communities.length;

  const tookMs = Math.max(1, Math.round(performance.now() - t0));
  const out: SearchResults = {
    query: q,
    scope,
    tookMs,
    total,
    groups,
    top: undefined,
  };

  out.top = buildTopEntity(out);
  return out;
}

function buildHistoryEntry(r: SearchResults, refine: RefineState): HistoryEntry {
  const counts: HistoryEntry["counts"] = {};
  if (r.groups.users.length) counts.users = r.groups.users.length;
  if (r.groups.influencers.length) counts.influencers = r.groups.influencers.length;
  if (r.groups.anime.length) counts.anime = r.groups.anime.length;
  if (r.groups.manga.length) counts.manga = r.groups.manga.length;
  if (r.groups.comics.length) counts.comics = r.groups.comics.length;
  if (r.groups.studios.length) counts.studios = r.groups.studios.length;
  if (r.groups.posts.length) counts.posts = r.groups.posts.length;
  if (r.groups.communities.length) counts.communities = r.groups.communities.length;

  const preview: HistoryEntry["preview"] = [];

  const pushPreview = (x: HistoryEntry["preview"][number] | undefined) => {
    if (!x) return;
    if (preview.some((p) => p.kind === x.kind && p.id === x.id)) return;
    preview.push(x);
  };

  const top = r.top;
  if (top?.kind === "user") {
    pushPreview({
      kind: "user",
      id: top.id,
      label: top.displayName,
      sub: `@${top.username}`,
      hue: top.hue,
    });
  } else if (top?.kind === "work") {
    pushPreview({
      kind: "work",
      id: top.id,
      label: top.title,
      sub: top.workType.toUpperCase(),
      hue: top.hue,
    });
  } else if (top?.kind === "post") {
    pushPreview({
      kind: "post",
      id: top.id,
      label: top.title,
      sub: top.type.toUpperCase(),
      hue: 200,
    });
  } else if (top?.kind === "community") {
    pushPreview({
      kind: "community",
      id: top.id,
      label: top.name,
      sub: `${formatCompactNumber(top.members)} members`,
      hue: top.hue,
    });
  } else if (top?.kind === "studio") {
    pushPreview({
      kind: "studio",
      id: top.id,
      label: top.name,
      sub: top.country,
      hue: top.hue,
    });
  }

  // add a few more variety previews
  const addMore = <T extends { id: string }>(
    kind: HistoryEntry["preview"][number]["kind"],
    items: T[],
    map: (x: T) => Omit<HistoryEntry["preview"][number], "kind">,
    max = 3,
  ) => {
    for (let i = 0; i < Math.min(max, items.length); i++) {
      const x = items[i]!;
      const m = map(x);
      pushPreview({ kind, ...m });
    }
  };

  addMore("user", r.groups.users, (u) => ({
    id: (u as any).id,
    label: (u as any).displayName,
    sub: `@${(u as any).username}`,
    hue: (u as any).hue,
  }), 2);

  addMore("work", [...r.groups.anime, ...r.groups.manga, ...r.groups.comics], (w) => ({
    id: (w as any).id,
    label: (w as any).title,
    sub: String((w as any).workType).toUpperCase(),
    hue: (w as any).hue,
  }), 2);

  addMore("post", r.groups.posts, (p) => ({
    id: (p as any).id,
    label: (p as any).title,
    sub: String((p as any).type).toUpperCase(),
    hue: 200,
  }), 1);

  return {
    id: safeId("h"),
    query: r.query,
    scope: r.scope,
    refined: {
      sort: refine.sort,
      verifiedOnly: refine.verifiedOnly,
      hideSpoilers: refine.hideSpoilers,
    },
    executedAt: Date.now(),
    total: r.total,
    counts,
    preview: preview.slice(0, 6),
  };
}

/* ──────────────────────────────────────────────────────────────
  Suggestions model
────────────────────────────────────────────────────────────── */

type SuggestionKind = "history" | "trending" | "entity" | "hint";

type SuggestionItem = {
  id: string;
  kind: SuggestionKind;
  label: string;
  query: string;
  meta?: string;
  applyScope?: SearchScope;
  hue?: number;
};

const TRENDING: Array<{ q: string; scope?: SearchScope; meta?: string; hue: number }> = [
  { q: "Skyforge", scope: "anime", meta: "Anime", hue: 200 },
  { q: "Crimson", scope: "manga", meta: "Manga", hue: 12 },
  { q: "Studios", scope: "studios", meta: "Studios", hue: 165 },
  { q: "Spoiler‑Safe", scope: "communities", meta: "Communities", hue: 210 },
  { q: "production", scope: "posts", meta: "Articles", hue: 190 },
];

function buildSuggestions(args: {
  query: string;
  scope: SearchScope;
  dir: "rtl" | "ltr";
  history: HistoryEntry[];
}) {
  const { query, scope, dir, history } = args;
  const q = query.trim();
  const out: SuggestionItem[] = [];

  // (1) when empty => show history + trending
  if (!q) {
    const recent = history.slice(0, 6).map((h) => ({
      id: `hist_${h.id}`,
      kind: "history" as const,
      label: h.query,
      query: h.query,
      meta:
        dir === "rtl"
          ? `${scopeLabel(h.scope, dir)} • ${timeAgo(h.executedAt, dir)} • ${
              h.total
            }`
          : `${scopeLabel(h.scope, dir)} • ${timeAgo(h.executedAt, dir)} • ${
              h.total
            }`,
      applyScope: h.scope,
      hue: 210,
    }));

    out.push(...recent);

    out.push(
      ...TRENDING.map((t) => ({
        id: `trend_${t.q}`,
        kind: "trending" as const,
        label: t.q,
        query: t.q,
        meta: t.meta ?? (dir === "rtl" ? "ترند" : "Trending"),
        applyScope: t.scope,
        hue: t.hue,
      })),
    );

    out.push({
      id: "hint_scope",
      kind: "hint",
      label: dir === "rtl" ? "نصيحة: جرّب التحديد حسب النوع لنتائج أدق" : "Tip: Use scopes for sharper results",
      query: "",
      meta: dir === "rtl" ? "اختصارات" : "Shortcuts",
    });

    return out.slice(0, 10);
  }

  // (2) with input => entity suggestions (top matches)
  const terms = splitTerms(q);

  // collect candidates across entities (lightweight)
  const candidates: Array<{
    label: string;
    meta: string;
    applyScope?: SearchScope;
    score: number;
    hue: number;
  }> = [];

  // users
  for (const u of USERS) {
    const s = scoreText(`${u.displayName} ${u.username} ${u.bio}`, terms);
    if (!s) continue;
    candidates.push({
      label: u.displayName,
      meta: `@${u.username}`,
      applyScope: u.role === "influencer" ? "influencers" : "users",
      score: s + (u.verified ? 6 : 0),
      hue: u.hue,
    });
  }

  // works
  for (const w of WORKS) {
    const s = scoreText(`${w.title} ${w.altTitle ?? ""} ${w.workType}`, terms);
    if (!s) continue;
    candidates.push({
      label: w.title,
      meta: w.workType.toUpperCase(),
      applyScope: w.workType === "comic" ? "comics" : w.workType,
      score: s + Math.round(w.rating),
      hue: w.hue,
    });
  }

  // studios
  for (const s0 of STUDIOS) {
    const s = scoreText(`${s0.name} ${s0.country}`, terms);
    if (!s) continue;
    candidates.push({
      label: s0.name,
      meta: dir === "rtl" ? "استوديو" : "Studio",
      applyScope: "studios",
      score: s + (s0.verified ? 5 : 0),
      hue: s0.hue,
    });
  }

  // communities
  for (const c of COMMUNITIES) {
    const s = scoreText(`${c.name} ${c.description}`, terms);
    if (!s) continue;
    candidates.push({
      label: c.name,
      meta: dir === "rtl" ? "مجموعة" : "Community",
      applyScope: "communities",
      score: s + Math.round(Math.log10(c.members + 10) * 4),
      hue: c.hue,
    });
  }

  // posts
  for (const p of POSTS) {
    const s = scoreText(`${p.title} ${p.tags.join(" ")}`, terms);
    if (!s) continue;
    candidates.push({
      label: p.title,
      meta: dir === "rtl" ? "منشور" : "Post",
      applyScope: "posts",
      score: s + Math.round(Math.log10(p.reactions + 10) * 5),
      hue: 200,
    });
  }

  candidates.sort((a, b) => b.score - a.score);

  out.push(
    ...candidates.slice(0, 7).map((c, idx) => ({
      id: `ent_${idx}_${c.label}`,
      kind: "entity" as const,
      label: c.label,
      query: c.label,
      meta: c.meta,
      applyScope: c.applyScope,
      hue: c.hue,
    })),
  );

  // scope-aware helpers
  out.push({
    id: "hint_enter",
    kind: "hint",
    label: dir === "rtl" ? "اضغط Enter للبحث — Tab للإكمال" : "Press Enter to search — Tab to autocomplete",
    query: "",
    meta: scopeLabel(scope, dir),
  });

  return out.slice(0, 10);
}

/* ──────────────────────────────────────────────────────────────
  Copy / Labels (RTL <-> LTR)
────────────────────────────────────────────────────────────── */

function scopeLabel(scope: SearchScope, dir: "rtl" | "ltr") {
  const rtl: Record<SearchScope, string> = {
    all: "بحث عام",
    users: "مستخدمين",
    influencers: "مؤثرين",
    anime: "أنمي",
    manga: "مانغا",
    comics: "قصص مصورة",
    studios: "استوديوهات",
    posts: "منشورات",
    communities: "مجموعات",
  };

  const ltr: Record<SearchScope, string> = {
    all: "All",
    users: "Users",
    influencers: "Influencers",
    anime: "Anime",
    manga: "Manga",
    comics: "Comics",
    studios: "Studios",
    posts: "Posts",
    communities: "Communities",
  };

  return dir === "rtl" ? rtl[scope] : ltr[scope];
}

function scopeIcon(scope: SearchScope) {
  switch (scope) {
    case "all":
      return <IoSparklesOutline className="size-4" />;
    case "users":
      return <IoPeopleOutline className="size-4" />;
    case "influencers":
      return <IoFlashOutline className="size-4" />;
    case "anime":
      return <IoFilmOutline className="size-4" />;
    case "manga":
      return <IoBookOutline className="size-4" />;
    case "comics":
      return <IoAlbumsOutline className="size-4" />;
    case "studios":
      return <IoBusinessOutline className="size-4" />;
    case "posts":
      return <IoChatbubbleEllipsesOutline className="size-4" />;
    case "communities":
      return <IoPeopleOutline className="size-4" />;
  }
}

function scopeDescription(scope: SearchScope, dir: "rtl" | "ltr") {
  const rtl: Record<SearchScope, string> = {
    all: "كل شيء داخل المنصة — نماذج مختلفة للنتائج",
    users: "حسابات المستخدمين داخل Fanaara",
    influencers: "صنّاع محتوى ومؤثرين",
    anime: "أعمال أنمي",
    manga: "أعمال مانغا",
    comics: "قصص مصورة/كومكس",
    studios: "استوديوهات + أعمالهم",
    posts: "منشورات ومقالات ومراجعات",
    communities: "مجموعات ودوائر نقاش",
  };

  const ltr: Record<SearchScope, string> = {
    all: "Everything in the platform — mixed templates",
    users: "User accounts inside Fanaara",
    influencers: "Creators & influencers",
    anime: "Anime titles",
    manga: "Manga titles",
    comics: "Comics / graphic stories",
    studios: "Studios and their works",
    posts: "Posts, articles, reviews",
    communities: "Groups & communities",
  };

  return dir === "rtl" ? rtl[scope] : ltr[scope];
}

/* ──────────────────────────────────────────────────────────────
  UI Building Blocks
────────────────────────────────────────────────────────────── */

function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: "neutral" | "brand" | "success" | "warning" | "danger" | "info";
  children: React.ReactNode;
  className?: string;
}) {
  const cls =
    tone === "brand"
      ? "bg-accent-soft border-accent-border text-foreground-strong"
      : tone === "success"
        ? "bg-success-soft border-success-soft-border text-foreground-strong"
        : tone === "warning"
          ? "bg-warning-soft border-warning-soft-border text-foreground-strong"
          : tone === "danger"
            ? "bg-danger-soft border-danger-soft-border text-foreground-strong"
            : tone === "info"
              ? "bg-info-soft border-info-soft-border text-foreground-strong"
              : "bg-surface-soft border-border-subtle text-foreground";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold",
        cls,
        className,
      )}
    >
      {children}
    </span>
  );
}

function GlassCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-glass-border bg-glass shadow-[var(--shadow-glass)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent dark:from-white/5" />
      {children}
    </div>
  );
}

function SectionTitle({
  icon,
  title,
  subtitle,
  right,
  dir,
}: {
  icon?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
  dir: "rtl" | "ltr";
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3",
        dir === "rtl" ? "flex-row-reverse text-right" : "flex-row text-left",
      )}
    >
      <div className="min-w-0">
        <div className={cn("flex items-center gap-2", dir === "rtl" && "flex-row-reverse")}>
          {icon ? (
            <span className="grid size-8 place-items-center rounded-xl border border-border-subtle bg-surface-soft text-foreground-strong">
              {icon}
            </span>
          ) : null}

          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground-strong">
              <bdi>{title}</bdi>
            </div>
            {subtitle ? (
              <div className="mt-0.5 text-xs text-foreground-muted">
                <bdi>{subtitle}</bdi>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

function Skeleton({
  className,
  rounded = "rounded-xl",
}: {
  className?: string;
  rounded?: string;
}) {
  return (
    <div
      className={cn(
        "animate-pulse bg-surface-soft/80 border border-border-subtle",
        rounded,
        className,
      )}
    />
  );
}

/* ──────────────────────────────────────────────────────────────
  Result Cards (templates)
────────────────────────────────────────────────────────────── */

function UserRow({
  u,
  dir,
  onOpenActions,
}: {
  u: UserEntity;
  dir: "rtl" | "ltr";
  onOpenActions?: (kind: "user", id: string) => void;
}) {
  const avatarSrc = useMemo(
    () => svgDataUrl({ label: u.displayName, hue: u.hue, shape: "circle" }),
    [u.displayName, u.hue],
  );

  return (
    <motion.div
      layout
      whileHover={{ y: -2 }}
      className={cn(
        "group rounded-2xl border border-card-border bg-card p-3 shadow-[var(--shadow-sm)]",
        "hover:shadow-[var(--shadow-md)] hover:border-accent-border transition",
      )}
    >
      <div className={cn("flex items-start gap-3", dir === "rtl" ? "flex-row-reverse text-right" : "flex-row text-left")}>
        <Avatar
          src={avatarSrc}
          unoptimized
          name={u.displayName}
          size="12"
          className="shrink-0"
          rounded
        />

        <div className="min-w-0 flex-1">
          <div className={cn("flex items-center gap-2", dir === "rtl" && "flex-row-reverse")}>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <bdi className="truncate text-sm font-semibold text-foreground-strong">
                  {u.displayName}
                </bdi>
                {u.verified ? (
                  <Badge tone="info" className="px-2 py-0.5">
                    ✓ {dir === "rtl" ? "موثّق" : "Verified"}
                  </Badge>
                ) : null}
                {u.role === "influencer" ? (
                  <Badge tone="brand" className="px-2 py-0.5">
                    <IoFlashOutline className="size-3.5" />
                    {dir === "rtl" ? "مؤثر" : "Influencer"}
                  </Badge>
                ) : u.role === "creator" ? (
                  <Badge tone="success" className="px-2 py-0.5">
                    {dir === "rtl" ? "صانع" : "Creator"}
                  </Badge>
                ) : null}
              </div>

              <div className="mt-0.5 text-xs text-foreground-muted">
                <bdi>@{u.username}</bdi> •{" "}
                <bdi>{formatCompactNumber(u.followers)}</bdi>{" "}
                {dir === "rtl" ? "متابع" : "followers"}
              </div>
            </div>
          </div>

          <p className="mt-2 line-clamp-2 text-xs text-foreground">
            <bdi>{u.bio}</bdi>
          </p>

          <div className={cn("mt-3 flex items-center gap-2", dir === "rtl" && "flex-row-reverse")}>
            <Button
              tone="brand"
              variant="soft"
              size="sm"
              leftIcon={<IoPeopleOutline className="size-4" />}
            >
              {dir === "rtl" ? "متابعة" : "Follow"}
            </Button>

            <Button
              tone="neutral"
              variant="outline"
              size="sm"
              leftIcon={<IoChatbubbleEllipsesOutline className="size-4" />}
            >
              {dir === "rtl" ? "رسالة" : "Message"}
            </Button>

            {onOpenActions ? (
              <Button
                tone="neutral"
                variant="plain"
                size="sm"
                className="ms-auto rtl:ms-0 rtl:me-auto"
                leftIcon={<IoChevronDown className="size-4" />}
                onClick={() => onOpenActions("user", u.id)}
              >
                {dir === "rtl" ? "المزيد" : "More"}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function WorkCard({
  w,
  dir,
  dense,
}: {
  w: WorkEntity;
  dir: "rtl" | "ltr";
  dense?: boolean;
}) {
  const cover = useMemo(
    () =>
      svgDataUrl({
        label: w.title,
        hue: w.hue,
        shape: "square",
        sub: w.workType.toUpperCase(),
      }),
    [w.title, w.hue, w.workType],
  );

  const typeIcon =
    w.workType === "anime" ? (
      <IoFilmOutline className="size-4" />
    ) : w.workType === "manga" ? (
      <IoBookOutline className="size-4" />
    ) : (
      <IoAlbumsOutline className="size-4" />
    );

  const statusTone =
    w.status === "completed"
      ? "success"
      : w.status === "hiatus"
        ? "warning"
        : "brand";

  return (
    <motion.div
      layout
      whileHover={{ y: -2 }}
      className={cn(
        "group rounded-2xl border border-card-border bg-card shadow-[var(--shadow-sm)]",
        "hover:shadow-[var(--shadow-md)] hover:border-accent-border transition overflow-hidden",
      )}
    >
      <div className={cn("flex", dir === "rtl" ? "flex-row-reverse" : "flex-row")}>
        <div className={cn(dense ? "w-20" : "w-24", "shrink-0")}>
          {/* cover */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover}
            alt={w.title}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="min-w-0 flex-1 p-3">
          <div className={cn("flex items-start justify-between gap-2", dir === "rtl" && "flex-row-reverse text-right")}>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <bdi className="truncate text-sm font-semibold text-foreground-strong">
                  {w.title}
                </bdi>
              </div>
              <div className="mt-0.5 text-xs text-foreground-muted">
                <bdi>{w.year ?? "—"}</bdi>
                {w.studio && w.studio !== "—" ? (
                  <>
                    {" "}
                    • <bdi>{w.studio}</bdi>
                  </>
                ) : null}
              </div>
            </div>

            <Badge tone={statusTone as any}>
              {typeIcon}
              <span className="uppercase">{w.workType}</span>
              <span className="opacity-70">•</span>
              <span>{w.rating.toFixed(1)}</span>
            </Badge>
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {w.genres.slice(0, 3).map((g) => (
              <Badge key={g} tone="neutral" className="py-0.5">
                {g}
              </Badge>
            ))}
            {w.genres.length > 3 ? (
              <Badge tone="neutral" className="py-0.5">
                +{w.genres.length - 3}
              </Badge>
            ) : null}
          </div>

          <div className={cn("mt-3 flex items-center gap-2", dir === "rtl" && "flex-row-reverse")}>
            <Button tone="brand" variant="soft" size="sm">
              {dir === "rtl" ? "إضافة للمكتبة" : "Add to library"}
            </Button>
            <Button
              tone="neutral"
              variant="outline"
              size="sm"
              leftIcon={<IoHeartOutline className="size-4" />}
            >
              {dir === "rtl" ? "إعجاب" : "Like"}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StudioRow({
  s,
  dir,
}: {
  s: StudioEntity;
  dir: "rtl" | "ltr";
}) {
  const icon = useMemo(
    () =>
      svgDataUrl({
        label: s.name,
        hue: s.hue,
        shape: "square",
        sub: s.country,
      }),
    [s.name, s.hue, s.country],
  );

  return (
    <motion.div
      layout
      whileHover={{ y: -2 }}
      className={cn(
        "group rounded-2xl border border-card-border bg-card p-3 shadow-[var(--shadow-sm)]",
        "hover:shadow-[var(--shadow-md)] hover:border-accent-border transition",
      )}
    >
      <div className={cn("flex items-center gap-3", dir === "rtl" ? "flex-row-reverse text-right" : "flex-row text-left")}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={icon}
          alt={s.name}
          className="size-12 rounded-2xl border border-border-subtle object-cover"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <bdi className="truncate text-sm font-semibold text-foreground-strong">
              {s.name}
            </bdi>
            {s.verified ? (
              <Badge tone="info" className="py-0.5">
                ✓ {dir === "rtl" ? "موثّق" : "Verified"}
              </Badge>
            ) : null}
          </div>

          <div className="mt-0.5 text-xs text-foreground-muted">
            <bdi>{s.country}</bdi> •{" "}
            <bdi>{formatCompactNumber(s.worksCount)}</bdi>{" "}
            {dir === "rtl" ? "عمل" : "works"}
          </div>
        </div>

        <Button tone="neutral" variant="soft" size="sm">
          {dir === "rtl" ? "عرض" : "View"}
        </Button>
      </div>
    </motion.div>
  );
}

function CommunityCard({
  c,
  dir,
}: {
  c: CommunityEntity;
  dir: "rtl" | "ltr";
}) {
  const cover = useMemo(
    () =>
      svgDataUrl({
        label: c.name,
        hue: c.hue,
        shape: "square",
        sub: c.isOfficial ? "Official" : "Community",
      }),
    [c.name, c.hue, c.isOfficial],
  );

  return (
    <motion.div
      layout
      whileHover={{ y: -2 }}
      className={cn(
        "group rounded-2xl border border-card-border bg-card shadow-[var(--shadow-sm)]",
        "hover:shadow-[var(--shadow-md)] hover:border-accent-border transition overflow-hidden",
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={cover} alt={c.name} className="h-24 w-full object-cover" />

      <div className="p-3">
        <div className={cn("flex items-start justify-between gap-2", dir === "rtl" && "flex-row-reverse text-right")}>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <bdi className="truncate text-sm font-semibold text-foreground-strong">
                {c.name}
              </bdi>
              {c.isOfficial ? (
                <Badge tone="brand" className="py-0.5">
                  {dir === "rtl" ? "رسمي" : "Official"}
                </Badge>
              ) : null}
            </div>
            <p className="mt-1 line-clamp-2 text-xs text-foreground">
              <bdi>{c.description}</bdi>
            </p>
          </div>

          <Badge tone="neutral">
            <IoPeopleOutline className="size-4" />
            <span>{formatCompactNumber(c.members)}</span>
          </Badge>
        </div>

        <div className={cn("mt-3 flex items-center gap-2", dir === "rtl" && "flex-row-reverse")}>
          <Button tone="brand" variant="soft" size="sm">
            {dir === "rtl" ? "انضمام" : "Join"}
          </Button>
          <Button tone="neutral" variant="outline" size="sm">
            {dir === "rtl" ? "استكشاف" : "Explore"}
          </Button>
          <Badge tone="neutral" className="ms-auto rtl:ms-0 rtl:me-auto">
            <IoTrendingUpOutline className="size-4" />
            <span>
              {formatCompactNumber(c.postsPerDay)}/{dir === "rtl" ? "يوم" : "day"}
            </span>
          </Badge>
        </div>
      </div>
    </motion.div>
  );
}

function PostCard({
  p,
  dir,
  hideSpoilerBadge,
}: {
  p: PostEntity;
  dir: "rtl" | "ltr";
  hideSpoilerBadge?: boolean;
}) {
  const author = USERS.find((u) => u.id === p.authorId);
  const avatarSrc = author
    ? svgDataUrl({ label: author.displayName, hue: author.hue, shape: "circle" })
    : svgDataUrl({ label: "?", hue: 200, shape: "circle" });

  return (
    <motion.div
      layout
      whileHover={{ y: -2 }}
      className={cn(
        "group rounded-2xl border border-card-border bg-card p-3 shadow-[var(--shadow-sm)]",
        "hover:shadow-[var(--shadow-md)] hover:border-accent-border transition",
      )}
    >
      <div className={cn("flex items-start gap-3", dir === "rtl" ? "flex-row-reverse text-right" : "flex-row text-left")}>
        <Avatar
          src={avatarSrc}
          unoptimized
          name={author?.displayName ?? "User"}
          size="10"
          className="shrink-0"
        />

        <div className="min-w-0 flex-1">
          <div className={cn("flex items-start justify-between gap-2", dir === "rtl" && "flex-row-reverse")}>
            <div className="min-w-0">
              <bdi className="line-clamp-1 text-sm font-semibold text-foreground-strong">
                {p.title}
              </bdi>

              <div className="mt-0.5 text-xs text-foreground-muted">
                <bdi>{author?.displayName ?? "—"}</bdi> •{" "}
                <bdi>{timeAgo(p.createdAt, dir)}</bdi> •{" "}
                <bdi className="uppercase">{p.type}</bdi>
              </div>
            </div>

            {p.hasSpoiler && !hideSpoilerBadge ? (
              <Badge tone="warning" className="py-0.5">
                {dir === "rtl" ? "حرق" : "Spoiler"}
              </Badge>
            ) : null}
          </div>

          <p className="mt-2 line-clamp-2 text-xs text-foreground">
            <bdi>{p.excerpt}</bdi>
          </p>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {p.tags.slice(0, 3).map((t) => (
              <Badge key={t} tone="neutral" className="py-0.5">
                {t}
              </Badge>
            ))}
            {p.tags.length > 3 ? (
              <Badge tone="neutral" className="py-0.5">
                +{p.tags.length - 3}
              </Badge>
            ) : null}
          </div>

          <div className={cn("mt-3 flex items-center gap-3 text-xs text-foreground-muted", dir === "rtl" && "flex-row-reverse")}>
            <span className="inline-flex items-center gap-1">
              <IoHeartOutline className="size-4" />
              <bdi>{formatCompactNumber(p.reactions)}</bdi>
            </span>
            <span className="inline-flex items-center gap-1">
              <IoChatbubbleEllipsesOutline className="size-4" />
              <bdi>{formatCompactNumber(p.comments)}</bdi>
            </span>

            <div className="ms-auto rtl:ms-0 rtl:me-auto">
              <Button tone="neutral" variant="soft" size="sm">
                {dir === "rtl" ? "فتح" : "Open"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────────
  Suggestions Dropdown
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

  // click outside
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
          className={cn(
            "absolute z-40 mt-2 w-full",
            dir === "rtl" ? "right-0" : "left-0",
          )}
        >
          <div className="overflow-hidden rounded-2xl border border-border-strong bg-background-elevated shadow-[var(--shadow-elevated)]">
            <div className="flex items-center justify-between gap-2 border-b border-border-subtle bg-surface-soft/60 px-3 py-2">
              <div className={cn("flex items-center gap-2 text-xs text-foreground-muted", dir === "rtl" && "flex-row-reverse")}>
                <IoSparklesOutline className="size-4" />
                <span>
                  <bdi>{dir === "rtl" ? "اقتراحات ذكية" : "Smart suggestions"}</bdi>
                </span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="grid size-7 place-items-center rounded-full border border-border-subtle bg-background-elevated text-foreground-strong hover:bg-surface-soft"
                aria-label={dir === "rtl" ? "إغلاق" : "Close"}
              >
                <IoCloseOutline className="size-4" />
              </button>
            </div>

            <ul className="max-h-[340px] overflow-y-auto app-scroll">
              {items.map((it, idx) => {
                const isActive = idx === activeIndex;

                const tone =
                  it.kind === "trending"
                    ? "bg-warning-soft/50"
                    : it.kind === "history"
                      ? "bg-info-soft/40"
                      : it.kind === "entity"
                        ? "bg-accent-soft/40"
                        : "bg-surface-soft/40";

                const icon =
                  it.kind === "history" ? (
                    <IoTimeOutline className="size-4" />
                  ) : it.kind === "trending" ? (
                    <IoTrendingUpOutline className="size-4" />
                  ) : it.kind === "entity" ? (
                    <IoCompassOutline className="size-4" />
                  ) : (
                    <IoSparklesOutline className="size-4" />
                  );

                return (
                  <li key={it.id}>
                    <button
                      type="button"
                      onMouseEnter={() => onHover(idx)}
                      onFocus={() => onHover(idx)}
                      onClick={() => onSelect(it)}
                      className={cn(
                        "w-full px-3 py-2 text-left",
                        "transition",
                        "hover:bg-surface-soft/70 active:bg-surface-soft/90",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)]",
                        isActive && "bg-surface-soft/80",
                        dir === "rtl" && "text-right",
                      )}
                    >
                      <div className={cn("flex items-start gap-2", dir === "rtl" ? "flex-row-reverse" : "flex-row")}>
                        <span
                          className={cn(
                            "mt-0.5 grid size-9 place-items-center rounded-xl border border-border-subtle",
                            tone,
                            "text-foreground-strong",
                          )}
                          aria-hidden
                        >
                          {icon}
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <bdi className="truncate text-xs font-semibold text-foreground-strong">
                              {it.label}
                            </bdi>

                            {it.applyScope ? (
                              <Badge tone="neutral" className="py-0.5">
                                {scopeLabel(it.applyScope, dir)}
                              </Badge>
                            ) : null}
                          </div>

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
              <div className={cn("flex items-center gap-2 text-[11px] text-foreground-muted", dir === "rtl" && "flex-row-reverse")}>
                <Badge tone="neutral" className="py-0.5">
                  Tab
                </Badge>
                <span>
                  <bdi>
                    {dir === "rtl"
                      ? "للإكمال • ↑↓ للتنقل • Enter للبحث"
                      : "to autocomplete • ↑↓ to navigate • Enter to search"}
                  </bdi>
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
  Page
────────────────────────────────────────────────────────────── */

const HISTORY_KEY = "fanaara.search.history.v1";

export default function SearchPage() {
  const reduce = useReducedMotion();
  const dir = useDocDir();
  const { isDark, isOnePiece } = useDocTheme();
  const isRTL = dir === "rtl";

  // Search state
  const [scope, setScope] = useState<SearchScope>("all");
  const [query, setQuery] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);

  const [refine, setRefine] = useState<RefineState>({
    sort: "relevance",
    verifiedOnly: false,
    hideSpoilers: true,
  });

  const [results, setResults] = useState<SearchResults | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // History
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

  // Scopes for select
  const scopeOptions = useMemo<SelectOption[]>(
    () => [
      {
        value: "all",
        label: scopeLabel("all", dir),
        description: scopeDescription("all", dir),
        icon: scopeIcon("all"),
        group: dir === "rtl" ? "ضمن Fanaara" : "Within Fanaara",
      },
      {
        value: "users",
        label: scopeLabel("users", dir),
        description: scopeDescription("users", dir),
        icon: scopeIcon("users"),
        group: dir === "rtl" ? "الأشخاص" : "People",
      },
      {
        value: "influencers",
        label: scopeLabel("influencers", dir),
        description: scopeDescription("influencers", dir),
        icon: scopeIcon("influencers"),
        group: dir === "rtl" ? "الأشخاص" : "People",
      },
      {
        value: "anime",
        label: scopeLabel("anime", dir),
        description: scopeDescription("anime", dir),
        icon: scopeIcon("anime"),
        group: dir === "rtl" ? "الأعمال" : "Works",
      },
      {
        value: "manga",
        label: scopeLabel("manga", dir),
        description: scopeDescription("manga", dir),
        icon: scopeIcon("manga"),
        group: dir === "rtl" ? "الأعمال" : "Works",
      },
      {
        value: "comics",
        label: scopeLabel("comics", dir),
        description: scopeDescription("comics", dir),
        icon: scopeIcon("comics"),
        group: dir === "rtl" ? "الأعمال" : "Works",
      },
      {
        value: "studios",
        label: scopeLabel("studios", dir),
        description: scopeDescription("studios", dir),
        icon: scopeIcon("studios"),
        group: dir === "rtl" ? "صناعة" : "Industry",
      },
      {
        value: "posts",
        label: scopeLabel("posts", dir),
        description: scopeDescription("posts", dir),
        icon: scopeIcon("posts"),
        group: dir === "rtl" ? "المحتوى" : "Content",
      },
      {
        value: "communities",
        label: scopeLabel("communities", dir),
        description: scopeDescription("communities", dir),
        icon: scopeIcon("communities"),
        group: dir === "rtl" ? "المحتوى" : "Content",
      },
    ],
    [dir],
  );

  // Suggestions
  const anchorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const suggestions = useMemo(
    () =>
      buildSuggestions({
        query,
        scope,
        dir,
        history,
      }),
    [query, scope, dir, history],
  );

  const [suggestOpen, setSuggestOpen] = useState(false);
  const [activeSug, setActiveSug] = useState(-1);

  // Open suggestions automatically while typing / focusing
  useEffect(() => {
    if (!query.trim()) {
      // show suggestions when input is focused
      // we keep it closed until user focuses or clicks
      setActiveSug(-1);
      return;
    }
    setSuggestOpen(true);
    setActiveSug(-1);
  }, [query]);

  // Keyboard shortcut: "/" focuses search
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

  // Clear input error on typing
  useEffect(() => {
    if (inputError && query.trim()) setInputError(null);
  }, [query, inputError]);

  const executeSearch = useCallback(
    async (opts?: { q?: string; scope?: SearchScope; from?: "enter" | "button" | "history" | "suggestion" }) => {
      const q = (opts?.q ?? query).trim();
      const sc = (opts?.scope ?? scope) as SearchScope;

      if (!q) {
        setInputError(dir === "rtl" ? "اكتب كلمة للبحث أولًا." : "Type something first.");
        setResults(null);
        return;
      }

      setIsSearching(true);

      // Simulated latency (replace with your API call)
      const started = performance.now();
      await new Promise((r) => setTimeout(r, 260 + Math.random() * 220));

      const r0 = runSearch(q, sc, refine);
      const took = Math.max(1, Math.round(performance.now() - started));
      const finalR: SearchResults = { ...r0, tookMs: took };

      setResults(finalR);
      setIsSearching(false);

      // Save history (dedupe by query+scope+refine)
      const sameKey = (h: HistoryEntry) =>
        normalizeText(h.query) === normalizeText(q) &&
        h.scope === sc &&
        h.refined.sort === refine.sort &&
        h.refined.verifiedOnly === refine.verifiedOnly &&
        h.refined.hideSpoilers === refine.hideSpoilers;

      const entry = buildHistoryEntry(finalR, refine);

      setHistory((prev) => {
        const next = prev.filter((h) => !sameKey(h));
        return [entry, ...next].slice(0, 24);
      });

      setSuggestOpen(false);
      setActiveSug(-1);
    },
    [query, scope, refine, dir],
  );

  const applySuggestion = useCallback(
    (it: SuggestionItem, opts?: { run?: boolean }) => {
      if (it.applyScope) setScope(it.applyScope);
      if (it.query) setQuery(it.query);
      setSuggestOpen(false);
      setActiveSug(-1);

      // focus input for continued typing
      requestAnimationFrame(() => inputRef.current?.focus());

      if (opts?.run && it.query) {
        executeSearch({ q: it.query, scope: it.applyScope ?? scope, from: "suggestion" });
      }
    },
    [executeSearch, scope],
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      window.localStorage.removeItem(HISTORY_KEY);
    } catch {}
  }, []);

  // Dynamic refine controls (based on scope)
  const showVerifiedFilter = scope === "users" || scope === "influencers" || scope === "all";
  const showSpoilerFilter = scope === "posts" || scope === "all";
  const showSort = scope === "posts" || scope === "all";

  // Sort select options (for posts)
  const sortOptions = useMemo<SelectOption[]>(
    () => [
      {
        value: "relevance",
        label: dir === "rtl" ? "الأكثر صلة" : "Relevance",
        description: dir === "rtl" ? "حسب المطابقة + التفاعل" : "Match + engagement",
        icon: <IoSparklesOutline className="size-4" />,
        group: dir === "rtl" ? "الترتيب" : "Sorting",
      },
      {
        value: "newest",
        label: dir === "rtl" ? "الأحدث" : "Newest",
        description: dir === "rtl" ? "حسب وقت النشر" : "By publish time",
        icon: <IoTimeOutline className="size-4" />,
        group: dir === "rtl" ? "الترتيب" : "Sorting",
      },
      {
        value: "top",
        label: dir === "rtl" ? "الأعلى" : "Top",
        description: dir === "rtl" ? "حسب التفاعل" : "By engagement",
        icon: <IoTrendingUpOutline className="size-4" />,
        group: dir === "rtl" ? "الترتيب" : "Sorting",
      },
    ],
    [dir],
  );

  const title = dir === "rtl" ? "البحث العام" : "Global Search";
  const subtitle =
    dir === "rtl"
      ? "ابحث داخل Fanaara عن المستخدمين، الأعمال، المنشورات والمجموعات — مع سجل تلقائي وملء/اقتراحات ذكية."
      : "Search across Fanaara: people, works, posts, and communities — with auto history + smart autocomplete.";

  return (
    <main dir={dir} className="relative min-h-[100svh] bg-background text-foreground">
      {/* Decorative background */}
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
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-3 py-6 sm:px-6 sm:py-10 lg:px-8">
        {/* Header */}
        <div className={cn("flex items-end justify-between gap-4", isRTL ? "flex-row-reverse text-right" : "flex-row text-left")}>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="grid size-10 place-items-center rounded-2xl border border-border-subtle bg-surface-soft text-foreground-strong shadow-[var(--shadow-sm)]">
                <IoSearchOutline className="size-5" />
              </span>
              <div className="min-w-0">
                <h1 className="text-xl font-extrabold text-foreground-strong sm:text-2xl">
                  <bdi>{title}</bdi>
                </h1>
                <p className="mt-1 max-w-2xl text-sm text-foreground-muted">
                  <bdi>{subtitle}</bdi>
                </p>
              </div>
            </div>
          </div>

          <div className={cn("hidden sm:flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Badge tone="neutral">
              <IoCompassOutline className="size-4" />
              <span>
                <bdi>{dir === "rtl" ? "اختصار" : "Shortcut"}</bdi>: <bdi>/</bdi>
              </span>
            </Badge>
            <Badge tone="neutral">
              <IoSparklesOutline className="size-4" />
              <span>
                <bdi>{dir === "rtl" ? "الوضع" : "Mode"}</bdi>:{" "}
                <bdi>{isDark ? (dir === "rtl" ? "داكن" : "Dark") : dir === "rtl" ? "فاتح" : "Light"}</bdi>
              </span>
            </Badge>
          </div>
        </div>

        {/* Layout */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left: Search + History */}
          <aside className="lg:col-span-4 xl:col-span-4">
            <GlassCard className="p-4">
              <SectionTitle
                dir={dir}
                icon={<IoSearchOutline className="size-4" />}
                title={dir === "rtl" ? "ابحث الآن" : "Search now"}
                subtitle={
                  dir === "rtl"
                    ? "اختَر محدد البحث ثم اكتب كلماتك — الاقتراحات تظهر تلقائيًا."
                    : "Pick a scope, type your query — suggestions appear instantly."
                }
                right={
                  <Link
                    href="#results"
                    className={cn(
                      "text-xs font-semibold text-foreground-muted hover:text-foreground-strong",
                      "underline underline-offset-4",
                    )}
                  >
                    <bdi>{dir === "rtl" ? "اذهب للنتائج" : "Jump to results"}</bdi>
                  </Link>
                }
              />

              <div className="mt-4 space-y-3">
                {/* Scope select */}
                <SmartSelect
                  options={scopeOptions}
                  value={scope}
                  onChange={(v) => {
                    const next = (typeof v === "string" ? v : "all") as SearchScope;
                    setScope(next);
                    // Make suggestions reflect new scope
                    setSuggestOpen(true);
                    setActiveSug(-1);
                  }}
                  label={dir === "rtl" ? "ضمن" : "Scope"}
                  placeholder={dir === "rtl" ? "اختر نوع البحث…" : "Choose scope…"}
                  searchable
                  size="md"
                  variant="solid"
                />

                {/* Query input + suggestions */}
                <div ref={anchorRef} className="relative">
                  <AppInputBase
                    ref={(el) => {
                      inputRef.current = el as HTMLInputElement | null;
                    }}
                    label={dir === "rtl" ? "الكلمة المفتاحية" : "Keyword"}
                    placeholder={
                      dir === "rtl"
                        ? "مثال: اسم عمل، مستخدم، استوديو، كلمة من منشور…"
                        : "Example: title, user, studio, keyword…"
                    }
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
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        if (suggestOpen) {
                          e.preventDefault();
                          setSuggestOpen(false);
                          setActiveSug(-1);
                          return;
                        }
                        // clear query
                        if (query) {
                          e.preventDefault();
                          setQuery("");
                          setResults(null);
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
                        // autocomplete by active suggestion or first entity suggestion
                        const pick =
                          activeSug >= 0 ? suggestions[activeSug] : suggestions.find((s) => s.kind === "entity") ?? suggestions[0];

                        if (pick?.query) {
                          e.preventDefault();
                          applySuggestion(pick, { run: false });
                        }
                        return;
                      }

                      if (e.key === "Enter") {
                        e.preventDefault();

                        // If user navigated suggestions, select it & search
                        if (suggestOpen && activeSug >= 0 && suggestions[activeSug]) {
                          const it = suggestions[activeSug]!;
                          if (it.query) {
                            applySuggestion(it, { run: true });
                            return;
                          }
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
                      // clicking suggestion: fill input & run search only for entity/history/trending
                      const shouldRun = it.kind !== "hint";
                      applySuggestion(it, { run: shouldRun });
                    }}
                  />
                </div>

                {/* Refine controls */}
                <div className="rounded-2xl border border-border-subtle bg-surface-soft/60 p-3">
                  <div className={cn("flex items-center justify-between gap-2", isRTL ? "flex-row-reverse" : "flex-row")}>
                    <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                      <span className="grid size-8 place-items-center rounded-xl border border-border-subtle bg-background-elevated text-foreground-strong">
                        <IoSparklesOutline className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-foreground-strong">
                          <bdi>{dir === "rtl" ? "محددات سريعة" : "Quick refiners"}</bdi>
                        </div>
                        <div className="text-[11px] text-foreground-muted">
                          <bdi>
                            {dir === "rtl"
                              ? "تتغير حسب نوع البحث"
                              : "Changes based on scope"}
                          </bdi>
                        </div>
                      </div>
                    </div>

                    <Badge tone="neutral">
                      <IoSparklesOutline className="size-4" />
                      <span>
                        <bdi>{scopeLabel(scope, dir)}</bdi>
                      </span>
                    </Badge>
                  </div>

                  <div className="mt-3 space-y-2">
                    {/* Verified only (users/influencers/all) */}
                    {showVerifiedFilter ? (
                      <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                        <Button
                          tone={refine.verifiedOnly ? "info" : "neutral"}
                          variant={refine.verifiedOnly ? "soft" : "outline"}
                          size="sm"
                          leftIcon={<IoFlashOutline className="size-4" />}
                          onClick={() =>
                            setRefine((s) => ({ ...s, verifiedOnly: !s.verifiedOnly }))
                          }
                        >
                          {dir === "rtl" ? "موثّق فقط" : "Verified only"}
                        </Button>

                        <div className="text-[11px] text-foreground-muted">
                          <bdi>
                            {dir === "rtl"
                              ? "لتقليل الضجيج في نتائج الأشخاص"
                              : "Reduce noise in people results"}
                          </bdi>
                        </div>
                      </div>
                    ) : null}

                    {/* Spoiler filter (posts/all) */}
                    {showSpoilerFilter ? (
                      <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                        <Button
                          tone={refine.hideSpoilers ? "warning" : "neutral"}
                          variant={refine.hideSpoilers ? "soft" : "outline"}
                          size="sm"
                          leftIcon={<IoCloseOutline className="size-4" />}
                          onClick={() =>
                            setRefine((s) => ({ ...s, hideSpoilers: !s.hideSpoilers }))
                          }
                        >
                          {dir === "rtl" ? "إخفاء الحرق" : "Hide spoilers"}
                        </Button>

                        <div className="text-[11px] text-foreground-muted">
                          <bdi>
                            {dir === "rtl"
                              ? "يؤثر على المنشورات فقط"
                              : "Affects posts only"}
                          </bdi>
                        </div>
                      </div>
                    ) : null}

                    {/* Sort (posts/all) */}
                    {showSort ? (
                      <SmartSelect
                        options={sortOptions}
                        value={refine.sort}
                        onChange={(v) => {
                          const next = (typeof v === "string" ? v : "relevance") as SortMode;
                          setRefine((s) => ({ ...s, sort: next }));
                        }}
                        label={dir === "rtl" ? "ترتيب المنشورات" : "Post sorting"}
                        searchable={false}
                        size="sm"
                        variant="solid"
                        className="max-w-none"
                      />
                    ) : null}
                  </div>
                </div>

                {/* Quick scopes chips (for speed) */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {(["all", "users", "anime", "manga", "posts", "communities"] as SearchScope[]).map((s) => {
                    const active = scope === s;
                    return (
                      <Button
                        key={s}
                        tone={active ? "brand" : "neutral"}
                        variant={active ? "soft" : "outline"}
                        size="sm"
                        leftIcon={scopeIcon(s)}
                        onClick={() => setScope(s)}
                        className="shrink-0"
                      >
                        {scopeLabel(s, dir)}
                      </Button>
                    );
                  })}
                </div>

                {/* Helper row */}
                <div className={cn("flex items-center justify-between gap-2 text-[11px] text-foreground-muted", isRTL && "flex-row-reverse")}>
                  <span>
                    <bdi>
                      {dir === "rtl"
                        ? "اضغط / للتركيز • Esc للإغلاق • Tab للإكمال"
                        : "Press / to focus • Esc to close • Tab to autocomplete"}
                    </bdi>
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setResults(null);
                      setInputError(null);
                      setSuggestOpen(false);
                      setActiveSug(-1);
                      inputRef.current?.focus();
                    }}
                    className="rounded-full border border-border-subtle bg-background-elevated px-2 py-1 font-semibold text-foreground hover:bg-surface-soft"
                  >
                    <bdi>{dir === "rtl" ? "تفريغ" : "Reset"}</bdi>
                  </button>
                </div>
              </div>
            </GlassCard>

            {/* History */}
            <GlassCard className="mt-4 p-4">
              <SectionTitle
                dir={dir}
                icon={<IoTimeOutline className="size-4" />}
                title={dir === "rtl" ? "سجل البحث" : "Search history"}
                subtitle={
                  dir === "rtl"
                    ? "آخر عمليات البحث وملخص نتائجها — يتم تحديثه تلقائيًا."
                    : "Recent searches with result summaries — auto-updated."
                }
                right={
                  history.length ? (
                    <Button
                      tone="neutral"
                      variant="plain"
                      size="sm"
                      leftIcon={<IoCloseOutline className="size-4" />}
                      onClick={clearHistory}
                    >
                      {dir === "rtl" ? "مسح" : "Clear"}
                    </Button>
                  ) : null
                }
              />

              {history.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-border-subtle bg-surface-soft/60 p-4">
                  <div className="text-sm font-semibold text-foreground-strong">
                    <bdi>{dir === "rtl" ? "لا يوجد سجل بعد" : "No history yet"}</bdi>
                  </div>
                  <div className="mt-1 text-xs text-foreground-muted">
                    <bdi>
                      {dir === "rtl"
                        ? "ابدأ بالبحث وسيظهر هنا تلقائيًا آخر ما قمت به."
                        : "Start searching and your recent queries will appear here."}
                    </bdi>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {TRENDING.slice(0, 4).map((t) => (
                      <button
                        key={t.q}
                        type="button"
                        className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-background-elevated px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-soft"
                        onClick={() => {
                          setScope(t.scope ?? "all");
                          setQuery(t.q);
                          executeSearch({ q: t.q, scope: t.scope ?? "all", from: "suggestion" });
                        }}
                      >
                        <IoTrendingUpOutline className="size-4" />
                        <bdi>{t.q}</bdi>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-4 space-y-2">
                  {history.slice(0, 8).map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => {
                        setScope(h.scope);
                        setQuery(h.query);
                        setRefine((s) => ({
                          ...s,
                          sort: h.refined.sort,
                          verifiedOnly: h.refined.verifiedOnly,
                          hideSpoilers: h.refined.hideSpoilers,
                        }));
                        executeSearch({ q: h.query, scope: h.scope, from: "history" });
                      }}
                      className={cn(
                        "w-full rounded-2xl border border-card-border bg-card p-3 text-left shadow-[var(--shadow-sm)]",
                        "hover:shadow-[var(--shadow-md)] hover:border-accent-border transition",
                        isRTL && "text-right",
                      )}
                    >
                      <div className={cn("flex items-start justify-between gap-3", isRTL && "flex-row-reverse")}>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge tone="neutral">
                              {scopeIcon(h.scope)}
                              <span>
                                <bdi>{scopeLabel(h.scope, dir)}</bdi>
                              </span>
                            </Badge>

                            <span className="text-xs font-semibold text-foreground-strong">
                              <bdi>{h.query}</bdi>
                            </span>
                          </div>

                          <div className="mt-1 text-[11px] text-foreground-muted">
                            <bdi>{timeAgo(h.executedAt, dir)}</bdi> •{" "}
                            <bdi>{h.total}</bdi>{" "}
                            {dir === "rtl" ? "نتيجة" : "results"}
                          </div>

                          {h.preview.length ? (
                            <div className={cn("mt-2 flex items-center gap-1.5", isRTL && "flex-row-reverse")}>
                              {h.preview.slice(0, 5).map((p) => (
                                <span
                                  key={`${p.kind}_${p.id}`}
                                  className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-soft/60 px-2 py-1 text-[11px] font-semibold text-foreground"
                                  title={p.label}
                                >
                                  <span
                                    className="inline-block size-2 rounded-full"
                                    style={{
                                      background: `hsl(${p.hue} 85% 55%)`,
                                      boxShadow: "var(--shadow-glow-brand)",
                                    }}
                                  />
                                  <bdi className="max-w-[12rem] truncate">{p.label}</bdi>
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>

                        <Badge tone="brand">
                          <IoSparklesOutline className="size-4" />
                          <span>
                            <bdi>{dir === "rtl" ? "إعادة" : "Run"}</bdi>
                          </span>
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </GlassCard>
          </aside>

          {/* Right: Results */}
          <section id="results" className="lg:col-span-8 xl:col-span-8">
            <GlassCard className="p-4">
              <SectionTitle
                dir={dir}
                icon={<IoCompassOutline className="size-4" />}
                title={dir === "rtl" ? "النتائج" : "Results"}
                subtitle={
                  results
                    ? dir === "rtl"
                      ? `تم العثور على ${results.total} نتيجة خلال ${results.tookMs}ms`
                      : `Found ${results.total} results in ${results.tookMs}ms`
                    : dir === "rtl"
                      ? "ابدأ بالبحث لعرض النتائج هنا — أو اختر من السجل."
                      : "Start searching to see results here — or pick from history."
                }
                right={
                  results ? (
                    <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                      <Badge tone="neutral">
                        {scopeIcon(results.scope)}
                        <span>
                          <bdi>{scopeLabel(results.scope, dir)}</bdi>
                        </span>
                      </Badge>

                      <Badge tone="neutral">
                        <IoTimeOutline className="size-4" />
                        <span>
                          <bdi>{results.tookMs}ms</bdi>
                        </span>
                      </Badge>
                    </div>
                  ) : null
                }
              />

              {/* Results header card */}
              <AnimatePresence mode="popLayout">
                {results ? (
                  <motion.div
                    key="results-meta"
                    initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                    animate={reduce ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                    exit={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                    transition={{ duration: reduce ? 0 : 0.16, ease: "easeOut" }}
                    className="mt-4 rounded-2xl border border-border-subtle bg-surface-soft/60 p-3"
                  >
                    <div className={cn("flex items-start justify-between gap-3", isRTL && "flex-row-reverse text-right")}>
                      <div className="min-w-0">
                        <div className="text-xs text-foreground-muted">
                          <bdi>{dir === "rtl" ? "استعلام" : "Query"}</bdi>
                        </div>
                        <div className="mt-1 text-sm font-semibold text-foreground-strong">
                          <bdi>{results.query}</bdi>
                        </div>

                        {/* counts summary (only useful in All mode) */}
                        {results.scope === "all" ? (
                          <div className={cn("mt-2 flex flex-wrap gap-2", isRTL && "justify-end")}>
                            <Badge tone="neutral">
                              <IoPeopleOutline className="size-4" />
                              <span>
                                <bdi>{results.groups.users.length}</bdi>{" "}
                                <bdi>{scopeLabel("users", dir)}</bdi>
                              </span>
                            </Badge>
                            <Badge tone="neutral">
                              <IoFlashOutline className="size-4" />
                              <span>
                                <bdi>{results.groups.influencers.length}</bdi>{" "}
                                <bdi>{scopeLabel("influencers", dir)}</bdi>
                              </span>
                            </Badge>
                            <Badge tone="neutral">
                              <IoFilmOutline className="size-4" />
                              <span>
                                <bdi>{results.groups.anime.length}</bdi>{" "}
                                <bdi>{scopeLabel("anime", dir)}</bdi>
                              </span>
                            </Badge>
                            <Badge tone="neutral">
                              <IoBookOutline className="size-4" />
                              <span>
                                <bdi>{results.groups.manga.length}</bdi>{" "}
                                <bdi>{scopeLabel("manga", dir)}</bdi>
                              </span>
                            </Badge>
                            <Badge tone="neutral">
                              <IoAlbumsOutline className="size-4" />
                              <span>
                                <bdi>{results.groups.comics.length}</bdi>{" "}
                                <bdi>{scopeLabel("comics", dir)}</bdi>
                              </span>
                            </Badge>
                            <Badge tone="neutral">
                              <IoChatbubbleEllipsesOutline className="size-4" />
                              <span>
                                <bdi>{results.groups.posts.length}</bdi>{" "}
                                <bdi>{scopeLabel("posts", dir)}</bdi>
                              </span>
                            </Badge>
                            <Badge tone="neutral">
                              <IoPeopleOutline className="size-4" />
                              <span>
                                <bdi>{results.groups.communities.length}</bdi>{" "}
                                <bdi>{scopeLabel("communities", dir)}</bdi>
                              </span>
                            </Badge>
                            <Badge tone="neutral">
                              <IoBusinessOutline className="size-4" />
                              <span>
                                <bdi>{results.groups.studios.length}</bdi>{" "}
                                <bdi>{scopeLabel("studios", dir)}</bdi>
                              </span>
                            </Badge>
                          </div>
                        ) : null}
                      </div>

                      <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                        <Button
                          tone="neutral"
                          variant="outline"
                          size="sm"
                          leftIcon={<IoListOutline className="size-4" />}
                          onClick={() => {
                            // Convenience: switch to list-friendly scope in All view
                            if (!results) return;
                            setScope("posts");
                            setSuggestOpen(false);
                            executeSearch({ q: results.query, scope: "posts" });
                          }}
                        >
                          {dir === "rtl" ? "عرض منشورات" : "Posts"}
                        </Button>

                        <Button
                          tone="neutral"
                          variant="outline"
                          size="sm"
                          leftIcon={<IoGridOutline className="size-4" />}
                          onClick={() => {
                            if (!results) return;
                            setScope("anime");
                            setSuggestOpen(false);
                            executeSearch({ q: results.query, scope: "anime" });
                          }}
                        >
                          {dir === "rtl" ? "عرض أنمي" : "Anime"}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {/* Loading overlay */}
              <AnimatePresence>
                {isSearching && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 rounded-2xl border border-border-subtle bg-background-elevated p-4"
                  >
                    <div className={cn("flex items-center justify-between gap-3", isRTL && "flex-row-reverse")}>
                      <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                        <span className="inline-flex size-2 animate-pulse rounded-full bg-accent shadow-[var(--shadow-glow-brand)]" />
                        <span className="text-sm font-semibold text-foreground-strong">
                          <bdi>{dir === "rtl" ? "جاري البحث…" : "Searching…"}</bdi>
                        </span>
                      </div>
                      <Badge tone="neutral">
                        <IoSparklesOutline className="size-4" />
                        <span>
                          <bdi>{scopeLabel(scope, dir)}</bdi>
                        </span>
                      </Badge>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Skeleton className="h-20" />
                      <Skeleton className="h-20" />
                      <Skeleton className="h-20 sm:col-span-2" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Results body */}
              <div className="mt-4">
                {!results ? (
                  <div className="rounded-2xl border border-border-subtle bg-surface-soft/60 p-4">
                    <div className="text-sm font-semibold text-foreground-strong">
                      <bdi>{dir === "rtl" ? "جاهز للبحث" : "Ready to search"}</bdi>
                    </div>
                    <div className="mt-1 text-xs text-foreground-muted">
                      <bdi>
                        {dir === "rtl"
                          ? "جرّب البحث العام لعرض نماذج متعددة للنتائج (مستخدمين/أعمال/منشورات/مجموعات…)."
                          : "Try All to see mixed templates (people/works/posts/communities…)."}
                      </bdi>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {TRENDING.slice(0, 4).map((t) => (
                        <button
                          key={t.q}
                          type="button"
                          onClick={() => {
                            setScope(t.scope ?? "all");
                            setQuery(t.q);
                            executeSearch({ q: t.q, scope: t.scope ?? "all", from: "suggestion" });
                          }}
                          className={cn(
                            "rounded-2xl border border-card-border bg-card p-3 text-left shadow-[var(--shadow-sm)]",
                            "hover:shadow-[var(--shadow-md)] hover:border-accent-border transition",
                            isRTL && "text-right",
                          )}
                        >
                          <div className={cn("flex items-start justify-between gap-3", isRTL && "flex-row-reverse")}>
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-foreground-strong">
                                <bdi>{t.q}</bdi>
                              </div>
                              <div className="mt-1 text-[11px] text-foreground-muted">
                                <bdi>
                                  {dir === "rtl" ? "ترند" : "Trending"} •{" "}
                                  {scopeLabel(t.scope ?? "all", dir)}
                                </bdi>
                              </div>
                            </div>

                            <span
                              className="inline-block size-3 rounded-full"
                              style={{ background: `hsl(${t.hue} 85% 55%)` }}
                            />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : results.total === 0 ? (
                  <div className="rounded-2xl border border-border-subtle bg-surface-soft/60 p-4">
                    <div className="text-sm font-semibold text-foreground-strong">
                      <bdi>{dir === "rtl" ? "لا توجد نتائج" : "No results"}</bdi>
                    </div>
                    <div className="mt-1 text-xs text-foreground-muted">
                      <bdi>
                        {dir === "rtl"
                          ? "جرّب كلمات مختلفة، أو غيّر نوع البحث، أو عطّل محددات مثل إخفاء الحرق."
                          : "Try different keywords, change scope, or relax refiners (e.g. spoilers)."}
                      </bdi>
                    </div>

                    <div className={cn("mt-3 flex flex-wrap gap-2", isRTL && "justify-end")}>
                      <Button
                        tone="neutral"
                        variant="outline"
                        size="sm"
                        leftIcon={<IoSparklesOutline className="size-4" />}
                        onClick={() => {
                          setScope("all");
                          executeSearch({ q: results.query, scope: "all" });
                        }}
                      >
                        {dir === "rtl" ? "بحث عام" : "All"}
                      </Button>

                      {refine.hideSpoilers ? (
                        <Button
                          tone="warning"
                          variant="soft"
                          size="sm"
                          onClick={() => setRefine((s) => ({ ...s, hideSpoilers: false }))}
                        >
                          {dir === "rtl" ? "إظهار الحرق" : "Show spoilers"}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <ResultsRenderer
                    dir={dir}
                    scope={results.scope}
                    refine={refine}
                    results={results}
                  />
                )}
              </div>
            </GlassCard>
          </section>
        </div>
      </div>
    </main>
  );
}

function ResultsRenderer({
  dir,
  scope,
  refine,
  results,
}: {
  dir: "rtl" | "ltr";
  scope: SearchScope;
  refine: RefineState;
  results: SearchResults;
}) {
  const reduce = useReducedMotion();
  const isRTL = dir === "rtl";

  const groups = results.groups;

  const sectionAnim = reduce
    ? { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 } }
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.16, ease: "easeOut" } },
      };

  // Helper: render section with title + content
  const Section = ({
    icon,
    title,
    subtitle,
    children,
  }: {
    icon: React.ReactNode;
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    children: React.ReactNode;
  }) => (
    <motion.div
      {...sectionAnim}
      className="rounded-2xl border border-border-subtle bg-background-elevated p-4"
    >
      <SectionTitle dir={dir} icon={icon} title={title} subtitle={subtitle} />
      <div className="mt-3">{children}</div>
    </motion.div>
  );

  // ALL view: multiple templates
  if (scope === "all") {
    const top = results.top;

    return (
      <div className="space-y-4">
        {/* Top match (single prominent card) */}
        {top ? (
          <Section
            icon={<IoSparklesOutline className="size-4" />}
            title={dir === "rtl" ? "أفضل تطابق" : "Top match"}
            subtitle={
              dir === "rtl"
                ? "نتيجة واحدة بارزة — ثم بقية الأقسام حسب النوع"
                : "One highlighted result — then grouped sections"
            }
          >
            {top.kind === "user" ? (
              <UserRow u={top} dir={dir} />
            ) : top.kind === "work" ? (
              <WorkCard w={top} dir={dir} />
            ) : top.kind === "post" ? (
              <PostCard p={top} dir={dir} hideSpoilerBadge={refine.hideSpoilers} />
            ) : top.kind === "community" ? (
              <CommunityCard c={top} dir={dir} />
            ) : (
              <StudioRow s={top} dir={dir} />
            )}
          </Section>
        ) : null}

        {/* Users (list template) */}
        {groups.users.length ? (
          <Section
            icon={<IoPeopleOutline className="size-4" />}
            title={dir === "rtl" ? "مستخدمين" : "Users"}
            subtitle={dir === "rtl" ? "قائمة سريعة" : "Quick list"}
          >
            <div className="space-y-3">
              {groups.users.slice(0, 4).map((u) => (
                <UserRow key={u.id} u={u} dir={dir} />
              ))}
            </div>
          </Section>
        ) : null}

        {/* Influencers */}
        {groups.influencers.length ? (
          <Section
            icon={<IoFlashOutline className="size-4" />}
            title={dir === "rtl" ? "مؤثرين" : "Influencers"}
            subtitle={dir === "rtl" ? "صنّاع محتوى" : "Creators"}
          >
            <div className="space-y-3">
              {groups.influencers.slice(0, 4).map((u) => (
                <UserRow key={u.id} u={u} dir={dir} />
              ))}
            </div>
          </Section>
        ) : null}

        {/* Works (grid template) */}
        {(groups.anime.length || groups.manga.length || groups.comics.length) ? (
          <Section
            icon={<IoFilmOutline className="size-4" />}
            title={dir === "rtl" ? "أعمال" : "Works"}
            subtitle={dir === "rtl" ? "شبكة كروت متنوعة" : "Mixed grid"}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[...groups.anime, ...groups.manga, ...groups.comics].slice(0, 6).map((w) => (
                <WorkCard key={w.id} w={w} dir={dir} />
              ))}
            </div>
          </Section>
        ) : null}

        {/* Posts (feed template) */}
        {groups.posts.length ? (
          <Section
            icon={<IoChatbubbleEllipsesOutline className="size-4" />}
            title={dir === "rtl" ? "منشورات" : "Posts"}
            subtitle={
              dir === "rtl"
                ? `ترتيب: ${refine.sort === "newest" ? "الأحدث" : refine.sort === "top" ? "الأعلى" : "الأكثر صلة"}`
                : `Sort: ${refine.sort}`
            }
          >
            <div className="space-y-3">
              {groups.posts.slice(0, 5).map((p) => (
                <PostCard key={p.id} p={p} dir={dir} hideSpoilerBadge={refine.hideSpoilers} />
              ))}
            </div>
          </Section>
        ) : null}

        {/* Communities (cards template) */}
        {groups.communities.length ? (
          <Section
            icon={<IoPeopleOutline className="size-4" />}
            title={dir === "rtl" ? "مجموعات" : "Communities"}
            subtitle={dir === "rtl" ? "مناسب للاكتشاف" : "Discovery friendly"}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {groups.communities.slice(0, 6).map((c) => (
                <CommunityCard key={c.id} c={c} dir={dir} />
              ))}
            </div>
          </Section>
        ) : null}

        {/* Studios */}
        {groups.studios.length ? (
          <Section
            icon={<IoBusinessOutline className="size-4" />}
            title={dir === "rtl" ? "استوديوهات" : "Studios"}
            subtitle={dir === "rtl" ? "قائمة" : "List"}
          >
            <div className="space-y-3">
              {groups.studios.slice(0, 6).map((s) => (
                <StudioRow key={s.id} s={s} dir={dir} />
              ))}
            </div>
          </Section>
        ) : null}

        {/* Footer hint */}
        <div
          className={cn(
            "rounded-2xl border border-border-subtle bg-surface-soft/60 p-4 text-xs text-foreground-muted",
            isRTL && "text-right",
          )}
        >
          <bdi>
            {dir === "rtl"
              ? "ملاحظة: عند ربط الـAPI الحقيقي، استبدل runSearch بمكالمة backend مع pagination + caching."
              : "Note: When integrating real API, replace runSearch with backend call + pagination + caching."}
          </bdi>
        </div>
      </div>
    );
  }

  // Scoped views: single-type templates
  if (scope === "users") {
    return (
      <div className="space-y-3">
        {groups.users.map((u) => (
          <UserRow key={u.id} u={u} dir={dir} />
        ))}
      </div>
    );
  }

  if (scope === "influencers") {
    return (
      <div className="space-y-3">
        {groups.influencers.map((u) => (
          <UserRow key={u.id} u={u} dir={dir} />
        ))}
      </div>
    );
  }

  if (scope === "anime") {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {groups.anime.map((w) => (
          <WorkCard key={w.id} w={w} dir={dir} />
        ))}
      </div>
    );
  }

  if (scope === "manga") {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {groups.manga.map((w) => (
          <WorkCard key={w.id} w={w} dir={dir} />
        ))}
      </div>
    );
  }

  if (scope === "comics") {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {groups.comics.map((w) => (
          <WorkCard key={w.id} w={w} dir={dir} />
        ))}
      </div>
    );
  }

  if (scope === "posts") {
    return (
      <div className="space-y-3">
        {groups.posts.map((p) => (
          <PostCard key={p.id} p={p} dir={dir} hideSpoilerBadge={refine.hideSpoilers} />
        ))}
      </div>
    );
  }

  if (scope === "communities") {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {groups.communities.map((c) => (
          <CommunityCard key={c.id} c={c} dir={dir} />
        ))}
      </div>
    );
  }

  if (scope === "studios") {
    return (
      <div className="space-y-3">
        {groups.studios.map((s) => (
          <StudioRow key={s.id} s={s} dir={dir} />
        ))}
      </div>
    );
  }

  return null;
}
