// design\DeModal.tsx
"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { AnimationPlaybackControls } from "framer-motion";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
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
} from "./utils/modal";
import {
  useFocusTrap,
  useMediaQuery,
  useMobileBackClose,
  usePortalRoot,
  useSortedSnapPoints,
  useVisualViewportHeight,
} from "./hooks/modal";

export type DeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  mode?: Mode | { desktop?: Mode; mobile?: Mode };
  overlay?: Overlay;
  dir?: Dir;

  title?: React.ReactNode;
  subtitle?: React.ReactNode;

  preset?: "default" | "comments";
  showCloseButton?: boolean; // ✅ default true

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
  sheetCollapsedFraction?: number; // default 0.7
  sheetFullFraction?: number; // default 0.98
  sheetInitialState?: "collapsed" | "full"; // default collapsed

  sheetDragEnabled?: boolean; // default true
  sheetDragToClose?: boolean; // default true

  sheetDragThresholdUp?: number; // px
  sheetDragThresholdDown?: number; // px

  /**
   * ✅ لو true:
   * - في binary mode: أعلى Snap (Full) يصير على قدر المحتوى إذا المحتوى قصير
   *   (بدون مبالغة في 98% من الشاشة)
   */
  sheetAutoFit?: boolean;

  // legacy snap points (fractions)
  sheetSnapPoints?: number[];
  sheetInitialSnap?: number;

  sheetTopBar?: React.ReactNode;
  sheetTopBarClassName?: string;

  footer?: React.ReactNode;
  children: React.ReactNode;

  mountChildren?: "immediate" | "after-open";
  loadingFallback?: React.ReactNode;
};

export default function DeModal({
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
  sheetDragThresholdDown = 10,

  sheetAutoFit = true,

  sheetSnapPoints,
  sheetInitialSnap,

  sheetTopBar,
  sheetTopBarClassName,

  footer,
  children,

  mountChildren,
  loadingFallback,
  showCloseButton = true, // ✅ أضف هذا
}: ModalProps) {
  const reduceMotion = useReducedMotion();

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

  // ✅ Back/Swipe => close ONLY top modal
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

  // ✅ focus trap فقط لأعلى مودل
  useFocusTrap({
    enabled: open && trapFocus && isTop,
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

  const rawCollapsedH = Math.round(safeVH * collapsedFrac);
  const rawFullH = Math.round(safeVH * fullFrac);

  const fullH = Math.max(rawFullH, rawCollapsedH);
  const collapsedH = Math.min(rawCollapsedH, fullH);

  const effectiveSheetMode: SheetDragMode =
    resolvedMode === "sheet" && isPhone ? (sheetDragMode ?? "binary") : "none";

  const isDraggableSheet =
    resolvedMode === "sheet" &&
    sheetDragEnabled &&
    effectiveSheetMode !== "none" &&
    isPhone;

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
  const showClose = preset !== "comments" && showCloseButton;

  const rowDir =
    resolvedDir === "rtl"
      ? "flex-row-reverse text-right"
      : "flex-row text-left";

  const titleId = useId();
  const subtitleId = useId();

  const overlayAnim = reduceMotion
    ? { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 } }
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.12 } },
        exit: { opacity: 0, transition: { duration: 0.12 } },
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
          transition: { duration: 0.16, ease: "easeOut" },
        },
        exit: {
          opacity: 0,
          y: 8,
          scale: 0.99,
          transition: { duration: 0.12, ease: "easeIn" },
        },
      };

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

  if (!portalRoot) return null;

  const headerNode =
    hasHeader || showClose ? (
      <div className={headerClass}>
        <div className={cx("flex items-start gap-3", rowDir)}>
          <div className="flex-1 space-y-1">
            {title && (
              <div
                id={titleId}
                className="text-base font-semibold text-foreground-strong"
              >
                {title}
              </div>
            )}
            {subtitle && (
              <div id={subtitleId} className="text-sm text-foreground-muted">
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
    ) : null;

  // fixed sheet height when drag mode = none
  const fixedSheetHeight = Math.round(
    safeVH * (snaps[snaps.length - 1] ?? 0.92),
  );

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
              isDraggableSheet ? (
                <DraggableSheetPanel
                  panelRef={panelRef}
                  dir={resolvedDir}
                  className={panelBaseClass}
                  maxSheetHeight={fullH}
                  safeVH={safeVH}
                  isTop={isTop}
                  reduceMotion={reduceMotion}
                  dragMode={effectiveSheetMode}
                  autoFit={sheetAutoFit}
                  dragToClose={sheetDragToClose}
                  thresholdUp={sheetDragThresholdUp}
                  thresholdDown={sheetDragThresholdDown}
                  initialBinaryState={sheetInitialState}
                  legacyFractions={snaps}
                  legacyInitialSnap={sheetInitialSnap}
                  collapsedHeight={collapsedH}
                  fullHeight={fullH}
                  sheetTopBar={sheetTopBar}
                  sheetTopBarClassName={sheetTopBarClassName}
                  headerNode={sheetTopBar ? null : headerNode}
                  contentWrapperClass={contentWrapperClass}
                  showChildren={showChildren}
                  loadingFallback={loadingFallback}
                  footer={footer}
                  footerClassName={footerClass}
                  onRequestClose={requestClose}
                  ariaLabelledBy={title ? titleId : undefined}
                  ariaDescribedBy={subtitle ? subtitleId : undefined}
                >
                  {children}
                </DraggableSheetPanel>
              ) : (
                <motion.div
                  ref={panelRef}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby={title ? titleId : undefined}
                  aria-describedby={subtitle ? subtitleId : undefined}
                  tabIndex={-1}
                  dir={resolvedDir}
                  className={panelBaseClass}
                  style={{
                    height: fixedSheetHeight,
                    maxHeight: fixedSheetHeight,
                    willChange: "transform",
                    contain: "layout paint",
                  }}
                  initial={
                    reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }
                  }
                  animate={
                    reduceMotion
                      ? { opacity: 1, y: 0 }
                      : {
                          opacity: 1,
                          y: 0,
                          transition: { duration: 0.16, ease: "easeOut" },
                        }
                  }
                  exit={
                    reduceMotion
                      ? { opacity: 1, y: 0 }
                      : {
                          opacity: 0,
                          y: 18,
                          transition: { duration: 0.12, ease: "easeIn" },
                        }
                  }
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <div className="pt-3 pb-2">
                    <div className="flex justify-center">
                      <span className="block h-1.5 w-12 rounded-full bg-border-strong/40" />
                    </div>
                  </div>

                  {sheetTopBar ? (
                    <div
                      className={cx(
                        "px-4 pb-2 select-none",
                        sheetTopBarClassName,
                      )}
                    >
                      {sheetTopBar}
                    </div>
                  ) : (
                    headerNode
                  )}

                  <div
                    className={contentWrapperClass}
                    style={{ WebkitOverflowScrolling: "touch" }}
                  >
                    {showChildren ? children : loadingFallback}
                  </div>

                  {footer && <div className={footerClass}>{footer}</div>}
                </motion.div>
              )
            ) : (
              <motion.div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? titleId : undefined}
                aria-describedby={subtitle ? subtitleId : undefined}
                tabIndex={-1}
                dir={resolvedDir}
                className={panelBaseClass}
                style={{ maxHeight: "80svh", willChange: "transform" }}
                {...centerAnim}
                onPointerDown={(e) => e.stopPropagation()}
              >
                {headerNode}

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

/* ───────────────────────────────────────────────────────────── */
/* Draggable Sheet Panel (binary + legacy multi-snap)             */
/* ───────────────────────────────────────────────────────────── */

function normalizeSnapHeights(input: number[]) {
  const cleaned = input
    .map((x) => Math.max(120, Math.round(x)))
    .sort((a, b) => a - b);

  const uniq: number[] = [];
  for (const h of cleaned) {
    if (!uniq.length || Math.abs(uniq[uniq.length - 1] - h) > 1) uniq.push(h);
  }
  return uniq;
}

function nearestSnapIndex(height: number, snaps: number[]) {
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < snaps.length; i++) {
    const d = Math.abs(snaps[i] - height);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}

type DraggableSheetPanelProps = {
  panelRef: React.RefObject<HTMLDivElement>;
  dir: "rtl" | "ltr";
  className: string;

  maxSheetHeight: number;
  safeVH: number;

  isTop: boolean;
  reduceMotion: boolean;

  dragMode: SheetDragMode; // "binary" | "legacy"
  autoFit: boolean;

  dragToClose: boolean;
  thresholdUp: number;
  thresholdDown: number;

  // binary
  initialBinaryState: "collapsed" | "full";
  collapsedHeight: number;
  fullHeight: number;

  // legacy
  legacyFractions: number[];
  legacyInitialSnap?: number;

  sheetTopBar?: React.ReactNode;
  sheetTopBarClassName?: string;

  headerNode?: React.ReactNode;

  contentWrapperClass: string;

  showChildren: boolean;
  loadingFallback?: React.ReactNode;

  footer?: React.ReactNode;
  footerClassName: string;

  onRequestClose: () => void;

  ariaLabelledBy?: string;
  ariaDescribedBy?: string;

  children: React.ReactNode;
};

function DraggableSheetPanel({
  panelRef,
  dir,
  className,

  maxSheetHeight,
  safeVH,

  isTop,
  reduceMotion,

  dragMode,
  autoFit,

  dragToClose,
  thresholdUp,
  thresholdDown,

  initialBinaryState,
  collapsedHeight,
  fullHeight,

  legacyFractions,
  legacyInitialSnap,

  sheetTopBar,
  sheetTopBarClassName,

  headerNode,

  contentWrapperClass,

  showChildren,
  loadingFallback,

  footer,
  footerClassName,

  onRequestClose,

  ariaLabelledBy,
  ariaDescribedBy,

  children,
}: DraggableSheetPanelProps) {
  const contentRef = useRef<HTMLDivElement | null>(null);

  const initialSnaps = useMemo(() => {
    if (dragMode === "legacy") {
      const hs = legacyFractions.map((f) => Math.round(safeVH * f));
      return normalizeSnapHeights(hs);
    }
    // binary
    return normalizeSnapHeights([collapsedHeight, fullHeight]);
  }, [dragMode, legacyFractions, safeVH, collapsedHeight, fullHeight]);

  const [snaps, setSnaps] = useState<number[]>(initialSnaps);

  useEffect(() => {
    setSnaps(initialSnaps);
  }, [initialSnaps]);

  const initialIndex = useMemo(() => {
    if (dragMode === "legacy") {
      const idx = clamp(
        legacyInitialSnap ?? 0,
        0,
        Math.max(0, initialSnaps.length - 1),
      );
      return idx;
    }
    return initialBinaryState === "full"
      ? Math.min(1, initialSnaps.length - 1)
      : 0;
  }, [dragMode, legacyInitialSnap, initialBinaryState, initialSnaps.length]);

  const [snapIndex, setSnapIndex] = useState(initialIndex);
  const snapIndexRef = useRef(initialIndex);

  useEffect(() => {
    snapIndexRef.current = snapIndex;
  }, [snapIndex]);

  // ✅ Auto-fit فقط للـbinary (snapين)
  useEffect(() => {
    if (reduceMotion) return;
    if (!autoFit) return;
    if (dragMode !== "binary") return;
    if (snaps.length !== 2) return;
    if (!showChildren) return;

    const panel = panelRef.current;
    const content = contentRef.current;
    if (!panel || !content) return;

    const calc = () => {
      const panelH = panel.getBoundingClientRect().height;
      const contentH = content.getBoundingClientRect().height;

      const fixedH = Math.max(0, panelH - contentH);
      const needed = Math.round(fixedH + content.scrollHeight);

      const minH = snaps[0];
      const maxH = snaps[1];

      const fitted = clamp(needed, minH, maxH);

      // لو قريب جدًا من min -> اعتبره نفس السناب
      const next =
        Math.abs(fitted - minH) <= 2
          ? [minH]
          : normalizeSnapHeights([minH, fitted]);

      // avoid endless loops
      const same =
        next.length === snaps.length &&
        next.every((v, i) => Math.abs(v - snaps[i]) <= 1);

      if (!same) setSnaps(next);
    };

    // frame to ensure layout settled
    const r = requestAnimationFrame(calc);
    return () => cancelAnimationFrame(r);
  }, [autoFit, dragMode, snaps, showChildren, panelRef, reduceMotion]);

  // keep snapIndex in range when snaps change
  useEffect(() => {
    const maxIdx = Math.max(0, snaps.length - 1);
    if (snapIndex > maxIdx) setSnapIndex(maxIdx);
  }, [snaps.length, snapIndex]);

  const minH = snaps[0] ?? collapsedHeight;
  const maxH = snaps[snaps.length - 1] ?? fullHeight;

  // Motion values (created per open because this component mounts only when open)
  const heightMV = useMotionValue<number>(snaps[snapIndex] ?? minH);
  const yMV = useMotionValue<number>(reduceMotion ? 0 : 24);

  const heightAnimRef = useRef<AnimationPlaybackControls | null>(null);
  const yAnimRef = useRef<AnimationPlaybackControls | null>(null);

  const stopAnims = () => {
    heightAnimRef.current?.stop?.();
    yAnimRef.current?.stop?.();
    heightAnimRef.current = null;
    yAnimRef.current = null;
  };

  // enter animation (y: 24 -> 0)
  useEffect(() => {
    stopAnims();
    heightMV.set(snaps[snapIndex] ?? minH);

    if (reduceMotion) {
      yMV.set(0);
      return;
    }
    yMV.set(24);
    yAnimRef.current = animate(yMV, 0, {
      type: "tween",
      duration: 0.18,
      ease: "easeOut",
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // snap to current snapIndex when it changes (or snaps change)
  const isDraggingRef = useRef(false);

  useEffect(() => {
    if (isDraggingRef.current) return;

    stopAnims();

    const target = snaps[snapIndex] ?? minH;

    if (reduceMotion) {
      heightMV.set(target);
      yMV.set(0);
      return;
    }

    heightAnimRef.current = animate(heightMV, target, {
      type: "tween",
      duration: 0.2,
      ease: [0.2, 0, 0, 1],
    });

    yAnimRef.current = animate(yMV, 0, {
      type: "tween",
      duration: 0.16,
      ease: "easeOut",
    });
  }, [snapIndex, snaps, minH, reduceMotion, heightMV, yMV]);

  // pointer drag state
  const dragRef = useRef<{
    pointerId: number;
    startY: number;
    startHeight: number;
    startIndex: number;
    lastY: number;
    lastT: number;
    velocityY: number;
  } | null>(null);

  const canDrag = isTop && !reduceMotion && (snaps.length > 1 || dragToClose);

  const onHandlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canDrag) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;

    stopAnims();
    isDraggingRef.current = true;

    e.currentTarget.setPointerCapture(e.pointerId);

    dragRef.current = {
      pointerId: e.pointerId,
      startY: e.clientY,
      startHeight: heightMV.get(),
      startIndex: snapIndexRef.current,
      lastY: e.clientY,
      lastT: performance.now(),
      velocityY: 0,
    };
  };

  const onHandlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    if (d.pointerId !== e.pointerId) return;

    const dy = e.clientY - d.startY;

    const now = performance.now();
    const dt = now - d.lastT;
    if (dt > 0) {
      d.velocityY = ((e.clientY - d.lastY) / dt) * 1000; // px/s
    }
    d.lastY = e.clientY;
    d.lastT = now;

    // Interactive behavior:
    // - up: height increases (y stays 0)
    // - down: height decreases until minH, then y increases (dismiss zone)
    const startH = d.startHeight;

    if (dy < 0) {
      yMV.set(0);
      heightMV.set(clamp(startH - dy, minH, maxH));
      return;
    }

    // dy >= 0 (drag down)
    const candidateH = startH - dy;
    if (candidateH >= minH) {
      yMV.set(0);
      heightMV.set(candidateH);
      return;
    }

    // below min -> translate down (dismiss)
    heightMV.set(minH);
    if (dragToClose) {
      const extra = dy - (startH - minH);
      yMV.set(Math.max(0, extra));
    } else {
      yMV.set(0);
    }
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    if (d.pointerId !== e.pointerId) return;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    dragRef.current = null;
    isDraggingRef.current = false;

    const dy = e.clientY - d.startY;
    const vy = d.velocityY;

    const currentY = yMV.get();
    const currentH = heightMV.get();

    // ✅ close condition: only if user entered dismiss zone (y>0)
    const DISMISS_VEL = 900;
    if (dragToClose && currentY > 0) {
      if (currentY >= thresholdDown || vy >= DISMISS_VEL) {
        onRequestClose();
        return;
      }
    }

    // choose snap
    const startIndex = d.startIndex;
    const nearest = snaps.length > 1 ? nearestSnapIndex(currentH, snaps) : 0;

    const SNAP_VEL = 650;
    let targetIndex = startIndex;

    // direction-based snap (feels natural)
    if (dy < -thresholdUp || vy <= -SNAP_VEL) {
      targetIndex = Math.max(
        nearest,
        Math.min(startIndex + 1, snaps.length - 1),
      );
    } else if (dy > thresholdDown || vy >= SNAP_VEL) {
      targetIndex = Math.min(nearest, Math.max(startIndex - 1, 0));
    } else {
      // small drag -> stick, otherwise nearest
      const tiny = Math.abs(dy) <= 6 && Math.abs(vy) <= 240;
      targetIndex = tiny ? startIndex : nearest;
    }

    targetIndex = clamp(targetIndex, 0, Math.max(0, snaps.length - 1));
    setSnapIndex(targetIndex);
  };

  return (
    <motion.div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      tabIndex={-1}
      dir={dir}
      className={className}
      style={{
        height: heightMV,
        maxHeight: Math.min(maxSheetHeight, maxH),
        y: yMV,
        willChange: "transform,height",
        contain: "layout paint",
      }}
      // exit: slide down out of viewport (important for drag-close)
      exit={
        reduceMotion
          ? { opacity: 1, y: 0 }
          : {
              opacity: 0.98,
              y: safeVH,
              transition: { duration: 0.18, ease: "easeIn" },
            }
      }
      initial={reduceMotion ? { opacity: 1 } : { opacity: 1 }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1 }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent" />

      {/* Drag Handle */}
      <div
        className="pt-3 pb-2 select-none"
        style={{ touchAction: "none" }}
        onPointerDown={onHandlePointerDown}
        onPointerMove={onHandlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div className="flex justify-center">
          <span className="block h-1.5 w-12 rounded-full bg-border-strong/40" />
        </div>
      </div>

      {/* Top bar / Header */}
      {sheetTopBar ? (
        <div className={cx("px-4 pb-2 select-none", sheetTopBarClassName)}>
          {sheetTopBar}
        </div>
      ) : (
        headerNode
      )}

      <div
        ref={contentRef}
        className={contentWrapperClass}
        style={{
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-y",
        }}
      >
        {showChildren ? children : loadingFallback}
      </div>

      {footer && <div className={footerClassName}>{footer}</div>}
    </motion.div>
  );
}
