"use client";

import * as React from "react";
import type { AddPostItemId } from "./add-post.types";

import PublishPostModal from "./PublishPostModal";
import PublishSwipesModal from "./PublishSwipesModal";
import PublishStoryModal from "./PublishStoryModal";

import {
  createPostDraft,
  createStoryDraft,
  createSwipesDraft,
  type PostDraft,
  type StoryDraft,
  type SwipesDraft,
} from "./publish-drafts";

type Props = {
  active: AddPostItemId | null;
  onClose: () => void;
};

export default function PublishModals({ active, onClose }: Props) {
  // ✅ Draft لكل نوع (مستقل) + ما يسبب re-renders أثناء الكتابة
  const postDraftRef = React.useRef<PostDraft>(createPostDraft());
  const storyDraftRef = React.useRef<StoryDraft>(createStoryDraft());
  const swipesDraftRef = React.useRef<SwipesDraft>(createSwipesDraft());

  // ✅ mounted يحافظ على آخر نوع كان مفتوح (عشان exit animation)
  const [mounted, setMounted] = React.useState<AddPostItemId | null>(active);

  React.useEffect(() => {
    if (active) setMounted(active);
  }, [active]);

  const open = active !== null;
  const current = active ?? mounted;

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) onClose();
    },
    [onClose],
  );

  if (!current) return null;

  return (
    <>
      {current === "post" && (
        <PublishPostModal
          open={open}
          onOpenChange={handleOpenChange}
          draftRef={postDraftRef}
        />
      )}

      {current === "swipes" && (
        <PublishSwipesModal
          open={open}
          onOpenChange={handleOpenChange}
          draftRef={swipesDraftRef}
        />
      )}

      {current === "story" && (
        <PublishStoryModal
          open={open}
          onOpenChange={handleOpenChange}
          draftRef={storyDraftRef}
        />
      )}
    </>
  );
}
