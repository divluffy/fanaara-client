"use client";

import * as React from "react";
import {
  AnimatePresence,
  motion,
  type Transition,
  useReducedMotion,
} from "framer-motion";
import { IoAdd, IoCheckmarkCircle } from "react-icons/io5";

type FollowBurstButtonProps = {
  /** Required: target user id */
  userId: string;

  /** Controlled state */
  following?: boolean;
  /** Uncontrolled initial state */
  defaultFollowing?: boolean;

  disabled?: boolean;

  /** Button size in px (default is HALF of your old one) */
  size?: number;

  /**
   * API endpoint (POST) that accepts: { userId, follow }
   * TEMP: set to null to disable server request (local-only)
   */
  apiUrl?: string | null;

  /**
   * Alternative to apiUrl:
   * give your own request handler (connect to server later)
   */
  request?: (args: {
    userId: string;
    follow: boolean;
    signal?: AbortSignal;
  }) => Promise<void>;

  /** Burst FX on follow */
  burst?: boolean;

  /** Hide after successful follow (success icon -> soft fade -> collapse) */
  autoHideOnFollow?: boolean;

  /** Total delay before hide after follow (ms) */
  hideDelayMs?: number;

  /** Extra tiny hold of success state before hide (ms) */
  successHoldMs?: number;

  className?: string;

  ariaLabels?: {
    follow?: string;
    following?: string;
  };

  /** Optional: hook errors for toast */
  onError?: (err: unknown) => void;
};

const ICON_SPRING: Transition = {
  type: "spring",
  stiffness: 520,
  damping: 26,
  mass: 0.7,
};

const BUTTON_SPRING: Transition = {
  type: "spring",
  stiffness: 560,
  damping: 22,
  mass: 0.65,
};

const EXIT_TRANSITION: Transition = {
  duration: 0.42,
  ease: "easeInOut",
};

const BURST_PARTICLES = [
  { x: -26, y: -30, s: 1.35, d: 0.0, c: "var(--follow-pink,#ff4fd8)" },
  { x: 0, y: -40, s: 1.6, d: 0.03, c: "var(--follow-lime,#a3ff12)" },
  { x: 26, y: -30, s: 1.35, d: 0.06, c: "var(--follow-purple,#8b5cf6)" },

  { x: -38, y: 0, s: 1.35, d: 0.09, c: "var(--follow-lime,#a3ff12)" },
  { x: 38, y: 0, s: 1.35, d: 0.12, c: "var(--follow-pink,#ff4fd8)" },

  { x: -26, y: 30, s: 1.25, d: 0.15, c: "var(--follow-purple,#8b5cf6)" },
  { x: 0, y: 40, s: 1.45, d: 0.18, c: "var(--follow-lime,#a3ff12)" },
  { x: 26, y: 30, s: 1.25, d: 0.21, c: "var(--follow-pink,#ff4fd8)" },
] as const;

async function followRequest(
  apiUrl: string,
  userId: string,
  follow: boolean,
  signal?: AbortSignal,
) {
  const res = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    signal,
    body: JSON.stringify({ userId, follow }),
  });

  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.message) msg = data.message;
    } catch {}
    throw new Error(msg);
  }
}

export function FollowBurstButton({
  userId,
  following,
  defaultFollowing = false,
  disabled,
  size = 18, // ✅ نصف 36
  apiUrl = null, // ✅ مؤقتًا: local-only (اربطه لاحقًا)
  request,
  burst = true,
  autoHideOnFollow = true,
  hideDelayMs = 1200, // ✅ أخف/أسرع قليلًا مع زر أصغر
  successHoldMs = 180,
  className = "",
  ariaLabels,
  onError,
}: FollowBurstButtonProps) {
  const reduceMotion = useReducedMotion();

  const isControlled = typeof following === "boolean";
  const [internal, setInternal] = React.useState(defaultFollowing);

  // optimistic state
  const [optimistic, setOptimistic] = React.useState<boolean | null>(null);
  const [busy, setBusy] = React.useState(false);

  // burst state
  const [burstKey, setBurstKey] = React.useState(0);
  const [burstOn, setBurstOn] = React.useState(false);

  // success pulse (tiny highlight when switched to success)
  const [successPulse, setSuccessPulse] = React.useState(false);

  // hide state (soft fade -> collapse)
  const [hidden, setHidden] = React.useState(false);
  const hideTimerRef = React.useRef<number | null>(null);
  const pulseTimerRef = React.useRef<number | null>(null);

  // abort in-flight request
  const abortRef = React.useRef<AbortController | null>(null);

  const propValue = isControlled ? (following as boolean) : internal;
  const value = optimistic ?? propValue;

  const factor = size / 28;
  const particleSize = Math.max(4, Math.round(size * 0.14));
  const glowSize = Math.round(size * 0.7);

  React.useEffect(() => setOptimistic(null), [propValue]);

  React.useEffect(() => {
    if (!burstOn) return;
    const t = window.setTimeout(
      () => setBurstOn(false),
      reduceMotion ? 250 : 900,
    );
    return () => window.clearTimeout(t);
  }, [burstOn, reduceMotion]);

  React.useEffect(() => {
    return () => {
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
      if (pulseTimerRef.current) window.clearTimeout(pulseTimerRef.current);
      abortRef.current?.abort();
    };
  }, []);

  const setValue = (next: boolean) => {
    if (!isControlled) setInternal(next);
    setOptimistic(next);
  };

  const doRequest = React.useCallback(
    async (next: boolean, signal?: AbortSignal) => {
      if (request) return request({ userId, follow: next, signal });
      if (!apiUrl) return; // ✅ TEMP: local-only
      return followRequest(apiUrl, userId, next, signal);
    },
    [request, apiUrl, userId],
  );

  const handleToggle = async () => {
    if (disabled || busy || hidden) return;

    const next = !value;

    // 🎬 cinematic sequence only when turning ON (follow)
    if (next) {
      if (burst && !reduceMotion) {
        setBurstKey((k) => k + 1);
        setBurstOn(true);
      }

      // micro success pulse (helps icon transition feel “confirmed”)
      setSuccessPulse(true);
      if (pulseTimerRef.current) window.clearTimeout(pulseTimerRef.current);
      pulseTimerRef.current = window.setTimeout(
        () => setSuccessPulse(false),
        reduceMotion ? 100 : 260,
      );

      if (autoHideOnFollow) {
        if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = window.setTimeout(() => {
          // small hold so the success icon is actually seen
          window.setTimeout(() => setHidden(true), successHoldMs);
        }, hideDelayMs);
      }
    }

    setValue(next);

    try {
      setBusy(true);
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      await doRequest(next, abortRef.current.signal);
    } catch (err) {
      // revert
      if (next && autoHideOnFollow) {
        if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
        setHidden(false);
      }
      setValue(!next);
      onError?.(err);
    } finally {
      setBusy(false);
    }
  };

  const labelFollow = ariaLabels?.follow ?? "Follow";
  const labelFollowing = ariaLabels?.following ?? "Following";

  // ✅ أخف شادو + أصغر + cursor pointer
  const base =
    "relative inline-grid place-items-center rounded-full select-none " +
    "ring-1 ring-[color:var(--color-border-subtle)] " +
    "shadow-[0_8px_18px_rgba(0,0,0,0.16)] " + // ✅ أخف
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring-brand)] " +
    "focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-surface)] " +
    "cursor-pointer " + // ✅ requested
    "disabled:opacity-60 disabled:cursor-not-allowed";

  const notFollowingStyle =
    "bg-[color:var(--color-surface)] " +
    "text-[color:var(--follow-purple,#8b5cf6)] " +
    "hover:bg-[color:var(--follow-purple,#8b5cf6)] " +
    "hover:text-white " +
    "hover:ring-[color:var(--follow-purple,#8b5cf6)] " +
    "active:shadow-[0_7px_16px_rgba(139,92,246,0.18)]";

  const followingStyle =
    "bg-[color:var(--success-solid-bg,#16a34a)] " +
    "text-[color:var(--success-on-solid,#ffffff)] " +
    "ring-[color:var(--success-soft-border,#14532d)] " +
    "hover:bg-[color:var(--success-solid-bg,#16a34a)] " +
    "shadow-[0_9px_18px_rgba(34,197,94,0.14)]"; // ✅ أخف

  const plusSize = Math.round(size * 0.92);
  const checkSize = Math.round(size * 0.9);

  return (
    <AnimatePresence initial={false}>
      {!hidden && (
        <motion.button
          type="button"
          aria-label={value ? labelFollowing : labelFollow}
          aria-pressed={value}
          aria-busy={busy}
          disabled={disabled || busy}
          onClick={handleToggle}
          className={`${base} ${value ? followingStyle : notFollowingStyle} ${className}`}
          style={{ width: size, height: size }}
          whileHover={
            disabled
              ? undefined
              : reduceMotion
                ? undefined
                : { scale: 1.08, y: -0.5 }
          }
          whileTap={disabled ? undefined : { scale: 0.92 }}
          transition={BUTTON_SPRING}
          // ✅ “confirmed success” micro pulse
          animate={
            reduceMotion
              ? { scale: 1 }
              : successPulse
                ? {
                    scale: [1, 1.08, 1.02, 1],
                    transition: { duration: 0.35, ease: "easeOut" },
                  }
                : { scale: 1 }
          }
          // ✅ اختفاء ناعم + خفيف (focus: soft)
          exit={{
            scale: 0.25,
            opacity: 0,
            y: 1,
            filter: "blur(2px)",
            transition: EXIT_TRANSITION,
          }}
        >
          {/* Burst layer */}
          <AnimatePresence>
            {burstOn && (
              <motion.span
                key={`burst-${burstKey}`}
                className="pointer-events-none absolute inset-0"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Ring (soft) */}
                <motion.span
                  className="absolute inset-0 rounded-full"
                  style={{
                    boxShadow:
                      "0 0 0 2px var(--follow-lime,#a3ff12) inset, 0 0 18px rgba(163,255,18,0.45)",
                  }}
                  initial={{ scale: 0.7, opacity: 0.9 }}
                  animate={{ scale: 3.1, opacity: 0.0 }}
                  transition={{ duration: 0.85, ease: "easeOut" }}
                />

                {/* Ring #2 (delayed) */}
                <motion.span
                  className="absolute inset-0 rounded-full"
                  style={{
                    boxShadow:
                      "0 0 0 2px var(--follow-pink,#ff4fd8) inset, 0 0 20px rgba(255,79,216,0.45)",
                  }}
                  initial={{ scale: 0.85, opacity: 0.75 }}
                  animate={{ scale: 3.6, opacity: 0.0 }}
                  transition={{ duration: 0.9, ease: "easeOut", delay: 0.08 }}
                />

                {/* Particles */}
                {BURST_PARTICLES.map((p, i) => (
                  <motion.span
                    key={i}
                    className="absolute left-1/2 top-1/2 rounded-full will-change-transform"
                    style={{
                      width: particleSize,
                      height: particleSize,
                      marginLeft: -Math.round(particleSize / 2),
                      marginTop: -Math.round(particleSize / 2),
                      background: p.c,
                      filter: "drop-shadow(0 0 10px rgba(255,79,216,0.45))",
                    }}
                    initial={{ x: 0, y: 0, scale: 0.2, opacity: 0.0 }}
                    animate={{
                      x: p.x * factor,
                      y: p.y * factor,
                      scale: p.s,
                      opacity: [0.0, 1, 0.0],
                    }}
                    transition={{
                      duration: 0.85,
                      ease: "easeOut",
                      delay: p.d,
                    }}
                  />
                ))}

                {/* Soft glow core */}
                <motion.span
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    width: glowSize,
                    height: glowSize,
                    background:
                      "radial-gradient(circle, var(--follow-pink,#ff4fd8) 0%, rgba(255,79,216,0.0) 72%)",
                    filter: "blur(2.5px)",
                  }}
                  initial={{ scale: 0.6, opacity: 0.0 }}
                  animate={{ scale: 1.9, opacity: 0.85 }}
                  transition={{ duration: 0.55, ease: "easeOut" }}
                />
              </motion.span>
            )}
          </AnimatePresence>

          {/* ✅ ICON TRANSITION: add -> success (واضح جدًا) */}
          <AnimatePresence mode="wait" initial={false}>
            {value ? (
              <motion.span
                key="success"
                className="relative z-10 grid place-items-center"
                style={{ filter: "drop-shadow(0 0 10px rgba(34,197,94,0.35))" }}
                initial={{ scale: 0.2, y: 6, opacity: 0, rotate: -20 }}
                animate={{ scale: 1.02, y: 0, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.7, opacity: 0, y: -4 }}
                transition={ICON_SPRING}
              >
                <IoCheckmarkCircle size={checkSize} />
              </motion.span>
            ) : (
              <motion.span
                key="add"
                className="relative z-10 grid place-items-center"
                style={{
                  filter: "drop-shadow(0 0 10px rgba(139,92,246,0.35))",
                }}
                initial={{ scale: 1, opacity: 1, rotate: 0 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                // ✅ خروج الأيقونة باتجاه خفيف (يساعد إحساس التحول للنجاح)
                exit={{ scale: 0.2, opacity: 0, y: -6, rotate: 35 }}
                transition={ICON_SPRING}
              >
                <IoAdd size={plusSize} />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
