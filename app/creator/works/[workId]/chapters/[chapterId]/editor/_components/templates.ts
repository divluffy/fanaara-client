// app\creator\works\[workId]\chapters\[chapterId]\editor\_components\templates.ts
import { ElementStyle, TemplateId } from "./types";

export const TEMPLATE_DEFAULT_STYLE: Record<TemplateId, ElementStyle> = {
  bubble_ellipse: {
    fill: "#ffffff",
    stroke: "#111111",
    strokeWidth: 2,
    opacity: 1,
    fontSize: 22,
    align: "center",
  },
  bubble_roundrect: {
    fill: "#ffffff",
    stroke: "#111111",
    strokeWidth: 2,
    opacity: 1,
    fontSize: 22,
    align: "center",
  },
  bubble_cloud: {
    fill: "#ffffff",
    stroke: "#111111",
    strokeWidth: 2,
    opacity: 1,
    fontSize: 22,
    align: "center",
  },
  bubble_burst: {
    fill: "#ffffff",
    stroke: "#111111",
    strokeWidth: 2,
    opacity: 1,
    fontSize: 22,
    align: "center",
  },

  narration_rect: {
    fill: "#f7f7f7",
    stroke: "#111111",
    strokeWidth: 2,
    opacity: 1,
    fontSize: 20,
    align: "center",
  },
  narration_roundrect: {
    fill: "#f7f7f7",
    stroke: "#111111",
    strokeWidth: 2,
    opacity: 1,
    fontSize: 20,
    align: "center",
  },
  caption_box: {
    fill: "#f7f7f7",
    stroke: "#111111",
    strokeWidth: 2,
    opacity: 1,
    fontSize: 20,
    align: "center",
  },

  scene_label: {
    fill: "#ffffffcc",
    stroke: "#111111",
    strokeWidth: 1,
    opacity: 1,
    fontSize: 18,
    align: "center",
  },
  signage_label: {
    fill: "#ffffffcc",
    stroke: "#111111",
    strokeWidth: 1,
    opacity: 1,
    fontSize: 18,
    align: "center",
  },

  sfx_burst: {
    fill: "#00000000",
    stroke: "#ff00ff",
    strokeWidth: 2,
    opacity: 1,
    fontSize: 26,
    align: "center",
  },
  sfx_outline: {
    fill: "#00000000",
    stroke: "#ff00ff",
    strokeWidth: 2,
    opacity: 1,
    fontSize: 26,
    align: "center",
  },

  plain_text: {
    fill: "#00000000",
    stroke: "#00ff00",
    strokeWidth: 0,
    opacity: 1,
    fontSize: 20,
    align: "center",
  },
};

export const TEMPLATE_LABELS: Record<TemplateId, string> = {
  bubble_ellipse: "Speech • Ellipse",
  bubble_roundrect: "Speech • RoundRect",
  bubble_cloud: "Thought • Cloud",
  bubble_burst: "Speech • Burst",
  narration_rect: "Narration • Rect",
  narration_roundrect: "Narration • RoundRect",
  caption_box: "Caption • Box",
  scene_label: "Scene Text • Label",
  signage_label: "Signage • Label",
  sfx_burst: "SFX • Burst",
  sfx_outline: "SFX • Outline",
  plain_text: "Plain Text",
};
