"use client";

import * as React from "react";

type Dir = "rtl" | "ltr";

type Options = {
  dir: Dir;
  panelWidth?: number; // default 350
  overlapPx?: number;  // default 1 (يغطي border بين aside والpanel)
  closeOnEscape?: boolean;
};

type PanelPos = {
  top: number;
  left: number;
  height: number;
  width: number;
};

export function useAttachedPanel({
  dir,
  panelWidth = 350,
  overlapPx = 1,
  closeOnEscape = true,
}: Options) {
  const [open, setOpen] = React.useState(false);

  // anchor: aside نفسه (لأننا نريد الالتصاق الحقيقي)
  const asideRef = React.useRef<HTMLElement | null>(null);

  // trigger: فقط زر الإشعارات (أو wrapper له) حتى لا يُغلق عند الضغط عليه
  const triggerRef = React.useRef<HTMLElement | null>(null);

  // panel
  const panelRef = React.useRef<HTMLDivElement | null>(null);

  const [pos, setPos] = React.useState<PanelPos>(() => ({
    top: 0,
    left: 0,
    height: 0,
    width: panelWidth,
  }));

  const close = React.useCallback(() => setOpen(false), []);
  const toggle = React.useCallback(() => setOpen((p) => !p), []);

  const rafMeasure = React.useRef<number | null>(null);

  const measure = React.useCallback(() => {
    const aside = asideRef.current;
    if (!aside) return;

    const rect = aside.getBoundingClientRect();
    const width = panelWidth;

    const top = Math.round(rect.top);
    const height = Math.round(rect.height);

    // LTR: panel على يمين aside
    // RTL: panel على يسار aside
    const rawLeft =
      dir === "rtl"
        ? Math.round(rect.left - width + overlapPx)
        : Math.round(rect.right - overlapPx);

    // clamp (احتياطي لو الشاشة ضيقة)
    const maxLeft = Math.max(0, window.innerWidth - width);
    const left = Math.min(Math.max(0, rawLeft), maxLeft);

    setPos({ top, left, height, width });
  }, [dir, panelWidth, overlapPx]);

  const scheduleMeasure = React.useCallback(() => {
    if (rafMeasure.current != null) return;
    rafMeasure.current = window.requestAnimationFrame(() => {
      rafMeasure.current = null;
      measure();
    });
  }, [measure]);

  // قياس أولي + عند تغيير dir/عرض
  React.useLayoutEffect(() => {
    scheduleMeasure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dir, panelWidth]);

  // أثناء الفتح: راقب resize/scroll/تغير حجم aside
  React.useEffect(() => {
    if (!open) return;

    measure();

    const onResize = () => scheduleMeasure();
    const onScroll = () => scheduleMeasure();

    window.addEventListener("resize", onResize);
    // true حتى يلتقط scroll داخل أي container
    window.addEventListener("scroll", onScroll, true);

    const ro = new ResizeObserver(() => scheduleMeasure());
    if (asideRef.current) ro.observe(asideRef.current);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
      ro.disconnect();
    };
  }, [open, measure, scheduleMeasure]);

  // click outside + escape (بدون كسر تفاعل الضغط بالخارج)
  React.useEffect(() => {
    if (!open) return;

    let rafClose: number | null = null;

    const scheduleClose = () => {
      if (rafClose != null) return;
      // يغلق بعد ما التفاعل ينفذ طبيعي
      rafClose = window.requestAnimationFrame(() => {
        rafClose = null;
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
      const insideTrigger =
        !!trigger && (path.includes(trigger) || trigger.contains(target));

      // داخل panel: لا تغلق
      if (insidePanel) return;

      // ضغط على trigger: لا تعتبره خارج (الزر نفسه مسؤول عن toggle)
      if (insideTrigger) return;

      // أي مكان آخر (حتى داخل aside أو داخل الصفحة): اغلق
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
      if (rafClose != null) cancelAnimationFrame(rafClose);
    };
  }, [open, close, closeOnEscape]);

  return {
    open,
    toggle,
    close,
    asideRef,
    triggerRef,
    panelRef,
    panelStyle: pos,
  };
}
