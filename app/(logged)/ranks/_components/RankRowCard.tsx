"use client";

import Image from "next/image";
import Link from "next/link";
import { Button as DeButton } from "@/design/DeButton";
import {
  IoBookmarkOutline,
  IoEllipsisHorizontal,
  IoHeartOutline,
  IoRemove,
  IoTrendingDown,
  IoTrendingUp,
} from "react-icons/io5";

import type { Dir, MetricFormat, RankItem } from "../_utils/ranks.types";
import { cn, formatMetricValue } from "../_utils/ranks.utils";

function RankDelta({ dir, rank, prevRank }: { dir: Dir; rank: number; prevRank: number }) {
  const delta = prevRank - rank;

  if (delta === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-border-subtle bg-surface-soft px-2 py-1 text-[11px] font-bold text-foreground-muted">
        <IoRemove className="text-[14px]" />
        <span className="tabular-nums">0</span>
      </span>
    );
  }

  const up = delta > 0;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-bold tabular-nums",
        up ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600" : "border-rose-500/20 bg-rose-500/10 text-rose-600"
      )}
      aria-label={
        dir === "rtl"
          ? up ? `صعود ${delta}` : `هبوط ${Math.abs(delta)}`
          : up ? `Up ${delta}` : `Down ${Math.abs(delta)}`
      }
    >
      {up ? <IoTrendingUp className="text-[14px]" /> : <IoTrendingDown className="text-[14px]" />}
      <span>{Math.abs(delta)}</span>
    </span>
  );
}

export default function RankRowCard({
  dir,
  item,
  metricFormat,
}: {
  dir: Dir;
  item: RankItem;
  metricFormat: MetricFormat;
}) {
  const isTop3 = item.rank <= 3;
  const isTop10 = item.rank <= 10;

  const wrap =
    isTop3
      ? "bg-gradient-to-br from-amber-400/35 via-brand-500/20 to-cyan-400/20"
      : isTop10
        ? "bg-gradient-to-br from-brand-500/20 via-transparent to-cyan-400/15"
        : "bg-gradient-to-br from-black/10 via-black/5 to-black/10 dark:from-white/10 dark:via-white/5 dark:to-white/10";

  const metricText = formatMetricValue(item.metricValue, metricFormat, dir);

  return (
    <li className="list-none">
      <div className={cn("rounded-2xl p-[1px]", wrap)}>
        <div className="rounded-2xl border border-border-subtle bg-background-elevated/75 px-3 py-3 sm:px-4">
          <div className={cn("flex items-center gap-3", dir === "rtl" ? "flex-row-reverse" : "flex-row")}>
            <div className="shrink-0 flex flex-col items-center gap-2">
              <div className={cn(
                "grid place-items-center rounded-2xl px-3 py-2 text-sm font-black tabular-nums",
                isTop3 ? "bg-amber-400/15 border border-amber-400/20" : "bg-surface-soft border border-border-subtle"
              )}>
                <span className="inline-flex items-center gap-1">
                  <span aria-hidden>{item.rank === 1 ? "👑" : item.rank === 2 ? "🥈" : item.rank === 3 ? "🥉" : ""}</span>
                  {item.rank}
                </span>
              </div>

              <RankDelta dir={dir} rank={item.rank} prevRank={item.prevRank} />
            </div>

            <Link href={item.href} className={cn("flex min-w-0 flex-1 items-center gap-3", dir === "rtl" ? "flex-row-reverse" : "flex-row")}>
              <div className="shrink-0 overflow-hidden rounded-xl border border-border-subtle bg-surface-soft">
                <Image
                  src={item.image}
                  alt={item.title}
                  width={44}
                  height={62}
                  className="h-[62px] w-[44px] object-cover"
                  unoptimized
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-[13px] font-extrabold text-foreground-strong sm:text-sm">
                      <bdi>{item.title}</bdi>
                    </h3>
                    <p className="mt-0.5 truncate text-[11px] font-medium text-foreground-muted">
                      <bdi>{item.titleEn}</bdi>
                    </p>
                  </div>

                  <div className="shrink-0 rounded-2xl border border-border-subtle bg-surface-soft px-3 py-2 text-right ltr:text-left">
                    <div className="text-[10px] font-semibold text-foreground-muted">
                      {dir === "rtl" ? item.metricLabel.ar : item.metricLabel.en}
                    </div>
                    <div className="mt-0.5 text-sm font-black tabular-nums text-foreground-strong">
                      {metricText}
                    </div>
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  {item.tags.slice(0, 3).map((t) => (
                    <span key={t} className="rounded-full border border-border-subtle bg-background-elevated/50 px-2 py-1 text-[10px] font-semibold text-foreground-muted">
                      <bdi>{t}</bdi>
                    </span>
                  ))}
                </div>
              </div>
            </Link>

            <div className="shrink-0 hidden sm:flex items-center gap-1.5">
              <DeButton iconOnly variant="soft" tone="neutral" size="sm" aria-label="Save" tooltip={dir === "rtl" ? "حفظ" : "Save"}>
                <IoBookmarkOutline className="text-[18px]" />
              </DeButton>
              <DeButton iconOnly variant="soft" tone="neutral" size="sm" aria-label="Like" tooltip={dir === "rtl" ? "إعجاب" : "Like"}>
                <IoHeartOutline className="text-[18px]" />
              </DeButton>
              <DeButton iconOnly variant="soft" tone="neutral" size="sm" aria-label="More" tooltip={dir === "rtl" ? "المزيد" : "More"}>
                <IoEllipsisHorizontal className="text-[18px]" />
              </DeButton>
            </div>

            <div className="sm:hidden shrink-0">
              <DeButton iconOnly variant="soft" tone="neutral" size="sm" aria-label="More">
                <IoEllipsisHorizontal className="text-[18px]" />
              </DeButton>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}
