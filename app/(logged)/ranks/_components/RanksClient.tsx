"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useReducedMotion } from "framer-motion";

import type {
  Dir,
  FilterValue,
  MetricId,
  RankItem,
  RankKind,
  SortId,
  TimeRangeId,
} from "../_utils/ranks.types";
import { TABS, TIME_RANGES } from "../_utils/ranks.config";
import { generateRanks } from "../_utils/ranks.mock";
import { cn } from "../_utils/ranks.utils";

import RanksHeader from "./RanksHeader";
import RanksTabs from "./RanksTabs";
import RanksFilterBar from "./RanksFilterBar";
import RanksPodium from "./RanksPodium";
import RankRowCard from "./RankRowCard";
import { RanksEmpty, RanksError } from "./RanksStates";
import { RanksListSkeleton, RanksTop3Skeleton } from "./RanksListSkeleton";
import { Button as DeButton } from "@/design/DeButton";
import { IoTrendingUp } from "react-icons/io5";

type LoadState = "loading" | "ready" | "empty" | "error";

function useDocumentDir(): Dir {
  const [dir, setDir] = useState<Dir>("rtl");

  useEffect(() => {
    const el = document.documentElement;

    const read = () => {
      const d = (el.getAttribute("dir") || "ltr").toLowerCase();
      setDir(d === "rtl" ? "rtl" : "ltr");
    };

    read();

    const obs = new MutationObserver(() => read());
    obs.observe(el, { attributes: true, attributeFilter: ["dir"] });

    return () => obs.disconnect();
  }, []);

  return dir;
}

export default function RanksClient() {
  const dir = useDocumentDir();
  const reduceMotion = useReducedMotion();

  const [activeTab, setActiveTab] = useState<RankKind>("anime");
  const tab = useMemo(() => TABS.find((t) => t.id === activeTab)!, [activeTab]);

  const [timeRange, setTimeRange] = useState<TimeRangeId>(
    tab.defaults.timeRange,
  );
  const [sort, setSort] = useState<SortId>(tab.defaults.sort);
  const [metric, setMetric] = useState<MetricId>(tab.defaults.metric);

  const [filters, setFilters] = useState<Record<string, FilterValue>>({});

  const [state, setState] = useState<LoadState>("loading");
  const [items, setItems] = useState<RankItem[]>([]);

  // Progressive rendering for 100 rows (keeps UI snappy)
  const [visibleCount, setVisibleCount] = useState(24);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // init filters on tab change
  useEffect(() => {
    const t = TABS.find((x) => x.id === activeTab)!;

    setTimeRange(t.defaults.timeRange);
    setSort(t.defaults.sort);
    setMetric(t.defaults.metric);

    const init: Record<string, FilterValue> = {};
    for (const fg of t.filters) init[fg.id] = fg.defaultValue;

    setFilters(init);
    setVisibleCount(24);
  }, [activeTab]);

  const setFilter = useCallback((id: string, v: FilterValue) => {
    setFilters((prev) => ({ ...prev, [id]: v }));
    setVisibleCount(24);
  }, []);

  const metricFormat = useMemo(() => {
    return tab.metrics.find((m) => m.id === metric)?.format ?? "compact";
  }, [tab.metrics, metric]);

  const timeLabel = useMemo(() => {
    const t = TIME_RANGES.find((x) => x.id === timeRange)?.label;
    return t ? (dir === "rtl" ? t.ar : t.en) : "";
  }, [timeRange, dir]);

  const load = useCallback(() => {
    setState("loading");

    const t = window.setTimeout(() => {
      try {
        const list = generateRanks({
          tab,
          metric,
          timeRange,
          sort,
          filters,
        });

        if (!list.length) {
          setItems([]);
          setState("empty");
          return;
        }

        setItems(list);
        setState("ready");
      } catch {
        setItems([]);
        setState("error");
      }
    }, 260);

    return () => window.clearTimeout(t);
  }, [tab, metric, timeRange, sort, filters]);

  useEffect(() => {
    const cancel = load();
    return cancel;
  }, [load]);

  // Progressive reveal
  useEffect(() => {
    if (state !== "ready") return;
    if (!sentinelRef.current) return;

    const el = sentinelRef.current;
    const obs = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (!e?.isIntersecting) return;

        setVisibleCount((c) => Math.min(items.length, c + 18));
      },
      { threshold: 0.1 },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [state, items.length]);

  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount],
  );
  const canLoadMore = state === "ready" && visibleCount < items.length;

  const onReset = useCallback(() => {
    setTimeRange(tab.defaults.timeRange);
    setSort(tab.defaults.sort);
    setMetric(tab.defaults.metric);

    const init: Record<string, FilterValue> = {};
    for (const fg of tab.filters) init[fg.id] = fg.defaultValue;

    setFilters(init);
    setVisibleCount(24);
  }, [tab]);

  return (
    <div
      className={cn("min-h-screen bg-background text-foreground pb-16")}
      dir={dir}
    >
      <RanksHeader dir={dir} timeLabel={timeLabel} />

      <RanksTabs
        dir={dir}
        tabs={TABS}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      <RanksFilterBar
        dir={dir}
        tab={tab}
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        sort={sort}
        setSort={setSort}
        metric={metric}
        setMetric={(m) => {
          setMetric(m);
          setVisibleCount(24);
        }}
        filters={filters}
        setFilter={setFilter}
        onReset={onReset}
      />

      {/* Content */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        {state === "loading" && (
          <div className="space-y-4">
            <RanksTop3Skeleton />
            <div className="rounded-3xl border border-border-subtle bg-background-elevated/45 p-3">
              <RanksListSkeleton rows={10} />
            </div>
          </div>
        )}

        {state === "error" && (
          <RanksError dir={dir} onRetry={() => load()} onReset={onReset} />
        )}

        {state === "empty" && <RanksEmpty dir={dir} onReset={onReset} />}

        {state === "ready" && (
          <div className="space-y-5">
            <RanksPodium
              dir={dir}
              sort={sort}
              items={items}
              metricFormat={metricFormat}
            />

            <section className="rounded-3xl border border-border-subtle bg-background-elevated/45 p-3">
              <div
                className={cn(
                  "mb-3 flex items-center justify-between gap-2",
                  dir === "rtl" ? "flex-row-reverse" : "flex-row",
                )}
              >
                <div className="text-xs font-black text-foreground-strong">
                  <span className="inline-flex items-center rounded-full border border-border-subtle bg-surface-soft px-3 py-1">
                    {dir === "rtl" ? "القائمة" : "List"}
                  </span>
                </div>

                <div className="text-[11px] font-semibold text-foreground-muted">
                  {dir === "rtl"
                    ? `المعروض: ${visibleItems.length} / ${items.length}`
                    : `Showing: ${visibleItems.length} / ${items.length}`}
                </div>
              </div>

              <ul className="flex flex-col gap-2">
                {visibleItems.map((it) => (
                  <RankRowCard
                    key={it.id}
                    dir={dir}
                    item={it}
                    metricFormat={metricFormat}
                  />
                ))}
              </ul>

              <div ref={sentinelRef} className="h-6" />

              {canLoadMore ? (
                <div className="mt-4 flex justify-center">
                  <DeButton
                    variant="soft"
                    tone="neutral"
                    onClick={() =>
                      setVisibleCount((c) => Math.min(items.length, c + 18))
                    }
                    leftIcon={<IoTrendingUp className="text-[16px]" />}
                  >
                    {dir === "rtl" ? "عرض المزيد" : "Load more"}
                  </DeButton>
                </div>
              ) : (
                <div className="mt-4 text-center text-[11px] font-semibold text-foreground-muted">
                  {dir === "rtl" ? "وصلت للنهاية ✨" : "That’s all ✨"}
                </div>
              )}
            </section>

            {!reduceMotion && (
              <div className="text-center text-[10px] font-semibold text-foreground-muted">
                {dir === "rtl"
                  ? "ملاحظة: هذه بيانات Mock فقط لاختبار الواجهة — بدون أي API."
                  : "Note: Mock data only for UI testing — no API used."}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
