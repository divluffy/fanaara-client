"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  AnalyzerBBoxPct,
  AnalyzerElement,
  AnalyzerElementType,
  AnalyzerPageJson,
} from "../types";
import {
  useAnalyzePageMutation,
  useLazyGetPageQuery,
  useSavePageMutation,
} from "../comicsAnalyzerApi";
import { useLocalPageJson } from "../_hooks/useLocalPageJson";
import { useDebouncedEffect } from "../_hooks/useDebouncedEffect";
import Toolbar from "./Toolbar";
import ImageStage from "./ImageStage";
import InspectorPanel from "./InspectorPanel";

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function normalizeBBoxPct(b: AnalyzerBBoxPct): AnalyzerBBoxPct {
  const minSize = 0.01;
  const w = clamp(b.w, minSize, 1);
  const h = clamp(b.h, minSize, 1);
  const x = clamp(b.x, 0, 1 - w);
  const y = clamp(b.y, 0, 1 - h);
  return { x, y, w, h };
}

function newElement(type: AnalyzerElementType): AnalyzerElement {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `el-${Date.now()}`;

  return {
    id,
    type,
    text: { raw: "" },
    geometry: { bboxPct: { x: 0.12, y: 0.12, w: 0.28, h: 0.12 } },
    flags: { needsReview: true },
    confidence: 0.5,
  };
}

function getGenericErrorMessage(err: unknown) {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  if (typeof err === "object" && err && "status" in err) {
    const status = (err as any).status;
    if (status === 404) return "Not found (404)";
    return `Request failed (${String(status)})`;
  }
  if (typeof err === "object" && err && "message" in err)
    return String((err as any).message);
  return "Request failed";
}

export default function EditorShell({
  pageId,
  chapterId,
}: {
  pageId: string;
  chapterId?: string;
}) {
  const {
    loading: localLoading,
    initialValue,
    save,
    clear,
  } = useLocalPageJson(pageId);

  const [pageJson, setPageJson] = useState<AnalyzerPageJson | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [serverNotice, setServerNotice] = useState<string | null>(null);

  const didTryServerLoadRef = useRef(false);

  const [analyzePage, analyzeState] = useAnalyzePageMutation();
  const [triggerGetPage, getPageState] = useLazyGetPageQuery();
  const [savePage, saveState] = useSavePageMutation();

  // Local-first hydration, then server
  useEffect(() => {
    if (localLoading) return;
    if (pageJson !== null) return;

    if (initialValue) {
      setPageJson(initialValue);
      setSelectedId(initialValue.elements[0]?.id ?? null);
      setServerNotice("Loaded local draft");

      // Silent refresh to update image.src (signed URL freshness)
      triggerGetPage({ pageId })
        .unwrap()
        .then((fresh) => {
          setPageJson((prev) => {
            if (!prev) return fresh;
            // Keep local edits but refresh image fields
            return {
              ...prev,
              pageNumber: fresh.pageNumber,
              image: fresh.image,
              title: prev.title ?? fresh.title,
              description: prev.description ?? fresh.description,
            };
          });
        })
        .catch(() => {});
      return;
    }

    if (didTryServerLoadRef.current) return;
    didTryServerLoadRef.current = true;

    triggerGetPage({ pageId })
      .unwrap()
      .then((data) => {
        setPageJson(data);
        setSelectedId(data.elements[0]?.id ?? null);
        setServerNotice("Loaded from server");
      })
      .catch(() => {
        setServerNotice("No server page found — upload a chapter first");
      });
  }, [localLoading, initialValue, pageJson, pageId, triggerGetPage]);

  // Auto-save local
  useDebouncedEffect(
    () => {
      if (pageJson) save(pageJson);
    },
    [pageJson, save],
    450,
  );

  useEffect(() => {
    if (!serverNotice) return;
    const t = window.setTimeout(() => setServerNotice(null), 3500);
    return () => window.clearTimeout(t);
  }, [serverNotice]);

  const selectedElement = useMemo(() => {
    if (!pageJson || !selectedId) return null;
    return pageJson.elements.find((e) => e.id === selectedId) ?? null;
  }, [pageJson, selectedId]);

  const patchPage = useCallback(
    (updater: (prev: AnalyzerPageJson) => AnalyzerPageJson) => {
      setPageJson((prev) => (prev ? updater(prev) : prev));
    },
    [],
  );

  const patchElement = useCallback(
    (id: string, updater: (prev: AnalyzerElement) => AnalyzerElement) => {
      patchPage((p) => ({
        ...p,
        elements: p.elements.map((el) => (el.id === id ? updater(el) : el)),
      }));
    },
    [patchPage],
  );

  const onAnalyze = useCallback(async () => {
    try {
      const res = await analyzePage({ pageId }).unwrap();
      setPageJson(res);
      setSelectedId(res.elements[0]?.id ?? null);
      setServerNotice("Analyzed via backend");
    } catch {
      setServerNotice(null);
    }
  }, [analyzePage, pageId]);

  const onPullFromServer = useCallback(async () => {
    try {
      const res = await triggerGetPage({ pageId }).unwrap();
      setPageJson(res);
      setSelectedId(res.elements[0]?.id ?? null);
      setServerNotice("Pulled latest from server");
    } catch (e) {
      setServerNotice(`Pull failed: ${getGenericErrorMessage(e)}`);
    }
  }, [pageId, triggerGetPage]);

  const onSaveToServer = useCallback(async () => {
    if (!pageJson) return;
    try {
      await savePage({ pageId, body: pageJson }).unwrap();
      setServerNotice("Saved to server");
    } catch (e) {
      setServerNotice(`Save failed (kept local): ${getGenericErrorMessage(e)}`);
    }
  }, [pageId, pageJson, savePage]);

  const onClearLocal = useCallback(() => {
    clear();
    setPageJson(null);
    setSelectedId(null);
    setServerNotice("Cleared local draft");
    didTryServerLoadRef.current = false;
  }, [clear]);

  const onBBoxChange = useCallback(
    (id: string, bboxPct: AnalyzerBBoxPct) => {
      patchElement(id, (el) => ({
        ...el,
        geometry: {
          ...el.geometry,
          bboxPct: normalizeBBoxPct(bboxPct),
        },
      }));
    },
    [patchElement],
  );

  const onUpdateSelectedText = useCallback(
    (raw: string) => {
      if (!selectedId) return;
      patchElement(selectedId, (el) => ({ ...el, text: { raw } }));
    },
    [patchElement, selectedId],
  );

  const onUpdateSelectedType = useCallback(
    (type: AnalyzerElementType) => {
      if (!selectedId) return;
      patchElement(selectedId, (el) => ({ ...el, type }));
    },
    [patchElement, selectedId],
  );

  const onUpdateSelectedReadingOrder = useCallback(
    (readingOrder: number | undefined) => {
      if (!selectedId) return;
      patchElement(selectedId, (el) => ({ ...el, readingOrder }));
    },
    [patchElement, selectedId],
  );

  const onUpdateSelectedNeedsReview = useCallback(
    (needsReview: boolean) => {
      if (!selectedId) return;
      patchElement(selectedId, (el) => ({
        ...el,
        flags: { ...(el.flags ?? {}), needsReview },
      }));
    },
    [patchElement, selectedId],
  );

  const onUpdateSelectedBBox = useCallback(
    (bbox: AnalyzerBBoxPct) => {
      if (!selectedId) return;
      onBBoxChange(selectedId, bbox);
    },
    [onBBoxChange, selectedId],
  );

  const onAddElement = useCallback(
    (type: AnalyzerElementType) => {
      if (!pageJson) return;
      const el = newElement(type);
      patchPage((p) => ({ ...p, elements: [...p.elements, el] }));
      setSelectedId(el.id);
    },
    [pageJson, patchPage],
  );

  const onDeleteSelected = useCallback(() => {
    if (!pageJson || !selectedId) return;
    const idx = pageJson.elements.findIndex((e) => e.id === selectedId);
    patchPage((p) => ({
      ...p,
      elements: p.elements.filter((e) => e.id !== selectedId),
    }));
    const next =
      pageJson.elements[idx + 1]?.id ?? pageJson.elements[idx - 1]?.id ?? null;
    setSelectedId(next);
  }, [pageJson, patchPage, selectedId]);

  const onUpdatePageMeta = useCallback(
    (
      patch: Partial<
        Pick<AnalyzerPageJson, "title" | "description" | "keywords">
      >,
    ) => {
      patchPage((p) => ({ ...p, ...patch }));
    },
    [patchPage],
  );

  const exportJson = useCallback(
    () => (pageJson ? JSON.stringify(pageJson, null, 2) : undefined),
    [pageJson],
  );

  const copyJson = useCallback(async () => {
    const raw = exportJson();
    if (!raw) return;
    await navigator.clipboard.writeText(raw);
  }, [exportJson]);

  const downloadJson = useCallback(() => {
    const raw = exportJson();
    if (!raw) return;
    const blob = new Blob([raw], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analyzer-page-${pageId}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [exportJson, pageId]);

  const analyzeError = analyzeState.isError
    ? getGenericErrorMessage(analyzeState.error)
    : null;
  const serverError =
    (getPageState.isError
      ? `Pull: ${getGenericErrorMessage(getPageState.error)}`
      : null) ??
    (saveState.isError
      ? `Save: ${getGenericErrorMessage(saveState.error)}`
      : null);

  return (
    <div className="min-h-screen bg-slate-50">
      <Toolbar
        pageId={pageId}
        chapterId={chapterId}
        hasJson={!!pageJson}
        analyzing={analyzeState.isLoading}
        analyzeError={analyzeError}
        serverLoading={getPageState.isFetching}
        serverSaving={saveState.isLoading}
        serverNotice={serverNotice}
        serverError={serverError}
        onAnalyze={onAnalyze}
        onPullFromServer={onPullFromServer}
        onSaveToServer={onSaveToServer}
        onClearLocal={onClearLocal}
        onCopyJson={copyJson}
        onDownloadJson={downloadJson}
      />

      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-4 px-4 pb-6 pt-4 lg:grid-cols-[1fr_380px]">
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <ImageStage
            pageJson={pageJson}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onBBoxChange={onBBoxChange}
          />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white">
          <InspectorPanel
            loadingLocal={localLoading}
            pageJson={pageJson}
            selectedId={selectedId}
            selectedElement={selectedElement}
            onSelect={setSelectedId}
            onAddElement={onAddElement}
            onDeleteSelected={onDeleteSelected}
            onUpdatePageMeta={onUpdatePageMeta}
            onUpdateSelectedText={onUpdateSelectedText}
            onUpdateSelectedType={onUpdateSelectedType}
            onUpdateSelectedReadingOrder={onUpdateSelectedReadingOrder}
            onUpdateSelectedNeedsReview={onUpdateSelectedNeedsReview}
            onUpdateSelectedBBox={onUpdateSelectedBBox}
          />
        </div>
      </div>
    </div>
  );
}
