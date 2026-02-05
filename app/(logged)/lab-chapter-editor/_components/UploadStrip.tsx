"use client";

import { PageDoc } from "./types";

export default function UploadStrip({
  pages,
  currentIndex,
  onPickIndex,
  onPickFiles,
}: {
  pages: PageDoc[];
  currentIndex: number;
  onPickIndex: (idx: number) => void;
  onPickFiles: (files: File[]) => void;
}) {
  return (
    <div className="border-b p-3 flex items-center gap-3">
      <label className="px-3 py-2 rounded bg-black text-white cursor-pointer">
        Upload images
        <input
          className="hidden"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length) onPickFiles(files);
            e.currentTarget.value = "";
          }}
        />
      </label>

      <div className="text-sm text-gray-600">
        {pages.length ? `Pages: ${pages.length}` : "No images yet"}
      </div>

      {pages.length > 0 && (
        <div className="flex gap-2 overflow-x-auto ml-auto max-w-[70vw]">
          {pages.map((p, idx) => (
            <button
              key={p.id}
              className={[
                "relative border rounded overflow-hidden shrink-0",
                idx === currentIndex ? "ring-2 ring-black" : "",
              ].join(" ")}
              onClick={() => onPickIndex(idx)}
              title={p.image.name}
            >
              <img src={p.image.url} alt={p.image.name} className="h-14 w-14 object-cover" />
              <div className="absolute bottom-0 left-0 right-0 text-[10px] bg-black/50 text-white px-1 truncate">
                {idx + 1}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
