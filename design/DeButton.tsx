// design/Button.tsx
"use client";

import {
  forwardRef,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type ReactNode,
  useId,
} from "react";
import { cn } from "@/utils/cn";
import {
  type ButtonElevation,
  type ButtonGradient,
  type ButtonShape,
  type ButtonSize,
  type ButtonTone,
  type ButtonVariant,
  Spinner,
  baseInteractive,
  pressMotion,
  shapeClass,
  variantToneClasses,
  elevationClasses,
  gradientClasses,
  toneTokens,
  type CSSVars,
} from "@/design/common/button-theme";

/** Extra variants merged from IconButton */
export type UIButtonVariant = ButtonVariant | "plain" | "inverse";
export type UIButtonShape = ButtonShape | "circle";

export type BadgeAnchor = "content" | "button" | "icon"; // "icon" alias => "content"
export type BadgePlacement =
  // direction-aware (recommended)
  | "top-start"
  | "top-end"
  | "bottom-start"
  | "bottom-end"
  | "start"
  | "end"
  // physical (kept for compatibility)
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left"
  | "left"
  | "right"
  // center edges
  | "top"
  | "bottom";

export type ButtonGroupPosition = "none" | "start" | "middle" | "end";

type Slots = Partial<{
  root: string;
  content: string;
  label: string;
  leftIcon: string;
  rightIcon: string;
  badge: string;
  tooltip: string;
  spinner: string;
}>;

type ButtonCommon = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  variant?: UIButtonVariant;
  tone?: ButtonTone;
  size?: ButtonSize;
  shape?: UIButtonShape;
  elevation?: ButtonElevation;
  gradient?: ButtonGradient;

  /** layout */
  fullWidth?: boolean;
  group?: ButtonGroupPosition;

  /** icons (regular button) */
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;

  /** icon-only mode (replaces IconButton) */
  iconOnly?: boolean;
  iconClassName?: string;

  /** states */
  isLoading?: boolean;
  loadingText?: string;

  /** tooltip */
  tooltip?: string;
  tooltipPlacement?: "top" | "bottom";
  tooltipClassName?: string;

  /** badge */
  badgeCount?: number;
  badgeMax?: number; // default 99 => "99+"
  showBadgeDot?: boolean;
  badgeTone?: ButtonTone;
  badgeAnchor?: BadgeAnchor;
  badgePlacement?: BadgePlacement;
  badgeOffset?: { x?: number; y?: number };
  badgeClassName?: string;

  /** fine-grained styling */
  slots?: Slots;

  children: ReactNode;
};

type IconOnlyProps = ButtonCommon & {
  iconOnly: true;
  "aria-label": string;
  leftIcon?: never;
  rightIcon?: never;
};

type RegularProps = ButtonCommon & {
  iconOnly?: false;
  "aria-label"?: string;
};

export type ButtonProps = IconOnlyProps | RegularProps;

/** ---------- Sizes ---------- */
const textSize: Record<ButtonSize, string> = {
  xs: "h-8 px-3 text-xs",
  sm: "h-9 px-3.5 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm md:text-base",
  xl: "h-12 px-6 text-base md:text-[15px]",
};

const iconOnlySize: Record<ButtonSize, string> = {
  xs: "h-8 w-8",
  sm: "h-9 w-9",
  md: "h-10 w-10",
  lg: "h-11 w-11",
  xl: "h-12 w-12",
};

const iconOnlyIconSize: Record<ButtonSize, string> = {
  xs: "text-[16px]",
  sm: "text-[17px]",
  md: "text-[18px]",
  lg: "text-[20px]",
  xl: "text-[22px]",
};

const spinnerSize: Record<ButtonSize, string> = {
  xs: "h-3.5 w-3.5",
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-[18px] w-[18px]",
  xl: "h-5 w-5",
};

const badgeDotSize: Record<ButtonSize, string> = {
  xs: "h-2.5 w-2.5",
  sm: "h-2.5 w-2.5",
  md: "h-3 w-3",
  lg: "h-3 w-3",
  xl: "h-3 w-3",
};

const badgePillSize: Record<ButtonSize, string> = {
  xs: "h-4 min-w-[1.05rem] px-1.5 text-[10px] leading-[14px]",
  sm: "h-4 min-w-[1.05rem] px-1.5 text-[10px] leading-[14px]",
  md: "h-[1.05rem] min-w-[1.15rem] px-1.5 text-[10px] leading-[15px]",
  lg: "h-[1.10rem] min-w-[1.20rem] px-1.5 text-[10px] leading-[16px]",
  xl: "h-[1.15rem] min-w-[1.25rem] px-1.5 text-[10px] leading-[16px]",
};

function badgeText(count?: number, max = 99) {
  if (!count || count <= 0) return "";
  return count > max ? `${max}+` : String(count);
}

/** ---------- Badge placement (RTL/LTR aware) ---------- */
function badgePlacementClass(p: BadgePlacement) {
  // Direction-aware placements (recommended)
  if (p === "top-end") {
    return cn(
      "top-0 end-0",
      "ltr:translate-x-[calc(50%+var(--badge-x))] rtl:translate-x-[calc(-50%-var(--badge-x))]",
      "-translate-y-[calc(50%+var(--badge-y))]",
    );
  }
  if (p === "top-start") {
    return cn(
      "top-0 start-0",
      "ltr:translate-x-[calc(-50%-var(--badge-x))] rtl:translate-x-[calc(50%+var(--badge-x))]",
      "-translate-y-[calc(50%+var(--badge-y))]",
    );
  }
  if (p === "bottom-end") {
    return cn(
      "bottom-0 end-0",
      "ltr:translate-x-[calc(50%+var(--badge-x))] rtl:translate-x-[calc(-50%-var(--badge-x))]",
      "translate-y-[calc(50%+var(--badge-y))]",
    );
  }
  if (p === "bottom-start") {
    return cn(
      "bottom-0 start-0",
      "ltr:translate-x-[calc(-50%-var(--badge-x))] rtl:translate-x-[calc(50%+var(--badge-x))]",
      "translate-y-[calc(50%+var(--badge-y))]",
    );
  }
  if (p === "end") {
    return cn(
      "end-0 top-1/2",
      "ltr:translate-x-[calc(50%+var(--badge-x))] rtl:translate-x-[calc(-50%-var(--badge-x))]",
      "-translate-y-[calc(50%+var(--badge-y))]",
    );
  }
  if (p === "start") {
    return cn(
      "start-0 top-1/2",
      "ltr:translate-x-[calc(-50%-var(--badge-x))] rtl:translate-x-[calc(50%+var(--badge-x))]",
      "-translate-y-[calc(50%+var(--badge-y))]",
    );
  }

  // Physical placements (legacy / explicit)
  switch (p) {
    case "top-right":
      return cn(
        "top-0 right-0",
        "translate-x-[calc(50%+var(--badge-x))]",
        "-translate-y-[calc(50%+var(--badge-y))]",
      );
    case "top-left":
      return cn(
        "top-0 left-0",
        "-translate-x-[calc(50%+var(--badge-x))]",
        "-translate-y-[calc(50%+var(--badge-y))]",
      );
    case "bottom-right":
      return cn(
        "bottom-0 right-0",
        "translate-x-[calc(50%+var(--badge-x))]",
        "translate-y-[calc(50%+var(--badge-y))]",
      );
    case "bottom-left":
      return cn(
        "bottom-0 left-0",
        "-translate-x-[calc(50%+var(--badge-x))]",
        "translate-y-[calc(50%+var(--badge-y))]",
      );
    case "left":
      return cn(
        "left-0 top-1/2",
        "-translate-x-[calc(50%+var(--badge-x))]",
        "-translate-y-[calc(50%+var(--badge-y))]",
      );
    case "right":
      return cn(
        "right-0 top-1/2",
        "translate-x-[calc(50%+var(--badge-x))]",
        "-translate-y-[calc(50%+var(--badge-y))]",
      );
    case "top":
      return cn(
        "top-0 left-1/2",
        "-translate-x-[calc(50%+var(--badge-x))]",
        "-translate-y-[calc(50%+var(--badge-y))]",
      );
    case "bottom":
      return cn(
        "bottom-0 left-1/2",
        "-translate-x-[calc(50%+var(--badge-x))]",
        "translate-y-[calc(50%+var(--badge-y))]",
      );
  }
}

function groupClasses(group: ButtonGroupPosition) {
  if (group === "none") return "";
  return cn(
    "focus-visible:z-10",
    group !== "start" && "-ms-px", // direction-aware overlap
    group === "start" && "rounded-e-none",
    group === "middle" && "rounded-none",
    group === "end" && "rounded-s-none",
  );
}

/** ---------- Variants (adds plain/inverse) ---------- */
function variantClasses(variant: UIButtonVariant, tone: ButtonTone) {
  if (variant === "gradient") return "";
  if (variant === "inverse") {
    return cn(
      "border border-white/10 bg-white/10 text-white",
      "hover:bg-white/15 active:bg-white/20",
      "focus-visible:ring-white/40",
    );
  }
  if (variant === "plain") {
    return cn(
      "bg-transparent border-0 shadow-none",
      toneTokens[tone].ringColor,
      "text-foreground-strong hover:bg-background-soft/70 active:bg-background-soft/90",
    );
  }
  return variantToneClasses(variant, tone);
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(props, ref) {
    const iconOnly = props.iconOnly === true;

    const {
      variant: variantProp,
      tone: toneProp,
      size = "md",
      shape: shapeProp,
      elevation = "soft",
      gradient = "sunset",

      fullWidth,
      group = "none",

      leftIcon,
      rightIcon,

      iconClassName,

      isLoading,
      loadingText,

      tooltip,
      tooltipPlacement = "top",
      tooltipClassName,

      badgeCount,
      badgeMax = 99,
      showBadgeDot,
      badgeTone = "danger",
      badgeAnchor = "content",
      badgePlacement = "top-end",
      badgeOffset,
      badgeClassName,

      slots,

      className,
      disabled,
      type,
      children,
      title: nativeTitle,
      ...rest
    } = props;

    const variant = (variantProp ??
      (iconOnly ? "soft" : "solid")) as UIButtonVariant;
    const tone = (toneProp ?? (iconOnly ? "neutral" : "brand")) as ButtonTone;
    const shape = (shapeProp ??
      (iconOnly ? "circle" : "rounded")) as UIButtonShape;

    const isGradient = variant === "gradient";
    const isPlain = variant === "plain";
    const isDisabled = Boolean(disabled || isLoading);

    const tooltipId = useId();

    const hasCount = typeof badgeCount === "number" && badgeCount > 0;
    const showBadge = Boolean(showBadgeDot) || hasCount;

    const resolvedBadgeAnchor: BadgeAnchor =
      badgeAnchor === "icon" ? "content" : badgeAnchor;

    const badgeTokens = toneTokens[badgeTone];

    const badgeStyle: CSSVars = {
      ["--badge-x"]: `${badgeOffset?.x ?? 0}px`,
      ["--badge-y"]: `${badgeOffset?.y ?? 0}px`,
    } as CSSProperties;

    const badgeCls = cn(
      "pointer-events-none absolute z-20",
      badgePlacementClass(badgePlacement),
      "flex items-center justify-center",
      "border border-background-elevated shadow-[var(--shadow-sm)]",
      badgeTokens.solidBg,
      badgeTokens.solidText,
      showBadgeDot
        ? cn("rounded-full", badgeDotSize[size])
        : cn("rounded-full font-semibold tabular-nums", badgePillSize[size]),
      badgeClassName,
      slots?.badge,
    );

    const Badge = showBadge ? (
      <span style={badgeStyle} className={badgeCls}>
        {showBadgeDot ? null : badgeText(badgeCount, badgeMax)}
      </span>
    ) : null;

    const tooltipPos =
      tooltipPlacement === "top"
        ? "bottom-[calc(100%+0.65rem)]"
        : "top-[calc(100%+0.65rem)]";
    const tooltipArrowPos =
      tooltipPlacement === "top" ? "before:-bottom-1" : "before:-top-1";
    const tooltipStart =
      tooltipPlacement === "top" ? "translate-y-1" : "-translate-y-1";

    const label = isLoading ? (loadingText ?? children) : children;

    const startAdornment = isLoading ? (
      <Spinner className={cn(spinnerSize[size], slots?.spinner)} />
    ) : (
      leftIcon
    );

    return (
      <span className={cn("relative inline-flex", fullWidth && "w-full")}>
        <button
          ref={ref}
          type={type ?? "button"}
          disabled={isDisabled}
          aria-disabled={isDisabled || undefined}
          aria-busy={isLoading || undefined}
          aria-describedby={tooltip ? tooltipId : undefined}
          title={tooltip ? undefined : nativeTitle}
          data-icon-only={iconOnly ? "true" : "false"}
          data-loading={isLoading ? "true" : "false"}
          className={cn(
            "peer",
            baseInteractive,
            "cursor-pointer",
            iconOnly
              ? iconOnlySize[size]
              : cn(textSize[size], "gap-2 whitespace-nowrap font-medium"),
            shapeClass(shape),

            groupClasses(group),

            !isPlain && pressMotion,
            isPlain && "hover:translate-y-0 active:scale-100",

            variantClasses(variant, tone),
            elevationClasses(tone, elevation, isGradient, isPlain),
            isGradient && gradientClasses(gradient, elevation),

            (variant === "solid" || variant === "gradient") &&
              "ring-1 ring-black/5",
            isLoading && "hover:translate-y-0 active:scale-100",

            fullWidth && "w-full",
            className,
            slots?.root,
          )}
          {...rest}
        >
          {resolvedBadgeAnchor === "button" ? Badge : null}

          {/* CONTENT */}
          <span
            className={cn(
              "relative inline-flex items-center justify-center min-w-0",
              iconOnly
                ? cn("h-[1em] w-[1em]", iconOnlyIconSize[size])
                : "gap-2",
              slots?.content,
            )}
          >
            {iconOnly ? (
              <span className={cn("leading-none", iconClassName)}>
                {isLoading ? (
                  <Spinner className={cn(spinnerSize[size], slots?.spinner)} />
                ) : (
                  children
                )}
              </span>
            ) : (
              <>
                {startAdornment ? (
                  <span
                    className={cn(
                      "inline-flex w-4 shrink-0 items-center justify-center",
                      slots?.leftIcon,
                    )}
                  >
                    {startAdornment}
                  </span>
                ) : null}

                <span
                  className={cn(
                    "inline-flex min-w-0 items-center",
                    slots?.label,
                  )}
                >
                  <bdi className="min-w-0 truncate">{label}</bdi>
                </span>

                {rightIcon ? (
                  <span
                    className={cn(
                      "inline-flex w-4 shrink-0 items-center justify-center",
                      slots?.rightIcon,
                    )}
                  >
                    {rightIcon}
                  </span>
                ) : null}
              </>
            )}

            {resolvedBadgeAnchor === "content" ? Badge : null}
          </span>
        </button>

        {tooltip && (
          <span
            id={tooltipId}
            role="tooltip"
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute z-30 whitespace-nowrap",
              "left-1/2 -translate-x-1/2",
              tooltipPos,
              "rounded-full border border-border-subtle bg-background-elevated/95",
              "px-2 py-[3px] text-[10px] text-foreground shadow-[var(--shadow-xs)]",
              "opacity-0 scale-95",
              tooltipStart,
              "transition-[opacity,transform] duration-150 ease-out",
              "peer-hover:opacity-100 peer-hover:scale-100 peer-hover:translate-y-0",
              "peer-focus-visible:opacity-100 peer-focus-visible:scale-100 peer-focus-visible:translate-y-0",
              "before:content-[''] before:absolute before:left-1/2 before:-translate-x-1/2",
              "before:h-2 before:w-2 before:rotate-45",
              "before:border before:border-border-subtle before:bg-background-elevated/95",
              tooltipArrowPos,
              tooltipClassName,
              slots?.tooltip,
            )}
          >
            {tooltip}
          </span>
        )}
      </span>
    );
  },
);
