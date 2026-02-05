// components\content-create\PublishStoryModal.tsx
"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import DeModal from "@/design/DeModal";
import { Button } from "@/design/DeButton";
import type { StoryDraft } from "./publish-drafts";

export type PublishStoryModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draftRef: React.MutableRefObject<StoryDraft>;
};

export default function PublishStoryModal({
  open,
  onOpenChange,
  draftRef,
}: PublishStoryModalProps) {
  const t = useTranslations("publish");

  const [canPublish, setCanPublish] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    const d = draftRef.current;
    setCanPublish(Boolean(d.media));
  }, [open, draftRef]);

  return (
    <DeModal
      open={open}
      onOpenChange={onOpenChange}
      mode={{ desktop: "center", mobile: "sheet" }}
      title={t("title_story")}
      mountChildren="after-open"
      closeOnBackdrop={!submitting}
      closeOnEsc={!submitting}
    >
      here content
    </DeModal>
  );
}
