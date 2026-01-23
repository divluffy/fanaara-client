"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";

type TabKey = "about" | "posts" | "collection" | "achievements";

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: "about", label: "About" },
  { key: "posts", label: "Posts" },
  { key: "collection", label: "Collection" },
  { key: "achievements", label: "Achievements" },
];

const PROFILE = {
  name: "Fanaara",
  handle: "@fanaara",
  rank: "S-Rank",
  avatar:
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=320&q=60",
  cover:
    "https://images.unsplash.com/photo-1520975682031-a94a8b7a6c1a?auto=format&fit=crop&w=1600&q=60",
  stats: [
    { label: "Followers", value: "128K" },
    { label: "Following", value: "1,204" },
    { label: "Posts", value: "842" },
    { label: "Likes", value: "2.4M" },
  ],
  bio: "Anime & comics curator ✦ spoilers tagged ✦ cozy discussions, hot takes, and weekly watch parties.",
  favorites: {
    anime: ["Frieren", "Jujutsu Kaisen", "One Piece"],
    comics: ["Saga", "Chainsaw Man", "Sandman"],
    genres: ["Fantasy", "Seinen", "Sci-Fi"],
  },
};

const POSTS = Array.from({ length: 8 }).map((_, i) => ({
  id: `p_${i + 1}`,
  title:
    i % 2 === 0
      ? "Hot take: pacing is a feature, not a bug"
      : "Panel breakdown: why this page hits so hard",
  excerpt:
    "Quick thoughts, a couple screenshots, and a tiny rant. Tell me if you agree — respectfully 👀",
  meta: {
    time: `${i + 1}d`,
    likes: Math.floor(1200 + i * 137),
    comments: Math.floor(90 + i * 11),
  },
}));

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/** Minimal tooltip (hover/focus). On mobile it degrades gracefully. */
function Tooltip({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute -top-2 left-1/2 z-50 hidden -translate-x-1/2 -translate-y-full",
          "whitespace-nowrap rounded-full border border-white/10 bg-zinc-900/95 px-2.5 py-1 text-[11px] text-zinc-100 shadow-lg",
          "group-hover:block group-focus-within:block",
        )}
      >
        {label}
      </span>
    </span>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip label={label}>
      <motion.button
        type="button"
        onClick={onClick}
        aria-label={label}
        title={label}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "inline-flex h-11 w-11 items-center justify-center rounded-2xl",
          "border border-white/10 bg-white/5 backdrop-blur",
          "text-zinc-100 shadow-sm",
          "focus:outline-none focus:ring-2 focus:ring-white/20",
        )}
      >
        {children}
      </motion.button>
    </Tooltip>
  );
}

function PrimaryButton({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.985 }}
      className={cn(
        "h-12 w-full rounded-2xl px-4 text-sm font-semibold",
        "bg-white text-zinc-950 shadow",
        "focus:outline-none focus:ring-2 focus:ring-white/30",
        className,
      )}
    >
      {children}
    </motion.button>
  );
}

function SoftButton({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.985 }}
      className={cn(
        "h-11 w-full rounded-2xl px-4 text-sm font-semibold",
        "border border-white/10 bg-white/5 text-zinc-100",
        "focus:outline-none focus:ring-2 focus:ring-white/20",
        className,
      )}
    >
      {children}
    </motion.button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-start gap-0.5">
      <div className="text-sm font-semibold leading-none text-zinc-100">
        {value}
      </div>
      <div className="text-[11px] leading-none text-zinc-400">{label}</div>
    </div>
  );
}

function LiftCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      whileHover={{
        y: -3,
        boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
      }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 420, damping: 30 }}
      className={cn(
        "relative overflow-hidden rounded-3xl",
        "border border-white/10 bg-white/5 backdrop-blur",
        "p-4 shadow-[0_10px_30px_rgba(0,0,0,0.35)]",
        "md:hover:border-white/20",
        // subtle glow (desktop hover feel)
        "md:hover:before:opacity-100",
        "before:pointer-events-none before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-300",
        "before:bg-[radial-gradient(600px_circle_at_10%_0%,rgba(255,255,255,0.12),transparent_60%)]",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
      </div>
      {children}
    </motion.section>
  );
}

export default function ProfilePageFanaara() {
  const [activeTab, setActiveTab] = React.useState<TabKey>("about");

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      {/* Header */}
      <header className="relative">
        <div className={cn("relative h-60 sm:h-72 md:h-80", "overflow-hidden")}>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${PROFILE.cover})` }}
            aria-hidden
          />
          {/* Overlay */}
          <div
            className={cn(
              "absolute inset-0",
              "bg-gradient-to-b from-black/30 via-black/40 to-zinc-950",
            )}
            aria-hidden
          />

          {/* Top row (safe area) */}
          <div className="absolute inset-x-0 top-0 z-10 px-4 pt-4">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-zinc-100 backdrop-blur">
                <SparkleIcon className="h-4 w-4" />
                <span>Profile</span>
              </div>

              <div className="flex items-center gap-2">
                <IconButton label="Notifications">
                  <BellIcon className="h-5 w-5" />
                </IconButton>
                <IconButton label="Share">
                  <ShareIcon className="h-5 w-5" />
                </IconButton>
              </div>
            </div>
          </div>

          {/* Glass panel at bottom of header */}
          <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-4">
            <div
              className={cn(
                "rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl",
                "p-4 shadow-[0_18px_50px_rgba(0,0,0,0.55)]",
              )}
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <img
                    src={PROFILE.avatar}
                    alt={`${PROFILE.name} avatar`}
                    className="h-16 w-16 rounded-2xl border border-white/10 object-cover"
                  />
                  <div className="absolute -bottom-2 -right-2 rounded-xl border border-white/10 bg-zinc-950/80 px-2 py-1 text-[10px] font-semibold text-zinc-100 backdrop-blur">
                    {PROFILE.rank}
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h1 className="truncate text-lg font-semibold text-zinc-100">
                      {PROFILE.name}
                    </h1>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-zinc-200">
                      Pro
                    </span>
                  </div>
                  <div className="mt-0.5 text-sm text-zinc-300">
                    {PROFILE.handle}
                  </div>

                  <div className="mt-3 grid grid-cols-4 gap-3">
                    {PROFILE.stats.map((s) => (
                      <Stat key={s.label} label={s.label} value={s.value} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Thumb-zone actions */}
              <div className="mt-4 space-y-2">
                {/* Primary actions: big */}
                <div className="grid grid-cols-2 gap-2">
                  <PrimaryButton onClick={() => {}}>
                    <span className="inline-flex items-center justify-center gap-2">
                      <UserPlusIcon className="h-5 w-5" />
                      Follow
                    </span>
                  </PrimaryButton>
                  <PrimaryButton onClick={() => {}} className="bg-zinc-100">
                    <span className="inline-flex items-center justify-center gap-2">
                      <ChatIcon className="h-5 w-5" />
                      Chat
                    </span>
                  </PrimaryButton>
                </div>

                {/* Secondary action: soft, medium */}
                <SoftButton onClick={() => {}}>
                  <span className="inline-flex items-center justify-center gap-2">
                    <FlameIcon className="h-5 w-5" />
                    Popularity
                  </span>
                </SoftButton>

                {/* Icon buttons row */}
                <div className="flex items-center justify-between gap-2">
                  <IconButton label="Gift">
                    <GiftIcon className="h-5 w-5" />
                  </IconButton>
                  <IconButton label="Report">
                    <FlagIcon className="h-5 w-5" />
                  </IconButton>
                  <IconButton label="Notify me">
                    <BellIcon className="h-5 w-5" />
                  </IconButton>
                  <IconButton label="Share profile">
                    <ShareIcon className="h-5 w-5" />
                  </IconButton>

                  <div className="ml-auto hidden md:block">
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-300">
                      Hover cards for details ✦ tap feels snappy on mobile
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Spacer shadow fade */}
            <div className="pointer-events-none mt-4 h-6 bg-gradient-to-b from-zinc-950/0 to-zinc-950" />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="px-4 pb-12 pt-6 md:pt-10">
        {/* Tabs (horizontal scroll + snap) */}
        <div className="relative">
          <div
            className={cn(
              "no-scrollbar -mx-4 overflow-x-auto px-4",
              "snap-x snap-mandatory",
            )}
          >
            <div className="relative flex w-max items-center gap-2">
              {TABS.map((t) => {
                const isActive = t.key === activeTab;
                return (
                  <motion.button
                    key={t.key}
                    type="button"
                    onClick={() => setActiveTab(t.key)}
                    whileTap={{ scale: 0.985 }}
                    className={cn(
                      "relative snap-start rounded-2xl px-4 py-2.5 text-sm font-semibold",
                      "border border-white/10 bg-white/5 text-zinc-200",
                      isActive && "bg-white/10 text-zinc-50",
                    )}
                  >
                    {t.label}
                    {isActive && (
                      <motion.span
                        layoutId="tab-indicator"
                        className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-white"
                        transition={{
                          type: "spring",
                          stiffness: 520,
                          damping: 36,
                        }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Swipe hint (ChevronRight moving) */}
          <div className="pointer-events-none absolute right-0 top-0 h-full w-20">
            <div className="absolute inset-0 bg-gradient-to-l from-zinc-950 to-zinc-950/0" />
            <motion.div
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
              animate={{ x: [0, 6, 0] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              aria-hidden
            >
              <ChevronRightIcon className="h-5 w-5" />
            </motion.div>
            <div className="absolute bottom-0 right-3 text-[10px] text-zinc-500">
              swipe
            </div>
          </div>
        </div>

        {/* Panels */}
        <div className="mt-4">
          <AnimatePresence mode="wait" initial={false}>
            {activeTab === "about" && (
              <motion.div
                key="about"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                className="space-y-4"
              >
                {/* About cards: stack on mobile, grid (3) on desktop */}
                <div className="grid gap-3 md:grid-cols-3">
                  <LiftCard title="Basic">
                    <p className="text-sm leading-relaxed text-zinc-300">
                      {PROFILE.bio}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Tag>Watch parties</Tag>
                      <Tag>Weekly recs</Tag>
                      <Tag>No spoilers (tagged)</Tag>
                    </div>
                  </LiftCard>

                  <LiftCard title="Anime">
                    <div className="space-y-2">
                      <div className="text-xs text-zinc-400">Favorites</div>
                      <ul className="space-y-1 text-sm text-zinc-200">
                        {PROFILE.favorites.anime.map((a) => (
                          <li key={a} className="flex items-center gap-2">
                            <Dot />
                            <span>{a}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="pt-2 text-xs text-zinc-400">Genres</div>
                      <div className="flex flex-wrap gap-2">
                        {PROFILE.favorites.genres.map((g) => (
                          <Tag key={g}>{g}</Tag>
                        ))}
                      </div>
                    </div>
                  </LiftCard>

                  <LiftCard title="Comics">
                    <div className="space-y-2">
                      <div className="text-xs text-zinc-400">Favorites</div>
                      <ul className="space-y-1 text-sm text-zinc-200">
                        {PROFILE.favorites.comics.map((c) => (
                          <li key={c} className="flex items-center gap-2">
                            <Dot />
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="pt-2 text-xs text-zinc-400">Vibe</div>
                      <div className="flex flex-wrap gap-2">
                        <Tag>Panel analysis</Tag>
                        <Tag>Story arcs</Tag>
                        <Tag>Art breakdown</Tag>
                      </div>
                    </div>
                  </LiftCard>
                </div>

                {/* Posts feed stacked (mobile) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-zinc-100">
                      Latest posts
                    </h2>
                    <button
                      type="button"
                      className="text-xs font-semibold text-zinc-300 underline decoration-white/20 underline-offset-4 hover:text-zinc-100"
                    >
                      View all
                    </button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {POSTS.slice(0, 4).map((p) => (
                      <PostCard key={p.id} post={p} />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "posts" && (
              <motion.div
                key="posts"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-zinc-100">
                    Posts feed
                  </h2>
                  <div className="inline-flex items-center gap-2">
                    <SoftButton className="h-10 w-auto px-3">Filter</SoftButton>
                    <SoftButton className="h-10 w-auto px-3">Sort</SoftButton>
                  </div>
                </div>

                {/* Desktop: 2 columns */}
                <div className="grid gap-3 md:grid-cols-2">
                  {POSTS.map((p) => (
                    <PostCard key={p.id} post={p} />
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "collection" && (
              <motion.div
                key="collection"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                className="grid gap-3 md:grid-cols-3"
              >
                <LiftCard title="Top shelves">
                  <p className="text-sm text-zinc-300">
                    Curated lists, reading order guides, and “start here” picks.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Tag>Starter packs</Tag>
                    <Tag>Seasonal</Tag>
                    <Tag>Hidden gems</Tag>
                  </div>
                </LiftCard>
                <LiftCard title="Saved panels">
                  <p className="text-sm text-zinc-300">
                    Your most replayed pages & frame captures.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Tag>Composition</Tag>
                    <Tag>Foreshadow</Tag>
                    <Tag>Emotion</Tag>
                  </div>
                </LiftCard>
                <LiftCard title="Watchlist">
                  <p className="text-sm text-zinc-300">
                    Next up: shows, arcs, and volumes queued for review.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Tag>Queue</Tag>
                    <Tag>Remind me</Tag>
                    <Tag>Weekly</Tag>
                  </div>
                </LiftCard>
              </motion.div>
            )}

            {activeTab === "achievements" && (
              <motion.div
                key="achievements"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                className="grid gap-3 md:grid-cols-2"
              >
                <LiftCard title="Badges">
                  <div className="flex flex-wrap gap-2">
                    <Badge>Top Reviewer</Badge>
                    <Badge>Weekly Host</Badge>
                    <Badge>Art Analyst</Badge>
                    <Badge>Community Helper</Badge>
                  </div>
                  <div className="mt-3 text-sm text-zinc-300">
                    Keep posting to unlock seasonal creator badges.
                  </div>
                </LiftCard>

                <LiftCard title="Milestones">
                  <ul className="space-y-2 text-sm text-zinc-200">
                    <li className="flex items-center gap-2">
                      <CheckIcon className="h-5 w-5" />
                      100K followers reached
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon className="h-5 w-5" />
                      500 posts published
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon className="h-5 w-5" />
                      1M likes collected
                    </li>
                  </ul>
                </LiftCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-zinc-200">
      {children}
    </span>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-100">
      <MedalIcon className="mr-2 h-4 w-4" />
      {children}
    </span>
  );
}

function Dot() {
  return <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" aria-hidden />;
}

function PostCard({
  post,
}: {
  post: {
    id: string;
    title: string;
    excerpt: string;
    meta: { time: string; likes: number; comments: number };
  };
}) {
  return (
    <motion.article
      whileHover={{
        y: -3,
        boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
      }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 420, damping: 30 }}
      className={cn(
        "rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-4",
        "shadow-[0_10px_30px_rgba(0,0,0,0.35)]",
        "md:hover:border-white/20",
        "md:hover:before:opacity-100",
        "relative overflow-hidden",
        "before:pointer-events-none before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-300",
        "before:bg-[radial-gradient(600px_circle_at_10%_0%,rgba(255,255,255,0.10),transparent_60%)]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold leading-snug text-zinc-100">
          {post.title}
        </h3>
        <span className="shrink-0 rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[10px] font-semibold text-zinc-300">
          {post.meta.time}
        </span>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-zinc-300">
        {post.excerpt}
      </p>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-zinc-300">
          <span className="inline-flex items-center gap-1">
            <HeartIcon className="h-4 w-4" />
            {post.meta.likes.toLocaleString()}
          </span>
          <span className="inline-flex items-center gap-1">
            <CommentIcon className="h-4 w-4" />
            {post.meta.comments.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <IconButton label="Share post">
            <ShareIcon className="h-5 w-5" />
          </IconButton>
          <IconButton label="Report post">
            <FlagIcon className="h-5 w-5" />
          </IconButton>
        </div>
      </div>
    </motion.article>
  );
}

/* ----------------------------- Icons (inline SVG) ----------------------------- */

function IconBase({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 7H3s3 0 3-7" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </IconBase>
  );
}

function GiftIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M20 12v10H4V12" />
      <path d="M2 7h20v5H2z" />
      <path d="M12 22V7" />
      <path d="M12 7H7.5a2.5 2.5 0 1 1 0-5C10 2 12 7 12 7Z" />
      <path d="M12 7h4.5a2.5 2.5 0 1 0 0-5C14 2 12 7 12 7Z" />
    </IconBase>
  );
}

function FlagIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M4 22V4" />
      <path d="M4 4h12l-1 4 3 4H4" />
    </IconBase>
  );
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <path d="M16 6l-4-4-4 4" />
      <path d="M12 2v14" />
    </IconBase>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M9 18l6-6-6-6" />
    </IconBase>
  );
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
    </IconBase>
  );
}

function UserPlusIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
      <path d="M19 8v6" />
      <path d="M22 11h-6" />
    </IconBase>
  );
}

function FlameIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M12 22c4 0 7-3 7-7 0-3-2-5-4-7 0 3-2 4-3 5-1-2-1-4 0-7-3 2-6 6-6 10 0 4 3 6 6 6z" />
    </IconBase>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </IconBase>
  );
}

function CommentIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
      <path d="M8 10h8" />
      <path d="M8 14h5" />
    </IconBase>
  );
}

function MedalIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M12 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
      <path d="M8 3h8" />
      <path d="M9 3l-2 5" />
      <path d="M15 3l2 5" />
      <path d="M9 15l-1 6 4-2 4 2-1-6" />
    </IconBase>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M20 6L9 17l-5-5" />
    </IconBase>
  );
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path d="M12 2l1.5 5L19 8.5l-5.5 1.5L12 15l-1.5-5L5 8.5 10.5 7 12 2z" />
      <path d="M4 14l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" />
    </IconBase>
  );
}

/* Optional: hide scrollbars utility if you don't already have it in globals
   You can keep it here as Tailwind arbitrary selector works without CSS files. */
declare module "react" {}
