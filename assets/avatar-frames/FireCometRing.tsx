"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

export type FireCometRingProps = {
  size?: number; // px
  className?: string;
  thickness?: number; // px
  speed?: number; // base speed factor (seconds-ish)
  glow?: boolean;
};

function cx(...parts: Array<string | undefined | null | false>) {
  return parts.filter(Boolean).join(" ");
}

function polar(cx0: number, cy0: number, r: number, deg: number) {
  const a = (deg * Math.PI) / 180;
  return { x: cx0 + r * Math.cos(a), y: cy0 + r * Math.sin(a) };
}

/**
 * FireCometRing
 * - SVG frame overlay only (no avatar image inside)
 * - Tailwind-friendly, pointer-events-none
 * - Animated by default (Framer Motion), respects prefers-reduced-motion
 */
export function FireCometRing({
  size = 72,
  className,
  thickness = 7,
  speed = 2.8,
  glow = true,
}: FireCometRingProps) {
  const reduce = useReducedMotion();

  // Map px thickness to SVG units (viewBox is 100x100)
  const svgUnitsPerPx = 100 / Math.max(1, size);
  const strokeW = thickness * svgUnitsPerPx;

  const c = 50;
  const pad = 2;
  const ringR = Math.max(10, c - strokeW / 2 - pad);

  const ringDuration = Math.max(2.5, speed * 4.8); // slow
  const cometDuration = Math.max(2.0, speed * 3.9); // slightly faster for layered motion

  const tongues = [
    { deg: 18, len: 6.2, wid: 2.6 },
    { deg: 112, len: 5.7, wid: 2.4 },
    { deg: 214, len: 6.0, wid: 2.7 },
    { deg: 304, len: 5.4, wid: 2.3 },
  ];

  const cometRpx = Math.max(2.2, thickness * 0.55);
  const cometR = cometRpx * svgUnitsPerPx;

  const cometX = c + ringR;
  const cometY = c;

  // Tail behind comet (to the left when comet is at 3 o'clock)
  const tailLenPx = Math.max(10, thickness * 2.2);
  const tailLen = tailLenPx * svgUnitsPerPx;
  const tailWid = Math.max(1.8, thickness * 0.7) * svgUnitsPerPx;

  const tailPath = [
    `M ${cometX - cometR * 0.2} ${cometY}`,
    `C ${cometX - tailLen * 0.35} ${cometY - tailWid * 1.2}, ${cometX - tailLen * 0.78} ${
      cometY - tailWid * 0.45
    }, ${cometX - tailLen} ${cometY}`,
    `C ${cometX - tailLen * 0.78} ${cometY + tailWid * 0.45}, ${cometX - tailLen * 0.35} ${
      cometY + tailWid * 1.2
    }, ${cometX - cometR * 0.2} ${cometY}`,
    "Z",
  ].join(" ");

  const ringRotate = reduce
    ? undefined
    : {
        rotate: 360,
      };

  const ringTransition = reduce
    ? undefined
    : {
        duration: ringDuration,
        repeat: Infinity as const,
        ease: "linear" as const,
      };

  const cometRotate = reduce
    ? undefined
    : {
        rotate: 360,
      };

  const cometTransition = reduce
    ? undefined
    : {
        duration: cometDuration,
        repeat: Infinity as const,
        ease: "linear" as const,
      };

  return (
    <motion.svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={cx("pointer-events-none", className)}
      initial={false}
    >
      <defs>
        <linearGradient
          id="fcr-ring"
          x1="10"
          y1="10"
          x2="90"
          y2="90"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FFD089" stopOpacity="0.95" />
          <stop offset="35%" stopColor="#FF7A18" stopOpacity="0.95" />
          <stop offset="70%" stopColor="#FF2D55" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#FFB703" stopOpacity="0.9" />
        </linearGradient>

        <radialGradient id="fcr-comet" cx="35%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#FFF2C7" stopOpacity="1" />
          <stop offset="45%" stopColor="#FF9E2C" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#FF2D55" stopOpacity="0.9" />
        </radialGradient>

        <linearGradient id="fcr-tail" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FF2D55" stopOpacity="0.0" />
          <stop offset="35%" stopColor="#FF7A18" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#FFF2C7" stopOpacity="0.65" />
        </linearGradient>

        {glow ? (
          <filter id="fcr-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="1.6"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="
                1 0 0 0 0
                0 0.6 0 0 0
                0 0 0.2 0 0
                0 0 0 0.9 0
              "
              result="tint"
            />
            <feMerge>
              <feMergeNode in="tint" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        ) : null}
      </defs>

      {/* Ring (slow rotation + subtle flicker) */}
      <motion.g
        style={{ transformOrigin: "50px 50px" }}
        animate={ringRotate}
        transition={ringTransition}
      >
        <motion.circle
          cx={c}
          cy={c}
          r={ringR}
          fill="none"
          stroke="url(#fcr-ring)"
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.95}
          filter={glow ? "url(#fcr-glow)" : undefined}
          strokeDasharray={`${Math.max(10, ringR * 0.55)} ${Math.max(6, ringR * 0.14)}`}
          animate={
            reduce
              ? undefined
              : {
                  opacity: [0.86, 0.98, 0.9, 0.96],
                }
          }
          transition={
            reduce
              ? undefined
              : {
                  duration: Math.max(1.6, speed * 0.95),
                  repeat: Infinity as const,
                  ease: "easeInOut" as const,
                }
          }
        />

        {/* Inner heat shimmer */}
        <motion.circle
          cx={c}
          cy={c}
          r={ringR - strokeW * 0.55}
          fill="none"
          stroke="#FFB703"
          strokeWidth={Math.max(0.6, strokeW * 0.28)}
          opacity={0.35}
          animate={
            reduce
              ? undefined
              : {
                  opacity: [0.18, 0.38, 0.22],
                }
          }
          transition={
            reduce
              ? undefined
              : {
                  duration: Math.max(1.2, speed * 0.8),
                  repeat: Infinity as const,
                  ease: "easeInOut" as const,
                }
          }
        />
      </motion.g>

      {/* Flame tongues around the ring (staggered flicker) */}
      <g filter={glow ? "url(#fcr-glow)" : undefined}>
        {tongues.map((t, i) => {
          const base = polar(c, c, ringR + strokeW * 0.15, t.deg);
          const tip = polar(c, c, ringR + t.len, t.deg);
          const left = polar(c, c, ringR + t.len * 0.4, t.deg - t.wid);
          const right = polar(c, c, ringR + t.len * 0.4, t.deg + t.wid);

          const d = [
            `M ${base.x.toFixed(2)} ${base.y.toFixed(2)}`,
            `Q ${left.x.toFixed(2)} ${left.y.toFixed(2)} ${tip.x.toFixed(2)} ${tip.y.toFixed(2)}`,
            `Q ${right.x.toFixed(2)} ${right.y.toFixed(2)} ${base.x.toFixed(2)} ${base.y.toFixed(2)}`,
            "Z",
          ].join(" ");

          return (
            <motion.path
              key={i}
              d={d}
              fill="#FF7A18"
              opacity={0.55}
              style={{ transformOrigin: `${base.x}px ${base.y}px` }}
              animate={
                reduce
                  ? undefined
                  : {
                      opacity: [0.22, 0.68, 0.35, 0.6],
                      scale: [0.92, 1.08, 0.98, 1.05],
                    }
              }
              transition={
                reduce
                  ? undefined
                  : {
                      duration: Math.max(1.0, speed * 0.75),
                      repeat: Infinity as const,
                      ease: "easeInOut" as const,
                      delay: i * 0.18,
                    }
              }
            />
          );
        })}
      </g>

      {/* Comet orbit (slightly different speed for layered motion) */}
      <motion.g
        style={{ transformOrigin: "50px 50px" }}
        animate={cometRotate}
        transition={cometTransition}
      >
        {/* Tail */}
        <motion.path
          d={tailPath}
          fill="url(#fcr-tail)"
          opacity={0.85}
          animate={
            reduce
              ? undefined
              : {
                  opacity: [0.55, 0.9, 0.65],
                }
          }
          transition={
            reduce
              ? undefined
              : {
                  duration: Math.max(0.9, speed * 0.55),
                  repeat: Infinity as const,
                  ease: "easeInOut" as const,
                }
          }
        />

        {/* Fireball */}
        <motion.circle
          cx={cometX}
          cy={cometY}
          r={cometR}
          fill="url(#fcr-comet)"
          filter={glow ? "url(#fcr-glow)" : undefined}
          animate={
            reduce
              ? undefined
              : {
                  r: [cometR * 0.92, cometR * 1.12, cometR * 0.98],
                  opacity: [0.9, 1, 0.92],
                }
          }
          transition={
            reduce
              ? undefined
              : {
                  duration: Math.max(0.8, speed * 0.55),
                  repeat: Infinity as const,
                  ease: "easeInOut" as const,
                }
          }
        />
      </motion.g>
    </motion.svg>
  );
}

export default FireCometRing;
