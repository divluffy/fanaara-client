// app\creator\works\[workId]\chapters\[chapterId]\editor\_components\ElementsPanel.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import type {
  EditorPageItem,
  LangMode,
  PageAnnotationsDoc,
  PageElement,
} from "./types";
import { cn } from "./ui/cn";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { autoReadingOrder, normalizeReadingOrder } from "./utils";

function statusColor(status: PageElement["status"]) {
  switch (status) {
    case "detected":
      return "info";
    case "edited":
      return "warn";
    case "confirmed":
      return "success";
    case "needs_review":
      return "danger";
    case "deleted":
      return "neutral";
    default:
      return "neutral";
  }
}

function typeLabel(t: PageElement["elementType"]) {
  switch (t) {
    case "SPEECH":
      return "Speech";
    case "THOUGHT":
      return "Thought";
    case "NARRATION":
      return "Narration";
    case "CAPTION":
      return "Caption";
    case "SFX":
      return "SFX";
    case "SCENE_TEXT":
      return "Scene";
    case "SIGNAGE":
      return "Sign";
    default:
      return t;
  }
}

function textPreview(el: PageElement, langMode: LangMode) {
  const raw =
    langMode === "translated"
      ? (el.text.translated ?? "")
      : (el.text.original ?? "");
  const s = raw.trim().replace(/\s+/g, " ");
  if (!s) return "—";
  return s.length > 70 ? s.slice(0, 70) + "…" : s;
}

export default function ElementsPanel({
  page,
  selectedId,
  hoverId,
  langMode,
  onSelect,
  onHover,
  onChangeDoc,
}: {
  page: EditorPageItem | null;
  selectedId: string | null;
  hoverId: string | null;
  langMode: LangMode;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
  onChangeDoc: (
    updater: (doc: PageAnnotationsDoc) => PageAnnotationsDoc,
  ) => void;
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | PageElement["status"]
  >("all");
  const [showDeleted, setShowDeleted] = useState(false);

  const els = page?.annotations?.elements ?? [];

  const visible = useMemo(() => {
    let list = els.slice();

    if (!showDeleted) list = list.filter((e) => e.status !== "deleted");

    if (statusFilter !== "all")
      list = list.filter((e) => e.status === statusFilter);

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((e) => {
        const o = (e.text.original ?? "").toLowerCase();
        const t = (e.text.translated ?? "").toLowerCase();
        return (
          o.includes(q) || t.includes(q) || String(e.readingOrder).includes(q)
        );
      });
    }

    list.sort((a, b) => a.readingOrder - b.readingOrder);
    return list;
  }, [els, query, statusFilter, showDeleted]);

  // Scroll selected into view
  useEffect(() => {
    if (!selectedId) return;
    const el = document.getElementById(`layer-${selectedId}`);
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedId]);

  const totalAlive = useMemo(
    () => els.filter((e) => e.status !== "deleted").length,
    [els],
  );
  const trDone = useMemo(
    () =>
      els.filter(
        (e) => e.status !== "deleted" && (e.text.translated ?? "").trim(),
      ).length,
    [els],
  );

  function patchMeta(id: string, p: Partial<PageElement>) {
    onChangeDoc((doc) => ({
      ...doc,
      elements: doc.elements.map((x) => (x.id === id ? { ...x, ...p } : x)),
      updatedAt: new Date().toISOString(),
    }));
  }

  function setStatus(id: string, status: PageElement["status"]) {
    onChangeDoc((doc) => ({
      ...doc,
      elements: doc.elements.map((x) => (x.id === id ? { ...x, status } : x)),
      updatedAt: new Date().toISOString(),
    }));
  }

  function moveOrder(id: string, dir: -1 | 1) {
    onChangeDoc((doc) => {
      const alive = doc.elements.filter((e) => e.status !== "deleted");
      const sorted = alive
        .slice()
        .sort((a, b) => a.readingOrder - b.readingOrder);
      const idx = sorted.findIndex((e) => e.id === id);
      if (idx < 0) return doc;
      const tIdx = Math.max(0, Math.min(sorted.length - 1, idx + dir));
      if (tIdx === idx) return doc;

      const a = sorted[idx];
      const b = sorted[tIdx];

      const swapped = doc.elements.map((e) => {
        if (e.id === a.id) return { ...e, readingOrder: b.readingOrder };
        if (e.id === b.id) return { ...e, readingOrder: a.readingOrder };
        return e;
      });

      return {
        ...doc,
        elements: normalizeReadingOrder(swapped),
        updatedAt: new Date().toISOString(),
      };
    });
  }

  function autoOrder() {
    onChangeDoc((doc) => {
      const direction = doc.meta?.languageHint === "ar" ? "RTL" : "LTR";
      const alive = doc.elements.filter((e) => e.status !== "deleted");
      const sortedAlive = autoReadingOrder({ elements: alive, direction });
      const map = new Map(sortedAlive.map((e) => [e.id, e.readingOrder]));
      return {
        ...doc,
        elements: doc.elements.map((e) =>
          map.has(e.id) ? { ...e, readingOrder: map.get(e.id)! } : e,
        ),
        updatedAt: new Date().toISOString(),
      };
    });
  }

  return (
    <aside className="w-[340px] border-r bg-white min-h-0 flex flex-col">
      <div className="p-3 border-b">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-semibold">Layers</div>
          <Badge variant="neutral">{visible.length}</Badge>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <input
            className="w-full h-10 rounded-lg border px-3 text-sm bg-white outline-none focus:ring-2 focus:ring-fuchsia-500/40"
            placeholder="Search text / order…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={autoOrder}
            title="Auto reading order"
          >
            Auto
          </Button>
        </div>

        <div className="mt-2 flex items-center justify-between gap-2 text-xs text-zinc-600">
          <span>
            TR {trDone}/{totalAlive}
          </span>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={showDeleted}
              onChange={(e) => setShowDeleted(e.target.checked)}
            />
            show deleted
          </label>
        </div>

        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <FilterPill
            active={statusFilter === "all"}
            onClick={() => setStatusFilter("all")}
          >
            All
          </FilterPill>
          <FilterPill
            active={statusFilter === "detected"}
            onClick={() => setStatusFilter("detected")}
          >
            detected
          </FilterPill>
          <FilterPill
            active={statusFilter === "edited"}
            onClick={() => setStatusFilter("edited")}
          >
            edited
          </FilterPill>
          <FilterPill
            active={statusFilter === "confirmed"}
            onClick={() => setStatusFilter("confirmed")}
          >
            confirmed
          </FilterPill>
          <FilterPill
            active={statusFilter === "needs_review"}
            onClick={() => setStatusFilter("needs_review")}
          >
            needs_review
          </FilterPill>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto p-3 space-y-2">
        {!page?.annotations ? (
          <div className="text-sm text-zinc-500">No page selected.</div>
        ) : visible.length === 0 ? (
          <div className="text-sm text-zinc-500">No elements match.</div>
        ) : (
          visible.map((el) => {
            const active = el.id === selectedId;
            const hovered = el.id === hoverId;

            const trMissing =
              langMode === "translated" &&
              el.status !== "deleted" &&
              !(el.text.translated ?? "").trim();

            return (
              <div
                key={el.id}
                id={`layer-${el.id}`}
                className={cn(
                  "rounded-xl border p-2 shadow-sm hover:shadow transition bg-white",
                  active
                    ? "ring-2 ring-fuchsia-500 border-fuchsia-200"
                    : "border-zinc-200",
                  hovered && !active ? "ring-1 ring-zinc-400" : "",
                )}
                onMouseEnter={() => onHover(el.id)}
                onMouseLeave={() => onHover(null)}
              >
                <button
                  className="w-full text-left"
                  onClick={() => onSelect(el.id)}
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">
                      <Badge variant={statusColor(el.status) as any}>
                        {el.status}
                      </Badge>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-semibold text-zinc-900 truncate">
                          #{el.readingOrder} • {typeLabel(el.elementType)}
                        </div>
                        {trMissing ? (
                          <Badge variant="warn">missing TR</Badge>
                        ) : null}
                      </div>

                      <div className="text-xs text-zinc-600 mt-0.5 line-clamp-2">
                        {textPreview(el, langMode)}
                      </div>
                    </div>
                  </div>
                </button>

                <div className="mt-2 flex items-center gap-1 flex-wrap justify-between">
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => moveOrder(el.id, -1)}
                      title="Move up"
                    >
                      ↑
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => moveOrder(el.id, 1)}
                      title="Move down"
                    >
                      ↓
                    </Button>

                    <Button
                      size="sm"
                      variant={el.locked ? "secondary" : "outline"}
                      onClick={() => patchMeta(el.id, { locked: !el.locked })}
                      title="Lock/Unlock"
                    >
                      {el.locked ? "Locked" : "Lock"}
                    </Button>

                    <Button
                      size="sm"
                      variant={el.hidden ? "secondary" : "outline"}
                      onClick={() => patchMeta(el.id, { hidden: !el.hidden })}
                      title="Hide/Show"
                    >
                      {el.hidden ? "Hidden" : "Hide"}
                    </Button>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setStatus(el.id, "confirmed")}
                    >
                      Confirm
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setStatus(el.id, "needs_review")}
                    >
                      Review
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      className={cn(
        "px-2 py-1 rounded-full text-[11px] border transition",
        active
          ? "bg-zinc-900 text-white border-zinc-900"
          : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50",
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
