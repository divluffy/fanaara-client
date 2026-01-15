// layout/components/add-post/add-post.types.ts
import * as React from "react";

export type Tone = "brand" | "info" | "warning" | "success" | "danger";
export type AddPostItemId = "post" | "swipes" | "story";

export type Item = {
  id: AddPostItemId;
  title: string;
  sub: string;
  Icon: React.ComponentType<{ className?: string }>;
  tone: Tone;
};

export type CSSVars = React.CSSProperties & Record<`--${string}`, string>;

export type AddPostProps = {
  items?: readonly Item[];
  onSelect?: (id: AddPostItemId) => void;
  closeOnSelect?: boolean;
};
