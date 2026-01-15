"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

type Gender = "male" | "female" | "na";

type Option = {
  value: Gender;
  emoji: string;
  label: string;
  desc: string;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function GenderSelectGrid({
  value,
  onChange,
}: {
  value: Gender | null;
  onChange?: (value: Gender) => void;
}) {
  const t = useTranslations("signup_steps_02.gender");

  const OPTIONS = React.useMemo<readonly Option[]>(
    () => [
      {
        value: "male",
        emoji: "♂️",
        label: t("male.label"),
        desc: t("male.desc"),
      },
      {
        value: "female",
        emoji: "♀️",
        label: t("female.label"),
        desc: t("female.desc"),
      },
      {
        value: "na",
        emoji: "🤐",
        label: t("na.label"),
        desc: t("na.desc"),
      },
    ],
    [t]
  );

  const values = React.useMemo(() => OPTIONS.map((o) => o.value), [OPTIONS]);

  const clampIndex = React.useCallback(
    (i: number) => (i < 0 ? values.length - 1 : i >= values.length ? 0 : i),
    [values.length]
  );

  const initialIndex = React.useMemo(() => {
    const idx = OPTIONS.findIndex((o) => o.value === value);
    return idx >= 0 ? idx : 0;
  }, [OPTIONS, value]);

  const [activeIndex, setActiveIndex] = React.useState<number>(initialIndex);

  React.useEffect(() => {
    const idx = OPTIONS.findIndex((o) => o.value === value);
    setActiveIndex(idx >= 0 ? idx : 0);
  }, [OPTIONS, value]);

  const select = React.useCallback(
    (v: Gender) => {
      onChange?.(v);
      const idx = OPTIONS.findIndex((o) => o.value === v);
      if (idx >= 0) setActiveIndex(idx);
    },
    [onChange, OPTIONS]
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (
      e.key !== "ArrowRight" &&
      e.key !== "ArrowLeft" &&
      e.key !== "ArrowUp" &&
      e.key !== "ArrowDown" &&
      e.key !== "Enter" &&
      e.key !== " "
    ) {
      return;
    }

    e.preventDefault();

    if (e.key === "Enter" || e.key === " ") {
      select(OPTIONS[activeIndex].value);
      return;
    }

    const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
    const next = clampIndex(activeIndex + dir);
    setActiveIndex(next);

    const el = document.querySelector<HTMLButtonElement>(
      `[data-gender-pill="${next}"]`
    );
    el?.focus();
  };

  return (
    <section className="w-auto max-w-none">
      <div
        role="radiogroup"
        aria-label={t("aria")}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        className="relative grid grid-cols-2 gap-1.5 sm:grid-cols-3"
      >
        {OPTIONS.map((o, idx) => {
          const checked = value === o.value;

          return (
            <button
              key={o.value}
              data-gender-pill={idx}
              type="button"
              role="radio"
              aria-checked={checked}
              onMouseEnter={() => setActiveIndex(idx)}
              onFocus={() => setActiveIndex(idx)}
              onClick={() => select(o.value)}
              className={cx(
                "group relative w-full rounded-lg border px-2.5 py-2 text-left transition",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40",
                "active:scale-[0.99]",
                checked
                  ? "border-zinc-900 bg-zinc-900 text-white shadow-sm"
                  : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50"
              )}
            >
              <div className="flex items-start gap-2">
                <span className="text-base leading-none" aria-hidden="true">
                  {o.emoji}
                </span>

                <div className="min-w-0">
                  <div className="text-[12px] font-semibold leading-4 whitespace-normal break-words">
                    {o.label}
                  </div>

                  <div
                    className={cx(
                      "text-[11px] leading-4 whitespace-normal break-words",
                      checked ? "text-white/75" : "text-zinc-500"
                    )}
                  >
                    {o.desc}
                  </div>
                </div>
              </div>

              <span
                aria-hidden="true"
                className={cx(
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
