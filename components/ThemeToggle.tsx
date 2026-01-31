"use client";

import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef, useState } from "react";

type ThemeId = "light" | "dark" | "onepiece";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => setMounted(true), []);

  // close on outside click / escape
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) setOpen(false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    window.addEventListener("pointerdown", onPointerDown, { capture: true });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("pointerdown", onPointerDown, {
        capture: true,
      });
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const current: ThemeId = useMemo(() => {
    // If theme provider ever returns "system", fallback to resolvedTheme
    const t = (theme === "system" ? resolvedTheme : theme) ?? "light";
    if (t === "dark" || t === "onepiece") return t;
    return "light";
  }, [theme, resolvedTheme]);

  const options: Array<{
    id: ThemeId;
    label: string;
    icon: string;
    iconClass: string;
    activeClass: string;
  }> = [
    {
      id: "light",
      label: "Light",
      icon: "☀️",
      iconClass: "text-warning-400",
      activeClass: "bg-warning-soft border-warning-soft-border",
    },
    {
      id: "dark",
      label: "Dark",
      icon: "🌙",
      iconClass: "text-info-400",
      activeClass: "bg-info-soft border-info-soft-border",
    },
    {
      id: "onepiece",
      label: "One Piece",
      icon: "👒",
      iconClass: "text-op-straw",
      activeClass: "bg-op-parchment/60 border-border-subtle",
    },
  ];

  const currentOption = options.find((o) => o.id === current) ?? options[0];

  if (!mounted) return null;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Change theme"
        aria-haspopup="menu"
        aria-expanded={open}
        className="
          group relative flex h-8 w-8 items-center justify-center
          rounded-full border border-border-subtle
          bg-surface/90 text-base
          shadow-[var(--shadow-md)]
          overflow-hidden cursor-pointer
          transition
          hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow-brand)]
          active:translate-y-0 active:scale-[0.94] active:shadow-none
          focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-accent-ring focus-visible:ring-offset-2
          focus-visible:ring-offset-background
        "
      >
        {/* subtle sheen */}
        <span
          aria-hidden="true"
          className="
            pointer-events-none absolute inset-0
            bg-[radial-gradient(circle_at_30%_0,var(--brand-soft-bg),transparent_55%)]
            opacity-0 transition-opacity duration-300
            group-hover:opacity-100
          "
        />

        <span className={`relative z-10 ${currentOption.iconClass}`}>
          {currentOption.icon}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="
            absolute right-0 mt-2 w-44
            rounded-xl border border-border-subtle
            bg-card shadow-[var(--shadow-lg)]
            p-1
          "
        >
          {options.map((opt) => {
            const active = opt.id === current;
            return (
              <button
                key={opt.id}
                role="menuitem"
                type="button"
                onClick={() => {
                  setTheme(opt.id);
                  setOpen(false);
                }}
                className={[
                  "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm transition",
                  "hover:bg-surface-soft",
                  active
                    ? `border ${opt.activeClass} text-foreground-strong`
                    : "border border-transparent text-foreground",
                ].join(" ")}
              >
                <span className={opt.iconClass}>{opt.icon}</span>
                <span className="font-medium">{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
