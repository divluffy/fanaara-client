"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/utils/cn";
import { Avatar } from "@/design/Avatar";
import { IconButton } from "@/design/IconButton";
import Modal from "@/components/Modal";
import OptionsSheet, { type OptionsTarget, type ActionId } from "@/components/OptionsSheet";

/** =========================================================
 * Types
 * ======================================================= */

type Tone = "brand" | "warning" | "success" | "danger" | "info" | "neutral";

export type PostMedia = { src: string; alt: string };

export type PostUser = {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  rank?: { label: string; tone: Tone };
};

export type PostStats = {
  likes: number;
  comments: number;
  saves: number;
  popularity: number; // "إرسال / شعبية" -> هنا نخليها popularity
  shares: number; // زر مشاركة مستقل آخر البوست
};

export type PostModel = {
  id: string;
  user: PostUser;
  time: string;

  title?: string;
  text: string;

  media?: PostMedia[];

  stats: PostStats;

  viewerState?: {
    liked?: boolean;
    saved?: boolean;
    followed?: boolean;
  };

  url?: string; // للنسخ والمشاركة
};

/** =========================================================
 * Small utilities (inside same file ✅)
 * ======================================================= */

function compact(n: number) {
  try {
    return new Intl.NumberFormat(undefined, { notation: "compact" }).format(n);
  } catch {
    return String(n);
  }
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function useMediaQuery(query: string) {
  const [ok, setOk] = React.useState(false);

  React.useEffect(() => {
    const m = window.matchMedia(query);
    const on = () => setOk(m.matches);
    on();
    m.addEventListener?.("change", on);
    return () => m.removeEventListener?.("change", on);
  }, [query]);

  return ok;
}

function useReadMore(params: { maxLines?: number } = {}) {
  const maxLines = params.maxLines ?? 5;
  const ref = React.useRef<HTMLParagraphElement | null>(null);

  const [maxHeightPx, setMaxHeightPx] = React.useState<number>(0);
  const [canExpand, setCanExpand] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false); // once true -> never goes back ✅

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;

    const measure = () => {
      const style = getComputedStyle(el);
      const lh = parseFloat(style.lineHeight || "24");
      const mh = Math.round(lh * maxLines);

      // scrollHeight always reflects full content even with max-height ✅
      const overflow = el.scrollHeight > mh + 2;

      setMaxHeightPx(mh);
      setCanExpand(overflow);
    };

    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };

    measure();

    const ro = new ResizeObserver(schedule);
    ro.observe(el);

    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", schedule);
    };
  }, [maxLines]);

  return {
    ref,
    expanded,
    canExpand: canExpand && !expanded,
    maxHeightPx,
    expand: () => setExpanded(true),
  };
}

function extractHashtags(text: string) {
  // Supports Arabic/English letters + numbers + underscore
  const re = /#([\p{L}\p{N}_]+)/gu;
  const out: { tag: string; start: number; end: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const tag = m[1];
    out.push({ tag, start: m.index, end: m.index + m[0].length });
  }
  return out;
}

function renderTextWithHashtags(text: string) {
  const tags = extractHashtags(text);
  if (!tags.length) return text;

  const nodes: React.ReactNode[] = [];
  let last = 0;

  for (const t of tags) {
    if (t.start > last) nodes.push(text.slice(last, t.start));

    const raw = text.slice(t.start, t.end); // includes '#'
    const href = `/hashtag/${encodeURIComponent(t.tag)}`;

    nodes.push(
      <Link
        key={`${t.start}-${t.tag}`}
        href={href}
        className={cn(
          "font-semibold text-foreground-strong",
          "underline underline-offset-2 decoration-border-strong/40",
          "hover:decoration-foreground-strong hover:text-foreground-strong",
          "transition",
        )}
      >
        {raw}
      </Link>,
    );

    last = t.end;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

/** =========================================================
 * Icons (light + consistent)
 * ======================================================= */

function Icon({
  name,
  className,
}: {
  name:
    | "more"
    | "heart"
    | "comment"
    | "bookmark"
    | "share"
    | "send"
    | "spark"
    | "arrowLeft"
    | "arrowRight"
    | "plus"
    | "check";
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
    case "send":
      return (
        <svg {...common}>
          <path d="M22 2L11 13" />
          <path d="M22 2l-7 20-4-9-9-4 20-7z" />
        </svg>
      );
    case "spark":
      return (
        <svg {...common}>
          <path d="M12 2l1.3 4.2L17 7l-3.7 1.1L12 12l-1.3-3.9L7 7l3.7-.8L12 2z" />
          <path d="M5 12l.8 2.6L8 15l-2.2.6L5 18l-.8-2.4L2 15l2.2-.4L5 12z" />
          <path d="M19 12l.8 2.6L22 15l-2.2.6L19 18l-.8-2.4L16 15l2.2-.4L19 12z" />
        </svg>
      );
    case "arrowLeft":
      return (
        <svg {...common}>
          <path d="M15 18l-6-6 6-6" />
        </svg>
      );
    case "arrowRight":
      return (
        <svg {...common}>
          <path d="M9 18l6-6-6-6" />
        </svg>
      );
    case "plus":
      return (
        <svg {...common}>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="M20 6L9 17l-5-5" />
        </svg>
      );
  }
}

/** =========================================================
 * UI atoms
 * ======================================================= */

function RankPill({ label, tone }: { label: string; tone: Tone }) {
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

function SoftButton({
  icon,
  children,
  onClick,
  className,
}: {
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group inline-flex items-center justify-center gap-2",
        "rounded-full border border-border-subtle",
        "bg-surface-soft/70 hover:bg-surface-soft",
        "px-4 py-2 text-sm font-semibold text-foreground-strong",
        "shadow-[var(--shadow-xs)]",
        "transition duration-200 ease-out",
        "active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
        className,
      )}
    >
      {icon ? (
        <span className="text-[18px] transition-transform duration-200 group-hover:scale-[1.06]">
          {icon}
        </span>
      ) : null}
      {children}
    </button>
  );
}

function Interaction({
  active,
  toneActive,
  label,
  icon,
  count,
  onClick,
}: {
  active?: boolean;
  toneActive?: "brand" | "danger" | "success" | "neutral" | "info" | "warning";
  label: string;
  icon: React.ReactNode;
  count: number;
  onClick?: () => void;
}) {
  const isActive = !!active;
  const tone = isActive ? (toneActive ?? "brand") : "neutral";
  const variant = isActive ? "solid" : "soft";

  return (
    <div className="flex items-center gap-1.5">
      <IconButton
        aria-label={label}
        variant={variant as any}
        tone={tone as any}
        size="sm"
        tooltip={label}
        onClick={onClick}
      >
        {icon}
      </IconButton>

      <span className="text-xs font-semibold text-foreground-muted tabular-nums">
        {compact(count)}
      </span>
    </div>
  );
}

/** =========================================================
 * Comments (reusable ✅)
 * ======================================================= */

export type CommentModel = {
  id: string;
  user: { id: string; name: string; handle: string; avatar: string };
  time: string;
  text: string;
  likes: number;
};

export function Comments({
  variant = "preview",
  comments,
  onOpenAll,
}: {
  variant?: "preview" | "modal";
  comments: CommentModel[];
  onOpenAll?: () => void;
}) {
  const [value, setValue] = React.useState("");

  const shown = variant === "preview" ? comments.slice(0, 2) : comments;

  return (
    <div className={cn("relative", variant === "preview" ? "mt-3" : "mt-0")}>
      <div className="space-y-3">
        {shown.map((c) => (
          <div key={c.id} className="flex items-start gap-3">
            <Avatar
              src={c.user.avatar}
              name={c.user.name}
              size="10"
              className="ring-1 ring-border-subtle/60 ring-offset-2 ring-offset-background-elevated"
            />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p className="truncate text-sm font-semibold text-foreground-strong">
                  {c.user.name}
                </p>
                <p className="truncate text-xs text-foreground-muted">{c.user.handle}</p>
                <span className="text-xs text-foreground-soft">•</span>
                <p className="text-xs text-foreground-muted">{c.time}</p>
              </div>

              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {renderTextWithHashtags(c.text)}
              </p>

              <div className="mt-2 flex items-center gap-2">
                <IconButton
                  aria-label="Like comment"
                  variant="plain"
                  tone="neutral"
                  size="xs"
                  tooltip="إعجاب"
                >
                  <Icon name="heart" />
                </IconButton>
                <span className="text-xs font-semibold text-foreground-muted tabular-nums">
                  {compact(c.likes)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Composer */}
      <div className={cn("mt-4", variant === "preview" ? "hidden sm:block" : "")}>
        <div
          className={cn(
            "flex items-end gap-2 rounded-2xl border border-border-subtle bg-surface-soft/50",
            "px-3 py-2",
          )}
        >
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={1}
            placeholder="اكتب تعليقًا…"
            className={cn(
              "min-h-[40px] flex-1 resize-none bg-transparent",
              "text-sm text-foreground placeholder:text-foreground-muted",
              "focus:outline-none",
            )}
          />
          <IconButton
            aria-label="Send comment"
            variant="solid"
            tone="brand"
            size="sm"
            tooltip="إرسال"
            onClick={() => {
              // UI only (wire API later)
              setValue("");
            }}
          >
            {/* زر الإرسال نفس كومبوننت المشاركة ✅ */}
            <Icon name="send" />
          </IconButton>
        </div>
      </div>

      {variant === "preview" && comments.length > 2 ? (
        <div className="mt-3">
          <button
            type="button"
            onClick={onOpenAll}
            className={cn(
              "text-sm font-semibold text-foreground-strong",
              "hover:underline underline-offset-4",
              "transition",
            )}
          >
            عرض كل التعليقات ({compact(comments.length)})
          </button>
        </div>
      ) : null}
    </div>
  );
}

/** =========================================================
 * Media: Desktop mosaic + Mobile swipe (Threads-like ✅)
 * ======================================================= */

function MediaDesktopMosaic({
  media,
  onOpen,
}: {
  media: PostMedia[];
  onOpen: (index: number) => void;
}) {
  const count = media.length;

  const Tile = ({
    m,
    idx,
    className,
    overlay,
  }: {
    m: PostMedia;
    idx: number;
    className?: string;
    overlay?: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={() => onOpen(idx)}
      className={cn(
        "group relative overflow-hidden rounded-2xl",
        "border border-border-subtle bg-surface shadow-[var(--shadow-sm)]",
        "transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
        className,
      )}
    >
      <div className="relative h-full w-full">
        <Image
          src={m.src}
          alt={m.alt}
          fill
          sizes="(max-width: 1024px) 100vw, 520px"
          className={cn(
            "object-cover",
            "transition duration-500 ease-out",
            "group-hover:scale-[1.03]",
            "motion-reduce:transition-none motion-reduce:transform-none",
          )}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_60%)]" />
      </div>

      {overlay ? (
        <div className="absolute inset-0 grid place-items-center bg-black/35">
          {overlay}
        </div>
      ) : null}
    </button>
  );

  if (count === 1) {
    const m = media[0]!;
    return (
      <div className="relative">
        <div className="aspect-[16/10] w-full">
          <Tile m={m} idx={0} className="h-full w-full" />
        </div>
      </div>
    );
  }

  if (count === 2) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {media.slice(0, 2).map((m, idx) => (
          <div key={m.src} className="aspect-[4/3]">
            <Tile m={m} idx={idx} className="h-full w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (count === 3) {
    return (
      <div className="grid grid-cols-2 grid-rows-2 gap-2">
        <div className="row-span-2 aspect-[4/5]">
          <Tile m={media[0]!} idx={0} className="h-full w-full" />
        </div>
        <div className="aspect-[4/3]">
          <Tile m={media[1]!} idx={1} className="h-full w-full" />
        </div>
        <div className="aspect-[4/3]">
          <Tile m={media[2]!} idx={2} className="h-full w-full" />
        </div>
      </div>
    );
  }

  // 4+
  const shown = media.slice(0, 4);
  const extra = count - 4;

  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-2">
      {shown.map((m, idx) => {
        const isLast = idx === 3 && extra > 0;
        return (
          <div key={m.src} className="aspect-[4/3]">
            <Tile
              m={m}
              idx={idx}
              className="h-full w-full"
              overlay={
                isLast ? (
                  <div className="text-center">
                    <div className="text-2xl font-extrabold text-white">
                      +{extra}
                    </div>
                    <div className="mt-1 text-xs font-semibold text-white/90">
                      صور إضافية
                    </div>
                  </div>
                ) : null
              }
            />
          </div>
        );
      })}
    </div>
  );
}

function MediaMobileSwipe({
  media,
  onOpen,
}: {
  media: PostMedia[];
  onOpen: (index: number) => void;
}) {
  const railRef = React.useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = React.useState(0);

  const onScroll = React.useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    const w = el.clientWidth || 1;
    const i = Math.round(el.scrollLeft / w);
    setIndex(clamp(i, 0, media.length - 1));
  }, [media.length]);

  return (
    <div className="relative">
      <div
        ref={railRef}
        onScroll={onScroll}
        className={cn(
          "flex w-full gap-2 overflow-x-auto overscroll-x-contain",
          "snap-x snap-mandatory scroll-smooth",
          "[&::-webkit-scrollbar]:hidden",
        )}
        style={{ scrollbarWidth: "none" }}
      >
        {media.map((m, i) => (
          <button
            key={m.src}
            type="button"
            onClick={() => onOpen(i)}
            className={cn(
              "relative shrink-0 w-full",
              "snap-center",
              "overflow-hidden rounded-2xl",
              "border border-border-subtle bg-surface shadow-[var(--shadow-sm)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
            )}
          >
            <div className="relative aspect-[16/12]">
              <Image
                src={m.src}
                alt={m.alt}
                fill
                sizes="100vw"
                className="object-cover"
                priority={i === 0}
              />
            </div>

            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/35 to-transparent" />
            </div>

            <div className="absolute bottom-2 left-2 rounded-full bg-black/45 px-2 py-1 text-xs font-semibold text-white">
              {i + 1}/{media.length}
            </div>
          </button>
        ))}
      </div>

      {/* dots */}
      {media.length > 1 ? (
        <div className="mt-2 flex items-center justify-center gap-1.5">
          {media.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-200",
                i === index ? "w-6 bg-foreground-strong/70" : "w-1.5 bg-border-strong/40",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** =========================================================
 * Modals: Gallery / Share / Save-Collections / Comments
 * ======================================================= */

function GalleryModal({
  open,
  onOpenChange,
  media,
  startIndex,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  media: PostMedia[];
  startIndex: number;
}) {
  const railRef = React.useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = React.useState(startIndex);

  React.useEffect(() => {
    if (!open) return;
    setIndex(startIndex);
  }, [open, startIndex]);

  const scrollToIndex = React.useCallback((i: number) => {
    const el = railRef.current;
    if (!el) return;
    const w = el.clientWidth || 1;
    el.scrollTo({ left: i * w, behavior: "smooth" });
  }, []);

  React.useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => scrollToIndex(startIndex));
  }, [open, startIndex, scrollToIndex]);

  const onScroll = React.useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    const w = el.clientWidth || 1;
    const i = Math.round(el.scrollLeft / w);
    setIndex(clamp(i, 0, media.length - 1));
  }, [media.length]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        const next = clamp(index - 1, 0, media.length - 1);
        setIndex(next);
        scrollToIndex(next);
      }
      if (e.key === "ArrowRight") {
        const next = clamp(index + 1, 0, media.length - 1);
        setIndex(next);
        scrollToIndex(next);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, index, media.length, scrollToIndex]);

  const canPrev = index > 0;
  const canNext = index < media.length - 1;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      mode={{ desktop: "center", mobile: "sheet" }}
      maxWidthClass="max-w-4xl"
      title="الصور"
      subtitle={`${index + 1} / ${media.length}`}
      contentPadding="none"
      closeOnBackdrop
      closeOnEsc
      trapFocus
      panelClassName="bg-background-elevated"
    >
      <div className="relative">
        {/* rail */}
        <div
          ref={railRef}
          onScroll={onScroll}
          className={cn(
            "flex w-full overflow-x-auto snap-x snap-mandatory scroll-smooth",
            "[&::-webkit-scrollbar]:hidden",
          )}
          style={{ scrollbarWidth: "none" }}
        >
          {media.map((m) => (
            <div
              key={m.src}
              className="relative w-full shrink-0 snap-center"
            >
              <div className="relative aspect-[16/10] sm:aspect-[16/9] bg-black/10">
                <Image
                  src={m.src}
                  alt={m.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 900px"
                  className="object-contain"
                />
              </div>
            </div>
          ))}
        </div>

        {/* arrows (desktop-friendly) */}
        <div className="pointer-events-none absolute inset-0 hidden sm:flex items-center justify-between px-3">
          <div className="pointer-events-auto">
            <IconButton
              aria-label="Previous"
              variant="inverse"
              tone="neutral"
              size="md"
              tooltip="السابق"
              disabled={!canPrev}
              onClick={() => {
                const next = clamp(index - 1, 0, media.length - 1);
                setIndex(next);
                scrollToIndex(next);
              }}
            >
              <Icon name="arrowLeft" />
            </IconButton>
          </div>

          <div className="pointer-events-auto">
            <IconButton
              aria-label="Next"
              variant="inverse"
              tone="neutral"
              size="md"
              tooltip="التالي"
              disabled={!canNext}
              onClick={() => {
                const next = clamp(index + 1, 0, media.length - 1);
                setIndex(next);
                scrollToIndex(next);
              }}
            >
              <Icon name="arrowRight" />
            </IconButton>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function ShareModal({
  open,
  onOpenChange,
  url,
  title,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  url?: string;
  title?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    try {
      const text = url ?? "";
      if (!text) return;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 900);
    } catch {}
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      mode={{ desktop: "center", mobile: "sheet" }}
      maxWidthClass="max-w-md"
      title="مشاركة"
      subtitle={title ? `شارك: ${title}` : "شارك هذا المحتوى"}
      closeOnBackdrop
      closeOnEsc
      trapFocus
    >
      <div className="space-y-3">
        <div className="rounded-2xl border border-border-subtle bg-surface-soft/60 p-3">
          <div className="text-xs font-semibold text-foreground-muted">الرابط</div>
          <div className="mt-1 break-all text-sm text-foreground">
            {url ?? "—"}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <SoftButton
              icon={<Icon name={copied ? "check" : "share"} />}
              onClick={copy}
              className="flex-1"
            >
              {copied ? "تم النسخ" : "نسخ الرابط"}
            </SoftButton>

            <SoftButton
              icon={<Icon name="send" />}
              onClick={() => {
                // UI-only: Wire to DM share later
                onOpenChange(false);
              }}
              className="flex-1"
            >
              إرسال برسالة
            </SoftButton>
          </div>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-surface-soft/40 p-3">
          <div className="text-sm font-semibold text-foreground-strong">خيارات سريعة</div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <SoftButton onClick={() => onOpenChange(false)} icon={<Icon name="spark" />}>
              Boost
            </SoftButton>
            <SoftButton onClick={() => onOpenChange(false)} icon={<Icon name="share" />}>
              مشاركة خارجية
            </SoftButton>
          </div>
          <p className="mt-2 text-xs text-foreground-muted">
            (اربطها لاحقًا مع Web Share API / DMs)
          </p>
        </div>
      </div>
    </Modal>
  );
}

type Collection = { id: string; name: string; cover?: string; saved: boolean };

function SaveToCollectionsModal({
  open,
  onOpenChange,
  initial,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Collection[];
}) {
  const [collections, setCollections] = React.useState<Collection[]>(
    initial ?? [
      { id: "c1", name: "Anime Inspiration", saved: true },
      { id: "c2", name: "Manga Panels", saved: false },
      { id: "c3", name: "Cosplay Ideas", saved: false },
    ],
  );

  const [newName, setNewName] = React.useState("");

  const toggle = (id: string) => {
    setCollections((xs) => xs.map((x) => (x.id === id ? { ...x, saved: !x.saved } : x)));
  };

  const create = () => {
    const n = newName.trim();
    if (!n) return;
    setCollections((xs) => [{ id: `c_${Date.now()}`, name: n, saved: true }, ...xs]);
    setNewName("");
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      mode={{ desktop: "center", mobile: "sheet" }}
      maxWidthClass="max-w-md"
      title="حفظ"
      subtitle="احفظ داخل مجموعة مثل Instagram / TikTok ✅"
      closeOnBackdrop
      closeOnEsc
      trapFocus
    >
      <div className="space-y-4">
        {/* create */}
        <div className="rounded-2xl border border-border-subtle bg-surface-soft/50 p-3">
          <div className="text-sm font-semibold text-foreground-strong">إنشاء مجموعة</div>
          <div className="mt-2 flex gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="اسم المجموعة…"
              className={cn(
                "h-10 flex-1 rounded-xl border border-border-subtle bg-background-elevated px-3",
                "text-sm text-foreground placeholder:text-foreground-muted",
                "focus:outline-none focus:ring-2 focus:ring-accent/40",
              )}
            />
            <IconButton
              aria-label="Create collection"
              variant="solid"
              tone="brand"
              size="md"
              tooltip="إنشاء"
              onClick={create}
            >
              <Icon name="plus" />
            </IconButton>
          </div>
        </div>

        {/* list */}
        <div className="rounded-2xl border border-border-subtle bg-surface-soft/40 p-2">
          <ul className="divide-y divide-border-subtle/70">
            {collections.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => toggle(c.id)}
                  className={cn(
                    "w-full flex items-center justify-between gap-3",
                    "px-3 py-3 rounded-xl",
                    "hover:bg-surface-soft/70 active:bg-surface-soft/90",
                    "transition",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                  )}
                >
                  <div className="min-w-0 text-left">
                    <div className="truncate text-sm font-semibold text-foreground-strong">
                      {c.name}
                    </div>
                    <div className="text-xs text-foreground-muted">
                      {c.saved ? "محفوظ هنا" : "غير محفوظ"}
                    </div>
                  </div>

                  <div className="shrink-0">
                    <IconButton
                      aria-label={c.saved ? "Saved" : "Save"}
                      variant={c.saved ? "solid" : "soft"}
                      tone={c.saved ? "brand" : "neutral"}
                      size="sm"
                      tooltip={c.saved ? "محفوظ" : "حفظ"}
                    >
                      <Icon name="bookmark" />
                    </IconButton>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <SoftButton
          icon={<Icon name="check" />}
          onClick={() => onOpenChange(false)}
          className="w-full justify-center"
        >
          تم
        </SoftButton>
      </div>
    </Modal>
  );
}

/** =========================================================
 * Main Post component (v2 ✅)
 * ======================================================= */

export default function PostV2({
  post,
  viewerId,
  className,
}: {
  post: PostModel;
  viewerId: string;
  className?: string;
}) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  // viewer state
  const [liked, setLiked] = React.useState(!!post.viewerState?.liked);
  const [saved, setSaved] = React.useState(!!post.viewerState?.saved);
  const [followed, setFollowed] = React.useState(!!post.viewerState?.followed);

  // modals
  const [optionsOpen, setOptionsOpen] = React.useState(false);
  const [commentsOpen, setCommentsOpen] = React.useState(false);
  const [shareOpen, setShareOpen] = React.useState(false);
  const [saveOpen, setSaveOpen] = React.useState(false);
  const [galleryOpen, setGalleryOpen] = React.useState(false);
  const [galleryIndex, setGalleryIndex] = React.useState(0);

  // read more (one-way)
  const rm = useReadMore({ maxLines: 5 });

  // demo comments (wire API later)
  const demoComments: CommentModel[] = React.useMemo(
    () => [
      {
        id: "cm1",
        user: {
          id: "u2",
          name: "Hana",
          handle: "@hana",
          avatar: post.user.avatar,
        },
        time: "قبل 4س",
        text: "🔥 هذا الكلام ذهب! #manga #panels",
        likes: 128,
      },
      {
        id: "cm2",
        user: {
          id: "u3",
          name: "Riku",
          handle: "@riku",
          avatar: post.user.avatar,
        },
        time: "قبل 1س",
        text: "أحب أسلوب الـ speed lines 😮‍💨",
        likes: 54,
      },
      {
        id: "cm3",
        user: {
          id: "u4",
          name: "Mika",
          handle: "@mika",
          avatar: post.user.avatar,
        },
        time: "قبل 20د",
        text: "ممكن تعمل breakdown لصفحة كاملة؟ #art",
        likes: 22,
      },
    ],
    [post.user.avatar],
  );

  const stats = {
    likes: post.stats.likes + (liked ? 1 : 0),
    comments: post.stats.comments,
    saves: post.stats.saves + (saved ? 1 : 0),
    popularity: post.stats.popularity,
    shares: post.stats.shares,
  };

  const optionsTarget: OptionsTarget = {
    kind: "post",
    id: post.id,
    postId: post.id,
    url: post.url,
    title: post.title,
    text: post.text,
    ownerId: post.user.id,
    saved,
    context: "feed",
    tags: extractHashtags(post.text).map((x) => x.tag),
  };

  const media = post.media ?? [];

  const openGallery = (i: number) => {
    setGalleryIndex(i);
    setGalleryOpen(true);
  };

  return (
    <>
      <article
        className={cn(
          "group relative w-full overflow-hidden",
          "rounded-xl sm:rounded-2xl",
          "border border-card-border bg-card",
          "shadow-[var(--shadow-glass)]",
          "transition duration-200 ease-out",
          "hover:-translate-y-0.5 hover:shadow-[var(--shadow-glass-strong)]",
          className,
        )}
      >
        {/* subtle glow */}
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="absolute -inset-20 blur-3xl opacity-30 bg-[var(--gradient-brand-soft)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_10%,color-mix(in_srgb,var(--brand-400)_25%,transparent),transparent_55%)]" />
        </div>

        {/* Header */}
        <header className="relative flex items-start justify-between gap-3 p-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="relative">
              <Avatar
                src={post.user.avatar}
                name={post.user.name}
                size="12"
                path={`/u/${encodeURIComponent(post.user.handle.replace("@", ""))}`}
                className="ring-2 ring-[var(--ring-brand)] ring-offset-2 ring-offset-background-elevated"
              />

              {/* Follow on avatar ✅ */}
              <div className="absolute -bottom-1 -right-1">
                <IconButton
                  aria-label={followed ? "Unfollow" : "Follow"}
                  variant={followed ? "solid" : "solid"}
                  tone={followed ? "neutral" : "brand"}
                  size="xs"
                  tooltip={followed ? "متابع" : "متابعة"}
                  onClick={() => setFollowed((v) => !v)}
                  className={cn(
                    "ring-2 ring-background-elevated",
                    "shadow-[var(--shadow-sm)]",
                  )}
                >
                  {followed ? <Icon name="check" /> : <Icon name="plus" />}
                </IconButton>
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-semibold text-foreground-strong">
                  {post.user.name}
                </p>
                {post.user.rank ? (
                  <RankPill label={post.user.rank.label} tone={post.user.rank.tone} />
                ) : null}
              </div>

              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                <p className="truncate text-xs text-foreground-muted">{post.user.handle}</p>
                <span className="text-xs text-foreground-soft">•</span>
                <p className="text-xs text-foreground-muted">{post.time}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <IconButton
              aria-label="Post options"
              variant="plain"
              tone="neutral"
              size="md"
              tooltip="Options"
              onClick={() => setOptionsOpen(true)}
            >
              <Icon name="more" />
            </IconButton>
          </div>
        </header>

        {/* Content */}
        <section className="relative px-4 pb-3">
          {post.title ? (
            <h3 className="text-base font-extrabold tracking-tight text-foreground-strong">
              {post.title}
            </h3>
          ) : null}

          <div className={cn(post.title ? "mt-2" : "")}>
            <p
              ref={rm.ref}
              className={cn(
                "whitespace-pre-wrap text-sm leading-6 text-foreground",
                "transition-[max-height] duration-300 ease-out",
              )}
              style={
                rm.expanded
                  ? undefined
                  : { maxHeight: `${rm.maxHeightPx}px`, overflow: "hidden" }
              }
            >
              {renderTextWithHashtags(post.text)}
            </p>

            {/* fade hint when clamped */}
            {!rm.expanded && rm.canExpand ? (
              <div className="pointer-events-none relative -mt-10 h-10 bg-gradient-to-t from-card to-transparent" />
            ) : null}

            {rm.canExpand ? (
              <button
                type="button"
                onClick={rm.expand}
                className={cn(
                  "mt-2 inline-flex items-center gap-2",
                  "text-sm font-extrabold text-foreground-strong",
                  "hover:underline underline-offset-4",
                  "transition",
                )}
              >
                قراءة المزيد ✨
              </button>
            ) : null}
          </div>
        </section>

        {/* Media */}
        {media.length ? (
          <section className="relative px-4 pb-4">
            {/* Desktop: mosaic / Mobile: swipe */}
            <div className="hidden md:block">
              <MediaDesktopMosaic media={media} onOpen={openGallery} />
            </div>
            <div className="md:hidden">
              <MediaMobileSwipe media={media} onOpen={openGallery} />
            </div>
          </section>
        ) : null}

        {/* Comments preview inside Post (reusable ✅) */}
        <section className="relative px-4 pb-4">
          <Comments
            variant="preview"
            comments={demoComments}
            onOpenAll={() => setCommentsOpen(true)}
          />
        </section>

        {/* Interactions */}
        <section className="relative border-t border-divider px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <Interaction
              label={liked ? "Liked" : "Like"}
              active={liked}
              toneActive="danger"
              icon={<Icon name="heart" />}
              count={stats.likes}
              onClick={() => setLiked((v) => !v)}
            />

            <Interaction
              label="Comment"
              icon={<Icon name="comment" />}
              count={stats.comments}
              onClick={() => setCommentsOpen(true)}
            />

            <Interaction
              label={saved ? "Saved" : "Save"}
              active={saved}
              toneActive="brand"
              icon={<Icon name="bookmark" />}
              count={stats.saves}
              onClick={() => {
                const next = !saved;
                setSaved(next);
                if (next) setSaveOpen(true); // فتح مودل الحفظ ✅
              }}
            />

            <Interaction
              label="Popularity"
              icon={<Icon name="spark" />}
              count={stats.popularity}
              onClick={() => {
                // UI-only: wire later (boost / promote)
              }}
            />

            {/* Send button = same component style as share ✅ */}
            <span className="hidden sm:inline-flex">
              <IconButton
                aria-label="Send"
                variant="soft"
                tone="neutral"
                size="sm"
                tooltip="إرسال"
                onClick={() => setShareOpen(true)}
              >
                <Icon name="send" />
              </IconButton>
            </span>
          </div>

          {/* Share section (independent, end of post ✅) */}
          <div className="mt-3">
            <SoftButton
              icon={<Icon name="share" />}
              onClick={() => setShareOpen(true)}
              className={cn(
                "w-full justify-center",
                "bg-[linear-gradient(135deg,color-mix(in_srgb,var(--brand-500)_14%,transparent),transparent)]",
              )}
            >
              مشاركة البوست
              <span className="ml-2 text-xs font-semibold text-foreground-muted tabular-nums">
                ({compact(stats.shares)})
              </span>
            </SoftButton>
          </div>
        </section>

        {/* micro press */}
        <style jsx>{`
          @media (prefers-reduced-motion: no-preference) {
            article:active {
              transform: translateY(-1px) scale(0.998);
            }
          }
        `}</style>
      </article>



      {/* Comments Modal */}
      <Modal
        open={commentsOpen}
        onOpenChange={setCommentsOpen}
        mode={{ desktop: "center", mobile: "sheet" }}
        maxWidthClass="max-w-2xl"
        title="التعليقات"
        subtitle={`على ${post.user.name}`}
        closeOnBackdrop
        closeOnEsc
        trapFocus
      >
        <Comments variant="modal" comments={demoComments} />
      </Modal>

      {/* Gallery Modal */}
      {media.length ? (
        <GalleryModal
          open={galleryOpen}
          onOpenChange={setGalleryOpen}
          media={media}
          startIndex={galleryIndex}
        />
      ) : null}

      {/* Share Modal */}
      <ShareModal
        open={shareOpen}
        onOpenChange={setShareOpen}
        url={post.url}
        title={post.title}
      />

      {/* Save/Collections Modal */}
      <SaveToCollectionsModal open={saveOpen} onOpenChange={setSaveOpen} />
    </>
  );
}

