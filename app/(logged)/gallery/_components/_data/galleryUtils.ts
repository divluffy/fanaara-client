// app\(logged)\gallery\_components\_data\galleryUtils.ts
import type {
  GalleryQueryState,
  Orientation,
  SortMode,
  WorkKind,
} from "./galleryTypes";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function safeLower(v: unknown) {
  return (v ?? "").toString().trim().toLowerCase();
}

export function clampInt(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

export function formatCompact(n: number, locale = "en") {
  try {
    return new Intl.NumberFormat(locale, {
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: 1,
    }).format(n);
  } catch {
    return String(n);
  }
}

export function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function getDocumentDir(): "rtl" | "ltr" {
  if (typeof document === "undefined") return "ltr";
  return document.documentElement?.dir === "rtl" ? "rtl" : "ltr";
}

function asBool(v: string | null) {
  return v === "1" || v === "true";
}

function asEnum<T extends string>(
  v: string | null,
  allowed: readonly T[],
  fallback: T,
): T {
  if (!v) return fallback;
  return allowed.includes(v as T) ? (v as T) : fallback;
}

function asPosInt(v: string | null, fallback: number) {
  if (!v) return fallback;
  const n = Number.parseInt(v, 10);
  if (!Number.isFinite(n)) return fallback;
  if (n <= 0) return fallback;
  return n;
}

export function parseGalleryQuery(
  searchParams: URLSearchParams,
): GalleryQueryState {
  const q = searchParams.get("q") ?? "";
  const tag = searchParams.get("tag") ?? "";
  const cat = searchParams.get("cat") ?? "all";

  const kind = asEnum<WorkKind>(
    (searchParams.get("kind") as WorkKind) ?? "all",
    [
      "all",
      "fanart",
      "wallpaper",
      "manga_panel",
      "cosplay",
      "chibi",
      "pixel",
      "concept",
    ] as const,
    "all",
  );

  const sort = asEnum<SortMode>(
    (searchParams.get("sort") as SortMode) ?? "trending",
    ["trending", "new", "top"] as const,
    "trending",
  );

  const o = asEnum<Orientation>(
    (searchParams.get("o") as Orientation) ?? "all",
    ["all", "portrait", "square", "landscape"] as const,
    "all",
  );

  const verified = asBool(searchParams.get("v"));
  const following = asBool(searchParams.get("f"));
  const multi = asBool(searchParams.get("multi"));

  const id = searchParams.get("id");
  const normalizedId = id && id.trim() ? id.trim() : null;

  // ✅ NEW: pagination
  const pageRaw = searchParams.get("page");
  const page = clampInt(asPosInt(pageRaw, 1), 1, 9999);

  return {
    q,
    tag,
    cat,
    kind,
    sort,
    o,
    verified,
    following,
    multi,
    id: normalizedId,
    page,
  };
}

export function applyQueryPatch(
  current: URLSearchParams,
  patch: Partial<{
    q: string | null;
    tag: string | null;
    cat: string | null;
    kind: string | null;
    sort: string | null;
    o: string | null;
    v: boolean | null;
    f: boolean | null;
    multi: boolean | null;
    id: string | null;
    page: number | null; // ✅ NEW
  }>,
) {
  const sp = new URLSearchParams(current.toString());

  const setOrDelete = (key: string, val: string | null | undefined) => {
    if (val == null || val === "") sp.delete(key);
    else sp.set(key, val);
  };

  if ("q" in patch) setOrDelete("q", patch.q ?? null);
  if ("tag" in patch) setOrDelete("tag", patch.tag ?? null);
  if ("cat" in patch) setOrDelete("cat", patch.cat ?? null);
  if ("kind" in patch) setOrDelete("kind", patch.kind ?? null);
  if ("sort" in patch) setOrDelete("sort", patch.sort ?? null);
  if ("o" in patch) setOrDelete("o", patch.o ?? null);

  if ("v" in patch) {
    const v = patch.v;
    if (v) sp.set("v", "1");
    else sp.delete("v");
  }

  if ("f" in patch) {
    const f = patch.f;
    if (f) sp.set("f", "1");
    else sp.delete("f");
  }

  if ("multi" in patch) {
    const m = patch.multi;
    if (m) sp.set("multi", "1");
    else sp.delete("multi");
  }

  if ("id" in patch) setOrDelete("id", patch.id ?? null);

  // ✅ NEW: page (clean url => page=1 is removed)
  if ("page" in patch) {
    const p = patch.page;
    if (p == null || p <= 1) sp.delete("page");
    else sp.set("page", String(clampInt(p, 1, 9999)));
  }

  return sp;
}
