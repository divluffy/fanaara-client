// app/(logged)/ai-service/page.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";

type Dir = "rtl" | "ltr";
type Theme = "dark" | "light";

type PackageTier = "starter" | "creator" | "studio";
type Quality = "standard" | "high" | "ultra";

type StylePreset = {
  id: string;
  name: { rtl: string; ltr: string };
  hint: { rtl: string; ltr: string };
  tags: string[];
  thumb: string; // data URI
  canvasFilter: string; // applied on canvas ctx.filter
  glowFrom: string;
  glowTo: string;
};

type HistoryItem = {
  id: string;
  createdAt: number;
  styleId: string;
  styleName: { rtl: string; ltr: string };
  pkg: PackageTier;
  quality: Quality;
  inputThumbUrl?: string; // small thumbnail for compare in history
  outputThumbUrl: string; // small thumbnail for listing
  outputUrl?: string; // may be missing if storage is full; still show thumb
  liked: boolean;
  rating: number | null;
};

type ToastTone = "ok" | "warn" | "err";

function cn(...x: Array<string | false | null | undefined>) {
  return x.filter(Boolean).join(" ");
}

function svgDataUri(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function makeStyleThumb(bg1: string, bg2: string, accent: string) {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="360" height="240" viewBox="0 0 360 240">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${bg1}"/>
        <stop offset="1" stop-color="${bg2}"/>
      </linearGradient>

      <filter id="noise" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch"/>
        <feColorMatrix type="matrix"
          values="0 0 0 0 0
                  0 0 0 0 0
                  0 0 0 0 0
                  0 0 0 0.22 0"/>
      </filter>

      <linearGradient id="shine" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffffff" stop-opacity="0.30"/>
        <stop offset="0.50" stop-color="#ffffff" stop-opacity="0.06"/>
        <stop offset="1" stop-color="#ffffff" stop-opacity="0.00"/>
      </linearGradient>
    </defs>

    <rect width="360" height="240" rx="26" fill="url(#g)"/>
    <circle cx="280" cy="72" r="86" fill="${accent}" opacity="0.26"/>
    <path d="M-10 190 C 60 132, 138 232, 224 170 C 275 132, 316 152, 372 114 L 372 260 L -10 260 Z"
      fill="${accent}" opacity="0.18"/>

    <!-- manga speed line -->
    <path d="M-20 54 C 44 18, 110 70, 170 38 C 236 4, 290 42, 380 18"
      fill="none" stroke="#ffffff" stroke-opacity="0.18" stroke-width="10" stroke-linecap="round"/>

    <rect width="360" height="240" rx="26" fill="url(#shine)"/>
    <rect width="360" height="240" rx="26" filter="url(#noise)" opacity="0.22"/>
  </svg>`;
  return svgDataUri(svg.trim());
}

/** Watch document dir + theme (dark class) */
function useDocumentUi(): { dir: Dir; theme: Theme } {
  const [ui, setUi] = useState<{ dir: Dir; theme: Theme }>({
    dir: "ltr",
    theme: "light",
  });

  useEffect(() => {
    const el = document.documentElement;

    const read = () => {
      const dir = el.dir === "rtl" ? "rtl" : "ltr";
      const theme = el.classList.contains("dark") ? "dark" : "light";
      return { dir, theme };
    };

    setUi(read());

    const obs = new MutationObserver(() => setUi(read()));
    obs.observe(el, { attributes: true, attributeFilter: ["dir", "class"] });

    return () => obs.disconnect();
  }, []);

  return ui;
}

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function useLocalStorageState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    const parsed = safeJsonParse<T>(window.localStorage.getItem(key));
    return parsed ?? initial;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // ignore quota errors
    }
  }, [key, state]);

  return [state, setState] as const;
}

/** image helpers */
function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.crossOrigin = "anonymous";
    img.src = src;
  });
}

async function getImageMeta(src: string) {
  const img = await loadImage(src);
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  return { w, h };
}

/**
 * Demo transform: canvas draw + ctx.filter (replace with API later)
 * - Purpose: production-like UI flow (loading -> result)
 */
async function transformImageDemo(args: {
  inputUrl: string;
  style: StylePreset;
  quality: Quality;
  pkg: PackageTier;
}): Promise<{ outputUrl: string; w: number; h: number }> {
  const { inputUrl, style, quality, pkg } = args;

  const img = await loadImage(inputUrl);
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;

  // keep it simple: max edge depends on quality + pkg
  const baseMax =
    quality === "standard" ? 1024 : quality === "high" ? 1280 : 1536;
  const pkgCap = pkg === "starter" ? 1024 : pkg === "creator" ? 1280 : 1536;
  const outMaxEdge = Math.min(baseMax, pkgCap);

  const scale = outMaxEdge / Math.max(iw, ih);
  const s = Math.min(1, scale);
  const w = Math.max(1, Math.round(iw * s));
  const h = Math.max(1, Math.round(ih * s));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d", { willReadFrequently: false });
  if (!ctx) throw new Error("Canvas not available");

  // quality tweak
  const qFilter =
    quality === "standard"
      ? "contrast(1.06) saturate(1.06)"
      : quality === "high"
        ? "contrast(1.10) saturate(1.12)"
        : "contrast(1.14) saturate(1.18)";

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.filter = `${style.canvasFilter} ${qFilter}`;
  ctx.drawImage(img, 0, 0, w, h);

  // subtle vignette (anime-ish)
  ctx.filter = "none";
  ctx.globalCompositeOperation = "multiply";
  const g = ctx.createRadialGradient(
    w * 0.5,
    h * 0.45,
    Math.min(w, h) * 0.35,
    w * 0.5,
    h * 0.5,
    Math.max(w, h) * 0.8,
  );
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(1, "rgba(0,0,0,0.84)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = "source-over";

  // halftone overlay (very light)
  const p = document.createElement("canvas");
  p.width = 12;
  p.height = 12;
  const pctx = p.getContext("2d");
  if (pctx) {
    pctx.clearRect(0, 0, 12, 12);
    pctx.fillStyle = "rgba(255,255,255,0.12)";
    pctx.beginPath();
    pctx.arc(3, 3, 1.2, 0, Math.PI * 2);
    pctx.fill();
    pctx.beginPath();
    pctx.arc(9, 9, 1.2, 0, Math.PI * 2);
    pctx.fill();
  }
  ctx.globalAlpha = pkg === "studio" ? 0.16 : pkg === "creator" ? 0.12 : 0.09;
  ctx.globalCompositeOperation = "overlay";
  ctx.fillStyle = ctx.createPattern(p, "repeat")!;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;

  const out = canvas.toDataURL("image/png");
  return { outputUrl: out, w, h };
}

async function makeThumbFromUrl(args: { src: string; maxEdge: number }) {
  const { src, maxEdge } = args;
  const img = await loadImage(src);
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const scale = maxEdge / Math.max(iw, ih);
  const s = Math.min(1, scale);
  const w = Math.max(1, Math.round(iw * s));
  const h = Math.max(1, Math.round(ih * s));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not available");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/png");
}

function uid() {
  // small client-safe id
  const rnd =
    typeof crypto !== "undefined" && "getRandomValues" in crypto
      ? Array.from(crypto.getRandomValues(new Uint8Array(6)))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("")
      : Math.random().toString(16).slice(2);
  return `ai_${Date.now().toString(16)}_${rnd}`;
}

function fmtRelative(ts: number, dir: Dir) {
  const diff = Date.now() - ts;
  const s = Math.floor(diff / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);

  if (d >= 2) return dir === "rtl" ? `قبل ${d} أيام` : `${d}d ago`;
  if (d === 1) return dir === "rtl" ? "أمس" : "Yesterday";
  if (h >= 1) return dir === "rtl" ? `قبل ${h} ساعة` : `${h}h ago`;
  if (m >= 1) return dir === "rtl" ? `قبل ${m} دقيقة` : `${m}m ago`;
  return dir === "rtl" ? "الآن" : "Just now";
}

const STYLES: StylePreset[] = [
  {
    id: "shonen-ink",
    name: { rtl: "شونن حاد", ltr: "Shonen Ink" },
    hint: { rtl: "خطوط قوية + تباين", ltr: "Bold lines + contrast" },
    tags: ["lines", "action", "bold"],
    canvasFilter: "contrast(1.15) saturate(1.18)",
    glowFrom: "#7C3AED",
    glowTo: "#06B6D4",
    thumb: makeStyleThumb("#0ea5e9", "#0b1220", "#7c3aed"),
  },
  {
    id: "soft-kawaii",
    name: { rtl: "كاواي ناعم", ltr: "Soft Kawaii" },
    hint: { rtl: "ألوان هادئة + نعومة", ltr: "Pastel & soft" },
    tags: ["pastel", "soft", "cute"],
    canvasFilter: "contrast(0.98) saturate(1.10) brightness(1.04)",
    glowFrom: "#FB7185",
    glowTo: "#06B6D4",
    thumb: makeStyleThumb("#ec4899", "#7c3aed", "#22d3ee"),
  },
  {
    id: "neon-cyber",
    name: { rtl: "نيون سايبر", ltr: "Neon Cyber" },
    hint: { rtl: "نيون + سطوع", ltr: "Neon pop" },
    tags: ["neon", "cyber", "glow"],
    canvasFilter: "contrast(1.20) saturate(1.35) hue-rotate(8deg)",
    glowFrom: "#06B6D4",
    glowTo: "#7C3AED",
    thumb: makeStyleThumb("#22d3ee", "#0b1220", "#fb7185"),
  },
  {
    id: "vintage-cel",
    name: { rtl: "سيل قديم", ltr: "Vintage Cel" },
    hint: { rtl: "دافئ + 90s", ltr: "Warm 90s vibe" },
    tags: ["retro", "warm", "cel"],
    canvasFilter: "contrast(1.08) saturate(1.06) sepia(0.12)",
    glowFrom: "#F59E0B",
    glowTo: "#7C3AED",
    thumb: makeStyleThumb("#f97316", "#0ea5e9", "#fbbf24"),
  },
  {
    id: "dark-fantasy",
    name: { rtl: "فانتازيا داكنة", ltr: "Dark Fantasy" },
    hint: { rtl: "ظلال + دراما", ltr: "Moody shadows" },
    tags: ["dark", "dramatic", "shadows"],
    canvasFilter: "contrast(1.25) saturate(1.05) brightness(0.92)",
    glowFrom: "#EF4444",
    glowTo: "#7C3AED",
    thumb: makeStyleThumb("#111827", "#15637b", "#ef4444"),
  },
  {
    id: "manga-mono",
    name: { rtl: "مانجا أبيض/أسود", ltr: "Manga Mono" },
    hint: { rtl: "رمادي + حِدة", ltr: "Grayscale & sharp" },
    tags: ["mono", "manga", "ink"],
    canvasFilter: "grayscale(1) contrast(1.35) brightness(1.02)",
    glowFrom: "#94A3B8",
    glowTo: "#06B6D4",
    thumb: makeStyleThumb("#111827", "#f8fafc", "#94a3b8"),
  },
];

const PACKAGE_OPTS: Array<{
  id: PackageTier;
  label: { rtl: string; ltr: string };
  hint: { rtl: string; ltr: string };
  badge?: { rtl: string; ltr: string };
}> = [
  {
    id: "starter",
    label: { rtl: "Starter", ltr: "Starter" },
    hint: { rtl: "تحويلات سريعة", ltr: "Fast transforms" },
  },
  {
    id: "creator",
    label: { rtl: "Creator", ltr: "Creator" },
    hint: { rtl: "أفضل توازن", ltr: "Best balance" },
    badge: { rtl: "موصى به", ltr: "Recommended" },
  },
  {
    id: "studio",
    label: { rtl: "Studio", ltr: "Studio" },
    hint: { rtl: "أعلى تفاصيل", ltr: "Max detail" },
  },
];

const QUALITY_OPTS: Array<{
  id: Quality;
  label: { rtl: string; ltr: string };
  hint: { rtl: string; ltr: string };
}> = [
  {
    id: "standard",
    label: { rtl: "Standard", ltr: "Standard" },
    hint: { rtl: "سريع ومناسب", ltr: "Fast & solid" },
  },
  {
    id: "high",
    label: { rtl: "High", ltr: "High" },
    hint: { rtl: "تفاصيل أكثر", ltr: "More detail" },
  },
  {
    id: "ultra",
    label: { rtl: "Ultra", ltr: "Ultra" },
    hint: { rtl: "أعلى جودة", ltr: "Sharpest" },
  },
];

function Icon({
  name,
  className,
}: {
  name:
    | "upload"
    | "spark"
    | "history"
    | "close"
    | "chev"
    | "heart"
    | "star"
    | "share"
    | "bookmark"
    | "send"
    | "check"
    | "warning";
  className?: string;
}) {
  const cls = cn("inline-block", className);
  switch (name) {
    case "upload":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 16V7"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M8.5 10.5L12 7l3.5 3.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7 16.8c-1.8 0-3-1.4-3-3.1C4 11.9 5.2 10.6 7 10.6c.3-2.6 2.4-4.6 5-4.6 2.5 0 4.6 1.6 5 4 1.7.1 3 1.4 3 3.2 0 1.7-1.3 3.6-3.3 3.6"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>
      );
    case "spark":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 2l1.2 5.2L18 9l-4.8 1.8L12 16l-1.2-5.2L6 9l4.8-1.8L12 2Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path
            d="M19 13l.7 3 2.3.9-2.3.9-.7 3-.7-3-2.3-.9 2.3-.9.7-3Z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
            opacity="0.9"
          />
        </svg>
      );
    case "history":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M6 7v4h4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6.3 17.7A8 8 0 1 0 6 12"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M12 8v4l3 2"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "close":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M7 7l10 10M17 7L7 17"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "chev":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M9 6l6 6-6 6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "heart":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 20s-7-4.5-9.2-9C1.1 7.6 3.1 5 6 5c1.7 0 3.2.9 4 2.1C10.8 5.9 12.3 5 14 5c2.9 0 4.9 2.6 3.2 6C19 15.5 12 20 12 20Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "star":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 2l3 7h7l-5.6 4 2.1 7L12 16.7 5.5 20l2.1-7L2 9h7l3-7Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "share":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M16 8a3 3 0 1 0-2.8-4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M6 14a3 3 0 1 0 2.8 4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M8.6 14.8l6.8-3.6M8.6 9.2l6.8 3.6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
    case "bookmark":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M7 4h10a1 1 0 0 1 1 1v17l-6-3-6 3V5a1 1 0 0 1 1-1Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "send":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M22 2L11 13"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <path
            d="M22 2l-7 20-4-9-9-4 20-7Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "check":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M20 6L9 17l-5-5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "warning":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 3l10 18H2L12 3Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M12 9v5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M12 17h.01"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      );
    default:
      return null;
  }
}

function Button({
  children,
  onClick,
  disabled,
  variant = "primary",
  size = "md",
  className,
  leftIcon,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "soft" | "ghost" | "danger";
  size?: "sm" | "md";
  className?: string;
  leftIcon?: React.ReactNode;
}) {
  const base = cn(
    "inline-flex items-center justify-center gap-2",
    "rounded-2xl font-semibold",
    "transition active:scale-[0.99]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ai-ring)]",
    "focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--ai-bg)]",
    disabled && "opacity-50 cursor-not-allowed active:scale-100",
    size === "sm" ? "h-9 px-3 text-xs" : "h-11 px-4 text-sm",
  );

  const skin =
    variant === "primary"
      ? cn(
          "text-white",
          "bg-[linear-gradient(135deg,var(--ai-a1),var(--ai-a2))]",
          "shadow-[0_18px_60px_-35px_rgba(124,58,237,0.85)]",
          "hover:brightness-110",
        )
      : variant === "danger"
        ? cn(
            "text-white",
            "bg-[linear-gradient(135deg,#ef4444,#fb7185)]",
            "shadow-[0_18px_60px_-35px_rgba(239,68,68,0.75)]",
            "hover:brightness-110",
          )
        : variant === "ghost"
          ? cn(
              "bg-transparent",
              "text-[color:var(--ai-fg)]",
              "border border-[color:var(--ai-border)]",
              "hover:bg-[color:var(--ai-panel2)]",
            )
          : cn(
              "bg-[color:var(--ai-panel2)]",
              "text-[color:var(--ai-fg)]",
              "border border-[color:var(--ai-border)]",
              "hover:bg-[color:var(--ai-panel)]",
            );

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={cn(base, skin, className)}>
      {leftIcon}
      <span className="min-w-0 truncate">{children}</span>
    </button>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
  className,
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "grid size-10 place-items-center rounded-2xl",
        "border border-[color:var(--ai-border)] bg-[color:var(--ai-panel2)]",
        "text-[color:var(--ai-fg)]",
        "transition active:scale-[0.98]",
        "hover:bg-[color:var(--ai-panel)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ai-ring)]",
        "focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--ai-bg)]",
        disabled && "opacity-50 cursor-not-allowed active:scale-100",
        className,
      )}
    >
      {children}
    </button>
  );
}

function Panel({
  step,
  title,
  subtitle,
  right,
  children,
  dir,
}: {
  step: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  dir: Dir;
}) {
  const row = dir === "rtl" ? "flex-row-reverse text-right" : "flex-row text-left";

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-[color:var(--ai-border)] bg-[color:var(--ai-panel)] shadow-[0_18px_70px_-55px_rgba(0,0,0,0.75)]">
      {/* subtle textures */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "radial-gradient(var(--ai-dot) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.08] mix-blend-overlay"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, rgba(255,255,255,0.22) 1px, transparent 1px)",
            backgroundSize: "100% 10px",
          }}
        />
        <div className="absolute -top-24 end-[-10%] size-[280px] rounded-full bg-[color:var(--ai-a1)] opacity-[0.14] blur-3xl" />
        <div className="absolute -bottom-28 start-[-10%] size-[300px] rounded-full bg-[color:var(--ai-a2)] opacity-[0.12] blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.22),transparent)]" />
      </div>

      <div className="relative p-4 sm:p-5">
        <div className={cn("mb-4 flex items-start justify-between gap-3", row)}>
          <div className="min-w-0">
            <div className={cn("flex items-center gap-2", dir === "rtl" ? "flex-row-reverse" : "flex-row")}>
              <span className="inline-flex items-center gap-2 rounded-2xl border border-[color:var(--ai-border)] bg-[color:var(--ai-panel2)] px-2.5 py-1 text-[11px] font-black tracking-wide text-[color:var(--ai-fg)]">
                <span className="opacity-70">STEP</span>
                <span className="tabular-nums">{step}</span>
              </span>
              <div className="h-px w-10 bg-[linear-gradient(to_right,var(--ai-a1),var(--ai-a2))] opacity-70" />
            </div>

            <div className="mt-2 text-base font-semibold text-[color:var(--ai-fg)]">{title}</div>
            {subtitle ? <div className="mt-1 text-xs text-[color:var(--ai-muted)]">{subtitle}</div> : null}
          </div>

          {right ? <div className="shrink-0">{right}</div> : null}
        </div>

        {children}
      </div>
    </div>
  );
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
  dir,
  layoutId,
  disabledIds,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{
    id: T;
    label: string;
    hint?: string;
    badge?: string;
  }>;
  dir: Dir;
  layoutId: string;
  disabledIds?: T[];
}) {
  const row = dir === "rtl" ? "text-right" : "text-left";
  const isDisabled = (id: T) => disabledIds?.includes(id) ?? false;

  return (
    <LayoutGroup>
      <div className="grid gap-2 rounded-3xl border border-[color:var(--ai-border)] bg-[color:var(--ai-panel2)] p-2 sm:grid-cols-3">
        {options.map((o) => {
          const active = o.id === value;
          const disabled = isDisabled(o.id);
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => !disabled && onChange(o.id)}
              disabled={disabled}
              className={cn(
                "relative overflow-hidden rounded-2xl px-3 py-2.5",
                "transition active:scale-[0.99]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ai-ring)]",
                disabled && "opacity-45 cursor-not-allowed active:scale-100",
                row,
              )}
            >
              {active ? (
                <motion.div
                  layoutId={layoutId}
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(124,58,237,0.35), rgba(6,182,212,0.25))",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                  transition={{ type: "spring", stiffness: 520, damping: 36 }}
                />
              ) : (
                <div className="absolute inset-0 rounded-2xl border border-transparent hover:border-[color:var(--ai-border)] hover:bg-[rgba(255,255,255,0.02)]" />
              )}

              <div className="relative z-10 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-black text-[color:var(--ai-fg)]">{o.label}</div>
                  {o.hint ? (
                    <div className="mt-0.5 text-[11px] text-[color:var(--ai-muted)]">{o.hint}</div>
                  ) : null}
                </div>

                {o.badge ? (
                  <span className="shrink-0 rounded-full border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.06)] px-2 py-0.5 text-[10px] font-black text-[color:var(--ai-fg)]">
                    {o.badge}
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

function Modal({
  open,
  onOpenChange,
  title,
  subtitle,
  children,
  footer,
  dir,
  maxWidth = "max-w-lg",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  dir: Dir;
  maxWidth?: string;
}) {
  const reduceMotion = useReducedMotion();
  const row = dir === "rtl" ? "flex-row-reverse text-right" : "flex-row text-left";

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  // body scroll lock
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-[1000]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          {/* overlay */}
          <button
            type="button"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
            className="absolute inset-0 bg-black/55"
          />

          {/* panel */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <motion.div
              role="dialog"
              aria-modal="true"
              dir={dir}
              initial={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 18, scale: 0.985 }
              }
              animate={
                reduceMotion
                  ? { opacity: 1 }
                  : { opacity: 1, y: 0, scale: 1 }
              }
              exit={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 10, scale: 0.985 }
              }
              transition={{ type: "spring", stiffness: 520, damping: 38 }}
              className={cn(
                "relative w-full",
                maxWidth,
                "overflow-hidden rounded-[28px] border border-[color:var(--ai-border)] bg-[color:var(--ai-panel)]",
                "shadow-[0_40px_120px_-70px_rgba(0,0,0,0.9)]",
              )}
            >
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-24 end-[-10%] size-[260px] rounded-full bg-[color:var(--ai-a1)] opacity-[0.16] blur-3xl" />
                <div className="absolute -bottom-24 start-[-10%] size-[260px] rounded-full bg-[color:var(--ai-a2)] opacity-[0.14] blur-3xl" />
                <div
                  className="absolute inset-0 opacity-[0.12]"
                  style={{
                    backgroundImage:
                      "radial-gradient(var(--ai-dot) 1px, transparent 1px)",
                    backgroundSize: "18px 18px",
                  }}
                />
              </div>

              <div className="relative border-b border-[color:var(--ai-border)] p-4">
                <div className={cn("flex items-start justify-between gap-3", row)}>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[color:var(--ai-fg)]">{title}</div>
                    {subtitle ? (
                      <div className="mt-1 text-xs text-[color:var(--ai-muted)]">{subtitle}</div>
                    ) : null}
                  </div>

                  <IconButton label="Close" onClick={() => onOpenChange(false)} className="size-10">
                    <Icon name="close" className="size-5" />
                  </IconButton>
                </div>
              </div>

              <div className="relative max-h-[70vh] overflow-y-auto p-4">{children}</div>

              {footer ? (
                <div className="relative border-t border-[color:var(--ai-border)] p-4">{footer}</div>
              ) : null}
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function Drawer({
  open,
  onOpenChange,
  title,
  children,
  dir,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  children: React.ReactNode;
  dir: Dir;
}) {
  const reduceMotion = useReducedMotion();
  const isRTL = dir === "rtl";

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-[1100]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button
            type="button"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
            className="absolute inset-0 bg-black/55"
          />
          <motion.aside
            dir={dir}
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { x: isRTL ? -28 : 28, opacity: 0 }
            }
            animate={
              reduceMotion
                ? { opacity: 1 }
                : { x: 0, opacity: 1 }
            }
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { x: isRTL ? -18 : 18, opacity: 0 }
            }
            transition={{ type: "spring", stiffness: 520, damping: 38 }}
            className={cn(
              "absolute top-0 h-full w-[92vw] max-w-md",
              isRTL ? "left-0" : "right-0",
              "border-l border-[color:var(--ai-border)] bg-[color:var(--ai-bg)]",
            )}
          >
            <div className="relative h-full">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-24 end-[-10%] size-[340px] rounded-full bg-[color:var(--ai-a1)] opacity-[0.14] blur-3xl" />
                <div className="absolute -bottom-28 start-[-10%] size-[360px] rounded-full bg-[color:var(--ai-a2)] opacity-[0.12] blur-3xl" />
              </div>

              <div className="relative flex h-full flex-col">
                <div className="border-b border-[color:var(--ai-border)] p-4">
                  <div className={cn("flex items-center justify-between gap-3", isRTL ? "flex-row-reverse text-right" : "flex-row text-left")}>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[color:var(--ai-fg)]">{title}</div>
                      <div className="mt-1 text-xs text-[color:var(--ai-muted)]">
                        {isRTL ? "آخر التحويلات (محليًا)" : "Recent transforms (local)"}
                      </div>
                    </div>

                    <IconButton label="Close" onClick={() => onOpenChange(false)}>
                      <Icon name="close" className="size-5" />
                    </IconButton>
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
              </div>
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default function Page() {
  const { dir, theme } = useDocumentUi();
  const isRTL = dir === "rtl";
  const reduceMotion = useReducedMotion();

  const COPY = useMemo(() => {
    if (isRTL) {
      return {
        title: "AI خدمة تحويل الصورة",
        subtitle: "ارفع صورة، اختر Style مرئي، حدّد الباقة والجودة… ثم احصل على نتيجة جاهزة للنشر.",
        steps: {
          s1: "رفع الصورة",
          s2: "اختيار الـ Style",
          s3: "الباقة + الجودة",
          s4: "النتيجة",
        },
        uploadTitle: "الصورة الأصلية",
        uploadSub: "اسحب الصورة هنا أو اختر ملفًا من جهازك.",
        replace: "تبديل",
        remove: "إزالة",
        pick: "اختيار صورة",
        stylesTitle: "Style Gallery",
        stylesSub: "اختر صورة Style لتحويل صورتك لنفس الإحساس.",
        settingsTitle: "الإعدادات",
        settingsSub: "اختيارات بسيطة مباشرة تحت الرفع.",
        pkg: "الباقة",
        quality: "الجودة",
        transform: "تحويل الآن",
        transforming: "جارِ التحويل…",
        needImage: "ارفع صورة أولًا",
        needStyle: "اختر Style أولًا",
        resultTitle: "النتيجة",
        resultSub: "النتيجة تظهر هنا بعد التحويل.",
        holdCompare: "اضغط مطوّلًا للمقارنة",
        original: "الأصلية",
        output: "النتيجة",
        history: "السجل",
        emptyHistoryTitle: "لا يوجد سجل بعد",
        emptyHistorySub: "أول تحويل سيظهر هنا تلقائيًا.",
        clearHistory: "مسح السجل",
        open: "فتح",
        deleted: "تم الحذف",
        cleared: "تم مسح السجل",
        actions: {
          publish: "نشر",
          save: "حفظ",
          share: "مشاركة",
          rate: "تقييم",
          like: "أعجبني",
        },
        publishTitle: "نشر النتيجة",
        publishSub: "اكتب وصفًا صغيرًا ثم انشر.",
        captionPh: "اكتب وصفًا…",
        visibility: "الخصوصية",
        visPublic: "عام",
        visFollowers: "المتابعين",
        visPrivate: "خاص",
        publishNow: "نشر الآن",
        savedTitle: "حفظ",
        savedSub: "اختر تجميعة للحفظ.",
        shareTitle: "مشاركة",
        shareSub: "انسخ الرابط أو شارك سريعًا.",
        copy: "نسخ الرابط",
        copied: "تم النسخ",
        rateTitle: "قيّم النتيجة",
        rateSub: "يساعدنا نفهم جودة الـ style.",
        submit: "حفظ التقييم",
        cancel: "إلغاء",
        errorGeneric: "حصل خطأ. جرّب مرة ثانية.",
        fileNotImage: "الملف ليس صورة.",
      } as const;
    }

    return {
      title: "AI Image Service",
      subtitle: "Upload an image, pick a visual style, choose package & quality — then publish / save / share.",
      steps: {
        s1: "Upload",
        s2: "Pick style",
        s3: "Package & quality",
        s4: "Result",
      },
      uploadTitle: "Source image",
      uploadSub: "Drop an image here or choose a file.",
      replace: "Replace",
      remove: "Remove",
      pick: "Choose image",
      stylesTitle: "Style Gallery",
      stylesSub: "Pick a style reference image for your transform.",
      settingsTitle: "Settings",
      settingsSub: "Simple choices right under upload.",
      pkg: "Package",
      quality: "Quality",
      transform: "Transform now",
      transforming: "Transforming…",
      needImage: "Upload an image first",
      needStyle: "Pick a style first",
      resultTitle: "Result",
      resultSub: "Your output appears here.",
      holdCompare: "Hold to compare",
      original: "Original",
      output: "Output",
      history: "History",
      emptyHistoryTitle: "No history yet",
      emptyHistorySub: "Your first transform will show up here.",
      clearHistory: "Clear history",
      open: "Open",
      deleted: "Deleted",
      cleared: "History cleared",
      actions: {
        publish: "Publish",
        save: "Save",
        share: "Share",
        rate: "Rate",
        like: "Like",
      },
      publishTitle: "Publish result",
      publishSub: "Add a short caption then publish.",
      captionPh: "Write a caption…",
      visibility: "Visibility",
      visPublic: "Public",
      visFollowers: "Followers",
      visPrivate: "Private",
      publishNow: "Publish now",
      savedTitle: "Save",
      savedSub: "Pick a collection to save into.",
      shareTitle: "Share",
      shareSub: "Copy link or share fast.",
      copy: "Copy link",
      copied: "Copied",
      rateTitle: "Rate result",
      rateSub: "Helps us improve style quality.",
      submit: "Save rating",
      cancel: "Cancel",
      errorGeneric: "Something went wrong. Try again.",
      fileNotImage: "This file is not an image.",
    } as const;
  }, [isRTL]);

  const rootVars = useMemo(() => {
    // Keep it self-contained: CSS vars adapt to theme
    const dark = theme === "dark";
    return {
      ["--ai-bg" as any]: dark ? "#05060B" : "#F7F8FF",
      ["--ai-panel" as any]: dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.92)",
      ["--ai-panel2" as any]: dark ? "rgba(255,255,255,0.03)" : "rgba(10,16,28,0.04)",
      ["--ai-border" as any]: dark ? "rgba(255,255,255,0.10)" : "rgba(10,16,28,0.14)",
      ["--ai-fg" as any]: dark ? "#EAF0FF" : "#0B1220",
      ["--ai-muted" as any]: dark ? "rgba(234,240,255,0.70)" : "rgba(11,18,32,0.64)",
      ["--ai-dot" as any]: dark ? "rgba(255,255,255,0.85)" : "rgba(11,18,32,0.75)",
      ["--ai-a1" as any]: "#7C3AED",
      ["--ai-a2" as any]: "#06B6D4",
      ["--ai-ring" as any]: dark ? "rgba(124,58,237,0.55)" : "rgba(124,58,237,0.35)",
    } as React.CSSProperties;
  }, [theme]);

  const fileRef = useRef<HTMLInputElement | null>(null);
  const inputObjectUrlRef = useRef<string | null>(null);

  const [inputUrl, setInputUrl] = useState<string | null>(null);
  const [inputMeta, setInputMeta] = useState<{ w: number; h: number; name?: string } | null>(null);

  const [styleId, setStyleId] = useState<string | null>(null);
  const selectedStyle = useMemo(() => STYLES.find((s) => s.id === styleId) ?? null, [styleId]);

  const [pkg, setPkg] = useState<PackageTier>("creator");
  const [quality, setQuality] = useState<Quality>("standard");

  const [isDragging, setIsDragging] = useState(false);
  const [phase, setPhase] = useState<"idle" | "generating" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [result, setResult] = useState<HistoryItem | null>(null);
  const [resultMeta, setResultMeta] = useState<{ w: number; h: number } | null>(null);

  const [holdCompare, setHoldCompare] = useState(false);

  const [history, setHistory] = useLocalStorageState<HistoryItem[]>("fanaara:ai-service:history:v1", []);
  const [historyOpen, setHistoryOpen] = useState(false);

  // action modals
  const [publishOpen, setPublishOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [rateOpen, setRateOpen] = useState(false);

  // publish modal state (demo)
  const [caption, setCaption] = useState("");
  const [visibility, setVisibility] = useState<"public" | "followers" | "private">("public");

  // save modal state (demo)
  const [collectionId, setCollectionId] = useState<string>("saved");
  const collections = useMemo(
    () => [
      { id: "saved", name: isRTL ? "المحفوظات" : "Saved" },
      { id: "moments", name: isRTL ? "لحظات أسطورية" : "Best Moments" },
      { id: "refs", name: isRTL ? "مراجع" : "References" },
      { id: "inspo", name: isRTL ? "إلهام" : "Inspo" },
    ],
    [isRTL],
  );

  // share modal state (demo)
  const [copied, setCopied] = useState(false);
  const shareUrl = useMemo(() => `https://fanaara.com/ai/${result?.id ?? "preview"}`, [result?.id]);

  // toast
  const [toast, setToast] = useState<{ tone: ToastTone; msg: string } | null>(null);
  const toastT = useRef<number | null>(null);
  const pop = (tone: ToastTone, msg: string) => {
    if (toastT.current) window.clearTimeout(toastT.current);
    setToast({ tone, msg });
    toastT.current = window.setTimeout(() => setToast(null), 1400);
  };

  useEffect(() => {
    return () => {
      if (toastT.current) window.clearTimeout(toastT.current);
      if (inputObjectUrlRef.current) URL.revokeObjectURL(inputObjectUrlRef.current);
    };
  }, []);

  const steps = useMemo(() => {
    const s1 = Boolean(inputUrl);
    const s2 = Boolean(selectedStyle);
    const s3 = Boolean(pkg && quality);
    const s4 = Boolean(result?.outputUrl || result?.outputThumbUrl);

    return [
      { id: 1, label: COPY.steps.s1, done: s1 },
      { id: 2, label: COPY.steps.s2, done: s2 },
      { id: 3, label: COPY.steps.s3, done: s3 },
      { id: 4, label: COPY.steps.s4, done: s4 },
    ];
  }, [COPY.steps.s1, COPY.steps.s2, COPY.steps.s3, COPY.steps.s4, inputUrl, selectedStyle, pkg, quality, result?.outputUrl, result?.outputThumbUrl]);

  const canTransform = Boolean(inputUrl && selectedStyle && phase !== "generating");

  const disabledQualities = useMemo<Quality[]>(() => {
    // meaningful disabled state: starter cannot use Ultra
    if (pkg === "starter") return ["ultra"];
    return [];
  }, [pkg]);

  // Ensure current quality valid if package changed
  useEffect(() => {
    if (disabledQualities.includes(quality)) setQuality("high");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pkg]);

  async function handleFiles(files: FileList | null) {
    const f = files?.[0];
    if (!f) return;

    if (!f.type.startsWith("image/")) {
      setErrorMsg(COPY.fileNotImage);
      pop("err", COPY.fileNotImage);
      return;
    }

    setErrorMsg(null);
    setPhase("idle");
    setResult(null);
    setResultMeta(null);

    // cleanup previous object url
    if (inputObjectUrlRef.current) URL.revokeObjectURL(inputObjectUrlRef.current);

    const url = URL.createObjectURL(f);
    inputObjectUrlRef.current = url;
    setInputUrl(url);

    try {
      const meta = await getImageMeta(url);
      setInputMeta({ ...meta, name: f.name });
    } catch {
      setInputMeta(null);
    }
  }

  function clearInput() {
    setPhase("idle");
    setErrorMsg(null);
    setResult(null);
    setResultMeta(null);
    setHoldCompare(false);

    if (inputObjectUrlRef.current) URL.revokeObjectURL(inputObjectUrlRef.current);
    inputObjectUrlRef.current = null;
    setInputUrl(null);
    setInputMeta(null);

    if (fileRef.current) fileRef.current.value = "";
  }

  async function onTransform() {
    if (!inputUrl) {
      setErrorMsg(COPY.needImage);
      pop("warn", COPY.needImage);
      return;
    }
    if (!selectedStyle) {
      setErrorMsg(COPY.needStyle);
      pop("warn", COPY.needStyle);
      return;
    }

    setErrorMsg(null);
    setPhase("generating");
    setHoldCompare(false);
    setResult(null);
    setResultMeta(null);

    try {
      // give UI time for skeleton (purposeful)
      await new Promise((r) => setTimeout(r, 520));

      const inputThumb = await makeThumbFromUrl({ src: inputUrl, maxEdge: 360 });
      const out = await transformImageDemo({
        inputUrl,
        style: selectedStyle,
        quality,
        pkg,
      });

      // create thumb for history list
      const outputThumb = await makeThumbFromUrl({ src: out.outputUrl, maxEdge: 420 });

      const item: HistoryItem = {
        id: uid(),
        createdAt: Date.now(),
        styleId: selectedStyle.id,
        styleName: selectedStyle.name,
        pkg,
        quality,
        inputThumbUrl: inputThumb,
        outputThumbUrl: outputThumb,
        outputUrl: out.outputUrl,
        liked: false,
        rating: null,
      };

      setResult(item);
      setResultMeta({ w: out.w, h: out.h });
      setPhase("done");

      // store limited history (keep it safe for localStorage)
      setHistory((prev) => [item, ...prev].slice(0, 12));
      pop("ok", isRTL ? "تم التحويل ✅" : "Transformed ✅");
    } catch {
      setPhase("error");
      setErrorMsg(COPY.errorGeneric);
      pop("err", COPY.errorGeneric);
    }
  }

  function openHistoryItem(item: HistoryItem) {
    setResult(item);
    setResultMeta(null);
    setPhase("done");
    setHoldCompare(false);
    // keep settings in sync (nice UX)
    setStyleId(item.styleId);
    setPkg(item.pkg);
    setQuality(item.quality);
    setHistoryOpen(false);
    pop("ok", isRTL ? "تم فتح عنصر من السجل" : "Opened from history");
  }

  function deleteHistoryItem(id: string) {
    setHistory((prev) => prev.filter((x) => x.id !== id));
    pop("ok", COPY.deleted);
  }

  function clearHistory() {
    setHistory([]);
    pop("ok", COPY.cleared);
  }

  function toggleLike() {
    if (!result) return;
    const next = !result.liked;
    const updated = { ...result, liked: next };
    setResult(updated);
    setHistory((prev) => prev.map((x) => (x.id === result.id ? { ...x, liked: next } : x)));
  }

  function setRating(n: number) {
    if (!result) return;
    const updated = { ...result, rating: n };
    setResult(updated);
    setHistory((prev) => prev.map((x) => (x.id === result.id ? { ...x, rating: n } : x)));
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      pop("ok", COPY.copied);
      window.setTimeout(() => setCopied(false), 900);
    } catch {
      pop("err", isRTL ? "تعذر النسخ" : "Copy failed");
    }
  }

  const headerRow = isRTL ? "flex-row-reverse text-right" : "flex-row text-left";
  const gridMain = isRTL ? "text-right" : "text-left";

  const bgStyle: React.CSSProperties = useMemo(() => {
    const dark = theme === "dark";
    return {
      backgroundImage: dark
        ? [
            "radial-gradient(1100px circle at 20% -10%, rgba(124,58,237,0.28), transparent 55%)",
            "radial-gradient(900px circle at 110% 10%, rgba(6,182,212,0.22), transparent 55%)",
            "radial-gradient(900px circle at 30% 120%, rgba(6,182,212,0.12), transparent 55%)",
          ].join(",")
        : [
            "radial-gradient(1000px circle at 15% -10%, rgba(124,58,237,0.16), transparent 55%)",
            "radial-gradient(900px circle at 110% 5%, rgba(6,182,212,0.14), transparent 55%)",
            "radial-gradient(900px circle at 30% 120%, rgba(6,182,212,0.08), transparent 55%)",
          ].join(","),
    };
  }, [theme]);

  const activeStyleGlow = useMemo(() => {
    if (!selectedStyle) return null;
    return {
      background: `radial-gradient(420px circle at 30% 30%, ${selectedStyle.glowFrom}33, transparent 62%), radial-gradient(420px circle at 80% 40%, ${selectedStyle.glowTo}2a, transparent 60%)`,
    } as React.CSSProperties;
  }, [selectedStyle]);

  const actionsDisabled = !result?.outputUrl && !result?.outputThumbUrl;

  return (
    <div dir={dir} style={{ ...rootVars, ...bgStyle }} className={cn("relative min-h-screen bg-[color:var(--ai-bg)] text-[color:var(--ai-fg)]", gridMain)}>
      {/* Global subtle layer */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.05),transparent_35%,rgba(0,0,0,0.20))]" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(var(--ai-dot) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-4 py-6 sm:py-10">
        {/* Header */}
        <div className={cn("mb-6 flex flex-col gap-4 sm:items-end sm:justify-between", headerRow)}>
          <div className="max-w-2xl">
            <div className={cn("flex items-center gap-2", isRTL ? "flex-row-reverse" : "flex-row")}>
              <span className="inline-flex items-center gap-2 rounded-2xl border border-[color:var(--ai-border)] bg-[color:var(--ai-panel2)] px-3 py-1 text-[11px] font-black">
                <Icon name="spark" className="size-4 opacity-90" />
                <span>{isRTL ? "Image → Image" : "Image → Image"}</span>
              </span>
              <span className="inline-flex items-center rounded-full border border-[color:var(--ai-border)] bg-[rgba(255,255,255,0.03)] px-2.5 py-1 text-[10px] font-black opacity-90">
                {isRTL ? "Beta" : "Beta"}
              </span>
            </div>

            <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">{COPY.title}</h1>
            <p className="mt-1 text-sm text-[color:var(--ai-muted)]">{COPY.subtitle}</p>
          </div>

          <div className={cn("flex flex-wrap items-center gap-2", isRTL ? "justify-end" : "justify-start")}>
            <Button variant="soft" size="sm" onClick={() => setHistoryOpen(true)} leftIcon={<Icon name="history" className="size-4" />}>
              {COPY.history}
            </Button>
          </div>
        </div>

        {/* Stepper */}
        <div className="mb-5">
          <div className={cn("flex items-center gap-2", isRTL ? "flex-row-reverse" : "flex-row")}>
            {steps.map((s, idx) => (
              <React.Fragment key={s.id}>
                <div className={cn("flex items-center gap-2", isRTL ? "flex-row-reverse" : "flex-row")}>
                  <div
                    className={cn(
                      "grid size-9 place-items-center rounded-2xl border",
                      s.done
                        ? "border-transparent bg-[linear-gradient(135deg,var(--ai-a1),var(--ai-a2))] text-white shadow-[0_16px_50px_-32px_rgba(124,58,237,0.8)]"
                        : "border-[color:var(--ai-border)] bg-[color:var(--ai-panel2)] text-[color:var(--ai-fg)]",
                    )}
                    aria-label={`Step ${s.id}`}
                  >
                    {s.done ? <Icon name="check" className="size-5" /> : <span className="text-xs font-black tabular-nums">{s.id}</span>}
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-xs font-semibold">{s.label}</div>
                  </div>
                </div>

                {idx < steps.length - 1 ? (
                  <div className="h-px w-10 sm:w-16 bg-[linear-gradient(to_right,rgba(255,255,255,0.06),rgba(255,255,255,0.18),rgba(255,255,255,0.06))] opacity-70" />
                ) : null}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Main grid */}
        <div className="grid gap-4 lg:grid-cols-12">
          {/* Left */}
          <div className="space-y-4 lg:col-span-5">
            {/* Upload */}
            <Panel
              dir={dir}
              step="01"
              title={COPY.uploadTitle}
              subtitle={COPY.uploadSub}
              right={
                <div className={cn("flex items-center gap-2", isRTL ? "flex-row-reverse" : "flex-row")}>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                  />

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fileRef.current?.click()}
                    disabled={phase === "generating"}
                    leftIcon={<Icon name="upload" className="size-4" />}
                  >
                    {inputUrl ? COPY.replace : COPY.pick}
                  </Button>

                  {inputUrl ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearInput}
                      disabled={phase === "generating"}
                      leftIcon={<Icon name="close" className="size-4" />}
                    >
                      {COPY.remove}
                    </Button>
                  ) : null}
                </div>
              }
            >
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleFiles(e.dataTransfer.files);
                }}
                className={cn(
                  "relative overflow-hidden rounded-[24px] border-2 border-dashed",
                  isDragging
                    ? "border-[color:var(--ai-a2)] bg-[rgba(6,182,212,0.10)]"
                    : "border-[color:var(--ai-border)] bg-[color:var(--ai-panel2)]",
                  "transition",
                )}
              >
                <div className="pointer-events-none absolute inset-0">
                  <div
                    className="absolute inset-0 opacity-[0.12]"
                    style={{
                      backgroundImage:
                        "radial-gradient(var(--ai-dot) 1px, transparent 1px)",
                      backgroundSize: "16px 16px",
                    }}
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.08),transparent_45%)]" />
                </div>

                {inputUrl ? (
                  <div className="relative aspect-[16/11] w-full">
                    <Image
                      src={inputUrl}
                      alt="input"
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 420px"
                      priority
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.70),transparent)] p-3">
                      <div className={cn("flex items-end justify-between gap-2", isRTL ? "flex-row-reverse text-right" : "flex-row text-left")}>
                        <div className="min-w-0">
                          <div className="truncate text-xs font-semibold text-white/95">
                            {inputMeta?.name ?? (isRTL ? "صورة" : "Image")}
                          </div>
                          <div className="mt-0.5 text-[11px] text-white/70 tabular-nums">
                            {inputMeta ? `${inputMeta.w}×${inputMeta.h}` : "—"}
                          </div>
                        </div>
                        <div className="text-[11px] text-white/70">
                          {isRTL ? "اسحب لتبديل" : "Drop to replace"}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className={cn(
                      "relative grid w-full place-items-center px-4 py-10 text-center",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ai-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--ai-bg)]",
                    )}
                  >
                    <div className="mx-auto grid size-12 place-items-center rounded-2xl border border-[color:var(--ai-border)] bg-[color:var(--ai-panel)] shadow-[0_18px_60px_-50px_rgba(0,0,0,0.9)]">
                      <Icon name="upload" className="size-6" />
                    </div>
                    <div className="mt-4 text-sm font-semibold">{isRTL ? "اختر صورة أو اسحبها هنا" : "Choose an image or drop it here"}</div>
                    <div className="mt-1 text-xs text-[color:var(--ai-muted)]">{isRTL ? "PNG / JPG / WEBP" : "PNG / JPG / WEBP"}</div>
                  </button>
                )}
              </div>

              {errorMsg ? (
                <div className="mt-3 rounded-2xl border border-[rgba(239,68,68,0.35)] bg-[rgba(239,68,68,0.10)] p-3">
                  <div className={cn("flex items-start gap-2", isRTL ? "flex-row-reverse text-right" : "flex-row text-left")}>
                    <Icon name="warning" className="mt-0.5 size-4 text-[rgba(239,68,68,0.95)]" />
                    <div className="text-xs font-semibold text-[rgba(255,255,255,0.92)]" style={{ color: "rgba(255,255,255,0.92)" }}>
                      <span className="text-[color:var(--ai-fg)]">{errorMsg}</span>
                    </div>
                  </div>
                </div>
              ) : null}
            </Panel>

            {/* Settings (directly under upload) */}
            <Panel
              dir={dir}
              step="03"
              title={COPY.settingsTitle}
              subtitle={COPY.settingsSub}
            >
              <div className="space-y-4">
                {/* Package */}
                <div className="space-y-2">
                  <div className={cn("flex items-end justify-between gap-3", isRTL ? "flex-row-reverse text-right" : "flex-row text-left")}>
                    <div className="text-xs font-semibold text-[color:var(--ai-fg)]">{COPY.pkg}</div>
                    <div className="text-[11px] text-[color:var(--ai-muted)]">{isRTL ? "اختيار واحد" : "Single choice"}</div>
                  </div>

                  <Segmented<PackageTier>
                    dir={dir}
                    layoutId="pkg-highlight"
                    value={pkg}
                    onChange={(v) => {
                      setPkg(v);
                      setPhase("idle");
                      setResult(null);
                    }}
                    options={PACKAGE_OPTS.map((p) => ({
                      id: p.id,
                      label: p.label[dir],
                      hint: p.hint[dir],
                      badge: p.badge?.[dir],
                    }))}
                  />
                </div>

                {/* Quality */}
                <div className="space-y-2">
                  <div className={cn("flex items-end justify-between gap-3", isRTL ? "flex-row-reverse text-right" : "flex-row text-left")}>
                    <div className="text-xs font-semibold text-[color:var(--ai-fg)]">{COPY.quality}</div>
                    <div className="text-[11px] text-[color:var(--ai-muted)]">
                      {pkg === "starter" ? (isRTL ? "Ultra غير متاح" : "Ultra locked") : (isRTL ? "متاح بالكامل" : "Fully available")}
                    </div>
                  </div>

                  <Segmented<Quality>
                    dir={dir}
                    layoutId="quality-highlight"
                    value={quality}
                    onChange={(v) => {
                      setQuality(v);
                      setPhase("idle");
                      setResult(null);
                    }}
                    disabledIds={disabledQualities}
                    options={QUALITY_OPTS.map((q) => ({
                      id: q.id,
                      label: q.label[dir],
                      hint: q.hint[dir],
                      badge: q.id === "ultra" && pkg === "studio" ? (isRTL ? "MAX" : "MAX") : undefined,
                    }))}
                  />
                </div>

                {/* Transform CTA */}
                <div className="rounded-[24px] border border-[color:var(--ai-border)] bg-[color:var(--ai-panel2)] p-3">
                  <div className={cn("flex flex-wrap items-center justify-between gap-2", isRTL ? "flex-row-reverse text-right" : "flex-row text-left")}>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[color:var(--ai-fg)]">
                        {selectedStyle ? (
                          <span className="inline-flex items-center gap-2">
                            <span className="opacity-75">{isRTL ? "Style:" : "Style:"}</span>
                            <span className="truncate">{selectedStyle.name[dir]}</span>
                          </span>
                        ) : (
                          <span className="text-[color:var(--ai-muted)]">{COPY.needStyle}</span>
                        )}
                      </div>
                      <div className="mt-1 text-[11px] text-[color:var(--ai-muted)]">
                        {inputUrl ? (isRTL ? "الصورة جاهزة" : "Image ready") : COPY.needImage}
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      onClick={onTransform}
                      disabled={!canTransform}
                      leftIcon={<Icon name="spark" className="size-4" />}
                      className={cn(
                        "min-w-[160px]",
                        canTransform && !reduceMotion && "ai-soft-pulse",
                      )}
                    >
                      {phase === "generating" ? COPY.transforming : COPY.transform}
                    </Button>
                  </div>
                </div>
              </div>
            </Panel>

            {/* Result */}
            <Panel
              dir={dir}
              step="04"
              title={COPY.resultTitle}
              subtitle={COPY.resultSub}
              right={
                <div className="text-[11px] text-[color:var(--ai-muted)] tabular-nums">
                  {resultMeta ? `${resultMeta.w}×${resultMeta.h}` : null}
                </div>
              }
            >
              <div className="space-y-3">
                <div
                  className={cn(
                    "relative overflow-hidden rounded-[24px] border border-[color:var(--ai-border)] bg-[color:var(--ai-panel2)]",
                    selectedStyle ? "" : "",
                  )}
                  style={selectedStyle ? activeStyleGlow : undefined}
                  onPointerDown={() => {
                    if (!result) return;
                    if (!inputUrl && !result.inputThumbUrl) return;
                    setHoldCompare(true);
                  }}
                  onPointerUp={() => setHoldCompare(false)}
                  onPointerCancel={() => setHoldCompare(false)}
                  onPointerLeave={() => setHoldCompare(false)}
                >
                  {/* top gradient line */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,var(--ai-a1),var(--ai-a2),transparent)] opacity-70" />

                  <div className="relative aspect-[16/11] w-full">
                    <AnimatePresence mode="wait">
                      {/* Loading state */}
                      {phase === "generating" ? (
                        <motion.div
                          key="loading"
                          className="absolute inset-0"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.16 }}
                        >
                          <div className="absolute inset-0 ai-skeleton motion-reduce:animate-none" />
                          <div className="absolute inset-0 ai-scanline motion-reduce:animate-none" />

                          <div className="absolute inset-0 grid place-items-center p-6">
                            <div className="w-full max-w-[340px] rounded-[22px] border border-white/10 bg-black/35 p-4 text-center backdrop-blur-md">
                              <div className="mx-auto mb-2 grid size-10 place-items-center rounded-2xl bg-white/10">
                                <div className="ai-spinner motion-reduce:animate-none" />
                              </div>
                              <div className="text-sm font-semibold text-white">{COPY.transforming}</div>
                              <div className="mt-2 space-y-2">
                                <GeneratingSteps dir={dir} reduceMotion={reduceMotion} />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ) : null}

                      {/* Empty state */}
                      {!result?.outputUrl && phase !== "generating" ? (
                        <motion.div
                          key="empty"
                          className="absolute inset-0 grid place-items-center p-6"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.16 }}
                        >
                          <div className="text-center">
                            <div className="mx-auto grid size-12 place-items-center rounded-2xl border border-[color:var(--ai-border)] bg-[color:var(--ai-panel)]">
                              <Icon name="spark" className="size-6 opacity-90" />
                            </div>
                            <div className="mt-4 text-sm font-semibold">{isRTL ? "جاهز عندما تكون جاهز" : "Ready when you are"}</div>
                            <div className="mt-1 text-xs text-[color:var(--ai-muted)]">
                              {isRTL ? "ارفع صورة + اختر Style ثم اضغط تحويل." : "Upload + pick a style, then transform."}
                            </div>
                          </div>
                        </motion.div>
                      ) : null}

                      {/* Result state */}
                      {result?.outputUrl && phase !== "generating" ? (
                        <motion.div
                          key="result"
                          className="absolute inset-0"
                          initial={
                            reduceMotion
                              ? { opacity: 0 }
                              : {
                                  opacity: 0,
                                  clipPath:
                                    "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)",
                                }
                          }
                          animate={
                            reduceMotion
                              ? { opacity: 1 }
                              : {
                                  opacity: 1,
                                  clipPath:
                                    "polygon(0 0, 100% 0, 100% 90%, 94% 100%, 0 100%)",
                                }
                          }
                          exit={{ opacity: 0 }}
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        >
                          {/* Hold-to-compare */}
                          {holdCompare && (inputUrl || result.inputThumbUrl) ? (
                            <Image
                              src={inputUrl ?? result.inputThumbUrl!}
                              alt="original"
                              fill
                              unoptimized
                              className="object-cover"
                              sizes="(max-width: 1024px) 100vw, 420px"
                            />
                          ) : (
                            <Image
                              src={result.outputUrl}
                              alt="output"
                              fill
                              unoptimized
                              className="object-cover"
                              sizes="(max-width: 1024px) 100vw, 420px"
                            />
                          )}

                          {/* label */}
                          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.70),transparent)] p-3">
                            <div className={cn("flex items-end justify-between gap-2", isRTL ? "flex-row-reverse text-right" : "flex-row text-left")}>
                              <div className="min-w-0">
                                <div className="truncate text-xs font-semibold text-white/95">
                                  {holdCompare ? COPY.original : COPY.output}
                                </div>
                                <div className="mt-0.5 text-[11px] text-white/70">
                                  {selectedStyle ? selectedStyle.name[dir] : (isRTL ? "Style" : "Style")}
                                </div>
                              </div>

                              {(inputUrl || result.inputThumbUrl) ? (
                                <div className="text-[11px] text-white/70">
                                  {COPY.holdCompare}
                                </div>
                              ) : null}
                            </div>
                          </div>

                          {/* edge glow */}
                          {selectedStyle ? (
                            <div
                              className="pointer-events-none absolute inset-0"
                              style={{
                                boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.08), inset 0 0 0 2px rgba(255,255,255,0.03), 0 0 0 1px rgba(255,255,255,0.04), 0 0 30px -12px ${selectedStyle.glowFrom}88`,
                              }}
                            />
                          ) : null}
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Actions */}
                <div className={cn("flex flex-wrap items-center gap-2", isRTL ? "justify-end" : "justify-start")}>
                  <motion.button
                    type="button"
                    onClick={toggleLike}
                    disabled={actionsDisabled}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 520, damping: 32 }}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold transition",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ai-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--ai-bg)]",
                      actionsDisabled
                        ? "cursor-not-allowed opacity-50 border-[color:var(--ai-border)] bg-[color:var(--ai-panel2)]"
                        : result?.liked
                          ? "border-transparent bg-[linear-gradient(135deg,rgba(239,68,68,0.35),rgba(251,113,133,0.20))]"
                          : "border-[color:var(--ai-border)] bg-[color:var(--ai-panel2)] hover:bg-[color:var(--ai-panel)]",
                    )}
                  >
                    <span className={cn("grid size-7 place-items-center rounded-xl", result?.liked ? "text-[rgba(255,255,255,0.95)]" : "text-[color:var(--ai-fg)]")}>
                      <Icon name="heart" className="size-5" />
                    </span>
                    <span>{COPY.actions.like}</span>
                  </motion.button>

                  <Button
                    variant="soft"
                    size="sm"
                    onClick={() => setRateOpen(true)}
                    disabled={actionsDisabled}
                    leftIcon={<Icon name="star" className="size-4" />}
                  >
                    {COPY.actions.rate}
                  </Button>

                  <Button
                    variant="soft"
                    size="sm"
                    onClick={() => setSaveOpen(true)}
                    disabled={actionsDisabled}
                    leftIcon={<Icon name="bookmark" className="size-4" />}
                  >
                    {COPY.actions.save}
                  </Button>

                  <Button
                    variant="soft"
                    size="sm"
                    onClick={() => setShareOpen(true)}
                    disabled={actionsDisabled}
                    leftIcon={<Icon name="share" className="size-4" />}
                  >
                    {COPY.actions.share}
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setPublishOpen(true)}
                    disabled={actionsDisabled}
                    leftIcon={<Icon name="send" className="size-4" />}
                  >
                    {COPY.actions.publish}
                  </Button>

                  {result?.rating ? (
                    <span className="rounded-full border border-[color:var(--ai-border)] bg-[color:var(--ai-panel2)] px-3 py-2 text-[11px] font-black text-[color:var(--ai-fg)]">
                      ⭐ {result.rating}/5
                    </span>
                  ) : null}
                </div>
              </div>
            </Panel>
          </div>

          {/* Right */}
          <div className="space-y-4 lg:col-span-7">
            <Panel
              dir={dir}
              step="02"
              title={COPY.stylesTitle}
              subtitle={COPY.stylesSub}
              right={
                selectedStyle ? (
                  <span className="inline-flex items-center gap-2 rounded-2xl border border-[color:var(--ai-border)] bg-[color:var(--ai-panel2)] px-3 py-2 text-[11px] font-black">
                    <span className="opacity-70">{isRTL ? "Selected" : "Selected"}</span>
                    <span className="truncate max-w-[160px]">{selectedStyle.name[dir]}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-2xl border border-[color:var(--ai-border)] bg-[rgba(255,255,255,0.02)] px-3 py-2 text-[11px] font-black text-[color:var(--ai-muted)]">
                    <Icon name="spark" className="size-4 opacity-80" />
                    <span>{COPY.needStyle}</span>
                  </span>
                )
              }
            >
              <LayoutGroup>
                <motion.div
                  className="grid gap-3 sm:grid-cols-2"
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: {},
                    show: { transition: { staggerChildren: 0.03 } },
                  }}
                >
                  {STYLES.map((s) => {
                    const active = s.id === styleId;
                    const name = s.name[dir];
                    const hint = s.hint[dir];

                    return (
                      <motion.button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setStyleId(s.id);
                          setPhase("idle");
                          setResult(null);
                        }}
                        variants={{
                          hidden: { opacity: 0, y: 8 },
                          show: { opacity: 1, y: 0 },
                        }}
                        whileHover={reduceMotion ? undefined : { y: -2 }}
                        whileTap={{ scale: 0.99 }}
                        transition={{ type: "spring", stiffness: 520, damping: 34 }}
                        className={cn(
                          "group relative overflow-hidden rounded-[24px] border text-left",
                          "bg-[color:var(--ai-panel2)]",
                          active ? "border-transparent" : "border-[color:var(--ai-border)]",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ai-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--ai-bg)]",
                        )}
                      >
                        <div className="relative h-[110px] w-full">
                          <Image
                            src={s.thumb}
                            alt={name}
                            fill
                            unoptimized
                            className="object-cover"
                            sizes="(max-width: 1024px) 50vw, 520px"
                          />
                          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.55),transparent_55%)]" />
                          <div className="absolute bottom-2 start-2 flex flex-wrap gap-1.5">
                            {s.tags.slice(0, 3).map((t) => (
                              <span
                                key={t}
                                className="rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-[10px] font-black text-white/90"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className={cn("p-3", isRTL ? "text-right" : "text-left")}>
                          <div className={cn("flex items-start justify-between gap-2", isRTL ? "flex-row-reverse" : "flex-row")}>
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold text-[color:var(--ai-fg)]">{name}</div>
                              <div className="mt-0.5 text-xs text-[color:var(--ai-muted)]">{hint}</div>
                            </div>

                            <span className={cn(
                              "shrink-0 rounded-full border px-2 py-1 text-[10px] font-black",
                              active
                                ? "border-white/15 bg-white/10 text-white"
                                : "border-[color:var(--ai-border)] bg-[rgba(255,255,255,0.02)] text-[color:var(--ai-muted)]",
                            )}>
                              {active ? (isRTL ? "مختار" : "Selected") : (isRTL ? "اختر" : "Pick")}
                            </span>
                          </div>
                        </div>

                        {active ? (
                          <motion.div
                            layoutId="style-selected"
                            className="pointer-events-none absolute inset-0 rounded-[24px]"
                            style={{
                              background: `linear-gradient(135deg, ${s.glowFrom}33, ${s.glowTo}22)`,
                              boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.10), 0 24px 80px -55px ${s.glowFrom}`,
                            }}
                            transition={{ type: "spring", stiffness: 520, damping: 36 }}
                          />
                        ) : null}
                      </motion.button>
                    );
                  })}
                </motion.div>
              </LayoutGroup>
            </Panel>
          </div>
        </div>
      </div>

      {/* History Drawer */}
      <Drawer open={historyOpen} onOpenChange={setHistoryOpen} title={COPY.history} dir={dir}>
        <div className="space-y-3">
          <div className={cn("flex items-center justify-between gap-2", isRTL ? "flex-row-reverse" : "flex-row")}>
            <div className="text-xs font-semibold text-[color:var(--ai-fg)]">
              {isRTL ? "عناصر" : "Items"}: <span className="tabular-nums">{history.length}</span>
            </div>
            <Button variant="danger" size="sm" onClick={clearHistory} disabled={history.length === 0}>
              {COPY.clearHistory}
            </Button>
          </div>

          {history.length === 0 ? (
            <div className="rounded-[24px] border border-[color:var(--ai-border)] bg-[color:var(--ai-panel)] p-4 text-center">
              <div className="mx-auto grid size-12 place-items-center rounded-2xl border border-[color:var(--ai-border)] bg-[color:var(--ai-panel2)]">
                <Icon name="history" className="size-6 opacity-90" />
              </div>
              <div className="mt-3 text-sm font-semibold">{COPY.emptyHistoryTitle}</div>
              <div className="mt-1 text-xs text-[color:var(--ai-muted)]">{COPY.emptyHistorySub}</div>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((h) => {
                const styleName = h.styleName[dir];
                return (
                  <div
                    key={h.id}
                    className={cn(
                      "rounded-[24px] border border-[color:var(--ai-border)] bg-[color:var(--ai-panel)] p-2",
                      "shadow-[0_18px_70px_-60px_rgba(0,0,0,0.7)]",
                    )}
                  >
                    <div className={cn("flex items-center gap-3", isRTL ? "flex-row-reverse text-right" : "flex-row text-left")}>
                      <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl border border-[color:var(--ai-border)] bg-[color:var(--ai-panel2)]">
                        <Image
                          src={h.outputThumbUrl}
                          alt={styleName}
                          fill
                          unoptimized
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-[color:var(--ai-fg)]">
                          {styleName}
                        </div>
                        <div className="mt-0.5 text-[11px] text-[color:var(--ai-muted)]">
                          <span className="font-black">{h.pkg.toUpperCase()}</span>
                          <span className="opacity-60"> • </span>
                          <span className="font-black">{h.quality.toUpperCase()}</span>
                          <span className="opacity-60"> • </span>
                          <span>{fmtRelative(h.createdAt, dir)}</span>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {h.liked ? (
                            <span className="rounded-full border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.12)] px-2 py-0.5 text-[10px] font-black">
                              ♥
                            </span>
                          ) : null}
                          {h.rating ? (
                            <span className="rounded-full border border-[color:var(--ai-border)] bg-[color:var(--ai-panel2)] px-2 py-0.5 text-[10px] font-black">
                              ⭐ {h.rating}/5
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className={cn("flex items-center gap-2", isRTL ? "flex-row-reverse" : "flex-row")}>
                        <Button variant="soft" size="sm" onClick={() => openHistoryItem(h)}>
                          {COPY.open}
                        </Button>
                        <IconButton label="Delete" onClick={() => deleteHistoryItem(h.id)}>
                          <Icon name="close" className="size-5" />
                        </IconButton>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Drawer>

      {/* Publish Modal */}
      <Modal
        open={publishOpen}
        onOpenChange={setPublishOpen}
        title={COPY.publishTitle}
        subtitle={COPY.publishSub}
        dir={dir}
        footer={
          <div className={cn("flex items-center gap-2", isRTL ? "flex-row-reverse" : "flex-row")}>
            <Button variant="ghost" onClick={() => setPublishOpen(false)}>
              {COPY.cancel}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                pop("ok", isRTL ? "تم النشر ✅" : "Published ✅");
                setPublishOpen(false);
                setCaption("");
              }}
              disabled={actionsDisabled}
              leftIcon={<Icon name="send" className="size-4" />}
              className="ms-auto"
            >
              {COPY.publishNow}
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="rounded-[24px] border border-[color:var(--ai-border)] bg-[color:var(--ai-panel2)] p-3">
            <div className={cn("flex items-center gap-3", isRTL ? "flex-row-reverse text-right" : "flex-row text-left")}>
              <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl border border-[color:var(--ai-border)] bg-[color:var(--ai-panel)]">
                {result?.outputThumbUrl ? (
                  <Image src={result.outputThumbUrl} alt="preview" fill unoptimized className="object-cover" sizes="64px" />
                ) : null}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-[color:var(--ai-fg)]">
                  {selectedStyle ? selectedStyle.name[dir] : (isRTL ? "نتيجة" : "Result")}
                </div>
                <div className="mt-1 text-[11px] text-[color:var(--ai-muted)]">
                  {isRTL ? "هذه مجرد واجهة — اربطها لاحقًا بـ API النشر." : "UI-only demo — wire to publish API later."}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold">{COPY.visibility}</div>
            <div className="grid grid-cols-3 gap-2">
              {(["public", "followers", "private"] as const).map((v) => {
                const label =
                  v === "public" ? COPY.visPublic : v === "followers" ? COPY.visFollowers : COPY.visPrivate;
                const active = visibility === v;
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVisibility(v)}
                    className={cn(
                      "rounded-2xl border px-3 py-2 text-xs font-semibold transition",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ai-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--ai-bg)]",
                      active
                        ? "border-transparent bg-[linear-gradient(135deg,rgba(124,58,237,0.35),rgba(6,182,212,0.25))]"
                        : "border-[color:var(--ai-border)] bg-[color:var(--ai-panel2)] hover:bg-[color:var(--ai-panel)]",
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold">{isRTL ? "الوصف" : "Caption"}</div>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={COPY.captionPh}
              rows={4}
              className={cn(
                "w-full rounded-[22px] border border-[color:var(--ai-border)] bg-[color:var(--ai-panel2)] p-3 text-sm",
                "outline-none transition",
                "focus-visible:ring-2 focus-visible:ring-[color:var(--ai-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--ai-bg)]",
              )}
            />
          </div>
        </div>
      </Modal>

      {/* Save Modal */}
      <Modal
        open={saveOpen}
        onOpenChange={setSaveOpen}
        title={COPY.savedTitle}
        subtitle={COPY.savedSub}
        dir={dir}
        footer={
          <div className={cn("flex items-center gap-2", isRTL ? "flex-row-reverse" : "flex-row")}>
            <Button variant="ghost" onClick={() => setSaveOpen(false)}>
              {COPY.cancel}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                pop("ok", isRTL ? "تم الحفظ ✅" : "Saved ✅");
                setSaveOpen(false);
              }}
              disabled={actionsDisabled}
              leftIcon={<Icon name="bookmark" className="size-4" />}
              className="ms-auto"
            >
              {isRTL ? "حفظ" : "Save"}
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="grid gap-2">
            {collections.map((c) => {
              const active = collectionId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCollectionId(c.id)}
                  className={cn(
                    "rounded-[22px] border p-3 text-sm font-semibold transition",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ai-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--ai-bg)]",
                    active
                      ? "border-transparent bg-[linear-gradient(135deg,rgba(124,58,237,0.35),rgba(6,182,212,0.25))]"
                      : "border-[color:var(--ai-border)] bg-[color:var(--ai-panel2)] hover:bg-[color:var(--ai-panel)]",
                    isRTL ? "text-right" : "text-left",
                  )}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>
      </Modal>

      {/* Share Modal */}
      <Modal
        open={shareOpen}
        onOpenChange={setShareOpen}
        title={COPY.shareTitle}
        subtitle={COPY.shareSub}
        dir={dir}
        footer={
          <div className={cn("flex items-center gap-2", isRTL ? "flex-row-reverse" : "flex-row")}>
            <Button variant="ghost" onClick={() => setShareOpen(false)}>
              {COPY.cancel}
            </Button>
            <Button
              variant="primary"
              onClick={copyLink}
              disabled={actionsDisabled}
              leftIcon={<Icon name="share" className="size-4" />}
              className="ms-auto"
            >
              {copied ? COPY.copied : COPY.copy}
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="rounded-[24px] border border-[color:var(--ai-border)] bg-[color:var(--ai-panel2)] p-3">
            <div className="text-[11px] text-[color:var(--ai-muted)]">{isRTL ? "الرابط" : "Link"}</div>
            <div className="mt-1 flex items-center gap-2">
              <div className="min-w-0 flex-1 truncate rounded-2xl border border-[color:var(--ai-border)] bg-[color:var(--ai-panel)] px-3 py-2 text-xs font-semibold">
                {shareUrl}
              </div>
              <IconButton label="Copy" onClick={copyLink} disabled={actionsDisabled}>
                <Icon name="check" className="size-5 opacity-90" />
              </IconButton>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="soft"
              onClick={() => {
                copyLink();
                pop("ok", isRTL ? "انسخ ثم شارك في أي تطبيق" : "Copy then share anywhere");
              }}
              disabled={actionsDisabled}
              leftIcon={<Icon name="share" className="size-4" />}
            >
              {isRTL ? "مشاركة سريعة" : "Quick share"}
            </Button>

            <Button
              variant="soft"
              onClick={() => {
                pop("ok", isRTL ? "تمت المحاكاة (UI فقط)" : "Simulated (UI only)");
                setShareOpen(false);
              }}
              disabled={actionsDisabled}
              leftIcon={<Icon name="send" className="size-4" />}
            >
              {isRTL ? "إرسال داخل فاناارا" : "Send in Fanaara"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Rate Modal */}
      <Modal
        open={rateOpen}
        onOpenChange={setRateOpen}
        title={COPY.rateTitle}
        subtitle={COPY.rateSub}
        dir={dir}
        footer={
          <div className={cn("flex items-center gap-2", isRTL ? "flex-row-reverse" : "flex-row")}>
            <Button variant="ghost" onClick={() => setRateOpen(false)}>
              {COPY.cancel}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                pop("ok", isRTL ? "تم حفظ التقييم ✅" : "Rating saved ✅");
                setRateOpen(false);
              }}
              disabled={actionsDisabled}
              leftIcon={<Icon name="star" className="size-4" />}
              className="ms-auto"
            >
              {COPY.submit}
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="rounded-[24px] border border-[color:var(--ai-border)] bg-[color:var(--ai-panel2)] p-4">
            <div className={cn("flex items-center justify-between gap-2", isRTL ? "flex-row-reverse" : "flex-row")}>
              <div className="text-xs font-semibold">{isRTL ? "اختر تقييم" : "Pick a rating"}</div>
              {result?.rating ? (
                <div className="text-[11px] text-[color:var(--ai-muted)]">
                  {isRTL ? "حاليًا:" : "Current:"} <span className="font-black">{result.rating}/5</span>
                </div>
              ) : (
                <div className="text-[11px] text-[color:var(--ai-muted)]">{isRTL ? "اختياري" : "Optional"}</div>
              )}
            </div>

            <div className={cn("mt-3 flex items-center gap-2", isRTL ? "flex-row-reverse" : "flex-row")}>
              {[1, 2, 3, 4, 5].map((n) => {
                const active = (result?.rating ?? 0) >= n;
                return (
                  <motion.button
                    key={n}
                    type="button"
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 520, damping: 34 }}
                    onClick={() => setRating(n)}
                    disabled={actionsDisabled}
                    className={cn(
                      "grid size-12 place-items-center rounded-2xl border transition",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ai-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--ai-bg)]",
                      active
                        ? "border-transparent bg-[linear-gradient(135deg,rgba(245,158,11,0.35),rgba(124,58,237,0.20))]"
                        : "border-[color:var(--ai-border)] bg-[color:var(--ai-panel)] hover:bg-[color:var(--ai-panel2)]",
                      actionsDisabled && "opacity-50 cursor-not-allowed",
                    )}
                  >
                    <span className={cn("text-base", active ? "opacity-100" : "opacity-50")}>⭐</span>
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-3 text-[11px] text-[color:var(--ai-muted)]">
              {isRTL ? "التقييم يُحفظ محليًا في هذا الديمو." : "Rating is stored locally in this demo."}
            </div>
          </div>
        </div>
      </Modal>

      {/* Toast */}
      <AnimatePresence>
        {toast ? (
          <motion.div
            className="pointer-events-none fixed inset-x-0 bottom-6 z-[2000] flex justify-center px-4"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
          >
            <div
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold shadow-[0_20px_70px_-50px_rgba(0,0,0,0.75)]",
                toast.tone === "ok" && "border-[rgba(34,197,94,0.35)] bg-[rgba(34,197,94,0.12)] text-[color:var(--ai-fg)]",
                toast.tone === "warn" && "border-[rgba(245,158,11,0.35)] bg-[rgba(245,158,11,0.12)] text-[color:var(--ai-fg)]",
                toast.tone === "err" && "border-[rgba(239,68,68,0.35)] bg-[rgba(239,68,68,0.12)] text-[color:var(--ai-fg)]",
              )}
            >
              <span
                className={cn(
                  "size-2 rounded-full",
                  toast.tone === "ok" && "bg-[rgba(34,197,94,0.95)]",
                  toast.tone === "warn" && "bg-[rgba(245,158,11,0.95)]",
                  toast.tone === "err" && "bg-[rgba(239,68,68,0.95)]",
                )}
              />
              <span>{toast.msg}</span>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Local CSS for signature loading */}
      <style jsx global>{`
        .ai-soft-pulse {
          animation: ai-soft-pulse 1.6s ease-in-out infinite;
        }
        @keyframes ai-soft-pulse {
          0% { filter: brightness(1); transform: translateZ(0); }
          50% { filter: brightness(1.08); transform: translateZ(0); }
          100% { filter: brightness(1); transform: translateZ(0); }
        }

        .ai-skeleton {
          background: linear-gradient(
            110deg,
            rgba(255,255,255,0.05) 8%,
            rgba(255,255,255,0.10) 18%,
            rgba(255,255,255,0.05) 33%
          );
          background-size: 200% 100%;
          animation: ai-shimmer 1.2s linear infinite;
        }
        @keyframes ai-shimmer {
          0% { background-position: 0% 0; }
          100% { background-position: -200% 0; }
        }

        .ai-scanline {
          background: linear-gradient(
            to bottom,
            transparent,
            rgba(255,255,255,0.08),
            transparent
          );
          opacity: 0.35;
          transform: translateY(-40%);
          animation: ai-scan 1.25s linear infinite;
          mix-blend-mode: overlay;
        }
        @keyframes ai-scan {
          0% { transform: translateY(-40%); }
          100% { transform: translateY(140%); }
        }

        .ai-spinner {
          width: 22px;
          height: 22px;
          border-radius: 9999px;
          border: 2px solid rgba(255,255,255,0.75);
          border-top-color: transparent;
          animation: ai-spin 0.8s linear infinite;
        }
        @keyframes ai-spin {
          to { transform: rotate(360deg); }
        }

        @media (prefers-reduced-motion: reduce) {
          .ai-soft-pulse, .ai-skeleton, .ai-scanline, .ai-spinner { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

function GeneratingSteps({ dir, reduceMotion }: { dir: Dir; reduceMotion: boolean }) {
  const isRTL = dir === "rtl";
  const items = isRTL
    ? ["تحليل الصورة", "تطبيق الحِبر", "لمسات اللون"]
    : ["Analyzing image", "Inking pass", "Color pass"];

  return (
    <div className="space-y-1.5">
      {items.map((t, i) => (
        <motion.div
          key={t}
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ delay: 0.08 * i, duration: 0.18 }}
          className={cn(
            "flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-semibold text-white/80",
            isRTL ? "flex-row-reverse text-right" : "flex-row text-left",
          )}
        >
          <span className="size-1.5 rounded-full bg-white/60" />
          <span className="truncate">{t}</span>
        </motion.div>
      ))}
    </div>
  );
}
