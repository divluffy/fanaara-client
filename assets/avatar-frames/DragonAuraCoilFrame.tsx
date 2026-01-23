'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export type DragonAuraCoilFrameProps = {
  size?: number; // px
  className?: string;
  thickness?: number; // svg stroke width scale
  speed?: number; // seconds per rotation (lower = faster)
  intensity?: number; // 0..?
};

function cn(...parts: Array<string | undefined | false | null>) {
  return parts.filter(Boolean).join(' ');
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Creates a "coil-like" spiral-ish ring path by modulating radius around a circle:
 * r(θ) = base + amp * sin(waves * θ + phase) + drift * (θ / 2π - 0.5)
 */
function makeCoilPath(opts: {
  cx: number;
  cy: number;
  base: number;
  amp: number;
  waves: number;
  drift: number;
  phase: number;
  points?: number;
}) {
  const { cx, cy, base, amp, waves, drift, phase, points = 320 } = opts;

  const twoPi = Math.PI * 2;
  let d = '';

  for (let i = 0; i <= points; i++) {
    const t = i / points; // 0..1
    const theta = t * twoPi;

    // gentle in-out drift for a "coil" feel rather than a perfect ring
    const driftTerm = drift * (t - 0.5);

    const r = base + driftTerm + amp * Math.sin(waves * theta + phase);
    const x = cx + r * Math.cos(theta);
    const y = cy + r * Math.sin(theta);

    d += i === 0 ? `M ${x.toFixed(3)} ${y.toFixed(3)}` : ` L ${x.toFixed(3)} ${y.toFixed(3)}`;
  }

  return d;
}

export default function DragonAuraCoilFrame({
  size = 86,
  className,
  thickness = 7,
  speed = 3.5,
  intensity = 1,
}: DragonAuraCoilFrameProps) {
  const reduceMotion = useReducedMotion();
  const uid = React.useId();

  const t = clamp(thickness, 2, 18);
  const s = clamp(speed, 0.8, 12);
  const k = clamp(intensity, 0, 2.5);

  const viewBox = 100;
  const cx = 50;
  const cy = 50;

  const outerPath = React.useMemo(
    () =>
      makeCoilPath({
        cx,
        cy,
        base: 43.5,
        amp: 2.6 + 1.0 * k,
        waves: 10,
        drift: 2.2,
        phase: 0,
      }),
    [k]
  );

  const innerPath = React.useMemo(
    () =>
      makeCoilPath({
        cx,
        cy,
        base: 40.2,
        amp: 2.1 + 0.9 * k,
        waves: 11,
        drift: -1.6,
        phase: Math.PI * 0.9,
      }),
    [k]
  );

  const glowId = `dragonAuraGlow-${uid}`;
  const gradId = `dragonAuraGrad-${uid}`;

  const outerStroke = Math.max(1.4, t * 0.34);
  const innerStroke = Math.max(1.2, t * 0.28);
  const tickStroke = Math.max(0.9, t * 0.14);

  const pulseScale = 1 + 0.02 * k;
  const pulseMinOpacity = clamp(0.62 + 0.08 * k, 0.55, 0.82);
  const pulseMaxOpacity = clamp(0.92 + 0.04 * k, 0.85, 1);

  const rotationDurationOuter = s;
  const rotationDurationInner = s * 1.08;

  const pulseDuration = clamp(2.1 - 0.2 * (k - 1), 1.6, 2.6);

  const outerRotate = reduceMotion
    ? undefined
    : { rotate: 360 };
  const innerRotate = reduceMotion
    ? undefined
    : { rotate: -360 };
  const pulseAnim = reduceMotion
    ? undefined
    : {
        opacity: [pulseMinOpacity, pulseMaxOpacity, pulseMinOpacity],
        scale: [1, pulseScale, 1],
      };

  // Minimal “scale” ticks around the ring
  const ticks = React.useMemo(() => {
    const count = 22;
    const r1 = 46.8;
    const r2 = 49.2;
    const items: Array<{ x1: number; y1: number; x2: number; y2: number; o: number }> = [];
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const ca = Math.cos(a);
      const sa = Math.sin(a);

      const x1 = cx + r1 * ca;
      const y1 = cy + r1 * sa;
      const x2 = cx + r2 * ca;
      const y2 = cy + r2 * sa;

      // subtle random-ish opacity pattern without randomness
      const o = 0.18 + 0.22 * (0.5 + 0.5 * Math.sin(i * 1.9));
      items.push({ x1, y1, x2, y2, o });
    }
    return items;
  }, []);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${viewBox} ${viewBox}`}
      aria-hidden="true"
      className={cn('pointer-events-none select-none', className)}
    >
      <defs>
        <linearGradient id={gradId} x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="rgb(34, 211, 238)" stopOpacity="1" />
          <stop offset="0.55" stopColor="rgb(167, 139, 250)" stopOpacity="1" />
          <stop offset="1" stopColor="rgb(52, 211, 153)" stopOpacity="1" />
        </linearGradient>

        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={1.2 + 0.6 * k} result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="
              1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              0 0 0 0.9 0"
            result="glow"
          />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Breathing aura pulse (opacity + slight scale) */}
      <motion.g
        style={{ transformOrigin: '50% 50%', transformBox: 'fill-box' }}
        animate={pulseAnim}
        transition={
          reduceMotion
            ? undefined
            : {
                duration: pulseDuration,
                repeat: Infinity,
                ease: 'easeInOut',
              }
        }
      >
        {/* subtle base ring */}
        <circle
          cx={cx}
          cy={cy}
          r={44.6}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeOpacity={0.12 + 0.08 * k}
          strokeWidth={Math.max(1, t * 0.18)}
        />

        {/* scale ticks */}
        <g filter={`url(#${glowId})`}>
          {ticks.map((ln, idx) => (
            <line
              key={idx}
              x1={ln.x1}
              y1={ln.y1}
              x2={ln.x2}
              y2={ln.y2}
              stroke={`url(#${gradId})`}
              strokeOpacity={ln.o}
              strokeWidth={tickStroke}
              strokeLinecap="round"
            />
          ))}
        </g>

        {/* Outer coil (rotates) */}
        <motion.g
          style={{ transformOrigin: '50% 50%', transformBox: 'fill-box' }}
          animate={outerRotate}
          transition={
            reduceMotion
              ? undefined
              : {
                  duration: rotationDurationOuter,
                  repeat: Infinity,
                  ease: 'linear',
                }
          }
        >
          <path
            d={outerPath}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth={outerStroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity={0.86}
            filter={`url(#${glowId})`}
          />
          {/* a faint secondary stroke to enhance the "coil" layering */}
          <path
            d={outerPath}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth={Math.max(1, outerStroke * 0.55)}
            strokeOpacity={0.22 + 0.08 * k}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.g>

        {/* Inner coil (counter-rotates) */}
        <motion.g
          style={{ transformOrigin: '50% 50%', transformBox: 'fill-box' }}
          animate={innerRotate}
          transition={
            reduceMotion
              ? undefined
              : {
                  duration: rotationDurationInner,
                  repeat: Infinity,
                  ease: 'linear',
                }
          }
        >
          <path
            d={innerPath}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth={innerStroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity={0.8}
            filter={`url(#${glowId})`}
          />
          <path
            d={innerPath}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth={Math.max(1, innerStroke * 0.55)}
            strokeOpacity={0.2 + 0.07 * k}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.g>
      </motion.g>
    </svg>
  );
}

/*
Usage (SVG overlay frame only):

<div className="relative" style={{ width: 86, height: 86 }}>
  <img
    src="/avatar.jpg"
    alt="avatar"
    className="h-full w-full rounded-full object-cover"
  />
  <DragonAuraCoilFrame className="absolute inset-0" />
</div>
*/
