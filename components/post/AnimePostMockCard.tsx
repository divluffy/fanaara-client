"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/utils/cn";
import { Avatar } from "@/design/Avatar";
import { IconButton } from "@/design/IconButton";

type Media = {
  id: string;
  src: string;
  alt: string;
  badge?: string;
};

type Comment = {
  id: string;
  user: { name: string; handle: string; avatar: string };
  text: string;
  ts: string;
  likes: number;
};

function compact(n: number) {
  try {
    return new Intl.NumberFormat(undefined, { notation: "compact" }).format(n);
  } catch {
    return String(n);
  }
}

function cxTone(active?: boolean) {
  return active
    ? "text-foreground-strong"
    : "text-foreground-muted hover:text-foreground";
}

/** Minimal inline icons (no deps) */
function Icon({
  name,
  className,
}: {
  name:
    | "heart"
    | "comment"
    | "repost"
    | "share"
    | "bookmark"
    | "more"
    | "sparkles"
    | "eye"
    | "play"
    | "bolt"
    | "tag";
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
    case "share":
      return (
        <svg {...common}>
          <path d="M15 8l5-5" />
          <path d="M20 3v6h-6" />
          <path d="M20 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6" />
        </svg>
      );
    case "bookmark":
      return (
        <svg {...common}>
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      );
    case "more":
      return (
        <svg {...common}>
          <path d="M12 6h.01" />
          <path d="M12 12h.01" />
          <path d="M12 18h.01" />
        </svg>
      );
    case "sparkles":
      return (
        <svg {...common}>
          <path d="M12 2l1.2 4.1L17 7.2l-3.8 1.1L12 12l-1.2-3.7L7 7.2l3.8-1.1L12 2Z" />
          <path d="M19 13l.7 2.2L22 16l-2.3.8L19 19l-.7-2.2L16 16l2.3-.8L19 13Z" />
          <path d="M5 13l.7 2.2L8 16l-2.3.8L5 19l-.7-2.2L2 16l2.3-.8L5 13Z" />
        </svg>
      );
    case "eye":
      return (
        <svg {...common}>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
          <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
        </svg>
      );
    case "play":
      return (
        <svg {...common}>
          <path d="M8 5v14l11-7z" />
        </svg>
      );
    case "bolt":
      return (
        <svg {...common}>
          <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
        </svg>
      );
    case "tag":
      return (
        <svg {...common}>
          <path d="M20.6 13.2l-7.4 7.4a2 2 0 0 1-2.8 0L3 13.2V3h10.2l7.4 7.4a2 2 0 0 1 0 2.8Z" />
          <path d="M7.5 7.5h.01" />
        </svg>
      );
  }
}

function Pill({
  children,
  tone = "neutral",
  className,
  icon,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "brand" | "warning" | "danger" | "info" | "success";
  className?: string;
  icon?: React.ReactNode;
}) {
  const toneCls =
    tone === "brand"
      ? "bg-accent-soft border-accent-border"
      : tone === "warning"
        ? "bg-warning-soft border-warning-soft-border"
        : tone === "danger"
          ? "bg-danger-soft border-danger-soft-border"
          : tone === "info"
            ? "bg-info-soft border-info-soft-border"
            : tone === "success"
              ? "bg-success-soft border-success-soft-border"
              : "bg-surface-soft border-border-subtle";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
        "text-[11px] font-semibold text-foreground-strong",
        "shadow-[var(--shadow-xs)]",
        toneCls,
        className,
      )}
    >
      {icon ? <span className="opacity-90">{icon}</span> : null}
      {children}
    </span>
  );
}

export default function AnimePostMockCard() {
  /** Mock data (keep it all in this file) */
  const post = React.useMemo(() => {
    const media: Media[] = [
      {
        id: "manga-spread",
        src: "https://images.unsplash.com/photo-1762446263896-ac93605b47d8?auto=format&fit=crop&fm=jpg&q=80&w=2400",
        alt: "Manga pages spread open",
        badge: "Manga Panel Study",
      },
      {
        id: "neon-shinjuku",
        src: "https://images.unsplash.com/photo-1750365866655-e712abd3ad46?auto=format&fit=crop&fm=jpg&q=80&w=2400",
        alt: "Neon street in Tokyo at night",
        badge: "Neo Tokyo Vibes",
      },
      {
        id: "ramen-night",
        src: "https://images.unsplash.com/photo-1760293630917-2e4bef6e97f3?auto=format&fit=crop&fm=jpg&q=80&w=2400",
        alt: "Ramen shop at night in a rainy street",
        badge: "Slice of Life",
      },
      {
        id: "torii-night",
        src: "https://images.unsplash.com/photo-1760954076011-d7ba1f26b71c?auto=format&fit=crop&fm=jpg&q=80&w=2400",
        alt: "Torii gate at a shrine at night",
        badge: "Mystic Arc",
      },
    ];

    const author = {
      name: "Yumi Kisaragi",
      handle: "@kisaragi.yumi",
      avatar:
        "https://images.unsplash.com/photo-1742299899537-c765ac3fda5c?auto=format&fit=crop&fm=jpg&q=80&w=600",
      badge: "Creator",
    };

    const comments: Comment[] = [
      {
        id: "c1",
        user: {
          name: "Rin",
          handle: "@rin.panel",
          avatar:
            "https://images.unsplash.com/photo-1727409051606-16c4ae5d57d4?auto=format&fit=crop&fm=jpg&q=80&w=600",
        },
        text: "The pacing in page 3 is 🔥. That wide panel into the close-up is chef’s kiss.",
        ts: "2h",
        likes: 126,
      },
      {
        id: "c2",
        user: {
          name: "Hasbi",
          handle: "@blue.arc",
          avatar:
            "https://images.unsplash.com/photo-1680965422780-3a464b5457ae?auto=format&fit=crop&fm=jpg&q=80&w=600",
        },
        text: "This neon palette + soft shadows = peak cyber-slice vibe. More pls!",
        ts: "48m",
        likes: 73,
      },
    ];

    return {
      id: "post_001",
      author,
      title: "Panel Breakdown: How to Make Action Feel Fast (Without More Panels)",
      body: `Here’s my mini workflow for speed + clarity:
• Use 1 “anchor” wide panel for geography.
• Push motion with SFX + trailing lines (but keep faces clean).
• Swap detail: hands/eyes/impact frames — then breathe.

Bonus: I included my reference pack for neon lighting + shrine ambience.`,
      tags: ["#manga", "#storyboarding", "#shonen", "#cinematics", "#neon"],
      media,
      meta: {
        time: "Today • 9:14 PM",
        read: "3 min read",
        community: "Manga Lab",
      },
      stats: { likes: 18320, comments: 286, reposts: 412, views: 289400 },
      comments,
    };
  }, []);

  const [active, setActive] = React.useState(0);
  const [liked, setLiked] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [reposted, setReposted] = React.useState(false);
  const [spoilerBlur, setSpoilerBlur] = React.useState(true);
  const [expanded, setExpanded] = React.useState(false);

  const media = post.media[active];

  /** Decorative petals (uses your global .animate-sakura / .animate-sakura-lite) */
  const petals = React.useMemo(() => {
    // deterministic-ish values so it doesn't “jump” each render
    const seed = [9, 22, 41, 57, 73, 88, 101, 123, 144, 167];
    return seed.slice(0, 8).map((n, i) => {
      const sx = `${(n * 7) % 110 - 10}vw`;
      const sy = `${-20 - (n % 30)}px`;
      const ex = `${(n * 9) % 120 - 10}vw`;
      const ey = `${420 + (n % 160)}px`;
      const r1 = `${(n * 11) % 360}deg`;
      const r2 = `${(n * 17) % 360}deg`;
      const s = `${0.55 + ((n % 40) / 100)}`;
      const dur = `${10 + (n % 10)}s`;
      const drift = `${30 + ((n * 3) % 60)}px`;

      return {
        key: `p_${i}`,
        style: {
          ["--sx" as any]: sx,
          ["--sy" as any]: sy,
          ["--ex" as any]: ex,
          ["--ey" as any]: ey,
          ["--r1" as any]: r1,
          ["--r2" as any]: r2,
          ["--s" as any]: s,
          ["--dur" as any]: dur,
          ["--drift" as any]: drift,
        } as React.CSSProperties,
      };
    });
  }, []);

  return (
    <section className="w-full">
      <div
        className={cn(
          "postShell group relative overflow-hidden rounded-3xl",
          "border border-card-border bg-card text-foreground",
          "shadow-[var(--shadow-glass)]",
        )}
      >
        {/* soft aurora / glow */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div
            className={cn(
              "absolute -inset-24 opacity-35 blur-3xl",
              "bg-[var(--gradient-brand-soft)]",
              "animate-aurora-lite md:animate-aurora",
            )}
          />
          <div
            className={cn(
              "absolute inset-0 opacity-[0.08]",
              "bg-[radial-gradient(circle_at_20%_10%,var(--brand-400),transparent_55%),radial-gradient(circle_at_80%_30%,var(--accent-yellow),transparent_60%),radial-gradient(circle_at_50%_90%,var(--brand-600),transparent_55%)]",
            )}
          />
        </div>

        {/* Header */}
        <header className="flex items-center justify-between gap-3 p-4 md:p-5">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar
              src={post.author.avatar}
              name={post.author.name}
              size="12"
              className="ring-2 ring-[var(--ring-brand)] ring-offset-2 ring-offset-background-elevated"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold text-foreground-strong">
                  {post.author.name}
                </p>
                <Pill tone="brand" className="hidden sm:inline-flex">
                  {post.author.badge}
                </Pill>
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p className="truncate text-xs text-foreground-muted">
                  {post.author.handle}
                </p>
                <span className="text-xs text-foreground-soft">•</span>
                <p className="text-xs text-foreground-muted">{post.meta.time}</p>
                <span className="text-xs text-foreground-soft">•</span>
                <p className="text-xs text-foreground-muted">{post.meta.read}</p>
                <span className="text-xs text-foreground-soft">•</span>
                <p className="text-xs text-foreground-muted">
                  in{" "}
                  <span className="font-semibold text-foreground">
                    {post.meta.community}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <IconButton
              aria-label="Boost"
              variant="soft"
              tone="brand"
              size="md"
              tooltip="Boost"
              className="hidden sm:inline-flex"
            >
              <Icon name="sparkles" />
            </IconButton>

            <IconButton
              aria-label="More"
              variant="plain"
              tone="neutral"
              size="md"
              tooltip="More"
            >
              <Icon name="more" />
            </IconButton>
          </div>
        </header>

        {/* Body grid */}
        <div className="grid gap-4 px-4 pb-4 md:grid-cols-[1.15fr_0.85fr] md:gap-5 md:px-5 md:pb-5">
          {/* Media */}
          <div className="relative">
            <div
              className={cn(
                "mediaShell relative overflow-hidden rounded-2xl",
                "border border-border-subtle bg-surface",
                "shadow-[var(--shadow-md)]",
              )}
            >
              <div className="relative aspect-[16/10]">
                <Image
                  src={media.src}
                  alt={media.alt}
                  fill
                  priority={false}
                  sizes="(max-width: 768px) 100vw, 60vw"
                  className={cn(
                    "object-cover",
                    "transition duration-500 ease-out",
                    "group-hover:scale-[1.03]",
                    spoilerBlur && "blur-[10px] scale-[1.02]",
                    "motion-reduce:transition-none motion-reduce:transform-none",
                  )}
                />

                {/* cinematic overlay */}
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute inset-0 bg-[linear-gradient(to_top,var(--overlay-strong),transparent_55%)] opacity-70" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_55%)]" />
                </div>

                {/* petals */}
                <div className="pointer-events-none absolute inset-0">
                  {petals.map((p) => (
                    <span
                      key={p.key}
                      style={p.style}
                      className={cn(
                        "petal absolute left-0 top-0",
                        "animate-sakura-lite md:animate-sakura",
                        "opacity-70",
                      )}
                    />
                  ))}
                </div>

                {/* top badges */}
                <div className="absolute left-3 top-3 flex flex-wrap items-center gap-2">
                  <Pill
                    tone="info"
                    icon={<Icon name="eye" className="h-[1em] w-[1em]" />}
                  >
                    {compact(post.stats.views)} views
                  </Pill>
                  <Pill
                    tone="warning"
                    icon={<Icon name="bolt" className="h-[1em] w-[1em]" />}
                  >
                    Hot topic
                  </Pill>
                </div>

                {/* spoiler toggle */}
                <div className="absolute right-3 top-3">
                  <IconButton
                    aria-label={spoilerBlur ? "Reveal media" : "Hide media"}
                    variant="inverse"
                    tone="neutral"
                    size="sm"
                    tooltip={spoilerBlur ? "Reveal" : "Hide"}
                    onClick={() => setSpoilerBlur((v) => !v)}
                  >
                    <Icon name={spoilerBlur ? "play" : "eye"} />
                  </IconButton>
                </div>

                {/* bottom title strip */}
                <div className="absolute inset-x-0 bottom-0 p-3 md:p-4">
                  <div className="flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white/80">
                        {media.badge}
                      </p>
                      <p className="truncate text-sm font-semibold text-white">
                        {post.title}
                      </p>
                    </div>
                    <Pill
                      tone="brand"
                      className="bg-white/12 text-white border-white/15"
                      icon={<Icon name="tag" className="text-white" />}
                    >
                      {post.tags[0]}
                    </Pill>
                  </div>

                  {/* progress */}
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-[var(--gradient-brand-soft)] transition-[width] duration-300 ease-out"
                      style={{
                        width: `${((active + 1) / post.media.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* thumbnails */}
              <div className="flex gap-2 p-2 md:p-3">
                {post.media.map((m, idx) => {
                  const isActive = idx === active;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setActive(idx)}
                      className={cn(
                        "group/thumb relative h-14 w-[72px] overflow-hidden rounded-xl",
                        "border bg-surface",
                        isActive
                          ? "border-[var(--ring-brand)] shadow-[var(--shadow-glow-brand)]"
                          : "border-border-subtle hover:border-border-strong",
                        "transition",
                      )}
                      aria-label={`Show media ${idx + 1}`}
                    >
                      <Image
                        src={m.src}
                        alt={m.alt}
                        fill
                        sizes="96px"
                        className={cn(
                          "object-cover",
                          "transition duration-300 ease-out",
                          "group-hover/thumb:scale-105",
                        )}
                      />
                      <span
                        className={cn(
                          "pointer-events-none absolute inset-0",
                          isActive
                            ? "bg-[radial-gradient(circle_at_40%_20%,rgba(255,255,255,0.25),transparent_60%)]"
                            : "bg-[linear-gradient(to_top,rgba(0,0,0,0.35),transparent)] opacity-70",
                        )}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* quick actions floating */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Pill tone="success">Reference Pack Included</Pill>
                <Pill tone="neutral" className="opacity-90">
                  {post.tags.slice(1, 3).join(" ")}
                </Pill>
              </div>

              <div className="flex items-center gap-1.5">
                <IconButton
                  aria-label="Share"
                  variant="soft"
                  tone="neutral"
                  size="sm"
                  tooltip="Share"
                >
                  <Icon name="share" />
                </IconButton>
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
              </div>
            </div>
          </div>

          {/* Content */}
          <aside className="flex min-w-0 flex-col gap-4">
            {/* title + excerpt */}
            <div
              className={cn(
                "rounded-2xl border border-border-subtle bg-surface px-4 py-4",
                "shadow-[var(--shadow-sm)]",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-foreground-strong">
                    {post.title}
                  </h3>
                  <p className="mt-1 text-xs text-foreground-muted">
                    A fast breakdown for manga + comics creators.
                  </p>
                </div>

                <Link
                  href="#"
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold",
                    "bg-accent text-accent-foreground",
                    "shadow-[var(--shadow-glow-brand)]",
                    "transition hover:translate-y-[-1px] active:translate-y-0",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)]",
                  )}
                >
                  Follow
                </Link>
              </div>

              <p
                className={cn(
                  "mt-3 text-sm leading-relaxed text-foreground",
                  !expanded && "line-clamp-5",
                )}
              >
                {post.body}
              </p>

              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((t) => (
                    <span
                      key={t}
                      className={cn(
                        "rounded-full border border-border-subtle bg-surface-soft px-2.5 py-1",
                        "text-[11px] font-semibold text-foreground-muted",
                        "hover:border-border-strong hover:text-foreground",
                        "transition",
                      )}
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className={cn(
                    "shrink-0 text-xs font-semibold",
                    "text-foreground-muted hover:text-foreground",
                    "transition",
                  )}
                >
                  {expanded ? "Show less" : "Read more"}
                </button>
              </div>
            </div>

            {/* action bar */}
            <div
              className={cn(
                "rounded-2xl border border-border-subtle bg-surface px-3 py-3",
                "shadow-[var(--shadow-sm)]",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setLiked((v) => !v)}
                  className={cn(
                    "group/act flex items-center gap-2 rounded-xl px-2.5 py-2",
                    "hover:bg-surface-soft transition",
                  )}
                >
                  <IconButton
                    aria-label={liked ? "Unlike" : "Like"}
                    variant={liked ? "solid" : "soft"}
                    tone={liked ? "danger" : "neutral"}
                    size="sm"
                    className="pointer-events-none"
                  >
                    <Icon name="heart" />
                  </IconButton>
                  <span className={cn("text-sm font-semibold", cxTone(liked))}>
                    {compact(post.stats.likes + (liked ? 1 : 0))}
                  </span>
                </button>

                <button
                  type="button"
                  className={cn(
                    "group/act flex items-center gap-2 rounded-xl px-2.5 py-2",
                    "hover:bg-surface-soft transition",
                  )}
                >
                  <IconButton
                    aria-label="Comment"
                    variant="soft"
                    tone="neutral"
                    size="sm"
                    className="pointer-events-none"
                  >
                    <Icon name="comment" />
                  </IconButton>
                  <span className="text-sm font-semibold text-foreground-muted group-hover/act:text-foreground">
                    {compact(post.stats.comments)}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setReposted((v) => !v)}
                  className={cn(
                    "group/act flex items-center gap-2 rounded-xl px-2.5 py-2",
                    "hover:bg-surface-soft transition",
                  )}
                >
                  <IconButton
                    aria-label={reposted ? "Undo repost" : "Repost"}
                    variant={reposted ? "solid" : "soft"}
                    tone={reposted ? "success" : "neutral"}
                    size="sm"
                    className="pointer-events-none"
                  >
                    <Icon name="repost" />
                  </IconButton>
                  <span className={cn("text-sm font-semibold", cxTone(reposted))}>
                    {compact(post.stats.reposts + (reposted ? 1 : 0))}
                  </span>
                </button>

                <IconButton
                  aria-label="Share"
                  variant="soft"
                  tone="neutral"
                  size="sm"
                  tooltip="Share"
                >
                  <Icon name="share" />
                </IconButton>
              </div>
            </div>

            {/* comments preview */}
            <div
              className={cn(
                "rounded-2xl border border-border-subtle bg-surface px-4 py-4",
                "shadow-[var(--shadow-sm)]",
              )}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground-strong">
                  Top comments
                </p>
                <Pill tone="info">{compact(post.stats.comments)} total</Pill>
              </div>

              <div className="mt-3 space-y-3">
                {post.comments.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    <Avatar
                      src={c.user.avatar}
                      name={c.user.name}
                      size="10"
                      className="shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="text-xs font-semibold text-foreground-strong">
                          {c.user.name}
                        </p>
                        <p className="text-xs text-foreground-muted">
                          {c.user.handle}
                        </p>
                        <span className="text-xs text-foreground-soft">•</span>
                        <p className="text-xs text-foreground-muted">{c.ts}</p>
                      </div>
                      <p className="mt-1 text-sm text-foreground">{c.text}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full border border-border-subtle bg-surface-soft px-2 py-1 text-[11px] font-semibold text-foreground-muted">
                          <Icon name="heart" className="h-[1em] w-[1em]" />
                          {compact(c.likes)}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-border-subtle bg-surface-soft px-2 py-1 text-[11px] font-semibold text-foreground-muted">
                          <Icon name="sparkles" className="h-[1em] w-[1em]" />
                          Insightful
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex -space-x-2">
                  <Avatar
                    src={post.author.avatar}
                    name={post.author.name}
                    size="9"
                    className="ring-2 ring-background-elevated"
                  />
                  <Avatar
                    src={post.comments[0].user.avatar}
                    name={post.comments[0].user.name}
                    size="9"
                    className="ring-2 ring-background-elevated"
                  />
                  <Avatar
                    src={post.comments[1].user.avatar}
                    name={post.comments[1].user.name}
                    size="9"
                    className="ring-2 ring-background-elevated"
                  />
                </div>

                <Link
                  href="#"
                  className={cn(
                    "rounded-full border border-border-subtle bg-surface-soft px-3 py-2",
                    "text-xs font-semibold text-foreground-muted",
                    "hover:border-border-strong hover:text-foreground hover:bg-surface-muted",
                    "transition",
                  )}
                >
                  View all comments →
                </Link>
              </div>
            </div>
          </aside>
        </div>

        {/* subtle footer divider */}
        <div className="h-px w-full bg-divider" />

        {/* Footer (optional) */}
        <footer className="flex flex-wrap items-center justify-between gap-2 p-4 md:p-5">
          <div className="flex items-center gap-2">
            <Pill
              tone="brand"
              icon={<Icon name="sparkles" className="h-[1em] w-[1em]" />}
            >
              Featured
            </Pill>
            <span className="text-xs text-foreground-muted">
              Tip: hover the card for glow + parallax.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <IconButton
              aria-label="Quick add to collection"
              variant="soft"
              tone="brand"
              size="sm"
              tooltip="Add to collection"
            >
              <Icon name="bookmark" />
            </IconButton>
            <IconButton
              aria-label="More"
              variant="soft"
              tone="neutral"
              size="sm"
              tooltip="More"
            >
              <Icon name="more" />
            </IconButton>
          </div>
        </footer>
      </div>

      {/* Component-scoped CSS (effects/border/petals) */}
      <style jsx>{`
        .postShell {
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }

        /* gradient border glow (no extra wrappers) */
        .postShell::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(
            135deg,
            color-mix(in srgb, var(--brand-400) 45%, transparent),
            transparent 40%,
            color-mix(in srgb, var(--accent-yellow) 40%, transparent)
          );
          -webkit-mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 220ms ease-out;
          pointer-events: none;
        }
        .postShell:hover::before {
          opacity: 1;
        }

        /* petals */
        .petal {
          width: 14px;
          height: 10px;
          border-radius: 999px 999px 999px 999px;
          background: radial-gradient(
            circle at 30% 30%,
            rgba(255, 255, 255, 0.9),
            color-mix(in srgb, var(--brand-400) 35%, transparent) 55%,
            rgba(0, 0, 0, 0) 72%
          );
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
          filter: saturate(1.2);
        }
      `}</style>
    </section>
  );
}
