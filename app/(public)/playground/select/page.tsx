"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LocalizedSelect, SelectOption } from "@/design/Select";
import { useAppSelector } from "@/store/hooks";

// ---------- helpers (avoid repetitive casts) ----------
type SelectValue = string | string[] | null;

function asString(value: SelectValue): string | null {
  return typeof value === "string" ? value : null;
}

function asStringArray(value: SelectValue): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return [value]; // tolerate shape mismatch safely
  return [];
}

function slugify(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return "";
  return trimmed
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

// =======================
// Shared option datasets
// =======================

const GENRE_OPTIONS: SelectOption[] = [
  {
    value: "shonen",
    label: "Shonen",
    description: "Action, adventure, power-ups",
  },
  {
    value: "seinen",
    label: "Seinen",
    description: "More mature, darker themes",
  },
  {
    value: "shojo",
    label: "Shojo",
    description: "Romance, drama, relationships",
  },
  {
    value: "josei",
    label: "Josei",
    description: "Adult romance / slice of life",
  },
  {
    value: "isekai",
    label: "Isekai",
    description: "Another world / reincarnation",
  },

  // Bug fix for your preset: this value was used but missing from options.
  {
    value: "slice-of-life",
    label: "Slice of Life",
    description: "Chill, daily life, comfy vibes",
  },
];

const TAG_OPTIONS: SelectOption[] = [
  { value: "action", label: "Action", group: "Tone" },
  { value: "comedy", label: "Comedy", group: "Tone" },
  { value: "drama", label: "Drama", group: "Tone" },
  { value: "romance", label: "Romance", group: "Tone" },
  { value: "dark", label: "Dark", group: "Vibe" },
  { value: "wholesome", label: "Wholesome", group: "Vibe" },
  { value: "psychological", label: "Psychological", group: "Vibe" },
];

const CHARACTER_OPTIONS: SelectOption[] = [
  {
    value: "luffy",
    label: "Monkey D. Luffy",
    description: "One Piece",
    icon: <span>🧢</span>,
  },
  {
    value: "naruto",
    label: "Naruto Uzumaki",
    description: "Naruto",
    icon: <span>🍜</span>,
  },
  {
    value: "eren",
    label: "Eren Yeager",
    description: "Attack on Titan",
    icon: <span>🧱</span>,
  },
  {
    value: "mikasa",
    label: "Mikasa Ackerman",
    description: "Attack on Titan",
    icon: <span>⚔️</span>,
  },
  {
    value: "gojo",
    label: "Satoru Gojo",
    description: "Jujutsu Kaisen",
    icon: <span>🕶️</span>,
  },
];

const MEDIA_TYPE_OPTIONS: SelectOption[] = [
  { value: "anime", label: "Anime" },
  { value: "manga", label: "Manga" },
  { value: "manhwa", label: "Manhwa / Webtoon" },
  { value: "comic", label: "Comics" },
];

const STATUS_OPTIONS: SelectOption[] = [
  { value: "ongoing", label: "Ongoing" },
  { value: "finished", label: "Finished" },
  { value: "upcoming", label: "Upcoming" },
  { value: "hiatus", label: "On hiatus" },
];

const SORT_OPTIONS: SelectOption[] = [
  { value: "trending", label: "Trending now" },
  { value: "newest", label: "Newest releases" },
  { value: "top-rated", label: "Top rated" },
  { value: "most-discussed", label: "Most discussed" },
];

const YEAR_OPTIONS: SelectOption[] = Array.from({ length: 10 }, (_, i) => {
  const year = 2025 - i;
  return { value: String(year), label: String(year) };
});

// Admin / roles / monetization

const ROLE_OPTIONS: SelectOption[] = [
  { value: "fan", label: "Fan / Viewer" },
  { value: "creator", label: "Creator / Mangaka" },
  { value: "producer", label: "Producer / Studio" },
  { value: "indie", label: "Indie creator" },
  { value: "moderator", label: "Moderator" },
  { value: "admin", label: "Administrator" },
];

const ADMIN_CONTENT_STATUS: SelectOption[] = [
  { value: "pending", label: "Pending review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "flagged", label: "Flagged / Reported" },
];

const CONTENT_RATING_OPTIONS: SelectOption[] = [
  { value: "all", label: "All ages" },
  { value: "13+", label: "13+" },
  { value: "16+", label: "16+" },
  { value: "18+", label: "18+ / adult" },
];

const MONETIZATION_OPTIONS: SelectOption[] = [
  { value: "free", label: "Free" },
  { value: "ads", label: "Ad-supported" },
  { value: "premium", label: "Premium subscription" },
  { value: "ppc", label: "Pay per chapter" },
];

const RELEASE_SCHEDULE_OPTIONS: SelectOption[] = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "irregular", label: "Irregular" },
];

// Command palette dataset

const COMMAND_ITEMS: SelectOption[] = [
  {
    value: "anime:jjk",
    label: "Jujutsu Kaisen",
    description: "Anime • Shonen • MAPPA",
    icon: <span>✴️</span>,
    group: "Anime",
  },
  {
    value: "anime:aot",
    label: "Attack on Titan",
    description: "Anime • Dark fantasy",
    icon: <span>🧱</span>,
    group: "Anime",
  },
  {
    value: "manga:opm",
    label: "One Punch Man",
    description: "Manga • Action / comedy",
    icon: <span>🥊</span>,
    group: "Manga",
  },
  {
    value: "comic:watchmen",
    label: "Watchmen",
    description: "Comic • DC • Classic",
    icon: <span>⏱️</span>,
    group: "Comics",
  },
  {
    value: "user:dev-luffy",
    label: "dev.luffy",
    description: "User • Indie creator",
    icon: <span>🏴‍☠️</span>,
    group: "Users",
  },
  {
    value: "community:one-piece-ar",
    label: "One Piece AR",
    description: "Community • Arabic fans",
    icon: <span>🏴‍☠️</span>,
    group: "Communities",
  },
];

// Async character search dataset

const ALL_CHARACTERS: SelectOption[] = [
  ...CHARACTER_OPTIONS,
  {
    value: "zoro",
    label: "Roronoa Zoro",
    description: "One Piece",
    icon: <span>⚔️</span>,
  },
  {
    value: "nami",
    label: "Nami",
    description: "One Piece",
    icon: <span>🗺️</span>,
  },
  {
    value: "light",
    label: "Light Yagami",
    description: "Death Note",
    icon: <span>📓</span>,
  },
  {
    value: "lelouch",
    label: "Lelouch Lamperouge",
    description: "Code Geass",
    icon: <span>♟️</span>,
  },
  {
    value: "tanjiro",
    label: "Tanjiro Kamado",
    description: "Demon Slayer",
    icon: <span>🗡️</span>,
  },
  {
    value: "nezuko",
    label: "Nezuko Kamado",
    description: "Demon Slayer",
    icon: <span>🧺</span>,
  },
];

const sectionMotion = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.22, ease: "easeOut" },
};

// =======================
// 1) Basic selectors
// =======================

function BasicSelectorsCard() {
  const [genre, setGenre] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>(["action", "comedy"]);
  const [characters, setCharacters] = useState<string[]>([]);
  const [customTagOptions, setCustomTagOptions] =
    useState<SelectOption[]>(TAG_OPTIONS);
  const [customTags, setCustomTags] = useState<string[]>([]);

  const handleCreateTag = (label: string) => {
    const slug = slugify(label);
    if (!slug) return;

    const exists = customTagOptions.some((o) => o.value === slug);
    if (exists) {
      setCustomTags((prev) => (prev.includes(slug) ? prev : [...prev, slug]));
      return;
    }

    const newOption: SelectOption = {
      value: slug,
      label: label.trim(),
      group: "Custom",
    };

    setCustomTagOptions((prev) => [...prev, newOption]);
    setCustomTags((prev) => [...prev, slug]);
  };

  return (
    <motion.section
      {...sectionMotion}
      className="rounded-2xl border border-border-subtle bg-surface shadow-soft p-4 md:p-6"
    >
      <h2 className="text-sm font-semibold text-foreground-strong">
        الأساسيات: Single / Multi / Search / Creatable
      </h2>
      <p className="mt-1 text-xs text-foreground-muted">
        نفس المكوّن لكن مستخدم لأكثر من سيناريو داخل المنصّة.
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {/* Single select */}
        <div className="space-y-2">
          <LocalizedSelect
            label="Favorite genre"
            placeholder="اختر نوعك الأساسي"
            options={GENRE_OPTIONS}
            value={genre}
            onChange={(val) => setGenre(asString(val))}
            searchable={false}
            multiple={false}
            size="md"
            variant="solid"
          />
          <p className="text-[11px] text-foreground-soft">
            القيمة المختارة:{" "}
            <span className="font-mono text-[11px] text-accent">
              {genre ?? "null"}
            </span>
          </p>
        </div>

        {/* Multi select tags */}
        <div className="space-y-2">
          <LocalizedSelect
            label="Interest tags"
            placeholder="اختر التاغات التي تصف ذوقك"
            options={TAG_OPTIONS}
            value={tags}
            onChange={(val) => setTags(asStringArray(val))}
            multiple
            searchable={false}
            size="md"
            variant="outline"
          />
          <p className="text-[11px] text-foreground-soft">
            التاغات:{" "}
            <span className="font-mono text-[11px]">
              {JSON.stringify(tags)}
            </span>
          </p>
        </div>

        {/* Multi select + search */}
        <div className="space-y-2">
          <LocalizedSelect
            label="Favorite characters"
            placeholder="ابحث عن الشخصيات المفضّلة"
            options={CHARACTER_OPTIONS}
            value={characters}
            onChange={(val) => setCharacters(asStringArray(val))}
            multiple
            searchable
            size="lg"
            variant="solid"
          />
          <p className="text-[11px] text-foreground-soft">
            الشخصيات:{" "}
            <span className="font-mono text-[11px]">
              {JSON.stringify(characters)}
            </span>
          </p>
        </div>

        {/* Creatable multi select */}
        <div className="space-y-2">
          <LocalizedSelect
            label="Custom mood tags"
            placeholder="اكتب لإضافة تاغ جديد أو اختَر من الموجود"
            options={customTagOptions}
            value={customTags}
            onChange={(val) => setCustomTags(asStringArray(val))}
            multiple
            searchable
            creatable
            onCreateOption={handleCreateTag}
            size="md"
            variant="ghost"
          />
          <p className="text-[11px] text-foreground-soft">
            التاغات الخاصة بك:{" "}
            <span className="font-mono text-[11px]">
              {JSON.stringify(customTags)}
            </span>
          </p>
        </div>
      </div>
    </motion.section>
  );
}

// =======================
// 2) Content discovery filter bar
// =======================

function ContentFilterBar() {
  const [mediaType, setMediaType] = useState<string | null>("anime");
  const [filterGenres, setFilterGenres] = useState<string[]>(["shonen"]);
  const [filterTags, setFilterTags] = useState<string[]>(["action"]);
  const [status, setStatus] = useState<string | null>("ongoing");
  const [year, setYear] = useState<string | null>(null);
  const [sort, setSort] = useState<string | null>("trending");

  const applyPreset = (preset: "battle-shonen" | "wholesome") => {
    if (preset === "battle-shonen") {
      setMediaType("anime");
      setFilterGenres(["shonen"]);
      setFilterTags(["action", "drama"]);
      setStatus("ongoing");
      setYear(null);
      setSort("trending");
      return;
    }

    setMediaType("anime");
    setFilterGenres(["slice-of-life"]);
    setFilterTags(["wholesome", "comedy"]);
    setStatus(null);
    setYear(null);
    setSort("top-rated");
  };

  const activeFilters = useMemo(
    () => ({
      mediaType,
      genres: filterGenres,
      tags: filterTags,
      status,
      year,
      sort,
    }),
    [mediaType, filterGenres, filterTags, status, year, sort]
  );

  const activeCount = useMemo(() => {
    let c = 0;
    if (mediaType) c++;
    if (filterGenres.length) c++;
    if (filterTags.length) c++;
    if (status) c++;
    if (year) c++;
    if (sort && sort !== "trending") c++;
    return c;
  }, [mediaType, filterGenres.length, filterTags.length, status, year, sort]);

  return (
    <motion.section
      {...sectionMotion}
      className="rounded-2xl border border-border-subtle bg-surface shadow-soft p-4 md:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground-strong">
            شريط الفلاتر – ديسكفري ومكتبة
          </h2>
          <p className="mt-1 text-xs text-foreground-muted">
            استخدمه لصفحة الـ feed أو مكتبة الأعمال: أنمي، مانجا، مانهو، كومكس…
            إلخ.
          </p>
        </div>
        <span className="rounded-full bg-surface-soft px-3 py-1 text-[11px] text-foreground-muted">
          {activeCount} filters active
        </span>
      </div>

      {/* Quick presets */}
      <div className="mt-4 flex flex-wrap gap-2">
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => applyPreset("battle-shonen")}
          className="inline-flex items-center gap-1 rounded-full border border-warning-soft-border bg-warning-soft px-3 py-1 text-[11px] font-medium text-foreground shadow-soft transition hover:shadow-[var(--shadow-md)]"
        >
          <span>🔥</span>
          <span>Battle Shonen preset</span>
        </motion.button>

        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => applyPreset("wholesome")}
          className="inline-flex items-center gap-1 rounded-full border border-success-soft-border bg-success-soft px-3 py-1 text-[11px] font-medium text-foreground shadow-soft transition hover:shadow-[var(--shadow-md)]"
        >
          <span>🍵</span>
          <span>Wholesome slice-of-life</span>
        </motion.button>
      </div>

      {/* Filters row */}
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <LocalizedSelect
          label="Type"
          placeholder="Anime / Manga / Comics"
          options={MEDIA_TYPE_OPTIONS}
          value={mediaType}
          onChange={(val) => setMediaType(asString(val))}
          multiple={false}
          searchable={false}
          size="sm"
          variant="outline"
        />

        <LocalizedSelect
          label="Genres"
          placeholder="اختر أكثر من نوع"
          options={GENRE_OPTIONS}
          value={filterGenres}
          onChange={(val) => setFilterGenres(asStringArray(val))}
          multiple
          searchable
          size="sm"
          variant="solid"
        />

        <LocalizedSelect
          label="Tags"
          placeholder="Mood / tone / themes"
          options={TAG_OPTIONS}
          value={filterTags}
          onChange={(val) => setFilterTags(asStringArray(val))}
          multiple
          searchable
          size="sm"
          variant="ghost"
        />

        <div className="grid grid-cols-2 gap-3">
          <LocalizedSelect
            label="Status"
            placeholder="Status"
            options={STATUS_OPTIONS}
            value={status}
            onChange={(val) => setStatus(asString(val))}
            multiple={false}
            searchable={false}
            size="sm"
            variant="outline"
          />
          <LocalizedSelect
            label="Year"
            placeholder="Any year"
            options={YEAR_OPTIONS}
            value={year}
            onChange={(val) => setYear(asString(val))}
            multiple={false}
            searchable={false}
            size="sm"
            variant="outline"
          />
        </div>

        <LocalizedSelect
          label="Sort by"
          placeholder="Trending / Newest / Top rated"
          options={SORT_OPTIONS}
          value={sort}
          onChange={(val) => setSort(asString(val))}
          multiple={false}
          searchable={false}
          size="sm"
          variant="outline"
        />
      </div>

      {/* Preview of applied filters */}
      <div className="mt-4 rounded-xl bg-background-soft p-3 text-[11px] text-foreground">
        <div className="flex flex-wrap items-center gap-2">
          {Object.entries(activeFilters).map(([key, val]) => {
            if (!val || (Array.isArray(val) && val.length === 0)) return null;
            return (
              <span
                key={key}
                className="inline-flex items-center gap-1 rounded-full bg-surface-soft px-3 py-1 shadow-soft ring-1 ring-border-subtle"
              >
                <span className="font-medium text-foreground-muted">
                  {key}:
                </span>
                <span className="font-mono text-[10px] text-foreground">
                  {Array.isArray(val) ? val.join(", ") : val}
                </span>
              </span>
            );
          })}
          {!activeCount && (
            <span className="text-[11px] text-foreground-soft">
              لا يوجد فلاتر مفعّلة حاليًا – سيتم إظهار كل شيء.
            </span>
          )}
        </div>
      </div>
    </motion.section>
  );
}

// =======================
// 3) Onboarding wizard
// =======================

function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [mediums, setMediums] = useState<string[]>(["anime", "manga"]);
  const [onboardGenres, setOnboardGenres] = useState<string[]>(["shonen"]);
  const [onboardCharacters, setOnboardCharacters] = useState<string[]>([]);

  const steps = ["Mediums", "Genres", "Characters"];
  const maxStep = steps.length - 1;

  const next = () => {
    if (step < maxStep) {
      setStep((s) => s + 1);
      return;
    }

    console.log("Onboarding payload:", {
      mediums,
      genres: onboardGenres,
      characters: onboardCharacters,
    });
  };

  const back = () => setStep((s) => Math.max(0, s - 1));

  return (
    <motion.section
      {...sectionMotion}
      className="rounded-2xl border border-border-subtle bg-surface shadow-soft p-4 md:p-6"
    >
      <h2 className="text-sm font-semibold text-foreground-strong">
        أونبوردينغ ذكي للمستخدمين الجدد
      </h2>
      <p className="mt-1 text-xs text-foreground-muted">
        3 خطوات سريعة لتجميع تفضيلات المستخدم (يدعم أنمي / مانجا / كومكس).
      </p>

      {/* Step indicator */}
      <div className="mt-4 flex items-center gap-2 text-xs">
        {steps.map((label, index) => {
          const isCurrent = index === step;
          const isDone = index < step;

          return (
            <div key={label} className="flex items-center gap-2">
              <div
                className={[
                  "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold",
                  isCurrent
                    ? "bg-accent text-accent-foreground"
                    : isDone
                    ? "bg-success-solid text-success-foreground"
                    : "bg-surface-muted text-foreground-soft",
                ].join(" ")}
              >
                {index + 1}
              </div>
              <span
                className={[
                  "hidden text-[11px] md:inline",
                  isCurrent
                    ? "font-semibold text-accent"
                    : "text-foreground-muted",
                ].join(" ")}
              >
                {label}
              </span>
              {index < steps.length - 1 && (
                <div className="mx-1 h-px w-6 bg-border-subtle" />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div className="mt-4 space-y-3">
        {step === 0 && (
          <LocalizedSelect
            label="What do you mainly consume?"
            placeholder="Anime, manga, webtoons, comics…"
            options={MEDIA_TYPE_OPTIONS}
            value={mediums}
            onChange={(val) => setMediums(asStringArray(val))}
            multiple
            searchable={false}
            size="md"
            variant="solid"
          />
        )}

        {step === 1 && (
          <LocalizedSelect
            label="Which genres describe your taste?"
            placeholder="يمكنك اختيار أكثر من نوع"
            options={GENRE_OPTIONS}
            value={onboardGenres}
            onChange={(val) => setOnboardGenres(asStringArray(val))}
            multiple
            searchable
            size="md"
            variant="solid"
          />
        )}

        {step === 2 && (
          <LocalizedSelect
            label="Pick a few favorite characters"
            placeholder="هذا يساعد على بناء توصيات أذكى"
            options={CHARACTER_OPTIONS}
            value={onboardCharacters}
            onChange={(val) => setOnboardCharacters(asStringArray(val))}
            multiple
            searchable
            size="md"
            variant="ghost"
          />
        )}
      </div>

      {/* Controls */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={back}
          disabled={step === 0}
          className="inline-flex items-center justify-center rounded-full border border-border-subtle px-4 py-1.5 text-xs font-medium text-foreground-muted transition hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-50"
        >
          رجوع
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="text-[11px] text-foreground-soft underline-offset-2 hover:underline"
            onClick={() => console.log("Onboarding skipped")}
          >
            تخطي لاحقًا
          </button>
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={next}
            className="inline-flex items-center justify-center rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-accent-foreground shadow-soft transition hover:shadow-[var(--shadow-md)]"
          >
            {step === maxStep ? "إنهاء" : "التالي"}
          </motion.button>
        </div>
      </div>

      {/* Summary preview */}
      <div className="mt-4 rounded-xl bg-background-soft p-3 text-[11px] text-foreground">
        <div className="mb-1 font-semibold">
          Preview للبايلود اللي هيتبعت للـ backend:
        </div>
        <pre className="max-h-40 overflow-auto rounded-lg bg-[color:var(--bg-soft-strong)] p-2 font-mono text-[10px] text-success-foreground">
          {JSON.stringify(
            { mediums, genres: onboardGenres, characters: onboardCharacters },
            null,
            2
          )}
        </pre>
      </div>
    </motion.section>
  );
}

// =======================
// 4) Async / backend search demo
// =======================

function AsyncCharacterSelectDemo() {
  const [searchTerm, setSearchTerm] = useState("");
  const [options, setOptions] = useState<SelectOption[]>(
    ALL_CHARACTERS.slice(0, 8)
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);

    const timeout = window.setTimeout(() => {
      if (!alive) return;

      const normalized = searchTerm.trim().toLowerCase();
      const filtered = normalized
        ? ALL_CHARACTERS.filter((c) => {
            const labelMatch = c.label.toLowerCase().includes(normalized);
            const descMatch = c.description?.toLowerCase().includes(normalized);
            return labelMatch || descMatch;
          })
        : ALL_CHARACTERS;

      setOptions(filtered.slice(0, 15));
      setLoading(false);
    }, 400);

    return () => {
      alive = false;
      window.clearTimeout(timeout);
    };
  }, [searchTerm]);

  return (
    <motion.section
      {...sectionMotion}
      className="rounded-2xl border border-border-subtle bg-surface shadow-soft p-4 md:p-6"
    >
      <h2 className="text-sm font-semibold text-foreground-strong">
        Select متصل بالـ Backend (search API)
      </h2>
      <p className="mt-1 text-xs text-foreground-muted">
        عند كتابة أي شيء في البحث، يتم استدعاء API (هنا محاكاة) ويُحدث قائمة
        الشخصيات.
      </p>

      <div className="mt-4 max-w-xl space-y-2">
        <LocalizedSelect
          label="Search characters (anime / manga / comics)"
          placeholder="ابحث باسم الشخصية أو العمل"
          options={options}
          value={selected}
          onChange={(val) => setSelected(asStringArray(val))}
          multiple
          searchable
          size="md"
          variant="solid"
          onSearchChange={(term) => setSearchTerm(term)}
        />

        <div className="flex items-center justify-between text-[11px] text-foreground-soft">
          <span>
            {loading ? "جارٍ جلب النتائج..." : `عدد النتائج: ${options.length}`}
          </span>
          <span>
            Selected:{" "}
            <span className="font-mono text-[10px] text-foreground">
              {JSON.stringify(selected)}
            </span>
          </span>
        </div>
      </div>
    </motion.section>
  );
}

// =======================
// 5) Global Command Palette (Ctrl + K)
// =======================

function GlobalCommandPaletteDemo() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
        setQuery("");
        setActiveIndex(0);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const normalized = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!normalized) return COMMAND_ITEMS;
    return COMMAND_ITEMS.filter((item) => {
      const labelMatch = item.label.toLowerCase().includes(normalized);
      const descMatch = item.description?.toLowerCase().includes(normalized);
      const groupMatch = item.group?.toLowerCase().includes(normalized);
      return labelMatch || descMatch || groupMatch;
    });
  }, [normalized]);

  const handleSelect = (item: SelectOption) => {
    console.log("Command selected:", item.value);
    setOpen(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!filtered.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1 >= filtered.length ? 0 : prev + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 < 0 ? filtered.length - 1 : prev - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = filtered[activeIndex];
      if (item) handleSelect(item);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  return (
    <>
      <motion.section
        {...sectionMotion}
        className="rounded-2xl border border-border-subtle bg-surface shadow-soft p-4 md:p-6"
      >
        <h2 className="text-sm font-semibold text-foreground-strong">
          Global Command Palette (Ctrl + K)
        </h2>
        <p className="mt-1 text-xs text-foreground-muted">
          لوحة أوامر عالمية تتيح للمستخدم البحث عن أنمي/مانجا/كومكس أو مجتمعات
          أو مستخدمين من أي مكان.
        </p>

        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-background-soft p-3 text-xs text-foreground">
          <div>
            <p>جرّب الضغط على:</p>
            <p className="mt-1 font-mono text-[11px] text-foreground-soft">
              Ctrl + K (أو ⌘ + K على الماك)
            </p>
          </div>
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1 rounded-full bg-accent px-4 py-1.5 text-[11px] font-medium text-accent-foreground shadow-soft transition hover:shadow-[var(--shadow-md)]"
          >
            افتح الـ Command Palette
          </motion.button>
        </div>
      </motion.section>

      {/* Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-start justify-center bg-[color:var(--overlay-soft)] px-4 pt-24 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0" onClick={() => setOpen(false)} />

            <motion.div
              className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-border-strong bg-background-elevated text-foreground shadow-[var(--shadow-elevated)]"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <div className="border-b border-border-subtle px-3 py-2">
                <div className="flex items-center gap-2 rounded-lg bg-surface-soft px-3 py-1.5 text-xs text-foreground-muted ring-1 ring-border-subtle">
                  <span className="text-[10px]">⌘K</span>
                  <input
                    autoFocus
                    className="w-full bg-transparent text-[11px] text-foreground outline-none placeholder:text-foreground-soft"
                    placeholder="Search anime, manga, comics, users, communities…"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setActiveIndex(0);
                    }}
                    onKeyDown={handleInputKeyDown}
                  />
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto py-1 text-xs">
                {!filtered.length && (
                  <div className="px-4 py-3 text-foreground-soft">
                    لا توجد نتائج مطابقة.
                  </div>
                )}

                {filtered.map((item, index) => {
                  const isActive = index === activeIndex;
                  const showGroupHeader =
                    item.group &&
                    (index === 0 || filtered[index - 1]?.group !== item.group);

                  return (
                    <div key={item.value}>
                      {showGroupHeader && (
                        <div className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wide text-foreground-soft">
                          {item.group}
                        </div>
                      )}
                      <button
                        type="button"
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => handleSelect(item)}
                        className={[
                          "flex w-full items-center gap-2 px-4 py-2 text-left",
                          isActive
                            ? "bg-accent text-accent-foreground"
                            : "text-foreground hover:bg-surface-soft",
                        ].join(" ")}
                      >
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-soft text-[12px]">
                          {item.icon ?? "★"}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-medium">
                              {item.label}
                            </span>
                            <span className="text-[10px] text-foreground-soft">
                              {item.group}
                            </span>
                          </div>
                          {item.description && (
                            <p className="mt-0.5 text-[10px] text-foreground-soft">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between border-t border-border-subtle px-4 py-2 text-[10px] text-foreground-soft">
                <span>↑↓ للتنقل • Enter للاختيار • Esc للإغلاق</span>
                <span>Command Palette – منصة الأنمي / المانجا</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// =======================
// 6) Admin + Creator tools
// =======================

function AdminAndCreatorSelectors() {
  const [role, setRole] = useState<string | null>("fan");
  const [adminStatus, setAdminStatus] = useState<string | null>("pending");
  const [rating, setRating] = useState<string | null>("all");
  const [monetization, setMonetization] = useState<string | null>("free");
  const [schedule, setSchedule] = useState<string | null>("weekly");
  const [mainMedium, setMainMedium] = useState<string | null>("manga"); // bug fix: was non-editable

  return (
    <motion.section
      {...sectionMotion}
      className="rounded-2xl border border-border-subtle bg-surface shadow-soft p-4 md:p-6"
    >
      <h2 className="text-sm font-semibold text-foreground-strong">
        أدوات الإدارة والمنتجين / المستقلين
      </h2>
      <p className="mt-1 text-xs text-foreground-muted">
        نفس الـ Selects لكن مستخدمة في: صلاحيات المستخدمين، مراجعة المحتوى،
        إعدادات النشر والربح.
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {/* Admin side */}
        <div className="space-y-3 rounded-xl bg-background-soft p-3">
          <h3 className="text-xs font-semibold text-foreground-strong">
            لوحة الإدارة
          </h3>

          <LocalizedSelect
            label="User role"
            placeholder="اختر دور المستخدم"
            options={ROLE_OPTIONS}
            value={role}
            onChange={(val) => setRole(asString(val))}
            multiple={false}
            searchable={false}
            size="sm"
            variant="outline"
          />

          <LocalizedSelect
            label="Content status"
            placeholder="Pending / Approved / Rejected…"
            options={ADMIN_CONTENT_STATUS}
            value={adminStatus}
            onChange={(val) => setAdminStatus(asString(val))}
            multiple={false}
            searchable={false}
            size="sm"
            variant="solid"
          />

          <LocalizedSelect
            label="Content rating"
            placeholder="All ages / 13+ / 16+ / 18+"
            options={CONTENT_RATING_OPTIONS}
            value={rating}
            onChange={(val) => setRating(asString(val))}
            multiple={false}
            searchable={false}
            size="sm"
            variant="ghost"
          />

          <p className="mt-2 text-[11px] text-foreground-soft">
            قيم مناسبة لاستخدامها في لوحة Moderation + فلترة البحث في واجهة
            الجمهور.
          </p>
        </div>

        {/* Creator side */}
        <div className="space-y-3 rounded-xl bg-background-soft p-3">
          <h3 className="text-xs font-semibold text-foreground-strong">
            إعدادات المنتجين / المستقلين
          </h3>

          <LocalizedSelect
            label="Monetization"
            placeholder="Free / Ads / Premium / Pay per chapter"
            options={MONETIZATION_OPTIONS}
            value={monetization}
            onChange={(val) => setMonetization(asString(val))}
            multiple={false}
            searchable={false}
            size="sm"
            variant="solid"
          />

          <LocalizedSelect
            label="Release schedule"
            placeholder="Weekly, monthly, irregular…"
            options={RELEASE_SCHEDULE_OPTIONS}
            value={schedule}
            onChange={(val) => setSchedule(asString(val))}
            multiple={false}
            searchable={false}
            size="sm"
            variant="outline"
          />

          <LocalizedSelect
            label="Main medium for this project"
            placeholder="Anime / manga / comic…"
            options={MEDIA_TYPE_OPTIONS}
            value={mainMedium}
            onChange={(val) => setMainMedium(asString(val))}
            multiple={false}
            searchable={false}
            size="sm"
            variant="ghost"
          />

          <p className="mt-2 text-[11px] text-foreground-soft">
            هذه القيم ممكن تدخل مباشرة في جدول الأعمال (Prisma) وتُستخدم في
            صفحات العمل + صفحة المنتج/المستقل.
          </p>
        </div>
      </div>

      {/* Preview payloads */}
      <div className="mt-4 rounded-xl bg-background-soft p-3 text-[11px] text-foreground">
        <div className="mb-1 font-semibold">
          مثال على Payload لحفظ الإعدادات:
        </div>
        <pre className="max-h-40 overflow-auto rounded-lg bg-[color:var(--bg-soft-strong)] p-2 font-mono text-[10px] text-success-foreground">
          {JSON.stringify(
            {
              role,
              moderationStatus: adminStatus,
              rating,
              monetization,
              schedule,
              mainMedium,
            },
            null,
            2
          )}
        </pre>
      </div>
    </motion.section>
  );
}

// =======================
// 7) Page layout
// =======================

export default function SelectorsDemoPage() {
  const isRTL = useAppSelector((s) => s.state.isRTL);

  return (
    <main
      dir={isRTL ? "rtl" : "ltr"}
      className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 bg-background px-4 py-8 text-foreground md:px-8"
    >
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground-strong">
          Selector Playground – منصة الأنمي / المانجا / الكومكس
        </h1>
        <p className="text-sm text-foreground-muted">
          مكوّن Select واحد (SmartSelect / LocalizedSelect) لكن مستخدم في كل
          السيناريوهات: تفضيلات، فلاتر، أونبوردينغ، إدارة، منتجين، ومستقلين.
        </p>
      </header>

      <BasicSelectorsCard />

      <div className="grid gap-6 lg:grid-cols-2">
        <ContentFilterBar />
        <OnboardingFlow />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AsyncCharacterSelectDemo />
        <GlobalCommandPaletteDemo />
      </div>

      <AdminAndCreatorSelectors />
    </main>
  );
}
