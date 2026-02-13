"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { AnalyzerBBoxPct, AnalyzerElement, AnalyzerElementType, AnalyzerPageJson } from "../types";

type DragState =
  | {
      kind: "move";
      elementId: string;
      startPointerPct: { x: number; y: number };
      startBBox: AnalyzerBBoxPct;
    }
  | {
      kind: "resize";
      elementId: string;
      handle: "nw" | "ne" | "sw" | "se";
      startPointerPct: { x: number; y: number };
      startBBox: AnalyzerBBoxPct;
    };

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function getTypeColor(type: AnalyzerElementType) {
  switch (type) {
    case "dialogue":
      return "#2563eb"; // blue
    case "narration":
      return "#16a34a"; // green
    case "free_text":
      return "#f59e0b"; // amber
    case "sfx":
      return "#7c3aed"; // violet
    default:
      return "#0f172a";
  }
}

function bboxPctToPx(b: AnalyzerBBoxPct, w: number, h: number) {
  return {
    x: b.x * w,
    y: b.y * h,
    w: b.w * w,
    h: b.h * h,
  };
}

function withAlpha(hex: string, alpha: number) {
  // expects #rrggbb
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return hex;
  const r = parseInt(m[1], 16);
  const g = parseInt(m[2], 16);
  const b = parseInt(m[3], 16);
  const a = clamp(alpha, 0, 1);
  return `rgba(${r},${g},${b},${a})`;
}

function computeHoverTransformPx(b: { x: number; y: number; w: number; h: number }, s: number) {
  const cx = b.x + b.w / 2;
  const cy = b.y + b.h / 2;
  // Use SVG transform matrix for stable order:
  // p' = (p - c)*s + c => p*s + (c - c*s)
  const e = cx - cx * s;
  const f = cy - cy * s;
  return `matrix(${s},0,0,${s},${e},${f})`;
}

function computeContainerMatrix(
  containerBboxPx: { x: number; y: number; w: number; h: number },
  targetBboxPx: { x: number; y: number; w: number; h: number }
) {
  // Map original container bbox to target bbox:
  // p' = p*s + t; where s = target/orig, t = target.xy - orig.xy*s
  const sx = containerBboxPx.w > 0 ? targetBboxPx.w / containerBboxPx.w : 1;
  const sy = containerBboxPx.h > 0 ? targetBboxPx.h / containerBboxPx.h : 1;
  const e = targetBboxPx.x - containerBboxPx.x * sx;
  const f = targetBboxPx.y - containerBboxPx.y * sy;
  return `matrix(${sx},0,0,${sy},${e},${f})`;
}

export default function OverlaySvg({
  pageJson,
  selectedId,
  onSelect,
  onBBoxChange,
}: {
  pageJson: AnalyzerPageJson;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onBBoxChange: (id: string, bboxPct: AnalyzerBBoxPct) => void;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);

  const W = pageJson.image.naturalWidth;
  const H = pageJson.image.naturalHeight;

  const elementsById = useMemo(() => {
    const map = new Map<string, AnalyzerElement>();
    for (const el of pageJson.elements) map.set(el.id, el);
    return map;
  }, [pageJson.elements]);

  function getPointerPct(ev: PointerEvent) {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const x = (ev.clientX - rect.left) / rect.width;
    const y = (ev.clientY - rect.top) / rect.height;
    return { x: clamp(x, 0, 1), y: clamp(y, 0, 1) };
  }

  useEffect(() => {
    if (!dragState) return;

    const onMove = (ev: PointerEvent) => {
      ev.preventDefault();
      const el = elementsById.get(dragState.elementId);
      if (!el) return;

      const p = getPointerPct(ev);
      const dx = p.x - dragState.startPointerPct.x;
      const dy = p.y - dragState.startPointerPct.y;

      if (dragState.kind === "move") {
        const start = dragState.startBBox;
        const x = clamp(start.x + dx, 0, 1 - start.w);
        const y = clamp(start.y + dy, 0, 1 - start.h);
        onBBoxChange(dragState.elementId, { x, y, w: start.w, h: start.h });
        return;
      }

      // Resize
      const minW = 0.01;
      const minH = 0.01;

      const start = dragState.startBBox;
      let left = start.x;
      let right = start.x + start.w;
      let top = start.y;
      let bottom = start.y + start.h;

      const handle = dragState.handle;
      const movingLeft = handle.includes("w");
      const movingRight = handle.includes("e");
      const movingTop = handle.includes("n");
      const movingBottom = handle.includes("s");

      if (movingLeft) left = left + dx;
      if (movingRight) right = right + dx;
      if (movingTop) top = top + dy;
      if (movingBottom) bottom = bottom + dy;

      // Enforce min size with correct fixed edge semantics
      if (movingLeft) left = Math.min(left, right - minW);
      if (movingRight) right = Math.max(right, left + minW);
      if (movingTop) top = Math.min(top, bottom - minH);
      if (movingBottom) bottom = Math.max(bottom, top + minH);

      // Clamp to bounds 0..1 (clamp only the moving edges)
      if (movingLeft) left = clamp(left, 0, right - minW);
      if (movingRight) right = clamp(right, left + minW, 1);
      if (movingTop) top = clamp(top, 0, bottom - minH);
      if (movingBottom) bottom = clamp(bottom, top + minH, 1);

      const x = clamp(left, 0, 1);
      const y = clamp(top, 0, 1);
      const w = clamp(right - left, minW, 1);
      const h = clamp(bottom - top, minH, 1);

      // Ensure x+w, y+h do not exceed 1
      const x2 = clamp(x, 0, 1 - w);
      const y2 = clamp(y, 0, 1 - h);

      onBBoxChange(dragState.elementId, { x: x2, y: y2, w, h });
    };

    const onUp = () => {
      setDragState(null);
    };

    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragState, elementsById, onBBoxChange]);

  const startMove = (elementId: string, ev: React.PointerEvent) => {
    ev.preventDefault();
    ev.stopPropagation();
    const el = elementsById.get(elementId);
    if (!el) return;

    setDragState({
      kind: "move",
      elementId,
      startPointerPct: { x: ev.nativeEvent.offsetX / 1, y: ev.nativeEvent.offsetY / 1 }, // fallback; replaced below
      startBBox: el.geometry.bboxPct,
    });

    // Better: compute start pointer from screen coords
    const p = getPointerPct(ev.nativeEvent as unknown as PointerEvent);
    setDragState({
      kind: "move",
      elementId,
      startPointerPct: p,
      startBBox: el.geometry.bboxPct,
    });
  };

  const startResize = (elementId: string, handle: "nw" | "ne" | "sw" | "se", ev: React.PointerEvent) => {
    ev.preventDefault();
    ev.stopPropagation();
    const el = elementsById.get(elementId);
    if (!el) return;

    const p = getPointerPct(ev.nativeEvent as unknown as PointerEvent);
    setDragState({
      kind: "resize",
      elementId,
      handle,
      startPointerPct: p,
      startBBox: el.geometry.bboxPct,
    });
  };

  const isSelected = (id: string) => selectedId === id;
  const isHovered = (id: string) => hoveredId === id;

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 h-full w-full touch-none"
      viewBox={`0 0 ${W} ${H}`}
      onPointerDown={() => onSelect(null)}
    >
      {pageJson.elements.map((el) => {
        const bpx = bboxPctToPx(el.geometry.bboxPct, W, H);
        const color = getTypeColor(el.type);

        const hovered = isHovered(el.id);
        const selected = isSelected(el.id);

        const hoverScale = hovered && !dragState ? 1.02 : 1.0;
        const transform = hoverScale !== 1 ? computeHoverTransformPx(bpx, hoverScale) : undefined;

        const label = `${el.type}${typeof el.readingOrder === "number" ? ` #${el.readingOrder}` : ""}`;

        // Container path transform (phase1): map container bbox to geometry bbox
        let containerTransform: string | undefined = undefined;
        if (el.container) {
          const cpx = bboxPctToPx(el.container.bboxPct, W, H);
          containerTransform = computeContainerMatrix(cpx, bpx);
        }

        // Text style
        const plateColor = el.styleHints?.plateColor;
        const plateOpacity = el.styleHints?.plateOpacity;
        const bg =
          plateColor && typeof plateOpacity === "number" ? withAlpha(plateColor, plateOpacity) : plateColor ?? "transparent";

        const textColor = el.styleHints?.textColor ?? "#0f172a";
        const strokeColor = el.styleHints?.textStrokeColor ?? "#0f172a";
        const strokeWidth = el.styleHints?.textStrokeWidth ?? 0;

        const fontSize =
          el.type === "sfx" ? 44 : el.type === "dialogue" ? 20 : el.type === "narration" ? 18 : 16;
        const fontWeight = el.type === "sfx" ? 900 : 600;

        const moveHandleSize = 14; // viewBox px
        const resizeHandleSize = 16;

        return (
          <g key={el.id} transform={transform}>
            {/* Container shape (optional) */}
            {el.container ? (
              <path
                d={el.container.svgPath}
                transform={containerTransform}
                fill={el.container.style?.fill ?? "rgba(255,255,255,0.0)"}
                stroke={el.container.style?.stroke ?? color}
                strokeWidth={el.container.style?.strokeWidth ?? 4}
                opacity={selected ? 1 : 0.85}
                onPointerEnter={() => setHoveredId(el.id)}
                onPointerLeave={() => setHoveredId((prev) => (prev === el.id ? null : prev))}
                onPointerDown={(ev) => {
                  // Select on click, but don't start move (move uses explicit handle)
                  ev.stopPropagation();
                  onSelect(el.id);
                }}
              />
            ) : null}

            {/* Selection / hover bbox outline */}
            <rect
              x={bpx.x}
              y={bpx.y}
              width={bpx.w}
              height={bpx.h}
              fill="transparent"
              stroke={selected ? color : hovered ? color : "transparent"}
              strokeWidth={selected ? 4 : 3}
              strokeDasharray={selected ? "0" : "6 6"}
              opacity={selected ? 1 : 0.9}
              onPointerEnter={() => setHoveredId(el.id)}
              onPointerLeave={() => setHoveredId((prev) => (prev === el.id ? null : prev))}
              onPointerDown={(ev) => {
                ev.stopPropagation();
                onSelect(el.id);
              }}
            />

            {/* Label */}
            <g>
              <rect
                x={bpx.x}
                y={Math.max(0, bpx.y - 28)}
                width={Math.min(260, bpx.w)}
                height={24}
                rx={8}
                fill="rgba(255,255,255,0.85)"
                stroke={selected ? color : "rgba(15,23,42,0.15)"}
              />
              <text
                x={bpx.x + 10}
                y={Math.max(0, bpx.y - 12)}
                fontSize={14}
                fontFamily="ui-sans-serif, system-ui"
                fill="#0f172a"
              >
                {label}
              </text>
            </g>

            {/* Text box (selectable) */}
            <foreignObject
              x={bpx.x}
              y={bpx.y}
              width={bpx.w}
              height={bpx.h}
              onPointerEnter={() => setHoveredId(el.id)}
              onPointerLeave={() => setHoveredId((prev) => (prev === el.id ? null : prev))}
              onPointerDown={(ev) => {
                // Do NOT preventDefault: keep text selectable.
                ev.stopPropagation();
                onSelect(el.id);
              }}
            >
              <div
                xmlns="http://www.w3.org/1999/xhtml"
                style={{
                  width: "100%",
                  height: "100%",
                  padding: "10px",
                  boxSizing: "border-box",
                  background: bg,
                  borderRadius: "10px",
                  color: textColor,
                  fontSize: `${fontSize}px`,
                  fontWeight: fontWeight as any,
                  lineHeight: 1.1,
                  userSelect: "text",
                  WebkitTextStroke: strokeWidth > 0 ? `${strokeWidth}px ${strokeColor}` : undefined,
                  textShadow:
                    strokeWidth > 0 ? `0 0 ${Math.max(1, strokeWidth)}px ${strokeColor}` : undefined,
                  display: "flex",
                  alignItems: el.type === "sfx" ? "center" : "flex-start",
                  justifyContent: el.type === "sfx" ? "center" : "flex-start",
                  whiteSpace: "pre-wrap",
                }}
              >
                {el.text.raw}
              </div>
            </foreignObject>

            {/* Move handle (only when selected or hovered) */}
            {(selected || hovered) && (
              <g>
                <circle
                  cx={bpx.x + moveHandleSize}
                  cy={bpx.y + moveHandleSize}
                  r={moveHandleSize}
                  fill="rgba(15,23,42,0.9)"
                  stroke="white"
                  strokeWidth={3}
                  style={{ cursor: "grab" }}
                  onPointerEnter={() => setHoveredId(el.id)}
                  onPointerLeave={() => setHoveredId((prev) => (prev === el.id ? null : prev))}
                  onPointerDown={(ev) => startMove(el.id, ev)}
                />
                <text
                  x={bpx.x + moveHandleSize}
                  y={bpx.y + moveHandleSize + 5}
                  textAnchor="middle"
                  fontSize={16}
                  fontFamily="ui-sans-serif, system-ui"
                  fill="white"
                  pointerEvents="none"
                >
                  ↕
                </text>
              </g>
            )}

            {/* Resize handles (only when selected) */}
            {selected ? (
              <g>
                {(
                  [
                    { h: "nw", x: bpx.x, y: bpx.y, cursor: "nwse-resize" },
                    { h: "ne", x: bpx.x + bpx.w, y: bpx.y, cursor: "nesw-resize" },
                    { h: "sw", x: bpx.x, y: bpx.y + bpx.h, cursor: "nesw-resize" },
                    { h: "se", x: bpx.x + bpx.w, y: bpx.y + bpx.h, cursor: "nwse-resize" },
                  ] as const
                ).map((p) => (
                  <rect
                    key={p.h}
                    x={p.x - resizeHandleSize / 2}
                    y={p.y - resizeHandleSize / 2}
                    width={resizeHandleSize}
                    height={resizeHandleSize}
                    rx={5}
                    fill="white"
                    stroke={color}
                    strokeWidth={4}
                    style={{ cursor: p.cursor }}
                    onPointerDown={(ev) => startResize(el.id, p.h, ev)}
                  />
                ))}
              </g>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
