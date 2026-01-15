// design\button.tsx
"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
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
  | "info";

export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";
export type ButtonShape = "rounded" | "pill" | "square";

export type ButtonElevation =
  | "none"
  | "soft"
  | "medium"
  | "strong"
  | "glow"
  | "cta";

export type ButtonGradient = "sunset" | "aurora" | "ocean" | "violet";

type BaseProps = ButtonHTMLAttributes<HTMLButtonElement>;

export type ButtonProps = BaseProps & {
  variant?: ButtonVariant;
  tone?: ButtonTone;
  size?: ButtonSize;
  shape?: ButtonShape;
  elevation?: ButtonElevation;
  fullWidth?: boolean;

  leftIcon?: ReactNode;
  rightIcon?: ReactNode;

  isLoading?: boolean;
  loadingText?: string;

  gradient?: ButtonGradient;
};

/** ===== Shared UI ===== */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block h-4 w-4 animate-spin rounded-full border border-current/35 border-t-transparent",
        className
      )}
    />
  );
}

/** ===== Classes ===== */
const baseClasses = cn(
  // layout
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium select-none",
  // pointer + interactions
  "cursor-pointer",
  "transition-[background-color,box-shadow,filter,color,border-color,opacity] duration-150 ease-out",
  // focus ring
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-offset-background",
  // disabled/loading
  "disabled:cursor-not-allowed disabled:opacity-70",
  // prevent double tap highlight on mobile
  "touch-manipulation"
);

const sizeClasses: Record<ButtonSize, string> = {
  xs: "h-8 px-3 text-xs",
  sm: "h-9 px-3.5 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm md:text-base",
  xl: "h-12 px-6 text-base md:text-[15px]",
};

function shapeClass(shape: ButtonShape): string {
  switch (shape) {
    case "pill":
      return "rounded-full";
    case "square":
      return "rounded-xl";
    case "rounded":
    default:
      return "rounded-2xl";
  }
}

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
};

function getVariantToneClasses(variant: ButtonVariant, tone: ButtonTone): string {
  if (variant === "gradient") return "";

  const t = toneTokens[tone];

  switch (variant) {
    case "solid":
      return cn(
        t.solidBg,
        t.solidText,
        t.ringColor,
        "hover:brightness-[1.05] active:brightness-[0.98]"
      );

    case "soft":
      return cn(
        "border",
        t.softBg,
        t.softBorder,
        t.softText,
        t.ringColor,
        "hover:brightness-[1.02] active:brightness-[0.98]"
      );

    case "outline":
      return cn(
        "border bg-transparent",
        t.outlineBorder,
        t.outlineText,
        t.ringColor,
        "hover:bg-background-soft/60 active:bg-background-soft/80"
      );

    case "ghost":
      return cn(
        "bg-transparent",
        t.ghostText,
        t.ringColor,
        t.ghostHoverBg,
        "active:bg-background-soft/70"
      );

    case "glass":
      return cn(
        "border backdrop-blur-xl",
        "bg-[color-mix(in_srgb,rgba(255,255,255,0.90)_70%,var(--bg-elevated)_30%)]",
        "hover:bg-[color-mix(in_srgb,rgba(255,255,255,0.96)_72%,var(--bg-elevated)_28%)]",
        "active:bg-[color-mix(in_srgb,rgba(255,255,255,0.90)_62%,var(--bg-elevated)_38%)]",
        t.glassBorder,
        t.glassText,
        t.ringColor
      );

    default:
      // exhaustive guard
      return "";
  }
}

function getElevationClasses(
  tone: ButtonTone,
  elevation: ButtonElevation,
  isGradient: boolean
): string {
  // gradients already have their own shadow package
  if (isGradient) return "";

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
        toneTokens[tone].glowShadow
      );
    case "cta":
      return cn(
        "shadow-[var(--shadow-lg)] hover:shadow-[var(--shadow-xl)]",
        toneTokens[tone].glowShadow
      );
    default:
      return "";
  }
}

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
};

function getGradientClasses(gradient: ButtonGradient): string {
  const g = gradientStyles[gradient];
  return cn(
    "border-0",
    g.bg,
    g.text,
    g.shadow,
    g.hoverShadow,
    g.ring,
    "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "hover:brightness-[1.03] active:brightness-[0.98]"
  );
}

/** ===== Component ===== */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "solid",
    tone = "brand",
    size = "md",
    shape = "rounded",
    elevation = "soft",
    fullWidth,

    leftIcon,
    rightIcon,

    isLoading = false,
    loadingText,

    gradient = "sunset",

    className,
    disabled,
    children,
    type,
    ...rest
  },
  ref
) {
  const reduceMotion = useReducedMotion();

  const isGradient = variant === "gradient";
  const isDisabled = Boolean(disabled || isLoading);

  // Keep layout stable: if you render an icon/spinner, reserve width.
  const startAdornment = isLoading ? <Spinner /> : leftIcon;
  const endAdornment = rightIcon;

  const liftPx = elevation === "cta" ? 2 : 1;
  const canAnimate = !reduceMotion && !isDisabled;

  const label = isLoading ? (loadingText ?? children) : children;

  return (
    <motion.button
      ref={ref}
      type={type ?? "button"}
      disabled={isDisabled}
      aria-disabled={isDisabled || undefined}
      aria-busy={isLoading || undefined}
      data-loading={isLoading ? "true" : "false"}
      whileHover={canAnimate ? { y: -liftPx } : undefined}
      whileTap={canAnimate ? { y: 0, scale: 0.99 } : undefined}
      transition={{ type: "spring", stiffness: 520, damping: 32, mass: 0.7 }}
      className={cn(
        baseClasses,
        sizeClasses[size],
        shapeClass(shape),

        getVariantToneClasses(variant, tone),
        getElevationClasses(tone, elevation, isGradient),
        isGradient && getGradientClasses(gradient),

        fullWidth && "w-full",

        className
      )}
      {...rest}
    >
      {(startAdornment || isLoading) && (
        <span className="inline-flex w-4 shrink-0 items-center justify-center">
          {startAdornment}
        </span>
      )}

      {/* bdi isolates mixed RTL/LTR (Arabic + English + emojis/numbers) safely */}
      <span className="inline-flex items-center gap-2">
        <bdi>{label}</bdi>
      </span>

      {endAdornment && (
        <span className="inline-flex w-4 shrink-0 items-center justify-center">
          {endAdornment}
        </span>
      )}
    </motion.button>
  );
});
