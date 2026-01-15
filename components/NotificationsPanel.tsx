"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/utils/cn";

type Dir = "rtl" | "ltr";

type Props = {
  open: boolean;
  dir: Dir;
  panelRef: React.RefObject<HTMLDivElement | null>;
  style: { top: number; left: number; height: number; width: number };
};

export default function NotificationsPanel({
  open,
  dir,
  panelRef,
  style,
}: Props) {
  const reduceMotion = useReducedMotion();
  const isRTL = dir === "rtl";
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  // حركة خفيفة من داخل حدود الـ aside للخارج
  const fromX = reduceMotion ? 0 : isRTL ? 14 : -14;
  const toX = 0;

  const node = (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          dir={dir}
          role="dialog"
          aria-label="Notifications"
          tabIndex={-1}
          initial={{ opacity: 0, x: fromX }}
          animate={{ opacity: 1, x: toX }}
          exit={{ opacity: 0, x: fromX }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 430, damping: 36 }
          }
          style={{
            position: "fixed",
            top: style.top,
            left: style.left,
            height: style.height,
            width: style.width,
          }}
          className={cn(
            "z-50 overflow-hidden outline-none",
            // ✅ tokens (Light/Dark تلقائي)
            "bg-background-elevated text-foreground",
            "shadow-[var(--shadow-elevated)]",
            "border border-border-subtle",
            // ✅ إزالة border الملاصق للـ aside + rounding فقط للجهة الخارجية
            isRTL ? "rounded-l-2xl border-r-0" : "rounded-r-2xl border-l-0"
          )}
        >
          {/* الآن: container فقط */}
          <div className="h-full p-4">
            <div className="text-sm text-foreground-muted">
              Notifications panel
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(node, document.body);
}
