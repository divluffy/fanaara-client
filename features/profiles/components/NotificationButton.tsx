"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  MdNotifications,
  MdNotificationsActive,
  MdNotificationsOff,
  MdClose,
} from "react-icons/md";

import { cn } from "@/utils";
import { Button } from "@/design/DeButton";

type NotificationMode = "mute" | "default" | "all";

type NotificationButtonProps = {
  value?: NotificationMode;
  defaultValue?: NotificationMode;
  onChange?: (mode: NotificationMode) => void;
  disabled?: boolean;
  className?: string;
};

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    mql.addEventListener?.("change", update);
    return () => mql.removeEventListener?.("change", update);
  }, [query]);

  return matches;
}

function useOnClickOutside(
  refs: React.RefObject<HTMLElement>[],
  handler: () => void,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return;

    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node;
      const inside = refs.some((r) => r.current?.contains(t));
      if (!inside) handler();
    };

    window.addEventListener("pointerdown", onPointerDown, { capture: true });
    return () =>
      window.removeEventListener("pointerdown", onPointerDown, {
        capture: true,
      } as any);
  }, [refs, handler, enabled]);
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export const NotificationButton = ({
  value,
  defaultValue = "default",
  onChange,
  disabled,
  className,
}: NotificationButtonProps) => {
  const isMobile = useMediaQuery("(max-width: 639px)");
  const [open, setOpen] = useState(false);
  const [internal, setInternal] = useState<NotificationMode>(defaultValue);
  const [mounted, setMounted] = useState(false);

  const anchorRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const mode = value ?? internal;

  const close = useCallback(() => setOpen(false), []);
  const setMode = useCallback(
    (next: NotificationMode) => {
      if (!value) setInternal(next);
      onChange?.(next);
      close();
    },
    [value, onChange, close],
  );

  useEffect(() => setMounted(true), []);

  // ESC
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  // Lock scroll on mobile modal
  useEffect(() => {
    if (!open || !isMobile) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, isMobile]);

  useOnClickOutside([anchorRef, panelRef], close, open);

  // Desktop positioning (Portal + fixed)
  const [pos, setPos] = useState<{
    top: number;
    left: number;
    origin: string;
  } | null>(null);

  const updatePos = useCallback(() => {
    const anchor = anchorRef.current;
    const panel = panelRef.current;
    if (!anchor || !panel) return;

    const r = anchor.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const panelW = panel.offsetWidth;
    const panelH = panel.offsetHeight;

    const margin = 12;
    const gap = 10;

    const dir =
      (document.documentElement.getAttribute("dir") || "").toLowerCase() ===
      "rtl"
        ? "rtl"
        : "ltr";

    // Horizontal: align to trigger start (LTR) / end (RTL)
    let left = dir === "rtl" ? r.right - panelW : r.left;
    left = clamp(left, margin, vw - panelW - margin);

    // Vertical: prefer above; fallback below
    const topAbove = r.top - gap - panelH;
    const topBelow = r.bottom + gap;

    let top = topAbove;
    let origin = "bottom";

    if (topAbove < margin && topBelow + panelH <= vh - margin) {
      top = topBelow;
      origin = "top";
    } else {
      top = clamp(top, margin, vh - panelH - margin);
    }

    setPos({ top, left, origin });
  }, []);

  useLayoutEffect(() => {
    if (!open || isMobile) return;
    updatePos();
  }, [open, isMobile, updatePos]);

  useEffect(() => {
    if (!open || isMobile) return;
    const onAny = () => updatePos();
    window.addEventListener("resize", onAny);
    window.addEventListener("scroll", onAny, true);
    return () => {
      window.removeEventListener("resize", onAny);
      window.removeEventListener("scroll", onAny, true);
    };
  }, [open, isMobile, updatePos]);

  const triggerIcon =
    mode === "mute" ? (
      <MdNotificationsOff className="h-5 w-5" />
    ) : mode === "all" ? (
      <MdNotificationsActive className="h-5 w-5" />
    ) : (
      <MdNotifications className="h-5 w-5" />
    );

  const triggerTone =
    mode === "mute"
      ? "text-rose-300"
      : mode === "all"
        ? "text-emerald-300"
        : "text-zinc-100";

  const options: Array<{
    key: NotificationMode;
    title: string;
    icon: React.ReactNode;
    activeCls: string;
  }> = [
    {
      key: "mute",
      title: "كتم",
      icon: <MdNotificationsOff className="h-5 w-5" />,
      activeCls: "border-rose-500/35 bg-rose-500/10 text-rose-200",
    },
    {
      key: "default",
      title: "افتراضي",
      icon: <MdNotifications className="h-5 w-5" />,
      activeCls: "border-white/20 bg-white/5 text-zinc-50",
    },
    {
      key: "all",
      title: "الكل",
      icon: <MdNotificationsActive className="h-5 w-5" />,
      activeCls: "border-emerald-500/35 bg-emerald-500/10 text-emerald-200",
    },
  ];

  const panel = (
    <AnimatePresence>
      {open && !disabled && (
        <>
          {/* Mobile overlay */}
          {isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9998] bg-black/60"
              onClick={close}
              aria-hidden
            />
          )}

          <motion.div
            ref={panelRef}
            role="menu"
            dir="rtl"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className={cn(
              "z-[9999] w-[min(18rem,calc(100vw-2rem))]",
              "rounded-2xl border border-zinc-800 bg-zinc-950/95 text-zinc-50 shadow-xl",
              isMobile
                ? "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                : "fixed",
            )}
            style={
              !isMobile && pos
                ? {
                    top: pos.top,
                    left: pos.left,
                    transformOrigin: pos.origin,
                  }
                : undefined
            }
          >
            {/* Mobile X */}
            {isMobile && (
              <button
                type="button"
                onClick={close}
                className="absolute end-3 top-3 rounded-md p-1 text-zinc-400 hover:text-zinc-200"
                aria-label="Close"
              >
                <MdClose className="h-6 w-6" />
              </button>
            )}

            <div className={cn("p-3", isMobile && "pt-12")}>
              <div
                className={cn("flex gap-2", isMobile ? "flex-col" : "flex-row")}
              >
                {options.map((opt) => {
                  const active = mode === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      role="menuitemradio"
                      aria-checked={active}
                      onClick={() => setMode(opt.key)}
                      className={cn(
                        "flex flex-1 items-center justify-center gap-2",
                        "rounded-xl border px-3 py-2 text-sm font-semibold",
                        "transition hover:bg-white/5 active:scale-[0.99]",
                        "outline-none focus-visible:ring-2 focus-visible:ring-white/15",
                        active
                          ? opt.activeCls
                          : "border-white/10 bg-transparent text-zinc-100",
                      )}
                    >
                      {opt.icon}
                      <bdi className="leading-none">{opt.title}</bdi>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <div ref={anchorRef} className={cn("relative inline-flex", className)}>
      <Button
        iconOnly
        aria-label="Notifications"
        disabled={disabled}
        variant="soft"
        tone="neutral"
        shape="rounded"
        className={cn(
          "border border-zinc-800 bg-zinc-950/70 backdrop-blur",
          "hover:bg-zinc-950/85",
          open && "ring-2 ring-white/15",
          triggerTone,
        )}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {triggerIcon}
      </Button>

      {mounted ? createPortal(panel, document.body) : null}
    </div>
  );
};
