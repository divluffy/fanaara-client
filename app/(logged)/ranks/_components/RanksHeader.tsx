"use client";

import { IoInformationCircleOutline } from "react-icons/io5";
import type { Dir } from "../_utils/ranks.types";
import { cn } from "../_utils/ranks.utils";

export default function RanksHeader({
  dir,
  timeLabel,
}: {
  dir: Dir;
  timeLabel: string;
}) {
  return (
    <header className="border-b border-border-subtle bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className={cn("flex items-start justify-between gap-4", dir === "rtl" ? "flex-row-reverse" : "flex-row")}>
          <div className="min-w-0">
            <h1 className="text-2xl font-black text-foreground-strong sm:text-3xl">
              {dir === "rtl" ? "Ranks" : "Ranks"}
              <span className="ms-2 rtl:ms-0 rtl:me-2 inline-flex items-center rounded-xl border border-border-subtle bg-surface-soft px-2 py-1 align-middle text-[11px] font-black text-foreground-muted">
                Top 100
              </span>
            </h1>

            <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-foreground-muted">
              {dir === "rtl"
                ? "التصنيفات تعتمد فقط على تقييمات وتفاعلات المستخدمين (Rating / Reactions) ضمن الفترة المحددة."
                : "Ranks are based only on user ratings & reactions within the selected time range."}
            </p>

            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-border-subtle bg-background-elevated/60 px-3 py-1.5 text-[11px] font-bold text-foreground-muted">
              <IoInformationCircleOutline className="text-[14px]" />
              <span>{dir === "rtl" ? "الفترة:" : "Time:"}</span>
              <span className="text-foreground-strong">{timeLabel}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
