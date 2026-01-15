"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useDragControls,
} from "framer-motion";
import { IoClose } from "react-icons/io5";
import { useModalStack } from "@/app/ModalProvider";

type Dir = "auto" | "rtl" | "ltr";
type Overlay = "blur" | "dim" | "none";
type Mode = "center" | "sheet";
type Responsive<T> = T | { desktop?: T; mobile?: T };

function useMediaQuery(query: string) {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const m = window.matchMedia(query);
    const onChange = () => setMatch(m.matches);
    onChange();
    m.addEventListener?.("change", onChange);
    return () => m.removeEventListener?.("change", onChange);
  }, [query]);
  return match;
}

function getDocDir(): "rtl" | "ltr" {
  if (typeof document === "undefined") return "ltr";
  const d = document.documentElement.getAttribute("dir");
  return d === "rtl" ? "rtl" : "ltr";
}

function resolveResponsive<T>(
  value: Responsive<T> | undefined,
  isMobile: boolean,
  fallback: T
): T {
  if (value === undefined) return fallback;
  if (
    typeof value === "object" &&
    value !== null &&
    ("desktop" in value || "mobile" in value)
  ) {
    return (isMobile ? value.mobile : value.desktop) ?? fallback;
  }
  return value as T;
}

function getFocusable(container: HTMLElement): HTMLElement[] {
  const selector = [
    "a[href]",
    "button:not([disabled])",
    "textarea:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ].join(",");
  return Array.from(container.querySelectorAll(selector)).filter(
    (el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden")
  ) as HTMLElement[];
}

export type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  mode?: Responsive<Mode>;
  overlay?: Overlay;
  dir?: Dir;

  title?: React.ReactNode;
  subtitle?: React.ReactNode;

  showHeader?: Responsive<boolean>;
  showClose?: Responsive<boolean>;
  preset?: "default" | "comments";

  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  sheetDragToClose?: boolean;

  sheetMaxHeight?: number;

  maxWidthClass?: string;
  className?: string;

  footer?: React.ReactNode;
  children: React.ReactNode;
};

export default function Modal({
  open,
  onOpenChange,

  mode,
  overlay = "blur",
  dir = "auto",

  title,
  subtitle,

  preset = "default",
  showHeader,
  showClose,

  closeOnBackdrop = true,
  closeOnEsc = true,
  sheetDragToClose = true,

  sheetMaxHeight = 0.66,

  maxWidthClass = "max-w-lg",
  className = "",

  footer,
  children,
}: ModalProps) {
  const reduceMotion = useReducedMotion();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [mounted, setMounted] = useState(false);

  const id = useId();
  const stack = useModalStack();

  const panelRef = useRef<HTMLDivElement | null>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);

  // ✅ Drag only from handle (prevents heavy/slow scroll on mobile)
  const dragControls = useDragControls();

  const resolvedDir = useMemo(() => {
    if (dir === "rtl" || dir === "ltr") return dir;
    return getDocDir();
  }, [dir]);

  const resolvedMode = resolveResponsive<Mode>(
    mode,
    isMobile,
    isMobile ? "sheet" : "center"
  );

  const defaultHeader =
    preset === "comments"
      ? { desktop: true, mobile: false }
      : { desktop: true, mobile: true };

  const defaultClose =
    preset === "comments"
      ? { desktop: true, mobile: false }
      : { desktop: true, mobile: true };

  const resolvedShowHeader = resolveResponsive(
    showHeader,
    isMobile,
    isMobile ? defaultHeader.mobile : defaultHeader.desktop
  );
  const resolvedShowClose = resolveResponsive(
    showClose,
    isMobile,
    isMobile ? defaultClose.mobile : defaultClose.desktop
  );

  const hasHeader = resolvedShowHeader && (title || subtitle);

  const isTop = stack ? stack.isTop(id) : true;
  const zIndexBase = (() => {
    if (!stack) return 1000;
    const idx = stack.getIndex(id);
    return 1000 + Math.max(0, idx) * 10;
  })();

  useEffect(() => setMounted(true), []);

  // Register/unregister in stack when open changes
  useEffect(() => {
    if (!stack) return;
    if (open) stack.open(id);
    else stack.close(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ✅ Lock body scroll while modal is open (prevents background scroll/jank)
  useEffect(() => {
    if (!open) return;
    const body = document.body;

    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;

    // avoid layout shift on desktop (scrollbar width)
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPaddingRight;
    };
  }, [open]);

  // remember focus + restore focus
  useEffect(() => {
    if (!open) {
      lastActiveRef.current?.focus?.();
      return;
    }
    lastActiveRef.current = document.activeElement as HTMLElement | null;

    const t = window.setTimeout(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const focusables = getFocusable(panel);
      if (focusables.length) focusables[0].focus();
      else panel.focus();
    }, 0);

    return () => window.clearTimeout(t);
  }, [open]);

  // ESC closes ONLY top modal
  useEffect(() => {
    if (!open || !closeOnEsc) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (!isTop) return;
      onOpenChange(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, closeOnEsc, isTop, onOpenChange]);

  // Focus trap
  const onKeyDownCapture = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const panel = panelRef.current;
    if (!panel) return;

    const focusables = getFocusable(panel);
    if (!focusables.length) {
      e.preventDefault();
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement as HTMLElement;

    if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    } else if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    }
  };

  // ✅ Blur is expensive on mobile → fallback to dim for better performance
  const effectiveOverlay: Overlay =
    isMobile && overlay === "blur" ? "dim" : overlay;

  const overlayClass =
    effectiveOverlay === "none"
      ? "bg-transparent"
      : effectiveOverlay === "dim"
      ? "bg-black/45"
      : "bg-black/28 backdrop-blur-[14px]";

  const rowDir =
    resolvedDir === "rtl"
      ? "flex-row-reverse text-right"
      : "flex-row text-left";

  const sheetMax = Math.max(0.2, Math.min(0.95, sheetMaxHeight));
  const sheetMaxHeightStyle = `${Math.round(sheetMax * 100)}svh`;

  const backdropVariants = {
    open: { opacity: 1, transition: { duration: reduceMotion ? 0.001 : 0.18 } },
    closed: {
      opacity: 0,
      transition: { duration: reduceMotion ? 0.001 : 0.14 },
    },
  };

  const panelVariants =
    resolvedMode === "sheet"
      ? {
          open: {
            opacity: 1,
            y: 0,
            transition: reduceMotion
              ? { duration: 0.001 }
              : { type: "spring", stiffness: 520, damping: 36 },
          },
          closed: {
            opacity: 0,
            y: 28,
            transition: reduceMotion
              ? { duration: 0.001 }
              : { duration: 0.16, ease: [0.2, 0.9, 0.2, 1] },
          },
        }
      : {
          open: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: reduceMotion
              ? { duration: 0.001 }
              : { type: "spring", stiffness: 540, damping: 34 },
          },
          closed: {
            opacity: 0,
            y: 10,
            scale: 0.985,
            transition: reduceMotion
              ? { duration: 0.001 }
              : { duration: 0.16, ease: [0.2, 0.9, 0.2, 1] },
          },
        };

  if (!mounted) return null;

  const wrapperPadding =
    resolvedMode === "sheet" ? "px-0 pb-0 pt-6 sm:p-6" : "p-4 sm:p-6";

  const panelStyle: React.CSSProperties =
    resolvedMode === "sheet"
      ? { maxHeight: sheetMaxHeightStyle, willChange: "transform" }
      : { maxHeight: "80svh", willChange: "transform" };

  const showSheetHandle = resolvedMode === "sheet";

  const ui = (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0" style={{ zIndex: zIndexBase }}>
          <motion.div
            className={`absolute inset-0 ${overlayClass}`}
            initial="closed"
            animate="open"
            exit="closed"
            variants={backdropVariants}
            style={{ zIndex: zIndexBase, willChange: "opacity" }}
          />

          <div
            className={`absolute inset-0 flex ${
              resolvedMode === "sheet"
                ? "items-end justify-center"
                : "items-center justify-center"
            } ${wrapperPadding}`}
            style={{ zIndex: zIndexBase + 1 }}
            onPointerDown={(e) => {
              if (!closeOnBackdrop) return;
              if (!isTop) return;
              if (e.target === e.currentTarget) onOpenChange(false);
            }}
            onKeyDownCapture={onKeyDownCapture}
          >
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              tabIndex={-1}
              dir={resolvedDir}
              initial="closed"
              animate="open"
              exit="closed"
              variants={panelVariants}
              onPointerDown={(e) => e.stopPropagation()}
              style={panelStyle}
              className={`
                relative flex w-full flex-col overflow-hidden
                bg-background-elevated text-foreground
                border border-border-subtle
                shadow-[var(--shadow-elevated)]
                ${
                  resolvedMode === "sheet"
                    ? "rounded-t-2xl max-w-none"
                    : `rounded-2xl ${maxWidthClass}`
                }
                ${className}
              `}
              // ✅ drag only for sheet, but start it manually from handle
              drag={
                resolvedMode === "sheet" && sheetDragToClose && !reduceMotion
                  ? "y"
                  : false
              }
              dragControls={dragControls}
              dragListener={false}
              dragConstraints={
                resolvedMode === "sheet" ? { top: 0, bottom: 0 } : undefined
              }
              dragElastic={resolvedMode === "sheet" ? 0.12 : undefined}
              dragMomentum={false}
              onDragEnd={(_, info) => {
                if (
                  resolvedMode !== "sheet" ||
                  !sheetDragToClose ||
                  reduceMotion
                )
                  return;
                if (!isTop) return;

                const shouldClose =
                  info.offset.y > 120 || info.velocity.y > 900;
                if (shouldClose) onOpenChange(false);
              }}
            >
              {/* accent hairline */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent" />

              {/* ✅ Sheet handle (even if header is hidden by preset) */}
              {showSheetHandle && (
                <div className="pt-3 pb-2">
                  <div className="flex justify-center">
                    <button
                      type="button"
                      aria-label="Drag to close"
                      className="touch-none"
                      onPointerDown={(e) => {
                        if (!sheetDragToClose || reduceMotion) return;
                        dragControls.start(e);
                      }}
                    >
                      <span
                        aria-hidden
                        className="block h-1.5 w-12 rounded-full bg-border-strong/40 transition-all duration-200"
                      />
                    </button>
                  </div>
                </div>
              )}

              {/* Header */}
              {hasHeader && (
                <div className="border-b border-border-subtle/70 bg-background-elevated px-4 pt-2 pb-3">
                  <div className={`flex ${rowDir} items-start gap-3`}>
                    <div className="flex-1 space-y-1">
                      {title && (
                        <div className="text-base font-semibold text-foreground-strong">
                          {title}
                        </div>
                      )}
                      {subtitle && (
                        <div className="text-sm text-foreground-muted">
                          {subtitle}
                        </div>
                      )}
                    </div>

                    {resolvedShowClose && (
                      <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="
                          group grid size-9 place-items-center rounded-full
                          bg-surface-soft/80 border border-border-subtle
                          text-foreground-strong shadow-[var(--shadow-sm)]
                          transition-all duration-200
                          hover:-translate-y-[1px] hover:bg-accent-subtle hover:border-accent-border hover:shadow-[var(--shadow-lg)]
                          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring
                          focus-visible:ring-offset-2 focus-visible:ring-offset-background
                        "
                        aria-label="إغلاق"
                      >
                        <IoClose className="size-5 transition-transform duration-200 group-hover:rotate-90" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Content */}
              <div
                className={[
                  "relative flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 overscroll-contain",
                  isMobile ? "no-scrollbar" : "",
                ].join(" ")}
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {/* ✅ Avoid expensive background gradient on mobile while scrolling */}
                {!isMobile && (
                  <div className="pointer-events-none absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_15%_10%,var(--color-accent-subtle),transparent_60%)]" />
                )}
                <div className="relative">{children}</div>
              </div>

              {/* Footer */}
              {footer && (
                <div className="border-t border-border-subtle/70 bg-background-elevated px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(ui, document.body);
}
