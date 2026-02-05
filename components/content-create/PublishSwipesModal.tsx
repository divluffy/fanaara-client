"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import DeModal from "@/design/DeModal";
import { Button } from "@/design/DeButton";

import type { SwipesDraft } from "./publish-drafts";
import { createSwipesDraft } from "./publish-drafts";
import SwipesComposer from "./composers/SwipesComposer";

export type PublishSwipesModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draftRef: React.MutableRefObject<SwipesDraft>;
};

export default function PublishSwipesModal({
  open,
  onOpenChange,
  draftRef,
}: PublishSwipesModalProps) {
  const t = useTranslations("publish");

  const [canPublish, setCanPublish] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    const d = draftRef.current;
    setCanPublish(
      d.slides.length >= 2 &&
        d.slides.every((s) => Boolean(s.caption.trim()) || Boolean(s.media)),
    );
  }, [open, draftRef]);

  const publish = React.useCallback(async () => {
    if (submitting) return;

    const d = draftRef.current;
    const ok =
      d.slides.length >= 2 &&
      d.slides.every((s) => Boolean(s.caption.trim()) || Boolean(s.media));

    if (!ok) return;

    setSubmitting(true);
    try {
      // TODO: call your API to publish swipes
      // console.log("PUBLISH SWIPES", d);

      draftRef.current = createSwipesDraft();
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
      title={t("title_swipes")}
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
      <SwipesComposer
        draftRef={draftRef}
        onValidityChange={setCanPublish}
        disabled={submitting}
      />
    </DeModal>
  );
}
