// components/content-create/publish-drafts.ts
export type PostDraft = {
  text: string;
  media: File[];
};

export type StoryDraft = {
  caption: string;
  media: File | null;
};

export type SwipesSlideDraft = {
  id: string;
  caption: string;
  media: File | null;
};

export type SwipesDraft = {
  slides: SwipesSlideDraft[];
};

/** Safe id generator for client */
export function uid(prefix = "") {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}${crypto.randomUUID()}`;
  }
  return `${prefix}${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
}

export const createPostDraft = (): PostDraft => ({
  text: "",
  media: [],
});

export const createStoryDraft = (): StoryDraft => ({
  caption: "",
  media: null,
});

export const createSwipeSlideDraft = (): SwipesSlideDraft => ({
  id: uid("sw-"),
  caption: "",
  media: null,
});

export const createSwipesDraft = (): SwipesDraft => ({
  // منطقياً Swipes بدون سلايدز ما له معنى → ابدأ بسلايد واحد
  slides: [createSwipeSlideDraft()],
});
