"use client";

import { DependencyList, useEffect } from "react";

export function useDebouncedEffect(effect: () => void, deps: DependencyList, delayMs: number) {
  useEffect(() => {
    const t = window.setTimeout(() => effect(), delayMs);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
