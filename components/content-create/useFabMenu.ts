// components\add-post\useFabMenu.ts
"use client";

import * as React from "react";

type UseFabMenuArgs = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  itemsCount: number;
};

export function useFabMenu({ open, setOpen, itemsCount }: UseFabMenuArgs) {
  const menuId = React.useId();
  const fabRef = React.useRef<HTMLButtonElement | null>(null);
  const itemRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

  const close = React.useCallback(() => setOpen(false), [setOpen]);
  const toggle = React.useCallback(() => setOpen((p) => !p), [setOpen]);

  const setItemRef = React.useCallback(
    (idx: number) => (el: HTMLButtonElement | null) => {
      itemRefs.current[idx] = el;
    },
    []
  );

  // Escape (فقط وقت ما القائمة مفتوحة)
  React.useEffect(() => {
    if (!open) return;

    const controller = new AbortController();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    window.addEventListener("keydown", onKeyDown, {
      signal: controller.signal,
    });
    return () => controller.abort();
  }, [open, close]);

  // Focus management
  React.useEffect(() => {
    if (!open) {
      fabRef.current?.focus();
      return;
    }

    const raf = window.requestAnimationFrame(() => {
      itemRefs.current[0]?.focus();
    });

    return () => window.cancelAnimationFrame(raf);
  }, [open]);

  // Scroll lock أثناء الفتح
  React.useEffect(() => {
    if (!open) return;

    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [open]);

  const onMenuKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!open) return;

      const focusables = itemRefs.current.filter(
        Boolean
      ) as HTMLButtonElement[];
      const len = Math.min(itemsCount, focusables.length);
      if (len === 0) return;

      const lastIndex = len - 1;
      const active = document.activeElement as HTMLElement | null;
      const currentIndex = focusables
        .slice(0, len)
        .findIndex((el) => el === active);

      const focusAt = (i: number) => focusables[i]?.focus();

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          const next = currentIndex < 0 ? 0 : (currentIndex + 1) % len;
          focusAt(next);
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          const prev =
            currentIndex < 0 ? lastIndex : (currentIndex - 1 + len) % len;
          focusAt(prev);
          break;
        }
        case "Home": {
          e.preventDefault();
          focusAt(0);
          break;
        }
        case "End": {
          e.preventDefault();
          focusAt(lastIndex);
          break;
        }
        case "Tab": {
          // Focus trap بسيط داخل عناصر القائمة
          const first = focusables[0];
          const last = focusables[lastIndex];

          if (e.shiftKey) {
            if (active === first || currentIndex === -1) {
              e.preventDefault();
              last.focus();
            }
          } else {
            if (active === last) {
              e.preventDefault();
              first.focus();
            }
          }
          break;
        }
        case "Escape": {
          e.preventDefault();
          close();
          break;
        }
      }
    },
    [open, close, itemsCount]
  );

  return {
    menuId,
    fabRef,
    itemRefs,
    setItemRef,
    close,
    toggle,
    onMenuKeyDown,
  };
}
