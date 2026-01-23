"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  Bell,
  Camera,
  Dot,
  Flag,
  Gift,
  Heart,
  Image as ImageIcon,
  LayoutGrid,
  Link2,
  List,
  MessageCircle,
  MoreVertical,
  ScanEye,
  ShieldAlert,
  Sparkles,
  Star,
  Swords,
  ThumbsUp,
  Users,
} from "lucide-react";

// Assume these exist in your design system and are importable:
import { Button } from "@/design/Button";
import { IconButton } from "@/design/IconButton";
import { Avatar } from "@/design/Avatar";

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
  avatar: { md: "https://avatarfiles.alphacoders.com/367/thumb-350-367476.webp" },
  bg: { lg: "https://images4.alphacoders.com/136/thumbbig-1369866.webp" },
} as const;

type TabKey =
  | "about"
  | "popularities"
  | "gallery"
  | "swipes"
  | "lists"
  | "favorites"
  | "ratings"
  | "reviews";

const TABS: Array<{ key: TabKey; label: string; icon: React.ElementType }> = [
  { key: "about", label: "General / About", icon: BadgeCheck },
  { key: "popularities", label: "Popularities", icon: Heart },
  { key: "gallery", label: "Gallery", icon: ImageIcon },
  { key: "swipes", label: "Swipes", icon: ScanEye },
  { key: "lists", label: "Lists", icon: List },
  { key: "favorites", label: "Favorites", icon: Star },
  { key: "ratings", label: "Ratings", icon: Star },
  { key: "reviews", label: "Reviews", icon: MessageCircle },
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function titleCaseRank(rank: string) {
  return rank
    .split("_")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function safeDate(d: Date) {
  const t = d?.getTime?.();
  if (!t || Number.isNaN(t)) return null;
  return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "2-digit" }).format(d);
}

function StatPill({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-border-subtle bg-surface/50 px-3 py-1.5 backdrop-blur">
      <Icon className="h-4 w-4 text-foreground/80" />
      <span className="text-xs text-foreground/70">{label}</span>
      <span className="text-xs font-semibold text-foreground">{value}</span>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5 rounded-md border border-border-subtle bg-surface/50 p-1.5 backdrop-blur">
        <Icon className="h-4 w-4 text-foreground/80" />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-foreground/60">{label}</div>
        <div className="truncate text-sm font-medium text-foreground">{value}</div>
      </div>
    </div>
  );
}

function CardShell({
  title,
  icon: Icon,
  right,
  children,
  className,
}: {
  title: string;
  icon: React.ElementType;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border-subtle bg-card/60 p-4 shadow-sm backdrop-blur",
        "hover:border-border-subtle/80",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute -left-20 -top-24 h-56 w-56 rounded-full bg-gradient-to-br from-accent/20 via-accent/10 to-transparent blur-2xl" />
        <div className="absolute -right-24 -bottom-28 h-64 w-64 rounded-full bg-gradient-to-tr from-accent/15 via-accent/10 to-transparent blur-2xl" />
      </div>

      <div className="relative mb-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="rounded-lg border border-border-subtle bg-surface/60 p-2 backdrop-blur">
            <Icon className="h-4 w-4 text-foreground/90" />
          </div>
          <h3 className="truncate text-sm font-semibold text-foreground">{title}</h3>
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>

      <div className="relative">{children}</div>
    </motion.section>
  );
}

function EmptyState({
  title,
  subtitle,
  icon: Icon,
  ctaLabel = "Explore",
}: {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  ctaLabel?: string;
}) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center justify-center rounded-2xl border border-border-subtle bg-card/50 p-8 text-center backdrop-blur">
      <div className="mb-4 rounded-2xl border border-border-subtle bg-surface/60 p-4 backdrop-blur">
        <Icon className="h-10 w-10 text-foreground/80" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-foreground/70">{subtitle}</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Button className="group">
          <LayoutGrid className="mr-2 h-4 w-4" />
          {ctaLabel}
        </Button>
        <Button variant="secondary" className="group">
          <Users className="mr-2 h-4 w-4" />
          Find Friends
        </Button>
      </div>
    </div>
  );
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={cn("skeleton-shimmer rounded-xl", className)} aria-hidden="true" />;
}

export default function Page() {
  const [active, setActive] = React.useState<TabKey>("about");
  const [loading, setLoading] = React.useState(false);

  const fullName = `${UserData.first_name} ${UserData.last_name}`;
  const rankTitle = titleCaseRank(UserData.rank);
  const joinDate = "Sep 2023";
  const dob = safeDate(UserData.dob) ?? "—";

  const profile = React.useMemo(
    () => ({
      bio: "Full-stack dev building Fanaara. I watch seasonal anime, collect manga, and rate openings like it’s my job.",
      followers: 12840,
      following: 312,
      popularity: 942,
      bestCharacter: "Monkey D. Luffy",
      bestAnime: "Fullmetal Alchemist: Brotherhood",
      bestComic: "One Piece (Manga)",
      titleRank: rankTitle,
    }),
    [rankTitle]
  );

  const animeStats = React.useMemo(
    () => ({
      viewed: 612,
      favorites: 48,
      dropped: 12,
      watching: 6,
      finished: 410,
      rated: 290,
      bestAnime: profile.bestAnime,
      bestCharacter: profile.bestCharacter,
    }),
    [profile.bestAnime, profile.bestCharacter]
  );

  const comicStats = React.useMemo(
    () => ({
      read: 235,
      favorites: 36,
      dropped: 9,
      reading: 4,
      finished: 180,
      rated: 140,
      bestComic: profile.bestComic,
      bestCharacter: profile.bestCharacter,
    }),
    [profile.bestComic, profile.bestCharacter]
  );

  const posts = React.useMemo(
    () => [
      {
        id: "p1",
        type: "Anime",
        title: "Winter season picks — underrated gems",
        excerpt:
          "A quick list of shows that surprised me this week. If you love tight pacing + strong character arcs, don’t skip these…",
        likes: 482,
        comments: 63,
      },
      {
        id: "p2",
        type: "Comics",
        title: "Manga paneling that made me pause",
        excerpt:
          "Some spreads just hit different. Here are 5 panels that feel like cinema — plus why the composition works.",
        likes: 317,
        comments: 41,
      },
      {
        id: "p3",
        type: "Review",
        title: "Review: A heartfelt arc with a shaky finale",
        excerpt:
          "Loved the emotional beats and the build-up, but the last episode rushed key payoffs. Still worth watching for the journey.",
        likes: 556,
        comments: 98,
      },
      {
        id: "p4",
        type: "Anime",
        title: "OP/ED ratings (with spicy takes)",
        excerpt:
          "Ranking openings by vibe, animation, and song replay value. Yes, I’m biased. No, I won’t apologize.",
        likes: 764,
        comments: 122,
      },
      {
        id: "p5",
        type: "Comics",
        title: "Current reads: what’s on my shelf",
        excerpt:
          "Rotating through classics and new releases — here’s what I’m reading, what I’ll drop, and what I’m hoarding.",
        likes: 211,
        comments: 19,
      },
    ],
    []
  );

  const badgeCount = 3;

  React.useEffect(() => {
    // Demo loading shimmer on tab switches (short + harmless)
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, [active]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* global shimmer */}
      <style jsx global>{`
        .skeleton-shimmer {
          position: relative;
          overflow: hidden;
          background: hsl(var(--card) / 0.55);
          border: 1px solid hsl(var(--border) / 0.6);
        }
        .skeleton-shimmer::after {
          content: "";
          position: absolute;
          inset: 0;
          transform: translateX(-100%);
          background: linear-gradient(
            90deg,
            transparent,
            hsl(var(--foreground) / 0.08),
            transparent
          );
          animation: shimmer 1.2s infinite;
        }
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative w-full"
      >
        <div className="relative h-[240px] w-full overflow-hidden sm:h-[300px] md:h-[360px]">
          {/* background */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${UserData.bg.lg})` }}
            aria-hidden="true"
          />
          {/* overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/55 to-background/90" />
          <div className="absolute inset-0 bg-background/20" />

          {/* top actions */}
          <div className="absolute left-3 top-3 sm:left-5 sm:top-5">
            <IconButton
              aria-label="Report user"
              className="bg-glass/60 backdrop-blur hover:bg-glass/80"
            >
              <ShieldAlert className="h-5 w-5 text-destructive" />
            </IconButton>
          </div>
          <div className="absolute right-3 top-3 sm:right-5 sm:top-5">
            <IconButton
              aria-label="Share profile"
              className="bg-glass/60 backdrop-blur hover:bg-glass/80"
            >
              <Link2 className="h-5 w-5 text-foreground/90" />
            </IconButton>
          </div>

          {/* bottom-centered profile strip */}
          <div className="absolute inset-x-0 bottom-0">
            <div className="mx-auto w-full max-w-6xl px-4 pb-4 sm:px-6 sm:pb-6">
              <div className="flex flex-col items-center gap-3 text-center md:flex-row md:items-end md:justify-between md:text-left">
                <div className="flex flex-col items-center gap-3 md:flex-row md:items-end">
                  {/* Avatar with border */}
                  <motion.div
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
                    className="relative"
                  >
                    <div className="relative rounded-full bg-glass/50 p-2 backdrop-blur">
                      <div className="relative">
                        <Avatar
                          // assume Avatar supports src + alt + size-ish classes
                          src={"https://mfiles.alphacoders.com/101/thumb-350-1013623.png"}
                          alt={fullName}
                          className="h-24 w-24 rounded-full border border-border-subtle sm:h-28 sm:w-28"
                        />
                        {/* rank border image overlay */}
                        <img
                          src={RanksBorders[UserData.rank]}
                          alt=""
                          className="pointer-events-none absolute -inset-3 h-[calc(100%+24px)] w-[calc(100%+24px)] select-none object-contain"
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Identity */}
                  <div className="flex flex-col items-center md:items-start">
                    <div className="mb-1 inline-flex items-center gap-1 rounded-full border border-border-subtle bg-glass/55 px-3 py-1 text-xs font-semibold backdrop-blur">
                      <Sparkles className="h-4 w-4 text-accent" />
                      <span className="text-foreground">{rankTitle}</span>
                    </div>

                    <div className="text-xl font-bold leading-tight sm:text-2xl">{fullName}</div>
                    <div className="mt-0.5 flex items-center justify-center gap-2 text-sm text-foreground/70 md:justify-start">
                      <span className="font-medium">@{UserData.username}</span>
                      <Dot className="h-4 w-4" />
                      <span className="uppercase">{UserData.country}</span>
                    </div>

                    {/* quick stats pills */}
                    <div className="mt-3 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                      <StatPill icon={Users} label="Followers" value={profile.followers.toLocaleString()} />
                      <StatPill icon={Users} label="Following" value={profile.following.toLocaleString()} />
                      <StatPill icon={Heart} label="Popularity" value={profile.popularity.toLocaleString()} />
                    </div>
                  </div>
                </div>

                {/* actions */}
                <div className="mt-3 flex w-full flex-wrap items-center justify-center gap-2 md:mt-0 md:w-auto md:justify-end">
                  <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
                    <Button className="w-full sm:w-auto">
                      <Users className="mr-2 h-4 w-4" />
                      Follow
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="secondary" className="w-full sm:w-auto">
                      <Heart className="mr-2 h-4 w-4" />
                      Send Popularity
                    </Button>
                  </motion.div>

                  <div className="relative">
                    <IconButton
                      aria-label="Notifications"
                      className="bg-glass/60 backdrop-blur hover:bg-glass/80"
                    >
                      <Bell className="h-5 w-5 text-foreground/90" />
                    </IconButton>
                    {badgeCount > 0 ? (
                      <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-border-subtle bg-accent px-1.5 text-[11px] font-bold text-accent-foreground">
                        {badgeCount}
                      </span>
                    ) : null}
                  </div>

                  <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="secondary" className="w-full sm:w-auto">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Go to Chat
                    </Button>
                  </motion.div>

                  <IconButton aria-label="Send gift" className="bg-glass/60 backdrop-blur hover:bg-glass/80">
                    <Gift className="h-5 w-5 text-foreground/90" />
                  </IconButton>

                  <IconButton aria-label="More actions" className="bg-glass/60 backdrop-blur hover:bg-glass/80">
                    <MoreVertical className="h-5 w-5 text-foreground/90" />
                  </IconButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Tabs */}
      <div className="relative z-10">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="mt-4">
            <div className="rounded-2xl border border-border-subtle bg-glass/50 p-2 backdrop-blur md:sticky md:top-3">
              <div className="no-scrollbar flex gap-1 overflow-x-auto">
                {TABS.map(({ key, label, icon: Icon }) => {
                  const isActive = active === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setActive(key)}
                      className={cn(
                        "relative flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition",
                        "hover:bg-surface/60",
                        isActive ? "text-foreground" : "text-foreground/70"
                      )}
                    >
                      <Icon className={cn("h-4 w-4 transition", isActive ? "scale-105 text-accent" : "")} />
                      <span className={cn("whitespace-nowrap", isActive ? "scale-[1.01]" : "")}>{label}</span>

                      {isActive ? (
                        <motion.div
                          layoutId="tab-underline"
                          className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-accent"
                          transition={{ type: "spring", stiffness: 420, damping: 30 }}
                        />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Panels */}
          <div className="mt-4 pb-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
                {active === "about" ? (
                  <div className="space-y-6">
                    {/* Section A: Cards grid */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                      <CardShell
                        title="Profile Details"
                        icon={BadgeCheck}
                        className="md:col-span-5"
                        right={
                          <div className="flex items-center gap-2">
                            <IconButton aria-label="Report" className="bg-surface/60 hover:bg-surface/80">
                              <Flag className="h-4 w-4 text-destructive" />
                            </IconButton>
                            <IconButton aria-label="More" className="bg-surface/60 hover:bg-surface/80">
                              <MoreVertical className="h-4 w-4 text-foreground/80" />
                            </IconButton>
                          </div>
                        }
                      >
                        {loading ? (
                          <div className="space-y-3">
                            <SkeletonBlock className="h-14 w-full" />
                            <div className="grid grid-cols-2 gap-3">
                              <SkeletonBlock className="h-12 w-full" />
                              <SkeletonBlock className="h-12 w-full" />
                              <SkeletonBlock className="h-12 w-full" />
                              <SkeletonBlock className="h-12 w-full" />
                            </div>
                            <SkeletonBlock className="h-12 w-full" />
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="rounded-2xl border border-border-subtle bg-surface/40 p-4 backdrop-blur">
                              <div className="mb-1 text-xs text-foreground/60">Bio</div>
                              <p className="text-sm text-foreground/85">{profile.bio}</p>
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              <InfoRow icon={Users} label="Followers" value={profile.followers.toLocaleString()} />
                              <InfoRow icon={Users} label="Following" value={profile.following.toLocaleString()} />
                              <InfoRow icon={Heart} label="Popularity" value={profile.popularity.toLocaleString()} />
                              <InfoRow icon={Sparkles} label="Title Rank" value={profile.titleRank} />
                              <InfoRow icon={Camera} label="Join Date" value={joinDate} />
                              <InfoRow
                                icon={Swords}
                                label="Best Character"
                                value={<span className="text-foreground/90">{profile.bestCharacter}</span>}
                              />
                              <InfoRow icon={Dot} label="Country" value={UserData.country.toUpperCase()} />
                              <InfoRow icon={Dot} label="Gender" value={UserData.gender} />
                              <InfoRow icon={Dot} label="Birthday" value={dob} />
                            </div>
                          </div>
                        )}
                      </CardShell>

                      <CardShell
                        title="Anime Stats"
                        icon={ScanEye}
                        className="md:col-span-7"
                        right={
                          <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
                            <Button variant="secondary" className="h-9">
                              <List className="mr-2 h-4 w-4" />
                              View Anime List
                            </Button>
                          </motion.div>
                        }
                      >
                        {loading ? (
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, i) => (
                              <SkeletonBlock key={i} className="h-16 w-full" />
                            ))}
                            <SkeletonBlock className="h-14 w-full sm:col-span-3" />
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            <div className="rounded-xl border border-border-subtle bg-surface/40 p-3 backdrop-blur">
                              <div className="text-xs text-foreground/60">Viewed</div>
                              <div className="mt-1 text-lg font-bold">{animeStats.viewed}</div>
                            </div>
                            <div className="rounded-xl border border-border-subtle bg-surface/40 p-3 backdrop-blur">
                              <div className="text-xs text-foreground/60">Favorites</div>
                              <div className="mt-1 text-lg font-bold">{animeStats.favorites}</div>
                            </div>
                            <div className="rounded-xl border border-border-subtle bg-surface/40 p-3 backdrop-blur">
                              <div className="text-xs text-foreground/60">Dropped</div>
                              <div className="mt-1 text-lg font-bold">{animeStats.dropped}</div>
                            </div>
                            <div className="rounded-xl border border-border-subtle bg-surface/40 p-3 backdrop-blur">
                              <div className="text-xs text-foreground/60">Watching</div>
                              <div className="mt-1 text-lg font-bold">{animeStats.watching}</div>
                            </div>
                            <div className="rounded-xl border border-border-subtle bg-surface/40 p-3 backdrop-blur">
                              <div className="text-xs text-foreground/60">Finished</div>
                              <div className="mt-1 text-lg font-bold">{animeStats.finished}</div>
                            </div>
                            <div className="rounded-xl border border-border-subtle bg-surface/40 p-3 backdrop-blur">
                              <div className="text-xs text-foreground/60">Rated</div>
                              <div className="mt-1 text-lg font-bold">{animeStats.rated}</div>
                            </div>

                            <div className="rounded-2xl border border-border-subtle bg-gradient-to-br from-accent/10 via-surface/40 to-transparent p-4 backdrop-blur sm:col-span-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-glass/55 px-3 py-1 text-xs font-semibold backdrop-blur">
                                  <Star className="h-4 w-4 text-accent" />
                                  Best Anime
                                </div>
                                <span className="text-sm font-semibold text-foreground">{animeStats.bestAnime}</span>
                              </div>
                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-glass/55 px-3 py-1 text-xs font-semibold backdrop-blur">
                                  <Swords className="h-4 w-4 text-accent" />
                                  Best Character
                                </div>
                                <span className="text-sm font-semibold text-foreground">{animeStats.bestCharacter}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardShell>

                      <CardShell
                        title="Comics Stats"
                        icon={LayoutGrid}
                        className="md:col-span-12"
                        right={
                          <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
                            <Button variant="secondary" className="h-9">
                              <List className="mr-2 h-4 w-4" />
                              View Comics List
                            </Button>
                          </motion.div>
                        }
                      >
                        {loading ? (
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
                            {Array.from({ length: 6 }).map((_, i) => (
                              <SkeletonBlock key={i} className="h-16 w-full" />
                            ))}
                            <SkeletonBlock className="h-14 w-full md:col-span-6" />
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
                            <div className="rounded-xl border border-border-subtle bg-surface/40 p-3 backdrop-blur">
                              <div className="text-xs text-foreground/60">Read</div>
                              <div className="mt-1 text-lg font-bold">{comicStats.read}</div>
                            </div>
                            <div className="rounded-xl border border-border-subtle bg-surface/40 p-3 backdrop-blur">
                              <div className="text-xs text-foreground/60">Favorites</div>
                              <div className="mt-1 text-lg font-bold">{comicStats.favorites}</div>
                            </div>
                            <div className="rounded-xl border border-border-subtle bg-surface/40 p-3 backdrop-blur">
                              <div className="text-xs text-foreground/60">Dropped</div>
                              <div className="mt-1 text-lg font-bold">{comicStats.dropped}</div>
                            </div>
                            <div className="rounded-xl border border-border-subtle bg-surface/40 p-3 backdrop-blur">
                              <div className="text-xs text-foreground/60">Reading</div>
                              <div className="mt-1 text-lg font-bold">{comicStats.reading}</div>
                            </div>
                            <div className="rounded-xl border border-border-subtle bg-surface/40 p-3 backdrop-blur">
                              <div className="text-xs text-foreground/60">Finished</div>
                              <div className="mt-1 text-lg font-bold">{comicStats.finished}</div>
                            </div>
                            <div className="rounded-xl border border-border-subtle bg-surface/40 p-3 backdrop-blur">
                              <div className="text-xs text-foreground/60">Rated</div>
                              <div className="mt-1 text-lg font-bold">{comicStats.rated}</div>
                            </div>

                            <div className="rounded-2xl border border-border-subtle bg-gradient-to-br from-accent/10 via-surface/40 to-transparent p-4 backdrop-blur md:col-span-6">
                              <div className="flex flex-wrap items-center gap-2">
                                <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-glass/55 px-3 py-1 text-xs font-semibold backdrop-blur">
                                  <Star className="h-4 w-4 text-accent" />
                                  Best Comic
                                </div>
                                <span className="text-sm font-semibold text-foreground">{comicStats.bestComic}</span>
                              </div>
                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-glass/55 px-3 py-1 text-xs font-semibold backdrop-blur">
                                  <Swords className="h-4 w-4 text-accent" />
                                  Best Character
                                </div>
                                <span className="text-sm font-semibold text-foreground">{comicStats.bestCharacter}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardShell>
                    </div>

                    {/* Section B: Posts feed */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg border border-border-subtle bg-surface/60 p-2 backdrop-blur">
                          <MessageCircle className="h-4 w-4 text-foreground/90" />
                        </div>
                        <h2 className="text-base font-semibold">Recent Posts</h2>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="secondary" className="h-9">
                          <Camera className="mr-2 h-4 w-4" />
                          New Post
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {(loading ? posts.slice(0, 4) : posts).slice(0, 6).map((p, idx) => (
                        <motion.article
                          key={p.id}
                          whileHover={{ y: -2 }}
                          transition={{ type: "spring", stiffness: 320, damping: 26 }}
                          className="group relative overflow-hidden rounded-2xl border border-border-subtle bg-card/60 p-4 backdrop-blur"
                        >
                          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                            <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-gradient-to-br from-accent/15 via-accent/10 to-transparent blur-2xl" />
                          </div>

                          {loading ? (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <SkeletonBlock className="h-6 w-28" />
                                <SkeletonBlock className="h-8 w-8 rounded-lg" />
                              </div>
                              <SkeletonBlock className="h-6 w-3/4" />
                              <SkeletonBlock className="h-16 w-full" />
                              <div className="flex gap-2">
                                <SkeletonBlock className="h-7 w-20 rounded-full" />
                                <SkeletonBlock className="h-7 w-24 rounded-full" />
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="relative flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border-subtle bg-glass/55 px-3 py-1 text-xs font-semibold backdrop-blur">
                                    {p.type === "Anime" ? (
                                      <ScanEye className="h-4 w-4 text-accent" />
                                    ) : p.type === "Comics" ? (
                                      <LayoutGrid className="h-4 w-4 text-accent" />
                                    ) : (
                                      <MessageCircle className="h-4 w-4 text-accent" />
                                    )}
                                    <span>{p.type}</span>
                                  </div>

                                  <h3 className="truncate text-base font-semibold text-foreground">{p.title}</h3>
                                  <p className="mt-1 line-clamp-3 text-sm text-foreground/75">{p.excerpt}</p>
                                </div>

                                <IconButton aria-label="Post menu" className="bg-surface/60 hover:bg-surface/80">
                                  <MoreVertical className="h-4 w-4 text-foreground/80" />
                                </IconButton>
                              </div>

                              <div className="relative mt-4 flex flex-wrap items-center gap-2">
                                <div className="flex items-center gap-2 rounded-full border border-border-subtle bg-surface/50 px-3 py-1.5 text-xs backdrop-blur">
                                  <ThumbsUp className="h-4 w-4 text-foreground/80" />
                                  <span className="text-foreground/70">Likes</span>
                                  <span className="font-semibold">{p.likes}</span>
                                </div>
                                <div className="flex items-center gap-2 rounded-full border border-border-subtle bg-surface/50 px-3 py-1.5 text-xs backdrop-blur">
                                  <MessageCircle className="h-4 w-4 text-foreground/80" />
                                  <span className="text-foreground/70">Comments</span>
                                  <span className="font-semibold">{p.comments}</span>
                                </div>

                                <div className="ml-auto flex items-center gap-2">
                                  <Button size="sm" variant="secondary" className="h-8">
                                    <Heart className="mr-2 h-4 w-4" />
                                    React
                                  </Button>
                                  <Button size="sm" className="h-8">
                                    <MessageCircle className="mr-2 h-4 w-4" />
                                    Reply
                                  </Button>
                                </div>
                              </div>
                            </>
                          )}
                        </motion.article>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="pt-2">
                    {/* other tabs placeholders */}
                    {active === "popularities" ? (
                      <EmptyState
                        title="No popularities to show yet"
                        subtitle="When fans send you popularity, you’ll see them here with highlights and streaks."
                        icon={Heart}
                        ctaLabel="Send Popularity"
                      />
                    ) : active === "gallery" ? (
                      <EmptyState
                        title="Gallery is empty"
                        subtitle="Share screenshots, panels, cosplay shots, or your latest merch haul."
                        icon={ImageIcon}
                        ctaLabel="Upload"
                      />
                    ) : active === "swipes" ? (
                      <EmptyState
                        title="Swipes coming soon"
                        subtitle="Swipe to discover anime, manga, and creators — and build your taste profile."
                        icon={ScanEye}
                        ctaLabel="Start Swiping"
                      />
                    ) : active === "lists" ? (
                      <EmptyState
                        title="No lists created"
                        subtitle="Make themed lists like “Rainy-day anime” or “Manga with insane art.”"
                        icon={List}
                        ctaLabel="Create List"
                      />
                    ) : active === "favorites" ? (
                      <EmptyState
                        title="No favorites yet"
                        subtitle="Add anime, manga, characters, and studios to favorites for quick access."
                        icon={Star}
                        ctaLabel="Browse Favorites"
                      />
                    ) : active === "ratings" ? (
                      <EmptyState
                        title="No ratings yet"
                        subtitle="Rate titles you’ve watched/read to refine recommendations."
                        icon={Star}
                        ctaLabel="Rate Something"
                      />
                    ) : (
                      <EmptyState
                        title="No reviews yet"
                        subtitle="Write a review to help the community discover what’s worth their time."
                        icon={MessageCircle}
                        ctaLabel="Write Review"
                      />
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* footer-ish subtle bar */}
      <div className="border-t border-border-subtle bg-surface/30">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-foreground/60 sm:px-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <span>Fanaara Profile • Mock UI</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <Dot className="h-4 w-4" /> Theme tokens only
            </span>
            <span className="inline-flex items-center gap-1">
              <Dot className="h-4 w-4" /> Motion + glass polish
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
