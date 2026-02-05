// app\creator\works\[workId]\chapters\[chapterId]\editor\_components\utils.ts
import {
  NormalizedBBox,
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

export function bboxCenter(b: NormalizedBBox) {
  return { x: b.x + b.w / 2, y: b.y + b.h / 2 };
}

export function detectLang(text: string): TextLang {
  if (!text) return "unknown";
  if (/[\u0600-\u06FF]/.test(text)) return "ar";
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
  if (maybe?.version === 1) return maybe;

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
