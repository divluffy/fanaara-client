// design/Input.tsx
"use client";

import * as React from "react";
import type {
  FieldErrors,
  FieldValues,
  Path,
  RegisterOptions,
  UseFormRegister,
} from "react-hook-form";
import type { IconType } from "react-icons";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { cn } from "@/utils";
import { useAppSelector } from "@/redux/hooks";

export type AppInputSize = "sm" | "md" | "lg";
export type AppInputVariant = "outline" | "soft" | "filled";
export type AppInputShape = "rounded" | "pill" | "square";
export type AppInputAs = "input" | "textarea";

export type ActionTone = "neutral" | "brand" | "danger";
export type ActionAppearance = "outline" | "soft" | "solid";

export type AppInputAction = {
  icon?: IconType | React.ReactNode;
  label?: string;
  onClick: () => void;
  ariaLabel: string;
  disabled?: boolean;
  loading?: boolean;
  tone?: ActionTone;
  appearance?: ActionAppearance;
};

const TEXTAREA_TOP: Record<AppInputSize, string> = {
  sm: "mt-2.5",
  md: "mt-3",
  lg: "mt-3.5",
};

type CommonProps<TFieldValues extends FieldValues> = {
  name: Path<TFieldValues>;
  register: UseFormRegister<TFieldValues>;
  registerOptions?: RegisterOptions<TFieldValues, Path<TFieldValues>>;
  errors?: FieldErrors<TFieldValues>;

  label?: React.ReactNode;
  description?: React.ReactNode;

  startIcon?: IconType | React.ReactNode;
  action?: AppInputAction;

  size?: AppInputSize;
  variant?: AppInputVariant;
  shape?: AppInputShape;
  as?: AppInputAs;

  loading?: boolean;

  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  helperClassName?: string;
  errorClassName?: string;
};

type InputOnlyProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "name" | "size"
> & { as?: "input" };

type TextareaOnlyProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "name"
> & { as: "textarea" };

export type AppInputProps<TFieldValues extends FieldValues> =
  CommonProps<TFieldValues> & (InputOnlyProps | TextareaOnlyProps);

const SIZE: Record<
  AppInputSize,
  {
    frameH: string;
    text: string;
    px: string;
    gap: string;
    actionH: string;
    actionW: string;
    textareaMinH: string;
    textareaPy: string;
    radius: string;
  }
> = {
  sm: {
    frameH: "h-10",
    text: "text-sm",
    px: "px-3",
    gap: "gap-1.5",
    actionH: "h-8",
    actionW: "w-8",
    textareaMinH: "min-h-24",
    textareaPy: "py-2.5",
    radius: "rounded-lg",
  },
  md: {
    frameH: "h-11",
    text: "text-sm",
    px: "px-3",
    gap: "gap-1.5",
    actionH: "h-9",
    actionW: "w-9",
    textareaMinH: "min-h-28",
    textareaPy: "py-3",
    radius: "rounded-xl",
  },
  lg: {
    frameH: "h-12",
    text: "text-base",
    px: "px-4",
    gap: "gap-2",
    actionH: "h-10",
    actionW: "w-10",
    textareaMinH: "min-h-32",
    textareaPy: "py-3.5",
    radius: "rounded-2xl",
  },
};

type UnknownRecord = Record<string, unknown>;
function isRecord(v: unknown): v is UnknownRecord {
  return typeof v === "object" && v !== null;
}

function getByPath(obj: unknown, path: string): unknown {
  if (!obj) return undefined;
  const keys = path.split(".").filter(Boolean);
  let cur: unknown = obj;

  for (const k of keys) {
    if (!isRecord(cur)) return undefined;
    cur = cur[k];
  }
  return cur;
}

function getErrorMessage<TFieldValues extends FieldValues>(
  errors: FieldErrors<TFieldValues> | undefined,
  name: Path<TFieldValues>
): string | undefined {
  const v = getByPath(errors, String(name));
  if (!isRecord(v)) return undefined;
  const msg = v.message;
  return typeof msg === "string" ? msg : undefined;
}

function renderIcon(
  icon?: IconType | React.ReactNode,
  className?: string
): React.ReactNode {
  if (!icon) return null;

  if (React.isValidElement(icon)) {
    const el = icon as React.ReactElement<{ className?: string }>;
    return React.cloneElement(el, {
      className: cn(el.props.className, className),
      "aria-hidden": true,
    });
  }

  if (typeof icon === "function") {
    const C = icon as IconType;
    return <C className={className} aria-hidden />;
  }

  return null;
}

const FRAME_VARIANT: Record<AppInputVariant, string> = {
  outline: cn(
    "bg-[var(--color-surface)]",
    "border-[var(--color-border-subtle)]"
  ),
  soft: cn(
    "bg-[var(--color-surface-soft)]",
    "border-[var(--color-border-subtle)]"
  ),
  filled: cn(
    "bg-[var(--color-surface-muted)]",
    "border-[var(--color-border-subtle)]"
  ),
};

const ACTION_TONE = {
  neutral: {
    text: "text-[var(--color-foreground-muted)]",
    ring: "focus-visible:ring-1 focus-visible:ring-[var(--ring-brand)]",
    border: "border-[var(--color-border-subtle)]",
    softBg: "bg-[var(--color-surface-soft)]",
  },
  brand: {
    text: "text-[var(--color-foreground)]",
    ring: "focus-visible:ring-1 focus-visible:ring-[var(--ring-brand)]",
    border: "border-[var(--color-border-subtle)]",
    softBg: "bg-[var(--color-accent-soft)]",
  },
  danger: {
    text: "text-[var(--color-danger-600)]",
    ring: "focus-visible:ring-1 focus-visible:ring-[var(--ring-danger)]",
    border: "border-[var(--color-danger-soft-border)]",
    softBg: "bg-[var(--color-danger-soft)]",
  },
} as const;

export function AppInput<TFieldValues extends FieldValues>(
  props: AppInputProps<TFieldValues>
) {
  const {
    name,
    register,
    registerOptions,
    errors,
    label,
    description,
    startIcon,
    action,
    size = "md",
    variant = "outline",
    shape = "rounded",
    as: asProp,
    loading = false,
    containerClassName,
    labelClassName,
    inputClassName,
    helperClassName,
    errorClassName,
    ...nativeProps
  } = props;

  const { isRTL } = useAppSelector((s) => s.state);
  const shouldReduceMotion = useReducedMotion();

  const as: AppInputAs = asProp === "textarea" ? "textarea" : "input";
  const s = SIZE[size];

  const reactId = React.useId();
  const providedId = "id" in nativeProps ? nativeProps.id : undefined;
  const inputId =
    providedId ??
    `${String(name).replace(/\./g, "-")}-${reactId}`.toLowerCase();

  const errorMessage = getErrorMessage(errors, name);
  const hasError = Boolean(errorMessage);

  const isActionLoading = Boolean(action?.loading);
  const nativeDisabled =
    "disabled" in nativeProps ? Boolean(nativeProps.disabled) : false;
  const nativeReadOnly =
    "readOnly" in nativeProps ? Boolean(nativeProps.readOnly) : false;

  const isDisabled = nativeDisabled || loading || isActionLoading;
  const canHover = !isDisabled && !nativeReadOnly;

  const descId = description ? `${inputId}-desc` : undefined;
  const errId = hasError ? `${inputId}-err` : undefined;
  const ariaDescribedBy =
    [errId, descId].filter(Boolean).join(" ") || undefined;

  const shapeCls =
    shape === "square"
      ? "rounded-none"
      : shape === "pill"
      ? "rounded-full"
      : s.radius;

  // Frame states
  const borderBase = hasError
    ? "border-[var(--color-danger-soft-border)]"
    : "border-[var(--color-border-subtle)]";

  const hoverBorder = hasError
    ? "hover:border-[var(--color-danger-soft-border)]"
    : "hover:border-[var(--color-border-strong)]";

  const focusRing = hasError
    ? cn(
        "focus-within:border-[var(--color-danger-soft-border)]",
        "focus-within:ring-1 focus-within:ring-[var(--ring-danger)]",
        "focus-within:shadow-[var(--shadow-sm)]"
      )
    : cn(
        "focus-within:border-[var(--color-accent-border)]",
        "focus-within:ring-1 focus-within:ring-[var(--ring-brand)]",
        "focus-within:shadow-[var(--shadow-sm)]"
      );

  const frameCls = cn(
    "relative w-full flex",
    as === "textarea" ? "items-start" : "items-stretch",
    s.gap,
    s.px,
    shapeCls,
    "border shadow-none",
    FRAME_VARIANT[variant],
    borderBase,
    "transition-[box-shadow,border-color,background-color] duration-150 ease-out",
    canHover && hoverBorder,
    canHover && "hover:shadow-[var(--shadow-xs)]",
    !isDisabled && focusRing,
    isDisabled && "opacity-60 cursor-not-allowed",
    as === "input" ? s.frameH : "py-0",
    // ✨ Anime accent: subtle glow layer on focus
    "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit]",
    "after:opacity-0 after:transition-opacity after:duration-150",
    !isDisabled &&
      "focus-within:after:opacity-100 focus-within:after:shadow-[0_0_0_1px_var(--color-accent-border)]",
    containerClassName
  );

  const startIconCls = cn(
    "shrink-0",
    "flex items-center justify-center",
    "w-5",
    "text-[var(--color-foreground-muted)]",
    "pointer-events-none",
    as === "textarea" ? cn("self-start", TEXTAREA_TOP[size]) : "self-center"
  );

  const inputBaseCls = cn(
    "min-w-0 flex-1",
    "bg-transparent text-[var(--color-foreground)]",
    "placeholder:text-[var(--color-foreground-muted)]",
    "outline-none",
    "disabled:cursor-not-allowed [&[readonly]]:cursor-default",
    s.text,
    "leading-[1.2]",
    as === "input"
      ? "h-full"
      : cn(
          "self-stretch resize-none",
          s.textareaMinH,
          s.textareaPy,
          "leading-relaxed"
        ),
    inputClassName,
    // keep native className working
    "className" in nativeProps ? nativeProps.className : undefined
  );

  // Action button
  const tone = action?.tone ?? "neutral";
  const appearance = action?.appearance ?? "outline";
  const toneCls = ACTION_TONE[tone];

  const actionRadius =
    shape === "square"
      ? "rounded-none"
      : shape === "pill"
      ? "rounded-full"
      : "rounded-xl";

  const solidByTone =
    tone === "brand"
      ? cn(
          "bg-[var(--color-accent)] text-[var(--color-accent-foreground)] border-transparent",
          "hover:bg-[var(--color-accent-strong)]"
        )
      : tone === "danger"
      ? cn(
          "bg-[var(--color-danger-solid)] text-[var(--color-danger-foreground)] border-transparent",
          "hover:bg-[var(--color-danger-600)]"
        )
      : cn(
          "bg-[var(--color-foreground-strong)] text-[var(--color-surface)] border-transparent",
          "hover:opacity-95"
        );

  const actionAppearanceCls =
    appearance === "solid"
      ? solidByTone
      : appearance === "soft"
      ? cn(toneCls.softBg, toneCls.text, toneCls.border, "hover:opacity-95")
      : cn(
          "bg-[var(--color-surface)]",
          toneCls.text,
          toneCls.border,
          "hover:bg-[var(--color-surface-soft)]"
        );

  // RHF register (keeps same behavior)
  const reg = register(name, registerOptions);

  // Motion: horizontal offsets must respect RTL (start-based)
  const helpEnterX = shouldReduceMotion ? 0 : isRTL ? 8 : -8;

  const helpMotion = {
    initial: { opacity: 0, x: helpEnterX, y: shouldReduceMotion ? 0 : 2 },
    animate: { opacity: 1, x: 0, y: 0 },
    exit: { opacity: 0, x: helpEnterX, y: shouldReduceMotion ? 0 : 2 },
    transition: { duration: 0.18 },
  } as const;

  const frameHoverMotion =
    shouldReduceMotion || !canHover
      ? undefined
      : { y: -1, transition: { duration: 0.15 } };

  const actionHoverMotion = shouldReduceMotion
    ? undefined
    : { scale: 1.03, transition: { duration: 0.12 } };

  const actionTapMotion = shouldReduceMotion ? undefined : { scale: 0.98 };

  return (
    <div className="w-full">
      {label ? (
        <label
          htmlFor={inputId}
          className={cn(
            "mb-1.5 block text-sm font-medium text-[var(--color-foreground)]",
            labelClassName
          )}
        >
          {label}
        </label>
      ) : null}

      <motion.div className={frameCls} whileHover={frameHoverMotion}>
        {startIcon ? (
          <div className={startIconCls}>{renderIcon(startIcon, "h-4 w-4")}</div>
        ) : null}

        {as === "textarea" ? (
          <textarea
            id={inputId}
            aria-invalid={hasError || undefined}
            aria-describedby={ariaDescribedBy}
            aria-busy={loading || isActionLoading || undefined}
            disabled={isDisabled}
            readOnly={nativeReadOnly}
            className={inputBaseCls}
            {...(nativeProps as TextareaOnlyProps)}
            {...reg}
            onChange={(e) => {
              reg.onChange(e);
              (nativeProps as TextareaOnlyProps).onChange?.(e);
            }}
            onBlur={(e) => {
              reg.onBlur(e);
              (nativeProps as TextareaOnlyProps).onBlur?.(e);
            }}
            onFocus={(nativeProps as TextareaOnlyProps).onFocus}
          />
        ) : (
          <input
            id={inputId}
            aria-invalid={hasError || undefined}
            aria-describedby={ariaDescribedBy}
            aria-busy={loading || isActionLoading || undefined}
            disabled={isDisabled}
            readOnly={nativeReadOnly}
            className={inputBaseCls}
            {...(nativeProps as InputOnlyProps)}
            {...reg}
            onChange={(e) => {
              reg.onChange(e);
              (nativeProps as InputOnlyProps).onChange?.(e);
            }}
            onBlur={(e) => {
              reg.onBlur(e);
              (nativeProps as InputOnlyProps).onBlur?.(e);
            }}
            onFocus={(nativeProps as InputOnlyProps).onFocus}
          />
        )}

        {action ? (
          <motion.button
            type="button"
            onClick={action.onClick}
            aria-label={action.ariaLabel}
            aria-busy={isActionLoading || undefined}
            disabled={isDisabled || Boolean(action.disabled)}
            className={cn(
              "shrink-0 inline-flex items-center justify-center gap-1.5 border",
              as === "textarea"
                ? cn("self-start", TEXTAREA_TOP[size])
                : "self-center",
              s.actionH,
              action?.label ? "px-2.5" : s.actionW,
              actionRadius,
              "transition-[transform,box-shadow,background-color,border-color,color] duration-150 ease-out",
              isRTL ? "-translate-x-4" : "translate-x-4",
              "active:translate-y-[1px]",
              "focus-visible:outline-none focus-visible:ring-1",
              toneCls.ring,
              !isDisabled && "hover:shadow-[var(--shadow-xs)]",
              actionAppearanceCls,
              "disabled:opacity-60 disabled:cursor-not-allowed",
              "[margin-inline-end:0.25rem]"
            )}
            whileHover={!isDisabled ? actionHoverMotion : undefined}
            whileTap={!isDisabled ? actionTapMotion : undefined}
          >
            {isActionLoading ? (
              <span
                className={cn(
                  "h-4 w-4 rounded-full border-2",
                  "border-[var(--color-border-subtle)] border-t-[var(--color-accent)]",
                  "animate-spin motion-reduce:animate-none"
                )}
                aria-hidden
              />
            ) : action.icon ? (
              renderIcon(action.icon, "h-4 w-4")
            ) : null}

            {action.label ? (
              <span className="max-w-[11rem] truncate text-xs leading-none">
                {action.label}
              </span>
            ) : null}
          </motion.button>
        ) : loading ? (
          <div
            className={cn(
              "shrink-0 self-center inline-flex items-center justify-center",
              s.actionH,
              s.actionW,
              shape === "pill"
                ? "rounded-full"
                : shape === "square"
                ? "rounded-none"
                : "rounded-xl",
              "border border-[var(--color-border-subtle)] bg-[var(--color-surface)]",
              "[margin-inline-end:0.25rem]"
            )}
            aria-hidden
          >
            <span
              className={cn(
                "h-4 w-4 rounded-full border-2",
                "border-[var(--color-border-subtle)] border-t-[var(--color-accent)]",
                "animate-spin motion-reduce:animate-none"
              )}
            />
          </div>
        ) : null}
      </motion.div>

      <AnimatePresence initial={false}>
        {hasError ? (
          <motion.p
            key="err"
            id={errId}
            className={cn(
              "mt-2 text-xs leading-relaxed text-[var(--color-danger-solid)]",
              errorClassName
            )}
            {...helpMotion}
          >
            {errorMessage}
          </motion.p>
        ) : null}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {description ? (
          <motion.p
            key="desc"
            id={descId}
            className={cn(
              "mt-2 text-xs leading-relaxed text-[var(--color-foreground-muted)]",
              helperClassName
            )}
            {...helpMotion}
          >
            {description}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
