// hooks/useHideBarsOnScroll.ts
"use client";

import { useEffect, useRef, useState } from "react";

type Options = {
  enabled?: boolean;
  threshold?: number; // px
  minY?: number; // px: do not hide near top
  resetKey?: string | number;
};

export function useHideBarsOnScroll({
  enabled = true,
  threshold = 14,
  minY = 80,
  resetKey,
}: Options) {
  const [hidden, setHidden] = useState(false);

  const lastY = useRef(0);
  const ticking = useRef(false);

  // Reset on route change (or any reset key)
  useEffect(() => {
    setHidden(false);
  }, [resetKey]);

  useEffect(() => {
    if (!enabled) {
      setHidden(false);
      return;
    }

    lastY.current = window.scrollY || 0;

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        const delta = y - lastY.current;

        // Always show near top
        if (y <= minY) {
          setHidden(false);
          lastY.current = y;
          ticking.current = false;
          return;
        }

        if (Math.abs(delta) >= threshold) {
          // down => hide, up => show
          setHidden(delta > 0);
          lastY.current = y;
        }

        ticking.current = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [enabled, threshold, minY]);

  return hidden;
}
