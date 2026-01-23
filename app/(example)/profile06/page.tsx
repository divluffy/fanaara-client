"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flag,
  Share2,
  UserPlus,
  Flame,
  Bell,
  MessageCircle,
  Gift,
  ChevronRight,
  Image as ImageIcon,
  Star,
  Heart,
  List as ListIcon,
  Sparkles,
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
  | "about"
  | "popularities"
  | "gallery"
  | "swipes"
  | "lists"
  | "favorites"
  | "ratings"
  | "reviews";

const TABS: Array<{ key: TabKey; label: string; icon: React.ReactNode }> = [
  { key: "about", label: "General/About", icon: <Sparkles className="h-4 w-4" /> },
  { key: "popularities", label: "Popularities", icon: <Flame className="h-4 w-4" /> },
  { key: "gallery", label: "Gallery", icon: <ImageIcon className="h-4 w-4" /> },
  { key: "swipes", label: "Swipes", icon: <Heart className="h-4 w-4" /> },
  { key: "lists", label: "Lists", icon: <ListIcon className="h-4 w-4" /> },
  { key: "favorites", label: "Favorites", icon: <Heart className="h-4 w-4" /> },
  { key: "ratings", label: "Ratings", icon: <Star className="h-4 w-4" /> },
  { key: "reviews", label: "Reviews", icon: <MessageCircle className="h-4 w-4" /> },
];

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: (d = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut", delay: d },
  }),
};

function cx(...v: Array<string | false | undefined | null>) {
  return v.filter(Boolean).join(" ");
}

function formatDate(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function StatChip({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-surface px-3 py-2 border border-border-subtle">
      <div className="text-xs text-foreground-muted">{label}</div>
      <div className="text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

function Card({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-card border border-border-subtle p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-foreground">{title}</div>
        {right}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export default function FanaaraProfilePage() {
  const [tab, setTab] = React.useState<TabKey>("about");

  const fullName = `${UserData.first_name} ${UserData.last_name}`;
  const borderSrc = RanksBorders[UserData.rank];

  const posts = React.useMemo(
    () => [
      { id: "p1", title: "Just finished the Wano arc—peak.", meta: "Anime • 2h ago", body: "The pacing, the payoff, the music… wow." },
      { id: "p2", title: "My top 5 villains this month", meta: "Lists • 1d ago", body: "Doffy stays in the rotation. Fight me." },
      { id: "p3", title: "Panel appreciation: Berserk", meta: "Comics • 2d ago", body: "Some pages feel like paintings. Respect." },
      { id: "p4", title: "Underrated slice-of-life recs?", meta: "Discussion • 3d ago", body: "Need cozy vibes with great character writing." },
      { id: "p5", title: "Rating spree night", meta: "Ratings • 5d ago", body: "Cleared my backlog—feels good." },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="relative w-full">
        <div className="relative h-[320px] sm:h-[360px]">
          {/* bg */}
          <div
            className="absolute inset-0 bg-surface"
            style={{
              backgroundImage: `url(${UserData.bg.lg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="absolute inset-0 bg-background/60" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-bg-background/95 to-transparent" />

          {/* top buttons */}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-4">
            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0.05}>
              <IconButton aria-label="Report" className="bg-surface border border-border-subtle">
                <Flag className="h-5 w-5 text-foreground" />
              </IconButton>
            </motion.div>
            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0.08}>
              <IconButton aria-label="Share" className="bg-surface border border-border-subtle">
                <Share2 className="h-5 w-5 text-foreground" />
              </IconButton>
            </motion.div>
          </div>

          {/* center identity */}
          <div className="absolute inset-x-0 bottom-0 px-4 pb-4">
            <div className="mx-auto max-w-5xl">
              <motion.div
                className="flex flex-col items-center text-center"
                initial="hidden"
                animate="show"
              >
                <motion.div variants={fadeUp} custom={0.12} className="relative">
                  <div className="relative">
                    {/* rank border */}
                    <div
                      className="absolute inset-[-8px] rounded-full"
                      style={{
                        backgroundImage: `url(${borderSrc})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        filter: "saturate(1.1)",
                      }}
                      aria-hidden
                    />
                    <div className="absolute inset-[-8px] rounded-full bg-background/35 border border-border-subtle" aria-hidden />
                    <div className="relative rounded-full bg-surface p-1 border border-border-subtle">
                      <Avatar src={UserData.avatar.md} alt={fullName} className="h-24 w-24" />
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={fadeUp} custom={0.18} className="mt-3 flex flex-col items-center gap-1">
                  <div className="inline-flex items-center gap-2">
                    <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent border border-border-subtle">
                      {UserData.titleRank}
                    </span>
                  </div>
                  <div className="text-xl font-bold text-foreground">{fullName}</div>
                  <div className="text-sm text-foreground-muted">@{UserData.username}</div>
                </motion.div>

                {/* actions */}
                <motion.div
                  variants={fadeUp}
                  custom={0.24}
                  className="mt-4 w-full"
                >
                  <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-center">
                    <Button className="w-full sm:w-auto" variant="default">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Follow
                    </Button>

                    <Button className="w-full sm:w-auto bg-accent-soft text-accent border border-border-subtle" variant="secondary">
                      <Flame className="h-4 w-4 mr-2" />
                      Popularity
                    </Button>

                    <Button className="relative w-full sm:w-auto" variant="secondary">
                      <Bell className="h-4 w-4 mr-2" />
                      Notifications
                      {UserData.notifications > 0 && (
                        <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-accent-soft text-accent px-1.5 text-xs border border-border-subtle">
                          {UserData.notifications}
                        </span>
                      )}
                    </Button>

                    <Button className="w-full sm:w-auto" variant="secondary">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Chat
                    </Button>

                    <Button className="w-full sm:w-auto" variant="secondary">
                      <Gift className="h-4 w-4 mr-2" />
                      Gift
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-5xl px-4 pb-10">
        {/* Tabs */}
        <div className="sticky top-0 z-10 bg-background/85 backdrop-blur border-b border-border-subtle">
          <div className="py-3">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {TABS.map((t) => {
                const active = t.key === tab;
                return (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={cx(
                      "relative shrink-0 rounded-full px-3 py-2 text-sm border border-border-subtle bg-surface",
                      active ? "text-foreground" : "text-foreground-muted"
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    <span className="inline-flex items-center gap-2">
                      {t.icon}
                      <span className="whitespace-nowrap">{t.label}</span>
                    </span>

                    {active && (
                      <motion.span
                        layoutId="tab-underline"
                        className="absolute left-3 right-3 -bottom-[10px] h-0.5 rounded-full bg-accent-soft"
                        transition={{ type: "spring", stiffness: 500, damping: 40 }}
                        aria-hidden
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="pt-5"
          >
            {tab === "about" && (
              <div className="grid gap-4 lg:grid-cols-12">
                {/* Left column */}
                <div className="grid gap-4 lg:col-span-5">
                  <Card title="Basic details">
                    <div className="grid grid-cols-2 gap-3">
                      <StatChip label="Country" value={UserData.country.toUpperCase()} />
                      <StatChip label="Gender" value={UserData.gender} />
                      <StatChip label="Joined" value={formatDate(UserData.joinDate)} />
                      <StatChip label="Popularity" value={`${UserData.popularity}/100`} />
                      <StatChip label="Best character" value={`${UserData.bestCharacter.name}`} />
                      <StatChip label="Title rank" value={UserData.titleRank} />
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <StatChip label="Posts" value={UserData.counts.posts.toLocaleString()} />
                      <StatChip label="Likes" value={UserData.counts.likes.toLocaleString()} />
                      <StatChip label="Followers" value={UserData.counts.followers.toLocaleString()} />
                      <StatChip label="Following" value={UserData.counts.following.toLocaleString()} />
                    </div>
                  </Card>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                    <Card
                      title="Anime stats"
                      right={
                        <Button variant="secondary" className="h-9">
                          View List <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      }
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <StatChip label="Watched" value={UserData.stats.anime.watched} />
                        <StatChip label="Episodes" value={UserData.stats.anime.episodes.toLocaleString()} />
                        <StatChip label="Hours" value={UserData.stats.anime.hours} />
                        <StatChip label="Mean score" value={UserData.stats.anime.meanScore} />
                      </div>
                    </Card>

                    <Card
                      title="Comics stats"
                      right={
                        <Button variant="secondary" className="h-9">
                          View List <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      }
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <StatChip label="Read" value={UserData.stats.comics.read} />
                        <StatChip label="Chapters" value={UserData.stats.comics.chapters.toLocaleString()} />
                        <StatChip label="Hours" value={UserData.stats.comics.hours} />
                        <StatChip label="Mean score" value={UserData.stats.comics.meanScore} />
                      </div>
                    </Card>
                  </div>
                </div>

                {/* Right column */}
                <div className="grid gap-4 lg:col-span-7">
                  <Card
                    title="Posts"
                    right={
                      <div className="inline-flex items-center gap-2 text-xs text-foreground-muted">
                        <span className="rounded-full bg-surface px-2 py-1 border border-border-subtle">
                          Compact feed
                        </span>
                      </div>
                    }
                  >
                    <div className="grid gap-2">
                      {posts.map((p) => (
                        <div
                          key={p.id}
                          className="rounded-xl bg-surface border border-border-subtle p-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-foreground truncate">
                                {p.title}
                              </div>
                              <div className="mt-0.5 text-xs text-foreground-muted">
                                {p.meta}
                              </div>
                            </div>
                            <IconButton aria-label="Open post" className="bg-card border border-border-subtle shrink-0">
                              <ChevronRight className="h-4 w-4 text-foreground" />
                            </IconButton>
                          </div>
                          <div className="mt-2 text-sm text-foreground-muted line-clamp-2">
                            {p.body}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <div className="rounded-2xl bg-card border border-border-subtle p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-foreground">Highlights</div>
                      <div className="inline-flex items-center gap-2 text-xs text-foreground-muted">
                        <span className="rounded-full bg-accent-soft text-accent px-2 py-1 border border-border-subtle">
                          {UserData.bestCharacter.series}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div className="rounded-xl bg-surface border border-border-subtle p-3">
                        <div className="text-xs text-foreground-muted">Streak</div>
                        <div className="mt-1 text-sm font-medium text-foreground">12 days</div>
                      </div>
                      <div className="rounded-xl bg-surface border border-border-subtle p-3">
                        <div className="text-xs text-foreground-muted">Top genre</div>
                        <div className="mt-1 text-sm font-medium text-foreground">Shounen</div>
                      </div>
                      <div className="rounded-xl bg-surface border border-border-subtle p-3">
                        <div className="text-xs text-foreground-muted">Badges</div>
                        <div className="mt-1 text-sm font-medium text-foreground">7</div>
                      </div>
                      <div className="rounded-xl bg-surface border border-border-subtle p-3">
                        <div className="text-xs text-foreground-muted">Achievements</div>
                        <div className="mt-1 text-sm font-medium text-foreground">19</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab !== "about" && (
              <div className="rounded-2xl bg-card border border-border-subtle p-6">
                <div className="flex items-center gap-2 text-foreground">
                  <span className="rounded-full bg-accent-soft text-accent px-2 py-1 text-xs font-semibold border border-border-subtle">
                    {TABS.find((t) => t.key === tab)?.label}
                  </span>
                  <span className="text-sm text-foreground-muted">
                    Demo panel (wire content). Add real data when ready.
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-xl bg-surface border border-border-subtle p-4"
                    >
                      <div className="text-sm font-semibold text-foreground">
                        Item {i + 1}
                      </div>
                      <div className="mt-1 text-sm text-foreground-muted">
                        Quick preview content for this tab.
                      </div>
                      <div className="mt-3">
                        <Button variant="secondary" className="h-9">
                          Open <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* subtle footer spacer */}
      <div className="h-6" />
    </div>
  );
}
