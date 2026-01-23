"use client";

import * as React from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  FiAlertTriangle,
  FiShare2,
  FiShield,
  FiUserPlus,
  FiZap,
  FiBell,
  FiMessageCircle,
  FiHeart,
  FiRepeat,
  FiBookmark,
  FiImage,
  FiClock,
  FiTrendingUp,
  FiStar,
  FiActivity,
  FiBookOpen,
  FiTv,
} from "react-icons/fi";

import { Button } from "@/design/Button";
import { IconButton } from "@/design/IconButton";
import { Avatar } from "@/design/Avatar";

function cn(...args: Array<string | undefined | null | false>) {
  return args.filter(Boolean).join(" ");
}

const RanksBorders = {
  newOtaku: "from-violet-500 via-fuchsia-500 to-cyan-400",
  senpai: "from-amber-400 via-orange-500 to-rose-500",
  legend: "from-emerald-400 via-teal-500 to-sky-500",
} as const;

const UserData = {
  id: "u_0192",
  name: "Rin Kurosawa",
  username: "rin.kurosawa",
  bio: "Collector of panels, frames, and feelings. I rate story arcs like a sport.",
  location: "Neo Tokyo",
  joinedAt: "2024-02-19",
  rank: "newOtaku" as keyof typeof RanksBorders,
  bg: { lg: "https://images4.alphacoders.com/136/thumbbig-1369866.webp" },
  avatar: {
    md: "https://avatarfiles.alphacoders.com/367/thumb-350-367476.webp",
  },
  stats: {
    followers: 12840,
    following: 384,
    likes: 220_541,
    posts: 219,
  },
  favorites: {
    anime: ["Frieren", "Chainsaw Man", "Mob Psycho 100"],
    comics: ["One Piece", "Berserk", "Slam Dunk"],
  },
} as const;

type TabKey = "general" | "anime" | "comics" | "activity" | "popularity";

const TABS: Array<{ key: TabKey; label: string; icon: React.ReactNode }> = [
  { key: "general", label: "General", icon: <FiStar className="h-4 w-4" /> },
  { key: "anime", label: "Anime List", icon: <FiTv className="h-4 w-4" /> },
  {
    key: "comics",
    label: "Comics List",
    icon: <FiBookOpen className="h-4 w-4" />,
  },
  {
    key: "activity",
    label: "Activity",
    icon: <FiActivity className="h-4 w-4" />,
  },
  {
    key: "popularity",
    label: "Popularity",
    icon: <FiTrendingUp className="h-4 w-4" />,
  },
];

const fakeFastStats = [
  { label: "Streak", value: "12d", icon: <FiZap className="h-4 w-4" /> },
  { label: "Level", value: "38", icon: <FiStar className="h-4 w-4" /> },
  { label: "XP", value: "14.2k", icon: <FiTrendingUp className="h-4 w-4" /> },
  { label: "Badges", value: "9", icon: <FiShield className="h-4 w-4" /> },
];

const fakePosts = [
  {
    id: "p1",
    time: "2h ago",
    title: "That one panel that rewired my brain 🫠",
    body: "You know when a single frame says more than 10 episodes? Dropping it here—no spoilers, just vibes.",
    tags: ["panel-love", "composition", "manga"],
    thumbnail:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=640&q=70",
    counts: { likes: 4821, comments: 214, reposts: 88 },
  },
  {
    id: "p2",
    time: "Yesterday",
    title: "Ranking openings by “instant goosebumps” factor",
    body: "My top 5 changed after rewatching on headphones. The bass drop is an unfair advantage.",
    tags: ["anime", "openings", "music"],
    thumbnail: "",
    counts: { likes: 2310, comments: 167, reposts: 52 },
  },
  {
    id: "p3",
    time: "4d ago",
    title: "Hot take: slow arcs are peak if the character work hits",
    body: "If the emotional inventory is real, I can wait 20 chapters for one look.",
    tags: ["story", "character", "discussion"],
    thumbnail:
      "https://images.unsplash.com/photo-1520975682031-ae2c3c03d94b?auto=format&fit=crop&w=640&q=70",
    counts: { likes: 812, comments: 94, reposts: 11 },
  },
];

export default function PremiumProfilePage() {
  const [tab, setTab] = React.useState<TabKey>("general");

  const headerRef = React.useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: headerRef,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0.45, 0.75]);
  const bgYSmoothed = useSpring(bgY, {
    stiffness: 140,
    damping: 24,
    mass: 0.3,
  });

  const rankLabel =
    UserData.rank === "newOtaku"
      ? "New Otaku"
      : UserData.rank === "senpai"
        ? "Senpai"
        : "Legend";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      {/* Ambient backdrop */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-48 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute -bottom-48 right-[-120px] h-[560px] w-[560px] rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      {/* Header */}
      <div ref={headerRef} className="relative w-full overflow-hidden">
        {/* Background (parallax-ish) */}
        <motion.div
          style={{ y: bgYSmoothed }}
          className="absolute inset-0 scale-[1.06] will-change-transform"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={"https://images3.alphacoders.com/132/thumbbig-1328396.webp"}
            alt=""
            className="h-full w-full object-cover object-center"
            draggable={false}
          />
        </motion.div>

        {/* Overlays */}
        <motion.div
          style={{ opacity: overlayOpacity }}
          className="absolute inset-0 bg-black"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-zinc-950" />

        {/* Subtle noise */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.13] mix-blend-overlay"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27160%27 height=%27160%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%272%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27160%27 height=%27160%27 filter=%27url(%23n)%27 opacity=%270.45%27/%3E%3C/svg%3E")',
          }}
        />

        {/* Top actions */}
        <div className="relative mx-auto flex max-w-6xl items-start justify-between px-4 pb-4 pt-4 sm:px-6">
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
            <IconButton variant="soft" aria-label="Report">
              <FiAlertTriangle className="h-5 w-5" />
            </IconButton>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
            <IconButton variant="glass" aria-label="Share">
              <FiShare2 className="h-5 w-5" />
            </IconButton>
          </motion.div>
        </div>

        {/* Center identity */}
        <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-6 sm:pb-12">
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
              className="relative"
            >
              <div className="absolute -inset-6 -z-10 rounded-full bg-gradient-to-r from-violet-500/25 via-fuchsia-500/10 to-cyan-400/20 blur-xl" />

              {/* ✅ Fixed: rankBorder is CSS only; Avatar uses next/image with real URL */}
              <Avatar
                size={"44"} // professional: explicit pixels (change as you like)
                src={"https://mfiles.alphacoders.com/101/thumb-350-1012289.png"}
                alt={UserData.name}
                rankBorder={"/borders/wolf.png"}
                priority
              />
            </motion.div>

            {/* Rank pill */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.08,
                type: "spring",
                stiffness: 160,
                damping: 18,
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-100 backdrop-blur"
            >
              <motion.span
                animate={{ rotate: [0, -6, 6, 0] }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="inline-flex"
              >
                <FiShield className="h-4 w-4 text-cyan-200/90" />
              </motion.span>
              <span className="font-medium tracking-wide">{rankLabel}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.06,
                type: "spring",
                stiffness: 120,
                damping: 18,
              }}
              className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
            >
              {UserData.name}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.1,
                type: "spring",
                stiffness: 120,
                damping: 18,
              }}
              className="mt-1 text-sm text-zinc-300"
            >
              @{UserData.username}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.14,
                type: "spring",
                stiffness: 120,
                damping: 18,
              }}
              className="mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-zinc-200/90"
            >
              {UserData.bio}
            </motion.p>
          </div>
        </div>

        <div className="relative h-10 bg-gradient-to-b from-transparent to-zinc-950" />
      </div>

      {/* Main */}
      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        {/* Action row */}
        <div className="-mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-3 shadow-[0_18px_60px_-32px_rgba(0,0,0,0.85)] backdrop-blur-xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
              <Lift>
                <Button variant="gradient" className="w-full sm:w-auto">
                  <FiUserPlus className="mr-2 h-4 w-4" />
                  Follow
                </Button>
              </Lift>

              <Lift>
                <Button variant="soft" className="w-full sm:w-auto">
                  <FiZap className="mr-2 h-4 w-4" />
                  Send Popularity
                </Button>
              </Lift>

              <Lift>
                <IconButtonWithBadge badgeCount={3} ariaLabel="Notifications">
                  <IconButton
                    variant="glass"
                    badgeCount={3}
                    aria-label="Notifications"
                  >
                    <FiBell className="h-5 w-5" />
                  </IconButton>
                </IconButtonWithBadge>
              </Lift>

              <Lift>
                <Button variant="outline" className="w-full sm:w-auto">
                  <FiMessageCircle className="mr-2 h-4 w-4" />
                  Chat
                </Button>
              </Lift>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-4 gap-2">
              <MiniStat
                label="Followers"
                value={formatNumber(UserData.stats.followers)}
              />
              <MiniStat
                label="Following"
                value={formatNumber(UserData.stats.following)}
              />
              <MiniStat
                label="Likes"
                value={formatNumber(UserData.stats.likes)}
              />
              <MiniStat
                label="Posts"
                value={formatNumber(UserData.stats.posts)}
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <LayoutGroup id="profile-tabs">
          <div className="mt-8">
            <div className="relative">
              <div className="no-scrollbar flex gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] p-2 backdrop-blur">
                {TABS.map((t) => {
                  const active = t.key === tab;
                  return (
                    <button
                      key={t.key}
                      onClick={() => setTab(t.key)}
                      className={cn(
                        "relative flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60",
                        active
                          ? "text-white"
                          : "text-zinc-300 hover:text-white",
                      )}
                    >
                      <span
                        className={cn(
                          "inline-flex items-center justify-center",
                          active ? "text-cyan-200" : "text-zinc-400",
                        )}
                      >
                        {t.icon}
                      </span>
                      <span>{t.label}</span>

                      {active && (
                        <motion.span
                          layoutId="tab-underline"
                          className="absolute inset-x-3 -bottom-[6px] h-[2px] rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-300"
                          transition={{
                            type: "spring",
                            stiffness: 520,
                            damping: 34,
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-1 text-xs text-zinc-500">
                Tip: swipe the tabs on mobile ✨
              </div>
            </div>

            {/* Tab content */}
            <div className="mt-6">
              <AnimatePresence mode="wait">
                {tab === "general" && (
                  <motion.div
                    key="general"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="space-y-6"
                  >
                    <div className="grid gap-4 lg:grid-cols-3">
                      <GlassCard>
                        <CardTitle
                          icon={<FiStar className="h-4 w-4" />}
                          title="Basics"
                        />
                        <div className="mt-3 space-y-2 text-sm text-zinc-200/90">
                          <InfoRow label="Location" value={UserData.location} />
                          <InfoRow
                            label="Joined"
                            value={prettyDate(UserData.joinedAt)}
                          />
                          <InfoRow
                            label="Status"
                            value={
                              <span className="inline-flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.15)]" />
                                Online
                              </span>
                            }
                          />
                        </div>
                      </GlassCard>

                      <GlassCard>
                        <CardTitle
                          icon={<FiTv className="h-4 w-4" />}
                          title="Anime"
                        />
                        <div className="mt-3 flex flex-wrap gap-2">
                          {UserData.favorites.anime.map((x) => (
                            <Pill key={x}>{x}</Pill>
                          ))}
                        </div>
                        <div className="mt-4 text-xs text-zinc-400">
                          Top picks • updated weekly
                        </div>
                      </GlassCard>

                      <GlassCard>
                        <CardTitle
                          icon={<FiBookOpen className="h-4 w-4" />}
                          title="Comics"
                        />
                        <div className="mt-3 flex flex-wrap gap-2">
                          {UserData.favorites.comics.map((x) => (
                            <Pill key={x}>{x}</Pill>
                          ))}
                        </div>
                        <div className="mt-4 text-xs text-zinc-400">
                          Manga + comics • spoilers avoided
                        </div>
                      </GlassCard>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur">
                      <div className="grid gap-2 sm:grid-cols-4">
                        {fakeFastStats.map((s) => (
                          <div
                            key={s.label}
                            className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] p-3"
                          >
                            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                              <div className="absolute -left-12 -top-12 h-40 w-40 rounded-full bg-violet-400/15 blur-2xl" />
                              <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-cyan-300/10 blur-2xl" />
                            </div>

                            <div className="relative flex items-center justify-between gap-3">
                              <div className="text-xs text-zinc-400">
                                {s.label}
                              </div>
                              <div className="text-zinc-300/70">{s.icon}</div>
                            </div>
                            <div className="relative mt-1 text-lg font-semibold tracking-tight">
                              {s.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <SectionHeader
                        title="Posts"
                        subtitle="Latest drops • hover for that premium glow"
                      />
                      <div className="space-y-3">
                        {fakePosts.map((p) => (
                          <PostCard key={p.id} post={p} />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {tab === "anime" && (
                  <motion.div
                    key="anime"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="space-y-4"
                  >
                    <SectionHeader
                      title="Anime List"
                      subtitle="A curated queue with ratings, tags, and watch status."
                    />
                    <EmptyState
                      icon={<FiTv className="h-6 w-6" />}
                      title="No anime list yet"
                      description="When Rin adds titles, you’ll see status, episode progress, and notes here."
                      actionLabel="Explore Anime"
                    />
                  </motion.div>
                )}

                {tab === "comics" && (
                  <motion.div
                    key="comics"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="space-y-4"
                  >
                    <SectionHeader
                      title="Comics List"
                      subtitle="Manga volumes, chapters, and highlights — all in one shelf."
                    />
                    <EmptyState
                      icon={<FiBookOpen className="h-6 w-6" />}
                      title="No comics saved"
                      description="When Rin starts logging reads, you’ll see volumes, arcs, and favorites."
                      actionLabel="Browse Comics"
                    />
                  </motion.div>
                )}

                {tab === "activity" && (
                  <motion.div
                    key="activity"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="space-y-4"
                  >
                    <SectionHeader
                      title="Activity Timeline"
                      subtitle="Reactions, follows, and milestones — ordered by time."
                    />
                    <EmptyState
                      icon={<FiClock className="h-6 w-6" />}
                      title="No recent activity"
                      description="Once Rin starts interacting more, you’ll get a clean timeline here."
                      actionLabel="Find Friends"
                    />
                  </motion.div>
                )}

                {tab === "popularity" && (
                  <motion.div
                    key="popularity"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="space-y-4"
                  >
                    <SectionHeader
                      title="Popularity History"
                      subtitle="Gifts, boosts, and reputation changes over time."
                    />
                    <EmptyState
                      icon={<FiTrendingUp className="h-6 w-6" />}
                      title="No popularity history yet"
                      description="When boosts are sent, you’ll see a chart-like timeline and breakdowns here."
                      actionLabel="Send a Boost"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </LayoutGroup>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          width: 0px;
          height: 0px;
        }
        .no-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
      `}</style>
    </div>
  );
}

/* ---------- small components ---------- */

function Lift({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
    >
      {children}
    </motion.div>
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
        "relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur",
        "shadow-[0_18px_55px_-40px_rgba(0,0,0,0.9)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 hover:opacity-100" />
      {children}
    </div>
  );
}

function CardTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-cyan-200/90">
        {icon}
      </span>
      <div className="text-sm font-semibold">{title}</div>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-200">
      {children}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="text-xs text-zinc-400">{label}</div>
      <div className="text-right text-sm text-zinc-200">{value}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <div className="text-[11px] text-zinc-400">{label}</div>
      <div className="mt-0.5 text-sm font-semibold tracking-tight">{value}</div>
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <div className="text-lg font-semibold tracking-tight">{title}</div>
        {subtitle ? (
          <div className="mt-1 text-sm text-zinc-400">{subtitle}</div>
        ) : null}
      </div>
    </div>
  );
}

function PostCard({
  post,
}: {
  post: {
    id: string;
    time: string;
    title: string;
    body: string;
    tags: string[];
    thumbnail?: string;
    counts: { likes: number; comments: number; reposts: number };
  };
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur",
        "shadow-[0_16px_50px_-38px_rgba(0,0,0,0.9)]",
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/15" />
      </div>

      <div className="relative flex gap-4">
        {post.thumbnail ? (
          <div className="relative hidden w-24 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] sm:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.thumbnail}
              alt=""
              className="h-24 w-24 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
        ) : (
          <div className="relative hidden w-24 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] sm:flex">
            <FiImage className="h-5 w-5 text-zinc-500" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold tracking-tight">
                {post.title}
              </div>
              <div className="mt-1 text-xs text-zinc-500">{post.time}</div>
            </div>

            <div className="flex items-center gap-1">
              <SoftIcon ariaLabel="Like">
                <FiHeart className="h-4 w-4" />
              </SoftIcon>
              <SoftIcon ariaLabel="Repost">
                <FiRepeat className="h-4 w-4" />
              </SoftIcon>
              <SoftIcon ariaLabel="Bookmark">
                <FiBookmark className="h-4 w-4" />
              </SoftIcon>
            </div>
          </div>

          <div className="mt-3 text-sm leading-relaxed text-zinc-200/90">
            {post.body}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-zinc-300"
              >
                #{t}
              </span>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-4 text-xs text-zinc-500">
            <span className="inline-flex items-center gap-1.5">
              <FiHeart className="h-3.5 w-3.5" />{" "}
              {formatNumber(post.counts.likes)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FiMessageCircle className="h-3.5 w-3.5" />{" "}
              {formatNumber(post.counts.comments)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FiRepeat className="h-3.5 w-3.5" />{" "}
              {formatNumber(post.counts.reposts)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SoftIcon({
  children,
  ariaLabel,
}: {
  children: React.ReactNode;
  ariaLabel: string;
}) {
  return (
    <motion.button
      aria-label={ariaLabel}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-xl",
        "border border-white/10 bg-white/[0.03] text-zinc-300",
        "transition hover:text-white hover:border-white/15",
      )}
    >
      {children}
    </motion.button>
  );
}

function EmptyState({
  icon,
  title,
  description,
  actionLabel,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-cyan-200/90">
            {icon}
          </div>
          <div>
            <div className="text-base font-semibold tracking-tight">
              {title}
            </div>
            <div className="mt-1 text-sm text-zinc-400">{description}</div>
          </div>
        </div>

        {actionLabel ? (
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
            <Button variant="outline">
              <FiZap className="mr-2 h-4 w-4" />
              {actionLabel}
            </Button>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}

function IconButtonWithBadge({
  badgeCount,
  ariaLabel,
  children,
}: {
  badgeCount: number;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative inline-flex">
      {children}
      {badgeCount > 0 ? (
        <span
          aria-label={`${ariaLabel}: ${badgeCount}`}
          className="pointer-events-none absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-white/10 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-300 px-1 text-[10px] font-semibold text-black shadow-[0_10px_30px_-18px_rgba(0,0,0,0.9)]"
        >
          {badgeCount > 99 ? "99+" : badgeCount}
        </span>
      ) : null}
    </div>
  );
}

function formatNumber(n: number) {
  if (n >= 1_000_000) return `${trimZero((n / 1_000_000).toFixed(1))}M`;
  if (n >= 1_000) return `${trimZero((n / 1_000).toFixed(1))}k`;
  return String(n);
}

function trimZero(s: string) {
  return s.endsWith(".0") ? s.slice(0, -2) : s;
}

function prettyDate(iso: string) {
  const [y, m, d] = iso.split("-").map((x) => Number(x));
  const dt = new Date(y, (m || 1) - 1, d || 1);
  return dt.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
