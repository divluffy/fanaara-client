// design\DatePicker.tsx
"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LocalizedSelect, type SelectOption } from "@/design/Select";

type Size = "sm" | "md" | "lg";
type Variant = "solid" | "outline" | "ghost";

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

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const pad2 = (n: number) => String(n).padStart(2, "0");

const MONTH_LABELS = Array.from({ length: 12 }, (_, i) =>
  new Date(2000, i, 1).toLocaleDateString(undefined, { month: "short" }),
);

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
 * "Outside" means the whole bucket [rangeStart..rangeEnd] is completely out of [min..max].
 * If there's overlap -> allowed (better UX).
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

  /** forwards to Select */
  size?: Size;
  variant?: Variant;

  /** optional: allow year search only; keeps others non-searchable */
  yearSearchable?: boolean;

  /**
   * Commit behavior:
   * - "auto" (default): commits whenever selection becomes valid.
   * - "blur": commits only when user leaves last needed field (useful in forms).
   */
  commitMode?: "auto" | "blur";

  /**
   * If true, allows selecting date even when time is incomplete (hour/minute missing),
   * and will auto-fill missing time with 00:00. (default: false)
   */
  allowPartialTime?: boolean;

  className?: string;
};

export const SimpleDatePicker: React.FC<SimpleDatePickerProps> = ({
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

  commitMode = "auto",
  allowPartialTime = false,

  className,
}) => {
  const prefersReducedMotion = useReducedMotion();

  const rootRef = useRef<HTMLDivElement | null>(null);

  // Draft parts shown in the UI
  const [parts, setParts] = useState<DateParts>(EMPTY_PARTS);

  // True when user is editing and we should avoid overwriting their draft with external updates
  const dirtyRef = useRef(false);

  // Last committed Date time (ms). Used to recognize value updates that originated from this picker.
  const lastCommittedMsRef = useRef<number | null>(
    value ? value.getTime() : null,
  );

  /**
   * commitMode="blur" uses a pending slot.
   * - undefined => no pending changes
   * - null / Date => pending value to emit on blur
   */
  const pendingCommitRef = useRef<Date | null | undefined>(undefined);

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

  // Sync draft from external value (but don't wipe user's draft while they're editing)
  useEffect(() => {
    const incomingMs = value ? value.getTime() : null;

    // If the user is editing, only sync when the incoming value matches what we last committed.
    if (dirtyRef.current) {
      if (incomingMs !== null && incomingMs === lastCommittedMsRef.current) {
        setParts(partsFromDate(value!, withTime));
        dirtyRef.current = false;
      }
      return;
    }

    if (!value) {
      setParts(EMPTY_PARTS);
      lastCommittedMsRef.current = null;
      return;
    }

    setParts(partsFromDate(value, withTime));
    lastCommittedMsRef.current = incomingMs;
  }, [value, withTime]);

  const y = toInt(parts.year);
  const m = toInt(parts.month);
  const d = toInt(parts.day);
  const hh = toInt(parts.hour);

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

    const out: SelectOption[] = [];
    for (let yy = minY; yy <= maxY; yy++) {
      out.push({ value: String(yy), label: String(yy) });
    }
    return out;
  }, [minEff, maxEff, value]);

  const monthOptions = useMemo<SelectOption[]>(() => {
    return MONTH_LABELS.map((lbl, idx) => {
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
  }, [y, minEff, maxEff]);

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

      // Clamp day to valid range when Y/M/D exist
      if (yy && mm && dd) {
        const md = daysInMonth(yy, mm);
        const clampedDay = Math.min(Math.max(dd, 1), md);
        if (clampedDay !== dd) {
          nextParts = { ...nextParts, day: String(clampedDay) };
        }
      }

      const dayFinal = toInt(nextParts.day);
      const hasYMD = !!yy && !!mm && !!dayFinal;

      if (!hasYMD) return { parts: nextParts, date: null };

      // Date-only mode: commit as soon as Y/M/D is valid
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
      const rawM = toInt(nextParts.minute);

      const finalH = allowPartialTime ? (rawH ?? 0) : rawH;
      const finalM = allowPartialTime ? (rawM ?? 0) : rawM;

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
        // Important: don't reset dirty when date=null; we want to preserve user's draft.
        if (date) {
          lastCommittedMsRef.current = date.getTime();
          dirtyRef.current = false;
        }
        onChange(date);
        return;
      }

      // blur mode: store pending (including null), but only flush when focus leaves picker
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
    if (pending === undefined) return; // no user interaction -> no-op

    pendingCommitRef.current = undefined;

    if (pending) {
      lastCommittedMsRef.current = pending.getTime();
      dirtyRef.current = false;
    }

    onChange(pending);
  }, [commitMode, onChange]);

  const handleBlurCapture = useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      if (commitMode !== "blur") return;

      const nextFocused = e.relatedTarget as Node | null;
      const root = rootRef.current;

      // Only flush when focus leaves the entire picker subtree
      if (!root || !nextFocused || !root.contains(nextFocused)) {
        flushPending();
      }
    },
    [commitMode, flushPending],
  );

  const selectBaseProps = useMemo(() => {
    return {
      size,
      variant,
      disabled,
      className: cn(
        "w-full max-w-none",
        error &&
          cn(
            "[&>button]:border-danger-500",
            "[&>button]:hover:border-danger-500",
            "[&>button]:focus-visible:ring-[color:var(--ring-danger)]",
          ),
      ),
    };
  }, [size, variant, disabled, error]);

  const searchableShort = false;

  const motionContainer = prefersReducedMotion
    ? undefined
    : { initial: { opacity: 0, y: 4 }, animate: { opacity: 1, y: 0 } };

  return (
    <motion.div
      ref={rootRef}
      className={cn("w-full", className)}
      onBlurCapture={handleBlurCapture}
      {...motionContainer}
      transition={{ duration: 0.16, ease: "easeOut" }}
    >
      {label && (
        <label className="mb-1 block text-xs font-medium text-foreground-muted">
          {label}
        </label>
      )}

      {/* Date */}
      <div className="grid grid-cols-3 gap-2">
        <LocalizedSelect
          {...selectBaseProps}
          searchable={searchableShort}
          placeholder={placeholderDay}
          options={dayOptions}
          value={parts.day}
          onChange={(v) => setPart("day", typeof v === "string" ? v : null)}
        />

        <LocalizedSelect
          {...selectBaseProps}
          searchable={searchableShort}
          placeholder={placeholderMonth}
          options={monthOptions}
          value={parts.month}
          onChange={(v) => setPart("month", typeof v === "string" ? v : null)}
        />

        <LocalizedSelect
          {...selectBaseProps}
          searchable={yearSearchable}
          placeholder={placeholderYear}
          options={years}
          value={parts.year}
          onChange={(v) => setPart("year", typeof v === "string" ? v : null)}
        />
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
            <LocalizedSelect
              {...selectBaseProps}
              searchable={searchableShort}
              placeholder={placeholderHour}
              options={hourOptions}
              value={parts.hour}
              onChange={(v) =>
                setPart("hour", typeof v === "string" ? v : null)
              }
            />

            <LocalizedSelect
              {...selectBaseProps}
              searchable={searchableShort}
              placeholder={placeholderMinute}
              options={minuteOptions}
              value={parts.minute}
              onChange={(v) =>
                setPart("minute", typeof v === "string" ? v : null)
              }
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.p
            className="mt-1 text-[11px] text-danger-500"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: 4 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
