// src/components/avatar-frames/WaterBreathingWaveFrame.tsx
"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

export type WaterBreathingWaveFrameProps = {
  /** Pixel size of the overlay (width & height). */
  size?: number;
  className?: string;
  /** Approx ring thickness in pixels. */
  thickness?: number;
  /** Base speed in seconds (lower = faster). */
  speed?: number;
  /** Number of wave crests around the ring. */
  waveCount?: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function buildWavyRingPath(opts: {
  cx: number;
  cy: number;
  baseR: number;
  amp: number;
  waveCount: number;
  steps: number;
}) {
  const { cx, cy, baseR, amp, waveCount, steps } = opts;
  let d = "";

  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const r = baseR + amp * Math.sin(waveCount * t);
    const x = cx + r * Math.cos(t);
    const y = cy + r * Math.sin(t);
    d += i === 0 ? `M ${x.toFixed(3)} ${y.toFixed(3)}` : ` L ${x.toFixed(3)} ${y.toFixed(3)}`;
  }

  return d + " Z";
}

export default function WaterBreathingWaveFrame({
  size = 80,
  className,
  thickness = 6,
  speed = 3,
  waveCount = 4,
}: WaterBreathingWaveFrameProps) {
  const reduceMotion = useReducedMotion();
  const uid = React.useId();

  // Convert "px-ish" props into viewBox units so the frame scales nicely.
  const pxToUnits = 100 / Math.max(1, size);
  const sw = clamp(thickness * pxToUnits, 1.2, 12); // strokeWidth in viewBox units

  const cx = 50;
  const cy = 50;

  const ringR = 50 - sw / 2 - 3.2;
  const crestR = ringR + sw * 0.9;

  const amp = clamp(sw * 0.55, 0.8, 6.5);
  const steps = clamp(Math.round(waveCount * 90), 220, 720);

  const wavyPath = React.useMemo(() => {
    return buildWavyRingPath({
      cx,
      cy,
      baseR: crestR,
      amp,
      waveCount: Math.max(1, Math.round(waveCount)),
      steps,
    });
  }, [crestR, amp, waveCount, steps]);

  const ringDashA = sw * 7.2;
  const ringDashB = sw * 4.8;
  const dashCycle = ringDashA + ringDashB;

  const rotateDuration = Math.max(10, speed * 8); // slow rotation
  const dashDuration = Math.max(1.6, speed); // water flow speed
  const bubbleDuration = Math.max(6, speed * 4);

  const bubbleCount = clamp(Math.round(waveCount / 2) + 1, 2, 4);
  const bubbleOrbitR = ringR - sw * 1.15;

  const gradA = `${uid}-gradA`;
  const gradB = `${uid}-gradB`;

  const mergedClassName = ["pointer-events-none select-none", className].filter(Boolean).join(" ");

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={mergedClassName}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={gradA} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgb(56 189 248)" stopOpacity="0.95" />
          <stop offset="45%" stopColor="rgb(34 211 238)" stopOpacity="0.95" />
          <stop offset="100%" stopColor="rgb(59 130 246)" stopOpacity="0.95" />
        </linearGradient>

        <linearGradient id={gradB} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(191 219 254)" stopOpacity="0.9" />
          <stop offset="55%" stopColor="rgb(34 211 238)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="rgb(56 189 248)" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* Outer calm ring */}
      <circle
        cx={cx}
        cy={cy}
        r={ringR}
        fill="none"
        stroke={`url(#${gradB})`}
        strokeWidth={sw}
        opacity={0.35}
      />

      {/* Flowing ring (dash animation) */}
      <motion.circle
        cx={cx}
        cy={cy}
        r={ringR}
        fill="none"
        stroke={`url(#${gradA})`}
        strokeWidth={sw * 0.92}
        strokeLinecap="round"
        strokeDasharray={`${ringDashA} ${ringDashB}`}
        initial={{ strokeDashoffset: 0 }}
        animate={
          reduceMotion
            ? undefined
            : {
                strokeDashoffset: [0, -dashCycle * 6],
              }
        }
        transition={
          reduceMotion
            ? undefined
            : {
                duration: dashDuration,
                ease: "linear",
                repeat: Infinity,
              }
        }
        opacity={0.9}
      />

      {/* Crest ring (stylized anime water waves) */}
      <motion.g
        style={{ transformOrigin: "50px 50px" }}
        animate={{ rotate: 360 }}
        transition={{ duration: rotateDuration, ease: "linear", repeat: Infinity }}
      >
        <path
          d={wavyPath}
          fill="none"
          stroke={`url(#${gradA})`}
          strokeWidth={sw * 0.72}
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity={0.95}
        />

        {/* Small highlight arcs for extra “inked” anime feel */}
        <path
          d={buildWavyRingPath({
            cx,
            cy,
            baseR: crestR - amp * 0.55,
            amp: amp * 0.4,
            waveCount: Math.max(1, Math.round(waveCount)),
            steps: Math.round(steps * 0.75),
          })}
          fill="none"
          stroke={`url(#${gradB})`}
          strokeWidth={sw * 0.35}
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity={0.6}
        />
      </motion.g>

      {/* Tiny bubbles orbiting */}
      <motion.g
        style={{ transformOrigin: "50px 50px" }}
        animate={{ rotate: 360 }}
        transition={{ duration: bubbleDuration, ease: "linear", repeat: Infinity }}
        opacity={0.9}
      >
        {Array.from({ length: bubbleCount }).map((_, i) => {
          const a = (i / bubbleCount) * Math.PI * 2;
          const x = cx + bubbleOrbitR * Math.cos(a);
          const y = cy + bubbleOrbitR * Math.sin(a);
          const r = clamp(sw * (0.22 + i * 0.05), 0.55, 2.2);

          return (
            <motion.circle
              key={i}
              cx={x}
              cy={y}
              r={r}
              fill="rgb(226 232 240)"
              opacity={0.85}
              animate={{
                scale: [1, 1.18, 1],
                opacity: [0.7, 0.95, 0.7],
              }}
              transition={{
                duration: Math.max(2.2, speed * 0.9),
                ease: "easeInOut",
                repeat: Infinity,
                delay: i * 0.35,
              }}
            />
          );
        })}
      </motion.g>
    </svg>
  );
}

/**
 * Usage:
 * <div className="relative h-20 w-20">
 *   <img className="h-full w-full rounded-full object-cover" src="/avatar.jpg" alt="" />
 *   <WaterBreathingWaveFrame className="absolute inset-0" />
 * </div>
 */
