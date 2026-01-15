// lib/cookies.ts
export function getCookie(name: string) {
  if (typeof document === "undefined") return undefined;
  const parts = document.cookie.split("; ").map((v) => v.split("="));
  const found = parts.find(([k]) => k === name);
  return found?.[1];
}
