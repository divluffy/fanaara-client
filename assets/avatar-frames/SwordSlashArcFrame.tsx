// src/components/avatar-frames/SwordSlashArcFrame.tsx
"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Overlay usage example:
 *
 * <div className="relative h-20 w-20">
 *   <img
 *     src="/avatar.png"
 *     alt=""
 *     className="h-full w-full rounded-full object-cover"
 *   />
 *   <SwordSlashArcFrame className="absolute inset-0 text-white/90" />
 * </div>
 */

export type SwordSlashArcFrameProps = {
  /** Render size (px) */
  size?: number;
  className?: string;
  /** Ring thickness (px) */
  thickness?: number;
  /** Total loop duration (seconds) */
  speed?: number;
  /** Intended 2–3 (will be clamped) */
  slashes?: number;
};

function cn(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
  sweepFlag: 0 | 1
) {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const delta = Math.abs(endAngle - startAngle);
  const largeArcFlag: 0 | 1 = delta > 180 ? 1 : 0;

  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`;
}

function buildSlashTimeline(index: number, total: number, count: number) {
  // 75% of the cycle is the "combo"; rest is breathing room for a seamless loop.
  const active = total * 0.75;
  const stagger = active / count;

  const draw = stagger * 0.62;
  const hold = stagger * 0.18;
  const fade = stagger * 0.14;

  const start = index * stagger;
  const drawEnd = start + draw;
  const holdEnd = drawEnd + hold;
  const fadeEnd = holdEnd + fade;

  // Reset dash (while invisible) a little after the fade completes.
  const resetStart = Math.min(fadeEnd + total * 0.05, total * 0.98);

  const times = [
    0,
    start / total,
    drawEnd / total,
    holdEnd / total,
    fadeEnd / total,
    resetStart / total,
    1,
  ].map((t) => clamp(t, 0, 1));

  // Keep it invisible until start; draw; then fade; then reset dash while invisible.
  const opacity = [0, 0, 1, 1, 0, 0, 0];
  const dashoffset = [1, 1, 0, 0, 0, 1, 1];

  return { times, opacity, dashoffset };
}

export function SwordSlashArcFrame({
  size = 80,
  className,
  thickness = 6,
  speed = 2.2,
  slashes = 3,
}: SwordSlashArcFrameProps) {
  const reduceMotion = useReducedMotion();

  // Design calls for 2–3 arcs.
  const count = clamp(Math.round(slashes), 2, 3);

  // Convert px thickness into viewBox units (viewBox is 100x100).
  const vb = 100;
  const strokeW = Math.max(1, (thickness * vb) / Math.max(1, size));
  const ringR = 46;

  const slashConfigs = React.useMemo(() => {
    // Angles chosen to feel like a "combo" around the ring; alternating sweep adds katana-like flow.
    if (count === 2) {
      return [
        { start: 28, end: 86, rDelta: 0, sweep: 1 as const },
        { start: 212, end: 268, rDelta: -1.5, sweep: 0 as const },
      ];
    }
    // count === 3
    return [
      { start: 6, end: 58, rDelta: 0.5, sweep: 1 as const },
      { start: 132, end: 190, rDelta: -1, sweep: 0 as const },
      { start: 254, end: 312, rDelta: 0, sweep: 1 as const },
    ];
  }, [count]);

  const rotation = reduceMotion
    ? undefined
    : {
        rotate: [-2.5, 2.5, -2.5],
        transition: {
          duration: Math.max(1.2, speed * 2.4),
          ease: "easeInOut",
          repeat: Infinity,
        },
      };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      className={cn("pointer-events-none select-none", className)}
    >
      <defs>
        <linearGradient id="ssaf_g" x1="12" y1="18" x2="88" y2="82" gradientUnits="userSpaceOnUse">
          <stop stopColor="currentColor" stopOpacity="0.95" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.55" />
        </linearGradient>
      </defs>

      <motion.g
        style={{ transformOrigin: "50% 50%" }}
        animate={rotation as any}
      >
        {/* Base ring */}
        <circle
          cx="50"
          cy="50"
          r={ringR}
          stroke="currentColor"
          strokeOpacity="0.22"
          strokeWidth={strokeW}
        />
        {/* Subtle highlight ring */}
        <circle
          cx="50"
          cy="50"
          r={ringR}
          stroke="url(#ssaf_g)"
          strokeOpacity="0.35"
          strokeWidth={Math.max(1, strokeW * 0.55)}
        />

        {/* Slashes */}
        {slashConfigs.map((cfg, i) => {
          const r = ringR + cfg.rDelta;
          const d = describeArc(50, 50, r, cfg.start, cfg.end, cfg.sweep);
          const slashStrokeW = Math.max(1, strokeW * 0.85);

          if (reduceMotion) {
            return (
              <path
                key={`slash-${i}`}
                d={d}
                stroke="url(#ssaf_g)"
                strokeWidth={slashStrokeW}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.9}
              />
            );
          }

          const tl = buildSlashTimeline(i, Math.max(0.6, speed), slashConfigs.length);

          return (
            <motion.path
              key={`slash-${i}`}
              d={d}
              pathLength={1}
              stroke="url(#ssaf_g)"
              strokeWidth={slashStrokeW}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="1"
              initial={{ opacity: 0, strokeDashoffset: 1 }}
              animate={{
                opacity: tl.opacity,
                strokeDashoffset: tl.dashoffset,
              }}
              transition={{
                duration: Math.max(0.6, speed),
                ease: "easeOut",
                times: tl.times,
                repeat: Infinity,
              }}
            />
          );
        })}
      </motion.g>
    </svg>
  );
}

export default SwordSlashArcFrame;
