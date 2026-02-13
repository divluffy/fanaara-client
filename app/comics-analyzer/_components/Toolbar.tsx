"use client";

import Link from "next/link";

export default function Toolbar({
  pageId,
  chapterId,
  hasJson,

  analyzing,
  analyzeError,

  serverLoading,
  serverSaving,
  serverNotice,
  serverError,

  onAnalyze,
  onPullFromServer,
  onSaveToServer,
  onClearLocal,
  onCopyJson,
  onDownloadJson,
}: {
  pageId: string;
  chapterId?: string;
  hasJson: boolean;

  analyzing: boolean;
  analyzeError: string | null;

  serverLoading: boolean;
  serverSaving: boolean;
  serverNotice: string | null;
  serverError: string | null;

  onAnalyze: () => void;
  onPullFromServer: () => void;
  onSaveToServer: () => void;

  onClearLocal: () => void;
  onCopyJson: () => Promise<void>;
  onDownloadJson: () => void;
}) {
  return (
    <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/comics-analyzer"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            ← Dashboard
          </Link>

          {chapterId ? (
            <Link
              href={`/comics-analyzer/chapter/${chapterId}`}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              title="Back to chapter pages"
            >
              Chapter
            </Link>
          ) : null}

          <div className="hidden text-sm text-slate-500 md:block">
            <span className="font-medium text-slate-700">pageId:</span> {pageId}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            onClick={onAnalyze}
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
            disabled={analyzing}
            title="POST /comics-analyzer/pages/:pageId/analyze"
          >
            {analyzing ? "Analyzing..." : "Analyze"}
          </button>

          <button
            onClick={onPullFromServer}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            disabled={serverLoading}
            title="GET /comics-analyzer/pages/:pageId"
          >
            {serverLoading ? "Loading..." : "Pull"}
          </button>

          <button
            onClick={onSaveToServer}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            disabled={!hasJson || serverSaving}
            title="PUT /comics-analyzer/pages/:pageId"
          >
            {serverSaving ? "Saving..." : "Save"}
          </button>

          <button
            onClick={onClearLocal}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            title="Clear localStorage for this pageId"
          >
            Clear Local
          </button>

          <button
            onClick={onCopyJson}
            disabled={!hasJson}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Copy JSON
          </button>

          <button
            onClick={onDownloadJson}
            disabled={!hasJson}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Download
          </button>
        </div>
      </div>

      {(serverNotice || analyzeError || serverError) && (
        <div className="mx-auto max-w-[1400px] px-4 pb-3">
          <div
            className={[
              "rounded-lg border px-3 py-2 text-sm",
              analyzeError || serverError
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-slate-200 bg-slate-50 text-slate-700",
            ].join(" ")}
          >
            {analyzeError || serverError || serverNotice}
          </div>
        </div>
      )}
    </div>
  );
}
