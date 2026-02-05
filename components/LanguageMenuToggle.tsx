// components\LanguageMenuToggle.tsx
"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { AppLocale } from "@/i18n/config";
import { useSupportedLocales } from "@/hooks/use-supported-locales";
import { useLocaleSwitcher } from "@/hooks/use-locale-switcher";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function LanguageMenuToggle() {
  const prefersReducedMotion = useReducedMotion();

  const { locales, activeLocale } = useSupportedLocales();
  const { currentLocale, isSwitching, switchLocale } = useLocaleSwitcher();

  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const listboxId = useId();

  const isRTL = activeLocale.dir === "rtl";

  const activeIndex = useMemo(() => {
    const idx = locales.findIndex((l) => l.code === currentLocale);
    return idx >= 0 ? idx : 0;
  }, [locales, currentLocale]);

  const closeMenu = () => setIsOpen(false);

  const openMenu = () => {
    if (isSwitching) return;
    setIsOpen(true);
  };

  const toggleMenu = () => {
    if (isSwitching) return;
    setIsOpen((v) => !v);
  };

  const focusTrigger = () => triggerRef.current?.focus();

  const focusOption = (index: number) => {
    optionRefs.current[index]?.focus();
  };

  const handleLocaleSelect = (next: AppLocale) => {
    if (isSwitching) return;

    // Same locale => just close
    if (next === currentLocale) {
      closeMenu();
      focusTrigger();
      return;
    }

    switchLocale(next);
    closeMenu();
    focusTrigger();
  };

  // Close on outside click + ESC
  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!containerRef.current?.contains(target)) {
        closeMenu();
        focusTrigger();
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMenu();
        focusTrigger();
      }
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  // Focus active option on open
  useEffect(() => {
    if (!isOpen) return;
    requestAnimationFrame(() => focusOption(activeIndex));
  }, [isOpen, activeIndex]);

  const menuMotion = prefersReducedMotion
    ? {
        initial: { opacity: 1, scale: 1, y: 0 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 1, scale: 1, y: 0 },
        transition: { duration: 0 },
      }
    : {
        initial: { opacity: 0, scale: 0.985, y: -6 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.985, y: -6 },
        transition: { duration: 0.14, ease: "easeOut" as const },
      };

  const menuStyle: React.CSSProperties = {
    insetInlineEnd: 0, // ✅ RTL/LTR-safe alignment
    transformOrigin: isRTL ? "top left" : "top right",
  };

  const onMenuKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    const count = locales.length;
    if (count === 0) return;

    const currentEl = document.activeElement;
    const currentIdx = optionRefs.current.findIndex((x) => x === currentEl);

    const go = (idx: number) => {
      const next = ((idx % count) + count) % count;
      focusOption(next);
    };

    if (e.key === "ArrowDown") {
      e.preventDefault();
      go((currentIdx >= 0 ? currentIdx : activeIndex) + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      go((currentIdx >= 0 ? currentIdx : activeIndex) - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      go(0);
    } else if (e.key === "End") {
      e.preventDefault();
      go(count - 1);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative inline-flex"
      dir={activeLocale.dir}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-label="Change language"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        disabled={isSwitching}
        onClick={toggleMenu}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            isOpen ? closeMenu() : openMenu();
          }
          if (e.key === "ArrowDown" && !isOpen) {
            e.preventDefault();
            openMenu();
          }
        }}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold",
          "border-border-subtle bg-surface/90 shadow-soft backdrop-blur-md",
          "transition will-change-transform",
          "hover:-translate-y-0.5 hover:shadow-[var(--lang-toggle-shadow-hover)]",
          "active:translate-y-0 active:scale-[0.97] active:shadow-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lang-ring focus-visible:ring-offset-2 focus-visible:ring-offset-lang-ring-offset",
          isSwitching && "cursor-wait opacity-70",
          isRTL && "flex-row-reverse",
        )}
      >
        <span className="text-base leading-none" aria-hidden>
          {activeLocale.flag}
        </span>

        <span className="tracking-wide">
          {isSwitching ? "…" : activeLocale.shortLabel}
        </span>

        <motion.span
          aria-hidden
          className="text-[10px]"
          animate={
            prefersReducedMotion ? undefined : { rotate: isOpen ? 180 : 0 }
          }
          transition={{ duration: 0.15 }}
        >
          ▾
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="listbox"
            id={listboxId}
            aria-label="Select language"
            style={menuStyle}
            className={cn(
              "absolute z-50 mt-2 w-44 overflow-hidden rounded-2xl border py-1 text-xs",
              "border-border-subtle/70 bg-surface/95 shadow-[var(--lang-menu-shadow)] backdrop-blur-xl",
            )}
            {...menuMotion}
            onKeyDown={onMenuKeyDown}
          >
            {locales.map((loc, idx) => {
              const isActive = loc.code === currentLocale;

              return (
                <button
                  key={loc.code}
                  ref={(el) => {
                    optionRefs.current[idx] = el;
                  }}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  disabled={isSwitching}
                  onClick={() => handleLocaleSelect(loc.code)}
                  className={cn(
                    "group flex w-full items-center justify-between gap-2 px-3 py-2",
                    "transition cursor-pointer",
                    "hover:bg-lang-hover",
                    "focus:bg-lang-hover focus:outline-none",
                    isRTL && "flex-row-reverse text-right",
                    isActive ? "text-lang-active" : "text-muted",
                    isSwitching && "cursor-wait opacity-60",
                  )}
                >
                  <span
                    className={cn(
                      "flex items-center gap-2",
                      isRTL && "flex-row-reverse",
                    )}
                  >
                    <span className="text-base leading-none" aria-hidden>
                      {loc.flag}
                    </span>
                    <span className="font-medium">{loc.label}</span>
                  </span>

                  <span
                    className={cn(
                      "flex items-center gap-2",
                      isRTL && "flex-row-reverse",
                    )}
                  >
                    <span className="rounded-full border border-border-subtle/70 bg-surface/70 px-2 py-0.5 text-[10px] font-semibold">
                      {loc.shortLabel}
                    </span>

                    {isActive && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[11px] text-accent-foreground shadow-soft">
                        ✓
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
