// design/Select.tsx
"use client";

import React, {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import { useTranslations } from "next-intl";

export type SelectOption = {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  group?: string;
  disabled?: boolean;
};

export type SmartSelectProps = {
  options: SelectOption[];
  value: string | string[] | null;
  onChange: (
    value: string | string[] | null,
    selectedOptions: SelectOption[]
  ) => void;

  label?: string;
  placeholder?: string;
  multiple?: boolean;
  searchable?: boolean;
  disabled?: boolean;

  size?: "sm" | "md" | "lg";
  variant?: "solid" | "outline" | "ghost";

  /**
   * الحد الأقصى “النظري” للارتفاع.
   * سيتم تقليصه تلقائياً حسب مساحة الشاشة + الكيبورد.
   */
  maxHeight?: number;

  noResultsText?: string;
  searchPlaceholder?: string;
  clearText?: string;

  creatable?: boolean;
  onCreateOption?: (label: string) => void;
  onSearchChange?: (term: string) => void;

  className?: string;
};

type Placement = "bottom" | "top";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function getViewportMetrics() {
  const vv = typeof window !== "undefined" ? window.visualViewport : null;

  const width = vv?.width ?? window.innerWidth;
  const height = vv?.height ?? window.innerHeight;

  // offsets مهمة خصوصًا على iOS
  const offsetTop = vv?.offsetTop ?? 0;
  const offsetLeft = vv?.offsetLeft ?? 0;

  // تقدير الكيبورد (لو > 80px اعتبره مفتوح)
  const keyboardInset = Math.max(0, window.innerHeight - height);

  return { vv, width, height, offsetTop, offsetLeft, keyboardInset };
}

function normalizeValueToArray(
  value: SmartSelectProps["value"],
  multiple: boolean
): string[] {
  if (value == null) return [];

  if (Array.isArray(value)) {
    if (multiple) return value;
    return value.length ? [value[0]] : [];
  }

  return [value];
}

function buildSelectedOptions(
  options: SelectOption[],
  selectedValues: string[]
) {
  if (selectedValues.length === 0) return [];
  const set = new Set(selectedValues);
  return options.filter((o) => set.has(o.value));
}

function toggleValue(values: string[], value: string): string[] {
  return values.includes(value)
    ? values.filter((v) => v !== value)
    : [...values, value];
}

function findNextEnabledIndex(
  options: SelectOption[],
  currentIndex: number,
  dir: 1 | -1
) {
  if (options.length === 0) return -1;

  let idx = currentIndex;

  for (let i = 0; i < options.length; i++) {
    idx =
      idx === -1
        ? dir === 1
          ? 0
          : options.length - 1
        : (idx + dir + options.length) % options.length;

    if (!options[idx]?.disabled) return idx;
  }

  return -1;
}

function findFirstEnabledIndex(options: SelectOption[]) {
  return options.findIndex((o) => !o.disabled);
}

function findLastEnabledIndex(options: SelectOption[]) {
  for (let i = options.length - 1; i >= 0; i--) {
    if (!options[i]?.disabled) return i;
  }
  return -1;
}

const SIZE_STYLES = {
  sm: { trigger: "min-h-[2.25rem] text-xs", padding: "px-2.5 py-1.5" },
  md: { trigger: "min-h-[2.5rem] text-sm", padding: "px-3 py-2" },
  lg: { trigger: "min-h-[3rem] text-base", padding: "px-3.5 py-2.5" },
} as const;

const VARIANT_STYLES = {
  solid: "bg-surface-soft border-border-subtle",
  outline: "bg-transparent border-border-strong",
  ghost: "bg-transparent border-transparent shadow-none",
} as const;

function findScrollParent(el: HTMLElement | null): HTMLElement | null {
  let p = el?.parentElement ?? null;

  while (p) {
    const s = getComputedStyle(p);
    const oy = s.overflowY;
    if ((oy === "auto" || oy === "scroll") && p.scrollHeight > p.clientHeight) {
      return p;
    }
    p = p.parentElement;
  }

  // fallback للصفحة نفسها (لو ما في container واضح)
  return null;
}

export const SmartSelect: React.FC<SmartSelectProps> = ({
  options,
  value,
  onChange,

  label,
  placeholder = "Select…",
  multiple = false,
  searchable = true,
  disabled = false,

  size = "md",
  variant = "solid",

  maxHeight = 260,

  noResultsText = "No results",
  searchPlaceholder = "Search…",
  clearText = "Clear",

  creatable = false,
  onCreateOption,
  onSearchChange,

  className,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const { isRTL, direction } = useAppSelector((s) => s.state);

  const selectId = useId();
  const labelId = `${selectId}-label`;
  const listboxId = `${selectId}-listbox`;

  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  type PositionState = {
    placement: Placement;
    maxHeight: number;
    style: React.CSSProperties;
  };

  const [pos, setPos] = useState<PositionState>(() => ({
    placement: "bottom",
    maxHeight,
    style: {
      position: "fixed",
      left: 0,
      top: 0,
      width: 0,
      maxHeight,
      zIndex: 50,
      willChange: "transform, top, left, bottom, opacity",
    },
  }));

  // keyboard/focus stability
  const searchFocusedRef = useRef(false);
  const placementLockRef = useRef<Placement | null>(null);

  // scroll parent (لو عندك main overflow-y-auto)
  const scrollParentRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setPortalEl(document.body);
  }, []);

  useEffect(() => {
    scrollParentRef.current = findScrollParent(rootRef.current);
  }, []);

  const normalizedSearch = useMemo(() => search.trim().toLowerCase(), [search]);

  const selectedValues = useMemo(
    () => normalizeValueToArray(value, multiple),
    [value, multiple]
  );

  const selectedOptions = useMemo(
    () => buildSelectedOptions(options, selectedValues),
    [options, selectedValues]
  );

  const selectedSet = useMemo(() => new Set(selectedValues), [selectedValues]);

  const filteredOptions = useMemo(() => {
    if (!normalizedSearch) return options;

    return options.filter((opt) => {
      const term = normalizedSearch;
      return (
        opt.label.toLowerCase().includes(term) ||
        opt.description?.toLowerCase().includes(term) ||
        opt.group?.toLowerCase().includes(term)
      );
    });
  }, [options, normalizedSearch]);

  const hasSelection = selectedOptions.length > 0;

  const showCreateAction = useMemo(() => {
    if (!creatable) return false;
    if (!onCreateOption) return false;
    if (!normalizedSearch) return false;
    return filteredOptions.length === 0;
  }, [creatable, onCreateOption, normalizedSearch, filteredOptions.length]);

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
    setSearch("");
    searchFocusedRef.current = false;
    placementLockRef.current = null;

    document.documentElement.style.scrollPaddingBottom = "";
    document.body.style.scrollPaddingBottom = "";
  }, []);

  const commitChange = useCallback(
    (nextValue: string | string[] | null) => {
      const nextArray = Array.isArray(nextValue)
        ? nextValue
        : typeof nextValue === "string"
        ? [nextValue]
        : [];

      onChange(nextValue, buildSelectedOptions(options, nextArray));
    },
    [onChange, options]
  );

  const handleSelectOption = useCallback(
    (option: SelectOption) => {
      if (disabled || option.disabled) return;

      if (multiple) {
        commitChange(toggleValue(selectedValues, option.value));
        return;
      }

      commitChange(option.value);
      closeDropdown();
    },
    [disabled, multiple, selectedValues, commitChange, closeDropdown]
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (disabled) return;

      commitChange(multiple ? [] : null);
      setSearch("");
      setActiveIndex(-1);
    },
    [disabled, multiple, commitChange]
  );

  const handleRemoveChip = useCallback(
    (e: React.MouseEvent, valueToRemove: string) => {
      e.stopPropagation();
      if (!multiple || disabled) return;
      commitChange(selectedValues.filter((v) => v !== valueToRemove));
    },
    [multiple, disabled, selectedValues, commitChange]
  );

  const moveActive = useCallback(
    (dir: 1 | -1) => {
      const next = findNextEnabledIndex(filteredOptions, activeIndex, dir);
      if (next !== -1) setActiveIndex(next);
    },
    [filteredOptions, activeIndex]
  );

  const scrollByDelta = useCallback((dy: number) => {
    if (!dy) return;
    const sp = scrollParentRef.current;
    if (sp) sp.scrollTop += dy;
    else window.scrollBy({ top: dy, left: 0 });
  }, []);

  const ensureAnchorVisible = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const { height: vh, keyboardInset } = getViewportMetrics();

    const pad = 12;
    const topLimit = pad;
    const bottomLimit = vh - pad;

    if (rect.bottom > bottomLimit) {
      scrollByDelta(rect.bottom - bottomLimit);
    } else if (rect.top < topLimit) {
      scrollByDelta(rect.top - topLimit);
    }

    // ✅ لما الكيبورد مفتوح: ارفع الـ trigger لفوق شوي عشان القائمة يكون لها مساحة
    if (keyboardInset > 80) {
      const desiredBottom = Math.min(vh * 0.58, vh - pad);
      if (rect.bottom > desiredBottom) {
        scrollByDelta(rect.bottom - desiredBottom);
      }
    }
  }, [scrollByDelta]);

  const computeAndApplyPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const {
      width: vw,
      height: vh,
      offsetTop,
      offsetLeft,
      keyboardInset,
      vv,
    } = getViewportMetrics();

    const gap = 8;
    const keyboardOpen = keyboardInset > 80;

    // المساحات في إحداثيات الـ visual viewport (rect هو نفسه visual)
    const spaceAbove = Math.max(0, rect.top - gap);
    const spaceBelow = Math.max(0, vh - rect.bottom - gap);

    const minComfort = 180;

    let nextPlacement: Placement;

    if (keyboardOpen) {
      // ✅ وقت الكيبورد: الأفضل دائمًا نخلي القائمة فوق إذا ممكن
      nextPlacement = spaceAbove >= 140 ? "top" : "bottom";
    } else {
      nextPlacement =
        spaceBelow < minComfort && spaceAbove > spaceBelow + 24
          ? "top"
          : "bottom";
    }

    // ثبات أثناء focus (عشان ما يصير flicker)
    if (searchFocusedRef.current) {
      if (placementLockRef.current == null)
        placementLockRef.current = nextPlacement;
      nextPlacement = placementLockRef.current;
    } else {
      placementLockRef.current = null;
    }

    const available = nextPlacement === "bottom" ? spaceBelow : spaceAbove;
    const safeMax = Math.min(maxHeight, Math.max(0, available));

    // Left في إحداثيات الـ layout viewport (fixed)، لذا نضيف offsetLeft
    const desiredLeft = rect.left + offsetLeft;
    const minLeft = offsetLeft + gap;
    const maxLeft = offsetLeft + vw - rect.width - gap;
    const left = clamp(desiredLeft, minLeft, Math.max(minLeft, maxLeft));

    const base: React.CSSProperties = {
      position: "fixed",
      left,
      width: rect.width,
      maxHeight: safeMax,
      zIndex: 50,
      willChange: "transform, top, left, bottom, opacity",
    };

    // Top/Bottom في layout viewport (fixed) => نضيف offsetTop
    const style: React.CSSProperties =
      nextPlacement === "bottom"
        ? { ...base, top: rect.bottom + offsetTop + gap, bottom: "auto" }
        : {
            ...base,
            top: "auto",
            // bottom محسوب بالنسبة لـ window.innerHeight (layout viewport)
            bottom: window.innerHeight - (rect.top + offsetTop) + gap,
          };

    setPos({ placement: nextPlacement, maxHeight: safeMax, style });

    // scrollPadding يساعد المتصفح يرفع المحتوى فوق الكيبورد أثناء التركيز
    if (searchFocusedRef.current && vv) {
      const kb = Math.max(0, keyboardInset);
      const v = `${kb + 16}px`;
      document.documentElement.style.scrollPaddingBottom = v;
      document.body.style.scrollPaddingBottom = v;
    } else {
      document.documentElement.style.scrollPaddingBottom = "";
      document.body.style.scrollPaddingBottom = "";
    }
  }, [maxHeight]);

  const openDropdown = useCallback(() => {
    if (disabled) return;
    computeAndApplyPosition();
    setOpen(true);
    setActiveIndex(-1);
    // لا focus تلقائي على input (حسب فكرتك)
  }, [disabled, computeAndApplyPosition]);

  const toggleDropdown = useCallback(() => {
    if (disabled) return;

    setOpen((prev) => {
      const next = !prev;

      if (next) {
        computeAndApplyPosition();
        setActiveIndex(-1);
      } else {
        setActiveIndex(-1);
        setSearch("");
        searchFocusedRef.current = false;
        placementLockRef.current = null;
        document.documentElement.style.scrollPaddingBottom = "";
      }

      return next;
    });
  }, [disabled, computeAndApplyPosition]);

  // Close on outside click (supports portal)
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      const root = rootRef.current;
      const drop = dropdownRef.current;
      const target = e.target as Node;

      if (root?.contains(target)) return;
      if (drop?.contains(target)) return;

      closeDropdown();
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, closeDropdown]);

  // Emit search term
  useEffect(() => {
    onSearchChange?.(search);
  }, [search, onSearchChange]);

  // Recompute while open (scroll/resize/keyboard) — raf throttled
  useLayoutEffect(() => {
    if (!open) return;

    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        computeAndApplyPosition();
      });
    };

    schedule();

    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, true);

    const vv = window.visualViewport;
    vv?.addEventListener("resize", schedule);
    vv?.addEventListener("scroll", schedule);

    const ro = new ResizeObserver(schedule);
    if (rootRef.current) ro.observe(rootRef.current);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule, true);
      vv?.removeEventListener("resize", schedule);
      vv?.removeEventListener("scroll", schedule);
      ro.disconnect();
    };
  }, [open, computeAndApplyPosition]);

  // Keep activeIndex valid
  useEffect(() => {
    if (!open) return;
    if (activeIndex === -1) return;
    if (activeIndex < filteredOptions.length) return;
    setActiveIndex(findFirstEnabledIndex(filteredOptions));
  }, [open, activeIndex, filteredOptions]);

  // Scroll active option into view
  useEffect(() => {
    if (!open || activeIndex < 0) return;

    const container = listRef.current;
    if (!container) return;

    const el = container.querySelector<HTMLElement>(
      `[data-option-index="${activeIndex}"]`
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  // Global keyboard handler (works inside portal)
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      if (e.isComposing) return;

      const root = rootRef.current;
      const drop = dropdownRef.current;
      const target = e.target as Node | null;

      if (target && !(root?.contains(target) || drop?.contains(target))) return;

      if (e.key === "Escape") {
        e.preventDefault();
        closeDropdown();
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        moveActive(1);
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        moveActive(-1);
        return;
      }

      if (e.key === "Home") {
        e.preventDefault();
        setActiveIndex(findFirstEnabledIndex(filteredOptions));
        return;
      }

      if (e.key === "End") {
        e.preventDefault();
        setActiveIndex(findLastEnabledIndex(filteredOptions));
        return;
      }

      if (e.key === "Enter") {
        const opt = filteredOptions[activeIndex];
        if (opt && !opt.disabled) {
          e.preventDefault();
          handleSelectOption(opt);
          return;
        }

        if (showCreateAction && onCreateOption) {
          const labelToCreate = search.trim();
          if (labelToCreate) {
            e.preventDefault();
            onCreateOption(labelToCreate);
            setSearch("");
            setActiveIndex(-1);
          }
        }
        return;
      }

      const isTextInput =
        (e.target as HTMLElement | null)?.tagName === "INPUT" ||
        (e.target as HTMLElement | null)?.tagName === "TEXTAREA";

      if (e.key === "Backspace" && multiple && !search && !isTextInput) {
        if (selectedValues.length === 0) return;
        e.preventDefault();
        commitChange(selectedValues.slice(0, -1));
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [
    open,
    disabled,
    closeDropdown,
    moveActive,
    filteredOptions,
    activeIndex,
    handleSelectOption,
    showCreateAction,
    onCreateOption,
    search,
    multiple,
    selectedValues,
    commitChange,
  ]);

  const reservedForSearch = searchable ? 52 : 0;
  const optionsViewportMax = Math.max(
    0,
    Math.floor(pos.maxHeight - reservedForSearch)
  );

  // very light animation (fast, avoids jank)
  const motionDropdown = prefersReducedMotion
    ? { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 } }
    : {
        initial: { opacity: 0, scale: 0.985 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.985 },
      };

  const triggerBaseClasses = cn(
    "flex w-full items-center justify-between gap-2 rounded-xl border shadow-soft outline-none ring-0 transition-all duration-150 ease-out",
    "hover:border-accent-border hover:shadow-[var(--shadow-md)]",
    "focus-visible:ring-2 focus-visible:ring-[color:var(--ring-brand)] focus-visible:ring-offset-1 focus-visible:ring-offset-[color:var(--bg-page)]",
    disabled && "cursor-not-allowed opacity-60",
    VARIANT_STYLES[variant],
    SIZE_STYLES[size].trigger,
    SIZE_STYLES[size].padding,
    isRTL && "flex-row-reverse"
  );

  return (
    <div
      ref={rootRef}
      dir={direction}
      className={cn(
        "relative inline-flex w-full max-w-md flex-col gap-1 text-foreground",
        className
      )}
    >
      {label && (
        <div id={labelId} className="text-xs font-medium text-foreground-muted">
          {label}
        </div>
      )}

      {/* Trigger (DIV not BUTTON to avoid nested button error) */}
      <div
        ref={triggerRef}
        role="combobox"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-labelledby={label ? labelId : undefined}
        aria-activedescendant={
          open && activeIndex >= 0
            ? `${listboxId}-opt-${activeIndex}`
            : undefined
        }
        onClick={toggleDropdown}
        onKeyDown={(e) => {
          if (disabled) return;

          if (!open) {
            if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
              e.preventDefault();
              openDropdown();
              setActiveIndex(findFirstEnabledIndex(filteredOptions));
              return;
            }
          } else {
            // when open, allow escape here too
            if (e.key === "Escape") {
              e.preventDefault();
              closeDropdown();
            }
          }
        }}
        className={triggerBaseClasses}
      >
        <div
          className={cn(
            "flex flex-1 flex-wrap items-center gap-1.5 text-left",
            isRTL && "flex-row-reverse"
          )}
        >
          {!hasSelection && (
            <span className="text-xs text-foreground-soft">{placeholder}</span>
          )}

          {multiple && hasSelection && (
            <>
              {selectedOptions.slice(0, 3).map((opt) => (
                <span
                  key={opt.value}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border border-accent-border bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-foreground",
                    isRTL && "flex-row-reverse"
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>{opt.label}</span>
                  <button
                    type="button"
                    disabled={disabled}
                    className="rounded-full p-0.5 transition hover:bg-[color:var(--brand-soft-bg)] disabled:opacity-60"
                    onClick={(e) => handleRemoveChip(e, opt.value)}
                    aria-label="Remove"
                  >
                    <svg width="10" height="10" viewBox="0 0 12 12">
                      <path
                        d="M3 3l6 6M9 3L3 9"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </span>
              ))}
            </>
          )}

          {multiple && selectedOptions.length > 3 && (
            <span className="text-[11px] text-foreground-muted">
              +{selectedOptions.length - 3}
            </span>
          )}

          {!multiple && hasSelection && (
            <span className="truncate text-sm font-medium text-foreground-strong">
              {selectedOptions[0]?.label}
            </span>
          )}
        </div>

        <div
          className={cn("flex items-center gap-1", isRTL && "flex-row-reverse")}
        >
          {hasSelection && (
            <button
              type="button"
              disabled={disabled}
              onClick={handleClear}
              className="rounded-full p-1 text-xs text-foreground-soft transition hover:bg-surface-muted hover:text-foreground disabled:opacity-60"
              aria-label={clearText}
            >
              <svg width="12" height="12" viewBox="0 0 12 12">
                <path
                  d="M3 3l6 6M9 3L3 9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}

          <motion.span
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded-full bg-surface-muted text-foreground-soft",
              "transition-transform"
            )}
            aria-hidden
            animate={
              prefersReducedMotion ? undefined : { rotate: open ? 180 : 0 }
            }
            transition={{ duration: 0.15 }}
          >
            <svg width="10" height="10" viewBox="0 0 12 12">
              <path
                d="M3 4.5L6 7.5L9 4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.span>
        </div>
      </div>

      {/* Dropdown via Portal */}
      {portalEl &&
        createPortal(
          <div dir={direction}>
            <AnimatePresence>
              {open && (
                <motion.div
                  key="dropdown"
                  ref={dropdownRef}
                  className="rounded-xl border border-border-strong bg-surface shadow-[var(--shadow-elevated)] outline-none ring-1 ring-[color:var(--border-subtle)]"
                  style={pos.style}
                  initial={motionDropdown.initial}
                  animate={motionDropdown.animate}
                  exit={motionDropdown.exit}
                  transition={{ duration: 0.14, ease: "easeOut" }}
                >
                  {/* Search */}
                  {searchable && (
                    <div className="border-b border-border-subtle px-2.5 py-1.5">
                      <div className="flex items-center gap-1.5 rounded-lg bg-surface-soft px-2.5 py-1.5 text-xs text-foreground-muted ring-1 ring-border-subtle focus-within:ring-[color:var(--ring-brand)]">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 14 14"
                          aria-hidden
                        >
                          <circle
                            cx="6"
                            cy="6"
                            r="3.5"
                            stroke="currentColor"
                            strokeWidth="1.2"
                          />
                          <path
                            d="M9 9l3 3"
                            stroke="currentColor"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                          />
                        </svg>

                        <input
                          ref={searchRef}
                          value={search}
                          onChange={(e) => {
                            setSearch(e.target.value);
                            setActiveIndex(-1);
                          }}
                          onFocus={() => {
                            searchFocusedRef.current = true;
                            placementLockRef.current = null;
                            ensureAnchorVisible();
                            computeAndApplyPosition();
                          }}
                          onBlur={() => {
                            searchFocusedRef.current = false;
                            placementLockRef.current = null;
                            document.documentElement.style.scrollPaddingBottom =
                              "";
                            computeAndApplyPosition();
                          }}
                          placeholder={searchPlaceholder}
                          className="w-full bg-transparent text-[11px] text-foreground outline-none placeholder:text-foreground-soft"
                        />
                      </div>
                    </div>
                  )}

                  {/* Options */}
                  <div
                    ref={listRef}
                    id={listboxId}
                    role="listbox"
                    aria-multiselectable={multiple || undefined}
                    className="scroll-thin overflow-y-auto py-1"
                    style={{ maxHeight: optionsViewportMax }}
                  >
                    {filteredOptions.map((opt, index) => {
                      const selected = selectedSet.has(opt.value);
                      const isActive = activeIndex === index;

                      const showGroupLabel =
                        !!opt.group &&
                        (index === 0 ||
                          filteredOptions[index - 1]?.group !== opt.group);

                      return (
                        <div key={opt.value}>
                          {showGroupLabel && (
                            <div className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-foreground-soft">
                              {opt.group}
                            </div>
                          )}

                          <button
                            id={`${listboxId}-opt-${index}`}
                            type="button"
                            role="option"
                            aria-selected={selected}
                            aria-disabled={opt.disabled || undefined}
                            disabled={opt.disabled}
                            data-option-index={index}
                            onMouseEnter={() => {
                              if (!opt.disabled) setActiveIndex(index);
                            }}
                            onClick={() => handleSelectOption(opt)}
                            className={cn(
                              "flex w-full items-start gap-2 px-3 py-2 text-left text-xs transition",
                              "border border-transparent",
                              isActive && !selected && "bg-surface-soft",
                              selected &&
                                "border-accent-border bg-accent-soft text-foreground-strong",
                              opt.disabled &&
                                "cursor-not-allowed opacity-50 hover:bg-transparent",
                              "cursor-pointer",
                              isRTL && "flex-row-reverse text-right"
                            )}
                          >
                            {opt.icon && (
                              <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-surface-muted text-[10px]">
                                {opt.icon}
                              </span>
                            )}

                            <div className="flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] font-medium text-foreground">
                                  {opt.label}
                                </span>

                                {selected && (
                                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] text-accent-foreground shadow-soft">
                                    ✓
                                  </span>
                                )}
                              </div>

                              {opt.description && (
                                <p className="mt-0.5 text-[10px] text-foreground-muted">
                                  {opt.description}
                                </p>
                              )}
                            </div>
                          </button>
                        </div>
                      );
                    })}

                    {!filteredOptions.length && !showCreateAction && (
                      <div className="px-3 py-3 text-center text-[11px] text-foreground-soft">
                        {noResultsText}
                      </div>
                    )}

                    {showCreateAction && (
                      <button
                        type="button"
                        className={cn(
                          "mt-1 flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-accent transition hover:bg-accent-soft",
                          isRTL && "flex-row-reverse text-right"
                        )}
                        onClick={() => {
                          if (!onCreateOption) return;
                          const labelToCreate = search.trim();
                          if (!labelToCreate) return;
                          onCreateOption(labelToCreate);
                          setSearch("");
                          setActiveIndex(-1);
                        }}
                      >
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-soft text-[12px]">
                          +
                        </span>
                        <span>
                          إنشاء خيار جديد:
                          <span
                            className={cn(
                              "font-semibold",
                              isRTL ? "me-1" : "ms-1"
                            )}
                          >
                            {search.trim()}
                          </span>
                        </span>
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>,
          portalEl
        )}
    </div>
  );
};

export const LocalizedSelect: React.FC<
  Omit<SmartSelectProps, "noResultsText" | "searchPlaceholder" | "clearText">
> = (props) => {
  const t = useTranslations("select");

  return (
    <SmartSelect
      noResultsText={t("noResults")}
      searchPlaceholder={t("searchPlaceholder")}
      clearText={t("clear")}
      {...props}
    />
  );
};
