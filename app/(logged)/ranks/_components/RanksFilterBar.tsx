"use client";

import { Button as DeButton } from "@/design/DeButton";
import { SmartSelect } from "@/design/DeSelect";
import { IoRefreshOutline } from "react-icons/io5";

import type {
  Dir,
  FilterValue,
  MetricId,
  SortId,
  TabConfig,
  TimeRangeId,
} from "../_utils/ranks.types";
import { SORTS, TIME_RANGES } from "../_utils/ranks.config";
import { cn } from "../_utils/ranks.utils";

function labelByDir(dir: Dir, v: { ar: string; en: string }) {
  return dir === "rtl" ? v.ar : v.en;
}

export default function RanksFilterBar({
  dir,
  tab,
  timeRange,
  setTimeRange,
  sort,
  setSort,
  metric,
  setMetric,
  filters,
  setFilter,
  onReset,
}: {
  dir: Dir;
  tab: TabConfig;

  timeRange: TimeRangeId;
  setTimeRange: (v: TimeRangeId) => void;

  sort: SortId;
  setSort: (v: SortId) => void;

  metric: MetricId;
  setMetric: (v: MetricId) => void;

  filters: Record<string, FilterValue>;
  setFilter: (id: string, v: FilterValue) => void;

  onReset: () => void;
}) {
  const timeOptions = TIME_RANGES.map((t) => ({
    value: t.id,
    label: labelByDir(dir, t.label),
  }));

  const sortOptions = SORTS.map((s) => ({
    value: s.id,
    label: labelByDir(dir, s.label),
  }));

  const metricOptions = tab.metrics.map((m) => ({
    value: m.id,
    label: labelByDir(dir, m.label),
    icon: <m.icon />,
  }));

  return (
    <section className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
      <div className="rounded-3xl border border-border-subtle bg-background-elevated/60 p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <SmartSelect
            label={dir === "rtl" ? "الوقت" : "Time"}
            value={timeRange}
            onChange={(v) => setTimeRange(String(v) as TimeRangeId)}
            options={timeOptions}
            searchable={false}
            variant="solid"
            size="md"
            className="max-w-none"
          />

          <SmartSelect
            label={dir === "rtl" ? "الترتيب" : "Sort"}
            value={sort}
            onChange={(v) => setSort(String(v) as SortId)}
            options={sortOptions}
            searchable={false}
            variant="solid"
            size="md"
            className="max-w-none"
          />

          <SmartSelect
            label={dir === "rtl" ? "المعيار" : "Metric"}
            value={metric}
            onChange={(v) => setMetric(String(v) as MetricId)}
            options={metricOptions}
            searchable={false}
            variant="solid"
            size="md"
            className="max-w-none"
          />

          {tab.filters.map((f) => {
            const options = f.options.map((o) => ({
              value: o.id,
              label: labelByDir(dir, o.label),
            }));

            return (
              <SmartSelect
                key={f.id}
                label={labelByDir(dir, f.label)}
                value={filters[f.id] ?? f.defaultValue}
                onChange={(v) => setFilter(f.id, String(v) as FilterValue)}
                options={options}
                searchable={false}
                variant="solid"
                size="md"
                className="max-w-none"
              />
            );
          })}
        </div>

        <div
          className={cn(
            "mt-4 flex items-center justify-between gap-2",
            dir === "rtl" ? "flex-row-reverse" : "flex-row",
          )}
        >
          <DeButton
            variant="soft"
            tone="neutral"
            size="sm"
            leftIcon={<IoRefreshOutline className="text-[16px]" />}
            onClick={onReset}
          >
            {dir === "rtl" ? "إعادة ضبط المحددات" : "Reset filters"}
          </DeButton>

          <div className="text-[11px] font-semibold text-foreground-muted">
            {dir === "rtl"
              ? "البحث هنا = اختيار محددات (بدون إدخال نص)"
              : "Search here = selecting filters (no text input)"}
          </div>
        </div>
      </div>
    </section>
  );
}
