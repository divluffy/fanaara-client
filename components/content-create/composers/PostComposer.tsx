"use client";

import * as React from "react";
import { IoImageOutline, IoTrashOutline } from "react-icons/io5";
import { Button } from "@/design/DeButton";
import type { PostDraft } from "../publish-drafts";

type Props = {
  draftRef: React.MutableRefObject<PostDraft>;
  onValidityChange?: (canPublish: boolean) => void;
  disabled?: boolean;
};

function computeValid(d: PostDraft) {
  return Boolean(d.text.trim()) || d.media.length > 0;
}

export default function PostComposer({
  draftRef,
  onValidityChange,
  disabled,
}: Props) {
  const [mediaTick, setMediaTick] = React.useState(0);

  const emitValidity = React.useCallback(() => {
    onValidityChange?.(computeValid(draftRef.current));
  }, [draftRef, onValidityChange]);

  React.useEffect(() => {
    emitValidity();
  }, [emitValidity]);

  const onTextChange = React.useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      draftRef.current.text = e.target.value;
      emitValidity();
    },
    [draftRef, emitValidity],
  );

  const onPickMedia = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : [];
      if (!files.length) return;

      draftRef.current.media.push(...files);
      e.target.value = ""; // allow reselect same file
      setMediaTick((x) => x + 1);
      emitValidity();
    },
    [draftRef, emitValidity],
  );

  const removeMedia = React.useCallback(
    (idx: number) => {
      draftRef.current.media.splice(idx, 1);
      setMediaTick((x) => x + 1);
      emitValidity();
    },
    [draftRef, emitValidity],
  );

  const media = draftRef.current.media;

  return (
    <div className="space-y-4">
      <textarea
        defaultValue={draftRef.current.text}
        onChange={onTextChange}
        disabled={disabled}
        placeholder="اكتب منشورك..."
        className="
          w-full min-h-[140px] resize-none rounded-xl
          bg-surface-soft/60 border border-border-subtle
          px-4 py-3 text-sm text-foreground-strong
          outline-none focus-visible:ring-2 focus-visible:ring-accent-ring/40
        "
      />

      <div className="flex items-center gap-2">
        <label className="inline-flex items-center gap-2">
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={onPickMedia}
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
              إضافة وسائط
            </span>
          </Button>
        </label>

        <span className="text-xs text-foreground-muted">
          {media.length ? `${media.length} ملف` : "بدون وسائط"}
        </span>
      </div>

      {media.length > 0 && (
        <div className="space-y-2" key={mediaTick}>
          {media.map((f, idx) => (
            <div
              key={`${f.name}-${f.size}-${idx}`}
              className="
                flex items-center justify-between gap-3
                rounded-xl border border-border-subtle bg-background-elevated/60
                px-3 py-2
              "
            >
              <div className="min-w-0">
                <div className="truncate text-sm text-foreground-strong">
                  {f.name}
                </div>
                <div className="text-xs text-foreground-muted">
                  {(f.size / 1024 / 1024).toFixed(1)} MB
                </div>
              </div>

              <Button
                iconOnly
                size="md"
                shape="circle"
                variant="soft"
                tone="neutral"
                onClick={() => removeMedia(idx)}
                disabled={disabled}
                aria-label="Remove media"
              >
                <IoTrashOutline className="size-5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
