// design/Input.tsx
"use client";

import * as React from "react";
import type {
  FieldErrors,
  FieldValues,
  Path,
  RegisterOptions,
  UseFormRegister,
  UseFormRegisterReturn,
} from "react-hook-form";
import type { IconType } from "react-icons";

import { cn } from "@/utils";
import { Button } from "@/design/DeButton";

/* ---------------------------------------------
 * Types
 * -------------------------------------------- */

export type AppInputSize = "xs" | "sm" | "md" | "lg" | "xl";
export type AppInputVariant = "outline" | "soft" | "filled";
export type AppInputShape = "rounded" | "pill" | "square";
export type AppInputAs = "input" | "textarea";

// Action button should be smaller than the input frame (like your original)
const ACTION_BUTTON_SIZE: Record<
  AppInputSize,
  "xs" | "sm" | "md" | "lg" | "xl"
> = {
  xs: "xs",
  sm: "xs",
  md: "sm",
  lg: "md",
  xl: "lg",
};

// Visually nudge the action button towards the inline-end edge
// so it sits close to the border (~8px = tailwind "2").
// Uses RTL/LTR safe utilities.
const ACTION_NUDGE: Record<AppInputSize, string> = {
  xs: "ltr:translate-x-2 rtl:-translate-x-2",
  sm: "ltr:translate-x-2 rtl:-translate-x-2",
  md: "ltr:translate-x-2 rtl:-translate-x-2",
  lg: "ltr:translate-x-3 rtl:-translate-x-3",
  xl: "ltr:translate-x-4 rtl:-translate-x-4",
};

// Keep action icon visually consistent (even if button size is smaller)
const ACTION_ICON_SIZE = "h-4 w-4";

export type FieldIntent =
  | "neutral"
  | "brand"
  | "success"
  | "warning"
  | "info"
  | "danger";

export type ActionTone = FieldIntent;
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

type CommonUIProps = {
  label?: React.ReactNode;
  description?: React.ReactNode;

  /** If provided => error UI */
  errorMessage?: React.ReactNode;

  startIcon?: IconType | React.ReactNode;
  action?: AppInputAction;

  size?: AppInputSize;
  variant?: AppInputVariant;
  shape?: AppInputShape;
  as?: AppInputAs;

  /** Disables input; if no action shows trailing loading button */
  loading?: boolean;

  /** Optional intent for non-error states */
  intent?: FieldIntent;

  /** Optional RHF registration */
  registration?: Partial<UseFormRegisterReturn>;

  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  helperClassName?: string;
  errorClassName?: string;
};

type InputNativeProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> & { as?: "input" };

type TextareaNativeProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  as: "textarea";
};

export type AppInputBaseProps = CommonUIProps &
  (InputNativeProps | TextareaNativeProps);

export type AppInputProps<TFieldValues extends FieldValues> = Omit<
  AppInputBaseProps,
  "name" | "registration" | "errorMessage"
> & {
  name: Path<TFieldValues>;
  register: UseFormRegister<TFieldValues>;
  registerOptions?: RegisterOptions<TFieldValues, Path<TFieldValues>>;
  errors?: FieldErrors<TFieldValues>;
};

/* ---------------------------------------------
 * Size map (xs..xl) + textarea alignment
 * -------------------------------------------- */

const TEXTAREA_TOP: Record<AppInputSize, string> = {
  xs: "mt-2",
  sm: "mt-2.5",
  md: "mt-3",
  lg: "mt-3.5",
  xl: "mt-4",
};

const ICON_SIZE: Record<AppInputSize, string> = {
  xs: "h-4 w-4",
  sm: "h-4 w-4",
  md: "h-4 w-4",
  lg: "h-5 w-5",
  xl: "h-5 w-5",
};

const SIZE: Record<
  AppInputSize,
  {
    frameH: string;
    text: string;
    px: string;
    gap: string;
    radius: string;

    textareaMinH: string;
    textareaPy: string;
  }
> = {
  xs: {
    frameH: "h-9",
    text: "text-xs",
    px: "px-3",
    gap: "gap-1.5",
    radius: "rounded-lg",
    textareaMinH: "min-h-20",
    textareaPy: "py-2",
  },
  sm: {
    frameH: "h-10",
    text: "text-sm",
    px: "px-3",
    gap: "gap-1.5",
    radius: "rounded-lg",
    textareaMinH: "min-h-24",
    textareaPy: "py-2.5",
  },
  md: {
    frameH: "h-11",
    text: "text-sm",
    px: "px-3",
    gap: "gap-2",
    radius: "rounded-xl",
    textareaMinH: "min-h-28",
    textareaPy: "py-3",
  },
  lg: {
    frameH: "h-12",
    text: "text-base",
    px: "px-4",
    gap: "gap-2",
    radius: "rounded-2xl",
    textareaMinH: "min-h-32",
    textareaPy: "py-3.5",
  },
  xl: {
    frameH: "h-14",
    text: "text-base",
    px: "px-5",
    gap: "gap-2.5",
    radius: "rounded-3xl",
    textareaMinH: "min-h-40",
    textareaPy: "py-4",
  },
};

const FRAME_VARIANT: Record<AppInputVariant, string> = {
  outline: "bg-surface",
  soft: "bg-surface-soft",
  filled: "bg-surface-muted",
};

const INTENT: Record<
  FieldIntent,
  {
    border: string;
    hoverBorder: string;
    focus: string;
    glow: string;
    iconFocus: string;
  }
> = {
  neutral: {
    border: "border-border-subtle",
    hoverBorder: "hover:border-border-strong",
    focus:
      "focus-within:border-border-strong focus-within:ring-1 focus-within:ring-[var(--ring-brand)]",
    glow: "focus-within:after:shadow-[0_0_0_1px_var(--color-border-strong)]",
    iconFocus: "group-focus-within:text-foreground",
  },
  brand: {
    border: "border-border-subtle",
    hoverBorder: "hover:border-border-strong",
    focus:
      "focus-within:border-accent-border focus-within:ring-1 focus-within:ring-[var(--ring-brand)]",
    glow: "focus-within:after:shadow-[0_0_0_1px_var(--color-accent-border)]",
    iconFocus: "group-focus-within:text-accent",
  },
  success: {
    border: "border-success-soft-border",
    hoverBorder: "hover:border-success-soft-border",
    focus:
      "focus-within:border-success-soft-border focus-within:ring-1 focus-within:ring-[var(--ring-success)]",
    glow: "focus-within:after:shadow-[0_0_0_1px_var(--color-success-soft-border)]",
    iconFocus: "group-focus-within:text-success-600",
  },
  warning: {
    border: "border-warning-soft-border",
    hoverBorder: "hover:border-warning-soft-border",
    focus:
      "focus-within:border-warning-soft-border focus-within:ring-1 focus-within:ring-[var(--ring-warning)]",
    glow: "focus-within:after:shadow-[0_0_0_1px_var(--color-warning-soft-border)]",
    iconFocus: "group-focus-within:text-warning-700",
  },
  info: {
    border: "border-info-soft-border",
    hoverBorder: "hover:border-info-soft-border",
    focus:
      "focus-within:border-info-soft-border focus-within:ring-1 focus-within:ring-[var(--ring-info)]",
    glow: "focus-within:after:shadow-[0_0_0_1px_var(--color-info-soft-border)]",
    iconFocus: "group-focus-within:text-info-700",
  },
  danger: {
    border: "border-danger-soft-border",
    hoverBorder: "hover:border-danger-soft-border",
    focus:
      "focus-within:border-danger-soft-border focus-within:ring-1 focus-within:ring-[var(--ring-danger)]",
    glow: "focus-within:after:shadow-[0_0_0_1px_var(--color-danger-soft-border)]",
    iconFocus: "group-focus-within:text-danger-600",
  },
};

/* ---------------------------------------------
 * Helpers
 * -------------------------------------------- */

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
  name: Path<TFieldValues>,
): string | undefined {
  const v = getByPath(errors, String(name));
  if (!isRecord(v)) return undefined;
  const msg = v.message;
  return typeof msg === "string" ? msg : undefined;
}

function renderIcon(
  icon?: IconType | React.ReactNode,
  className?: string,
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

function mergeRefs<T>(
  ...refs: Array<React.Ref<T> | undefined>
): React.RefCallback<T> {
  return (value) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") ref(value);
      else (ref as React.MutableRefObject<T | null>).current = value;
    }
  };
}

function safeKey<T extends string>(
  value: unknown,
  map: Record<T, unknown>,
  fallback: T,
): T {
  return (typeof value === "string" && value in map ? value : fallback) as T;
}

function mapInputShapeToButtonShape(
  shape: AppInputShape,
  iconOnly: boolean,
): any {
  // Button supports: rounded/pill/square + circle
  if (shape === "square") return "square";
  if (shape === "pill") return iconOnly ? "circle" : "pill";
  return "rounded";
}

function mapActionAppearanceToButtonVariant(a: ActionAppearance): any {
  if (a === "solid") return "solid";
  if (a === "soft") return "soft";
  return "outline";
}

/* ---------------------------------------------
 * Base Component
 * -------------------------------------------- */

export const AppInputBase = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  AppInputBaseProps
>(function AppInputBase(props, forwardedRef) {
  const {
    label,
    description,
    errorMessage,
    startIcon,
    action,
    size: sizeProp = "md",
    variant: variantProp = "outline",
    shape = "rounded",
    as: asProp,
    loading = false,
    intent: intentProp = "brand",
    registration,
    containerClassName,
    labelClassName,
    inputClassName,
    helperClassName,
    errorClassName,
    ...nativeProps
  } = props;

  const as: AppInputAs = asProp === "textarea" ? "textarea" : "input";

  // Runtime safety (fixes your crash if any invalid value leaks)
  const size = safeKey<AppInputSize>(sizeProp, SIZE, "md");
  const variant = safeKey<AppInputVariant>(
    variantProp,
    FRAME_VARIANT,
    "outline",
  );

  const s = SIZE[size];

  const nativeAny = nativeProps as React.InputHTMLAttributes<HTMLInputElement> &
    React.TextareaHTMLAttributes<HTMLTextAreaElement>;

  const {
    id: providedId,
    className: nativeClassName,
    disabled: nativeDisabled,
    readOnly: nativeReadOnly,
    onChange: nativeOnChange,
    onBlur: nativeOnBlur,
    onFocus: nativeOnFocus,
    name: nativeName,
    ...restNative
  } = nativeAny;

  const hasError = Boolean(errorMessage);
  const effectiveIntent: FieldIntent = hasError ? "danger" : intentProp;
  const intentKey = safeKey<FieldIntent>(effectiveIntent, INTENT, "brand");
  const intentCls = INTENT[intentKey];

  const isActionLoading = Boolean(action?.loading);
  const isDisabled = Boolean(nativeDisabled) || loading || isActionLoading;
  const isReadOnly = Boolean(nativeReadOnly);
  const canHover = !isDisabled && !isReadOnly;

  const reactId = React.useId();
  const fieldName = registration?.name ?? nativeName;

  const safeBase = (fieldName ? String(fieldName) : "field")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const safeReactId = reactId.replace(/:/g, "");
  const inputId = providedId ?? `${safeBase}-${safeReactId}`.toLowerCase();

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

  const frameCls = cn(
    "group relative w-full flex border",
    as === "textarea" ? "items-start" : "items-stretch",
    s.gap,
    s.px,
    shapeCls,
    FRAME_VARIANT[variant],
    intentCls.border,
    as === "textarea" ? "py-0" : s.frameH,
    as === "textarea" ? "py-0" : "",
    "transition-[border-color,box-shadow,background-color,transform] duration-150 ease-out",
    canHover && intentCls.hoverBorder,
    canHover &&
      "hover:shadow-[var(--shadow-xs)] hover:-translate-y-px motion-reduce:hover:translate-y-0",
    !isDisabled && "focus-within:shadow-[var(--shadow-sm)]",
    !isDisabled && intentCls.focus,
    isDisabled && "opacity-60 cursor-not-allowed",
    // anime-ish focus glow layer (CSS only)
    "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit]",
    "after:opacity-0 after:transition-opacity after:duration-150",
    !isDisabled && "focus-within:after:opacity-100",
    !isDisabled && intentCls.glow,
    containerClassName,
  );

  const startIconCls = cn(
    "shrink-0 w-5 flex items-center justify-center pointer-events-none",
    hasError
      ? "text-danger-600"
      : cn("text-foreground-muted", intentCls.iconFocus),
    as === "textarea" ? cn("self-start", TEXTAREA_TOP[size]) : "self-center",
  );

  const inputBaseCls = cn(
    "min-w-0 flex-1 bg-transparent outline-none",
    "text-foreground placeholder:text-foreground-muted",
    "disabled:cursor-not-allowed disabled:text-foreground-disabled",
    "[&[readonly]]:cursor-default",
    s.text,
    as === "input"
      ? "h-full leading-[1.2]"
      : cn(
          "self-stretch resize-none",
          s.textareaMinH,
          s.textareaPy,
          "leading-relaxed",
        ),
    inputClassName,
    nativeClassName,
  );

  const composedRef = mergeRefs(
    forwardedRef as React.Ref<HTMLInputElement | HTMLTextAreaElement>,
    registration?.ref as React.Ref<HTMLInputElement | HTMLTextAreaElement>,
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    registration?.onChange?.(e);
    nativeOnChange?.(e as never);
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    registration?.onBlur?.(e);
    nativeOnBlur?.(e as never);
  };

  // ---- Action button (must use your Button component)
  const actionTone: ActionTone = action?.tone ?? "neutral";
  const actionAppearance: ActionAppearance = action?.appearance ?? "outline";
  const isIconOnly = Boolean(action && !action.label);

  const buttonVariant = mapActionAppearanceToButtonVariant(actionAppearance);
  const buttonShape = mapInputShapeToButtonShape(shape, isIconOnly);

  const actionIconEl = action?.icon
    ? renderIcon(action.icon, ACTION_ICON_SIZE)
    : null;

  const trailingSlotCls = cn(
    "shrink-0",
    as === "textarea" ? cn("self-start", TEXTAREA_TOP[size]) : "self-center",
    // slight inline-end breathing room like your original
    "[margin-inline-end:0.25rem]",
  );

  const btnSize = ACTION_BUTTON_SIZE[size];

  return (
    <div className="w-full">
      {label ? (
        <label
          htmlFor={inputId}
          className={cn(
            "mb-1.5 block text-sm font-medium text-foreground",
            labelClassName,
          )}
        >
          {label}
        </label>
      ) : null}

      <div className={cn(frameCls, as === "textarea" && s.textareaPy)}>
        {startIcon ? (
          <div className={startIconCls}>
            {renderIcon(startIcon, ICON_SIZE[size])}
          </div>
        ) : null}

        {as === "textarea" ? (
          <textarea
            {...(restNative as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            id={inputId}
            name={registration?.name ?? nativeName}
            ref={composedRef as React.Ref<HTMLTextAreaElement>}
            aria-invalid={hasError || undefined}
            aria-errormessage={errId}
            aria-describedby={ariaDescribedBy}
            aria-busy={loading || isActionLoading || undefined}
            disabled={isDisabled}
            readOnly={isReadOnly}
            className={inputBaseCls}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={nativeOnFocus as never}
          />
        ) : (
          <input
            {...(restNative as React.InputHTMLAttributes<HTMLInputElement>)}
            id={inputId}
            name={registration?.name ?? nativeName}
            ref={composedRef as React.Ref<HTMLInputElement>}
            aria-invalid={hasError || undefined}
            aria-errormessage={errId}
            aria-describedby={ariaDescribedBy}
            aria-busy={loading || isActionLoading || undefined}
            disabled={isDisabled}
            readOnly={isReadOnly}
            className={inputBaseCls}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={nativeOnFocus as never}
          />
        )}

        {/* Action OR Loading placeholder — BOTH use Button */}
        {action ? (
          <div className={trailingSlotCls}>
            <Button
              iconOnly={isIconOnly}
              aria-label={action.ariaLabel}
              tone={actionTone as any}
              variant={buttonVariant as any}
              shape={buttonShape as any}
              size={btnSize as any} // ✅ smaller than input
              isLoading={Boolean(action.loading)}
              disabled={isDisabled || Boolean(action.disabled)}
              onClick={action.onClick}
              className={cn(
                "shrink-0 focus-visible:z-10",
                ACTION_NUDGE[size], // ✅ close to edge (rtl/ltr)
              )}
              {...(isIconOnly
                ? {}
                : {
                    leftIcon: actionIconEl ? actionIconEl : undefined,
                  })}
            >
              {isIconOnly
                ? (actionIconEl ?? <span aria-hidden />)
                : action.label}
            </Button>
          </div>
        ) : loading ? (
          <div className={trailingSlotCls} aria-hidden>
            <Button
              iconOnly
              aria-label="Loading"
              tone="neutral"
              variant="soft"
              shape={mapInputShapeToButtonShape(shape, true)}
              size={btnSize as any} // ✅ also smaller
              isLoading
              disabled
              className={cn("shrink-0", ACTION_NUDGE[size])} // ✅ same nudge
            >
              <span aria-hidden />
            </Button>
          </div>
        ) : null}
      </div>

      {hasError ? (
        <p
          id={errId}
          role="alert"
          className={cn(
            "mt-2 text-xs leading-relaxed text-danger-500",
            errorClassName,
          )}
        >
          {errorMessage}
        </p>
      ) : null}

      {description ? (
        <p
          id={descId}
          className={cn(
            "mt-2 text-xs leading-relaxed text-foreground-muted",
            helperClassName,
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
});

/* ---------------------------------------------
 * RHF wrapper (same API as your original)
 * -------------------------------------------- */

export function AppInput<TFieldValues extends FieldValues>(
  props: AppInputProps<TFieldValues>,
) {
  const { name, register, registerOptions, errors, ...rest } = props;

  const errorMessage = getErrorMessage(errors, name);
  const registration = register(name, registerOptions);

  return (
    <AppInputBase
      {...(rest as AppInputBaseProps)}
      registration={registration}
      errorMessage={errorMessage}
    />
  );
}
