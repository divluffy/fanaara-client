'use client';

import * as React from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import {
  Flag,
  Share2,
  ShieldCheck,
  Sparkles,
  MapPin,
  Calendar,
  Link as LinkIcon,
  Images,
  ListChecks,
  Heart,
  Star,
  MessageSquareText,
  ThumbsUp,
  Repeat2,
  Bookmark,
} from 'lucide-react';

// ✅ Adjust these imports to match your project structure.
import { Button } from "@/design/Button";
import { IconButton } from "@/design/IconButton";
import { Avatar } from "@/design/Avatar";
type Post = {
  id: string;
  createdAt: string; // ISO
  text: string;
  tags: string[];
  meta: {
    likes: number;
    comments: number;
    reposts: number;
    bookmarks: number;
  };
};

type UserData = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  coverUrl: string;
  rank: { label: string; accent: 'amber' | 'violet' | 'emerald' | 'sky' };
  verified: boolean;
  bio: string;
  location?: string;
  link?: string;
  joinedAt: string; // ISO
  stats: {
    followers: number;
    following: number;
    posts: number;
    likesReceived: number;
    animeCompleted: number;
    mangaCompleted: number;
    streakDays: number;
    level: number;
    xp: number;
    nextLevelXp: number;
  };
  about: {
    basic: {
      favoriteGenres: string[];
      vibe: string;
      currently: string;
    };
    anime: {
      top3: string[];
      currentlyWatching: string;
      favoriteStudio: string;
    };
    comics: {
      top3: string[];
      currentlyReading: string;
      favoritePublisher: string;
    };
  };
  posts: Post[];
};

const UserData: UserData = {
  id: 'u_fanaara_001',
  name: 'Fanaara',
  username: 'fanaara',
  avatarUrl:
    'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=256&q=80',
  coverUrl:
    'https://images.unsplash.com/photo-1520975661595-6453be3f7070?auto=format&fit=crop&w=2000&q=80',
  rank: { label: 'S-Rank Curator', accent: 'violet' },
  verified: true,
  bio: 'Building cozy chaos: anime marathons, panel-by-panel comics dives, and too many hot takes about openings.',
  location: 'Jerusalem',
  link: 'https://fanaara.space',
  joinedAt: '2023-06-14T10:12:00.000Z',
  stats: {
    followers: 12840,
    following: 312,
    posts: 482,
    likesReceived: 90122,
    animeCompleted: 214,
    mangaCompleted: 97,
    streakDays: 43,
    level: 27,
    xp: 18450,
    nextLevelXp: 20000,
  },
  about: {
    basic: {
      favoriteGenres: ['Shōnen', 'Seinen', 'Slice of Life', 'Mystery'],
      vibe: 'Warm chaos + spreadsheet energy',
      currently: 'Curating “Winter Night Watchlist” picks',
    },
    anime: {
      top3: ['Mob Psycho 100', 'Fullmetal Alchemist: Brotherhood', 'Haikyuu!!'],
      currentlyWatching: 'Frieren: Beyond Journey’s End',
      favoriteStudio: 'Bones',
    },
    comics: {
      top3: ['Saga', 'Monstress', 'One Piece (manga)'],
      currentlyReading: 'Chainsaw Man (Part 2)',
      favoritePublisher: 'Image Comics',
    },
  },
  posts: [
    {
      id: 'p1',
      createdAt: '2026-01-22T19:40:00.000Z',
      text: 'OPs that instantly upgrade your mood: 1) “Gurenge”, 2) “99”, 3) “Silhouette”. Add yours 👇',
      tags: ['anime', 'music', 'openings'],
      meta: { likes: 1482, comments: 214, reposts: 97, bookmarks: 301 },
    },
    {
      id: 'p2',
      createdAt: '2026-01-21T11:05:00.000Z',
      text: 'Hot take: the best “power system” is the one that supports character choices, not just fights.',
      tags: ['discussion', 'writing', 'shonen'],
      meta: { likes: 932, comments: 180, reposts: 65, bookmarks: 220 },
    },
    {
      id: 'p3',
      createdAt: '2026-01-19T22:18:00.000Z',
      text: 'Comic panel composition appreciation post: negative space is basically a soundtrack.',
      tags: ['comics', 'art', 'panels'],
      meta: { likes: 721, comments: 62, reposts: 34, bookmarks: 188 },
    },
    {
      id: 'p4',
      createdAt: '2026-01-17T09:12:00.000Z',
      text: 'If your comfort anime is also your “I’m sick” anime… we are the same person.',
      tags: ['sliceoflife', 'comfort'],
      meta: { likes: 1104, comments: 143, reposts: 41, bookmarks: 129 },
    },
  ],
};

const tabs = [
  { key: 'about', label: 'About' },
  { key: 'gallery', label: 'Gallery' },
  { key: 'lists', label: 'Lists' },
  { key: 'favorites', label: 'Favorites' },
  { key: 'ratings', label: 'Ratings' },
  { key: 'reviews', label: 'Reviews' },
] as const;

type TabKey = (typeof tabs)[number]['key'];

function formatCompact(n: number) {
  if (n < 1000) return `${n}`;
  const units = [
    { v: 1_000_000_000, s: 'B' },
    { v: 1_000_000, s: 'M' },
    { v: 1_000, s: 'K' },
  ];
  const u = units.find((x) => n >= x.v);
  if (!u) return `${n}`;
  const val = n / u.v;
  const fixed = val >= 10 ? val.toFixed(0) : val.toFixed(1);
  return `${fixed}${u.s}`;
}

function timeAgo(iso: string) {
  const t = new Date(iso).getTime();
  const now = Date.now();
  const s = Math.max(1, Math.floor((now - t) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

function rankAccentClasses(accent: UserData['rank']['accent']) {
  switch (accent) {
    case 'amber':
      return 'bg-amber-500/15 text-amber-700 ring-amber-500/30';
    case 'emerald':
      return 'bg-emerald-500/15 text-emerald-700 ring-emerald-500/30';
    case 'sky':
      return 'bg-sky-500/15 text-sky-700 ring-sky-500/30';
    case 'violet':
    default:
      return 'bg-violet-500/15 text-violet-700 ring-violet-500/30';
  }
}

export default function FanaaraProfilePage() {
  const user = UserData;
  const [active, setActive] = React.useState<TabKey>('about');

  const xpPct = Math.min(100, Math.round((user.stats.xp / user.stats.nextLevelXp) * 100));

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-50">
      {/* Header cover */}
      <div className="relative h-56 w-full overflow-hidden lg:h-72">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${user.coverUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/35 to-zinc-950/15" />

        {/* Pinned corner actions */}
        <div className="absolute left-4 top-4 z-10 flex gap-2">
          <IconButton aria-label="Report profile" variant="ghost">
            <Flag className="h-4 w-4" />
          </IconButton>
        </div>
        <div className="absolute right-4 top-4 z-10 flex gap-2">
          <IconButton aria-label="Share profile" variant="ghost">
            <Share2 className="h-4 w-4" />
          </IconButton>
        </div>

        <div className="absolute bottom-4 left-0 right-0 z-10">
          <div className="mx-auto flex max-w-6xl items-end justify-between px-4">
            <div className="flex items-center gap-3">
              <div className="hidden sm:block">
                <div
                  className={[
                    'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs ring-1 backdrop-blur',
                    rankAccentClasses(user.rank.accent),
                  ].join(' ')}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span className="font-medium">{user.rank.label}</span>
                  {user.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-zinc-950/40 px-2 py-0.5 text-[11px] text-zinc-50 ring-1 ring-white/10">
                      <ShieldCheck className="h-3 w-3" />
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="hidden gap-2 sm:flex">
              <Button variant="secondary">Follow</Button>
              <Button>Message</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main surface card below header */}
      <div className="mx-auto -mt-10 max-w-6xl px-4 pb-12 lg:-mt-14">
        <div className="rounded-3xl bg-zinc-900/70 ring-1 ring-white/10 backdrop-blur">
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Mobile header actions (since top-right actions already exist; this is for primary CTAs) */}
            <div className="mb-5 flex items-start justify-between gap-3 sm:hidden">
              <div className="flex items-center gap-3">
                <Avatar src={user.avatarUrl} alt={user.name} className="h-14 w-14 ring-2 ring-white/10" />
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-semibold leading-tight">{user.name}</h1>
                    {user.verified && <ShieldCheck className="h-4 w-4 text-emerald-300" />}
                  </div>
                  <p className="text-sm text-zinc-300">@{user.username}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm">
                  Follow
                </Button>
                <Button size="sm">Message</Button>
              </div>
            </div>

            {/* Content layout */}
            <div className="grid gap-6 lg:grid-cols-[360px_1fr] lg:gap-8">
              {/* Left: sticky profile summary */}
              <aside className="lg:sticky lg:top-6 lg:self-start">
                <div className="rounded-2xl bg-zinc-950/40 p-4 ring-1 ring-white/10 sm:p-5">
                  <div className="hidden sm:flex items-start gap-4">
                    <Avatar
                      src={user.avatarUrl}
                      alt={user.name}
                      className="h-16 w-16 ring-2 ring-white/10"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h1 className="truncate text-xl font-semibold">{user.name}</h1>
                        {user.verified && <ShieldCheck className="h-4 w-4 text-emerald-300" />}
                      </div>
                      <p className="truncate text-sm text-zinc-300">@{user.username}</p>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span
                          className={[
                            'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs ring-1',
                            rankAccentClasses(user.rank.accent),
                          ].join(' ')}
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          {user.rank.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-zinc-200">{user.bio}</p>

                  <div className="mt-4 grid gap-2 text-sm text-zinc-300">
                    {user.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-zinc-400" />
                        <span>{user.location}</span>
                      </div>
                    )}
                    {user.link && (
                      <div className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4 text-zinc-400" />
                        <a
                          href={user.link}
                          className="truncate text-zinc-100 underline decoration-white/20 underline-offset-4 hover:decoration-white/50"
                        >
                          {user.link}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-zinc-400" />
                      <span>
                        Joined{' '}
                        {new Date(user.joinedAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 hidden gap-2 sm:flex">
                    <Button variant="secondary" className="flex-1">
                      Follow
                    </Button>
                    <Button className="flex-1">Message</Button>
                  </div>

                  {/* Quick stats */}
                  <div className="mt-5 grid grid-cols-4 gap-2">
                    <StatMini label="Followers" value={formatCompact(user.stats.followers)} />
                    <StatMini label="Following" value={formatCompact(user.stats.following)} />
                    <StatMini label="Posts" value={formatCompact(user.stats.posts)} />
                    <StatMini label="Likes" value={formatCompact(user.stats.likesReceived)} />
                  </div>

                  {/* Progress / XP */}
                  <div className="mt-5 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-zinc-100">
                        Level {user.stats.level}
                      </div>
                      <div className="text-xs text-zinc-300">
                        {formatCompact(user.stats.xp)} / {formatCompact(user.stats.nextLevelXp)} XP
                      </div>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-white/10">
                      <div
                        className="h-2 rounded-full bg-white/60"
                        style={{ width: `${xpPct}%` }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-zinc-300">
                      <span>Streak: {user.stats.streakDays}d</span>
                      <span>Anime: {user.stats.animeCompleted} • Manga: {user.stats.mangaCompleted}</span>
                    </div>
                  </div>
                </div>
              </aside>

              {/* Right: tabs + content */}
              <section className="min-w-0">
                <LayoutGroup id="profile-tabs">
                  {/* Segmented control */}
                  <div className="rounded-2xl bg-zinc-950/40 p-2 ring-1 ring-white/10">
                    <div className="flex flex-wrap gap-1">
                      {tabs.map((t) => {
                        const isActive = t.key === active;
                        return (
                          <button
                            key={t.key}
                            type="button"
                            onClick={() => setActive(t.key)}
                            className={[
                              'relative rounded-xl px-3 py-2 text-sm font-medium transition',
                              'text-zinc-300 hover:text-zinc-50',
                              'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/25',
                              isActive ? 'text-zinc-950' : '',
                            ].join(' ')}
                          >
                            {isActive && (
                              <motion.span
                                layoutId="activeSegment"
                                className="absolute inset-0 rounded-xl bg-white"
                                transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                              />
                            )}
                            <span className="relative z-10">{t.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tab content w/ transition */}
                  <div className="mt-4">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={active}
                        initial={{ opacity: 0, y: 8, filter: 'blur(6px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -6, filter: 'blur(6px)' }}
                        transition={{ duration: 0.18 }}
                        className="min-w-0"
                      >
                        {active === 'about' && <AboutTab user={user} />}
                        {active === 'gallery' && <GalleryTab />}
                        {active === 'lists' && (
                          <ListTab
                            title="Lists"
                            rows={[
                              { icon: <ListChecks className="h-4 w-4" />, label: 'Winter Night Watchlist', badge: '12' },
                              { icon: <ListChecks className="h-4 w-4" />, label: 'S-Tier Openings', badge: '34' },
                              { icon: <ListChecks className="h-4 w-4" />, label: 'Comics: Panelcraft Study', badge: '9' },
                              { icon: <ListChecks className="h-4 w-4" />, label: 'Comfort Rewatches', badge: '17' },
                            ]}
                          />
                        )}
                        {active === 'favorites' && (
                          <ListTab
                            title="Favorites"
                            rows={[
                              { icon: <Heart className="h-4 w-4" />, label: 'Mob Psycho 100', badge: 'Anime' },
                              { icon: <Heart className="h-4 w-4" />, label: 'Saga', badge: 'Comic' },
                              { icon: <Heart className="h-4 w-4" />, label: 'Haikyuu!!', badge: 'Anime' },
                              { icon: <Heart className="h-4 w-4" />, label: 'Monstress', badge: 'Comic' },
                            ]}
                          />
                        )}
                        {active === 'ratings' && (
                          <ListTab
                            title="Ratings"
                            rows={[
                              { icon: <Star className="h-4 w-4" />, label: 'Frieren', badge: '9.5' },
                              { icon: <Star className="h-4 w-4" />, label: 'Chainsaw Man', badge: '9.1' },
                              { icon: <Star className="h-4 w-4" />, label: 'Dungeon Meshi', badge: '8.8' },
                              { icon: <Star className="h-4 w-4" />, label: 'Monstress', badge: '9.0' },
                            ]}
                          />
                        )}
                        {active === 'reviews' && (
                          <ListTab
                            title="Reviews"
                            rows={[
                              { icon: <MessageSquareText className="h-4 w-4" />, label: 'Why “quiet arcs” hit harder', badge: 'New' },
                              { icon: <MessageSquareText className="h-4 w-4" />, label: 'Top 5 comic villains with style', badge: 'Hot' },
                              { icon: <MessageSquareText className="h-4 w-4" />, label: 'OP tier list (with receipts)', badge: 'Pinned' },
                              { icon: <MessageSquareText className="h-4 w-4" />, label: 'Panel flow: speed vs weight', badge: '3m read' },
                            ]}
                          />
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </LayoutGroup>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/5 px-2 py-2 text-center ring-1 ring-white/10">
      <div className="text-sm font-semibold text-zinc-100">{value}</div>
      <div className="mt-0.5 text-[11px] text-zinc-400">{label}</div>
    </div>
  );
}

function AboutTab({ user }: { user: UserData }) {
  return (
    <div className="space-y-4">
      {/* Top: 3 cards grid */}
      <div className="grid gap-3 md:grid-cols-3">
        <InfoCard
          title="Basic"
          icon={<Sparkles className="h-4 w-4" />}
          items={[
            { k: 'Vibe', v: user.about.basic.vibe },
            { k: 'Currently', v: user.about.basic.currently },
            { k: 'Genres', v: user.about.basic.favoriteGenres.join(' • ') },
          ]}
        />
        <InfoCard
          title="Anime"
          icon={<Sparkles className="h-4 w-4" />}
          items={[
            { k: 'Top 3', v: user.about.anime.top3.join(' • ') },
            { k: 'Watching', v: user.about.anime.currentlyWatching },
            { k: 'Studio', v: user.about.anime.favoriteStudio },
          ]}
        />
        <InfoCard
          title="Comics"
          icon={<Sparkles className="h-4 w-4" />}
          items={[
            { k: 'Top 3', v: user.about.comics.top3.join(' • ') },
            { k: 'Reading', v: user.about.comics.currentlyReading },
            { k: 'Publisher', v: user.about.comics.favoritePublisher },
          ]}
        />
      </div>

      {/* Posts feed */}
      <div className="rounded-2xl bg-zinc-950/40 ring-1 ring-white/10">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
            <Sparkles className="h-4 w-4" />
            Posts
          </div>
          <div className="text-xs text-zinc-400">Compact view • fast scan</div>
        </div>

        <div className="divide-y divide-white/10">
          {user.posts.map((p) => (
            <div key={p.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <span className="font-medium text-zinc-200">@{user.username}</span>
                    <span>•</span>
                    <span>{timeAgo(p.createdAt)} ago</span>
                  </div>

                  <p className="mt-2 text-sm leading-relaxed text-zinc-100">{p.text}</p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-zinc-300 ring-1 ring-white/10"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <ActionIcon icon={<ThumbsUp className="h-4 w-4" />} label="Like" count={p.meta.likes} />
                <ActionIcon
                  icon={<MessageSquareText className="h-4 w-4" />}
                  label="Comment"
                  count={p.meta.comments}
                />
                <ActionIcon icon={<Repeat2 className="h-4 w-4" />} label="Repost" count={p.meta.reposts} />
                <ActionIcon
                  icon={<Bookmark className="h-4 w-4" />}
                  label="Bookmark"
                  count={p.meta.bookmarks}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  title,
  icon,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  items: { k: string; v: string }[];
}) {
  return (
    <div className="rounded-2xl bg-zinc-950/40 p-4 ring-1 ring-white/10">
      <div className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
          {icon}
        </span>
        {title}
      </div>
      <div className="mt-3 space-y-2">
        {items.map((it) => (
          <div key={it.k} className="flex gap-3">
            <div className="w-20 shrink-0 text-xs text-zinc-400">{it.k}</div>
            <div className="min-w-0 text-sm text-zinc-200">
              <span className="break-words">{it.v}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionIcon({
  icon,
  label,
  count,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
}) {
  return (
    <div className="inline-flex items-center gap-1.5">
      <IconButton aria-label={label} variant="ghost" size="sm">
        {icon}
      </IconButton>
      <span className="text-xs text-zinc-300">{formatCompact(count)}</span>
    </div>
  );
}

function GalleryTab() {
  const tiles = Array.from({ length: 8 }, (_, i) => i);
  return (
    <div className="rounded-2xl bg-zinc-950/40 p-4 ring-1 ring-white/10">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
          <Images className="h-4 w-4" />
          Gallery
        </div>
        <div className="text-xs text-zinc-400">8 items • placeholders</div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {tiles.map((i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.02 }}
            className="group relative aspect-square overflow-hidden rounded-2xl ring-1 ring-white/10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-white/10" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_55%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.10),transparent_55%)]" />
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
              <span className="rounded-full bg-zinc-950/50 px-2 py-0.5 text-[11px] text-zinc-200 ring-1 ring-white/10">
                #{i + 1}
              </span>
              <span className="rounded-full bg-zinc-950/50 px-2 py-0.5 text-[11px] text-zinc-200 ring-1 ring-white/10 opacity-0 transition-opacity group-hover:opacity-100">
                View
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ListTab({
  title,
  rows,
}: {
  title: string;
  rows: { icon: React.ReactNode; label: string; badge: string }[];
}) {
  return (
    <div className="rounded-2xl bg-zinc-950/40 ring-1 ring-white/10">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
          <Sparkles className="h-4 w-4" />
          {title}
        </div>
        <div className="text-xs text-zinc-400">Lightweight placeholders</div>
      </div>

      <div className="divide-y divide-white/10">
        {rows.map((r, idx) => (
          <div key={idx} className="flex items-center justify-between gap-3 p-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-zinc-200 ring-1 ring-white/10">
                {r.icon}
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-zinc-100">{r.label}</div>
                <div className="text-xs text-zinc-400">Updated recently • curated</div>
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-white/5 px-2.5 py-1 text-xs text-zinc-200 ring-1 ring-white/10">
              {r.badge}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
