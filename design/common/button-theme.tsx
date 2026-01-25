// design/button-theme.ts
"use client";

import type { CSSProperties } from "react";
import { cn } from "@/utils/cn";

/** ===== Types ===== */
export type ButtonVariant =
  | "solid"
  | "soft"
  | "outline"
  | "ghost"
  | "glass"
  | "gradient";

export type ButtonTone =
  | "brand"
  | "neutral"
  | "success"
  | "danger"
  | "warning"
  | "info"
  // extra tones
  | "purple"
  | "pink"
  | "lime"
  | "cyan";

export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";
export type ButtonShape = "rounded" | "pill" | "square";

export type ButtonElevation =
  | "none"
  | "soft"
  | "medium"
  | "strong"
  | "glow"
  | "cta";

export type ButtonGradient =
  | "sunset"
  | "aurora"
  | "ocean"
  | "violet"
  // extra gradients
  | "mango"
  | "rose"
  | "neon"
  | "midnight";

/** ===== Shared UI ===== */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block animate-spin rounded-full border border-current/35 border-t-transparent",
        "h-4 w-4",
        className,
      )}
    />
  );
}

/** ===== Shared Classes ===== */
export const baseInteractive = cn(
  "relative inline-flex items-center justify-center select-none",
  "transition-[background-color,box-shadow,transform,color,border-color,opacity,filter] duration-150 ease-out",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  "disabled:cursor-not-allowed disabled:opacity-70",
  "touch-manipulation",
);

export const pressMotion = cn(
  "hover:-translate-y-px active:translate-y-0 active:scale-[0.985]",
  "motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100",
);

export function shapeClass(shape: ButtonShape | "circle" | "rounded") {
  if (shape === "pill" || shape === "circle") return "rounded-full";
  if (shape === "square") return "rounded-xl";
  return "rounded-2xl";
}

/** ===== Tone tokens (Tailwind tokens from styles.css @theme inline) ===== */
type ToneTokens = {
  solidBg: string;
  solidText: string;

  softBg: string;
  softText: string;
  softBorder: string;

  outlineBorder: string;
  outlineText: string;

  ghostText: string;
  ghostHoverBg: string;

  glassText: string;
  glassBorder: string;

  ringColor: string;
  glowShadow: string;
};

export const toneTokens: Record<ButtonTone, ToneTokens> = {
  brand: {
    solidBg: "bg-accent",
    solidText: "text-accent-foreground",
    softBg: "bg-accent-soft",
    softText: "text-accent",
    softBorder: "border-accent-border",
    outlineBorder: "border-accent",
    outlineText: "text-accent",
    ghostText: "text-accent",
    ghostHoverBg: "hover:bg-accent-soft/70",
    glassText: "text-accent",
    glassBorder: "border-accent-border/70",
    ringColor: "focus-visible:ring-accent-ring",
    glowShadow: "hover:shadow-[var(--shadow-glow-brand)]",
  },

  neutral: {
    solidBg: "bg-foreground",
    solidText: "text-background",
    softBg: "bg-surface-soft",
    softText: "text-foreground",
    softBorder: "border-border-subtle",
    outlineBorder: "border-border-subtle",
    outlineText: "text-foreground",
    ghostText: "text-foreground-strong",
    ghostHoverBg: "hover:bg-background-soft/80",
    glassText: "text-foreground-strong",
    glassBorder: "border-border-subtle/70",
    ringColor: "focus-visible:ring-accent/30",
    glowShadow: "hover:shadow-[var(--shadow-md)]",
  },

  success: {
    solidBg: "bg-success-solid",
    solidText: "text-success-foreground",
    softBg: "bg-success-soft",
    softText: "text-success-700",
    softBorder: "border-success-soft-border",
    outlineBorder: "border-success-500",
    outlineText: "text-success-700",
    ghostText: "text-success-600",
    ghostHoverBg: "hover:bg-success-soft/80",
    glassText: "text-success-foreground",
    glassBorder: "border-success-soft-border",
    ringColor: "focus-visible:ring-success-soft",
    glowShadow: "hover:shadow-[var(--shadow-glow-success)]",
  },

  danger: {
    solidBg: "bg-danger-solid",
    solidText: "text-danger-foreground",
    softBg: "bg-danger-soft",
    softText: "text-danger-700",
    softBorder: "border-danger-soft-border",
    outlineBorder: "border-danger-500",
    outlineText: "text-danger-700",
    ghostText: "text-danger-600",
    ghostHoverBg: "hover:bg-danger-soft/80",
    glassText: "text-danger-foreground",
    glassBorder: "border-danger-soft-border",
    ringColor: "focus-visible:ring-danger-soft",
    glowShadow: "hover:shadow-[var(--shadow-glow-danger)]",
  },

  warning: {
    solidBg: "bg-warning-solid",
    solidText: "text-warning-foreground",
    softBg: "bg-warning-soft",
    softText: "text-warning-700",
    softBorder: "border-warning-soft-border",
    outlineBorder: "border-warning-500",
    outlineText: "text-warning-700",
    ghostText: "text-warning-600",
    ghostHoverBg: "hover:bg-warning-soft/80",
    glassText: "text-warning-foreground",
    glassBorder: "border-warning-soft-border",
    ringColor: "focus-visible:ring-warning-soft",
    glowShadow: "hover:shadow-[var(--shadow-glow-warning)]",
  },

  info: {
    solidBg: "bg-info-solid",
    solidText: "text-info-foreground",
    softBg: "bg-info-soft",
    softText: "text-info-700",
    softBorder: "border-info-soft-border",
    outlineBorder: "border-info-500",
    outlineText: "text-info-700",
    ghostText: "text-info-600",
    ghostHoverBg: "hover:bg-info-soft/80",
    glassText: "text-info-foreground",
    glassBorder: "border-info-soft-border",
    ringColor: "focus-visible:ring-info-soft",
    glowShadow: "hover:shadow-[var(--shadow-glow-info)]",
  },

  // ===== Extra tones =====
  purple: {
    solidBg: "bg-purple-solid",
    solidText: "text-purple-foreground",
    softBg: "bg-purple-soft",
    softText: "text-purple-700",
    softBorder: "border-purple-soft-border",
    outlineBorder: "border-purple-500",
    outlineText: "text-purple-700",
    ghostText: "text-purple-600",
    ghostHoverBg: "hover:bg-purple-soft/80",
    glassText: "text-purple-foreground",
    glassBorder: "border-purple-soft-border",
    ringColor: "focus-visible:ring-purple-soft",
    glowShadow: "hover:shadow-[var(--shadow-glow-purple)]",
  },

  pink: {
    solidBg: "bg-pink-solid",
    solidText: "text-pink-foreground",
    softBg: "bg-pink-soft",
    softText: "text-pink-700",
    softBorder: "border-pink-soft-border",
    outlineBorder: "border-pink-500",
    outlineText: "text-pink-700",
    ghostText: "text-pink-600",
    ghostHoverBg: "hover:bg-pink-soft/80",
    glassText: "text-pink-foreground",
    glassBorder: "border-pink-soft-border",
    ringColor: "focus-visible:ring-pink-soft",
    glowShadow: "hover:shadow-[var(--shadow-glow-pink)]",
  },

  lime: {
    solidBg: "bg-lime-solid",
    solidText: "text-lime-foreground",
    softBg: "bg-lime-soft",
    softText: "text-lime-800",
    softBorder: "border-lime-soft-border",
    outlineBorder: "border-lime-500",
    outlineText: "text-lime-800",
    ghostText: "text-lime-700",
    ghostHoverBg: "hover:bg-lime-soft/80",
    glassText: "text-lime-foreground",
    glassBorder: "border-lime-soft-border",
    ringColor: "focus-visible:ring-lime-soft",
    glowShadow: "hover:shadow-[var(--shadow-glow-lime)]",
  },

  cyan: {
    solidBg: "bg-cyan-solid",
    solidText: "text-cyan-foreground",
    softBg: "bg-cyan-soft",
    softText: "text-cyan-800",
    softBorder: "border-cyan-soft-border",
    outlineBorder: "border-cyan-500",
    outlineText: "text-cyan-800",
    ghostText: "text-cyan-700",
    ghostHoverBg: "hover:bg-cyan-soft/80",
    glassText: "text-cyan-foreground",
    glassBorder: "border-cyan-soft-border",
    ringColor: "focus-visible:ring-cyan-soft",
    glowShadow: "hover:shadow-[var(--shadow-glow-cyan)]",
  },
};

/** ===== Variants helpers ===== */
export function variantToneClasses(variant: ButtonVariant, tone: ButtonTone) {
  if (variant === "gradient") return "";

  const t = toneTokens[tone];

  switch (variant) {
    case "solid":
      return cn(
        t.solidBg,
        t.solidText,
        t.ringColor,
        "hover:brightness-[1.05] active:brightness-[0.98]",
      );
    case "soft":
      return cn(
        "border",
        t.softBg,
        t.softBorder,
        t.softText,
        t.ringColor,
        "hover:brightness-[1.02] active:brightness-[0.98]",
      );
    case "outline":
      return cn(
        "border bg-transparent",
        t.outlineBorder,
        t.outlineText,
        t.ringColor,
        "hover:bg-background-soft/60 active:bg-background-soft/80",
      );
    case "ghost":
      return cn(
        "bg-transparent",
        t.ghostText,
        t.ringColor,
        t.ghostHoverBg,
        "active:bg-background-soft/70",
      );
    case "glass":
      return cn(
        "border backdrop-blur-xl",
        "bg-[color-mix(in_srgb,rgba(255,255,255,0.90)_70%,var(--bg-elevated)_30%)]",
        "hover:bg-[color-mix(in_srgb,rgba(255,255,255,0.96)_72%,var(--bg-elevated)_28%)]",
        "active:bg-[color-mix(in_srgb,rgba(255,255,255,0.90)_62%,var(--bg-elevated)_38%)]",
        t.glassBorder,
        t.glassText,
        t.ringColor,
      );
  }
}

/** ===== Elevation helpers ===== */
export function elevationClasses(
  tone: ButtonTone,
  elevation: ButtonElevation,
  isGradient: boolean,
  isPlain?: boolean,
) {
  if (isPlain) return "shadow-none";
  if (isGradient) {
    if (elevation === "none") return "shadow-none";
    if (elevation === "cta") return "hover:-translate-y-0.5";
    return "";
  }

  switch (elevation) {
    case "none":
      return "shadow-none";
    case "soft":
      return "shadow-[var(--shadow-xs)] hover:shadow-[var(--shadow-sm)]";
    case "medium":
      return "shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]";
    case "strong":
      return "shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)]";
    case "glow":
      return cn(
        "shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]",
        toneTokens[tone].glowShadow,
      );
    case "cta":
      return cn(
        "shadow-[var(--shadow-lg)] hover:shadow-[var(--shadow-xl)] hover:-translate-y-0.5",
        toneTokens[tone].glowShadow,
      );
  }
}

/** ===== Gradients ===== */
export const gradientStyles: Record<
  ButtonGradient,
  {
    bg: string;
    text: string;
    shadow: string;
    hoverShadow: string;
    ring: string;
  }
> = {
  sunset: {
    bg: "bg-gradient-to-r from-pink-500 via-red-500 to-orange-500",
    text: "text-white",
    shadow: "shadow-[0_0_24px_rgba(236,72,153,0.7)]",
    hoverShadow: "hover:shadow-[0_0_34px_rgba(236,72,153,0.9)]",
    ring: "focus-visible:ring-pink-400/80",
  },
  aurora: {
    bg: "bg-gradient-to-r from-emerald-400 via-sky-500 to-indigo-500",
    text: "text-white",
    shadow: "shadow-[0_0_24px_rgba(56,189,248,0.65)]",
    hoverShadow: "hover:shadow-[0_0_34px_rgba(56,189,248,0.9)]",
    ring: "focus-visible:ring-sky-400/80",
  },
  ocean: {
    bg: "bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600",
    text: "text-white",
    shadow: "shadow-[0_0_24px_rgba(59,130,246,0.65)]",
    hoverShadow: "hover:shadow-[0_0_34px_rgba(59,130,246,0.9)]",
    ring: "focus-visible:ring-cyan-400/80",
  },
  violet: {
    bg: "bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500",
    text: "text-white",
    shadow: "shadow-[0_0_24px_rgba(192,132,252,0.7)]",
    hoverShadow: "hover:shadow-[0_0_34px_rgba(192,132,252,0.95)]",
    ring: "focus-visible:ring-fuchsia-400/80",
  },

  // ===== Extra gradients =====
  mango: {
    bg: "bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500",
    text: "text-white",
    shadow: "shadow-[0_0_24px_rgba(249,115,22,0.65)]",
    hoverShadow: "hover:shadow-[0_0_34px_rgba(249,115,22,0.9)]",
    ring: "focus-visible:ring-orange-300/80",
  },
  rose: {
    bg: "bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500",
    text: "text-white",
    shadow: "shadow-[0_0_24px_rgba(244,63,94,0.65)]",
    hoverShadow: "hover:shadow-[0_0_34px_rgba(244,63,94,0.92)]",
    ring: "focus-visible:ring-rose-300/80",
  },
  neon: {
    bg: "bg-gradient-to-r from-lime-400 via-emerald-400 to-cyan-400",
    text: "text-neutral-charcoal",
    shadow: "shadow-[0_0_24px_rgba(34,197,94,0.55)]",
    hoverShadow: "hover:shadow-[0_0_34px_rgba(34,197,94,0.85)]",
    ring: "focus-visible:ring-emerald-300/80",
  },
  midnight: {
    bg: "bg-gradient-to-r from-slate-900 via-indigo-950 to-black",
    text: "text-white",
    shadow: "shadow-[0_0_24px_rgba(99,102,241,0.35)]",
    hoverShadow: "hover:shadow-[0_0_34px_rgba(99,102,241,0.55)]",
    ring: "focus-visible:ring-indigo-300/70",
  },
};

export function gradientClasses(
  gradient: ButtonGradient,
  elevation: ButtonElevation,
) {
  const g = gradientStyles[gradient];
  return cn(
    "border-0",
    g.bg,
    g.text,
    g.ring,
    elevation === "none" ? "shadow-none" : cn(g.shadow, g.hoverShadow),
    "hover:brightness-[1.03] active:brightness-[0.98]",
  );
}

/** ===== Tiny helper for CSS vars objects ===== */
export type CSSVars = CSSProperties & Record<string, string | undefined>;
