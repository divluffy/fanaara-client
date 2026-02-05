"use client";

import { TEMPLATE_CATALOG } from "./templates";
import { ElementDoc, ElementType, LangMode, PageDoc, TemplateId } from "./types";
import { detectLang, directionForLang, mockTranslate } from "./utils";

export default function PropertiesPanel({
  page,
  selected,
  langMode,
  onUpdate,
}: {
  page: PageDoc | null;
  selected: ElementDoc | null;
  langMode: LangMode;
  onUpdate: (patch: Partial<ElementDoc>) => void;
}) {
  if (!page || !selected) {
    return (
      <aside className="w-[320px] border-l p-3">
        <div className="text-sm text-gray-500">Select an element to edit its properties.</div>
      </aside>
    );
  }

  const templateDef = TEMPLATE_CATALOG[selected.templateId];

  return (
    <aside className="w-[320px] border-l p-3 space-y-3 overflow-auto">
      <div className="text-sm font-semibold">Properties</div>

      <div className="space-y-1">
        <div className="text-xs text-gray-500">Type</div>
        <select
          className="w-full border rounded px-2 py-2"
          value={selected.type}
          onChange={(e) => onUpdate({ type: e.target.value as ElementType })}
        >
          <option value="SPEECH">SPEECH</option>
          <option value="NARRATION">NARRATION</option>
          <option value="SCENE_TEXT">SCENE_TEXT</option>
          <option value="SFX">SFX</option>
        </select>
      </div>

      <div className="space-y-1">
        <div className="text-xs text-gray-500">Template</div>
        <select
          className="w-full border rounded px-2 py-2"
          value={selected.templateId}
          onChange={(e) => {
            const next = e.target.value as TemplateId;
            const def = TEMPLATE_CATALOG[next];
            onUpdate({
              templateId: next,
              templateParams: { ...def.defaultParams },
              style: { ...selected.style }, // keep current style by default
            });
          }}
        >
          {Object.values(TEMPLATE_CATALOG).map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        <div className="text-[11px] text-gray-500">
          Allowed: {templateDef.allowedTypes.join(", ")}
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-xs text-gray-500">Text (Original)</div>
        <textarea
          className="w-full border rounded px-2 py-2 min-h-[90px]"
          value={selected.text.original}
          onChange={(e) => {
            const original = e.target.value;
            const lang = detectLang(original);
            onUpdate({
              text: {
                ...selected.text,
                original,
                lang,
                direction: directionForLang(lang),
                translated: selected.text.translated,
              },
            });
          }}
        />
      </div>

      <div className="space-y-1">
        <div className="text-xs text-gray-500">Text (Translated)</div>
        <textarea
          className="w-full border rounded px-2 py-2 min-h-[90px]"
          value={selected.text.translated}
          placeholder={mockTranslate(selected.text.original, selected.text.lang)}
          onChange={(e) => {
            onUpdate({
              text: { ...selected.text, translated: e.target.value },
            });
          }}
        />
        <div className="text-[11px] text-gray-500">
          Preview uses:{" "}
          {langMode === "translated"
            ? "translated (or mock if empty)"
            : "original"}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <div className="text-xs text-gray-500">Fill</div>
          <input
            className="w-full h-10"
            type="color"
            value={normalizeColor(selected.style.fill)}
            onChange={(e) => onUpdate({ style: { ...selected.style, fill: e.target.value } })}
          />
        </div>
        <div className="space-y-1">
          <div className="text-xs text-gray-500">Stroke</div>
          <input
            className="w-full h-10"
            type="color"
            value={normalizeColor(selected.style.stroke)}
            onChange={(e) => onUpdate({ style: { ...selected.style, stroke: e.target.value } })}
          />
        </div>

        <div className="space-y-1">
          <div className="text-xs text-gray-500">StrokeWidth</div>
          <input
            className="w-full border rounded px-2 py-2"
            type="number"
            value={selected.style.strokeWidth}
            min={0}
            step={1}
            onChange={(e) =>
              onUpdate({ style: { ...selected.style, strokeWidth: Number(e.target.value || 0) } })
            }
          />
        </div>
        <div className="space-y-1">
          <div className="text-xs text-gray-500">Opacity</div>
          <input
            className="w-full border rounded px-2 py-2"
            type="number"
            value={selected.style.opacity}
            min={0}
            max={1}
            step={0.05}
            onChange={(e) =>
              onUpdate({ style: { ...selected.style, opacity: Number(e.target.value || 1) } })
            }
          />
        </div>

        <div className="space-y-1">
          <div className="text-xs text-gray-500">FontSize</div>
          <input
            className="w-full border rounded px-2 py-2"
            type="number"
            value={selected.style.fontSize}
            min={8}
            step={1}
            onChange={(e) =>
              onUpdate({ style: { ...selected.style, fontSize: Number(e.target.value || 18) } })
            }
          />
        </div>

        <div className="space-y-1">
          <div className="text-xs text-gray-500">Align</div>
          <select
            className="w-full border rounded px-2 py-2"
            value={selected.style.align}
            onChange={(e) =>
              onUpdate({ style: { ...selected.style, align: e.target.value as any } })
            }
          >
            <option value="left">left</option>
            <option value="center">center</option>
            <option value="right">right</option>
          </select>
        </div>
      </div>

      <div className="text-xs text-gray-500">
        BBox (normalized): x={selected.bbox.x.toFixed(3)}, y={selected.bbox.y.toFixed(3)}, w=
        {selected.bbox.w.toFixed(3)}, h={selected.bbox.h.toFixed(3)}
      </div>
    </aside>
  );
}

function normalizeColor(v: string) {
  // handle "#ffffffcc" -> use first 7 chars for <input type="color">
  if (typeof v !== "string") return "#000000";
  if (v.startsWith("#") && v.length >= 7) return v.slice(0, 7);
  return "#000000";
}
