// app\creator\works\[workId]\chapters\[chapterId]\editor\_components\CanvasStage.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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
} from "react-konva";
import type {
  EditorPageItem,
  LangMode,
  PageAnnotationsDoc,
  PageElement,
  ViewMode,
} from "./types";
import { clamp01, bboxCenter, markEdited } from "./utils";

type DisplayRect = { x: number; y: number; w: number; h: number };

function normalizedToDisplay(
  b: { x: number; y: number; w: number; h: number },
  imgW: number,
  imgH: number,
  scale: number,
  ox: number,
  oy: number,
): DisplayRect {
  return {
    x: ox + b.x * imgW * scale,
    y: oy + b.y * imgH * scale,
    w: b.w * imgW * scale,
    h: b.h * imgH * scale,
  };
}

function displayToNormalized(
  d: DisplayRect,
  imgW: number,
  imgH: number,
  scale: number,
  ox: number,
  oy: number,
) {
  const denomW = imgW * scale;
  const denomH = imgH * scale;

  // حماية من القسمة على صفر
  if (denomW <= 0 || denomH <= 0) {
    return { x: 0, y: 0, w: 0, h: 0 };
  }

  return {
    x: clamp01((d.x - ox) / denomW),
    y: clamp01((d.y - oy) / denomH),
    w: clamp01(d.w / denomW),
    h: clamp01(d.h / denomH),
  };
}

function statusStroke(status: PageElement["status"]) {
  switch (status) {
    case "detected":
      return "#00bcd4";
    case "edited":
      return "#ff9800";
    case "confirmed":
      return "#4caf50";
    case "needs_review":
      return "#f44336";
    case "deleted":
      return "#9e9e9e";
    default:
      return "#00bcd4";
  }
}

export default function CanvasStage({
  page,
  viewMode,
  langMode,
  selectedId,
  onSelect,
  onChangeDoc,
}: {
  page: EditorPageItem | null;
  viewMode: ViewMode;
  langMode: LangMode;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChangeDoc: (
    updater: (doc: PageAnnotationsDoc) => PageAnnotationsDoc,
  ) => void;
}) {
  // ✅ كل الـ hooks لازم تكون قبل أي return
  const containerRef = useRef<HTMLDivElement | null>(null);
  const trRef = useRef<Konva.Transformer | null>(null);
  const nodesRef = useRef<Record<string, Konva.Group | null>>({});

  const [size, setSize] = useState({ w: 800, h: 600 });
  const [bg, setBg] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);

  // reset node refs when page changes (avoid stale nodes)
  useEffect(() => {
    nodesRef.current = {};
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

  const imgW = page?.image.width ?? 1;
  const imgH = page?.image.height ?? 1;

  const fit = useMemo(() => {
    const baseScale = Math.min(size.w / imgW, size.h / imgH);
    const drawW = imgW * baseScale;
    const drawH = imgH * baseScale;
    const ox = (size.w - drawW) / 2;
    const oy = (size.h - drawH) / 2;
    return { baseScale, ox, oy };
  }, [size.w, size.h, imgW, imgH]);

  const scale = fit.baseScale * zoom;
  const ox = fit.ox;
  const oy = fit.oy;

  const elementsLen = page?.annotations?.elements?.length ?? 0;

  const visibleElements = useMemo(() => {
    const els = page?.annotations?.elements ?? [];
    return els.filter((e) => e.status !== "deleted");
  }, [page?.annotations?.elements]);

  // ✅ transformer binding (single effect only)
  useEffect(() => {
    if (viewMode !== "edit") return;

    const tr = trRef.current;
    if (!tr) return;

    const node = selectedId ? nodesRef.current[selectedId] : null;
    tr.nodes(node ? [node] : []);
    tr.getLayer()?.batchDraw();
  }, [selectedId, viewMode, elementsLen]);

  // ✅ after all hooks, now safe to conditionally return
  if (!page?.annotations) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-gray-500">
        No page
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 bg-neutral-950/5 relative">
      <Stage
        width={size.w}
        height={size.h}
        onWheel={(e) => {
          e.evt.preventDefault();
          const dir = e.evt.deltaY > 0 ? -1 : 1;
          const next = Math.max(0.25, Math.min(4, zoom + dir * 0.1));
          setZoom(next);
        }}
        onMouseDown={(e) => {
          const clickedOnEmpty = e.target === e.target.getStage();
          if (clickedOnEmpty) onSelect(null);
        }}
      >
        <Layer>
          {bg && (
            <KImage
              image={bg}
              x={ox}
              y={oy}
              width={imgW * scale}
              height={imgH * scale}
              listening={false}
            />
          )}

          {visibleElements.map((el) => {
            const isSel = el.id === selectedId;
            const d = normalizedToDisplay(
              el.geometry.container_bbox,
              imgW,
              imgH,
              scale,
              ox,
              oy,
            );

            const stroke = statusStroke(el.status);

            return (
              <Group
                key={el.id}
                x={d.x}
                y={d.y}
                draggable={viewMode === "edit"}
                ref={(node) => {
                  if (node) nodesRef.current[el.id] = node;
                  else delete nodesRef.current[el.id];

                  // لو العنصر المختار اتعمله mount بعد effect، اربط transformer مباشرة
                  if (
                    node &&
                    viewMode === "edit" &&
                    el.id === selectedId &&
                    trRef.current
                  ) {
                    trRef.current.nodes([node]);
                    trRef.current.getLayer()?.batchDraw();
                  }
                }}
                onClick={() => onSelect(el.id)}
                onTap={() => onSelect(el.id)}
                onDragEnd={(ev) => {
                  const node = ev.target as Konva.Group;

                  const nextDisplay: DisplayRect = {
                    x: node.x(),
                    y: node.y(),
                    w: d.w,
                    h: d.h,
                  };

                  const next = displayToNormalized(
                    nextDisplay,
                    imgW,
                    imgH,
                    scale,
                    ox,
                    oy,
                  );

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
                  const newW = Math.max(minSize, d.w * sx);
                  const newH = Math.max(minSize, d.h * sy);

                  node.scaleX(1);
                  node.scaleY(1);

                  const nextDisplay: DisplayRect = {
                    x: node.x(),
                    y: node.y(),
                    w: newW,
                    h: newH,
                  };

                  const next = displayToNormalized(
                    nextDisplay,
                    imgW,
                    imgH,
                    scale,
                    ox,
                    oy,
                  );

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
                <ElementShape
                  el={el}
                  w={d.w}
                  h={d.h}
                  langMode={langMode}
                  stroke={stroke}
                  viewMode={viewMode}
                />

                {isSel && viewMode === "edit" && (
                  <Rect
                    x={0}
                    y={0}
                    width={d.w}
                    height={d.h}
                    stroke="#000"
                    dash={[6, 4]}
                    fillEnabled={false}
                    listening={false}
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
        </Layer>
      </Stage>

      <div className="absolute bottom-3 right-3 bg-white/90 border rounded px-2 py-1 text-xs">
        Zoom: {(zoom * 100).toFixed(0)}%
      </div>
    </div>
  );
}

function ElementShape({
  el,
  w,
  h,
  langMode,
  stroke,
  viewMode,
}: {
  el: PageElement;
  w: number;
  h: number;
  langMode: LangMode;
  stroke: string;
  viewMode: ViewMode;
}) {
  const padding = Number(el.container.params?.padding ?? 12);
  const cornerRadius = Number(el.container.params?.cornerRadius ?? 18);

  const text =
    langMode === "translated" ? el.text.translated || "" : el.text.original;

  const textX = padding;
  const textY = padding;
  const textW = Math.max(0, w - padding * 2);
  const textH = Math.max(0, h - padding * 2);

  const fill = el.style.fill;
  const sw = el.style.strokeWidth;

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
        <Text
          x={textX}
          y={textY}
          width={textW}
          height={textH}
          text={text}
          fontSize={el.style.fontSize}
          align={el.style.align}
          verticalAlign="middle"
          listening={false}
        />
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
        <Text
          x={textX}
          y={textY}
          width={textW}
          height={textH}
          text={text}
          fontSize={el.style.fontSize}
          align={el.style.align}
          verticalAlign="middle"
          listening={false}
        />
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
        <Text
          x={textX}
          y={textY}
          width={textW}
          height={textH}
          text={text}
          fontSize={el.style.fontSize}
          align={el.style.align}
          verticalAlign="middle"
          listening={false}
        />
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
        <Text
          x={textX}
          y={textY}
          width={textW}
          height={textH}
          text={text}
          fontSize={el.style.fontSize}
          align={el.style.align}
          verticalAlign="middle"
          listening={false}
        />
      </>
    );
  }

  if (el.container.template_id === "bubble_cloud") {
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
        <Text
          x={textX}
          y={textY}
          width={textW}
          height={textH}
          text={text}
          fontSize={el.style.fontSize}
          align={el.style.align}
          verticalAlign="middle"
          listening={false}
        />
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
        <Text
          x={8}
          y={8}
          width={Math.max(0, w - 16)}
          height={Math.max(0, h - 16)}
          text={text || "SFX"}
          fontSize={el.style.fontSize}
          align="center"
          verticalAlign="middle"
          listening={false}
        />
      </>
    );
  }

  // plain text
  return (
    <>
      {viewMode === "edit" ? (
        <Rect
          x={0}
          y={0}
          width={w}
          height={h}
          fill={"#00000000"}
          stroke={stroke}
          strokeWidth={1}
          dash={[6, 4]}
        />
      ) : null}
      <Text
        x={0}
        y={0}
        width={w}
        height={h}
        text={text}
        fontSize={el.style.fontSize}
        align={el.style.align}
        verticalAlign="middle"
        listening={false}
      />
    </>
  );
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
