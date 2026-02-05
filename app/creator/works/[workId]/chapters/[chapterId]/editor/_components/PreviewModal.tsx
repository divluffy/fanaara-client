// app\creator\works\[workId]\chapters\[chapterId]\editor\_components\PreviewModal.tsx
"use client";

import React from "react";
import { EditorPageItem, LangMode } from "./types";

export default function PreviewModal({
  open,
  onClose,
  pages,
  currentIndex,
  langMode,
}: {
  open: boolean;
  onClose: () => void;
  pages: EditorPageItem[];
  currentIndex: number;
  langMode: LangMode;
}) {
  if (!open) return null;

  const page = pages[currentIndex];

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded shadow overflow-hidden flex flex-col">
        <div className="border-b px-4 py-3 flex items-center gap-3">
          <div className="font-semibold">Preview</div>
          <div className="text-xs text-gray-500">({langMode})</div>
          <button
            className="ml-auto px-3 py-2 rounded border"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          <div className="text-sm font-semibold">
            Page #{page.orderIndex + 1}
          </div>
          <img src={page.image.url} alt="" className="w-full rounded border" />

          <div className="grid md:grid-cols-2 gap-3">
            <div className="border rounded p-3">
              <div className="text-sm font-semibold mb-2">Keywords</div>
              <div className="text-sm text-gray-700">
                {(page.annotations?.meta.keywords ?? []).join(", ")}
              </div>
            </div>
            <div className="border rounded p-3">
              <div className="text-sm font-semibold mb-2">
                Scene Description
              </div>
              <div className="text-sm text-gray-700">
                {page.annotations?.meta.sceneDescription ?? ""}
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            (ملاحظة) المعاينة هنا تعرض الصورة الأساسية، والـ overlays ستظهر
            بصرياً داخل الـ Canvas في نفس المحرر.
          </div>
        </div>
      </div>
    </div>
  );
}
