"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Bookmark,
  ChevronRight,
  Flag,
  Gift,
  Heart,
  ImageIcon,
  List,
  MessageCircle,
  Share2,
  Sparkles,
  Star,
  ThumbsUp,
  UserPlus,
} from "lucide-react";

// ✅ Use your existing components (adjust import paths if needed)
import { Button } from "@/design/Button";
import { IconButton } from "@/design/IconButton";
import { Avatar } from "@/design/Avatar";
/**
 * IMPORTANT
 * You asked to use the exact provided `UserData` + `RanksBorders`.
 * I don’t have your codebase types in this chat, so I included lightweight local shapes
 * that you can safely replace with your exact imports (recommended).
 *
 * Replace the two `type` blocks below with:
 *   import type { UserData, RanksBorders } from "wherever/you/keep/them";
 */

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type UserData = {
  id: string;
  fullName: string;
  username: string;
  avatarUrl: string;
  coverUrl: string;
  rank: "Rookie" | "Bronze" | "Silver" | "Gold" | "Platinum" | "Legend";
  bio: string;
  location?: string;
  joinedAt: string; // ISO
  counts: {
    followers: number;
    following: number;
    popularity: number;
  };
  stats: {
    anime: { watching: number; completed: number; favorites: number; meanScore: number };
    comics: { reading: number; completed: number; favorites: number; meanScore: number };
  };
  tags: string[];
  topAnime: { title: string; score: number }[];
  topComics: { title: string; score: number }[];
  posts: Array<{
    id: string;
    createdAt: string; // ISO
    text: string;
    imageUrl?: string;
    reactions: { likes: number; upvotes: number; comments: number; saves: number };
  }>;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type RanksBorders = Record<UserData["rank"], { ring: string; chip: string; glow: string }>;

const RANKS_BORDERS: RanksBorders = {
  Rookie: {
    ring: "ring-muted-foreground/40",
    chip: "bg-muted text-foreground border-border",
    glow: "shadow-sm",
  },
  Bronze: {
    ring: "ring-secondary",
    chip: "bg-secondary text-secondary-foreground border-border",
    glow: "shadow-sm",
  },
  Silver: {
    ring: "ring-accent",
    chip: "bg-accent text-accent-foreground border-border",
    glow: "shadow-sm",
  },
  Gold: {
    ring: "ring-primary/70",
    chip: "bg-primary/10 text-primary border-primary/20",
    glow: "shadow-sm",
  },
  Platinum: {
    ring: "ring-primary",
    chip: "bg-primary/15 text-primary border-primary/25",
    glow: "shadow-sm",
  },
  Legend: {
    ring: "ring-primary",
    chip: "bg-primary text-primary-foreground border-primary/30",
    glow: "shadow-sm",
  },
};

type TabKey =
  | "about"
  | "popularities"
  | "gallery"
  | "swipes"
  | "lists"
  | "favorites"
  | "ratings"
  | "reviews";

const TABS: Array<{ key: TabKey; label: string; icon: React.ReactNode }> = [
  { key: "about", label: "About", icon: <Sparkles className="h-4 w-4" /> },
  { key: "popularities", label: "Popularities", icon: <Star className="h-4 w-4" /> },
  { key: "gallery", label: "Gallery", icon: <ImageIcon className="h-4 w-4" /> },
  { key: "swipes", label: "Swipes", icon: <ThumbsUp className="h-4 w-4" /> },
  { key: "lists", label: "Lists", icon: <List className="h-4 w-4" /> },
  { key: "favorites", label: "Favorites", icon: <Heart className="h-4 w-4" /> },
  { key: "ratings", label: "Ratings", icon: <Star className="h-4 w-4" /> },
  { key: "reviews", label: "Reviews", icon: <MessageCircle className="h-4 w-4" /> },
];

const MOCK_USER: UserData = {
  id: "usr_9dQ3k2",
  fullName: "Rin Aoyama",
  username: "rin.aoyama",
  avatarUrl:
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&h=256&q=80",
  coverUrl:
    "https://images.unsplash.com/photo-1520975958225-907119b1b1c4?auto=format&fit=crop&w=1600&q=80",
  rank: "Gold",
  bio:
    "Anime-first, comics-always. I collect cozy slice-of-life moments and chaotic shōnen arcs. Currently binging mecha classics and building my ultimate reading list.",
  location: "Haifa, IL",
  joinedAt: "2024-03-14T09:20:00.000Z",
  counts: {
    followers: 12840,
    following: 612,
    popularity: 87,
  },
  stats: {
    anime: { watching: 12, completed: 186, favorites: 33, meanScore: 8.4 },
    comics: { reading: 9, completed: 74, favorites: 21, meanScore: 8.1 },
  },
  tags: ["Slice of Life", "Mecha", "RomCom", "Sci-Fi", "Indie Comics", "Cosplay"],
  topAnime: [
    { title: "Neon Genesis Evangelion", score: 9.6 },
    { title: "Mob Psycho 100", score: 9.3 },
    { title: "Violet Evergarden", score: 9.2 },
  ],
  topComics: [
    { title: "Saga", score: 9.1 },
    { title: "Monstress", score: 8.9 },
    { title: "The Sandman", score: 8.8 },
  ],
  posts: [
    {
      id: "p1",
      createdAt: "2026-01-20T18:12:00.000Z",
      text:
        "Hot take: opening themes deserve the same tier lists as entire seasons. Drop your #1 OP that never gets skipped 👇",
      reactions: { likes: 184, upvotes: 98, comments: 42, saves: 31 },
    },
    {
      id: "p2",
      createdAt: "2026-01-18T12:05:00.000Z",
      text:
        "Finally started a mecha rewatch marathon. The sound design alone feels like a warm blanket of nostalgia.",
      imageUrl:
        "https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=1600&q=80",
      reactions: { likes: 402, upvotes: 163, comments: 77, saves: 64 },
    },
    {
      id: "p3",
      createdAt: "2026-01-16T09:41:00.000Z",
      text:
        "New reading list idea: 10 comics that feel like anime arcs. I’m drafting it—suggest titles!",
      reactions: { likes: 129, upvotes: 74, comments: 23, saves: 19 },
    },
  ],
};

function formatCompact(n: number) {
  return new Intl.NumberFormat(undefined, { notation: "compact" }).format(n);
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short" }).format(new Date(iso));
}

function Card(props: React.PropsWithChildren<{ title?: string; right?: React.ReactNode; className?: string }>) {
  return (
    <div
      className={[
        "rounded-2xl border border-border bg-card text-card-foreground shadow-sm",
        "p-4 sm:p-5",
        props.className ?? "",
      ].join(" ")}
    >
      {(props.title || props.right) && (
        <div className="mb-3 flex items-center justify-between gap-3">
          {props.title ? <h3 className="text-sm font-semibold">{props.title}</h3> : <div />}
          {props.right}
        </div>
      )}
      {props.children}
    </div>
  );
}

export default function FanaaraUserProfilePage() {
  const user = MOCK_USER;
  const rankUI = RANKS_BORDERS[user.rank];

  const [activeTab, setActiveTab] = React.useState<TabKey>("about");

  return (
    <main className="min-h-dvh bg-background text-foreground">
      {/* HEADER */}
      <section className="relative">
        <div className="relative h-[340px] sm:h-[380px] lg:h-[460px] w-full">
          <Image
            src={user.coverUrl}
            alt={`${user.fullName} cover`}
            fill
            priority
            className="object-cover"
          />

          {/* token-ish overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/35 to-background" />

          {/* Report + Share */}
          <div className="absolute left-3 top-3 sm:left-5 sm:top-5">
            <IconButton
              title="Report"
              aria-label="Report"
              variant="secondary"
              className="h-11 w-11 rounded-full border border-border bg-background/70 backdrop-blur"
            >
              <Flag className="h-5 w-5" />
            </IconButton>
          </div>
          <div className="absolute right-3 top-3 sm:right-5 sm:top-5">
            <IconButton
              title="Share"
              aria-label="Share"
              variant="secondary"
              className="h-11 w-11 rounded-full border border-border bg-background/70 backdrop-blur"
            >
              <Share2 className="h-5 w-5" />
            </IconButton>
          </div>

          {/* Glass panel */}
          <div className="absolute bottom-3 left-3 right-3 sm:bottom-5 sm:left-5 sm:right-5">
            <div className="rounded-2xl border border-border bg-background/70 backdrop-blur-md shadow-sm">
              <div className="p-4 sm:p-5">
                {/* Avatar block */}
                <div className="flex flex-col items-center text-center">
                  <div className={["rounded-full p-1 ring-2", rankUI.ring, rankUI.glow].join(" ")}>
                    <Avatar
                      src={user.avatarUrl}
                      alt={user.fullName}
                      className="h-20 w-20 sm:h-24 sm:w-24"
                    />
                  </div>

                  <div className="mt-3 flex flex-col items-center gap-2">
                    <span
                      className={[
                        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
                        rankUI.chip,
                      ].join(" ")}
                    >
                      <Star className="h-3.5 w-3.5" />
                      {user.rank}
                    </span>

                    <div>
                      <div className="text-lg font-semibold leading-tight sm:text-xl">{user.fullName}</div>
                      <div className="text-sm text-muted-foreground">@{user.username}</div>
                    </div>

                    {/* compact stats */}
                    <div className="mt-1 grid w-full max-w-sm grid-cols-3 gap-2">
                      <div className="rounded-xl border border-border bg-muted/40 p-2">
                        <div className="text-base font-semibold leading-none">{formatCompact(user.counts.followers)}</div>
                        <div className="mt-1 text-[11px] text-muted-foreground">Followers</div>
                      </div>
                      <div className="rounded-xl border border-border bg-muted/40 p-2">
                        <div className="text-base font-semibold leading-none">{formatCompact(user.counts.following)}</div>
                        <div className="mt-1 text-[11px] text-muted-foreground">Following</div>
                      </div>
                      <div className="rounded-xl border border-border bg-muted/40 p-2">
                        <div className="text-base font-semibold leading-none">{user.counts.popularity}</div>
                        <div className="mt-1 text-[11px] text-muted-foreground">Popularity</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions (thumb-friendly) */}
                <div className="mt-4 grid gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button className="h-12 w-full">
                      <UserPlus className="mr-2 h-5 w-5" />
                      Follow
                    </Button>
                    <Button variant="secondary" className="h-12 w-full">
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Chat
                    </Button>
                  </div>

                  <Button variant="outline" className="h-11 w-full">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Popularity Boost
                  </Button>

                  <div className="flex items-center justify-center gap-2 pt-1">
                    <IconButton
                      title="Notifications"
                      aria-label="Notifications"
                      variant="secondary"
                      className="h-11 w-11 rounded-full"
                    >
                      <Bell className="h-5 w-5" />
                    </IconButton>
                    <IconButton
                      title="Send Gift"
                      aria-label="Send Gift"
                      variant="secondary"
                      className="h-11 w-11 rounded-full"
                    >
                      <Gift className="h-5 w-5" />
                    </IconButton>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Spacer to blend into background on scroll */}
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-b from-background/0 to-background" />
        </div>
      </section>

      {/* TABS */}
      <section className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="relative mx-auto max-w-5xl px-3 sm:px-5">
          <div
            className={[
              "relative flex items-stretch gap-1 overflow-x-auto py-2",
              "snap-x snap-mandatory scroll-px-3",
              "md:justify-center md:overflow-visible md:snap-none",
            ].join(" ")}
          >
            {TABS.map((t) => {
              const isActive = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setActiveTab(t.key)}
                  className={[
                    "relative shrink-0 snap-start",
                    "px-3 py-2.5 sm:px-4",
                    "rounded-xl",
                    "text-sm font-medium",
                    "transition",
                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  <span className="flex items-center gap-2">
                    {t.icon}
                    {t.label}
                  </span>

                  {isActive && (
                    <motion.div
                      layoutId="profile-tab-underline"
                      className="absolute inset-x-2 -bottom-1 h-0.5 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 520, damping: 38 }}
                    />
                  )}
                </button>
              );
            })}

            {/* subtle swipe hint (mobile only) */}
            <div className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 md:hidden">
              <motion.div
                className="flex items-center gap-1 rounded-full border border-border bg-background/70 px-2 py-1 text-[11px] text-muted-foreground shadow-sm backdrop-blur"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              >
                <span>Swipe</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* PANELS */}
      <section className="mx-auto max-w-5xl px-3 pb-10 pt-4 sm:px-5 sm:pt-6">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {activeTab === "about" && <AboutPanel user={user} />}
            {activeTab === "popularities" && <PlaceholderPanel title="Popularities" />}
            {activeTab === "gallery" && <PlaceholderPanel title="Gallery" />}
            {activeTab === "swipes" && <PlaceholderPanel title="Swipes" />}
            {activeTab === "lists" && <PlaceholderPanel title="Lists" />}
            {activeTab === "favorites" && <PlaceholderPanel title="Favorites" />}
            {activeTab === "ratings" && <PlaceholderPanel title="Ratings" />}
            {activeTab === "reviews" && <PlaceholderPanel title="Reviews" />}
          </motion.div>
        </AnimatePresence>
      </section>
    </main>
  );
}

function AboutPanel({ user }: { user: UserData }) {
  const cards = React.useMemo(
    () => [
      { key: "basic", node: <BasicDetailsCard user={user} /> },
      { key: "anime", node: <AnimeStatsCard user={user} /> },
      { key: "comics", node: <ComicsStatsCard user={user} /> },
      { key: "posts", node: <PostsFeed user={user} /> },
    ],
    [user]
  );

  return (
    <div className="grid gap-3 sm:gap-4">
      {cards.map((c, idx) => (
        <motion.div
          key={c.key}
          initial={{ opacity: 0, y: 10, scale: 0.995 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.22, delay: idx * 0.04, ease: "easeOut" }}
        >
          {c.node}
        </motion.div>
      ))}
    </div>
  );
}

function BasicDetailsCard({ user }: { user: UserData }) {
  return (
    <Card
      title="Basic details"
      right={
        <span className="text-xs text-muted-foreground">
          Joined {formatDate(user.joinedAt)}
        </span>
      }
    >
      <p className="text-sm leading-relaxed text-foreground">{user.bio}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {user.location ? (
          <span className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
            {user.location}
          </span>
        ) : null}
        {user.tags.map((t) => (
          <span
            key={t}
            className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground"
          >
            {t}
          </span>
        ))}
      </div>
    </Card>
  );
}

function StatPill({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-muted/40 p-3">
      <div className="text-base font-semibold leading-none">{value}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}

function MiniRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 px-3 py-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

function AnimeStatsCard({ user }: { user: UserData }) {
  return (
    <Card title="Anime stats" right={<span className="text-xs text-muted-foreground">Mean score {user.stats.anime.meanScore}</span>}>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <StatPill label="Watching" value={user.stats.anime.watching} />
        <StatPill label="Completed" value={user.stats.anime.completed} />
        <StatPill label="Favorites" value={user.stats.anime.favorites} />
      </div>

      <div className="mt-3 grid gap-2">
        <div className="text-xs font-semibold text-muted-foreground">Top anime</div>
        {user.topAnime.map((a) => (
          <MiniRow key={a.title} label={a.title} value={a.score} />
        ))}
      </div>
    </Card>
  );
}

function ComicsStatsCard({ user }: { user: UserData }) {
  return (
    <Card title="Comics stats" right={<span className="text-xs text-muted-foreground">Mean score {user.stats.comics.meanScore}</span>}>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <StatPill label="Reading" value={user.stats.comics.reading} />
        <StatPill label="Completed" value={user.stats.comics.completed} />
        <StatPill label="Favorites" value={user.stats.comics.favorites} />
      </div>

      <div className="mt-3 grid gap-2">
        <div className="text-xs font-semibold text-muted-foreground">Top comics</div>
        {user.topComics.map((c) => (
          <MiniRow key={c.title} label={c.title} value={c.score} />
        ))}
      </div>
    </Card>
  );
}

function PostsFeed({ user }: { user: UserData }) {
  return (
    <Card
      title="Posts"
      right={<span className="text-xs text-muted-foreground">{user.posts.length} recent</span>}
      className="p-0"
    >
      <div className="p-4 sm:p-5">
        <div className="text-sm text-muted-foreground">
          Stacked cards with quick reactions (thumb-friendly).
        </div>
      </div>

      <div className="grid gap-3 px-4 pb-4 sm:px-5 sm:pb-5">
        {user.posts.map((p, idx) => (
          <motion.article
            key={p.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: idx * 0.04, ease: "easeOut" }}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
          >
            {p.imageUrl ? (
              <div className="relative aspect-[16/9] w-full overflow-hidden">
                <Image src={p.imageUrl} alt="Post image" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-background/0 to-background/25" />
              </div>
            ) : null}

            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm leading-relaxed">{p.text}</p>
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(p.createdAt))}
                </span>
              </div>

              {/* reactions */}
              <div className="mt-4 grid grid-cols-4 gap-2">
                <ReactionChip icon={<Heart className="h-4 w-4" />} label="Like" count={p.reactions.likes} />
                <ReactionChip icon={<ThumbsUp className="h-4 w-4" />} label="Upvote" count={p.reactions.upvotes} />
                <ReactionChip icon={<MessageCircle className="h-4 w-4" />} label="Comment" count={p.reactions.comments} />
                <ReactionChip icon={<Bookmark className="h-4 w-4" />} label="Save" count={p.reactions.saves} />
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </Card>
  );
}

function ReactionChip({
  icon,
  label,
  count,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-[11px] text-muted-foreground">{label}</span>
      </div>
      <span className="text-xs font-semibold">{formatCompact(count)}</span>
    </div>
  );
}

function PlaceholderPanel({ title }: { title: string }) {
  return (
    <div className="grid gap-3 sm:gap-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        <Card title={title}>
          <div className="text-sm text-muted-foreground">
            Panel skeleton — plug in your real content here (cards, grids, masonry, etc.).
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-muted/40 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                Highlight
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Mobile-first, card-stack friendly layout.
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-muted/40 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Star className="h-4 w-4 text-muted-foreground" />
                Quick action
              </div>
              <div className="mt-2 flex gap-2">
                <Button className="h-11 w-full">Primary</Button>
                <Button variant="secondary" className="h-11 w-full">
                  Secondary
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
