// app\creator\works\[workId]\chapters\[chapterId]\editor\_components\utils.ts
import {
  NormalizedBBox,
  NormalizedPoint,
  PageAnnotationsDoc,
  PageElement,
  TextLang,
  WritingDirection,
} from "./types";

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
export function clamp01(n: number) {
  return clamp(n, 0, 1);
}

export function bboxCenter(b: NormalizedBBox): NormalizedPoint {
  return { x: b.x + b.w / 2, y: b.y + b.h / 2 };
}

export function detectLang(text: string): TextLang {
  if (!text) return "unknown";

  // Arabic
  if (/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text)) return "ar";
  // Japanese (hiragana/katakana)
  if (/[\u3040-\u30FF]/.test(text)) return "ja";
  // Korean
  if (/[\uAC00-\uD7AF]/.test(text)) return "ko";
  // Chinese (CJK unified ideographs)
  if (/[\u4E00-\u9FFF]/.test(text)) return "zh";
  // English / Latin
  if (/[A-Za-z]/.test(text)) return "en";

  return "unknown";
}

export function dirForLang(lang: TextLang): WritingDirection {
  if (lang === "ar") return "RTL";
  return "LTR";
}

export function ensureAnnotations(
  pageId: string,
  maybe: PageAnnotationsDoc | null,
): PageAnnotationsDoc {
  const now = new Date().toISOString();
  if (maybe?.version === 1) {
    // Ensure meta exists (backward safety)
    return {
      ...maybe,
      meta: {
        keywords: maybe.meta?.keywords ?? [],
        sceneDescription: maybe.meta?.sceneDescription ?? "",
        languageHint: maybe.meta?.languageHint ?? "unknown",
      },
      elements: maybe.elements ?? [],
      updatedAt: maybe.updatedAt ?? now,
    };
  }

  return {
    version: 1,
    pageId,
    meta: { keywords: [], sceneDescription: "", languageHint: "unknown" },
    elements: [],
    updatedAt: now,
  };
}

export function markEdited(el: PageElement): PageElement {
  if (el.status === "deleted") return el;
  return { ...el, status: "edited" };
}

export function normToPxBBox(b: NormalizedBBox, imgW: number, imgH: number) {
  return {
    x: b.x * imgW,
    y: b.y * imgH,
    w: b.w * imgW,
    h: b.h * imgH,
  };
}

export function pxToNormBBox(
  b: { x: number; y: number; w: number; h: number },
  imgW: number,
  imgH: number,
): NormalizedBBox {
  if (imgW <= 0 || imgH <= 0) return { x: 0, y: 0, w: 0, h: 0 };
  return {
    x: clamp01(b.x / imgW),
    y: clamp01(b.y / imgH),
    w: clamp01(b.w / imgW),
    h: clamp01(b.h / imgH),
  };
}

export function toTtbText(text: string) {
  // Very simple vertical layout: one char per line.
  // (Good enough for SFX or short JP text; long paragraphs need advanced shaping)
  return (text ?? "").split("").join("\n");
}

export function isTextInputTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName?.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  if (el.isContentEditable) return true;
  return false;
}

export function normalizeReadingOrder(elements: PageElement[]) {
  const alive = elements.slice().sort((a, b) => a.readingOrder - b.readingOrder);
  return alive.map((e, idx) => ({ ...e, readingOrder: idx + 1 }));
}

export function autoReadingOrder(params: {
  elements: PageElement[];
  direction: "LTR" | "RTL";
}) {
  const { elements, direction } = params;

  // Use bbox center instead of stored anchor (anchor might be used for tailTip later)
  const sorted = elements
    .slice()
    .sort((a, b) => {
      const ac = bboxCenter(a.geometry.container_bbox);
      const bc = bboxCenter(b.geometry.container_bbox);

      // primary by y
      const dy = ac.y - bc.y;
      if (Math.abs(dy) > 0.02) return dy;

      // secondary by x depending on direction
      if (direction === "RTL") return bc.x - ac.x;
      return ac.x - bc.x;
    })
    .map((e, idx) => ({ ...e, readingOrder: idx + 1 }));

  return sorted;
}

/**
 * Auto-fit font size into a pixel box (width/height in px).
 * Returns recommended fontSize (integer).
 */
let _measureCanvas: HTMLCanvasElement | null = null;
export function autoFitFontSize(params: {
  text: string;
  widthPx: number;
  heightPx: number;
  fontFamily: string;
  fontStyle: string;
  lineHeight: number;
  maxFontSize: number;
  minFontSize: number;
  writingDirection: WritingDirection;
}) {
  const {
    text,
    widthPx,
    heightPx,
    fontFamily,
    fontStyle,
    lineHeight,
    maxFontSize,
    minFontSize,
    writingDirection,
  } = params;

  const safeText = (text ?? "").trim();
  if (!safeText) return clamp(Math.round(maxFontSize), minFontSize, maxFontSize);

  // Skip for TTB (naive vertical layout)
  if (writingDirection === "TTB") {
    return clamp(Math.round(maxFontSize), minFontSize, maxFontSize);
  }

  const w = Math.max(1, widthPx);
  const h = Math.max(1, heightPx);

  if (!_measureCanvas) _measureCanvas = document.createElement("canvas");
  const ctx = _measureCanvas.getContext("2d");
  if (!ctx) return clamp(Math.round(maxFontSize), minFontSize, maxFontSize);

  function fits(fontSize: number) {
    ctx.font = `${fontStyle || "normal"} ${fontSize}px ${fontFamily || "Arial"}`;

    const words = safeText.split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let current = "";

    function pushLine(line: string) {
      lines.push(line);
    }

    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      const width = ctx.measureText(test).width;

      if (width <= w) {
        current = test;
        continue;
      }

      if (current) pushLine(current);

      // if single word too long, break by chars
      if (ctx.measureText(word).width > w) {
        let chunk = "";
        for (const ch of word) {
          const t = chunk + ch;
          if (ctx.measureText(t).width <= w) {
            chunk = t;
          } else {
            if (chunk) pushLine(chunk);
            chunk = ch;
          }
        }
        current = chunk;
      } else {
        current = word;
      }
    }
    if (current) pushLine(current);

    const totalHeight = lines.length * fontSize * (lineHeight || 1.2);
    return totalHeight <= h;
  }

  // Binary search
  let lo = Math.round(minFontSize);
  let hi = Math.round(maxFontSize);
  let best = lo;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (fits(mid)) {
      best = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  return clamp(best, minFontSize, maxFontSize);
}
