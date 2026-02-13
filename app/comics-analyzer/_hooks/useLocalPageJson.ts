"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AnalyzerPageJson } from "../types";

function safeParseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function useLocalPageJson(pageId: string) {
  const storageKey = useMemo(() => `comics-analyzer:page:${pageId}`, [pageId]);

  const [initialValue, setInitialValue] = useState<AnalyzerPageJson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(storageKey) : null;
    const parsed = safeParseJson<AnalyzerPageJson>(raw);
    setInitialValue(parsed);
    setLoading(false);
  }, [storageKey]);

  const save = useCallback(
    (value: AnalyzerPageJson) => {
      if (typeof window === "undefined") return;
      window.localStorage.setItem(storageKey, JSON.stringify(value));
    },
    [storageKey]
  );

  const clear = useCallback(() => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(storageKey);
  }, [storageKey]);

  return {
    storageKey,
    loading,
    initialValue,
    save,
    clear,
  };
}
