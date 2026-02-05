// components\modal\utils.ts
export type Dir = "auto" | "rtl" | "ltr";
export type Overlay = "blur" | "dim" | "none";
export type Mode = "center" | "sheet";
export type Responsive<T> = T | { desktop?: T; mobile?: T };

export type SheetDragMode = "binary" | "none" | "legacy";

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function getDocDir(): "rtl" | "ltr" {
  if (typeof document === "undefined") return "ltr";
  return document.documentElement.getAttribute("dir") === "rtl" ? "rtl" : "ltr";
}

export function resolveResponsive<T>(
  value: Responsive<T> | undefined,
  isMobile: boolean,
  fallback: T,
): T {
  if (value === undefined) return fallback;
  if (
    typeof value === "object" &&
    value !== null &&
    ("desktop" in value || "mobile" in value)
  ) {
    return (isMobile ? value.mobile : value.desktop) ?? fallback;
  }
  return value as T;
}

export function getFocusable(container: HTMLElement): HTMLElement[] {
  const selector = [
    "a[href]",
    "button:not([disabled])",
    "textarea:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ].join(",");
  return Array.from(container.querySelectorAll(selector)).filter((el) => {
    const e = el as HTMLElement;
    if (e.hasAttribute("disabled")) return false;
    if (e.getAttribute("aria-hidden") === "true") return false;
    return true;
  }) as HTMLElement[];
}

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
