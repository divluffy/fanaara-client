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

import {
  ensureAnnotations,
  isTextInputTarget,
  markEdited,
  bboxCenter,
  remapClipPathWithBBox,
} from "./utils";
import { Badge } from "./ui/badge";
import { Spinner } from "./ui/spinner";
import { cn } from "./ui/cn";
import { Kbd } from "./ui/kbd";
import { Button } from "@/design/DeButton";

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
  if (s < 10) return "الآن";
  if (s < 60) return `منذ ${s}ث`;

  const m = Math.floor(s / 60);
  if (m < 60) return `منذ ${m}د`;

  const h = Math.floor(m / 60);
  if (h < 48) return `منذ ${h}س`;

  const d = Math.floor(h / 24);
  return `منذ ${d}ي`;
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

function statusVariant(st: SaveStatus): { label: string; dot: string } {
  switch (st) {
    case "saving":
      return { label: "جارٍ الحفظ…", dot: "bg-sky-500" };
    case "saved":
      return { label: "تم الحفظ", dot: "bg-emerald-500" };
    case "dirty":
      return { label: "غير محفوظ", dot: "bg-amber-500" };
    case "error":
      return { label: "خطأ في الحفظ", dot: "bg-rose-500" };
    default:
      return { label: "—", dot: "bg-zinc-300" };
  }
}

function saveStatusLabel(st: SaveStatus) {
  switch (st) {
    case "saved":
      return "محفوظ";
    case "saving":
      return "يحفظ…";
    case "dirty":
      return "غير محفوظ";
    case "error":
      return "خطأ";
    default:
      return "—";
  }
}

function jobStatusLabel(status?: string) {
  const s = String(status ?? "").toUpperCase();
  if (s === "COMPLETED") return "مكتمل";
  if (s === "RUNNING") return "جارٍ التنفيذ";
  if (s === "QUEUED") return "بالانتظار";
  if (s === "FAILED") return "فشل";
  return s ? s : "—";
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
  console.log("serverPayload: ", serverPayload);

  const [saveAnnotationsMutation] = useSaveCreatorPageAnnotationsMutation();

  const [pages, setPages] = useState<EditorPageItem[]>([]);
  const pageOrderRef = useRef<string[]>([]);

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

    setPages((prev) => {
      let next = reconcilePages({
        serverPages,
        prevPages: prev,
        dirtyById: dirtyRef.current,
      });

      // preserve local order (drag/drop)
      const order = pageOrderRef.current;
      if (order.length) {
        const map = new Map(next.map((p) => [p.id, p]));
        const ordered = order
          .map((id) => map.get(id))
          .filter(Boolean) as EditorPageItem[];
        const rest = next.filter((p) => !order.includes(p.id));
        next = [...ordered, ...rest].map((p, idx) => ({
          ...p,
          orderIndex: idx,
        }));
      } else {
        pageOrderRef.current = next.map((p) => p.id);
      }

      return next;
    });

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
            title: "فشل الحفظ التلقائي",
            message: "التغييرات محفوظة محليًا. جرّب “حفظ الآن”.",
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
          title: "فشل الحفظ",
          message: "تحقق من الاتصال ثم أعد المحاولة.",
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

  // ---------- Update annotations ----------
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
          const before = cloneDoc(base);
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
      console.log("pageId: ", pageId);
      if (!pageId) return;
      if (currentPageId) void flushSave(currentPageId);
      console.log("currentPageId: ", currentPageId);
      setCurrentPageId(pageId);
      setSelectedId(null);
      setHoverId(null);
    },
    [currentPageId, flushSave],
  );

  // ---------- Page reorder ----------
  const reorderPages = useCallback(
    (fromId: string, toId: string) => {
      if (!fromId || !toId || fromId === toId) return;

      setPages((prev) => {
        const from = prev.findIndex((p) => p.id === fromId);
        const to = prev.findIndex((p) => p.id === toId);
        if (from < 0 || to < 0) return prev;

        const next = prev.slice();
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);

        const normalized = next.map((p, idx) => ({ ...p, orderIndex: idx }));
        pageOrderRef.current = normalized.map((p) => p.id);

        return normalized;
      });

      pushToast({
        variant: "info",
        title: "تم ترتيب الصفحات",
      });
    },
    [pushToast],
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
      title: "تم النسخ",
      message: "تم نسخ العنصر.",
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

      const prevB = cloned.geometry.container_bbox;
      const nextB = nb;

      const prevClip = (cloned.container.params as any)?.clipPath ?? null;
      const nextClip = remapClipPathWithBBox({
        clipPath: prevClip,
        from: prevB,
        to: nextB,
      });

      const next: PageElement = {
        ...cloned,
        id: newId,
        source: "user",
        status: "edited",
        readingOrder: doc.elements.length + 1,
        geometry: { ...cloned.geometry, container_bbox: nb },
      };

      return { ...doc, elements: [...doc.elements, next], updatedAt: nowIso() };
    });

    setSelectedId(newId);
    pushToast({
      variant: "info",
      title: "تم اللصق",
      message: "تم لصق العنصر.",
    });
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

          const prevB = e.geometry.container_bbox;
          const nextB = { ...prevB, x: nx, y: ny };

          const prevClip = (e.container.params as any)?.clipPath ?? null;
          const nextClip = remapClipPathWithBBox({
            clipPath: prevClip,
            from: prevB,
            to: nextB,
          });
          return {
            ...markEdited(e),
            container: {
              ...e.container,
              params: {
                ...(e.container.params ?? {}),
                clipPath: nextClip ?? null,
              },
            },
            geometry: {
              ...e.geometry,
              container_bbox: nextB,
              anchor: bboxCenter(nextB),
            },
          };
        }),
        updatedAt: nowIso(),
      }));
    },
    [currentPage, selectedId, updateCurrentAnnotations],
  );

  // ---------- Hotkeys (Windows only) ----------
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.ctrlKey; // ✅ Windows only

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
  const headerTitle = (serverPayload as any)?.work?.title ?? "—";
  const chapterTitle = (serverPayload as any)?.chapter?.title ?? "—";

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
      <div
        className="h-dvh flex items-center justify-center bg-zinc-50"
        dir="rtl"
        lang="ar"
      >
        <div className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-sm">
          <Spinner className="text-fuchsia-600" />
          <div className="text-sm text-zinc-700">جارٍ تحميل المحرّر…</div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 space-y-3" dir="rtl" lang="ar">
        <div className="text-sm text-rose-700 font-semibold">
          فشل تحميل المحرّر.
        </div>
        <pre className="text-xs text-zinc-700 whitespace-pre-wrap rounded-lg border bg-white p-3">
          {JSON.stringify(error, null, 2)}
        </pre>
        <Button onClick={() => refetch()} variant="secondary">
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div className="h-dvh flex flex-col bg-zinc-50 text-zinc-900">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto max-w-screen-2xl px-3 py-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            {/* Left: Title */}
            <div className="min-w-0 flex-1">
              <div className="font-semibold truncate">{headerTitle}</div>
              <div className="text-xs text-zinc-500 truncate">
                {chapterTitle}
              </div>
            </div>

            {/* Right: Controls */}
            <div className="ms-auto flex flex-wrap items-center justify-between gap-2 sm:justify-end">
              {/* Cluster A: History */}
              <div className="inline-flex items-center">
                <Button
                  size="sm"
                  variant="outline"
                  tone="neutral"
                  onClick={undo}
                  disabled={!canUndo}
                  tooltip="تراجع (Ctrl+Z)"
                  group="start"
                >
                  تراجع
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  tone="neutral"
                  onClick={redo}
                  disabled={!canRedo}
                  tooltip="إعادة (Ctrl+Shift+Z أو Ctrl+Y)"
                  group="end"
                >
                  إعادة
                </Button>
              </div>

              <div className="hidden sm:block h-6 w-px bg-zinc-200" />

              {/* Cluster B: Edit */}
              <div className="inline-flex items-center">
                <Button
                  size="sm"
                  variant="outline"
                  tone="neutral"
                  onClick={duplicateSelected}
                  disabled={!selectedId}
                  tooltip="تكرار (Ctrl+D)"
                  group="start"
                >
                  تكرار
                </Button>
                <Button
                  size="sm"
                  variant="solid"
                  tone="danger"
                  onClick={deleteSelected}
                  disabled={!selectedId}
                  tooltip="حذف (Del)"
                  group="end"
                >
                  حذف
                </Button>
              </div>

              <div className="hidden sm:block h-6 w-px bg-zinc-200" />

              {/* Cluster C: Preview / Save / Status / Help */}
              <div className="flex flex-wrap items-center gap-2 justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  tone="neutral"
                  onClick={() => setPreviewOpen(true)}
                >
                  نافذة المعاينة
                </Button>

                <Button
                  size="sm"
                  variant="solid"
                  tone="brand"
                  disabled={!currentPageId}
                  onClick={() => currentPageId && flushSave(currentPageId)}
                  tooltip="حفظ الآن (Ctrl+S)"
                >
                  حفظ الآن
                </Button>

                <SaveIndicator
                  status={currentSaveStatus}
                  lastSavedAt={lastSavedAtById[currentPageId ?? ""] ?? null}
                />

                <Button
                  size="sm"
                  iconOnly
                  variant="plain"
                  tone="neutral"
                  aria-label="مساعدة / اختصارات"
                  tooltip="مساعدة / اختصارات"
                  onClick={() => setHelpOpen(true)}
                >
                  ؟
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 min-h-0 ">
        {/* Pages rail */}
        {showPagesRail && (
          <aside className="w-max border-r bg-white min-h-0 flex flex-col">
            <div className="flex  justify-between  p-3 border-b">
              <div className="text-sm font-semibold">الصفحات</div>
              <h3>
                {statsAnalyzed}/{statsTotal}
              </h3>
            </div>

            <div className="flex-1 min-h-0 overflow-auto p-3 space-y-2">
              {pages.length === 0 ? (
                <div className="text-sm text-zinc-600">لا توجد صفحات بعد.</div>
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
                    <div
                      key={p.id}
                      className={cn(
                        "rounded-2xl border overflow-hidden shadow-sm transition",
                        active
                          ? "ring-2 ring-fuchsia-500 border-fuchsia-200"
                          : "border-zinc-200",
                      )}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData("text/plain", p.id);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const fromId = e.dataTransfer.getData("text/plain");
                        if (fromId) reorderPages(fromId, p.id);
                      }}
                      title="اسحب وأفلت لتغيير ترتيب الصفحة"
                    >
                      <button
                        className="w-full text-left"
                        onClick={() => void goToPage(p.id)}
                      >
                        <div className="relative">
                          <img
                            src={p.image.url}
                            alt=""
                            className="w-60 h-30 object-cover bg-zinc-100"
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
                              {saveStatusLabel(st)}
                            </span>
                          </div>
                        </div>

                        <div className="p-2">
                          <div className="text-xs text-zinc-700 truncate">
                            {p.image.originalFilename}
                          </div>
                        </div>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </aside>
        )}

        {/* Canvas */}
        <div className="flex-1 min-h-0 relative overflow-hidden">
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
            ? `آخر حفظ: ${timeAgo(lastSavedAt)}`
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
    <div
      className="fixed right-4 bottom-4 z-[80] space-y-2"
      dir="rtl"
      lang="ar"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "w-max max-w-[90vw] rounded-xl border bg-white shadow-lg p-3",
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
    <div
      className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4"
      dir="rtl"
      lang="ar"
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl border overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div className="font-semibold">اختصارات لوحة المفاتيح</div>
          <Button size="sm" variant="outline" onClick={onClose}>
            إغلاق
          </Button>
        </div>

        <div className="p-4 grid sm:grid-cols-2 gap-3 text-sm">
          <Shortcut label="حفظ" keys={["Ctrl", "S"]} />
          <Shortcut label="تراجع" keys={["Ctrl", "Z"]} />
          <Shortcut label="إعادة" keys={["Ctrl", "Shift", "Z"]} />
          <Shortcut label="إعادة (بديل)" keys={["Ctrl", "Y"]} />
          <Shortcut label="تكرار" keys={["Ctrl", "D"]} />
          <Shortcut label="نسخ" keys={["Ctrl", "C"]} />
          <Shortcut label="لصق" keys={["Ctrl", "V"]} />
          <Shortcut label="حذف" keys={["Del"]} />
          <Shortcut label="التنقل بين العناصر" keys={["Tab"]} />
          <Shortcut label="سحب الصورة" keys={["سحب الفراغ"]} />
          <Shortcut label="سحب (بديل)" keys={["Space (ضغط مطوّل)"]} />
          <Shortcut label="تحريك بسيط" keys={["الأسهم"]} />
          <Shortcut label="تحريك سريع" keys={["Shift", "الأسهم"]} />
          <Shortcut label="تعديل نص سريع" keys={["نقر مزدوج"]} />
        </div>

        <div className="px-4 py-3 border-t text-xs text-zinc-500">
          تلميح: داخل تعديل النص السريع استخدم <Kbd>Ctrl</Kbd> +{" "}
          <Kbd>Enter</Kbd> للتأكيد بسرعة.
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
