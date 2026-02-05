// components\modal\hooks.ts
"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { getFocusable } from "../utils/modal";

export function useMediaQuery(query: string) {
  const [match, setMatch] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const m = window.matchMedia(query);
    const onChange = () => setMatch(m.matches);
    onChange();
    m.addEventListener?.("change", onChange);
    return () => m.removeEventListener?.("change", onChange);
  }, [query]);

  return match;
}

export function usePortalRoot(id = "modal-root") {
  const [root, setRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const el = document.getElementById(id);
    if (el) setRoot(el);
    else setRoot(document.body);
  }, [id]);

  return root;
}

export function useFocusTrap(opts: {
  enabled: boolean;
  containerEl: HTMLElement | null;
  restoreFocus?: boolean;
  initialFocus?: "first" | "container";
}) {
  const {
    enabled,
    containerEl,
    restoreFocus = true,
    initialFocus = "first",
  } = opts;

  useEffect(() => {
    if (!enabled || !containerEl) return;

    const lastActive = document.activeElement as HTMLElement | null;

    const t = window.setTimeout(() => {
      const focusables = getFocusable(containerEl);
      if (initialFocus === "container") containerEl.focus();
      else if (focusables[0]) focusables[0].focus();
      else containerEl.focus();
    }, 0);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusables = getFocusable(containerEl);
      if (!focusables.length) {
        e.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement;

      if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);

    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKeyDown, true);
      if (restoreFocus) lastActive?.focus?.();
    };
  }, [enabled, containerEl, restoreFocus, initialFocus]);
}

export function useVisualViewportHeight() {
  const [h, setH] = useState<number>(0);

  useEffect(() => {
    const vv = window.visualViewport;
    const calc = () => setH(Math.round(vv?.height ?? window.innerHeight));
    calc();

    vv?.addEventListener("resize", calc);
    window.addEventListener("resize", calc);

    return () => {
      vv?.removeEventListener("resize", calc);
      window.removeEventListener("resize", calc);
    };
  }, []);

  return h;
}

export function useSortedSnapPoints(input?: number[]) {
  return useMemo(() => {
    const base = input?.length ? input : [0.33, 0.66, 0.92];
    const cleaned = base
      .map((x) => Math.max(0.2, Math.min(0.98, x)))
      .sort((a, b) => a - b);

    return Array.from(new Set(cleaned.map((x) => Number(x.toFixed(3)))));
  }, [input]);
}


/**
 * ✅ Back ثابت:
 * - Push واحد لكل مودل (Top).
 * - Back مرة واحدة يغلق أعلى مودل فقط.
 * - إغلاق بزر/سحب => ينفذ Pop للـ entry الصحيح (بدون تراكم => بدون Back مرتين).
 * - لو مودل أُغلق وهو غير Top (فيه مودل فوقه) نحفظ token كـ stale
 *   ونقوم بتخطيه تلقائيًا عندما نصل له لاحقًا.
 */
export function useMobileBackClose(opts: {
  open: boolean;
  enabled: boolean;
  isTop: boolean;
  id: string;
  onClose: () => void;
}) {
  const { open, enabled, isTop, id, onClose } = opts;

  const tokenRef = useRef<string | null>(null);
  const pushedLenRef = useRef<number | null>(null);
  const staleTokensRef = useRef<string[]>([]);
  const ignoreNextPopRef = useRef(false);
  const closedByPopRef = useRef(false);
  const baseUrlRef = useRef<string>("");

  const latestRef = useRef({ open, enabled, isTop, onClose });
  useEffect(() => {
    latestRef.current = { open, enabled, isTop, onClose };
  }, [open, enabled, isTop, onClose]);

  // global popstate listener
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    if (!enabled) return;

    const onPopState = (e: PopStateEvent) => {
      if (ignoreNextPopRef.current) {
        ignoreNextPopRef.current = false;
        return;
      }

      const cur = latestRef.current;
      const st = e.state as any;

      // 1) Back while top modal open => close it
      if (cur.enabled && cur.open && cur.isTop && tokenRef.current) {
        closedByPopRef.current = true;
        tokenRef.current = null;
        pushedLenRef.current = null;
        cur.onClose();
        return;
      }

      // 2) landed on stale modal entry => auto-skip it (no extra back)
      const tok = st?.__modalToken as string | undefined;
      if (tok && staleTokensRef.current.includes(tok)) {
        staleTokensRef.current = staleTokensRef.current.filter(
          (t) => t !== tok,
        );
        ignoreNextPopRef.current = true;
        setTimeout(() => {
          try {
            history.back();
          } catch {
            // ignore
          }
        }, 0);
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [enabled]);

  // push history entry when modal is open + top
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    if (!enabled) return;
    if (!open) return;
    if (!isTop) return;

    if (tokenRef.current) return;

    baseUrlRef.current = window.location.href.split("#")[0];

    const token = `${id}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    tokenRef.current = token;
    closedByPopRef.current = false;

    const baseState =
      history.state && typeof history.state === "object" ? history.state : {};
    const prevDepth = (baseState as any).__modalDepth ?? 0;
    const depth = prevDepth + 1;

    try {
      history.pushState(
        {
          ...(baseState as any),
          __modal: true,
          __modalToken: token,
          __modalDepth: depth,
        },
        "",
        baseUrlRef.current,
      );
      pushedLenRef.current = history.length;
    } catch {
      tokenRef.current = null;
      pushedLenRef.current = null;
    }
  }, [open, enabled, isTop, id]);

  // close by UI/drag: remove our entry if it's still the latest pushed
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!enabled) return;

    if (open) return;

    const token = tokenRef.current;
    const pushedLen = pushedLenRef.current;

    if (!token || !pushedLen) {
      closedByPopRef.current = false;
      return;
    }

    // closed by back already -> nothing to do
    if (closedByPopRef.current) {
      closedByPopRef.current = false;
      tokenRef.current = null;
      pushedLenRef.current = null;
      return;
    }

    if (history.length === pushedLen) {
      ignoreNextPopRef.current = true;
      tokenRef.current = null;
      pushedLenRef.current = null;

      try {
        history.back();
      } catch {
        // ignore
      }
      return;
    }

    staleTokensRef.current = Array.from(
      new Set([...staleTokensRef.current, token]),
    );
    tokenRef.current = null;
    pushedLenRef.current = null;
  }, [open, enabled]);
}
