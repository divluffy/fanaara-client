import { ElementStyle, TemplateId, ElementType } from "./types";

export interface TemplateDef {
  id: TemplateId;
  label: string;
  allowedTypes: ElementType[];
  defaultParams: Record<string, any>;
  defaultStyle: ElementStyle;
}

export const DEFAULT_STYLE: ElementStyle = {
  fill: "#ffffff",
  stroke: "#000000",
  strokeWidth: 2,
  opacity: 1,
  fontSize: 22,
  align: "center",
};

export const TEMPLATE_CATALOG: Record<TemplateId, TemplateDef> = {
  bubble_ellipse: {
    id: "bubble_ellipse",
    label: "Speech • Ellipse",
    allowedTypes: ["SPEECH"],
    defaultParams: { padding: 12 },
    defaultStyle: { ...DEFAULT_STYLE },
  },
  bubble_roundrect: {
    id: "bubble_roundrect",
    label: "Speech • RoundRect",
    allowedTypes: ["SPEECH"],
    defaultParams: { padding: 12, cornerRadius: 18 },
    defaultStyle: { ...DEFAULT_STYLE },
  },
  bubble_cloud: {
    id: "bubble_cloud",
    label: "Thought • Cloud (basic)",
    allowedTypes: ["SPEECH"],
    defaultParams: { padding: 12 },
    defaultStyle: { ...DEFAULT_STYLE },
  },
  bubble_shout: {
    id: "bubble_shout",
    label: "Shout • Burst (basic)",
    allowedTypes: ["SPEECH"],
    defaultParams: { padding: 10, spikes: 10 },
    defaultStyle: { ...DEFAULT_STYLE },
  },
  box_rect: {
    id: "box_rect",
    label: "Narration • Rect",
    allowedTypes: ["NARRATION"],
    defaultParams: { padding: 10 },
    defaultStyle: { ...DEFAULT_STYLE, fill: "#f7f7f7" },
  },
  box_roundrect: {
    id: "box_roundrect",
    label: "Narration • RoundRect",
    allowedTypes: ["NARRATION"],
    defaultParams: { padding: 10, cornerRadius: 14 },
    defaultStyle: { ...DEFAULT_STYLE, fill: "#f7f7f7" },
  },
  scene_label: {
    id: "scene_label",
    label: "Scene Text • Label",
    allowedTypes: ["SCENE_TEXT"],
    defaultParams: { padding: 8 },
    defaultStyle: { ...DEFAULT_STYLE, fill: "#ffffffcc" }, // semi-transparent
  },
  sfx_tooltip: {
    id: "sfx_tooltip",
    label: "SFX • Tooltip",
    allowedTypes: ["SFX"],
    defaultParams: { mode: "tooltip" },
    defaultStyle: { ...DEFAULT_STYLE, fill: "#00000000", stroke: "#ff00ff" },
  },
  sfx_side_label: {
    id: "sfx_side_label",
    label: "SFX • Side Label",
    allowedTypes: ["SFX"],
    defaultParams: { mode: "side_label" },
    defaultStyle: { ...DEFAULT_STYLE, fill: "#ffffff" },
  },
};

export function getDefaultTemplateForType(type: ElementType): TemplateId {
  switch (type) {
    case "SPEECH":
      return "bubble_ellipse";
    case "NARRATION":
      return "box_rect";
    case "SCENE_TEXT":
      return "scene_label";
    case "SFX":
      return "sfx_tooltip";
  }
}
