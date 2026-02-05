import { NormalizedBBox, PageDoc, TextDirection, TextLang } from "./types";

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function clamp01(n: number) {
  return clamp(n, 0, 1);
}

export function detectLang(text: string): TextLang {
  if (!text) return "unknown";
  const hasArabic = /[\u0600-\u06FF]/.test(text);
  const hasLatin = /[A-Za-z]/.test(text);
  if (hasArabic) return "ar";
  if (hasLatin) return "en";
  return "unknown";
}

export function directionForLang(lang: TextLang): TextDirection {
  if (lang === "ar") return "RTL";
  return "LTR";
}

export function mockTranslate(original: string, lang: TextLang) {
  if (!original) return "";
  if (lang === "ar") return `EN: ${original}`;
  return `AR: ${original}`;
}

export type ViewTransform = {
  scale: number;
  offsetX: number;
  offsetY: number;
};

export function computeFitTransform(
  containerW: number,
  containerH: number,
  imageW: number,
  imageH: number
): ViewTransform {
  if (!containerW || !containerH || !imageW || !imageH) {
    return { scale: 1, offsetX: 0, offsetY: 0 };
  }
  const scale = Math.min(containerW / imageW, containerH / imageH);
  const drawW = imageW * scale;
  const drawH = imageH * scale;
  const offsetX = (containerW - drawW) / 2;
  const offsetY = (containerH - drawH) / 2;
  return { scale, offsetX, offsetY };
}

export function normalizedToDisplayBBox(
  bbox: NormalizedBBox,
  imageW: number,
  imageH: number,
  t: ViewTransform
) {
  return {
    x: t.offsetX + bbox.x * imageW * t.scale,
    y: t.offsetY + bbox.y * imageH * t.scale,
    w: bbox.w * imageW * t.scale,
    h: bbox.h * imageH * t.scale,
  };
}

export function displayToNormalizedBBox(
  display: { x: number; y: number; w: number; h: number },
  imageW: number,
  imageH: number,
  t: ViewTransform
): NormalizedBBox {
  const denomW = imageW * t.scale;
  const denomH = imageH * t.scale;

  const nx = (display.x - t.offsetX) / denomW;
  const ny = (display.y - t.offsetY) / denomH;
  const nw = display.w / denomW;
  const nh = display.h / denomH;

  return {
    x: clamp01(nx),
    y: clamp01(ny),
    w: clamp01(nw),
    h: clamp01(nh),
  };
}

export async function buildPagesFromFiles(files: File[]): Promise<PageDoc[]> {
  const pages: PageDoc[] = [];
  for (const file of files) {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;

    // wait load
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load image: ${file.name}`));
    });

    pages.push({
      id: crypto.randomUUID(),
      image: {
        name: file.name,
        url,
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
      },
      elements: [],
    });
  }
  return pages;
}

export function downloadJson(filename: string, data: any) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
