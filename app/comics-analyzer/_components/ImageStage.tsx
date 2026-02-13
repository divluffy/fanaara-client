"use client";

import type { AnalyzerBBoxPct, AnalyzerPageJson } from "../types";
import OverlaySvg from "./OverlaySvg";

export default function ImageStage({
  pageJson,
  selectedId,
  onSelect,
  onBBoxChange,
}: {
  pageJson: AnalyzerPageJson | null;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onBBoxChange: (id: string, bboxPct: AnalyzerBBoxPct) => void;
}) {
  if (!pageJson) {
    return (
      <div className="flex min-h-[520px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
        <div>
          <div className="text-base font-semibold text-slate-800">No analysis loaded</div>
          <div className="mt-2 text-sm text-slate-600">
            اضغط <span className="font-medium">Analyze</span> لإنشاء mock Page JSON ورؤية overlays.
          </div>
        </div>
      </div>
    );
  }

  const { naturalWidth, naturalHeight, src } = pageJson.image;

  // Fixed aspect ratio container ensures overlay mapping remains stable.
  return (
    <div className="w-full">
      <div
        className="relative w-full overflow-hidden rounded-lg border border-slate-200 bg-white"
        style={{
          aspectRatio: `${naturalWidth} / ${naturalHeight}`,
        }}
      >
        {/* Base image (NOT modified) */}
        {/* We intentionally use <img> for data: URL compatibility */}
        <img
          src={src}
          alt={`Page ${pageJson.pageNumber}`}
          className="absolute inset-0 h-full w-full select-none object-contain"
          draggable={false}
        />

        {/* Overlay */}
        <OverlaySvg
          pageJson={pageJson}
          selectedId={selectedId}
          onSelect={onSelect}
          onBBoxChange={onBBoxChange}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
        <div>
          <span className="font-medium text-slate-700">Image:</span> {naturalWidth}×{naturalHeight}
        </div>
        <div>
          <span className="font-medium text-slate-700">Engine:</span> {pageJson.meta.engine} •{" "}
          <span className="font-medium text-slate-700">Version:</span> {pageJson.meta.version}
        </div>
      </div>
    </div>
  );
}
