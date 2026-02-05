// app/(public)/playground/de-dater/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocale } from "next-intl";
import { SimpleDatePicker } from "@/design/DeDatePicker";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatISO(value: Date | null) {
  return value ? value.toISOString() : "null";
}

function isRTLLocale(locale: string) {
  const base = locale.split("-")[0]?.toLowerCase() ?? "en";
  return new Set(["ar", "he", "fa", "ur", "ps", "ku"]).has(base);
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
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
      <h2 className="text-sm font-semibold text-foreground-strong text-start">
        {title}
      </h2>
      {desc && (
        <p className="text-xs text-foreground-muted text-start">{desc}</p>
      )}
    </div>
    {children}
  </motion.section>
);

export default function DateTimeExamplesPage() {
  const prefersReducedMotion = useReducedMotion();
  const locale = useLocale();
  const dir = useMemo(() => (isRTLLocale(locale) ? "rtl" : "ltr"), [locale]);

  const [dark, setDark] = useState(true);

  // Freeze "now" at mount time to avoid re-creating min/max on every render.
  const now = useMemo(() => new Date(), []);
  const currentYear = now.getFullYear();

  // 0) Scheduled publishing (future only)
  const [publishAt, setPublishAt] = useState<Date | null>(null);
  const [submitPublish, setSubmitPublish] = useState(false);

  const minPublish = useMemo(() => now, [now]); // no options before now
  const maxPublish = useMemo(() => addDays(now, 365 * 3), [now]); // allow "far" future (3 years)

  const publishError = useMemo(() => {
    if (!submitPublish) return undefined;
    if (!publishAt)
      return dir === "rtl"
        ? "اختر وقت نشر مستقبلي."
        : "Pick a future publish time.";
    if (publishAt.getTime() < minPublish.getTime())
      return dir === "rtl"
        ? "وقت النشر يجب أن يكون في المستقبل."
        : "Publish time must be in the future.";
    if (publishAt.getTime() > maxPublish.getTime())
      return dir === "rtl"
        ? "الوقت بعيد جدًا. قلّل المدى."
        : "Too far in the future. Reduce the range.";
    return undefined;
  }, [submitPublish, publishAt, minPublish, maxPublish, dir]);

  // 1) Birthday (1950..2010) + minimum age 16
  const [birthday16, setBirthday16] = useState<Date | null>(null);
  const [submitBirthday16, setSubmitBirthday16] = useState(false);

  const minBirthday = useMemo(() => new Date(1950, 0, 1), []);
  const maxBirthdayByAge = useMemo(
    () =>
      // end-of-day for inclusivity
      new Date(
        now.getFullYear() - 16,
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
        999,
      ),
    [now],
  );
  const maxBirthday = useMemo(() => {
    // explicit cap at end of 2010 as requested
    const cap2010 = new Date(2010, 11, 31, 23, 59, 59, 999);
    return maxBirthdayByAge.getTime() > cap2010.getTime()
      ? cap2010
      : maxBirthdayByAge;
  }, [maxBirthdayByAge]);

  const birthday16Error = useMemo(() => {
    if (!submitBirthday16) return undefined;
    if (!birthday16)
      return dir === "rtl" ? "تاريخ الميلاد مطلوب." : "Birthday is required.";

    if (birthday16.getTime() < minBirthday.getTime())
      return dir === "rtl"
        ? "التاريخ يجب أن يكون بعد 1950."
        : "Date must be after 1950.";

    if (birthday16.getTime() > maxBirthday.getTime())
      return dir === "rtl"
        ? "يجب أن يكون عمر المستخدم 16+ (والحد الأقصى 2010)."
        : "User must be 16+ (and max year is capped at 2010).";

    return undefined;
  }, [submitBirthday16, birthday16, minBirthday, maxBirthday, dir]);

  // 2) Episode watch (Date + Time) - strict hour+minute
  const [episodeAt, setEpisodeAt] = useState<Date | null>(null);
  const [episodeTouched, setEpisodeTouched] = useState(false);
  const episodeError =
    episodeTouched && !episodeAt
      ? dir === "rtl"
        ? "اختر تاريخًا ووقتًا صحيحًا (مع الساعة والدقيقة)."
        : "Pick a valid date & time (including hour + minute)."
      : undefined;

  // 3) Restricted range (this year)
  const minThisYear = useMemo(() => new Date(currentYear, 0, 1), [currentYear]);
  const maxThisYear = useMemo(
    () => new Date(currentYear, 11, 31, 23, 59),
    [currentYear],
  );

  const [thisYearPick, setThisYearPick] = useState<Date | null>(null);
  const [touched3, setTouched3] = useState(false);
  const thisYearError =
    touched3 && !thisYearPick
      ? dir === "rtl"
        ? "اختر تاريخًا داخل هذا العام."
        : "Choose a date/time inside this year."
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

    if (!startAt)
      return {
        start: dir === "rtl" ? "البداية مطلوبة." : "Start is required.",
        end: undefined,
      };
    if (!endAt)
      return {
        start: undefined,
        end: dir === "rtl" ? "النهاية مطلوبة." : "End is required.",
      };

    if (startAt.getTime() > endAt.getTime()) {
      return {
        start:
          dir === "rtl"
            ? "البداية يجب أن تكون قبل النهاية."
            : "Start must be before End.",
        end:
          dir === "rtl"
            ? "النهاية يجب أن تكون بعد البداية."
            : "End must be after Start.",
      };
    }

    return { start: undefined, end: undefined };
  }, [submit4, startAt, endAt, dir]);

  // 5) Disabled
  const [disabledValue] = useState<Date | null>(() => new Date());

  // 6) Arabic placeholders + minuteStep (for demo)
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
      ? dir === "rtl"
        ? "اختر ضمن نافذة الوقت (لاحظ دقائق الحدود)."
        : "Pick inside the time window (note boundary minutes)."
      : undefined;

  const pageVariants = prefersReducedMotion
    ? undefined
    : {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.06 } },
      };

  return (
    <div
      dir={dir}
      lang={locale}
      className={cn(
        "min-h-screen bg-background text-foreground flex items-center justify-center",
        dark && "dark",
      )}
    >
      <motion.div
        className="w-full max-w-5xl p-6 space-y-6"
        variants={pageVariants}
        initial={pageVariants ? "hidden" : undefined}
        animate={pageVariants ? "show" : undefined}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-foreground-muted text-start">
            locale: <span className="font-mono">{locale}</span> — dir:{" "}
            <span className="font-mono">{dir}</span>
          </div>

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
          {/* 0 */}
          <Card
            title="0) Schedule a post (Future only) — social publishing"
            desc="No past times. Min = now. Good for scheduling anime/manga posts or announcements."
          >
            <SimpleDatePicker
              label={dir === "rtl" ? "وقت نشر المنشور" : "Post publish time"}
              value={publishAt}
              onChange={setPublishAt}
              withTime
              minuteStep={5}
              minDate={minPublish}
              maxDate={maxPublish}
              error={publishError}
              size="sm"
              variant="solid"
              commitMode="auto"
              allowPartialTime={false}
            />

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                className="rounded-xl border border-border-strong bg-surface-soft px-3 py-2 text-xs shadow-soft hover:bg-surface-muted"
                onClick={() => setSubmitPublish(true)}
              >
                {dir === "rtl" ? "تحقق" : "Validate"}
              </button>

              <button
                type="button"
                className="rounded-xl border border-border-subtle bg-transparent px-3 py-2 text-xs hover:bg-surface-soft"
                onClick={() => {
                  setSubmitPublish(false);
                  setPublishAt(null);
                }}
              >
                {dir === "rtl" ? "إعادة ضبط" : "Reset"}
              </button>
            </div>

            <pre
              dir="ltr"
              className="text-[11px] text-foreground-soft mt-2 font-mono"
            >
              min: {minPublish.toISOString()}
              {"\n"}max: {maxPublish.toISOString()}
              {"\n"}value: {formatISO(publishAt)}
            </pre>
          </Card>

          {/* 1 */}
          <Card
            title="1) Birthday (1950–2010, min age 16) — profile requirement"
            desc="Common for community platforms: enforce age gate + reasonable year range."
          >
            <SimpleDatePicker
              label={dir === "rtl" ? "تاريخ الميلاد" : "Birthday"}
              value={birthday16}
              onChange={setBirthday16}
              withTime={false}
              minDate={minBirthday}
              maxDate={maxBirthday}
              yearOrder="desc"
              error={birthday16Error}
              size="sm"
              variant="solid"
            />

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                className="rounded-xl border border-border-strong bg-surface-soft px-3 py-2 text-xs shadow-soft hover:bg-surface-muted"
                onClick={() => setSubmitBirthday16(true)}
              >
                {dir === "rtl" ? "حفظ" : "Submit"}
              </button>

              <button
                type="button"
                className="rounded-xl border border-border-subtle bg-transparent px-3 py-2 text-xs hover:bg-surface-soft"
                onClick={() => {
                  setSubmitBirthday16(false);
                  setBirthday16(null);
                }}
              >
                {dir === "rtl" ? "إعادة ضبط" : "Reset"}
              </button>
            </div>

            <pre
              dir="ltr"
              className="text-[11px] text-foreground-soft mt-2 font-mono"
            >
              allowed: [{minBirthday.toISOString().slice(0, 10)} ..{" "}
              {maxBirthday.toISOString().slice(0, 10)}]{"\n"}value:{" "}
              {birthday16 ? birthday16.toISOString().slice(0, 10) : "null"}
            </pre>
          </Card>

          {/* 2 */}
          <Card
            title="2) Episode watch (Date + Time) — required"
            desc="Strict mode: hour + minute must be selected to commit."
          >
            <SimpleDatePicker
              label={
                dir === "rtl"
                  ? "موعد مشاهدة الحلقة"
                  : "Episode watch date & time"
              }
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

            <pre
              dir="ltr"
              className="text-[11px] text-foreground-soft mt-2 font-mono"
            >
              value: {formatISO(episodeAt)}
            </pre>
          </Card>

          {/* 3 */}
          <Card
            title="3) Restricted to this year (min/max)"
            desc="Options outside the range become disabled. Incomplete selections stay null."
          >
            <SimpleDatePicker
              label={dir === "rtl" ? "داخل هذا العام فقط" : "This year only"}
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

            <pre
              dir="ltr"
              className="text-[11px] text-foreground-soft mt-2 font-mono"
            >
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
                label={dir === "rtl" ? "البداية" : "Start"}
                value={startAt}
                onChange={setStartAt}
                withTime
                minuteStep={5}
                error={rangeError.start}
                size="sm"
                variant="solid"
              />

              <SimpleDatePicker
                label={dir === "rtl" ? "النهاية" : "End"}
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
                    "border-border-strong bg-surface-soft hover:bg-surface-muted",
                  )}
                  onClick={() => setSubmit4(true)}
                >
                  {dir === "rtl" ? "تحقق من النطاق" : "Validate range"}
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
                  {dir === "rtl" ? "إعادة ضبط" : "Reset"}
                </button>
              </div>

              <pre
                dir="ltr"
                className="text-[11px] text-foreground-soft mt-2 font-mono"
              >
                start: {formatISO(startAt)}
                {"\n"}end: {formatISO(endAt)}
              </pre>
            </div>
          </Card>

          {/* 5 */}
          <Card title="5) Disabled field" desc="Read-only preview.">
            <SimpleDatePicker
              label={dir === "rtl" ? "حقل معطل" : "Disabled"}
              value={disabledValue}
              onChange={() => {}}
              withTime
              disabled
              size="sm"
              variant="solid"
            />
            <p className="text-[11px] text-foreground-soft text-start">
              {dir === "rtl"
                ? "هذا المثال للعرض فقط ولا يمكن تغييره."
                : "This example is display-only; it cannot be changed."}
            </p>
          </Card>

          {/* 6 */}
          <Card
            title="6) Arabic UI + custom placeholders"
            desc="Useful when you want explicit Arabic labels regardless of current locale."
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

            <pre
              dir="ltr"
              className="text-[11px] text-foreground-soft mt-2 font-mono"
            >
              value: {formatISO(arabic)}
            </pre>
          </Card>

          {/* 7 */}
          <Card
            title="7) Boundary minutes + minuteStep"
            desc="min/max have seconds; picker normalizes to minute granularity + shows boundary minutes even if not on step."
          >
            <SimpleDatePicker
              label={
                dir === "rtl"
                  ? "نافذة اليوم (10:07 → 12:52)"
                  : "Today window (10:07 → 12:52)"
              }
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

            <pre
              dir="ltr"
              className="text-[11px] text-foreground-soft mt-2 font-mono"
            >
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
