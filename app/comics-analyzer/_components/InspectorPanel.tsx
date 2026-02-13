"use client";

import type {
  AnalyzerBBoxPct,
  AnalyzerElement,
  AnalyzerElementType,
  AnalyzerPageJson,
} from "../types";

function numOrUndef(v: string): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

export default function InspectorPanel({
  loadingLocal,
  pageJson,
  selectedId,
  selectedElement,
  onSelect,
  onAddElement,
  onDeleteSelected,
  onUpdatePageMeta,
  onUpdateSelectedText,
  onUpdateSelectedType,
  onUpdateSelectedReadingOrder,
  onUpdateSelectedNeedsReview,
  onUpdateSelectedBBox,
}: {
  loadingLocal: boolean;
  pageJson: AnalyzerPageJson | null;
  selectedId: string | null;
  selectedElement: AnalyzerElement | null;
  onSelect: (id: string | null) => void;
  onAddElement: (type: AnalyzerElementType) => void;
  onDeleteSelected: () => void;
  onUpdatePageMeta: (
    patch: Partial<
      Pick<AnalyzerPageJson, "title" | "description" | "keywords">
    >,
  ) => void;
  onUpdateSelectedText: (raw: string) => void;
  onUpdateSelectedType: (type: AnalyzerElementType) => void;
  onUpdateSelectedReadingOrder: (readingOrder: number | undefined) => void;
  onUpdateSelectedNeedsReview: (needsReview: boolean) => void;
  onUpdateSelectedBBox: (bbox: AnalyzerBBoxPct) => void;
}) {
  const elements = pageJson?.elements ?? [];

  return (
    <div className="flex h-[calc(100vh-72px)] flex-col">
      <div className="border-b border-slate-200 px-4 py-3">
        <div className="text-sm font-semibold text-slate-900">Inspector</div>
        <div className="mt-1 text-xs text-slate-600">
          {loadingLocal
            ? "Loading local..."
            : pageJson
              ? "Editing loaded JSON"
              : "No JSON yet (Analyze first)"}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {/* Page meta */}
        <section className="border-b border-slate-200 px-4 py-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Page
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-700">
                Title
              </label>
              <input
                disabled={!pageJson}
                value={pageJson?.title ?? ""}
                onChange={(e) => onUpdatePageMeta({ title: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 disabled:bg-slate-50"
                placeholder="Optional page title"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700">
                Description
              </label>
              <textarea
                disabled={!pageJson}
                value={pageJson?.description ?? ""}
                onChange={(e) =>
                  onUpdatePageMeta({ description: e.target.value })
                }
                className="mt-1 min-h-[70px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 disabled:bg-slate-50"
                placeholder="Optional description"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700">
                Keywords (comma separated)
              </label>
              <input
                disabled={!pageJson}
                value={(pageJson?.keywords ?? []).join(", ")}
                onChange={(e) =>
                  onUpdatePageMeta({
                    keywords: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 disabled:bg-slate-50"
                placeholder="e.g. action, comedy, shounen"
              />
            </div>
          </div>
        </section>

        {/* Elements list */}
        <section className="border-b border-slate-200 px-4 py-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Elements ({elements.length})
            </div>

            <div className="flex items-center gap-2">
              <select
                disabled={!pageJson}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs disabled:bg-slate-50"
                defaultValue="dialogue"
                onChange={(e) =>
                  onAddElement(e.target.value as AnalyzerElementType)
                }
              >
                <option value="dialogue">+ dialogue</option>
                <option value="narration">+ narration</option>
                <option value="free_text">+ free_text</option>
                <option value="sfx">+ sfx</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            {elements.map((el) => {
              const active = el.id === selectedId;
              const snippet = el.text.raw.replace(/\s+/g, " ").slice(0, 46);
              return (
                <button
                  key={el.id}
                  onClick={() => onSelect(el.id)}
                  className={[
                    "w-full rounded-lg border px-3 py-2 text-left text-sm transition",
                    active
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium">{el.type}</div>
                    <div
                      className={
                        active
                          ? "text-xs text-white/80"
                          : "text-xs text-slate-500"
                      }
                    >
                      {typeof el.readingOrder === "number"
                        ? `#${el.readingOrder}`
                        : "—"}
                    </div>
                  </div>
                  <div
                    className={
                      active
                        ? "mt-1 text-xs text-white/85"
                        : "mt-1 text-xs text-slate-600"
                    }
                  >
                    {snippet || (
                      <span className="italic opacity-70">(empty)</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Selected element editor */}
        <section className="px-4 py-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Selected
            </div>
            <button
              onClick={onDeleteSelected}
              disabled={!selectedElement}
              className="rounded-lg border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
              title="Delete selected element"
            >
              Delete
            </button>
          </div>

          {!selectedElement ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Select an element from the list or click a box on the image.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="text-xs text-slate-500">id</div>
                <div className="mt-1 break-all text-xs font-medium text-slate-800">
                  {selectedElement.id}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700">
                    Type
                  </label>
                  <select
                    value={selectedElement.type}
                    onChange={(e) =>
                      onUpdateSelectedType(
                        e.target.value as AnalyzerElementType,
                      )
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                  >
                    <option value="dialogue">dialogue</option>
                    <option value="narration">narration</option>
                    <option value="free_text">free_text</option>
                    <option value="sfx">sfx</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700">
                    Reading order
                  </label>
                  <input
                    value={
                      typeof selectedElement.readingOrder === "number"
                        ? selectedElement.readingOrder
                        : ""
                    }
                    onChange={(e) =>
                      onUpdateSelectedReadingOrder(numOrUndef(e.target.value))
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                    placeholder="optional"
                    inputMode="numeric"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700">
                  Text (raw)
                </label>
                <textarea
                  value={selectedElement.text.raw}
                  onChange={(e) => onUpdateSelectedText(e.target.value)}
                  className="mt-1 min-h-[110px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                  placeholder="Edit text.raw"
                />
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Geometry bboxPct
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {(["x", "y", "w", "h"] as const).map((k) => (
                    <div key={k}>
                      <label className="text-xs font-medium text-slate-700">
                        {k}
                      </label>
                      <input
                        value={selectedElement.geometry.bboxPct[k]}
                        type="number"
                        min={0}
                        max={1}
                        step={0.001}
                        onChange={(e) => {
                          const next = {
                            ...selectedElement.geometry.bboxPct,
                            [k]: clamp(Number(e.target.value), 0, 1),
                          } as AnalyzerBBoxPct;
                          onUpdateSelectedBBox(next);
                        }}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-2 text-xs text-slate-600">
                  Tip: drag/resize handles on the image for faster editing.
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={selectedElement.flags?.needsReview ?? false}
                  onChange={(e) =>
                    onUpdateSelectedNeedsReview(e.target.checked)
                  }
                />
                needsReview
              </label>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
