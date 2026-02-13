// components\ui\FollowBurstButton.tsx
"use client";

import * as React from "react";
import {
  AnimatePresence,
  motion,
  type Transition,
  useReducedMotion,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { IoAdd } from "react-icons/io5";

type FollowBurstButtonProps = {
  userId: string;

  following?: boolean;
  defaultFollowing?: boolean;

  disabled?: boolean;
  size?: number;

  apiUrl?: string | null;
  request?: (args: {
    userId: string;
    follow: boolean;
    signal?: AbortSignal;
  }) => Promise<void>;

  burst?: boolean;
  autoHideOnFollow?: boolean;
  hideDelayMs?: number;
  successHoldMs?: number;

  className?: string;

  ariaLabels?: {
    follow?: string;
    following?: string;
  };

  onError?: (err: unknown) => void;

  /** ✨ V2 extras */
  magnetic?: boolean; // subtle cursor attraction
  shimmer?: boolean; // anime sweep highlight on follow
  ripple?: boolean; // click ripple
  idlePulse?: boolean; // subtle breathing when not following
  showSpinner?: boolean; // show loading spinner while request in flight
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
  { x: 0, y: -42, s: 1.7, d: 0.03, c: "var(--follow-lime,#a3ff12)" },
  { x: 26, y: -30, s: 1.35, d: 0.06, c: "var(--follow-purple,#8b5cf6)" },

  { x: -40, y: 0, s: 1.35, d: 0.09, c: "var(--follow-lime,#a3ff12)" },
  { x: 40, y: 0, s: 1.35, d: 0.12, c: "var(--follow-pink,#ff4fd8)" },

  { x: -26, y: 30, s: 1.25, d: 0.15, c: "var(--follow-purple,#8b5cf6)" },
  { x: 0, y: 42, s: 1.55, d: 0.18, c: "var(--follow-lime,#a3ff12)" },
  { x: 26, y: 30, s: 1.25, d: 0.21, c: "var(--follow-pink,#ff4fd8)" },
] as const;

const SPARKLES = [
  { x: -18, y: -18, r: 25, d: 0.02, c: "rgba(255,255,255,0.95)" },
  { x: 18, y: -16, r: -20, d: 0.06, c: "rgba(255,255,255,0.85)" },
  { x: -16, y: 18, r: -15, d: 0.1, c: "rgba(255,255,255,0.9)" },
  { x: 16, y: 18, r: 18, d: 0.14, c: "rgba(255,255,255,0.8)" },
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

function Spinner({ size }: { size: number }) {
  const stroke = Math.max(2, Math.round(size * 0.12));
  const r = Math.max(6, Math.round(size * 0.34));
  const box = r * 2 + stroke * 2;
  return (
    <motion.svg
      width={box}
      height={box}
      viewBox={`0 0 ${box} ${box}`}
      className="block"
      aria-hidden="true"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <motion.circle
        cx={box / 2}
        cy={box / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.25}
        strokeWidth={stroke}
      />
      <motion.circle
        cx={box / 2}
        cy={box / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${Math.PI * 2 * r * 0.66} ${Math.PI * 2 * r}`}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.75, ease: "linear" }}
        style={{ transformOrigin: "50% 50%" }}
      />
    </motion.svg>
  );
}

function CheckDraw({ size }: { size: number }) {
  const s = Math.max(14, Math.round(size * 1.05));
  const stroke = Math.max(2, Math.round(size * 0.12));
  return (
    <motion.svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="block"
    >
      <motion.circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.28"
        strokeWidth={stroke}
        initial={{ pathLength: 0.2, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
      />
      <motion.path
        d="M8 12.5l2.6 2.6L16.8 9"
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.32, ease: "easeOut", delay: 0.05 }}
      />
    </motion.svg>
  );
}

export function FollowBurstButton({
  userId,
  following,
  defaultFollowing = false,
  disabled,
  size = 18,

  apiUrl = null,
  request,

  burst = true,
  autoHideOnFollow = true,
  hideDelayMs = 1150,
  successHoldMs = 180,

  className = "",
  ariaLabels,
  onError,

  magnetic = true,
  shimmer = true,
  ripple = true,
  idlePulse = true,
  showSpinner = true,
}: FollowBurstButtonProps) {
  const reduceMotion = useReducedMotion();

  const isControlled = typeof following === "boolean";
  const [internal, setInternal] = React.useState(defaultFollowing);

  const [optimistic, setOptimistic] = React.useState<boolean | null>(null);
  const [busy, setBusy] = React.useState(false);

  // FX states
  const [burstKey, setBurstKey] = React.useState(0);
  const [burstOn, setBurstOn] = React.useState(false);

  const [rippleKey, setRippleKey] = React.useState(0);
  const [rippleOn, setRippleOn] = React.useState(false);

  const [shineKey, setShineKey] = React.useState(0);
  const [shineOn, setShineOn] = React.useState(false);

  const [successPulse, setSuccessPulse] = React.useState(false);

  // hide state
  const [hidden, setHidden] = React.useState(false);
  const hideTimerRef = React.useRef<number | null>(null);
  const pulseTimerRef = React.useRef<number | null>(null);

  // abort in-flight request
  const abortRef = React.useRef<AbortController | null>(null);

  const propValue = isControlled ? (following as boolean) : internal;
  const value = optimistic ?? propValue;

  // if parent flips to "not following", ensure it's visible again
  React.useEffect(() => {
    if (!propValue) setHidden(false);
    setOptimistic(null);
  }, [propValue]);

  React.useEffect(() => {
    if (!burstOn) return;
    const t = window.setTimeout(
      () => setBurstOn(false),
      reduceMotion ? 180 : 900,
    );
    return () => window.clearTimeout(t);
  }, [burstOn, reduceMotion]);

  React.useEffect(() => {
    if (!rippleOn) return;
    const t = window.setTimeout(
      () => setRippleOn(false),
      reduceMotion ? 140 : 420,
    );
    return () => window.clearTimeout(t);
  }, [rippleOn, reduceMotion]);

  React.useEffect(() => {
    if (!shineOn) return;
    const t = window.setTimeout(
      () => setShineOn(false),
      reduceMotion ? 160 : 520,
    );
    return () => window.clearTimeout(t);
  }, [shineOn, reduceMotion]);

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
      if (!apiUrl) return; // local-only
      return followRequest(apiUrl, userId, next, signal);
    },
    [request, apiUrl, userId],
  );

  // --- Magnetic hover (motion values)
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 520, damping: 34, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 520, damping: 34, mass: 0.6 });

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (reduceMotion || !magnetic || disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - (rect.left + rect.width / 2);
    const py = e.clientY - (rect.top + rect.height / 2);
    const max = Math.max(1, size * 0.22); // clamp
    mx.set(Math.max(-max, Math.min(max, px * 0.12)));
    my.set(Math.max(-max, Math.min(max, py * 0.12)));
  };

  const onPointerLeave = () => {
    mx.set(0);
    my.set(0);
  };

  const handleToggle = async () => {
    if (disabled || busy || hidden) return;

    // local click ripple (even for unfollow)
    if (ripple && !reduceMotion) {
      setRippleKey((k) => k + 1);
      setRippleOn(true);
    }

    const next = !value;

    // cinematic only when turning ON
    if (next) {
      if (burst && !reduceMotion) {
        setBurstKey((k) => k + 1);
        setBurstOn(true);
      }
      if (shimmer && !reduceMotion) {
        setShineKey((k) => k + 1);
        setShineOn(true);
      }

      setSuccessPulse(true);
      if (pulseTimerRef.current) window.clearTimeout(pulseTimerRef.current);
      pulseTimerRef.current = window.setTimeout(
        () => setSuccessPulse(false),
        reduceMotion ? 90 : 260,
      );

      if (autoHideOnFollow) {
        if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = window.setTimeout(() => {
          window.setTimeout(() => setHidden(true), successHoldMs);
        }, hideDelayMs);
      }
    } else {
      // unfollow: cancel any pending hide
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
      setHidden(false);
    }

    setValue(next);

    try {
      setBusy(true);
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      await doRequest(next, abortRef.current.signal);
    } catch (err) {
      // revert + cancel hide if it was scheduled
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
      setHidden(false);
      setValue(!next);
      onError?.(err);
    } finally {
      setBusy(false);
    }
  };

  const labelFollow = ariaLabels?.follow ?? "Follow";
  const labelFollowing = ariaLabels?.following ?? "Following";

  const factor = size / 28;
  const particleSize = Math.max(4, Math.round(size * 0.14));
  const glowSize = Math.round(size * 0.78);

  const base =
    "relative inline-grid place-items-center rounded-full select-none " +
    "ring-1 ring-[color:var(--color-border-subtle)] " +
    "shadow-[0_8px_18px_rgba(0,0,0,0.16)] " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring-brand)] " +
    "focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-surface)] " +
    "cursor-pointer " +
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
    "shadow-[0_9px_18px_rgba(34,197,94,0.14)]";

  const plusSize = Math.round(size * 0.92);

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
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
          data-state={value ? "following" : "idle"}
          className={`${base} ${value ? followingStyle : notFollowingStyle} ${className}`}
          style={{
            width: size,
            height: size,
            x: reduceMotion ? 0 : sx,
            y: reduceMotion ? 0 : sy,
          }}
          whileHover={
            disabled || reduceMotion ? undefined : { scale: 1.09, y: -0.75 }
          }
          whileTap={disabled ? undefined : { scale: 0.92 }}
          transition={BUTTON_SPRING}
          animate={
            reduceMotion
              ? { scale: 1 }
              : successPulse
                ? {
                    scale: [1, 1.1, 1.03, 1],
                    transition: { duration: 0.36, ease: "easeOut" },
                  }
                : { scale: 1 }
          }
          exit={{
            scale: 0.25,
            opacity: 0,
            y: 1,
            filter: "blur(2px)",
            transition: EXIT_TRANSITION,
          }}
        >
          {/* Aura (anime glow) */}
          {!reduceMotion && (
            <motion.span
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{
                boxShadow: value
                  ? "0 0 18px rgba(34,197,94,0.28)"
                  : "0 0 18px rgba(139,92,246,0.22)",
              }}
              initial={{ opacity: 0 }}
              animate={{
                opacity: value ? 0.95 : 0.85,
              }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            />
          )}

          {/* Idle pulse (subtle breathing) */}
          {!reduceMotion && idlePulse && !value && !busy && (
            <motion.span
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{
                boxShadow: "0 0 0 2px rgba(139,92,246,0.18) inset",
              }}
              animate={{
                opacity: [0.35, 0.65, 0.35],
                scale: [1, 1.06, 1],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}

          {/* Ripple */}
          <AnimatePresence>
            {rippleOn && !reduceMotion && (
              <motion.span
                key={`ripple-${rippleKey}`}
                className="pointer-events-none absolute inset-0 rounded-full"
                initial={{ opacity: 0.55, scale: 0.45 }}
                animate={{ opacity: 0, scale: 2.2 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.42, ease: "easeOut" }}
                style={{
                  boxShadow: value
                    ? "0 0 0 2px rgba(34,197,94,0.35) inset"
                    : "0 0 0 2px rgba(139,92,246,0.35) inset",
                }}
              />
            )}
          </AnimatePresence>

          {/* Shimmer sweep */}
          <AnimatePresence>
            {shineOn && !reduceMotion && (
              <motion.span
                key={`shine-${shineKey}`}
                className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.span
                  className="absolute top-1/2 h-[140%] w-[60%] -translate-y-1/2 rotate-[20deg]"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 45%, rgba(255,255,255,0) 100%)",
                    filter: "blur(0.5px)",
                    left: "-70%",
                  }}
                  initial={{ x: 0, opacity: 0.0 }}
                  animate={{ x: "260%", opacity: [0.0, 1, 0.0] }}
                  transition={{ duration: 0.52, ease: "easeOut" }}
                />
              </motion.span>
            )}
          </AnimatePresence>

          {/* Burst layer (follow ON) */}
          <AnimatePresence>
            {burstOn && !reduceMotion && (
              <motion.span
                key={`burst-${burstKey}`}
                className="pointer-events-none absolute inset-0"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Dual ring */}
                <motion.span
                  className="absolute inset-0 rounded-full"
                  style={{
                    boxShadow:
                      "0 0 0 2px var(--follow-lime,#a3ff12) inset, 0 0 18px rgba(163,255,18,0.45)",
                  }}
                  initial={{ scale: 0.7, opacity: 0.9 }}
                  animate={{ scale: 3.2, opacity: 0.0 }}
                  transition={{ duration: 0.85, ease: "easeOut" }}
                />
                <motion.span
                  className="absolute inset-0 rounded-full"
                  style={{
                    boxShadow:
                      "0 0 0 2px var(--follow-pink,#ff4fd8) inset, 0 0 22px rgba(255,79,216,0.45)",
                  }}
                  initial={{ scale: 0.85, opacity: 0.75 }}
                  animate={{ scale: 3.75, opacity: 0.0 }}
                  transition={{ duration: 0.9, ease: "easeOut", delay: 0.06 }}
                />

                {/* Particles */}
                {BURST_PARTICLES.map((p, i) => (
                  <motion.span
                    key={`p-${i}`}
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

                {/* Sparkles (tiny diamonds) */}
                {SPARKLES.map((s, i) => (
                  <motion.span
                    key={`s-${i}`}
                    className="absolute left-1/2 top-1/2 will-change-transform"
                    style={{
                      width: Math.max(3, Math.round(size * 0.12)),
                      height: Math.max(3, Math.round(size * 0.12)),
                      marginLeft: -Math.round(
                        Math.max(3, Math.round(size * 0.12)) / 2,
                      ),
                      marginTop: -Math.round(
                        Math.max(3, Math.round(size * 0.12)) / 2,
                      ),
                      background: s.c,
                      borderRadius: 2,
                      transform: `rotate(${s.r}deg)`,
                      boxShadow: "0 0 10px rgba(255,255,255,0.35)",
                    }}
                    initial={{ x: 0, y: 0, scale: 0.2, opacity: 0 }}
                    animate={{
                      x: s.x * factor,
                      y: s.y * factor,
                      scale: [0.2, 1.1, 0.7],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 0.65,
                      ease: "easeOut",
                      delay: s.d,
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
                    filter: "blur(2.6px)",
                  }}
                  initial={{ scale: 0.6, opacity: 0.0 }}
                  animate={{ scale: 2.05, opacity: 0.9 }}
                  transition={{ duration: 0.55, ease: "easeOut" }}
                />
              </motion.span>
            )}
          </AnimatePresence>

          {/* Center content: spinner OR icon transition */}
          <AnimatePresence mode="wait" initial={false}>
            {busy && showSpinner ? (
              <motion.span
                key="spinner"
                className="relative z-10 grid place-items-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                <Spinner size={size} />
              </motion.span>
            ) : value ? (
              <motion.span
                key="success"
                className="relative z-10 grid place-items-center"
                style={{ filter: "drop-shadow(0 0 10px rgba(34,197,94,0.35))" }}
                initial={{ scale: 0.2, y: 6, opacity: 0, rotate: -16 }}
                animate={{ scale: 1.02, y: 0, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.7, opacity: 0, y: -4 }}
                transition={ICON_SPRING}
              >
                <CheckDraw size={size} />
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
