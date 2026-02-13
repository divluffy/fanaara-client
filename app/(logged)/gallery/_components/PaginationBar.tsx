// app\(logged)\gallery\_components\PaginationBar.tsx
"use client";

import React, { useMemo } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { cn } from "./_data/galleryUtils";

type Props = {
  page: number;
  totalPages: number;
  dir: "rtl" | "ltr";
  onPageChange: (next: number) => void;
  className?: string;
};

type PageToken = number | "…";

function buildPages(current: number, total: number): PageToken[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const tokens: PageToken[] = [];
  const push = (v: PageToken) => tokens.push(v);

  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);

  push(1);

  if (left > 2) push("…");
  for (let p = left; p <= right; p++) push(p);
  if (right < total - 1) push("…");

  push(total);

  return tokens;
}

export default function PaginationBar({
  page,
  totalPages,
  dir,
  onPageChange,
  className,
}: Props) {
  const tokens = useMemo(
    () => buildPages(page, totalPages),
    [page, totalPages],
  );

  const prevIcon = dir === "rtl" ? <IoChevronForward /> : <IoChevronBack />;
  const nextIcon = dir === "rtl" ? <IoChevronBack /> : <IoChevronForward />;

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className={cn(
            "grid h-10 w-10 place-items-center rounded-2xl border border-border-subtle bg-surface-soft",
            "hover:bg-surface disabled:opacity-50 disabled:hover:bg-surface-soft",
          )}
          aria-label="Previous page"
        >
          {prevIcon}
        </button>

        <div className="flex items-center gap-1.5 rounded-2xl border border-border-subtle bg-background-elevated p-1.5 shadow-[var(--shadow-xs)]">
          {tokens.map((t, idx) =>
            t === "…" ? (
              <span
                key={`dots-${idx}`}
                className="px-2 text-[12px] font-black text-foreground-muted"
              >
                …
              </span>
            ) : (
              <button
                key={t}
                type="button"
                onClick={() => onPageChange(t)}
                className={cn(
                  "min-w-10 rounded-xl px-3 py-2 text-[12px] font-black transition",
                  t === page
                    ? "bg-foreground-strong text-background shadow-[var(--shadow-sm)]"
                    : "text-foreground-strong hover:bg-surface-soft",
                )}
                aria-label={`Page ${t}`}
              >
                <span dir="ltr">{t}</span>
              </button>
            ),
          )}
        </div>

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className={cn(
            "grid h-10 w-10 place-items-center rounded-2xl border border-border-subtle bg-surface-soft",
            "hover:bg-surface disabled:opacity-50 disabled:hover:bg-surface-soft",
          )}
          aria-label="Next page"
        >
          {nextIcon}
        </button>
      </div>

      <div className="text-[11px] text-foreground-muted">
        Page{" "}
        <span dir="ltr" className="font-mono tabular-nums">
          {page}
        </span>{" "}
        /{" "}
        <span dir="ltr" className="font-mono tabular-nums">
          {totalPages}
        </span>
      </div>
    </div>
  );
}
