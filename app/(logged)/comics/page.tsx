// app\(logged)\comics\page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Fanaara Comics Landing (Single File)
 * - Original layout inspired by modern comic platforms patterns (not a copy)
 * - Fully interactive: search overlay, hero carousel, continue reading (localStorage), rails, charts
 * - Fake data + real placeholder images (picsum + dicebear)
 */

type Badge = 'NEW' | 'HOT' | 'TOP' | 'EDITOR';

type SeriesCard = {
  id: string;
  slug: string;
  title: string;
  author: string;
  genres: string[];
  tags: string[];
  rating: number; // 0..10
  subscribers: number;
  views: number;
  coverUrl: string;
  bannerUrl: string;
  description: string;
  update: string;
  badge?: Badge;
  kind: 'Manga' | 'Manhwa' | 'Manhua' | 'Comic';
  age: 'All Ages' | 'Teen' | 'Mature 18+';
};

type ContinueItem = {
  seriesId: string;
  slug: string;
  title: string;
  coverUrl: string;
  lastReadEpisodeNumber: number;
  lastReadProgress: number; // 0..100
  lastReadAtISO: string;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function img(seed: string, w: number, h: number) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}

function avatar(seed: string) {
  return `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}

function formatCompact(n: number) {
  try {
    return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
  } catch {
    if (n >= 1_000_000) return `${Math.round((n / 1_000_000) * 10) / 10}M`;
    if (n >= 1_000) return `${Math.round((n / 1_000) * 10) / 10}K`;
    return String(n);
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function Icon({
  name,
  className,
}: {
  name:
    | 'search'
    | 'sparkle'
    | 'fire'
    | 'chart'
    | 'book'
    | 'user'
    | 'chevron-right'
    | 'play'
    | 'bell'
    | 'grid';
  className?: string;
}) {
  const c = cn('h-5 w-5', className);
  switch (name) {
    case 'search':
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M11 18a7 7 0 110-14 7 7 0 010 14z" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case 'sparkle':
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 2l1.2 4.2L17.4 8 13.2 9.2 12 13.4 10.8 9.2 6.6 8l4.2-1.8L12 2z"
            fill="currentColor"
            opacity="0.25"
          />
          <path
            d="M12 2l1.2 4.2L17.4 8 13.2 9.2 12 13.4 10.8 9.2 6.6 8l4.2-1.8L12 2z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'fire':
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 22c4.4 0 8-3.2 8-7.6 0-2.7-1.4-5.1-3.7-6.4.1 2.2-.9 3.9-2.9 4.9.2-2.9-1.1-5.5-3.4-7C9.3 3.5 7.5 6 7.6 9c-1.8.9-3 2.8-3 5.4C4.6 18.8 7.6 22 12 22z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'chart':
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 19V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M4 19h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M8 16v-6M12 16V7M16 16v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'book':
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M6 3h11a3 3 0 013 3v14a2 2 0 01-2 2H7a3 3 0 01-3-3V3z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path d="M6 19a3 3 0 003 3" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case 'user':
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M20 21a8 8 0 10-16 0"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M12 12a4 4 0 100-8 4 4 0 000 8z"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      );
    case 'chevron-right':
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'play':
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M9 7l10 5-10 5V7z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'bell':
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M14 21a2 2 0 01-4 0"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'grid':
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 4h7v7H4V4zM13 4h7v7h-7V4zM4 13h7v7H4v-7zM13 13h7v7h-7v-7z" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
  }
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-xs font-semibold text-zinc-200 ring-1 ring-white/10">
      {children}
    </span>
  );
}

function Button({
  children,
  href,
  onClick,
  variant = 'primary',
  className,
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-extrabold transition focus:outline-none focus:ring-2 focus:ring-white/20';
  const v =
    variant === 'primary'
      ? 'bg-gradient-to-r from-fuchsia-500/90 via-indigo-500/90 to-cyan-500/90 text-zinc-950 hover:brightness-110'
      : variant === 'secondary'
        ? 'bg-white/10 text-white hover:bg-white/15 ring-1 ring-white/10'
        : 'bg-transparent text-white hover:bg-white/10 ring-1 ring-white/10';

  if (href) {
    return (
      <Link href={href} className={cn(base, v, className)}>
        {children}
      </Link>
    );
  }
  return (
    <button onClick={onClick} className={cn(base, v, className)}>
      {children}
    </button>
  );
}

function buildCatalog(): SeriesCard[] {
  // Use stable IDs because continue-reading reads localStorage by series.id
  return [
    {
      id: 'series_neon_ronin',
      slug: 'neon-ronin',
      title: 'Neon Ronin',
      author: 'Hana Kurose',
      genres: ['Action', 'Sci‑Fi', 'Cyberpunk'],
      tags: ['Anti‑Hero', 'Neon City', 'Found Family'],
      rating: 9.4,
      subscribers: 1_248_900,
      views: 91_320_500,
      coverUrl: img('fanaara-neon-cover', 720, 960),
      bannerUrl: img('fanaara-neon-banner', 1600, 700),
      description:
        'A retired blade-for-hire protects a girl with a stolen core. The city sells memories—so every fight costs more than blood.',
      update: 'UP EVERY FRIDAY',
      badge: 'TOP',
      kind: 'Manhwa',
      age: 'Teen',
    },
    {
      id: 'series_starlit_atelier',
      slug: 'starlit-atelier',
      title: 'Starlit Atelier',
      author: 'Mina Arai',
      genres: ['Romance', 'Slice of Life', 'Comedy'],
      tags: ['Cozy', 'Art School', 'Rivals'],
      rating: 9.1,
      subscribers: 388_120,
      views: 24_610_900,
      coverUrl: img('fanaara-starlit-cover', 720, 960),
      bannerUrl: img('fanaara-starlit-banner', 1600, 700),
      description:
        'Two art students share a tiny atelier and a mountain of deadlines. Feelings pile up faster than canvases.',
      update: 'UP EVERY TUESDAY',
      badge: 'EDITOR',
      kind: 'Manga',
      age: 'All Ages',
    },
    {
      id: 'series_abyssal_contract',
      slug: 'abyssal-contract',
      title: 'Abyssal Contract',
      author: 'Rin Valtor',
      genres: ['Fantasy', 'Mystery', 'Adventure'],
      tags: ['Dark Fantasy', 'Ancient Gods', 'Cursed Relics'],
      rating: 8.8,
      subscribers: 210_900,
      views: 12_840_100,
      coverUrl: img('fanaara-abyss-cover', 720, 960),
      bannerUrl: img('fanaara-abyss-banner', 1600, 700),
      description:
        'A relic diver signs a contract to retrieve a “song” under a sea-floor city. The deeper he goes, the more the world forgets him.',
      update: 'HIATUS • RETURN TBA',
      badge: 'HOT',
      kind: 'Manhua',
      age: 'Mature 18+',
    },
    {
      id: 'series_moonlit_compiler',
      slug: 'moonlit-compiler',
      title: 'Moonlit Compiler',
      author: 'Aya Jin',
      genres: ['Romance', 'Drama'],
      tags: ['Slow Burn', 'Tech', 'Second Chances'],
      rating: 8.9,
      subscribers: 410_200,
      views: 18_040_700,
      coverUrl: img('rec-moonlit-compiler', 720, 960),
      bannerUrl: img('rec-moonlit-compiler-banner', 1600, 700),
      description:
        'Two devs, one startup deadline, and a love story that keeps failing builds until it finally compiles.',
      update: 'UP EVERY SATURDAY',
      badge: 'NEW',
      kind: 'Comic',
      age: 'Teen',
    },
    {
      id: 'series_paper_samurai',
      slug: 'paper-samurai',
      title: 'Paper Samurai',
      author: 'Kiyo Studio',
      genres: ['Action', 'Comedy'],
      tags: ['Tournament', 'Training', 'Hype'],
      rating: 9.2,
      subscribers: 980_000,
      views: 60_200_000,
      coverUrl: img('rec-paper-samurai', 720, 960),
      bannerUrl: img('rec-paper-samurai-banner', 1600, 700),
      description:
        'A broke cosplayer becomes the real deal after a cursed paper blade chooses him. Chaos. Glory. Paper cuts.',
      update: 'UP EVERY WEDNESDAY',
      badge: 'HOT',
      kind: 'Manhwa',
      age: 'Teen',
    },
    {
      id: 'series_midnight_bento',
      slug: 'midnight-bento',
      title: 'Midnight Bento',
      author: 'Sora Matsu',
      genres: ['Slice of Life', 'Food'],
      tags: ['Healing', 'Cozy', 'Night Shift'],
      rating: 9.0,
      subscribers: 201_400,
      views: 9_500_000,
      coverUrl: img('rec-midnight-bento', 720, 960),
      bannerUrl: img('rec-midnight-bento-banner', 1600, 700),
      description:
        'A tiny midnight shop that feeds people and secrets. Each meal is a confession.',
      update: 'UP EVERY MONDAY',
      badge: 'EDITOR',
      kind: 'Manga',
      age: 'All Ages',
    },
    {
      id: 'series_ink_covenant',
      slug: 'the-ink-covenant',
      title: 'The Ink Covenant',
      author: 'Lune Noire',
      genres: ['Fantasy', 'Romance'],
      tags: ['Witches', 'Contracts', 'Forbidden Love'],
      rating: 8.7,
      subscribers: 155_090,
      views: 7_900_000,
      coverUrl: img('rec-ink-covenant', 720, 960),
      bannerUrl: img('rec-ink-covenant-banner', 1600, 700),
      description:
        'A witch’s ink binds promises into reality—until she writes a vow that should never exist.',
      update: 'UP EVERY THURSDAY',
      badge: 'NEW',
      kind: 'Manhua',
      age: 'Teen',
    },
    {
      id: 'series_chibi_dungeon',
      slug: 'chibi-dungeon',
      title: 'Chibi Dungeon',
      author: 'PixelMori',
      genres: ['Comedy', 'Fantasy'],
      tags: ['Chibi', 'Party', 'Memes'],
      rating: 9.3,
      subscribers: 600_000,
      views: 33_000_000,
      coverUrl: img('rec-chibi-dungeon', 720, 960),
      bannerUrl: img('rec-chibi-dungeon-banner', 1600, 700),
      description:
        'Tiny heroes. Huge ego. Every floor is a disaster—and a punchline.',
      update: 'UP EVERY SUNDAY',
      badge: 'HOT',
      kind: 'Comic',
      age: 'All Ages',
    },
  ];
}

function readLS<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function Stars({ value }: { value: number }) {
  const outOf10 = clamp(value, 0, 10);
  const outOf5 = outOf10 / 2;
  const full = Math.floor(outOf5);
  const half = outOf5 - full >= 0.5;

  return (
    <div className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => {
        const idx = i + 1;
        const filled = idx <= full;
        const isHalf = !filled && half && idx === full + 1;
        return (
          <span key={idx} className="relative inline-flex h-4 w-4">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
              <path
                d="M12 17.3l-5.5 3 1.1-6.1-4.4-4.2 6.1-.9L12 3.6l2.8 5.5 6.1.9-4.4 4.2 1.1 6.1-5.6-3z"
                stroke="currentColor"
                strokeWidth="2"
                className="text-white/20"
              />
            </svg>
            {filled ? (
              <svg viewBox="0 0 24 24" className="absolute inset-0 h-4 w-4" fill="none" aria-hidden="true">
                <path
                  d="M12 17.3l-5.5 3 1.1-6.1-4.4-4.2 6.1-.9L12 3.6l2.8 5.5 6.1.9-4.4 4.2 1.1 6.1-5.6-3z"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-amber-200"
                />
              </svg>
            ) : isHalf ? (
              <span className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                  <path
                    d="M12 17.3l-5.5 3 1.1-6.1-4.4-4.2 6.1-.9L12 3.6l2.8 5.5 6.1.9-4.4 4.2 1.1 6.1-5.6-3z"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-amber-200"
                  />
                </svg>
              </span>
            ) : null}
          </span>
        );
      })}
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  subtitle,
  actionHref,
  actionLabel = 'View all',
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
            {icon}
          </span>
          <div className="min-w-0">
            <div className="truncate text-lg font-extrabold text-white">{title}</div>
            {subtitle ? <div className="truncate text-sm text-zinc-400">{subtitle}</div> : null}
          </div>
        </div>
      </div>

      {actionHref ? (
        <Link
          href={actionHref}
          className="hidden sm:inline-flex items-center gap-1 rounded-xl bg-white/5 px-3 py-2 text-sm font-semibold text-white ring-1 ring-white/10 hover:bg-white/10"
        >
          {actionLabel}
          <Icon name="chevron-right" className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}

function CardRail({
  items,
  size = 'md',
}: {
  items: SeriesCard[];
  size?: 'sm' | 'md';
}) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 pt-3">
      {items.map((s) => (
        <Link
          key={s.id}
          href={`/comics/${s.slug}`}
          className={cn(
            'group shrink-0 overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition',
            size === 'sm' ? 'w-[140px]' : 'w-[170px]'
          )}
        >
          <div className={cn('relative', size === 'sm' ? 'h-[190px]' : 'h-[230px]')}>
            <img src={s.coverUrl} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
            {s.badge ? (
              <div className="absolute left-2 top-2">
                <span className="rounded-full bg-zinc-950/60 px-2.5 py-1 text-[11px] font-extrabold text-white ring-1 ring-white/15">
                  {s.badge}
                </span>
              </div>
            ) : null}
            <div className="absolute bottom-2 left-2 right-2">
              <div className="truncate text-sm font-extrabold text-white">{s.title}</div>
              <div className="mt-1 flex items-center justify-between text-xs text-zinc-300">
                <span className="truncate">{s.genres[0]}</span>
                <span className="inline-flex items-center gap-1">
                  <Stars value={s.rating} />
                </span>
              </div>
            </div>
          </div>
          <div className="p-3">
            <div className="truncate text-xs text-zinc-400">{formatCompact(s.subscribers)} subs</div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function ComicsLandingPage() {
  const router = useRouter();
  const catalog = useMemo(() => buildCatalog(), []);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  // Hero carousel
  const featured = useMemo(() => catalog.slice(0, 3), [catalog]);
  const [heroIndex, setHeroIndex] = useState(0);
  const heroTimer = useRef<number | null>(null);
  const hoveringHero = useRef(false);

  // Continue reading
  const [continueItems, setContinueItems] = useState<ContinueItem[]>([]);

  // Mobile bottom nav (demo)
  const [activeNav, setActiveNav] = useState<'home' | 'browse' | 'library' | 'profile'>('home');

  useEffect(() => {
    // Auto rotate hero
    heroTimer.current = window.setInterval(() => {
      if (hoveringHero.current) return;
      setHeroIndex((v) => (v + 1) % featured.length);
    }, 6000);

    return () => {
      if (heroTimer.current) window.clearInterval(heroTimer.current);
    };
  }, [featured.length]);

  useEffect(() => {
    // Load continue reading from localStorage
    // Expected series page saves under key: fanaara:series:<seriesId>
    const items: ContinueItem[] = [];
    for (const s of catalog) {
      const key = `fanaara:series:${s.id}`;
      const saved = readLS<{
        lastReadEpisodeNumber?: number;
        lastReadProgress?: number;
        lastReadAtISO?: string;
      }>(key);

      if (saved?.lastReadEpisodeNumber && saved.lastReadAtISO) {
        items.push({
          seriesId: s.id,
          slug: s.slug,
          title: s.title,
          coverUrl: s.coverUrl,
          lastReadEpisodeNumber: saved.lastReadEpisodeNumber,
          lastReadProgress: clamp(saved.lastReadProgress ?? 0, 0, 100),
          lastReadAtISO: saved.lastReadAtISO,
        });
      }
    }

    items.sort((a, b) => new Date(b.lastReadAtISO).getTime() - new Date(a.lastReadAtISO).getTime());
    setContinueItems(items.slice(0, 10));
  }, [catalog]);

  const trending = useMemo(() => {
    const list = [...catalog];
    list.sort((a, b) => (b.subscribers * 0.6 + b.views * 0.4) - (a.subscribers * 0.6 + a.views * 0.4));
    return list.slice(0, 8);
  }, [catalog]);

  const newAndNotable = useMemo(() => {
    const list = [...catalog];
    // Fake "freshness": prefer NEW badge + lower total views (newer titles)
    list.sort((a, b) => {
      const scoreA = (a.badge === 'NEW' ? 100 : 0) + (1_000_000_000 - a.views) * 0.000001;
      const scoreB = (b.badge === 'NEW' ? 100 : 0) + (1_000_000_000 - b.views) * 0.000001;
      return scoreB - scoreA;
    });
    return list.slice(0, 6);
  }, [catalog]);

  const genres = useMemo(() => {
    const set = new Set<string>();
    catalog.forEach((s) => s.genres.forEach((g) => set.add(g)));
    return Array.from(set).slice(0, 14);
  }, [catalog]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return catalog
      .filter((s) => {
        const hay = `${s.title} ${s.author} ${s.genres.join(' ')} ${s.tags.join(' ')}`.toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 12);
  }, [catalog, query]);

  function openSeries(slug: string) {
    setSearchOpen(false);
    setQuery('');
    router.push(`/comics/${slug}`);
  }

  const hero = featured[heroIndex];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Top header */}
      <div className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/comics" className="inline-flex items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
              <Icon name="sparkle" />
            </span>
            <div className="leading-tight">
              <div className="text-sm font-extrabold text-white">Fanaara</div>
              <div className="text-xs text-zinc-400">Comics</div>
            </div>
          </Link>

          <div className="hidden md:flex flex-1 max-w-xl items-center gap-2">
            <div className="relative flex-1">
              <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search manga, manhwa, creators, tags…"
                className="h-11 w-full rounded-2xl bg-white/5 pl-10 pr-3 text-sm text-white ring-1 ring-white/10 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>

            <Button
              variant="secondary"
              onClick={() => alert('Demo: Notifications')}
              className="h-11 px-3"
            >
              <Icon name="bell" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" href="/comics/neon-ronin" className="hidden sm:inline-flex">
              <Icon name="play" />
              Read Now
            </Button>
            <Button variant="ghost" onClick={() => alert('Demo: Sign in')}>
              Sign in
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile search */}
      <div className="md:hidden border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div className="relative">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search series…"
              className="h-11 w-full rounded-2xl bg-white/5 pl-10 pr-3 text-sm text-white ring-1 ring-white/10 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>
        </div>
      </div>

      {/* Search overlay */}
      {searchOpen && query.trim() ? (
        <div className="relative z-40">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mt-3 overflow-hidden rounded-2xl bg-zinc-950 ring-1 ring-white/10 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div className="text-sm font-extrabold text-white">Search results</div>
                <button
                  onClick={() => setSearchOpen(false)}
                  className="rounded-xl px-3 py-1.5 text-sm font-semibold text-zinc-300 hover:bg-white/10 hover:text-white"
                >
                  Close
                </button>
              </div>

              {searchResults.length ? (
                <div className="divide-y divide-white/10">
                  {searchResults.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => openSeries(s.slug)}
                      className="flex w-full items-center gap-3 p-4 text-left hover:bg-white/5"
                    >
                      <img
                        src={s.coverUrl}
                        alt=""
                        className="h-14 w-11 rounded-xl object-cover ring-1 ring-white/10"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-extrabold text-white">{s.title}</div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                          <span>{s.author}</span>
                          <span className="opacity-50">•</span>
                          <span>{s.genres[0]}</span>
                          <span className="opacity-50">•</span>
                          <span className="text-amber-200 font-semibold">{s.rating.toFixed(1)}★</span>
                        </div>
                      </div>
                      <Icon name="chevron-right" className="text-zinc-400" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-5 text-sm text-zinc-400">
                  No results. Try searching by genre/tag.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Hero carousel */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={hero.bannerUrl} alt="" className="h-full w-full object-cover opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/10 via-zinc-950/55 to-zinc-950" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(217,70,239,.14),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(99,102,241,.12),transparent_45%),radial-gradient(circle_at_50%_80%,rgba(34,211,238,.12),transparent_45%)]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pt-8 pb-10">
          <div
            onMouseEnter={() => (hoveringHero.current = true)}
            onMouseLeave={() => (hoveringHero.current = false)}
            className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Pill>
                  <Icon name="sparkle" className="h-4 w-4" />
                  Featured
                </Pill>
                <Pill>{hero.kind}</Pill>
                <Pill>{hero.age}</Pill>
                {hero.badge ? <Pill>{hero.badge}</Pill> : null}
              </div>

              <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                {hero.title}
              </h1>

              <div className="mt-2 text-sm text-zinc-300">
                by <span className="font-semibold text-white">{hero.author}</span>
              </div>

              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-200">
                {hero.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {hero.genres.map((g) => (
                  <span key={g} className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-200 ring-1 ring-white/10">
                    {g}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button href={`/comics/${hero.slug}`}>
                  <Icon name="play" />
                  Start Reading
                </Button>
                <Button variant="secondary" onClick={() => alert('Demo: Subscribe')}>
                  <Icon name="bell" />
                  Subscribe
                </Button>
                <div className="rounded-2xl bg-white/5 px-4 py-2 ring-1 ring-white/10">
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <span className="text-amber-200 font-extrabold">{hero.rating.toFixed(1)}★</span>
                    <span className="opacity-50">•</span>
                    <span>{formatCompact(hero.subscribers)} subs</span>
                    <span className="opacity-50">•</span>
                    <span>{hero.update}</span>
                  </div>
                </div>
              </div>

              {/* Dots */}
              <div className="mt-6 flex items-center gap-2">
                {featured.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setHeroIndex(i)}
                    className={cn(
                      'h-2.5 rounded-full transition',
                      i === heroIndex ? 'w-10 bg-white' : 'w-2.5 bg-white/30 hover:bg-white/45'
                    )}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-start lg:justify-end">
              <div className="w-[240px] sm:w-[280px]">
                <div className="overflow-hidden rounded-3xl ring-1 ring-white/15 shadow-[0_35px_90px_-30px_rgba(0,0,0,0.85)]">
                  <img src={hero.coverUrl} alt="" className="h-[340px] w-full object-cover" />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-xs text-zinc-400">{hero.update}</div>
                  <div className="inline-flex items-center gap-1 text-xs text-zinc-300">
                    <Stars value={hero.rating} />
                    <span className="font-semibold text-white">{hero.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick categories */}
          <div className="mt-10">
            <div className="text-sm font-extrabold text-white">Browse quick</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {['Action', 'Romance', 'Fantasy', 'Comedy', 'Slice of Life', 'Sci‑Fi', 'Mystery', 'Cyberpunk'].map((g) => (
                <button
                  key={g}
                  onClick={() => {
                    setQuery(g);
                    setSearchOpen(true);
                  }}
                  className="rounded-full bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-200 ring-1 ring-white/10 hover:bg-white/10"
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <main className="mx-auto max-w-6xl px-4 pb-28">
        {/* Continue reading */}
        {continueItems.length ? (
          <section className="mt-8">
            <SectionHeader
              icon={<Icon name="play" />}
              title="Continue reading"
              subtitle="Pick up where you left off (demo: from localStorage)"
              actionHref="/library"
              actionLabel="Open library"
            />

            <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 pt-4">
              {continueItems.map((c) => (
                <Link
                  key={c.seriesId}
                  href={`/comics/${c.slug}`}
                  className="group shrink-0 w-[210px] overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition"
                >
                  <div className="relative h-[140px]">
                    <img src={c.coverUrl} alt="" className="h-full w-full object-cover opacity-95" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="truncate text-sm font-extrabold text-white">{c.title}</div>
                      <div className="mt-1 text-xs text-zinc-300">Ep. {c.lastReadEpisodeNumber}</div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/15">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-fuchsia-400 via-indigo-400 to-cyan-300"
                          style={{ width: `${c.lastReadProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="p-3 text-xs text-zinc-400">
                    {c.lastReadProgress}% • last read {new Date(c.lastReadAtISO).toLocaleDateString()}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {/* Trending */}
        <section className="mt-10">
          <SectionHeader
            icon={<Icon name="fire" />}
            title="Trending today"
            subtitle="High momentum titles right now (demo scoring)"
            actionHref="/charts"
          />
          <CardRail items={trending} />
        </section>

        {/* New & Notable */}
        <section className="mt-10">
          <SectionHeader
            icon={<Icon name="sparkle" />}
            title="New & notable"
            subtitle="Fresh drops + editor picks"
          />

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {newAndNotable.map((s) => (
              <Link
                key={s.id}
                href={`/comics/${s.slug}`}
                className="group overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition"
              >
                <div className="relative h-[160px]">
                  <img src={s.bannerUrl} alt="" className="h-full w-full object-cover opacity-70" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-base font-black text-white">{s.title}</div>
                      <div className="mt-1 text-xs text-zinc-300">
                        by <span className="font-semibold text-white">{s.author}</span>
                      </div>
                    </div>
                    <div className="shrink-0 rounded-xl bg-zinc-950/60 px-2.5 py-1 text-xs font-extrabold text-amber-200 ring-1 ring-white/15">
                      {s.rating.toFixed(1)}★
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="line-clamp-2 text-sm text-zinc-200">{s.description}</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Pill>{s.kind}</Pill>
                    <Pill>{s.genres[0]}</Pill>
                    {s.badge ? <Pill>{s.badge}</Pill> : null}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Genres */}
        <section className="mt-10">
          <SectionHeader
            icon={<Icon name="grid" />}
            title="Genres"
            subtitle="Jump into a vibe fast"
          />

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => {
                  setQuery(g);
                  setSearchOpen(true);
                }}
                className="group rounded-2xl bg-white/5 ring-1 ring-white/10 p-4 text-left hover:bg-white/10 transition"
              >
                <div className="text-sm font-black text-white">{g}</div>
                <div className="mt-1 text-xs text-zinc-400">Explore top titles</div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[66%] rounded-full bg-gradient-to-r from-fuchsia-400 via-indigo-400 to-cyan-300 opacity-80 group-hover:opacity-100 transition" />
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Creator Spotlight */}
        <section className="mt-10">
          <SectionHeader
            icon={<Icon name="user" />}
            title="Creator spotlight"
            subtitle="Build community + monetize inside Fanaara"
          />

          <div className="mt-4 overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10">
            <div className="grid grid-cols-1 gap-0 lg:grid-cols-[1fr_280px]">
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <img src={avatar('Hana Kurose')} alt="" className="h-14 w-14 rounded-2xl ring-1 ring-white/10" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-base font-black text-white">Hana Kurose</div>
                      <Pill>Verified</Pill>
                      <Pill>Author</Pill>
                    </div>
                    <div className="mt-1 text-sm text-zinc-300">
                      Writes cinematic vertical comics with strong character arcs and “moment-to-moment” pacing.
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                      <span className="font-semibold text-white">{formatCompact(187_200)}</span> followers
                      <span className="opacity-50">•</span>
                      <span>Exclusive drops + behind the scenes</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => alert('Demo: Follow creator')}>Follow</Button>
                  <Button variant="ghost" onClick={() => alert('Demo: Support creator')}>Tip / Support</Button>
                  <Button variant="ghost" href="/creators">Browse creators</Button>
                </div>
              </div>

              <div className="border-t border-white/10 lg:border-t-0 lg:border-l p-5">
                <div className="text-sm font-extrabold text-white">Creator tools</div>
                <ul className="mt-3 space-y-2 text-sm text-zinc-200">
                  <li className="rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2">
                    Episodes scheduler + WUF
                  </li>
                  <li className="rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2">
                    Coins unlock + bundles
                  </li>
                  <li className="rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2">
                    Comments moderation
                  </li>
                </ul>
                <Button className="mt-4 w-full" onClick={() => alert('Demo: Apply as creator')}>
                  Apply as Creator
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-14 border-t border-white/10 pt-10 text-sm text-zinc-400">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="font-extrabold text-white">Fanaara • Comics Landing</div>
            <div className="text-xs">Replace placeholder images with your own CDN assets.</div>
          </div>
        </footer>
      </main>

      {/* Mobile bottom nav (demo) */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 py-2">
          <div className="grid grid-cols-4 gap-2">
            {[
              { key: 'home', label: 'Home', icon: <Icon name="sparkle" /> },
              { key: 'browse', label: 'Browse', icon: <Icon name="grid" /> },
              { key: 'library', label: 'Library', icon: <Icon name="book" /> },
              { key: 'profile', label: 'Me', icon: <Icon name="user" /> },
            ].map((x) => (
              <button
                key={x.key}
                onClick={() => setActiveNav(x.key as any)}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-xs font-semibold ring-1 transition',
                  activeNav === (x.key as any)
                    ? 'bg-white/10 text-white ring-white/15'
                    : 'bg-transparent text-zinc-400 ring-white/5 hover:bg-white/5 hover:text-white'
                )}
              >
                {x.icon}
                {x.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
