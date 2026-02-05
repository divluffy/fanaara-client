// app\creator\works\[workId]\chapters\[chapterId]\setup\_components\SortablePagesGrid.tsx
"use client";

import React from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export type SortItem = {
  id: string;
  label: string;
  imageUrl: string;
};

function Thumb({ item, index }: { item: SortItem; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border rounded overflow-hidden bg-white w-max"
    >
      <div className="relative">
        <img src={item.imageUrl} alt="" className="w-50 h-full object-cover" />
        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          #{index + 1}
        </div>
        <div
          className="absolute top-2 right-2 bg-white/90 text-xs px-2 py-1 rounded cursor-grab"
          {...attributes}
          {...listeners}
        >
          Drag
        </div>
      </div>
      <div className="p-2 text-xs text-gray-600 truncate">{item.label}</div>
    </div>
  );
}

export default function SortablePagesGrid({
  items,
  onChange,
}: {
  items: SortItem[];
  onChange: (next: SortItem[]) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={(event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = items.findIndex((x) => x.id === active.id);
        const newIndex = items.findIndex((x) => x.id === over.id);
        onChange(arrayMove(items, oldIndex, newIndex));
      }}
    >
      <SortableContext
        items={items.map((x) => x.id)}
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          {items.map((it, idx) => (
            <Thumb key={it.id} item={it} index={idx} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
