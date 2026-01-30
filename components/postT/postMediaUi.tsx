"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Dir } from "@/types";
import { cn } from "@/utils/cn";

export function countryCodeToFlagEmoji(code?: string) {
  const c = (code || "").trim().toUpperCase();
  if (c.length !== 2) return "🏳️";
  const A = 0x1f1e6;
  const offset = "A".charCodeAt(0);
  return String.fromCodePoint(
    A + (c.charCodeAt(0) - offset),
    A + (c.charCodeAt(1) - offset),
  );
}

export function CountryBadge({
  direction,
  countryCode,
}: {
  direction: Dir;
  countryCode?: string;
}) {
  if (!countryCode) return null;
  const flag = countryCodeToFlagEmoji(countryCode);
  const text = direction === "rtl" ? `نُشر من ` : `Posted from `;

  return (
    <div
      className={[
        "absolute top-1 z-20",
        direction === "rtl" ? "right-1" : "left-1",
      ].join(" ")}
    >
      <div
        className="
          inline-flex items-center gap-2 rounded-full px-3 py-1
          text-[9px] font-semibold text-white
          bg-black/45 backdrop-blur border border-white/10
          shadow-[0_10px_30px_rgba(0,0,0,0.35)]
        "
        dir={direction}
      >
        <span className="opacity-70">{text}</span>
        <span className="text-[13px] leading-none">{flag}</span>
      </div>
    </div>
  );
}

export function LikedIndicator({
  direction,
  show,
}: {
  direction: Dir;
  show: boolean;
}) {
  if (!show) return null;

  return (
    <div
      className={cn(
        "absolute top-2 z-20",
        direction === "rtl" ? "left-2" : "right-2",
      )}
    >
      <div
        className="
          inline-flex items-center gap-2 rounded-full px-3 py-1
          text-[11px] font-semibold
          bg-pink-500/20 border border-pink-400/25
          text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)]
          backdrop-blur
        "
      >
        <span className="text-pink-300">❤</span>
        <span className="opacity-95">
          {direction === "rtl" ? "أُعجبني" : "Liked"}
        </span>
      </div>
    </div>
  );
}

export function HeartPopup({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          className="absolute inset-0 z-30 grid place-items-center pointer-events-none"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: [0.7, 1.15, 1] }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.42 }}
        >
          <motion.div
            initial={{ rotate: -6 }}
            animate={{ rotate: [0, 6, 0] }}
            transition={{ duration: 0.42 }}
            className="text-pink-300 drop-shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-20 h-20 fill-current"
              aria-hidden="true"
            >
              <path d="M12 21s-7-4.35-9.33-8.36C.93 9.36 2.28 6.5 5.2 5.55c1.7-.55 3.5.05 4.8 1.35 1.3-1.3 3.1-1.9 4.8-1.35 2.92.95 4.27 3.81 2.53 7.09C19 16.65 12 21 12 21z" />
            </svg>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
