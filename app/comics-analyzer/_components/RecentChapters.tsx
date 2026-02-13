"use client";

import Link from "next/link";
import { useGetChaptersQuery } from "../comicsAnalyzerApi";

export default function RecentChapters() {
  const { data, isLoading, isError } = useGetChaptersQuery({ limit: 10 });

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-base font-semibold">Recent Chapters</h2>
      <p className="mt-1 text-sm text-slate-600">
        آخر الفصول التي تم رفعها (محليًا).
      </p>

      <div className="mt-4">
        {isLoading && <div className="text-sm text-slate-600">Loading…</div>}
        {isError && (
          <div className="text-sm text-red-700">Failed to load chapters</div>
        )}

        {!isLoading && !isError && (!data || data.items.length === 0) && (
          <div className="text-sm text-slate-600">No chapters yet.</div>
        )}

        {!!data && data.items.length > 0 && (
          <div className="space-y-2">
            {data.items.map((c) => (
              <Link
                key={c.chapterId}
                href={`/comics-analyzer/chapter/${c.chapterId}`}
                className="block rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm hover:bg-slate-50"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium text-slate-900">
                    {c.title ?? `Chapter ${c.chapterId.slice(0, 8)}`}
                  </div>
                  <div className="text-xs text-slate-500">
                    {c.pagesCount} pages
                  </div>
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {new Date(c.createdAt).toLocaleString()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
