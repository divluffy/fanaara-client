// app\creator\works\[workId]\chapters\[chapterId]\editor\_components\PropertiesPanel.tsx
"use client";

import React, { useMemo } from "react";
import type {
  PageAnnotationsDoc,
  PageElement,
  EditorPageItem,
  TemplateId,
  WritingDirection,
} from "./types";

import { TEMPLATE_DEFAULT_STYLE, TEMPLATE_LABELS } from "./templates";
import { autoFitFontSize, detectLang, dirForLang, normToPxBBox } from "./utils";
import { cn } from "./ui/cn";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

function safeNum(v: any, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export default function PropertiesPanel({
  page,
  selected,
  onSelect,
  onChangeDoc,
}: {
  page: EditorPageItem | null;
  selected: PageElement | null;
  onSelect: (id: string | null) => void;
  onChangeDoc: (
    updater: (doc: PageAnnotationsDoc) => PageAnnotationsDoc,
  ) => void;
}) {
  if (!page?.annotations) {
    return (
      <aside className="w-[420px] border-l bg-white p-4 text-sm text-zinc-500">
        No page
      </aside>
    );
  }

  if (!selected) {
    return (
      <aside className="w-[420px] border-l bg-white p-4 text-sm text-zinc-500">
        Select an element
      </aside>
    );
  }

  const el = selected;
  const imgW = page.image.width;
  const imgH = page.image.height;

  function patchElement(id: string, fn: (x: PageElement) => PageElement) {
    onChangeDoc((doc) => ({
      ...doc,
      elements: doc.elements.map((x) => (x.id === id ? fn(x) : x)),
      updatedAt: new Date().toISOString(),
    }));
  }

  // content changes should mark edited
  function patchContent(p: Partial<PageElement>) {
    patchElement(el.id, (x) => ({
      ...x,
      ...p,
      status: x.status === "deleted" ? x.status : "edited",
    }));
  }

  // meta/UI changes shouldn't flip status
  function patchMeta(p: Partial<PageElement>) {
    patchElement(el.id, (x) => ({ ...x, ...p }));
  }

  const padding = safeNum(el.container.params?.padding, 12);
  const bboxPx = normToPxBBox(el.geometry.container_bbox, imgW, imgH);
  const innerW = Math.max(1, bboxPx.w - padding * 2);
  const innerH = Math.max(1, bboxPx.h - padding * 2);

  function autoFit(field: "original" | "translated") {
    const text =
      (field === "original" ? el.text.original : el.text.translated) ?? "";
    const nextFont = autoFitFontSize({
      text,
      widthPx: innerW,
      heightPx: innerH,
      fontFamily: el.style.fontFamily ?? "Arial",
      fontStyle: el.style.fontStyle ?? "normal",
      lineHeight: el.style.lineHeight ?? 1.2,
      maxFontSize: el.style.fontSize,
      minFontSize: 8,
      writingDirection: el.text.writingDirection,
    });

    patchContent({ style: { ...el.style, fontSize: nextFont } });
  }

  const meta = useMemo(() => {
    return {
      px: bboxPx,
      lang: el.text.lang,
      dir: el.text.writingDirection,
    };
  }, [bboxPx, el.text.lang, el.text.writingDirection]);

  return (
    <aside className="w-[420px] border-l bg-white min-h-0 flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-zinc-900 truncate">
              #{el.readingOrder} • {el.elementType}
            </div>
            <div className="mt-1 flex items-center gap-2 flex-wrap">
              <Badge variant="neutral">source: {el.source}</Badge>
              <Badge
                variant={
                  el.status === "confirmed"
                    ? "success"
                    : el.status === "needs_review"
                      ? "danger"
                      : "neutral"
                }
              >
                {el.status}
              </Badge>
              <Badge variant="info">conf {el.confidence.toFixed(2)}</Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => patchMeta({ locked: !el.locked })}
            >
              {el.locked ? "Unlock" : "Lock"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => patchMeta({ hidden: !el.hidden })}
            >
              {el.hidden ? "Show" : "Hide"}
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                patchMeta({ status: "deleted" as any });
                onSelect(null);
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto p-4 space-y-3">
        {/* Workflow */}
        <Section title="Workflow">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <div className="text-xs text-zinc-500">Status</div>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                value={el.status}
                onChange={(e) => patchMeta({ status: e.target.value as any })}
              >
                <option value="detected">detected</option>
                <option value="edited">edited</option>
                <option value="confirmed">confirmed</option>
                <option value="needs_review">needs_review</option>
                <option value="deleted">deleted</option>
              </select>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-zinc-500">Reading Order</div>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                type="number"
                min={1}
                value={el.readingOrder}
                onChange={(e) =>
                  patchMeta({ readingOrder: Number(e.target.value || 1) })
                }
              />
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap mt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => patchMeta({ status: "confirmed" })}
            >
              Confirm
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => patchMeta({ status: "needs_review" })}
            >
              Needs review
            </Button>
          </div>
        </Section>

        {/* Template */}
        <Section title="Template">
          <div className="flex gap-2">
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
              value={el.container.template_id}
              onChange={(e) => {
                const t = e.target.value as TemplateId;
                patchContent({
                  container: { ...el.container, template_id: t },
                  style: { ...TEMPLATE_DEFAULT_STYLE[t], ...el.style },
                });
              }}
            >
              {Object.entries(TEMPLATE_LABELS).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              onClick={() => {
                const t = el.container.template_id;
                patchContent({ style: { ...TEMPLATE_DEFAULT_STYLE[t] } });
              }}
            >
              Reset
            </Button>
          </div>
        </Section>

        {/* Container */}
        <Section title="Container">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Fill">
              <input
                className="w-full h-10"
                type="color"
                value={(el.style.fill || "#ffffff").slice(0, 7)}
                onChange={(e) =>
                  patchContent({ style: { ...el.style, fill: e.target.value } })
                }
              />
            </Field>

            <Field label="Stroke">
              <input
                className="w-full h-10"
                type="color"
                value={(el.style.stroke || "#000000").slice(0, 7)}
                onChange={(e) =>
                  patchContent({
                    style: { ...el.style, stroke: e.target.value },
                  })
                }
              />
            </Field>

            <Field label="Stroke width">
              <input
                className="w-full"
                type="range"
                min={0}
                max={10}
                step={0.5}
                value={el.style.strokeWidth}
                onChange={(e) =>
                  patchContent({
                    style: {
                      ...el.style,
                      strokeWidth: Number(e.target.value || 0),
                    },
                  })
                }
              />
              <div className="text-[11px] text-zinc-500">
                {el.style.strokeWidth}px
              </div>
            </Field>

            <Field label="Opacity">
              <input
                className="w-full"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={el.style.opacity}
                onChange={(e) =>
                  patchContent({
                    style: {
                      ...el.style,
                      opacity: Number(e.target.value || 1),
                    },
                  })
                }
              />
              <div className="text-[11px] text-zinc-500">
                {el.style.opacity}
              </div>
            </Field>

            <Field label="Padding">
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                type="number"
                min={0}
                value={safeNum(el.container.params?.padding, 12)}
                onChange={(e) => {
                  const v = Number(e.target.value || 0);
                  patchContent({
                    container: {
                      ...el.container,
                      params: { ...(el.container.params ?? {}), padding: v },
                    },
                  });
                }}
              />
            </Field>

            <Field label="Corner radius">
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                type="number"
                min={0}
                value={safeNum(el.container.params?.cornerRadius, 18)}
                onChange={(e) => {
                  const v = Number(e.target.value || 0);
                  patchContent({
                    container: {
                      ...el.container,
                      params: {
                        ...(el.container.params ?? {}),
                        cornerRadius: v,
                      },
                    },
                  });
                }}
              />
            </Field>

            <Field label="Spikes (burst)">
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                type="number"
                min={3}
                max={32}
                value={safeNum(el.container.params?.spikes, 10)}
                onChange={(e) => {
                  const v = Number(e.target.value || 10);
                  patchContent({
                    container: {
                      ...el.container,
                      params: { ...(el.container.params ?? {}), spikes: v },
                    },
                  });
                }}
              />
            </Field>

            <Field label="Tail enabled">
              <label className="flex items-center gap-2 border rounded-lg px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!el.container.params?.tailEnabled}
                  onChange={(e) =>
                    patchContent({
                      container: {
                        ...el.container,
                        params: {
                          ...(el.container.params ?? {}),
                          tailEnabled: e.target.checked,
                        },
                      },
                    })
                  }
                />
                tail
              </label>
            </Field>
          </div>
        </Section>

        {/* Text */}
        <Section title="Text">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Font size">
              <input
                className="w-full"
                type="range"
                min={8}
                max={80}
                step={1}
                value={el.style.fontSize}
                onChange={(e) =>
                  patchContent({
                    style: {
                      ...el.style,
                      fontSize: Number(e.target.value || 16),
                    },
                  })
                }
              />
              <div className="text-[11px] text-zinc-500">
                {el.style.fontSize}px
              </div>
            </Field>

            <Field label="Align">
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                value={el.style.align}
                onChange={(e) =>
                  patchContent({
                    style: { ...el.style, align: e.target.value as any },
                  })
                }
              >
                <option value="left">left</option>
                <option value="center">center</option>
                <option value="right">right</option>
              </select>
            </Field>

            <Field label="Font family">
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={el.style.fontFamily ?? "Arial"}
                onChange={(e) =>
                  patchContent({
                    style: { ...el.style, fontFamily: e.target.value },
                  })
                }
              />
            </Field>

            <Field label="Font style">
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                value={el.style.fontStyle ?? "normal"}
                onChange={(e) =>
                  patchContent({
                    style: { ...el.style, fontStyle: e.target.value as any },
                  })
                }
              >
                <option value="normal">normal</option>
                <option value="bold">bold</option>
                <option value="italic">italic</option>
                <option value="bold italic">bold italic</option>
              </select>
            </Field>

            <Field label="Line height">
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                type="number"
                step={0.05}
                value={el.style.lineHeight ?? 1.2}
                onChange={(e) =>
                  patchContent({
                    style: {
                      ...el.style,
                      lineHeight: Number(e.target.value || 1.2),
                    },
                  })
                }
              />
            </Field>

            <Field label="Letter spacing">
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                type="number"
                step={0.5}
                value={el.style.letterSpacing ?? 0}
                onChange={(e) =>
                  patchContent({
                    style: {
                      ...el.style,
                      letterSpacing: Number(e.target.value || 0),
                    },
                  })
                }
              />
            </Field>

            <Field label="Text fill">
              <input
                className="w-full h-10"
                type="color"
                value={(el.style.textFill ?? "#111111").slice(0, 7)}
                onChange={(e) =>
                  patchContent({
                    style: { ...el.style, textFill: e.target.value },
                  })
                }
              />
            </Field>

            <Field label="Text stroke">
              <input
                className="w-full h-10"
                type="color"
                value={(el.style.textStroke ?? "#000000").slice(0, 7)}
                onChange={(e) =>
                  patchContent({
                    style: { ...el.style, textStroke: e.target.value },
                  })
                }
              />
            </Field>

            <Field label="Text stroke width">
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                type="number"
                min={0}
                value={el.style.textStrokeWidth ?? 0}
                onChange={(e) =>
                  patchContent({
                    style: {
                      ...el.style,
                      textStrokeWidth: Number(e.target.value || 0),
                    },
                  })
                }
              />
            </Field>

            <Field label="Text rotation (deg)">
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                type="number"
                value={el.style.textRotation ?? 0}
                onChange={(e) =>
                  patchContent({
                    style: {
                      ...el.style,
                      textRotation: Number(e.target.value || 0),
                    },
                  })
                }
              />
            </Field>
          </div>

          <div className="mt-3 grid gap-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs text-zinc-500">Writing direction</div>
              <select
                className="border rounded-lg px-3 py-2 text-sm bg-white"
                value={el.text.writingDirection}
                onChange={(e) =>
                  patchContent({
                    text: {
                      ...el.text,
                      writingDirection: e.target.value as WritingDirection,
                    },
                  })
                }
              >
                <option value="LTR">LTR</option>
                <option value="RTL">RTL</option>
                <option value="TTB">TTB</option>
              </select>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={() => autoFit("original")}
              >
                Auto-fit Original
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => autoFit("translated")}
              >
                Auto-fit Translated
              </Button>
            </div>
          </div>
        </Section>

        {/* Text content */}
        <Section title="Content">
          <div className="space-y-2">
            <div className="text-xs text-zinc-500">Text (original)</div>
            <textarea
              className="w-full border rounded-xl px-3 py-2 min-h-[90px] text-sm"
              value={el.text.original}
              onChange={(e) => {
                const original = e.target.value;
                const lang = detectLang(original);
                patchContent({
                  text: {
                    ...el.text,
                    original,
                    lang,
                    writingDirection: dirForLang(lang),
                  },
                });
              }}
            />

            <div className="text-xs text-zinc-500">Text (translated)</div>
            <textarea
              className="w-full border rounded-xl px-3 py-2 min-h-[90px] text-sm"
              value={el.text.translated ?? ""}
              onChange={(e) =>
                patchContent({
                  text: { ...el.text, translated: e.target.value },
                })
              }
            />
          </div>
        </Section>

        {/* Notes */}
        <Section title="Notes">
          <textarea
            className="w-full border rounded-xl px-3 py-2 min-h-[80px] text-sm"
            value={el.notes ?? ""}
            onChange={(e) => patchMeta({ notes: e.target.value })}
          />
        </Section>

        {/* Debug */}
        <Section title="Geometry">
          <div className="text-xs text-zinc-600">
            container_bbox: x={el.geometry.container_bbox.x.toFixed(3)} y=
            {el.geometry.container_bbox.y.toFixed(3)} w=
            {el.geometry.container_bbox.w.toFixed(3)} h=
            {el.geometry.container_bbox.h.toFixed(3)}
          </div>

          <div className="mt-2 text-xs text-zinc-500">
            px: x={meta.px.x.toFixed(0)} y={meta.px.y.toFixed(0)} w=
            {meta.px.w.toFixed(0)} h={meta.px.h.toFixed(0)}
          </div>
        </Section>
      </div>
    </aside>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <details
      className="rounded-2xl border bg-white shadow-sm overflow-hidden"
      open
    >
      <summary className="cursor-pointer select-none px-4 py-3 border-b bg-zinc-50 flex items-center justify-between">
        <span className="text-sm font-semibold text-zinc-900">{title}</span>
        <span className="text-xs text-zinc-500">toggle</span>
      </summary>
      <div className="p-4">{children}</div>
    </details>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="text-xs text-zinc-500">{label}</div>
      {children}
    </div>
  );
}
