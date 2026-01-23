"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  LuBell,
  LuFlag,
  LuShare2,
  LuGift,
  LuMessageCircle,
  LuUserPlus,
  LuSparkles,
  LuHeart,
  LuMessageSquare,
  LuBookmark,
} from "react-icons/lu";

// ✅ Project components (adjust paths only if your repo differs)

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
  avatar: {
    md: "https://avatarfiles.alphacoders.com/367/thumb-350-367476.webp",
  },
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
type TabKey = "general" | "anime" | "comics" | "achievements";

const tabs: Array<{ key: TabKey; label: string; icon: React.ReactNode }> = [
  { key: "general", label: "General", icon: <LuSparkles className="size-4" /> },
  { key: "anime", label: "Anime", icon: <LuBookmark className="size-4" /> },
  {
    key: "comics",
    label: "Comics",
    icon: <LuMessageSquare className="size-4" />,
  },
  {
    key: "achievements",
    label: "Achievements",
    icon: <LuGift className="size-4" />,
  },
];

function cx(...cls: Array<string | false | null | undefined>) {
  return cls.filter(Boolean).join(" ");
}

function formatCompact(n?: number) {
  if (typeof n !== "number") return "—";
  return Intl.NumberFormat(undefined, { notation: "compact" }).format(n);
}

function formatDate(d?: string | number | Date) {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="min-w-0">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="truncate text-sm font-semibold text-foreground">
        {value}
      </div>
      {hint ? (
        <div className="mt-0.5 text-[11px] text-muted-foreground">{hint}</div>
      ) : null}
    </div>
  );
}

function Card({
  title,
  right,
  children,
  className,
}: {
  title?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cx(
        "group relative overflow-hidden rounded-2xl border border-border-subtle bg-surface",
        "shadow-sm transition-transform duration-200 hover:-translate-y-0.5",
        className,
      )}
    >
      {/* subtle neon edge */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-transparent via-accent-soft/40 to-transparent" />
      </div>

      {(title || right) && (
        <header className="relative flex items-center justify-between gap-4 border-b border-border-subtle px-5 py-4">
          <div className="min-w-0">
            {title ? (
              <h3 className="truncate text-sm font-semibold text-foreground">
                {title}
              </h3>
            ) : null}
          </div>
          {right ? <div className="shrink-0">{right}</div> : null}
        </header>
      )}

      <div className="relative px-5 py-4">{children}</div>
    </section>
  );
}

export default function FanaaraProfileCyberTealNeonPage() {
  const user = UserData as any; // keep your mocks exact; we avoid over-assuming their TS shape
  const [active, setActive] = React.useState<TabKey>("general");

  const rankKey = String(user?.rank ?? user?.titleRank ?? "default");
  const rankBorder =
    (RanksBorders as any)?.[rankKey] ?? (RanksBorders as any)?.default ?? "";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* HERO */}
      <div className="relative">
        <div className="relative h-[420px] w-full overflow-hidden border-b border-border-subtle">
          {/* Background image */}
          <Image
            src={user?.heroImage ?? "/images/fanaara/cyber-header.jpg"}
            alt=""
            fill
            priority
            className="object-cover"
          />

          {/* Strong overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-background/95" />

          {/* Tech grid overlay (Tailwind gradient trick) */}
          <div
            className={cx(
              "pointer-events-none absolute inset-0 opacity-60",
              "bg-[linear-gradient(to_right,hsl(var(--border))/0.18_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))/0.18_1px,transparent_1px)]",
              "bg-[size:44px_44px]",
              "mix-blend-screen",
            )}
          />
          <div
            className={cx(
              "pointer-events-none absolute inset-0 opacity-35",
              "bg-[radial-gradient(circle_at_30%_20%,hsl(var(--accent))/0.18,transparent_55%),radial-gradient(circle_at_75%_35%,hsl(var(--accent))/0.12,transparent_60%)]",
            )}
          />

          {/* Corner actions */}
          <div className="absolute left-4 top-4 z-10">
            <IconButton
              aria-label="Report profile"
              title="Report"
              variant="ghost"
              className="border border-border-subtle bg-surface/40 backdrop-blur hover:bg-surface/60"
            >
              <LuFlag className="size-5" />
            </IconButton>
          </div>
          <div className="absolute right-4 top-4 z-10 flex gap-2">
            <IconButton
              aria-label="Share profile"
              title="Share"
              variant="ghost"
              className="border border-border-subtle bg-surface/40 backdrop-blur hover:bg-surface/60"
            >
              <LuShare2 className="size-5" />
            </IconButton>
          </div>

          {/* Center profile block */}
          <div className="absolute inset-x-0 bottom-0 z-10">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="mx-auto w-full max-w-6xl px-4 pb-6"
            >
              <div className="relative rounded-3xl border border-border-subtle bg-surface/55 p-5 backdrop-blur-xl">
                {/* subtle neon aura */}
                <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-r from-accent-soft/25 via-transparent to-accent-soft/15 opacity-70" />

                <div className="relative flex flex-col items-center gap-4 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
                  <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
                    {/* Glow blob behind avatar */}
                    <div className="relative">
                      <motion.div
                        aria-hidden
                        className="absolute -inset-6 rounded-full bg-accent-soft/35 blur-2xl"
                        animate={{
                          opacity: [0.18, 0.32, 0.18],
                          scale: [0.98, 1.04, 0.98],
                        }}
                        transition={{
                          duration: 5.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    </div>

                    <div className="min-w-0">
                      {/* Rank chip */}
                      <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border-subtle bg-accent-soft/35 px-3 py-1 text-xs text-foreground">
                        <span className="inline-block size-1.5 rounded-full bg-accent-soft shadow-[0_0_12px_hsl(var(--accent))/0.35]" />
                        <span className="font-semibold">
                          {user?.rankLabel ?? user?.rank ?? "Rank"}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
                        <h1 className="truncate text-2xl font-bold tracking-tight">
                          {user?.name ?? "Fanaara User"}
                        </h1>
                        <div className="truncate text-sm text-muted-foreground">
                          @{user?.username ?? user?.handle ?? "username"}
                        </div>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                        <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface/50 px-3 py-1 text-xs text-muted-foreground">
                          <LuSparkles className="size-4 text-foreground/80" />
                          Popularity:{" "}
                          <span className="font-semibold text-foreground">
                            {formatCompact(
                              user?.popularity ?? user?.stats?.popularity,
                            )}
                          </span>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface/50 px-3 py-1 text-xs text-muted-foreground">
                          Joined:{" "}
                          <span className="font-semibold text-foreground">
                            {formatDate(user?.joinDate ?? user?.joinedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions row */}
                  <div className="flex w-full flex-wrap items-center justify-center gap-2 sm:w-auto sm:justify-end">
                    <Button gradient="ocean" className="min-w-[140px]">
                      <LuUserPlus className="mr-2 size-4" />
                      Follow
                    </Button>

                    <IconButton
                      aria-label="Message"
                      title="Message"
                      variant="ghost"
                      className="border border-border-subtle bg-surface/40 backdrop-blur hover:bg-surface/60"
                    >
                      <LuMessageCircle className="size-5" />
                    </IconButton>

                    <IconButton
                      aria-label="Send gift"
                      title="Send gift"
                      variant="ghost"
                      className="border border-border-subtle bg-surface/40 backdrop-blur hover:bg-surface/60"
                    >
                      <LuGift className="size-5" />
                    </IconButton>

                    <IconButton
                      aria-label="Notify"
                      title="Notify"
                      variant="ghost"
                      className="border border-border-subtle bg-surface/40 backdrop-blur hover:bg-surface/60"
                    >
                      <LuBell className="size-5" />
                    </IconButton>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="mx-auto w-full max-w-6xl px-4 pb-14">
        {/* Tabs */}
        <div className="sticky top-0 z-20 -mx-4 mt-4 border-b border-border-subtle bg-background/70 px-4 backdrop-blur">
          <div className="relative flex gap-2 overflow-x-auto py-3">
            {tabs.map((t) => {
              const isActive = t.key === active;
              return (
                <button
                  key={t.key}
                  onClick={() => setActive(t.key)}
                  className={cx(
                    "relative shrink-0 select-none rounded-full border px-4 py-2 text-sm",
                    "transition-colors",
                    isActive
                      ? "border-border-subtle bg-surface text-foreground"
                      : "border-transparent bg-transparent text-muted-foreground hover:bg-surface/60 hover:text-foreground",
                  )}
                >
                  <span className="inline-flex items-center gap-2">
                    {t.icon}
                    {t.label}
                  </span>

                  {/* Glowing indicator */}
                  {isActive ? (
                    <motion.span
                      layoutId="tab-indicator"
                      className="pointer-events-none absolute -bottom-[13px] left-3 right-3 h-[3px] rounded-full bg-accent-soft shadow-[0_0_18px_hsl(var(--accent))/0.35]"
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 34,
                      }}
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content transition: fade + blur-in, slide-up */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 10, filter: "blur(8px)" }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="mt-6"
          >
            {active === "general" ? <GeneralTab user={user} /> : null}
            {active === "anime" ? <PlaceholderTab title="Anime" /> : null}
            {active === "comics" ? <PlaceholderTab title="Comics" /> : null}
            {active === "achievements" ? (
              <PlaceholderTab title="Achievements" />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function GeneralTab({ user }: { user: any }) {
  const followers = user?.followers ?? user?.stats?.followers;
  const following = user?.following ?? user?.stats?.following;

  const anime = user?.anime ?? user?.stats?.anime ?? {};
  const comics = user?.comics ?? user?.stats?.comics ?? {};
  const posts: any[] = user?.posts ?? user?.feed ?? [];

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      {/* Left column */}
      <div className="lg:col-span-5">
        <Card title="Basic details">
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-foreground/90">
              {user?.bio ??
                "No bio yet. Drop a line about your favorites and what you’re watching/reading."}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border-subtle bg-background/40 p-3">
                <Metric label="Followers" value={formatCompact(followers)} />
              </div>
              <div className="rounded-xl border border-border-subtle bg-background/40 p-3">
                <Metric label="Following" value={formatCompact(following)} />
              </div>
              <div className="rounded-xl border border-border-subtle bg-background/40 p-3">
                <Metric
                  label="Popularity"
                  value={formatCompact(
                    user?.popularity ?? user?.stats?.popularity,
                  )}
                  hint="Based on activity"
                />
              </div>
              <div className="rounded-xl border border-border-subtle bg-background/40 p-3">
                <Metric
                  label="Join date"
                  value={formatDate(user?.joinDate ?? user?.joinedAt)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border-subtle bg-background/40 p-3">
                <Metric label="Country" value={user?.country ?? "—"} />
              </div>
              <div className="rounded-xl border border-border-subtle bg-background/40 p-3">
                <Metric label="Gender" value={user?.gender ?? "—"} />
              </div>
              <div className="rounded-xl border border-border-subtle bg-background/40 p-3">
                <Metric
                  label="Best character"
                  value={user?.bestCharacter?.mame ?? "—"}
                />
              </div>
              <div className="rounded-xl border border-border-subtle bg-background/40 p-3">
                <Metric
                  label="Title rank"
                  value={
                    user?.titleRank ?? user?.rankLabel ?? user?.rank ?? "—"
                  }
                />
              </div>
            </div>
          </div>
        </Card>

        <div className="mt-5 grid grid-cols-1 gap-5">
          <Card
            title="Anime stats"
            right={
              <Button gradient="ocean" size="sm" className="h-9">
                Open Anime List
              </Button>
            }
          >
            <div className="grid grid-cols-2 gap-3">
              <StatBox
                label="Watched"
                value={anime?.watched ?? anime?.completed}
              />
              <StatBox label="Watching" value={anime?.watching} />
              <StatBox label="Episodes" value={anime?.episodes} />
              <StatBox
                label="Avg. score"
                value={anime?.avgScore ?? anime?.averageScore}
              />
            </div>
            <DividerGlow />
            <MiniLine
              label="Favorite genre"
              value={anime?.favoriteGenre ?? anime?.favGenre ?? "—"}
              icon={<LuSparkles className="size-4" />}
            />
          </Card>

          <Card
            title="Comics stats"
            right={
              <Button gradient="ocean" size="sm" className="h-9">
                Open Comics List
              </Button>
            }
          >
            <div className="grid grid-cols-2 gap-3">
              <StatBox label="Read" value={comics?.read ?? comics?.completed} />
              <StatBox label="Reading" value={comics?.reading} />
              <StatBox label="Chapters" value={comics?.chapters} />
              <StatBox
                label="Avg. score"
                value={comics?.avgScore ?? comics?.averageScore}
              />
            </div>
            <DividerGlow />
            <MiniLine
              label="Favorite title"
              value={comics?.favoriteTitle ?? comics?.favTitle ?? "—"}
              icon={<LuBookmark className="size-4" />}
            />
          </Card>
        </div>
      </div>

      {/* Right column - feed */}
      <div className="lg:col-span-7">
        <Card
          title="Posts"
          right={
            <div className="text-xs text-muted-foreground">
              {posts?.length ? `${posts.length} total` : "No posts yet"}
            </div>
          }
        >
          <div className="space-y-4">
            {(posts?.length ? posts : demoPosts(user)).map((p, idx) => (
              <article
                key={p?.id ?? idx}
                className={cx(
                  "rounded-2xl border border-border-subtle bg-background/35 p-4",
                  "transition-transform duration-200 hover:-translate-y-0.5",
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0">
                    <Avatar
                      {...({
                        src: user?.avatar ?? user?.avatarUrl,
                        alt: user?.name ?? "User avatar",
                        className: "size-10",
                      } as any)}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">
                          {user?.name ?? "User"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          @{user?.username ?? user?.handle ?? "username"} •{" "}
                          {formatDate(p?.createdAt ?? p?.date)}
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 rounded-full border border-border-subtle bg-surface/60 px-2 py-1 text-[11px] text-muted-foreground">
                        <LuSparkles className="size-3.5" />
                        {p?.topic ?? "Fanaara"}
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-relaxed text-foreground/90">
                      {p?.content ??
                        "Cyber teal vibes today — drop your current watchlist recs. Anything that feels like neon rain & late-night OSTs?"}
                    </p>

                    <div className="mt-3 flex items-center gap-2">
                      <IconButton
                        aria-label="Like"
                        title="Like"
                        variant="ghost"
                        className="hover:bg-surface"
                      >
                        <LuHeart className="size-5 transition-transform group-hover:scale-[1.02]" />
                      </IconButton>
                      <span className="text-xs text-muted-foreground">
                        {formatCompact(p?.likes ?? 0)}
                      </span>

                      <IconButton
                        aria-label="Comment"
                        title="Comment"
                        variant="ghost"
                        className="ml-2 hover:bg-surface"
                      >
                        <LuMessageSquare className="size-5" />
                      </IconButton>
                      <span className="text-xs text-muted-foreground">
                        {formatCompact(p?.comments ?? 0)}
                      </span>

                      <IconButton
                        aria-label="Save"
                        title="Save"
                        variant="ghost"
                        className="ml-2 hover:bg-surface"
                      >
                        <LuBookmark className="size-5" />
                      </IconButton>

                      <div className="ml-auto">
                        <IconButton
                          aria-label="Share post"
                          title="Share"
                          variant="ghost"
                          className="hover:bg-surface"
                        >
                          <LuShare2 className="size-5" />
                        </IconButton>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function PlaceholderTab({ title }: { title: string }) {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      <div className="lg:col-span-12">
        <Card title={title}>
          <div className="rounded-2xl border border-border-subtle bg-background/35 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-border-subtle bg-accent-soft/35 p-3">
                <LuSparkles className="size-6" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">
                  {title} section
                </div>
                <div className="text-sm text-muted-foreground">
                  Plug your real content here — the tab animation & layout are
                  already wired.
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-background/40 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-semibold text-foreground">
        {value === 0 || value ? String(value) : "—"}
      </div>
    </div>
  );
}

function DividerGlow() {
  return (
    <div className="my-4 h-px w-full bg-gradient-to-r from-transparent via-accent-soft/50 to-transparent" />
  );
}

function MiniLine({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border-subtle bg-background/35 px-3 py-2">
      <div className="rounded-lg border border-border-subtle bg-surface/60 p-2">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="truncate text-sm font-semibold text-foreground">
          {value}
        </div>
      </div>
    </div>
  );
}

function demoPosts(user: any) {
  const now = Date.now();
  return [
    {
      id: "demo-1",
      createdAt: new Date(now - 1000 * 60 * 60 * 28).toISOString(),
      topic: "Anime",
      content:
        "Hot take: cyberpunk stories hit harder when the soundtrack is doing half the emotional lifting. Drop OST recs.",
      likes: 128,
      comments: 24,
    },
    {
      id: "demo-2",
      createdAt: new Date(now - 1000 * 60 * 60 * 72).toISOString(),
      topic: "Comics",
      content:
        "Looking for moody neon paneling + sharp dialogue. If it feels like a rainy city arc, I’m in.",
      likes: 86,
      comments: 13,
    },
    {
      id: "demo-3",
      createdAt: new Date(now - 1000 * 60 * 60 * 120).toISOString(),
      topic: "Fanaara",
      content: `If you see @${user?.username ?? user?.handle ?? "username"} online late — I’m probably curating lists 👀`,
      likes: 52,
      comments: 7,
    },
  ];
}
