"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "@/design/DeButton";
import { cn } from "@/utils/cn";
import {
  FiChevronDown,
  FiChevronUp,
  FiCrosshair,
  FiMaximize2,
  FiMinus,
  FiMove,
  FiPlus,
} from "react-icons/fi";

type Viewport = { x: number; y: number; scale: number };

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

const HUD_W = 380;
const HUD_H = 96; // مع سطر السلايدر (يتغير حسب collapse)

export function CanvasHud({
  size,
  viewport,
  fitScale,
  minScale,
  maxScale,
  fitLock,
  selectedId,

  onFit,
  onZoomToPct,
  onZoomIn,
  onZoomOut,
  onCenterOnSelection,
}: {
  size: { w: number; h: number };
  viewport: Viewport;
  fitScale: number;
  minScale: number;
  maxScale: number;
  fitLock: boolean;
  selectedId: string | null;

  onFit: () => void;
  onZoomToPct: (pct: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onCenterOnSelection: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  // HUD draggable state
  const [hudMoved, setHudMoved] = useState(false);
  const [hudPos, setHudPos] = useState({ x: 12, y: 12 });

  const hudDragRef = useRef<{
    startX: number;
    startY: number;
    baseX: number;
    baseY: number;
    pointerId: number;
  } | null>(null);

  const hudHeight = collapsed ? 56 : HUD_H;

  const clampHud = useCallback(
    (pos: { x: number; y: number }) => {
      const maxX = Math.max(12, size.w - HUD_W - 12);
      const maxY = Math.max(12, size.h - hudHeight - 12);
      return {
        x: clamp(pos.x, 12, maxX),
        y: clamp(pos.y, 12, maxY),
      };
    },
    [size.w, size.h, hudHeight],
  );

  useEffect(() => {
    // default top-right
    if (!hudMoved) {
      setHudPos(
        clampHud({
          x: Math.max(12, size.w - HUD_W - 12),
          y: 12,
        }),
      );
    } else {
      setHudPos((p) => clampHud(p));
    }
  }, [size.w, size.h, hudMoved, clampHud]);

  const zoomPct = useMemo(() => {
    const z = (viewport.scale / Math.max(0.00001, fitScale)) * 100;
    return clamp(Math.round(z), 25, 600);
  }, [viewport.scale, fitScale]);

  const canZoomOut = viewport.scale > minScale + 1e-6;
  const canZoomIn = viewport.scale < maxScale - 1e-6;

  return (
    <div
      className="absolute z-20 select-none"
      style={{ left: hudPos.x, top: hudPos.y, width: HUD_W }}
      onPointerDown={(e) => {
        // prevent stage panning click-through
        e.stopPropagation();
      }}
      onWheel={(e) => {
        // prevent stage zoom wheel when cursor is on HUD
        e.stopPropagation();
      }}
    >
      <div
        className={cn(
          "overflow-hidden rounded-2xl border border-border-subtle",
          "bg-background-elevated/80 backdrop-blur-md",
          "shadow-[var(--shadow-sm)]",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 px-3 py-2 bg-background-soft/60 border-b border-border-subtle">
          {/* Drag handle فقط */}
          <div
            className={cn(
              "flex items-center gap-2 min-w-0",
              "cursor-grab active:cursor-grabbing",
              "select-none",
            )}
            onPointerDown={(e) => {
              // لو ضغطت على زر/عنصر تفاعلي لا تبدأ drag
              const t = e.target as HTMLElement;
              if (t.closest("button, a, input, textarea, [role='button']"))
                return;

              e.preventDefault();
              e.stopPropagation();
              setHudMoved(true);

              hudDragRef.current = {
                startX: e.clientX,
                startY: e.clientY,
                baseX: hudPos.x,
                baseY: hudPos.y,
                pointerId: e.pointerId,
              };

              (e.currentTarget as HTMLDivElement).setPointerCapture(
                e.pointerId,
              );
            }}
            onPointerMove={(e) => {
              const d = hudDragRef.current;
              if (!d || d.pointerId !== e.pointerId) return;
              const nx = d.baseX + (e.clientX - d.startX);
              const ny = d.baseY + (e.clientY - d.startY);
              setHudPos(clampHud({ x: nx, y: ny }));
            }}
            onPointerUp={(e) => {
              const d = hudDragRef.current;
              if (!d || d.pointerId !== e.pointerId) return;
              hudDragRef.current = null;
              try {
                (e.currentTarget as HTMLDivElement).releasePointerCapture(
                  e.pointerId,
                );
              } catch {}
            }}
            onPointerCancel={() => {
              hudDragRef.current = null;
            }}
            title="اسحب لتحريك لوحة التحكم"
          >
            <FiMove className="text-foreground/70" />
            <div className="min-w-0">
              <div className="text-xs font-semibold text-foreground-strong leading-4">
                التحكم بالصورة
              </div>
              <div className="text-[11px] text-foreground/60 leading-4">
                اسحب لتحريك اللوحة
              </div>
            </div>
          </div>

          {/* Actions (الأزرار) */}
          <div className="flex items-center gap-1">
            <Button
              iconOnly
              size="xs"
              variant={fitLock ? "solid" : "soft"}
              tone="neutral"
              tooltip="ملاءمة داخل الشاشة"
              aria-label="Fit to screen"
              onClick={onFit}
            >
              <FiMaximize2 />
            </Button>

            <Button
              size="xs"
              variant="soft"
              tone="neutral"
              tooltip="100% حسب الملاءمة"
              onClick={() => onZoomToPct(100)}
              className="px-2"
            >
              100%
            </Button>

            <Button
              iconOnly
              size="xs"
              variant="soft"
              tone="neutral"
              tooltip="توسيط على العنصر المحدد"
              aria-label="Center on selection"
              onClick={onCenterOnSelection}
              disabled={!selectedId}
            >
              <FiCrosshair />
            </Button>

            <Button
              iconOnly
              size="xs"
              variant="plain"
              tone="neutral"
              tooltip={collapsed ? "توسيع" : "تصغير اللوحة"}
              aria-label={collapsed ? "Expand HUD" : "Collapse HUD"}
              onClick={() => setCollapsed((v) => !v)}
            >
              {collapsed ? <FiChevronDown /> : <FiChevronUp />}
            </Button>
          </div>
        </div>

        {/* Body */}
        {!collapsed && (
          <div className="px-3 py-2 flex items-center gap-2">
            <Button
              iconOnly
              size="sm"
              variant="soft"
              tone="neutral"
              tooltip="تصغير"
              aria-label="Zoom out"
              onClick={onZoomOut}
              disabled={!canZoomOut}
            >
              <FiMinus />
            </Button>

            <input
              className={cn("flex-1 h-2 cursor-pointer", "accent-foreground")}
              type="range"
              min={25}
              max={600}
              value={zoomPct}
              onChange={(e) => {
                const pct = clamp(Number(e.target.value || 100), 25, 600);
                onZoomToPct(pct);
              }}
            />

            <Button
              iconOnly
              size="sm"
              variant="soft"
              tone="neutral"
              tooltip="تكبير"
              aria-label="Zoom in"
              onClick={onZoomIn}
              disabled={!canZoomIn}
            >
              <FiPlus />
            </Button>

            <div
              className={cn(
                "w-14 text-right text-xs font-semibold tabular-nums",
                "text-foreground-strong",
              )}
              title="نسبة التكبير"
            >
              {zoomPct}%
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
