// components/ThemeToggle.tsx
"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useTheme } from "next-themes";

type ThemeId = "light" | "dark" | "onepiece";
type Placement = "bottom" | "top";

type ThemeOption = {
  id: ThemeId;
  label: string;
  description: string;
  Icon: React.FC<{ className?: string }>;
  iconClass: string;
  activeClass: string; // background/border for selected row
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/**
 * Resolves next-themes `theme` which might be "system" into our ThemeId.
 * If theme is unexpected, fallback to "light".
 */
function resolveThemeId(
  theme?: string | null,
  resolvedTheme?: string | null,
): ThemeId {
  const t = (theme === "system" ? resolvedTheme : theme) ?? "light";
  if (t === "dark" || t === "onepiece") return t;
  return "light";
}

function useIsMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

/* ---------- Icons (inline SVG for best performance) ---------- */

const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      fill="currentColor"
      d="M12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12Zm0-14.5a1 1 0 0 1 1-1h.01a1 1 0 1 1-1.01 1ZM12 22.5a1 1 0 0 1 1-1h.01a1 1 0 1 1-1.01 1ZM4.22 5.64a1 1 0 0 1 1.41 0l.01.01a1 1 0 1 1-1.42 1.41l-.01-.01a1 1 0 0 1 0-1.41Zm14.14 14.14a1 1 0 0 1 1.41 0l.01.01a1 1 0 1 1-1.42 1.41l-.01-.01a1 1 0 0 1 0-1.41ZM1.5 12a1 1 0 0 1 1-1h.01a1 1 0 1 1-1.01 1Zm20 0a1 1 0 0 1 1-1h.01a1 1 0 1 1-1.01 1ZM4.22 18.36a1 1 0 0 1 1.41 1.41l-.01.01a1 1 0 1 1-1.41-1.42l.01-.01Zm14.14-14.14a1 1 0 0 1 1.41 1.41l-.01.01a1 1 0 1 1-1.41-1.42l.01-.01Z"
    />
  </svg>
);

const MoonIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      fill="currentColor"
      d="M20.6 14.9A8.6 8.6 0 0 1 9.1 3.4a.9.9 0 0 0-1.1 1.1A10.4 10.4 0 1 0 21.7 16a.9.9 0 0 0-1.1-1.1Z"
    />
  </svg>
);

const StrawHatIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    {/* Simple straw-hat silhouette */}
    <path
      fill="currentColor"
      d="M12 3c-3.4 0-6 2.6-6 6v1.2c0 .6.4 1.1 1 1.2l.8.1c.7.1 1.2.7 1.2 1.4 0 .8.6 1.4 1.4 1.4h3.2c.8 0 1.4-.6 1.4-1.4 0-.7.5-1.3 1.2-1.4l.8-.1c.6-.1 1-.6 1-1.2V9c0-3.4-2.6-6-6-6Z"
    />
    <path
      fill="currentColor"
      d="M3 14.2c0-1 1-1.7 2-1.3 2.3 1 4.7 1.6 7 1.6s4.7-.6 7-1.6c1-.4 2 .3 2 1.3 0 2.3-4.4 4.8-9 4.8s-9-2.5-9-4.8Z"
      opacity=".85"
    />
  </svg>
);

/* ---------- Options (static = no re-create each render) ---------- */

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "light",
    label: "Light",
    description: "Bright, clean look",
    Icon: SunIcon,
    iconClass: "text-warning-400",
    activeClass: "bg-warning-soft border-warning-soft-border",
  },
  {
    id: "dark",
    label: "Dark",
    description: "Easy on the eyes",
    Icon: MoonIcon,
    iconClass: "text-info-400",
    activeClass: "bg-info-soft border-info-soft-border",
  },
  {
    id: "onepiece",
    label: "One Piece",
    description: "Parchment + Straw Hat vibe",
    Icon: StrawHatIcon,
    iconClass: "text-op-straw",
    activeClass: "bg-op-parchment/60 border-border-subtle",
  },
];

export default function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const mounted = useIsMounted();

  const activeTheme = useMemo(
    () => resolveThemeId(theme, resolvedTheme),
    [theme, resolvedTheme],
  );

  const [isOpen, setIsOpen] = useState(false);
  const [placement, setPlacement] = useState<Placement>("bottom");
  const [pos, setPos] = useState({ left: 0, top: 0 });

  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const itemRefs = useRef<Record<ThemeId, HTMLButtonElement | null>>({
    light: null,
    dark: null,
    onepiece: null,
  });

  const closeMenu = useCallback(() => setIsOpen(false), []);
  const openMenu = useCallback(() => setIsOpen(true), []);
  const toggleMenu = useCallback(() => setIsOpen((v) => !v), []);

  const applyTheme = useCallback(
    (id: ThemeId) => {
      setTheme(id);
      closeMenu();
      triggerRef.current?.focus();
    },
    [setTheme, closeMenu],
  );

  const repositionMenu = useCallback(() => {
    const trigger = triggerRef.current;
    const menu = menuRef.current;
    if (!trigger || !menu) return;

    const rect = trigger.getBoundingClientRect();

    // menu is always mounted (but can be invisible), so size is measurable
    const menuW = menu.offsetWidth || 224;
    const menuH = menu.offsetHeight || 164;

    const PAD = 8;
    const GAP = 10;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const spaceBelow = vh - rect.bottom - PAD;
    const spaceAbove = rect.top - PAD;

    const nextPlacement: Placement =
      spaceBelow < menuH && spaceAbove > spaceBelow ? "top" : "bottom";

    const rawTop =
      nextPlacement === "bottom" ? rect.bottom + GAP : rect.top - GAP - menuH;

    // Align menu to the trigger end (right for LTR, left for RTL)
    const docDir =
      typeof document !== "undefined" ? document.documentElement.dir : "ltr";
    const isRTL = docDir === "rtl";

    const rawLeft = isRTL ? rect.left : rect.right - menuW;

    const top = clamp(rawTop, PAD, vh - menuH - PAD);
    const left = clamp(rawLeft, PAD, vw - menuW - PAD);

    setPlacement(nextPlacement);
    setPos((prev) =>
      prev.left === left && prev.top === top ? prev : { left, top },
    );
  }, []);

  // Dismiss: outside click, Escape, focus leaving (Tab)
  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (e: PointerEvent) => {
      const root = rootRef.current;
      const menu = menuRef.current;
      const target = e.target as Node;

      if (root?.contains(target)) return;
      if (menu?.contains(target)) return;

      closeMenu();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMenu();
        triggerRef.current?.focus();
      }
    };

    const onFocusIn = (e: FocusEvent) => {
      const root = rootRef.current;
      const menu = menuRef.current;
      const target = e.target as Node | null;
      if (!target) return;

      if (root?.contains(target)) return;
      if (menu?.contains(target)) return;

      closeMenu();
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("focusin", onFocusIn);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("focusin", onFocusIn);
    };
  }, [isOpen, closeMenu]);

  // Position: compute on open + keep stable on resize/scroll
  useLayoutEffect(() => {
    if (!isOpen) return;

    repositionMenu();

    const onReposition = () => repositionMenu();
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => repositionMenu())
        : null;

    if (ro) {
      if (triggerRef.current) ro.observe(triggerRef.current);
      if (menuRef.current) ro.observe(menuRef.current);
    }

    return () => {
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
      ro?.disconnect();
    };
  }, [isOpen, repositionMenu]);

  // Focus selected item when menu opens
  useEffect(() => {
    if (!isOpen) return;
    requestAnimationFrame(() => {
      repositionMenu();
      itemRefs.current[activeTheme]?.focus();
    });
  }, [isOpen, activeTheme, repositionMenu]);

  const currentOption = useMemo(
    () => THEME_OPTIONS.find((o) => o.id === activeTheme) ?? THEME_OPTIONS[0],
    [activeTheme],
  );

  const portalEl = typeof document !== "undefined" ? document.body : null;

  // Keyboard navigation inside menu (roving focus)
  const onMenuKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const order: ThemeId[] = ["light", "dark", "onepiece"];

      const focusedIndex = order.findIndex(
        (id) => document.activeElement === itemRefs.current[id],
      );

      const focusAt = (idx: number) => {
        const id = order[(idx + order.length) % order.length];
        itemRefs.current[id]?.focus();
      };

      if (e.key === "ArrowDown") {
        e.preventDefault();
        focusAt(focusedIndex === -1 ? 0 : focusedIndex + 1);
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        focusAt(focusedIndex === -1 ? order.length - 1 : focusedIndex - 1);
        return;
      }

      if (e.key === "Home") {
        e.preventDefault();
        focusAt(0);
        return;
      }

      if (e.key === "End") {
        e.preventDefault();
        focusAt(order.length - 1);
        return;
      }

      if (e.key === "Enter" || e.key === " ") {
        const id = order[focusedIndex] ?? activeTheme;
        e.preventDefault();
        applyTheme(id);
      }
    },
    [activeTheme, applyTheme],
  );

  return (
    <div ref={rootRef} className="relative inline-flex">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (isOpen ? closeMenu() : openMenu())}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleMenu();
          }
          if (e.key === "ArrowDown") {
            e.preventDefault();
            openMenu();
          }
        }}
        aria-label="Change theme"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={cn(
          // touch-friendly size (works great on mobile + desktop)
          "group relative grid h-10 w-10 place-items-center rounded-full",
          "border border-border-subtle bg-surface/90 shadow-[var(--shadow-md)]",
          "backdrop-blur supports-[backdrop-filter]:bg-surface/70",
          "transition duration-150 ease-out",
          "hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow-brand)]",
          "active:translate-y-0 active:scale-[0.96] active:shadow-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
      >
        {/* sheen */}
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 rounded-full",
            "bg-[radial-gradient(circle_at_30%_0,var(--brand-soft-bg),transparent_55%)]",
            "opacity-0 transition-opacity duration-300 group-hover:opacity-100",
          )}
        />

        {/* icon (no SSR mismatch: render placeholder until mounted) */}
        <span className="relative z-10">
          {mounted ? (
            <currentOption.Icon
              className={cn("h-5 w-5", currentOption.iconClass)}
            />
          ) : (
            <SunIcon className="h-5 w-5 opacity-0" />
          )}
        </span>
      </button>

      {/* Portal menu (keeps it in same area + never clipped by parent overflow) */}
      {portalEl &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-hidden={!isOpen}
            onKeyDown={onMenuKeyDown}
            style={{
              position: "fixed",
              left: pos.left,
              top: pos.top,
              zIndex: 60,
            }}
            className={cn(
              "w-56 max-w-[calc(100vw-1rem)]",
              "rounded-2xl border border-border-subtle bg-card/95 shadow-[var(--shadow-lg)]",
              "backdrop-blur supports-[backdrop-filter]:bg-card/80",
              "p-1",
              // animation (CSS-only, lightweight)
              "transition-[opacity,transform,visibility] duration-150 ease-out",
              isOpen
                ? "visible opacity-100 scale-100"
                : "invisible opacity-0 scale-[0.985] pointer-events-none",
              placement === "bottom"
                ? "origin-top-right"
                : "origin-bottom-right",
            )}
          >
            {THEME_OPTIONS.map((opt) => {
              const active = opt.id === activeTheme;
              return (
                <button
                  key={opt.id}
                  ref={(el) => {
                    itemRefs.current[opt.id] = el;
                  }}
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  onClick={() => applyTheme(opt.id)}
                  className={cn(
                    "relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left",
                    "border border-transparent transition-colors",
                    "hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring",
                    active
                      ? cn("border-border-subtle", opt.activeClass)
                      : "text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-9 w-9 place-items-center rounded-xl",
                      "bg-surface-muted/60 border border-border-subtle",
                      "transition-transform duration-150",
                      "group-hover:scale-[1.02]",
                    )}
                  >
                    <opt.Icon className={cn("h-5 w-5", opt.iconClass)} />
                  </span>

                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-sm font-semibold text-foreground-strong">
                      {opt.label}
                    </span>
                    <span className="text-[11px] text-foreground-muted truncate">
                      {opt.description}
                    </span>
                  </span>

                  <span
                    className={cn(
                      "grid h-6 w-6 place-items-center rounded-full border",
                      active
                        ? "border-accent-border bg-accent text-accent-foreground shadow-soft"
                        : "border-border-subtle bg-surface-muted text-foreground-soft",
                    )}
                    aria-hidden="true"
                  >
                    {active ? "✓" : ""}
                  </span>
                </button>
              );
            })}
          </div>,
          portalEl,
        )}
    </div>
  );
}
