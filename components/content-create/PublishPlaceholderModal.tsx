"use client";

import * as React from "react";
import DeModal from "@/design/DeModal";
import { DEFAULT_ITEMS, TONE_VARS } from "./add-post.constants";
import type { AddPostItemId, Item } from "./add-post.types";
import { useTranslations } from "next-intl";

const ITEM_BY_ID = DEFAULT_ITEMS.reduce(
  (acc, it) => {
    acc[it.id] = it;
    return acc;
  },
  {} as Record<AddPostItemId, Item>,
);

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  id: AddPostItemId;
};

export default function PublishPlaceholderModal({
  open,
  onOpenChange,
  id,
}: Props) {
  const t = useTranslations("publish");
  const item = ITEM_BY_ID[id];

  return (
    <DeModal
      open={open}
      onOpenChange={onOpenChange}
      mode={{ mobile: "sheet", desktop: "center" }}
      title={t(item.title)}
      subtitle={t(item.sub)}
      overlay="blur"
    >
      <div className="p-4">
        <div
          style={TONE_VARS[item.tone]}
          className="
            rounded-2xl border border-border-subtle
            bg-surface-soft/60
            p-4
          "
        >
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="
                grid size-12 place-items-center rounded-2xl
                bg-[color:var(--item-solid)]
                text-[color:var(--item-on)]
                shadow-[var(--item-glow)]
                border border-border-strong/15
              "
            >
              <item.Icon className="size-6" />
            </span>

            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground-strong">
                {t(item.title)}
              </div>
              <div className="text-xs text-foreground-muted">{t(item.sub)}</div>
            </div>
          </div>
        </div>

        {/* ✅ Placeholder UI فقط (بدون أي اتصال سيرفر حالياً) */}
        <div className="mt-4 grid gap-3">
          <div className="h-10 rounded-xl border border-border-subtle bg-background-elevated/80" />
          <div className="h-28 rounded-xl border border-border-subtle bg-background-elevated/80" />
        </div>
      </div>
    </DeModal>
  );
}
