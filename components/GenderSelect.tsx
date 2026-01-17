"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/utils";

export type Gender = "male" | "female" | "na";

type Option = {
  value: Gender;
  emoji: string;
  label: string;
  desc: string;
};

export default function GenderSelectGrid({
  value,
  onChange,
}: {
  value: Gender | null | undefined;
  onChange?: (value: Gender) => void;
}) {
  const t = useTranslations("signup_steps_02.gender");

  const OPTIONS = React.useMemo<readonly Option[]>(
    () => [
      { value: "male", emoji: "♂️", label: t("male.label"), desc: t("male.desc") },
      { value: "female", emoji: "♀️", label: t("female.label"), desc: t("female.desc") },
      { value: "na", emoji: "🤐", label: t("na.label"), desc: t("na.desc") },
    ],
    [t]
  );

  return (
    <section className="w-full">
      <div
        role="radiogroup"
        aria-label={t("aria")}
        className={cn(
          // 👇 ALWAYS 3 columns, even on tiny screens
          "grid grid-cols-3 gap-1",
          // 👇 helps prevent overflow issues in grid children
          "min-w-0"
        )}
      >
        {OPTIONS.map((o) => {
          const checked = value === o.value;

          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={checked}
              // 👇 THIS is the missing link
              onClick={() => onChange?.(o.value)}
              // Optional: basic keyboard support
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onChange?.(o.value);
                }
              }}
              className={cn(
                "min-w-0 w-full rounded-lg border text-left transition",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40",
                "active:scale-[0.99]",
                // 👇 slightly tighter so it fits small widths better
                "px-1.5 py-2 sm:px-2.5",
                checked
                  ? "border-zinc-900 bg-zinc-900 text-white shadow-sm"
                  : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50"
              )}
            >
              {/* 👇 stack a bit tighter on small widths */}
              <div className="flex items-start gap-1.5 sm:gap-2 min-w-0">
                <span className="text-base leading-none" aria-hidden="true">
                  {o.emoji}
                </span>

                <div className="min-w-0">
                  <div className="text-[11px] sm:text-[12px] font-semibold leading-4 break-words">
                    {o.label}
                  </div>

                  <div
                    className={cn(
                      "text-[10px] sm:text-[11px] leading-4 break-words",
                      checked ? "text-white/75" : "text-zinc-500"
                    )}
                  >
                    {o.desc}
                  </div>
                </div>
              </div>

              <span
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute -inset-px rounded-lg opacity-0 blur-lg transition-opacity",
                  checked && "opacity-25",
                  "bg-gradient-to-r from-indigo-500/25 via-fuchsia-500/15 to-sky-500/25"
                )}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}
