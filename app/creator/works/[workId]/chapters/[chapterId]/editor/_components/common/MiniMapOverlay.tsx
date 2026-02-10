"use client";
import { useState } from "react";
import { FiEye, FiEyeOff, FiMap, FiMove } from "react-icons/fi";

export function MiniMapOverlay({
  minimap,
  page,
  spaceDown,
}: {
  minimap: {
    w: number;
    h: number;
    rect: { x: number; y: number; w: number; h: number };
  };
  page: { image: { url: string } };
  spaceDown: boolean;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const canToggle = !spaceDown; // اختياري: امنع الطي أثناء السحب

  return (
    <div className="absolute bottom-3 right-3 z-10">
      <div className="rounded-2xl border border-zinc-200/70 bg-white/70 shadow-sm ring-1 ring-black/5 backdrop-blur supports-[backdrop-filter]:bg-white/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-zinc-200/60 bg-gradient-to-b from-white to-zinc-50/70 px-3 py-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-200/70 bg-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] text-zinc-700">
              <FiMap />
            </span>
          </div>

          <button
            type="button"
            onClick={() => canToggle && setCollapsed((v) => !v)}
            disabled={!canToggle}
            aria-expanded={!collapsed}
            className={[
              "inline-flex items-center gap-1 rounded-full border border-zinc-200/70 bg-white/70 px-2 py-1",
              "text-[11px] font-medium text-zinc-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]",
              "transition hover:bg-white/90 disabled:opacity-60 disabled:cursor-not-allowed",
            ].join(" ")}
            title={
              spaceDown ? "سحب" : collapsed ? "توسيع الخريطة" : "إخفاء الخريطة"
            }
          >
            {spaceDown ? (
              <>
                <FiMove />
                <span className="tabular-nums">سحب</span>
              </>
            ) : collapsed ? (
              <>
                <FiEye />
                <span className="tabular-nums">توسيع</span>
              </>
            ) : (
              <>
                <FiEyeOff />
                <span className="tabular-nums">إخفاء</span>
              </>
            )}
          </button>
        </div>

        {/* Body (collapsible) */}
        <div
          className={[
            "grid transition-[grid-template-rows] duration-200 ease-out",
            collapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]",
          ].join(" ")}
        >
          <div className="min-h-0 overflow-hidden">
            <div
              className={[
                "p-2 transition-opacity duration-200",
                collapsed ? "opacity-0" : "opacity-100",
              ].join(" ")}
            >
              <div
                className="relative overflow-hidden rounded-xl border border-zinc-200/70 bg-zinc-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]"
                style={{ width: minimap.w, height: minimap.h }}
              >
                <img
                  src={page.image.url}
                  alt=""
                  draggable={false}
                  className="block select-none"
                  style={{
                    width: minimap.w,
                    height: minimap.h,
                    objectFit: "cover",
                  }}
                />

                {/* Viewport rectangle */}
                <div
                  className="pointer-events-none absolute rounded-md border-2 border-fuchsia-500/90 bg-fuchsia-500/10 shadow-[0_0_0_1px_rgba(255,255,255,0.65),0_6px_20px_rgba(217,70,239,0.15)]"
                  style={{
                    left: minimap.rect.x,
                    top: minimap.rect.y,
                    width: minimap.rect.w,
                    height: minimap.rect.h,
                  }}
                />

                {/* subtle vignette */}
                <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-black/5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
