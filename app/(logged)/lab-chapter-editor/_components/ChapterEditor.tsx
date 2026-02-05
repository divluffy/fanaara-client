"use client";

import dynamic from "next/dynamic";
import { nanoid } from "nanoid";
import UploadStrip from "./UploadStrip";
import ElementsPanel from "./ElementsPanel";
import PropertiesPanel from "./PropertiesPanel";
import { PageDoc, ElementDoc, ElementType, LangMode, ViewMode } from "./types";
import { buildPagesFromFiles, downloadJson } from "./utils";
import { DEFAULT_STYLE, TEMPLATE_CATALOG, getDefaultTemplateForType } from "./templates";
import { mockAnalyzePage } from "./mockAi";

const CanvasEditor = dynamic(() => import("./CanvasEditor"), { ssr: false });

export default function ChapterEditor({ mode }: { mode: "manual" | "ai" }) {
  const [pages, setPages] = useState<PageDoc[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>("edit");
  const [langMode, setLangMode] = useState<LangMode>("original");

  const currentPage = pages[currentIndex] ?? null;
  const selected = currentPage?.elements.find((e) => e.id === selectedId) ?? null;

  async function onPickFiles(files: File[]) {
    const built = await buildPagesFromFiles(files);
    setPages(built);
    setCurrentIndex(0);
    setSelectedId(null);
  }

  function updateCurrentPage(updater: (p: PageDoc) => PageDoc) {
    setPages((prev) =>
      prev.map((p, idx) => (idx === currentIndex ? updater(p) : p))
    );
  }

  function addElement(type: ElementType) {
    if (!currentPage) return;

    const templateId = getDefaultTemplateForType(type);
    const def = TEMPLATE_CATALOG[templateId];

    const el: ElementDoc = {
      id: nanoid(),
      type,
      bbox: { x: 0.35, y: 0.35, w: 0.30, h: 0.16 },
      rotation: 0,
      templateId,
      templateParams: { ...def.defaultParams },
      text: { original: "", translated: "", lang: "unknown", direction: "LTR" },
      style: { ...def.defaultStyle },
    };

    updateCurrentPage((p) => ({ ...p, elements: [...p.elements, el] }));
    setSelectedId(el.id);
  }

  function deleteElement(id: string) {
    if (!currentPage) return;
    updateCurrentPage((p) => ({ ...p, elements: p.elements.filter((e) => e.id !== id) }));
  }

  function updateSelected(patch: Partial<ElementDoc>) {
    if (!currentPage || !selectedId) return;
    updateCurrentPage((p) => ({
      ...p,
      elements: p.elements.map((e) => (e.id === selectedId ? { ...e, ...patch } : e)),
    }));
  }

  function updateElementBBox(id: string, nextBBox: ElementDoc["bbox"]) {
    if (!currentPage) return;
    updateCurrentPage((p) => ({
      ...p,
      elements: p.elements.map((e) => (e.id === id ? { ...e, bbox: nextBBox } : e)),
    }));
  }

  function runAiMockForCurrent() {
    if (!currentPage) return;
    updateCurrentPage((p) => mockAnalyzePage(p));
    setSelectedId(null);
  }

  function exportChapterJson() {
    const data = {
      mode,
      pages: pages.map((p) => ({
        id: p.id,
        image: { name: p.image.name, width: p.image.width, height: p.image.height },
        elements: p.elements,
      })),
    };
    downloadJson("chapter_editor_export.json", data);
  }

  return (
    <div className="h-dvh flex flex-col">
      <TopBar
        mode={mode}
        viewMode={viewMode}
        langMode={langMode}
        onViewMode={setViewMode}
        onLangMode={setLangMode}
        onExport={exportChapterJson}
      />

      <UploadStrip
        pages={pages}
        currentIndex={currentIndex}
        onPickIndex={(idx) => {
          setCurrentIndex(idx);
          setSelectedId(null);
        }}
        onPickFiles={onPickFiles}
      />

      <div className="flex flex-1 min-h-0">
        <ElementsPanel
          page={currentPage}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onAdd={addElement}
          onDelete={deleteElement}
          showAiActions={mode === "ai"}
          onRunAiMock={runAiMockForCurrent}
        />

        <CanvasEditor
          page={currentPage}
          selectedId={selectedId}
          viewMode={viewMode}
          langMode={langMode}
          onSelect={setSelectedId}
          onUpdateElementBBox={updateElementBBox}
        />

        <PropertiesPanel
          page={currentPage}
          selected={selected}
          langMode={langMode}
          onUpdate={updateSelected}
        />
      </div>
    </div>
  );
}

import React, { useState } from "react";

function TopBar({
  mode,
  viewMode,
  langMode,
  onViewMode,
  onLangMode,
  onExport,
}: {
  mode: "manual" | "ai";
  viewMode: ViewMode;
  langMode: LangMode;
  onViewMode: (v: ViewMode) => void;
  onLangMode: (v: LangMode) => void;
  onExport: () => void;
}) {
  return (
    <div className="border-b p-3 flex items-center gap-3">
      <div className="font-semibold">Editor Lab</div>
      <div className="text-xs text-gray-500">mode: {mode}</div>

      <div className="ml-auto flex items-center gap-2">
        <button
          className={btnClass(viewMode === "edit")}
          onClick={() => onViewMode("edit")}
        >
          Edit
        </button>
        <button
          className={btnClass(viewMode === "preview")}
          onClick={() => onViewMode("preview")}
        >
          Preview
        </button>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        <button
          className={btnClass(langMode === "original")}
          onClick={() => onLangMode("original")}
        >
          Original
        </button>
        <button
          className={btnClass(langMode === "translated")}
          onClick={() => onLangMode("translated")}
        >
          Translated
        </button>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        <button className="px-3 py-2 rounded border" onClick={onExport}>
          Export JSON
        </button>
      </div>
    </div>
  );
}

function btnClass(active: boolean) {
  return [
    "px-3 py-2 rounded border text-sm",
    active ? "bg-black text-white border-black" : "bg-white",
  ].join(" ");
}
