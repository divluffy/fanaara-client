"use client";

import * as React from "react";

export type Dir = "rtl" | "ltr";

export type AttachedPanelOptions = {
  dir: Dir;
  panelWidth?: number; // default 360
  overlapPx?: number; // default 1
  screenPaddingPx?: number; // default 12
  closeOnEscape?: boolean;
};

export type AttachedPanelPosition = {
  top: number;
  left: number;
  height: number;
  width: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function samePos(a: AttachedPanelPosition, b: AttachedPanelPosition) {
  return (
    a.top === b.top &&
    a.left === b.left &&
    a.height === b.height &&
    a.width === b.width
  );
}

export function useAttachedPanel({
  dir,
  panelWidth = 360,
  overlapPx = 1,
  screenPaddingPx = 12,
  closeOnEscape = true,
}: AttachedPanelOptions) {
  const [open, setOpen] = React.useState(false);

  // The element the panel attaches to (aside)
  const anchorRef = React.useRef<HTMLElement | null>(null);

  // The element that toggles the panel (notifications item wrapper/button)
  const triggerRef = React.useRef<HTMLElement | null>(null);

  // The panel itself
  const panelRef = React.useRef<HTMLDivElement | null>(null);

  const setAnchorRef = React.useCallback((node: HTMLElement | null) => {
    anchorRef.current = node;
  }, []);

  const setTriggerRef = React.useCallback((node: HTMLElement | null) => {
    triggerRef.current = node;
  }, []);

  const [pos, setPos] = React.useState<AttachedPanelPosition>(() => ({
    top: 0,
    left: 0,
    height: 0,
    width: panelWidth,
  }));

  const close = React.useCallback(() => setOpen(false), []);

  const rafMeasureId = React.useRef<number | null>(null);

  const measure = React.useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    const rect = anchor.getBoundingClientRect();

    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    // Width clamps to available viewport space
    const maxWidth = Math.max(0, viewportW - screenPaddingPx * 2);
    const width = clamp(panelWidth, 0, maxWidth);

    // Top/height clamps to viewport
    const rawTop = Math.round(rect.top);
    const top = clamp(
      rawTop,
      screenPaddingPx,
      Math.max(screenPaddingPx, viewportH - screenPaddingPx),
    );

    const maxHeight = Math.max(0, viewportH - top - screenPaddingPx);
    const height = clamp(Math.round(rect.height), 0, maxHeight);

    // LTR: panel on the right of anchor
    // RTL: panel on the left of anchor
    const rawLeft =
      dir === "rtl"
        ? Math.round(rect.left - width + overlapPx)
        : Math.round(rect.right - overlapPx);

    const left = clamp(
      rawLeft,
      screenPaddingPx,
      Math.max(screenPaddingPx, viewportW - width - screenPaddingPx),
    );

    const next = { top, left, height, width };
    setPos((prev) => (samePos(prev, next) ? prev : next));
  }, [dir, overlapPx, panelWidth, screenPaddingPx]);

  const scheduleMeasure = React.useCallback(() => {
    if (rafMeasureId.current != null) return;

    rafMeasureId.current = window.requestAnimationFrame(() => {
      rafMeasureId.current = null;
      measure();
    });
  }, [measure]);

  const openPanel = React.useCallback(() => {
    scheduleMeasure();
    setOpen(true);
  }, [scheduleMeasure]);

  const toggle = React.useCallback(() => {
    setOpen((prev) => {
      const next = !prev;
      if (!prev && next) scheduleMeasure(); // measure when opening
      return next;
    });
  }, [scheduleMeasure]);

  // Keep next open position correct when dir/width changes
  React.useLayoutEffect(() => {
    scheduleMeasure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dir, panelWidth]);

  // While open: follow resize/scroll/layout changes
  React.useEffect(() => {
    if (!open) return;

    measure();

    const onResize = () => scheduleMeasure();
    const onScroll = () => scheduleMeasure();

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);

    const ro = new ResizeObserver(() => scheduleMeasure());
    if (anchorRef.current) ro.observe(anchorRef.current);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
      ro.disconnect();
    };
  }, [open, measure, scheduleMeasure]);

  // Outside click + Escape
  React.useEffect(() => {
    if (!open) return;

    let rafCloseId: number | null = null;

    const scheduleClose = () => {
      if (rafCloseId != null) return;
      rafCloseId = window.requestAnimationFrame(() => {
        rafCloseId = null;
        close();
      });
    };

    const onPointerDownCapture = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;

      const panel = panelRef.current;
      const trigger = triggerRef.current;

      const path = (event.composedPath?.() ?? []) as EventTarget[];

      const insidePanel =
        !!panel && (path.includes(panel) || panel.contains(target));
      if (insidePanel) return;

      const insideTrigger =
        !!trigger && (path.includes(trigger) || trigger.contains(target));
      if (insideTrigger) return;

      scheduleClose();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (!closeOnEscape) return;
      if (event.key === "Escape") close();
    };

    document.addEventListener("pointerdown", onPointerDownCapture, true);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDownCapture, true);
      document.removeEventListener("keydown", onKeyDown);
      if (rafCloseId != null) cancelAnimationFrame(rafCloseId);
    };
  }, [open, close, closeOnEscape]);

  return {
    open,
    openPanel,
    toggle,
    close,
    setAnchorRef,
    setTriggerRef,
    panelRef,
    panelStyle: pos,
  };
}
