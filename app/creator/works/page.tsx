// app\creator\works\page.tsx
"use client";

import Link from "next/link";
import {
  useListCreatorWorksQuery,
  useDeleteCreatorWorkMutation,
} from "@/store/api.creatorComics.inject";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function WorksListClient() {
  const { data, isLoading, isError, error, refetch } =
    useListCreatorWorksQuery();
  const [deleteWork, { isLoading: deleting }] = useDeleteCreatorWorkMutation();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const works = data?.works ?? [];

  async function onDelete(workId: string) {
    const ok = confirm(
      "Delete this work? This will remove chapters/pages/analysis.",
    );
    if (!ok) return;

    try {
      setDeletingId(workId);
      await deleteWork({ workId }).unwrap();
      await refetch();
    } catch (e) {
      console.error("delete work failed", e);
      alert("Failed to delete work. Check console/logs.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold">My Works</h1>
        <button
          className="ml-auto px-3 py-2 rounded border"
          onClick={() => refetch()}
        >
          Refresh
        </button>
        <Link
          className="px-3 py-2 rounded bg-black text-white"
          href="/creator/works/new"
        >
          + New Work
        </Link>
      </div>

      {isLoading ? (
        <div className="text-sm text-gray-600">Loading...</div>
      ) : isError ? (
        <div className="space-y-2">
          <div className="text-sm text-red-600">Failed to load works.</div>
          <pre className="text-xs text-gray-700 whitespace-pre-wrap">
            {JSON.stringify(error, null, 2)}
          </pre>
          <button
            className="px-3 py-2 rounded border"
            onClick={() => refetch()}
          >
            Retry
          </button>
        </div>
      ) : works.length === 0 ? (
        <div className="text-sm text-gray-600">No works yet.</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {works.map((w) => {
            console.log("w: ", w);
            const ch = w.latestChapter;

            return (
              <div
                key={w.id}
                className="border rounded p-4 bg-white space-y-3 cursor-pointer hover:bg-gray-50"
                onClick={() => {
                  if (!ch) return router.push("/creator/works/new");
                  router.push(`/creator/works/${w.id}/chapters/${ch.id}/setup`);
                }}
              >
                {/* ...existing card UI */}
                <h1>{w?.title}</h1>

                <div className="flex gap-2 flex-wrap">
                  {/* existing links */}
                  <button
                    className="px-3 py-2 rounded border text-red-600"
                    disabled={deleting && deletingId === w.id}
                    onClick={() => onDelete(w.id)}
                  >
                    {deleting && deletingId === w.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
