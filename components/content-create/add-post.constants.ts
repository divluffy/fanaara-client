import {
  HiOutlineClock,
  HiOutlinePencilSquare,
  HiOutlinePlayCircle,
} from "react-icons/hi2";
import type { CSSVars, Item, Tone } from "./add-post.types";

/**
 * ✅ ربط مباشر مع Design Tokens عندك:
 * - brand: accent (teal)
 * - cyan: extra-cyan
 * - pink: extra-pink
 */
export const TONE_VARS: Record<Tone, CSSVars> = {
  brand: {
    "--item-solid": "var(--color-accent)",
    "--item-on": "var(--color-accent-foreground)",
    "--item-soft": "var(--color-accent-soft)",
    "--item-border": "var(--color-accent-border)",
    "--item-ring": "var(--color-accent-ring)",
    "--item-glow": "var(--shadow-glow-brand)",
  },

  cyan: {
    "--item-solid": "var(--color-extra-cyan-solid)",
    "--item-on": "var(--color-extra-cyan-foreground)",
    "--item-soft": "var(--color-extra-cyan-soft)",
    "--item-border": "var(--color-extra-cyan-border)",
    "--item-ring": "var(--color-extra-cyan-ring)",
    "--item-glow": "var(--shadow-glow-cyan)",
  },

  pink: {
    "--item-solid": "var(--color-extra-pink-solid)",
    "--item-on": "var(--color-extra-pink-foreground)",
    "--item-soft": "var(--color-extra-pink-soft)",
    "--item-border": "var(--color-extra-pink-border)",
    "--item-ring": "var(--color-extra-pink-ring)",
    "--item-glow": "var(--shadow-glow-pink)",
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
    tone: "cyan",
  },
  {
    id: "story",
    title: "title_story",
    sub: "sub_story",
    Icon: HiOutlineClock,
    tone: "pink",
  },
] as const;
