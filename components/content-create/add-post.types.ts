import * as React from "react";

export type AddPostMode = "desktop" | "phone";

export type AddPostItemId = "post" | "swipes" | "story";

export type Tone = "brand" | "cyan" | "pink";

export type Item = {
  id: AddPostItemId;
  title: string; // next-intl key
  sub: string; // next-intl key
  Icon: React.ComponentType<{ className?: string }>;
  tone: Tone;
};

export type CSSVars = React.CSSProperties & Record<`--${string}`, string>;

export type AddPostProps = {
  mode: AddPostMode;
};
