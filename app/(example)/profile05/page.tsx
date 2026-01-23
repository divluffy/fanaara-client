"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Flag,
  Share2,
  Bell,
  Gift,
  MessageCircle,
  Sparkles,
  Heart,
  Star,
  ThumbsUp,
  MessageSquareText,
  Eye,
  Camera,
  Images,
  ListChecks,
  Bookmark,
  SlidersHorizontal,
  Flame,
} from "lucide-react";

import { Button } from "@/design/Button";
import { IconButton } from "@/design/IconButton";
import { Avatar } from "@/design/Avatar";

/**
 * ------------------------------------------------------------
 * Mock data (provided + extended)
 * ------------------------------------------------------------
 */

const RanksBorders = { new_otaku: "/borders/wolf.png" } as const;

const UserData = {
  id: "1",
  username: "dev_luffy",
  first_name: "ibrahim",
  last_name: "jomaa",
  country: "ps",
  dob: new Date("25/08/2000"),
  gender: "male",
  rank: "new_otaku",
  avatar: { md: "https://images3.alphacoders.com/681/thumbbig-681016.webp" },
  bg: { lg: "https://media2.giphy.com/media/byTVPe9Cz5RM4/200w.webp" },
  bio:
    "Building Fanaara — a home for anime & comics fans. I ship fast, obsess over details, and collect stories like artifacts.",
  counts: {
    followers: 12450,
    following: 392,
    posts: 87,
    popularity: 2680,
  },
  meta: {
    locationLabel: "Palestine (PS)",
    joinedAt: new Date("2023-03-15"),
    status: "Online",
  },
  anime: {
    watched: 412,
    episodes: 9932,
    favorites: 39,
    timeSpentHours: 2430,
    currentSeason: 7,
  },
  comics: {
    read: 188,
    chapters: 11240,
    favorites: 21,
    timeSpentHours: 1210,
    currentRuns: 5,
  },
};

type TabKey =
  | "general"
  | "popularities"
  | "gallery"
  | "swipes"
  | "lists"
  | "favorites"
  | "ratings"
  | "reviews";

const TABS: Array<{ key: TabKey; label: string; icon: React.ReactNode }> = [
  { key: "general", label: "General/About", icon: <SlidersHorizontal className="h-4 w-4" /> },
  { key: "popularities", label: "Popularities", icon: <Flame className="h-4 w-4" /> },
  { key: "gallery", label: "Gallery", icon: <Images className="h-4 w-4" /> },
  { key: "swipes", label: "Swipes", icon: <Sparkles className="h-4 w-4" /> },
  { key: "lists", label: "Lists", icon: <ListChecks className="h-4 w-4" /> },
  { key: "favorites", label: "Favorites", icon: <Bookmark className="h-4 w-4" /> },
  { key: "ratings", label: "Ratings", icon: <Star className="h-4 w-4" /> },
  { key: "reviews", label: "Reviews", icon: <MessageSquareText className="h-4 w-4" /> },
];

type PostTag = "Anime" | "Comics" | "Theory" | "Update" | "Art";
type Post = {
  id: string;
  tag: PostTag;
  title: string;
  excerpt: string;
  createdAt: Date;
  stats: { likes: number; comments: number; views: number };
};

const MOCK_POSTS: Post[] = [
  {
    id: "p1",
    tag: "Anime",
    title: "I finally finished Vinland Saga S2 (no spoilers)",
    excerpt:
      "It’s rare to see growth written this patiently. The way the season reframes strength is just… chef’s kiss.",
    createdAt: new Date("2025-11-02"),
    stats: { likes: 1280, comments: 164, views: 21940 },
  },
  {
    id: "p2",
    tag: "Comics",
    title: "Paneling trick that makes fights feel faster",
    excerpt:
      "If you want speed without chaos, try alternating tight close-ups with one wide ‘anchor’ panel every 3–4 beats.",
    createdAt: new Date("2025-10-18"),
    stats: { likes: 942, comments: 88, views: 16210 },
  },
  {
    id: "p3",
    tag: "Update",
    title: "Fanaara profile revamp: tabs + neo cards",
    excerpt:
      "New profile layout is landing. Cleaner hierarchy, stronger contrast, and motion that feels ‘alive’ without noise.",
    createdAt: new Date("2025-12-12"),
    stats: { likes: 1632, comments: 203, views: 30112 },
  },
  {
    id: "p4",
    tag: "Theory",
    title: "Why “found family” arcs hit harder in shounen",
    excerpt:
      "Because the ‘team’ is a narrative cheat code: it externalizes the protagonist’s inner conflict into relationships.",
    createdAt: new Date("2025-09-01"),
    stats: { likes: 711, comments: 59, views: 12440 },
  },
];

/**
 * ------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------
 */

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatCompact(n: number) {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return `${n}`;
}

function formatDate(d: Date) {
  try {
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
  } catch {
    return String(d);
  }
}

function safeRankLabel(rank: keyof typeof RanksBorders) {
  const map: Record<string, string> = {
    new_otaku: "New Otaku",
  };
  return map[rank] ?? rank.replace(/_/g, " ");
}

function countryFlagEmoji(code: string) {
  const cc = (code || "US").toUpperCase();
  if (cc.length !== 2) return "🏳️";
  const A = 65;
  const chars = [...cc].map((c) => 0x1f1e6 + (c.charCodeAt(0) - A));
  return String.fromCodePoint(...chars);
}

function badgeColorForTag(tag: PostTag) {
  // All use token-based classes; vary with opacity only.
  // (Kept subtle to align with theme tokens.)
  switch (tag) {
    case "Anime":
      return "bg-accent-soft text-accent border-border-subtle";
    case "Comics":
      return "bg-accent-soft text-accent border-border-subtle";
    case "Theory":
      return "bg-accent-soft text-accent border-border-subtle";
    case "Update":
      return "bg-accent-soft text-accent border-border-subtle";
    case "Art":
      return "bg-accent-soft text-accent border-border-subtle";
    default:
      return "bg-accent-soft text-accent border-border-subtle";
  }
}

/**
 * ------------------------------------------------------------
 * Small motion wrappers (Buttons & Cards)
 * ------------------------------------------------------------
 */

function MotionPress({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
    >
      {children}
    </motion.div>
  );
}

function NeoCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border-strong bg-card",
        // “Neo” edge + subtle glow on hover using token-ish shadows
        "shadow-[0_0_0_1px_rgba(0,0,0,0.0)] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_18px_60px_rgba(0,0,0,0.25)]",
        "ring-1 ring-transparent hover:ring-border-subtle",
        className
      )}
    >
      {/* soft glow layer */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 hover:opacity-100">
        <div className="absolute -inset-24 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_55%)]" />
      </div>
      <div className="relative p-5 sm:p-6">{children}</div>
    </motion.div>
  );
}

/**
 * ------------------------------------------------------------
 * Main Page Component
 * ------------------------------------------------------------
 */

export default function FanaaraProfilePage() {
  const [activeTab, setActiveTab] = React.useState<TabKey>("general");
  const [isFollowing, setIsFollowing] = React.useState(false);
  const [notifCount, setNotifCount] = React.useState(3);

  const rankLabel = safeRankLabel(UserData.rank as keyof typeof RanksBorders);
  const borderSrc = RanksBorders[UserData.rank as keyof typeof RanksBorders] ?? RanksBorders.new_otaku;

  return (
    <div className="min-h-dvh bg-background text-foreground-strong">
      {/* Header */}
      <section className="relative">
        {/* Cover */}
        <div className="relative h-[320px] w-full sm:h-[360px] lg:h-[420px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={UserData.bg.lg}
            alt="Profile cover"
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />

          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/65" />
          <div className="absolute inset-0 backdrop-blur-[1px]" />

          {/* Top controls */}
          <div className="absolute left-4 right-4 top-4 flex items-center justify-between sm:left-6 sm:right-6 sm:top-6">
            <MotionPress>
              <IconButton
                aria-label="Report"
                variant="soft"
                className={cn(
                  "border border-border-subtle bg-background-elevated/40 backdrop-blur-md",
                  "hover:bg-background-elevated/60"
                )}
                onClick={() => {
                  // mock
                  // eslint-disable-next-line no-alert
                  alert("Report flow (mock)");
                }}
              >
                <Flag className="h-5 w-5" />
              </IconButton>
            </MotionPress>

            <MotionPress>
              <IconButton
                aria-label="Share"
                variant="soft"
                className={cn(
                  "border border-border-subtle bg-background-elevated/40 backdrop-blur-md",
                  "hover:bg-background-elevated/60"
                )}
                onClick={() => {
                  // mock
                  // eslint-disable-next-line no-alert
                  alert("Share sheet (mock)");
                }}
              >
                <Share2 className="h-5 w-5" />
              </IconButton>
            </MotionPress>
          </div>

          {/* Center stack */}
          <div className="absolute inset-x-0 bottom-0 translate-y-1/2 px-4 sm:px-6">
            <div className="mx-auto w-full max-w-6xl">
              <div className="flex flex-col items-center text-center">
                {/* Avatar with border */}
                <div className="relative">
                  {/* Rank border image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={borderSrc}
                    alt={`${rankLabel} border`}
                    className="absolute -inset-3 h-[124px] w-[124px] select-none object-contain sm:-inset-4 sm:h-[144px] sm:w-[144px]"
                    draggable={false}
                    loading="lazy"
                  />

                  <div className="relative rounded-full bg-background-elevated p-1.5 sm:p-2">
                    <Avatar
                      src={UserData.avatar.md}
                      alt={`${UserData.first_name} ${UserData.last_name}`}
                      className="h-20 w-20 sm:h-24 sm:w-24"
                    />
                  </div>

                  {/* Rank badge */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                    <div
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border border-border-strong bg-background-elevated px-3 py-1",
                        "text-xs font-medium text-foreground-strong shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
                      )}
                    >
                      <Sparkles className="h-3.5 w-3.5 text-accent" />
                      <span className="text-accent">{rankLabel}</span>
                    </div>
                  </div>
                </div>

                {/* Name + handle */}
                <div className="mt-6">
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
                      {UserData.first_name} {UserData.last_name}
                    </h1>
                    <span className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-background-elevated/40 px-3 py-1 text-xs text-foreground-muted backdrop-blur-md">
                      <span className="text-base leading-none">{countryFlagEmoji(UserData.country)}</span>
                      {UserData.meta.status}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-foreground-muted sm:text-base">@{UserData.username}</p>
                </div>

                {/* Actions row */}
                <div className="mt-5 w-full">
                  <div
                    className={cn(
                      "mx-auto flex w-full max-w-3xl flex-wrap items-center justify-center gap-2 sm:gap-3"
                    )}
                  >
                    <MotionPress>
                      <Button
                        variant="default"
                        className={cn(
                          "h-10 rounded-xl px-5",
                          "bg-gradient-to-r from-accent to-accent/70 text-foreground-strong",
                          "hover:opacity-95 active:opacity-90"
                        )}
                        onClick={() => setIsFollowing((v) => !v)}
                      >
                        {isFollowing ? "Following" : "Follow"}
                      </Button>
                    </MotionPress>

                    <MotionPress>
                      <Button
                        variant="soft"
                        className="h-10 rounded-xl px-5"
                        onClick={() => {
                          // mock: increment popularity
                          // eslint-disable-next-line no-alert
                          alert("Send Popularity (mock)");
                        }}
                      >
                        <Flame className="mr-2 h-4 w-4 text-accent" />
                        Send Popularity
                      </Button>
                    </MotionPress>

                    <MotionPress>
                      <div className="relative">
                        <IconButton
                          aria-label="Notifications"
                          variant="soft"
                          className="h-10 w-10 rounded-xl"
                          onClick={() => setNotifCount(0)}
                        >
                          <Bell className="h-5 w-5" />
                        </IconButton>

                        {notifCount > 0 && (
                          <span
                            className={cn(
                              "absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full",
                              "border border-border-strong bg-accent-soft px-1 text-[10px] font-semibold text-accent"
                            )}
                          >
                            {notifCount > 99 ? "99+" : notifCount}
                          </span>
                        )}
                      </div>
                    </MotionPress>

                    <MotionPress>
                      <Button
                        variant="outline"
                        className="h-10 rounded-xl px-5"
                        onClick={() => {
                          // eslint-disable-next-line no-alert
                          alert("Open chat (mock)");
                        }}
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Chat
                      </Button>
                    </MotionPress>

                    <MotionPress>
                      <IconButton
                        aria-label="Gift"
                        variant="soft"
                        className="h-10 w-10 rounded-xl"
                        onClick={() => {
                          // eslint-disable-next-line no-alert
                          alert("Send gift (mock)");
                        }}
                      >
                        <Gift className="h-5 w-5" />
                      </IconButton>
                    </MotionPress>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs row */}
        <div className="mt-[88px] sm:mt-[98px]">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <div
              className={cn(
                "rounded-2xl border border-border-strong bg-background-elevated",
                "shadow-[0_14px_50px_rgba(0,0,0,0.22)]"
              )}
            >
              <div className="relative overflow-x-auto">
                <div className="flex min-w-max items-center gap-1 p-2">
                  {TABS.map((t) => {
                    const active = t.key === activeTab;
                    return (
                      <button
                        key={t.key}
                        onClick={() => setActiveTab(t.key)}
                        className={cn(
                          "relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition",
                          "text-foreground-muted hover:text-foreground-strong",
                          active && "text-foreground-strong"
                        )}
                      >
                        <span className="opacity-90">{t.icon}</span>
                        <span className="whitespace-nowrap">{t.label}</span>

                        {active && (
                          <motion.div
                            layoutId="activeTabUnderline"
                            className={cn(
                              "absolute inset-x-2 -bottom-1 h-0.5 rounded-full",
                              "bg-accent"
                            )}
                            transition={{ type: "spring", stiffness: 520, damping: 38 }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {activeTab === "general" ? (
              <GeneralTab />
            ) : (
              <PlaceholderTab tabKey={activeTab} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

/**
 * ------------------------------------------------------------
 * Tab Panels
 * ------------------------------------------------------------
 */

function GeneralTab() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Primary cards grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-3">
        <NeoCard className="lg:col-span-1">
          <CardHeader
            title="About"
            subtitle="Bio, meta, and quick counts"
            icon={<Sparkles className="h-5 w-5 text-accent" />}
          />
          <p className="mt-4 text-sm leading-relaxed text-foreground-muted">{UserData.bio}</p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <MiniMeta label="Location" value={UserData.meta.locationLabel} />
            <MiniMeta label="Joined" value={formatDate(UserData.meta.joinedAt)} />
            <MiniMeta label="Gender" value={UserData.gender} />
            <MiniMeta label="DOB" value={formatDate(UserData.dob)} />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl border border-border-subtle bg-background p-4">
            <CountStat label="Followers" value={formatCompact(UserData.counts.followers)} />
            <CountStat label="Following" value={formatCompact(UserData.counts.following)} />
            <CountStat label="Posts" value={formatCompact(UserData.counts.posts)} />
            <CountStat label="Popularity" value={formatCompact(UserData.counts.popularity)} />
          </div>
        </NeoCard>

        <NeoCard className="lg:col-span-1">
          <CardHeader
            title="Anime"
            subtitle="Your watch journey"
            icon={<Camera className="h-5 w-5 text-accent" />}
          />

          <div className="mt-5 grid grid-cols-2 gap-3">
            <StatPill icon={<Eye className="h-4 w-4" />} label="Watched" value={formatCompact(UserData.anime.watched)} />
            <StatPill
              icon={<Sparkles className="h-4 w-4" />}
              label="Episodes"
              value={formatCompact(UserData.anime.episodes)}
            />
            <StatPill icon={<Heart className="h-4 w-4" />} label="Favorites" value={formatCompact(UserData.anime.favorites)} />
            <StatPill
              icon={<Flame className="h-4 w-4 text-accent" />}
              label="Hours"
              value={formatCompact(UserData.anime.timeSpentHours)}
            />
          </div>

          <div className="mt-5 rounded-xl border border-border-subtle bg-background p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Currently watching</p>
                <p className="mt-1 text-sm text-foreground-muted">
                  {UserData.anime.currentSeason} shows this season
                </p>
              </div>
              <MotionPress>
                <Button
                  variant="soft"
                  className="rounded-xl"
                  onClick={() => {
                    // eslint-disable-next-line no-alert
                    alert("View Anime List (mock)");
                  }}
                >
                  View Anime List
                </Button>
              </MotionPress>
            </div>
          </div>
        </NeoCard>

        <NeoCard className="lg:col-span-1">
          <CardHeader
            title="Comics"
            subtitle="Manga, manhwa, and more"
            icon={<Images className="h-5 w-5 text-accent" />}
          />

          <div className="mt-5 grid grid-cols-2 gap-3">
            <StatPill icon={<Eye className="h-4 w-4" />} label="Read" value={formatCompact(UserData.comics.read)} />
            <StatPill
              icon={<Sparkles className="h-4 w-4" />}
              label="Chapters"
              value={formatCompact(UserData.comics.chapters)}
            />
            <StatPill icon={<Heart className="h-4 w-4" />} label="Favorites" value={formatCompact(UserData.comics.favorites)} />
            <StatPill
              icon={<Flame className="h-4 w-4 text-accent" />}
              label="Hours"
              value={formatCompact(UserData.comics.timeSpentHours)}
            />
          </div>

          <div className="mt-5 rounded-xl border border-border-subtle bg-background p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Current runs</p>
                <p className="mt-1 text-sm text-foreground-muted">
                  Following {UserData.comics.currentRuns} ongoing series
                </p>
              </div>
              <MotionPress>
                <Button
                  variant="soft"
                  className="rounded-xl"
                  onClick={() => {
                    // eslint-disable-next-line no-alert
                    alert("View Comics List (mock)");
                  }}
                >
                  View Comics List
                </Button>
              </MotionPress>
            </div>
          </div>
        </NeoCard>
      </div>

      {/* Posts feed */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight sm:text-xl">Posts</h2>
            <p className="mt-1 text-sm text-foreground-muted">Latest thoughts, updates, and mini-reviews</p>
          </div>

          <MotionPress className="hidden sm:block">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => {
                // eslint-disable-next-line no-alert
                alert("Create post (mock)");
              }}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              New Post
            </Button>
          </MotionPress>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {MOCK_POSTS.map((p) => (
            <NeoCard key={p.id} className="group">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
                        badgeColorForTag(p.tag)
                      )}
                    >
                      {p.tag}
                    </span>
                    <span className="text-xs text-foreground-muted">{formatDate(p.createdAt)}</span>
                  </div>

                  <h3 className="mt-3 line-clamp-2 text-base font-semibold tracking-tight sm:text-lg">
                    {p.title}
                  </h3>

                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-foreground-muted">
                    {p.excerpt}
                  </p>
                </div>

                <MotionPress className="shrink-0">
                  <IconButton
                    aria-label="React"
                    variant="soft"
                    className="h-10 w-10 rounded-xl"
                    onClick={() => {
                      // eslint-disable-next-line no-alert
                      alert("Reacted (mock)");
                    }}
                  >
                    <ThumbsUp className="h-5 w-5" />
                  </IconButton>
                </MotionPress>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-foreground-muted">
                <StatIcon icon={<Heart className="h-4 w-4" />} value={formatCompact(p.stats.likes)} />
                <StatIcon icon={<MessageSquareText className="h-4 w-4" />} value={formatCompact(p.stats.comments)} />
                <StatIcon icon={<Eye className="h-4 w-4" />} value={formatCompact(p.stats.views)} />
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <MotionPress>
                  <Button
                    variant="soft"
                    className="h-9 rounded-xl"
                    onClick={() => {
                      // eslint-disable-next-line no-alert
                      alert("Open post (mock)");
                    }}
                  >
                    Open
                  </Button>
                </MotionPress>
                <MotionPress>
                  <Button
                    variant="outline"
                    className="h-9 rounded-xl"
                    onClick={() => {
                      // eslint-disable-next-line no-alert
                      alert("Share post (mock)");
                    }}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </MotionPress>
              </div>
            </NeoCard>
          ))}
        </div>

        <MotionPress className="sm:hidden">
          <Button
            variant="outline"
            className="mt-2 w-full rounded-xl"
            onClick={() => {
              // eslint-disable-next-line no-alert
              alert("Create post (mock)");
            }}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </MotionPress>
      </div>
    </div>
  );
}

function PlaceholderTab({ tabKey }: { tabKey: TabKey }) {
  const tab = TABS.find((t) => t.key === tabKey);
  return (
    <div className="space-y-4">
      <NeoCard>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border-subtle bg-background">
            {tab?.icon ?? <Sparkles className="h-5 w-5 text-accent" />}
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">{tab?.label ?? "Tab"}</h2>
            <p className="mt-1 text-sm text-foreground-muted">
              This panel is a placeholder. Wire it to real data when ready.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <InfoChip label="Coming soon" value="🚧" />
          <InfoChip label="Design ready" value="✅" />
          <InfoChip label="Motion" value="✨" />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <MotionPress>
            <Button
              variant="soft"
              className="rounded-xl"
              onClick={() => {
                // eslint-disable-next-line no-alert
                alert("Mock action (soft)");
              }}
            >
              Primary action
            </Button>
          </MotionPress>
          <MotionPress>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => {
                // eslint-disable-next-line no-alert
                alert("Mock action (outline)");
              }}
            >
              Secondary
            </Button>
          </MotionPress>
        </div>
      </NeoCard>
    </div>
  );
}

/**
 * ------------------------------------------------------------
 * UI bits
 * ------------------------------------------------------------
 */

function CardHeader({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h3 className="text-base font-semibold tracking-tight sm:text-lg">{title}</h3>
        {subtitle ? <p className="mt-1 text-sm text-foreground-muted">{subtitle}</p> : null}
      </div>
      {icon ? (
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border-subtle bg-background">
          {icon}
        </div>
      ) : null}
    </div>
  );
}

function MiniMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-background p-3">
      <p className="text-xs font-medium text-foreground-muted">{label}</p>
      <p className="mt-1 line-clamp-1 text-sm font-semibold text-foreground-strong">{value}</p>
    </div>
  );
}

function CountStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-background p-3">
      <p className="text-xs font-medium text-foreground-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function StatPill({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border-subtle bg-background p-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-subtle bg-background-elevated text-foreground-strong">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-foreground-muted">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-foreground-strong">{value}</p>
      </div>
    </div>
  );
}

function StatIcon({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-background px-3 py-1.5">
      <span className="text-foreground-muted">{icon}</span>
      <span className="text-sm font-medium text-foreground-strong">{value}</span>
    </div>
  );
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-background p-4">
      <p className="text-xs font-medium text-foreground-muted">{label}</p>
      <p className="mt-2 text-base font-semibold">{value}</p>
    </div>
  );
}
