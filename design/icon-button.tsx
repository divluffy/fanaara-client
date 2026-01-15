// design\icon-button.tsx
"use client";

import {
  forwardRef,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/utils/cn";
import {
  type ButtonElevation,
  type ButtonGradient,
  type ButtonTone,
  type ButtonVariant,
  Spinner,
  gradientStyles,
  toneTokens,
} from "@/design/button";

/** ===== Types ===== */
export type IconButtonSize = "xs" | "sm" | "md" | "lg";
export type IconButtonShape = "circle" | "rounded" | "square";

export type IconBadgePlacement =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left"
  | "top"
  | "bottom"
  | "left"
  | "right";

export type IconBadgeAnchor = "icon" | "button";

type BaseProps = ButtonHTMLAttributes<HTMLButtonElement>;

type CSSVars = CSSProperties & {
  ["--badge-x"]?: string;
  ["--badge-y"]?: string;
};

export type IconButtonProps = Omit<BaseProps, "children"> & {
  "aria-label": string;

  variant?: ButtonVariant;
  tone?: ButtonTone;
  size?: IconButtonSize;
  shape?: IconButtonShape;
  elevation?: ButtonElevation;

  isLoading?: boolean;

  tooltip?: string;

  badgeCount?: number;
  showBadgeDot?: boolean;
  badgeTone?: ButtonTone;

  /** where badge is attached */
  badgeAnchor?: IconBadgeAnchor;

  /** where badge appears */
  badgePlacement?: IconBadgePlacement;

  /** fine control in px */
  badgeOffset?: { x?: number; y?: number };

  /** extra tuning */
  badgeClassName?: string;

  gradient?: ButtonGradient;

  children: ReactNode;
};

/** ===== Base ===== */
const buttonBase = cn(
  "relative inline-flex items-center justify-center select-none",
  "cursor-pointer",
  "transition-[background-color,box-shadow,transform,filter,color,border-color,opacity] duration-150 ease-out",
  "motion-reduce:transition-none motion-reduce:transform-none",
  "hover:-translate-y-px active:translate-y-0 active:scale-[0.985]",
  "motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  "disabled:cursor-not-allowed disabled:opacity-70",
  "touch-manipulation"
);

const sizeBtn: Record<IconButtonSize, string> = {
  xs: "h-8 w-8",
  sm: "h-9 w-9",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

const iconSize: Record<IconButtonSize, string> = {
  xs: "text-[16px]",
  sm: "text-[17px]",
  md: "text-[18px]",
  lg: "text-[20px]",
};

const spinnerSize: Record<IconButtonSize, string> = {
  xs: "h-3.5 w-3.5",
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-4.5 w-4.5",
};

function shapeClass(shape: IconButtonShape) {
  switch (shape) {
    case "circle":
      return "rounded-full";
    case "square":
      return "rounded-xl";
    case "rounded":
    default:
      return "rounded-2xl";
  }
}

/** ===== Variant / Tone ===== */
function getVariantToneClasses(variant: ButtonVariant, tone: ButtonTone) {
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
        "hover:brightness-[1.03] active:brightness-[0.98]"
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
      return "";
  }
}

function getElevationClasses(
  tone: ButtonTone,
  elevation: ButtonElevation,
  isGradient: boolean
) {
  if (isGradient) {
    // Keep gradient behavior: elevation mostly handled by gradient tokens.
    if (elevation === "cta") {
      return cn("hover:-translate-y-0.5", "motion-reduce:hover:translate-y-0");
    }
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
        toneTokens[tone].glowShadow
      );
    case "cta":
      return cn(
        "shadow-[var(--shadow-lg)] hover:shadow-[var(--shadow-xl)]",
        "hover:-translate-y-0.5",
        "motion-reduce:hover:translate-y-0",
        toneTokens[tone].glowShadow
      );
    default:
      return "";
  }
}

function getGradientClasses(
  gradient: ButtonGradient,
  elevation: ButtonElevation
) {
  const g = gradientStyles[gradient];
  return cn(
    "border-0",
    g.bg,
    g.text,
    g.ring,
    elevation === "none" ? "shadow-none" : cn(g.shadow, g.hoverShadow),
    "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "hover:brightness-[1.03] active:brightness-[0.98]"
  );
}

/** ===== Badge helpers ===== */
function badgeText(count?: number) {
  if (typeof count !== "number" || !Number.isFinite(count) || count <= 0)
    return "";
  return count > 99 ? "99+" : String(count);
}

function badgePlacementClass(p: IconBadgePlacement) {
  switch (p) {
    case "top-right":
      return cn(
        "top-0 right-0",
        "translate-x-[calc(50%+var(--badge-x))]",
        "-translate-y-[calc(50%+var(--badge-y))]"
      );
    case "top-left":
      return cn(
        "top-0 left-0",
        "-translate-x-[calc(50%+var(--badge-x))]",
        "-translate-y-[calc(50%+var(--badge-y))]"
      );
    case "bottom-right":
      return cn(
        "bottom-0 right-0",
        "translate-x-[calc(50%+var(--badge-x))]",
        "translate-y-[calc(50%+var(--badge-y))]"
      );
    case "bottom-left":
      return cn(
        "bottom-0 left-0",
        "-translate-x-[calc(50%+var(--badge-x))]",
        "translate-y-[calc(50%+var(--badge-y))]"
      );
    case "top":
      return cn(
        "top-0 left-1/2",
        "-translate-x-[calc(50%+var(--badge-x))]",
        "-translate-y-[calc(50%+var(--badge-y))]"
      );
    case "bottom":
      return cn(
        "bottom-0 left-1/2",
        "-translate-x-[calc(50%+var(--badge-x))]",
        "translate-y-[calc(50%+var(--badge-y))]"
      );
    case "left":
      return cn(
        "left-0 top-1/2",
        "-translate-x-[calc(50%+var(--badge-x))]",
        "-translate-y-[calc(50%+var(--badge-y))]"
      );
    case "right":
      return cn(
        "right-0 top-1/2",
        "translate-x-[calc(50%+var(--badge-x))]",
        "-translate-y-[calc(50%+var(--badge-y))]"
      );
    default:
      return "";
  }
}

const badgeDotSize: Record<IconButtonSize, string> = {
  xs: "h-2.5 w-2.5",
  sm: "h-2.5 w-2.5",
  md: "h-3 w-3",
  lg: "h-3 w-3",
};

const badgePillSize: Record<IconButtonSize, string> = {
  xs: "h-4 min-w-[1.05rem] px-1.5 text-[10px] leading-[14px]",
  sm: "h-4 min-w-[1.05rem] px-1.5 text-[10px] leading-[14px]",
  md: "h-[1.05rem] min-w-[1.15rem] px-1.5 text-[10px] leading-[15px]",
  lg: "h-[1.10rem] min-w-[1.20rem] px-1.5 text-[10px] leading-[16px]",
};

/** ===== Component ===== */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      variant = "soft",
      tone = "neutral",
      size = "md",
      shape = "circle",
      elevation = "soft",

      isLoading,

      tooltip,

      badgeCount,
      showBadgeDot,
      badgeTone = "danger",

      badgeAnchor = "icon",
      badgePlacement = "top-right",
      badgeOffset,
      badgeClassName,

      gradient = "sunset",

      className,
      disabled,
      type,
      children,
      ...rest
    },
    ref
  ) {
    const isGradient = variant === "gradient";
    const isDisabled = Boolean(disabled || isLoading);

    const hasCountBadge = typeof badgeCount === "number" && badgeCount > 0;
    const showBadge = Boolean(showBadgeDot) || hasCountBadge;
    const badgeLabel = badgeText(badgeCount);
    const badgeTokens = toneTokens[badgeTone];

    const badgeStyle: CSSVars = {
      "--badge-x": `${badgeOffset?.x ?? 0}px`,
      "--badge-y": `${badgeOffset?.y ?? 0}px`,
    };

    const badgeBaseClass = cn(
      "pointer-events-none absolute z-20",
      badgePlacementClass(badgePlacement),
      "flex items-center justify-center",
      "border border-background-elevated shadow-[var(--shadow-sm)]",
      badgeTokens.solidBg,
      badgeTokens.solidText,
      showBadgeDot
        ? cn("rounded-full", badgeDotSize[size])
        : cn("rounded-full font-semibold", badgePillSize[size]),
      badgeClassName
    );

    const renderBadge = (key: string) => (
      <AnimatePresence>
        {showBadge ? (
          <motion.span
            key={key}
            style={badgeStyle}
            className={badgeBaseClass}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: "spring", stiffness: 520, damping: 34 }}
          >
            {showBadgeDot ? null : badgeLabel}
          </motion.span>
        ) : null}
      </AnimatePresence>
    );

    return (
      <motion.span
        className="relative inline-flex group"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.12 }}
      >
        <button
          ref={ref}
          type={type ?? "button"}
          disabled={isDisabled}
          aria-disabled={isDisabled || undefined}
          aria-busy={isLoading || undefined}
          data-variant={variant}
          data-tone={tone}
          data-loading={isLoading ? "true" : "false"}
          title={tooltip || undefined}
          className={cn(
            buttonBase,
            sizeBtn[size],
            shapeClass(shape),

            getVariantToneClasses(variant, tone),
            getElevationClasses(tone, elevation, isGradient),
            isGradient && getGradientClasses(gradient, elevation),

            (variant === "solid" || variant === "gradient") &&
              "ring-1 ring-black/5",

            isLoading && "hover:translate-y-0 active:scale-100",

            className
          )}
          {...rest}
        >
          {/* Sheen */}
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-0 rounded-[inherit] opacity-0",
              "transition-opacity duration-200",
              "group-hover:opacity-100 group-focus-within:opacity-100",
              "bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.38),transparent_55%)]"
            )}
          />

          {/* Badge attached to BUTTON (optional) */}
          {badgeAnchor === "button" ? renderBadge("badge-button") : null}

          {/* Icon box (badge attached here by default) */}
          <span
            className={cn(
              "relative z-10 inline-flex items-center justify-center leading-none",
              iconSize[size],
              "h-[1em] w-[1em]"
            )}
          >
            {isLoading ? <Spinner className={spinnerSize[size]} /> : children}

            {/* Badge attached to ICON (default) */}
            {badgeAnchor === "icon" ? renderBadge("badge-icon") : null}
          </span>
        </button>

        {/* Tooltip (CSS-based visibility, now also works on keyboard focus) */}
        {tooltip && (
          <motion.span
            initial={false}
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute z-30 whitespace-nowrap",
              "rounded-full border border-border-subtle bg-background-elevated/95",
              "px-2 py-[2px] text-[10px] text-foreground shadow-[var(--shadow-xs)]",
              "opacity-0 translate-y-1 transition",
              "group-hover:opacity-100 group-hover:translate-y-0",
              "group-focus-within:opacity-100 group-focus-within:translate-y-0",
              "bottom-[calc(100%+0.45rem)] left-1/2 -translate-x-1/2"
            )}
          >
            {tooltip}
          </motion.span>
        )}
      </motion.span>
    );
  }
);
