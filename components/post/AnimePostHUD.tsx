"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/utils/cn";
import { Avatar } from "@/design/Avatar";
import { IconButton } from "@/design/IconButton";

type Tone = "brand" | "warning" | "success" | "danger" | "info" | "neutral";

type Post = {
  id: string;
  user: {
    name: string;
    handle: string;
    avatar: string;
    rank: { label: string; level: number; tone: Tone };
  };
  meta: {
    community: string;
    time: string;
    reading: { title: string; chapter: string; progress: number };
    mood: string;
    spoiler: boolean;
  };
  content: {
    title: string;
    text: string;
    quote?: { who: string; line: string };
    tags: string[];
  };
  media: {
    cover: { src: string; alt: string };
    gallery: { src: string; alt: string }[];
  };
  stats: {
    likes: number;
    comments: number;
    reposts: number;
    saves: number;
    views: number;
  };
};

function compact(n: number) {
  try {
    return new Intl.NumberFormat(undefined, { notation: "compact" }).format(n);
  } catch {
    return String(n);
  }
}

function Icon({
  name,
  className,
}: {
  name:
    | "more"
    | "heart"
    | "comment"
    | "repost"
    | "bookmark"
    | "share"
    | "sparkles"
    | "eye"
    | "bolt"
    | "star";
  className?: string;
}) {
  const common = {
    className: cn("h-[1em] w-[1em]", className),
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "more":
      return (
        <svg {...common}>
          <path d="M12 6h.01" />
          <path d="M12 12h.01" />
          <path d="M12 18h.01" />
        </svg>
      );
    case "heart":
      return (
        <svg {...common}>
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
        </svg>
      );
    case "comment":
      return (
        <svg {...common}>
          <path d="M21 15a4 4 0 0 1-4 4H9l-5 3V7a4 4 0 0 1 4-4h9a4 4 0 0 1 4 4z" />
        </svg>
      );
    case "repost":
      return (
        <svg {...common}>
          <path d="M7 7h10l-2-2" />
          <path d="M17 17H7l2 2" />
          <path d="M17 7v6a4 4 0 0 1-4 4h-1" />
          <path d="M7 17v-6a4 4 0 0 1 4-4h1" />
        </svg>
      );
    case "bookmark":
      return (
        <svg {...common}>
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      );
    case "share":
      return (
        <svg {...common}>
          <path d="M15 8l5-5" />
          <path d="M20 3v6h-6" />
          <path d="M20 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6" />
        </svg>
      );
    case "sparkles":
      return (
        <svg {...common}>
          <path d="M12 2l1.2 4.1L17 7.2l-3.8 1.1L12 12l-1.2-3.7L7 7.2l3.8-1.1L12 2Z" />
          <path d="M19 13l.7 2.2L22 16l-2.3.8L19 19l-.7-2.2L16 16l2.3-.8L19 13Z" />
        </svg>
      );
    case "eye":
      return (
        <svg {...common}>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
          <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
        </svg>
      );
    case "bolt":
      return (
        <svg {...common}>
          <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
        </svg>
      );
    case "star":
      return (
        <svg {...common}>
          <path d="M12 2l3 7 7 .6-5.3 4.6 1.7 7.1L12 17.8 5.6 21.3l1.7-7.1L2 9.6 9 9l3-7z" />
        </svg>
      );
  }
}

function Chip({
  children,
  tone = "neutral",
  icon,
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  icon?: React.ReactNode;
  className?: string;
}) {
  const cls =
    tone === "brand"
      ? "bg-accent-soft border-accent-border"
      : tone === "warning"
        ? "bg-warning-soft border-warning-soft-border"
        : tone === "success"
          ? "bg-success-soft border-success-soft-border"
          : tone === "danger"
            ? "bg-danger-soft border-danger-soft-border"
            : tone === "info"
              ? "bg-info-soft border-info-soft-border"
              : "bg-surface-soft border-border-subtle";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
        "text-[11px] font-semibold text-foreground-strong shadow-[var(--shadow-xs)]",
        cls,
        className,
      )}
    >
      {icon ? <span className="opacity-90">{icon}</span> : null}
      {children}
    </span>
  );
}

function RankBadge({ rank }: { rank: Post["user"]["rank"] }) {
  const toneCls =
    rank.tone === "brand"
      ? "from-[color-mix(in_srgb,var(--brand-400)_65%,transparent)] to-[color-mix(in_srgb,var(--brand-600)_65%,transparent)]"
      : rank.tone === "warning"
        ? "from-[color-mix(in_srgb,var(--warning-400)_65%,transparent)] to-[color-mix(in_srgb,var(--warning-700)_65%,transparent)]"
        : rank.tone === "success"
          ? "from-[color-mix(in_srgb,var(--success-400)_65%,transparent)] to-[color-mix(in_srgb,var(--success-700)_65%,transparent)]"
          : rank.tone === "danger"
            ? "from-[color-mix(in_srgb,var(--danger-400)_65%,transparent)] to-[color-mix(in_srgb,var(--danger-700)_65%,transparent)]"
            : rank.tone === "info"
              ? "from-[color-mix(in_srgb,var(--info-400)_65%,transparent)] to-[color-mix(in_srgb,var(--info-700)_65%,transparent)]"
              : "from-[color-mix(in_srgb,var(--mono-40)_55%,transparent)] to-[color-mix(in_srgb,var(--mono-80)_55%,transparent)]";

  return (
    <span className="relative inline-flex items-center gap-2">
      <span
        className={cn(
          "inline-flex items-center rounded-full border border-white/10 bg-white/10 px-2.5 py-1",
          "text-[11px] font-semibold text-white",
          "shadow-[var(--shadow-sm)]",
          "backdrop-blur-md",
        )}
      >
        <span className={cn("h-1.5 w-1.5 rounded-full bg-white/80")} />
        {rank.label}
      </span>

      <span
        className={cn(
          "relative inline-flex items-center rounded-full px-2 py-1",
          "text-[10px] font-extrabold tracking-wide text-white",
          "shadow-[var(--shadow-sm)]",
        )}
      >
        <span
          className={cn(
            "absolute inset-0 -z-10 rounded-full bg-gradient-to-r",
            toneCls,
          )}
        />
        LV {rank.level}
      </span>
    </span>
  );
}

/**
 * V3 (new structure + new details)
 * - Hero cover with overlay header (feels like anime “scene card”)
 * - Profile “floats” under cover
 * - Reading progress + mood chips
 * - Gallery: mobile horizontal snap / desktop grid
 * - Actions bar (IconButton) with toggles
 * - Phone: fills width (w-full). sm+: centered max width
 */
export default function AnimePostCardV3() {
  const post: Post = {
    id: "p_v3",
    user: {
      name: "Kaito Arashi",
      handle: "@kaito.arashi",
      avatar:
        "https://images.unsplash.com/photo-1727409051606-16c4ae5d57d4?auto=format&fit=crop&fm=jpg&q=80&w=600",
      rank: { label: "Legend Scout", level: 87, tone: "brand" },
    },
    meta: {
      community: "Shonen Arena",
      time: "Today • 11:02 PM",
      reading: {
        title: "Neon Blade",
        chapter: "Ch. 214 — “Raincut”",
        progress: 68,
      },
      mood: "Hyped",
      spoiler: true,
    },
    content: {
      title: "This chapter’s choreography is insane 😭",
      text: "The author used a WIDE establishing panel, then cut into micro-impacts (hands → eyes → blade spark) and it reads SO fast.\n\nAlso the lighting? Pure neon + wet streets. Perfect.",
      quote: {
        who: "Panel Note",
        line: "Clarity first. Speed is a byproduct.",
      },
      tags: ["#manga", "#paneling", "#action", "#neon", "#storyboard"],
    },
    media: {
      cover: {
        src: "https://images.unsplash.com/photo-1750365866655-e712abd3ad46?auto=format&fit=crop&fm=jpg&q=80&w=2400",
        alt: "Neon street scene at night",
      },
      gallery: [
        {
          src: "https://images.unsplash.com/photo-1762446263896-ac93605b47d8?auto=format&fit=crop&fm=jpg&q=80&w=2400",
          alt: "Manga pages spread open",
        },
        {
          src: "https://images.unsplash.com/photo-1760293630917-2e4bef6e97f3?auto=format&fit=crop&fm=jpg&q=80&w=2400",
          alt: "Ramen shop at night",
        },
        {
          src: "https://images.unsplash.com/photo-1760954076011-d7ba1f26b71c?auto=format&fit=crop&fm=jpg&q=80&w=2400",
          alt: "Torii gate at a shrine at night",
        },
        {
          src: "https://images.unsplash.com/photo-1750133935037-bb5cb2d95f5a?auto=format&fit=crop&fm=jpg&q=80&w=2400",
          alt: "City lights bokeh at night",
        },
      ],
    },
    stats: {
      likes: 48210,
      comments: 1240,
      reposts: 860,
      saves: 9310,
      views: 501220,
    },
  };

  const [liked, setLiked] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [reposted, setReposted] = React.useState(false);
  const [spoiler, setSpoiler] = React.useState(post.meta.spoiler);

  const likeCount = post.stats.likes + (liked ? 1 : 0);
  const repostCount = post.stats.reposts + (reposted ? 1 : 0);
  const saveCount = post.stats.saves + (saved ? 1 : 0);

  return (
    <div className="w-full sm:mx-auto sm:max-w-[720px]">
      <article
        className={cn(
          "group relative w-full overflow-hidden rounded-2xl sm:rounded-3xl",
          "border border-card-border bg-card text-foreground",
          "shadow-[var(--shadow-glass)]",
          "transition duration-200 ease-out",
          "hover:shadow-[var(--shadow-glass-strong)] sm:hover:-translate-y-0.5",
        )}
      >
        {/* HERO */}
        <div className="relative">
          <div className="relative aspect-[16/9] overflow-hidden">
            <Image
              src={post.media.cover.src}
              alt={post.media.cover.alt}
              fill
              sizes="(max-width: 640px) 100vw, 720px"
              className={cn(
                "object-cover",
                "transition duration-500 ease-out",
                "group-hover:scale-[1.04]",
                spoiler && "blur-[10px] scale-[1.02]",
                "motion-reduce:transition-none motion-reduce:transform-none",
              )}
              priority
            />

            {/* cinematic overlay */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 bg-[linear-gradient(to_top,var(--overlay-strong),transparent_55%)] opacity-80" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.18),transparent_55%)]" />
            </div>

            {/* top row: community + views + spoiler toggle */}
            <div className="absolute left-3 right-3 top-3 flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <Chip tone="brand" icon={<Icon name="sparkles" />}>
                  {post.meta.community}
                </Chip>
                <span className="hidden sm:inline-flex">
                  <Chip tone="info" icon={<Icon name="eye" />}>
                    {compact(post.stats.views)} views
                  </Chip>
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <IconButton
                  aria-label={spoiler ? "Reveal media" : "Hide media"}
                  variant="inverse"
                  tone="neutral"
                  size="sm"
                  tooltip={spoiler ? "Reveal" : "Spoiler"}
                  onClick={() => setSpoiler((v) => !v)}
                >
                  <Icon name={spoiler ? "eye" : "bolt"} />
                </IconButton>

                <IconButton
                  aria-label="Post options"
                  variant="inverse"
                  tone="neutral"
                  size="sm"
                  tooltip="Options"
                >
                  <Icon name="more" />
                </IconButton>
              </div>
            </div>

            {/* bottom overlay: title + rank */}
            <div className="absolute inset-x-0 bottom-0 p-4">
              <div className="flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white/80">
                    {post.meta.time}
                  </p>
                  <h3 className="mt-1 line-clamp-2 text-base font-semibold text-white sm:text-lg">
                    {post.content.title}
                  </h3>
                </div>
                <div className="shrink-0">
                  <RankBadge rank={post.user.rank} />
                </div>
              </div>

              {/* progress bar (reading) */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-[11px] font-semibold text-white/80">
                  <span className="truncate">
                    Reading:{" "}
                    <span className="text-white/90">
                      {post.meta.reading.title}
                    </span>
                  </span>
                  <span className="shrink-0">
                    {post.meta.reading.progress}%
                  </span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={cn(
                      "h-full rounded-full bg-[var(--gradient-brand-soft)]",
                      "transition-[width] duration-300 ease-out",
                      "group-hover:shadow-[var(--shadow-glow-brand)]",
                    )}
                    style={{ width: `${post.meta.reading.progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* shine sweep (hover) */}
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <div className="shine absolute -inset-8" />
            </div>
          </div>

          {/* floating profile row */}
          <div className="relative -mt-6 px-4 pb-3">
            <div
              className={cn(
                "flex items-center justify-between gap-3",
                "rounded-2xl border border-border-subtle bg-surface/90",
                "backdrop-blur-md",
                "px-3 py-3 shadow-[var(--shadow-md)]",
              )}
            >
              <div className="flex min-w-0 items-center gap-3">
                <Avatar
                  src={post.user.avatar}
                  name={post.user.name}
                  size="12"
                  className="ring-2 ring-[var(--ring-brand)] ring-offset-2 ring-offset-background-elevated"
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-foreground-strong">
                      {post.user.name}
                    </p>
                    <Chip tone="neutral" icon={<Icon name="star" />}>
                      {post.meta.mood}
                    </Chip>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-foreground-muted">
                    {post.user.handle}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-foreground-muted">
                    {post.meta.reading.chapter}
                  </p>
                </div>
              </div>

              <Chip tone="warning" icon={<Icon name="bolt" />}>
                Hot take
              </Chip>
            </div>
          </div>
        </div>

        {/* TEXT + QUOTE */}
        <section className="px-4 pb-4">
          <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
            {post.content.text}
          </p>

          {post.content.quote ? (
            <div
              className={cn(
                "mt-4 rounded-2xl border border-border-subtle bg-surface-soft",
                "p-3 shadow-[var(--shadow-xs)]",
              )}
            >
              <p className="text-xs font-semibold text-foreground-strong">
                {post.content.quote.who}
              </p>
              <p className="mt-1 text-sm text-foreground-muted">
                “{post.content.quote.line}”
              </p>
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            {post.content.tags.map((t) => (
              <span
                key={t}
                className={cn(
                  "rounded-full border border-border-subtle bg-surface-soft px-2.5 py-1",
                  "text-[11px] font-semibold text-foreground-muted",
                  "transition hover:border-border-strong hover:text-foreground",
                )}
              >
                {t}
              </span>
            ))}
          </div>
        </section>

        {/* GALLERY
            - Mobile: horizontal snap (simple + fun)
            - sm+: grid
        */}
        <section className="px-4 pb-4">
          <div
            className={cn(
              "flex gap-2 overflow-x-auto pb-1",
              "snap-x snap-mandatory",
              "sm:grid sm:grid-cols-4 sm:gap-2 sm:overflow-visible sm:pb-0",
            )}
          >
            {post.media.gallery.map((img, idx) => (
              <div
                key={img.src}
                className={cn(
                  "relative overflow-hidden rounded-xl border border-border-subtle bg-surface",
                  "shadow-[var(--shadow-sm)]",
                  "transition duration-300 ease-out",
                  "hover:shadow-[var(--shadow-md)] sm:hover:-translate-y-0.5",
                  "snap-start shrink-0 w-[72%] sm:w-auto",
                )}
              >
                <div
                  className={cn(
                    "relative",
                    idx === 0 ? "aspect-[16/10]" : "aspect-[4/3]",
                  )}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="(max-width: 640px) 72vw, 180px"
                    className={cn(
                      "object-cover",
                      "transition duration-500 ease-out",
                      "hover:scale-[1.05]",
                      spoiler && "blur-[8px] scale-[1.02]",
                      "motion-reduce:transition-none motion-reduce:transform-none",
                    )}
                  />
                </div>

                {/* mini overlay */}
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.14),transparent_55%)] opacity-70" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ACTIONS */}
        <section className="flex items-center justify-between gap-2 border-t border-divider px-4 py-3">
          <div className="flex items-center gap-2">
            <IconButton
              aria-label={liked ? "Unlike" : "Like"}
              variant={liked ? "solid" : "soft"}
              tone={liked ? "danger" : "neutral"}
              size="sm"
              tooltip={liked ? "Liked" : "Like"}
              onClick={() => setLiked((v) => !v)}
            >
              <Icon name="heart" />
            </IconButton>
            <span className="text-xs font-semibold text-foreground-muted">
              {compact(likeCount)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <IconButton
              aria-label="Comment"
              variant="soft"
              tone="neutral"
              size="sm"
              tooltip="Comment"
            >
              <Icon name="comment" />
            </IconButton>
            <span className="text-xs font-semibold text-foreground-muted">
              {compact(post.stats.comments)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <IconButton
              aria-label={reposted ? "Undo repost" : "Repost"}
              variant={reposted ? "solid" : "soft"}
              tone={reposted ? "success" : "neutral"}
              size="sm"
              tooltip={reposted ? "Reposted" : "Repost"}
              onClick={() => setReposted((v) => !v)}
            >
              <Icon name="repost" />
            </IconButton>
            <span className="text-xs font-semibold text-foreground-muted">
              {compact(repostCount)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <IconButton
              aria-label={saved ? "Unsave" : "Save"}
              variant={saved ? "solid" : "soft"}
              tone={saved ? "brand" : "neutral"}
              size="sm"
              tooltip={saved ? "Saved" : "Save"}
              onClick={() => setSaved((v) => !v)}
            >
              <Icon name="bookmark" />
            </IconButton>
            <span className="text-xs font-semibold text-foreground-muted">
              {compact(saveCount)}
            </span>
          </div>

          <IconButton
            aria-label="Share"
            variant="soft"
            tone="neutral"
            size="sm"
            tooltip="Share"
          >
            <Icon name="share" />
          </IconButton>
        </section>

        {/* component-scoped shine */}
        <style jsx>{`
          .shine {
            background: linear-gradient(
              110deg,
              transparent 0%,
              rgba(255, 255, 255, 0.16) 18%,
              rgba(255, 255, 255, 0.08) 28%,
              transparent 45%
            );
            transform: translateX(-30%);
            animation: shine 1.2s ease-out;
            mask-image: radial-gradient(
              circle at 50% 50%,
              #000 60%,
              transparent 85%
            );
            -webkit-mask-image: radial-gradient(
              circle at 50% 50%,
              #000 60%,
              transparent 85%
            );
          }
          @keyframes shine {
            from {
              transform: translateX(-35%);
              opacity: 0.1;
            }
            30% {
              opacity: 0.9;
            }
            to {
              transform: translateX(35%);
              opacity: 0.2;
            }
          }
          @media (prefers-reduced-motion: reduce) {
            .shine {
              animation: none;
            }
          }
        `}</style>
      </article>
    </div>
  );
}
