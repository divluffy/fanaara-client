// app\creator\works\[workId]\chapters\[chapterId]\editor\_components\PreviewModal.tsx
"use client";

import React, { useEffect, useState } from "react";
import type { EditorPageItem, LangMode } from "./types";
import CanvasStage from "./CanvasStage";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

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
  const [idx, setIdx] = useState(currentIndex);

  useEffect(() => {
    if (!open) return;
    setIdx(currentIndex);
  }, [currentIndex, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setIdx((v) => Math.max(0, v - 1));
      if (e.key === "ArrowRight")
        setIdx((v) => Math.min(pages.length - 1, v + 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, pages.length]);

  if (!open) return null;

  const page = pages[idx];

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4"
      dir="rtl"
      lang="ar"
    >
      <div className="bg-white w-full max-w-7xl h-[92vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col border">
        <div className="border-b px-4 py-3 flex items-center gap-3">
          <div className="font-semibold">المعاينة</div>
          <Badge variant="info">
            {langMode === "translated" ? "الترجمة" : "الأصل"}
          </Badge>
          <Badge variant="neutral">
            صفحة {idx + 1}/{pages.length}
          </Badge>

          <div className="ml-auto flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIdx((v) => Math.max(0, v - 1))}
              disabled={idx <= 0}
            >
              السابق
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIdx((v) => Math.min(pages.length - 1, v + 1))}
              disabled={idx >= pages.length - 1}
            >
              التالي
            </Button>
            <Button size="sm" variant="secondary" onClick={onClose}>
              إغلاق
            </Button>
          </div>
        </div>

        <div className="flex-1 min-h-0 flex">
          <div className="flex-1 min-h-0">
            <CanvasStage
              page={page}
              viewMode="preview"
              langMode={langMode}
              selectedId={null}
              hoverId={null}
              onSelect={() => {}}
              onChangeDoc={() => {}}
            />
          </div>

          <aside className="w-[420px] border-l p-4 overflow-auto space-y-3 bg-zinc-50">
            <div className="text-sm font-semibold">معلومات الصفحة</div>

            <div className="rounded-xl border bg-white p-3">
              <div className="text-xs text-zinc-500 mb-1">اسم الملف</div>
              <div className="text-sm text-zinc-800">
                {page.image.originalFilename}
              </div>
            </div>

            <div className="rounded-xl border bg-white p-3">
              <div className="text-sm font-semibold mb-2">
                الكلمات المفتاحية
              </div>
              <div className="text-sm text-zinc-700">
                {(page.annotations?.meta.keywords ?? []).join(", ") || "—"}
              </div>
            </div>

            <div className="rounded-xl border bg-white p-3">
              <div className="text-sm font-semibold mb-2">وصف المشهد</div>
              <div className="text-sm text-zinc-700">
                {page.annotations?.meta.sceneDescription ?? "—"}
              </div>
            </div>

            <div className="text-xs text-zinc-500">
              تلميح: استخدم الأسهم للتنقل داخل المعاينة.
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
