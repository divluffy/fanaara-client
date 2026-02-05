// design/DeSelect.tsx
"use client";

import React, {
  useCallback,
  useDeferredValue,
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

const VIRTUALIZE_THRESHOLD = 250;
const OPTION_ROW_H = 44;
const GROUP_ROW_H = 26;
const OVERSCAN = 8;

const SEARCH_BAR_H = 52; // reserved px for search area
const GAP = 8;
const PAD = 10;

// Placement rule: lower third => open top
const LOWER_THIRD_RATIO = 2 / 3;

// Keyboard heuristic
const KEYBOARD_OPEN_DELTA_PX = 80;

type RenderItem =
  | { type: "group"; key: string; label: string }
  | { type: "option"; key: string; option: SelectOption; optionIndex: number };

type MotionDivStyle = React.ComponentProps<typeof motion.div>["style"];
type Placement = "bottom" | "top";

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
    selectedOptions: SelectOption[],
  ) => void;

  label?: string;
  placeholder?: string;
  multiple?: boolean;
  searchable?: boolean;
  disabled?: boolean;

  size?: "sm" | "md" | "lg";
  variant?: "solid" | "outline" | "ghost";

  maxHeight?: number;

  noResultsText?: string;
  searchPlaceholder?: string;
  clearText?: string;

  creatable?: boolean;
  onCreateOption?: (label: string) => void;
  onSearchChange?: (term: string) => void;

  className?: string;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function shallowEqualPos(a: PositionState, b: PositionState) {
  return (
    a.placement === b.placement &&
    a.maxHeight === b.maxHeight &&
    a.x === b.x &&
    a.y === b.y &&
    a.width === b.width
  );
}

function getVisualViewportRect() {
  const vv = typeof window !== "undefined" ? window.visualViewport : null;

  const left = vv?.offsetLeft ?? 0;
  const top = vv?.offsetTop ?? 0;
  const width = vv?.width ?? window.innerWidth;
  const height = vv?.height ?? window.innerHeight;

  return {
    vv,
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
  };
}

function isKeyboardOpen(baselineHeight: number, currentHeight: number) {
  return (
    baselineHeight > 0 &&
    baselineHeight - currentHeight > KEYBOARD_OPEN_DELTA_PX
  );
}

function normalizeValueToArray(
  value: SmartSelectProps["value"],
  multiple: boolean,
): string[] {
  if (value == null) return [];
  if (Array.isArray(value))
    return multiple ? value : value.length ? [value[0]] : [];
  return [value];
}

function buildSelectedOptions(
  options: SelectOption[],
  selectedValues: string[],
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
  dir: 1 | -1,
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

function findScrollParent(el: HTMLElement | null): HTMLElement | null {
  let p = el?.parentElement ?? null;

  while (p) {
    const s = getComputedStyle(p);
    const oy = s.overflowY;
    if ((oy === "auto" || oy === "scroll") && p.scrollHeight > p.clientHeight)
      return p;
    p = p.parentElement;
  }

  return null;
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

type PositionState = {
  placement: Placement;
  maxHeight: number;
  x: number;
  y: number;
  width: number;
};

function findItemIndexAt(offsets: number[], y: number) {
  let lo = 0;
  let hi = offsets.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (offsets[mid] <= y) lo = mid + 1;
    else hi = mid;
  }
  return Math.max(0, lo - 1);
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
  const appState = useAppSelector((s) => s.state);

  // Direction: trust app state, fallback to document if needed
  const direction =
    appState.direction ||
    (typeof document !== "undefined" && document.documentElement.dir === "rtl"
      ? "rtl"
      : "ltr");
  const isRTL = direction === "rtl";

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
  const [renderReady, setRenderReady] = useState(false);

  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  const baselineVvHeightRef = useRef(0);
  const keyboardOpenRef = useRef(false);

  const [scrollTop, setScrollTop] = useState(0);
  const scrollRafRef = useRef<number | null>(null);

  const [pos, setPos] = useState<PositionState>(() => ({
    placement: "bottom",
    maxHeight,
    x: 0,
    y: 0,
    width: 0,
  }));

  const posRafRef = useRef<number | null>(null);

  const searchFocusedRef = useRef(false);
  const placementLockRef = useRef<Placement | null>(null);

  const scrollParentRef = useRef<HTMLElement | null>(null);

  const reservedForSearch = searchable ? SEARCH_BAR_H : 0;
  const optionsViewportMax = Math.max(
    0,
    Math.floor(pos.maxHeight - reservedForSearch),
  );

  // ===== portal mount + scroll parent detect =====
  useEffect(() => {
    setPortalEl(document.body);
  }, []);

  useEffect(() => {
    scrollParentRef.current = findScrollParent(rootRef.current);
  }, []);

  // baseline height refresh when CLOSED
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!open) {
      baselineVvHeightRef.current =
        window.visualViewport?.height ?? window.innerHeight;
      keyboardOpenRef.current = false;
    }
  }, [open]);

  // keep animations clean
  useEffect(() => {
    if (open) setRenderReady(false);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setScrollTop(0);
      if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
      scrollRafRef.current = null;
    }
  }, [open]);

  // ===== derived data =====
  const deferredSearch = useDeferredValue(search);
  const normalizedSearch = useMemo(
    () => deferredSearch.trim().toLowerCase(),
    [deferredSearch],
  );

  const selectedValues = useMemo(
    () => normalizeValueToArray(value, multiple),
    [value, multiple],
  );

  const selectedOptions = useMemo(
    () => buildSelectedOptions(options, selectedValues),
    [options, selectedValues],
  );

  const selectedSet = useMemo(() => new Set(selectedValues), [selectedValues]);
  const hasSelection = selectedOptions.length > 0;

  const indexed = useMemo(() => {
    return options.map((opt) => ({
      opt,
      label: opt.label.toLowerCase(),
      desc: (opt.description ?? "").toLowerCase(),
      group: (opt.group ?? "").toLowerCase(),
    }));
  }, [options]);

  const filteredOptions = useMemo(() => {
    if (!normalizedSearch) return options;

    const term = normalizedSearch;
    return indexed
      .filter(
        ({ label, desc, group }) =>
          label.includes(term) || desc.includes(term) || group.includes(term),
      )
      .map((x) => x.opt);
  }, [options, indexed, normalizedSearch]);

  const shouldVirtualize = filteredOptions.length >= VIRTUALIZE_THRESHOLD;

  const renderItems = useMemo<RenderItem[]>(() => {
    const items: RenderItem[] = [];
    let lastGroup: string | undefined;

    for (let i = 0; i < filteredOptions.length; i++) {
      const opt = filteredOptions[i];
      const g = opt.group;

      if (g && g !== lastGroup)
        items.push({ type: "group", key: `g:${g}`, label: g });

      items.push({
        type: "option",
        key: `o:${opt.value}`,
        option: opt,
        optionIndex: i,
      });

      lastGroup = g;
    }

    return items;
  }, [filteredOptions]);

  const layout = useMemo(() => {
    const offsets = new Array<number>(renderItems.length);
    const optionToItemIndex = new Array<number>(filteredOptions.length).fill(
      -1,
    );

    let total = 0;
    for (let i = 0; i < renderItems.length; i++) {
      offsets[i] = total;

      const it = renderItems[i];
      total += it.type === "group" ? GROUP_ROW_H : OPTION_ROW_H;

      if (it.type === "option") optionToItemIndex[it.optionIndex] = i;
    }

    return { offsets, total, optionToItemIndex };
  }, [renderItems, filteredOptions.length]);

  const showCreateAction = useMemo(() => {
    if (!creatable) return false;
    if (!onCreateOption) return false;
    if (!normalizedSearch) return false;
    return filteredOptions.length === 0;
  }, [creatable, onCreateOption, normalizedSearch, filteredOptions.length]);

  // Estimated dropdown height for better initial placement (avoid flashing/jumps)
  const estimatedDropdownHeight = useMemo(() => {
    const reserved = searchable ? SEARCH_BAR_H : 0;

    // If empty list, we still render a "no results" row or "create row"
    const baseListHeight = layout.total > 0 ? layout.total : OPTION_ROW_H;

    const extraRow = showCreateAction ? OPTION_ROW_H : 0;

    const maxList = Math.max(0, maxHeight - reserved);
    const list = Math.min(baseListHeight + extraRow, maxList);

    return reserved + list;
  }, [searchable, layout.total, showCreateAction, maxHeight]);

  // ===== selection helpers =====
  const closeDropdown = useCallback(() => {
    setOpen(false);
    setRenderReady(false);
    setActiveIndex(-1);
    setSearch("");
    searchFocusedRef.current = false;
    placementLockRef.current = null;
    keyboardOpenRef.current = false;
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
    [onChange, options],
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
    [disabled, multiple, selectedValues, commitChange, closeDropdown],
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (disabled) return;

      commitChange(multiple ? [] : null);
      setSearch("");
      setActiveIndex(-1);
    },
    [disabled, multiple, commitChange],
  );

  const handleRemoveChip = useCallback(
    (e: React.MouseEvent, valueToRemove: string) => {
      e.stopPropagation();
      if (!multiple || disabled) return;
      commitChange(selectedValues.filter((v) => v !== valueToRemove));
    },
    [multiple, disabled, selectedValues, commitChange],
  );

  const moveActive = useCallback(
    (dir: 1 | -1) => {
      const next = findNextEnabledIndex(filteredOptions, activeIndex, dir);
      if (next !== -1) setActiveIndex(next);
    },
    [filteredOptions, activeIndex],
  );

  const getPreferredActiveIndex = useCallback(() => {
    const firstSelected = selectedValues[0];
    if (firstSelected) {
      const idx = filteredOptions.findIndex(
        (o) => o.value === firstSelected && !o.disabled,
      );
      if (idx >= 0) return idx;
    }
    return findFirstEnabledIndex(filteredOptions);
  }, [filteredOptions, selectedValues]);

  // ===== positioning helpers =====
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
    const vv = window.visualViewport;
    const vh = vv?.height ?? window.innerHeight;

    const keyboardInset = Math.max(
      0,
      (baselineVvHeightRef.current || window.innerHeight) - vh,
    );

    const pad = 12;
    const topLimit = pad;
    const bottomLimit = vh - pad;

    if (rect.bottom > bottomLimit) scrollByDelta(rect.bottom - bottomLimit);
    else if (rect.top < topLimit) scrollByDelta(rect.top - topLimit);

    // When keyboard is open, keep trigger away from very bottom.
    if (keyboardInset > KEYBOARD_OPEN_DELTA_PX) {
      const desiredBottom = Math.min(vh * 0.58, vh - pad);
      if (rect.bottom > desiredBottom)
        scrollByDelta(rect.bottom - desiredBottom);
    }
  }, [scrollByDelta]);

  const computeAndApplyPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const vvRect = getVisualViewportRect();

    const visibleTop = vvRect.top + PAD;
    const visibleBottom = vvRect.bottom - PAD;
    const visibleLeft = vvRect.left + PAD;
    const visibleRight = vvRect.right - PAD;

    // Convert rect (visual viewport coords) => layout viewport coords for fixed positioning
    const trigTop = rect.top + vvRect.top;
    const trigBottom = rect.bottom + vvRect.top;
    const trigLeft = rect.left + vvRect.left;

    const currentVvHeight = vvRect.height;
    const keyboardOpenNow = isKeyboardOpen(
      baselineVvHeightRef.current,
      currentVvHeight,
    );

    const spaceAbove = Math.max(0, trigTop - visibleTop - GAP);
    const spaceBelow = Math.max(0, visibleBottom - trigBottom - GAP);

    // Rule (4): lower third => prefer top, otherwise bottom
    const triggerMidY = rect.top + rect.height / 2;
    const inLowerThird = triggerMidY > currentVvHeight * LOWER_THIRD_RATIO;
    const preferredByLocation: Placement = inLowerThird ? "top" : "bottom";

    // Useful minimum height heuristic (search bar + 2 options)
    const minUsefulHeight = Math.min(
      maxHeight,
      reservedForSearch + OPTION_ROW_H * 2,
    );

    const biggerSide: Placement = spaceBelow >= spaceAbove ? "bottom" : "top";
    let nextPlacement: Placement = preferredByLocation;

    // Fallback if preferred side is too tight
    if (
      nextPlacement === "bottom" &&
      spaceBelow < minUsefulHeight &&
      spaceAbove > spaceBelow
    ) {
      nextPlacement = "top";
    }
    if (
      nextPlacement === "top" &&
      spaceAbove < minUsefulHeight &&
      spaceBelow > spaceAbove
    ) {
      nextPlacement = "bottom";
    }

    // Mobile keyboard rule (8): when keyboard opens (esp. with search), prefer top
    if (keyboardOpenNow && searchable) {
      // Prefer top if we have any meaningful space, otherwise fallback to bigger side
      nextPlacement = spaceAbove >= OPTION_ROW_H ? "top" : biggerSide;
    }

    // Lock placement while search input is focused to prevent flip-flop while typing.
    if (searchFocusedRef.current) {
      if (keyboardOpenNow) {
        // force top while keyboard is open
        placementLockRef.current = "top";
      } else if (placementLockRef.current == null) {
        placementLockRef.current = nextPlacement;
      }
      nextPlacement = placementLockRef.current ?? nextPlacement;
    } else {
      placementLockRef.current = null;
    }

    const available = nextPlacement === "bottom" ? spaceBelow : spaceAbove;
    const safeMax = Math.max(0, Math.min(maxHeight, available));

    // Use real content height if mounted, else estimated (better than 0/huge)
    const dropdown = dropdownRef.current;
    const contentHeight = dropdown?.scrollHeight ?? estimatedDropdownHeight;

    const usedHeight = clamp(Math.min(contentHeight, safeMax), 0, safeMax);

    const left = clamp(
      trigLeft,
      visibleLeft,
      Math.max(visibleLeft, visibleRight - rect.width),
    );

    let top =
      nextPlacement === "bottom"
        ? trigBottom + GAP
        : trigTop - GAP - usedHeight;

    top = clamp(
      top,
      visibleTop,
      Math.max(visibleTop, visibleBottom - usedHeight),
    );

    const nextPos: PositionState = {
      placement: nextPlacement,
      maxHeight: safeMax,
      x: left,
      y: top,
      width: rect.width,
    };

    setPos((prev) => (shallowEqualPos(prev, nextPos) ? prev : nextPos));
  }, [estimatedDropdownHeight, maxHeight, reservedForSearch, searchable]);

  const schedulePosition = useCallback(() => {
    if (posRafRef.current) cancelAnimationFrame(posRafRef.current);
    posRafRef.current = requestAnimationFrame(() => {
      posRafRef.current = null;
      computeAndApplyPosition();
    });
  }, [computeAndApplyPosition]);

  // ===== open / toggle =====
  const openDropdown = useCallback(() => {
    if (disabled) return;

    ensureAnchorVisible();

    // Prime position BEFORE mount for smoothness
    computeAndApplyPosition();

    setOpen(true);

    // Requirement (7): if searchable, don't auto-activate any option
    setActiveIndex(searchable ? -1 : getPreferredActiveIndex());
  }, [
    disabled,
    ensureAnchorVisible,
    computeAndApplyPosition,
    searchable,
    getPreferredActiveIndex,
  ]);

  const toggleDropdown = useCallback(() => {
    if (disabled) return;
    if (open) closeDropdown();
    else openDropdown();
  }, [disabled, open, closeDropdown, openDropdown]);

  // ===== outside click (portal-safe) =====
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

    document.addEventListener("pointerdown", onPointerDown, true);
    return () =>
      document.removeEventListener("pointerdown", onPointerDown, true);
  }, [open, closeDropdown]);

  // Emit search term
  useEffect(() => {
    onSearchChange?.(search);
  }, [search, onSearchChange]);

  // While open: reposition on viewport changes + detect keyboard open transitions
  useLayoutEffect(() => {
    if (!open) return;

    const onViewportChange = () => {
      const vv = window.visualViewport;
      const current = vv?.height ?? window.innerHeight;

      const kOpenNow = isKeyboardOpen(baselineVvHeightRef.current, current);

      // Run "ensureAnchorVisible" once when keyboard opens
      if (kOpenNow && !keyboardOpenRef.current) {
        keyboardOpenRef.current = true;

        // In search mode, force the dropdown to stay above
        if (searchable) placementLockRef.current = "top";

        ensureAnchorVisible();
      } else if (!kOpenNow && keyboardOpenRef.current) {
        keyboardOpenRef.current = false;
      }

      schedulePosition();
    };

    // initial
    onViewportChange();

    window.addEventListener("resize", onViewportChange);
    window.addEventListener("scroll", onViewportChange, true);

    const vv = window.visualViewport;
    vv?.addEventListener("resize", onViewportChange);
    vv?.addEventListener("scroll", onViewportChange);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => schedulePosition());
      if (rootRef.current) ro.observe(rootRef.current);
      if (triggerRef.current) ro.observe(triggerRef.current);
      if (dropdownRef.current) ro.observe(dropdownRef.current);
    }

    return () => {
      window.removeEventListener("resize", onViewportChange);
      window.removeEventListener("scroll", onViewportChange, true);
      vv?.removeEventListener("resize", onViewportChange);
      vv?.removeEventListener("scroll", onViewportChange);
      ro?.disconnect();
    };
  }, [open, ensureAnchorVisible, schedulePosition, searchable]);

  // Focus management on open
  useEffect(() => {
    if (!open) return;

    requestAnimationFrame(() => {
      computeAndApplyPosition();
      setRenderReady(true);

      if (searchable && searchRef.current) {
        searchFocusedRef.current = true;

        // Reset placement lock: it will be set by compute when needed
        placementLockRef.current = null;

        searchRef.current.focus();
        searchRef.current.select();
      } else {
        listRef.current?.focus?.();
      }
    });
  }, [open, searchable, computeAndApplyPosition]);

  // Keep activeIndex valid (BUT preserve -1 when searchable open)
  useEffect(() => {
    if (!open) return;
    if (filteredOptions.length === 0) {
      if (activeIndex !== -1) setActiveIndex(-1);
      return;
    }
    if (activeIndex === -1) return;
    if (
      activeIndex < filteredOptions.length &&
      !filteredOptions[activeIndex]?.disabled
    )
      return;

    // if not searchable, snap to preferred enabled
    if (!searchable) setActiveIndex(getPreferredActiveIndex());
  }, [open, activeIndex, filteredOptions, getPreferredActiveIndex, searchable]);

  // Scroll active option into view (virtual + normal)
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const container = listRef.current;
    if (!container) return;

    if (!shouldVirtualize) {
      const el = container.querySelector<HTMLElement>(
        `[data-option-index="${activeIndex}"]`,
      );
      el?.scrollIntoView({ block: "nearest" });
      return;
    }

    const itemIndex = layout.optionToItemIndex[activeIndex];
    if (itemIndex < 0) return;

    const top = layout.offsets[itemIndex];
    const bottom = top + OPTION_ROW_H;
    const viewTop = container.scrollTop;
    const viewBottom = viewTop + optionsViewportMax;

    if (top < viewTop) container.scrollTop = top;
    else if (bottom > viewBottom)
      container.scrollTop = Math.max(0, bottom - optionsViewportMax);
  }, [open, activeIndex, shouldVirtualize, layout, optionsViewportMax]);

  // Global keyboard handler (portal-safe)
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
            schedulePosition();
          }
        }
        return;
      }

      const tag = (e.target as HTMLElement | null)?.tagName;
      const isTextInput = tag === "INPUT" || tag === "TEXTAREA";

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
    schedulePosition,
  ]);

  // cleanup rafs
  useEffect(() => {
    return () => {
      if (posRafRef.current) cancelAnimationFrame(posRafRef.current);
      if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
    };
  }, []);

  const dropdownStyle = useMemo<MotionDivStyle>(() => {
    return {
      position: "fixed",
      top: 0,
      left: 0,
      width: pos.width,
      maxHeight: pos.maxHeight,
      zIndex: 50,
      willChange: "transform,opacity",
      x: pos.x,
      y: pos.y,
      transformOrigin: pos.placement === "bottom" ? "top" : "bottom",
      pointerEvents: renderReady ? "auto" : "none",
    };
  }, [pos, renderReady]);

  const variants = useMemo(() => {
    if (prefersReducedMotion) {
      return {
        hidden: { opacity: 1, scale: 1 },
        visible: { opacity: 1, scale: 1 },
        exit: { opacity: 1, scale: 1 },
      };
    }
    return {
      hidden: { opacity: 0, scale: 0.985 },
      visible: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.985 },
    };
  }, [prefersReducedMotion]);

  const triggerBaseClasses = cn(
    "flex w-full items-center justify-between gap-2 rounded-xl border shadow-soft outline-none ring-0 transition-all duration-150 ease-out",
    "hover:border-accent-border hover:shadow-[var(--shadow-md)]",
    "focus-visible:ring-2 focus-visible:ring-[color:var(--ring-brand)] focus-visible:ring-offset-1 focus-visible:ring-offset-[color:var(--bg-page)]",
    disabled && "cursor-not-allowed opacity-60",
    VARIANT_STYLES[variant],
    SIZE_STYLES[size].trigger,
    SIZE_STYLES[size].padding,
    isRTL && "flex-row-reverse",
  );

  return (
    <div
      ref={rootRef}
      dir={direction}
      className={cn(
        "relative inline-flex w-full max-w-md flex-col gap-1 text-foreground",
        className,
      )}
    >
      {label && (
        <div id={labelId} className="text-xs font-medium text-foreground-muted">
          {label}
        </div>
      )}

      {/* Trigger (DIV not BUTTON لتجنب nested button داخل chips) */}
      <div
        ref={triggerRef}
        role="combobox"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-labelledby={label ? labelId : undefined}
        aria-autocomplete={searchable ? "list" : "none"}
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
              return;
            }
          } else {
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
            isRTL && "flex-row-reverse",
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
                    isRTL && "flex-row-reverse",
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
              "transition-transform",
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

      {portalEl &&
        createPortal(
          <div dir={direction}>
            <AnimatePresence>
              {open && (
                <motion.div
                  key="dropdown"
                  ref={dropdownRef}
                  className="rounded-xl border border-border-strong bg-surface shadow-[var(--shadow-elevated)] outline-none ring-1 ring-[color:var(--border-subtle)]"
                  style={dropdownStyle}
                  variants={variants}
                  initial="hidden"
                  animate={renderReady ? "visible" : "hidden"}
                  exit="exit"
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { duration: 0.14, ease: "easeOut" }
                  }
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
                          type="search"
                          inputMode="search"
                          enterKeyHint="search"
                          autoCapitalize="none"
                          autoCorrect="off"
                          spellCheck={false}
                          ref={searchRef}
                          value={search}
                          onChange={(e) => {
                            setSearch(e.target.value);
                            // Requirement (7): keep it with no active option while typing
                            setActiveIndex(-1);
                            schedulePosition();
                          }}
                          onFocus={() => {
                            searchFocusedRef.current = true;
                            placementLockRef.current = null;
                            schedulePosition();
                          }}
                          onBlur={() => {
                            searchFocusedRef.current = false;
                            placementLockRef.current = null;
                            schedulePosition();
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
                    aria-labelledby={label ? labelId : undefined}
                    className="scroll-thin overflow-y-auto overscroll-contain py-1"
                    style={{ maxHeight: optionsViewportMax }}
                    tabIndex={-1}
                    onScroll={(e) => {
                      if (!shouldVirtualize) return;
                      const el = e.currentTarget;
                      if (scrollRafRef.current)
                        cancelAnimationFrame(scrollRafRef.current);
                      scrollRafRef.current = requestAnimationFrame(() =>
                        setScrollTop(el.scrollTop),
                      );
                    }}
                  >
                    {(() => {
                      if (!shouldVirtualize) {
                        return (
                          <>
                            {filteredOptions.map((opt, index) => {
                              const selected = selectedSet.has(opt.value);
                              const isActive = activeIndex === index;

                              const showGroupLabel =
                                !!opt.group &&
                                (index === 0 ||
                                  filteredOptions[index - 1]?.group !==
                                    opt.group);

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
                                      isActive &&
                                        !selected &&
                                        "bg-surface-soft",
                                      selected &&
                                        "border-accent-border bg-accent-soft text-foreground-strong",
                                      opt.disabled &&
                                        "cursor-not-allowed opacity-50 hover:bg-transparent",
                                      "cursor-pointer",
                                      isRTL && "flex-row-reverse text-right",
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
                          </>
                        );
                      }

                      // Virtualized rendering
                      const yMax =
                        scrollTop +
                        optionsViewportMax +
                        OVERSCAN * OPTION_ROW_H;

                      const startIdx = Math.max(
                        0,
                        findItemIndexAt(layout.offsets, scrollTop) - OVERSCAN,
                      );

                      let endIdx = startIdx;
                      while (
                        endIdx < renderItems.length &&
                        layout.offsets[endIdx] < yMax
                      )
                        endIdx++;

                      const windowItems = renderItems.slice(startIdx, endIdx);

                      return (
                        <div
                          style={{ height: layout.total, position: "relative" }}
                        >
                          {windowItems.map((it, localI) => {
                            const itemIndex = startIdx + localI;
                            const top = layout.offsets[itemIndex];

                            if (it.type === "group") {
                              return (
                                <div
                                  key={it.key}
                                  style={{
                                    position: "absolute",
                                    top,
                                    left: 0,
                                    right: 0,
                                    height: GROUP_ROW_H,
                                  }}
                                  className="px-3 text-[10px] font-semibold uppercase tracking-wide text-foreground-soft flex items-center"
                                >
                                  {it.label}
                                </div>
                              );
                            }

                            const opt = it.option;
                            const index = it.optionIndex;
                            const selected = selectedSet.has(opt.value);
                            const isActive = activeIndex === index;

                            return (
                              <button
                                key={it.key}
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
                                style={{
                                  position: "absolute",
                                  top,
                                  left: 0,
                                  right: 0,
                                  height: OPTION_ROW_H,
                                }}
                                className={cn(
                                  "flex w-full items-center gap-2 px-3 text-left text-xs transition",
                                  "border border-transparent",
                                  isActive && !selected && "bg-surface-soft",
                                  selected &&
                                    "border-accent-border bg-accent-soft text-foreground-strong",
                                  opt.disabled &&
                                    "cursor-not-allowed opacity-50 hover:bg-transparent",
                                  "cursor-pointer",
                                  isRTL && "flex-row-reverse text-right",
                                )}
                                title={opt.label}
                              >
                                {opt.icon && (
                                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-muted text-[10px]">
                                    {opt.icon}
                                  </span>
                                )}

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="truncate text-[11px] font-medium text-foreground">
                                      {opt.label}
                                    </span>

                                    {selected && (
                                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] text-accent-foreground shadow-soft">
                                        ✓
                                      </span>
                                    )}
                                  </div>
                                  {/* In virtualized mode we intentionally hide description to keep fixed row height */}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      );
                    })()}

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
                          isRTL && "flex-row-reverse text-right",
                        )}
                        onClick={() => {
                          if (!onCreateOption) return;
                          const labelToCreate = search.trim();
                          if (!labelToCreate) return;

                          onCreateOption(labelToCreate);
                          setSearch("");
                          setActiveIndex(-1);
                          schedulePosition();
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
                              isRTL ? "me-1" : "ms-1",
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
          portalEl,
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
