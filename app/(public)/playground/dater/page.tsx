"use client";

import React, { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SimpleDatePicker } from "@/design/DatePicker";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatISO(value: Date | null) {
  return value ? value.toISOString() : "null";
}

const Card: React.FC<{
  title: string;
  desc?: string;
  children: React.ReactNode;
}> = ({ title, desc, children }) => (
  <motion.section
    variants={{
      hidden: { opacity: 0, y: 10 },
      show: { opacity: 1, y: 0 },
    }}
    className="rounded-2xl border border-border-subtle bg-background-elevated p-4 shadow-soft space-y-3"
  >
    <div className="space-y-1">
      <h2 className="text-sm font-semibold text-foreground-strong">{title}</h2>
      {desc && <p className="text-xs text-foreground-muted">{desc}</p>}
    </div>
    {children}
  </motion.section>
);

export default function DateTimeExamplesPage() {
  const prefersReducedMotion = useReducedMotion();

  const [dark, setDark] = useState(true);

  // Freeze "now" at mount time to avoid re-creating min/max on every render.
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  // 1) Required (Date + Time) - strict hour+minute
  const [episodeAt, setEpisodeAt] = useState<Date | null>(null);
  const [episodeTouched, setEpisodeTouched] = useState(false);
  const episodeError =
    episodeTouched && !episodeAt
      ? "Pick a valid date & time (including hour + minute)."
      : undefined;

  // 2) Date only (required on submit)
  const [birthday, setBirthday] = useState<Date | null>(null);
  const [submit2, setSubmit2] = useState(false);
  const birthdayError =
    submit2 && !birthday ? "Birthday is required." : undefined;

  // 3) Restricted range (this year)
  const minThisYear = useMemo(() => new Date(currentYear, 0, 1), [currentYear]);
  const maxThisYear = useMemo(
    () => new Date(currentYear, 11, 31, 23, 59),
    [currentYear]
  );

  const [thisYearPick, setThisYearPick] = useState<Date | null>(null);
  const [touched3, setTouched3] = useState(false);
  const thisYearError =
    touched3 && !thisYearPick
      ? "Choose a date/time inside this year."
      : undefined;

  // 4) Start/End validation (range)
  const [startAt, setStartAt] = useState<Date | null>(null);
  const [endAt, setEndAt] = useState<Date | null>(null);
  const [submit4, setSubmit4] = useState(false);

  const rangeError = useMemo(() => {
    if (!submit4)
      return {
        start: undefined as string | undefined,
        end: undefined as string | undefined,
      };

    if (!startAt) return { start: "Start is required.", end: undefined };
    if (!endAt) return { start: undefined, end: "End is required." };

    if (startAt.getTime() > endAt.getTime()) {
      return {
        start: "Start must be before End.",
        end: "End must be after Start.",
      };
    }

    return { start: undefined, end: undefined };
  }, [submit4, startAt, endAt]);

  // 5) Disabled
  const [disabledValue] = useState<Date | null>(() => new Date());

  // 6) Arabic placeholders + minuteStep
  const [arabic, setArabic] = useState<Date | null>(null);
  const [touched6, setTouched6] = useState(false);
  const arabicError =
    touched6 && !arabic
      ? "اختر تاريخًا ووقتًا صحيحًا (مع الساعة والدقيقة)."
      : undefined;

  // 7) Boundary minutes with step (min/max not aligned with step)
  const [windowPick, setWindowPick] = useState<Date | null>(null);
  const [touched7, setTouched7] = useState(false);

  const todayWindowMin = useMemo(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate(), 10, 7, 12);
  }, []);

  const todayWindowMax = useMemo(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate(), 12, 52, 45);
  }, []);

  const windowError =
    touched7 && !windowPick
      ? "Pick inside the time window (note boundary minutes)."
      : undefined;

  const pageVariants = prefersReducedMotion
    ? undefined
    : {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.06 } },
      };

  return (
    <div
      className={cn(
        "min-h-screen bg-background text-foreground flex items-center justify-center",
        // Bug fix: toggle now actually applies a theme hook if your CSS relies on `.dark`
        dark && "dark"
      )}
    >
      <motion.div
        className="w-full max-w-5xl p-6 space-y-6"
        variants={pageVariants}
        initial={pageVariants ? "hidden" : undefined}
        animate={pageVariants ? "show" : undefined}
      >
        {/* Theme Toggle */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setDark((v) => !v)}
            aria-pressed={dark}
            className="rounded-full bg-accent-soft text-xs text-foreground-soft px-3 py-1 hover:bg-accent-subtle border border-accent-border shadow-soft transition-colors"
          >
            Toggle {dark ? "light" : "dark"} mode
          </button>
        </div>

        <motion.div
          className="grid gap-4 md:grid-cols-2"
          variants={pageVariants}
          initial={pageVariants ? "hidden" : undefined}
          animate={pageVariants ? "show" : undefined}
        >
          {/* 1 */}
          <Card
            title="1) Episode watch (Date + Time) — required"
            desc="Strict mode: hour + minute must be selected to commit."
          >
            <SimpleDatePicker
              label="Episode watch date & time"
              value={episodeAt}
              onChange={(v) => {
                setEpisodeTouched(true);
                setEpisodeAt(v);
              }}
              withTime
              minuteStep={5}
              error={episodeError}
              size="sm"
              variant="solid"
              commitMode="auto"
              allowPartialTime={false}
            />

            <pre className="text-[11px] text-foreground-soft mt-2">
              value: {formatISO(episodeAt)}
            </pre>
          </Card>

          {/* 2 */}
          <Card
            title="2) Birthday (Date only) — validate on submit"
            desc="Error appears only after clicking “Submit”."
          >
            <SimpleDatePicker
              label="Birthday"
              value={birthday}
              onChange={setBirthday}
              withTime={false}
              error={birthdayError}
              size="sm"
              variant="solid"
            />

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                className="rounded-xl border border-border-strong bg-surface-soft px-3 py-2 text-xs shadow-soft hover:bg-surface-muted"
                onClick={() => setSubmit2(true)}
              >
                Submit
              </button>

              <button
                type="button"
                className="rounded-xl border border-border-subtle bg-transparent px-3 py-2 text-xs hover:bg-surface-soft"
                onClick={() => {
                  setSubmit2(false);
                  setBirthday(null);
                }}
              >
                Reset
              </button>
            </div>

            <pre className="text-[11px] text-foreground-soft mt-2">
              value: {birthday ? birthday.toISOString().slice(0, 10) : "null"}
            </pre>
          </Card>

          {/* 3 */}
          <Card
            title="3) Restricted to this year (min/max)"
            desc="Options outside the range become disabled. Incomplete selections stay null."
          >
            <SimpleDatePicker
              label="This year only"
              value={thisYearPick}
              onChange={(v) => {
                setTouched3(true);
                setThisYearPick(v);
              }}
              minDate={minThisYear}
              maxDate={maxThisYear}
              withTime
              minuteStep={15}
              error={thisYearError}
              size="sm"
              variant="solid"
            />

            <pre className="text-[11px] text-foreground-soft mt-2">
              min: {minThisYear.toISOString()}
              {"\n"}max: {maxThisYear.toISOString()}
              {"\n"}value: {formatISO(thisYearPick)}
            </pre>
          </Card>

          {/* 4 */}
          <Card
            title="4) Range (Start/End) — cross-field validation"
            desc="Validates that Start <= End on submit."
          >
            <div className="space-y-3">
              <SimpleDatePicker
                label="Start"
                value={startAt}
                onChange={setStartAt}
                withTime
                minuteStep={5}
                error={rangeError.start}
                size="sm"
                variant="solid"
              />

              <SimpleDatePicker
                label="End"
                value={endAt}
                onChange={setEndAt}
                withTime
                minuteStep={5}
                error={rangeError.end}
                size="sm"
                variant="solid"
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={cn(
                    "rounded-xl border px-3 py-2 text-xs shadow-soft transition-colors",
                    "border-border-strong bg-surface-soft hover:bg-surface-muted"
                  )}
                  onClick={() => setSubmit4(true)}
                >
                  Validate range
                </button>

                <button
                  type="button"
                  className="rounded-xl border border-border-subtle bg-transparent px-3 py-2 text-xs hover:bg-surface-soft"
                  onClick={() => {
                    setSubmit4(false);
                    setStartAt(null);
                    setEndAt(null);
                  }}
                >
                  Reset
                </button>
              </div>

              <pre className="text-[11px] text-foreground-soft mt-2">
                start: {formatISO(startAt)}
                {"\n"}end: {formatISO(endAt)}
              </pre>
            </div>
          </Card>

          {/* 5 */}
          <Card title="5) Disabled field" desc="Read-only preview.">
            <SimpleDatePicker
              label="Disabled"
              value={disabledValue}
              onChange={() => {}}
              withTime
              disabled
              size="sm"
              variant="solid"
            />
            <p className="text-[11px] text-foreground-soft">
              This example is display-only; it cannot be changed.
            </p>
          </Card>

          {/* 6 */}
          <Card
            title="6) Arabic UI + custom placeholders"
            desc="Uses LocalizedSelect + custom placeholders."
          >
            <SimpleDatePicker
              label="موعد مشاهدة الحلقة"
              value={arabic}
              onChange={(v) => {
                setTouched6(true);
                setArabic(v);
              }}
              withTime
              minuteStep={10}
              placeholderDay="اليوم"
              placeholderMonth="الشهر"
              placeholderYear="السنة"
              placeholderHour="الساعة"
              placeholderMinute="الدقيقة"
              error={arabicError}
              size="sm"
              variant="solid"
            />

            <pre className="text-[11px] text-foreground-soft mt-2">
              value: {formatISO(arabic)}
            </pre>
          </Card>

          {/* 7 */}
          <Card
            title="7) Boundary minutes + minuteStep"
            desc="min/max have seconds; picker normalizes to minute granularity + shows boundary minutes even if not on step."
          >
            <SimpleDatePicker
              label="Today window (10:07 → 12:52)"
              value={windowPick}
              onChange={(v) => {
                setTouched7(true);
                setWindowPick(v);
              }}
              withTime
              minuteStep={15}
              minDate={todayWindowMin}
              maxDate={todayWindowMax}
              error={windowError}
              size="sm"
              variant="solid"
            />

            <pre className="text-[11px] text-foreground-soft mt-2">
              min: {todayWindowMin.toISOString()}
              {"\n"}max: {todayWindowMax.toISOString()}
              {"\n"}value: {formatISO(windowPick)}
            </pre>
          </Card>
        </motion.div>

        <AnimatePresence />
      </motion.div>
    </div>
  );
}
