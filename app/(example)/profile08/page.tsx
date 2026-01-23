"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiBell,
  FiFlag,
  FiGift,
  FiMessageCircle,
  FiShare2,
  FiStar,
  FiThumbsUp,
  FiUserPlus,
  FiZap,
} from "react-icons/fi";


import { Button } from "@/design/Button";
import { IconButton } from "@/design/IconButton";
import { Avatar } from "@/design/Avatar";
/**
 * Provided (use as-is). Add fake missing data without changing these keys.
 */
const RanksBorders = {
  Rookie:
    "bg-[linear-gradient(135deg,hsl(var(--border-strong)/0.9),hsl(var(--border-strong)/0.2))] ring-2 ring-border-strong",
  Pro:
    "bg-[linear-gradient(135deg,hsl(var(--warning)/0.7),hsl(var(--warning)/0.15))] ring-2 ring-warning",
  Elite:
    "bg-[linear-gradient(135deg,hsl(var(--danger)/0.55),hsl(var(--warning)/0.18))] ring-2 ring-border-strong",
  Legend:
    "bg-[linear-gradient(135deg,hsl(var(--warning)/0.85),hsl(var(--danger)/0.25))] ring-2 ring-warning",
} as const;

const UserData = {
  id: "usr_fanaara_001",
  fullName: "Hana Kisaragi",
  username: "hana.ink",
  rank: "Elite" as keyof typeof RanksBorders,
  xp: 7420,
  xpToNext: 9000,
  avatarUrl:
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80",
  coverUrl:
    "https://images.unsplash.com/photo-1520975693411-bd3a1f66a2ab?auto=format&fit=crop&w=1600&q=80",
  stats: {
    followers: 12840,
    following: 314,
    posts: 286,
    popularity: 913,
  },
  basic: {
    location: "Jerusalem, IL",
    pronouns: "she/her",
    joined: "Oct 2023",
    bio: "I collect panels like memories. Shōnen heart, seinen taste. Here for the community ✦",
  },
  anime: {
    favoriteAnime: "Fullmetal Alchemist: Brotherhood",
    topGenres: ["Action", "Mystery", "Fantasy"],
    currentlyWatching: "Frieren: Beyond Journey’s End",
    ratingStyle: "Story-first, then vibes",
  },
  comics: {
    favoriteManga: "Vagabond",
    topAuthors: ["Inoue Takehiko", "Urasawa Naoki", "CLAMP"],
    currentlyReading: "Dandadan",
    collects: "Artbooks + tankōbon sets",
  },
} as const;

const TABS = [
  "General",
  "Popularities",
  "Gallery",
  "Swipes",
  "Lists",
  "Favorites",
  "Ratings",
  "Reviews",
] as const;
type TabKey = (typeof TABS)[number];

const POSTS = [
  {
    id: "p1",
    title: "Panel study: speed lines that *actually* feel fast",
    body: "Quick breakdown of 3 speed-line layouts + how to keep the eye moving without visual noise.",
    tags: ["art", "manga-panels", "tips"],
    likes: 412,
    pops: 38,
    time: "2h",
  },
  {
    id: "p2",
    title: "Best anime OST for late-night coding",
    body: "I swear a good OST is basically a focus potion. Drop your go-to tracks 👇",
    tags: ["anime", "music", "coding"],
    likes: 980,
    pops: 121,
    time: "1d",
  },
  {
    id: "p3",
    title: "New pickup: vintage CLAMP artbook ✦",
    body: "The composition is unreal. Every page feels like a finished poster.",
    tags: ["collection", "artbook", "comics"],
    likes: 631,
    pops: 77,
    time: "3d",
  },
  {
    id: "p4",
    title: "Hot take: slower pacing can hit harder",
    body: "Some of the most intense scenes are quiet. The pause IS the punch.",
    tags: ["discussion", "story", "seinen"],
    likes: 508,
    pops: 64,
    time: "5d",
  },
  {
    id: "p5",
    title: "Weekly reading log — what are you on?",
    body: "I’m deep in Dandadan again. The energy is chaotic-good perfection.",
    tags: ["reading", "manga", "weekly"],
    likes: 355,
    pops: 29,
    time: "1w",
  },
  {
    id: "p6",
    title: "Wallpaper drop: ink + amber highlights",
    body: "Minimal, punchy, and panel-ish. If you want, I can export phone sizes too.",
    tags: ["design", "wallpaper", "community"],
    likes: 774,
    pops: 103,
    time: "2w",
  },
] as const;

function clampPct(xp: number, max: number) {
  if (max <= 0) return 0;
  return Math.max(0, Math.min(100, (xp / max) * 100));
}

function Panel(props: {
  className?: string;
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
}) {
  const { as: As = "section", className = "", children } = props;
  return (
    <As
      className={[
        // manga panel vibe: heavier border + ink shadow + slight lift
        "relative rounded-2xl border-2 border-border-subtle bg-card/80 backdrop-blur",
        "shadow-[3px_3px_0_0_rgba(0,0,0,0.18)]",
        "transition-transform duration-200 hover:-translate-y-0.5",
        "hover:border-[3px] hover:border-border-strong hover:shadow-[4px_4px_0_0_rgba(0,0,0,0.22)]",
        "overflow-hidden",
        className,
      ].join(" ")}
    >
      {/* subtle “paper grain / dots” */}
      <div
        aria-hidden="true"
        className={[
          "pointer-events-none absolute inset-0 opacity-[0.35]",
          "bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.14)_1px,transparent_0)]",
          "bg-[size:14px_14px]",
        ].join(" ")}
      />
      <div className="relative">{children}</div>
    </As>
  );
}

function KeyValueList(props: {
  items: Array<{ label: string; value: React.ReactNode }>;
}) {
  return (
    <div className="divide-y divide-border-subtle">
      {props.items.map((it) => (
        <div
          key={it.label}
          className="flex items-start justify-between gap-3 px-4 py-3"
        >
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {it.label}
          </div>
          <div className="text-sm text-foreground text-right">{it.value}</div>
        </div>
      ))}
    </div>
  );
}

function MiniXP(props: { xp: number; max: number }) {
  const pct = clampPct(props.xp, props.max);
  return (
    <div className="w-full max-w-[280px]">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-semibold tracking-wide">XP</span>
        <span>
          {props.xp.toLocaleString()} / {props.max.toLocaleString()}
        </span>
      </div>
      <div className="mt-2 h-2 w-full rounded-full border border-border-subtle bg-background/60 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-warning"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
        />
      </div>
    </div>
  );
}

function PostCard(props: (typeof POSTS)[number]) {
  return (
    <Panel className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold leading-snug">{props.title}</h4>
          <p className="mt-1 text-sm text-muted-foreground">{props.body}</p>
        </div>
        <span className="shrink-0 rounded-full border border-border-subtle bg-background/70 px-2 py-1 text-xs text-muted-foreground">
          {props.time}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {props.tags.map((t) => (
          <span
            key={t}
            className="rounded-full border border-border-subtle bg-background/70 px-2 py-1 text-xs"
          >
            #{t}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <FiThumbsUp aria-hidden="true" />
          {props.likes.toLocaleString()}
        </span>
        <span className="inline-flex items-center gap-1">
          <FiZap aria-hidden="true" />
          {props.pops.toLocaleString()}
        </span>
      </div>
    </Panel>
  );
}

export default function FanaaraProfilePage() {
  const [active, setActive] = React.useState<TabKey>("General");
  const [direction, setDirection] = React.useState<1 | -1>(1);

  const activeIndex = TABS.indexOf(active);

  function onTab(next: TabKey) {
    const nextIndex = TABS.indexOf(next);
    setDirection(nextIndex >= activeIndex ? 1 : -1);
    setActive(next);
  }

  const content = React.useMemo(() => {
    switch (active) {
      case "General":
        return (
          <div className="space-y-6">
            {/* Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Panel className="pb-1">
                <div className="flex items-center justify-between px-4 pt-4">
                  <h3 className="text-sm font-semibold tracking-wide">
                    Basic
                  </h3>
                  <span className="rounded-full border border-border-subtle bg-warning/15 px-2 py-1 text-xs font-semibold text-warning">
                    Profile
                  </span>
                </div>
                <div className="mt-3 border-t-2 border-border-subtle" />
                <KeyValueList
                  items={[
                    { label: "Location", value: UserData.basic.location },
                    { label: "Pronouns", value: UserData.basic.pronouns },
                    { label: "Joined", value: UserData.basic.joined },
                    {
                      label: "Bio",
                      value: (
                        <span className="inline-block max-w-[22ch] md:max-w-[18ch]">
                          {UserData.basic.bio}
                        </span>
                      ),
                    },
                  ]}
                />
              </Panel>

              <Panel className="pb-1">
                <div className="flex items-center justify-between px-4 pt-4">
                  <h3 className="text-sm font-semibold tracking-wide">Anime</h3>
                  <span className="rounded-full border border-border-subtle bg-warning/15 px-2 py-1 text-xs font-semibold text-warning">
                    Watchlist
                  </span>
                </div>
                <div className="mt-3 border-t-2 border-border-subtle" />
                <KeyValueList
                  items={[
                    {
                      label: "Favorite",
                      value: UserData.anime.favoriteAnime,
                    },
                    {
                      label: "Top genres",
                      value: UserData.anime.topGenres.join(" · "),
                    },
                    {
                      label: "Watching",
                      value: UserData.anime.currentlyWatching,
                    },
                    { label: "Style", value: UserData.anime.ratingStyle },
                  ]}
                />
              </Panel>

              <Panel className="pb-1">
                <div className="flex items-center justify-between px-4 pt-4">
                  <h3 className="text-sm font-semibold tracking-wide">Comics</h3>
                  <span className="rounded-full border border-border-subtle bg-warning/15 px-2 py-1 text-xs font-semibold text-warning">
                    Shelf
                  </span>
                </div>
                <div className="mt-3 border-t-2 border-border-subtle" />
                <KeyValueList
                  items={[
                    {
                      label: "Favorite",
                      value: UserData.comics.favoriteManga,
                    },
                    {
                      label: "Authors",
                      value: UserData.comics.topAuthors.join(" · "),
                    },
                    {
                      label: "Reading",
                      value: UserData.comics.currentlyReading,
                    },
                    { label: "Collects", value: UserData.comics.collects },
                  ]}
                />
              </Panel>
            </div>

            {/* Feed */}
            <Panel className="p-4">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold tracking-wide">
                    Posts
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Recent drops, studies, and community prompts.
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <span className="rounded-full border border-border-subtle bg-background/70 px-2 py-1 text-xs text-muted-foreground">
                    {UserData.stats.posts} total
                  </span>
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {POSTS.map((p) => (
                  <PostCard key={p.id} {...p} />
                ))}
              </div>
            </Panel>
          </div>
        );

      default:
        return (
          <div className="grid gap-4">
            <Panel className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold tracking-wide">
                    {active}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Panel-ready placeholder content. Plug in your real data
                    source when ready.
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-warning/15 px-3 py-1 text-xs font-semibold text-warning">
                  <FiStar aria-hidden="true" />
                  Manga vibe
                </span>
              </div>

              <div className="mt-4 border-t-2 border-border-subtle" />

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Panel key={i} className="p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {active} item #{i + 1}
                    </div>
                    <div className="mt-2 text-sm">
                      Add your {active.toLowerCase()} cards here.
                    </div>
                    <div className="mt-3 h-2 w-full rounded-full border border-border-subtle bg-background/60 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-warning"
                        initial={{ width: 0 }}
                        animate={{ width: `${(i + 1) * 12}%` }}
                        transition={{ type: "spring", stiffness: 260, damping: 28 }}
                      />
                    </div>
                  </Panel>
                ))}
              </div>
            </Panel>
          </div>
        );
    }
  }, [active]);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* HERO */}
      <div className="relative">
        <div
          className="relative h-56 sm:h-72 w-full overflow-hidden border-b-2 border-border-strong"
          style={{
            backgroundImage: `url(${UserData.coverUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.25),rgba(0,0,0,0.32),hsl(var(--background)/1))]" />
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-40 bg-[linear-gradient(90deg,rgba(0,0,0,0.18)_1px,transparent_1px)] bg-[size:22px_22px]"
          />

          {/* Top actions */}
          <div className="absolute left-3 top-3 right-3 flex items-center justify-between">
            <IconButton aria-label="Report user">
              <FiFlag aria-hidden="true" />
            </IconButton>

            <IconButton aria-label="Share profile">
              <FiShare2 aria-hidden="true" />
            </IconButton>
          </div>
        </div>

        {/* PROFILE STACK */}
        <div className="mx-auto max-w-6xl px-4">
          <div className="relative -mt-14 sm:-mt-16">
            <Panel className="px-4 py-5 sm:px-6">
              <div className="flex flex-col items-center text-center gap-4">
                {/* avatar + rank border */}
                <div className="relative">
                  <div
                    className={[
                      "rounded-full p-1.5",
                      RanksBorders[UserData.rank] ?? RanksBorders.Rookie,
                    ].join(" ")}
                  >
                    <div className="rounded-full bg-background p-1">
                      <Avatar
                        src={UserData.avatarUrl}
                        alt={`${UserData.fullName} avatar`}
                        className="h-20 w-20 sm:h-24 sm:w-24"
                      />
                    </div>
                  </div>

                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-2 rounded-full border-2 border-border-strong bg-background/80 px-3 py-1 text-xs font-semibold shadow-[2px_2px_0_0_rgba(0,0,0,0.2)]">
                      <span className="h-2 w-2 rounded-full bg-warning" />
                      {UserData.rank}
                    </span>
                  </div>
                </div>

                {/* names */}
                <div className="pt-2">
                  <div className="text-xl sm:text-2xl font-bold leading-tight">
                    {UserData.fullName}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    @{UserData.username}
                  </div>
                </div>

                {/* XP */}
                <MiniXP xp={UserData.xp} max={UserData.xpToNext} />

                {/* stats */}
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="rounded-full border border-border-subtle bg-background/70 px-3 py-1 text-xs">
                    <span className="font-semibold">
                      {UserData.stats.followers.toLocaleString()}
                    </span>{" "}
                    followers
                  </span>
                  <span className="rounded-full border border-border-subtle bg-background/70 px-3 py-1 text-xs">
                    <span className="font-semibold">
                      {UserData.stats.following.toLocaleString()}
                    </span>{" "}
                    following
                  </span>
                  <span className="rounded-full border border-border-subtle bg-background/70 px-3 py-1 text-xs">
                    <span className="font-semibold">
                      {UserData.stats.popularity.toLocaleString()}
                    </span>{" "}
                    popularity
                  </span>
                </div>

                {/* actions */}
                <div className="mt-1 flex w-full flex-wrap items-center justify-center gap-2">
                  <Button className="min-w-[140px]">
                    <span className="inline-flex items-center gap-2">
                      <FiUserPlus aria-hidden="true" />
                      Follow
                    </span>
                  </Button>

                  <Button className="min-w-[170px] border-2 border-warning bg-warning/10 hover:bg-warning/15">
                    <span className="inline-flex items-center gap-2">
                      <FiZap aria-hidden="true" />
                      Send Popularity
                    </span>
                  </Button>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <IconButton aria-label="Notifications">
                        <FiBell aria-hidden="true" />
                      </IconButton>
                      <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full border-2 border-background bg-danger px-1 text-[10px] font-bold text-white">
                        3
                      </span>
                    </div>

                    <IconButton aria-label="Open chat">
                      <FiMessageCircle aria-hidden="true" />
                    </IconButton>

                    <IconButton aria-label="Send gift">
                      <FiGift aria-hidden="true" />
                    </IconButton>
                  </div>
                </div>
              </div>
            </Panel>
          </div>

          {/* TABS */}
          <div className="mt-4">
            <div className="sticky top-2 z-10">
              <Panel className="p-2">
                <div className="relative flex flex-wrap items-center gap-1">
                  {TABS.map((t) => {
                    const isActive = t === active;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => onTab(t)}
                        className={[
                          "relative rounded-xl px-3 py-2 text-sm font-semibold",
                          "transition-colors",
                          isActive
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground",
                        ].join(" ")}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="tabIndicator"
                            className={[
                              "absolute inset-0 -z-10 rounded-xl",
                              "border-2 border-border-strong",
                              "bg-warning/10",
                              "shadow-[2px_2px_0_0_rgba(0,0,0,0.16)]",
                            ].join(" ")}
                            transition={{
                              type: "spring",
                              stiffness: 520,
                              damping: 40,
                            }}
                          />
                        )}
                        <span className="relative">{t}</span>
                      </button>
                    );
                  })}
                </div>
              </Panel>
            </div>

            {/* CONTENT */}
            <div className="mt-4 pb-10">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={active}
                  initial={{ opacity: 0, x: direction * 26 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -direction * 26 }}
                  transition={{ type: "spring", stiffness: 320, damping: 30 }}
                >
                  {content}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
