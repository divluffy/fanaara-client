"use client";

import { useSyncExternalStore } from "react";

/**
 * MediaQuery بدون اهتزازات على React 18/19 باستخدام useSyncExternalStore
 * defaultValue يستخدم على السيرفر أثناء SSR.
 */
export function useMediaQuery(query: string, defaultValue = false) {
  const getServerSnapshot = () => defaultValue;

  const getSnapshot = () => {
    if (typeof window === "undefined") return defaultValue;
    return window.matchMedia(query).matches;
  };

  const subscribe = (onStoreChange: () => void) => {
    if (typeof window === "undefined") return () => {};

    const mql = window.matchMedia(query);
    const handler = () => onStoreChange();

    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", handler);
      return () => mql.removeEventListener("change", handler);
    }

    // Safari legacy
    // @ts-expect-error legacy
    mql.addListener(handler);
    // @ts-expect-error legacy
    return () => mql.removeListener(handler);
  };

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
