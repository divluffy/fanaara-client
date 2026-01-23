"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
  animate,
} from "framer-motion";
import {
  AlertTriangle,
  ArrowUpRight,
  Bell,
  Bookmark,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Compass,
  Crown,
  Flag,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Share2,
  Swords,
  ThumbsUp,
  UserPlus,
  Users,
  Zap,
  BookOpen,
  Sparkles,
  ShieldAlert,
  Star,
  TrendingUp,
  PencilLine,
  Hash,
  Send,
} from "lucide-react";

// ✅ Required design-system components (cast to any to be resilient to varying prop APIs)
import { Button } from "@/design/Button";
import { IconButton } from "@/design/IconButton";
import { Avatar } from "@/design/Avatar";

const DSButton = Button as unknown as React.FC<any>;
const DSIconButton = IconButton as unknown as React.FC<any>;
const DSAvatar = Avatar as unknown as React.FC<any>;

/** ✅ rank borders */
const RanksBorders = { new_otaku: "/borders/wolf.png" } as const;

/** ✅ mock */
const UserData = {
  id: "1",
  username: "dev_luffy",
  first_name: "ibrahim",
  last_name: "jomaa",
  country: "ps",
  dob: new Date("25/08/2000"),
  gender: "male",
  rank: "new_otaku",
  avatar: {
    md: "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExZjU1MTV5OWxqNGNya2d1dHN5bWV6ODM1NXQ4dGx6Zjg3ZmR6bW0yMSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/12q7JyfK1UolW0/giphy.webp",
  },
  bg: {
    lg: "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExZjU1MTV5OWxqNGNya2d1dHN5bWV6ODM1NXQ4dGx6Zjg3ZmR6bW0yMSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/2Pk9newN8fkbu/200.webp",
  },

  // ➕ extra mock fields (allowed)
  bio: "Full-stack dev by day, anime/comics nerd 24/7. I collect arcs, plot twists, and rare panels. Building Fanaara to connect fans, creators, and hype ✨",
  joinDate: new Date("2024-03-18"),
  followers: 12840,
  following: 312,
  popularity: 98765,
  notifications: 7,

  animeStats: {
    watched: 412,
    favorites: 38,
    dropped: 12,
    rated: 287,
    bestAnime: "Vinland Saga",
    bestCharacter: "Killua Zoldyck",
  },
  comicsStats: {
    read: 226,
    favorites: 24,
    dropped: 9,
    rated: 151,
    bestComic: "Berserk",
    bestCharacter: "Guts",
  },
} as const;

type TabKey =
  | "general"
  | "anime"
  | "comics"
  | "activities"
  | "popularities"
  | "collections";

const TABS: Array<{ key: TabKey; label: string; icon: React.ReactNode }> = [
  {
    key: "general",
    label: "General",
    icon: <Compass className="h-4 w-4" aria-hidden="true" />,
  },
  {
    key: "anime",
    label: "Anime Lists",
    icon: <Swords className="h-4 w-4" aria-hidden="true" />,
  },
  {
    key: "comics",
    label: "Comics Lists",
    icon: <BookOpen className="h-4 w-4" aria-hidden="true" />,
  },
  {
    key: "activities",
    label: "Activities",
    icon: <TrendingUp className="h-4 w-4" aria-hidden="true" />,
  },
  {
    key: "popularities",
    label: "Popularities",
    icon: <Zap className="h-4 w-4" aria-hidden="true" />,
  },
  {
    key: "collections",
    label: "Collections",
    icon: <Bookmark className="h-4 w-4" aria-hidden="true" />,
  },
];

type Post = {
  id: string;
  title: string;
  content: string;
  tags: Array<"anime" | "comics" | "community" | "review">;
  createdAt: Date;
  reactions: { likes: number; comments: number; shares: number };
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function safeDate(d: Date) {
  // Handles invalid Date from "25/08/2000" parsing (locale-dependent)
  const isValid = d instanceof Date && !Number.isNaN(d.getTime());
  return isValid ? d : new Date("2000-08-25");
}

function formatCompact(n: number) {
  // simple compact formatter without Intl edge cases
  if (n >= 1_000_000)
    return `${(Math.round((n / 1_000_000) * 10) / 10).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 10_000) return `${Math.round(n / 1000)}K`;
  if (n >= 1_000)
    return `${(Math.round((n / 1000) * 10) / 10).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  return `${n}`;
}

function formatDate(d: Date) {
  const dt = safeDate(d);
  return dt.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function timeAgo(from: Date) {
  const now = Date.now();
  const diff = Math.max(0, now - from.getTime());
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d`;
  const wk = Math.floor(day / 7);
  if (wk < 5) return `${wk}w`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo}mo`;
  const yr = Math.floor(day / 365);
  return `${yr}y`;
}

function AnimatedNumber({
  value,
  className,
  prefix,
  suffix,
  compact = false,
}: {
  value: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  compact?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState(() =>
    compact ? formatCompact(value) : `${value}`,
  );

  useEffect(() => {
    if (reduceMotion) {
      setDisplay(compact ? formatCompact(value) : `${value}`);
      return;
    }
    const el = ref.current;
    if (!el) return;

    const fromText = (el.dataset.value ?? "0").replace(/[^\d]/g, "");
    const from = Number(fromText || 0);
    const to = value;

    el.dataset.value = `${to}`;

    const controls = animate(from, to, {
      type: "tween",
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => {
        const v = Math.round(latest);
        setDisplay(compact ? formatCompact(v) : `${v}`);
      },
    });

    return () => controls.stop();
  }, [value, compact, reduceMotion]);

  return (
    <span ref={ref} data-value={value} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

function StatPill({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div
      className={cx(
        "group relative overflow-hidden rounded-2xl border",
        "border-white/10 bg-white/[0.03] backdrop-blur-xl",
        "shadow-[0_0_0_1px_rgba(255,255,255,0.04)]",
        "transition hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.05]",
      )}
    >
      <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100">
        <div className="absolute -left-24 -top-20 h-48 w-48 rounded-full bg-violet-500/15 blur-2xl" />
        <div className="absolute -right-20 -bottom-16 h-48 w-48 rounded-full bg-sky-500/15 blur-2xl" />
      </div>

      <div className="relative p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={cx(
                "inline-flex h-9 w-9 items-center justify-center rounded-xl border",
                "border-white/10 bg-white/[0.04]",
              )}
            >
              {icon}
            </span>
            <div className="min-w-0">
              <div className="text-sm text-zinc-300/90">{label}</div>
              {hint ? (
                <div className="text-xs text-zinc-400/70">{hint}</div>
              ) : null}
            </div>
          </div>
          <div className="text-right text-lg font-semibold tracking-tight text-white">
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-4">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
          {icon}
        </span>
        <div>
          <div className="text-base font-semibold text-white">{title}</div>
          {subtitle ? (
            <div className="text-xs text-zinc-400/80">{subtitle}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Card({
  children,
  className,
  glow = true,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={cx(
        "relative overflow-hidden rounded-3xl border",
        "border-white/10 bg-white/[0.03] backdrop-blur-xl",
        "shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_24px_80px_-36px_rgba(0,0,0,0.65)]",
        "transition hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.05]",
        className,
      )}
    >
      {glow ? (
        <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100" />
      ) : null}
      <div className="absolute inset-0 opacity-60">
        <div className="absolute -left-40 -top-32 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute -right-40 -bottom-32 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />
      </div>
      <div className="relative p-5">{children}</div>
    </div>
  );
}

export default function Page() {
  const reduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<TabKey>("general");

  const user = UserData;

  const mockPosts: Post[] = useMemo(
    () => [
      {
        id: "p1",
        title: "Hot take: character arcs > power scaling",
        content:
          "If the story makes me feel something, I don’t care if the power system is perfectly balanced. Give me growth, consequences, and a finale that hits.",
        tags: ["anime", "community"],
        createdAt: new Date(Date.now() - 1000 * 60 * 42),
        reactions: { likes: 912, comments: 128, shares: 44 },
      },
      {
        id: "p2",
        title: "Panel composition in Berserk is unreal",
        content:
          "Some pages read like a full movie scene. The pacing, the shadows, the negative space… it’s pure atmosphere. Drop your favorite chapter!",
        tags: ["comics", "review"],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 7),
        reactions: { likes: 1530, comments: 211, shares: 96 },
      },
      {
        id: "p3",
        title: "Building Fanaara: profiles that feel like a universe",
        content:
          "We’re mixing rank aesthetics, list stats, and activity signals into one page that still loads fast. Next: badges + seasonal events.",
        tags: ["community"],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26),
        reactions: { likes: 2104, comments: 302, shares: 180 },
      },
      {
        id: "p4",
        title: "What’s your comfort anime?",
        content:
          "The one you can rewatch on loop when life gets noisy. I’ll start: Haikyuu!! — instant motivation.",
        tags: ["anime", "community"],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6),
        reactions: { likes: 876, comments: 420, shares: 22 },
      },
    ],
    [],
  );

  const fullName = `${user.first_name} ${user.last_name}`;
  const rankLabel = user.rank === "new_otaku" ? "New Otaku" : user.rank;

  const dob = safeDate(user.dob);
  const age = useMemo(() => {
    const now = new Date();
    let a = now.getFullYear() - dob.getFullYear();
    const m = now.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) a--;
    return Math.max(0, a);
  }, [dob]);

  const badgeCount = user.notifications;

  const underlineTransition = reduceMotion
    ? { duration: 0 }
    : { type: "spring", stiffness: 520, damping: 38, mass: 0.6 };

  const contentTransition = reduceMotion
    ? { duration: 0 }
    : { type: "spring", stiffness: 260, damping: 30, mass: 0.8 };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_700px_at_15%_10%,rgba(139,92,246,0.18),transparent_60%),radial-gradient(900px_600px_at_85%_25%,rgba(56,189,248,0.14),transparent_60%),radial-gradient(900px_600px_at_50%_110%,rgba(236,72,153,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-950/90" />
      </div>

      {/* Header */}
      <header className="relative">
        <div className="relative h-[320px] w-full overflow-hidden sm:h-[360px]">
          <img
            src={user.bg.lg}
            alt="Profile background"
            className="h-full w-full object-cover object-center"
            loading="eager"
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/55 to-zinc-950" />
          {/* Aurora overlay */}
          <div className="absolute inset-0 opacity-80">
            <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />
            <div className="absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-sky-500/16 blur-3xl" />
            <div className="absolute -right-24 top-16 h-80 w-80 rounded-full bg-fuchsia-500/18 blur-3xl" />
          </div>

          {/* Top actions */}
          <div className="absolute left-0 right-0 top-0 z-20 mx-auto flex max-w-6xl items-center justify-between px-4 pt-4 sm:px-6">
            <DSIconButton
              aria-label="Report user"
              title="Report"
              className={cx(
                "relative",
                "border border-white/10 bg-white/[0.04] text-white",
                "hover:border-white/15 hover:bg-white/[0.06]",
              )}
              onClick={() => {}}
            >
              <ShieldAlert className="h-5 w-5" />
            </DSIconButton>

            <DSIconButton
              aria-label="Share profile"
              title="Share"
              className={cx(
                "relative",
                "border border-white/10 bg-white/[0.04] text-white",
                "hover:border-white/15 hover:bg-white/[0.06]",
              )}
              onClick={() => {}}
            >
              <Share2 className="h-5 w-5" />
            </DSIconButton>
          </div>

          {/* Profile center block */}
          <div className="absolute inset-x-0 bottom-0 z-10 mx-auto w-full max-w-6xl px-4 pb-6 sm:px-6">
            <div className="flex flex-col items-center gap-4">
              {/* Avatar + rank border */}
              <div className="relative">
                <div className="relative">
                  <div className="relative h-28 w-28 sm:h-32 sm:w-32">
                    {/* Avatar (design system) */}
                    <div className="h-full w-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-[0_18px_70px_-40px_rgba(0,0,0,0.9)]">
                      <DSAvatar
                        src={user.avatar.md}
                        alt={`${fullName} avatar`}
                        className="h-full w-full"
                      />
                    </div>

                    {/* Rank border overlay */}
                    <img
                      src={RanksBorders[user.rank]}
                      alt="Rank border"
                      className="pointer-events-none absolute -inset-2 h-[calc(100%+16px)] w-[calc(100%+16px)] object-contain opacity-95 drop-shadow-[0_14px_30px_rgba(0,0,0,0.65)]"
                      loading="lazy"
                    />
                  </div>

                  {/* Online / verified-ish dot */}
                  <div className="absolute -bottom-2 -right-2 rounded-2xl border border-white/10 bg-zinc-950/70 px-2 py-1 backdrop-blur-xl">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(16,185,129,0.15)]" />
                      <span className="text-xs text-zinc-200">Active</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rank pill */}
              <div className="flex items-center gap-2">
                <span
                  className={cx(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
                    "border-white/10 bg-white/[0.04] text-zinc-100",
                    "shadow-[0_0_0_1px_rgba(255,255,255,0.04)]",
                  )}
                >
                  <Crown
                    className="h-4 w-4 text-violet-300"
                    aria-hidden="true"
                  />
                  {rankLabel}
                </span>
                <span
                  className={cx(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
                    "border-white/10 bg-white/[0.04] text-zinc-200",
                  )}
                  title="Community reputation"
                >
                  <Sparkles
                    className="h-4 w-4 text-fuchsia-300"
                    aria-hidden="true"
                  />
                  <AnimatedNumber
                    value={user.popularity}
                    compact
                    className="tabular-nums"
                  />
                  <span className="text-zinc-400/80">pop</span>
                </span>
              </div>

              {/* Name + username */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                    {fullName}
                  </h1>
                  <CheckCircle2
                    className="h-5 w-5 text-sky-300"
                    aria-hidden="true"
                    title="Verified (mock)"
                  />
                </div>
                <div className="mt-1 text-sm text-zinc-300/90">
                  <span className="text-zinc-400">@</span>
                  <span className="font-medium text-zinc-200">
                    {user.username}
                  </span>
                  <span className="mx-2 text-zinc-600">•</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Flag
                      className="h-4 w-4 text-zinc-400"
                      aria-hidden="true"
                    />
                    <span className="uppercase text-zinc-300">
                      {user.country}
                    </span>
                  </span>
                </div>
              </div>

              {/* Buttons row */}
              <div className="mt-2 flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
                <DSButton
                  onClick={() => {}}
                  className={cx(
                    "group inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold",
                    "bg-gradient-to-r from-violet-500/90 via-fuchsia-500/85 to-sky-500/85",
                    "shadow-[0_18px_70px_-36px_rgba(139,92,246,0.55)]",
                    "hover:brightness-[1.06]",
                  )}
                >
                  <UserPlus className="h-4 w-4" aria-hidden="true" />
                  Follow
                  <ArrowUpRight className="h-4 w-4 opacity-70 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </DSButton>

                <DSButton
                  onClick={() => {}}
                  className={cx(
                    "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold",
                    "border border-white/10 bg-white/[0.04] text-white backdrop-blur-xl",
                    "hover:border-white/15 hover:bg-white/[0.06]",
                  )}
                >
                  <Zap className="h-4 w-4 text-amber-300" aria-hidden="true" />
                  Send Popularity
                </DSButton>

                {/* Notification IconButton + badge */}
                <div className="relative flex justify-center sm:justify-start">
                  <DSIconButton
                    aria-label="Notifications"
                    title="Notifications"
                    className={cx(
                      "relative",
                      "border border-white/10 bg-white/[0.04] text-white",
                      "hover:border-white/15 hover:bg-white/[0.06]",
                    )}
                    onClick={() => {}}
                  >
                    <Bell className="h-5 w-5" />
                  </DSIconButton>

                  {badgeCount > 0 ? (
                    <span
                      className={cx(
                        "pointer-events-none absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1",
                        "bg-gradient-to-r from-fuchsia-500 to-violet-500 text-[11px] font-semibold text-white",
                        "shadow-[0_10px_30px_-14px_rgba(236,72,153,0.65)]",
                      )}
                      aria-label={`${badgeCount} new notifications`}
                    >
                      {badgeCount > 99 ? "99+" : badgeCount}
                    </span>
                  ) : null}
                </div>

                <DSButton
                  onClick={() => {}}
                  className={cx(
                    "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold",
                    "border border-white/10 bg-white/[0.04] text-white backdrop-blur-xl",
                    "hover:border-white/15 hover:bg-white/[0.06]",
                  )}
                >
                  <MessageCircle
                    className="h-4 w-4 text-sky-300"
                    aria-hidden="true"
                  />
                  Chat
                  <ChevronRight
                    className="h-4 w-4 opacity-70"
                    aria-hidden="true"
                  />
                </DSButton>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        {/* Tabs */}
        <div className="sticky top-0 z-30 -mx-4 mt-4 border-b border-white/10 bg-zinc-950/55 px-4 backdrop-blur-xl sm:-mx-6 sm:px-6">
          <div className="relative">
            <div className="no-scrollbar flex gap-2 overflow-x-auto py-3">
              <LayoutGroup id="profile-tabs">
                {TABS.map((t) => {
                  const isActive = t.key === activeTab;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setActiveTab(t.key)}
                      className={cx(
                        "relative inline-flex shrink-0 items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold",
                        isActive
                          ? "border-white/15 bg-white/[0.06] text-white"
                          : "border-white/10 bg-white/[0.03] text-zinc-300/90 hover:border-white/15 hover:bg-white/[0.05]",
                      )}
                    >
                      <span
                        className={cx(
                          "inline-flex h-7 w-7 items-center justify-center rounded-xl border",
                          isActive
                            ? "border-white/15 bg-white/[0.06]"
                            : "border-white/10 bg-white/[0.04]",
                        )}
                      >
                        {t.icon}
                      </span>
                      <span>{t.label}</span>

                      {isActive ? (
                        <motion.span
                          layoutId="tab-underline"
                          className="absolute inset-x-3 -bottom-3 h-[2px] rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-sky-400"
                          transition={underlineTransition as any}
                        />
                      ) : null}
                    </button>
                  );
                })}
              </LayoutGroup>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
              transition={contentTransition as any}
              className="space-y-10"
            >
              {activeTab === "general" ? (
                <div className="space-y-10">
                  {/* Cards grid */}
                  <section className="space-y-4">
                    <SectionTitle
                      icon={
                        <Users
                          className="h-5 w-5 text-violet-300"
                          aria-hidden="true"
                        />
                      }
                      title="About"
                      subtitle="Your identity, stats, and universe vibe"
                    />

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                      {/* Card A: Basic details */}
                      <Card className="group lg:col-span-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-lg font-semibold">Profile</div>
                            <div className="mt-1 text-sm text-zinc-300/90">
                              {user.bio}
                            </div>
                          </div>
                          <DSIconButton
                            aria-label="Edit profile"
                            title="Edit (mock)"
                            className={cx(
                              "border border-white/10 bg-white/[0.04] text-white",
                              "hover:border-white/15 hover:bg-white/[0.06]",
                            )}
                            onClick={() => {}}
                          >
                            <PencilLine className="h-5 w-5" />
                          </DSIconButton>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">
                          <StatPill
                            icon={
                              <Users
                                className="h-4 w-4 text-sky-200"
                                aria-hidden="true"
                              />
                            }
                            label="Followers"
                            value={
                              <AnimatedNumber
                                value={user.followers}
                                compact
                                className="tabular-nums"
                              />
                            }
                          />
                          <StatPill
                            icon={
                              <UserPlus
                                className="h-4 w-4 text-zinc-200"
                                aria-hidden="true"
                              />
                            }
                            label="Following"
                            value={
                              <AnimatedNumber
                                value={user.following}
                                compact
                                className="tabular-nums"
                              />
                            }
                          />
                          <StatPill
                            icon={
                              <Zap
                                className="h-4 w-4 text-amber-200"
                                aria-hidden="true"
                              />
                            }
                            label="Popularity"
                            hint="All-time"
                            value={
                              <AnimatedNumber
                                value={user.popularity}
                                compact
                                className="tabular-nums"
                              />
                            }
                          />
                          <StatPill
                            icon={
                              <Calendar
                                className="h-4 w-4 text-fuchsia-200"
                                aria-hidden="true"
                              />
                            }
                            label="Joined"
                            value={
                              <span className="text-base">
                                {formatDate(user.joinDate)}
                              </span>
                            }
                          />
                          <StatPill
                            icon={
                              <Flag
                                className="h-4 w-4 text-zinc-200"
                                aria-hidden="true"
                              />
                            }
                            label="Country"
                            value={
                              <span className="uppercase">{user.country}</span>
                            }
                          />
                          <StatPill
                            icon={
                              <Star
                                className="h-4 w-4 text-violet-200"
                                aria-hidden="true"
                              />
                            }
                            label="Age"
                            value={<span className="tabular-nums">{age}</span>}
                          />
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-200">
                            <Hash
                              className="h-3.5 w-3.5 text-zinc-400"
                              aria-hidden="true"
                            />
                            gender:{" "}
                            <span className="font-semibold text-white">
                              {user.gender}
                            </span>
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-200">
                            <Crown
                              className="h-3.5 w-3.5 text-violet-300"
                              aria-hidden="true"
                            />
                            rank:{" "}
                            <span className="font-semibold text-white">
                              {rankLabel}
                            </span>
                          </span>
                        </div>
                      </Card>

                      {/* Card B: Anime stats */}
                      <Card className="group lg:col-span-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                                <Swords
                                  className="h-5 w-5 text-sky-300"
                                  aria-hidden="true"
                                />
                              </span>
                              <div>
                                <div className="text-lg font-semibold">
                                  Anime Stats
                                </div>
                                <div className="text-xs text-zinc-400/80">
                                  Watch history + favorites
                                </div>
                              </div>
                            </div>
                          </div>
                          <DSIconButton
                            aria-label="Anime options"
                            title="More"
                            className={cx(
                              "border border-white/10 bg-white/[0.04] text-white",
                              "hover:border-white/15 hover:bg-white/[0.06]",
                            )}
                            onClick={() => {}}
                          >
                            <MoreHorizontal className="h-5 w-5" />
                          </DSIconButton>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">
                          <StatPill
                            icon={
                              <CheckCircle2
                                className="h-4 w-4 text-emerald-200"
                                aria-hidden="true"
                              />
                            }
                            label="Watched"
                            value={
                              <AnimatedNumber
                                value={user.animeStats.watched}
                                className="tabular-nums"
                              />
                            }
                          />
                          <StatPill
                            icon={
                              <Heart
                                className="h-4 w-4 text-fuchsia-200"
                                aria-hidden="true"
                              />
                            }
                            label="Favorites"
                            value={
                              <AnimatedNumber
                                value={user.animeStats.favorites}
                                className="tabular-nums"
                              />
                            }
                          />
                          <StatPill
                            icon={
                              <AlertTriangle
                                className="h-4 w-4 text-amber-200"
                                aria-hidden="true"
                              />
                            }
                            label="Dropped"
                            value={
                              <AnimatedNumber
                                value={user.animeStats.dropped}
                                className="tabular-nums"
                              />
                            }
                          />
                          <StatPill
                            icon={
                              <Star
                                className="h-4 w-4 text-violet-200"
                                aria-hidden="true"
                              />
                            }
                            label="Rated"
                            value={
                              <AnimatedNumber
                                value={user.animeStats.rated}
                                className="tabular-nums"
                              />
                            }
                          />
                        </div>

                        <div className="mt-4 space-y-2">
                          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                            <div className="text-xs text-zinc-400/80">
                              Best Anime
                            </div>
                            <div className="mt-1 flex items-center justify-between gap-3">
                              <div className="text-sm font-semibold">
                                {user.animeStats.bestAnime}
                              </div>
                              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-zinc-200">
                                <Sparkles
                                  className="h-3.5 w-3.5 text-sky-300"
                                  aria-hidden="true"
                                />
                                peak
                              </span>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                            <div className="text-xs text-zinc-400/80">
                              Best Character
                            </div>
                            <div className="mt-1 text-sm font-semibold">
                              {user.animeStats.bestCharacter}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4">
                          <DSButton
                            onClick={() => setActiveTab("anime")}
                            className={cx(
                              "w-full rounded-2xl px-4 py-2 text-sm font-semibold",
                              "bg-gradient-to-r from-sky-500/80 via-violet-500/70 to-fuchsia-500/70",
                              "hover:brightness-[1.06]",
                            )}
                          >
                            Open Anime List
                          </DSButton>
                        </div>
                      </Card>

                      {/* Card C: Comics stats */}
                      <Card className="group lg:col-span-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                              <BookOpen
                                className="h-5 w-5 text-fuchsia-300"
                                aria-hidden="true"
                              />
                            </span>
                            <div>
                              <div className="text-lg font-semibold">
                                Comics Stats
                              </div>
                              <div className="text-xs text-zinc-400/80">
                                Read history + highlights
                              </div>
                            </div>
                          </div>
                          <DSIconButton
                            aria-label="Comics options"
                            title="More"
                            className={cx(
                              "border border-white/10 bg-white/[0.04] text-white",
                              "hover:border-white/15 hover:bg-white/[0.06]",
                            )}
                            onClick={() => {}}
                          >
                            <MoreHorizontal className="h-5 w-5" />
                          </DSIconButton>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">
                          <StatPill
                            icon={
                              <CheckCircle2
                                className="h-4 w-4 text-emerald-200"
                                aria-hidden="true"
                              />
                            }
                            label="Read"
                            value={
                              <AnimatedNumber
                                value={user.comicsStats.read}
                                className="tabular-nums"
                              />
                            }
                          />
                          <StatPill
                            icon={
                              <Heart
                                className="h-4 w-4 text-fuchsia-200"
                                aria-hidden="true"
                              />
                            }
                            label="Favorites"
                            value={
                              <AnimatedNumber
                                value={user.comicsStats.favorites}
                                className="tabular-nums"
                              />
                            }
                          />
                          <StatPill
                            icon={
                              <AlertTriangle
                                className="h-4 w-4 text-amber-200"
                                aria-hidden="true"
                              />
                            }
                            label="Dropped"
                            value={
                              <AnimatedNumber
                                value={user.comicsStats.dropped}
                                className="tabular-nums"
                              />
                            }
                          />
                          <StatPill
                            icon={
                              <Star
                                className="h-4 w-4 text-violet-200"
                                aria-hidden="true"
                              />
                            }
                            label="Rated"
                            value={
                              <AnimatedNumber
                                value={user.comicsStats.rated}
                                className="tabular-nums"
                              />
                            }
                          />
                        </div>

                        <div className="mt-4 space-y-2">
                          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                            <div className="text-xs text-zinc-400/80">
                              Best Comic
                            </div>
                            <div className="mt-1 flex items-center justify-between gap-3">
                              <div className="text-sm font-semibold">
                                {user.comicsStats.bestComic}
                              </div>
                              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-zinc-200">
                                <Sparkles
                                  className="h-3.5 w-3.5 text-fuchsia-300"
                                  aria-hidden="true"
                                />
                                masterpiece
                              </span>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                            <div className="text-xs text-zinc-400/80">
                              Best Character
                            </div>
                            <div className="mt-1 text-sm font-semibold">
                              {user.comicsStats.bestCharacter}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4">
                          <DSButton
                            onClick={() => setActiveTab("comics")}
                            className={cx(
                              "w-full rounded-2xl px-4 py-2 text-sm font-semibold",
                              "bg-gradient-to-r from-fuchsia-500/80 via-violet-500/70 to-sky-500/70",
                              "hover:brightness-[1.06]",
                            )}
                          >
                            Open Comics List
                          </DSButton>
                        </div>
                      </Card>
                    </div>
                  </section>

                  {/* Posts feed */}
                  <section className="space-y-4">
                    <SectionTitle
                      icon={
                        <Send
                          className="h-5 w-5 text-sky-300"
                          aria-hidden="true"
                        />
                      }
                      title="Posts"
                      subtitle="Latest drops from this profile"
                    />

                    <div className="space-y-4">
                      {mockPosts.slice(0, 6).map((post) => (
                        <motion.article
                          key={post.id}
                          initial={
                            reduceMotion
                              ? { opacity: 1 }
                              : { opacity: 0, y: 10 }
                          }
                          animate={{ opacity: 1, y: 0 }}
                          transition={
                            reduceMotion
                              ? { duration: 0 }
                              : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
                          }
                          className={cx(
                            "relative overflow-hidden rounded-3xl border",
                            "border-white/10 bg-white/[0.03] backdrop-blur-xl",
                            "shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_20px_80px_-44px_rgba(0,0,0,0.7)]",
                            "transition hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.05]",
                          )}
                        >
                          <div className="absolute inset-0 opacity-70">
                            <div className="absolute -left-44 -top-40 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
                            <div className="absolute -right-44 -bottom-40 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
                          </div>

                          <div className="relative p-5 sm:p-6">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="h-11 w-11 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
                                  <DSAvatar
                                    src={user.avatar.md}
                                    alt={fullName}
                                    className="h-full w-full"
                                  />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <div className="text-sm font-semibold text-white">
                                      {fullName}
                                    </div>
                                    <span className="text-xs text-zinc-500">
                                      @{user.username}
                                    </span>
                                    <span className="text-xs text-zinc-600">
                                      •
                                    </span>
                                    <span className="text-xs text-zinc-400">
                                      {timeAgo(post.createdAt)}
                                    </span>
                                  </div>
                                  <div className="mt-0.5 text-xs text-zinc-400/80">
                                    <span className="inline-flex items-center gap-1">
                                      <Zap
                                        className="h-3.5 w-3.5 text-amber-300"
                                        aria-hidden="true"
                                      />
                                      gained{" "}
                                      <span className="font-semibold text-zinc-200">
                                        +24
                                      </span>{" "}
                                      pop (mock)
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <DSIconButton
                                aria-label="Post options"
                                title="More"
                                className={cx(
                                  "border border-white/10 bg-white/[0.04] text-white",
                                  "hover:border-white/15 hover:bg-white/[0.06]",
                                )}
                                onClick={() => {}}
                              >
                                <MoreHorizontal className="h-5 w-5" />
                              </DSIconButton>
                            </div>

                            <div className="mt-4">
                              <h3 className="text-lg font-semibold tracking-tight">
                                {post.title}
                              </h3>
                              <p className="mt-2 text-sm leading-relaxed text-zinc-300/90">
                                {post.content}
                              </p>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                              {post.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className={cx(
                                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
                                    "border-white/10 bg-white/[0.04] text-zinc-200",
                                  )}
                                >
                                  <Hash
                                    className="h-3.5 w-3.5 text-zinc-400"
                                    aria-hidden="true"
                                  />
                                  {tag}
                                </span>
                              ))}
                            </div>

                            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex items-center gap-4 text-xs text-zinc-400">
                                <span className="inline-flex items-center gap-1.5">
                                  <ThumbsUp
                                    className="h-4 w-4 text-zinc-400"
                                    aria-hidden="true"
                                  />
                                  <span className="tabular-nums">
                                    {formatCompact(post.reactions.likes)}
                                  </span>
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                  <MessageCircle
                                    className="h-4 w-4 text-zinc-400"
                                    aria-hidden="true"
                                  />
                                  <span className="tabular-nums">
                                    {formatCompact(post.reactions.comments)}
                                  </span>
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                  <Share2
                                    className="h-4 w-4 text-zinc-400"
                                    aria-hidden="true"
                                  />
                                  <span className="tabular-nums">
                                    {formatCompact(post.reactions.shares)}
                                  </span>
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <DSIconButton
                                  aria-label="Like post"
                                  title="Like"
                                  className={cx(
                                    "border border-white/10 bg-white/[0.04] text-white",
                                    "hover:border-white/15 hover:bg-white/[0.06]",
                                  )}
                                  onClick={() => {}}
                                >
                                  <Heart className="h-5 w-5" />
                                </DSIconButton>
                                <DSIconButton
                                  aria-label="Comment"
                                  title="Comment"
                                  className={cx(
                                    "border border-white/10 bg-white/[0.04] text-white",
                                    "hover:border-white/15 hover:bg-white/[0.06]",
                                  )}
                                  onClick={() => {}}
                                >
                                  <MessageCircle className="h-5 w-5" />
                                </DSIconButton>
                                <DSIconButton
                                  aria-label="Share post"
                                  title="Share"
                                  className={cx(
                                    "border border-white/10 bg-white/[0.04] text-white",
                                    "hover:border-white/15 hover:bg-white/[0.06]",
                                  )}
                                  onClick={() => {}}
                                >
                                  <Share2 className="h-5 w-5" />
                                </DSIconButton>
                              </div>
                            </div>
                          </div>
                        </motion.article>
                      ))}
                    </div>
                  </section>
                </div>
              ) : null}

              {activeTab === "anime" ? (
                <div className="space-y-4">
                  <SectionTitle
                    icon={
                      <Swords
                        className="h-5 w-5 text-sky-300"
                        aria-hidden="true"
                      />
                    }
                    title="Anime Lists"
                    subtitle="Watchlist, favorites, ratings (mock UI)"
                  />
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-lg font-semibold">
                            Top Favorites
                          </div>
                          <div className="text-xs text-zinc-400/80">
                            Pinned by you
                          </div>
                        </div>
                        <DSButton
                          onClick={() => {}}
                          className={cx(
                            "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold",
                            "border border-white/10 bg-white/[0.04] text-white",
                            "hover:border-white/15 hover:bg-white/[0.06]",
                          )}
                        >
                          View All{" "}
                          <ChevronRight className="h-4 w-4 opacity-70" />
                        </DSButton>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {[
                          {
                            name: "Vinland Saga",
                            note: "10/10 • growth arc",
                            icon: <Sparkles className="h-4 w-4" />,
                          },
                          {
                            name: "Hunter x Hunter",
                            note: "rewatch comfort",
                            icon: <Heart className="h-4 w-4" />,
                          },
                          {
                            name: "Haikyuu!!",
                            note: "motivation boost",
                            icon: <TrendingUp className="h-4 w-4" />,
                          },
                          {
                            name: "Attack on Titan",
                            note: "cinematic",
                            icon: <Star className="h-4 w-4" />,
                          },
                        ].map((x) => (
                          <div
                            key={x.name}
                            className={cx(
                              "flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4",
                              "transition hover:border-white/15 hover:bg-white/[0.05]",
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-200">
                                {x.icon}
                              </span>
                              <div>
                                <div className="text-sm font-semibold">
                                  {x.name}
                                </div>
                                <div className="text-xs text-zinc-400/80">
                                  {x.note}
                                </div>
                              </div>
                            </div>
                            <DSIconButton
                              aria-label={`Open ${x.name}`}
                              className={cx(
                                "border border-white/10 bg-white/[0.04] text-white",
                                "hover:border-white/15 hover:bg-white/[0.06]",
                              )}
                              onClick={() => {}}
                            >
                              <ChevronRight className="h-5 w-5" />
                            </DSIconButton>
                          </div>
                        ))}
                      </div>
                    </Card>

                    <Card className="lg:col-span-1">
                      <div className="text-lg font-semibold">Quick Filters</div>
                      <div className="mt-1 text-xs text-zinc-400/80">
                        Jump into your lists
                      </div>
                      <div className="mt-4 space-y-2">
                        {[
                          {
                            label: "Watching",
                            icon: <CheckCircle2 className="h-4 w-4" />,
                          },
                          {
                            label: "Completed",
                            icon: <Star className="h-4 w-4" />,
                          },
                          {
                            label: "On Hold",
                            icon: <Bookmark className="h-4 w-4" />,
                          },
                          {
                            label: "Dropped",
                            icon: <AlertTriangle className="h-4 w-4" />,
                          },
                        ].map((x) => (
                          <button
                            key={x.label}
                            type="button"
                            className={cx(
                              "flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3",
                              "text-left text-sm font-semibold text-zinc-200",
                              "transition hover:border-white/15 hover:bg-white/[0.05]",
                            )}
                          >
                            <span className="inline-flex items-center gap-2">
                              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-200">
                                {x.icon}
                              </span>
                              {x.label}
                            </span>
                            <ChevronRight className="h-4 w-4 opacity-70" />
                          </button>
                        ))}
                      </div>
                    </Card>
                  </div>
                </div>
              ) : null}

              {activeTab === "comics" ? (
                <div className="space-y-4">
                  <SectionTitle
                    icon={
                      <BookOpen
                        className="h-5 w-5 text-fuchsia-300"
                        aria-hidden="true"
                      />
                    }
                    title="Comics Lists"
                    subtitle="Reads, ratings, and saves (mock UI)"
                  />
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-lg font-semibold">
                            Recent Reads
                          </div>
                          <div className="text-xs text-zinc-400/80">
                            Continue where you left off
                          </div>
                        </div>
                        <DSButton
                          onClick={() => {}}
                          className={cx(
                            "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold",
                            "border border-white/10 bg-white/[0.04] text-white",
                            "hover:border-white/15 hover:bg-white/[0.06]",
                          )}
                        >
                          View All{" "}
                          <ChevronRight className="h-4 w-4 opacity-70" />
                        </DSButton>
                      </div>

                      <div className="mt-4 space-y-3">
                        {[
                          {
                            name: "Berserk",
                            note: "Chapter 291 • dark fantasy",
                            icon: <Sparkles className="h-4 w-4" />,
                          },
                          {
                            name: "Vagabond",
                            note: "Chapter 87 • discipline",
                            icon: <TrendingUp className="h-4 w-4" />,
                          },
                          {
                            name: "One Piece",
                            note: "Chapter 1090 • hype",
                            icon: <Zap className="h-4 w-4" />,
                          },
                        ].map((x) => (
                          <div
                            key={x.name}
                            className={cx(
                              "flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4",
                              "transition hover:border-white/15 hover:bg-white/[0.05]",
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-200">
                                {x.icon}
                              </span>
                              <div>
                                <div className="text-sm font-semibold">
                                  {x.name}
                                </div>
                                <div className="text-xs text-zinc-400/80">
                                  {x.note}
                                </div>
                              </div>
                            </div>
                            <DSIconButton
                              aria-label={`Open ${x.name}`}
                              className={cx(
                                "border border-white/10 bg-white/[0.04] text-white",
                                "hover:border-white/15 hover:bg-white/[0.06]",
                              )}
                              onClick={() => {}}
                            >
                              <ChevronRight className="h-5 w-5" />
                            </DSIconButton>
                          </div>
                        ))}
                      </div>
                    </Card>

                    <Card className="lg:col-span-1">
                      <div className="text-lg font-semibold">
                        Your Highlights
                      </div>
                      <div className="mt-1 text-xs text-zinc-400/80">
                        Best picks (mock)
                      </div>
                      <div className="mt-4 space-y-3">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                          <div className="text-xs text-zinc-400/80">
                            Best Comic
                          </div>
                          <div className="mt-1 text-sm font-semibold">
                            {user.comicsStats.bestComic}
                          </div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                          <div className="text-xs text-zinc-400/80">
                            Best Character
                          </div>
                          <div className="mt-1 text-sm font-semibold">
                            {user.comicsStats.bestCharacter}
                          </div>
                        </div>
                        <DSButton
                          onClick={() => {}}
                          className={cx(
                            "w-full rounded-2xl px-4 py-2 text-sm font-semibold",
                            "bg-gradient-to-r from-fuchsia-500/80 via-violet-500/70 to-sky-500/70",
                            "hover:brightness-[1.06]",
                          )}
                        >
                          Create a New List
                        </DSButton>
                      </div>
                    </Card>
                  </div>
                </div>
              ) : null}

              {activeTab === "activities" ? (
                <div className="space-y-4">
                  <SectionTitle
                    icon={
                      <TrendingUp
                        className="h-5 w-5 text-emerald-300"
                        aria-hidden="true"
                      />
                    }
                    title="Activities"
                    subtitle="Signals, updates, and milestones (mock UI)"
                  />
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                      <div className="text-lg font-semibold">Timeline</div>
                      <div className="mt-1 text-xs text-zinc-400/80">
                        Recent actions
                      </div>
                      <div className="mt-4 space-y-3">
                        {[
                          {
                            icon: <Zap className="h-4 w-4 text-amber-300" />,
                            text: "Earned +120 popularity from posts",
                            when: "2h",
                          },
                          {
                            icon: <Swords className="h-4 w-4 text-sky-300" />,
                            text: "Rated 3 anime episodes",
                            when: "1d",
                          },
                          {
                            icon: (
                              <BookOpen className="h-4 w-4 text-fuchsia-300" />
                            ),
                            text: "Added 2 comics to favorites",
                            when: "4d",
                          },
                          {
                            icon: <Users className="h-4 w-4 text-violet-300" />,
                            text: "Followed 5 new creators",
                            when: "6d",
                          },
                        ].map((x, idx) => (
                          <div
                            key={idx}
                            className={cx(
                              "flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4",
                              "transition hover:border-white/15 hover:bg-white/[0.05]",
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                                {x.icon}
                              </span>
                              <div className="text-sm font-semibold">
                                {x.text}
                              </div>
                            </div>
                            <div className="text-xs text-zinc-400">
                              {x.when}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>

                    <Card className="lg:col-span-1">
                      <div className="text-lg font-semibold">Milestones</div>
                      <div className="mt-1 text-xs text-zinc-400/80">
                        Your next unlocks
                      </div>
                      <div className="mt-4 space-y-3">
                        {[
                          { label: "Reach 15K followers", progress: 0.86 },
                          { label: "Hit 100K popularity", progress: 0.99 },
                          { label: "Rate 300 anime", progress: 0.96 },
                        ].map((x) => (
                          <div
                            key={x.label}
                            className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="text-sm font-semibold">
                                {x.label}
                              </div>
                              <div className="text-xs text-zinc-400 tabular-nums">
                                {Math.round(x.progress * 100)}%
                              </div>
                            </div>
                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                              <motion.div
                                className="h-full rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-sky-400"
                                initial={{ width: 0 }}
                                animate={{
                                  width: `${Math.round(x.progress * 100)}%`,
                                }}
                                transition={
                                  reduceMotion
                                    ? { duration: 0 }
                                    : {
                                        duration: 0.9,
                                        ease: [0.22, 1, 0.36, 1],
                                      }
                                }
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                </div>
              ) : null}

              {activeTab === "popularities" ? (
                <div className="space-y-4">
                  <SectionTitle
                    icon={
                      <Zap
                        className="h-5 w-5 text-amber-300"
                        aria-hidden="true"
                      />
                    }
                    title="Popularities"
                    subtitle="Send / receive and track boosts (mock UI)"
                  />
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-lg font-semibold">
                            Recent Popularity Events
                          </div>
                          <div className="text-xs text-zinc-400/80">
                            What moved your score
                          </div>
                        </div>
                        <DSButton
                          onClick={() => {}}
                          className={cx(
                            "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold",
                            "bg-gradient-to-r from-amber-400/80 via-fuchsia-500/70 to-violet-500/70",
                            "hover:brightness-[1.06]",
                          )}
                        >
                          Send Popularity <Zap className="h-4 w-4" />
                        </DSButton>
                      </div>

                      <div className="mt-4 space-y-3">
                        {[
                          {
                            by: "sakura_ink",
                            amount: 50,
                            reason: "Loved your Berserk panel breakdown",
                            when: "3h",
                          },
                          {
                            by: "kage_dev",
                            amount: 20,
                            reason: "Clean profile UI inspiration",
                            when: "1d",
                          },
                          {
                            by: "manga_sensei",
                            amount: 100,
                            reason: "Top comment on chapter discussion",
                            when: "5d",
                          },
                        ].map((x, idx) => (
                          <div
                            key={idx}
                            className={cx(
                              "flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between",
                              "transition hover:border-white/15 hover:bg-white/[0.05]",
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                                <Zap className="h-5 w-5 text-amber-300" />
                              </span>
                              <div>
                                <div className="text-sm font-semibold">
                                  <span className="text-zinc-300">@{x.by}</span>{" "}
                                  <span className="text-zinc-500">sent</span>{" "}
                                  <span className="text-white tabular-nums">
                                    {x.amount}
                                  </span>{" "}
                                  <span className="text-zinc-500">pop</span>
                                </div>
                                <div className="text-xs text-zinc-400/80">
                                  {x.reason}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between gap-3 sm:justify-end">
                              <div className="text-xs text-zinc-400">
                                {x.when}
                              </div>
                              <DSIconButton
                                aria-label="Thank sender"
                                title="Thank"
                                className={cx(
                                  "border border-white/10 bg-white/[0.04] text-white",
                                  "hover:border-white/15 hover:bg-white/[0.06]",
                                )}
                                onClick={() => {}}
                              >
                                <Heart className="h-5 w-5" />
                              </DSIconButton>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>

                    <Card className="lg:col-span-1">
                      <div className="text-lg font-semibold">Send Boost</div>
                      <div className="mt-1 text-xs text-zinc-400/80">
                        Support creators & friends
                      </div>
                      <div className="mt-4 space-y-3">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                          <div className="text-xs text-zinc-400/80">
                            Suggested
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {[10, 25, 50, 100].map((amt) => (
                              <button
                                key={amt}
                                type="button"
                                className={cx(
                                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
                                  "border-white/10 bg-white/[0.04] text-zinc-200",
                                  "hover:border-white/15 hover:bg-white/[0.06]",
                                )}
                                onClick={() => {}}
                              >
                                <Zap className="h-3.5 w-3.5 text-amber-300" />
                                {amt}
                              </button>
                            ))}
                          </div>
                        </div>

                        <DSButton
                          onClick={() => {}}
                          className={cx(
                            "w-full rounded-2xl px-4 py-2 text-sm font-semibold",
                            "bg-gradient-to-r from-amber-400/80 via-fuchsia-500/70 to-violet-500/70",
                            "hover:brightness-[1.06]",
                          )}
                        >
                          Confirm Send
                        </DSButton>

                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs text-zinc-400/90">
                          Tip: popularity boosts are a social signal — use them
                          to reward helpful threads, reviews, and awesome art.
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              ) : null}

              {activeTab === "collections" ? (
                <div className="space-y-4">
                  <SectionTitle
                    icon={
                      <Bookmark
                        className="h-5 w-5 text-violet-300"
                        aria-hidden="true"
                      />
                    }
                    title="Collections"
                    subtitle="Saved threads, lists, and moments (mock UI)"
                  />
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    {[
                      {
                        title: "Top Arcs",
                        desc: "Your most rewatched story arcs",
                        icon: <Sparkles className="h-5 w-5" />,
                      },
                      {
                        title: "Panel Studies",
                        desc: "Composition + lighting references",
                        icon: <BookOpen className="h-5 w-5" />,
                      },
                      {
                        title: "UI Inspirations",
                        desc: "Design notes from anime sites",
                        icon: <TrendingUp className="h-5 w-5" />,
                      },
                    ].map((c) => (
                      <Card key={c.title}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-200">
                              {c.icon}
                            </span>
                            <div>
                              <div className="text-lg font-semibold">
                                {c.title}
                              </div>
                              <div className="text-xs text-zinc-400/80">
                                {c.desc}
                              </div>
                            </div>
                          </div>
                          <DSIconButton
                            aria-label={`Open ${c.title}`}
                            className={cx(
                              "border border-white/10 bg-white/[0.04] text-white",
                              "hover:border-white/15 hover:bg-white/[0.06]",
                            )}
                            onClick={() => {}}
                          >
                            <ChevronRight className="h-5 w-5" />
                          </DSIconButton>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <StatPill
                            icon={
                              <Bookmark
                                className="h-4 w-4 text-zinc-200"
                                aria-hidden="true"
                              />
                            }
                            label="Items"
                            value={
                              <AnimatedNumber
                                value={Math.floor(Math.random() * 120) + 12}
                                className="tabular-nums"
                              />
                            }
                          />
                          <StatPill
                            icon={
                              <Heart
                                className="h-4 w-4 text-fuchsia-200"
                                aria-hidden="true"
                              />
                            }
                            label="Likes"
                            value={
                              <AnimatedNumber
                                value={Math.floor(Math.random() * 5400) + 200}
                                compact
                                className="tabular-nums"
                              />
                            }
                          />
                        </div>

                        <div className="mt-4">
                          <DSButton
                            onClick={() => {}}
                            className={cx(
                              "w-full rounded-2xl px-4 py-2 text-sm font-semibold",
                              "border border-white/10 bg-white/[0.04] text-white",
                              "hover:border-white/15 hover:bg-white/[0.06]",
                            )}
                          >
                            Open Collection
                          </DSButton>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Fallback (should never show) */}
              {![
                "general",
                "anime",
                "comics",
                "activities",
                "popularities",
                "collections",
              ].includes(activeTab) ? (
                <Card>
                  <div className="flex items-center gap-3">
                    <AlertTriangle
                      className="h-5 w-5 text-amber-300"
                      aria-hidden="true"
                    />
                    <div>
                      <div className="text-sm font-semibold">Unknown tab</div>
                      <div className="text-xs text-zinc-400/80">
                        This view is not implemented.
                      </div>
                    </div>
                  </div>
                </Card>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer hint */}
      <footer className="mx-auto w-full max-w-6xl px-4 pb-10 text-center text-xs text-zinc-500 sm:px-6">
        <span className="inline-flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-300/80" aria-hidden="true" />
          Fanaara Profile • production-grade mock UI (single file)
        </span>
      </footer>

      {/* Utility: hide scrollbars for horizontal tabs */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
