"use client";

import { ElementDoc, ElementType, PageDoc, TemplateId } from "./types";

export default function ElementsPanel({
  page,
  selectedId,
  onSelect,
  onAdd,
  onDelete,
  onRunAiMock,
  showAiActions,
}: {
  page: PageDoc | null;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onAdd: (type: ElementType) => void;
  onDelete: (id: string) => void;
  onRunAiMock?: () => void;
  showAiActions: boolean;
}) {
  return (
    <aside className="w-[280px] border-r p-3 flex flex-col gap-3">
      <div className="space-y-2">
        <div className="text-sm font-semibold">Tools</div>
        <div className="grid grid-cols-2 gap-2">
          <button className="px-2 py-2 rounded border" onClick={() => onAdd("SPEECH")}>
            + Speech
          </button>
          <button className="px-2 py-2 rounded border" onClick={() => onAdd("NARRATION")}>
            + Narration
          </button>
          <button className="px-2 py-2 rounded border" onClick={() => onAdd("SCENE_TEXT")}>
            + Scene Text
          </button>
          <button className="px-2 py-2 rounded border" onClick={() => onAdd("SFX")}>
            + SFX
          </button>
        </div>

        {showAiActions && (
          <button
            className="w-full px-3 py-2 rounded bg-black text-white"
            onClick={onRunAiMock}
            disabled={!page}
          >
            Run AI (Mock) for this page
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        <div className="text-sm font-semibold mb-2">Elements</div>
        {!page ? (
          <div className="text-sm text-gray-500">Upload images to start.</div>
        ) : page.elements.length === 0 ? (
          <div className="text-sm text-gray-500">No elements yet.</div>
        ) : (
          <div className="space-y-2">
            {page.elements.map((el) => (
              <div
                key={el.id}
                className={[
                  "border rounded p-2 cursor-pointer",
                  el.id === selectedId ? "ring-2 ring-black" : "",
                ].join(" ")}
                onClick={() => onSelect(el.id)}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-semibold">{el.type}</div>
                  <button
                    className="text-xs px-2 py-1 rounded border"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(el.id);
                      if (selectedId === el.id) onSelect(null);
                    }}
                  >
                    Delete
                  </button>
                </div>
                <div className="text-xs text-gray-600 line-clamp-2 mt-1">
                  {el.text.original || "(empty)"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
