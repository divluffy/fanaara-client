// app\creator\works\[workId]\chapters\[chapterId]\editor\_components\ElementsPanel.tsx
"use client";

import React, { useMemo, useState } from "react";
import { nanoid } from "nanoid";
import { EditorPageItem, PageAnnotationsDoc, PageElement } from "./types";
import { TEMPLATE_DEFAULT_STYLE } from "./templates";
import { bboxCenter, detectLang, dirForLang } from "./utils";

export default function ElementsPanel({
  page,
  selectedId,
  onSelect,
  onChangeDoc,
}: {
  page: EditorPageItem | null;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChangeDoc: (
    updater: (doc: PageAnnotationsDoc) => PageAnnotationsDoc,
  ) => void;
}) {
  const [showDeleted, setShowDeleted] = useState(false);

  const elements = useMemo(() => {
    if (!page?.annotations) return [];
    return page.annotations.elements.filter((e) =>
      showDeleted ? true : e.status !== "deleted",
    );
  }, [page, showDeleted]);

  function addElement(kind: PageElement["elementType"]) {
    if (!page?.annotations) return;

    const id = nanoid();
    const template_id =
      kind === "SPEECH"
        ? "bubble_ellipse"
        : kind === "THOUGHT"
          ? "bubble_cloud"
          : kind === "NARRATION"
            ? "narration_rect"
            : kind === "CAPTION"
              ? "caption_box"
              : kind === "SFX"
                ? "sfx_outline"
                : kind === "SIGNAGE"
                  ? "signage_label"
                  : kind === "SCENE_TEXT"
                    ? "scene_label"
                    : "plain_text";

    const style = TEMPLATE_DEFAULT_STYLE[template_id];

    onChangeDoc((doc) => {
      const container_bbox = { x: 0.35, y: 0.35, w: 0.3, h: 0.16 };
      const el: PageElement = {
        id,
        source: "user",
        status: "edited",
        elementType: kind,
        readingOrder: doc.elements.length + 1,
        confidence: 1,
        geometry: {
          container_bbox,
          anchor: bboxCenter(container_bbox),
        },
        container: {
          shape: template_id === "plain_text" ? "none" : "roundrect",
          template_id,
          params: { padding: 12, cornerRadius: 18 },
        },
        text: {
          original: "",
          translated: "",
          lang: "unknown",
          writingDirection: "LTR",
          sizeHint: "medium",
          styleHint: "normal",
        },
        style,
      };

      return {
        ...doc,
        elements: [...doc.elements, el],
        updatedAt: new Date().toISOString(),
      };
    });

    onSelect(id);

    
  }

  if (!page?.annotations) {
    return (
      <aside className="w-[320px] border-r p-3">
        <div className="text-sm text-gray-500">No page loaded.</div>
      </aside>
    );
  }

  return (
    <aside className="w-[320px] border-r p-3 flex flex-col gap-3">
      <div className="space-y-2">
        <div className="text-sm font-semibold">Tools</div>
        <div className="grid grid-cols-2 gap-2">
          <button
            className="px-2 py-2 rounded border"
            onClick={() => addElement("SPEECH")}
          >
            + Speech
          </button>
          <button
            className="px-2 py-2 rounded border"
            onClick={() => addElement("THOUGHT")}
          >
            + Thought
          </button>
          <button
            className="px-2 py-2 rounded border"
            onClick={() => addElement("NARRATION")}
          >
            + Narration
          </button>
          <button
            className="px-2 py-2 rounded border"
            onClick={() => addElement("CAPTION")}
          >
            + Caption
          </button>
          <button
            className="px-2 py-2 rounded border"
            onClick={() => addElement("SFX")}
          >
            + SFX
          </button>
          <button
            className="px-2 py-2 rounded border"
            onClick={() => addElement("SCENE_TEXT")}
          >
            + Scene Text
          </button>
          <button
            className="px-2 py-2 rounded border"
            onClick={() => addElement("SIGNAGE")}
          >
            + Signage
          </button>
          <button
            className="px-2 py-2 rounded border"
            onClick={() => addElement("UI_TEXT")}
          >
            + UI Text
          </button>
        </div>

        <label className="flex items-center gap-2 text-xs text-gray-600">
          <input
            type="checkbox"
            checked={showDeleted}
            onChange={(e) => setShowDeleted(e.target.checked)}
          />
          Show deleted
        </label>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="text-sm font-semibold mb-2">Elements</div>
        {elements.length === 0 ? (
          <div className="text-sm text-gray-500">No elements.</div>
        ) : (
          <div className="space-y-2">
            {elements.map((el) => (
              <div
                key={el.id}
                className={[
                  "border rounded p-2 cursor-pointer",
                  el.id === selectedId ? "ring-2 ring-black" : "",
                ].join(" ")}
                onClick={() => onSelect(el.id)}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-semibold">{el.elementType}</div>
                  <div className="text-[11px] text-gray-500">{el.status}</div>
                </div>
                <div className="text-xs text-gray-700 line-clamp-2 mt-1">
                  {el.text.original || "(empty)"}
                </div>

                <div className="flex gap-2 mt-2">
                  <button
                    className="text-xs px-2 py-1 rounded border"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeDoc((doc) => ({
                        ...doc,
                        elements: doc.elements.map((x) =>
                          x.id === el.id ? { ...x, status: "confirmed" } : x,
                        ),
                        updatedAt: new Date().toISOString(),
                      }));
                    }}
                  >
                    Confirm
                  </button>
                  <button
                    className="text-xs px-2 py-1 rounded border"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeDoc((doc) => ({
                        ...doc,
                        elements: doc.elements.map((x) =>
                          x.id === el.id ? { ...x, status: "deleted" } : x,
                        ),
                        updatedAt: new Date().toISOString(),
                      }));
                      if (selectedId === el.id) onSelect(null);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t pt-3 space-y-2">
        <div className="text-sm font-semibold">Page Meta</div>
        <div className="space-y-1">
          <div className="text-xs text-gray-500">
            Keywords (comma separated)
          </div>
          <input
            className="w-full border rounded px-2 py-2 text-sm"
            value={(page.annotations.meta.keywords ?? []).join(", ")}
            onChange={(e) => {
              const v = e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
                .slice(0, 40);
              onChangeDoc((doc) => ({
                ...doc,
                meta: { ...doc.meta, keywords: v },
                updatedAt: new Date().toISOString(),
              }));
            }}
          />
        </div>
        <div className="space-y-1">
          <div className="text-xs text-gray-500">Scene Description</div>
          <textarea
            className="w-full border rounded px-2 py-2 text-sm min-h-[70px]"
            value={page.annotations.meta.sceneDescription ?? ""}
            onChange={(e) => {
              onChangeDoc((doc) => ({
                ...doc,
                meta: { ...doc.meta, sceneDescription: e.target.value },
                updatedAt: new Date().toISOString(),
              }));
            }}
          />
        </div>
      </div>
    </aside>
  );
}
