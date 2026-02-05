// app\creator\works\[workId]\chapters\[chapterId]\preview\page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { useGetCreatorChapterDraftQuery } from "@/store/api.creatorComics.inject";
import CanvasStage from "../editor/_components/CanvasStage"; // reuse
import { LangMode, ViewMode } from "../editor/_components/types";

export default function ChapterPreviewClient({
  workId,
  chapterId,
}: {
  workId: string;
  chapterId: string;
}) {
  const { data, isLoading, refetch } = useGetCreatorChapterDraftQuery({
    chapterId,
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [langMode, setLangMode] = useState<LangMode>("original");
  const viewMode: ViewMode = "preview";

  const pages = data?.pages ?? [];
  const current = pages[currentIndex] ?? null;

  return (
    <div className="h-dvh flex flex-col">
      <div className="border-b p-3 flex items-center gap-2">
        <div className="font-semibold">Preview</div>
        <div className="text-xs text-gray-500">
          {data?.work?.title} / {data?.chapter?.title}
        </div>

        <div className="ml-auto flex gap-2">
          <button
            className="px-3 py-2 rounded border"
            onClick={() => refetch()}
          >
            Refresh
          </button>
          <button
            className="px-3 py-2 rounded border"
            onClick={() =>
              setLangMode(langMode === "original" ? "translated" : "original")
            }
          >
            Lang: {langMode}
          </button>

          <Link className="px-3 py-2 rounded border" href="/creator/works">
            Works
          </Link>
          <Link
            className="px-3 py-2 rounded bg-black text-white"
            href={`/creator/works/${workId}/chapters/${chapterId}/editor`}
          >
            Open Editor
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="p-6 text-sm text-gray-600">Loading...</div>
      ) : (
        <div className="flex flex-1 min-h-0">
          <aside className="w-[220px] border-r p-3 overflow-auto space-y-2">
            <div className="text-sm font-semibold">Pages</div>
            {pages.map((p, idx) => (
              <button
                key={p.id}
                className={[
                  "w-full border rounded overflow-hidden",
                  idx === currentIndex ? "ring-2 ring-black" : "",
                ].join(" ")}
                onClick={() => setCurrentIndex(idx)}
              >
                <img
                  src={p.image.url}
                  alt=""
                  className="w-full h-24 object-cover"
                />
                <div className="p-2 text-xs text-gray-600 truncate">
                  #{idx + 1} • {p.image.originalFilename}
                </div>
              </button>
            ))}
          </aside>

          <div className="flex-1 min-h-0 flex flex-col">
            <div className="border-b p-3 grid md:grid-cols-2 gap-3 bg-white">
              <div className="border rounded p-3">
                <div className="text-sm font-semibold mb-1">Keywords</div>
                <div className="text-sm text-gray-700">
                  {current?.annotations?.meta?.keywords?.join(", ")}
                </div>
              </div>
              <div className="border rounded p-3">
                <div className="text-sm font-semibold mb-1">
                  Scene Description
                </div>
                <div className="text-sm text-gray-700">
                  {current?.annotations?.meta?.sceneDescription}
                </div>
              </div>
            </div>

            <CanvasStage
              page={current}
              viewMode={viewMode}
              langMode={langMode}
              selectedId={null}
              onSelect={() => {}}
              onChangeDoc={() => {}}
            />
          </div>
        </div>
      )}
    </div>
  );
}
