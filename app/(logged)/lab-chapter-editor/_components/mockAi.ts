import { nanoid } from "nanoid";
import { PageDoc, ElementDoc } from "./types";
import { DEFAULT_STYLE, getDefaultTemplateForType } from "./templates";
import { detectLang, directionForLang } from "./utils";

export function mockAnalyzePage(page: PageDoc): PageDoc {
  // عناصر افتراضية فقط لاختبار الـ UX بسرعة
  const mk = (partial: Partial<ElementDoc>): ElementDoc => {
    const original = partial.text?.original ?? "";
    const lang = detectLang(original);
    return {
      id: nanoid(),
      type: partial.type ?? "SPEECH",
      bbox: partial.bbox ?? { x: 0.3, y: 0.3, w: 0.4, h: 0.18 },
      rotation: 0,
      templateId: partial.templateId ?? getDefaultTemplateForType(partial.type ?? "SPEECH"),
      templateParams: partial.templateParams ?? { padding: 12, cornerRadius: 18 },
      text: {
        original,
        translated: "",
        lang,
        direction: directionForLang(lang),
      },
      style: partial.style ?? { ...DEFAULT_STYLE },
    };
  };

  const suggested: ElementDoc[] = [
    mk({
      type: "SPEECH",
      bbox: { x: 0.55, y: 0.12, w: 0.35, h: 0.18 },
      templateId: "bubble_ellipse",
      text: { original: "أين كنت؟", translated: "", lang: "ar", direction: "RTL" } as any,
    }),
    mk({
      type: "NARRATION",
      bbox: { x: 0.08, y: 0.08, w: 0.35, h: 0.12 },
      templateId: "box_rect",
      text: { original: "في اليوم التالي...", translated: "", lang: "ar", direction: "RTL" } as any,
      style: { ...DEFAULT_STYLE, fill: "#f7f7f7" },
    }),
    mk({
      type: "SFX",
      bbox: { x: 0.12, y: 0.68, w: 0.22, h: 0.14 },
      templateId: "sfx_tooltip",
      text: { original: "BOOM!", translated: "", lang: "en", direction: "LTR" } as any,
      style: { ...DEFAULT_STYLE, stroke: "#ff00ff", fill: "#00000000" },
    }),
  ];

  return {
    ...page,
    elements: suggested,
  };
}
