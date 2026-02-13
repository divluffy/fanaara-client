export type AnalyzerPageJson = {
  pageId: string;
  pageNumber: number;
  title?: string;
  description?: string;
  keywords: string[];
  image: {
    src: string;
    naturalWidth: number;
    naturalHeight: number;
  };
  elements: AnalyzerElement[];
  meta: {
    version: string; // e.g. "0.1"
    engine: string; // e.g. "mock" | "ocr+sam2"
    createdAt: string; // ISO
  };
};

export type AnalyzerElementType =
  | "dialogue"
  | "narration"
  | "free_text"
  | "sfx";

export type AnalyzerBBoxPct = { x: number; y: number; w: number; h: number }; // 0..1

export type AnalyzerPointPct = { x: number; y: number }; // 0..1

export type AnalyzerElement = {
  id: string;
  type: AnalyzerElementType;
  readingOrder?: number; // optional
  text: { raw: string };

  geometry: {
    bboxPct: AnalyzerBBoxPct;
    polygonPct?: AnalyzerPointPct[]; // optional for later
  };

  container?: {
    // IMPORTANT: svgPath is in IMAGE PIXEL COORDS, not pct.
    // We render it inside an SVG with viewBox = naturalWidth/naturalHeight.
    svgPath: string;
    viewBox: { w: number; h: number };
    bboxPct: AnalyzerBBoxPct;
    style?: { fill?: string; stroke?: string; strokeWidth?: number };
  };

  styleHints?: {
    textColor?: string;
    textStrokeColor?: string;
    textStrokeWidth?: number;
    plateColor?: string;
    plateOpacity?: number;
  };

  confidence?: number;
  flags?: { needsReview?: boolean };
};
export type AnalyzerChapterListItem = {
  chapterId: string;
  title?: string;
  pagesCount: number;
  createdAt: string; // ISO
};

export type AnalyzerChapterPageItem = {
  pageId: string;
  pageNumber: number;
  hasAnalysis: boolean;
  image: {
    src: string;
    naturalWidth: number;
    naturalHeight: number;
  };
};

export type AnalyzerChapterDetail = {
  chapterId: string;
  title?: string;
  createdAt: string; // ISO
  pages: AnalyzerChapterPageItem[];
  firstPageId: string;
};

export type AnalyzerChaptersListResponse = {
  items: AnalyzerChapterListItem[];
};
