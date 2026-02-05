// components\content-create\composers\StoryComposer.tsx
"use client";

import * as React from "react";
import { IoImageOutline, IoTrashOutline } from "react-icons/io5";
import { Button } from "@/design/DeButton";
import type { StoryDraft } from "../publish-drafts";

type Props = {
  draftRef: React.MutableRefObject<StoryDraft>;
  onValidityChange?: (canPublish: boolean) => void;
  disabled?: boolean;
};

export default function StoryComposer({
  draftRef,
  onValidityChange,
  disabled,
}: Props) {
  const [fileTick, setFileTick] = React.useState(0);

  const emitValidity = React.useCallback(() => {
    onValidityChange?.(Boolean(draftRef.current.media));
  }, [draftRef, onValidityChange]);

  React.useEffect(() => {
    emitValidity();
  }, [emitValidity]);

  const onPick = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0] ?? null;
      draftRef.current.media = f;
      e.target.value = "";
      setFileTick((x) => x + 1);
      emitValidity();
    },
    [draftRef, emitValidity],
  );

  const remove = React.useCallback(() => {
    draftRef.current.media = null;
    setFileTick((x) => x + 1);
    emitValidity();
  }, [draftRef, emitValidity]);

  const onCaptionChange = React.useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      draftRef.current.caption = e.target.value;
    },
    [draftRef],
  );

  const media = draftRef.current.media;

  return (
    <div className="space-y-4" key={fileTick}>
      <label className="block">
        <input
          type="file"
          accept="image/*,video/*"
          onChange={onPick}
          disabled={disabled}
          className="sr-only"
        />

        <div
          className="
            rounded-2xl border border-border-subtle bg-surface-soft/60
            p-4 flex items-center justify-between gap-3
          "
        >
          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground-strong">
              اختر وسائط للستوري
            </div>
            <div className="text-xs text-foreground-muted truncate">
              {media ? media.name : "صورة أو فيديو"}
            </div>
          </div>

          <Button
            size="md"
            shape="rounded"
            variant="soft"
            tone="neutral"
            disabled={disabled}
          >
            <span className="inline-flex items-center gap-2">
              <IoImageOutline className="size-5" />
              اختيار
            </span>
          </Button>
        </div>
      </label>

      {media && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border-subtle px-3 py-2 bg-background-elevated/60">
          <div className="min-w-0">
            <div className="truncate text-sm text-foreground-strong">
              {media.name}
            </div>
            <div className="text-xs text-foreground-muted">
              {(media.size / 1024 / 1024).toFixed(1)} MB
            </div>
          </div>

          <Button
            iconOnly
            size="md"
            shape="circle"
            variant="soft"
            tone="neutral"
            onClick={remove}
            disabled={disabled}
            aria-label="Remove story media"
          >
            <IoTrashOutline className="size-5" />
          </Button>
        </div>
      )}

      <textarea
        defaultValue={draftRef.current.caption}
        onChange={onCaptionChange}
        disabled={disabled}
        placeholder="وصف قصير (اختياري)…"
        className="
          w-full min-h-[100px] resize-none rounded-xl
          bg-surface-soft/60 border border-border-subtle
          px-4 py-3 text-sm text-foreground-strong
          outline-none focus-visible:ring-2 focus-visible:ring-accent-ring/40
        "
      />
    </div>
  );
}
