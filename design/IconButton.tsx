// design/IconButton.tsx
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

export type IconButtonSize = "xs" | "sm" | "md" | "lg";
export type IconButtonShape = "circle" | "rounded" | "square";
export type IconButtonVariant = ButtonVariant | "plain" | "inverse";

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

export type IconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  "aria-label": string;

  variant?: IconButtonVariant;
  tone?: ButtonTone;
  size?: IconButtonSize;
  shape?: IconButtonShape;
  elevation?: ButtonElevation;

  gradient?: ButtonGradient;

  isLoading?: boolean;

  tooltip?: string;
  tooltipPlacement?: "top" | "bottom";

  iconClassName?: string;

  badgeCount?: number;
  showBadgeDot?: boolean;
  badgeTone?: ButtonTone;

  badgeAnchor?: IconBadgeAnchor;
  badgePlacement?: IconBadgePlacement;
  badgeOffset?: { x?: number; y?: number };
  badgeClassName?: string;

  children: ReactNode;
};

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
  lg: "h-[18px] w-[18px]",
};

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

function badgeText(count?: number) {
  if (!count || count <= 0) return "";
  return count > 99 ? "99+" : String(count);
}

function badgePlacementClass(p: IconBadgePlacement) {
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
  }
}

function variantClasses(variant: IconButtonVariant, tone: ButtonTone) {
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
    );
  }
  return variantToneClasses(variant, tone);
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      variant = "soft",
      tone = "neutral",
      size = "md",
      shape = "circle",
      elevation = "soft",
      gradient = "sunset",

      isLoading,

      tooltip,
      tooltipPlacement = "top",

      iconClassName,

      badgeCount,
      showBadgeDot,
      badgeTone = "danger",
      badgeAnchor = "icon",
      badgePlacement = "top-right",
      badgeOffset,
      badgeClassName,

      className,
      disabled,
      type,
      children,
      title: nativeTitle,
      ...rest
    },
    ref,
  ) {
    const tooltipId = useId();

    const isGradient = variant === "gradient";
    const isPlain = variant === "plain";
    const isDisabled = Boolean(disabled || isLoading);

    const hasCount = typeof badgeCount === "number" && badgeCount > 0;
    const showBadge = Boolean(showBadgeDot) || hasCount;

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
        : cn("rounded-full font-semibold", badgePillSize[size]),
      badgeClassName,
    );

    const Badge = showBadge ? (
      <span style={badgeStyle} className={badgeCls}>
        {showBadgeDot ? null : badgeText(badgeCount)}
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

    return (
      <span className="relative inline-flex">
        <button
          ref={ref}
          type={type ?? "button"}
          disabled={isDisabled}
          aria-disabled={isDisabled || undefined}
          aria-busy={isLoading || undefined}
          aria-describedby={tooltip ? tooltipId : undefined}
          title={tooltip ? undefined : nativeTitle}
          className={cn(
            "peer",
            baseInteractive,
            "cursor-pointer",
            sizeBtn[size],
            shapeClass(shape),

            !isPlain && pressMotion,
            isPlain && "hover:translate-y-0 active:scale-100",

            variantClasses(variant, tone),
            elevationClasses(tone, elevation, isGradient, isPlain),
            isGradient && gradientClasses(gradient, elevation),

            (variant === "solid" || variant === "gradient") &&
              "ring-1 ring-black/5",
            isLoading && "hover:translate-y-0 active:scale-100",

            className,
          )}
          {...rest}
        >
          {badgeAnchor === "button" ? Badge : null}

          <span
            className={cn(
              "relative inline-flex items-center justify-center leading-none",
              iconSize[size],
              iconClassName,
              "h-[1em] w-[1em]",
            )}
          >
            {isLoading ? <Spinner className={spinnerSize[size]} /> : children}
            {badgeAnchor === "icon" ? Badge : null}
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
            )}
          >
            {tooltip}
          </span>
        )}
      </span>
    );
  },
);
