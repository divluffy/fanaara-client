"use client";

import Link from "next/link";
import Image from "next/image";
import { Button as DeButton } from "@/design/DeButton";

import type { Dir, MetricFormat, RankItem, SortId } from "../_utils/ranks.types";
import { cn, formatMetricValue } from "../_utils/ranks.utils";
import { IoTrendingDown, IoTrendingUp } from "react-icons/io5";

function podiumTitle(dir: Dir, sort: SortId) {
  if (sort === "top") return dir === "rtl" ? "أفضل 3" : "Top 3";
  if (sort === "worst") return dir === "rtl" ? "أسوأ 3" : "Worst 3";
  if (sort === "rising") return dir === "rtl" ? "الأكثر صعودًا" : "Most Rising";
  return dir === "rtl" ? "الأكثر هبوطًا" : "Most Falling";
}

function podiumAccent(sort: SortId) {
  if (sort === "worst") return "from-rose-500/25 via-orange-400/10 to-transparent";
  if (sort === "rising") return "from-emerald-500/20 via-cyan-400/10 to-transparent";
  if (sort === "falling") return "from-amber-400/20 via-rose-400/10 to-transparent";
  return "from-amber-400/20 via-brand-500/10 to-transparent";
}

export default function RanksPodium({
  dir,
  sort,
  items,
  metricFormat,
}: {
  dir: Dir;
  sort: SortId;
  items: RankItem[];
  metricFormat: MetricFormat;
}) {
  const top3 = items.slice(0, 3);
  if (top3.length < 3) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 pb-3 sm:px-6">
      <div className={cn("mb-3 flex items-center justify-between gap-2", dir === "rtl" ? "flex-row-reverse" : "flex-row")}>
        <div className="text-xs font-black text-foreground-strong">
          <span className={cn("inline-flex items-center rounded-full border border-border-subtle bg-surface-soft px-3 py-1", "shadow-[var(--shadow-xs)]")}>
            {podiumTitle(dir, sort)}
          </span>
        </div>

        <div className="text-[11px] font-semibold text-foreground-muted">
          {dir === "rtl" ? "تمييز بصري لأهم 3 عناصر" : "Visual highlight for top 3"}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {top3.map((it) => {
          const metricText = formatMetricValue(it.metricValue, metricFormat, dir);
          const isWorst = sort === "worst";
          const isRising = sort === "rising";
          const isFalling = sort === "falling";

          return (
            <div key={it.id} className={cn("rounded-3xl p-[1px]", "bg-gradient-to-br", podiumAccent(sort))}>
              <div className="rounded-3xl border border-border-subtle bg-background-elevated/80 p-4">
                <div className={cn("flex items-start gap-3", dir === "rtl" ? "flex-row-reverse" : "flex-row")}>
                  <div className="shrink-0 overflow-hidden rounded-2xl border border-border-subtle bg-surface-soft">
                    <Image
                      src={it.image}
                      alt={it.title}
                      width={72}
                      height={100}
                      className="h-[100px] w-[72px] object-cover"
                      priority={it.rank === 1}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className={cn("flex items-center justify-between gap-2", dir === "rtl" ? "flex-row-reverse" : "flex-row")}>
                      <div className="inline-flex items-center gap-2">
                        <span className="grid size-9 place-items-center rounded-2xl border border-border-subtle bg-surface-soft text-sm font-black tabular-nums">
                          {it.rank}
                        </span>
                        <span className="text-base" aria-hidden>
                          {it.rank === 1 ? "👑" : it.rank === 2 ? "🥈" : "🥉"}
                        </span>

                        {(isRising || isFalling) && (
                          <span className={cn(
                            "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-bold tabular-nums",
                            isRising ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-600" : "border-rose-500/25 bg-rose-500/10 text-rose-600"
                          )}>
                            {isRising ? <IoTrendingUp /> : <IoTrendingDown />}
                            {Math.abs((it.prevRank ?? it.rank) - it.rank)}
                          </span>
                        )}

                        {isWorst && (
                          <span className="inline-flex items-center rounded-full border border-rose-500/20 bg-rose-500/10 px-2 py-1 text-[11px] font-bold text-rose-600">
                            {dir === "rtl" ? "أسوأ" : "Worst"}
                          </span>
                        )}
                      </div>

                      <div className="text-right ltr:text-left">
                        <div className="text-[10px] font-semibold text-foreground-muted">
                          {dir === "rtl" ? it.metricLabel.ar : it.metricLabel.en}
                        </div>
                        <div className="mt-0.5 text-lg font-black tabular-nums text-foreground-strong">{metricText}</div>
                      </div>
                    </div>

                    <h3 className={cn("mt-2 truncate text-sm font-extrabold text-foreground-strong", dir === "rtl" ? "text-right" : "text-left")}>
                      <bdi>{it.title}</bdi>
                    </h3>
                    <p className={cn("mt-0.5 truncate text-[11px] font-medium text-foreground-muted", dir === "rtl" ? "text-right" : "text-left")}>
                      <bdi>{it.titleEn}</bdi>
                    </p>

                    <div className={cn("mt-3 flex items-center justify-between gap-2", dir === "rtl" ? "flex-row-reverse" : "flex-row")}>
                      <div className="flex flex-wrap gap-1.5">
                        {it.tags.slice(0, 2).map((t) => (
                          <span key={t} className="rounded-full border border-border-subtle bg-surface-soft px-2 py-1 text-[10px] font-semibold text-foreground-muted">
                            <bdi>{t}</bdi>
                          </span>
                        ))}
                      </div>

                      <Link href={it.href} className="shrink-0">
                        <DeButton variant="soft" tone="brand" size="sm">
                          {dir === "rtl" ? "فتح" : "Open"}
                        </DeButton>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
