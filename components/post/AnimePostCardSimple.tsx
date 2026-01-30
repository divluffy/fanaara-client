"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/utils/cn";
import { Avatar } from "@/design/Avatar";
import { IconButton } from "@/design/IconButton";

type Post = {
  id: string;
  user: {
    name: string;
    handle: string;
    avatar: string;
    rank: { label: string; tone: "brand" | "warning" | "success" | "danger" | "info" | "neutral" };
  };
  time: string;
  text: string;
  images: { src: string; alt: string }[];
  stats: { likes: number; comments: number; reposts: number; saves: number };
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
  name: "more" | "heart" | "comment" | "repost" | "bookmark" | "share";
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
  }
}

function RankPill({
  label,
  tone,
}: {
  label: string;
  tone: Post["user"]["rank"]["tone"];
}) {
  const toneCls =
    tone === "brand"
      ? "bg-accent-soft border-accent-border text-foreground-strong"
      : tone === "warning"
        ? "bg-warning-soft border-warning-soft-border text-foreground-strong"
        : tone === "success"
          ? "bg-success-soft border-success-soft-border text-foreground-strong"
          : tone === "danger"
            ? "bg-danger-soft border-danger-soft-border text-foreground-strong"
            : tone === "info"
              ? "bg-info-soft border-info-soft-border text-foreground-strong"
              : "bg-surface-soft border-border-subtle text-foreground-strong";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1",
        "text-[11px] font-semibold shadow-[var(--shadow-xs)]",
        toneCls,
      )}
    >
      {label}
    </span>
  );
}

export default function AnimePostCardSimple() {
  const post: Post = {
    id: "p_01",
    user: {
      name: "Yumi Kisaragi",
      handle: "@kisaragi.yumi",
      avatar:
        "https://images.unsplash.com/photo-1742299899537-c765ac3fda5c?auto=format&fit=crop&fm=jpg&q=80&w=600",
      rank: { label: "S-Rank Creator", tone: "brand" },
    },
    time: "Today • 9:14 PM",
    text:
      "Panel tip: use one wide ‘anchor’ frame for geography, then cut to hands/eyes/impact frames for speed. Keep faces clean and let SFX carry motion.\n\nWhat’s your favorite action page?",
    images: [
      {
        src: "https://images.unsplash.com/photo-1762446263896-ac93605b47d8?auto=format&fit=crop&fm=jpg&q=80&w=2400",
        alt: "Manga pages spread open",
      },
      {
        src: "https://images.unsplash.com/photo-1750365866655-e712abd3ad46?auto=format&fit=crop&fm=jpg&q=80&w=2400",
        alt: "Neon street in Tokyo at night",
      },
      {
        src: "https://images.unsplash.com/photo-1760954076011-d7ba1f26b71c?auto=format&fit=crop&fm=jpg&q=80&w=2400",
        alt: "Torii gate at a shrine at night",
      },
    ],
    stats: { likes: 18320, comments: 286, reposts: 412, saves: 2210 },
  };

  const [liked, setLiked] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [reposted, setReposted] = React.useState(false);

  return (
    <article
      className={cn(
        "group relative w-full overflow-hidden rounded-2xl",
        "border border-card-border bg-card",
        "shadow-[var(--shadow-glass)]",
        "transition duration-200 ease-out",
        "hover:-translate-y-0.5 hover:shadow-[var(--shadow-glass-strong)]",
      )}
    >
      {/* glow / border sheen */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <div className="absolute -inset-20 blur-3xl opacity-35 bg-[var(--gradient-brand-soft)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,color-mix(in_srgb,var(--brand-400)_35%,transparent),transparent_55%)]" />
      </div>

      {/* HEADER */}
      <header className="relative flex items-start justify-between gap-3 p-4">
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
              <RankPill label={post.user.rank.label} tone={post.user.rank.tone} />
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
              <p className="truncate text-xs text-foreground-muted">{post.user.handle}</p>
              <span className="text-xs text-foreground-soft">•</span>
              <p className="text-xs text-foreground-muted">{post.time}</p>
            </div>
          </div>
        </div>

        <IconButton
          aria-label="Post options"
          variant="plain"
          tone="neutral"
          size="md"
          tooltip="Options"
        >
          <Icon name="more" />
        </IconButton>
      </header>

      {/* TEXT */}
      <section className="relative px-4 pb-3">
        <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
          {post.text}
        </p>
      </section>

      {/* IMAGES */}
      <section className="relative px-4 pb-4">
        <div className="grid grid-cols-3 gap-2">
          {post.images.map((img, idx) => (
            <div
              key={img.src}
              className={cn(
                "relative overflow-hidden rounded-xl",
                "border border-border-subtle bg-surface",
                "shadow-[var(--shadow-sm)]",
                "transition duration-300 ease-out",
                "hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]",
              )}
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 768px) 33vw, 220px"
                  className={cn(
                    "object-cover",
                    "transition duration-500 ease-out",
                    "hover:scale-[1.04]",
                    "motion-reduce:transition-none motion-reduce:transform-none",
                  )}
                  priority={idx === 0}
                />
              </div>

              {/* tiny highlight */}
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 hover:opacity-100">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_55%)]" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ACTIONS */}
      <section className="relative flex items-center justify-between gap-2 border-t border-divider px-4 py-3">
        <div className="flex items-center gap-1.5">
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
            {compact(post.stats.likes + (liked ? 1 : 0))}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
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

        <div className="flex items-center gap-1.5">
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
            {compact(post.stats.reposts + (reposted ? 1 : 0))}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
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
            {compact(post.stats.saves + (saved ? 1 : 0))}
          </span>
        </div>

        <IconButton aria-label="Share" variant="soft" tone="neutral" size="sm" tooltip="Share">
          <Icon name="share" />
        </IconButton>
      </section>

      {/* micro CSS (pulse + pressed) */}
      <style jsx>{`
        @media (prefers-reduced-motion: no-preference) {
          article:active {
            transform: translateY(-1px) scale(0.998);
          }
        }
      `}</style>
    </article>
  );
}
