"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Flag,
  Gift,
  MessageCircle,
  Share2,
  Sparkles,
  UserRound,
  GalleryHorizontal,
  BadgeCheck,
  FileText,
} from "lucide-react";

// ✅ Design system components (adjust import paths to match your repo)
import { Button } from "@/design/Button";
import { IconButton } from "@/design/IconButton";
import { Avatar } from "@/design/Avatar";

type RankKey = "Rookie" | "Pro" | "Elite" | "Legend";

type Post = {
  id: string;
  title: string;
  excerpt: string;
  tags: string[];
  createdAt: string;
  likes: number;
  comments: number;
};

type UserData = {
  id: string;
  fullName: string;
  username: string;
  avatarUrl: string;
  headerImageUrl: string;
  rank: RankKey;

  bio: string;
  location?: string;
  favoriteGenres: string[];

  counts: {
    followers: number;
    following: number;
  };

  stats: {
    popularity: number; // 0..100
    posts: number;
    collections: number;
    badges: number;
  };

  posts: Post[];
};

const RanksBorders: Record<
  RankKey,
  { ring: string; chip: string; label: string }
> = {
  Rookie: {
    ring: "ring-muted-foreground/25",
    chip: "bg-muted text-foreground",
    label: "Rookie",
  },
  Pro: {
    ring: "ring-primary/30",
    chip: "bg-primary/10 text-foreground",
    label: "Pro",
  },
  Elite: {
    ring: "ring-secondary/35",
    chip: "bg-secondary/15 text-foreground",
    label: "Elite",
  },
  Legend: {
    ring: "ring-accent/35",
    chip: "bg-accent/15 text-foreground",
    label: "Legend",
  },
};

const user: UserData = {
  id: "u_1024",
  fullName: "Sana Akiyama",
  username: "sana.aki",
  avatarUrl:
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80",
  headerImageUrl:
    "https://images.unsplash.com/photo-1520975958225-1c6bba6c5d2a?auto=format&fit=crop&w=2400&q=80",
  rank: "Elite",

  bio: "Editorial-minded anime nerd. I collect panel-perfect moments, clean character arcs, and underrated OSTs. Building my own canon—one post at a time.",
  location: "Jerusalem",
  favoriteGenres: ["Slice of Life", "Seinen", "Fantasy", "Sports"],

  counts: {
    followers: 18342,
    following: 312,
  },

  stats: {
    popularity: 87,
    posts: 128,
    collections: 14,
    badges: 9,
  },

  posts: [
    {
      id: "p_1",
      title: "When quiet scenes hit the hardest",
      excerpt:
        "A tiny gesture, a half-finished sentence, and suddenly the whole arc lands. Here are 5 moments that did it for me.",
      tags: ["analysis", "moments", "writing"],
      createdAt: "2d ago",
      likes: 1240,
      comments: 86,
    },
    {
      id: "p_2",
      title: "Best openings for late-night focus",
      excerpt:
        "Minimal lyrics, strong rhythm, no distractions. My loop list when I’m deep in a build or a binge.",
      tags: ["music", "ops", "playlist"],
      createdAt: "1w ago",
      likes: 980,
      comments: 41,
    },
    {
      id: "p_3",
      title: "Panel composition: why this page works",
      excerpt:
        "Negative space, implied motion, and a single focal point. Breaking down a page that’s quietly perfect.",
      tags: ["manga", "composition", "art"],
      createdAt: "2w ago",
      likes: 1523,
      comments: 103,
    },
  ],
};

const tabs = [
  { key: "about", label: "About", icon: UserRound },
  { key: "posts", label: "Posts", icon: FileText },
  { key: "collections", label: "Collections", icon: GalleryHorizontal },
  { key: "badges", label: "Badges", icon: BadgeCheck },
] as const;

type TabKey = (typeof tabs)[number]["key"];

function formatCompact(n: number) {
  // Minimal + safe compact format
  if (n >= 1_000_000) return `${Math.round((n / 1_000_000) * 10) / 10}M`;
  if (n >= 10_000) return `${Math.round(n / 1_000) }K`;
  if (n >= 1_000) return `${Math.round((n / 1_000) * 10) / 10}K`;
  return `${n}`;
}

function Card({
  className = "",
  children,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={[
        "rounded-2xl border border-border/60 bg-card/60 shadow-sm",
        "backdrop-blur-xl",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  message,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  message: string;
}) {
  return (
    <Card className="p-7">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl border border-border/60 bg-muted/40 p-3">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <div className="text-base font-semibold tracking-tight">{title}</div>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {message}
          </p>
        </div>
      </div>
    </Card>
  );
}

export default function Page() {
  const [activeTab, setActiveTab] = React.useState<TabKey>("about");
  const rankUI = RanksBorders[user.rank];

  const headerStagger = {
    hidden: { opacity: 0, y: 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.08 },
    },
  };

  const headerItem = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  };

  const panelMotion = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
    exit: { opacity: 0, y: 8, transition: { duration: 0.2, ease: "easeIn" } },
  };

  const list = {
    hidden: { opacity: 1 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.05 },
    },
  };

  const listItem = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  };

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* Header */}
      <header className="relative">
        <div
          className="h-[320px] w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${user.headerImageUrl})` }}
        />
        {/* Strong overlay to keep image subtle */}
        <div className="absolute inset-0 bg-background/70 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/30 to-background" />

        {/* Report / Share (top corners) */}
        <div className="absolute inset-x-0 top-0 z-10">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <IconButton aria-label="Report user" variant="ghost">
              <Flag className="h-4 w-4" />
            </IconButton>

            <IconButton aria-label="Share profile" variant="ghost">
              <Share2 className="h-4 w-4" />
            </IconButton>
          </div>
        </div>

        {/* Overlapping glass card */}
        <div className="relative z-10">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={headerStagger}
              initial="hidden"
              animate="show"
              className="-mt-24 overflow-hidden rounded-3xl border border-border/60 bg-background/60 shadow-sm backdrop-blur-2xl"
            >
              {/* Top section */}
              <div className="p-6 sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <motion.div variants={headerItem} className="flex items-start gap-4 sm:gap-5">
                    {/* Avatar + rank */}
                    <div className="shrink-0">
                      <div className={["rounded-full ring-2 ring-offset-2 ring-offset-background", rankUI.ring].join(" ")}>
                        {/* Avatar (design system) */}
                        <Avatar
                          src={user.avatarUrl}
                          alt={user.fullName}
                          className="h-16 w-16 sm:h-18 sm:w-18"
                        />
                      </div>

                      <div className="mt-3 inline-flex items-center gap-2">
                        <span
                          className={[
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                            "border border-border/60 backdrop-blur",
                            rankUI.chip,
                          ].join(" ")}
                        >
                          <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                          {rankUI.label}
                        </span>
                      </div>
                    </div>

                    {/* Name + username */}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                          {user.fullName}
                        </h1>
                        <div className="text-sm text-muted-foreground">
                          @{user.username}
                        </div>
                      </div>

                      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                        {user.bio}
                      </p>

                      {/* Compact stats row */}
                      <div className="mt-5 flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-0 overflow-hidden rounded-2xl border border-border/60 bg-card/40 backdrop-blur">
                          <StatCell
                            label="Followers"
                            value={formatCompact(user.counts.followers)}
                          />
                          <DividerV />
                          <StatCell
                            label="Following"
                            value={formatCompact(user.counts.following)}
                          />
                          <DividerV />
                          <StatCell
                            label="Popularity"
                            value={`${user.stats.popularity}`}
                            suffix="/100"
                          />
                        </div>

                        {user.location ? (
                          <span className="text-xs text-muted-foreground">
                            • {user.location}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </motion.div>

                  {/* Actions */}
                  <motion.div
                    variants={headerItem}
                    className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Button>
                        Follow
                      </Button>

                      <Button variant="secondary" className="gap-2">
                        <Sparkles className="h-4 w-4" />
                        Popularity
                      </Button>

                      <IconButton aria-label="Chat" variant="outline">
                        <MessageCircle className="h-4 w-4" />
                      </IconButton>

                      <IconButton aria-label="Notifications" variant="outline">
                        <Bell className="h-4 w-4" />
                      </IconButton>

                      <IconButton aria-label="Send gift" variant="outline">
                        <Gift className="h-4 w-4" />
                      </IconButton>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-t border-border/60">
                <div className="px-4 sm:px-8">
                  <nav className="relative flex gap-6 overflow-x-auto py-3">
                    {tabs.map((t) => {
                      const isActive = activeTab === t.key;
                      const Icon = t.icon;
                      return (
                        <button
                          key={t.key}
                          onClick={() => setActiveTab(t.key)}
                          className={[
                            "relative inline-flex shrink-0 items-center gap-2 py-2 text-sm",
                            "text-muted-foreground hover:text-foreground transition-colors",
                            isActive ? "text-foreground" : "",
                          ].join(" ")}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="font-medium">{t.label}</span>

                          {isActive ? (
                            <motion.span
                              layoutId="inkbar"
                              className="absolute inset-x-0 -bottom-3 h-[2px] rounded-full bg-foreground"
                              transition={{ type: "spring", stiffness: 500, damping: 40 }}
                            />
                          ) : null}
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </div>
            </motion.div>

            {/* Panel */}
            <div className="pb-16 pt-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  variants={panelMotion}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                >
                  {activeTab === "about" ? (
                    <div className="grid gap-5 lg:grid-cols-12">
                      {/* About cards */}
                      <div className="grid gap-5 lg:col-span-5">
                        <Card className="p-7">
                          <div className="text-sm font-semibold tracking-tight">
                            Editorial profile
                          </div>
                          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            Curated tastes, clean write-ups, and a preference for
                            subtle character work over loud twists.
                          </p>

                          <div className="mt-5 flex flex-wrap gap-2">
                            {user.favoriteGenres.map((g) => (
                              <span
                                key={g}
                                className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground"
                              >
                                {g}
                              </span>
                            ))}
                          </div>
                        </Card>

                        <Card className="p-7">
                          <div className="text-sm font-semibold tracking-tight">
                            Quick metrics
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-3">
                            <MiniMetric label="Posts" value={user.stats.posts} />
                            <MiniMetric
                              label="Collections"
                              value={user.stats.collections}
                            />
                            <MiniMetric label="Badges" value={user.stats.badges} />
                            <MiniMetric
                              label="Popularity"
                              value={user.stats.popularity}
                              suffix="/100"
                            />
                          </div>

                          <div className="mt-5 rounded-2xl border border-border/60 bg-muted/30 p-4">
                            <div className="text-xs text-muted-foreground">
                              Popularity index
                            </div>
                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full bg-foreground/70"
                                style={{ width: `${user.stats.popularity}%` }}
                              />
                            </div>
                          </div>
                        </Card>

                        <Card className="p-7">
                          <div className="text-sm font-semibold tracking-tight">
                            Pinned note
                          </div>
                          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            I’ll reply faster to thoughtful comments than short reactions.
                            If you’re sharing spoilers, tag them.
                          </p>
                        </Card>
                      </div>

                      {/* Posts feed */}
                      <div className="lg:col-span-7">
                        <div className="mb-3 flex items-end justify-between">
                          <div>
                            <div className="text-base font-semibold tracking-tight">
                              Recent posts
                            </div>
                            <div className="mt-1 text-sm text-muted-foreground">
                              Fresh notes and breakdowns from @{user.username}
                            </div>
                          </div>

                          <Button variant="outline">View all</Button>
                        </div>

                        <motion.ul
                          variants={list}
                          initial="hidden"
                          animate="show"
                          className="grid gap-4"
                        >
                          {user.posts.map((p) => (
                            <motion.li key={p.id} variants={listItem}>
                              <Card className="p-6">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="min-w-0">
                                    <div className="text-lg font-semibold tracking-tight">
                                      {p.title}
                                    </div>
                                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                      {p.excerpt}
                                    </p>

                                    <div className="mt-4 flex flex-wrap items-center gap-2">
                                      {p.tags.map((t) => (
                                        <span
                                          key={t}
                                          className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground"
                                        >
                                          #{t}
                                        </span>
                                      ))}
                                      <span className="ml-1 text-xs text-muted-foreground">
                                        • {p.createdAt}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="shrink-0 text-right">
                                    <div className="text-xs text-muted-foreground">
                                      Engagement
                                    </div>
                                    <div className="mt-2 flex items-center justify-end gap-3 text-sm">
                                      <span className="text-muted-foreground">
                                        ♥ <span className="text-foreground">{formatCompact(p.likes)}</span>
                                      </span>
                                      <span className="text-muted-foreground">
                                        💬 <span className="text-foreground">{formatCompact(p.comments)}</span>
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            </motion.li>
                          ))}
                        </motion.ul>
                      </div>
                    </div>
                  ) : activeTab === "posts" ? (
                    <EmptyState
                      icon={FileText}
                      title="No extra posts here (yet)"
                      message="This tab can host filtered posts, pinned threads, or long-form essays. For now, check the About feed."
                    />
                  ) : activeTab === "collections" ? (
                    <EmptyState
                      icon={GalleryHorizontal}
                      title="Collections are empty"
                      message="When Sana starts curating arcs, panels, and watchlists, they’ll show up here."
                    />
                  ) : (
                    <EmptyState
                      icon={BadgeCheck}
                      title="Badges coming soon"
                      message="Badges will appear here once achievements and events are enabled for this profile."
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

function StatCell({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string;
  suffix?: string;
}) {
  return (
    <div className="px-4 py-3">
      <div className="text-[11px] leading-none text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <div className="text-sm font-semibold tracking-tight">{value}</div>
        {suffix ? (
          <div className="text-[11px] text-muted-foreground">{suffix}</div>
        ) : null}
      </div>
    </div>
  );
}

function DividerV() {
  return <div className="h-10 w-px bg-border/60" aria-hidden="true" />;
}

function MiniMetric({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <div className="text-lg font-semibold tracking-tight">{value}</div>
        {suffix ? <div className="text-xs text-muted-foreground">{suffix}</div> : null}
      </div>
    </div>
  );
}
