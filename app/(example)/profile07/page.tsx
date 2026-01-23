"use client";

import * as React from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  Bell,
  Flag,
  Gift,
  Heart,
  MessageCircle,
  Repeat2,
  Share2,
  ShieldAlert,
  Sparkles,
  UserPlus,
} from "lucide-react";


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

  // ➕ extra mock fields (allowed)
  bio: "Full-stack builder. Anime + comics addict. Shipping features faster than my watchlist grows.",
  followers: 12840,
  following: 312,
  popularity: 92,
  joinDate: new Date("2024-03-09"),
  titleRank: "Aurora Rookie",
  bestCharacter: "Monkey D. Luffy",
  bestAnime: "One Piece",
  xp: { current: 320, next: 500 },
  anime: {
    viewed: 268,
    favorites: 41,
    dropped: 12,
    watching: 8,
    finished: 244,
    rated: 117,
    bestAnime: "One Piece",
    bestCharacter: "Zoro",
  },
  comics: {
    viewed: 96,
    favorites: 19,
    dropped: 4,
    reading: 6,
    finished: 86,
    rated: 44,
    bestComics: "Berserk",
    bestCharacter: "Guts",
  },
};

type TabKey =
  | "General"
  | "Popularities"
  | "Gallery"
  | "Swipes"
  | "Lists"
  | "Favorites"
  | "Ratings"
  | "Reviews";

const TABS: TabKey[] = [
  "General",
  "Popularities",
  "Gallery",
  "Swipes",
  "Lists",
  "Favorites",
  "Ratings",
  "Reviews",
];

function safeDate(d: Date | unknown): Date | null {
  if (!(d instanceof Date)) return null;
  const t = d.getTime();
  if (Number.isNaN(t)) return null;
  return d;
}

function formatDate(d: Date | null) {
  if (!d) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "2-digit" }).format(d);
  } catch {
    return d.toDateString();
  }
}

function compactNumber(n: number) {
  try {
    return new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(n);
  } catch {
    return String(n);
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function GlassCard(props: React.PropsWithChildren<{ className?: string; title?: string; right?: React.ReactNode }>) {
  return (
    <div
      className={classNames(
        "relative overflow-hidden rounded-2xl border border-border-subtle",
        "bg-card/55 backdrop-blur-xl",
        "shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_18px_60px_rgba(0,200,200,0.12)]",
        "transition-shadow hover:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_22px_80px_rgba(0,220,220,0.18)]",
        props.className
      )}
    >
      {/* subtle aurora wash */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -top-24 left-10 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -bottom-24 right-8 h-56 w-56 rounded-full bg-accent/15 blur-3xl" />
      </div>

      {(props.title || props.right) && (
        <div className="relative flex items-center justify-between gap-3 border-b border-border-subtle px-5 py-4">
          {props.title ? (
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Sparkles className="h-4 w-4 text-foreground-muted" />
              <span>{props.title}</span>
            </div>
          ) : (
            <div />
          )}
          {props.right}
        </div>
      )}

      <div className="relative px-5 py-5">{props.children}</div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-foreground-muted">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className={classNames(
        "inline-flex items-center gap-2 rounded-full border border-border-subtle",
        "bg-surface/55 px-3 py-1 text-xs font-semibold text-foreground",
        "shadow-[0_0_24px_rgba(0,220,220,0.20)]"
      )}
    >
      {children}
    </span>
  );
}

export default function AuroraGlassHeroProfilePage() {
  const [tab, setTab] = React.useState<TabKey>("General");

  const dobSafe = safeDate(UserData.dob) ?? safeDate(new Date("2000-08-25"));
  const joinSafe = safeDate(UserData.joinDate) ?? null;

  const fullName = `${UserData.first_name} ${UserData.last_name}`;
  const rankLabel = UserData.rank.replaceAll("_", " ");

  const xpPct = clamp(Math.round((UserData.xp.current / UserData.xp.next) * 100), 0, 100);

  // subtle parallax (short + safe)
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 120, damping: 18, mass: 0.2 });
  const sy = useSpring(my, { stiffness: 120, damping: 18, mass: 0.2 });
  const bgX = useTransform(sx, (v) => v * 0.35);
  const bgY = useTransform(sy, (v) => v * 0.35);
  const contentX = useTransform(sx, (v) => v * 0.15);
  const contentY = useTransform(sy, (v) => v * 0.15);

  const onHeaderMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    mx.set((px - 0.5) * 18);
    my.set((py - 0.5) * 18);
  };

  const onHeaderLeave = () => {
    mx.set(0);
    my.set(0);
  };

  const posts = React.useMemo(
    () => [
      {
        id: "p1",
        time: "2h",
        text: "Ship just landed 🚀 Profile revamp is live. Next: community swipes + aurora reactions.",
        tags: ["#Fanaara", "#NextJS", "#Anime"],
        likes: 124,
        comments: 18,
      },
      {
        id: "p2",
        time: "1d",
        text: "Hot take: the best onboarding is a clean profile + instant friends. No walls, only vibes.",
        tags: ["#UX", "#Community", "#Glassmorphism"],
        likes: 301,
        comments: 44,
      },
      {
        id: "p3",
        time: "3d",
        text: "Rewatching arcs like it's cardio. If you know, you know.",
        tags: ["#OnePiece", "#Rewatch"],
        likes: 88,
        comments: 9,
      },
    ],
    []
  );

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* HEADER / COVER */}
      <div
        className="relative isolate w-full overflow-hidden"
        onPointerMove={onHeaderMove}
        onPointerLeave={onHeaderLeave}
      >
        <motion.div
          style={{ x: bgX, y: bgY }}
          className="absolute inset-0 -z-10 will-change-transform"
        >
          {/* background image */}
          <img
            src={UserData.bg.lg}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            draggable={false}
          />
          {/* overlay */}
          <div className="absolute inset-0 bg-background/70" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-black/60" />
          {/* aurora glow */}
          <div className="pointer-events-none absolute -top-24 left-1/4 h-80 w-80 -translate-x-1/2 rounded-full bg-accent/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 right-1/4 h-80 w-80 translate-x-1/2 rounded-full bg-accent/20 blur-3xl" />
        </motion.div>

        {/* corner actions */}
        <div className="absolute left-3 top-3 z-20 flex items-center gap-2">
          <IconButton aria-label="Report profile" className="bg-surface/50 backdrop-blur-md">
            <ShieldAlert className="h-5 w-5" />
          </IconButton>
          <IconButton aria-label="Report" className="bg-surface/50 backdrop-blur-md">
            <Flag className="h-5 w-5" />
          </IconButton>
        </div>

        <div className="absolute right-3 top-3 z-20 flex items-center gap-2">
          <IconButton aria-label="Share profile" className="bg-surface/50 backdrop-blur-md">
            <Share2 className="h-5 w-5" />
          </IconButton>
        </div>

        <motion.div
          style={{ x: contentX, y: contentY }}
          className="relative mx-auto flex max-w-6xl flex-col items-center px-4 pb-7 pt-14 text-center"
        >
          {/* avatar */}
          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-full blur-2xl" />
            <Avatar
              src={UserData.avatar.md}
              alt={UserData.username}
              rankBorder={RanksBorders[UserData.rank]}
              className="h-28 w-28 md:h-32 md:w-32"
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <Pill>
              <span className="capitalize">{rankLabel}</span>
              <span className="text-foreground-muted">•</span>
              <span className="text-foreground-muted">{UserData.titleRank}</span>
            </Pill>

            <div className="flex items-center gap-2 rounded-full border border-border-subtle bg-surface/55 px-3 py-1 backdrop-blur-md">
              <span className="text-xs font-semibold text-foreground">XP</span>
              <div className="h-2 w-28 overflow-hidden rounded-full bg-background-elevated">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${xpPct}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-foreground-muted">{xpPct}%</span>
            </div>
          </div>

          <h1 className="mt-4 text-balance text-2xl font-bold tracking-tight md:text-3xl">{fullName}</h1>
          <p className="mt-1 text-sm text-foreground-muted">@{UserData.username}</p>

          {/* action row */}
          <div className="mt-5 flex w-full flex-wrap items-center justify-center gap-2">
            <Button
              className={classNames(
                "relative overflow-hidden",
                "bg-gradient-to-r from-accent/90 via-accent/70 to-accent/90",
                "text-foreground shadow-[0_0_40px_rgba(0,220,220,0.25)] hover:shadow-[0_0_60px_rgba(0,240,240,0.30)]"
              )}
            >
              <span className="inline-flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Follow
              </span>
            </Button>

            <Button className="bg-accent-soft text-foreground hover:bg-accent-soft/80">
              Send Popularity
            </Button>

            <div className="relative">
              <IconButton aria-label="Notifications" className="bg-surface/60 backdrop-blur-md">
                <Bell className="h-5 w-5" />
              </IconButton>
              {/* badgeCount fake (3) */}
              <span className="pointer-events-none absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-foreground shadow-[0_0_18px_rgba(0,220,220,0.35)]">
                3
              </span>
            </div>

            <Button className="bg-surface/60 text-foreground hover:bg-surface/75 backdrop-blur-md">
              Navigate to Chat
            </Button>

            <IconButton aria-label="Send gift" className="bg-surface/60 backdrop-blur-md">
              <Gift className="h-5 w-5" />
            </IconButton>
          </div>
        </motion.div>

        {/* bottom fade into page */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-transparent to-bg-background" />
      </div>

      {/* TABS */}
      <div className="mx-auto w-full max-w-6xl px-4">
        <div
          className={classNames(
            "sticky top-0 z-10 -mx-4 mt-0 px-4 py-3",
            "bg-background/80 backdrop-blur-xl",
            "border-b border-border-subtle"
          )}
        >
          <div className="relative">
            <div className="flex gap-2 overflow-x-auto whitespace-nowrap pb-1 [-webkit-overflow-scrolling:touch]">
              {TABS.map((t) => {
                const active = t === tab;
                return (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={classNames(
                      "relative rounded-full px-4 py-2 text-sm font-semibold transition",
                      active ? "text-foreground" : "text-foreground-muted hover:text-foreground",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                    )}
                  >
                    <span className="relative z-10">{t}</span>
                    {active && (
                      <motion.span
                        layoutId="tab-indicator"
                        transition={{ type: "spring", stiffness: 520, damping: 38 }}
                        className={classNames(
                          "absolute inset-0 -z-0 rounded-full",
                          "bg-surface/70 border border-border-subtle",
                          "shadow-[0_0_30px_rgba(0,220,220,0.18)]"
                        )}
                      />
                    )}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 h-px bg-border-subtle" />
          </div>
        </div>

        {/* CONTENT */}
        <div className="py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
              transition={{ duration: 0.22 }}
            >
              {tab === "General" ? (
                <div className="space-y-6">
                  {/* Section A: 3 cards grid */}
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <GlassCard
                      title="Basic details"
                      right={
                        <Pill>
                          <span className="text-foreground-muted">Popularity</span>
                          <span className="font-bold text-foreground">{UserData.popularity}</span>
                        </Pill>
                      }
                    >
                      <p className="mb-4 text-sm text-foreground">{UserData.bio}</p>
                      <div className="space-y-3">
                        <StatRow label="Followers" value={compactNumber(UserData.followers)} />
                        <StatRow label="Following" value={compactNumber(UserData.following)} />
                        <StatRow label="Join date" value={formatDate(joinSafe)} />
                        <StatRow label="Country" value={UserData.country.toUpperCase()} />
                        <StatRow label="Gender" value={UserData.gender} />
                        <StatRow label="DOB" value={formatDate(dobSafe)} />
                        <StatRow label="Best character" value={UserData.bestCharacter} />
                        <StatRow label="Title rank" value={UserData.titleRank} />
                      </div>
                    </GlassCard>

                    <GlassCard
                      title="Anime stats"
                      right={
                        <Pill>
                          <span className="text-foreground-muted">Viewed</span>
                          <span className="font-bold text-foreground">{UserData.anime.viewed}</span>
                        </Pill>
                      }
                    >
                      <div className="space-y-3">
                        <StatRow label="Watching" value={UserData.anime.watching} />
                        <StatRow label="Finished" value={UserData.anime.finished} />
                        <StatRow label="Dropped" value={UserData.anime.dropped} />
                        <StatRow label="Favorites" value={UserData.anime.favorites} />
                        <StatRow label="Rated" value={UserData.anime.rated} />
                        <div className="mt-3 rounded-xl border border-border-subtle bg-surface/45 px-4 py-3">
                          <div className="text-xs font-semibold text-foreground-muted">Best picks</div>
                          <div className="mt-1 text-sm font-semibold text-foreground">
                            {UserData.anime.bestAnime} • {UserData.anime.bestCharacter}
                          </div>
                        </div>
                        <Button className="mt-4 w-full bg-accent-soft text-foreground hover:bg-accent-soft/80">
                          Open Anime List
                        </Button>
                      </div>
                    </GlassCard>

                    <GlassCard
                      title="Comics stats"
                      right={
                        <Pill>
                          <span className="text-foreground-muted">Viewed</span>
                          <span className="font-bold text-foreground">{UserData.comics.viewed}</span>
                        </Pill>
                      }
                    >
                      <div className="space-y-3">
                        <StatRow label="Reading" value={UserData.comics.reading} />
                        <StatRow label="Finished" value={UserData.comics.finished} />
                        <StatRow label="Dropped" value={UserData.comics.dropped} />
                        <StatRow label="Favorites" value={UserData.comics.favorites} />
                        <StatRow label="Rated" value={UserData.comics.rated} />
                        <div className="mt-3 rounded-xl border border-border-subtle bg-surface/45 px-4 py-3">
                          <div className="text-xs font-semibold text-foreground-muted">Best picks</div>
                          <div className="mt-1 text-sm font-semibold text-foreground">
                            {UserData.comics.bestComics} • {UserData.comics.bestCharacter}
                          </div>
                        </div>
                        <Button className="mt-4 w-full bg-accent-soft text-foreground hover:bg-accent-soft/80">
                          Open Comics List
                        </Button>
                      </div>
                    </GlassCard>
                  </div>

                  {/* Section B: posts */}
                  <div className="space-y-4">
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-bold text-foreground">Posts</h2>
                        <p className="text-sm text-foreground-muted">Fresh updates from @{UserData.username}</p>
                      </div>
                      <Button className="bg-surface/60 text-foreground hover:bg-surface/75 backdrop-blur-md">
                        View all
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {posts.map((p) => (
                        <GlassCard key={p.id} className="rounded-2xl" title={undefined}>
                          <div className="flex items-start gap-3">
                            <Avatar
                              src={UserData.avatar.md}
                              alt={UserData.username}
                              className="h-10 w-10"
                              rankBorder={RanksBorders[UserData.rank]}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                <div className="text-sm font-semibold text-foreground">{fullName}</div>
                                <div className="text-sm text-foreground-muted">@{UserData.username}</div>
                                <span className="text-xs text-foreground-muted">•</span>
                                <div className="text-xs text-foreground-muted">{p.time} ago</div>
                              </div>

                              <p className="mt-2 text-sm text-foreground">{p.text}</p>

                              <div className="mt-3 flex flex-wrap gap-2">
                                {p.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="rounded-full border border-border-subtle bg-surface/45 px-3 py-1 text-xs font-semibold text-foreground-muted"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>

                              <div className="mt-4 flex flex-wrap items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <IconButton aria-label="Like post" className="bg-surface/55 backdrop-blur-md">
                                    <Heart className="h-5 w-5" />
                                  </IconButton>
                                  <span className="text-xs font-semibold text-foreground-muted">{p.likes}</span>
                                </div>

                                <div className="flex items-center gap-1">
                                  <IconButton aria-label="Comment on post" className="bg-surface/55 backdrop-blur-md">
                                    <MessageCircle className="h-5 w-5" />
                                  </IconButton>
                                  <span className="text-xs font-semibold text-foreground-muted">{p.comments}</span>
                                </div>

                                <IconButton aria-label="Repost" className="bg-surface/55 backdrop-blur-md">
                                  <Repeat2 className="h-5 w-5" />
                                </IconButton>

                                <div className="ml-auto">
                                  <IconButton aria-label="Share post" className="bg-surface/55 backdrop-blur-md">
                                    <Share2 className="h-5 w-5" />
                                  </IconButton>
                                </div>
                              </div>
                            </div>
                          </div>
                        </GlassCard>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <GlassCard
                  title={tab}
                  right={
                    <Pill>
                      <span className="text-foreground-muted">Coming</span>
                      <span className="font-bold text-foreground">Soon</span>
                    </Pill>
                  }
                >
                  <div className="space-y-3">
                    <p className="text-sm text-foreground-muted">
                      This section is a clean placeholder for now. Plug your real data + lists here.
                    </p>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div className="rounded-2xl border border-border-subtle bg-surface/45 p-4">
                        <div className="text-sm font-semibold text-foreground">Suggested content</div>
                        <div className="mt-1 text-sm text-foreground-muted">
                          Cards, masonry grids, swipe stacks, filters, pagination.
                        </div>
                      </div>
                      <div className="rounded-2xl border border-border-subtle bg-surface/45 p-4">
                        <div className="text-sm font-semibold text-foreground">Animation hooks</div>
                        <div className="mt-1 text-sm text-foreground-muted">
                          Add skeletons, list transitions, and shared-layout previews.
                        </div>
                      </div>
                    </div>

                    <Button className="bg-accent-soft text-foreground hover:bg-accent-soft/80">
                      Add real {tab.toLowerCase()} data
                    </Button>
                  </div>
                </GlassCard>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
