// app\creator\works\[workId]\chapters\[chapterId]\editor\_components\ChapterEditorClient.tsx
"use client";

import Link from "next/link";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useGetCreatorChapterDraftQuery,
  useSaveCreatorPageAnnotationsMutation,
} from "@/store/api.creatorComics.inject";

import CanvasStage from "./CanvasStage";
import ElementsPanel from "./ElementsPanel";
import PropertiesPanel from "./PropertiesPanel";
import PreviewModal from "./PreviewModal";

import type {
  EditorPageItem,
  PageAnnotationsDoc,
  PageElement,
  ViewMode,
  LangMode,
} from "./types";
import { ensureAnnotations } from "./utils";

type SaveStatus = "idle" | "dirty" | "saving" | "saved" | "error";

function nowIso() {
  return new Date().toISOString();
}

function shallowEqual(a: any, b: any) {
  if (a === b) return true;
  if (!a || !b) return false;
  const ak = Object.keys(a);
  const bk = Object.keys(b);
  if (ak.length !== bk.length) return false;
  for (const k of ak) if (a[k] !== b[k]) return false;
  return true;
}

/**
 * Merge server pages payload with local pages state:
 * - always refresh image URLs + orderIndex + analysis (server truth)
 * - keep local annotations if page is dirty
 * - otherwise, take server annotations (ensureAnnotations)
 */
function reconcilePages(params: {
  serverPages: EditorPageItem[];
  prevPages: EditorPageItem[];
  dirtyById: Record<string, boolean>;
}): EditorPageItem[] {
  const { serverPages, prevPages, dirtyById } = params;

  const prevMap = new Map(prevPages.map((p) => [p.id, p]));

  const merged = serverPages.map((sp) => {
    const prev = prevMap.get(sp.id);

    // Always ensure annotations exists (from server or local)
    const serverAnnotations = ensureAnnotations(
      sp.id,
      (sp as any).annotations ?? null,
    );

    if (!prev) {
      return {
        ...sp,
        annotations: serverAnnotations,
      };
    }

    const isDirty = !!dirtyById[sp.id];

    // Keep local annotations if dirty; else take server
    const nextAnnotations = isDirty
      ? ensureAnnotations(sp.id, prev.annotations ?? null)
      : serverAnnotations;

    // Always refresh image + analysis from server
    const nextImage =
      prev.image && sp.image && shallowEqual(prev.image, sp.image)
        ? prev.image
        : sp.image;

    return {
      ...prev,
      ...sp, // includes orderIndex
      image: nextImage,
      analysis: (sp as any).analysis ?? null,
      annotations: nextAnnotations,
    };
  });

  // Sort by orderIndex (server truth)
  merged.sort((a, b) => a.orderIndex - b.orderIndex);

  return merged;
}

export default function ChapterEditorClient({
  workId,
  chapterId,
}: {
  workId: string;
  chapterId: string;
}) {
  console.log("setup props ChapterEditorClient", { workId, chapterId });
  // RTK: fetch draft/editor payload
  const {
    data: serverPayload,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetCreatorChapterDraftQuery({ chapterId });

  // RTK: autosave
  const [saveAnnotationsMutation] = useSaveCreatorPageAnnotationsMutation();

  // Local state for editing
  const [pages, setPages] = useState<EditorPageItem[]>([]);
  const [currentPageId, setCurrentPageId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>("edit");
  const [langMode, setLangMode] = useState<LangMode>("original");
  const [previewOpen, setPreviewOpen] = useState(false);

  // Dirty + save state per page
  const [dirtyById, setDirtyById] = useState<Record<string, boolean>>({});
  const dirtyRef = useRef<Record<string, boolean>>({});
  useEffect(() => {
    dirtyRef.current = dirtyById;
  }, [dirtyById]);

  const [saveStatusById, setSaveStatusById] = useState<
    Record<string, SaveStatus>
  >({});

  // Debounce timers per page
  const timersRef = useRef<Record<string, any>>({});
  const pendingRef = useRef<Record<string, PageAnnotationsDoc>>({});

  // Build server pages as EditorPageItem[]
  const serverPages: EditorPageItem[] = useMemo(() => {
    const sp = (serverPayload as any)?.pages ?? [];
    // Ensure each page has annotations object (server might return null before analysis)
    return sp.map((p: any) => ({
      ...p,
      annotations: ensureAnnotations(p.id, p.annotations ?? null),
    })) as EditorPageItem[];
  }, [serverPayload]);

  // On first load or refetch: reconcile into local pages
  useEffect(() => {
    if (!serverPayload) return;

    setPages((prev) =>
      reconcilePages({
        serverPages,
        prevPages: prev,
        dirtyById: dirtyRef.current,
      }),
    );

    // Set current page if not set
    setCurrentPageId((prevId) => {
      if (prevId && serverPages.some((p) => p.id === prevId)) return prevId;
      return serverPages[0]?.id ?? null;
    });
  }, [serverPayload, serverPages]);

  const currentIndex = useMemo(() => {
    if (!currentPageId) return -1;
    return pages.findIndex((p) => p.id === currentPageId);
  }, [pages, currentPageId]);

  const currentPage = useMemo(() => {
    if (!currentPageId) return null;
    return pages.find((p) => p.id === currentPageId) ?? null;
  }, [pages, currentPageId]);

  const currentAnnotations = currentPage?.annotations ?? null;

  const selectedElement: PageElement | null = useMemo(() => {
    if (!currentAnnotations || !selectedId) return null;
    return currentAnnotations.elements.find((e) => e.id === selectedId) ?? null;
  }, [currentAnnotations, selectedId]);

  // ---------- Saving helpers ----------
  const scheduleSave = useCallback(
    (pageId: string, doc: PageAnnotationsDoc) => {
      pendingRef.current[pageId] = doc;

      // mark save state
      setSaveStatusById((s) => ({ ...s, [pageId]: "dirty" }));
      setDirtyById((d) => ({ ...d, [pageId]: true }));

      // reset timer
      if (timersRef.current[pageId]) clearTimeout(timersRef.current[pageId]);

      timersRef.current[pageId] = setTimeout(async () => {
        const toSave = pendingRef.current[pageId];
        if (!toSave) return;

        try {
          setSaveStatusById((s) => ({ ...s, [pageId]: "saving" }));

          await saveAnnotationsMutation({
            pageId,
            annotations: toSave,
          }).unwrap();

          delete pendingRef.current[pageId];

          setDirtyById((d) => ({ ...d, [pageId]: false }));
          setSaveStatusById((s) => ({ ...s, [pageId]: "saved" }));
        } catch (e) {
          console.error("[autosave] failed", e);
          setSaveStatusById((s) => ({ ...s, [pageId]: "error" }));
        }
      }, 800);
    },
    [saveAnnotationsMutation],
  );

  const flushSave = useCallback(
    async (pageId: string) => {
      if (!pageId) return;

      if (timersRef.current[pageId]) {
        clearTimeout(timersRef.current[pageId]);
        timersRef.current[pageId] = null;
      }

      const toSave =
        pendingRef.current[pageId] ??
        pages.find((p) => p.id === pageId)?.annotations ??
        null;

      if (!toSave) return;

      if (!dirtyRef.current[pageId]) {
        // not dirty -> nothing
        return;
      }

      try {
        setSaveStatusById((s) => ({ ...s, [pageId]: "saving" }));
        await saveAnnotationsMutation({ pageId, annotations: toSave }).unwrap();
        delete pendingRef.current[pageId];
        setDirtyById((d) => ({ ...d, [pageId]: false }));
        setSaveStatusById((s) => ({ ...s, [pageId]: "saved" }));
      } catch (e) {
        console.error("[flushSave] failed", e);
        setSaveStatusById((s) => ({ ...s, [pageId]: "error" }));
      }
    },
    [pages, saveAnnotationsMutation],
  );

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      const timers = timersRef.current;
      Object.values(timers).forEach((t) => t && clearTimeout(t));
    };
  }, []);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      const hasDirty = Object.values(dirtyRef.current).some(Boolean);
      if (!hasDirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  // ---------- Update annotations (local + autosave) ----------
  const updatePageAnnotations = useCallback(
    (
      pageId: string,
      updater: (doc: PageAnnotationsDoc) => PageAnnotationsDoc,
    ) => {
      setPages((prev) => {
        const next = prev.map((p) => {
          if (p.id !== pageId) return p;
          const base = ensureAnnotations(pageId, p.annotations ?? null);
          const updated = updater(base);
          return {
            ...p,
            annotations: { ...updated, updatedAt: nowIso() },
          };
        });

        const updatedDoc = next.find((x) => x.id === pageId)?.annotations;
        if (updatedDoc) scheduleSave(pageId, updatedDoc);

        return next;
      });
    },
    [scheduleSave],
  );

  const updateCurrentAnnotations = useCallback(
    (updater: (doc: PageAnnotationsDoc) => PageAnnotationsDoc) => {
      if (!currentPageId) return;
      updatePageAnnotations(currentPageId, updater);
    },
    [currentPageId, updatePageAnnotations],
  );

  // ---------- Page navigation ----------
  const goToPage = useCallback(
    async (pageId: string) => {
      if (!pageId) return;

      // flush current page save (fire-and-forget, but ensures "last changes" aren't lost)
      if (currentPageId) void flushSave(currentPageId);

      setCurrentPageId(pageId);
      setSelectedId(null);
    },
    [currentPageId, flushSave],
  );

  // ---------- UI helpers ----------
  const headerTitle = (serverPayload as any)?.work?.title ?? "Work";
  const chapterTitle = (serverPayload as any)?.chapter?.title ?? "Chapter";

  const statsTotal = (serverPayload as any)?.stats?.totalPages ?? pages.length;
  const statsAnalyzed =
    (serverPayload as any)?.stats?.analyzedPages ??
    pages.filter(
      (p) => !!p.annotations && (p.annotations.elements?.length ?? 0) > 0,
    ).length;

  const saveBadge = useMemo(() => {
    if (!currentPageId) return "—";
    const st = saveStatusById[currentPageId] ?? "idle";
    if (st === "idle") return dirtyById[currentPageId] ? "dirty" : "saved";
    if (st === "dirty") return "dirty";
    return st;
  }, [currentPageId, saveStatusById, dirtyById]);

  // ---------- Render ----------
  if (isLoading) {
    return <div className="p-6 text-sm text-gray-600">Loading editor...</div>;
  }

  if (isError) {
    return (
      <div className="p-6 space-y-2">
        <div className="text-sm text-red-600">Failed to load editor.</div>
        <pre className="text-xs text-gray-700 whitespace-pre-wrap">
          {JSON.stringify(error, null, 2)}
        </pre>
        <button className="px-3 py-2 rounded border" onClick={() => refetch()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="h-dvh flex flex-col">
      {/* Top Bar */}
      <div className="border-b p-3 flex items-center gap-3">
        <div className="min-w-0">
          <div className="font-semibold truncate">{headerTitle}</div>
          <div className="text-xs text-gray-500 truncate">{chapterTitle}</div>
        </div>

        <div className="ml-2 text-xs text-gray-600">
          Pages: {statsAnalyzed}/{statsTotal}
        </div>

        <div className="ml-auto flex items-center gap-2 flex-wrap">
          <button
            className={chip(viewMode === "edit")}
            onClick={() => setViewMode("edit")}
          >
            Edit
          </button>
          <button
            className={chip(viewMode === "preview")}
            onClick={() => setViewMode("preview")}
          >
            Preview
          </button>

          <div className="w-px h-6 bg-gray-200 mx-1" />

          <button
            className={chip(langMode === "original")}
            onClick={() => setLangMode("original")}
          >
            Original
          </button>
          <button
            className={chip(langMode === "translated")}
            onClick={() => setLangMode("translated")}
          >
            Translated
          </button>

          <div className="w-px h-6 bg-gray-200 mx-1" />

          <button
            className="px-3 py-2 rounded border"
            onClick={() => setPreviewOpen(true)}
          >
            Preview Modal
          </button>

          <Link
            className="px-3 py-2 rounded border"
            href={`/creator/works/${workId}/chapters/${chapterId}/setup`}
          >
            Setup
          </Link>

          <Link
            className="px-3 py-2 rounded border"
            href={`/creator/works/${workId}/chapters/${chapterId}/preview`}
          >
            Preview Page
          </Link>

          <Link className="px-3 py-2 rounded border" href="/creator/works">
            Works
          </Link>

          <button
            className="px-3 py-2 rounded border"
            onClick={() => refetch()}
          >
            {isFetching ? "Refreshing..." : "Refresh URLs"}
          </button>

          <button
            className="px-3 py-2 rounded border"
            disabled={!currentPageId}
            onClick={() => currentPageId && flushSave(currentPageId)}
          >
            Save Now
          </button>

          <div className="text-xs text-gray-500">
            Save: <b>{saveBadge}</b>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 min-h-0">
        {/* Thumbnails */}
        <aside className="w-[220px] border-r p-3 overflow-auto space-y-2">
          <div className="text-sm font-semibold">Pages</div>

          {pages.length === 0 ? (
            <div className="text-sm text-gray-600">No pages yet.</div>
          ) : (
            pages.map((p, idx) => {
              const active = p.id === currentPageId;
              const status =
                saveStatusById[p.id] ?? (dirtyById[p.id] ? "dirty" : "saved");

              return (
                <button
                  key={p.id}
                  className={[
                    "w-full border rounded overflow-hidden text-left",
                    active ? "ring-2 ring-black" : "",
                  ].join(" ")}
                  onClick={() => void goToPage(p.id)}
                >
                  <div className="relative">
                    <img
                      src={p.image.url}
                      alt=""
                      className="w-full h-24 object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      #{idx + 1}
                    </div>
                    <div className="absolute top-2 right-2 bg-white/90 text-[10px] px-2 py-1 rounded">
                      {status}
                    </div>
                  </div>
                  <div className="p-2 text-xs text-gray-600 truncate">
                    {p.image.originalFilename}
                  </div>
                </button>
              );
            })
          )}
        </aside>

        {/* Elements list */}
        <ElementsPanel
          page={currentPage}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onChangeDoc={updateCurrentAnnotations}
        />

        {/* Canvas */}
        <CanvasStage
          page={currentPage}
          viewMode={viewMode}
          langMode={langMode}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onChangeDoc={updateCurrentAnnotations}
        />

        {/* Properties */}
        <PropertiesPanel
          page={currentPage}
          selected={selectedElement}
          onChangeDoc={updateCurrentAnnotations}
        />
      </div>

      <PreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        pages={pages}
        currentIndex={Math.max(0, currentIndex)}
        langMode={langMode}
      />
    </div>
  );
}

function chip(active: boolean) {
  return [
    "px-3 py-2 rounded border text-sm",
    active ? "bg-black text-white border-black" : "",
  ].join(" ");
}
