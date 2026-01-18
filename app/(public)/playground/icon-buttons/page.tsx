"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiBell,
  FiHeart,
  FiMail,
  FiMessageCircle,
  FiMoreHorizontal,
  FiPlus,
  FiSettings,
  FiShare2,
  FiThumbsDown,
  FiThumbsUp,
  FiPlay,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import {
  IconButton,
  type IconButtonShape,
  type IconButtonSize,
} from "@/design/icon-button";
import type {
  ButtonElevation,
  ButtonGradient,
  ButtonTone,
  ButtonVariant,
} from "@/design";

/** ===== Constants (no need for useMemo) ===== */
const VARIANTS = [
  "solid",
  "soft",
  "outline",
  "ghost",
  "glass",
  "gradient",
] as const satisfies readonly ButtonVariant[];
const VARIANTS_NO_GRADIENT = [
  "solid",
  "soft",
  "outline",
  "ghost",
  "glass",
] as const satisfies readonly ButtonVariant[];
const TONES = [
  "brand",
  "neutral",
  "success",
  "danger",
  "warning",
  "info",
] as const satisfies readonly ButtonTone[];
const SIZES = [
  "xs",
  "sm",
  "md",
  "lg",
] as const satisfies readonly IconButtonSize[];
const SHAPES = [
  "circle",
  "rounded",
  "square",
] as const satisfies readonly IconButtonShape[];
const ELEVATIONS = [
  "none",
  "soft",
  "medium",
  "strong",
  "glow",
  "cta",
] as const satisfies readonly ButtonElevation[];
const GRADIENTS = [
  "sunset",
  "aurora",
  "ocean",
  "violet",
] as const satisfies readonly ButtonGradient[];

type IconDef = {
  key: string;
  Icon: IconType;
  label: string;
  jsx: string;
};

const ICONS: readonly IconDef[] = [
  { key: "heart", Icon: FiHeart, label: "إعجاب", jsx: "<FiHeart />" },
  {
    key: "comment",
    Icon: FiMessageCircle,
    label: "تعليقات",
    jsx: "<FiMessageCircle />",
  },
  { key: "bell", Icon: FiBell, label: "إشعارات", jsx: "<FiBell />" },
  { key: "mail", Icon: FiMail, label: "رسائل", jsx: "<FiMail />" },
  {
    key: "more",
    Icon: FiMoreHorizontal,
    label: "المزيد",
    jsx: "<FiMoreHorizontal />",
  },
  { key: "plus", Icon: FiPlus, label: "إضافة", jsx: "<FiPlus />" },
  {
    key: "settings",
    Icon: FiSettings,
    label: "إعدادات",
    jsx: "<FiSettings />",
  },
] as const;

type IconKey = (typeof ICONS)[number]["key"];

const ICON_BY_KEY = ICONS.reduce((acc, item) => {
  acc[item.key] = item;
  return acc;
}, {} as Record<IconKey, (typeof ICONS)[number]>);

/** ===== Small UI Helpers ===== */
function SectionCard({
  title,
  subtitle,
  children,
  bodyClassName = "flex flex-wrap items-center gap-3",
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  bodyClassName?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.25 }}
      className="space-y-3 rounded-3xl border border-border-subtle bg-surface p-5 shadow-[var(--shadow-sm)]"
    >
      <div>
        <h2 className="text-sm font-semibold text-foreground-strong">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-xs text-foreground-muted">{subtitle}</p>
        )}
      </div>
      <div className={bodyClassName}>{children}</div>
    </motion.section>
  );
}

function Select<T extends string>({
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: readonly T[];
  disabled?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-foreground-muted">
      <span className="min-w-16">{label}</span>
      <select
        disabled={disabled}
        className="h-9 rounded-xl border border-border-subtle bg-background px-3 text-sm text-foreground outline-none disabled:opacity-60"
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {options.map((opt) => (
          <option value={opt} key={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}

async function copyToClipboard(text: string): Promise<boolean> {
  // Primary (modern)
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback (legacy)
    try {
      const el = document.createElement("textarea");
      el.value = text;
      el.style.position = "fixed";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.focus();
      el.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(el);
      return ok;
    } catch {
      return false;
    }
  }
}

function Toast({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.98 }}
      transition={{ duration: 0.18 }}
      className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-background-elevated/95 px-4 py-2 text-xs text-foreground shadow-[var(--shadow-md)] border border-border-subtle"
    >
      {text}
    </motion.div>
  );
}

function CopyItem({
  code,
  onCopied,
  children,
}: {
  code: string;
  onCopied: (ok: boolean) => void;
  children: ReactNode;
}) {
  const doCopy = useCallback(async () => {
    onCopied(await copyToClipboard(code));
  }, [code, onCopied]);

  return (
    <span
      role="button"
      tabIndex={0}
      aria-label="Copy JSX"
      title="Click to copy JSX"
      className="inline-flex"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void doCopy();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          void doCopy();
        }
      }}
    >
      {children}
    </span>
  );
}

/** ===== Social Demo (interactive) ===== */
function clampNonNegative(n: number) {
  return n < 0 ? 0 : n;
}

function SocialPostDemo() {
  const [liked, setLiked] = useState(false);
  const [loved, setLoved] = useState(false);
  const [disliked, setDisliked] = useState(false);

  const [counts, setCounts] = useState({
    likes: 24,
    loves: 6,
    comments: 12,
    shares: 3,
    dislikes: 1,
  });

  const toggleLike = () => {
    setCounts((c) => ({
      ...c,
      likes: clampNonNegative(c.likes + (liked ? -1 : 1)),
    }));
    setLiked((v) => !v);
    // optional: avoid like+dislike together (typical social UX)
    if (!liked && disliked) {
      setDisliked(false);
      setCounts((c) => ({ ...c, dislikes: clampNonNegative(c.dislikes - 1) }));
    }
  };

  const toggleLove = () => {
    setCounts((c) => ({
      ...c,
      loves: clampNonNegative(c.loves + (loved ? -1 : 1)),
    }));
    setLoved((v) => !v);
  };

  const toggleDislike = () => {
    setCounts((c) => ({
      ...c,
      dislikes: clampNonNegative(c.dislikes + (disliked ? -1 : 1)),
    }));
    setDisliked((v) => !v);
    if (!disliked && liked) {
      setLiked(false);
      setCounts((c) => ({ ...c, likes: clampNonNegative(c.likes - 1) }));
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Post */}
      <div className="rounded-3xl border border-border-subtle bg-background p-5 shadow-[var(--shadow-sm)]">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-sm font-semibold text-foreground-strong">
              dev.luffy
            </div>
            <div className="text-xs text-foreground-muted">
              New chapter reactions 🔥
            </div>
          </div>
          <IconButton
            aria-label="more"
            variant="ghost"
            tone="neutral"
            tooltip="المزيد"
          >
            <FiMoreHorizontal />
          </IconButton>
        </div>

        <p className="mt-4 text-sm text-foreground">
          What do you think about the last panel? 😭✨
        </p>

        <div className="mt-4 rounded-2xl border border-border-subtle bg-surface p-4 text-xs text-foreground-muted">
          Image / manga panel placeholder
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <IconButton
              aria-label="Like"
              variant="soft"
              tone={liked ? "brand" : "neutral"}
              tooltip="Like"
              onClick={toggleLike}
            >
              <FiThumbsUp />
            </IconButton>

            <IconButton
              aria-label="Love"
              variant="soft"
              tone={loved ? "danger" : "neutral"}
              tooltip="Love"
              onClick={toggleLove}
            >
              <FiHeart />
            </IconButton>

            <IconButton
              aria-label="Comment"
              variant="soft"
              tone="neutral"
              tooltip="Comment"
              badgeCount={counts.comments}
              badgeTone="info"
            >
              <FiMessageCircle />
            </IconButton>

            <IconButton
              aria-label="Share"
              variant="soft"
              tone="neutral"
              tooltip="Share"
            >
              <FiShare2 />
            </IconButton>

            <IconButton
              aria-label="Dislike"
              variant="soft"
              tone={disliked ? "warning" : "neutral"}
              tooltip="Bad"
              onClick={toggleDislike}
            >
              <FiThumbsDown />
            </IconButton>
          </div>

          <div className="text-xs text-foreground-muted space-y-1">
            <div className="flex items-center gap-2 justify-end">
              <span>👍</span>
              <motion.span
                key={counts.likes}
                initial={{ y: 6, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                {counts.likes}
              </motion.span>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <span>❤️</span>
              <motion.span
                key={counts.loves}
                initial={{ y: 6, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                {counts.loves}
              </motion.span>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <span>👎</span>
              <motion.span
                key={counts.dislikes}
                initial={{ y: 6, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                {counts.dislikes}
              </motion.span>
            </div>
          </div>
        </div>
      </div>

      {/* Video */}
      <div className="relative overflow-hidden rounded-3xl border border-border-subtle shadow-[var(--shadow-sm)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(120,120,255,0.35),transparent_55%),radial-gradient(circle_at_80%_30%,rgba(255,120,200,0.35),transparent_55%),linear-gradient(180deg,rgba(10,10,15,0.9),rgba(10,10,15,0.75))]" />
        <div className="relative p-5">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-semibold text-white">Anime Clip</div>
              <div className="text-xs text-white/70">
                Tap actions on overlay
              </div>
            </div>
            <IconButton
              aria-label="settings"
              variant="glass"
              tone="neutral"
              tooltip="Settings"
            >
              <FiSettings />
            </IconButton>
          </div>

          <div className="mt-6 grid place-items-center rounded-2xl border border-white/10 bg-black/30 p-10">
            <IconButton
              aria-label="play"
              variant="gradient"
              gradient="aurora"
              elevation="cta"
              tooltip="Play"
            >
              <FiPlay />
            </IconButton>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <IconButton
              aria-label="Like overlay"
              variant="glass"
              tone={liked ? "brand" : "neutral"}
              tooltip="Like"
              onClick={toggleLike}
              badgeCount={liked ? 1 : undefined}
              badgeTone="brand"
              badgeAnchor="button"
              badgePlacement="top-right"
            >
              <FiThumbsUp />
            </IconButton>

            <IconButton
              aria-label="Love overlay"
              variant="glass"
              tone={loved ? "danger" : "neutral"}
              tooltip="Love"
              onClick={toggleLove}
              showBadgeDot={loved}
              badgeTone="danger"
            >
              <FiHeart />
            </IconButton>

            <IconButton
              aria-label="Comments overlay"
              variant="glass"
              tone="neutral"
              tooltip="Comments"
              badgeCount={counts.comments}
              badgeTone="info"
            >
              <FiMessageCircle />
            </IconButton>

            <IconButton
              aria-label="Share overlay"
              variant="glass"
              tone="neutral"
              tooltip="Share"
            >
              <FiShare2 />
            </IconButton>

            <IconButton
              aria-label="Bad overlay"
              variant="glass"
              tone={disliked ? "warning" : "neutral"}
              tooltip="Bad"
              onClick={toggleDislike}
            >
              <FiThumbsDown />
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  );
}

/** ===== Main Page ===== */
export default function IconButtonsPlaygroundPage() {
  /** Playground state */
  const [variant, setVariant] = useState<ButtonVariant>("soft");
  const [tone, setTone] = useState<ButtonTone>("neutral");
  const [size, setSize] = useState<IconButtonSize>("md");
  const [shape, setShape] = useState<IconButtonShape>("circle");
  const [elevation, setElevation] = useState<ButtonElevation>("soft");
  const [gradient, setGradient] = useState<ButtonGradient>("sunset");

  const [iconKey, setIconKey] = useState<IconKey>("heart");

  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const [badgeCount, setBadgeCount] = useState<number>(12);
  const [showDot, setShowDot] = useState(false);
  const [badgeTone, setBadgeTone] = useState<ButtonTone>("danger");
  const [tooltip, setTooltip] = useState(true);

  const chosen = ICON_BY_KEY[iconKey];

  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback((ok: boolean) => {
    setToast(ok ? "✅ Copied JSX" : "❌ Copy failed");

    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 1300);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  const playgroundCode = useMemo(() => {
    const attrs: string[] = [];

    attrs.push(`aria-label="${chosen.label}"`);
    attrs.push(`variant="${variant}"`);
    attrs.push(`tone="${tone}"`);
    attrs.push(`size="${size}"`);
    attrs.push(`shape="${shape}"`);
    attrs.push(`elevation="${elevation}"`);

    if (variant === "gradient") attrs.push(`gradient="${gradient}"`);
    if (loading) attrs.push("isLoading");
    if (disabled) attrs.push("disabled");
    if (tooltip) attrs.push(`tooltip="${chosen.label}"`);

    if (showDot) attrs.push(`showBadgeDot badgeTone="${badgeTone}"`);
    if (!showDot && badgeCount > 0)
      attrs.push(`badgeCount={${badgeCount}} badgeTone="${badgeTone}"`);

    return `<IconButton ${attrs.join(" ")}>\n  ${chosen.jsx}\n</IconButton>`;
  }, [
    badgeCount,
    badgeTone,
    chosen,
    disabled,
    elevation,
    gradient,
    loading,
    shape,
    showDot,
    size,
    tone,
    tooltip,
    variant,
  ]);

  const ex = useCallback(
    (code: string, node: ReactNode) => (
      <CopyItem code={code} onCopied={showToast}>
        {node}
      </CopyItem>
    ),
    [showToast]
  );

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      className="min-h-screen bg-background text-foreground p-6"
    >
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-lg font-semibold text-foreground-strong">
            IconButton Playground
          </h1>
          <p className="text-sm text-foreground-muted">
            Click any example to copy JSX مباشرة ✅
          </p>
        </header>

        {/* ===== Builder ===== */}
        <SectionCard
          title="Builder (Any combination)"
          subtitle="جرّب أي حالة ثم انسخ الكود"
          bodyClassName="space-y-4"
        >
          <div className="flex flex-wrap gap-3">
            <Select
              label="variant"
              value={variant}
              onChange={setVariant}
              options={VARIANTS}
            />
            <Select
              label="tone"
              value={tone}
              onChange={setTone}
              options={TONES}
              disabled={variant === "gradient"}
            />
            <Select
              label="size"
              value={size}
              onChange={setSize}
              options={SIZES}
            />
            <Select
              label="shape"
              value={shape}
              onChange={setShape}
              options={SHAPES}
            />
            <Select
              label="elevation"
              value={elevation}
              onChange={setElevation}
              options={ELEVATIONS}
            />
            {variant === "gradient" && (
              <Select
                label="gradient"
                value={gradient}
                onChange={setGradient}
                options={GRADIENTS}
              />
            )}

            <Select
              label="icon"
              value={iconKey}
              onChange={setIconKey}
              options={ICONS.map((i) => i.key) as readonly IconKey[]}
            />

            <label className="flex items-center gap-2 text-xs text-foreground-muted">
              <input
                type="checkbox"
                checked={loading}
                onChange={(e) => setLoading(e.target.checked)}
                className="h-4 w-4"
              />
              loading
            </label>

            <label className="flex items-center gap-2 text-xs text-foreground-muted">
              <input
                type="checkbox"
                checked={disabled}
                onChange={(e) => setDisabled(e.target.checked)}
                className="h-4 w-4"
              />
              disabled
            </label>

            <label className="flex items-center gap-2 text-xs text-foreground-muted">
              <input
                type="checkbox"
                checked={tooltip}
                onChange={(e) => setTooltip(e.target.checked)}
                className="h-4 w-4"
              />
              tooltip
            </label>

            <label className="flex items-center gap-2 text-xs text-foreground-muted">
              <input
                type="checkbox"
                checked={showDot}
                onChange={(e) => setShowDot(e.target.checked)}
                className="h-4 w-4"
              />
              dot
            </label>

            <label className="flex items-center gap-2 text-xs text-foreground-muted">
              <span className="min-w-16">badge</span>
              <input
                type="number"
                className="h-9 w-28 rounded-xl border border-border-subtle bg-background px-3 text-sm text-foreground outline-none"
                value={badgeCount}
                onChange={(e) => setBadgeCount(Number(e.target.value || 0))}
                min={0}
                disabled={showDot}
              />
            </label>

            <Select
              label="badgeTone"
              value={badgeTone}
              onChange={setBadgeTone}
              options={TONES}
            />
          </div>

          <div className="flex items-center gap-4">
            {ex(
              playgroundCode,
              <IconButton
                aria-label={chosen.label}
                variant={variant}
                tone={tone}
                size={size}
                shape={shape}
                elevation={elevation}
                gradient={gradient}
                isLoading={loading}
                disabled={disabled}
                tooltip={tooltip ? chosen.label : undefined}
                badgeCount={showDot ? undefined : badgeCount}
                showBadgeDot={showDot}
                badgeTone={badgeTone}
              >
                <chosen.Icon />
              </IconButton>
            )}

            <div className="text-sm text-foreground-muted">
              <div className="font-medium text-foreground-strong">Preview</div>
              <div>{chosen.label}</div>
            </div>
          </div>

          <pre className="whitespace-pre-wrap rounded-2xl border border-border-subtle bg-background p-4 text-xs text-foreground-muted">
            {playgroundCode}
          </pre>
        </SectionCard>

        {/* ===== Variant x Tone Matrix (all non-gradient cases) ===== */}
        <SectionCard
          title="Variants × Tones"
          subtitle="كل Variant مع كل Tone (بدون gradient)"
          bodyClassName="space-y-4"
        >
          {VARIANTS_NO_GRADIENT.map((v) => (
            <div key={v} className="flex flex-wrap items-center gap-3">
              <div className="w-24 text-xs text-foreground-muted">{v}</div>
              {TONES.map((t) =>
                ex(
                  `<IconButton aria-label="${v}-${t}" variant="${v}" tone="${t}" tooltip="${v} / ${t}"><FiHeart /></IconButton>`,
                  <IconButton
                    aria-label={`${v}-${t}`}
                    variant={v}
                    tone={t}
                    tooltip={`${v} / ${t}`}
                  >
                    <FiHeart />
                  </IconButton>
                )
              )}
            </div>
          ))}
        </SectionCard>

        {/* ===== Gradients (richer) ===== */}
        <SectionCard
          title="All Gradients"
          subtitle='variant="gradient" — lots of real cases'
          bodyClassName="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {GRADIENTS.map((g) => (
            <div
              key={g}
              className="rounded-2xl border border-border-subtle bg-background p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="text-xs font-semibold text-foreground-strong">
                  {g}
                </div>
                <div className="text-[10px] text-foreground-muted">
                  examples
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {ex(
                  `<IconButton aria-label="${g}-basic" variant="gradient" gradient="${g}" tooltip="${g}"><FiPlus /></IconButton>`,
                  <IconButton
                    aria-label={`${g}-basic`}
                    variant="gradient"
                    gradient={g}
                    tooltip={g}
                  >
                    <FiPlus />
                  </IconButton>
                )}

                {ex(
                  `<IconButton aria-label="${g}-cta" variant="gradient" gradient="${g}" elevation="cta" tooltip="${g} CTA"><FiPlus /></IconButton>`,
                  <IconButton
                    aria-label={`${g}-cta`}
                    variant="gradient"
                    gradient={g}
                    elevation="cta"
                    tooltip={`${g} CTA`}
                  >
                    <FiPlus />
                  </IconButton>
                )}

                {ex(
                  `<IconButton aria-label="${g}-badge" variant="gradient" gradient="${g}" badgeCount={12} badgeTone="warning" tooltip="${g} badge"><FiBell /></IconButton>`,
                  <IconButton
                    aria-label={`${g}-badge`}
                    variant="gradient"
                    gradient={g}
                    badgeCount={12}
                    badgeTone="warning"
                    tooltip={`${g} badge`}
                  >
                    <FiBell />
                  </IconButton>
                )}

                {ex(
                  `<IconButton aria-label="${g}-dot" variant="gradient" gradient="${g}" showBadgeDot badgeTone="danger" tooltip="${g} dot"><FiMail /></IconButton>`,
                  <IconButton
                    aria-label={`${g}-dot`}
                    variant="gradient"
                    gradient={g}
                    showBadgeDot
                    badgeTone="danger"
                    tooltip={`${g} dot`}
                  >
                    <FiMail />
                  </IconButton>
                )}

                {ex(
                  `<IconButton aria-label="${g}-square" variant="gradient" gradient="${g}" shape="square" size="sm" tooltip="${g} square"><FiSettings /></IconButton>`,
                  <IconButton
                    aria-label={`${g}-square`}
                    variant="gradient"
                    gradient={g}
                    shape="square"
                    size="sm"
                    tooltip={`${g} square`}
                  >
                    <FiSettings />
                  </IconButton>
                )}
              </div>
            </div>
          ))}
        </SectionCard>

        {/* ===== Sizes × Shapes ===== */}
        <SectionCard
          title="Sizes × Shapes"
          subtitle="كل حجم مع كل شكل (soft / brand)"
          bodyClassName="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          {SIZES.map((s) => (
            <div
              key={s}
              className="rounded-2xl border border-border-subtle bg-background p-4"
            >
              <div className="mb-3 text-xs text-foreground-muted">{s}</div>
              <div className="flex flex-wrap items-center gap-3">
                {SHAPES.map((sh) =>
                  ex(
                    `<IconButton aria-label="${s}-${sh}" size="${s}" shape="${sh}" variant="soft" tone="brand" tooltip="${s}/${sh}"><FiMail /></IconButton>`,
                    <IconButton
                      aria-label={`${s}-${sh}`}
                      size={s}
                      shape={sh}
                      variant="soft"
                      tone="brand"
                      tooltip={`${s}/${sh}`}
                    >
                      <FiMail />
                    </IconButton>
                  )
                )}
              </div>
            </div>
          ))}
        </SectionCard>

        {/* ===== Elevations ===== */}
        <SectionCard
          title="All Elevations"
          subtitle="solid + brand + same icon"
        >
          {ELEVATIONS.map((el) =>
            ex(
              `<IconButton aria-label="${el}" variant="solid" tone="brand" elevation="${el}" tooltip="${el}"><FiPlus /></IconButton>`,
              <IconButton
                aria-label={el}
                variant="solid"
                tone="brand"
                elevation={el}
                tooltip={el}
              >
                <FiPlus />
              </IconButton>
            )
          )}
        </SectionCard>

        {/* ===== Badge placement + anchor ===== */}
        <SectionCard
          title="Badges: placement + anchor + offset"
          subtitle="Useful for notifications, counts, and status dots"
          bodyClassName="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          {(
            [
              "top-right",
              "top-left",
              "bottom-right",
              "bottom-left",
              "left",
              "right",
              "top",
              "bottom",
            ] as const
          ).map((p) =>
            ex(
              `<IconButton aria-label="${p}" variant="soft" tone="neutral" badgeCount={7} badgeTone="danger" badgePlacement="${p}" tooltip="${p}"><FiBell /></IconButton>`,
              <div
                key={p}
                className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-background p-4"
              >
                <IconButton
                  aria-label={p}
                  variant="soft"
                  tone="neutral"
                  badgeCount={7}
                  badgeTone="danger"
                  badgePlacement={p}
                  tooltip={p}
                >
                  <FiBell />
                </IconButton>
                <div className="text-xs text-foreground-muted">{p}</div>
              </div>
            )
          )}
          {ex(
            `<IconButton aria-label="anchor-button" variant="soft" tone="brand" badgeCount={3} badgeAnchor="button" badgePlacement="top-right" tooltip="anchor=button"><FiMail /></IconButton>`,
            <div className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-background p-4">
              <IconButton
                aria-label="anchor-button"
                variant="soft"
                tone="brand"
                badgeCount={3}
                badgeAnchor="button"
                badgePlacement="top-right"
                tooltip="anchor=button"
              >
                <FiMail />
              </IconButton>
              <div className="text-xs text-foreground-muted">
                anchor = button
              </div>
            </div>
          )}
          {ex(
            `<IconButton aria-label="offset" variant="soft" tone="info" badgeCount={9} badgeOffset={{x:4,y:2}} tooltip="offset"><FiBell /></IconButton>`,
            <div className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-background p-4">
              <IconButton
                aria-label="offset"
                variant="soft"
                tone="info"
                badgeCount={9}
                badgeOffset={{ x: 4, y: 2 }}
                tooltip="offset"
              >
                <FiBell />
              </IconButton>
              <div className="text-xs text-foreground-muted">
                offset x=4, y=2
              </div>
            </div>
          )}
        </SectionCard>

        {/* ===== States ===== */}
        <SectionCard
          title="States"
          subtitle="loading / disabled / badges / tooltip"
        >
          {ex(
            `<IconButton aria-label="Badge 128" tone="danger" variant="soft" tooltip="Badge" badgeCount={128} badgeTone="danger"><FiHeart /></IconButton>`,
            <IconButton
              aria-label="Badge 128"
              tone="danger"
              variant="soft"
              tooltip="Badge"
              badgeCount={128}
              badgeTone="danger"
            >
              <FiHeart />
            </IconButton>
          )}

          {ex(
            `<IconButton aria-label="Dot" tone="neutral" variant="glass" tooltip="Dot" showBadgeDot badgeTone="info"><FiMessageCircle /></IconButton>`,
            <IconButton
              aria-label="Dot"
              tone="neutral"
              variant="glass"
              tooltip="Dot"
              showBadgeDot
              badgeTone="info"
            >
              <FiMessageCircle />
            </IconButton>
          )}

          {ex(
            `<IconButton aria-label="Loading" tone="brand" variant="solid" isLoading tooltip="Loading"><FiBell /></IconButton>`,
            <IconButton
              aria-label="Loading"
              tone="brand"
              variant="solid"
              isLoading
              tooltip="Loading"
            >
              <FiBell />
            </IconButton>
          )}

          {ex(
            `<IconButton aria-label="Disabled" tone="neutral" variant="outline" disabled tooltip="Disabled"><FiSettings /></IconButton>`,
            <IconButton
              aria-label="Disabled"
              tone="neutral"
              variant="outline"
              disabled
              tooltip="Disabled"
            >
              <FiSettings />
            </IconButton>
          )}

          {ex(
            `<IconButton aria-label="No tooltip" tone="neutral" variant="ghost"><FiMoreHorizontal /></IconButton>`,
            <IconButton aria-label="No tooltip" tone="neutral" variant="ghost">
              <FiMoreHorizontal />
            </IconButton>
          )}
        </SectionCard>

        {/* ===== Real-world quick sets ===== */}
        <SectionCard title="Real UI Sets" subtitle="Social / Header / Actions">
          {ex(
            `<IconButton aria-label="إعجاب" variant="soft" tone="danger" tooltip="إعجاب"><FiHeart /></IconButton>`,
            <IconButton
              aria-label="إعجاب"
              variant="soft"
              tone="danger"
              tooltip="إعجاب"
            >
              <FiHeart />
            </IconButton>
          )}

          {ex(
            `<IconButton aria-label="رسائل" variant="glass" tone="info" tooltip="رسائل" badgeCount={12} badgeTone="info"><FiMail /></IconButton>`,
            <IconButton
              aria-label="رسائل"
              variant="glass"
              tone="info"
              tooltip="رسائل"
              badgeCount={12}
              badgeTone="info"
            >
              <FiMail />
            </IconButton>
          )}

          {ex(
            `<IconButton aria-label="إشعارات" variant="soft" tone="brand" tooltip="إشعارات" badgeCount={8} badgeTone="warning" elevation="glow"><FiBell /></IconButton>`,
            <IconButton
              aria-label="إشعارات"
              variant="soft"
              tone="brand"
              tooltip="إشعارات"
              badgeCount={8}
              badgeTone="warning"
              elevation="glow"
            >
              <FiBell />
            </IconButton>
          )}

          {ex(
            `<IconButton aria-label="إضافة" variant="gradient" gradient="aurora" tooltip="إضافة" elevation="cta"><FiPlus /></IconButton>`,
            <IconButton
              aria-label="إضافة"
              variant="gradient"
              gradient="aurora"
              tooltip="إضافة"
              elevation="cta"
            >
              <FiPlus />
            </IconButton>
          )}

          {ex(
            `<IconButton aria-label="Share" variant="soft" tone="neutral" tooltip="Share"><FiShare2 /></IconButton>`,
            <IconButton
              aria-label="Share"
              variant="soft"
              tone="neutral"
              tooltip="Share"
            >
              <FiShare2 />
            </IconButton>
          )}
        </SectionCard>

        {/* ===== Social media backgrounds + interactivity ===== */}
        <SectionCard
          title="Social Backgrounds + Interactive Actions"
          subtitle="Post + Video overlays (like / love / comment / share / bad) with counts + badges"
          bodyClassName="block"
        >
          <SocialPostDemo />
        </SectionCard>

        <AnimatePresence>{toast && <Toast text={toast} />}</AnimatePresence>
      </div>
    </motion.main>
  );
}
