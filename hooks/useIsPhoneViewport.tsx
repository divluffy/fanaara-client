"use client";

import { useEffect, useState } from "react";

/**
 * Tailwind default md breakpoint = 768px (min-width: 768px)
 * So phone is < 768px => max-width: 767.98px
 */
const PHONE_QUERY = "(max-width: 767.98px)";

export function useIsPhoneViewport(initial: boolean) {
  const [isPhone, setIsPhone] = useState<boolean>(initial);

  useEffect(() => {
    // Safety: only run in browser
    if (typeof window === "undefined") return;

    const mql = window.matchMedia(PHONE_QUERY);

    // Sync once on mount
    setIsPhone(mql.matches);

    const onChange = (e: MediaQueryListEvent) => setIsPhone(e.matches);

    // Modern browsers
    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    }

    // Fallback (older Safari)
    // @ts-expect-error - legacy API
    mql.addListener(onChange);
    // @ts-expect-error - legacy API
    return () => mql.removeListener(onChange);
  }, []);

  return isPhone;
}
