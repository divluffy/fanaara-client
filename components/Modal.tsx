// components\Modal.tsx
"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  useDragControls,
  useReducedMotion,
} from "framer-motion";
import { IoClose } from "react-icons/io5";
import { useModalStack } from "@/app/ModalProvider";

import {
  clamp,
  cx,
  Dir,
  getDocDir,
  Mode,
  Overlay,
  resolveResponsive,
  SheetDragMode,
} from "./modal/utils";
import {
  useFocusTrap,
  useMediaQuery,
  useMobileBackClose,
  usePortalRoot,
  useSortedSnapPoints,
  useVisualViewportHeight,
} from "./modal/hooks";

export type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  mode?: Mode | { desktop?: Mode; mobile?: Mode };
  overlay?: Overlay;
  dir?: Dir;

  title?: React.ReactNode;
  subtitle?: React.ReactNode;

  preset?: "default" | "comments";

  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;

  trapFocus?: boolean;

  maxWidthClass?: string;
  panelClassName?: string;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;

  contentPadding?: "default" | "none";

  // sheet behavior
  sheetDragMode?: SheetDragMode; // "binary" | "legacy" | "none"
  sheetCollapsedFraction?: number; // default 0.6 ✅
  sheetFullFraction?: number; // default 0.98
  sheetInitialState?: "collapsed" | "full"; // default collapsed
  sheetDragEnabled?: boolean; // default true
  sheetDragToClose?: boolean; // default true
  sheetDragThresholdUp?: number; // px
  sheetDragThresholdDown?: number; // px

  // legacy
  sheetSnapPoints?: number[];
  sheetInitialSnap?: number;

  sheetTopBar?: React.ReactNode;
  sheetTopBarClassName?: string;

  footer?: React.ReactNode;
  children: React.ReactNode;

  mountChildren?: "immediate" | "after-open";
  loadingFallback?: React.ReactNode;
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

  closeOnBackdrop = true,
  closeOnEsc = true,

  trapFocus = true,

  maxWidthClass = "max-w-lg",
  panelClassName,
  headerClassName,
  contentClassName,
  footerClassName,

  contentPadding = "default",

  sheetDragMode,
  sheetCollapsedFraction = 0.7,
  sheetFullFraction = 0.98,
  sheetInitialState = "collapsed",
  sheetDragEnabled = true,
  sheetDragToClose = true,
  sheetDragThresholdUp = 14,
  sheetDragThresholdDown = 8,

  sheetSnapPoints,
  sheetInitialSnap,

  sheetTopBar,
  sheetTopBarClassName,

  footer,
  children,

  mountChildren,
  loadingFallback,
}: ModalProps) {
  const reduceMotion = !!useReducedMotion();

  // Phone detection
  const isSmall = useMediaQuery("(max-width: 768px)");
  const isCoarse = useMediaQuery("(pointer: coarse)");
  const isPhone = isSmall && isCoarse;

  const viewportH = useVisualViewportHeight();
  const portalRoot = usePortalRoot("modal-root");

  const id = useId();
  const stack = useModalStack();

  const panelRef = useRef<HTMLDivElement | null>(null);
  const blockNextClickRef = useRef(false);

  // register in stack
  useEffect(() => {
    if (!stack) return;
    if (open) stack.open(id);
    else stack.close(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const isTop = stack ? stack.isTop(id) : true;
  const zIndexBase = stack ? 1000 + Math.max(0, stack.getIndex(id)) * 10 : 1000;

  const resolvedDir = useMemo(() => {
    if (dir === "rtl" || dir === "ltr") return dir;
    return getDocDir();
  }, [dir]);

  const resolvedMode = resolveResponsive<Mode>(
    mode,
    isSmall,
    isSmall ? "sheet" : "center",
  );

  // overlay: blur on phone expensive → dim
  const effectiveOverlay: Overlay =
    isPhone && overlay === "blur" ? "dim" : overlay;

  const overlayVisualClass =
    effectiveOverlay === "none"
      ? "bg-transparent"
      : effectiveOverlay === "dim"
        ? "bg-black/45"
        : "bg-black/28 backdrop-blur-[14px]";

  const safeVH =
    viewportH || (typeof window !== "undefined" ? window.innerHeight : 800);

  // ✅ Back/Swipe => close ONLY top modal (fixed: no double-back)
  useMobileBackClose({
    open,
    enabled: isPhone,
    isTop,
    id,
    onClose: () => onOpenChange(false),
  });

  // ESC closes only top modal
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

  // focus trap
  useFocusTrap({
    enabled: open && trapFocus,
    containerEl: panelRef.current,
    initialFocus: "first",
    restoreFocus: true,
  });

  // mount children after shell
  const mountMode = mountChildren ?? (isPhone ? "after-open" : "immediate");
  const [showChildren, setShowChildren] = useState(
    open && mountMode === "immediate",
  );

  useEffect(() => {
    if (!open) {
      setShowChildren(false);
      return;
    }
    if (mountMode === "immediate") {
      setShowChildren(true);
      return;
    }
    setShowChildren(false);
    const r = requestAnimationFrame(() => setShowChildren(true));
    return () => cancelAnimationFrame(r);
  }, [open, mountMode]);

  // sheet sizing
  const snaps = useSortedSnapPoints(sheetSnapPoints);

  const collapsedFrac = clamp(sheetCollapsedFraction, 0.2, 0.98);
  const fullFrac = clamp(sheetFullFraction, 0.2, 0.98);

  const collapsedH = Math.round(safeVH * collapsedFrac);
  const fullH = Math.round(safeVH * fullFrac);
  const collapsedOffset = Math.max(0, fullH - collapsedH);

  const effectiveSheetMode: SheetDragMode =
    resolvedMode === "sheet" && isPhone ? (sheetDragMode ?? "binary") : "none";

  const binarySheet =
    resolvedMode === "sheet" &&
    isPhone &&
    effectiveSheetMode === "binary" &&
    sheetDragEnabled;

  const [sheetState, setSheetState] = useState<"collapsed" | "full">(
    sheetInitialState,
  );

  useEffect(() => {
    if (!open) return;

    if (binarySheet) {
      setSheetState(sheetInitialState);
      return;
    }

    // legacy fallback
    const initialIdx = clamp(sheetInitialSnap ?? 0, 0, snaps.length - 1);
    setSheetState(initialIdx <= 0 ? "collapsed" : "full");
  }, [open, binarySheet, sheetInitialState, snaps, sheetInitialSnap]);

  const requestClose = () => {
    if (!isTop) return;
    onOpenChange(false);
  };

  const wrapperPadding =
    resolvedMode === "sheet" ? "px-0 pb-0 pt-0 sm:p-6" : "p-4 sm:p-6";

  const contentPadClass = contentPadding === "none" ? "p-0" : "px-4 py-4";

  const safeBottomPad =
    resolvedMode === "sheet" && !footer
      ? "pb-[calc(env(safe-area-inset-bottom)+12px)]"
      : "";

  const contentWrapperClass = cx(
    "relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain",
    contentPadClass,
    safeBottomPad,
    isPhone ? "no-scrollbar" : "",
    contentClassName,
  );

  const panelBaseClass = cx(
    "relative flex w-full flex-col overflow-hidden",
    "bg-background-elevated text-foreground border border-border-subtle",
    "shadow-[var(--shadow-elevated)]",
    resolvedMode === "sheet"
      ? "rounded-t-2xl max-w-none"
      : cx("rounded-2xl", maxWidthClass),
    panelClassName,
  );

  const headerClass = cx(
    "border-b border-border-subtle/70 bg-background-elevated px-4 pt-2 pb-3",
    headerClassName,
  );

  const footerClass = cx(
    "border-t border-border-subtle/70 bg-background-elevated px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+12px)]",
    footerClassName,
  );

  const hasHeader = preset !== "comments" && (title || subtitle);
  const showClose = preset !== "comments";

  const rowDir =
    resolvedDir === "rtl"
      ? "flex-row-reverse text-right"
      : "flex-row text-left";

  const overlayAnim = reduceMotion
    ? { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 } }
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.11 } },
        exit: { opacity: 0, transition: { duration: 0.11 } },
      };

  const centerAnim = reduceMotion
    ? {
        initial: { opacity: 1, y: 0, scale: 1 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 1, y: 0, scale: 1 },
        transition: { duration: 0.001 },
      }
    : {
        initial: { opacity: 0, y: 10, scale: 0.99 },
        animate: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.14, ease: "easeOut" },
        },
        exit: {
          opacity: 0,
          y: 8,
          scale: 0.99,
          transition: { duration: 0.12, ease: "easeIn" },
        },
      };

  // ✅ enter/exit offset صغير (يمنع "overlay فقط" لو تعطل animation)
  const sheetTween = reduceMotion
    ? { duration: 0.001 }
    : { duration: 0.16, ease: "easeOut" };

  // prevent click-through after backdrop close
  useEffect(() => {
    if (!open) return;

    const onClickCapture = (e: MouseEvent) => {
      if (!blockNextClickRef.current) return;
      e.preventDefault();
      e.stopPropagation();
      blockNextClickRef.current = false;
    };

    document.addEventListener("click", onClickCapture, true);
    return () => {
      document.removeEventListener("click", onClickCapture, true);
      blockNextClickRef.current = false;
    };
  }, [open]);

  const dragControls = useDragControls();

  const startDragIfAllowed = (e: React.PointerEvent) => {
    if (!binarySheet) return;
    if (reduceMotion) return;
    if (!isTop) return;
    dragControls.start(e);
  };

  const onBinaryDragEnd = (
    _: any,
    info: { offset: { y: number }; velocity: { y: number } },
  ) => {
    if (!binarySheet) return;

    const dy = info.offset.y; // + down, - up
    const vy = info.velocity.y;

    if (sheetDragToClose && (dy > sheetDragThresholdDown || vy > 650)) {
      requestClose();
      return;
    }

    if (dy < -sheetDragThresholdUp || vy < -650) {
      setSheetState("full");
      return;
    }

    setSheetState((s) => s);
  };

  if (!portalRoot) return null;

  const ui = (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0" style={{ zIndex: zIndexBase }}>
          <motion.div
            className={cx(
              "absolute inset-0 pointer-events-none",
              overlayVisualClass,
            )}
            {...overlayAnim}
            style={{ willChange: "opacity" }}
          />

          <div
            className={cx(
              "absolute inset-0 flex",
              resolvedMode === "sheet"
                ? "items-end justify-center"
                : "items-center justify-center",
              wrapperPadding,
            )}
            style={{ zIndex: zIndexBase + 1 }}
            onClick={(e) => {
              if (!closeOnBackdrop) return;
              if (!isTop) return;
              if (e.target !== e.currentTarget) return;

              blockNextClickRef.current = true;
              requestClose();
            }}
          >
            {resolvedMode === "sheet" ? (
              binarySheet ? (
                <motion.div
                  ref={panelRef}
                  role="dialog"
                  aria-modal="true"
                  tabIndex={-1}
                  dir={resolvedDir}
                  className={panelBaseClass}
                  style={{
                    maxHeight: fullH,
                    willChange: "transform,height",
                    contain: "layout paint",
                  }}
                  initial={{
                    y: reduceMotion ? 0 : 24,
                    height: sheetInitialState === "full" ? fullH : collapsedH,
                    opacity: reduceMotion ? 1 : 1,
                  }}
                  animate={{
                    y: 0,
                    height: sheetState === "full" ? fullH : collapsedH,
                    opacity: 1,
                  }}
                  exit={{
                    y: reduceMotion ? 0 : 24,
                    opacity: reduceMotion ? 1 : 0.98,
                  }}
                  transition={sheetTween}
                  drag="y"
                  dragControls={dragControls}
                  dragListener={false}
                  dragConstraints={{ top: -1, bottom: fullH }} // ✅ يمنع الرفع للأعلى فعليًا
                  dragElastic={0}
                  onDragEnd={onBinaryDragEnd}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent" />

                  <div
                    className="pt-3 pb-2"
                    style={{ touchAction: "none" }}
                    onPointerDown={startDragIfAllowed}
                  >
                    <div className="flex justify-center">
                      <span className="block h-1.5 w-12 rounded-full bg-border-strong/40" />
                    </div>
                  </div>

                  {sheetTopBar && (
                    <div
                      className={cx(
                        "px-4 pb-2 select-none",
                        sheetTopBarClassName,
                      )}
                    >
                      {sheetTopBar}
                    </div>
                  )}

                  <div
                    className={contentWrapperClass}
                    style={{
                      WebkitOverflowScrolling: "touch",
                      touchAction: "pan-y",
                    }}
                  >
                    {showChildren ? children : loadingFallback}
                  </div>

                  {footer && <div className={footerClass}>{footer}</div>}
                </motion.div>
              ) : (
                <motion.div
                  ref={panelRef}
                  role="dialog"
                  aria-modal="true"
                  tabIndex={-1}
                  dir={resolvedDir}
                  className={panelBaseClass}
                  style={{
                    height: Math.round(
                      safeVH * (snaps[snaps.length - 1] ?? 0.92),
                    ),
                    maxHeight: Math.round(
                      safeVH * (snaps[snaps.length - 1] ?? 0.92),
                    ),
                    willChange: "transform",
                    transform: "translateY(0)",
                  }}
                  initial={{ y: 18, opacity: 0 }}
                  animate={{
                    y: 0,
                    opacity: 1,
                    transition: { duration: 0.16, ease: "easeOut" },
                  }}
                  exit={{
                    y: 18,
                    opacity: 0,
                    transition: { duration: 0.12, ease: "easeIn" },
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <div className="pt-3 pb-2">
                    <div className="flex justify-center">
                      <span className="block h-1.5 w-12 rounded-full bg-border-strong/40" />
                    </div>
                  </div>

                  {hasHeader && (
                    <div className={headerClass}>
                      <div className={cx("flex items-start gap-3", rowDir)}>
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

                        {showClose && (
                          <button
                            type="button"
                            onClick={requestClose}
                            className={cx(
                              "group grid size-9 place-items-center rounded-full",
                              "bg-surface-soft/80 border border-border-subtle text-foreground-strong",
                            )}
                            aria-label="إغلاق"
                          >
                            <IoClose className="size-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <div
                    className={contentWrapperClass}
                    style={{ WebkitOverflowScrolling: "touch" }}
                  >
                    {children}
                  </div>

                  {footer && <div className={footerClass}>{footer}</div>}
                </motion.div>
              )
            ) : (
              <motion.div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                tabIndex={-1}
                dir={resolvedDir}
                className={panelBaseClass}
                style={{ maxHeight: "80svh", willChange: "transform" }}
                {...centerAnim}
                onPointerDown={(e) => e.stopPropagation()}
              >
                {hasHeader && (
                  <div className={headerClass}>
                    <div className={cx("flex items-start gap-3", rowDir)}>
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

                      {showClose && (
                        <button
                          type="button"
                          onClick={requestClose}
                          className={cx(
                            "group grid size-9 place-items-center rounded-full",
                            "bg-surface-soft/80 border border-border-subtle text-foreground-strong",
                          )}
                          aria-label="إغلاق"
                        >
                          <IoClose className="size-5" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div
                  className={contentWrapperClass}
                  style={{ WebkitOverflowScrolling: "touch" }}
                >
                  {showChildren ? children : loadingFallback}
                </div>

                {footer && <div className={footerClass}>{footer}</div>}
              </motion.div>
            )}
          </div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(ui, portalRoot);
}
