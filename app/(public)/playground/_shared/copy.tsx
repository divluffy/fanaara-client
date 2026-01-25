// app/(public)/playground/_shared/copy.tsx
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/utils/cn";

export async function copyToClipboard(text: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fallback below
  }

  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "true");
    el.style.position = "fixed";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

export function useCopyToast(ms = 1200) {
  const [toast, setToast] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  const show = useCallback(
    (
      ok: boolean,
      successText = "✅ تم نسخ الكود",
      failText = "❌ فشل النسخ",
    ) => {
      setToast(ok ? successText : failText);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setToast(null), ms);
    },
    [ms],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  return { toast, show };
}

export function Toast({ text }: { text: string }) {
  return (
    <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full border border-border-subtle bg-background-elevated/95 px-4 py-2 text-xs text-foreground shadow-[var(--shadow-md)]">
      {text}
    </div>
  );
}

export function CopyWrap({
  code,
  onCopied,
  children,
  className,
}: {
  code: string;
  onCopied: (ok: boolean) => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      role="button"
      tabIndex={0}
      aria-label="Copy JSX"
      title="اضغط للنسخ"
      className={cn("inline-flex", className)}
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        onCopied(await copyToClipboard(code));
      }}
      onKeyDown={async (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onCopied(await copyToClipboard(code));
        }
      }}
    >
      {children}
    </span>
  );
}
