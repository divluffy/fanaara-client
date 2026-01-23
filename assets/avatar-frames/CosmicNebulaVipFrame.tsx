"use client";

/**
 * CosmicNebulaVipFrame.tsx
 * Next.js Client Component + Tailwind + Framer Motion
 *
 * SVG overlay frame only (intended to sit above an avatar).
 *
 * Usage:
 *  <div className="relative" style={{ width: 90, height: 90 }}>
 *    <img
 *      src="/avatar.png"
 *      alt=""
 *      className="h-full w-full rounded-full object-cover"
 *    />
 *    <CosmicNebulaVipFrame className="absolute inset-0" />
 *  </div>
 */

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CosmicNebulaVipFrameProps = {
  size?: number;
  className?: string;
  thickness?: number;
  speed?: number;
  stars?: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

// Simple deterministic PRNG so stars are stable across renders (given stars count)
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function CosmicNebulaVipFrame({
  size = 90,
  className,
  thickness = 6,
  speed = 4,
  stars = 8,
}: CosmicNebulaVipFrameProps) {
  const reduceMotion = useReducedMotion();

  const s = Math.max(24, size);
  const t = clamp(thickness, 2, Math.max(2, s / 6));
  const half = s / 2;

  // Keep ring inside viewbox with a tiny padding for glow
  const pad = Math.max(2, Math.ceil(t * 0.65));
  const rOuter = half - pad;
  const rInner = rOuter - t;
  const ringMid = (rOuter + rInner) / 2;

  // Unique IDs per instance (avoid collisions in lists)
  const uid = React.useId().replace(/:/g, "");
  const ids = React.useMemo(
    () => ({
      ringGrad: `cnb-ring-grad-${uid}`,
      nebulaGrad: `cnb-nebula-grad-${uid}`,
      glowGrad: `cnb-glow-grad-${uid}`,
      ringClip: `cnb-ring-clip-${uid}`,
      softMask: `cnb-soft-mask-${uid}`,
      blur: `cnb-blur-${uid}`,
      glowBlur: `cnb-glow-blur-${uid}`,
    }),
    [uid],
  );

  const starCount = clamp(stars, 3, 24);

  const starData = React.useMemo(() => {
    const rand = mulberry32(12345 + starCount * 97);
    return Array.from({ length: starCount }).map((_, i) => {
      const ang = rand() * Math.PI * 2;
      const orbit = ringMid + (rand() - 0.5) * (t * 0.5); // slight variance around mid
      const scale = 0.7 + rand() * 0.9;
      const tw = 0.35 + rand() * 0.55; // base opacity
      const phase = rand(); // twinkle offset
      const kind = rand() < 0.35 ? "spark" : "dot";
      return { i, ang, orbit, scale, tw, phase, kind };
    });
  }, [ringMid, t, starCount]);

  const ringRotateAnim = reduceMotion
    ? undefined
    : {
        rotate: 360,
        transition: {
          duration: Math.max(1, speed) * 8, // slow
          ease: "linear",
          repeat: Infinity,
        },
      };

  const starsOrbitAnim = reduceMotion
    ? undefined
    : {
        rotate: 360,
        transition: {
          duration: Math.max(1, speed) * 3.75,
          ease: "linear",
          repeat: Infinity,
        },
      };

  const nebulaAnim = reduceMotion
    ? undefined
    : {
        opacity: [0.22, 0.34, 0.24],
        transition: {
          duration: Math.max(1, speed) * 2.6,
          ease: "easeInOut",
          repeat: Infinity,
        },
      };

  return (
    <div
      className={className}
      style={{ width: s, height: s }}
      aria-hidden="true"
    >
      <svg
        width={s}
        height={s}
        viewBox={`0 0 ${s} ${s}`}
        className="pointer-events-none block"
        role="img"
      >
        <defs>
          {/* Ring gradient */}
          <linearGradient
            id={ids.ringGrad}
            x1="0"
            y1="0"
            x2={s}
            y2={s}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#7C3AED" stopOpacity="1" />
            <stop offset="30%" stopColor="#22D3EE" stopOpacity="1" />
            <stop offset="60%" stopColor="#FB7185" stopOpacity="1" />
            <stop offset="100%" stopColor="#A78BFA" stopOpacity="1" />
          </linearGradient>

          {/* Nebula arc gradient (softer) */}
          <radialGradient id={ids.nebulaGrad} cx="35%" cy="35%" r="75%">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.85" />
            <stop offset="45%" stopColor="#A78BFA" stopOpacity="0.45" />
            <stop offset="75%" stopColor="#FB7185" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          {/* Outer glow gradient */}
          <radialGradient id={ids.glowGrad} cx="50%" cy="50%" r="60%">
            <stop offset="55%" stopColor="#A78BFA" stopOpacity="0.0" />
            <stop offset="78%" stopColor="#22D3EE" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#FB7185" stopOpacity="0.0" />
          </radialGradient>

          <filter id={ids.blur} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation={Math.max(1, t * 0.45)} />
          </filter>

          <filter
            id={ids.glowBlur}
            x="-40%"
            y="-40%"
            width="180%"
            height="180%"
          >
            <feGaussianBlur stdDeviation={Math.max(1.2, t * 0.7)} />
          </filter>

          {/* Clip nebula to ring area */}
          <clipPath id={ids.ringClip}>
            <path
              d={[
                // Outer circle
                `M ${half} ${half - rOuter}`,
                `A ${rOuter} ${rOuter} 0 1 1 ${half - 0.01} ${half - rOuter}`,
                `Z`,
                // Inner hole
                `M ${half} ${half - rInner}`,
                `A ${rInner} ${rInner} 0 1 0 ${half - 0.01} ${half - rInner}`,
                `Z`,
              ].join(" ")}
              fillRule="evenodd"
            />
          </clipPath>

          {/* Soft mask for highlights (helps avoid harsh edges) */}
          <mask id={ids.softMask}>
            <rect width={s} height={s} fill="black" />
            <circle cx={half} cy={half} r={rOuter} fill="white" />
            <circle cx={half} cy={half} r={rInner} fill="black" />
          </mask>
        </defs>

        {/* Subtle outer glow */}
        <circle
          cx={half}
          cy={half}
          r={rOuter + t * 0.55}
          fill={`url(#${ids.glowGrad})`}
          filter={`url(#${ids.glowBlur})`}
          opacity={0.9}
        />

        {/* Nebula arc behind ring, clipped to ring only */}
        <motion.g
          style={{ transformOrigin: `${half}px ${half}px` }}
          animate={nebulaAnim}
        >
          <g clipPath={`url(#${ids.ringClip})`}>
            {/* Arc 1 */}
            <path
              d={describeArcPath(
                half,
                half,
                ringMid,
                -65,
                45,
                Math.max(2, t * 0.95),
              )}
              stroke={`url(#${ids.nebulaGrad})`}
              strokeLinecap="round"
              fill="none"
              filter={`url(#${ids.blur})`}
              opacity={0.28}
            />
            {/* Arc 2 (offset) */}
            <path
              d={describeArcPath(
                half,
                half,
                ringMid - t * 0.65,
                120,
                205,
                Math.max(1.6, t * 0.65),
              )}
              stroke={`url(#${ids.nebulaGrad})`}
              strokeLinecap="round"
              fill="none"
              filter={`url(#${ids.blur})`}
              opacity={0.22}
            />
          </g>
        </motion.g>

        {/* Rotating gradient ring */}
        <motion.g
          style={{ transformOrigin: `${half}px ${half}px` }}
          animate={ringRotateAnim}
        >
          {/* Base ring */}
          <circle
            cx={half}
            cy={half}
            r={ringMid}
            fill="none"
            stroke={`url(#${ids.ringGrad})`}
            strokeWidth={t}
            strokeLinecap="round"
            opacity={0.98}
          />

          {/* Micro highlight dash (adds “premium” feel) */}
          <circle
            cx={half}
            cy={half}
            r={ringMid}
            fill="none"
            stroke="#FFFFFF"
            strokeOpacity="0.20"
            strokeWidth={Math.max(1.2, t * 0.18)}
            strokeDasharray={`${Math.max(10, ringMid * 0.55)} ${Math.max(
              60,
              ringMid * 3,
            )}`}
            strokeLinecap="round"
            mask={`url(#${ids.softMask})`}
          />
        </motion.g>

        {/* Stars orbiting around ring */}
        <motion.g
          style={{ transformOrigin: `${half}px ${half}px` }}
          animate={starsOrbitAnim}
        >
          {starData.map((st) => {
            const x = half + Math.cos(st.ang) * st.orbit;
            const y = half + Math.sin(st.ang) * st.orbit;

            const twinkle = reduceMotion
              ? undefined
              : {
                  opacity: [
                    st.tw,
                    Math.min(1, st.tw + 0.35),
                    Math.max(0.18, st.tw - 0.15),
                    st.tw,
                  ],
                  scale: [st.scale, st.scale * 1.15, st.scale * 0.95, st.scale],
                  transition: {
                    duration: 1.9 + st.phase * 1.3,
                    ease: "easeInOut",
                    repeat: Infinity,
                    delay: st.i * 0.12, // stagger
                  },
                };

            const r = Math.max(0.8, t * 0.12) * st.scale;

            return (
              <motion.g
                key={st.i}
                transform={`translate(${x} ${y})`}
                animate={twinkle}
              >
                {st.kind === "spark" ? (
                  <>
                    {/* Spark star (cross) */}
                    <line
                      x1={-r * 2.2}
                      y1="0"
                      x2={r * 2.2}
                      y2="0"
                      stroke="#FFFFFF"
                      strokeOpacity="0.92"
                      strokeWidth={Math.max(0.8, r * 0.85)}
                      strokeLinecap="round"
                    />
                    <line
                      x1="0"
                      y1={-r * 2.2}
                      x2="0"
                      y2={r * 2.2}
                      stroke="#FFFFFF"
                      strokeOpacity="0.88"
                      strokeWidth={Math.max(0.8, r * 0.85)}
                      strokeLinecap="round"
                    />
                    {/* Soft center */}
                    <circle
                      cx="0"
                      cy="0"
                      r={r * 1.15}
                      fill="#FFFFFF"
                      opacity="0.55"
                      filter={`url(#${ids.blur})`}
                    />
                  </>
                ) : (
                  <>
                    {/* Dot star */}
                    <circle
                      cx="0"
                      cy="0"
                      r={r * 1.35}
                      fill="#FFFFFF"
                      opacity="0.9"
                    />
                    <circle
                      cx="0"
                      cy="0"
                      r={r * 2.4}
                      fill="#FFFFFF"
                      opacity="0.22"
                      filter={`url(#${ids.blur})`}
                    />
                  </>
                )}
              </motion.g>
            );
          })}
        </motion.g>
      </svg>
    </div>
  );
}

/**
 * Creates a stroked arc path (with "stroke width" defined by the caller).
 * Angles are in degrees, 0 = to the right, positive = clockwise.
 */
function describeArcPath(
  cx: number,
  cy: number,
  radius: number,
  startDeg: number,
  endDeg: number,
  _strokeWidth: number,
) {
  const start = polarToCartesian(cx, cy, radius, endDeg);
  const end = polarToCartesian(cx, cy, radius, startDeg);
  const largeArcFlag = endDeg - startDeg <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180.0;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}
