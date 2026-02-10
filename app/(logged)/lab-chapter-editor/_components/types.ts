export type ElementType = "SPEECH" | "NARRATION" | "SFX" | "SCENE_TEXT";

export type TemplateId =
  | "bubble_ellipse"
  | "bubble_roundrect"
  | "bubble_cloud"
  | "bubble_shout"
  | "box_rect"
  | "box_roundrect"
  | "scene_label"
  | "sfx_tooltip"
  | "sfx_side_label";

export type ViewMode = "edit" | "preview";
export type LangMode = "original" | "translated";

export type TextDirection = "RTL" | "LTR" | "TTB";
export type TextLang = "ar" | "en" | "ja" | "ko" | "zh" | "unknown";

export interface NormalizedBBox {
  x: number; // 0..1
  y: number; // 0..1
  w: number; // 0..1
  h: number; // 0..1
}

export interface ElementStyle {
  fill: string; // css color
  stroke: string; // css color
  strokeWidth: number;
  opacity: number; // 0..1
  fontSize: number;
  align: "left" | "center" | "right";
  textColor?: string;
  textOpacity?: number;
  fontWeight?: "thin" | "light" | "normal" | "bold" | "black" | "unknown";

  outlineColor?: string | null;
  outlineWidth?: number | null;
  outlineOpacity?: number | null;

  shadowColor?: string | null;
  shadowBlur?: number | null;
  shadowOffsetX?: number | null;
  shadowOffsetY?: number | null;
  shadowOpacity?: number | null;

  backgroundColor?: string | null;
  backgroundOpacity?: number | null;
}

export interface ElementText {
  original: string;
  translated: string;
  lang: TextLang;
  direction: TextDirection;
}

export interface ElementDoc {
  id: string;
  type: ElementType;
  bbox: NormalizedBBox;
  rotation: number;
  templateId: TemplateId;
  templateParams: Record<string, any>;
  text: ElementText;
  style: ElementStyle;
}

export interface PageImage {
  name: string;
  url: string; // objectURL
  width: number;
  height: number;
}

export interface PageDoc {
  id: string;
  image: PageImage;
  elements: ElementDoc[];
}
