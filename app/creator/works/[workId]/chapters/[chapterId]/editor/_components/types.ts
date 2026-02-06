// app\creator\works\[workId]\chapters\[chapterId]\editor\_components\types.ts
export type TextLang = "ar" | "en" | "ja" | "ko" | "zh" | "unknown";
export type WritingDirection = "RTL" | "LTR" | "TTB";

export type ElementSource = "ai" | "user";
export type ElementStatus =
  | "detected"
  | "edited"
  | "confirmed"
  | "deleted"
  | "needs_review";

export type ElementType =
  | "SPEECH"
  | "THOUGHT"
  | "NARRATION"
  | "CAPTION"
  | "SFX"
  | "SCENE_TEXT"
  | "SIGNAGE"
  | "UI_TEXT";

export type ContainerShape =
  | "ellipse"
  | "roundrect"
  | "rect"
  | "cloud"
  | "burst"
  | "none";

export type TemplateId =
  | "bubble_ellipse"
  | "bubble_roundrect"
  | "bubble_cloud"
  | "bubble_burst"
  | "narration_rect"
  | "narration_roundrect"
  | "caption_box"
  | "scene_label"
  | "signage_label"
  | "sfx_burst"
  | "sfx_outline"
  | "plain_text";

export interface NormalizedBBox {
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface NormalizedPoint {
  x: number;
  y: number;
}

export interface ElementGeometry {
  container_bbox: NormalizedBBox;
  text_bbox?: NormalizedBBox;

  anchor: NormalizedPoint;

  tailTip?: NormalizedPoint;

  rotation?: number; // degrees
}

export interface ContainerInfo {
  shape: ContainerShape;
  template_id: TemplateId;
  params: Record<string, any>;
}

export interface TextInfo {
  original: string;
  translated?: string;
  lang: TextLang;
  writingDirection: WritingDirection;
  sizeHint: "small" | "medium" | "large";
  styleHint:
    | "normal"
    | "bold"
    | "outlined"
    | "shadowed"
    | "handwritten"
    | "distorted"
    | "3d"
    | "gradient"
    | "none";
}

export interface TextShadowStyle {
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
  opacity: number;
}

export interface ElementStyle {
  // container
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;

  // text
  fontSize: number;
  align: "left" | "center" | "right";
  fontFamily?: string;
  fontStyle?: "normal" | "bold" | "italic" | "bold italic";
  lineHeight?: number;
  letterSpacing?: number;
  textFill?: string;
  textStroke?: string;
  textStrokeWidth?: number;
  textShadow?: TextShadowStyle;
  textRotation?: number;

  // ✅ NEW
  fontSizeMode?: "auto" | "manual";
}

export interface PageElement {
  id: string;
  source: ElementSource;
  status: ElementStatus;
  elementType: ElementType;
  readingOrder: number;
  confidence: number;

  geometry: ElementGeometry;
  container: ContainerInfo;
  text: TextInfo;
  style: ElementStyle;

  locked?: boolean;
  hidden?: boolean;
  notes?: string;
}

export interface PageMeta {
  keywords: string[];
  sceneDescription: string;
  languageHint: TextLang;
}

export interface PageAnnotationsDoc {
  version: 1;
  pageId: string;
  meta: PageMeta;
  elements: PageElement[];
  updatedAt: string;
}

export interface EditorPageItem {
  id: string;
  orderIndex: number;
  image: {
    url: string;
    width: number;
    height: number;
    originalFilename: string;
    s3Key: string;
  };
  analysis: any | null;
  annotations: PageAnnotationsDoc | null;
}

export interface EditorPayload {
  work: {
    id: string;
    title: string;
    workType: string;
    artStyleCategory: string;
  };
  chapter: { id: string; title: string; number: number | null };
  pages: EditorPageItem[];
}

export type ViewMode = "edit" | "preview";
export type LangMode = "original" | "translated";
