"use client";

import * as React from "react";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import {
  FiAlertTriangle,
  FiShare2,
  FiUserPlus,
  FiBell,
  FiMessageCircle,
  FiTrendingUp,
  FiHeart,
  FiMessageSquare,
  FiBookmark,
  FiMoreHorizontal,
  FiClock,
  FiMapPin,
  FiLink,
  FiCalendar,
} from "react-icons/fi";

// ✅ Use your components (adjust import paths to your project)
import { Button } from "@/design/Button";
import { IconButton } from "@/design/IconButton";
import { Avatar } from "@/design/Avatar";

/* ---------------------------------- utils --------------------------------- */

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatCompactNumber(n: number) {
  const abs = Math.abs(n);
  if (abs < 1000) return String(n);
  const units = [
    { v: 1_000_000_000, s: "B" },
    { v: 1_000_000, s: "M" },
    { v: 1_000, s: "K" },
  ];
  const u = units.find((x) => abs >= x.v);
  if (!u) return String(n);
  const value = n / u.v;
  const rounded = value >= 10 ? value.toFixed(0) : value.toFixed(1);
  return `${rounded.replace(/\.0$/, "")}${u.s}`;
}

function formatDateShort(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(d);
}

/* ---------------------------------- types --------------------------------- */

type RankKey =
  | "Bronze"
  | "Silver"
  | "Gold"
  | "Platinum"
  | "Diamond"
  | "Master"
  | "Legend";

type RankBorder = {
  key: RankKey;
  label: string;
  ringClass: string;
  glowClass: string;
  pillClass: string;
};

type RanksBorders = Record<RankKey, RankBorder>;

type SocialLinks = {
  website?: string;
  location?: string;
};

type UserData = {
  id: string;
  name: string;
  username: string;
  bio: string;
  avatarUrl: string;
  headerImageUrl: string;
  rank: RankKey;
  joinedAtISO: string;
  links: SocialLinks;
  stats: {
    followers: number;
    following: number;
    popularity: number; // e.g. points
    posts: number;
  };
  anime: {
    watched: number;
    episodes: number;
    favorites: number;
    minutes: number;
  };
  comics: {
    read: number;
    chapters: number;
    favorites: number;
    pages: number;
  };
  preferences: {
    favoriteGenres: string[];
    favoriteStudios: string[];
  };
};

type PostModel = {
  id: string;
  authorId: string;
  createdAtISO: string;
  title?: string;
  body: string;
  tags: string[];
  media?: { type: "image"; src: string; alt: string };
  metrics: {
    likes: number;
    comments: number;
    saves: number;
  };
  userHas: {
    liked: boolean;
    saved: boolean;
  };
};

type TabKey = "general" | "achievements" | "collections" | "about";

type ProfileTab = {
  key: TabKey;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  emptyState?: {
    title: string;
    description: string;
  };
};

/* --------------------------- base data + mocks ---------------------------- */

const RANKS_BORDERS: RanksBorders = {
  Bronze: {
    key: "Bronze",
    label: "Bronze",
    ringClass: "ring-2 ring-amber-700/60 ring-[color:var(--border)]",
    glowClass: "shadow-[0_0_0_6px_rgba(180,83,9,0.12)]",
    pillClass:
      "bg-amber-500/15 text-amber-300 border-amber-500/25 bg-accent/10 text-accent border-border",
  },
  Silver: {
    key: "Silver",
    label: "Silver",
    ringClass: "ring-2 ring-zinc-300/50 ring-[color:var(--border)]",
    glowClass: "shadow-[0_0_0_6px_rgba(212,212,216,0.10)]",
    pillClass:
      "bg-zinc-200/10 text-zinc-200 border-zinc-200/20 bg-accent/10 text-accent border-border",
  },
  Gold: {
    key: "Gold",
    label: "Gold",
    ringClass: "ring-2 ring-yellow-400/55 ring-[color:var(--border)]",
    glowClass: "shadow-[0_0_0_6px_rgba(250,204,21,0.12)]",
    pillClass:
      "bg-yellow-400/15 text-yellow-200 border-yellow-400/25 bg-accent/10 text-accent border-border",
  },
  Platinum: {
    key: "Platinum",
    label: "Platinum",
    ringClass: "ring-2 ring-sky-300/55 ring-[color:var(--border)]",
    glowClass: "shadow-[0_0_0_6px_rgba(125,211,252,0.12)]",
    pillClass:
      "bg-sky-400/15 text-sky-200 border-sky-400/25 bg-accent/10 text-accent border-border",
  },
  Diamond: {
    key: "Diamond",
    label: "Diamond",
    ringClass: "ring-2 ring-cyan-300/55 ring-[color:var(--border)]",
    glowClass: "shadow-[0_0_0_6px_rgba(103,232,249,0.12)]",
    pillClass:
      "bg-cyan-400/15 text-cyan-200 border-cyan-400/25 bg-accent/10 text-accent border-border",
  },
  Master: {
    key: "Master",
    label: "Master",
    ringClass: "ring-2 ring-violet-300/55 ring-[color:var(--border)]",
    glowClass: "shadow-[0_0_0_6px_rgba(196,181,253,0.12)]",
    pillClass:
      "bg-violet-400/15 text-violet-200 border-violet-400/25 bg-accent/10 text-accent border-border",
  },
  Legend: {
    key: "Legend",
    label: "Legend",
    ringClass: "ring-2 ring-fuchsia-300/60 ring-[color:var(--border)]",
    glowClass: "shadow-[0_0_0_6px_rgba(240,171,252,0.12)]",
    pillClass:
      "bg-fuchsia-400/15 text-fuchsia-200 border-fuchsia-400/25 bg-accent/10 text-accent border-border",
  },
};

const USER: UserData = {
  id: "user_fanaara_001",
  name: "Fanaara",
  username: "fanaara",
  bio: "Anime & comics enthusiast. I track what I watch/read, post mini-reviews, and collect character aesthetics ✨",
  avatarUrl:
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=70",
  headerImageUrl:
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=2000&q=70",
  rank: "Legend",
  joinedAtISO: "2023-02-14T10:00:00.000Z",
  links: {
    website: "https://fanaara.example",
    location: "Jerusalem",
  },
  stats: {
    followers: 128_400,
    following: 812,
    popularity: 3_742_110,
    posts: 342,
  },
  anime: {
    watched: 612,
    episodes: 10_842,
    favorites: 73,
    minutes: 318_540,
  },
  comics: {
    read: 254,
    chapters: 8_913,
    favorites: 41,
    pages: 186_220,
  },
  preferences: {
    favoriteGenres: ["Shounen", "Mystery", "Slice of Life", "Sci-Fi"],
    favoriteStudios: ["Bones", "MAPPA", "Kyoto Animation"],
  },
};

const POSTS: PostModel[] = [
  {
    id: "post_001",
    authorId: USER.id,
    createdAtISO: "2025-11-09T18:22:00.000Z",
    title: "That one episode that rewired my brain",
    body: "I love when pacing slows down just enough to let the character choices breathe. The soundtrack cue at the final scene? Perfect.",
    tags: ["anime", "review", "soundtrack"],
    media: {
      type: "image",
      src: "https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=1600&q=70",
      alt: "Abstract neon scene",
    },
    metrics: { likes: 4821, comments: 319, saves: 1402 },
    userHas: { liked: true, saved: false },
  },
  {
    id: "post_002",
    authorId: USER.id,
    createdAtISO: "2025-10-18T09:40:00.000Z",
    body: "Comics pacing tip: panels can be a metronome. When the spacing tightens, your heart rate follows. When it opens up, you exhale.",
    tags: ["comics", "craft", "panels"],
    metrics: { likes: 2350, comments: 141, saves: 982 },
    userHas: { liked: false, saved: true },
  },
  {
    id: "post_003",
    authorId: USER.id,
    createdAtISO: "2025-09-02T14:05:00.000Z",
    title: "Starter list: cozy anime nights",
    body: "If you need something gentle but still meaningful: pick shows with warm lighting, strong friend-group chemistry, and minimal cliffhangers.",
    tags: ["anime", "recommendations", "cozy"],
    metrics: { likes: 3982, comments: 207, saves: 1880 },
    userHas: { liked: false, saved: false },
  },
];

/* --------------------------------- page ----------------------------------- */

export default function FanaaraProfilePage() {
  const [activeTab, setActiveTab] = React.useState<TabKey>("general");

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-50">
      <ProfileHeader user={USER} />

      <main className="mx-auto w-full max-w-6xl px-4 pb-14">
        <ProfileTabs active={activeTab} onChange={setActiveTab} />
        <div className="mt-6">
          <TabContent active={activeTab} user={USER} posts={POSTS} />
        </div>
      </main>
    </div>
  );
}

/* ------------------------------ ProfileHeader ----------------------------- */

function ProfileHeader({ user }: { user: UserData }) {
  const rank = RANKS_BORDERS[user.rank];

  return (
    <section className="relative isolate">
      <div className="relative h-[360px] sm:h-[420px] lg:h-[460px]">
        <Image
          src={"https://images3.alphacoders.com/132/thumbbig-1323165.webp"}
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/55 to-zinc-950" />
        <div className="absolute inset-0 ring-1 ring-inset ring-zinc-800/60 ring-border" />

        <div className="absolute left-4 top-4">
          <IconButton aria-label="Report profile" className="backdrop-blur">
            <FiAlertTriangle size={20} />
          </IconButton>
        </div>
        <div className="absolute right-4 top-4">
          <IconButton aria-label="Share profile" className="backdrop-blur">
            <FiShare2 size={20} />
          </IconButton>
        </div>

        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto w-full max-w-6xl px-4 pb-6 sm:pb-7 lg:pb-8">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div
                  className={cn(
                    "rounded-full p-[3px]",
                    "bg-zinc-950/60",
                    "ring-1 ring-zinc-800/70 ring-border",
                    rank.glowClass,
                  )}
                >
                  <div
                    className={cn(
                      "rounded-full ring-offset-2 ring-offset-zinc-950/50",
                      rank.ringClass,
                    )}
                  >
                    <Avatar
                      src={"https://mfiles.alphacoders.com/101/thumb-350-1013144.png"}
                      alt={`${user.name} avatar`}
                      size="32"
                    />
                  </div>
                </div>

                <span
                  className={cn(
                    "absolute -bottom-3 left-1/2 -translate-x-1/2",
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
                    "backdrop-blur",
                    "bg-zinc-900/55 border-zinc-700/60",
                    rank.pillClass,
                  )}
                >
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-violet-300 bg-accent" />
                  {rank.label}
                </span>
              </div>

              <div className="mt-6 sm:mt-7">
                <h1 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
                  {user.name}
                </h1>
                <p className="mt-1 text-sm text-zinc-300">@{user.username}</p>
                <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-zinc-200">
                  {user.bio}
                </p>
              </div>

              <div className="mt-5 flex w-full max-w-2xl flex-wrap items-center justify-center gap-2 sm:gap-3">
                <Button className="min-w-[140px]" aria-label="Follow Fanaara">
                  <span className="inline-flex items-center gap-2">
                    <FiUserPlus size={18} />
                    Follow
                  </span>
                </Button>

                <QuickStat
                  label="Popularity"
                  value={formatCompactNumber(user.stats.popularity)}
                  icon={FiTrendingUp}
                />
                <QuickAction label="Notifications" icon={FiBell} />
                <QuickAction label="Chat" icon={FiMessageCircle} />
              </div>

              <div className="mt-5 grid w-full max-w-3xl grid-cols-3 gap-2 sm:gap-3">
                <MiniMetric
                  label="Followers"
                  value={formatCompactNumber(user.stats.followers)}
                />
                <MiniMetric
                  label="Following"
                  value={formatCompactNumber(user.stats.following)}
                />
                <MiniMetric
                  label="Posts"
                  value={formatCompactNumber(user.stats.posts)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function QuickStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-xl border px-3 py-2",
        "bg-zinc-900/55 bg-surface",
        "border-zinc-800 border-border",
        "backdrop-blur",
        "transition",
        "hover:-translate-y-0.5 hover:border-violet-500/40 hover:shadow-sm",
      )}
      aria-label={`${label}: ${value}`}
    >
      <Icon size={18} className="text-violet-300 text-accent" />
      <div className="flex flex-col leading-tight">
        <span className="text-xs text-zinc-300">{label}</span>
        <span className="text-sm font-semibold">{value}</span>
      </div>
    </div>
  );
}

function QuickAction({
  label,
  icon: Icon,
}: {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <Button
      variant="secondary"
      className={cn(
        "min-w-[140px]",
        "bg-zinc-900/55 bg-surface",
        "border border-zinc-800 border-border",
        "hover:-translate-y-0.5 hover:border-violet-500/40 hover:shadow-sm",
      )}
      aria-label={label}
    >
      <span className="inline-flex items-center gap-2">
        <Icon size={18} className="text-zinc-100" />
        {label}
      </span>
    </Button>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border px-3 py-2 text-center",
        "bg-zinc-950/40",
        "border-zinc-800 border-border",
        "backdrop-blur",
        "transition",
        "hover:border-violet-500/35 hover:shadow-sm",
      )}
    >
      <div className="text-sm font-semibold">{value}</div>
      <div className="text-xs text-zinc-400">{label}</div>
    </div>
  );
}

/* -------------------------------- ProfileTabs ----------------------------- */

const TABS: ReadonlyArray<ProfileTab> = [
  {
    key: "general",
    label: "General",
    icon: FiClock,
  },
  {
    key: "achievements",
    label: "Achievements",
    icon: FiTrendingUp,
    emptyState: {
      title: "No achievements yet",
      description: "When Fanaara unlocks badges, they’ll show up here.",
    },
  },
  {
    key: "collections",
    label: "Collections",
    icon: FiBookmark,
    emptyState: {
      title: "No collections yet",
      description: "Pinned lists and curated picks will live here.",
    },
  },
  {
    key: "about",
    label: "About",
    icon: FiLink,
    emptyState: {
      title: "Nothing extra to show",
      description: "This tab can host extended bio, socials, and highlights.",
    },
  },
] as const;

function ProfileTabs({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (key: TabKey) => void;
}) {
  const ids = React.useMemo(() => {
    const base = "profile-tabs";
    return {
      list: `${base}-list`,
      tab: (k: TabKey) => `${base}-tab-${k}`,
      panel: (k: TabKey) => `${base}-panel-${k}`,
    };
  }, []);

  const order = React.useMemo(() => TABS.map((t) => t.key), []);
  const activeIndex = order.indexOf(active);

  const onKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      const key = e.key;
      if (
        key !== "ArrowLeft" &&
        key !== "ArrowRight" &&
        key !== "Home" &&
        key !== "End"
      )
        return;

      e.preventDefault();

      let nextIndex = activeIndex;
      if (key === "ArrowLeft")
        nextIndex = (activeIndex - 1 + order.length) % order.length;
      if (key === "ArrowRight") nextIndex = (activeIndex + 1) % order.length;
      if (key === "Home") nextIndex = 0;
      if (key === "End") nextIndex = order.length - 1;

      onChange(order[nextIndex]);

      const nextId = ids.tab(order[nextIndex]);
      const el = document.getElementById(nextId);
      el?.focus();
    },
    [activeIndex, ids, onChange, order],
  );

  return (
    <div className="mt-4">
      <div
        className={cn(
          "relative rounded-2xl border p-1",
          "bg-zinc-900/40 bg-surface",
          "border-zinc-800 border-border",
          "backdrop-blur",
        )}
      >
        <div
          id={ids.list}
          role="tablist"
          aria-label="Profile sections"
          className="relative grid grid-cols-2 gap-1 sm:grid-cols-4"
        >
          {TABS.map((tab) => {
            const selected = tab.key === active;
            const Icon = tab.icon;

            return (
              <button
                key={tab.key}
                id={ids.tab(tab.key)}
                role="tab"
                type="button"
                aria-selected={selected}
                aria-controls={ids.panel(tab.key)}
                tabIndex={selected ? 0 : -1}
                onClick={() => onChange(tab.key)}
                onKeyDown={onKeyDown}
                className={cn(
                  "relative isolate rounded-xl px-3 py-2 text-sm font-semibold",
                  "outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
                  "transition",
                  selected
                    ? "text-zinc-50"
                    : "text-zinc-300 hover:text-zinc-100",
                )}
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <Icon
                    size={18}
                    className={cn(
                      selected
                        ? "text-violet-300 text-accent"
                        : "text-zinc-300",
                    )}
                  />
                  {tab.label}
                </span>

                {selected ? (
                  <motion.div
                    layoutId="profile-tabs-underline"
                    className={cn(
                      "pointer-events-none absolute inset-0 -z-10 rounded-xl",
                      "bg-violet-500/12 bg-accent/10",
                      "border border-violet-500/25 border-border",
                    )}
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- TabContent ------------------------------- */

function TabContent({
  active,
  user,
  posts,
}: {
  active: TabKey;
  user: UserData;
  posts: PostModel[];
}) {
  const reduceMotion = useReducedMotion();

  const contentVariants: Variants = {
    initial: { opacity: 0, y: reduceMotion ? 0 : 10, filter: "blur(2px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    exit: { opacity: 0, y: reduceMotion ? 0 : -8, filter: "blur(2px)" },
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={active}
        role="tabpanel"
        id={`profile-tabs-panel-${active}`}
        aria-labelledby={`profile-tabs-tab-${active}`}
        variants={contentVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: reduceMotion ? 0 : 0.18, ease: "easeOut" }}
      >
        {active === "general" ? (
          <GeneralTab user={user} posts={posts} />
        ) : (
          <PlaceholderTab
            tab={TABS.find((t) => t.key === active)!}
            user={user}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

/* -------------------------------- GeneralTab ------------------------------ */

function GeneralTab({ user, posts }: { user: UserData; posts: PostModel[] }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <InfoCard user={user} />
        <StatsCard
          title="Anime Stats"
          icon={<FiTrendingUp size={18} className="text-sky-200 text-accent" />}
          items={[
            {
              label: "Watched",
              value: formatCompactNumber(user.anime.watched),
            },
            {
              label: "Episodes",
              value: formatCompactNumber(user.anime.episodes),
            },
            {
              label: "Favorites",
              value: formatCompactNumber(user.anime.favorites),
            },
            {
              label: "Minutes",
              value: formatCompactNumber(user.anime.minutes),
            },
          ]}
        />
        <StatsCard
          title="Comics Stats"
          icon={
            <FiTrendingUp size={18} className="text-violet-200 text-accent" />
          }
          items={[
            { label: "Read", value: formatCompactNumber(user.comics.read) },
            {
              label: "Chapters",
              value: formatCompactNumber(user.comics.chapters),
            },
            {
              label: "Favorites",
              value: formatCompactNumber(user.comics.favorites),
            },
            { label: "Pages", value: formatCompactNumber(user.comics.pages) },
          ]}
        />
      </div>

      <PostsFeed user={user} posts={posts} />
    </div>
  );
}

function CardShell({
  title,
  icon,
  children,
  right,
}: {
  title: string;
  icon?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "group rounded-2xl border p-4",
        "bg-zinc-900/40 bg-surface",
        "border-zinc-800 border-border",
        "backdrop-blur",
        "transition",
        "hover:-translate-y-0.5 hover:border-violet-500/35 hover:shadow-sm",
      )}
    >
      <header className="mb-3 flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2">
          {icon ? (
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-800/70 border-border bg-zinc-950/40">
              {icon}
            </span>
          ) : null}
          <h2 className="text-sm font-bold text-zinc-100">{title}</h2>
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </header>
      {children}
    </section>
  );
}

function InfoRow({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  href?: string;
}) {
  const Icon = icon;
  const content = <span className="text-sm text-zinc-200">{value}</span>;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-zinc-800/60 border-border bg-zinc-950/30 px-3 py-2">
      <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-800/60 border-border bg-zinc-900/30">
        <Icon size={18} className="text-zinc-200" />
      </span>
      <div className="min-w-0">
        <div className="text-xs font-semibold text-zinc-400">{label}</div>
        <div className="truncate">
          {href ? (
            <a
              href={href}
              className="text-sm text-sky-200 text-accent underline decoration-zinc-600 underline-offset-4 hover:decoration-sky-300"
            >
              {value}
            </a>
          ) : (
            content
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ user }: { user: UserData }) {
  return (
    <CardShell
      title="Profile Details"
      icon={<FiUserPlus size={18} className="text-violet-200 text-accent" />}
      right={
        <div className="inline-flex items-center gap-2 text-xs text-zinc-400">
          <FiCalendar size={16} />
          Joined {formatDateShort(user.joinedAtISO)}
        </div>
      }
    >
      <div className="space-y-2">
        <InfoRow
          icon={FiMapPin}
          label="Location"
          value={user.links.location ?? "—"}
        />
        <InfoRow
          icon={FiLink}
          label="Website"
          value={user.links.website ?? "—"}
          href={user.links.website}
        />
        <div className="rounded-xl border border-zinc-800/60 border-border bg-zinc-950/30 px-3 py-3">
          <div className="text-xs font-semibold text-zinc-400">Favorites</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {user.preferences.favoriteGenres.map((g) => (
              <span
                key={g}
                className={cn(
                  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
                  "bg-zinc-900/35 bg-surface",
                  "border-zinc-800 border-border",
                  "text-zinc-200",
                  "transition",
                  "hover:border-violet-500/30 hover:text-zinc-50",
                )}
              >
                {g}
              </span>
            ))}
          </div>
          <div className="mt-3 text-xs text-zinc-400">
            Studios:{" "}
            <span className="text-zinc-200">
              {user.preferences.favoriteStudios.join(", ")}
            </span>
          </div>
        </div>
      </div>
    </CardShell>
  );
}

function StatsCard({
  title,
  icon,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  items: Array<{ label: string; value: string }>;
}) {
  return (
    <CardShell title={title} icon={icon}>
      <dl className="grid grid-cols-2 gap-2">
        {items.map((it) => (
          <div
            key={it.label}
            className={cn(
              "rounded-xl border px-3 py-2",
              "bg-zinc-950/30",
              "border-zinc-800/60 border-border",
              "transition",
              "hover:border-violet-500/25",
            )}
          >
            <dt className="text-xs font-semibold text-zinc-400">{it.label}</dt>
            <dd className="mt-0.5 text-sm font-bold text-zinc-100">
              {it.value}
            </dd>
          </div>
        ))}
      </dl>
    </CardShell>
  );
}

/* -------------------------------- PostsFeed -------------------------------- */

function PostsFeed({ user, posts }: { user: UserData; posts: PostModel[] }) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-zinc-100">Posts</h2>
          <p className="text-sm text-zinc-400">
            Latest thoughts, reviews, and recs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            className="border border-zinc-800 border-border bg-zinc-900/40 bg-surface"
          >
            New Post
          </Button>
          <IconButton aria-label="More options">
            <FiMoreHorizontal size={20} />
          </IconButton>
        </div>
      </div>

      <div className="space-y-3">
        {posts.map((p) => (
          <PostCard key={p.id} user={user} post={p} />
        ))}
      </div>
    </section>
  );
}

function PostCard({ user, post }: { user: UserData; post: PostModel }) {
  return (
    <article
      className={cn(
        "group rounded-2xl border",
        "bg-zinc-900/35 bg-surface",
        "border-zinc-800 border-border",
        "overflow-hidden",
        "transition",
        "hover:-translate-y-0.5 hover:border-violet-500/35 hover:shadow-sm",
      )}
    >
      <div className="p-4">
        <header className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="shrink-0">
              <Avatar
                src={"https://mfiles.alphacoders.com/101/thumb-350-1013144.png"}
                alt={`${user.name} avatar`}
                size="24"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="truncate text-sm font-bold text-zinc-100">
                  {user.name}
                </div>
                <div className="text-xs text-zinc-400">@{user.username}</div>
              </div>
              <div className="mt-0.5 inline-flex items-center gap-2 text-xs text-zinc-400">
                <FiClock size={14} />
                <time dateTime={post.createdAtISO}>
                  {formatDateShort(post.createdAtISO)}
                </time>
              </div>
            </div>
          </div>

          <IconButton aria-label="Post menu">
            <FiMoreHorizontal size={20} />
          </IconButton>
        </header>

        {post.title ? (
          <h3 className="mt-3 text-pretty text-base font-bold text-zinc-100">
            {post.title}
          </h3>
        ) : null}

        <p className="mt-2 text-pretty text-sm leading-relaxed text-zinc-200">
          {post.body}
        </p>

        {post.tags.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <span
                key={t}
                className={cn(
                  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
                  "bg-zinc-950/30",
                  "border-zinc-800/70 border-border",
                  "text-zinc-300",
                  "transition",
                  "group-hover:border-violet-500/25",
                )}
              >
                #{t}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {post.media?.type === "image" ? (
        <div className="relative h-52 w-full sm:h-64">
          <Image
            src={post.media.src}
            alt={post.media.alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 800px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
        </div>
      ) : null}

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-800/70 border-border bg-zinc-950/20 px-3 py-2">
        <div className="flex items-center gap-1">
          <PostAction
            ariaLabel={post.userHas.liked ? "Unlike" : "Like"}
            icon={FiHeart}
            active={post.userHas.liked}
            count={post.metrics.likes}
          />
          <PostAction
            ariaLabel="Comment"
            icon={FiMessageSquare}
            count={post.metrics.comments}
          />
          <PostAction
            ariaLabel={post.userHas.saved ? "Unsave" : "Save"}
            icon={FiBookmark}
            active={post.userHas.saved}
            count={post.metrics.saves}
          />
        </div>

        <div className="text-xs text-zinc-500">
          <span className="inline-flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-zinc-600" />
            Engage respectfully
          </span>
        </div>
      </footer>
    </article>
  );
}

function PostAction({
  ariaLabel,
  icon: Icon,
  count,
  active,
}: {
  ariaLabel: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  count: number;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl border px-2.5 py-2 text-xs font-semibold",
        "bg-zinc-900/25 bg-surface",
        "border-zinc-800/70 border-border",
        "text-zinc-300",
        "transition",
        "hover:border-violet-500/35 hover:text-zinc-100",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
        active ? "text-violet-200 text-accent border-violet-500/35" : "",
      )}
    >
      <Icon
        size={18}
        className={cn(active ? "text-violet-200 text-accent" : "")}
      />
      <span className="tabular-nums">{formatCompactNumber(count)}</span>
    </button>
  );
}

/* ------------------------------ PlaceholderTab ---------------------------- */

function PlaceholderTab({ tab, user }: { tab: ProfileTab; user: UserData }) {
  const Icon = tab.icon;

  return (
    <section
      className={cn(
        "rounded-2xl border p-6",
        "bg-zinc-900/35 bg-surface",
        "border-zinc-800 border-border",
        "backdrop-blur",
      )}
    >
      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800/70 border-border bg-zinc-950/30">
          <Icon size={26} className="text-violet-200 text-accent" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-zinc-100">
          {tab.emptyState?.title ?? "Nothing here yet"}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          {tab.emptyState?.description ??
            `This section will display more details about @${user.username}.`}
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <Button className="min-w-[160px]">Explore Community</Button>
          <Button
            variant="secondary"
            className="border border-zinc-800 border-border bg-zinc-900/40 bg-surface"
          >
            Customize Profile
          </Button>
        </div>
      </div>
    </section>
  );
}
