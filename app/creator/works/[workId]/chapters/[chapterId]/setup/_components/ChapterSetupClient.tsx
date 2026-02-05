// app\creator\works\[workId]\chapters\[chapterId]\setup\_components\ChapterSetupClient.tsx
"use client";

import Link from "next/link";
import { nanoid } from "nanoid";
import { useEffect, useMemo, useState } from "react";
import SortablePagesGrid, { SortItem } from "./SortablePagesGrid";
import {
  useCreateCreatorPagesMutation,
  useGetCreatorChapterDraftQuery,
  usePresignCreatorUploadsMutation,
  useReorderCreatorPagesMutation,
  useStartCreatorAnalysisMutation,
  useGetCreatorAnalysisJobQuery,
} from "@/store/api.creatorComics.inject";

type LocalFile = {
  id: string;
  file: File;
  previewUrl: string;
  width: number;
  height: number;
};

async function readImageSize(file: File) {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej(new Error("Failed"));
    });
    return {
      width: img.naturalWidth || img.width,
      height: img.naturalHeight || img.height,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function uploadPut(putUrl: string, file: File) {
  const res = await fetch(putUrl, {
    method: "PUT",
    body: file,
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`S3 PUT failed: ${res.status} ${t}`);
  }
}

export default function ChapterSetupClient({
  workId,
  chapterId,
}: {
  workId: string;
  chapterId: string;
}) {
  const { data, isLoading, refetch } = useGetCreatorChapterDraftQuery({
    chapterId,
  });
  console.log("data: ", data);

  const [presign] = usePresignCreatorUploadsMutation();
  const [createPages] = useCreateCreatorPagesMutation();
  const [reorderPages, { isLoading: savingOrder }] =
    useReorderCreatorPagesMutation();
  const [startAnalysis, { isLoading: starting }] =
    useStartCreatorAnalysisMutation();

  const [localFiles, setLocalFiles] = useState<LocalFile[]>([]);
  const [localSort, setLocalSort] = useState<SortItem[]>([]);
  const [remoteSort, setRemoteSort] = useState<SortItem[]>([]);

  // Build remote sortable list when payload changes
  useEffect(() => {
    const pages = data?.pages ?? [];
    setRemoteSort(
      pages
        .slice()
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((p) => ({
          id: p.id,
          label: p.image.originalFilename,
          imageUrl: p.image.url,
        })),
    );
  }, [data?.pages]);

  const pages = data?.pages ?? [];
  const totalPages = data?.stats?.totalPages ?? pages.length ?? 0;
  const analyzedPages =
    data?.stats?.analyzedPages ?? pages.filter((p) => !!p.annotations).length;

  const hasPages = totalPages > 0;
  const ready = hasPages && analyzedPages === totalPages;

  const latestJob = data?.latestJob ?? null;

  const pollJobId =
    latestJob?.id &&
    (latestJob.status === "RUNNING" || latestJob.status === "PENDING")
      ? latestJob.id
      : "";
  const jobQuery = useGetCreatorAnalysisJobQuery(
    { jobId: pollJobId },
    { skip: !pollJobId, pollingInterval: 1000 },
  );

  const jobStatus = jobQuery.data?.status ?? latestJob?.status;

  // If job completed → refetch to get annotations & fresh signed URLs
  useEffect(() => {
    if (jobQuery.data?.status === "COMPLETED") void refetch();
  }, [jobQuery.data?.status, refetch]);

  async function onPickFiles(files: File[]) {
    const next: LocalFile[] = [];
    for (const f of files) {
      const dim = await readImageSize(f);
      next.push({
        id: nanoid(),
        file: f,
        previewUrl: URL.createObjectURL(f),
        width: dim.width,
        height: dim.height,
      });
    }
    setLocalFiles(next);
    setLocalSort(
      next.map((x) => ({
        id: x.id,
        label: x.file.name,
        imageUrl: x.previewUrl,
      })),
    );
  }

  async function uploadAndSaveDraft() {
    if (!localFiles.length) return;

    const pres = await presign({
      workId,
      chapterId,
      files: localFiles.map((x) => ({
        clientFileId: x.id,
        filename: x.file.name,
        contentType: x.file.type || "application/octet-stream",
      })),
    }).unwrap();

    const keyById = new Map(
      pres.uploads.map((u: any) => [u.clientFileId, u.objectKey]),
    );

    // Upload in the localSort order
    for (let i = 0; i < localSort.length; i++) {
      const fileId = localSort[i].id;
      const lf = localFiles.find((x) => x.id === fileId)!;
      const up = pres.uploads.find((u: any) => u.clientFileId === fileId)!;
      await uploadPut(up.putUrl, lf.file);
    }

    await createPages({
      chapterId,
      pages: localSort.map((it, idx) => {
        const lf = localFiles.find((x) => x.id === it.id)!;
        return {
          orderIndex: idx,
          objectKey: keyById.get(it.id)!,
          originalFilename: lf.file.name,
          width: lf.width,
          height: lf.height,
        };
      }),
    }).unwrap();

    // cleanup
    localFiles.forEach((x) => URL.revokeObjectURL(x.previewUrl));
    setLocalFiles([]);
    setLocalSort([]);
    await refetch();
  }

  async function persistRemoteOrder() {
    const order = remoteSort.map((x, idx) => ({
      pageId: x.id,
      orderIndex: idx,
    }));
    await reorderPages({ chapterId, order }).unwrap();
    await refetch();
  }

  async function runAnalysis() {
    const res = await startAnalysis({
      chapterId,
      model: "gpt-4o-2024-08-06",
      detail: "high",
    }).unwrap();
    console.log("runAnalysis res: ", res);
    await refetch();
  }

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold">Setup Draft</h1>
        <div className="text-xs text-gray-500">
          {data?.work?.title} / {data?.chapter?.title}
        </div>

        <div className="ml-auto flex gap-2">
          <Link className="px-3 py-2 rounded border" href="/creator/works">
            Back to Works
          </Link>
          {ready ? (
            <>
              <Link
                className="px-3 py-2 rounded bg-black text-white"
                href={`/creator/works/${workId}/chapters/${chapterId}/editor`}
              >
                Open Editor
              </Link>
              <Link
                className="px-3 py-2 rounded border"
                href={`/creator/works/${workId}/chapters/${chapterId}/preview`}
              >
                Preview
              </Link>
            </>
          ) : null}
        </div>
      </div>

      {isLoading ? (
        <div className="text-sm text-gray-600">Loading...</div>
      ) : (
        <>
          <div className="border rounded p-4 bg-white space-y-2">
            <div className="text-sm font-semibold">Progress</div>
            <div className="text-sm text-gray-700">
              Pages analyzed: {analyzedPages}/{totalPages}
            </div>
            {jobStatus ? (
              <div className="text-xs text-gray-600">
                Latest job: {jobStatus}
              </div>
            ) : null}
            {jobQuery.data?.progress?.pages?.length ? (
              <div className="grid md:grid-cols-2 gap-2 text-xs">
                {jobQuery.data.progress.pages.map((p: any) => (
                  <div
                    key={p.pageId}
                    className="border rounded px-2 py-2 flex justify-between"
                  >
                    <span className="font-mono">{p.pageId.slice(0, 8)}...</span>
                    <span>{p.status}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {!hasPages ? (
            <section className="border rounded p-4 bg-white space-y-3">
              <div className="font-semibold">1) Upload Chapter Pages</div>

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

              {localSort.length > 0 ? (
                <>
                  <div className="text-sm text-gray-700">
                    Reorder before upload:
                  </div>
                  <SortablePagesGrid
                    items={localSort}
                    onChange={setLocalSort}
                  />
                  <button
                    className="px-4 py-2 rounded bg-black text-white"
                    onClick={uploadAndSaveDraft}
                  >
                    Upload & Save Draft
                  </button>
                </>
              ) : (
                <div className="text-sm text-gray-600">
                  Select images to continue.
                </div>
              )}
            </section>
          ) : (
            <>
              <section className="border rounded p-4 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">2) Reorder Pages (Saved)</div>
                  <button
                    className="px-3 py-2 rounded border disabled:opacity-50"
                    disabled={savingOrder}
                    onClick={persistRemoteOrder}
                  >
                    {savingOrder ? "Saving..." : "Save order"}
                  </button>
                </div>
                <SortablePagesGrid
                  items={remoteSort}
                  onChange={setRemoteSort}
                />
              </section>

              {!ready ? (
                <section className="border rounded p-4 bg-white space-y-3">
                  <div className="font-semibold">3) Run AI Analysis</div>

                  <button
                    className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
                    disabled={
                      starting ||
                      jobStatus === "RUNNING" ||
                      jobStatus === "PENDING"
                    }
                    onClick={runAnalysis}
                  >
                    {jobStatus === "RUNNING"
                      ? "AI is running..."
                      : starting
                        ? "Starting..."
                        : "Start analysis"}
                  </button>

                  <div className="text-xs text-gray-500">
                    (بعد انتهاء التحليل يمكنك فتح editor والمعاينة من الأعلى)
                  </div>
                </section>
              ) : (
                <section className="border rounded p-4 bg-white">
                  <div className="font-semibold">Done</div>
                  <div className="text-sm text-gray-700">
                    All pages analyzed. You can open the editor.
                  </div>
                </section>
              )}
            </>
          )}
        </>
      )}
    </main>
  );
}
