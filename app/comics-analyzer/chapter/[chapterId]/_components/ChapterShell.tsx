"use client";

import Link from "next/link";
import { useGetChapterQuery } from "../../../comicsAnalyzerApi";

export default function ChapterShell({ chapterId }: { chapterId: string }) {
  const { data, isLoading, isError } = useGetChapterQuery({ chapterId });

  if (isLoading) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="text-sm text-slate-600">Loading…</div>
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load chapter
        </div>
        <Link
          className="mt-4 inline-block text-sm text-slate-700 underline"
          href="/comics-analyzer"
        >
          Back
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            className="text-sm text-slate-700 underline"
            href="/comics-analyzer"
          >
            ← Dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">
            {data.title ?? `Chapter ${chapterId.slice(0, 8)}`}
          </h1>
          <div className="mt-1 text-sm text-slate-600">
            {data.pages.length} pages •{" "}
            {new Date(data.createdAt).toLocaleString()}
          </div>
        </div>

        <Link
          href={`/comics-analyzer/editor/${data.firstPageId}?chapterId=${chapterId}`}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Open first page →
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
        {data.pages.map((p) => (
          <Link
            key={p.pageId}
            href={`/comics-analyzer/editor/${p.pageId}?chapterId=${chapterId}`}
            className="group rounded-xl border border-slate-200 bg-white p-2 hover:bg-slate-50"
            title={`Open page ${p.pageNumber}`}
          >
            <div className="relative overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
              <img
                src={p.image.src}
                alt={`Page ${p.pageNumber}`}
                className="aspect-[2/3] w-full object-cover transition-transform group-hover:scale-[1.02]"
              />
            </div>
            <div className="mt-2 flex items-center justify-between gap-2 text-xs text-slate-700">
              <span className="font-medium">#{p.pageNumber}</span>
              <span
                className={
                  p.hasAnalysis ? "text-emerald-700" : "text-slate-500"
                }
              >
                {p.hasAnalysis ? "Analyzed" : "Not analyzed"}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
