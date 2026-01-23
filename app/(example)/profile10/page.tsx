"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Flag,
  Gift,
  MessageCircle,
  Send,
  Share2,
  Sparkles,
  Star,
} from "lucide-react";

import { Button } from "@/design/Button";
import { IconButton } from "@/design/IconButton";
import { Avatar } from "@/design/Avatar";
const RanksBorders = { new_otaku: "/borders/wolf.png" } as const;

const UserData = {
  id: "1",
  username: "dev_luffy",
  first_name: "ibrahim",
  last_name: "jomaa",
  country: "ps",
  dob: new Date("25/08/2000"),
  gender: "male",
  rank: "new_otaku" as keyof typeof RanksBorders,
  avatar: { md: "https://avatarfiles.alphacoders.com/367/thumb-350-367476.webp" },
  bg: { lg: "https://images4.alphacoders.com/136/thumbbig-1369866.webp" },
  joinDate: new Date("2024-02-12"),
  popularity: 78,
  titleRank: "New Otaku",
  bestCharacter: { name: "Luffy", series: "One Piece" },
  counts: { posts: 214, followers: 1203, following: 188, likes: 9450 },
  stats: {
    anime: { watched: 412, episodes: 14231, hours: 823, meanScore: 8.4 },
    comics: { read: 268, chapters: 9321, hours: 610, meanScore: 8.1 },
  },
  notifications: 3,
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

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function formatNumber(n: number) {
  return new Intl.NumberFormat().format(n);
}

const pageEnter = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.21, 1, 0.21, 1] },
  },
};

const sectionEnter = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.05 + i * 0.06, duration: 0.35, ease: [0.21, 1, 0.21, 1] },
  }),
};

function ProgressBar({
  value,
  label,
}: {
  value: number; // 0..1
  label?: string;
}) {
  const pct = Math.round(clamp01(value) * 100);
  return (
    <div className="w-full">
      {label ? (
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>{label}</span>
          <span>{pct}%</span>
        </div>
      ) : null}
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500"
          style={{ width: `${pct}%` }}
          aria-label={`Progress ${pct}%`}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-sm text-foreground text-right">{value ?? "—"}</div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-card px-2.5 py-1 text-xs text-foreground">
      {children}
    </span>
  );
}

function CardShell({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur">
      <div className="mb-3 flex items-center gap-2">
        {icon ? (
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-muted">
            {icon}
          </span>
        ) : null}
        <h3 className="text-sm font-semibold tracking-tight text-foreground">
          {title}
        </h3>
      </div>
      <div className="divide-y divide-border">{children}</div>
    </div>
  );
}

function SparkleBurst({ tab }: { tab: string }) {
  return (
    <motion.span
      key={tab}
      className="pointer-events-none absolute -right-1 -top-1"
      initial={{ opacity: 0, scale: 0.6, rotate: -25 }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0.6, 1.05, 0.9],
        rotate: [-25, 10, 18],
        transition: { duration: 0.6, ease: "easeOut" },
      }}
    >
      <Sparkles className="h-4 w-4 text-foreground/70" aria-hidden="true" />
    </motion.span>
  );
}

export default function FanaaraProfilePage() {
  const [active, setActive] = React.useState<TabKey>("General");

  // Use the provided data (kept flexible without assuming exact shapes).
  const user = UserData as any;

  const fullName: string = user?.fullName ?? user?.name ?? "Fanaara User";
  const username: string = user?.username ?? user?.handle ?? "@fanaara";
  const rank: string = user?.rank ?? "Rookie";
  const xp: number = Number(user?.xp ?? user?.experience ?? 0);
  const xpNext: number = Number(user?.xpNext ?? user?.nextXp ?? Math.max(1000, xp + 1));
  const xpProgress = clamp01(xpNext > 0 ? xp / xpNext : 0);

  const avatarSrc: string =
    user?.avatarUrl ??
    user?.avatar ??
    "https://images.unsplash.com/photo-1545396872-a6682fc218ab?auto=format&fit=crop&w=512&q=80";

  const coverSrc: string =
    user?.coverUrl ??
    user?.bannerUrl ??
    "https://images.unsplash.com/photo-1520975958225-8e3f84f35a70?auto=format&fit=crop&w=1800&q=80";

  const notifCount: number = Number(user?.notifications ?? 3);

  const rankBorder = (RanksBorders as any)?.[rank];
  const rankBorderClass =
    (typeof rankBorder === "string" && rankBorder) ||
    rankBorder?.className ||
    "";

  const posts = React.useMemo(
    () =>
      [
        {
          id: "p1",
          title: "Sakura spotlight weekend 🌸",
          body:
            "Just finished a rewatch marathon—tell me your comfort anime arc. I’m collecting recommendations for a festival-themed list!",
          meta: { likes: 128, comments: 24, time: "2h ago" },
        },
        {
          id: "p2",
          title: "Panel-to-screen moment",
          body:
            "That one scene that looks exactly like the manga panel… chef’s kiss. Drop yours and I’ll add it to my ‘perfect adaptations’ board.",
          meta: { likes: 86, comments: 17, time: "1d ago" },
        },
        {
          id: "p3",
          title: "Quick poll: opening songs",
          body:
            "Do you prefer openings that are story-heavy or vibe-heavy? I’m team vibe-heavy (but I can be convinced).",
          meta: { likes: 53, comments: 9, time: "3d ago" },
        },
      ] as const,
    []
  );

  const basic = user?.basic ?? user;
  const anime = user?.anime ?? {};
  const comics = user?.comics ?? user?.manga ?? {};

  const basicChips: string[] =
    basic?.tags ??
    basic?.interests ??
    ["Cosplay", "AMVs", "Convention Hunts", "Slice of Life"];

  const animeGenres: string[] =
    anime?.genres ?? ["Shonen", "Rom-Com", "Mystery", "Fantasy"];

  const comicsGenres: string[] =
    comics?.genres ?? ["Webtoons", "Superhero", "Indie", "Graphic Novels"];

  return (
    <motion.div
      variants={pageEnter}
      initial="hidden"
      animate="show"
      className="min-h-dvh bg-background text-foreground"
    >
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="relative h-[300px] w-full sm:h-[340px] lg:h-[380px]"
          style={{
            backgroundImage: `url(${coverSrc})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          aria-label="Profile cover image"
          role="img"
        >
          {/* Overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/45 to-background/95" />

          {/* Decorative aurora/sakura-ish overlay (lightweight + optional animation class) */}
          <div
            className={cn(
              "pointer-events-none absolute inset-0 opacity-60",
              "bg-gradient-to-r from-primary/20 via-accent/20 to-transparent",
              "animate-aurora-lite"
            )}
            aria-hidden="true"
          />
          <div
            className={cn(
              "pointer-events-none absolute inset-0 opacity-35",
              "bg-gradient-to-tr from-transparent via-primary/10 to-accent/10",
              "animate-sakura-lite"
            )}
            aria-hidden="true"
          />

          {/* Corner actions */}
          <div className="absolute left-3 top-3 z-10">
            <IconButton
              aria-label="Report profile"
              variant="ghost"
              size="sm"
              className="backdrop-blur"
            >
              <Flag className="h-5 w-5" aria-hidden="true" />
            </IconButton>
          </div>
          <div className="absolute right-3 top-3 z-10">
            <IconButton
              aria-label="Share profile"
              variant="ghost"
              size="sm"
              className="backdrop-blur"
            >
              <Share2 className="h-5 w-5" aria-hidden="true" />
            </IconButton>
          </div>

          {/* Center stack */}
          <div className="absolute inset-x-0 bottom-0 z-10">
            <div className="mx-auto w-full max-w-5xl px-4 pb-5">
              <div className="flex flex-col items-center gap-3 text-center">
                {/* Avatar with rank border + gentle glow */}
                <div
                  className={cn(
                    "relative rounded-full p-1",
                    "shadow-sm",
                    "ring-1 ring-ring/40",
                    "transition-transform duration-300 hover:scale-[1.01]",
                    "hover:shadow-md",
                    rankBorderClass
                  )}
                  aria-label="Avatar rank border"
                >
                  <div className="rounded-full bg-card/70 p-1 backdrop-blur">
                    <Avatar
                      src={avatarSrc}
                      alt={`${fullName} avatar`}
                      size="20"
                      className="transition-shadow duration-300 hover:shadow-lg"
                    />
                  </div>
                </div>

                {/* Rank + XP */}
                <div className="w-full max-w-sm rounded-2xl border border-border bg-card/70 px-4 py-3 backdrop-blur">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-2">
                      <Star className="h-4 w-4 text-foreground/80" aria-hidden="true" />
                      <span className="text-sm font-semibold">{rank}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatNumber(xp)} / {formatNumber(xpNext)} XP
                    </div>
                  </div>
                  <ProgressBar value={xpProgress} />
                </div>

                {/* Name + username */}
                <div className="space-y-1">
                  <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {fullName}
                  </h1>
                  <p className="text-sm text-muted-foreground">{username}</p>
                </div>

                {/* Action row (wrap nicely on mobile) */}
                <div className="mt-2 flex w-full flex-wrap items-center justify-center gap-2 sm:gap-3">
                  <Button
                    gradient="violet"
                    aria-label="Follow user"
                    className="min-w-[140px]"
                  >
                    Follow
                  </Button>

                  <Button
                    variant="secondary"
                    aria-label="Send popularity"
                    className="min-w-[160px]"
                  >
                    <Send className="mr-2 h-4 w-4" aria-hidden="true" />
                    Send Popularity
                  </Button>

                  <div className="relative">
                    <IconButton
                      aria-label="Notifications"
                      variant="secondary"
                      className="hover:shadow-sm"
                    >
                      <Bell className="h-5 w-5" aria-hidden="true" />
                    </IconButton>
                    {notifCount > 0 ? (
                      <span
                        className={cn(
                          "absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1",
                          "bg-primary text-primary-foreground text-[11px] font-semibold",
                          "ring-2 ring-background"
                        )}
                        aria-label={`${notifCount} notifications`}
                      >
                        {notifCount > 99 ? "99+" : notifCount}
                      </span>
                    ) : null}
                  </div>

                  <Button
                    variant="secondary"
                    aria-label="Open chat"
                    className="min-w-[120px]"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                    Chat
                  </Button>

                  <IconButton
                    aria-label="Send gift"
                    variant="secondary"
                    className="hover:shadow-sm"
                  >
                    <Gift className="h-5 w-5" aria-hidden="true" />
                  </IconButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TABS */}
      <section className="border-b border-border bg-background/70 backdrop-blur">
        <div className="mx-auto w-full max-w-5xl px-4">
          <div className="relative">
            <div
              className="no-scrollbar flex gap-1 overflow-x-auto py-3"
              role="tablist"
              aria-label="Profile tabs"
            >
              {TABS.map((t) => {
                const isActive = t === active;
                return (
                  <button
                    key={t}
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`${t} tab`}
                    onClick={() => setActive(t)}
                    className={cn(
                      "relative shrink-0 rounded-xl px-3 py-2 text-sm font-medium",
                      "transition",
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                      "hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    )}
                  >
                    <span className="relative inline-flex items-center gap-2">
                      {t}
                      {isActive ? <SparkleBurst tab={t} /> : null}
                    </span>

                    {isActive ? (
                      <motion.div
                        layoutId="tab-indicator"
                        className={cn(
                          "absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full",
                          "bg-primary"
                        )}
                        transition={{ type: "spring", stiffness: 450, damping: 35 }}
                        aria-hidden="true"
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <main className="mx-auto w-full max-w-5xl px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25, ease: [0.21, 1, 0.21, 1] }}
          >
            {active === "General" ? (
              <div className="space-y-6">
                {/* Cards */}
                <div className="grid gap-4 lg:grid-cols-3">
                  <motion.div custom={0} variants={sectionEnter} initial="hidden" animate="show">
                    <CardShell title="Basic" icon={<Sparkles className="h-4 w-4" aria-hidden="true" />}>
                      <InfoRow label="Bio" value={basic?.bio ?? basic?.about ?? "—"} />
                      <InfoRow label="Location" value={basic?.location ?? basic?.city ?? "—"} />
                      <InfoRow label="Joined" value={basic?.joined ?? basic?.createdAt ?? "—"} />
                      <InfoRow
                        label="Vibes"
                        value={
                          <div className="flex flex-wrap justify-end gap-1.5">
                            {basicChips.slice(0, 6).map((x: string) => (
                              <Chip key={x}>{x}</Chip>
                            ))}
                          </div>
                        }
                      />
                    </CardShell>
                  </motion.div>

                  <motion.div custom={1} variants={sectionEnter} initial="hidden" animate="show">
                    <CardShell title="Anime" icon={<Star className="h-4 w-4" aria-hidden="true" />}>
                      <InfoRow label="Favorite anime" value={anime?.favorite ?? anime?.favAnime ?? "—"} />
                      <InfoRow label="Top character" value={anime?.character ?? anime?.favCharacter ?? "—"} />
                      <InfoRow label="Watch style" value={anime?.watchStyle ?? "Sub (usually)"} />
                      <InfoRow
                        label="Genres"
                        value={
                          <div className="flex flex-wrap justify-end gap-1.5">
                            {animeGenres.slice(0, 8).map((g: string) => (
                              <Chip key={g}>{g}</Chip>
                            ))}
                          </div>
                        }
                      />
                    </CardShell>
                  </motion.div>

                  <motion.div custom={2} variants={sectionEnter} initial="hidden" animate="show">
                    <CardShell title="Comics" icon={<MessageCircle className="h-4 w-4" aria-hidden="true" />}>
                      <InfoRow label="Favorite series" value={comics?.favorite ?? comics?.favSeries ?? "—"} />
                      <InfoRow label="Favorite author" value={comics?.author ?? comics?.favAuthor ?? "—"} />
                      <InfoRow label="Format" value={comics?.format ?? "Manga + Webtoons"} />
                      <InfoRow
                        label="Genres"
                        value={
                          <div className="flex flex-wrap justify-end gap-1.5">
                            {comicsGenres.slice(0, 8).map((g: string) => (
                              <Chip key={g}>{g}</Chip>
                            ))}
                          </div>
                        }
                      />
                    </CardShell>
                  </motion.div>
                </div>

                {/* Posts feed */}
                <motion.section
                  variants={sectionEnter}
                  custom={3}
                  initial="hidden"
                  animate="show"
                  className="space-y-3"
                  aria-label="Posts feed"
                >
                  <div className="flex items-end justify-between gap-3">
                    <h2 className="text-base font-semibold tracking-tight">Posts</h2>
                    <div className="text-xs text-muted-foreground">
                      Festival spotlight • latest updates
                    </div>
                  </div>

                  <div className="mx-auto w-full max-w-2xl space-y-3">
                    {posts.map((p) => (
                      <article
                        key={p.id}
                        className={cn(
                          "rounded-2xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur",
                          "transition hover:shadow-md"
                        )}
                        aria-label={`Post: ${p.title}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-sm font-semibold text-foreground">{p.title}</h3>
                            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                              {p.body}
                            </p>
                          </div>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {p.meta.time}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                          <span aria-label={`${p.meta.likes} likes`}>
                            {formatNumber(p.meta.likes)} likes
                          </span>
                          <span aria-label={`${p.meta.comments} comments`}>
                            {formatNumber(p.meta.comments)} comments
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                </motion.section>
              </div>
            ) : (
              <motion.div
                variants={sectionEnter}
                custom={0}
                initial="hidden"
                animate="show"
                className="rounded-2xl border border-border bg-card/70 p-6 shadow-sm backdrop-blur"
                aria-label={`${active} tab content`}
              >
                <div className="flex flex-col items-center justify-center gap-2 text-center">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-muted">
                    <Sparkles className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h2 className="text-base font-semibold tracking-tight">{active}</h2>
                  <p className="max-w-md text-sm text-muted-foreground">
                    This section is ready for your real data. Keep the vibe clean—add
                    media grids, lists, and stats here with the same motion + spacing.
                  </p>

                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    <Button variant="secondary" aria-label={`Refresh ${active}`}>
                      Refresh
                    </Button>
                    <Button variant="secondary" aria-label={`Customize ${active}`}>
                      Customize
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </motion.div>
  );
}
