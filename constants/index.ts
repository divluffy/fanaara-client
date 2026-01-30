// constants\index.ts
import { BORDER_ZORO_REMOTE } from "@/config";

export const MQ_DESKTOP = "(min-width: 768px)";
export const MOBILE_NAV_H = 56;
export const MOBILE_FOOTER_H = 64;

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export const MockUser = {
  name: "Ibrahim Jomaa",
  username: "@dev.luffy",
  alt: "Profile Avatar Ibrahim jomaa",
  src: "https://images3.alphacoders.com/132/thumbbig-1328396.webp",
  blurHash: "L27dqL?byX~W-BM{00Di9tM{~WIo",
  rankBorder: BORDER_ZORO_REMOTE,
};
