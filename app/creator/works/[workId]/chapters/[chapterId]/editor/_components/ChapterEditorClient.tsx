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
import { nanoid } from "nanoid";

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

import { ensureAnnotations, isTextInputTarget, markEdited } from "./utils";
import { Button, IconButton } from "./ui/button";
import { Badge } from "./ui/badge";
import { Spinner } from "./ui/spinner";
import { cn } from "./ui/cn";
import { Kbd } from "./ui/kbd";

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

function cloneDoc<T>(v: T): T {
  try {
    // @ts-ignore
    if (typeof structuredClone === "function") return structuredClone(v);
  } catch {}
  return JSON.parse(JSON.stringify(v));
}

function timeAgo(iso?: string | null) {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "";
  const diff = Date.now() - t;
  const s = Math.floor(diff / 1000);
  if (s < 10) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
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

    const serverAnnotations = ensureAnnotations(
      sp.id,
      (sp as any).annotations ?? null,
    );

    if (!prev) {
      return { ...sp, annotations: serverAnnotations };
    }

    const isDirty = !!dirtyById[sp.id];

    const nextAnnotations = isDirty
      ? ensureAnnotations(sp.id, prev.annotations ?? null)
      : serverAnnotations;

    const nextImage =
      prev.image && sp.image && shallowEqual(prev.image, sp.image)
        ? prev.image
        : sp.image;

    return {
      ...prev,
      ...sp,
      image: nextImage,
      analysis: (sp as any).analysis ?? null,
      annotations: nextAnnotations,
    };
  });

  merged.sort((a, b) => a.orderIndex - b.orderIndex);
  return merged;
}

type Toast = {
  id: string;
  variant: "info" | "error";
  title: string;
  message?: string;
};

function statusVariant(st: SaveStatus): {
  label: string;
  dot: string;
  badge?: any;
} {
  switch (st) {
    case "saving":
      return { label: "Saving…", dot: "bg-sky-500" };
    case "saved":
      return { label: "Saved", dot: "bg-emerald-500" };
    case "dirty":
      return { label: "Unsaved", dot: "bg-amber-500" };
    case "error":
      return { label: "Save error", dot: "bg-rose-500" };
    default:
      return { label: "—", dot: "bg-zinc-300" };
  }
}

export default function ChapterEditorClient({
  workId,
  chapterId,
}: {
  workId: string;
  chapterId: string;
}) {
  const {
    data: serverPayload,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetCreatorChapterDraftQuery({ chapterId });

  const [saveAnnotationsMutation] = useSaveCreatorPageAnnotationsMutation();

  const [pages, setPages] = useState<EditorPageItem[]>([]);
  const [currentPageId, setCurrentPageId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>("edit");
  const [langMode, setLangMode] = useState<LangMode>("original");

  const [previewOpen, setPreviewOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  // Layout toggles
  const [showPagesRail, setShowPagesRail] = useState(true);
  const [showLayers, setShowLayers] = useState(true);
  const [showInspector, setShowInspector] = useState(true);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);
  const pushToast = useCallback((t: Omit<Toast, "id">) => {
    const id = nanoid();
    const toast: Toast = { id, ...t };
    setToasts((p) => [...p, toast]);
    window.setTimeout(() => {
      setToasts((p) => p.filter((x) => x.id !== id));
    }, 4500);
  }, []);

  // Dirty + save state per page
  const [dirtyById, setDirtyById] = useState<Record<string, boolean>>({});
  const dirtyRef = useRef<Record<string, boolean>>({});
  useEffect(() => {
    dirtyRef.current = dirtyById;
  }, [dirtyById]);

  const [saveStatusById, setSaveStatusById] = useState<
    Record<string, SaveStatus>
  >({});
  const [lastSavedAtById, setLastSavedAtById] = useState<
    Record<string, string>
  >({});

  // Debounce timers per page
  const timersRef = useRef<Record<string, any>>({});
  const pendingRef = useRef<Record<string, PageAnnotationsDoc>>({});

  // History per page (undo/redo)
  const historyRef = useRef<
    Record<
      string,
      {
        past: PageAnnotationsDoc[];
        future: PageAnnotationsDoc[];
        lastMarkAt: number;
      }
    >
  >({});
  const [historyVersion, setHistoryVersion] = useState(0);

  // Clipboard for copy/paste
  const clipboardRef = useRef<PageElement | null>(null);

  const serverPages: EditorPageItem[] = useMemo(() => {
    const sp = (serverPayload as any)?.pages ?? [];
    return sp.map((p: any) => ({
      ...p,
      annotations: ensureAnnotations(p.id, p.annotations ?? null),
    })) as EditorPageItem[];
  }, [serverPayload]);

  useEffect(() => {
    if (!serverPayload) return;

    setPages((prev) =>
      reconcilePages({
        serverPages,
        prevPages: prev,
        dirtyById: dirtyRef.current,
      }),
    );

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

      setSaveStatusById((s) => ({ ...s, [pageId]: "dirty" }));
      setDirtyById((d) => ({ ...d, [pageId]: true }));

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
          setLastSavedAtById((m) => ({ ...m, [pageId]: nowIso() }));
        } catch (e) {
          console.error("[autosave] failed", e);
          setSaveStatusById((s) => ({ ...s, [pageId]: "error" }));
          pushToast({
            variant: "error",
            title: "Autosave failed",
            message: "Your changes are still kept locally. Try “Save now”.",
          });
        }
      }, 700);
    },
    [saveAnnotationsMutation, pushToast],
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
      if (!dirtyRef.current[pageId]) return;

      try {
        setSaveStatusById((s) => ({ ...s, [pageId]: "saving" }));
        await saveAnnotationsMutation({ pageId, annotations: toSave }).unwrap();
        delete pendingRef.current[pageId];
        setDirtyById((d) => ({ ...d, [pageId]: false }));
        setSaveStatusById((s) => ({ ...s, [pageId]: "saved" }));
        setLastSavedAtById((m) => ({ ...m, [pageId]: nowIso() }));
      } catch (e) {
        console.error("[flushSave] failed", e);
        setSaveStatusById((s) => ({ ...s, [pageId]: "error" }));
        pushToast({
          variant: "error",
          title: "Save failed",
          message: "Please check your connection and try again.",
        });
      }
    },
    [pages, saveAnnotationsMutation, pushToast],
  );

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

  // ---------- History helpers ----------
  const recordHistory = useCallback(
    (pageId: string, prevDoc: PageAnnotationsDoc) => {
      const now = Date.now();
      const h = historyRef.current[pageId] ?? {
        past: [],
        future: [],
        lastMarkAt: 0,
      };

      if (now - h.lastMarkAt > 650) {
        h.past.push(cloneDoc(prevDoc));
        if (h.past.length > 200) h.past.shift();
        h.lastMarkAt = now;
      }

      h.future = [];
      historyRef.current[pageId] = h;
      setHistoryVersion((v) => v + 1);
    },
    [],
  );

  const canUndo = useMemo(() => {
    if (!currentPageId) return false;
    const h = historyRef.current[currentPageId];
    return !!h && h.past.length > 0;
  }, [currentPageId, historyVersion]);

  const canRedo = useMemo(() => {
    if (!currentPageId) return false;
    const h = historyRef.current[currentPageId];
    return !!h && h.future.length > 0;
  }, [currentPageId, historyVersion]);

  const undo = useCallback(() => {
    if (!currentPageId) return;
    const h = historyRef.current[currentPageId];
    const cur = pages.find((p) => p.id === currentPageId)?.annotations ?? null;
    if (!h || !cur || h.past.length === 0) return;

    const prev = h.past.pop()!;
    h.future.push(cloneDoc(cur));
    historyRef.current[currentPageId] = h;
    setHistoryVersion((v) => v + 1);

    setPages((prevPages) => {
      const nextPages = prevPages.map((p) =>
        p.id === currentPageId ? { ...p, annotations: prev } : p,
      );
      scheduleSave(currentPageId, prev);
      setDirtyById((d) => ({ ...d, [currentPageId]: true }));
      return nextPages;
    });
  }, [currentPageId, pages, scheduleSave]);

  const redo = useCallback(() => {
    if (!currentPageId) return;
    const h = historyRef.current[currentPageId];
    const cur = pages.find((p) => p.id === currentPageId)?.annotations ?? null;
    if (!h || !cur || h.future.length === 0) return;

    const nxt = h.future.pop()!;
    h.past.push(cloneDoc(cur));
    historyRef.current[currentPageId] = h;
    setHistoryVersion((v) => v + 1);

    setPages((prevPages) => {
      const nextPages = prevPages.map((p) =>
        p.id === currentPageId ? { ...p, annotations: nxt } : p,
      );
      scheduleSave(currentPageId, nxt);
      setDirtyById((d) => ({ ...d, [currentPageId]: true }));
      return nextPages;
    });
  }, [currentPageId, pages, scheduleSave]);

  // ---------- Update annotations (local + autosave + history) ----------
  const updatePageAnnotations = useCallback(
    (
      pageId: string,
      updater: (doc: PageAnnotationsDoc) => PageAnnotationsDoc,
    ) => {
      setPages((prev) => {
        let updatedDoc: PageAnnotationsDoc | null = null;

        const next = prev.map((p) => {
          if (p.id !== pageId) return p;

          const base = ensureAnnotations(pageId, p.annotations ?? null);
          const before = cloneDoc(base); // ✅ protect history from accidental mutations
          const updated = updater(base);

          recordHistory(pageId, before);

          updatedDoc = { ...updated, updatedAt: nowIso() };
          return { ...p, annotations: updatedDoc };
        });

        if (updatedDoc) scheduleSave(pageId, updatedDoc);
        return next;
      });
    },
    [scheduleSave, recordHistory],
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
      if (currentPageId) void flushSave(currentPageId);
      setCurrentPageId(pageId);
      setSelectedId(null);
      setHoverId(null);
    },
    [currentPageId, flushSave],
  );

  // ---------- Editor actions ----------
  const deleteSelected = useCallback(() => {
    if (!currentPageId || !selectedId) return;
    updateCurrentAnnotations((doc) => ({
      ...doc,
      elements: doc.elements.map((e) =>
        e.id === selectedId ? { ...e, status: "deleted" } : e,
      ),
      updatedAt: nowIso(),
    }));
    setSelectedId(null);
  }, [currentPageId, selectedId, updateCurrentAnnotations]);

  const copySelected = useCallback(() => {
    if (!selectedElement) return;
    clipboardRef.current = cloneDoc(selectedElement);
    pushToast({
      variant: "info",
      title: "Copied",
      message: "Element copied to clipboard.",
    });
  }, [selectedElement, pushToast]);

  const paste = useCallback(() => {
    if (!currentPageId) return;
    const src = clipboardRef.current;
    if (!src) return;

    const newId = nanoid();

    updateCurrentAnnotations((doc) => {
      const cloned: PageElement = cloneDoc(src);

      const off = 0.01;
      const b = cloned.geometry.container_bbox;
      const nb = {
        ...b,
        x: Math.min(0.98, b.x + off),
        y: Math.min(0.98, b.y + off),
      };

      const next: PageElement = {
        ...cloned,
        id: newId,
        source: "user",
        status: "edited",
        readingOrder: doc.elements.length + 1,
        geometry: {
          ...cloned.geometry,
          container_bbox: nb,
        },
      };

      return { ...doc, elements: [...doc.elements, next], updatedAt: nowIso() };
    });

    setSelectedId(newId);
    pushToast({ variant: "info", title: "Pasted", message: "Element pasted." });
  }, [currentPageId, updateCurrentAnnotations, pushToast]);

  const duplicateSelected = useCallback(() => {
    copySelected();
    paste();
  }, [copySelected, paste]);

  const selectNextPrev = useCallback(
    (forward: boolean) => {
      if (!currentAnnotations) return;
      const alive = currentAnnotations.elements.filter(
        (e) => e.status !== "deleted",
      );
      if (alive.length === 0) return;

      const sorted = alive
        .slice()
        .sort((a, b) => a.readingOrder - b.readingOrder);

      if (!selectedId) {
        setSelectedId(sorted[0]?.id ?? null);
        return;
      }

      const idx = sorted.findIndex((e) => e.id === selectedId);
      if (idx < 0) {
        setSelectedId(sorted[0]?.id ?? null);
        return;
      }

      const nextIdx = forward
        ? Math.min(sorted.length - 1, idx + 1)
        : Math.max(0, idx - 1);

      setSelectedId(sorted[nextIdx]?.id ?? null);
    },
    [currentAnnotations, selectedId],
  );

  const nudgeSelected = useCallback(
    (dxPx: number, dyPx: number) => {
      if (!currentPage || !selectedId) return;
      const imgW = currentPage.image.width;
      const imgH = currentPage.image.height;

      const dx = dxPx / imgW;
      const dy = dyPx / imgH;

      updateCurrentAnnotations((doc) => ({
        ...doc,
        elements: doc.elements.map((e) => {
          if (e.id !== selectedId) return e;
          const b = e.geometry.container_bbox;
          const nx = Math.max(0, Math.min(1 - b.w, b.x + dx));
          const ny = Math.max(0, Math.min(1 - b.h, b.y + dy));
          return {
            ...markEdited(e),
            geometry: {
              ...e.geometry,
              container_bbox: { ...b, x: nx, y: ny },
            },
          };
        }),
        updatedAt: nowIso(),
      }));
    },
    [currentPage, selectedId, updateCurrentAnnotations],
  );

  // ---------- Hotkeys ----------
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;

      const typing = isTextInputTarget(e.target);
      if (typing && !(mod && e.key.toLowerCase() === "s")) return;

      // Help
      if ((e.key === "?" || (e.shiftKey && e.key === "/")) && !mod) {
        e.preventDefault();
        setHelpOpen(true);
        return;
      }

      if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (currentPageId) void flushSave(currentPageId);
        return;
      }

      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }

      if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        deleteSelected();
        return;
      }

      if (mod && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicateSelected();
        return;
      }

      if (mod && e.key.toLowerCase() === "c") {
        e.preventDefault();
        copySelected();
        return;
      }

      if (mod && e.key.toLowerCase() === "v") {
        e.preventDefault();
        paste();
        return;
      }

      if (e.key === "Escape") {
        setSelectedId(null);
        setPreviewOpen(false);
        setHelpOpen(false);
        return;
      }

      if (e.key === "Tab") {
        e.preventDefault();
        selectNextPrev(!e.shiftKey);
        return;
      }

      if (viewMode === "edit" && selectedId) {
        const step = e.shiftKey ? 10 : 1;
        if (e.key === "ArrowLeft") return nudgeSelected(-step, 0);
        if (e.key === "ArrowRight") return nudgeSelected(step, 0);
        if (e.key === "ArrowUp") return nudgeSelected(0, -step);
        if (e.key === "ArrowDown") return nudgeSelected(0, step);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    currentPageId,
    flushSave,
    redo,
    undo,
    deleteSelected,
    duplicateSelected,
    copySelected,
    paste,
    selectNextPrev,
    nudgeSelected,
    selectedId,
    viewMode,
  ]);

  // ---------- UI helpers ----------
  const headerTitle = (serverPayload as any)?.work?.title ?? "Work";
  const chapterTitle = (serverPayload as any)?.chapter?.title ?? "Chapter";

  const statsTotal = (serverPayload as any)?.stats?.totalPages ?? pages.length;
  const statsAnalyzed =
    (serverPayload as any)?.stats?.analyzedPages ??
    pages.filter(
      (p) => !!p.annotations && (p.annotations.elements?.length ?? 0) > 0,
    ).length;

  const latestJob = (serverPayload as any)?.latestJob ?? null;

  const currentSaveStatus: SaveStatus = useMemo(() => {
    if (!currentPageId) return "idle";
    const st = saveStatusById[currentPageId] ?? "idle";
    if (st === "idle") return dirtyById[currentPageId] ? "dirty" : "saved";
    if (st === "dirty") return "dirty";
    return st;
  }, [currentPageId, saveStatusById, dirtyById]);

  const dirtyCount = useMemo(
    () => Object.values(dirtyById).filter(Boolean).length,
    [dirtyById],
  );

  // ---------- Render ----------
  if (isLoading) {
    return (
      <div className="h-dvh flex items-center justify-center bg-zinc-50">
        <div className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-sm">
          <Spinner className="text-fuchsia-600" />
          <div className="text-sm text-zinc-700">Loading editor…</div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 space-y-3">
        <div className="text-sm text-rose-700 font-semibold">
          Failed to load editor.
        </div>
        <pre className="text-xs text-zinc-700 whitespace-pre-wrap rounded-lg border bg-white p-3">
          {JSON.stringify(error, null, 2)}
        </pre>
        <Button onClick={() => refetch()} variant="secondary">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="h-dvh flex flex-col bg-zinc-50 text-zinc-900">
      {/* Top Bar */}
      <div className="border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="px-3 py-2 flex items-center gap-3">
          {/* Left: Nav + title */}
          <div className="flex items-center gap-2 min-w-0">
            <Link
              href="/creator/works"
              className="text-sm font-medium text-zinc-700 hover:text-zinc-900"
            >
              ← Works
            </Link>

            <div className="w-px h-6 bg-zinc-200" />

            <div className="min-w-0">
              <div className="font-semibold truncate">{headerTitle}</div>
              <div className="text-xs text-zinc-500 truncate">
                {chapterTitle}
              </div>
            </div>
          </div>

          {/* Middle: stats */}
          <div className="ml-2 hidden lg:flex items-center gap-2">
            <Badge variant="info">
              Pages {statsAnalyzed}/{statsTotal}
            </Badge>
            {latestJob?.status ? (
              <Badge
                variant={latestJob.status === "COMPLETED" ? "success" : "warn"}
              >
                AI {String(latestJob.status).toLowerCase()} •{" "}
                {timeAgo(latestJob.updatedAt)}
              </Badge>
            ) : null}
            {dirtyCount > 0 ? (
              <Badge variant="warn">{dirtyCount} unsaved</Badge>
            ) : null}
          </div>

          {/* Right: controls */}
          <div className="ml-auto flex items-center gap-2 flex-wrap justify-end">
            {/* Layout toggles */}
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant={showPagesRail ? "secondary" : "outline"}
                onClick={() => setShowPagesRail((v) => !v)}
                title="Toggle Pages"
              >
                Pages
              </Button>
              <Button
                size="sm"
                variant={showLayers ? "secondary" : "outline"}
                onClick={() => setShowLayers((v) => !v)}
                title="Toggle Layers"
              >
                Layers
              </Button>
              <Button
                size="sm"
                variant={showInspector ? "secondary" : "outline"}
                onClick={() => setShowInspector((v) => !v)}
                title="Toggle Inspector"
              >
                Inspector
              </Button>
            </div>

            <div className="w-px h-6 bg-zinc-200 mx-1 hidden sm:block" />

            {/* Mode */}
            <div className="flex items-center rounded-lg border bg-white shadow-sm overflow-hidden">
              <button
                className={segBtn(viewMode === "edit")}
                onClick={() => setViewMode("edit")}
              >
                Edit
              </button>
              <button
                className={segBtn(viewMode === "preview")}
                onClick={() => setViewMode("preview")}
              >
                Preview
              </button>
            </div>

            {/* Lang */}
            <div className="flex items-center rounded-lg border bg-white shadow-sm overflow-hidden">
              <button
                className={segBtn(langMode === "original")}
                onClick={() => setLangMode("original")}
              >
                Original
              </button>
              <button
                className={segBtn(langMode === "translated")}
                onClick={() => setLangMode("translated")}
              >
                Translated
              </button>
            </div>

            <div className="w-px h-6 bg-zinc-200 mx-1 hidden sm:block" />

            {/* Undo/Redo */}
            <Button
              size="sm"
              variant="outline"
              onClick={undo}
              disabled={!canUndo}
              title="Undo (Ctrl/Cmd+Z)"
            >
              Undo
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={redo}
              disabled={!canRedo}
              title="Redo (Ctrl/Cmd+Shift+Z)"
            >
              Redo
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={duplicateSelected}
              disabled={!selectedId}
              title="Duplicate (Ctrl/Cmd+D)"
            >
              Duplicate
            </Button>

            <Button
              size="sm"
              variant="danger"
              onClick={deleteSelected}
              disabled={!selectedId}
              title="Delete (Del)"
            >
              Delete
            </Button>

            <div className="w-px h-6 bg-zinc-200 mx-1 hidden sm:block" />

            <Button
              size="sm"
              variant="outline"
              onClick={() => setPreviewOpen(true)}
            >
              Preview Modal
            </Button>

            <Link
              className={cn(ButtonLinkClass, "text-sm")}
              href={`/creator/works/${workId}/chapters/${chapterId}/setup`}
            >
              Setup
            </Link>

            <Link
              className={cn(ButtonLinkClass, "text-sm")}
              href={`/creator/works/${workId}/chapters/${chapterId}/preview`}
            >
              Preview Page
            </Link>

            <Button size="sm" variant="outline" onClick={() => refetch()}>
              {isFetching ? (
                <span className="flex items-center gap-2">
                  <Spinner className="text-zinc-700" />
                  Refreshing…
                </span>
              ) : (
                "Refresh URLs"
              )}
            </Button>

            <Button
              size="sm"
              variant="primary"
              disabled={!currentPageId}
              onClick={() => currentPageId && flushSave(currentPageId)}
              title="Save now (Ctrl/Cmd+S)"
            >
              Save now
            </Button>

            {/* Save indicator */}
            <SaveIndicator
              status={currentSaveStatus}
              lastSavedAt={lastSavedAtById[currentPageId ?? ""] ?? null}
            />

            <IconButton
              size="sm"
              variant="ghost"
              onClick={() => setHelpOpen(true)}
              title="Help / Shortcuts (?)"
            >
              ?
            </IconButton>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 min-h-0">
        {/* Pages rail */}
        {showPagesRail && (
          <aside className="w-[280px] border-r bg-white min-h-0 flex flex-col">
            <div className="p-3 border-b">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold">Pages</div>
                <Badge variant="neutral">{pages.length}</Badge>
              </div>
              <div className="text-[11px] text-zinc-500 mt-1">
                Tip: <Kbd>Tab</Kbd> cycle • <Kbd>Space</Kbd> pan • wheel zoom
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-auto p-3 space-y-2">
              {pages.length === 0 ? (
                <div className="text-sm text-zinc-600">No pages yet.</div>
              ) : (
                pages.map((p, idx) => {
                  const active = p.id === currentPageId;
                  const st =
                    saveStatusById[p.id] ??
                    (dirtyById[p.id] ? "dirty" : "saved");

                  const alive = (p.annotations?.elements ?? []).filter(
                    (e) => e.status !== "deleted",
                  );
                  const trDone = alive.filter((e) =>
                    (e.text.translated ?? "").trim(),
                  ).length;
                  const trTotal = alive.length;

                  return (
                    <button
                      key={p.id}
                      className={cn(
                        "w-full rounded-xl border text-left overflow-hidden shadow-sm hover:shadow transition",
                        active
                          ? "ring-2 ring-fuchsia-500 border-fuchsia-200"
                          : "border-zinc-200",
                      )}
                      onClick={() => void goToPage(p.id)}
                    >
                      <div className="relative">
                        <img
                          src={p.image.url}
                          alt=""
                          className="w-full h-28 object-cover bg-zinc-100"
                          loading="lazy"
                        />

                        <div className="absolute top-2 left-2 flex items-center gap-2">
                          <span className="rounded-md bg-black/70 text-white text-[11px] px-2 py-1">
                            #{idx + 1}
                          </span>
                          <span
                            className={cn(
                              "rounded-md text-[11px] px-2 py-1",
                              statusPill(st),
                            )}
                          >
                            {st}
                          </span>
                        </div>

                        <div className="absolute bottom-2 left-2 flex items-center gap-2">
                          <span className="rounded-md bg-white/90 text-[11px] px-2 py-1">
                            TR {trDone}/{trTotal}
                          </span>
                          <span className="rounded-md bg-white/90 text-[11px] px-2 py-1">
                            EL {alive.length}
                          </span>
                        </div>
                      </div>

                      <div className="p-2">
                        <div className="text-xs text-zinc-700 truncate">
                          {p.image.originalFilename}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>
        )}

        {/* Layers panel */}
        {showLayers && (
          <ElementsPanel
            page={currentPage}
            selectedId={selectedId}
            hoverId={hoverId}
            langMode={langMode}
            onSelect={setSelectedId}
            onHover={setHoverId}
            onChangeDoc={updateCurrentAnnotations}
          />
        )}

        {/* Canvas */}
        <div className="flex-1 min-h-0 flex flex-col">
          <CanvasStage
            page={currentPage}
            viewMode={viewMode}
            langMode={langMode}
            selectedId={selectedId}
            hoverId={hoverId}
            onHover={setHoverId}
            onSelect={setSelectedId}
            onChangeDoc={updateCurrentAnnotations}
          />

          {/* Bottom status bar */}
          <div className="border-t bg-white px-3 py-2 text-xs text-zinc-600 flex items-center gap-3">
            <span className="font-medium text-zinc-800">Shortcuts:</span>
            <span>
              <Kbd>Ctrl/⌘</Kbd>+<Kbd>S</Kbd> save
            </span>
            <span>
              <Kbd>Ctrl/⌘</Kbd>+<Kbd>Z</Kbd> undo
            </span>
            <span>
              <Kbd>Ctrl/⌘</Kbd>+<Kbd>D</Kbd> duplicate
            </span>
            <span>
              <Kbd>Del</Kbd> delete
            </span>
            <span className="ml-auto">
              {selectedElement ? (
                <span className="text-zinc-700">
                  Selected: <b>{selectedElement.elementType}</b> • #
                  {selectedElement.readingOrder}
                </span>
              ) : (
                <span className="text-zinc-500">No selection</span>
              )}
            </span>
          </div>
        </div>

        {/* Inspector */}
        {showInspector && (
          <PropertiesPanel
            page={currentPage}
            selected={selectedElement}
            onSelect={setSelectedId}
            onChangeDoc={updateCurrentAnnotations}
          />
        )}
      </div>

      <PreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        pages={pages}
        currentIndex={Math.max(0, currentIndex)}
        langMode={langMode}
      />

      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />

      <ToastStack
        toasts={toasts}
        onDismiss={(id) => setToasts((p) => p.filter((t) => t.id !== id))}
      />
    </div>
  );
}

function segBtn(active: boolean) {
  return cn(
    "px-3 h-9 text-sm font-medium transition",
    active
      ? "bg-zinc-900 text-white"
      : "bg-transparent text-zinc-700 hover:bg-zinc-50",
  );
}

const ButtonLinkClass =
  "inline-flex items-center justify-center rounded-lg border bg-white/80 px-3 h-10 text-sm font-medium text-zinc-900 " +
  "hover:bg-white transition shadow-sm border-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/60";

function statusPill(st: SaveStatus) {
  switch (st) {
    case "saved":
      return "bg-emerald-500/90 text-white";
    case "saving":
      return "bg-sky-500/90 text-white";
    case "dirty":
      return "bg-amber-500/95 text-white";
    case "error":
      return "bg-rose-500/95 text-white";
    default:
      return "bg-zinc-800/70 text-white";
  }
}

function SaveIndicator({
  status,
  lastSavedAt,
}: {
  status: SaveStatus;
  lastSavedAt: string | null;
}) {
  const s = statusVariant(status);
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-white px-3 h-10 shadow-sm">
      {status === "saving" ? (
        <Spinner className="text-sky-600" />
      ) : (
        <span className={cn("h-2.5 w-2.5 rounded-full", s.dot)} />
      )}
      <div className="leading-tight">
        <div className="text-[12px] font-semibold text-zinc-900">{s.label}</div>
        <div className="text-[10px] text-zinc-500">
          {status === "saved" && lastSavedAt
            ? `Last: ${timeAgo(lastSavedAt)}`
            : " "}
        </div>
      </div>
    </div>
  );
}

function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="fixed right-4 bottom-4 z-[80] space-y-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "w-[360px] max-w-[90vw] rounded-xl border bg-white shadow-lg p-3",
            t.variant === "error" ? "border-rose-200" : "border-zinc-200",
          )}
        >
          <div className="flex items-start gap-2">
            <div
              className={cn(
                "mt-1 h-2.5 w-2.5 rounded-full",
                t.variant === "error" ? "bg-rose-500" : "bg-sky-500",
              )}
            />
            <div className="min-w-0">
              <div className="text-sm font-semibold text-zinc-900">
                {t.title}
              </div>
              {t.message ? (
                <div className="text-xs text-zinc-600 mt-0.5">{t.message}</div>
              ) : null}
            </div>

            <button
              className="ml-auto text-xs text-zinc-500 hover:text-zinc-900"
              onClick={() => onDismiss(t.id)}
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function HelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl border overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div className="font-semibold">Keyboard Shortcuts</div>
          <Button size="sm" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="p-4 grid sm:grid-cols-2 gap-3 text-sm">
          <Shortcut label="Save" keys={["Ctrl/⌘", "S"]} />
          <Shortcut label="Undo" keys={["Ctrl/⌘", "Z"]} />
          <Shortcut label="Redo" keys={["Ctrl/⌘", "Shift", "Z"]} />
          <Shortcut label="Duplicate" keys={["Ctrl/⌘", "D"]} />
          <Shortcut label="Copy" keys={["Ctrl/⌘", "C"]} />
          <Shortcut label="Paste" keys={["Ctrl/⌘", "V"]} />
          <Shortcut label="Delete" keys={["Del"]} />
          <Shortcut label="Cycle elements" keys={["Tab"]} />
          <Shortcut label="Pan" keys={["Space (hold)"]} />
          <Shortcut label="Nudge" keys={["Arrows"]} />
          <Shortcut label="Nudge fast" keys={["Shift", "Arrows"]} />
          <Shortcut label="Inline edit text" keys={["Double click"]} />
        </div>

        <div className="px-4 py-3 border-t text-xs text-zinc-500">
          Tip: في inline edit استخدم <Kbd>Ctrl/⌘</Kbd> + <Kbd>Enter</Kbd>{" "}
          للتأكيد بسرعة.
        </div>
      </div>
    </div>
  );
}

function Shortcut({ label, keys }: { label: string; keys: string[] }) {
  return (
    <div className="rounded-xl border bg-zinc-50 p-3 flex items-center justify-between gap-3">
      <div className="text-zinc-700 font-medium">{label}</div>
      <div className="flex items-center gap-1 flex-wrap justify-end">
        {keys.map((k, i) => (
          <Kbd key={i}>{k}</Kbd>
        ))}
      </div>
    </div>
  );
}
