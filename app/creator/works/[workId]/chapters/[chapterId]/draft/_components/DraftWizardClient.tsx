// app\creator\works\[workId]\chapters\[chapterId]\draft\_components\DraftWizardClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { nanoid } from "nanoid";
import {
  useGetCreatorChapterDraftQuery,
  usePresignCreatorUploadsMutation,
  useCreateCreatorPagesMutation,
  useStartCreatorAnalysisMutation,
  useGetCreatorAnalysisJobQuery,
} from "@/store/api.creatorComics.inject";

async function readImageSize(file: File) {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej(new Error("Failed to load image"));
    });
    return {
      width: img.naturalWidth || img.width,
      height: img.naturalHeight || img.height,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function uploadWithProgress(
  putUrl: string,
  file: File,
  onProgress: (pct: number) => void,
) {
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", putUrl, true);
    xhr.setRequestHeader(
      "Content-Type",
      file.type || "application/octet-stream",
    );
    xhr.upload.onprogress = (evt) => {
      if (!evt.lengthComputable) return;
      onProgress(Math.round((evt.loaded / evt.total) * 100));
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Upload failed ${xhr.status}`));
    xhr.onerror = () => reject(new Error("Upload network error"));
    xhr.send(file);
  });
}

type LocalFile = {
  id: string;
  file: File;
  width: number;
  height: number;
};

export default function DraftWizardClient({
  workId,
  chapterId,
}: {
  workId: string;
  chapterId: string;
}) {
  const router = useRouter();
  const sp = useSearchParams();

  const step = Number(sp.get("step") || "2"); // default step 2
  const jobId = sp.get("jobId") || "";

  console.log("chapterId: ", chapterId);
  const { data, isLoading, isError, error, refetch } =
    useGetCreatorChapterDraftQuery({ chapterId });
  console.log("error: ", error);

  const [presign] = usePresignCreatorUploadsMutation();
  const [createPages] = useCreateCreatorPagesMutation();
  const [startAnalysis, { isLoading: starting }] =
    useStartCreatorAnalysisMutation();

  // ✅ polling auto عبر RTK Query (refresh-safe لو jobId موجود في URL)
  const jobQuery = useGetCreatorAnalysisJobQuery(
    { jobId },
    { skip: !jobId, pollingInterval: 1000 },
  );

  const [localFiles, setLocalFiles] = useState<LocalFile[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [uploading, setUploading] = useState(false);
  const [uiError, setUiError] = useState<string | null>(null);

  const hasPages = (data?.pages?.length ?? 0) > 0;

  const doneByAnnotations = useMemo(() => {
    const pages = data?.pages ?? [];
    if (!pages.length) return false;
    return pages.every((p) => !!p.annotations);
  }, [data]);

  useEffect(() => {
    const st = jobQuery.data?.status;
    if (!st) return;

    if (st === "COMPLETED") {
      router.replace(`/creator/works/${workId}/chapters/${chapterId}/editor`);
    }
  }, [jobQuery.data?.status, router, workId, chapterId]);

  async function onPickFiles(files: File[]) {
    setUiError(null);
    const next: LocalFile[] = [];

    try {
      for (const f of files) {
        const dim = await readImageSize(f);
        next.push({
          id: nanoid(),
          file: f,
          width: dim.width,
          height: dim.height,
        });
      }
      setLocalFiles(next);
    } catch (e: any) {
      console.error("readImageSize failed", e);
      setUiError(e?.message ?? "Failed to read image sizes");
    }
  }

  async function uploadAndRegister() {
    if (!localFiles.length) return;

    setUiError(null);
    setUploading(true);

    try {
      const resp = await presign({
        workId,
        chapterId,
        files: localFiles.map((x) => ({
          clientFileId: x.id,
          filename: x.file.name,
          contentType: x.file.type || "application/octet-stream",
        })),
      }).unwrap();

      const uploadById = new Map<string, any>();
      for (const u of resp.uploads) uploadById.set(u.clientFileId, u);

      for (const f of localFiles) {
        const u = uploadById.get(f.id);
        if (!u) throw new Error(`Missing presign for fileId=${f.id}`);

        setProgress((p) => ({ ...p, [f.id]: 0 }));
        await uploadWithProgress(u.putUrl, f.file, (pct) =>
          setProgress((p) => ({ ...p, [f.id]: pct })),
        );
      }

      await createPages({
        chapterId,
        pages: localFiles.map((f, idx) => ({
          orderIndex: idx,
          objectKey: uploadById.get(f.id).objectKey,
          originalFilename: f.file.name,
          width: f.width,
          height: f.height,
        })),
      }).unwrap();

      setLocalFiles([]);
      setProgress({});
      await refetch();

      router.replace(
        `/creator/works/${workId}/chapters/${chapterId}/setup?step=3`,
      );
    } catch (e: any) {
      console.error("uploadAndRegister failed", e);
      setUiError(e?.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function runProcess() {
    setUiError(null);
    try {
      const res = await startAnalysis({
        chapterId,
        model: "gpt-4o-2024-08-06",
        detail: "high",
        force: false,
      }).unwrap();

      router.replace(
        `/creator/works/${workId}/chapters/${chapterId}/setup?step=3&jobId=${res.jobId}`,
      );
    } catch (e: any) {
      console.error("startAnalysis failed", e);
      setUiError(e?.message ?? "Failed to start analysis");
    }
  }

  if (isLoading) {
    return <div className="p-6 text-sm text-gray-600">Loading draft...</div>;
  }

  if (isError) {
    return (
      <div className="p-6 space-y-2">
        <div className="text-sm text-red-600">Failed to load draft.</div>
        <pre className="text-xs text-gray-700 whitespace-pre-wrap">
          {JSON.stringify(error, null, 2)}
        </pre>
        <button className="px-3 py-2 rounded border" onClick={() => refetch()}>
          Retry
        </button>
      </div>
    );
  }

  const jobStatus = jobQuery.data?.status ?? null;

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold">Draft Wizard</h1>
        <div className="text-xs text-gray-500">
          workId={workId} / chapterId={chapterId}
        </div>
      </div>

      {uiError ? (
        <div className="border border-red-200 bg-red-50 text-red-700 rounded p-3 text-sm">
          {uiError}
        </div>
      ) : null}

      {/* Step 2 */}
      {step === 2 && (
        <section className="border rounded p-4 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Upload Pages</div>
            <button
              className="px-3 py-2 rounded border"
              onClick={() =>
                router.replace(
                  `/creator/works/${workId}/chapters/${chapterId}/draft?step=3`,
                )
              }
              disabled={!hasPages}
            >
              Next
            </button>
          </div>

          <button
            className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
            disabled={uploading || localFiles.length === 0}
            onClick={uploadAndRegister}
          >
            {uploading ? "Uploading..." : "Upload + Save Draft"}
          </button>

          {hasPages ? (
            <div className="text-sm text-gray-700">
              Pages already saved in draft: {data?.pages.length}
            </div>
          ) : (
            <>
              <label className="px-4 py-2 rounded bg-black text-white cursor-pointer inline-block">
                Select images
                <input
                  className="hidden"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files ?? []);
                    if (files.length) void onPickFiles(files);
                    e.currentTarget.value = "";
                  }}
                />
              </label>

              {localFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm text-gray-700">
                    Selected: {localFiles.length} (order = selection order)
                  </div>

                  <button
                    className="px-4 py-2 rounded bg-black text-white"
                    onClick={uploadAndRegister}
                  >
                    Upload + Save Draft
                  </button>

                  <div className="space-y-1 text-xs text-gray-600">
                    {localFiles.map((f) => (
                      <div key={f.id}>
                        {f.file.name} — {progress[f.id] ?? 0}%
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <section className="border rounded p-4 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Process (AI)</div>
            <button
              className="px-3 py-2 rounded border"
              onClick={() =>
                router.replace(
                  `/creator/works/${workId}/chapters/${chapterId}/draft?step=2`,
                )
              }
            >
              Back
            </button>
          </div>

          <div className="text-sm text-gray-700">
            Pages: {data?.pages.length ?? 0} — analyzed:{" "}
            {doneByAnnotations ? "yes" : "no"}
          </div>

          <button
            className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
            disabled={!hasPages || starting}
            onClick={runProcess}
          >
            {starting
              ? "Starting..."
              : doneByAnnotations
                ? "Re-run AI Analysis"
                : "Run AI Analysis"}
          </button>

          {jobId ? (
            <div className="text-sm">
              jobId: <span className="font-mono">{jobId}</span>
            </div>
          ) : null}

          {jobQuery.data ? (
            <div className="text-sm">
              Status: <b>{jobQuery.data.status}</b>
              {jobQuery.data.error ? (
                <div className="text-xs text-red-600 mt-1">
                  {jobQuery.data.error}
                </div>
              ) : null}
            </div>
          ) : null}

          {jobQuery.data?.progress?.pages?.length ? (
            <div className="grid md:grid-cols-2 gap-2 text-xs">
              {jobQuery.data.progress.pages.map((p: any) => (
                <div
                  key={p.pageId}
                  className="border rounded px-2 py-2 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono truncate">
                      {p.pageId.slice(0, 8)}...
                    </span>
                    <span>{p.status}</span>
                  </div>
                  {p.error ? (
                    <div className="text-[11px] text-red-700">
                      {p.error.errorCode}: {p.error.fixHint}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}

          {jobStatus === "FAILED" ? (
            <div className="text-sm text-red-600">
              Analysis failed. You can retry (optionally with force=true).
            </div>
          ) : null}
        </section>
      )}
    </main>
  );
}

function StepChip({ active, label }: { active: boolean; label: string }) {
  return (
    <div
      className={[
        "px-3 py-1 rounded border text-xs",
        active ? "bg-black text-white border-black" : "",
      ].join(" ")}
    >
      {label}
    </div>
  );
}
