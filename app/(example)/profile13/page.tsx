"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";

// Adjust these imports to your project paths
import { Button } from "@/design/Button";
import { IconButton } from "@/design/IconButton";
import { Avatar } from "@/design/Avatar";

type TabKey =
  | "About"
  | "Popularities"
  | "Gallery"
  | "Swipes"
  | "Lists"
  | "Favorites"
  | "Ratings"
  | "Reviews";

const TABS: TabKey[] = [
  "About",
  "Popularities",
  "Gallery",
  "Swipes",
  "Lists",
  "Favorites",
  "Ratings",
  "Reviews",
];

const GRAIN_DATA_URL =
  "data:image/svg+xml," +
  encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="180" height="180">
    <filter id="n">
      <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" stitchTiles="stitch"/>
    </filter>
    <rect width="180" height="180" filter="url(#n)" opacity=".28"/>
  </svg>
`);

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function StatPill({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-accent-soft px-3 py-1 text-xs text-brand-50/90 shadow-[0_0_0_1px_rgba(0,255,215,0.10),0_10px_25px_rgba(0,255,215,0.08)]">
      <span className="text-brand-50/60">{label}</span>
      <span className="font-semibold text-brand-50">{value}</span>
    </div>
  );
}

function MiniProgress({
  label,
  value,
  tone = "teal",
}: {
  label: string;
  value: number; // 0..100
  tone?: "teal" | "cyan" | "mint";
}) {
  const barClass =
    tone === "cyan"
      ? "from-brand-400 to-brand-200"
      : tone === "mint"
      ? "from-brand-300 to-brand-100"
      : "from-brand-500 to-brand-200";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-brand-50/70">{label}</span>
        <span className="font-medium text-brand-50/90">{value}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full border border-white/10 bg-black/30">
        <motion.div
          className={cx(
            "h-full rounded-full bg-gradient-to-r shadow-[0_0_18px_rgba(0,255,215,0.25)]",
            barClass
          )}
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
          transition={{ type: "spring", stiffness: 90, damping: 16 }}
        />
      </div>
    </div>
  );
}

function Card({
  title,
  icon,
  children,
  className,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 350, damping: 26 }}
      className={cx(
        "group relative overflow-hidden rounded-2xl border border-white/10 bg-accent-soft p-5",
        "shadow-[0_0_0_1px_rgba(0,255,215,0.10),0_18px_50px_rgba(0,255,215,0.08)]",
        "ring-1 ring-inset ring-white/5",
        className
      )}
    >
      {/* Inner highlight */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -top-24 left-10 h-48 w-48 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute -bottom-20 right-0 h-48 w-48 rounded-full bg-brand-300/10 blur-3xl" />
      </div>

      {/* Tech edge */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(0,255,215,0.10),transparent_42%,rgba(0,255,215,0.08))]" />
      </div>

      <header className="relative mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-xl border border-white/10 bg-black/30 text-brand-100 shadow-[0_0_18px_rgba(0,255,215,0.16)]">
            {icon ?? <SparkIcon className="h-4 w-4" />}
          </div>
          <h3 className="text-sm font-semibold tracking-wide text-brand-50">
            {title}
          </h3>
        </div>

        <div className="h-7 w-7 rounded-lg border border-white/10 bg-black/20" />
      </header>

      <div className="relative">{children}</div>
    </motion.section>
  );
}

export default function FanaaraProfileNeonCyberTeal() {
  const [active, setActive] = React.useState<TabKey>("About");

  // Mock data
  const profile = {
    name: "Aira Kisaragi",
    username: "aira.k",
    rank: "S-Rank Creator",
    bio: "Cyber-teal weeb energy. I collect endings, rate openings, and argue about pacing (politely).",
    location: "Neo-Tokyo • District 07",
    joined: "Joined 2024",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80",
    header:
      "https://images.unsplash.com/photo-1520975869011-7f55a98cfb47?auto=format&fit=crop&w=2400&q=80",
    stats: {
      followers: "128.4K",
      following: "214",
      posts: "1,349",
      power: "9.7",
    },
    anime: { watching: 64, finished: 38 },
    comics: { reading: 72, completed: 41 },
    popularity: 9812,
    notifications: 5,
  };

  const posts = [
    {
      id: "p1",
      title: "Hot take: OP1 clears OP3 (but the ED is elite)",
      body: "The bass line syncs with the cut transitions. It’s basically visual percussion.",
      tags: ["Anime", "Openings", "Music"],
      time: "2h ago",
      likes: 842,
      comments: 129,
    },
    {
      id: "p2",
      title: "Panel pacing in modern webcomics is getting crazy good",
      body: "More creators are using negative space like a soundtrack. The silence hits.",
      tags: ["Comics", "Webtoon", "Art"],
      time: "Yesterday",
      likes: 1_204,
      comments: 203,
    },
    {
      id: "p3",
      title: "Season recap thread — spoilers handled in replies",
      body: "No plot in the main post. Just vibe checks and animation notes.",
      tags: ["Thread", "Seasonal"],
      time: "3d ago",
      likes: 2_031,
      comments: 418,
    },
    {
      id: "p4",
      title: "Need reccs: sci-fi + romance that doesn’t fumble the landing",
      body: "Bonus points if the OST is synth-heavy or the panels feel Katsuhiro-esque.",
      tags: ["Recommendations"],
      time: "1w ago",
      likes: 3_440,
      comments: 711,
    },
  ];

  return (
    <div className="min-h-screen bg-black text-brand-50">
      {/* Background ambience */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_700px_at_70%_-10%,rgba(0,255,215,0.20),transparent_60%),radial-gradient(900px_600px_at_0%_30%,rgba(0,180,255,0.12),transparent_55%),radial-gradient(900px_600px_at_90%_80%,rgba(0,255,215,0.10),transparent_55%)]" />
        <div
          className="absolute inset-0 opacity-[0.12] mix-blend-overlay"
          style={{ backgroundImage: `url("${GRAIN_DATA_URL}")` }}
        />
      </div>

      {/* Header */}
      <header className="relative">
        <div
          className="relative h-[420px] w-full overflow-hidden border-b border-white/10 bg-cover bg-center"
          style={{ backgroundImage: `url("${profile.header}")` }}
        >
          {/* Strong overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.72),rgba(0,0,0,0.82),rgba(0,0,0,0.92))]" />

          {/* Animated scan gradient overlay */}
          <motion.div
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                "linear-gradient(90deg, transparent 0%, rgba(0,255,215,0.18) 35%, rgba(0,180,255,0.14) 50%, rgba(0,255,215,0.18) 65%, transparent 100%)",
              backgroundSize: "220% 100%",
            }}
            animate={{ backgroundPositionX: ["0%", "100%"] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: "linear" }}
          />

          {/* Subtle scanlines drifting */}
          <motion.div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to bottom, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 6px)",
            }}
            animate={{ y: [0, 18, 0] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Grain overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.16] mix-blend-overlay"
            style={{ backgroundImage: `url("${GRAIN_DATA_URL}")` }}
          />

          {/* Corner actions */}
          <div className="absolute left-4 top-4 flex items-center gap-2">
            <IconButton
              aria-label="Report"
              className="relative border border-white/10 bg-black/35 text-brand-50/90 backdrop-blur hover:bg-black/55"
            >
              <FlagIcon className="h-5 w-5" />
            </IconButton>
          </div>

          <div className="absolute right-4 top-4 flex items-center gap-2">
            <IconButton
              aria-label="Share"
              className="relative border border-white/10 bg-black/35 text-brand-50/90 backdrop-blur hover:bg-black/55"
            >
              <ShareIcon className="h-5 w-5" />
            </IconButton>
          </div>

          {/* Center stack */}
          <div className="relative mx-auto flex h-full max-w-6xl flex-col items-center justify-end px-4 pb-8 text-center">
            {/* Avatar + rank */}
            <div className="relative mb-4">
              <motion.div
                className="absolute -inset-2 rounded-full bg-gradient-to-r from-brand-500/60 via-brand-200/40 to-brand-500/60 blur-md"
                animate={{ opacity: [0.55, 0.9, 0.55] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="relative rounded-full border border-white/15 bg-black/30 p-1 shadow-[0_0_0_1px_rgba(0,255,215,0.15),0_18px_45px_rgba(0,255,215,0.12)]">
                <div className="rounded-full ring-2 ring-inset ring-accent/60">
                  <Avatar
                    src={profile.avatar}
                    alt={profile.name}
                    className="h-24 w-24"
                  />
                </div>
              </div>

              <motion.div
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-[11px] font-semibold tracking-wide text-brand-50 shadow-[0_0_18px_rgba(0,255,215,0.16)]"
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="bg-gradient-to-r from-brand-200 via-brand-50 to-brand-200 bg-clip-text text-transparent">
                  {profile.rank}
                </span>
              </motion.div>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-brand-50 sm:text-3xl">
              {profile.name}
            </h1>
            <p className="mt-1 text-sm text-brand-50/70">@{profile.username}</p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <StatPill label="Followers" value={profile.stats.followers} />
              <StatPill label="Following" value={profile.stats.following} />
              <StatPill label="Posts" value={profile.stats.posts} />
              <StatPill label="Power" value={profile.stats.power} />
            </div>

            {/* Actions row */}
            <div className="mt-6 flex w-full flex-wrap items-center justify-center gap-2 sm:gap-3">
              <motion.div whileTap={{ scale: 0.98 }} whileHover={{ y: -1 }}>
                <Button
                  className={cx(
                    "relative overflow-hidden rounded-xl px-5 py-2.5",
                    "bg-gradient-to-r from-brand-500 via-brand-300 to-brand-500 text-black",
                    "shadow-[0_0_0_1px_rgba(0,255,215,0.20),0_18px_55px_rgba(0,255,215,0.16)]",
                    "hover:shadow-[0_0_0_1px_rgba(0,255,215,0.26),0_22px_70px_rgba(0,255,215,0.22)]"
                  )}
                >
                  <span className="relative z-10 inline-flex items-center gap-2 font-semibold">
                    <UserPlusIcon className="h-5 w-5" />
                    Follow
                  </span>
                  <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 hover:opacity-100">
                    <span className="absolute inset-0 bg-[radial-gradient(700px_120px_at_30%_50%,rgba(255,255,255,0.35),transparent_60%)]" />
                  </span>
                </Button>
              </motion.div>

              <motion.div whileTap={{ scale: 0.98 }} whileHover={{ y: -1 }}>
                <Button
                  className={cx(
                    "rounded-xl border border-white/10 bg-accent-soft px-4 py-2.5 text-brand-50",
                    "shadow-[0_0_0_1px_rgba(0,255,215,0.10),0_16px_45px_rgba(0,255,215,0.08)]",
                    "hover:bg-white/5"
                  )}
                >
                  <span className="inline-flex items-center gap-2">
                    <HeartIcon className="h-5 w-5 text-brand-100" />
                    <span className="font-semibold">Popularity</span>
                    <span className="rounded-full bg-black/30 px-2 py-0.5 text-xs text-brand-50/80">
                      {profile.popularity.toLocaleString()}
                    </span>
                  </span>
                </Button>
              </motion.div>

              <motion.div whileTap={{ scale: 0.98 }} whileHover={{ y: -1 }}>
                <IconButton
                  aria-label="Notifications"
                  className="relative rounded-xl border border-white/10 bg-accent-soft text-brand-50 shadow-[0_0_0_1px_rgba(0,255,215,0.10),0_16px_45px_rgba(0,255,215,0.08)] hover:bg-white/5"
                >
                  <BellIcon className="h-5 w-5" />
                  {profile.notifications > 0 && (
                    <span className="absolute -right-1 -top-1 grid h-5 min-w-[20px] place-items-center rounded-full bg-brand-500 px-1 text-[11px] font-bold text-black shadow-[0_0_18px_rgba(0,255,215,0.25)]">
                      {profile.notifications}
                    </span>
                  )}
                </IconButton>
              </motion.div>

              <motion.div whileTap={{ scale: 0.98 }} whileHover={{ y: -1 }}>
                <Button
                  className={cx(
                    "rounded-xl border border-white/10 bg-black/35 px-4 py-2.5 text-brand-50",
                    "backdrop-blur",
                    "shadow-[0_0_0_1px_rgba(0,255,215,0.10),0_16px_45px_rgba(0,255,215,0.08)]",
                    "hover:bg-black/55"
                  )}
                >
                  <span className="inline-flex items-center gap-2 font-semibold">
                    <ChatIcon className="h-5 w-5" />
                    Chat
                  </span>
                </Button>
              </motion.div>

              <motion.div whileTap={{ scale: 0.98 }} whileHover={{ y: -1 }}>
                <IconButton
                  aria-label="Gift"
                  className="rounded-xl border border-white/10 bg-black/35 text-brand-50 backdrop-blur shadow-[0_0_0_1px_rgba(0,255,215,0.10),0_16px_45px_rgba(0,255,215,0.08)] hover:bg-black/55"
                >
                  <GiftIcon className="h-5 w-5" />
                </IconButton>
              </motion.div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="relative mt-6">
          {/* Gradient fade edges for mobile overflow */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-[linear-gradient(to_right,rgba(0,0,0,1),transparent)] sm:hidden" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-[linear-gradient(to_left,rgba(0,0,0,1),transparent)] sm:hidden" />

          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-2 sm:flex-wrap">
            {TABS.map((t) => {
              const isActive = t === active;
              return (
                <motion.button
                  key={t}
                  onClick={() => setActive(t)}
                  whileTap={{ scale: 0.98 }}
                  className={cx(
                    "relative shrink-0 rounded-full px-4 py-2 text-sm font-semibold",
                    "border border-white/10",
                    "transition-colors",
                    isActive ? "text-black" : "text-brand-50/80 hover:text-brand-50"
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeTabPill"
                      className={cx(
                        "absolute inset-0 -z-10 rounded-full",
                        "bg-gradient-to-r from-brand-500 via-brand-300 to-brand-500",
                        "shadow-[0_0_0_1px_rgba(0,255,215,0.22),0_18px_55px_rgba(0,255,215,0.18)]"
                      )}
                      transition={{ type: "spring", stiffness: 480, damping: 34 }}
                    />
                  )}
                  <span className="relative">{t}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Panels */}
        <div className="mt-6 pb-14">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 14, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(10px)" }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {active === "About" ? (
                <div className="space-y-6">
                  {/* 3 cards */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card title="Identity" icon={<IdIcon className="h-4 w-4" />}>
                      <p className="text-sm leading-relaxed text-brand-50/80">
                        {profile.bio}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-brand-50/80">
                          <PinIcon className="h-4 w-4 text-brand-100" />
                          {profile.location}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-brand-50/80">
                          <ClockIcon className="h-4 w-4 text-brand-100" />
                          {profile.joined}
                        </span>
                      </div>
                    </Card>

                    <Card
                      title="Anime"
                      icon={<PlayIcon className="h-4 w-4" />}
                      className="md:col-span-1"
                    >
                      <div className="space-y-4">
                        <MiniProgress
                          label="Watching / Finished"
                          value={profile.anime.watching}
                          tone="teal"
                        />
                        <MiniProgress
                          label="Finished Ratio"
                          value={profile.anime.finished}
                          tone="cyan"
                        />
                        <div className="mt-2 rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-brand-50/70">
                          Latest: <span className="text-brand-50/90">“Arc-Lock”</span>{" "}
                          • Ep{" "}
                          <span className="font-semibold text-brand-50">11</span>
                        </div>
                      </div>
                    </Card>

                    <Card
                      title="Comics"
                      icon={<BookIcon className="h-4 w-4" />}
                      className="md:col-span-1"
                    >
                      <div className="space-y-4">
                        <MiniProgress
                          label="Reading / Completed"
                          value={profile.comics.reading}
                          tone="mint"
                        />
                        <MiniProgress
                          label="Completed Ratio"
                          value={profile.comics.completed}
                          tone="teal"
                        />
                        <div className="mt-2 rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-brand-50/70">
                          Current:{" "}
                          <span className="text-brand-50/90">“Starline Sins”</span>{" "}
                          • Ch{" "}
                          <span className="font-semibold text-brand-50">74</span>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Posts feed */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-brand-50">
                      Posts feed
                    </h2>
                    <Button className="rounded-xl border border-white/10 bg-accent-soft px-3 py-2 text-sm text-brand-50 hover:bg-white/5">
                      New post
                    </Button>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    {posts.map((p) => (
                      <motion.article
                        key={p.id}
                        whileHover={{ y: -3 }}
                        transition={{ type: "spring", stiffness: 380, damping: 28 }}
                        className={cx(
                          "relative overflow-hidden rounded-2xl border border-white/10 bg-accent-soft p-5",
                          "shadow-[0_0_0_1px_rgba(0,255,215,0.08),0_18px_50px_rgba(0,255,215,0.06)]"
                        )}
                      >
                        <div className="pointer-events-none absolute inset-0 opacity-60">
                          <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-brand-500/15 blur-3xl" />
                        </div>

                        <div className="relative">
                          <div className="flex items-start justify-between gap-4">
                            <h3 className="text-base font-semibold leading-snug text-brand-50">
                              {p.title}
                            </h3>
                            <span className="shrink-0 rounded-full border border-white/10 bg-black/30 px-2 py-1 text-[11px] text-brand-50/70">
                              {p.time}
                            </span>
                          </div>

                          <p className="mt-2 text-sm leading-relaxed text-brand-50/75">
                            {p.body}
                          </p>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {p.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-brand-50/70"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>

                          <div className="mt-5 flex items-center gap-3">
                            <button className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-brand-50/80 hover:bg-white/5">
                              <HeartIcon className="h-4 w-4 text-brand-100" />
                              {p.likes.toLocaleString()}
                            </button>
                            <button className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-brand-50/80 hover:bg-white/5">
                              <CommentIcon className="h-4 w-4 text-brand-100" />
                              {p.comments.toLocaleString()}
                            </button>
                            <div className="ml-auto flex items-center gap-2">
                              <IconButton
                                aria-label="Share post"
                                className="rounded-xl border border-white/10 bg-black/25 text-brand-50/80 hover:bg-white/5"
                              >
                                <ShareIcon className="h-4 w-4" />
                              </IconButton>
                              <IconButton
                                aria-label="More"
                                className="rounded-xl border border-white/10 bg-black/25 text-brand-50/80 hover:bg-white/5"
                              >
                                <DotsIcon className="h-4 w-4" />
                              </IconButton>
                            </div>
                          </div>
                        </div>
                      </motion.article>
                    ))}
                  </div>
                </div>
              ) : (
                <PlaceholderPanel tab={active} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function PlaceholderPanel({ tab }: { tab: TabKey }) {
  const descriptions: Record<TabKey, string> = {
    About: "",
    Popularities:
      "Top moments, trending posts, and the love graph — optimized for dopamine and discovery.",
    Gallery:
      "A neon gallery grid for fanart, screenshots, edits, and collectibles (with hover zoom + glow).",
    Swipes:
      "Swipe deck: quick reacts, match tastes, and build your watch/read queue in seconds.",
    Lists:
      "Curated lists: seasonal picks, character arcs, power-scaling debates, and more.",
    Favorites:
      "Pinned faves across anime, manga, manhwa, characters, studios, and soundtracks.",
    Ratings:
      "Star + breakdowns: animation, story, OST, pacing, and rewatch factor.",
    Reviews:
      "Longform reviews with spoiler gates, quote blocks, and community highlights.",
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card title={tab} icon={<GridIcon className="h-4 w-4" />} className="md:col-span-2">
        <p className="text-sm leading-relaxed text-brand-50/80">
          {descriptions[tab]}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-brand-50/70">
            Neon pills • LayoutId motion
          </span>
          <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-brand-50/70">
            Blur-in panels • Micro-interactions
          </span>
          <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-brand-50/70">
            Tech cards • Inner highlights
          </span>
        </div>
      </Card>

      <Card title="Quick actions" icon={<BoltIcon className="h-4 w-4" />}>
        <div className="space-y-2">
          <button className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-left text-sm text-brand-50/80 hover:bg-white/5">
            Pin to profile
          </button>
          <button className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-left text-sm text-brand-50/80 hover:bg-white/5">
            Filter
          </button>
          <button className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-left text-sm text-brand-50/80 hover:bg-white/5">
            Sort by
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ---------------------------------- Icons --------------------------------- */

function SparkIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M12 2l1.6 6.1L20 10l-6.4 1.9L12 18l-1.6-6.1L4 10l6.4-1.9L12 2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M19 14l.8 3L23 18l-3.2 1-.8 3-.8-3L15 18l3.2-1 .8-3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        opacity=".85"
      />
    </svg>
  );
}

function UserPlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M16 21v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M19 8v6M16 11h6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HeartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M12 21s-7-4.6-9.5-9.1C.7 8.4 2.5 5 6.2 5c2 0 3.3 1.1 3.8 2.1C10.5 6.1 11.8 5 13.8 5c3.7 0 5.5 3.4 3.7 6.9C19 16.4 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BellIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 7h18s-3 0-3-7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M13.7 21a2 2 0 0 1-3.4 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChatIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M8 9h8M8 13h5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GiftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M20 12v9H4v-9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M2 7h20v5H2V7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M12 22V7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M12 7H8.5a2.5 2.5 0 1 1 0-5C11.5 2 12 7 12 7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M12 7h3.5a2.5 2.5 0 1 0 0-5C12.5 2 12 7 12 7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShareIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M12 3v12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M7 8l5-5 5 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FlagIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M5 21V4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M5 4h12l-1.5 4L17 12H5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DotsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M12 12.5h.01M7 12.5h.01M17 12.5h.01"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CommentIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M16 3l5 5-6 6v4l-2 2-2-2v-4L5 8l5-5 6 6Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 6v6l4 2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IdIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M4 7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M8 10h6M8 14h9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlayIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M8 5v14l12-7L8 5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 0-2 2V5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M6 3v18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GridIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BoltIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M13 2L3 14h8l-1 8 11-14h-8l0-6Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PinIcon2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M14 9l7 7-2 2-7-7V9h2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PinIcon3(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M12 2v20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PinIcon4(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M5 12h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PinIcon5(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M7 7l10 10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M17 7L7 17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PinIcon6(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M4 20h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PinIcon7(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M12 7v10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M7 12h10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PinIcon8(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M12 3l9 9-9 9-9-9 9-9Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PinIcon9(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M9 18l6-12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PinIcon10(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M12 2l4 8h-8l4-8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PinIcon11(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M8 16l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 4v16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PinIcon12(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M6 9l6-6 6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 3v18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PinIcon13(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M6 6h12v12H6V6Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PinIcon14(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M4 12h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M12 4v16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PinIcon15(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M8 8h8v8H8V8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
