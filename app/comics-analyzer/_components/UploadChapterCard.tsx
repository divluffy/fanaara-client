"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateChapterMutation } from "../comicsAnalyzerApi";

function formatBytes(bytes: number) {
  const units = ["B", "KB", "MB", "GB"];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export default function UploadChapterCard() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const [createChapter, createState] = useCreateChapterMutation();

  const sortedFiles = useMemo(() => {
    return [...files].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true }),
    );
  }, [files]);

  const totalBytes = useMemo(
    () => sortedFiles.reduce((acc, f) => acc + f.size, 0),
    [sortedFiles],
  );

  const onPickFiles = (picked: FileList | null) => {
    if (!picked) return;
    const arr = Array.from(picked).filter((f) => f.type.startsWith("image/"));
    setFiles(arr);
  };

  const onUpload = async () => {
    if (sortedFiles.length === 0) return;

    const form = new FormData();
    if (title.trim()) form.append("title", title.trim());

    // Field name MUST match backend interceptor: "pages"
    for (const f of sortedFiles) form.append("pages", f);

    const res = await createChapter(form).unwrap();

    // Redirect to editor for first page
    router.push(
      `/comics-analyzer/editor/${res.firstPageId}?chapterId=${res.chapterId}`,
    );
  };

  const err = createState.isError
    ? "Upload failed. Check backend + CORS + baseApi baseUrl."
    : null;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold">Upload Chapter</h2>
          <p className="mt-1 text-sm text-slate-600">
            ارفع صفحات الفصل (jpg/png/webp). سيتم حفظ الصور في S3 وإنشاء Pages
            ثم تحويلك للمحرر.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-700">
            Chapter title (optional)
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            placeholder="e.g. Chapter 12 — The Encounter"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-700">Pages</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => onPickFiles(e.target.files)}
            className="mt-1 block w-full text-sm"
          />
          <div className="mt-2 text-xs text-slate-600">
            {sortedFiles.length > 0 ? (
              <>
                {sortedFiles.length} files • {formatBytes(totalBytes)} • sorted
                by filename
              </>
            ) : (
              "No files selected"
            )}
          </div>
        </div>

        {sortedFiles.length > 0 && (
          <div className="max-h-40 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
            <ol className="list-decimal space-y-1 pl-5">
              {sortedFiles.slice(0, 50).map((f) => (
                <li key={f.name}>
                  {f.name}{" "}
                  <span className="text-slate-500">
                    ({formatBytes(f.size)})
                  </span>
                </li>
              ))}
              {sortedFiles.length > 50 && <li className="text-slate-500">…</li>}
            </ol>
          </div>
        )}

        <button
          onClick={onUpload}
          disabled={sortedFiles.length === 0 || createState.isLoading}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {createState.isLoading ? "Uploading..." : "Upload & Open Editor"}
        </button>

        {err && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {err}
          </div>
        )}
      </div>
    </section>
  );
}
