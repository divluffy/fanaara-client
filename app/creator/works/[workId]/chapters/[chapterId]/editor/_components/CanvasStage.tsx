// app\creator\works\[workId]\chapters\[chapterId]\editor\_components\CanvasStage.tsx
"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Konva from "konva";
import {
  Stage,
  Layer,
  Image as KImage,
  Group,
  Rect,
  Ellipse,
  Text,
  Transformer,
  Line,
  Circle,
} from "react-konva";

import type {
  EditorPageItem,
  LangMode,
  PageAnnotationsDoc,
  PageElement,
  ViewMode,
} from "./types";

import {
  bboxCenter,
  clamp,
  clamp01,
  detectLang,
  dirForLang,
  markEdited,
  normToPxBBox,
  pxToNormBBox,
  toTtbText,
} from "./utils";

type Viewport = { x: number; y: number; scale: number };
type GuideLines = { v: number[]; h: number[] };

function statusStroke(status: PageElement["status"]) {
  switch (status) {
    case "detected":
      return "#06b6d4"; // cyan
    case "edited":
      return "#f59e0b"; // amber
    case "confirmed":
      return "#10b981"; // green
    case "needs_review":
      return "#ef4444"; // red
    case "deleted":
      return "#a1a1aa"; // zinc
    default:
      return "#06b6d4";
  }
}

function safeNumber(v: any, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function clampInsideImage(
  pos: { x: number; y: number },
  box: { w: number; h: number },
  imgW: number,
  imgH: number,
) {
  const maxX = Math.max(0, imgW - box.w);
  const maxY = Math.max(0, imgH - box.h);
  return {
    x: clamp(pos.x, 0, maxX),
    y: clamp(pos.y, 0, maxY),
  };
}

function computeTailBaseEllipse(
  b: { x: number; y: number; w: number; h: number },
  tip: { x: number; y: number },
) {
  const cx = b.x + b.w / 2;
  const cy = b.y + b.h / 2;
  const rx = Math.max(1, b.w / 2);
  const ry = Math.max(1, b.h / 2);

  const vx = tip.x - cx;
  const vy = tip.y - cy;

  const denom = Math.sqrt((vx * vx) / (rx * rx) + (vy * vy) / (ry * ry));
  if (!Number.isFinite(denom) || denom === 0) return { x: cx, y: cy };

  const t = 1 / denom;
  return { x: cx + vx * t, y: cy + vy * t };
}

function computeTailBaseRect(
  b: { x: number; y: number; w: number; h: number },
  tip: { x: number; y: number },
) {
  const cx = b.x + b.w / 2;
  const cy = b.y + b.h / 2;
  const vx = tip.x - cx;
  const vy = tip.y - cy;

  const left = b.x;
  const right = b.x + b.w;
  const top = b.y;
  const bottom = b.y + b.h;

  const candidates: { t: number; x: number; y: number }[] = [];

  if (vx !== 0) {
    const t1 = (left - cx) / vx;
    const y1 = cy + t1 * vy;
    if (t1 > 0 && y1 >= top && y1 <= bottom)
      candidates.push({ t: t1, x: left, y: y1 });

    const t2 = (right - cx) / vx;
    const y2 = cy + t2 * vy;
    if (t2 > 0 && y2 >= top && y2 <= bottom)
      candidates.push({ t: t2, x: right, y: y2 });
  }

  if (vy !== 0) {
    const t3 = (top - cy) / vy;
    const x3 = cx + t3 * vx;
    if (t3 > 0 && x3 >= left && x3 <= right)
      candidates.push({ t: t3, x: x3, y: top });

    const t4 = (bottom - cy) / vy;
    const x4 = cx + t4 * vx;
    if (t4 > 0 && x4 >= left && x4 <= right)
      candidates.push({ t: t4, x: x4, y: bottom });
  }

  if (candidates.length === 0) return { x: cx, y: cy };
  candidates.sort((a, b) => a.t - b.t);
  return { x: candidates[0].x, y: candidates[0].y };
}

function isBubbleTemplate(t: PageElement["container"]["template_id"]) {
  return (
    t === "bubble_ellipse" ||
    t === "bubble_roundrect" ||
    t === "bubble_cloud" ||
    t === "bubble_burst"
  );
}

export default function CanvasStage({
  page,
  viewMode,
  langMode,
  selectedId,
  hoverId,
  onHover,
  onSelect,
  onChangeDoc,
}: {
  page: EditorPageItem | null;
  viewMode: ViewMode;
  langMode: LangMode;
  selectedId: string | null;
  hoverId: string | null;
  onHover?: (id: string | null) => void;
  onSelect: (id: string | null) => void;
  onChangeDoc: (
    updater: (doc: PageAnnotationsDoc) => PageAnnotationsDoc,
  ) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<Konva.Stage | null>(null);

  const trRef = useRef<Konva.Transformer | null>(null);
  const nodesRef = useRef<Record<string, Konva.Group | null>>({});

  const [size, setSize] = useState({ w: 800, h: 600 });
  const [bg, setBg] = useState<HTMLImageElement | null>(null);

  const imgW = page?.image.width ?? 1;
  const imgH = page?.image.height ?? 1;

  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, scale: 1 });
  const [fitLock, setFitLock] = useState(true);

  const [spaceDown, setSpaceDown] = useState(false);
  const [panning, setPanning] = useState(false);
  const panStartRef = useRef<{
    x: number;
    y: number;
    vx: number;
    vy: number;
  } | null>(null);

  const [guides, setGuides] = useState<GuideLines>({ v: [], h: [] });

  // Inline edit
  const [editing, setEditing] = useState<{
    id: string;
    field: "original" | "translated";
    value: string;
    rect: { x: number; y: number; w: number; h: number };
    dir: "ltr" | "rtl";
  } | null>(null);

  useEffect(() => {
    nodesRef.current = {};
    setGuides({ v: [], h: [] });
    setEditing(null);
  }, [page?.id]);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;

    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setSize({ w: Math.floor(r.width), h: Math.floor(r.height) });
    });

    ro.observe(el);
    const r = el.getBoundingClientRect();
    setSize({ w: Math.floor(r.width), h: Math.floor(r.height) });

    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!page?.image?.url) {
      setBg(null);
      return;
    }

    const img = new Image();
    img.src = page.image.url;

    img.onload = () => {
      if (!cancelled) setBg(img);
    };
    img.onerror = () => {
      if (!cancelled) setBg(null);
    };

    return () => {
      cancelled = true;
    };
  }, [page?.image.url]);

  const fitScale = useMemo(
    () => Math.min(size.w / imgW, size.h / imgH),
    [size.w, size.h, imgW, imgH],
  );
  const minScale = useMemo(() => fitScale * 0.25, [fitScale]);
  const maxScale = useMemo(() => fitScale * 6, [fitScale]);

  const fitToScreen = useCallback(() => {
    const s = clamp(fitScale, 0.001, 9999);
    const x = (size.w - imgW * s) / 2;
    const y = (size.h - imgH * s) / 2;
    setViewport({ x, y, scale: s });
    setFitLock(true);
  }, [fitScale, size.w, size.h, imgW, imgH]);

  useEffect(() => {
    if (!page?.annotations) return;
    if (fitLock) fitToScreen();
  }, [page?.id, size.w, size.h, fitLock, fitToScreen, page?.annotations]);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setSpaceDown(true);
        if (
          !(e.target instanceof HTMLInputElement) &&
          !(e.target instanceof HTMLTextAreaElement)
        ) {
          e.preventDefault();
        }
      }
      if (e.key === "Escape") {
        setEditing(null);
      }
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.code === "Space") setSpaceDown(false);
    };
    window.addEventListener("keydown", onDown, { passive: false });
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown as any);
      window.removeEventListener("keyup", onUp as any);
    };
  }, []);

  const elementsLen = page?.annotations?.elements?.length ?? 0;

  const visibleElements = useMemo(() => {
    const els = page?.annotations?.elements ?? [];
    return els.filter((e) => e.status !== "deleted" && !e.hidden);
  }, [page?.annotations?.elements]);

  const snapBoxes = useMemo(() => {
    return visibleElements.map((e) => {
      const b = normToPxBBox(e.geometry.container_bbox, imgW, imgH);
      return { id: e.id, x: b.x, y: b.y, w: b.w, h: b.h };
    });
  }, [visibleElements, imgW, imgH]);

  useEffect(() => {
    if (viewMode !== "edit") return;
    const tr = trRef.current;
    if (!tr) return;

    const node = selectedId ? nodesRef.current[selectedId] : null;
    const selEl = selectedId
      ? visibleElements.find((x) => x.id === selectedId)
      : null;

    if (selEl?.locked) tr.nodes([]);
    else tr.nodes(node ? [node] : []);

    tr.getLayer()?.batchDraw();
  }, [selectedId, viewMode, elementsLen, visibleElements]);

  if (!page?.annotations) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-zinc-500 bg-zinc-100">
        No page
      </div>
    );
  }

  const clearGuides = () => setGuides({ v: [], h: [] });

  function computeSnap(
    nodeId: string,
    box: { x: number; y: number; w: number; h: number },
    thresholdPx = 8,
  ) {
    const others = snapBoxes.filter((b) => b.id !== nodeId);

    const vGuides: number[] = [0, imgW / 2, imgW];
    const hGuides: number[] = [0, imgH / 2, imgH];

    for (const o of others) {
      vGuides.push(o.x, o.x + o.w / 2, o.x + o.w);
      hGuides.push(o.y, o.y + o.h / 2, o.y + o.h);
    }

    const xCandidates = [
      { key: "left", val: box.x },
      { key: "center", val: box.x + box.w / 2 },
      { key: "right", val: box.x + box.w },
    ];
    const yCandidates = [
      { key: "top", val: box.y },
      { key: "middle", val: box.y + box.h / 2 },
      { key: "bottom", val: box.y + box.h },
    ];

    let snapX: { guide: number; match: (typeof xCandidates)[number] } | null =
      null;
    let snapY: { guide: number; match: (typeof yCandidates)[number] } | null =
      null;

    for (const g of vGuides) {
      for (const c of xCandidates) {
        const d = Math.abs(g - c.val);
        if (d <= thresholdPx) {
          if (!snapX || d < Math.abs(snapX.guide - snapX.match.val))
            snapX = { guide: g, match: c };
        }
      }
    }
    for (const g of hGuides) {
      for (const c of yCandidates) {
        const d = Math.abs(g - c.val);
        if (d <= thresholdPx) {
          if (!snapY || d < Math.abs(snapY.guide - snapY.match.val))
            snapY = { guide: g, match: c };
        }
      }
    }

    let nextX = box.x;
    let nextY = box.y;

    const showV: number[] = [];
    const showH: number[] = [];

    if (snapX) {
      showV.push(snapX.guide);
      if (snapX.match.key === "left") nextX = snapX.guide;
      if (snapX.match.key === "center") nextX = snapX.guide - box.w / 2;
      if (snapX.match.key === "right") nextX = snapX.guide - box.w;
    }
    if (snapY) {
      showH.push(snapY.guide);
      if (snapY.match.key === "top") nextY = snapY.guide;
      if (snapY.match.key === "middle") nextY = snapY.guide - box.h / 2;
      if (snapY.match.key === "bottom") nextY = snapY.guide - box.h;
    }

    const clamped = clampInsideImage(
      { x: nextX, y: nextY },
      { w: box.w, h: box.h },
      imgW,
      imgH,
    );
    return { x: clamped.x, y: clamped.y, guides: { v: showV, h: showH } };
  }

  function centerOnSelection() {
    if (!selectedId) return;
    const sel = visibleElements.find((e) => e.id === selectedId);
    if (!sel) return;
    const b = normToPxBBox(sel.geometry.container_bbox, imgW, imgH);
    const cx = b.x + b.w / 2;
    const cy = b.y + b.h / 2;
    setFitLock(false);
    setViewport((v) => ({
      ...v,
      x: size.w / 2 - cx * v.scale,
      y: size.h / 2 - cy * v.scale,
    }));
  }

  const zoomPct = Math.round((viewport.scale / fitScale) * 100);

  // minimap rect
  const minimap = useMemo(() => {
    const maxDim = 160;
    const ratio = imgH / imgW;
    const w = ratio >= 1 ? Math.round(maxDim / ratio) : maxDim;
    const h = ratio >= 1 ? maxDim : Math.round(maxDim * ratio);
    const s = w / imgW;

    const worldX0 = clamp((0 - viewport.x) / viewport.scale, 0, imgW);
    const worldY0 = clamp((0 - viewport.y) / viewport.scale, 0, imgH);
    const worldX1 = clamp((size.w - viewport.x) / viewport.scale, 0, imgW);
    const worldY1 = clamp((size.h - viewport.y) / viewport.scale, 0, imgH);

    const rx = worldX0 * s;
    const ry = worldY0 * s;
    const rw = Math.max(8, (worldX1 - worldX0) * s);
    const rh = Math.max(8, (worldY1 - worldY0) * s);

    return { w, h, scale: s, rect: { x: rx, y: ry, w: rw, h: rh } };
  }, [imgW, imgH, viewport.x, viewport.y, viewport.scale, size.w, size.h]);

  const cursor =
    spaceDown || panning
      ? panning
        ? "grabbing"
        : "grab"
      : viewMode === "edit"
        ? "default"
        : "default";

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-zinc-100 relative overflow-hidden"
    >
      {/* HUD */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2 bg-white/90 border rounded-xl px-3 py-2 text-xs shadow-sm">
        <button
          className="px-2 py-1 rounded-lg border bg-white hover:bg-zinc-50"
          onClick={() => {
            setFitLock(true);
            fitToScreen();
          }}
        >
          Fit
        </button>

        <button
          className="px-2 py-1 rounded-lg border bg-white hover:bg-zinc-50"
          onClick={() => {
            setFitLock(false);
            setViewport((v) => ({
              ...v,
              scale: clamp(v.scale * 1.15, minScale, maxScale),
            }));
          }}
        >
          +
        </button>

        <button
          className="px-2 py-1 rounded-lg border bg-white hover:bg-zinc-50"
          onClick={() => {
            setFitLock(false);
            setViewport((v) => ({
              ...v,
              scale: clamp(v.scale / 1.15, minScale, maxScale),
            }));
          }}
        >
          -
        </button>

        <div className="flex items-center gap-2">
          <input
            type="range"
            min={25}
            max={600}
            value={zoomPct}
            onChange={(e) => {
              const pct = clamp(Number(e.target.value || 100), 25, 600);
              const ns = clamp((pct / 100) * fitScale, minScale, maxScale);
              setFitLock(false);
              setViewport((v) => ({ ...v, scale: ns }));
            }}
          />
          <div className="w-10 text-right text-zinc-700 font-medium">
            {zoomPct}%
          </div>
        </div>

        <button
          className="px-2 py-1 rounded-lg border bg-white hover:bg-zinc-50"
          onClick={centerOnSelection}
          disabled={!selectedId}
          title="Center selection"
        >
          Center
        </button>
      </div>

      {/* Inline textarea */}
      {editing && (
        <div
          className="absolute z-20"
          style={{ left: editing.rect.x, top: editing.rect.y }}
        >
          <textarea
            autoFocus
            className="border rounded-xl p-2 text-sm bg-white/95 shadow-lg outline-none w-full h-full"
            style={{
              width: editing.rect.w,
              height: editing.rect.h,
              resize: "none",
              direction: editing.dir,
            }}
            value={editing.value}
            onChange={(e) => setEditing({ ...editing, value: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                setEditing(null);
                return;
              }
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                const newText = editing.value;

                onChangeDoc((doc) => ({
                  ...doc,
                  elements: doc.elements.map((x) => {
                    if (x.id !== editing.id) return x;

                    const lang =
                      editing.field === "original"
                        ? detectLang(newText)
                        : x.text.lang;
                    return {
                      ...markEdited(x),
                      text: {
                        ...x.text,
                        [editing.field]: newText,
                        lang,
                        writingDirection: dirForLang(lang),
                      },
                    } as any;
                  }),
                  updatedAt: new Date().toISOString(),
                }));
                setEditing(null);
              }
            }}
            onBlur={() => {
              const newText = editing.value;

              onChangeDoc((doc) => ({
                ...doc,
                elements: doc.elements.map((x) => {
                  if (x.id !== editing.id) return x;

                  const lang =
                    editing.field === "original"
                      ? detectLang(newText)
                      : x.text.lang;
                  return {
                    ...markEdited(x),
                    text: {
                      ...x.text,
                      [editing.field]: newText,
                      lang,
                      writingDirection: dirForLang(lang),
                    },
                  } as any;
                }),
                updatedAt: new Date().toISOString(),
              }));
              setEditing(null);
            }}
          />
          <div className="mt-1 text-[11px] text-zinc-600 bg-white/90 border rounded-lg px-2 py-1 inline-block">
            Ctrl/⌘ + Enter to commit • Esc to cancel
          </div>
        </div>
      )}

      <Stage
        ref={(n) => {
          stageRef.current = n;
        }}
        width={size.w}
        height={size.h}
        style={{ cursor }}
        onWheel={(e) => {
          e.evt.preventDefault();
          const stage = e.target.getStage();
          if (!stage) return;

          const pointer = stage.getPointerPosition();
          if (!pointer) return;

          const oldScale = viewport.scale;
          const scaleBy = e.evt.deltaY > 0 ? 0.9 : 1.1;
          const newScale = clamp(oldScale * scaleBy, minScale, maxScale);

          const mousePointTo = {
            x: (pointer.x - viewport.x) / oldScale,
            y: (pointer.y - viewport.y) / oldScale,
          };

          const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
          };

          setFitLock(false);
          setViewport({ x: newPos.x, y: newPos.y, scale: newScale });
        }}
        onMouseDown={(e) => {
          const stage = e.target.getStage();
          if (!stage) return;

          const isMiddle = (e.evt as MouseEvent).button === 1;
          const isRight = (e.evt as MouseEvent).button === 2;

          if (spaceDown || isMiddle || isRight) {
            const p = stage.getPointerPosition();
            if (!p) return;
            setPanning(true);
            panStartRef.current = {
              x: p.x,
              y: p.y,
              vx: viewport.x,
              vy: viewport.y,
            };
            return;
          }

          const clickedOnEmpty = e.target === stage;
          if (clickedOnEmpty) onSelect(null);
        }}
        onMouseMove={() => {
          if (!panning) return;
          const stage = stageRef.current;
          if (!stage) return;
          const p = stage.getPointerPosition();
          const start = panStartRef.current;
          if (!p || !start) return;

          setFitLock(false);
          setViewport((v) => ({
            ...v,
            x: start.vx + (p.x - start.x),
            y: start.vy + (p.y - start.y),
          }));
        }}
        onMouseUp={() => {
          setPanning(false);
          panStartRef.current = null;
        }}
        onMouseLeave={() => {
          setPanning(false);
          panStartRef.current = null;
        }}
        onContextMenu={(e) => e.evt.preventDefault()}
      >
        <Layer>
          <Group
            x={viewport.x}
            y={viewport.y}
            scaleX={viewport.scale}
            scaleY={viewport.scale}
          >
            {bg && (
              <KImage
                image={bg}
                x={0}
                y={0}
                width={imgW}
                height={imgH}
                listening={false}
              />
            )}

            {/* Guides */}
            {guides.v.map((x, idx) => (
              <Line
                key={`gv-${idx}`}
                points={[x, 0, x, imgH]}
                stroke="#7c3aed"
                strokeWidth={1 / viewport.scale}
                opacity={0.7}
                listening={false}
              />
            ))}
            {guides.h.map((y, idx) => (
              <Line
                key={`gh-${idx}`}
                points={[0, y, imgW, y]}
                stroke="#7c3aed"
                strokeWidth={1 / viewport.scale}
                opacity={0.7}
                listening={false}
              />
            ))}

            {/* Elements */}
            {visibleElements.map((el) => {
              const isSel = el.id === selectedId;
              const isHover = el.id === hoverId;

              const bboxPx = normToPxBBox(
                el.geometry.container_bbox,
                imgW,
                imgH,
              );

              const padding = safeNumber(el.container.params?.padding, 12);
              const isLocked = !!el.locked;

              const tailEnabled =
                !!el.container.params?.tailEnabled &&
                isBubbleTemplate(el.container.template_id);

              const tailTipNorm = el.geometry.tailTip;
              const tailTipPx = tailTipNorm
                ? { x: tailTipNorm.x * imgW, y: tailTipNorm.y * imgH }
                : null;

              let tailBasePx: { x: number; y: number } | null = null;
              if (tailEnabled && tailTipPx) {
                const shape = el.container.shape;
                if (
                  shape === "ellipse" ||
                  el.container.template_id === "bubble_cloud" ||
                  el.container.template_id === "bubble_burst"
                ) {
                  tailBasePx = computeTailBaseEllipse(bboxPx, tailTipPx);
                } else {
                  tailBasePx = computeTailBaseRect(bboxPx, tailTipPx);
                }
              }

              return (
                <Group
                  key={el.id}
                  x={bboxPx.x}
                  y={bboxPx.y}
                  draggable={viewMode === "edit" && !isLocked && !panning}
                  ref={(node) => {
                    if (node) nodesRef.current[el.id] = node;
                    else delete nodesRef.current[el.id];

                    if (
                      node &&
                      viewMode === "edit" &&
                      el.id === selectedId &&
                      trRef.current &&
                      !isLocked
                    ) {
                      trRef.current.nodes([node]);
                      trRef.current.getLayer()?.batchDraw();
                    }
                  }}
                  dragBoundFunc={(pos) =>
                    clampInsideImage(
                      pos,
                      { w: bboxPx.w, h: bboxPx.h },
                      imgW,
                      imgH,
                    )
                  }
                  onMouseEnter={() => onHover?.(el.id)}
                  onMouseLeave={() => onHover?.(null)}
                  onClick={() => onSelect(el.id)}
                  onTap={() => onSelect(el.id)}
                  onDblClick={() => {
                    if (viewMode !== "edit") return;

                    const field =
                      langMode === "translated" ? "translated" : "original";
                    const txt =
                      (field === "translated"
                        ? el.text.translated
                        : el.text.original) ?? "";

                    const rectStage = {
                      x: viewport.x + (bboxPx.x + padding) * viewport.scale,
                      y: viewport.y + (bboxPx.y + padding) * viewport.scale,
                      w: Math.max(
                        40,
                        (bboxPx.w - padding * 2) * viewport.scale,
                      ),
                      h: Math.max(
                        40,
                        (bboxPx.h - padding * 2) * viewport.scale,
                      ),
                    };

                    const dir = detectLang(txt) === "ar" ? "rtl" : "ltr";
                    setEditing({
                      id: el.id,
                      field,
                      value: txt,
                      rect: rectStage,
                      dir,
                    });
                  }}
                  onDragMove={(ev) => {
                    if (viewMode !== "edit") return;
                    const node = ev.target as Konva.Group;
                    const box = {
                      x: node.x(),
                      y: node.y(),
                      w: bboxPx.w,
                      h: bboxPx.h,
                    };

                    const disableSnap = (ev.evt as MouseEvent).altKey;
                    if (disableSnap) {
                      setGuides({ v: [], h: [] });
                      return;
                    }

                    const snap = computeSnap(el.id, box, 8);
                    node.x(snap.x);
                    node.y(snap.y);
                    setGuides(snap.guides);
                  }}
                  onDragEnd={(ev) => {
                    const node = ev.target as Konva.Group;

                    const nextPx = {
                      x: node.x(),
                      y: node.y(),
                      w: bboxPx.w,
                      h: bboxPx.h,
                    };
                    const next = pxToNormBBox(nextPx, imgW, imgH);

                    clearGuides();

                    onChangeDoc((doc) => ({
                      ...doc,
                      elements: doc.elements.map((x) => {
                        if (x.id !== el.id) return x;
                        const container_bbox = next;
                        return {
                          ...markEdited(x),
                          geometry: {
                            ...x.geometry,
                            container_bbox,
                            anchor: bboxCenter(container_bbox),
                          },
                        };
                      }),
                      updatedAt: new Date().toISOString(),
                    }));
                  }}
                  onTransformEnd={(ev) => {
                    const node = ev.target as Konva.Group;
                    const sx = node.scaleX();
                    const sy = node.scaleY();

                    const minSize = 24;
                    const newW = Math.max(minSize, bboxPx.w * sx);
                    const newH = Math.max(minSize, bboxPx.h * sy);

                    node.scaleX(1);
                    node.scaleY(1);

                    let nextPx = { x: node.x(), y: node.y(), w: newW, h: newH };
                    const clampedPos = clampInsideImage(
                      { x: nextPx.x, y: nextPx.y },
                      { w: nextPx.w, h: nextPx.h },
                      imgW,
                      imgH,
                    );
                    nextPx = { ...nextPx, x: clampedPos.x, y: clampedPos.y };

                    const next = pxToNormBBox(nextPx, imgW, imgH);

                    clearGuides();

                    onChangeDoc((doc) => ({
                      ...doc,
                      elements: doc.elements.map((x) => {
                        if (x.id !== el.id) return x;
                        const container_bbox = next;
                        return {
                          ...markEdited(x),
                          geometry: {
                            ...x.geometry,
                            container_bbox,
                            anchor: bboxCenter(container_bbox),
                          },
                        };
                      }),
                      updatedAt: new Date().toISOString(),
                    }));
                  }}
                >
                  {/* Tail */}
                  {tailEnabled && tailTipPx && tailBasePx && (
                    <Line
                      points={[
                        tailBasePx.x - bboxPx.x,
                        tailBasePx.y - bboxPx.y,
                        tailTipPx.x - bboxPx.x,
                        tailTipPx.y - bboxPx.y,
                      ]}
                      stroke={el.style.stroke}
                      strokeWidth={Math.max(1, el.style.strokeWidth)}
                      opacity={el.style.opacity}
                      listening={false}
                    />
                  )}

                  <ElementShape
                    el={el}
                    w={bboxPx.w}
                    h={bboxPx.h}
                    langMode={langMode}
                  />

                  {/* Status outline (edit only) */}
                  {viewMode === "edit" && (
                    <Rect
                      x={0}
                      y={0}
                      width={bboxPx.w}
                      height={bboxPx.h}
                      stroke={statusStroke(el.status)}
                      dash={[6, 4]}
                      strokeWidth={1}
                      fillEnabled={false}
                      listening={false}
                      opacity={0.9}
                    />
                  )}

                  {/* Hover outline */}
                  {isHover && !isSel && (
                    <Rect
                      x={0}
                      y={0}
                      width={bboxPx.w}
                      height={bboxPx.h}
                      stroke="#111827"
                      dash={[10, 8]}
                      strokeWidth={1}
                      fillEnabled={false}
                      listening={false}
                      opacity={0.8}
                    />
                  )}

                  {/* Selected outline */}
                  {isSel && viewMode === "edit" && (
                    <Rect
                      x={0}
                      y={0}
                      width={bboxPx.w}
                      height={bboxPx.h}
                      stroke="#111827"
                      dash={[8, 6]}
                      strokeWidth={2}
                      fillEnabled={false}
                      listening={false}
                    />
                  )}

                  {/* Reading order badge */}
                  {viewMode === "edit" && (
                    <Group listening={false}>
                      <Rect
                        x={6}
                        y={6}
                        width={34}
                        height={20}
                        cornerRadius={6}
                        fill="#000000aa"
                      />
                      <Text
                        x={6}
                        y={8}
                        width={34}
                        height={20}
                        text={`${el.readingOrder}`}
                        fontSize={12}
                        align="center"
                        verticalAlign="middle"
                        fill="#fff"
                      />
                    </Group>
                  )}

                  {/* Tail tip handle */}
                  {isSel &&
                    viewMode === "edit" &&
                    isBubbleTemplate(el.container.template_id) && (
                      <Circle
                        x={
                          (tailTipPx ? tailTipPx.x : bboxPx.x + bboxPx.w / 2) -
                          bboxPx.x
                        }
                        y={
                          (tailTipPx ? tailTipPx.y : bboxPx.y + bboxPx.h / 2) -
                          bboxPx.y
                        }
                        radius={6}
                        fill="#ffffff"
                        stroke="#111111"
                        strokeWidth={2}
                        draggable={!isLocked}
                        onDragMove={(ev) => {
                          const n = ev.target as Konva.Circle;
                          const gx = clamp(n.x() + bboxPx.x, 0, imgW);
                          const gy = clamp(n.y() + bboxPx.y, 0, imgH);
                          n.x(gx - bboxPx.x);
                          n.y(gy - bboxPx.y);
                        }}
                        onDragEnd={(ev) => {
                          const n = ev.target as Konva.Circle;
                          const tipAbs = {
                            x: n.x() + bboxPx.x,
                            y: n.y() + bboxPx.y,
                          };
                          const tipNorm = {
                            x: clamp01(tipAbs.x / imgW),
                            y: clamp01(tipAbs.y / imgH),
                          };

                          onChangeDoc((doc) => ({
                            ...doc,
                            elements: doc.elements.map((x) => {
                              if (x.id !== el.id) return x;
                              return {
                                ...markEdited(x),
                                geometry: { ...x.geometry, tailTip: tipNorm },
                                container: {
                                  ...x.container,
                                  params: {
                                    ...(x.container.params ?? {}),
                                    tailEnabled: true,
                                  },
                                },
                              };
                            }),
                            updatedAt: new Date().toISOString(),
                          }));
                        }}
                      />
                    )}

                  {/* Lock indicator */}
                  {isLocked && viewMode === "edit" && (
                    <Text
                      x={bboxPx.w - 42}
                      y={6}
                      width={36}
                      height={18}
                      text={"LOCK"}
                      fontSize={10}
                      align="center"
                      verticalAlign="middle"
                      fill="#ffffff"
                      listening={false}
                      shadowColor="#000"
                      shadowBlur={6}
                      shadowOpacity={0.5}
                    />
                  )}
                </Group>
              );
            })}

            {viewMode === "edit" && (
              <Transformer
                ref={trRef}
                rotateEnabled={false}
                keepRatio={false}
                enabledAnchors={[
                  "top-left",
                  "top-right",
                  "bottom-left",
                  "bottom-right",
                ]}
                boundBoxFunc={(oldBox, newBox) => {
                  if (newBox.width < 24 || newBox.height < 24) return oldBox;
                  return newBox;
                }}
              />
            )}
          </Group>
        </Layer>
      </Stage>

      {/* Mini-map */}
      <div className="absolute bottom-3 right-3 z-10 rounded-xl border bg-white/90 shadow-sm p-2">
        <div className="text-[11px] text-zinc-600 mb-1 flex items-center justify-between">
          <span>Navigator</span>
          <span className="text-zinc-500">{spaceDown ? "Pan" : "Zoom"}</span>
        </div>
        <div
          className="relative"
          style={{ width: minimap.w, height: minimap.h }}
        >
          <img
            src={page.image.url}
            alt=""
            style={{
              width: minimap.w,
              height: minimap.h,
              objectFit: "cover",
              display: "block",
            }}
          />
          <div
            className="absolute border-2 border-fuchsia-500 bg-fuchsia-500/10 rounded"
            style={{
              left: minimap.rect.x,
              top: minimap.rect.y,
              width: minimap.rect.w,
              height: minimap.rect.h,
            }}
          />
        </div>
      </div>

      <div className="absolute bottom-3 left-3 bg-white/90 border rounded-xl px-3 py-2 text-xs shadow-sm">
        {viewMode === "edit" ? "Edit" : "Preview"} • {langMode} •{" "}
        {spaceDown ? "Pan mode (Space)" : "Wheel to zoom"} • Hold <b>Alt</b> to
        disable snapping
      </div>
    </div>
  );
}

function ElementShape({
  el,
  w,
  h,
  langMode,
}: {
  el: PageElement;
  w: number;
  h: number;
  langMode: LangMode;
}) {
  const padding = Number(el.container.params?.padding ?? 12);
  const cornerRadius = Number(el.container.params?.cornerRadius ?? 18);

  const textRaw =
    langMode === "translated"
      ? el.text.translated || ""
      : el.text.original || "";

  const isTTB = el.text.writingDirection === "TTB";
  const text = isTTB ? toTtbText(textRaw) : textRaw;

  const textX = padding;
  const textY = padding;
  const textW = Math.max(0, w - padding * 2);
  const textH = Math.max(0, h - padding * 2);

  const fill = el.style.fill;
  const stroke = el.style.stroke;
  const sw = el.style.strokeWidth;

  const textFill = el.style.textFill ?? "#111111";
  const textStroke = el.style.textStroke;
  const textStrokeWidth = el.style.textStrokeWidth ?? 0;

  const fontFamily = el.style.fontFamily ?? "Arial";
  const fontStyle = el.style.fontStyle ?? "normal";
  const lineHeight = el.style.lineHeight ?? 1.2;
  const letterSpacing = el.style.letterSpacing ?? 0;

  const rot = el.style.textRotation ?? 0;
  const shadow = el.style.textShadow;

  const textNode = (
    <Text
      x={textX + textW / 2}
      y={textY + textH / 2}
      offsetX={textW / 2}
      offsetY={textH / 2}
      width={textW}
      height={textH}
      text={text}
      fontSize={el.style.fontSize}
      fontFamily={fontFamily}
      fontStyle={fontStyle}
      lineHeight={lineHeight}
      letterSpacing={letterSpacing}
      fill={textFill}
      stroke={textStroke}
      strokeWidth={textStrokeWidth}
      align={el.style.align}
      verticalAlign="middle"
      rotation={rot}
      listening={false}
      shadowColor={shadow?.color}
      shadowBlur={shadow?.blur}
      shadowOffsetX={shadow?.offsetX}
      shadowOffsetY={shadow?.offsetY}
      shadowOpacity={shadow?.opacity}
    />
  );

  if (el.container.template_id === "bubble_ellipse") {
    return (
      <>
        <Ellipse
          x={w / 2}
          y={h / 2}
          radiusX={w / 2}
          radiusY={h / 2}
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
          opacity={el.style.opacity}
        />
        {textNode}
      </>
    );
  }

  if (
    el.container.template_id === "bubble_roundrect" ||
    el.container.template_id === "narration_roundrect"
  ) {
    return (
      <>
        <Rect
          x={0}
          y={0}
          width={w}
          height={h}
          cornerRadius={cornerRadius}
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
          opacity={el.style.opacity}
        />
        {textNode}
      </>
    );
  }

  if (
    el.container.template_id === "narration_rect" ||
    el.container.template_id === "caption_box" ||
    el.container.template_id === "scene_label" ||
    el.container.template_id === "signage_label"
  ) {
    return (
      <>
        <Rect
          x={0}
          y={0}
          width={w}
          height={h}
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
          opacity={el.style.opacity}
        />
        {textNode}
      </>
    );
  }

  if (
    el.container.template_id === "bubble_burst" ||
    el.container.template_id === "sfx_burst"
  ) {
    const spikes = Number(el.container.params?.spikes ?? 10);
    const pts = makeBurstPoints(w, h, spikes);
    return (
      <>
        <Line
          points={pts}
          closed
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
          opacity={el.style.opacity}
        />
        {textNode}
      </>
    );
  }

  if (el.container.template_id === "bubble_cloud") {
    // simple cloud-ish placeholder
    return (
      <>
        <Rect
          x={0}
          y={0}
          width={w}
          height={h}
          cornerRadius={22}
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
          opacity={el.style.opacity}
        />
        {textNode}
      </>
    );
  }

  if (el.container.template_id === "sfx_outline") {
    return (
      <>
        <Rect
          x={0}
          y={0}
          width={w}
          height={h}
          fill={"#00000000"}
          stroke={stroke}
          strokeWidth={2}
          dash={[8, 6]}
          opacity={1}
        />
        {textNode}
      </>
    );
  }

  return <>{textNode}</>;
}

function makeBurstPoints(w: number, h: number, spikes: number) {
  const s = Number.isFinite(spikes) ? spikes : 10;
  const safeSpikes = Math.max(3, Math.min(32, Math.floor(s)));

  const cx = w / 2;
  const cy = h / 2;
  const outerR = Math.min(w, h) / 2;
  const innerR = outerR * 0.6;
  const pts: number[] = [];
  const steps = safeSpikes * 2;

  for (let i = 0; i < steps; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = (Math.PI * 2 * i) / steps - Math.PI / 2;
    pts.push(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  return pts;
}
