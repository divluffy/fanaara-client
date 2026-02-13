"use client";

import type { Dir, RankKind, TabConfig } from "../_utils/ranks.types";
import { cn } from "../_utils/ranks.utils";
import { Button as DeButton } from "@/design/DeButton";

export default function RanksTabs({
  dir,
  tabs,
  activeTab,
  onChange,
}: {
  dir: Dir;
  tabs: TabConfig[];
  activeTab: RankKind;
  onChange: (tab: RankKind) => void;
}) {
  return (
    <div className="sticky top-0 z-40 border-b border-border-subtle bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
        <div
          role="tablist"
          aria-label={dir === "rtl" ? "الأقسام" : "Sections"}
          className={cn("flex items-center gap-2 overflow-x-auto no-scrollbar", dir === "rtl" ? "flex-row-reverse" : "flex-row")}
        >
          {tabs.map((t) => {
            const active = t.id === activeTab;
            const Icon = t.icon;

            return (
              <DeButton
                key={t.id}
                role="tab"
                aria-selected={active}
                variant={active ? "solid" : "soft"}
                tone={active ? "brand" : "neutral"}
                size="sm"
                className={cn(
                  "shrink-0",
                  "rounded-full",
                  active ? "shadow-[0_10px_30px_-18px_rgba(124,58,237,0.45)]" : ""
                )}
                onClick={() => onChange(t.id)}
              >
                <span className={cn("inline-flex items-center gap-2", dir === "rtl" ? "flex-row-reverse" : "flex-row")}>
                  <Icon className={cn("text-[16px]", active ? "text-white" : "text-foreground-muted")} />
                  <span className="text-xs font-black">{t.label[dir === "rtl" ? "ar" : "en"]}</span>
                </span>
              </DeButton>
            );
          })}
        </div>
      </div>
    </div>
  );
}
