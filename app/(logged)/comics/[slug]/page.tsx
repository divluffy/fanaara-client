// app\(logged)\comics\[slug]\page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Fanaara Series Page V2 (Single File)
 * UX upgrades vs V1:
 * - Stronger CTA hierarchy + sticky action bar (mobile)
 * - Episode list: list/grid view, season filter (fake), access filter, search, sort, progressive loading
 * - Mature gate (demo) + unlock modal (coins) + WUF timers
 * - Local persistence for subscribe/like/library/rating + last read + continue support for landing
 */

type SeriesKind = 'Manga' | 'Manhwa' | 'Manhua' | 'Comic';
type AgeRating = 'All Ages' | 'Teen' | 'Mature 18+';
type Status = 'Ongoing' | 'Completed' | 'Hiatus';

type AccessType = 'FREE' | 'WUF' | 'COINS';

type Creator = {
  id: string;
  name: string;
  handle: string;
  role: 'Author' | 'Artist' | 'Studio';
  verified?: boolean;
  avatarUrl: string;
  bio: string;
  followers: number;
};

type Episode = {
  id: string;
  number: number;
  season: number; // fake seasons
  title: string;
  publishedAtISO: string;
  thumbnailUrl: string;
  stats: { views: number; likes: number; comments: number };
  length: { panels: number; minutes: number };
  access: { type: AccessType; coinPrice?: number; wufAvailableAtISO?: string };
  badges?: Array<'NEW' | 'HOT' | 'SEASON FINALE'>;
};

type Recommendation = {
  slug: string;
  title: string;
  genre: string;
  coverUrl: string;
  rating: number;
  subscribers: number;
};

type Series = {
  id: string;
  slug: string;
  title: string;
  altTitles: string[];
  kind: SeriesKind;
  verticalScroll: boolean;
  language: string;
  ageRating: AgeRating;
  status: Status;
  updateSchedule: string;
  genres: string[];
  tags: string[];
  coverUrl: string;
  bannerUrl: string;
  summary: string;
  contentWarnings: string[];
  creators: Creator[];
  stats: {
    views: number;
    subscribers: number;
    likes: number;
    rating: number;
    ratingCount: number;
  };
  episodes: Episode[];
  fansAlsoRead: Recommendation[];
};

type TabKey = 'episodes' | 'about' | 'community';
type EpisodeView = 'list' | 'grid';

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function img(seed: string, w: number, h: number) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}

function avatar(seed: string) {
  return `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
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

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function hoursUntil(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60)));
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

function writeLS(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function Icon({
  name,
  className,
}: {
  name:
    | 'back'
    | 'heart'
    | 'bookmark'
    | 'share'
    | 'flag'
    | 'star'
    | 'lock'
    | 'clock'
    | 'search'
    | 'sparkle'
    | 'grid'
    | 'list'
    | 'play'
    | 'check';
  className?: string;
}) {
  const c = cn('h-5 w-5', className);

  switch (name) {
    case 'back':
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'heart':
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 21s-7-4.6-9.4-9C.8 8.9 2.5 6 5.7 6c1.9 0 3.3 1 4.3 2.2C11 7 12.4 6 14.3 6c3.2 0 4.9 2.9 3.1 6-2.4 4.4-9.4 9-9.4 9z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'bookmark':
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 3h12v18l-6-4-6 4V3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      );
    case 'share':
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M8.6 12.7l6.8-3.4M8.6 11.3l6.8 3.4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M18 5a2 2 0 11-4 0 2 2 0 014 0zM8 12a2 2 0 11-4 0 2 2 0 014 0zM18 19a2 2 0 11-4 0 2 2 0 014 0z"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      );
    case 'flag':
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 3v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M5 4h12l-1.5 4L17 12H5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      );
    case 'star':
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 17.3l-5.5 3 1.1-6.1-4.4-4.2 6.1-.9L12 3.6l2.8 5.5 6.1.9-4.4 4.2 1.1 6.1-5.6-3z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'lock':
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M7 11V8a5 5 0 0110 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path
            d="M6.5 11h11A2.5 2.5 0 0120 13.5v6A2.5 2.5 0 0117.5 22h-11A2.5 2.5 0 014 19.5v-6A2.5 2.5 0 016.5 11z"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      );
    case 'clock':
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 22a10 10 0 110-20 10 10 0 010 20z" stroke="currentColor" strokeWidth="2" />
          <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
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
    case 'grid':
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 4h7v7H4V4zM13 4h7v7h-7V4zM4 13h7v7H4v-7zM13 13h7v7h-7v-7z" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case 'list':
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M8 6h13M8 12h13M8 18h13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M3 6h1M3 12h1M3 18h1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'play':
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M9 7l10 5-10 5V7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      );
    case 'check':
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}

function Pill({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'good' | 'warn' }) {
  const cls =
    tone === 'good'
      ? 'bg-emerald-500/10 text-emerald-200 ring-1 ring-emerald-400/20'
      : tone === 'warn'
        ? 'bg-amber-500/10 text-amber-200 ring-1 ring-amber-400/20'
        : 'bg-white/5 text-zinc-200 ring-1 ring-white/10';
  return <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold', cls)}>{children}</span>;
}

function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  className?: string;
  disabled?: boolean;
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-extrabold transition focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-60 disabled:cursor-not-allowed';
  const s = size === 'sm' ? 'h-9 px-3 text-sm' : 'h-11 px-4 text-sm';
  const v =
    variant === 'primary'
      ? 'bg-gradient-to-r from-fuchsia-500/90 via-indigo-500/90 to-cyan-500/90 text-zinc-950 hover:brightness-110'
      : variant === 'secondary'
        ? 'bg-white/10 text-white hover:bg-white/15 ring-1 ring-white/10'
        : variant === 'danger'
          ? 'bg-rose-500/15 text-rose-100 hover:bg-rose-500/20 ring-1 ring-rose-400/20'
          : 'bg-transparent text-white hover:bg-white/10 ring-1 ring-white/10';

  return (
    <button disabled={disabled} onClick={onClick} className={cn(base, s, v, className)}>
      {children}
    </button>
  );
}

function Modal({
  open,
  title,
  description,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  description?: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative w-full max-w-xl rounded-2xl bg-zinc-950 ring-1 ring-white/10 shadow-2xl"
      >
        <div className="border-b border-white/10 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-lg font-black text-white">{title}</div>
              {description ? <p className="mt-1 text-sm text-zinc-300">{description}</p> : null}
            </div>
            <button onClick={onClose} className="rounded-lg p-2 text-zinc-200 hover:bg-white/10" aria-label="Close">
              <span className="text-xl leading-none">×</span>
            </button>
          </div>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function Stars({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const outOf10 = clamp(value, 0, 10);
  const outOf5 = outOf10 / 2;
  return (
    <div className="inline-flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => {
        const idx = i + 1;
        const filled = outOf5 >= idx;
        const half = !filled && outOf5 >= idx - 0.5;
        return (
          <button
            key={idx}
            onClick={onChange ? () => onChange(idx * 2) : undefined}
            className={cn('rounded-md p-0.5', onChange ? 'hover:bg-white/10' : 'cursor-default')}
            type="button"
            aria-label={`Star ${idx}`}
          >
            <span className="relative inline-flex h-5 w-5">
              <Icon name="star" className="h-5 w-5 text-white/20" />
              {filled ? (
                <span className="absolute inset-0">
                  <Icon name="star" className="h-5 w-5 text-amber-200" />
                </span>
              ) : half ? (
                <span className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                  <Icon name="star" className="h-5 w-5 text-amber-200" />
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function buildSeries(slug: string): Series {
  const catalog = [
    {
      id: 'series_neon_ronin',
      slug: 'neon-ronin',
      title: 'Neon Ronin',
      altTitles: ['ネオン浪人', 'الساموراي النيون'],
      kind: 'Manhwa' as const,
      ageRating: 'Teen' as const,
      status: 'Ongoing' as const,
      updateSchedule: 'UP EVERY FRIDAY',
      genres: ['Action', 'Sci‑Fi', 'Cyberpunk'],
      tags: ['Found Family', 'Boss Fight', 'Neon City', 'Anti‑Hero'],
      coverUrl: img('fanaara-neon-cover', 720, 960),
      bannerUrl: img('fanaara-neon-banner', 1600, 650),
      summary:
        'In a city where memories are traded like currency, a retired blade-for-hire becomes the shield for a girl with a stolen core. Every episode exposes a brighter neon—and a darker secret.',
      contentWarnings: ['Mild Violence', 'Flashing Lights', 'Sensitive Themes'],
      creators: [
        {
          id: 'cr_hana',
          name: 'Hana Kurose',
          handle: '@hanakurose',
          role: 'Author' as const,
          verified: true,
          avatarUrl: avatar('Hana Kurose'),
          bio: 'Cyberpunk + character drama. I write fast fights and slow healing.',
          followers: 187_200,
        },
        {
          id: 'cr_kiyo',
          name: 'Kiyo Studio',
          handle: '@kiyo_studio',
          role: 'Studio' as const,
          verified: true,
          avatarUrl: avatar('Kiyo Studio'),
          bio: 'A small team building cinematic vertical comics.',
          followers: 402_900,
        },
      ],
      stats: { views: 91_320_500, subscribers: 1_248_900, likes: 3_880_200, rating: 9.4, ratingCount: 322_114 },
    },
    {
      id: 'series_starlit_atelier',
      slug: 'starlit-atelier',
      title: 'Starlit Atelier',
      altTitles: ['별빛 아틀리에', 'Atelier under Starlight'],
      kind: 'Manga' as const,
      ageRating: 'All Ages' as const,
      status: 'Ongoing' as const,
      updateSchedule: 'UP EVERY TUESDAY',
      genres: ['Romance', 'Slice of Life', 'Comedy'],
      tags: ['Cozy', 'Art School', 'Rivals to Lovers', 'Soft Aesthetic'],
      coverUrl: img('fanaara-starlit-cover', 720, 960),
      bannerUrl: img('fanaara-starlit-banner', 1600, 650),
      summary:
        'Two art students share a tiny atelier and an even tinier budget. Deadlines pile up—and so do feelings neither can sketch.',
      contentWarnings: ['None'],
      creators: [
        {
          id: 'cr_mina',
          name: 'Mina Arai',
          handle: '@minaarai',
          role: 'Author' as const,
          verified: true,
          avatarUrl: avatar('Mina Arai'),
          bio: 'Romcoms, gentle chaos, and healing arcs.',
          followers: 92_310,
        },
        {
          id: 'cr_yuna',
          name: 'Yuna Lee',
          handle: '@yuna.lee',
          role: 'Artist' as const,
          avatarUrl: avatar('Yuna Lee'),
          bio: 'Soft lines, bold emotions.',
          followers: 108_500,
        },
      ],
      stats: { views: 24_610_900, subscribers: 388_120, likes: 1_204_900, rating: 9.1, ratingCount: 88_210 },
    },
    {
      id: 'series_abyssal_contract',
      slug: 'abyssal-contract',
      title: 'Abyssal Contract',
      altTitles: ['深淵の契約', 'عقد الهاوية'],
      kind: 'Manhua' as const,
      ageRating: 'Mature 18+' as const,
      status: 'Hiatus' as const,
      updateSchedule: 'HIATUS • RETURN TBA',
      genres: ['Fantasy', 'Adventure', 'Mystery'],
      tags: ['Dark Fantasy', 'Ancient Gods', 'Cursed Relics'],
      coverUrl: img('fanaara-abyss-cover', 720, 960),
      bannerUrl: img('fanaara-abyss-banner', 1600, 650),
      summary:
        'A relic diver signs a contract to retrieve a “song” buried under the sea-floor city. The deeper he goes, the more the world forgets he ever existed.',
      contentWarnings: ['Graphic Violence', 'Horror Imagery', 'Strong Language'],
      creators: [
        {
          id: 'cr_rin',
          name: 'Rin Valtor',
          handle: '@rinvaltor',
          role: 'Author' as const,
          verified: true,
          avatarUrl: avatar('Rin Valtor'),
          bio: 'Worldbuilding addict. I like stories that bite back.',
          followers: 210_441,
        },
      ],
      stats: { views: 12_840_100, subscribers: 210_900, likes: 611_220, rating: 8.8, ratingCount: 41_090 },
    },
  ];

  const meta = catalog.find((x) => x.slug === slug) ?? catalog[0];

  // Episodes (latest-first, with fake seasons)
  const total = meta.slug === 'neon-ronin' ? 48 : meta.slug === 'starlit-atelier' ? 34 : 26;
  const now = new Date();

  const episodes: Episode[] = Array.from({ length: total }, (_, i) => {
    const number = i + 1;
    const season = number <= total / 2 ? 1 : 2;
    const daysAgo = (total - number) * (meta.slug === 'starlit-atelier' ? 7 : 6);
    const published = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    const access =
      number <= Math.min(8, total)
        ? { type: 'FREE' as const }
        : number <= Math.min(22, total)
          ? {
              type: 'WUF' as const,
              wufAvailableAtISO: new Date(now.getTime() + (number % 5) * 6 * 60 * 60 * 1000).toISOString(),
            }
          : { type: 'COINS' as const, coinPrice: meta.slug === 'neon-ronin' ? 3 : 2 };

    const badges: Episode['badges'] = [];
    if (number >= total - 2) badges.push('NEW');
    if (number % 9 === 0) badges.push('HOT');
    if (number === total && meta.slug !== 'abyssal-contract') badges.push('SEASON FINALE');

    const viewsBase = meta.stats.views / total + Math.floor((total - number) * (meta.slug === 'neon-ronin' ? 220_000 : 120_000));
    const likesBase = Math.floor(viewsBase * (0.06 + Math.abs(Math.cos(number * 1.7)) * 0.02));
    const commentsBase = Math.floor(likesBase * (0.08 + Math.abs(Math.sin(number * 0.77)) * 0.06));

    const titleBase =
      meta.slug === 'neon-ronin'
        ? ['Ghost in the Alley', 'The Memory Market', 'Electric Rain', 'Firewall Hearts', 'Red Neon Prayer', 'Night Train']
        : meta.slug === 'starlit-atelier'
          ? ['First Canvas', 'Borrowed Paint', 'Critique Day', 'Late Night Tea', 'Accidental Portrait', 'Studio Secrets']
          : ['The Salt Gate', 'Relic Diver', 'Whispering Depths', 'Abyss Bloom', 'The Contract Clause', 'City of Silt'];

    return {
      id: `ep_${meta.id}_${number}`,
      number,
      season,
      title: `${titleBase[(number - 1) % titleBase.length]} (${number})`,
      publishedAtISO: published.toISOString(),
      thumbnailUrl: img(`thumb-${meta.slug}-${number}`, 520, 360),
      stats: { views: Math.floor(viewsBase), likes: likesBase, comments: commentsBase },
      length: { panels: meta.slug === 'starlit-atelier' ? 42 + (number % 9) * 3 : 54 + (number % 12) * 4, minutes: meta.slug === 'starlit-atelier' ? 5 + (number % 5) : 7 + (number % 6) },
      access,
      badges: badges.length ? badges : undefined,
    };
  }).reverse();

  const fansAlsoRead: Recommendation[] = [
    { slug: 'midnight-bento', title: 'Midnight Bento', genre: 'Slice of Life', coverUrl: img('rec-midnight-bento', 420, 600), rating: 9.0, subscribers: 201_400 },
    { slug: 'paper-samurai', title: 'Paper Samurai', genre: 'Action', coverUrl: img('rec-paper-samurai', 420, 600), rating: 9.2, subscribers: 980_000 },
    { slug: 'moonlit-compiler', title: 'Moonlit Compiler', genre: 'Romance', coverUrl: img('rec-moonlit-compiler', 420, 600), rating: 8.9, subscribers: 410_200 },
    { slug: 'the-ink-covenant', title: 'The Ink Covenant', genre: 'Fantasy', coverUrl: img('rec-ink-covenant', 420, 600), rating: 8.7, subscribers: 155_090 },
  ];

  return {
    id: meta.id,
    slug: meta.slug,
    title: meta.title,
    altTitles: meta.altTitles,
    kind: meta.kind,
    verticalScroll: true,
    language: 'English • العربية (UI)',
    ageRating: meta.ageRating,
    status: meta.status,
    updateSchedule: meta.updateSchedule,
    genres: meta.genres,
    tags: meta.tags,
    coverUrl: meta.coverUrl,
    bannerUrl: meta.bannerUrl,
    summary: meta.summary,
    contentWarnings: meta.contentWarnings,
    creators: meta.creators,
    stats: meta.stats,
    episodes,
    fansAlsoRead,
  };
}

function EpisodeAccessBadge({ ep }: { ep: Episode }) {
  if (ep.access.type === 'FREE') return <Pill tone="good">FREE</Pill>;
  if (ep.access.type === 'WUF') {
    const hrs = ep.access.wufAvailableAtISO ? hoursUntil(ep.access.wufAvailableAtISO) : 0;
    return (
      <Pill tone="warn">
        <Icon name="clock" className="h-3.5 w-3.5" />
        WUF{hrs ? ` • ${hrs}h` : ''}
      </Pill>
    );
  }
  return (
    <Pill>
      <Icon name="lock" className="h-3.5 w-3.5" />
      {ep.access.coinPrice ?? 2} COINS
    </Pill>
  );
}

export default function SeriesPageV2({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const series = useMemo(() => buildSeries(params.slug), [params.slug]);

  const storageKey = `fanaara:series:${series.id}`;

  const [tab, setTab] = useState<TabKey>('episodes');
  const [view, setView] = useState<EpisodeView>('list');
  const [query, setQuery] = useState('');
  const [filterAccess, setFilterAccess] = useState<'ALL' | AccessType>('ALL');
  const [sort, setSort] = useState<'LATEST' | 'OLDEST' | 'POPULAR'>('LATEST');
  const [season, setSeason] = useState<'ALL' | '1' | '2'>('ALL');
  const [visibleCount, setVisibleCount] = useState(16);

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [inLibrary, setInLibrary] = useState(false);
  const [myRating, setMyRating] = useState(0); // 0..10

  const [unlocked, setUnlocked] = useState<Set<string>>(() => new Set());
  const [lastReadEpisodeNumber, setLastReadEpisodeNumber] = useState<number | null>(null);
  const [lastReadProgress, setLastReadProgress] = useState(0);
  const [lastReadAtISO, setLastReadAtISO] = useState<string | null>(null);

  const [toast, setToast] = useState<{ msg: string; kind?: 'ok' | 'warn' | 'danger' } | null>(null);
  const toastTimer = useRef<number | null>(null);

  const [shareOpen, setShareOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const [unlockOpen, setUnlockOpen] = useState(false);
  const [unlockTarget, setUnlockTarget] = useState<Episode | null>(null);

  const [matureGateOpen, setMatureGateOpen] = useState(false);

  const [pending, startTransition] = useTransition();

  function toastPush(msg: string, kind?: 'ok' | 'warn' | 'danger') {
    setToast({ msg, kind });
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }

  function persist() {
    writeLS(storageKey, {
      isSubscribed,
      isLiked,
      inLibrary,
      myRating,
      unlocked: Array.from(unlocked),
      lastReadEpisodeNumber,
      lastReadProgress,
      lastReadAtISO,
    });
  }

  useEffect(() => {
    const saved = readLS<{
      isSubscribed?: boolean;
      isLiked?: boolean;
      inLibrary?: boolean;
      myRating?: number;
      unlocked?: string[];
      lastReadEpisodeNumber?: number | null;
      lastReadProgress?: number;
      lastReadAtISO?: string | null;
    }>(storageKey);

    if (saved) {
      setIsSubscribed(!!saved.isSubscribed);
      setIsLiked(!!saved.isLiked);
      setInLibrary(!!saved.inLibrary);
      setMyRating(clamp(saved.myRating ?? 0, 0, 10));
      setUnlocked(new Set(saved.unlocked ?? []));
      setLastReadEpisodeNumber(saved.lastReadEpisodeNumber ?? null);
      setLastReadProgress(clamp(saved.lastReadProgress ?? 0, 0, 100));
      setLastReadAtISO(saved.lastReadAtISO ?? null);
    }

    // Mature gate (demo)
    if (series.ageRating === 'Mature 18+') {
      const gateKey = `fanaara:mature_ok:${series.id}`;
      const ok = readLS<{ ok: boolean }>(gateKey);
      if (!ok?.ok) setMatureGateOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [series.id]);

  useEffect(() => {
    persist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSubscribed, isLiked, inLibrary, myRating, unlocked, lastReadEpisodeNumber, lastReadProgress, lastReadAtISO]);

  const firstEpisode = useMemo(() => {
    return [...series.episodes].sort((a, b) => a.number - b.number)[0];
  }, [series.episodes]);

  const continueEpisode = useMemo(() => {
    if (!lastReadEpisodeNumber) return null;
    return series.episodes.find((e) => e.number === lastReadEpisodeNumber) ?? null;
  }, [lastReadEpisodeNumber, series.episodes]);

  const primaryEpisode = continueEpisode ?? firstEpisode;
  const primaryLabel = continueEpisode ? 'Continue' : 'Start Reading';

  function canRead(ep: Episode) {
    if (ep.access.type === 'FREE') return true;
    if (unlocked.has(ep.id)) return true;
    if (ep.access.type === 'WUF') {
      const t = ep.access.wufAvailableAtISO ? new Date(ep.access.wufAvailableAtISO).getTime() : 0;
      return t > 0 ? Date.now() >= t : false;
    }
    return false;
  }

  function readEpisode(ep: Episode) {
    setLastReadEpisodeNumber(ep.number);
    setLastReadProgress(Math.floor(15 + Math.abs(Math.sin(ep.number)) * 75));
    setLastReadAtISO(new Date().toISOString());
    toastPush(`Opening Episode ${ep.number}…`, 'ok');

    // Replace this with your real reader route:
    router.push(`/reader/${series.slug}/${ep.number}`);
  }

  function onOpenEpisode(ep: Episode) {
    if (series.ageRating === 'Mature 18+' && matureGateOpen) {
      toastPush('Age verification required.', 'warn');
      return;
    }
    if (canRead(ep)) return readEpisode(ep);
    if (ep.access.type === 'WUF') {
      const hrs = ep.access.wufAvailableAtISO ? hoursUntil(ep.access.wufAvailableAtISO) : 0;
      toastPush(hrs ? `Wait until free: ~${hrs}h` : 'Wait until free soon.', 'warn');
      return;
    }
    setUnlockTarget(ep);
    setUnlockOpen(true);
  }

  function unlockEpisode(ep: Episode) {
    setUnlocked((prev) => {
      const next = new Set(prev);
      next.add(ep.id);
      return next;
    });
    toastPush(`Unlocked Episode ${ep.number}.`, 'ok');
  }

  const filtered = useMemo(() => {
    let list = [...series.episodes];

    // season filter
    if (season !== 'ALL') {
      const s = Number(season);
      list = list.filter((e) => e.season === s);
    }

    // access filter
    if (filterAccess !== 'ALL') {
      list = list.filter((e) => e.access.type === filterAccess);
    }

    // search
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((e) => `${e.number} ${e.title}`.toLowerCase().includes(q));

    // sort
    if (sort === 'OLDEST') list.sort((a, b) => a.number - b.number);
    if (sort === 'POPULAR') list.sort((a, b) => b.stats.views - a.stats.views);

    return list;
  }, [series.episodes, season, filterAccess, query, sort]);

  const visible = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);

  const [miniHeader, setMiniHeader] = useState(false);
  useEffect(() => {
    const onScroll = () => setMiniHeader(window.scrollY > 220);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function copyLink() {
    const url = window.location.href;
    navigator.clipboard?.writeText(url).then(
      () => toastPush('Link copied!', 'ok'),
      () => toastPush('Copy failed.', 'warn')
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Mini sticky header */}
      <div className={cn('fixed inset-x-0 top-0 z-[70] transition', miniHeader ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none')}>
        <div className="mx-auto max-w-6xl px-4">
          <div className="mt-3 flex items-center justify-between rounded-2xl bg-zinc-950/80 backdrop-blur-xl ring-1 ring-white/10 px-4 py-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-black text-white">{series.title}</div>
              <div className="truncate text-xs text-zinc-400">{series.updateSchedule}</div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => onOpenEpisode(primaryEpisode)} disabled={pending} className="hidden sm:inline-flex">
                <Icon name="play" className="h-4 w-4" />
                {primaryLabel}
              </Button>
              <Button
                size="sm"
                variant={isSubscribed ? 'secondary' : 'primary'}
                onClick={() => startTransition(() => setIsSubscribed((v) => !v))}
                disabled={pending}
              >
                {isSubscribed ? (
                  <>
                    <Icon name="check" className="h-4 w-4 text-emerald-200" />
                    Subscribed
                  </>
                ) : (
                  <>Subscribe</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={series.bannerUrl} alt="" className="h-full w-full object-cover opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/10 via-zinc-950/70 to-zinc-950" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(217,70,239,.14),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(99,102,241,.12),transparent_45%),radial-gradient(circle_at_50%_80%,rgba(34,211,238,.12),transparent_45%)]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pt-6 pb-10">
          <div className="flex items-center justify-between">
            <Link href="/comics" className="inline-flex items-center gap-2 text-sm text-zinc-300 hover:text-white">
              <Icon name="back" />
              Comics
            </Link>

            <div className="flex items-center gap-2">
              <Pill>{series.kind}</Pill>
              <Pill tone={series.status === 'Ongoing' ? 'good' : series.status === 'Hiatus' ? 'warn' : 'neutral'}>{series.status}</Pill>
              <Pill>{series.ageRating}</Pill>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-1 gap-6 md:grid-cols-[260px_1fr]">
            {/* Cover + progress */}
            <div className="relative">
              <div className="overflow-hidden rounded-3xl ring-1 ring-white/15 shadow-[0_30px_90px_-30px_rgba(0,0,0,0.85)]">
                <img src={series.coverUrl} alt={`${series.title} cover`} className="h-[360px] w-full object-cover" />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Pill>
                  <Icon name="sparkle" className="h-3.5 w-3.5" />
                  Fanaara Series
                </Pill>
                <Pill>Vertical</Pill>
              </div>

              <div className="mt-3 rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
                <div className="text-xs font-semibold text-zinc-300">Progress</div>
                {continueEpisode ? (
                  <div className="mt-2 space-y-2">
                    <div className="text-sm font-black text-white">Ep. {continueEpisode.number}</div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-gradient-to-r from-fuchsia-400 via-indigo-400 to-cyan-300" style={{ width: `${lastReadProgress}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span>{lastReadProgress}%</span>
                      <button onClick={() => onOpenEpisode(continueEpisode)} className="font-semibold text-white hover:underline">
                        Continue →
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-zinc-400">No reading activity yet.</div>
                )}
              </div>
            </div>

            {/* Info + actions */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-300">
                <span className="font-semibold text-white">{series.genres[0]}</span>
                <span className="opacity-50">•</span>
                <span>{series.updateSchedule}</span>
                <span className="opacity-50">•</span>
                <span>{series.language}</span>
              </div>

              <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">{series.title}</h1>

              {series.altTitles.length ? (
                <div className="mt-2 flex flex-wrap gap-2 text-sm text-zinc-300">
                  {series.altTitles.slice(0, 3).map((t) => (
                    <span key={t} className="rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">{t}</span>
                  ))}
                </div>
              ) : null}

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-2 ring-1 ring-white/10">
                  <Stars value={myRating || series.stats.rating} onChange={(v) => { setMyRating(v); toastPush(`Rated ${v/2}★`, 'ok'); }} />
                  <span className="text-sm font-black text-white">{(myRating ? myRating : series.stats.rating).toFixed(1)}</span>
                  <span className="text-xs text-zinc-400">({formatCompact(series.stats.ratingCount)})</span>
                </div>

                <div className="flex items-center gap-4 rounded-2xl bg-white/5 px-3 py-2 ring-1 ring-white/10">
                  <div className="text-sm font-black text-white">{formatCompact(series.stats.views)} <span className="text-xs font-semibold text-zinc-400">views</span></div>
                  <div className="text-sm font-black text-white">{formatCompact(series.stats.subscribers)} <span className="text-xs font-semibold text-zinc-400">subs</span></div>
                  <div className="text-sm font-black text-white">{formatCompact(series.stats.likes)} <span className="text-xs font-semibold text-zinc-400">likes</span></div>
                </div>
              </div>

              {/* creators chips */}
              <div className="mt-5 flex flex-wrap items-center gap-2">
                {series.creators.map((c) => (
                  <a key={c.id} href="#about" className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 ring-1 ring-white/10 hover:bg-white/10">
                    <img src={c.avatarUrl} alt={c.name} className="h-6 w-6 rounded-full ring-1 ring-white/10" />
                    <span className="text-sm font-bold text-white">{c.name}</span>
                    <span className="text-xs text-zinc-400">{c.role}</span>
                    {c.verified ? <span className="text-xs text-cyan-200">✓</span> : null}
                  </a>
                ))}
              </div>

              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-zinc-200">{series.summary}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                {series.genres.map((g) => (
                  <span key={g} className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-200 ring-1 ring-white/10 hover:bg-white/10 cursor-pointer">{g}</span>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button onClick={() => onOpenEpisode(primaryEpisode)} disabled={pending}>
                  <Icon name="play" className="h-4 w-4" />
                  {primaryLabel}
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => startTransition(() => { setIsSubscribed((v) => !v); toastPush(!isSubscribed ? 'Subscribed (demo)' : 'Unsubscribed (demo)', 'ok'); })}
                  disabled={pending}
                >
                  {isSubscribed ? (
                    <>
                      <Icon name="check" className="h-4 w-4 text-emerald-200" />
                      Subscribed
                    </>
                  ) : (
                    <>Subscribe</>
                  )}
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => startTransition(() => { setIsLiked((v) => !v); toastPush(!isLiked ? 'Liked (demo)' : 'Like removed (demo)', 'ok'); })}
                  disabled={pending}
                >
                  <Icon name="heart" />
                  {isLiked ? 'Liked' : 'Like'}
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => startTransition(() => { setInLibrary((v) => !v); toastPush(!inLibrary ? 'Added to Library (demo)' : 'Removed from Library (demo)', 'ok'); })}
                  disabled={pending}
                >
                  <Icon name="bookmark" />
                  {inLibrary ? 'In Library' : 'Add to Library'}
                </Button>

                <Button variant="ghost" onClick={() => setShareOpen(true)}>
                  <Icon name="share" />
                  Share
                </Button>

                <Button variant="ghost" onClick={() => setReportOpen(true)}>
                  <Icon name="flag" />
                  Report
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-10 sticky top-0 z-30 -mx-4 px-4 py-3 bg-zinc-950/80 backdrop-blur-xl border-y border-white/10">
            <div className="mx-auto max-w-6xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {([
                  { key: 'episodes', label: `Episodes (${series.episodes.length})` },
                  { key: 'about', label: 'About' },
                  { key: 'community', label: 'Community' },
                ] as Array<{ key: TabKey; label: string }>).map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={cn(
                      'rounded-xl px-3 py-2 text-sm font-black transition',
                      tab === t.key ? 'bg-white/15 text-white ring-1 ring-white/15' : 'text-zinc-300 hover:bg-white/10'
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="hidden sm:flex items-center gap-2">
                <Pill>{series.updateSchedule}</Pill>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-4 pb-28">
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
          {/* Main */}
          <div className="min-w-0">
            {tab === 'episodes' ? (
              <section className="space-y-4">
                {/* controls */}
                <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative flex-1">
                      <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setVisibleCount(16); }}
                        placeholder="Search episodes…"
                        className="w-full rounded-2xl bg-zinc-950/40 ring-1 ring-white/10 pl-10 pr-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value as any)}
                        className="h-10 rounded-2xl bg-zinc-950/40 ring-1 ring-white/10 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                      >
                        <option value="LATEST">Latest</option>
                        <option value="OLDEST">Oldest</option>
                        <option value="POPULAR">Popular</option>
                      </select>

                      <select
                        value={filterAccess}
                        onChange={(e) => { setFilterAccess(e.target.value as any); setVisibleCount(16); }}
                        className="h-10 rounded-2xl bg-zinc-950/40 ring-1 ring-white/10 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                      >
                        <option value="ALL">All</option>
                        <option value="FREE">Free</option>
                        <option value="WUF">Wait Until Free</option>
                        <option value="COINS">Coins</option>
                      </select>

                      <select
                        value={season}
                        onChange={(e) => { setSeason(e.target.value as any); setVisibleCount(16); }}
                        className="h-10 rounded-2xl bg-zinc-950/40 ring-1 ring-white/10 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                      >
                        <option value="ALL">All seasons</option>
                        <option value="1">Season 1</option>
                        <option value="2">Season 2</option>
                      </select>

                      <button
                        onClick={() => setView((v) => (v === 'list' ? 'grid' : 'list'))}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10"
                        aria-label="Toggle view"
                      >
                        {view === 'list' ? <Icon name="grid" /> : <Icon name="list" />}
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-zinc-400">
                    Showing <span className="font-semibold text-white">{formatCompact(filtered.length)}</span> episodes
                  </div>
                </div>

                {/* episodes */}
                {view === 'list' ? (
                  <div className="overflow-hidden rounded-2xl ring-1 ring-white/10">
                    <div className="divide-y divide-white/10">
                      {visible.map((ep) => {
                        const readable = canRead(ep);
                        const isLast = lastReadEpisodeNumber === ep.number;

                        return (
                          <div key={ep.id} className={cn('flex gap-4 p-4 hover:bg-white/5 transition', isLast && 'bg-white/5')}>
                            <button
                              onClick={() => onOpenEpisode(ep)}
                              className="relative shrink-0 overflow-hidden rounded-2xl ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
                              aria-label={`Open episode ${ep.number}`}
                            >
                              <img src={ep.thumbnailUrl} alt="" className="h-[74px] w-[110px] object-cover" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                              <div className="absolute bottom-1 left-1"><EpisodeAccessBadge ep={ep} /></div>
                            </button>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <div className="text-sm font-black text-white">Ep. {ep.number}</div>
                                    <div className="truncate text-sm font-semibold text-zinc-200">{ep.title}</div>
                                    {ep.badges?.map((b) => (
                                      <span key={b} className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-black text-white ring-1 ring-white/10">{b}</span>
                                    ))}
                                    {isLast ? <Pill tone="good">Last Read</Pill> : null}
                                  </div>
                                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                                    <span>{formatDate(ep.publishedAtISO)}</span>
                                    <span className="opacity-50">•</span>
                                    <span>{formatCompact(ep.stats.views)} views</span>
                                    <span className="opacity-50">•</span>
                                    <span>{formatCompact(ep.stats.likes)} likes</span>
                                    <span className="opacity-50">•</span>
                                    <span>{ep.length.minutes} min</span>
                                    <span className="opacity-50">•</span>
                                    <span>Season {ep.season}</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  {readable ? (
                                    <Button size="sm" onClick={() => readEpisode(ep)}>
                                      Read
                                    </Button>
                                  ) : ep.access.type === 'WUF' ? (
                                    <Button size="sm" variant="secondary" onClick={() => onOpenEpisode(ep)}>
                                      <Icon name="clock" className="h-4 w-4" />
                                      Wait
                                    </Button>
                                  ) : (
                                    <Button size="sm" variant="secondary" onClick={() => { setUnlockTarget(ep); setUnlockOpen(true); }}>
                                      <Icon name="lock" className="h-4 w-4" />
                                      Unlock
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {visibleCount < filtered.length ? (
                      <div className="p-4 bg-white/5">
                        <Button variant="secondary" className="w-full" onClick={() => setVisibleCount((v) => v + 16)}>
                          Load more
                        </Button>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {visible.map((ep) => {
                      const readable = canRead(ep);
                      return (
                        <button
                          key={ep.id}
                          onClick={() => onOpenEpisode(ep)}
                          className="group overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition text-left"
                        >
                          <div className="relative h-[140px]">
                            <img src={ep.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                            <div className="absolute bottom-3 left-3 right-3">
                              <div className="flex items-center justify-between gap-2">
                                <div className="text-sm font-black text-white">Ep. {ep.number}</div>
                                <EpisodeAccessBadge ep={ep} />
                              </div>
                              <div className="mt-1 line-clamp-1 text-sm font-semibold text-zinc-200">{ep.title}</div>
                              <div className="mt-2 text-xs text-zinc-300">
                                {formatCompact(ep.stats.views)} views • {ep.length.minutes} min
                              </div>
                            </div>
                          </div>
                          <div className="p-4 flex items-center justify-between">
                            <div className="text-xs text-zinc-400">{formatDate(ep.publishedAtISO)}</div>
                            <span className={cn('text-xs font-black', readable ? 'text-emerald-200' : 'text-zinc-300')}>
                              {readable ? 'READ' : ep.access.type === 'COINS' ? 'UNLOCK' : 'WAIT'}
                            </span>
                          </div>
                        </button>
                      );
                    })}

                    {visibleCount < filtered.length ? (
                      <Button variant="secondary" className="w-full sm:col-span-2" onClick={() => setVisibleCount((v) => v + 16)}>
                        Load more
                      </Button>
                    ) : null}
                  </div>
                )}
              </section>
            ) : null}

            {tab === 'about' ? (
              <section id="about" className="space-y-5">
                <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-5">
                  <div className="text-lg font-black text-white">About</div>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-200">{series.summary}</p>

                  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-zinc-950/40 ring-1 ring-white/10 p-4">
                      <div className="text-xs font-semibold text-zinc-400">Format</div>
                      <div className="mt-1 text-sm font-black text-white">{series.verticalScroll ? 'Vertical Scroll' : 'Paged'}</div>
                      <div className="mt-1 text-xs text-zinc-400">Optimized for mobile-first reading.</div>
                    </div>
                    <div className="rounded-2xl bg-zinc-950/40 ring-1 ring-white/10 p-4">
                      <div className="text-xs font-semibold text-zinc-400">Release</div>
                      <div className="mt-1 text-sm font-black text-white">{series.updateSchedule}</div>
                      <div className="mt-1 text-xs text-zinc-400">{series.status === 'Hiatus' ? 'Return date TBD.' : 'New episodes auto-notify subscribers.'}</div>
                    </div>
                    <div className="rounded-2xl bg-zinc-950/40 ring-1 ring-white/10 p-4">
                      <div className="text-xs font-semibold text-zinc-400">Age Rating</div>
                      <div className="mt-1 text-sm font-black text-white">{series.ageRating}</div>
                      <div className="mt-1 text-xs text-zinc-400">Age gating is demo-enabled.</div>
                    </div>
                    <div className="rounded-2xl bg-zinc-950/40 ring-1 ring-white/10 p-4">
                      <div className="text-xs font-semibold text-zinc-400">Language</div>
                      <div className="mt-1 text-sm font-black text-white">{series.language}</div>
                      <div className="mt-1 text-xs text-zinc-400">Localize content metadata later.</div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="text-sm font-black text-white">Tags</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {series.tags.map((t) => (
                        <span key={t} className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-200 ring-1 ring-white/10">{t}</span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="text-sm font-black text-white">Content Warnings</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {series.contentWarnings.map((w) => (
                        <Pill key={w} tone={w === 'None' ? 'good' : 'warn'}>{w}</Pill>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-lg font-black text-white">Creators</div>
                      <div className="mt-1 text-sm text-zinc-400">Follow and support creators.</div>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => toastPush('Support flow (demo)', 'ok')}>
                      Tip / Support
                    </Button>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3">
                    {series.creators.map((c) => (
                      <div key={c.id} className="rounded-2xl bg-zinc-950/40 ring-1 ring-white/10 p-4">
                        <div className="flex items-start gap-3">
                          <img src={c.avatarUrl} alt={c.name} className="h-12 w-12 rounded-2xl ring-1 ring-white/10" />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="truncate text-sm font-black text-white">{c.name}</div>
                              <div className="text-xs text-zinc-400">{c.handle}</div>
                              <Pill>{c.role}</Pill>
                              {c.verified ? <Pill tone="good">Verified</Pill> : null}
                            </div>
                            <p className="mt-2 text-sm text-zinc-200">{c.bio}</p>
                            <div className="mt-2 text-xs text-zinc-400">
                              <span className="font-semibold text-white">{formatCompact(c.followers)}</span> followers
                            </div>
                          </div>
                          <Button size="sm" variant="secondary" onClick={() => toastPush(`Followed ${c.name} (demo)`, 'ok')}>
                            Follow
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ) : null}

            {tab === 'community' ? (
              <section className="space-y-4">
                <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-5">
                  <div className="text-lg font-black text-white">Community</div>
                  <div className="mt-1 text-sm text-zinc-400">Demo UI (wire-ready for your backend).</div>

                  <div className="mt-4 rounded-2xl bg-zinc-950/40 ring-1 ring-white/10 p-4">
                    <div className="flex items-start gap-3">
                      <img src={avatar('You')} alt="You" className="h-10 w-10 rounded-2xl ring-1 ring-white/10" />
                      <div className="flex-1">
                        <textarea
                          placeholder="Write a comment…"
                          className="min-h-[90px] w-full rounded-2xl bg-zinc-950/40 ring-1 ring-white/10 p-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                        />
                        <div className="mt-2 flex items-center justify-between">
                          <div className="text-xs text-zinc-400">Spoilers should be tagged.</div>
                          <Button size="sm" onClick={() => toastPush('Posted (demo)', 'ok')}>Post</Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {[
                      { u: 'DevNami', t: 'The pacing here is insane. Episode 9 made me scream.', likes: 1240 },
                      { u: 'HebaReads', t: 'The UI feels premium. Please keep this vibe.', likes: 540 },
                      { u: 'RamenSenpai', t: 'Need recs similar to this (action + emotional damage).', likes: 180 },
                    ].map((c, i) => (
                      <div key={i} className="rounded-2xl bg-zinc-950/40 ring-1 ring-white/10 p-4">
                        <div className="flex items-start gap-3">
                          <img src={avatar(c.u)} alt={c.u} className="h-10 w-10 rounded-2xl ring-1 ring-white/10" />
                          <div className="flex-1">
                            <div className="text-sm font-black text-white">{c.u}</div>
                            <div className="mt-2 text-sm text-zinc-200">{c.t}</div>
                            <div className="mt-3 flex items-center gap-2">
                              <Button size="sm" variant="ghost" onClick={() => toastPush('Liked (demo)', 'ok')}>
                                <Icon name="heart" className="h-4 w-4" /> {formatCompact(c.likes)}
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => toastPush('Reply (demo)', 'ok')}>
                                Reply
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => toastPush('Reported (demo)', 'warn')}>
                                <Icon name="flag" className="h-4 w-4" /> Report
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ) : null}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-5">
              <div className="text-sm font-black text-white">Fans also read</div>
              <div className="mt-4 space-y-3">
                {series.fansAlsoRead.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/comics/${r.slug}`}
                    className="group flex items-center gap-3 rounded-2xl bg-zinc-950/40 ring-1 ring-white/10 p-3 hover:bg-white/5 transition"
                  >
                    <img src={r.coverUrl} alt="" className="h-14 w-11 rounded-xl object-cover ring-1 ring-white/10" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-black text-white group-hover:underline underline-offset-2">{r.title}</div>
                      <div className="mt-1 text-xs text-zinc-400">
                        {r.genre} • {formatCompact(r.subscribers)} subs • <span className="text-amber-200 font-bold">{r.rating.toFixed(1)}★</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-5">
              <div className="text-sm font-black text-white">Support the series</div>
              <div className="mt-2 text-sm text-zinc-200">Unlock bundles, tip creators, and get early access (demo).</div>
              <div className="mt-4 grid grid-cols-1 gap-2">
                <Button variant="secondary" onClick={() => toastPush('Bundle purchase (demo)', 'ok')}>Buy bundle</Button>
                <Button variant="ghost" onClick={() => toastPush('Tip sent (demo)', 'ok')}>Send tip</Button>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Mobile sticky action bar */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-[75] border-t border-white/10 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-2">
          <Button className="flex-1" onClick={() => onOpenEpisode(primaryEpisode)}>
            <Icon name="play" className="h-4 w-4" />
            {primaryLabel}
          </Button>
          <Button variant="secondary" onClick={() => setIsSubscribed((v) => !v)} className="px-3">
            {isSubscribed ? <Icon name="check" className="h-4 w-4 text-emerald-200" /> : 'Subscribe'}
          </Button>
          <Button variant="ghost" onClick={() => setIsLiked((v) => !v)} className="px-3">
            <Icon name="heart" />
          </Button>
        </div>
      </div>

      {/* Modals */}
      <Modal
        open={shareOpen}
        title="Share"
        description="Copy the link (demo)."
        onClose={() => setShareOpen(false)}
      >
        <div className="space-y-3">
          <Button variant="secondary" onClick={copyLink} className="w-full">
            <Icon name="share" className="h-4 w-4" />
            Copy link
          </Button>
          <Button variant="ghost" onClick={() => setShareOpen(false)} className="w-full">
            Close
          </Button>
        </div>
      </Modal>

      <Modal
        open={reportOpen}
        title="Report series"
        description="Demo only."
        onClose={() => setReportOpen(false)}
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {['Copyright', 'Inappropriate', 'Harassment', 'Spam', 'Other'].map((r) => (
            <button
              key={r}
              onClick={() => toastPush(`Reported: ${r} (demo)`, 'warn')}
              className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4 text-left hover:bg-white/10"
            >
              <div className="text-sm font-black text-white">{r}</div>
              <div className="mt-1 text-xs text-zinc-400">Submit report</div>
            </button>
          ))}
        </div>
        <Button variant="ghost" onClick={() => setReportOpen(false)} className="mt-4 w-full">Close</Button>
      </Modal>

      <Modal
        open={unlockOpen}
        title="Unlock episode"
        description={unlockTarget ? `Ep. ${unlockTarget.number} • ${unlockTarget.title}` : ''}
        onClose={() => setUnlockOpen(false)}
      >
        {unlockTarget ? (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
              <div className="flex items-start gap-3">
                <img src={unlockTarget.thumbnailUrl} alt="" className="h-16 w-24 rounded-xl object-cover ring-1 ring-white/10" />
                <div className="flex-1">
                  <div className="text-sm font-black text-white">Coins unlock</div>
                  <div className="mt-1 text-xs text-zinc-400">In production: validate wallet, promos, entitlement.</div>
                  <div className="mt-2"><EpisodeAccessBadge ep={unlockTarget} /></div>
                </div>
              </div>
            </div>

            <Button
              onClick={() => { unlockEpisode(unlockTarget); setUnlockOpen(false); }}
              className="w-full"
            >
              Unlock ({unlockTarget.access.coinPrice ?? 2} Coins)
            </Button>
            <Button variant="ghost" onClick={() => setUnlockOpen(false)} className="w-full">Cancel</Button>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={matureGateOpen}
        title="Age verification"
        description="This series is marked as Mature 18+."
        onClose={() => setMatureGateOpen(true)}
      >
        <div className="space-y-4">
          <div className="rounded-2xl bg-amber-500/10 ring-1 ring-amber-400/20 p-4 text-sm text-amber-100">
            Demo gate: In production, enforce via account age, region rules, and parental controls.
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Button
              onClick={() => {
                writeLS(`fanaara:mature_ok:${series.id}`, { ok: true });
                setMatureGateOpen(false);
                toastPush('Verified (demo)', 'ok');
              }}
            >
              I’m 18+
            </Button>
            <Button variant="danger" onClick={() => router.push('/comics')}>
              Leave
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast */}
      {toast ? (
        <div className="fixed bottom-24 md:bottom-4 left-1/2 z-[95] -translate-x-1/2">
          <div
            className={cn(
              'rounded-2xl px-4 py-3 text-sm font-bold shadow-2xl ring-1 backdrop-blur-xl',
              toast.kind === 'danger'
                ? 'bg-rose-500/15 text-rose-100 ring-rose-400/20'
                : toast.kind === 'warn'
                  ? 'bg-amber-500/15 text-amber-100 ring-amber-400/20'
                  : 'bg-emerald-500/15 text-emerald-100 ring-emerald-400/20'
            )}
          >
            {toast.msg}
          </div>
        </div>
      ) : null}
    </div>
  );
}
