// features/signup/constants.ts
export const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)]";

export const USERNAME_RE = /^[a-zA-Z][a-zA-Z0-9_]{3,31}$/;

export const NAME_RE = /^[A-Za-z\u0600-\u06FF][A-Za-z\u0600-\u06FF\s'-]{1,}$/u;
