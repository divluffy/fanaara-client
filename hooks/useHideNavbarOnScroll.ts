"use client";

import { useEffect, useRef, useState } from "react";

type Options = {
  minDelta?: number;
  hideAfter?: number;
};

export function useHideNavbarOnScroll(enabled: boolean, opts: Options = {}) {
  const { minDelta = 6, hideAfter = 14 } = opts;

  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    if (!enabled) {
      setHidden(false);
      return;
    }
    if (typeof window === "undefined") return;

    lastY.current = window.scrollY;

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY.current;

        // أعلى الصفحة: الناف ظاهر دائمًا
        if (y <= 0) {
          setHidden(false);
          lastY.current = y;
          ticking.current = false;
          return;
        }

        if (Math.abs(delta) >= minDelta) {
          if (delta > 0 && y > hideAfter) setHidden(true); // نزول
          if (delta < 0) setHidden(false); // طلوع
        }

        lastY.current = y;
        ticking.current = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [enabled, minDelta, hideAfter]);

  return hidden;
}
