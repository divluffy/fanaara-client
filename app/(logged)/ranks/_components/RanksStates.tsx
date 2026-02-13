"use client";

import { Button as DeButton } from "@/design/DeButton";
import { IoAlertCircleOutline, IoRefreshOutline } from "react-icons/io5";
import type { Dir } from "../_utils/ranks.types";
import { cn } from "../_utils/ranks.utils";

export function RanksError({
  dir,
  onRetry,
  onReset,
}: {
  dir: Dir;
  onRetry: () => void;
  onReset: () => void;
}) {
  return (
    <div className="rounded-3xl border border-border-subtle bg-background-elevated/60 p-6">
      <div className={cn("flex items-start gap-4", dir === "rtl" ? "flex-row-reverse text-right" : "flex-row text-left")}>
        <div className="grid size-12 shrink-0 place-items-center rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-600">
          <IoAlertCircleOutline className="text-[22px]" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-base font-black text-foreground-strong">
            {dir === "rtl" ? "تعذّر تحميل التصنيفات" : "Couldn't load ranks"}
          </div>
          <div className="mt-1 text-sm font-medium text-foreground-muted">
            {dir === "rtl" ? "جرّب إعادة المحاولة أو إعادة ضبط المحددات." : "Try retrying or resetting filters."}
          </div>

          <div className="mt-4 flex gap-2">
            <DeButton variant="solid" tone="brand" leftIcon={<IoRefreshOutline className="text-[16px]" />} onClick={onRetry}>
              {dir === "rtl" ? "إعادة المحاولة" : "Retry"}
            </DeButton>

            <DeButton variant="soft" tone="neutral" onClick={onReset}>
              {dir === "rtl" ? "إعادة ضبط" : "Reset"}
            </DeButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RanksEmpty({ dir, onReset }: { dir: Dir; onReset: () => void }) {
  return (
    <div className="rounded-3xl border border-border-subtle bg-background-elevated/60 p-6">
      <div className={cn("flex items-start gap-4", dir === "rtl" ? "flex-row-reverse text-right" : "flex-row text-left")}>
        <div className="grid size-12 shrink-0 place-items-center rounded-2xl border border-border-subtle bg-surface-soft text-foreground-muted">
          <span className="text-xl" aria-hidden>🧩</span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-base font-black text-foreground-strong">
            {dir === "rtl" ? "لا توجد نتائج بهذه المحددات" : "No results for this filter"}
          </div>
          <div className="mt-1 text-sm font-medium text-foreground-muted">
            {dir === "rtl" ? "جرّب تغيير المعيار أو الفلاتر." : "Try changing metric or filters."}
          </div>

          <div className="mt-4">
            <DeButton variant="solid" tone="brand" leftIcon={<IoRefreshOutline className="text-[16px]" />} onClick={onReset}>
              {dir === "rtl" ? "إعادة ضبط المحددات" : "Reset filters"}
            </DeButton>
          </div>
        </div>
      </div>
    </div>
  );
}
