// app\creator\works\[workId]\chapters\[chapterId]\editor\_components\PropertiesPanel.tsx
"use client";

import React from "react";
import {
  PageAnnotationsDoc,
  PageElement,
  EditorPageItem,
  TemplateId,
} from "./types";
import { TEMPLATE_DEFAULT_STYLE, TEMPLATE_LABELS } from "./templates";
import { detectLang, dirForLang, markEdited } from "./utils";

export default function PropertiesPanel({
  page,
  selected,
  onChangeDoc,
}: {
  page: EditorPageItem | null;
  selected: PageElement | null;
  onChangeDoc: (
    updater: (doc: PageAnnotationsDoc) => PageAnnotationsDoc,
  ) => void;
}) {
  if (!page?.annotations) {
    return (
      <aside className="w-[340px] border-l p-3 text-sm text-gray-500">
        No page
      </aside>
    );
  }
  if (!selected) {
    return (
      <aside className="w-[340px] border-l p-3 text-sm text-gray-500">
        Select an element
      </aside>
    );
  }

  const el = selected;

  function patch(p: Partial<PageElement>) {
    onChangeDoc((doc) => ({
      ...doc,
      elements: doc.elements.map((x) =>
        x.id === el.id ? { ...markEdited(x), ...p } : x,
      ),
      updatedAt: new Date().toISOString(),
    }));
  }

  return (
    <aside className="w-[340px] border-l p-3 overflow-auto space-y-3">
      <div className="text-sm font-semibold">Properties</div>

      <div className="text-xs text-gray-500">
        Status: {el.status} • Source: {el.source} • Confidence:{" "}
        {el.confidence.toFixed(2)}
      </div>

      <div className="space-y-1">
        <div className="text-xs text-gray-500">Template</div>
        <select
          className="w-full border rounded px-2 py-2"
          value={el.container.template_id}
          onChange={(e) => {
            const t = e.target.value as TemplateId;
            patch({
              container: { ...el.container, template_id: t },
              style: { ...TEMPLATE_DEFAULT_STYLE[t] },
            });
          }}
        >
          {Object.entries(TEMPLATE_LABELS).map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <div className="text-xs text-gray-500">Fill</div>
          <input
            className="w-full h-10"
            type="color"
            value={(el.style.fill || "#ffffff").slice(0, 7)}
            onChange={(e) =>
              patch({ style: { ...el.style, fill: e.target.value } })
            }
          />
        </div>
        <div className="space-y-1">
          <div className="text-xs text-gray-500">Stroke</div>
          <input
            className="w-full h-10"
            type="color"
            value={(el.style.stroke || "#000000").slice(0, 7)}
            onChange={(e) =>
              patch({ style: { ...el.style, stroke: e.target.value } })
            }
          />
        </div>
        <div className="space-y-1">
          <div className="text-xs text-gray-500">Stroke Width</div>
          <input
            className="w-full border rounded px-2 py-2"
            type="number"
            value={el.style.strokeWidth}
            min={0}
            onChange={(e) =>
              patch({
                style: {
                  ...el.style,
                  strokeWidth: Number(e.target.value || 0),
                },
              })
            }
          />
        </div>
        <div className="space-y-1">
          <div className="text-xs text-gray-500">Font Size</div>
          <input
            className="w-full border rounded px-2 py-2"
            type="number"
            value={el.style.fontSize}
            min={8}
            onChange={(e) =>
              patch({
                style: { ...el.style, fontSize: Number(e.target.value || 16) },
              })
            }
          />
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-xs text-gray-500">Text (original)</div>
        <textarea
          className="w-full border rounded px-2 py-2 min-h-[100px]"
          value={el.text.original}
          onChange={(e) => {
            const original = e.target.value;
            const lang = detectLang(original);
            patch({
              text: {
                ...el.text,
                original,
                lang,
                writingDirection: dirForLang(lang),
              },
            });
          }}
        />
      </div>

      <div className="space-y-1">
        <div className="text-xs text-gray-500">Text (translated)</div>
        <textarea
          className="w-full border rounded px-2 py-2 min-h-[100px]"
          value={el.text.translated ?? ""}
          onChange={(e) =>
            patch({ text: { ...el.text, translated: e.target.value } })
          }
        />
      </div>

      <div className="text-xs text-gray-500">
        container_bbox: x={el.geometry.container_bbox.x.toFixed(3)} y=
        {el.geometry.container_bbox.y.toFixed(3)} w=
        {el.geometry.container_bbox.w.toFixed(3)} h=
        {el.geometry.container_bbox.h.toFixed(3)}
      </div>
    </aside>
  );
}
