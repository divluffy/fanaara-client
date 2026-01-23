// src/components/avatar-frames/SakuraPetalsOrbitFrame.tsx
"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

export type SakuraPetalsOrbitFrameProps = {
  size?: number; // default 82
  className?: string;
  thickness?: number; // default 5
  speed?: number; // default 5 (seconds per orbit)
  petals?: number; // default 10
};

/**
 * Usage (overlay on avatar):
 *
 * <div className="relative" style={{ width: 82, height: 82 }}>
 *   <img
 *     src="/avatar.jpg"
 *     alt="Avatar"
 *     className="h-full w-full rounded-full object-cover"
 *   />
 *   <SakuraPetalsOrbitFrame className="absolute inset-0" size={82} />
 * </div>
 */
export function SakuraPetalsOrbitFrame({
  size = 82,
  className,
  thickness = 5,
  speed = 5,
  petals = 10,
}: SakuraPetalsOrbitFrameProps) {
  const reduceMotion = useReducedMotion();

  // SVG coordinate system
  const vb = 100;
  const cx = 50;
  const cy = 50;

  // Geometry (kept within viewBox bounds)
  const ringR = 32;
  const ringStroke = Math.max(1, thickness);
  const orbitR = ringR + ringStroke / 2 + 7;

  const count = Math.max(0, Math.floor(petals));
  const step = count > 0 ? 360 / count : 0;

  // Petal dimensions (scaled subtly with thickness)
  const petalW = 6 + Math.min(3, ringStroke * 0.25);
  const petalH = 12 + Math.min(4, ringStroke * 0.35);

  const petalPath = React.useMemo(() => {
    const w = petalW;
    const h = petalH;
    // A simple teardrop-ish petal centered at (0,0) with the tip at top.
    // Tip: (0, -h/2). Base: (0, h/2).
    return [
      `M 0 ${-h / 2}`,
      `C ${w / 2} ${-h / 2} ${w / 2} ${h / 6} 0 ${h / 2}`,
      `C ${-w / 2} ${h / 6} ${-w / 2} ${-h / 2} 0 ${-h / 2}`,
      "Z",
    ].join(" ");
  }, [petalW, petalH]);

  const orbitAnim = reduceMotion
    ? undefined
    : { rotate: 360 };

  const orbitTransition = reduceMotion
    ? undefined
    : {
        duration: Math.max(0.5, speed),
        repeat: Infinity,
        ease: "linear" as const,
      };

  const shimmerAnim = reduceMotion
    ? undefined
    : { strokeDashoffset: [-230, 0] };

  const shimmerTransition = reduceMotion
    ? undefined
    : {
        duration: Math.max(0.9, speed * 1.15),
        repeat: Infinity,
        ease: "linear" as const,
      };

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${vb} ${vb}`}
      className={`pointer-events-none select-none ${className ?? ""}`}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        {/* Soft ring gradient */}
        <radialGradient id="sakura_ring_grad" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0.28)" />
          <stop offset="45%" stopColor="rgba(255, 182, 216, 0.35)" />
          <stop offset="100%" stopColor="rgba(255, 182, 216, 0.10)" />
        </radialGradient>

        {/* Petal gradient */}
        <linearGradient id="sakura_petal_grad" x1="0" y1="-20" x2="0" y2="20">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0.85)" />
          <stop offset="35%" stopColor="rgba(255, 192, 223, 0.95)" />
          <stop offset="100%" stopColor="rgba(248, 166, 206, 0.85)" />
        </linearGradient>

        {/* Soft glow */}
        <filter id="sakura_glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Shimmer blur */}
        <filter id="sakura_shimmer" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="0.8" />
        </filter>
      </defs>

      {/* Base ring */}
      <circle
        cx={cx}
        cy={cy}
        r={ringR}
        stroke="url(#sakura_ring_grad)"
        strokeWidth={ringStroke}
        opacity={0.9}
        filter="url(#sakura_glow)"
      />

      {/* A faint inner ring to give a “soft rim” feel */}
      <circle
        cx={cx}
        cy={cy}
        r={ringR - ringStroke * 0.45}
        stroke="rgba(255,255,255,0.16)"
        strokeWidth={Math.max(1, ringStroke * 0.35)}
        opacity={0.9}
      />

      {/* Shimmer highlight passing around the rim */}
      <motion.circle
        cx={cx}
        cy={cy}
        r={ringR}
        stroke="rgba(255,255,255,0.65)"
        strokeWidth={Math.max(1, ringStroke * 0.35)}
        strokeLinecap="round"
        strokeDasharray="42 188"
        filter="url(#sakura_shimmer)"
        opacity={reduceMotion ? 0 : 0.55}
        animate={shimmerAnim}
        transition={shimmerTransition}
      />

      {/* Petals orbit group */}
      <motion.g
        style={{ transformOrigin: "50% 50%", transformBox: "fill-box" as any }}
        animate={orbitAnim}
        transition={orbitTransition}
      >
        {Array.from({ length: count }).map((_, i) => {
          const angle = i * step - 90; // start at top
          const theta = (angle * Math.PI) / 180;

          const x = cx + orbitR * Math.cos(theta);
          const y = cy + orbitR * Math.sin(theta);

          // Orient petal outward: for top (-90) => rotate 0, right (0) => rotate 90, etc.
          const petalRotate = angle + 90;

          const flutter = reduceMotion
            ? undefined
            : {
                rotate: [0, 7, -5, 0],
                scale: [1, 1.035, 0.99, 1],
              };

          const flutterTransition = reduceMotion
            ? undefined
            : {
                duration: 2.6,
                repeat: Infinity,
                ease: "easeInOut" as const,
                delay: i * 0.12,
              };

          return (
            <motion.g
              key={i}
              transform={`translate(${x} ${y}) rotate(${petalRotate})`}
              animate={flutter}
              transition={flutterTransition}
              style={{ transformOrigin: "0px 0px" }}
            >
              {/* Soft shadow-ish underlay */}
              <path
                d={petalPath}
                fill="rgba(216, 120, 170, 0.16)"
                transform="translate(0 0.7)"
              />
              {/* Main petal */}
              <path
                d={petalPath}
                fill="url(#sakura_petal_grad)"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth={0.6}
              />
            </motion.g>
          );
        })}
      </motion.g>
    </svg>
  );
}

export default SakuraPetalsOrbitFrame;
