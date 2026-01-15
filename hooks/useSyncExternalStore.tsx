"use client";

import { useSyncExternalStore } from "react";

function useMediaQuery(query: string, fallback = false) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => fallback
  );
}

// ✅ Tailwind md breakpoint
export function useIsMobile() {
  return useMediaQuery("(max-width: 767px)", false);
}
