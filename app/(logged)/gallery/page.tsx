// app/(logged)/gallery/_components/GalleryClient.tsx
"use client";

import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import {
  IoAlbumsOutline,
  IoBookmark,
  IoBookmarkOutline,
  IoClose,
  IoEllipsisHorizontal,
  IoEyeOutline,
  IoFilter,
  IoHeart,
  IoHeartOutline,
  IoImagesOutline,
  IoRefreshOutline,
  IoSearchOutline,
  IoShareSocialOutline,
  IoWarningOutline,
} from "react-icons/io5";

// --- Design System (Assumed in your project) ---
import { Button } from "@/design/DeButton";
import { Avatar } from "@/design/DeAvatar";
import DeModal from "@/design/DeModal";
import OptionsSheet from "@/design/DeOptions";

import GalleryMasonrySkeleton from "./_components/GalleryMasonrySkeleton";

/* =========================================================
   Helpers
   ========================================================= */
function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function clampInt(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function formatCompact(n: number, locale = "en") {
  try {
    return new Intl.NumberFormat(locale, {
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: 1,
    }).format(n);
  } catch {
    return String(n);
  }
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function safeLower(s: string) {
  return (s ?? "").toString().trim().toLowerCase();
}

type Category = {
  id: string;
  label: string;
  thumb: string;
  aliases?: string[];
};

type ArtImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
  dominant: string;
};

type Author = {
  id: string;
  name: string;
  username: string;
  avatar: string;
  verified?: boolean;
};

type GalleryWork = {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  images: ArtImage[];
  tags: string[];
  likes: number;
  views: number;
  saves: number;
  createdAtISO: string;
  author: Author;
};

const PAGE_SIZE = 24;

// ✅ 25+ categories (more than 20) with meaningful labels + thumbnails
const CATEGORIES: Category[] = [
  {
    id: "all",
    label: "الكل",
    thumb: "https://picsum.photos/seed/fanaara-all/96/96",
    aliases: ["all", "everything", "كل"],
  },
  {
    id: "one_piece",
    label: "ون بيس",
    thumb: "https://picsum.photos/seed/fanaara-onepiece/96/96",
    aliases: ["one piece", "luffy", "لوفي"],
  },
  {
    id: "naruto",
    label: "ناروتو",
    thumb: "https://picsum.photos/seed/fanaara-naruto/96/96",
    aliases: ["naruto", "ساسكي", "sasuke"],
  },
  {
    id: "bleach",
    label: "بليتش",
    thumb: "https://picsum.photos/seed/fanaara-bleach/96/96",
    aliases: ["bleach", "ichigo", "ايتشيغو"],
  },
  {
    id: "aot",
    label: "هجوم العمالقة",
    thumb: "https://picsum.photos/seed/fanaara-aot/96/96",
    aliases: ["aot", "attack on titan", "eren", "ايرين"],
  },
  {
    id: "jjk",
    label: "جوجوتسو",
    thumb: "https://picsum.photos/seed/fanaara-jjk/96/96",
    aliases: ["jjk", "jujutsu", "gojo", "غوجو"],
  },
  {
    id: "ds",
    label: "قاتل الشياطين",
    thumb: "https://picsum.photos/seed/fanaara-ds/96/96",
    aliases: ["demon slayer", "kimetsu", "tanjiro", "تانجيرو"],
  },
  {
    id: "mha",
    label: "هيرو أكاديميا",
    thumb: "https://picsum.photos/seed/fanaara-mha/96/96",
    aliases: ["mha", "my hero", "deku", "ديكو"],
  },
  {
    id: "hxh",
    label: "هنتر x هنتر",
    thumb: "https://picsum.photos/seed/fanaara-hxh/96/96",
    aliases: ["hxh", "hunter", "gon", "غون"],
  },
  {
    id: "dn",
    label: "ديث نوت",
    thumb: "https://picsum.photos/seed/fanaara-dn/96/96",
    aliases: ["death note", "light", "l", "لايت"],
  },
  {
    id: "csm",
    label: "تشينساو مان",
    thumb: "https://picsum.photos/seed/fanaara-csm/96/96",
    aliases: ["chainsaw", "denji", "دينجي"],
  },
  {
    id: "spyxf",
    label: "سباي x فاميلي",
    thumb: "https://picsum.photos/seed/fanaara-spyxf/96/96",
    aliases: ["spy family", "anya", "انيا"],
  },
  {
    id: "db",
    label: "دراغون بول",
    thumb: "https://picsum.photos/seed/fanaara-db/96/96",
    aliases: ["dragon ball", "goku", "غوكو"],
  },
  {
    id: "ghibli",
    label: "ستوديو غيبلي",
    thumb: "https://picsum.photos/seed/fanaara-ghibli/96/96",
    aliases: ["ghibli", "totoro", "spirited away"],
  },
  {
    id: "mecha",
    label: "ميكا",
    thumb: "https://picsum.photos/seed/fanaara-mecha/96/96",
    aliases: ["mecha", "gundam", "روبوت"],
  },
  {
    id: "cyberpunk",
    label: "سايبر بانك",
    thumb: "https://picsum.photos/seed/fanaara-cyberpunk/96/96",
    aliases: ["cyber", "neon", "سايبر"],
  },
  {
    id: "fantasy",
    label: "فانتازيا",
    thumb: "https://picsum.photos/seed/fanaara-fantasy/96/96",
    aliases: ["fantasy", "magic", "سحر"],
  },
  {
    id: "romance",
    label: "رومانس",
    thumb: "https://picsum.photos/seed/fanaara-romance/96/96",
    aliases: ["romance", "حب"],
  },
  {
    id: "chibi",
    label: "تشِيبي",
    thumb: "https://picsum.photos/seed/fanaara-chibi/96/96",
    aliases: ["chibi", "cute", "لطيف"],
  },
  {
    id: "cosplay",
    label: "كوسبلاي",
    thumb: "https://picsum.photos/seed/fanaara-cosplay/96/96",
    aliases: ["cosplay", "costume", "كوسبلاي"],
  },
  {
    id: "fanart",
    label: "فان آرت",
    thumb: "https://picsum.photos/seed/fanaara-fanart/96/96",
    aliases: ["fanart", "art", "رسم"],
  },
  {
    id: "panels",
    label: "بانلات مانغا",
    thumb: "https://picsum.photos/seed/fanaara-panels/96/96",
    aliases: ["manga panels", "panel", "مانغا"],
  },
  {
    id: "backgrounds",
    label: "خلفيات",
    thumb: "https://picsum.photos/seed/fanaara-bg/96/96",
    aliases: ["wallpaper", "background", "خلفية"],
  },
  {
    id: "character_design",
    label: "تصميم شخصيات",
    thumb: "https://picsum.photos/seed/fanaara-chardesign/96/96",
    aliases: ["character", "design", "شخصية"],
  },
  {
    id: "landscapes",
    label: "مناظر",
    thumb: "https://picsum.photos/seed/fanaara-land/96/96",
    aliases: ["landscape", "scene", "منظر"],
  },
];

const DOMINANT = [
  "#0ea5e9",
  "#a855f7",
  "#f97316",
  "#22c55e",
  "#e11d48",
  "#64748b",
];

const AUTHORS: Array<Pick<Author, "name" | "username">> = [
  { name: "Kira Senpai", username: "kira" },
  { name: "MangaHaze", username: "mangahaze" },
  { name: "Sora Ink", username: "sora.ink" },
  { name: "NamiSketch", username: "nami.sketch" },
  { name: "Yoru Pixel", username: "yoru.pixel" },
  { name: "Akio", username: "akio" },
  { name: "Rin", username: "rin" },
];

const TITLE_BITS = [
  "Neon Drift",
  "Ink Burst",
  "Silent Panel",
  "Sakura Storm",
  "Shōnen Pulse",
  "Moonlit Slash",
  "Chibi Sparks",
  "Arcane Frame",
  "Skyline Run",
  "Echo Lines",
];

const TAG_POOL = [
  "anime",
  "manga",
  "fanart",
  "digital",
  "sketch",
  "halftone",
  "panel",
  "neon",
  "chibi",
  "cinematic",
  "lineart",
  "aesthetic",
  "vibes",
  "studio",
  "hero",
];

function categoryLabelById(id: string) {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

function createMockWorks(count: number, seedStart: number): {
  items: GalleryWork[];
  nextSeed: number;
} {
  const items: GalleryWork[] = [];

  for (let i = 0; i < count; i++) {
    const seed = seedStart + i;
    const rnd = mulberry32(seed);

    const cat =
      CATEGORIES[1 + Math.floor(rnd() * (CATEGORIES.length - 1))] ??
      CATEGORIES[1];

    const a = AUTHORS[Math.floor(rnd() * AUTHORS.length)] ?? AUTHORS[0];
    const authorId = `u-${Math.floor(rnd() * 1000)}`;
    const author: Author = {
      id: authorId,
      name: a.name,
      username: `@${a.username}`,
      avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(
        `${a.username}-${seed}`,
      )}&backgroundColor=b6e3f4`,
      verified: rnd() > 0.78,
    };

    const multiBias = rnd();
    const imagesCount =
      multiBias > 0.72 ? 4 + Math.floor(rnd() * 3) : 1 + Math.floor(rnd() * 2); // 1-2 غالبًا، أحيانًا 4-6

    const ratios = [0.78, 0.92, 1, 1.2, 1.45, 1.7];
    const ratio = ratios[Math.floor(rnd() * ratios.length)] ?? 1.2;

    const baseW = 900;
    const baseH = Math.max(520, Math.floor(baseW / ratio));

    const dominant = DOMINANT[Math.floor(rnd() * DOMINANT.length)] ?? "#64748b";

    const images: ArtImage[] = Array.from({ length: imagesCount }).map(
      (_, idx) => {
        // small variance per image
        const rr = mulberry32(seed * 999 + idx * 13)();
        const w = baseW;
        const h = Math.max(520, Math.floor(baseH * (0.9 + rr * 0.18)));

        return {
          src: `https://picsum.photos/seed/fanaara-${seed}-${idx}/${w}/${h}`,
          width: w,
          height: h,
          alt: `${cat.label} — ${seed}-${idx}`,
          dominant,
        };
      },
    );

    const likes = Math.floor(rnd() * 5600);
    const views = likes * 3 + Math.floor(rnd() * 18000);
    const saves = Math.floor(likes * (0.15 + rnd() * 0.2));

    const title = `${TITLE_BITS[Math.floor(rnd() * TITLE_BITS.length)] ?? "Ink"} • ${cat.label}`;
    const desc = `لقطة ${cat.label} بإحساس "manga panel" — تفاصيل نظيفة + إضاءة لطيفة.`;

    // tags (include category label in latin form sometimes)
    const tags = Array.from({ length: 4 })
      .map(() => TAG_POOL[Math.floor(rnd() * TAG_POOL.length)] ?? "anime")
      .filter(Boolean);
    tags.unshift(safeLower(cat.id).replace(/_/g, ""));

    const createdAtISO = new Date(
      Date.now() - Math.floor(rnd() * 1000 * 60 * 60 * 24 * 18),
    ).toISOString();

    items.push({
      id: `art-${seed}`,
      title,
      description: desc,
      categoryId: cat.id,
      images,
      tags: Array.from(new Set(tags)).slice(0, 6),
      likes,
      views,
      saves,
      createdAtISO,
      author,
    });
  }

  return { items, nextSeed: seedStart + count };
}

/* =========================================================
   Hooks
   ========================================================= */
function useScrollDirection(threshold = 10) {
  const { scrollY } = useScroll();
  const [direction, setDirection] = useState<"up" | "down">("up");
  const last = useRef(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const diff = latest - last.current;
    if (Math.abs(diff) < threshold) return;
    setDirection(diff > 0 ? "down" : "up");
    last.current = latest;
  });

  return direction;
}

function useResponsiveColumns() {
  const [cols, setCols] = useState(2);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w >= 1536) setCols(6); // 2xl
      else if (w >= 1280) setCols(5); // xl
      else if (w >= 1024) setCols(4); // lg
      else if (w >= 768) setCols(3); // md
      else setCols(2); // sm
    };
    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, []);

  return cols;
}

function useMasonryColumns(items: GalleryWork[], columnCount: number) {
  return useMemo(() => {
    const cols: GalleryWork[][] = Array.from({ length: columnCount }, () => []);
    const heights = new Array(columnCount).fill(0);

    for (const item of items) {
      const first = item.images[0];
      const ratio = first ? first.width / first.height : 1.2;

      const shortest = heights.indexOf(Math.min(...heights));
      cols[shortest].push(item);
      heights[shortest] += 1 / ratio;
    }

    return cols;
  }, [items, columnCount]);
}

/* =========================================================
   UI Parts
   ========================================================= */

type FilterSort = "trending" | "new" | "top";
type Orientation = "all" | "portrait" | "landscape" | "square";

function orientationOf(work: GalleryWork): Orientation {
  const img = work.images[0];
  if (!img) return "all";
  const r = img.width / img.height;
  if (r < 0.9) return "portrait";
  if (r > 1.15) return "landscape";
  return "square";
}

function scoreTrending(work: GalleryWork) {
  // simple heuristic for mock
  return work.likes * 1.3 + work.saves * 1.9 + work.views * 0.05;
}

/* -------------------------
   Search Omni (autocomplete)
   ------------------------- */
type SearchOmniProps = {
  value: string;
  onChange: (v: string) => void;
  onPickCategory: (categoryId: string) => void;
  onOpenFilters: () => void;
  filterBadgeCount: number;
  busy?: boolean;
};

function SearchOmni({
  value,
  onChange,
  onPickCategory,
  onOpenFilters,
  filterBadgeCount,
  busy,
}: SearchOmniProps) {
  const reduce = useReducedMotion();

  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const q = safeLower(value);

  const suggestions = useMemo(() => {
    const allCats = CATEGORIES.filter((c) => c.id !== "all");

    if (!q) {
      // focus-with-empty => show curated set
      return allCats.slice(0, 10);
    }

    const byLabel = allCats.filter((c) => {
      const label = safeLower(c.label);
      const aliases = (c.aliases ?? []).map(safeLower);
      return (
        label.includes(q) ||
        aliases.some((a) => a.includes(q)) ||
        safeLower(c.id).replace(/_/g, "").includes(q.replace(/\s/g, ""))
      );
    });

    return byLabel.slice(0, 12);
  }, [q]);

  const showDropdown = open && (suggestions.length > 0 || q.length > 0);

  // outside click close
  useEffect(() => {
    if (!showDropdown) return;

    const onDown = (e: MouseEvent) => {
      const t = e.target as Node | null;
      if (!t) return;
      if (!rootRef.current?.contains(t)) setOpen(false);
    };

    document.addEventListener("mousedown", onDown, true);
    return () => document.removeEventListener("mousedown", onDown, true);
  }, [showDropdown]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) {
      if (e.key === "ArrowDown") {
        setOpen(true);
        setActiveIndex(0);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setActiveIndex(-1);
      inputRef.current?.blur();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => clampInt(i + 1, 0, suggestions.length - 1));
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => clampInt(i - 1, -1, suggestions.length - 1));
      return;
    }

    if (e.key === "Enter") {
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        e.preventDefault();
        onPickCategory(suggestions[activeIndex].id);
        setOpen(false);
        setActiveIndex(-1);
        return;
      }
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  const variants = reduce
    ? {
        hidden: { opacity: 1, scale: 1 },
        visible: { opacity: 1, scale: 1 },
        exit: { opacity: 1, scale: 1 },
      }
    : {
        hidden: { opacity: 0, y: 6, scale: 0.985 },
        visible: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 6, scale: 0.985 },
      };

  return (
    <div ref={rootRef} className="relative flex-1">
      {/* “Hero moment” halo + underline */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -inset-1 rounded-[999px] opacity-0 blur-lg transition-opacity",
          "bg-gradient-to-r from-extra-cyan-soft via-transparent to-extra-pink-soft",
          "focus-within:opacity-70",
        )}
      />

      <div className="relative">
        <IoSearchOutline className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-[18px] text-foreground-muted" />

        <input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            setOpen(true);
          }}
          onBlur={() => {
            // let click select items
            window.setTimeout(() => setOpen(false), 120);
          }}
          onKeyDown={onKeyDown}
          placeholder="ابحث عن أنمي، شخصية، أو تصنيف…"
          className={cn(
            "h-11 w-full rounded-full border border-border-subtle bg-surface-soft",
            "ps-11 pe-11 text-sm text-foreground outline-none",
            "transition-all",
            "focus:border-accent-border focus:bg-surface focus:ring-4 focus:ring-accent/10",
            busy && "opacity-80",
          )}
          aria-label="Search"
          inputMode="search"
          autoComplete="off"
          spellCheck={false}
        />

        {/* clear */}
        <div className="absolute end-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {value ? (
            <Button
              iconOnly
              size="sm"
              variant="plain"
              tone="neutral"
              shape="circle"
              aria-label="Clear"
              onClick={(e) => {
                e.preventDefault();
                onChange("");
                setActiveIndex(-1);
                inputRef.current?.focus();
              }}
            >
              <IoClose />
            </Button>
          ) : null}

          <Button
            iconOnly
            size="sm"
            variant="soft"
            tone={filterBadgeCount > 0 || open ? "brand" : "neutral"}
            shape="circle"
            aria-label="Filters"
            badgeCount={filterBadgeCount > 0 ? filterBadgeCount : undefined}
            onClick={(e) => {
              e.preventDefault();
              onOpenFilters();
            }}
          >
            <IoFilter />
          </Button>
        </div>

        {/* animated underline */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-x-6 -bottom-1 h-[2px] rounded-full bg-gradient-to-r from-extra-cyan-solid via-accent to-extra-pink-solid opacity-0"
          animate={{
            opacity: open ? 1 : 0,
            scaleX: open ? 1 : 0.6,
          }}
          transition={
            reduce
              ? { duration: 0 }
              : { type: "spring", stiffness: 420, damping: 34 }
          }
          style={{ transformOrigin: "center" }}
        />
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
            transition={
              reduce
                ? { duration: 0 }
                : { type: "spring", stiffness: 360, damping: 30 }
            }
            className={cn(
              "absolute z-50 mt-3 w-full overflow-hidden rounded-2xl border border-border-subtle bg-background-elevated shadow-[var(--shadow-elevated)]",
              "before:content-[''] before:absolute before:-top-1.5 before:start-10 before:size-3 before:rotate-45",
              "before:border before:border-border-subtle before:bg-background-elevated",
            )}
            role="listbox"
            aria-label="Search suggestions"
          >
            <div className="border-b border-border-subtle px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <div className="text-[11px] font-extrabold text-foreground-strong">
                  {q ? "اقتراحات التصنيفات" : "تصنيفات سريعة"}
                </div>

                <div className="text-[11px] text-foreground-muted">
                  {suggestions.length ? `${suggestions.length} نتيجة` : "لا نتائج"}
                </div>
              </div>
            </div>

            <div className="max-h-[340px] overflow-y-auto p-2 app-scroll">
              {suggestions.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {suggestions.map((cat, idx) => {
                    const active = idx === activeIndex;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        role="option"
                        aria-selected={active}
                        onMouseEnter={() => setActiveIndex(idx)}
                        onMouseDown={(e) => e.preventDefault()} // keep focus
                        onClick={() => {
                          onPickCategory(cat.id);
                          setOpen(false);
                          setActiveIndex(-1);
                        }}
                        className={cn(
                          "group relative flex items-center gap-2 rounded-2xl border px-2.5 py-2 text-start",
                          "transition",
                          active
                            ? "border-accent-border bg-accent-soft"
                            : "border-border-subtle bg-surface-soft hover:bg-surface",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                        )}
                      >
                        <span className="relative size-10 overflow-hidden rounded-xl border border-border-subtle bg-surface">
                          <Image
                            src={cat.thumb}
                            alt={cat.label}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[12px] font-black text-foreground-strong">
                            {cat.label}
                          </span>
                          <span className="mt-0.5 block truncate text-[11px] text-foreground-muted">
                            افتح معرض {cat.label} مباشرة
                          </span>
                        </span>

                        <span
                          className={cn(
                            "grid size-8 place-items-center rounded-xl border",
                            active
                              ? "border-accent-border bg-background-elevated text-accent"
                              : "border-border-subtle bg-background-elevated text-foreground-muted",
                          )}
                          aria-hidden="true"
                        >
                          <IoImagesOutline className="text-[16px]" />
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="px-3 py-6 text-center">
                  <div className="mx-auto mb-3 grid size-14 place-items-center rounded-2xl border border-border-subtle bg-surface-soft">
                    <IoWarningOutline className="text-[22px] text-foreground-soft" />
                  </div>
                  <div className="text-sm font-black text-foreground-strong">
                    لا توجد اقتراحات
                  </div>
                  <div className="mt-1 text-[11px] text-foreground-muted">
                    جرّب كلمة أقصر أو اختر تصنيفًا من الشريط.
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------
   Category rail (stickers)
   ------------------------- */
type CategoriesRailProps = {
  activeId: string;
  onChange: (id: string) => void;
};

function CategoriesRail({ activeId, onChange }: CategoriesRailProps) {
  const reduce = useReducedMotion();

  return (
    <LayoutGroup id="cat-rail">
      <div className="app-scroll -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {CATEGORIES.map((cat) => {
          const active = cat.id === activeId;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onChange(cat.id)}
              className={cn(
                "relative shrink-0 select-none",
                "rounded-full border px-1.5 py-1 pe-4",
                "transition",
                active
                  ? "border-transparent"
                  : "border-border-subtle bg-surface-soft hover:border-border-strong hover:bg-surface",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
              )}
            >
              {active && (
                <motion.span
                  layoutId="cat-active-bg"
                  className={cn(
                    "absolute inset-0 rounded-full",
                    "bg-foreground-strong",
                    "shadow-[var(--shadow-sm)]",
                  )}
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 520, damping: 40 }
                  }
                />
              )}

              <span className="relative z-10 flex items-center gap-2">
                <span className="relative size-8 overflow-hidden rounded-full border border-border-subtle bg-surface">
                  <Image
                    src={cat.thumb}
                    alt={cat.label}
                    fill
                    className="object-cover"
                    sizes="32px"
                  />
                </span>
                <span
                  className={cn(
                    "text-xs font-black",
                    active ? "text-background" : "text-foreground-strong",
                  )}
                >
                  {cat.label}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

/* -------------------------
   Gallery Card
   ------------------------- */
type GalleryCardProps = {
  work: GalleryWork;
  isLiked: boolean;
  isSaved: boolean;

  onOpen: (id: string) => void;
  onToggleLike: (id: string) => void;
  onToggleSave: (id: string) => void;
  onOpenOptions: (id: string) => void;
};

const GalleryCard = memo(function GalleryCard({
  work,
  isLiked,
  isSaved,
  onOpen,
  onToggleLike,
  onToggleSave,
  onOpenOptions,
}: GalleryCardProps) {
  const reduce = useReducedMotion();

  const hasMulti = work.images.length > 1;
  const previewMax = Math.min(work.images.length, 3);

  const [hovered, setHovered] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  // raf throttling for scrub preview
  const pendingRef = useRef<{ x: number; w: number } | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const activeIdx = hovered && hasMulti ? previewIndex : 0;
  const activeImg = work.images[activeIdx] ?? work.images[0];

  const ratio = activeImg ? activeImg.width / activeImg.height : 1.2;

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!hasMulti) return;
    const rect = e.currentTarget.getBoundingClientRect();
    pendingRef.current = { x: e.clientX - rect.left, w: rect.width };

    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const p = pendingRef.current;
      if (!p) return;
      const pct = p.w > 0 ? p.x / p.w : 0;
      const next = clampInt(Math.floor(pct * previewMax), 0, previewMax - 1);
      setPreviewIndex((cur) => (cur === next ? cur : next));
    });
  };

  return (
    <motion.article
      layout
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-border-subtle bg-background-elevated",
        "shadow-[var(--shadow-xs)]",
        "transition-shadow",
        "hover:shadow-[var(--shadow-elevated)]",
      )}
      whileHover={
        reduce
          ? undefined
          : {
              y: -2,
            }
      }
      whileTap={reduce ? undefined : { scale: 0.985 }}
      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 34 }}
    >
      {/* Media */}
      <div
        className={cn(
          "relative w-full overflow-hidden cursor-zoom-in",
          "bg-surface-soft",
        )}
        style={{
          aspectRatio: `${ratio}`,
          backgroundColor: activeImg?.dominant ?? "#64748b",
        }}
        onClick={() => onOpen(work.id)}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => {
          setHovered(false);
          setPreviewIndex(0);
        }}
        onPointerMove={onMove}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onOpen(work.id);
        }}
      >
        {/* Main image */}
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={`${work.id}-${activeIdx}`}
            className="absolute inset-0"
            initial={reduce ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? { opacity: 1 } : { opacity: 0 }}
            transition={reduce ? { duration: 0 } : { duration: 0.18, ease: "easeOut" }}
          >
            <Image
              src={activeImg?.src ?? work.images[0]?.src}
              alt={activeImg?.alt ?? work.title}
              fill
              className={cn(
                "object-cover",
                reduce ? "" : "transition-transform duration-700 ease-out group-hover:scale-[1.06]",
              )}
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
            />
          </motion.div>
        </AnimatePresence>

        {/* Halftone overlay (signature touch) */}
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300",
            "group-hover:opacity-[0.14]",
            "[background:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:14px_14px]",
          )}
        />

        {/* Edge fade */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Multi-image badge */}
        {hasMulti && (
          <div className="absolute top-3 start-3 flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-2.5 py-1 text-[11px] font-black text-white backdrop-blur-md">
            <IoAlbumsOutline className="text-[14px]" />
            <span dir="ltr">{work.images.length}</span>
          </div>
        )}

        {/* Hover actions */}
        <div className="absolute top-3 end-3 flex flex-col gap-2 opacity-0 translate-y-[-6px] transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
          <Button
            iconOnly
            size="sm"
            variant={isLiked ? "solid" : "soft"}
            tone="danger"
            shape="circle"
            aria-label="Like"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleLike(work.id);
            }}
          >
            <motion.span
              key={isLiked ? "liked" : "unliked"}
              initial={reduce ? { scale: 1 } : { scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 24 }}
            >
              {isLiked ? <IoHeart /> : <IoHeartOutline />}
            </motion.span>
          </Button>

          <Button
            iconOnly
            size="sm"
            variant="glass"
            tone="neutral"
            shape="circle"
            aria-label="Save"
            className="bg-white/15 text-white backdrop-blur-md"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleSave(work.id);
            }}
          >
            {isSaved ? <IoBookmark /> : <IoBookmarkOutline />}
          </Button>

          <Button
            iconOnly
            size="sm"
            variant="glass"
            tone="neutral"
            shape="circle"
            aria-label="Share"
            className="bg-white/15 text-white backdrop-blur-md"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Hook your Share modal here later
              onOpenOptions(work.id);
            }}
          >
            <IoShareSocialOutline />
          </Button>

          <Button
            iconOnly
            size="sm"
            variant="glass"
            tone="neutral"
            shape="circle"
            aria-label="More"
            className="bg-white/15 text-white backdrop-blur-md"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenOptions(work.id);
            }}
          >
            <IoEllipsisHorizontal />
          </Button>
        </div>

        {/* Bottom info overlay */}
        <div className="absolute bottom-0 inset-x-0 p-3">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <div className="line-clamp-1 text-[12px] font-black text-white">
                {work.title}
              </div>

              {/* preview dots for multi-images */}
              {hasMulti && (
                <div className="mt-2 flex items-center gap-1.5">
                  {Array.from({ length: previewMax }).map((_, idx) => (
                    <span
                      key={idx}
                      className={cn(
                        "h-1.5 rounded-full transition-all",
                        idx === activeIdx ? "w-7 bg-white" : "w-3 bg-white/45",
                      )}
                    />
                  ))}

                  {work.images.length > 3 && (
                    <span className="ms-1 rounded-full bg-black/35 px-2 py-0.5 text-[10px] font-black text-white">
                      +{work.images.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* tiny “film strip” thumbnails */}
            {hasMulti && (
              <div className="hidden sm:flex items-center gap-1.5">
                {work.images.slice(0, 3).map((img, idx) => (
                  <div
                    key={img.src}
                    className={cn(
                      "relative size-8 overflow-hidden rounded-xl border",
                      idx === activeIdx
                        ? "border-white/70"
                        : "border-white/20",
                    )}
                    aria-hidden="true"
                  >
                    <Image
                      src={img.src}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Publisher section (second part) */}
      <div className="flex items-center justify-between gap-3 border-t border-border-subtle px-3 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar
            src={work.author.avatar}
            name={work.author.name}
            size="sm"
            className="ring-2 ring-background-elevated"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="truncate text-[12px] font-black text-foreground-strong">
                {work.author.name}
              </span>
              {work.author.verified && (
                <span className="rounded-full border border-accent-border bg-accent-soft px-2 py-0.5 text-[10px] font-black text-accent">
                  PRO
                </span>
              )}
            </div>
            <div className="truncate text-[11px] text-foreground-muted">
              {work.author.username}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-3 text-[11px] text-foreground-muted">
            <span className="flex items-center gap-1">
              <IoHeartOutline className="text-[14px]" />
              <span dir="ltr" className="font-mono tabular-nums">
                {formatCompact(work.likes)}
              </span>
            </span>
            <span className="flex items-center gap-1">
              <IoEyeOutline className="text-[14px]" />
              <span dir="ltr" className="font-mono tabular-nums">
                {formatCompact(work.views)}
              </span>
            </span>
          </div>

          <Button
            size="sm"
            variant="soft"
            tone="brand"
            className="rounded-full"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // hook follow action later
            }}
          >
            متابعة
          </Button>
        </div>
      </div>
    </motion.article>
  );
});

/* -------------------------
   Filter Sheet
   ------------------------- */
type FilterSheetProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;

  sort: FilterSort;
  setSort: (v: FilterSort) => void;

  orientation: Orientation;
  setOrientation: (v: Orientation) => void;

  onlyMulti: boolean;
  setOnlyMulti: (v: boolean) => void;

  onClear: () => void;
};

function FilterSheet({
  open,
  onOpenChange,
  sort,
  setSort,
  orientation,
  setOrientation,
  onlyMulti,
  setOnlyMulti,
  onClear,
}: FilterSheetProps) {
  const reduce = useReducedMotion();

  const pill = (active: boolean) =>
    cn(
      "rounded-full border px-3 py-2 text-[12px] font-black transition",
      active
        ? "border-accent-border bg-accent-soft text-accent shadow-[var(--shadow-sm)]"
        : "border-border-subtle bg-surface-soft text-foreground-strong hover:bg-surface",
    );

  return (
    <DeModal
      open={open}
      onOpenChange={onOpenChange}
      mode={{ desktop: "center", mobile: "sheet" }}
      maxWidthClass="max-w-[520px]"
      contentPadding="none"
      panelClassName="overflow-hidden border border-border-subtle bg-background-elevated"
      sheetDragMode="binary"
      closeOnBackdrop
      closeOnEsc
    >
      <div className="relative">
        {/* background motif */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.10] [background:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.22)_1px,transparent_1px)] [background-size:18px_18px]"
        />

        <div className="relative border-b border-border-subtle px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-black text-foreground-strong">
                الفلاتر
              </div>
              <div className="mt-1 text-[11px] text-foreground-muted">
                رتّب النتائج وخصص العرض بدون ما تفقد الإحساس “المريح”.
              </div>
            </div>

            <Button
              iconOnly
              size="sm"
              variant="soft"
              tone="neutral"
              shape="circle"
              aria-label="Close"
              onClick={() => onOpenChange(false)}
            >
              <IoClose />
            </Button>
          </div>
        </div>

        <div className="relative p-5 space-y-6">
          {/* Sort */}
          <div>
            <div className="mb-2 text-[11px] font-black text-foreground-strong">
              الترتيب
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={pill(sort === "trending")}
                onClick={() => setSort("trending")}
              >
                ترند
              </button>
              <button
                type="button"
                className={pill(sort === "new")}
                onClick={() => setSort("new")}
              >
                الأحدث
              </button>
              <button
                type="button"
                className={pill(sort === "top")}
                onClick={() => setSort("top")}
              >
                الأكثر إعجابًا
              </button>
            </div>
          </div>

          {/* Orientation */}
          <div>
            <div className="mb-2 text-[11px] font-black text-foreground-strong">
              اتجاه الصورة
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={pill(orientation === "all")}
                onClick={() => setOrientation("all")}
              >
                الكل
              </button>
              <button
                type="button"
                className={pill(orientation === "portrait")}
                onClick={() => setOrientation("portrait")}
              >
                طولي
              </button>
              <button
                type="button"
                className={pill(orientation === "square")}
                onClick={() => setOrientation("square")}
              >
                مربع
              </button>
              <button
                type="button"
                className={pill(orientation === "landscape")}
                onClick={() => setOrientation("landscape")}
              >
                عرضي
              </button>
            </div>
          </div>

          {/* Multi */}
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-border-subtle bg-surface-soft px-4 py-3">
            <div className="min-w-0">
              <div className="text-[12px] font-black text-foreground-strong">
                فقط الأعمال متعددة الصور
              </div>
              <div className="mt-1 text-[11px] text-foreground-muted">
                مناسب لو تحب posts فيها أكثر من لقطة.
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOnlyMulti(!onlyMulti)}
              className={cn(
                "relative h-8 w-14 rounded-full border transition",
                onlyMulti
                  ? "border-accent-border bg-accent-soft"
                  : "border-border-subtle bg-surface",
              )}
              aria-pressed={onlyMulti}
            >
              <motion.span
                className={cn(
                  "absolute top-1 size-6 rounded-full",
                  "bg-background-elevated shadow-[var(--shadow-sm)]",
                )}
                animate={
                  reduce
                    ? { x: onlyMulti ? 26 : 2 }
                    : { x: onlyMulti ? 26 : 2 }
                }
                transition={
                  reduce
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 520, damping: 32 }
                }
              />
            </button>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-2">
            <Button
              variant="soft"
              tone="neutral"
              className="flex-1 rounded-2xl"
              onClick={onClear}
            >
              إعادة ضبط
            </Button>
            <Button
              variant="solid"
              tone="brand"
              className="flex-1 rounded-2xl"
              onClick={() => onOpenChange(false)}
            >
              تطبيق
            </Button>
          </div>
        </div>
      </div>
    </DeModal>
  );
}

/* -------------------------
   Detail Modal
   ------------------------- */
type DetailModalProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  work: GalleryWork;
  isLiked: boolean;
  isSaved: boolean;
  onToggleLike: (id: string) => void;
  onToggleSave: (id: string) => void;
  onOpenOptions: (id: string) => void;
};

function DetailModal({
  open,
  onOpenChange,
  work,
  isLiked,
  isSaved,
  onToggleLike,
  onToggleSave,
  onOpenOptions,
}: DetailModalProps) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    if (!open) return;
    setActive(0);

    const el = scrollerRef.current;
    if (!el) return;

    // Observe slides to update active index (RTL/LTR safe)
    const io = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];

        if (!mostVisible) return;

        const idx = Number((mostVisible.target as HTMLElement).dataset.index);
        if (!Number.isNaN(idx)) setActive(idx);
      },
      { root: el, threshold: [0.55, 0.65, 0.75] },
    );

    slideRefs.current.forEach((n) => n && io.observe(n));
    return () => io.disconnect();
  }, [open]);

  const goTo = (idx: number) => {
    const node = slideRefs.current[idx];
    if (!node) return;
    node.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "nearest",
      inline: "nearest",
    });
  };

  return (
    <DeModal
      open={open}
      onOpenChange={onOpenChange}
      mode={{ desktop: "center", mobile: "sheet" }}
      maxWidthClass="max-w-[95vw] md:max-w-[1400px] md:h-[90vh]"
      contentPadding="none"
      panelClassName={cn(
        "overflow-hidden border border-border-subtle bg-background-elevated",
        "md:rounded-3xl",
      )}
      sheetDragMode="binary"
      sheetInitialState="full"
      closeOnBackdrop
      closeOnEsc
    >
      <div className="relative h-full w-full">
        <div className="flex h-full flex-col md:flex-row">
          {/* Viewer */}
          <div className="relative flex-1 bg-black/55 md:bg-black">
            {/* blurred background */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-35 blur-3xl"
              style={{
                backgroundImage: `url(${work.images[active]?.src ?? work.images[0]?.src})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div className="relative h-[60vh] md:h-full">
              {/* top controls */}
              <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between gap-2">
                <div className="rounded-full border border-white/15 bg-black/35 px-3 py-1 text-[11px] font-black text-white backdrop-blur-md">
                  <span dir="ltr">
                    {active + 1}/{work.images.length}
                  </span>
                </div>

                <Button
                  iconOnly
                  size="sm"
                  variant="glass"
                  tone="neutral"
                  shape="circle"
                  aria-label="Close"
                  className="bg-black/35 text-white backdrop-blur-md"
                  onClick={() => onOpenChange(false)}
                >
                  <IoClose />
                </Button>
              </div>

              {/* carousel */}
              <div
                ref={scrollerRef}
                className={cn(
                  "absolute inset-0 flex w-full",
                  "overflow-x-auto overscroll-contain scroll-smooth",
                  "snap-x snap-mandatory",
                )}
              >
                {work.images.map((img, idx) => (
                  <div
                    key={img.src}
                    ref={(n) => {
                      slideRefs.current[idx] = n;
                    }}
                    data-index={idx}
                    className="relative min-w-full snap-center flex items-center justify-center p-4 md:p-8"
                  >
                    <motion.div
                      layoutId={`work-${work.id}-hero`}
                      className="relative"
                      transition={
                        reduce
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 420, damping: 34 }
                      }
                    >
                      <Image
                        src={img.src}
                        alt={img.alt}
                        width={img.width}
                        height={img.height}
                        className="max-h-[52vh] md:max-h-[85vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl"
                        priority={idx === 0}
                      />
                    </motion.div>
                  </div>
                ))}
              </div>

              {/* thumbnails */}
              {work.images.length > 1 && (
                <div className="absolute bottom-3 inset-x-3 z-20">
                  <div className="app-scroll flex gap-2 overflow-x-auto rounded-2xl border border-white/15 bg-black/35 p-2 backdrop-blur-md">
                    {work.images.map((img, idx) => {
                      const isActive = idx === active;
                      return (
                        <button
                          key={img.src}
                          type="button"
                          onClick={() => goTo(idx)}
                          className={cn(
                            "relative size-12 shrink-0 overflow-hidden rounded-xl border transition",
                            isActive
                              ? "border-white/70"
                              : "border-white/20 opacity-80 hover:opacity-100",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
                          )}
                          aria-label={`Image ${idx + 1}`}
                        >
                          <Image
                            src={img.src}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex h-[46vh] w-full flex-col border-t border-border-subtle bg-surface md:h-full md:w-[420px] md:border-t-0 md:border-s">
            <div className="flex items-center justify-between gap-3 border-b border-border-subtle px-5 py-4">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar
                  src={work.author.avatar}
                  name={work.author.name}
                  size="md"
                  className="ring-2 ring-accent/20"
                />
                <div className="min-w-0">
                  <div className="truncate text-sm font-black text-foreground-strong">
                    {work.author.name}
                  </div>
                  <div className="truncate text-[11px] text-foreground-muted">
                    {work.author.username} • {categoryLabelById(work.categoryId)}
                  </div>
                </div>
              </div>

              <Button
                iconOnly
                size="sm"
                variant="soft"
                tone="neutral"
                shape="circle"
                aria-label="More"
                onClick={() => onOpenOptions(work.id)}
              >
                <IoEllipsisHorizontal />
              </Button>
            </div>

            <div className="app-scroll flex-1 p-5">
              <h1 className="text-xl md:text-2xl font-black text-foreground-strong leading-tight">
                {work.title}
              </h1>

              <p className="mt-3 text-sm text-foreground-muted leading-relaxed">
                {work.description}
              </p>

              {/* stats */}
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-border-subtle bg-surface-soft px-3 py-1 text-[12px] font-black text-foreground-strong">
                  <IoHeartOutline className="text-[14px]" />
                  <span dir="ltr" className="font-mono tabular-nums">
                    {formatCompact(work.likes)}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-border-subtle bg-surface-soft px-3 py-1 text-[12px] font-black text-foreground-strong">
                  <IoEyeOutline className="text-[14px]" />
                  <span dir="ltr" className="font-mono tabular-nums">
                    {formatCompact(work.views)}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-border-subtle bg-surface-soft px-3 py-1 text-[12px] font-black text-foreground-strong">
                  <IoBookmarkOutline className="text-[14px]" />
                  <span dir="ltr" className="font-mono tabular-nums">
                    {formatCompact(work.saves)}
                  </span>
                </span>
              </div>

              {/* tags */}
              <div className="mt-6">
                <div className="text-[11px] font-black text-foreground-strong">
                  الهاشتاقات
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {work.tags.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={cn(
                        "rounded-full border border-border-subtle bg-surface-soft px-3 py-1.5",
                        "text-[11px] font-black text-foreground-muted",
                        "hover:bg-accent-soft hover:text-accent hover:border-accent-border transition",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                      )}
                    >
                      #{t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* sticky actions */}
            <div className="border-t border-border-subtle bg-surface px-4 py-3 pb-[env(safe-area-inset-bottom)]">
              <div className="flex items-center gap-2">
                <Button
                  iconOnly
                  size="lg"
                  variant={isLiked ? "solid" : "soft"}
                  tone="danger"
                  shape="circle"
                  aria-label="Like"
                  onClick={() => onToggleLike(work.id)}
                >
                  {isLiked ? <IoHeart /> : <IoHeartOutline />}
                </Button>

                <Button
                  iconOnly
                  size="lg"
                  variant={isSaved ? "solid" : "soft"}
                  tone="neutral"
                  shape="circle"
                  aria-label="Save"
                  onClick={() => onToggleSave(work.id)}
                >
                  {isSaved ? <IoBookmark /> : <IoBookmarkOutline />}
                </Button>

                <Button
                  size="lg"
                  variant="gradient"
                  tone="brand"
                  className="flex-1 rounded-2xl"
                  onClick={() => onOpenOptions(work.id)}
                  leftIcon={<IoShareSocialOutline className="text-[18px]" />}
                >
                  مشاركة / خيارات
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DeModal>
  );
}

/* =========================================================
   Main Component
   ========================================================= */
export default function GalleryClient() {
  const reduce = useReducedMotion();
  const scrollDir = useScrollDirection();

  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [works, setWorks] = useState<GalleryWork[]>([]);
  const [seed, setSeed] = useState(1400);

  const [loadMoreState, setLoadMoreState] = useState<"idle" | "loading" | "error">(
    "idle",
  );

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sort, setSort] = useState<FilterSort>("trending");
  const [onlyMulti, setOnlyMulti] = useState(false);
  const [orientation, setOrientation] = useState<Orientation>("all");

  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Options sheet
  const [optionsId, setOptionsId] = useState<string | null>(null);
  const [optionsOpen, setOptionsOpen] = useState(false);

  // Like / Save maps (avoid touching works array => less re-renders)
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({});

  const locale =
    typeof document !== "undefined" && document.documentElement.dir === "rtl"
      ? "ar"
      : "en";

  // initial load (mock)
  const loadInitial = useCallback(() => {
    setStatus("loading");
    setLoadMoreState("idle");

    const t = window.setTimeout(() => {
      try {
        const out = createMockWorks(PAGE_SIZE + 10, 1400);
        setWorks(out.items);
        setSeed(out.nextSeed);
        setStatus("ready");
      } catch {
        setStatus("error");
      }
    }, 650);

    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const cleanup = loadInitial();
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const retryInitial = useCallback(() => {
    loadInitial();
  }, [loadInitial]);

  // Derived: filters count (used as badge)
  const filterBadgeCount = useMemo(() => {
    let n = 0;
    if (query.trim()) n++;
    if (activeCategory !== "all") n++;
    if (sort !== "trending") n++;
    if (orientation !== "all") n++;
    if (onlyMulti) n++;
    return n;
  }, [query, activeCategory, sort, orientation, onlyMulti]);

  const normalizedQuery = useMemo(() => safeLower(query), [query]);

  // Filter + sort
  const filteredWorks = useMemo(() => {
    let list = works;

    if (activeCategory !== "all") {
      list = list.filter((w) => w.categoryId === activeCategory);
    }

    if (onlyMulti) {
      list = list.filter((w) => w.images.length > 1);
    }

    if (orientation !== "all") {
      list = list.filter((w) => orientationOf(w) === orientation);
    }

    if (normalizedQuery) {
      list = list.filter((w) => {
        const hay = [
          w.title,
          w.description,
          w.author.name,
          w.author.username,
          categoryLabelById(w.categoryId),
          ...w.tags,
        ]
          .map(safeLower)
          .join(" ");
        return hay.includes(normalizedQuery);
      });
    }

    // sorting
    const sorted = [...list];
    if (sort === "new") {
      sorted.sort((a, b) => (a.createdAtISO < b.createdAtISO ? 1 : -1));
    } else if (sort === "top") {
      sorted.sort((a, b) => b.likes - a.likes);
    } else {
      sorted.sort((a, b) => scoreTrending(b) - scoreTrending(a));
    }

    return sorted;
  }, [works, activeCategory, onlyMulti, orientation, normalizedQuery, sort]);

  // Map for O(1) selection
  const worksById = useMemo(() => {
    return new Map<string, GalleryWork>(filteredWorks.map((w) => [w.id, w]));
  }, [filteredWorks]);

  const selectedWork = selectedId ? worksById.get(selectedId) ?? null : null;

  const columnCount = useResponsiveColumns();
  const columns = useMasonryColumns(filteredWorks, columnCount);

  // Stable handlers for memo cards
  const onOpen = useCallback((id: string) => setSelectedId(id), []);
  const onClose = useCallback(() => setSelectedId(null), []);

  const onToggleLike = useCallback((id: string) => {
    setLikedMap((m) => ({ ...m, [id]: !m[id] }));
  }, []);

  const onToggleSave = useCallback((id: string) => {
    setSavedMap((m) => ({ ...m, [id]: !m[id] }));
  }, []);

  const onOpenOptions = useCallback((id: string) => {
    setOptionsId(id);
    setOptionsOpen(true);
  }, []);

  // Load more (progressive)
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(() => {
    if (status !== "ready") return;
    if (loadMoreState === "loading") return;

    setLoadMoreState("loading");

    window.setTimeout(() => {
      try {
        const out = createMockWorks(PAGE_SIZE, seed);
        setWorks((prev) => [...prev, ...out.items]);
        setSeed(out.nextSeed);
        setLoadMoreState("idle");
      } catch {
        setLoadMoreState("error");
      }
    }, 650);
  }, [status, loadMoreState, seed]);

  useEffect(() => {
    if (status !== "ready") return;
    const target = loadMoreRef.current;
    if (!target) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        loadMore();
      },
      { root: null, threshold: 0.2, rootMargin: "600px 0px" },
    );

    io.observe(target);
    return () => io.disconnect();
  }, [status, loadMore]);

  const clearFilters = useCallback(() => {
    setQuery("");
    setActiveCategory("all");
    setSort("trending");
    setOrientation("all");
    setOnlyMulti(false);
  }, []);

  // Header motion (hide on scroll down)
  const headerAnimate =
    reduce
      ? {}
      : {
          y: scrollDir === "down" ? -86 : 0,
          opacity: scrollDir === "down" ? 0 : 1,
        };

  const headerTransition = reduce
    ? { duration: 0 }
    : { type: "spring", stiffness: 420, damping: 40 };

  // OptionsSheet config
  const options = useMemo(() => {
    if (!optionsId) return [];
    const shareUrl = `https://fanaara.app/gallery/${optionsId}`;
    const isSaved = !!savedMap[optionsId];
    const isFav = !!likedMap[optionsId];

    return [
      { id: "copy_link", value: shareUrl },
      { id: "toggle_save", value: isSaved },
      { id: "favorite_toggle", value: isFav },
      "report",
    ] as any[];
  }, [optionsId, savedMap, likedMap]);

  const onOptionAction = useCallback(
    async (actionId: string, nextValue?: boolean | string) => {
      if (!optionsId) return;

      if (actionId === "toggle_save") {
        setSavedMap((m) => ({ ...m, [optionsId]: Boolean(nextValue) }));
        return;
      }
      if (actionId === "favorite_toggle") {
        setLikedMap((m) => ({ ...m, [optionsId]: Boolean(nextValue) }));
        return;
      }
      // copy_link/report handled inside OptionsSheet itself
    },
    [optionsId],
  );

  return (
    <main className="min-h-screen bg-bg-page text-foreground selection:bg-accent/20">
      {/* background motif (signature touch #1) */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 opacity-[0.12] [background:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:20px_20px] dark:opacity-[0.06]" />
        <div className="absolute -top-24 start-10 size-[420px] rounded-full bg-extra-cyan-soft blur-3xl opacity-55" />
        <div className="absolute -bottom-28 end-10 size-[420px] rounded-full bg-extra-pink-soft blur-3xl opacity-45" />
      </div>

      {/* Sticky header */}
      <motion.header
        className={cn(
          "sticky top-0 z-40 w-full border-b border-border-subtle",
          "bg-bg-page/80 backdrop-blur-xl",
        )}
        animate={headerAnimate}
        transition={headerTransition}
      >
        <div className="mx-auto max-w-[1800px] px-4 py-3">
          <div className="flex items-center gap-3">
            <SearchOmni
              value={query}
              onChange={setQuery}
              onPickCategory={(id) => {
                setActiveCategory(id);
              }}
              onOpenFilters={() => setFiltersOpen(true)}
              filterBadgeCount={filterBadgeCount}
              busy={status === "loading"}
            />
          </div>

          <div className="mt-3">
            <CategoriesRail
              activeId={activeCategory}
              onChange={(id) => {
                setActiveCategory(id);
              }}
            />
          </div>

          {/* Active filters chips (small, UX) */}
          {filterBadgeCount > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-black text-foreground-muted">
                فعّال:
              </span>

              {query.trim() && (
                <button
                  type="button"
                  className="rounded-full border border-accent-border bg-accent-soft px-3 py-1 text-[11px] font-black text-accent"
                  onClick={() => setQuery("")}
                >
                  بحث: {query}
                </button>
              )}

              {activeCategory !== "all" && (
                <button
                  type="button"
                  className="rounded-full border border-border-subtle bg-surface-soft px-3 py-1 text-[11px] font-black text-foreground-strong hover:bg-surface"
                  onClick={() => setActiveCategory("all")}
                >
                  {categoryLabelById(activeCategory)}
                </button>
              )}

              {onlyMulti && (
                <button
                  type="button"
                  className="rounded-full border border-border-subtle bg-surface-soft px-3 py-1 text-[11px] font-black text-foreground-strong hover:bg-surface"
                  onClick={() => setOnlyMulti(false)}
                >
                  متعدد الصور
                </button>
              )}

              {sort !== "trending" && (
                <button
                  type="button"
                  className="rounded-full border border-border-subtle bg-surface-soft px-3 py-1 text-[11px] font-black text-foreground-strong hover:bg-surface"
                  onClick={() => setSort("trending")}
                >
                  ترتيب: {sort === "new" ? "الأحدث" : "الأكثر إعجابًا"}
                </button>
              )}

              {orientation !== "all" && (
                <button
                  type="button"
                  className="rounded-full border border-border-subtle bg-surface-soft px-3 py-1 text-[11px] font-black text-foreground-strong hover:bg-surface"
                  onClick={() => setOrientation("all")}
                >
                  {orientation === "portrait"
                    ? "طولي"
                    : orientation === "landscape"
                      ? "عرضي"
                      : "مربع"}
                </button>
              )}

              <Button
                size="sm"
                variant="plain"
                tone="neutral"
                className="rounded-full"
                onClick={clearFilters}
                leftIcon={<IoRefreshOutline className="text-[16px]" />}
              >
                مسح الكل
              </Button>
            </div>
          )}
        </div>
      </motion.header>

      {/* Body */}
      <div className="mx-auto max-w-[1800px] px-4 py-6">
        {/* Loading */}
        {status === "loading" && (
          <GalleryMasonrySkeleton columns={columnCount} className="mt-2" />
        )}

        {/* Error */}
        {status === "error" && (
          <div className="mx-auto max-w-xl py-16 text-center">
            <div className="mx-auto mb-4 grid size-16 place-items-center rounded-3xl border border-border-subtle bg-surface-soft">
              <IoWarningOutline className="text-[28px] text-danger-500" />
            </div>
            <div className="text-base font-black text-foreground-strong">
              حدث خطأ أثناء تحميل المعرض
            </div>
            <div className="mt-2 text-[12px] text-foreground-muted">
              جرّب إعادة التحميل. (Mock state موجود لتغطية error flow)
            </div>
            <div className="mt-5 flex justify-center">
              <Button
                variant="solid"
                tone="brand"
                className="rounded-2xl"
                onClick={retryInitial}
                leftIcon={<IoRefreshOutline className="text-[18px]" />}
              >
                إعادة المحاولة
              </Button>
            </div>
          </div>
        )}

        {/* Ready */}
        {status === "ready" && (
          <>
            {filteredWorks.length === 0 ? (
              <div className="mx-auto max-w-xl py-16 text-center">
                <div className="mx-auto mb-4 grid size-16 place-items-center rounded-3xl border border-border-subtle bg-surface-soft">
                  <IoSearchOutline className="text-[26px] text-foreground-soft" />
                </div>
                <div className="text-base font-black text-foreground-strong">
                  لا توجد نتائج
                </div>
                <div className="mt-2 text-[12px] text-foreground-muted">
                  جرّب تصنيفًا آخر أو امسح الفلاتر.
                </div>
                <div className="mt-5 flex justify-center">
                  <Button
                    variant="soft"
                    tone="neutral"
                    className="rounded-2xl"
                    onClick={clearFilters}
                  >
                    مسح الفلاتر
                  </Button>
                </div>
              </div>
            ) : (
              <LayoutGroup id="gallery-grid">
                <div className="flex items-start gap-4">
                  {columns.map((colItems, colIndex) => (
                    <div key={colIndex} className="flex-1 flex flex-col gap-4">
                      <AnimatePresence mode="popLayout" initial={false}>
                        {colItems.map((w) => (
                          <GalleryCard
                            key={w.id}
                            work={w}
                            isLiked={!!likedMap[w.id]}
                            isSaved={!!savedMap[w.id]}
                            onOpen={onOpen}
                            onToggleLike={onToggleLike}
                            onToggleSave={onToggleSave}
                            onOpenOptions={onOpenOptions}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>

                {/* load more area */}
                <div
                  ref={loadMoreRef}
                  className="py-14 flex items-center justify-center"
                >
                  {loadMoreState === "loading" ? (
                    <div className="flex items-center gap-2 text-[12px] font-black text-foreground-muted">
                      <span className="inline-block size-2 rounded-full bg-accent animate-[bounce_1s_infinite_-0.2s]" />
                      <span className="inline-block size-2 rounded-full bg-accent animate-[bounce_1s_infinite_-0.1s]" />
                      <span className="inline-block size-2 rounded-full bg-accent animate-[bounce_1s_infinite]" />
                      <span className="ms-2">تحميل المزيد…</span>
                    </div>
                  ) : loadMoreState === "error" ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="text-[12px] font-black text-danger-500">
                        تعذر تحميل المزيد
                      </div>
                      <Button
                        variant="soft"
                        tone="neutral"
                        className="rounded-2xl"
                        onClick={loadMore}
                      >
                        إعادة المحاولة
                      </Button>
                    </div>
                  ) : (
                    <div className="text-[11px] text-foreground-muted">
                      استمر بالتمرير لتحميل المزيد
                    </div>
                  )}
                </div>
              </LayoutGroup>
            )}
          </>
        )}
      </div>

      {/* Filter modal */}
      <FilterSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        sort={sort}
        setSort={setSort}
        orientation={orientation}
        setOrientation={setOrientation}
        onlyMulti={onlyMulti}
        setOnlyMulti={setOnlyMulti}
        onClear={clearFilters}
      />

      {/* Detail modal */}
      {selectedWork && (
        <DetailModal
          open={!!selectedWork}
          onOpenChange={(v) => !v && onClose()}
          work={selectedWork}
          isLiked={!!likedMap[selectedWork.id]}
          isSaved={!!savedMap[selectedWork.id]}
          onToggleLike={onToggleLike}
          onToggleSave={onToggleSave}
          onOpenOptions={onOpenOptions}
        />
      )}

      {/* Options sheet */}
      <OptionsSheet
        open={optionsOpen}
        onOpenChange={setOptionsOpen}
        options={options as any}
        onAction={onOptionAction as any}
      />
    </main>
  );
}
