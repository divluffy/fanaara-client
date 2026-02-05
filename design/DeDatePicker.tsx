// design\DeDatePicker.tsx
"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocale } from "next-intl";
import { LocalizedSelect, type SelectOption } from "@/design/DeSelect";

type Size = "sm" | "md" | "lg";
type Variant = "solid" | "outline" | "ghost";
type Direction = "ltr" | "rtl";
type YearOrder = "asc" | "desc";

type DateParts = {
  day: string | null;
  month: string | null;
  year: string | null;
  hour: string | null;
  minute: string | null;
};

const EMPTY_PARTS: DateParts = {
  day: null,
  month: null,
  year: null,
  hour: null,
  minute: null,
};

type DateFieldKey = "day" | "month" | "year";
type TimeFieldKey = "hour" | "minute";
type FieldKey = DateFieldKey | TimeFieldKey;

const DATE_FIELDS = [
  "day",
  "month",
  "year",
] as const satisfies readonly DateFieldKey[];
const TIME_FIELDS = [
  "hour",
  "minute",
] as const satisfies readonly TimeFieldKey[];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const pad2 = (n: number) => String(n).padStart(2, "0");

function toInt(v: string | null): number | null {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}
function endOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

function floorToMinute(d: Date) {
  return new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    d.getHours(),
    d.getMinutes(),
    0,
    0,
  );
}
function ceilToMinute(d: Date) {
  const floored = floorToMinute(d);
  return floored.getTime() === d.getTime()
    ? floored
    : new Date(floored.getTime() + 60_000);
}

function normalizeRange(params: { min?: Date; max?: Date }) {
  const { min, max } = params;
  if (!min && !max)
    return {
      min: undefined as Date | undefined,
      max: undefined as Date | undefined,
    };
  if (min && max && min.getTime() > max.getTime())
    return { min: max, max: min };
  return { min, max };
}

/**
 * Outside means: the whole bucket [rangeStart..rangeEnd] is completely out of [min..max].
 * If there's overlap => allowed.
 */
function isRangeOutside(
  rangeStart: Date,
  rangeEnd: Date,
  min?: Date,
  max?: Date,
) {
  if (max && rangeStart.getTime() > max.getTime()) return true;
  if (min && rangeEnd.getTime() < min.getTime()) return true;
  return false;
}

function daysInMonth(year: number, month1Based: number) {
  return new Date(year, month1Based, 0).getDate();
}

function partsFromDate(d: Date, withTime: boolean): DateParts {
  return {
    day: String(d.getDate()),
    month: String(d.getMonth() + 1),
    year: String(d.getFullYear()),
    hour: withTime ? String(d.getHours()) : null,
    minute: withTime ? String(d.getMinutes()) : null,
  };
}

function makeSafeDate(
  year: number,
  month1Based: number,
  day: number,
  hour: number,
  minute: number,
) {
  const dt = new Date(year, month1Based - 1, day, hour, minute, 0, 0);

  // Guard overflow (e.g. Feb 31 -> Mar 2)
  if (
    dt.getFullYear() !== year ||
    dt.getMonth() !== month1Based - 1 ||
    dt.getDate() !== day ||
    dt.getHours() !== hour ||
    dt.getMinutes() !== minute
  ) {
    return null;
  }
  return dt;
}

function clampDate(d: Date, min?: Date, max?: Date) {
  const t = d.getTime();
  if (min && t < min.getTime()) return new Date(min);
  if (max && t > max.getTime()) return new Date(max);
  return d;
}

function uniqueSortedNumbers(list: number[]) {
  return Array.from(new Set(list)).sort((a, b) => a - b);
}

function defer(fn: () => void) {
  if (typeof queueMicrotask === "function") queueMicrotask(fn);
  else Promise.resolve().then(fn);
}

/** RTL detection */
const RTL_LANGS = new Set(["ar", "he", "fa", "ur", "ps", "ku"]);
function localeToDir(locale: string): Direction {
  const base = locale.split("-")[0]?.toLowerCase() ?? "en";
  return RTL_LANGS.has(base) ? "rtl" : "ltr";
}

/** Derive field order from locale date/time formatting (avoids hard-coded order) */
function pickOrderFromIntl<T extends string>(
  locale: string,
  options: Intl.DateTimeFormatOptions,
  sample: Date,
  allowed: readonly T[],
): T[] {
  try {
    const fmt = new Intl.DateTimeFormat(locale, options);
    const raw = fmt.formatToParts(sample).map((p) => p.type);

    const order: T[] = [];
    for (const t of raw) {
      if (!allowed.includes(t as T)) continue;
      if (!order.includes(t as T)) order.push(t as T);
    }

    if (order.length === allowed.length) return order;
  } catch {
    // ignore
  }

  return [...allowed];
}

function getLocaleDateOrder(locale: string): DateFieldKey[] {
  return pickOrderFromIntl<DateFieldKey>(
    locale,
    { year: "numeric", month: "2-digit", day: "2-digit" },
    new Date(2000, 11, 31),
    DATE_FIELDS,
  );
}

function getLocaleTimeOrder(locale: string): TimeFieldKey[] {
  return pickOrderFromIntl<TimeFieldKey>(
    locale,
    { hour: "2-digit", minute: "2-digit" },
    new Date(2000, 11, 31, 13, 45),
    TIME_FIELDS,
  );
}

export type SimpleDatePickerProps = {
  value: Date | null;
  onChange: (date: Date | null) => void;

  label?: string;

  placeholderDay?: string;
  placeholderMonth?: string;
  placeholderYear?: string;
  placeholderHour?: string;
  placeholderMinute?: string;

  minDate?: Date;
  maxDate?: Date;

  /** if false -> date only (no time selects, commits on Y/M/D) */
  withTime?: boolean;

  /** minutes UI step; boundaries will be included even if not aligned */
  minuteStep?: number;

  disabled?: boolean;
  error?: string;

  /** forwards to DeSelect */
  size?: Size;
  variant?: Variant;

  /** optional: allow year search only; keeps others non-searchable */
  yearSearchable?: boolean;

  /** year order in dropdown (useful for Birthday UX) */
  yearOrder?: YearOrder;

  /**
   * Commit behavior:
   * - "auto" (default): commits whenever selection becomes valid.
   * - "blur": commits only when user leaves the picker.
   */
  commitMode?: "auto" | "blur";

  /**
   * If true, allows selecting date even when time is incomplete (hour/minute missing),
   * and will auto-fill missing time with 00:00. (default: false)
   */
  allowPartialTime?: boolean;

  /** force direction if needed; otherwise derived from locale */
  dir?: Direction;

  className?: string;
};

const SimpleDatePickerImpl: React.FC<SimpleDatePickerProps> = ({
  value,
  onChange,

  label,

  placeholderDay = "Day",
  placeholderMonth = "Month",
  placeholderYear = "Year",
  placeholderHour = "HH",
  placeholderMinute = "MM",

  minDate,
  maxDate,

  withTime = true,
  minuteStep = 5,

  disabled = false,
  error,

  size = "sm",
  variant = "solid",
  yearSearchable = true,
  yearOrder = "asc",

  commitMode = "auto",
  allowPartialTime = false,

  dir,
  className,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const locale = useLocale();

  const effectiveDir: Direction = dir ?? localeToDir(locale);
  const dateOrder = useMemo(() => getLocaleDateOrder(locale), [locale]);
  const timeOrder = useMemo(() => getLocaleTimeOrder(locale), [locale]);

  const rootRef = useRef<HTMLDivElement | null>(null);

  // Draft parts shown in the UI
  const [parts, setParts] = useState<DateParts>(EMPTY_PARTS);

  // True when user is editing and we should avoid overwriting their draft with external updates
  const dirtyRef = useRef(false);

  /**
   * Keep track of the last value that THIS picker emitted via onChange.
   * Important for: commitMode="auto" where we may emit null while parts are partial
   * and the parent reflects value=null back to us; we must NOT wipe the draft.
   */
  const lastEmittedMsRef = useRef<number | null>(
    value ? value.getTime() : null,
  );

  // Last committed Date time (non-null) emitted by this picker (ms)
  const lastCommittedMsRef = useRef<number | null>(
    value ? value.getTime() : null,
  );

  /**
   * commitMode="blur" uses a pending slot.
   * - undefined => no pending changes
   * - null / Date => pending value to emit on blur/leave
   */
  const pendingCommitRef = useRef<Date | null | undefined>(undefined);

  // Track open state of portaled selects (needed for correct blur logic)
  const openMapRef = useRef<Record<FieldKey, boolean>>({
    day: false,
    month: false,
    year: false,
    hour: false,
    minute: false,
  });

  const anyDropdownOpen = useCallback(() => {
    const m = openMapRef.current;
    return m.day || m.month || m.year || m.hour || m.minute;
  }, []);

  const { minEff, maxEff } = useMemo(() => {
    const minRaw = minDate
      ? withTime
        ? ceilToMinute(minDate)
        : startOfDay(minDate)
      : undefined;

    const maxRaw = maxDate
      ? withTime
        ? floorToMinute(maxDate)
        : endOfDay(maxDate)
      : undefined;

    const normalized = normalizeRange({ min: minRaw, max: maxRaw });
    return { minEff: normalized.min, maxEff: normalized.max };
  }, [minDate, maxDate, withTime]);

  // Localized month labels (reacts to locale changes)
  const monthLabels = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { month: "short" });
    return Array.from({ length: 12 }, (_, i) =>
      fmt.format(new Date(2000, i, 1)),
    );
  }, [locale]);

  // Sync draft from external value (but don't wipe user's draft while they're editing)
  useEffect(() => {
    const incomingMs = value ? value.getTime() : null;

    if (dirtyRef.current) {
      // If parent is just reflecting what we emitted (including null), do nothing.
      if (incomingMs === lastEmittedMsRef.current) return;

      // Otherwise: external override/reset -> sync and reset editing state.
      if (!value) {
        setParts(EMPTY_PARTS);
        dirtyRef.current = false;
        pendingCommitRef.current = undefined;
        lastEmittedMsRef.current = null;
        lastCommittedMsRef.current = null;
        return;
      }

      setParts(partsFromDate(value, withTime));
      dirtyRef.current = false;
      pendingCommitRef.current = undefined;
      lastEmittedMsRef.current = incomingMs;
      lastCommittedMsRef.current = incomingMs;
      return;
    }

    // Not dirty: normal sync
    if (!value) {
      setParts(EMPTY_PARTS);
      lastEmittedMsRef.current = null;
      lastCommittedMsRef.current = null;
      return;
    }

    setParts(partsFromDate(value, withTime));
    lastEmittedMsRef.current = incomingMs;
    lastCommittedMsRef.current = incomingMs;
  }, [value, withTime]);

  const y = toInt(parts.year);
  const m = toInt(parts.month);
  const d = toInt(parts.day);
  const hh = toInt(parts.hour);

  const hasYMD = !!y && !!m && !!d;
  const hasHour = hh !== null;

  const maxDayInMonth = useMemo(() => {
    if (!y || !m) return 31;
    return daysInMonth(y, m);
  }, [y, m]);

  const years = useMemo<SelectOption[]>(() => {
    const now = new Date();
    let minY = minEff?.getFullYear() ?? 1970;
    let maxY = maxEff?.getFullYear() ?? now.getFullYear() + 10;

    // Keep current value visible even if outside range (display-only)
    if (value) {
      const vy = value.getFullYear();
      if (vy < minY) minY = vy;
      if (vy > maxY) maxY = vy;
    }

    const count = Math.max(0, maxY - minY + 1);
    const arr = Array.from({ length: count }, (_, i) => minY + i);
    if (yearOrder === "desc") arr.reverse();

    return arr.map((yy) => ({ value: String(yy), label: String(yy) }));
  }, [minEff, maxEff, value, yearOrder]);

  const monthOptions = useMemo<SelectOption[]>(() => {
    return monthLabels.map((lbl, idx) => {
      const monthNumber = idx + 1;

      if (!y) {
        return {
          value: String(monthNumber),
          label: lbl,
          description: pad2(monthNumber),
        };
      }

      const monthStart = new Date(y, monthNumber - 1, 1, 0, 0, 0, 0);
      const monthEnd = new Date(y, monthNumber, 0, 23, 59, 59, 999);

      return {
        value: String(monthNumber),
        label: lbl,
        description: pad2(monthNumber),
        disabled: isRangeOutside(monthStart, monthEnd, minEff, maxEff),
      };
    });
  }, [monthLabels, y, minEff, maxEff]);

  const dayOptions = useMemo<SelectOption[]>(() => {
    const count = maxDayInMonth;

    return Array.from({ length: count }, (_, i) => {
      const dd = i + 1;

      if (!y || !m) {
        return { value: String(dd), label: pad2(dd) };
      }

      const dayStart = new Date(y, m - 1, dd, 0, 0, 0, 0);
      const dayEnd = new Date(y, m - 1, dd, 23, 59, 59, 999);

      return {
        value: String(dd),
        label: pad2(dd),
        disabled: isRangeOutside(dayStart, dayEnd, minEff, maxEff),
      };
    });
  }, [maxDayInMonth, y, m, minEff, maxEff]);

  const hourOptions = useMemo<SelectOption[]>(() => {
    return Array.from({ length: 24 }, (_, h) => {
      if (!withTime || !y || !m || !d)
        return { value: String(h), label: pad2(h) };

      const hourStart = new Date(y, m - 1, d, h, 0, 0, 0);
      const hourEnd = new Date(y, m - 1, d, h, 59, 59, 999);

      return {
        value: String(h),
        label: pad2(h),
        disabled: isRangeOutside(hourStart, hourEnd, minEff, maxEff),
      };
    });
  }, [withTime, y, m, d, minEff, maxEff]);

  const minuteOptions = useMemo<SelectOption[]>(() => {
    const step = Math.max(1, Math.floor(minuteStep));

    const base = Array.from(
      { length: Math.ceil(60 / step) },
      (_, i) => i * step,
    ).filter((n) => n < 60);

    // Add boundary minutes (min/max) if on same Y/M/D/hour
    const extra: number[] = [];
    if (withTime && y && m && d && hh !== null) {
      if (
        minEff &&
        minEff.getFullYear() === y &&
        minEff.getMonth() === m - 1 &&
        minEff.getDate() === d &&
        minEff.getHours() === hh
      ) {
        extra.push(minEff.getMinutes());
      }

      if (
        maxEff &&
        maxEff.getFullYear() === y &&
        maxEff.getMonth() === m - 1 &&
        maxEff.getDate() === d &&
        maxEff.getHours() === hh
      ) {
        extra.push(maxEff.getMinutes());
      }
    }

    const minutes = uniqueSortedNumbers([...base, ...extra]);

    return minutes.map((minuteValue) => {
      if (!withTime || !y || !m || !d || hh === null) {
        return { value: String(minuteValue), label: pad2(minuteValue) };
      }

      const candidate = new Date(y, m - 1, d, hh, minuteValue, 0, 0);

      return {
        value: String(minuteValue),
        label: pad2(minuteValue),
        disabled:
          (minEff && candidate.getTime() < minEff.getTime()) ||
          (maxEff && candidate.getTime() > maxEff.getTime()),
      };
    });
  }, [minuteStep, withTime, y, m, d, hh, minEff, maxEff]);

  const computeNext = useCallback(
    (raw: DateParts) => {
      const yy = toInt(raw.year);
      const mm = toInt(raw.month);
      const dd = toInt(raw.day);

      let nextParts = raw;

      // Clamp day when Y/M/D exist
      if (yy && mm && dd) {
        const md = daysInMonth(yy, mm);
        const clampedDay = Math.min(Math.max(dd, 1), md);
        if (clampedDay !== dd)
          nextParts = { ...nextParts, day: String(clampedDay) };
      }

      const dayFinal = toInt(nextParts.day);
      const hasYMDLocal = !!yy && !!mm && !!dayFinal;
      if (!hasYMDLocal) return { parts: nextParts, date: null };

      // Date-only: commit immediately on valid Y/M/D
      if (!withTime) {
        const candidate = makeSafeDate(yy!, mm!, dayFinal!, 0, 0);
        if (!candidate) return { parts: nextParts, date: null };

        const clamped = clampDate(candidate, minEff, maxEff);
        if (clamped.getTime() !== candidate.getTime()) {
          return { parts: partsFromDate(clamped, withTime), date: clamped };
        }
        return { parts: nextParts, date: candidate };
      }

      // withTime=true
      const rawH = toInt(nextParts.hour);
      const rawMin = toInt(nextParts.minute);

      const finalH = allowPartialTime ? (rawH ?? 0) : rawH;
      const finalM = allowPartialTime ? (rawMin ?? 0) : rawMin;

      // Strict time: must have both hour + minute
      if (!allowPartialTime && (finalH === null || finalM === null)) {
        return { parts: nextParts, date: null };
      }

      const candidate = makeSafeDate(
        yy!,
        mm!,
        dayFinal!,
        finalH ?? 0,
        finalM ?? 0,
      );
      if (!candidate) return { parts: nextParts, date: null };

      const clamped = clampDate(candidate, minEff, maxEff);
      if (clamped.getTime() !== candidate.getTime()) {
        return { parts: partsFromDate(clamped, withTime), date: clamped };
      }

      // If we auto-filled time, reflect it back into parts
      if (allowPartialTime) {
        return { parts: partsFromDate(candidate, withTime), date: candidate };
      }

      return { parts: nextParts, date: candidate };
    },
    [allowPartialTime, withTime, minEff, maxEff],
  );

  const pushCommit = useCallback(
    (date: Date | null) => {
      if (commitMode === "auto") {
        lastEmittedMsRef.current = date ? date.getTime() : null;

        // Keep user's draft when date=null (partial/incomplete)
        if (date) {
          lastCommittedMsRef.current = date.getTime();
          dirtyRef.current = false;
        }

        onChange(date);
        return;
      }

      // blur mode: store pending (including null), flush when user leaves picker
      pendingCommitRef.current = date;
    },
    [commitMode, onChange],
  );

  const commitParts = useCallback(
    (rawNext: DateParts) => {
      const { parts: normalized, date } = computeNext(rawNext);
      pushCommit(date);
      return normalized;
    },
    [computeNext, pushCommit],
  );

  const setPart = useCallback(
    <K extends keyof DateParts>(key: K, val: DateParts[K]) => {
      if (disabled) return;

      dirtyRef.current = true;

      setParts((prev) => {
        const rawNext: DateParts = { ...prev, [key]: val };

        // Keep hour/minute always null when withTime=false
        const cleaned = withTime
          ? rawNext
          : { ...rawNext, hour: null, minute: null };

        return commitParts(cleaned);
      });
    },
    [commitParts, disabled, withTime],
  );

  const flushPending = useCallback(() => {
    if (commitMode !== "blur") return;

    const pending = pendingCommitRef.current;
    if (pending === undefined) return; // no interaction -> no-op

    pendingCommitRef.current = undefined;

    lastEmittedMsRef.current = pending ? pending.getTime() : null;

    if (pending) {
      lastCommittedMsRef.current = pending.getTime();
      dirtyRef.current = false;
    }

    onChange(pending);
  }, [commitMode, onChange]);

  const handleBlurCapture = useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      if (commitMode !== "blur") return;

      // IMPORTANT: with portal dropdowns, focus can move outside subtree.
      // If any select dropdown is open, don't flush here.
      if (anyDropdownOpen()) return;

      const nextFocused = e.relatedTarget as Node | null;
      const root = rootRef.current;

      // Flush only when focus leaves the entire picker subtree
      if (!root || !nextFocused || !root.contains(nextFocused)) {
        flushPending();
      }
    },
    [commitMode, anyDropdownOpen, flushPending],
  );

  const onFieldOpenChange = useCallback(
    (field: FieldKey) => (open: boolean) => {
      openMapRef.current[field] = open;

      if (commitMode !== "blur") return;

      // When a dropdown closes, user might have clicked outside.
      // If no dropdowns are open and focus is outside the picker => flush pending.
      if (!open) {
        defer(() => {
          if (anyDropdownOpen()) return;

          const root = rootRef.current;
          const ae = document.activeElement;

          if (root && ae && root.contains(ae)) return;
          flushPending();
        });
      }
    },
    [anyDropdownOpen, commitMode, flushPending],
  );

  const invalid = !!error;

  const selectBaseProps = useMemo(() => {
    return {
      size,
      variant,
      invalid,
      className: cn("w-full max-w-none min-w-0"),
    };
  }, [size, variant, invalid]);

  // Stable handlers (avoid creating closures inside render)
  const onOpenDay = useMemo(
    () => onFieldOpenChange("day"),
    [onFieldOpenChange],
  );
  const onOpenMonth = useMemo(
    () => onFieldOpenChange("month"),
    [onFieldOpenChange],
  );
  const onOpenYear = useMemo(
    () => onFieldOpenChange("year"),
    [onFieldOpenChange],
  );
  const onOpenHour = useMemo(
    () => onFieldOpenChange("hour"),
    [onFieldOpenChange],
  );
  const onOpenMinute = useMemo(
    () => onFieldOpenChange("minute"),
    [onFieldOpenChange],
  );

  const onChangeDay = useCallback(
    (v: unknown) => setPart("day", typeof v === "string" ? v : null),
    [setPart],
  );
  const onChangeMonth = useCallback(
    (v: unknown) => setPart("month", typeof v === "string" ? v : null),
    [setPart],
  );
  const onChangeYear = useCallback(
    (v: unknown) => setPart("year", typeof v === "string" ? v : null),
    [setPart],
  );
  const onChangeHour = useCallback(
    (v: unknown) => setPart("hour", typeof v === "string" ? v : null),
    [setPart],
  );
  const onChangeMinute = useCallback(
    (v: unknown) => setPart("minute", typeof v === "string" ? v : null),
    [setPart],
  );

  const motionContainer = prefersReducedMotion
    ? undefined
    : { initial: { opacity: 0, y: 4 }, animate: { opacity: 1, y: 0 } };

  return (
    <motion.div
      ref={rootRef}
      dir={effectiveDir}
      className={cn("w-full", className)}
      onBlurCapture={handleBlurCapture}
      {...motionContainer}
      transition={{ duration: 0.16, ease: "easeOut" }}
    >
      {label && (
        <label className="mb-1 block text-xs font-medium text-foreground-muted text-start">
          {label}
        </label>
      )}

      {/* Date */}
      <div className="grid grid-cols-3 gap-2">
        {dateOrder.map((field) => {
          switch (field) {
            case "day":
              return (
                <LocalizedSelect
                  key="day"
                  {...selectBaseProps}
                  disabled={disabled}
                  searchable={false}
                  placeholder={placeholderDay}
                  options={dayOptions}
                  value={parts.day}
                  onOpenChange={onOpenDay}
                  onChange={onChangeDay}
                />
              );

            case "month":
              return (
                <LocalizedSelect
                  key="month"
                  {...selectBaseProps}
                  disabled={disabled}
                  searchable={false}
                  placeholder={placeholderMonth}
                  options={monthOptions}
                  value={parts.month}
                  onOpenChange={onOpenMonth}
                  onChange={onChangeMonth}
                />
              );

            case "year":
              return (
                <LocalizedSelect
                  key="year"
                  {...selectBaseProps}
                  disabled={disabled}
                  searchable={yearSearchable}
                  placeholder={placeholderYear}
                  options={years}
                  value={parts.year}
                  onOpenChange={onOpenYear}
                  onChange={onChangeYear}
                />
              );
          }
        })}
      </div>

      {/* Time */}
      <AnimatePresence initial={false}>
        {withTime && (
          <motion.div
            key="time"
            className="mt-2 grid grid-cols-2 gap-2"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: 6 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
          >
            {timeOrder.map((field) => {
              switch (field) {
                case "hour":
                  return (
                    <LocalizedSelect
                      key="hour"
                      {...selectBaseProps}
                      // UX: prevent selecting hour before date
                      disabled={disabled || !hasYMD}
                      searchable={false}
                      placeholder={placeholderHour}
                      options={hourOptions}
                      value={parts.hour}
                      onOpenChange={onOpenHour}
                      onChange={onChangeHour}
                    />
                  );

                case "minute":
                  return (
                    <LocalizedSelect
                      key="minute"
                      {...selectBaseProps}
                      // UX: prevent selecting minute before hour (unless partial time allowed)
                      disabled={
                        disabled || !hasYMD || (!allowPartialTime && !hasHour)
                      }
                      searchable={false}
                      placeholder={placeholderMinute}
                      options={minuteOptions}
                      value={parts.minute}
                      onOpenChange={onOpenMinute}
                      onChange={onChangeMinute}
                    />
                  );
              }
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            className="mt-1 text-[11px] text-danger-500 text-start"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: 4 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const SimpleDatePicker = React.memo(SimpleDatePickerImpl);
SimpleDatePicker.displayName = "SimpleDatePicker";
