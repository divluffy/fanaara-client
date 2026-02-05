"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  IoArrowDown,
  IoChevronBack,
  IoChatbubbleEllipsesOutline,
  IoCheckmark,
  IoClose,
  IoCopyOutline,
  IoEllipsisHorizontalOutline,
  IoFlagOutline,
  IoHeart,
  IoHeartOutline,
  IoInformationCircleOutline,
  IoLinkOutline,
  IoPause,
  IoPlay,
  IoSearch,
  IoShareSocialOutline,
  IoSparklesOutline,
  IoTimeOutline,
  IoVolumeHighOutline,
  IoVolumeMuteOutline,
  IoWarningOutline,
  IoBookmarkOutline,
  IoBookmark,
  IoSettingsOutline,
} from "react-icons/io5";

import { Button } from "@/design/DeButton";
import { Avatar } from "@/design/DeAvatar";
import Modal from "@/design/DeModal";
import OptionsSheet, { type OptionsSheetOptionInput } from "@/design/DeOptions";
import { SmartSelect, type SelectOption } from "@/design/DeSelect";
import { cn } from "@/utils/cn";

/**
 * ⚠️ NOTE:
 * - This page uses remote video URLs for testing.
 * - If your Next/Image remote domains are restricted, you may need to allow avatar domains in next.config.js.
 * - The rest of the UI uses your CSS tokens (bg-background, bg-surface, text-foreground...) so it adapts to light/dark automatically.
 */

type Dir = "rtl" | "ltr";

type SwipeItem = {
  id: string;
  videoUrl: string;
  posterUrl?: string;

  kind: "clip" | "review" | "meme" | "cosplay" | "edit" | "news";
  lang: "ar" | "en" | "jp";

  user: {
    name: string;
    handle: string;
    avatarUrl: string;
    verified?: boolean;
  };

  anime?: {
    title: string;
    slug?: string;
    year?: number;
    type?: "anime" | "manga" | "comic";
  };

  audio?: {
    title: string;
    artist: string;
  };

  caption: string;
  tags: string[];

  event?: {
    title: string;
    slug?: string;
    endsInHours?: number; // demo
    tone?: "brand" | "warning" | "pink" | "purple";
  };

  stats: {
    likes: number;
    comments: number;
    shares: number;
  };

  flags?: {
    spoiler?: boolean;
    mature?: boolean;
    sponsored?: boolean;
  };
};

/* ---------------------------------------------
   Helpers
----------------------------------------------*/

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function formatCompact(n: number) {
  // 0..999 => "999", 1_200 => "1.2K", 3_400_000 => "3.4M"
  const abs = Math.abs(n);
  if (abs < 1000) return String(n);

  const units = [
    { v: 1_000, s: "K" },
    { v: 1_000_000, s: "M" },
    { v: 1_000_000_000, s: "B" },
  ] as const;

  let unit = units[0];
  for (const u of units) if (abs >= u.v) unit = u;

  const value = n / unit.v;
  const fixed = value >= 10 ? value.toFixed(0) : value.toFixed(1);
  return `${fixed}${unit.s}`;
}

function safeNow() {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

function getDocDir(): Dir {
  if (typeof document === "undefined") return "rtl";
  return document.documentElement.dir === "rtl" ? "rtl" : "ltr";
}

function isDarkTheme(): boolean {
  if (typeof document === "undefined") return false;
  return (
    document.documentElement.classList.contains("dark") ||
    document.body.classList.contains("dark")
  );
}

function buildShareUrl(
  kind: "x" | "whatsapp" | "telegram",
  url: string,
  text: string,
) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(text);
  if (kind === "x")
    return `https://twitter.com/intent/tweet?url=${u}&text=${t}`;
  if (kind === "whatsapp")
    return `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
  return `https://t.me/share/url?url=${u}&text=${t}`;
}

/* ---------------------------------------------
   Demo data (internet videos)
----------------------------------------------*/

const DEMO_SWIPES: SwipeItem[] = [
  {
    id: "swp_001",
    videoUrl:
      "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    kind: "edit",
    lang: "en",
    user: {
      name: "Mika",
      handle: "mika.edits",
      avatarUrl:
        "https://api.dicebear.com/7.x/thumbs/svg?seed=mika&backgroundColor=03bec8",
      verified: true,
    },
    anime: { title: "One Piece", slug: "one-piece", year: 1999, type: "anime" },
    audio: { title: "Ocean Pulse", artist: "Fanaara Studio" },
    caption:
      "Smooth transitions + glow timing ✨ (test feed UI for Fanaara Swipes)",
    tags: ["#edit", "#anime", "#transition", "#fanaara"],
    event: {
      title: "Weekly Edit Challenge",
      slug: "weekly-edit",
      endsInHours: 36,
      tone: "brand",
    },
    stats: { likes: 12420, comments: 582, shares: 314 },
    flags: { spoiler: false, mature: false },
  },
  {
    id: "swp_002",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    kind: "review",
    lang: "ar",
    user: {
      name: "سارة",
      handle: "sara.reviews",
      avatarUrl:
        "https://api.dicebear.com/7.x/thumbs/svg?seed=sara&backgroundColor=fe9e01",
      verified: true,
    },
    anime: {
      title: "Attack on Titan",
      slug: "attack-on-titan",
      year: 2013,
      type: "anime",
    },
    audio: { title: "Voiceover (Arabic)", artist: "Sara" },
    caption:
      "رأيي السريع: أفضل ٣ لحظات في الموسم (بدون حرق) — ركّزوا على الإيقاع والسرد!",
    tags: ["#review", "#anime", "#arabic", "#noSpoilers"],
    stats: { likes: 8930, comments: 1201, shares: 220 },
    flags: { spoiler: false, mature: false },
  },
  {
    id: "swp_003",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    kind: "news",
    lang: "en",
    user: {
      name: "Riku",
      handle: "riku.news",
      avatarUrl:
        "https://api.dicebear.com/7.x/thumbs/svg?seed=riku&backgroundColor=7c3aed",
      verified: false,
    },
    caption:
      "Upcoming season picks — quick highlights + why they might blow up 🔥",
    tags: ["#seasonal", "#news", "#recommendations"],
    event: {
      title: "Winter Picks Board",
      slug: "winter-picks",
      endsInHours: 72,
      tone: "purple",
    },
    stats: { likes: 5032, comments: 311, shares: 98 },
    flags: { spoiler: false },
  },
  {
    id: "swp_004",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    kind: "cosplay",
    lang: "en",
    user: {
      name: "Hana",
      handle: "hana.cos",
      avatarUrl:
        "https://api.dicebear.com/7.x/thumbs/svg?seed=hana&backgroundColor=ec4899",
      verified: true,
    },
    caption:
      "Cosplay reveal — lighting + fabric movement test. (UI overlay check)",
    tags: ["#cosplay", "#reveal", "#fanaara"],
    stats: { likes: 23410, comments: 2102, shares: 611 },
    flags: { sponsored: true },
  },
  {
    id: "swp_005",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    kind: "clip",
    lang: "jp",
    user: {
      name: "Kyo",
      handle: "kyo.clips",
      avatarUrl:
        "https://api.dicebear.com/7.x/thumbs/svg?seed=kyo&backgroundColor=018199",
      verified: false,
    },
    anime: {
      title: "Jujutsu Kaisen",
      slug: "jujutsu-kaisen",
      year: 2020,
      type: "anime",
    },
    caption:
      "Clip moment (placeholder video). Testing snap + actions + captions.",
    tags: ["#clip", "#moment", "#anime"],
    stats: { likes: 700, comments: 44, shares: 12 },
    flags: { spoiler: true },
  },
  {
    id: "swp_006",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    kind: "meme",
    lang: "ar",
    user: {
      name: "أحمد",
      handle: "ahmad.memes",
      avatarUrl:
        "https://api.dicebear.com/7.x/thumbs/svg?seed=ahmad&backgroundColor=06b6d4",
      verified: false,
    },
    caption: "لما تقول: (حلقة واحدة وبنام) 😂",
    tags: ["#meme", "#relatable", "#animeLife"],
    stats: { likes: 1280, comments: 92, shares: 41 },
    flags: { mature: false },
  },
];

/* ---------------------------------------------
   Main Page
----------------------------------------------*/

export default function SwipesPage() {
  const reduceMotion = useReducedMotion();

  // Direction + theme follow document (and react to changes)
  const [dir, setDir] = useState<Dir>("rtl");
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const update = () => {
      setDir(getDocDir());
      setDark(isDarkTheme());
    };
    update();

    if (typeof MutationObserver === "undefined") return;

    const mo = new MutationObserver(() => update());
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["dir", "class"],
    });
    mo.observe(document.body, { attributes: true, attributeFilter: ["class"] });

    return () => mo.disconnect();
  }, []);

  const isRTL = dir === "rtl";

  const items = useMemo(() => DEMO_SWIPES, []);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  // Active index + viewport height (for scroll math)
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewportH, setViewportH] = useState<number>(800);

  // Video controls
  const [muted, setMuted] = useState(true); // default true for autoplay
  const [paused, setPaused] = useState(false);

  // UI/UX
  const [hudVisible, setHudVisible] = useState(true);
  const [swipeHintVisible, setSwipeHintVisible] = useState(true);

  // State maps (demo)
  const [liked, setLiked] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(items.map((it) => [it.id, false])),
  );
  const [saved, setSaved] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(items.map((it) => [it.id, false])),
  );
  const [following, setFollowing] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(items.map((it) => [it.id, true])),
  );

  // Modals / sheets
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [optionsOpen, setOptionsOpen] = useState(false);
  const [optionsTargetId, setOptionsTargetId] = useState<string | null>(null);

  // Progress
  const [progress, setProgress] = useState(0); // 0..1 for active

  const activeItem = items[activeIndex];

  // Video refs array
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const setVideoRef = useCallback(
    (index: number) => (el: HTMLVideoElement | null) => {
      videoRefs.current[index] = el;
    },
    [],
  );

  // Keep viewport height synced with scroller
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const read = () => {
      const h = Math.round(
        el.getBoundingClientRect().height || window.innerHeight || 800,
      );
      setViewportH(h);
    };

    read();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => read());
      ro.observe(el);
    }

    window.addEventListener("resize", read);
    return () => {
      window.removeEventListener("resize", read);
      ro?.disconnect();
    };
  }, []);

  // Scroll => active index (rAF)
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    let raf: number | null = null;

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = null;
        const top = el.scrollTop;
        const idx = clamp(
          Math.round(top / Math.max(1, viewportH)),
          0,
          items.length - 1,
        );
        setActiveIndex((prev) => (prev === idx ? prev : idx));

        // Hide swipe hint once the user actually scrolls
        if (swipeHintVisible && top > 18) setSwipeHintVisible(false);
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [items.length, viewportH, swipeHintVisible]);

  // Autoplay / pause management for active video
  useEffect(() => {
    const playActive = async () => {
      for (let i = 0; i < items.length; i++) {
        const v = videoRefs.current[i];
        if (!v) continue;

        // Always reflect mute state
        v.muted = muted;
        v.playsInline = true;

        if (i !== activeIndex) {
          try {
            v.pause();
          } catch {}
          continue;
        }

        // Active
        if (paused) {
          try {
            v.pause();
          } catch {}
          continue;
        }

        try {
          // attempt play
          await v.play();
        } catch {
          // If autoplay fails (e.g., unmuted without gesture), keep paused visually.
          // We'll show HUD controls so user can tap play.
          setHudVisible(true);
        }
      }
    };

    playActive();
    // Reset progress UI when item changes
    setProgress(0);
    // Make HUD visible briefly on item change
    setHudVisible(true);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, muted, paused, items.length]);

  // Progress tracking for active video
  useEffect(() => {
    const v = videoRefs.current[activeIndex];
    if (!v) return;

    const onTime = () => {
      const dur = v.duration || 0;
      const cur = v.currentTime || 0;
      if (dur > 0) setProgress(clamp(cur / dur, 0, 1));
      else setProgress(0);
    };

    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onTime);
    v.addEventListener("durationchange", onTime);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onTime);
      v.removeEventListener("durationchange", onTime);
    };
  }, [activeIndex]);

  // HUD auto-hide (when playing)
  useEffect(() => {
    if (!hudVisible) return;
    if (paused) return;

    const t = window.setTimeout(() => setHudVisible(false), 1900);
    return () => window.clearTimeout(t);
  }, [hudVisible, paused, activeIndex]);

  // Keyboard shortcuts (desktop)
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const scrollToIndex = (idx: number) => {
      const next = clamp(idx, 0, items.length - 1);
      el.scrollTo({ top: next * viewportH, behavior: "smooth" });
    };

    const onKeyDown = (e: KeyboardEvent) => {
      // If a modal is open, ignore.
      if (commentsOpen || shareOpen || filtersOpen || optionsOpen) return;

      const key = e.key.toLowerCase();

      if (key === "arrowdown" || key === "pagedown") {
        e.preventDefault();
        scrollToIndex(activeIndex + 1);
      } else if (key === "arrowup" || key === "pageup") {
        e.preventDefault();
        scrollToIndex(activeIndex - 1);
      } else if (key === " " || key === "k") {
        e.preventDefault();
        setPaused((p) => !p);
        setHudVisible(true);
      } else if (key === "m") {
        e.preventDefault();
        setMuted((m) => !m);
        setHudVisible(true);
      } else if (key === "l") {
        e.preventDefault();
        const id = items[activeIndex]?.id;
        if (!id) return;
        setLiked((s) => ({ ...s, [id]: !s[id] }));
        setHudVisible(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    activeIndex,
    viewportH,
    items,
    commentsOpen,
    shareOpen,
    filtersOpen,
    optionsOpen,
  ]);

  const toggleLike = useCallback((id: string, forceOn?: boolean) => {
    setLiked((s) => {
      const next = forceOn === true ? true : !Boolean(s[id]);
      return { ...s, [id]: next };
    });
  }, []);

  const toggleSave = useCallback((id: string, forceOn?: boolean) => {
    setSaved((s) => {
      const next = forceOn === true ? true : !Boolean(s[id]);
      return { ...s, [id]: next };
    });
  }, []);

  const toggleFollow = useCallback(
    (id: string) => {
      const it = items.find((x) => x.id === id);
      if (!it) return;
      const handle = it.user.handle;
      setFollowing((s) => ({ ...s, [handle]: !Boolean(s[handle]) }));
    },
    [items],
  );

  const openOptionsFor = useCallback((id: string) => {
    setOptionsTargetId(id);
    setOptionsOpen(true);
  }, []);

  const requestShare = useCallback(async (item: SwipeItem) => {
    const url = `https://fanaara.com/swipes/${item.id}`;
    const text = `${item.caption}`;
    // Web Share API first
    try {
      // @ts-expect-error - navigator.share typing depends on lib
      if (navigator?.share) {
        // @ts-expect-error
        await navigator.share({
          title: "Fanaara Swipes",
          text,
          url,
        });
        return;
      }
    } catch {
      // fallback to custom share sheet
    }
    setShareOpen(true);
  }, []);

  // Options sheet options for active/target item
  const optionsForTarget = useMemo<OptionsSheetOptionInput[]>(() => {
    const id = optionsTargetId ?? activeItem?.id;
    const it = items.find((x) => x.id === id) ?? activeItem;
    if (!it) return [];

    const shareUrl = `https://fanaara.com/swipes/${it.id}`;

    return [
      { id: "share", label: isRTL ? "مشاركة" : "Share" },
      {
        id: "copy_link",
        value: shareUrl,
        label: isRTL ? "نسخ الرابط" : "Copy link",
        closeOnPress: false,
      },
      {
        id: "toggle_save",
        value: Boolean(saved[it.id]),
        label: Boolean(saved[it.id])
          ? isRTL
            ? "إزالة من المحفوظات"
            : "Remove from saved"
          : isRTL
            ? "حفظ"
            : "Save",
        closeOnPress: false,
      },
      { id: "not_interested", label: isRTL ? "غير مهتم" : "Not interested" },
      { id: "hide", label: isRTL ? "إخفاء" : "Hide" },
      { id: "report", label: isRTL ? "إبلاغ..." : "Report…" },
    ];
  }, [optionsTargetId, activeItem, items, saved, isRTL]);

  // Handle OptionsSheet actions (demo)
  const onOptionsAction = useCallback(
    async (actionId: any, nextValue?: boolean | string) => {
      const id = optionsTargetId ?? activeItem?.id;
      const it = items.find((x) => x.id === id) ?? activeItem;
      if (!it) return;

      if (actionId === "share") {
        await requestShare(it);
        return;
      }

      if (actionId === "toggle_save") {
        toggleSave(it.id, Boolean(nextValue));
        return;
      }

      if (actionId === "not_interested") {
        // Demo UX: just jump to next
        scrollerRef.current?.scrollTo({
          top: (activeIndex + 1) * viewportH,
          behavior: "smooth",
        });
        return;
      }

      if (actionId === "report") {
        // Demo: open filters modal as "report flow placeholder"
        setFiltersOpen(true);
        return;
      }
    },
    [
      optionsTargetId,
      activeItem,
      items,
      requestShare,
      toggleSave,
      activeIndex,
      viewportH,
    ],
  );

  // Filters (demo)
  const FEED_OPTIONS: SelectOption[] = useMemo(
    () => [
      {
        value: "for_you",
        label: isRTL ? "لك" : "For You",
        description: isRTL
          ? "أفضل المحتوى حسب اهتماماتك"
          : "Best picks for you",
      },
      {
        value: "following",
        label: isRTL ? "المتابَعين" : "Following",
        description: isRTL ? "محتوى من تتابعهم" : "From creators you follow",
      },
      {
        value: "events",
        label: isRTL ? "التحديات" : "Challenges",
        description: isRTL
          ? "فعاليات ومهام أسبوعية"
          : "Weekly events & missions",
      },
    ],
    [isRTL],
  );

  const CATEGORY_OPTIONS: SelectOption[] = useMemo(
    () => [
      { value: "all", label: isRTL ? "الكل" : "All" },
      { value: "edit", label: isRTL ? "إيدت" : "Edits" },
      { value: "review", label: isRTL ? "مراجعات" : "Reviews" },
      { value: "clip", label: isRTL ? "لقطات" : "Clips" },
      { value: "cosplay", label: isRTL ? "كوسبلاي" : "Cosplay" },
      { value: "meme", label: isRTL ? "ميمز" : "Memes" },
      { value: "news", label: isRTL ? "أخبار" : "News" },
    ],
    [isRTL],
  );

  const LANG_OPTIONS: SelectOption[] = useMemo(
    () => [
      { value: "all", label: isRTL ? "الكل" : "All" },
      {
        value: "ar",
        label: "العربية",
        description: isRTL ? "محتوى عربي" : "Arabic content",
      },
      {
        value: "en",
        label: "English",
        description: isRTL ? "محتوى إنجليزي" : "English content",
      },
      {
        value: "jp",
        label: "日本語",
        description: isRTL ? "محتوى ياباني" : "Japanese content",
      },
    ],
    [isRTL],
  );

  const [filters, setFilters] = useState({
    feed: "for_you",
    category: "all",
    lang: "all",
    hideSpoilers: false,
    muteByDefault: true,
  });

  useEffect(() => {
    // Keep "muteByDefault" applied to actual muted state for demo
    setMuted(filters.muteByDefault);
  }, [filters.muteByDefault]);

  // Derived: show "spoiler" chip, but can hide content if hideSpoilers true
  const isHiddenBySpoilers = Boolean(
    filters.hideSpoilers && activeItem?.flags?.spoiler,
  );

  return (
    <div
      dir={dir}
      className={cn(
        "relative h-[100svh] w-full overflow-hidden",
        "bg-background text-foreground",
      )}
    >
      {/* Subtle aurora overlay (very light, doesn't fight the video) */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className={cn(
            "absolute -inset-24 opacity-[0.18]",
            "bg-[radial-gradient(60%_50%_at_50%_30%,rgba(3,190,200,0.75),transparent_70%)]",
            "animate-aurora-lite",
          )}
        />
        <div
          className={cn(
            "absolute -inset-24 opacity-[0.12]",
            "bg-[radial-gradient(55%_45%_at_20%_60%,rgba(236,72,153,0.55),transparent_70%)]",
            "animate-aurora-lite",
          )}
        />
      </div>

      {/* Top bar */}
      <div className="absolute inset-x-0 top-0 z-40">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/55 via-black/20 to-transparent" />
        <div
          className={cn(
            "relative flex items-center justify-between gap-2 px-3 pt-2",
            "pb-2",
            "pointer-events-auto",
          )}
          style={{ paddingTop: "calc(env(safe-area-inset-top) + 8px)" }}
        >
          <div
            className={cn(
              "flex items-center gap-2",
              isRTL && "flex-row-reverse",
            )}
          >
            <Button
              iconOnly
              aria-label={isRTL ? "رجوع" : "Back"}
              variant="inverse"
              tone="neutral"
              size="md"
              onClick={() => {
                // demo back: if history exists, go back; else just scroll to top
                if (typeof window !== "undefined" && window.history.length > 1)
                  window.history.back();
                else
                  scrollerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
              }}
              tooltip={isRTL ? "رجوع" : "Back"}
            >
              <IoChevronBack className={cn("size-5", isRTL && "rotate-180")} />
            </Button>

            <div className={cn("min-w-0", isRTL ? "text-right" : "text-left")}>
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold text-white">
                  {isRTL ? "سوايبز" : "Swipes"}
                </div>
                <span className="rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/90">
                  {filters.feed === "for_you"
                    ? isRTL
                      ? "لك"
                      : "For You"
                    : filters.feed === "following"
                      ? isRTL
                        ? "المتابَعين"
                        : "Following"
                      : isRTL
                        ? "التحديات"
                        : "Challenges"}
                </span>
              </div>
              <div className="text-[11px] text-white/70">
                {isRTL
                  ? "تصفح سريع لمقاطع قصيرة (تجربة واجهة)"
                  : "Short-form feed (UI demo)"}
              </div>
            </div>
          </div>

          <div
            className={cn(
              "flex items-center gap-2",
              isRTL && "flex-row-reverse",
            )}
          >
            <Button
              iconOnly
              aria-label={isRTL ? "بحث" : "Search"}
              variant="inverse"
              tone="neutral"
              size="md"
              onClick={() => setFiltersOpen(true)}
              tooltip={isRTL ? "بحث/فلترة" : "Search/Filters"}
            >
              <IoSearch className="size-5" />
            </Button>

            <Button
              iconOnly
              aria-label={isRTL ? "الإعدادات" : "Settings"}
              variant="inverse"
              tone="neutral"
              size="md"
              onClick={() => setFiltersOpen(true)}
              tooltip={isRTL ? "الإعدادات" : "Settings"}
            >
              <IoSettingsOutline className="size-5" />
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-3 pb-2">
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-white/70"
              initial={false}
              animate={{
                width: `${Math.round(progress * 100)}%`,
              }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 0.18, ease: "easeOut" }
              }
            />
          </div>
        </div>
      </div>

      {/* Scroller */}
      <div
        ref={scrollerRef}
        className={cn(
          "relative z-10 h-[100svh] w-full overflow-y-scroll overscroll-contain",
          "snap-y snap-mandatory",
          "no-scrollbar",
        )}
      >
        {items.map((item, index) => {
          const isActive = index === activeIndex;
          const isLiked = Boolean(liked[item.id]);
          const isSaved = Boolean(saved[item.id]);
          const isFollowing = Boolean(following[item.user.handle]);

          // Basic content hiding demo for spoiler filter
          const contentHidden = Boolean(
            filters.hideSpoilers && item.flags?.spoiler,
          );

          return (
            <SwipeCard
              key={item.id}
              dir={dir}
              dark={dark}
              index={index}
              active={isActive}
              item={item}
              viewportH={viewportH}
              muted={muted}
              paused={paused}
              hudVisible={hudVisible}
              swipeHintVisible={swipeHintVisible && index === 0}
              contentHidden={contentHidden}
              isLiked={isLiked}
              isSaved={isSaved}
              isFollowing={isFollowing}
              setVideoRef={setVideoRef(index)}
              onWakeHUD={() => setHudVisible(true)}
              onToggleMute={() => {
                setMuted((m) => !m);
                setHudVisible(true);
              }}
              onTogglePause={() => {
                setPaused((p) => !p);
                setHudVisible(true);
              }}
              onOpenComments={() => {
                setCommentsOpen(true);
                setHudVisible(true);
              }}
              onOpenShare={() => {
                requestShare(item);
                setHudVisible(true);
              }}
              onToggleLike={(forceOn) => {
                toggleLike(item.id, forceOn);
                setHudVisible(true);
              }}
              onToggleSave={() => {
                toggleSave(item.id);
                setHudVisible(true);
              }}
              onToggleFollow={() => {
                toggleFollow(item.id);
                setHudVisible(true);
              }}
              onOpenOptions={() => {
                openOptionsFor(item.id);
                setHudVisible(true);
              }}
              onGoToAnime={() => {
                // demo nav (if you have route)
                if (item.anime?.slug) {
                  const href = `/anime/${item.anime.slug}`;
                  window.location.assign(href);
                }
              }}
              onGoToProfile={() => {
                const href = `/u/${item.user.handle}`;
                window.location.assign(href);
              }}
            />
          );
        })}
      </div>

      {/* Bottom mini hint bar (only when spoiler hidden) */}
      <AnimatePresence>
        {isHiddenBySpoilers && (
          <motion.div
            className={cn(
              "absolute inset-x-0 bottom-0 z-50 px-3",
              "pb-[calc(env(safe-area-inset-bottom)+12px)]",
            )}
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: { duration: reduceMotion ? 0 : 0.18 },
            }}
            exit={{
              opacity: 0,
              y: 10,
              transition: { duration: reduceMotion ? 0 : 0.12 },
            }}
          >
            <div
              className={cn(
                "rounded-2xl border border-white/10 bg-black/55 backdrop-blur-[10px]",
                "p-3 text-white shadow-[var(--shadow-elevated)]",
              )}
            >
              <div
                className={cn(
                  "flex items-start gap-3",
                  isRTL && "flex-row-reverse",
                )}
              >
                <div className="grid size-9 place-items-center rounded-xl bg-white/10">
                  <IoWarningOutline className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">
                    {isRTL ? "تم إخفاء هذا المحتوى" : "Content hidden"}
                  </div>
                  <div className="mt-0.5 text-[12px] text-white/75">
                    {isRTL
                      ? "هذا السوايب مُعلّم كـ Spoiler. عطّل خيار إخفاء الحرق لعرضه."
                      : "This swipe is marked as Spoiler. Disable “Hide spoilers” to view it."}
                  </div>
                  <div
                    className={cn(
                      "mt-2 flex gap-2",
                      isRTL && "flex-row-reverse",
                    )}
                  >
                    <Button
                      size="sm"
                      variant="solid"
                      tone="brand"
                      onClick={() =>
                        setFilters((s) => ({ ...s, hideSpoilers: false }))
                      }
                    >
                      {isRTL ? "عرض المحتوى" : "Show content"}
                    </Button>
                    <Button
                      size="sm"
                      variant="plain"
                      tone="neutral"
                      onClick={() => setFiltersOpen(true)}
                    >
                      {isRTL ? "الإعدادات" : "Settings"}
                    </Button>
                  </div>
                </div>

                <button
                  type="button"
                  className="grid size-9 place-items-center rounded-xl bg-white/10 text-white"
                  onClick={() =>
                    setFilters((s) => ({ ...s, hideSpoilers: false }))
                  }
                  aria-label={isRTL ? "إغلاق" : "Close"}
                >
                  <IoClose className="size-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Options Sheet */}
      <OptionsSheet
        open={optionsOpen}
        onOpenChange={setOptionsOpen}
        dir={dir}
        options={optionsForTarget}
        onAction={onOptionsAction}
      />

      {/* Comments Modal */}
      <CommentsModal
        open={commentsOpen}
        onOpenChange={setCommentsOpen}
        dir={dir}
        item={activeItem}
        liked={liked}
        onToggleLike={toggleLike}
      />

      {/* Share Modal */}
      <ShareModal
        open={shareOpen}
        onOpenChange={setShareOpen}
        dir={dir}
        item={activeItem}
      />

      {/* Filters Modal */}
      <Modal
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        dir={dir}
        mode={{ desktop: "center", mobile: "sheet" }}
        title={isRTL ? "بحث وفلترة" : "Search & Filters"}
        subtitle={
          isRTL
            ? "تحكم بتجربة سوايبز حسب تفضيلاتك"
            : "Tune your Swipes experience"
        }
        maxWidthClass="max-w-xl"
        panelClassName="bg-background-elevated"
        footer={
          <div
            className={cn(
              "flex items-center justify-between gap-2",
              isRTL && "flex-row-reverse",
            )}
          >
            <Button
              variant="plain"
              tone="neutral"
              onClick={() =>
                setFilters({
                  feed: "for_you",
                  category: "all",
                  lang: "all",
                  hideSpoilers: false,
                  muteByDefault: true,
                })
              }
            >
              {isRTL ? "إعادة ضبط" : "Reset"}
            </Button>
            <div
              className={cn(
                "flex items-center gap-2",
                isRTL && "flex-row-reverse",
              )}
            >
              <Button
                variant="plain"
                tone="neutral"
                onClick={() => setFiltersOpen(false)}
              >
                {isRTL ? "إغلاق" : "Close"}
              </Button>
              <Button
                variant="solid"
                tone="brand"
                onClick={() => setFiltersOpen(false)}
              >
                {isRTL ? "تطبيق" : "Apply"}
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          <div
            className={cn("grid gap-3 md:grid-cols-3", isRTL && "text-right")}
          >
            <CardBlock title={isRTL ? "نوع الخلاصة" : "Feed"}>
              <SmartSelect
                options={FEED_OPTIONS}
                value={filters.feed}
                onChange={(v) =>
                  setFilters((s) => ({
                    ...s,
                    feed:
                      (Array.isArray(v) ? v[0] : (v as string)) || "for_you",
                  }))
                }
                searchable={false}
                placeholder={isRTL ? "اختر" : "Select"}
                variant="solid"
                size="md"
              />
            </CardBlock>

            <CardBlock title={isRTL ? "الفئة" : "Category"}>
              <SmartSelect
                options={CATEGORY_OPTIONS}
                value={filters.category}
                onChange={(v) =>
                  setFilters((s) => ({
                    ...s,
                    category:
                      (Array.isArray(v) ? v[0] : (v as string)) || "all",
                  }))
                }
                searchable
                placeholder={isRTL ? "ابحث/اختر" : "Search/select"}
                variant="solid"
                size="md"
              />
            </CardBlock>

            <CardBlock title={isRTL ? "اللغة" : "Language"}>
              <SmartSelect
                options={LANG_OPTIONS}
                value={filters.lang}
                onChange={(v) =>
                  setFilters((s) => ({
                    ...s,
                    lang: (Array.isArray(v) ? v[0] : (v as string)) || "all",
                  }))
                }
                searchable={false}
                placeholder={isRTL ? "اختر" : "Select"}
                variant="solid"
                size="md"
              />
            </CardBlock>
          </div>

          <div
            className={cn("grid gap-3 md:grid-cols-2", isRTL && "text-right")}
          >
            <ToggleCard
              title={isRTL ? "إخفاء الحرق (Spoilers)" : "Hide spoilers"}
              description={
                isRTL
                  ? "يخفي السوايبز المعلمة كـ Spoiler افتراضيًا."
                  : "Hide swipes marked as Spoiler by default."
              }
              checked={filters.hideSpoilers}
              onChange={(v) => setFilters((s) => ({ ...s, hideSpoilers: v }))}
              icon={<IoWarningOutline className="size-5" />}
              tone="warning"
              dir={dir}
            />

            <ToggleCard
              title={isRTL ? "كتم الصوت افتراضيًا" : "Mute by default"}
              description={
                isRTL
                  ? "لضمان تشغيل تلقائي سلس على الجوال."
                  : "Helps smooth autoplay on mobile browsers."
              }
              checked={filters.muteByDefault}
              onChange={(v) => setFilters((s) => ({ ...s, muteByDefault: v }))}
              icon={<IoVolumeMuteOutline className="size-5" />}
              tone="brand"
              dir={dir}
            />
          </div>

          <div className="rounded-2xl border border-border-subtle bg-surface-soft p-3">
            <div
              className={cn(
                "flex items-start gap-3",
                isRTL && "flex-row-reverse",
              )}
            >
              <div className="grid size-10 place-items-center rounded-2xl border border-border-subtle bg-background-elevated">
                <IoInformationCircleOutline className="size-6 text-foreground-strong" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-foreground-strong">
                  {isRTL ? "ملاحظة مهمة" : "Important note"}
                </div>
                <p className="mt-1 text-[12px] text-foreground-muted">
                  {isRTL
                    ? "هذه الصفحة تجريبية لعرض التصميم والتفاعل. اربطها لاحقًا بباك-إند Swipes (paging، recommendations، moderation، metrics)."
                    : "This is a UI prototype page. Later, wire it to your Swipes backend (paging, recommendations, moderation, metrics)."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ---------------------------------------------
   Swipe Card
----------------------------------------------*/

function SwipeCard(props: {
  dir: Dir;
  dark: boolean;

  index: number;
  active: boolean;
  item: SwipeItem;
  viewportH: number;

  muted: boolean;
  paused: boolean;
  hudVisible: boolean;

  swipeHintVisible: boolean;
  contentHidden: boolean;

  isLiked: boolean;
  isSaved: boolean;
  isFollowing: boolean;

  setVideoRef: (el: HTMLVideoElement | null) => void;

  onWakeHUD: () => void;
  onToggleMute: () => void;
  onTogglePause: () => void;

  onOpenComments: () => void;
  onOpenShare: () => void;

  onToggleLike: (forceOn?: boolean) => void;
  onToggleSave: () => void;
  onToggleFollow: () => void;
  onOpenOptions: () => void;

  onGoToAnime: () => void;
  onGoToProfile: () => void;
}) {
  const {
    dir,
    index,
    active,
    item,
    muted,
    paused,
    hudVisible,
    swipeHintVisible,
    contentHidden,
    isLiked,
    isSaved,
    isFollowing,
    setVideoRef,
    onWakeHUD,
    onToggleMute,
    onTogglePause,
    onOpenComments,
    onOpenShare,
    onToggleLike,
    onToggleSave,
    onToggleFollow,
    onOpenOptions,
    onGoToAnime,
    onGoToProfile,
  } = props;

  const reduceMotion = useReducedMotion();
  const isRTL = dir === "rtl";

  // Double-tap like burst hearts
  const [bursts, setBursts] = useState<
    Array<{ key: string; x: number; y: number }>
  >([]);
  const burstTimerRef = useRef<number | null>(null);

  const tapTimeoutRef = useRef<number | null>(null);
  const lastTapAtRef = useRef<number>(0);

  const pointerRef = useRef<{
    downAt: number;
    startX: number;
    startY: number;
    moved: boolean;
    holdArmed: boolean;
    holdTriggered: boolean;
  } | null>(null);

  const holdTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (tapTimeoutRef.current) window.clearTimeout(tapTimeoutRef.current);
      if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);
      if (burstTimerRef.current) window.clearTimeout(burstTimerRef.current);
    };
  }, []);

  const spawnBurst = (x: number, y: number) => {
    const key = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
    setBursts((s) => [...s, { key, x, y }]);

    // cleanup
    if (burstTimerRef.current) window.clearTimeout(burstTimerRef.current);
    burstTimerRef.current = window.setTimeout(() => setBursts([]), 720);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!active) return;

    pointerRef.current = {
      downAt: safeNow(),
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
      holdArmed: !paused, // only "hold to pause" if currently playing
      holdTriggered: false,
    };

    onWakeHUD();

    // Hold-to-pause (press & hold)
    if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);
    holdTimerRef.current = window.setTimeout(() => {
      const p = pointerRef.current;
      if (!p) return;
      if (p.moved) return;
      if (!p.holdArmed) return;
      p.holdTriggered = true;
      onTogglePause(); // pause
    }, 220);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = pointerRef.current;
    if (!p) return;

    const dx = Math.abs(e.clientX - p.startX);
    const dy = Math.abs(e.clientY - p.startY);

    // If user is swiping/scrolling, ignore tap logic
    if (dx > 12 || dy > 12) {
      p.moved = true;
      if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = pointerRef.current;
    pointerRef.current = null;

    if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);

    if (!active) return;
    if (!p) return;

    // If hold triggered -> resume on release (like TikTok)
    if (p.holdTriggered) {
      // resume (toggle back)
      onTogglePause();
      return;
    }

    // ignore if user was scrolling
    if (p.moved) return;

    const now = safeNow();
    const since = now - lastTapAtRef.current;

    // double tap window
    const DOUBLE_TAP_MS = 280;

    if (since <= DOUBLE_TAP_MS) {
      // double tap => like
      lastTapAtRef.current = 0;
      if (tapTimeoutRef.current) window.clearTimeout(tapTimeoutRef.current);
      tapTimeoutRef.current = null;

      // Force like on
      onToggleLike(true);

      // burst location
      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
      const x = clamp(e.clientX - rect.left, 24, rect.width - 24);
      const y = clamp(e.clientY - rect.top, 24, rect.height - 24);
      spawnBurst(x, y);
      return;
    }

    // first tap => wait to see if double
    lastTapAtRef.current = now;

    if (tapTimeoutRef.current) window.clearTimeout(tapTimeoutRef.current);
    tapTimeoutRef.current = window.setTimeout(() => {
      tapTimeoutRef.current = null;
      // single tap => pause/play
      onTogglePause();
    }, DOUBLE_TAP_MS);
  };

  const showSpoilerChip = Boolean(item.flags?.spoiler);
  const showSponsored = Boolean(item.flags?.sponsored);

  const accentLine = (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
  );

  return (
    <section
      className={cn(
        "relative w-full snap-start snap-always overflow-hidden",
        "h-[100svh]",
      )}
      aria-roledescription="slide"
      aria-label={`Swipe ${index + 1}`}
    >
      {/* Background: video or hidden placeholder */}
      <div className="absolute inset-0">
        {!contentHidden ? (
          <video
            ref={setVideoRef}
            className="h-full w-full object-cover"
            src={item.videoUrl}
            poster={item.posterUrl}
            playsInline
            muted={muted}
            loop
            preload={active ? "auto" : "metadata"}
            controls={false}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-b from-black via-black/80 to-black">
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(60%_50%_at_50%_30%,rgba(3,190,200,0.35),transparent_70%)]" />
          </div>
        )}

        {/* Soft vignettes for readability */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/65" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_40%,transparent_40%,rgba(0,0,0,0.55)_100%)]" />
      </div>

      {/* Tap layer (handles gestures, but keeps scroll behavior) */}
      <div
        className="absolute inset-0 z-20"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);
          pointerRef.current = null;
        }}
      />

      {/* Top badges */}
      <div
        className="absolute inset-x-0 top-0 z-30 px-3"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 76px)" }}
      >
        <div
          className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}
        >
          {showSponsored && (
            <Pill tone="pink" icon={<IoSparklesOutline className="size-4" />}>
              {isRTL ? "برعاية" : "Sponsored"}
            </Pill>
          )}

          {showSpoilerChip && (
            <Pill tone="warning" icon={<IoWarningOutline className="size-4" />}>
              {isRTL ? "حرق" : "Spoiler"}
            </Pill>
          )}

          {item.event?.title && (
            <Pill
              tone={item.event.tone ?? "brand"}
              icon={<IoTimeOutline className="size-4" />}
            >
              {item.event.endsInHours != null
                ? isRTL
                  ? `تحدي • ينتهي خلال ${item.event.endsInHours}س`
                  : `Challenge • ends in ${item.event.endsInHours}h`
                : isRTL
                  ? "تحدي"
                  : "Challenge"}
            </Pill>
          )}
        </div>
      </div>

      {/* Right actions rail */}
      <div
        className={cn(
          "absolute z-40",
          "end-2 top-1/2 -translate-y-1/2",
          "flex flex-col items-center gap-3",
          "pb-[calc(env(safe-area-inset-bottom)+10px)]",
        )}
      >
        {/* Avatar + follow */}
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onGoToProfile();
            }}
            className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            aria-label={isRTL ? "الملف الشخصي" : "Profile"}
          >
            <Avatar
              src={item.user.avatarUrl}
              size="14"
              rounded
              effects={false}
              className={cn(
                "ring-2 ring-white/50 shadow-[0_12px_30px_rgba(0,0,0,0.35)]",
                "bg-white/10",
              )}
              name={item.user.name}
            />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFollow();
            }}
            className={cn(
              "absolute -bottom-2 left-1/2 -translate-x-1/2",
              "grid size-7 place-items-center rounded-full",
              isFollowing ? "bg-white/15 text-white/85" : "bg-white text-black",
              "border border-white/10 shadow-[0_10px_25px_rgba(0,0,0,0.35)]",
              "transition active:scale-[0.98]",
            )}
            aria-label={
              isFollowing
                ? isRTL
                  ? "إلغاء المتابعة"
                  : "Unfollow"
                : isRTL
                  ? "متابعة"
                  : "Follow"
            }
          >
            {isFollowing ? (
              <IoCheckmark className="size-4" />
            ) : (
              <span className="text-[18px] leading-none">+</span>
            )}
          </button>
        </div>

        <ActionIcon
          icon={
            <motion.span
              key={String(isLiked)}
              initial={reduceMotion ? false : { scale: 0.95 }}
              animate={reduceMotion ? undefined : { scale: isLiked ? 1.05 : 1 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="inline-flex items-center justify-center"
            >
              {isLiked ? (
                <IoHeart className="size-6 text-rose-400" />
              ) : (
                <IoHeartOutline className="size-6" />
              )}
            </motion.span>
          }
          label={formatCompact(item.stats.likes + (isLiked ? 1 : 0))}
          onClick={(e) => {
            e.stopPropagation();
            onToggleLike();
          }}
          ariaLabel={isRTL ? "إعجاب" : "Like"}
        />

        <ActionIcon
          icon={<IoChatbubbleEllipsesOutline className="size-6" />}
          label={formatCompact(item.stats.comments)}
          onClick={(e) => {
            e.stopPropagation();
            onOpenComments();
          }}
          ariaLabel={isRTL ? "تعليقات" : "Comments"}
        />

        <ActionIcon
          icon={
            isSaved ? (
              <IoBookmark className="size-6 text-emerald-300" />
            ) : (
              <IoBookmarkOutline className="size-6" />
            )
          }
          label={
            isRTL ? (isSaved ? "محفوظ" : "حفظ") : isSaved ? "Saved" : "Save"
          }
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave();
          }}
          ariaLabel={isRTL ? "حفظ" : "Save"}
          compactLabel
        />

        <ActionIcon
          icon={<IoShareSocialOutline className="size-6" />}
          label={formatCompact(item.stats.shares)}
          onClick={(e) => {
            e.stopPropagation();
            onOpenShare();
          }}
          ariaLabel={isRTL ? "مشاركة" : "Share"}
        />

        <ActionIcon
          icon={<IoEllipsisHorizontalOutline className="size-6" />}
          label={isRTL ? "المزيد" : "More"}
          onClick={(e) => {
            e.stopPropagation();
            onOpenOptions();
          }}
          ariaLabel={isRTL ? "المزيد" : "More"}
          compactLabel
        />
      </div>

      {/* Bottom info */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-30 px-3",
          "pb-[calc(env(safe-area-inset-bottom)+14px)]",
        )}
      >
        {accentLine}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />

        <div
          className={cn(
            "relative flex items-end justify-between gap-3",
            isRTL && "flex-row-reverse",
          )}
        >
          <div
            className={cn("min-w-0 flex-1", isRTL ? "text-right" : "text-left")}
          >
            <div
              className={cn(
                "flex items-center gap-2",
                isRTL && "flex-row-reverse",
              )}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onGoToProfile();
                }}
                className="pointer-events-auto text-white"
              >
                <span className="text-sm font-semibold">
                  @{item.user.handle}
                </span>
              </button>

              {item.user.verified && (
                <span className="pointer-events-none rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-white/85">
                  {isRTL ? "موثّق" : "Verified"}
                </span>
              )}

              <span className="pointer-events-none rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/80">
                {item.kind.toUpperCase()}
              </span>
            </div>

            <p className="mt-1 max-w-[72ch] text-[13px] leading-5 text-white/90">
              {item.caption}
            </p>

            {/* Tags */}
            <div
              className={cn(
                "mt-2 flex flex-wrap gap-1.5",
                isRTL && "justify-end",
              )}
            >
              {item.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className={cn(
                    "pointer-events-none inline-flex items-center rounded-full",
                    "border border-white/10 bg-white/10 px-2 py-0.5",
                    "text-[11px] font-semibold text-white/85",
                  )}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Anime + audio row */}
            <div
              className={cn(
                "mt-2 flex flex-wrap items-center gap-2",
                isRTL && "justify-end",
              )}
            >
              {item.anime?.title && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onGoToAnime();
                  }}
                  className={cn(
                    "pointer-events-auto inline-flex items-center gap-2",
                    "rounded-full border border-white/10 bg-black/35 backdrop-blur-[10px]",
                    "px-3 py-1.5 text-[12px] font-semibold text-white/90",
                    "hover:bg-black/45 active:bg-black/55 transition",
                  )}
                  aria-label={isRTL ? "فتح صفحة العمل" : "Open title page"}
                >
                  <IoInformationCircleOutline className="size-4" />
                  <span className="truncate max-w-[16rem]">
                    {item.anime.title}
                    {item.anime.year ? (
                      <span className="text-white/70">
                        {" "}
                        • {item.anime.year}
                      </span>
                    ) : null}
                  </span>
                  <span className="text-white/70">
                    {isRTL ? "فتح" : "Open"}
                  </span>
                </button>
              )}

              {item.audio?.title && (
                <div
                  className={cn(
                    "pointer-events-none inline-flex items-center gap-2",
                    "rounded-full border border-white/10 bg-black/35 backdrop-blur-[10px]",
                    "px-3 py-1.5 text-[12px] font-semibold text-white/90",
                  )}
                >
                  <IoSparklesOutline className="size-4" />
                  <span className="truncate max-w-[18rem]">
                    {item.audio.title}{" "}
                    <span className="text-white/70">— {item.audio.artist}</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* HUD Controls (play/pause + mute) */}
          <AnimatePresence>
            {hudVisible && (
              <motion.div
                className={cn(
                  "relative pointer-events-auto",
                  "rounded-2xl border border-white/10 bg-black/35 backdrop-blur-[12px]",
                  "p-2 shadow-[var(--shadow-elevated)]",
                )}
                initial={
                  reduceMotion ? false : { opacity: 0, y: 10, scale: 0.98 }
                }
                animate={
                  reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }
                }
                exit={
                  reduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: 10, scale: 0.98 }
                }
                transition={{
                  duration: reduceMotion ? 0 : 0.16,
                  ease: "easeOut",
                }}
              >
                <div
                  className={cn(
                    "flex items-center gap-2",
                    isRTL && "flex-row-reverse",
                  )}
                >
                  <Button
                    iconOnly
                    aria-label={
                      paused
                        ? isRTL
                          ? "تشغيل"
                          : "Play"
                        : isRTL
                          ? "إيقاف مؤقت"
                          : "Pause"
                    }
                    variant="inverse"
                    tone="neutral"
                    size="md"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePause();
                    }}
                    tooltip={
                      paused
                        ? isRTL
                          ? "تشغيل"
                          : "Play"
                        : isRTL
                          ? "إيقاف مؤقت"
                          : "Pause"
                    }
                  >
                    {paused ? (
                      <IoPlay className="size-5" />
                    ) : (
                      <IoPause className="size-5" />
                    )}
                  </Button>

                  <Button
                    iconOnly
                    aria-label={
                      muted
                        ? isRTL
                          ? "إلغاء الكتم"
                          : "Unmute"
                        : isRTL
                          ? "كتم"
                          : "Mute"
                    }
                    variant="inverse"
                    tone="neutral"
                    size="md"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleMute();
                    }}
                    tooltip={
                      muted
                        ? isRTL
                          ? "إلغاء الكتم"
                          : "Unmute"
                        : isRTL
                          ? "كتم"
                          : "Mute"
                    }
                  >
                    {muted ? (
                      <IoVolumeMuteOutline className="size-5" />
                    ) : (
                      <IoVolumeHighOutline className="size-5" />
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Swipe hint for first item */}
        <AnimatePresence>
          {swipeHintVisible && (
            <motion.div
              className="relative mt-3 flex justify-center"
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: reduceMotion ? 0 : 0.18 }}
            >
              <div className="pointer-events-none inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-[11px] font-semibold text-white/85 backdrop-blur-[10px]">
                <IoArrowDown className="size-4 rotate-180" />
                {isRTL
                  ? "اسحب للأعلى للتالي • دوبل تاب للإعجاب"
                  : "Swipe up • Double tap to like"}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Like bursts */}
      <div className="pointer-events-none absolute inset-0 z-40">
        <AnimatePresence>
          {bursts.map((b) => (
            <motion.div
              key={b.key}
              className="absolute"
              style={{
                left: b.x,
                top: b.y,
                transform: "translate(-50%, -50%)",
              }}
              initial={
                reduceMotion
                  ? { opacity: 1, scale: 1 }
                  : { opacity: 0, scale: 0.6, y: 10 }
              }
              animate={
                reduceMotion
                  ? { opacity: 1, scale: 1 }
                  : {
                      opacity: 1,
                      scale: [0.9, 1.15, 1],
                      y: [-8, -18, -30],
                    }
              }
              exit={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.9, y: -38 }
              }
              transition={{
                duration: reduceMotion ? 0 : 0.55,
                ease: "easeOut",
              }}
            >
              <IoHeart className="size-14 text-white drop-shadow-[0_14px_26px_rgba(0,0,0,0.45)]" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ---------------------------------------------
   UI atoms
----------------------------------------------*/

function Pill(props: {
  tone: "brand" | "warning" | "pink" | "purple";
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { tone, icon, children } = props;

  const toneCls =
    tone === "warning"
      ? "bg-amber-500/20 border-amber-500/30 text-amber-200"
      : tone === "pink"
        ? "bg-pink-500/20 border-pink-500/30 text-pink-200"
        : tone === "purple"
          ? "bg-purple-500/20 border-purple-500/30 text-purple-200"
          : "bg-cyan-500/20 border-cyan-500/30 text-cyan-200";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
        "text-[11px] font-semibold backdrop-blur-[10px]",
        toneCls,
      )}
    >
      {icon ? <span className="inline-flex">{icon}</span> : null}
      <span>{children}</span>
    </span>
  );
}

function ActionIcon(props: {
  icon: React.ReactNode;
  label: string;
  ariaLabel: string;
  onClick: (e: React.MouseEvent) => void;
  compactLabel?: boolean;
}) {
  const { icon, label, ariaLabel, onClick, compactLabel } = props;

  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        iconOnly
        aria-label={ariaLabel}
        variant="inverse"
        tone="neutral"
        size="lg"
        onClick={onClick}
      >
        {icon}
      </Button>

      <div
        className={cn(
          "text-center text-[11px] font-semibold text-white/85",
          compactLabel && "text-[10px] leading-4",
          "drop-shadow-[0_10px_22px_rgba(0,0,0,0.45)]",
        )}
      >
        {label}
      </div>
    </div>
  );
}

function CardBlock(props: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-3 shadow-soft">
      <div className="text-xs font-semibold text-foreground-strong">
        {props.title}
      </div>
      <div className="mt-2">{props.children}</div>
    </div>
  );
}

function ToggleCard(props: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  icon: React.ReactNode;
  tone: "brand" | "warning";
  dir: Dir;
}) {
  const { title, description, checked, onChange, icon, tone, dir } = props;
  const isRTL = dir === "rtl";

  const toneRing =
    tone === "warning"
      ? "focus-visible:ring-[color:var(--ring-warning)]"
      : "focus-visible:ring-[color:var(--ring-brand)]";

  const dotTone =
    tone === "warning"
      ? checked
        ? "bg-warning-solid text-warning-foreground"
        : "bg-surface-muted text-foreground-soft"
      : checked
        ? "bg-accent text-accent-foreground"
        : "bg-surface-muted text-foreground-soft";

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-3 shadow-soft">
      <div
        className={cn("flex items-start gap-3", isRTL && "flex-row-reverse")}
      >
        <div
          className={cn(
            "grid size-11 place-items-center rounded-2xl border border-border-subtle",
            checked ? "bg-accent-soft" : "bg-surface-soft",
          )}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-foreground-strong">
            {title}
          </div>
          <div className="mt-1 text-[12px] text-foreground-muted">
            {description}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onChange(!checked)}
          className={cn(
            "relative inline-flex h-9 w-16 items-center rounded-full border border-border-strong bg-surface-soft",
            "outline-none transition",
            "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg-page)]",
            toneRing,
          )}
          aria-pressed={checked}
          aria-label={title}
        >
          <span
            className={cn(
              "absolute top-1/2 -translate-y-1/2 transition-transform",
              isRTL
                ? checked
                  ? "translate-x-[-0.25rem] right-1"
                  : "translate-x-[-2.1rem] right-1"
                : checked
                  ? "translate-x-[2.1rem] left-1"
                  : "translate-x-[0.25rem] left-1",
              "grid size-7 place-items-center rounded-full",
              dotTone,
              "shadow-[var(--shadow-sm)]",
            )}
          >
            {checked ? <IoCheckmark className="size-4" /> : null}
          </span>
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------
   Comments Modal (demo)
----------------------------------------------*/

function CommentsModal(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dir: Dir;
  item?: SwipeItem;
  liked: Record<string, boolean>;
  onToggleLike: (id: string, forceOn?: boolean) => void;
}) {
  const { open, onOpenChange, dir, item } = props;
  const isRTL = dir === "rtl";

  const [draft, setDraft] = useState("");
  const [localComments, setLocalComments] = useState<
    Array<{
      id: string;
      name: string;
      handle: string;
      text: string;
      at: string;
    }>
  >([]);

  useEffect(() => {
    if (!open) return;
    setDraft("");
    // demo seed comments per item
    const seed = item?.id ?? "x";
    setLocalComments([
      {
        id: `${seed}_c1`,
        name: isRTL ? "ليان" : "Lian",
        handle: "lian",
        text: isRTL ? "التصميم فخم جدًا 🔥" : "This UI is super clean 🔥",
        at: isRTL ? "الآن" : "now",
      },
      {
        id: `${seed}_c2`,
        name: isRTL ? "عمر" : "Omar",
        handle: "omar",
        text: isRTL
          ? "حركة السوايب سلسة! نحتاج كمان إضافة (حفظ للمتابعة لاحقًا)."
          : "Swipe feels smooth. Add a Watch Later too!",
        at: isRTL ? "منذ 3د" : "3m",
      },
      {
        id: `${seed}_c3`,
        name: isRTL ? "Nora" : "Nora",
        handle: "nora",
        text: isRTL ? "الـ Glass effect رهيب ✨" : "Glass effect is ✨",
        at: isRTL ? "منذ 12د" : "12m",
      },
    ]);
  }, [open, item?.id, isRTL]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    const id = `${item?.id ?? "x"}_${Date.now()}`;

    setLocalComments((s) => [
      {
        id,
        name: isRTL ? "أنت" : "You",
        handle: "you",
        text,
        at: isRTL ? "الآن" : "now",
      },
      ...s,
    ]);
    setDraft("");
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      dir={dir}
      mode={{ desktop: "center", mobile: "sheet" }}
      maxWidthClass="max-w-lg"
      title={isRTL ? "التعليقات" : "Comments"}
      subtitle={
        item
          ? isRTL
            ? `على @${item.user.handle}`
            : `on @${item.user.handle}`
          : undefined
      }
      panelClassName="bg-background-elevated"
      footer={
        <div
          className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}
        >
          <div className="flex-1">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={isRTL ? "اكتب تعليق..." : "Write a comment…"}
              className={cn(
                "h-11 w-full rounded-xl border border-border-subtle bg-surface-soft px-3 text-sm text-foreground outline-none",
                "focus-visible:ring-2 focus-visible:ring-[color:var(--ring-brand)] focus-visible:ring-offset-1 focus-visible:ring-offset-[color:var(--bg-page)]",
              )}
            />
          </div>

          <Button
            variant="solid"
            tone="brand"
            size="md"
            onClick={send}
            disabled={!draft.trim()}
          >
            {isRTL ? "إرسال" : "Send"}
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        {!item ? (
          <div className="rounded-2xl border border-border-subtle bg-surface-soft p-4 text-sm text-foreground-muted">
            {isRTL ? "لا يوجد محتوى." : "No content."}
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-border-subtle bg-surface-soft p-3">
              <div
                className={cn(
                  "flex items-center gap-3",
                  isRTL && "flex-row-reverse",
                )}
              >
                <Avatar
                  src={item.user.avatarUrl}
                  size="12"
                  rounded
                  effects={false}
                  className="ring-1 ring-border-subtle bg-surface-muted"
                  name={item.user.name}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-foreground-strong">
                    @{item.user.handle}
                  </div>
                  <div className="text-[12px] text-foreground-muted line-clamp-2">
                    {item.caption}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {localComments.map((c) => (
                <div
                  key={c.id}
                  className={cn(
                    "rounded-2xl border border-border-subtle bg-surface p-3",
                    "shadow-soft",
                  )}
                >
                  <div
                    className={cn(
                      "flex items-start gap-3",
                      isRTL && "flex-row-reverse",
                    )}
                  >
                    <Avatar
                      src={`https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(c.handle)}&backgroundColor=03bec8`}
                      size="10"
                      rounded
                      effects={false}
                      className="ring-1 ring-border-subtle bg-surface-muted"
                      name={c.name}
                    />
                    <div className="min-w-0 flex-1">
                      <div
                        className={cn(
                          "flex items-center gap-2",
                          isRTL && "flex-row-reverse",
                        )}
                      >
                        <div className="text-sm font-semibold text-foreground-strong">
                          {c.name}
                          <span className="text-foreground-soft">
                            {" "}
                            • @{c.handle}
                          </span>
                        </div>
                        <span className="text-[11px] text-foreground-soft">
                          {c.at}
                        </span>
                      </div>
                      <div className="mt-1 text-[13px] text-foreground">
                        {c.text}
                      </div>
                    </div>
                    <Button
                      iconOnly
                      aria-label={isRTL ? "إعجاب" : "Like"}
                      variant="plain"
                      tone="neutral"
                      size="md"
                      onClick={() => {}}
                    >
                      <IoHeartOutline className="size-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

/* ---------------------------------------------
   Share Modal (demo)
----------------------------------------------*/

function ShareModal(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dir: Dir;
  item?: SwipeItem;
}) {
  const { open, onOpenChange, dir, item } = props;
  const isRTL = dir === "rtl";

  const url = item
    ? `https://fanaara.com/swipes/${item.id}`
    : "https://fanaara.com/swipes";
  const text =
    item?.caption ?? (isRTL ? "شاهد هذا على Fanaara" : "Watch this on Fanaara");

  const copy = async () => {
    try {
      if (navigator?.clipboard?.writeText)
        await navigator.clipboard.writeText(url);
    } catch {
      // ignore
    }
  };

  const openExternal = (kind: "x" | "whatsapp" | "telegram") => {
    const share = buildShareUrl(kind, url, text);
    window.open(share, "_blank", "noopener,noreferrer");
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      dir={dir}
      mode={{ desktop: "center", mobile: "sheet" }}
      maxWidthClass="max-w-md"
      title={isRTL ? "مشاركة" : "Share"}
      subtitle={isRTL ? "اختر طريقة مشاركة السوايب" : "Choose a way to share"}
      panelClassName="bg-background-elevated"
    >
      <div className="space-y-3">
        <div className="rounded-2xl border border-border-subtle bg-surface-soft p-3">
          <div className="text-xs font-semibold text-foreground-muted">
            {isRTL ? "الرابط" : "Link"}
          </div>
          <div
            className={cn(
              "mt-1 flex items-center gap-2",
              isRTL && "flex-row-reverse",
            )}
          >
            <div className="flex-1 truncate rounded-xl border border-border-subtle bg-background-elevated px-3 py-2 text-[12px] text-foreground">
              {url}
            </div>
            <Button
              iconOnly
              aria-label={isRTL ? "نسخ" : "Copy"}
              variant="soft"
              tone="brand"
              onClick={async () => {
                await copy();
              }}
              tooltip={isRTL ? "نسخ" : "Copy"}
            >
              <IoCopyOutline className="size-5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <ShareTile
            title={isRTL ? "مشاركة على X" : "Share to X"}
            subtitle={isRTL ? "تغريدة" : "Tweet"}
            icon={<IoShareSocialOutline className="size-5" />}
            onClick={() => openExternal("x")}
          />
          <ShareTile
            title={isRTL ? "واتساب" : "WhatsApp"}
            subtitle={isRTL ? "رسالة" : "Message"}
            icon={<IoLinkOutline className="size-5" />}
            onClick={() => openExternal("whatsapp")}
          />
          <ShareTile
            title={isRTL ? "تيليجرام" : "Telegram"}
            subtitle={isRTL ? "قناة/دردشة" : "Channel/chat"}
            icon={<IoLinkOutline className="size-5" />}
            onClick={() => openExternal("telegram")}
          />
          <ShareTile
            title={isRTL ? "المزيد..." : "More…"}
            subtitle={isRTL ? "خيارات إضافية" : "More options"}
            icon={<IoEllipsisHorizontalOutline className="size-5" />}
            onClick={() => onOpenChange(false)}
          />
        </div>

        <div className="rounded-2xl border border-border-subtle bg-surface p-3">
          <div
            className={cn(
              "flex items-start gap-3",
              isRTL && "flex-row-reverse",
            )}
          >
            <div className="grid size-10 place-items-center rounded-2xl border border-border-subtle bg-background-elevated">
              <IoFlagOutline className="size-5 text-foreground-strong" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-foreground-strong">
                {isRTL ? "تنبيه" : "Note"}
              </div>
              <div className="mt-1 text-[12px] text-foreground-muted">
                {isRTL
                  ? "هذه واجهة تجريبية. اربطها لاحقًا بمشاركات النظام، وتتبع analytics، وحماية المحتوى."
                  : "Prototype UI. Later, wire it to system shares, analytics, and content safety."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function ShareTile(props: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={cn(
        "rounded-2xl border border-border-subtle bg-surface p-3 text-left",
        "hover:bg-surface-soft/70 active:bg-surface-soft/90 transition",
        "shadow-soft",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-foreground-strong">
            {props.title}
          </div>
          <div className="mt-0.5 text-[12px] text-foreground-muted">
            {props.subtitle}
          </div>
        </div>
        <div className="grid size-10 place-items-center rounded-2xl border border-border-subtle bg-background-elevated text-foreground-strong">
          {props.icon}
        </div>
      </div>
    </button>
  );
}
