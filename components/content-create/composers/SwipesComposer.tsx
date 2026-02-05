"use client";

import * as React from "react";
import { IoImageOutline, IoTrashOutline, IoArrowUp, IoArrowDown } from "react-icons/io5";
import { Button } from "@/design/DeButton";
import type { SwipesDraft, SwipesSlideDraft } from "../publish-drafts";
import { createSwipeSlideDraft } from "../publish-drafts";

type Props = {
  draftRef: React.MutableRefObject<SwipesDraft>;
  onValidityChange?: (canPublish: boolean) => void;
  disabled?: boolean;
};

type Action =
  | { type: "add" }
  | { type: "remove"; id: string }
  | { type: "caption"; id: string; caption: string }
  | { type: "media"; id: string; file: File | null }
  | { type: "move"; id: string; dir: "up" | "down" };

function reducer(state: SwipesSlideDraft[], action: Action): SwipesSlideDraft[] {
  switch (action.type) {
    case "add":
      return [...state, createSwipeSlideDraft()];

    case "remove":
      return state.filter((s) => s.id !== action.id);

    case "caption":
      return state.map((s) => (s.id === action.id ? { ...s, caption: action.caption } : s));

    case "media":
      return state.map((s) => (s.id === action.id ? { ...s, media: action.file } : s));

    case "move": {
      const idx = state.findIndex((s) => s.id === action.id);
      if (idx === -1) return state;

      const nextIdx = action.dir === "up" ? idx - 1 : idx + 1;
      if (nextIdx < 0 || nextIdx >= state.length) return state;

      const copy = state.slice();
      const [item] = copy.splice(idx, 1);
      copy.splice(nextIdx, 0, item);
      return copy;
    }

    default:
      return state;
  }
}

function computeValid(slides: SwipesSlideDraft[]) {
  // منطقياً: swipes لازم 2+ slides وكل slide فيها محتوى (caption أو media)
  return (
    slides.length >= 2 &&
    slides.every((s) => Boolean(s.caption.trim()) || Boolean(s.media))
  );
}

const SlideEditor = React.memo(function SlideEditor({
  index,
  total,
  slide,
  disabled,
  onCaption,
  onPickMedia,
  onRemoveMedia,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  index: number;
  total: number;
  slide: SwipesSlideDraft;
  disabled?: boolean;
  onCaption: (id: string, caption: string) => void;
  onPickMedia: (id: string, f: File | null) => void;
  onRemoveMedia: (id: string) => void;
  onRemove: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-background-elevated/60 p-3 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-semibold text-foreground-strong">
          Slide {index + 1} / {total}
        </div>

        <div className="flex items-center gap-2">
          <Button
            iconOnly
            size="md"
            shape="circle"
            variant="soft"
            tone="neutral"
            onClick={() => onMoveUp(slide.id)}
            disabled={disabled || index === 0}
            aria-label="Move up"
          >
            <IoArrowUp className="size-5" />
          </Button>

          <Button
            iconOnly
            size="md"
            shape="circle"
            variant="soft"
            tone="neutral"
            onClick={() => onMoveDown(slide.id)}
            disabled={disabled || index === total - 1}
            aria-label="Move down"
          >
            <IoArrowDown className="size-5" />
          </Button>

          <Button
            iconOnly
            size="md"
            shape="circle"
            variant="soft"
            tone="neutral"
            onClick={() => onRemove(slide.id)}
            disabled={disabled || total <= 1}
            aria-label="Remove slide"
          >
            <IoTrashOutline className="size-5" />
          </Button>
        </div>
      </div>

      <textarea
        defaultValue={slide.caption}
        onChange={(e) => onCaption(slide.id, e.target.value)}
        disabled={disabled}
        placeholder="نص السلايد..."
        className="
          w-full min-h-[90px] resize-none rounded-xl
          bg-surface-soft/60 border border-border-subtle
          px-4 py-3 text-sm text-foreground-strong
          outline-none focus-visible:ring-2 focus-visible:ring-accent-ring/40
        "
      />

      <div className="flex items-center justify-between gap-2">
        <label className="inline-flex items-center gap-2">
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => onPickMedia(slide.id, e.target.files?.[0] ?? null)}
            disabled={disabled}
            className="sr-only"
          />
          <Button
            size="md"
            shape="rounded"
            variant="soft"
            tone="neutral"
            disabled={disabled}
          >
            <span className="inline-flex items-center gap-2">
              <IoImageOutline className="size-5" />
              Media
            </span>
          </Button>
        </label>

        {slide.media ? (
          <div className="flex items-center gap-2 min-w-0">
            <span className="truncate text-xs text-foreground-muted max-w-[220px]">
              {slide.media.name}
            </span>
            <Button
              iconOnly
              size="md"
              shape="circle"
              variant="soft"
              tone="neutral"
              onClick={() => onRemoveMedia(slide.id)}
              disabled={disabled}
              aria-label="Remove slide media"
            >
              <IoTrashOutline className="size-5" />
            </Button>
          </div>
        ) : (
          <span className="text-xs text-foreground-muted">بدون وسائط</span>
        )}
      </div>
    </div>
  );
});

export default function SwipesComposer({ draftRef, onValidityChange, disabled }: Props) {
  const [slides, dispatch] = React.useReducer(
    reducer,
    undefined,
    () => (draftRef.current.slides?.length ? draftRef.current.slides : [createSwipeSlideDraft()]),
  );

  // keep draftRef synced
  React.useEffect(() => {
    draftRef.current.slides = slides;
    onValidityChange?.(computeValid(slides));
  }, [slides, draftRef, onValidityChange]);

  const add = React.useCallback(() => dispatch({ type: "add" }), []);

  const onCaption = React.useCallback((id: string, caption: string) => {
    dispatch({ type: "caption", id, caption });
  }, []);

  const onPickMedia = React.useCallback((id: string, file: File | null) => {
    dispatch({ type: "media", id, file });
  }, []);

  const onRemoveMedia = React.useCallback((id: string) => {
    dispatch({ type: "media", id, file: null });
  }, []);

  const onRemove = React.useCallback((id: string) => {
    dispatch({ type: "remove", id });
  }, []);

  const onMoveUp = React.useCallback((id: string) => {
    dispatch({ type: "move", id, dir: "up" });
  }, []);

  const onMoveDown = React.useCallback((id: string) => {
    dispatch({ type: "move", id, dir: "down" });
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm text-foreground-muted">
          Swipes تحتاج على الأقل <span className="font-semibold text-foreground-strong">2</span> سلايدز
        </div>

        <Button
          size="md"
          shape="rounded"
          variant="soft"
          tone="neutral"
          onClick={add}
          disabled={disabled}
        >
          + إضافة Slide
        </Button>
      </div>

      <div className="space-y-3">
        {slides.map((slide, idx) => (
          <SlideEditor
            key={slide.id}
            index={idx}
            total={slides.length}
            slide={slide}
            disabled={disabled}
            onCaption={onCaption}
            onPickMedia={onPickMedia}
            onRemoveMedia={onRemoveMedia}
            onRemove={onRemove}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
          />
        ))}
      </div>
    </div>
  );
}
