// design\Select.tsx
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
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useAppSelector } from "@/redux/hooks";
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
   * الحد الأقصى للارتفاع “النظري”.
   * سيتم تقليصه تلقائياً حسب المساحة المتاحة في الشاشة (فوق/تحت).
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

function normalizeValueToArray(
  value: SmartSelectProps["value"],
  multiple: boolean
): string[] {
  // Bug fix: tolerate "wrong shape" values to avoid losing selection in UI.
  // - multiple=true but value is string => treat as [string]
  // - multiple=false but value is string[] => treat as first item
  if (value == null) return [];

  if (Array.isArray(value)) {
    if (multiple) return value;
    return value.length ? [value[0]] : [];
  }

  // string
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
  const listboxId = `${selectId}-listbox`;

  const rootRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  const [placement, setPlacement] = useState<Placement>("bottom");
  const [effectiveMaxHeight, setEffectiveMaxHeight] = useState(maxHeight);

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
  }, []);

  const computePlacement = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;

    const rect = root.getBoundingClientRect();
    const viewportH = window.innerHeight;

    const spaceBelow = viewportH - rect.bottom;
    const spaceAbove = rect.top;

    const isLastQuarter = rect.top >= viewportH * 0.75;
    const shouldOpenTop =
      isLastQuarter || (spaceBelow < 180 && spaceAbove > spaceBelow);

    const nextPlacement: Placement = shouldOpenTop ? "top" : "bottom";
    setPlacement(nextPlacement);

    const available =
      (nextPlacement === "bottom" ? spaceBelow : spaceAbove) - 8;

    // Bug fix: never force a minimum height that exceeds available space.
    // Previously: clamp(..., 140, maxHeight) could overflow the viewport on small screens.
    const safeMax = Math.min(maxHeight, Math.max(0, available));
    setEffectiveMaxHeight(safeMax);
  }, [maxHeight]);

  const openDropdown = useCallback(() => {
    if (disabled) return;
    computePlacement();
    setOpen(true);
    setActiveIndex(-1);
  }, [disabled, computePlacement]);

  const toggleDropdown = useCallback(() => {
    if (disabled) return;

    setOpen((prev) => {
      const next = !prev;

      if (next) {
        computePlacement();
        setActiveIndex(-1);
      } else {
        setActiveIndex(-1);
        setSearch("");
      }

      return next;
    });
  }, [disabled, computePlacement]);

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
    (valueToRemove: string) => {
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

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      const root = rootRef.current;
      if (!root) return;
      if (!root.contains(e.target as Node)) closeDropdown();
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, closeDropdown]);

  // Focus search on open
  useEffect(() => {
    if (!open || !searchable) return;
    searchRef.current?.focus();
  }, [open, searchable]);

  // Emit search term (async backend search)
  useEffect(() => {
    onSearchChange?.(search);
  }, [search, onSearchChange]);

  // Recompute placement while open (resize/scroll)
  useLayoutEffect(() => {
    if (!open) return;

    computePlacement();

    const onUpdate = () => computePlacement();
    window.addEventListener("resize", onUpdate);
    window.addEventListener("scroll", onUpdate, true);

    return () => {
      window.removeEventListener("resize", onUpdate);
      window.removeEventListener("scroll", onUpdate, true);
    };
  }, [open, computePlacement]);

  // Keep activeIndex in range if filtered list changes
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

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;

      // Quick open
      if (!open) {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
          e.preventDefault();
          openDropdown();
        }
        return;
      }

      // Inside dropdown
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
        e.preventDefault();

        const opt = filteredOptions[activeIndex];
        if (opt && !opt.disabled) {
          handleSelectOption(opt);
          return;
        }

        if (showCreateAction && onCreateOption) {
          const labelToCreate = search.trim();
          if (labelToCreate) {
            onCreateOption(labelToCreate);
            setSearch("");
            setActiveIndex(-1);
          }
        }
        return;
      }

      // Remove last chip on Backspace (multi + empty search)
      if (e.key === "Backspace" && multiple && !search) {
        if (selectedValues.length === 0) return;
        e.preventDefault();
        commitChange(selectedValues.slice(0, -1));
      }
    },
    [
      disabled,
      open,
      openDropdown,
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
    ]
  );

  const dropdownPositionClasses =
    placement === "bottom"
      ? "top-full mt-1 origin-top"
      : "bottom-full mb-1 origin-bottom";

  const reservedForSearch = searchable ? 52 : 0;
  const optionsViewportMax = Math.max(
    0,
    Math.floor(effectiveMaxHeight - reservedForSearch)
  );

  const motionDropdown = prefersReducedMotion
    ? { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 } }
    : {
        initial: {
          opacity: 0,
          scale: 0.98,
          y: placement === "bottom" ? 8 : -8,
        },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.98, y: placement === "bottom" ? 8 : -8 },
      };

  return (
    <div
      ref={rootRef}
      dir={direction}
      className={cn(
        "relative inline-flex w-full max-w-md flex-col gap-1 text-foreground",
        className
      )}
      onKeyDown={handleKeyDown}
    >
      {label && (
        <label
          htmlFor={`${selectId}-trigger`}
          className="text-xs font-medium text-foreground-muted"
        >
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        id={`${selectId}-trigger`}
        type="button"
        onClick={toggleDropdown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-xl border shadow-soft outline-none ring-0 transition-all duration-150 ease-out",
          "hover:border-accent-border hover:shadow-[var(--shadow-md)]",
          "focus-visible:ring-2 focus-visible:ring-[color:var(--ring-brand)] focus-visible:ring-offset-1 focus-visible:ring-offset-[color:var(--bg-page)]",
          "disabled:cursor-not-allowed disabled:opacity-60",
          VARIANT_STYLES[variant],
          SIZE_STYLES[size].trigger,
          SIZE_STYLES[size].padding,
          isRTL && "flex-row-reverse"
        )}
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
            <AnimatePresence initial={false}>
              {selectedOptions.slice(0, 3).map((opt) => (
                <motion.span
                  key={opt.value}
                  layout
                  initial={
                    prefersReducedMotion ? false : { opacity: 0, scale: 0.98 }
                  }
                  animate={
                    prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }
                  }
                  exit={
                    prefersReducedMotion
                      ? undefined
                      : { opacity: 0, scale: 0.98 }
                  }
                  transition={{ duration: 0.12 }}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border border-accent-border bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-foreground",
                    isRTL && "flex-row-reverse"
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>{opt.label}</span>
                  <button
                    type="button"
                    className="rounded-full p-0.5 transition hover:bg-[color:var(--brand-soft-bg)]"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveChip(opt.value);
                    }}
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
                </motion.span>
              ))}
            </AnimatePresence>
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
              onClick={handleClear}
              className="rounded-full p-1 text-xs text-foreground-soft transition hover:bg-surface-muted hover:text-foreground"
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
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            key={`dropdown-${placement}`}
            className={cn(
              "absolute z-50 w-full rounded-xl border border-border-strong bg-surface shadow-[var(--shadow-elevated)] outline-none ring-1 ring-[color:var(--border-subtle)]",
              dropdownPositionClasses,
              isRTL ? "right-0" : "left-0"
            )}
            style={{ maxHeight: effectiveMaxHeight }}
            initial={motionDropdown.initial}
            animate={motionDropdown.animate}
            exit={motionDropdown.exit}
            transition={{ duration: 0.16, ease: "easeOut" }}
          >
            {/* Search */}
            {searchable && (
              <div className="border-b border-border-subtle px-2.5 py-1.5">
                <div className="flex items-center gap-1.5 rounded-lg bg-surface-soft px-2.5 py-1.5 text-xs text-foreground-muted ring-1 ring-border-subtle focus-within:ring-[color:var(--ring-brand)]">
                  <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden>
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
              <AnimatePresence initial={false}>
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

                      <motion.button
                        layout
                        type="button"
                        role="option"
                        aria-selected={selected}
                        aria-disabled={opt.disabled || undefined}
                        disabled={opt.disabled}
                        data-option-index={index}
                        onMouseEnter={() => {
                          // Bug-ish UX fix: don't set active on disabled items (prevents Enter confusion)
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
                        initial={
                          prefersReducedMotion ? false : { opacity: 0, y: 6 }
                        }
                        animate={
                          prefersReducedMotion
                            ? undefined
                            : { opacity: 1, y: 0 }
                        }
                        exit={
                          prefersReducedMotion
                            ? undefined
                            : { opacity: 0, y: 6 }
                        }
                        transition={{ duration: 0.12 }}
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
                      </motion.button>
                    </div>
                  );
                })}
              </AnimatePresence>

              {!filteredOptions.length && !showCreateAction && (
                <div className="px-3 py-3 text-center text-[11px] text-foreground-soft">
                  {noResultsText}
                </div>
              )}

              {showCreateAction && (
                <motion.button
                  type="button"
                  className={cn(
                    "mt-1 flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-accent transition",
                    "hover:bg-accent-soft",
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
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                  animate={
                    prefersReducedMotion ? undefined : { opacity: 1, y: 0 }
                  }
                  exit={prefersReducedMotion ? undefined : { opacity: 0, y: 6 }}
                  transition={{ duration: 0.12 }}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-soft text-[12px]">
                    +
                  </span>
                  <span>
                    إنشاء خيار جديد:
                    <span
                      className={cn("font-semibold", isRTL ? "me-1" : "ms-1")}
                    >
                      {search.trim()}
                    </span>
                  </span>
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
