// design/Button.tsx
"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
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
} from "@/design/common/button-theme";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
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

const sizeClasses: Record<ButtonSize, string> = {
  xs: "h-8 px-3 text-xs",
  sm: "h-9 px-3.5 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm md:text-base",
  xl: "h-12 px-6 text-base md:text-[15px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
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
    ref,
  ) {
    const isGradient = variant === "gradient";
    const isDisabled = Boolean(disabled || isLoading);

    const label = isLoading ? (loadingText ?? children) : children;
    const startAdornment = isLoading ? (
      <Spinner className="h-4 w-4" />
    ) : (
      leftIcon
    );

    return (
      <button
        ref={ref}
        type={type ?? "button"}
        disabled={isDisabled}
        aria-disabled={isDisabled || undefined}
        aria-busy={isLoading || undefined}
        data-loading={isLoading ? "true" : "false"}
        className={cn(
          baseInteractive,
          "gap-2 whitespace-nowrap font-medium",
          pressMotion,
          sizeClasses[size],
          shapeClass(shape),

          variantToneClasses(variant, tone),
          elevationClasses(tone, elevation, isGradient),
          isGradient && gradientClasses(gradient, elevation),

          (variant === "solid" || variant === "gradient") &&
            "ring-1 ring-black/5",
          isLoading && "hover:translate-y-0 active:scale-100",

          fullWidth && "w-full",
          className,
        )}
        {...rest}
      >
        {(startAdornment || isLoading) && (
          <span className="inline-flex w-4 shrink-0 items-center justify-center">
            {startAdornment}
          </span>
        )}

        <span className="inline-flex items-center gap-2">
          <bdi>{label}</bdi>
        </span>

        {rightIcon && (
          <span className="inline-flex w-4 shrink-0 items-center justify-center">
            {rightIcon}
          </span>
        )}
      </button>
    );
  },
);
