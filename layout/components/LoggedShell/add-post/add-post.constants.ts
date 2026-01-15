// layout/components/add-post/add-post.constants.ts
import {
  HiOutlineClock,
  HiOutlinePencilSquare,
  HiOutlinePlayCircle,
} from "react-icons/hi2";
import type { CSSVars, Item, Tone } from "./add-post.types";

export const TONE_VARS: Record<Tone, CSSVars> = {
  brand: {
    "--item-solid": "var(--color-accent)",
    "--item-on": "var(--color-accent-foreground)",
    "--item-soft": "var(--color-accent-soft)",
    "--item-border": "var(--color-accent-border)",
    "--item-ring": "var(--color-accent-ring)",
    "--item-glow": "var(--shadow-glow-brand)",
  },
  info: {
    "--item-solid": "var(--color-info-solid)",
    "--item-on": "var(--color-info-foreground)",
    "--item-soft": "var(--color-info-soft)",
    "--item-border": "var(--color-info-soft-border)",
    "--item-ring": "var(--ring-info)",
    "--item-glow": "var(--shadow-glow-info)",
  },
  warning: {
    "--item-solid": "var(--color-warning-solid)",
    "--item-on": "var(--color-warning-foreground)",
    "--item-soft": "var(--color-warning-soft)",
    "--item-border": "var(--color-warning-soft-border)",
    "--item-ring": "var(--ring-warning)",
    "--item-glow": "var(--shadow-glow-warning)",
  },
  success: {
    "--item-solid": "var(--color-success-solid)",
    "--item-on": "var(--color-success-foreground)",
    "--item-soft": "var(--color-success-soft)",
    "--item-border": "var(--color-success-soft-border)",
    "--item-ring": "var(--ring-success)",
    "--item-glow": "var(--shadow-glow-success)",
  },
  danger: {
    "--item-solid": "var(--color-danger-solid)",
    "--item-on": "var(--color-danger-foreground)",
    "--item-soft": "var(--color-danger-soft)",
    "--item-border": "var(--color-danger-soft-border)",
    "--item-ring": "var(--ring-danger)",
    "--item-glow": "var(--shadow-glow-danger)",
  },
};

export const DEFAULT_ITEMS: readonly Item[] = [
  {
    id: "post",
    title: "title_post",
    sub: "sub_post",
    Icon: HiOutlinePencilSquare,
    tone: "brand",
  },
  {
    id: "swipes",
    title: "title_swipes",
    sub: "sub_swipes",
    Icon: HiOutlinePlayCircle,
    tone: "info",
  },
  {
    id: "story",
    title: "title_story",
    sub: "sub_story",
    Icon: HiOutlineClock,
    tone: "warning",
  },
] as const;
