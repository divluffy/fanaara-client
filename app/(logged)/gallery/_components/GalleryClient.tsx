// app\(logged)\gallery\_components\GalleryClient.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { LayoutGroup } from "framer-motion";
import { Masonry } from "masonic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  IoFilter,
  IoRefreshOutline,
  IoSearchOutline,
  IoWarningOutline,
} from "react-icons/io5";

import type {
  GalleryFilters,
  GalleryQueryState,
  GalleryWork,
} from "./_data/galleryTypes";
import {
  applyQueryPatch,
  cn,
  getDocumentDir,
  parseGalleryQuery,
  safeLower,
} from "./_data/galleryUtils";
import {
  CATEGORIES,
  TRENDING_KEYWORDS,
  WORK_KINDS,
  mockFetchWorkById,
  mockFetchWorks,
} from "./_data/galleryMock";

import KeywordRail from "./KeywordRail";
import FiltersDrawer from "./FiltersDrawer";
import GalleryCard from "./GalleryCard";
import GalleryDetailsPanel from "./GalleryDetailsPanel";
import GalleryGridSkeleton from "./GalleryGridSkeleton";
import PaginationBar from "./PaginationBar";

const PAGE_SIZE = 40;

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}

function useLocalStorageRecord(key: string) {
  const [state, setState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") setState(parsed);
    } catch {
      // ignore
    }
  }, [key]);

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [key, state]);

  return [state, setState] as const;
}

function countActiveFilters(f: GalleryFilters) {
  let n = 0;
  if (f.q.trim()) n++;
  if (f.tag.trim()) n++;
  if (f.cat !== "all") n++;
  if (f.kind !== "all") n++;
  if (f.sort !== "trending") n++;
  if (f.o !== "all") n++;
  if (f.verified) n++;
  if (f.following) n++;
  if (f.multi) n++;
  return n;
}

function matchesFilters(
  work: GalleryWork,
  filters: GalleryFilters,
  followingAuthorIds: string[],
) {
  if (filters.cat !== "all" && work.categoryId !== filters.cat) return false;
  if (filters.kind !== "all" && work.kind !== filters.kind) return false;
  if (filters.multi && work.images.length <= 1) return false;
  if (filters.verified && !work.author.verified) return false;
  if (filters.following && !followingAuthorIds.includes(work.author.id))
    return false;

  // orientation: use first image ratio
  if (filters.o !== "all") {
    const img = work.images[0];
    if (img) {
      const r = img.width / img.height;
      const o = r < 0.92 ? "portrait" : r > 1.15 ? "landscape" : "square";
      if (o !== filters.o) return false;
    }
  }

  const q = safeLower(filters.q);
  if (q) {
    const hay = [
      work.title,
      work.description,
      work.author.name,
      work.author.username,
      work.kind,
      work.categoryId,
      ...work.tags,
    ]
      .map(safeLower)
      .join(" ");
    if (!hay.includes(q)) return false;
  }

  const tag = safeLower(filters.tag);
  if (tag) {
    const ok =
      work.tags.some((t) => safeLower(t) === tag) ||
      safeLower(work.title).includes(tag);
    if (!ok) return false;
  }

  return true;
}

export default function GalleryClient() {
  const dir = getDocumentDir();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlState: GalleryQueryState = useMemo(() => {
    return parseGalleryQuery(new URLSearchParams(searchParams.toString()));
  }, [searchParams]);

  const filters: GalleryFilters = useMemo(
    () => ({
      q: urlState.q,
      tag: urlState.tag,
      cat: urlState.cat,
      kind: urlState.kind,
      sort: urlState.sort,
      o: urlState.o,
      verified: urlState.verified,
      following: urlState.following,
      multi: urlState.multi,
    }),
    [urlState],
  );

  const page = urlState.page;

  const [filtersOpen, setFiltersOpen] = useState(false);

  const [likedMap, setLikedMap] = useLocalStorageRecord(
    "fanaara.gallery.likes.v2",
  );
  const [savedMap, setSavedMap] = useLocalStorageRecord(
    "fanaara.gallery.saves.v2",
  );
  const [followingMap, setFollowingMap] = useLocalStorageRecord(
    "fanaara.gallery.following.v2",
  );

  const followingAuthorIds = useMemo(() => {
    return Object.keys(followingMap).filter((k) => !!followingMap[k]);
  }, [followingMap]);

  // Search input (debounced into URL)
  const [searchInput, setSearchInput] = useState(filters.q);
  useEffect(() => setSearchInput(filters.q), [filters.q]);

  const debouncedSearch = useDebouncedValue(searchInput, 350);

  const patchUrl = useCallback(
    (patch: Parameters<typeof applyQueryPatch>[1]) => {
      const current = new URLSearchParams(searchParams.toString());
      const next = applyQueryPatch(current, patch);
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  // Any filter change should reset page to 1
  const patchFilters = useCallback(
    (patch: Parameters<typeof applyQueryPatch>[1]) => {
      patchUrl({ ...patch, page: 1 });
    },
    [patchUrl],
  );

  // Apply debounced q to URL (and reset page)
  useEffect(() => {
    if (debouncedSearch === filters.q) return;
    patchFilters({ q: debouncedSearch || null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const activeFilterCount = useMemo(
    () => countActiveFilters(filters),
    [filters],
  );

  // --------------------
  // Grid data (pagination)
  // --------------------
  const [gridNonce, setGridNonce] = useState(0);

  const [gridStatus, setGridStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [gridError, setGridError] = useState<string | null>(null);
  const [items, setItems] = useState<GalleryWork[]>([]);
  const [total, setTotal] = useState(0);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / PAGE_SIZE)),
    [total],
  );

  const filtersKey = useMemo(() => {
    return JSON.stringify({
      ...filters,
      page,
      gridNonce,
      followingAuthorIds: filters.following
        ? followingAuthorIds.slice().sort()
        : [],
    });
  }, [filters, followingAuthorIds, filters.following, page, gridNonce]);

  useEffect(() => {
    let alive = true;

    setGridStatus("loading");
    setGridError(null);
    setItems([]);
    setTotal(0);

    const offset = (page - 1) * PAGE_SIZE;

    mockFetchWorks({
      offset,
      limit: PAGE_SIZE,
      filters,
      followingAuthorIds,
      debugFail: searchParams.get("debug") === "grid_error",
    })
      .then((res) => {
        if (!alive) return;

        const tp = Math.max(1, Math.ceil(res.total / PAGE_SIZE));
        // If user is on a page that no longer exists, snap to last page
        if (page > tp && res.total > 0) {
          patchUrl({ page: tp });
          return;
        }

        setItems(res.items);
        setTotal(res.total);
        setGridStatus("ready");
      })
      .catch((e) => {
        if (!alive) return;
        setGridStatus("error");
        setGridError(e?.message ?? "Unknown error");
      });

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  const retryGrid = useCallback(() => setGridNonce((n) => n + 1), []);

  const onPageChange = useCallback(
    (next: number) => {
      patchUrl({ page: next });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [patchUrl],
  );

  // --------------------
  // Details (query id)
  // --------------------
  const [detailNonce, setDetailNonce] = useState(0);

  const [detailStatus, setDetailStatus] = useState<
    "loading" | "ready" | "error" | "not_found"
  >("loading");
  const [detailWork, setDetailWork] = useState<GalleryWork | null>(null);

  useEffect(() => {
    const id = urlState.id;
    if (!id) {
      setDetailWork(null);
      return;
    }

    let alive = true;
    setDetailStatus("loading");
    setDetailWork(null);

    mockFetchWorkById({
      id,
      debugFail: searchParams.get("debug") === "detail_error",
    })
      .then((w) => {
        if (!alive) return;
        setDetailWork(w);
        setDetailStatus("ready");
      })
      .catch((e) => {
        if (!alive) return;
        if (e?.code === "NOT_FOUND" || e?.message === "NOT_FOUND")
          setDetailStatus("not_found");
        else setDetailStatus("error");
      });

    return () => {
      alive = false;
    };
  }, [urlState.id, searchParams, detailNonce]);

  const selectedId = urlState.id;
  const detailsOpen = !!selectedId;

  const hiddenByFilters = useMemo(() => {
    if (!detailsOpen || detailStatus !== "ready" || !detailWork) return false;
    return !matchesFilters(detailWork, filters, followingAuthorIds);
  }, [detailsOpen, detailStatus, detailWork, filters, followingAuthorIds]);

  const openDetails = useCallback((id: string) => patchUrl({ id }), [patchUrl]);
  const closeDetails = useCallback(() => patchUrl({ id: null }), [patchUrl]);
  const retryDetails = useCallback(() => setDetailNonce((n) => n + 1), []);

  const revealInFilters = useCallback(() => {
    if (!detailWork) return;
    patchFilters({
      cat: detailWork.categoryId,
      kind: detailWork.kind,
      q: null,
      tag: null,
      v: null,
      f: null,
      multi: null,
    });
  }, [detailWork, patchFilters]);

  // --------------------
  // Actions (like/save/share/follow)
  // --------------------
  const toggleLike = useCallback(
    (id: string) => setLikedMap((m) => ({ ...m, [id]: !m[id] })),
    [setLikedMap],
  );
  const toggleSave = useCallback(
    (id: string) => setSavedMap((m) => ({ ...m, [id]: !m[id] })),
    [setSavedMap],
  );

  const followRequest = useCallback(
    async ({
      userId,
      follow,
    }: {
      userId: string;
      follow: boolean;
      signal?: AbortSignal;
    }) => {
      setFollowingMap((m) => ({ ...m, [userId]: follow }));
      await new Promise((r) => setTimeout(r, 420));
    },
    [setFollowingMap],
  );

  const shareWork = useCallback(
    async (id: string) => {
      patchUrl({ id });
      await new Promise((r) => setTimeout(r, 50));
      try {
        await navigator.clipboard.writeText(window.location.href);
      } catch {
        // ignore
      }
    },
    [patchUrl],
  );

  const onKeywordChange = useCallback(
    (next: string) => patchFilters({ tag: next || null }),
    [patchFilters],
  );

  const onTagClickFromDetails = useCallback(
    (tag: string) => patchFilters({ tag, q: null }),
    [patchFilters],
  );

  return (
    <main className="min-h-screen bg-bg-page text-foreground selection:bg-accent/20">
      {/* Background motif */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
      >
        <div className="absolute inset-0 opacity-[0.10] [background:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:20px_20px] dark:opacity-[0.06]" />
        <div className="absolute -top-24 start-10 size-[420px] rounded-full bg-extra-cyan-soft blur-3xl opacity-50" />
        <div className="absolute -bottom-28 end-10 size-[420px] rounded-full bg-extra-pink-soft blur-3xl opacity-40" />
      </div>

      {/* Sticky header */}
      <header className="sticky top-0 z-50 border-b border-border-subtle bg-bg-page/80 backdrop-blur-xl">
        <div className="mx-auto max-w-[1800px] px-4 py-3 space-y-3">
          {/* Row: Search + Filter */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <IoSearchOutline className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-[18px] text-foreground-muted" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="ابحث عن أنمي، شخصية، ستايل…"
                className={cn(
                  "h-11 w-full rounded-full border border-border-subtle bg-surface-soft ps-11 pe-4 text-sm text-foreground outline-none transition",
                  "focus:border-accent-border focus:bg-surface focus:ring-4 focus:ring-accent/10",
                )}
                inputMode="search"
                autoComplete="off"
                spellCheck={false}
              />
            </div>

            <button
              type="button"
              className={cn(
                "relative grid h-11 w-11 place-items-center rounded-full border border-border-subtle bg-surface-soft hover:bg-surface",
                activeFilterCount > 0 && "border-accent-border bg-accent-soft",
              )}
              onClick={() => setFiltersOpen(true)}
              aria-label="Open filters"
              title="Filters"
            >
              <IoFilter className="text-[18px]" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -end-1 grid size-5 place-items-center rounded-full bg-foreground-strong text-[10px] font-black text-background">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Keywords (one row only) */}
          <KeywordRail
            keywords={[...TRENDING_KEYWORDS]}
            value={filters.tag}
            onChange={onKeywordChange}
          />

          {/* Categories quick chips */}
          <div className="app-scroll flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((c) => {
              const active = filters.cat === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() =>
                    patchFilters({ cat: c.id === "all" ? null : c.id })
                  }
                  className={cn(
                    "shrink-0 rounded-full border px-4 py-2 text-[12px] font-black transition",
                    active
                      ? "border-transparent bg-foreground-strong text-background shadow-[var(--shadow-sm)]"
                      : "border-border-subtle bg-surface-soft text-foreground-strong hover:bg-surface",
                  )}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-[1800px] px-4 py-5">
        <LayoutGroup id="gallery-layout-v2">
          {/* Grid */}
          <section className="min-w-0">
            {gridStatus === "loading" && (
              <GalleryGridSkeleton className="mt-2" />
            )}

            {gridStatus === "error" && (
              <div className="mx-auto max-w-xl py-16 text-center">
                <div className="mx-auto mb-4 grid size-16 place-items-center rounded-3xl border border-border-subtle bg-surface-soft">
                  <IoWarningOutline className="text-[28px] text-danger-500" />
                </div>
                <div className="text-base font-black text-foreground-strong">
                  حدث خطأ أثناء تحميل المعرض
                </div>
                <div className="mt-2 text-[12px] text-foreground-muted">
                  {gridError ?? "Mock error state"}
                </div>

                <div className="mt-5 flex justify-center">
                  <button
                    type="button"
                    onClick={retryGrid}
                    className="rounded-2xl bg-foreground-strong px-4 py-2 text-[12px] font-black text-background hover:opacity-95"
                  >
                    <span className="inline-flex items-center gap-2">
                      <IoRefreshOutline className="text-[16px]" /> إعادة
                      المحاولة
                    </span>
                  </button>
                </div>
              </div>
            )}

            {gridStatus === "ready" && (
              <>
                {items.length === 0 ? (
                  <div className="mx-auto max-w-xl py-14 text-center">
                    <img
                      src="/empty-sad-anime.svg"
                      alt="No results"
                      className="mx-auto w-[260px] max-w-[70vw] opacity-95"
                      loading="lazy"
                    />
                    <div className="mt-4 text-base font-black text-foreground-strong">
                      لا توجد نتائج
                    </div>
                    <div className="mt-2 text-[12px] text-foreground-muted">
                      جرّب كلمات أخرى أو امسح الفلاتر.
                    </div>

                    <div className="mt-5 flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          patchFilters({
                            q: null,
                            tag: null,
                            cat: null,
                            kind: null,
                            sort: null,
                            o: null,
                            v: null,
                            f: null,
                            multi: null,
                          })
                        }
                        className="rounded-2xl border border-border-subtle bg-surface-soft px-4 py-2 text-[12px] font-black text-foreground-strong hover:bg-surface"
                      >
                        مسح الفلاتر
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Masonry */}
                    <Masonry
                      items={items}
                      columnWidth={280}
                      columnGutter={16}
                      overscanBy={1.5}
                      itemKey={(w) => w.id}
                      render={({ data, width }) => (
                        <GalleryCard
                          work={data}
                          width={width}
                          isLiked={!!likedMap[data.id]}
                          isSaved={!!savedMap[data.id]}
                          isFollowing={!!followingMap[data.author.id]}
                          onOpen={openDetails}
                          onToggleLike={toggleLike}
                          onToggleSave={toggleSave}
                          onShare={shareWork}
                          onFollowRequest={followRequest}
                        />
                      )}
                    />

                    {/* Pagination */}
                    <div className="mt-10 flex justify-center">
                      <PaginationBar
                        page={page}
                        totalPages={totalPages}
                        dir={dir}
                        onPageChange={onPageChange}
                      />
                    </div>
                  </>
                )}
              </>
            )}
          </section>

          {/* Fullscreen details viewer */}
          <GalleryDetailsPanel
            open={detailsOpen}
            dir={dir}
            status={selectedId ? detailStatus : "loading"}
            work={detailWork}
            isLiked={!!(detailWork && likedMap[detailWork.id])}
            isSaved={!!(detailWork && savedMap[detailWork.id])}
            isFollowing={!!(detailWork && followingMap[detailWork.author.id])}
            hiddenByFilters={hiddenByFilters}
            onClose={closeDetails}
            onRetry={retryDetails}
            onToggleLike={toggleLike}
            onToggleSave={toggleSave}
            onFollowRequest={followRequest}
            onTagClick={onTagClickFromDetails}
            onRevealInFilters={revealInFilters}
          />
        </LayoutGroup>
      </div>

      {/* Filters drawer */}
      <FiltersDrawer
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        categories={CATEGORIES}
        kinds={WORK_KINDS}
        value={filters}
        onReset={() =>
          patchFilters({
            q: null,
            tag: null,
            cat: null,
            kind: null,
            sort: null,
            o: null,
            v: null,
            f: null,
            multi: null,
          })
        }
        onApply={(next) =>
          patchFilters({
            q: next.q || null,
            tag: next.tag || null,
            cat: next.cat === "all" ? null : next.cat,
            kind: next.kind === "all" ? null : next.kind,
            sort: next.sort === "trending" ? null : next.sort,
            o: next.o === "all" ? null : next.o,
            v: next.verified ? true : false,
            f: next.following ? true : false,
            multi: next.multi ? true : false,
          })
        }
      />
    </main>
  );
}
