"use client";

import React, { memo, useState } from "react";
import Link from "next/link";
import type { WorkEntity } from "../../_types";
import { cn } from "../ui";

type Props = {
  work: WorkEntity;
};

function WorkCardImpl({ work }: Props) {
  const [imgErr, setImgErr] = useState(false);

  const href = work.workType === "anime" ? `/anime/${encodeURIComponent(work.id)}` : `/manga/${encodeURIComponent(work.id)}`;

  return (
    <Link
      href={href}
      className={cn(
        "block overflow-hidden rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm transition",
        "hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 dark:focus-visible:ring-zinc-700",
      )}
    >
      <div className="flex items-center gap-3">
        <div className="h-20 w-14 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
          {!imgErr ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={work.coverUrl}
              alt={work.title}
              loading="lazy"
              width={56}
              height={80}
              className="h-full w-full object-cover"
              onError={() => setImgErr(true)}
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-[10px] font-bold text-zinc-500">
              {work.workType.toUpperCase()}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-extrabold">{work.title}</div>
          <div className="mt-0.5 text-xs text-zinc-500">
            {work.year} • {work.workType.toUpperCase()} • Score {work.score.toFixed(1)}
          </div>

          <div className="mt-2">
            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
              View details
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

const WorkCard = memo(WorkCardImpl);
export default WorkCard;
