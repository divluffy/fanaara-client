// components/language-menu-toggle.tsx
"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import type { AppLocale } from "@/i18n/config";

const LOCALES: { code: AppLocale; label: string }[] = [
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
  { code: "tr", label: "Türkçe" },
];

async function setLocaleOnServer(locale: AppLocale) {
  await fetch("/api/locale", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ locale }),
  });
}

export default function LanguageMenuToggle() {
  const locale = useLocale() as AppLocale;
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const containerRef = useRef<HTMLDivElement | null>(null);

  const active = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  const handleSelect = (nextLocale: AppLocale) => {
    if (isPending) return;
    if (nextLocale === locale) {
      setOpen(false);
      return;
    }

    startTransition(async () => {
      await setLocaleOnServer(nextLocale);
      setOpen(false);
      router.refresh();
    });
  };

  // إغلاق القائمة عند الضغط خارجها أو الضغط على Esc
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        aria-label="change language"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => !isPending && setOpen((v) => !v)}
        disabled={isPending}
        className={`
          inline-flex max-w-[8rem] items-center gap-1
          rounded-full border border-border-subtle
          bg-surface/90 px-3 py-1.5 text-xs font-semibold
          shadow-soft backdrop-blur-md
          cursor-pointer
          transition
          hover:-translate-y-0.5 hover:shadow-[var(--lang-toggle-shadow-hover)]
          active:translate-y-0 active:scale-[0.96] active:shadow-none
          focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-lang-ring focus-visible:ring-offset-2
          focus-visible:ring-offset-lang-ring-offset
          ${isPending ? "opacity-70 cursor-wait" : ""}
        `}
      >
        <span className="truncate">{isPending ? "…" : active.label}</span>
        <span
          className={`
            text-[10px] transition-transform
            ${open ? "rotate-180" : ""}
          `}
        >
          ▾
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Select language"
          className="
            absolute right-0 z-50 mt-2 min-w-[8rem]
            overflow-hidden rounded-xl
            border border-border-subtle/70
            bg-surface/95 py-1 text-xs
            shadow-[var(--lang-menu-shadow)]
            backdrop-blur-xl
          "
        >
          {LOCALES.map((loc) => {
            const isActive = loc.code === locale;
            return (
              <button
                key={loc.code}
                type="button"
                role="option"
                aria-selected={isActive}
                disabled={isPending}
                onClick={() => handleSelect(loc.code)}
                className={`
                  group flex w-full items-center justify-between
                  px-3 py-1.5 text-left
                  cursor-pointer
                  transition
                  hover:bg-lang-hover hover:pl-3.5
                  active:scale-[0.99]
                  ${isActive ? "font-semibold text-lang-active" : "text-muted"}
                  ${isPending ? "opacity-60 cursor-wait" : ""}
                `}
              >
                <span className="group-hover:tracking-wide">{loc.label}</span>
                {isActive && <span className="text-[9px] opacity-80">●</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
