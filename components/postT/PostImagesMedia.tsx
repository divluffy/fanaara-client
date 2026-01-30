"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
} from "framer-motion";
import type { Dir } from "@/types";
import type { ImageSource } from "./types";
import { CountryBadge, HeartPopup, LikedIndicator } from "./postMediaUi";
import { cn } from "@/utils";

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

function computeUniformHeightAndWidths(
  naturals: (NaturalSize | null)[],
  opts: { maxItemW: number; maxH: number; fallbackH?: number; minH?: number },
) {
  const { maxItemW, maxH } = opts;
  const fallbackH = opts.fallbackH ?? Math.min(360, maxH);
  const minH = opts.minH ?? 220;

  // collect max possible height for each image without exceeding maxItemW
  const hCaps: number[] = naturals
    .map((n) => {
      if (!n || n.w <= 0 || n.h <= 0) return null;

      // ratio = width/height
      const ratio = n.w / n.h;

      // if we choose a height H, width = H * ratio <= maxItemW => H <= maxItemW/ratio
      const hByMaxW = Math.floor(maxItemW / ratio);
      const hCap = Math.min(maxH, hByMaxW);

      return hCap > 0 ? hCap : null;
    })
    .filter((x): x is number => x !== null);

  if (hCaps.length === 0) {
    const targetH = clamp(fallbackH, minH, maxH);
    const widths = naturals.map(() => Math.floor(targetH * 1)); // ratio=1 fallback
    return { targetH, widths };
  }

  const avg = Math.floor(hCaps.reduce((a, b) => a + b, 0) / hCaps.length);
  const minCap = Math.min(...hCaps);

  // must not exceed any image cap; also keep within [minH, maxH]
  const targetH = clamp(Math.min(avg, minCap), minH, maxH);

  const widths = naturals.map((n) => {
    if (!n || n.w <= 0 || n.h <= 0) return Math.floor(targetH * 1);
    const ratio = n.w / n.h;
    return Math.floor(targetH * ratio);
  });

  return { targetH, widths };
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
      {direction === "left" ? (
        <path
          d="M14.5 5l-7 7 7 7"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M9.5 19l7-7-7-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

/** ---- sizing algorithm ---- */
type NaturalSize = { w: number; h: number };
type RenderSize = { w: number; h: number };

function computeRenderSize(
  natural: NaturalSize | null,
  opts: { maxW: number; maxH: number; minW?: number },
): RenderSize {
  if (
    !natural ||
    natural.w <= 0 ||
    natural.h <= 0 ||
    opts.maxW <= 0 ||
    opts.maxH <= 0
  ) {
    // fallback (prevents layout crash before load)
    const w = Math.max(240, Math.floor(opts.maxW || 320));
    const h = Math.max(240, Math.floor(opts.maxH || 320));
    return { w, h };
  }

  const { w: nw, h: nh } = natural;
  const scale = Math.min(1, opts.maxW / nw, opts.maxH / nh);

  let w = Math.floor(nw * scale);
  let h = Math.floor(nh * scale);

  // optional: avoid too-narrow portrait look (nice UX for wallpapers)
  if (opts.minW && w < opts.minW) {
    const scaleByMinW = opts.minW / nw;
    const hh = Math.floor(nh * scaleByMinW);
    if (hh <= opts.maxH) {
      w = Math.floor(nw * scaleByMinW);
      h = hh;
    }
  }

  return { w, h };
}

/** ---- measure viewport width ---- */
function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      setWidth(el.clientWidth || 0);
    });

    ro.observe(el);
    setWidth(el.clientWidth || 0);

    return () => ro.disconnect();
  }, []);

  return { ref, width } as const;
}

/** ---- double-tap like (touch) ---- */
function useDoubleTapLike(onDoubleTap: () => void) {
  const lastTapRef = useRef<number>(0);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const draggingRef = useRef(false);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType !== "touch") return;

      const now = Date.now();
      const prev = lastTapRef.current;
      const pos = { x: e.clientX, y: e.clientY };
      const prevPos = lastPosRef.current;

      lastTapRef.current = now;
      lastPosRef.current = pos;

      const dt = now - prev;
      const moved = prevPos
        ? Math.hypot(pos.x - prevPos.x, pos.y - prevPos.y)
        : 999;

      if (dt > 40 && dt < 260 && moved < 10 && !draggingRef.current) {
        onDoubleTap();
      }
    },
    [onDoubleTap],
  );

  return { onPointerDown, draggingRef } as const;
}

export default function PostImagesMedia({
  sources,
  direction,
  countryCode,
  liked = false,
  onToggleLike,
  isRTL,
}: {
  sources: ImageSource[];
  direction: Dir;
  countryCode?: string;
  liked?: boolean;
  isRTL: boolean;
  onToggleLike?: (next: boolean) => void;
}) {
  const isMulti = sources.length >= 2;

  /** collect natural sizes (prefer backend metadata if you have it) */
  const [naturalMap, setNaturalMap] = useState<Record<string, NaturalSize>>({});

  const getKey = useCallback((img: ImageSource, index: number) => {
    return String(img.id ?? img.lg ?? index);
  }, []);

  const onImgLoad = useCallback(
    (key: string) => (e: React.SyntheticEvent<HTMLImageElement>) => {
      const el = e.currentTarget;
      const w = el.naturalWidth || 0;
      const h = el.naturalHeight || 0;
      if (!w || !h) return;

      setNaturalMap((prev) => {
        const cur = prev[key];
        if (cur?.w === w && cur?.h === h) return prev;
        return { ...prev, [key]: { w, h } };
      });
    },
    [],
  );

  /** viewport width */
  const { ref: viewportRef, width: viewportW } =
    useElementWidth<HTMLDivElement>();

  /** sizing constants (tweak safely) */
  const MAX_SINGLE_W = 720; // max width for single image
  const MAX_ITEM_W = 640; // max width per carousel item
  const MAX_H = 600; // max height for all cases
  const MIN_ITEM_W = 260; // helps wallpapers not look too thin
  const GAP_PX = 8; // Tailwind gap-2

  const { singleSize, itemSizes, viewportH, trackW } = useMemo(() => {
    if (!viewportW) {
      return {
        singleSize: null as RenderSize | null,
        itemSizes: [] as RenderSize[],
        viewportH: 0,
        trackW: 0,
      };
    }

    if (!isMulti) {
      const key = getKey(sources[0], 0);
      const natural = naturalMap[key] ?? null;

      const maxW = Math.min(viewportW, MAX_SINGLE_W);
      const size = computeRenderSize(natural, { maxW, maxH: MAX_H });

      return {
        singleSize: size,
        itemSizes: [],
        viewportH: size.h,
        trackW: size.w,
      };
    }

    // ✅ multi: uniform height + width auto
    const maxItemW = Math.min(Math.floor(viewportW * 0.92), MAX_ITEM_W);

    const naturals = sources.map((img, i) => {
      const key = getKey(img, i);
      return naturalMap[key] ?? null;
    });

    const { targetH, widths } = computeUniformHeightAndWidths(naturals, {
      maxItemW,
      maxH: MAX_H,
      fallbackH: Math.min(360, MAX_H),
      minH: 240,
    });

    const sizes = widths.map((w) => ({ w, h: targetH }));

    const tw =
      sizes.reduce((sum, s) => sum + s.w, 0) +
      Math.max(0, sizes.length - 1) * GAP_PX;

    return {
      singleSize: null,
      itemSizes: sizes,
      viewportH: targetH, // ✅ ثابت لكل الصور
      trackW: tw,
    };
  }, [viewportW, isMulti, sources, naturalMap, getKey]);

  /** carousel motion */
  const x = useMotionValue(0);
  const overflow = Math.max(0, trackW - viewportW);

  const dragConstraints = useMemo(() => {
    if (direction === "rtl") return { left: 0, right: overflow };
    return { left: -overflow, right: 0 };
  }, [direction, overflow]);

  /** avoid state update every frame */
  const overflowRef = useRef(overflow);
  useEffect(() => {
    overflowRef.current = overflow;
  }, [overflow]);

  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const edgeRef = useRef({ atStart: true, atEnd: false });

  useMotionValueEvent(x, "change", (v) => {
    const ov = overflowRef.current;
    const progress = direction === "rtl" ? v : -v;
    const eps = 2;

    const nextStart = progress <= eps;
    const nextEnd = progress >= ov - eps;

    if (edgeRef.current.atStart !== nextStart) {
      edgeRef.current.atStart = nextStart;
      setAtStart(nextStart);
    }
    if (edgeRef.current.atEnd !== nextEnd) {
      edgeRef.current.atEnd = nextEnd;
      setAtEnd(nextEnd);
    }
  });

  /** clamp x when constraints change */
  useEffect(() => {
    const current = x.get();
    const clamped = clamp(current, dragConstraints.left, dragConstraints.right);
    if (current !== clamped) x.set(clamped);
  }, [dragConstraints.left, dragConstraints.right, x]);

  /** like interaction */
  const [heart, setHeart] = useState(false);
  const triggerLikeWarm = useCallback(() => {
    setHeart(true);
    window.setTimeout(() => setHeart(false), 520);
    onToggleLike?.(!liked);
  }, [liked, onToggleLike]);

  const { onPointerDown, draggingRef } = useDoubleTapLike(triggerLikeWarm);

  const scrollBy = useCallback(
    (ratio: number) => {
      if (!viewportW) return;

      const step = viewportW * ratio;
      const current = x.get();
      const target = direction === "rtl" ? current + step : current - step;

      const clamped = clamp(
        target,
        dragConstraints.left,
        dragConstraints.right,
      );
      animate(x, clamped, { type: "spring", stiffness: 250, damping: 30 });
    },
    [viewportW, direction, dragConstraints.left, dragConstraints.right, x],
  );

  const goNext = () => scrollBy(0.85);
  const goPrev = () => scrollBy(-0.85);

  return (
    <motion.div
      className={cn(
        "relative w-full rounded-2xl overflow-hidden bg-transparent select-none",
      )}
      dir={direction}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onPointerDown={onPointerDown}
      onDoubleClick={(e) => {
        if ((e as any).pointerType !== "touch") triggerLikeWarm();
      }}
      style={
        isMulti
          ? { height: viewportH ? `${viewportH}px` : undefined } // ✅ height driven by images
          : undefined
      }
    >
      <CountryBadge direction={direction} countryCode={countryCode} />
      <LikedIndicator direction={direction} show={!!liked} />
      <HeartPopup show={heart} />

      {!isMulti ? (
        <div className="w-full flex justify-center">
          {/* ✅ width = natural (capped), height = from aspect ratio */}
          <div
            className="flex items-center justify-center"
            style={{
              width: singleSize?.w ? `${singleSize.w}px` : "100%",
              height: singleSize?.h ? `${singleSize.h}px` : "auto",
              maxWidth: "100%",
            }}
          >
            <img
              src={sources[0].lg}
              alt={sources[0].alt || "post image"}
              loading="lazy"
              decoding="async"
              draggable={false}
              onLoad={onImgLoad(getKey(sources[0], 0))}
              className="w-full h-full object-contain rounded-2xl"
            />
          </div>
        </div>
      ) : (
        <div
          ref={viewportRef}
          className="relative w-full overflow-hidden"
          style={{
            touchAction: "pan-y",
            height: viewportH ? `${viewportH}px` : undefined,
          }}
        >
          <motion.div
            className="flex items-center gap-2 px-0"
            style={{ x, height: "100%" }}
            drag="x"
            dragConstraints={dragConstraints}
            dragElastic={0.05}
            dragMomentum
            onDragStart={() => {
              draggingRef.current = true;
            }}
            onDragEnd={() => {
              window.setTimeout(() => {
                draggingRef.current = false;
              }, 150);

              const current = x.get();
              if (current > dragConstraints.right)
                animate(x, dragConstraints.right);
              if (current < dragConstraints.left)
                animate(x, dragConstraints.left);
            }}
          >
            {sources.map((img, i) => {
              const key = getKey(img, i);
              const size = itemSizes[i];

              return (
                <div
                  key={key}
                  className="shrink-0 flex items-center justify-center relative"
                  style={{
                    width: size?.w ? `${size.w}px` : "90%",
                    height: viewportH ? `${viewportH}px` : "100%", // ✅ نفس الارتفاع للكل
                  }}
                >
                  <img
                    src={img.lg}
                    alt={img.alt || "post image"}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    onLoad={onImgLoad(key)}
                    className="h-full w-full object-contain rounded-2xl shadow-sm pointer-events-none"
                  />
                </div>
              );
            })}
          </motion.div>

          {/* arrows */}
          <div className="hidden sm:block pointer-events-none absolute inset-0">
            {!atStart && (
              <motion.button
                type="button"
                aria-label="Previous"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "pointer-events-auto absolute top-1/2 -translate-y-1/2 z-20 cursor-pointer",
                  "w-8 h-8 flex items-center justify-center rounded-full",
                  "bg-black/40 hover:bg-black/60 backdrop-blur-md text-white border border-white/10",
                  "transition-colors shadow-lg",
                  direction === "rtl" ? "right-2" : "left-2",
                )}
              >
                <Chevron direction={direction === "rtl" ? "right" : "left"} />
              </motion.button>
            )}

            {!atEnd && (
              <motion.button
                type="button"
                aria-label="Next"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "pointer-events-auto absolute top-1/2 -translate-y-1/2 z-20 cursor-pointer",
                  "w-8 h-8 flex items-center justify-center rounded-full",
                  "bg-black/40 hover:bg-black/60 backdrop-blur-md text-white border border-white/10",
                  "transition-colors shadow-lg",
                  direction === "rtl" ? "left-2" : "right-2",
                )}
              >
                <Chevron direction={direction === "rtl" ? "left" : "right"} />
              </motion.button>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
