"use client";

import * as React from "react";
import DeModal from "@/design/DeModal";
import { DEFAULT_ITEMS, TONE_VARS } from "./add-post.constants";
import type { AddPostItemId } from "./add-post.types";
import { useTranslations } from "next-intl";
import { useAppSelector } from "@/store/hooks";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (id: AddPostItemId) => void;
};

export default function PublishTypePickerModal({
  open,
  onOpenChange,
  onSelect,
}: Props) {
  const { isRTL } = useAppSelector((s) => s.state);
  const t = useTranslations("publish");

  // ✅ بدون مفاتيح جديدة للترجمة: نبني العنوان من الموجود
  const title = `${t("title_post")} • ${t("title_swipes")} • ${t("title_story")}`;

  const rowDir = isRTL ? "flex-row-reverse text-right" : "flex-row text-left";

  return (
    <DeModal
      open={open}
      onOpenChange={onOpenChange}
      mode={{ mobile: "sheet", desktop: "center" }}
      overlay="dim"
      contentPadding="none"
      showCloseButton={false} // ✅ إزالة أيقونة الإغلاق
      /**
       * ✅ ارتفاع ثابت مناسب لمحتوى 3 خيارات:
       * - على الهاتف الحقيقي (coarse pointer) سيستخدم DraggableSheetPanel
       * - على بيئة صغيرة لكن pointer غير coarse (مثل devtools) سيستخدم fixed sheet height
       */
      sheetDragMode="binary"
      sheetCollapsedFraction={0.34}
      sheetFullFraction={0.34}
      sheetSnapPoints={[0.34]}
      sheetAutoFit={false}
    >
      <div className="px-3 pb-4 pt-2">
        <div className="flex flex-col gap-2">
          {DEFAULT_ITEMS.map((it) => (
            <button
              key={it.id}
              type="button"
              onClick={() => onSelect(it.id)}
              style={TONE_VARS[it.tone]}
              className="
                group w-full text-start
                rounded-2xl border border-border-subtle
                bg-background-elevated/95
                px-3 py-3
                shadow-[var(--shadow-sm)]
                transition-[transform,box-shadow,border-color,background-color]
                duration-200 ease-out
                active:scale-[0.99]
                hover:border-[color:var(--item-border)]
                hover:shadow-[var(--shadow-md)]
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-[color:var(--item-ring)]
                focus-visible:ring-offset-2 focus-visible:ring-offset-background
              "
            >
              <div className={`flex items-center gap-3 ${rowDir}`}>
                <span
                  aria-hidden
                  className="
                    grid size-11 place-items-center rounded-2xl
                    bg-[color:var(--item-solid)]
                    text-[color:var(--item-on)]
                    shadow-[var(--item-glow)]
                    border border-border-strong/15
                    transition-transform duration-200
                    group-active:scale-[0.98]
                  "
                >
                  <it.Icon className="size-6" />
                </span>

                <div className="min-w-0">
                  <div className="text-sm font-semibold text-foreground-strong">
                    {t(it.title)}
                  </div>
                  <div className="text-xs text-foreground-muted">
                    {t(it.sub)}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </DeModal>
  );
}
