"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import DeModal from "@/design/DeModal";
import { Button } from "@/design/DeButton";

import type { PostDraft } from "./publish-drafts";
import { createPostDraft } from "./publish-drafts";
import PostComposer from "./composers/PostComposer";

export type PublishPostModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draftRef: React.MutableRefObject<PostDraft>;
};

export default function PublishPostModal({
  open,
  onOpenChange,
  draftRef,
}: PublishPostModalProps) {
  const t = useTranslations("publish");

  const [canPublish, setCanPublish] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  // Sync initial validity when open
  React.useEffect(() => {
    if (!open) return;
    const d = draftRef.current;
    setCanPublish(Boolean(d.text.trim()) || d.media.length > 0);
  }, [open, draftRef]);

  const publish = React.useCallback(async () => {
    if (submitting) return;

    const d = draftRef.current;
    const ok = Boolean(d.text.trim()) || d.media.length > 0;
    if (!ok) return;

    setSubmitting(true);
    try {
      // TODO: call your API (NestJS endpoint) e.g. await publishPost(d)
      // console.log("PUBLISH POST", d);

      // ✅ reset draft after success only
      draftRef.current = createPostDraft();
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }, [draftRef, onOpenChange, submitting]);

  return (
    <DeModal
      open={open}
      onOpenChange={onOpenChange}
      mode={{ desktop: "center", mobile: "sheet" }}
      title={t("title_post")}
      mountChildren="after-open"
      closeOnBackdrop={!submitting}
      closeOnEsc={!submitting}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button
            size="md"
            shape="rounded"
            variant="soft"
            tone="neutral"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            إلغاء
          </Button>
          <Button
            size="md"
            shape="rounded"
            variant="solid"
            tone="brand"
            onClick={publish}
            disabled={!canPublish || submitting}
          >
            نشر
          </Button>
        </div>
      }
    >
      <PostComposer
        draftRef={draftRef}
        onValidityChange={setCanPublish}
        disabled={submitting}
      />
    </DeModal>
  );
}
