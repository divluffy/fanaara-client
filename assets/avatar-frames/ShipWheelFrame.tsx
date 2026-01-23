// src/components/avatar-frames/ShipWheelFrame.tsx
'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export type ShipWheelFrameProps = {
  /** Pixel size of the frame (width & height). */
  size?: number;
  className?: string;
  /** Approx stroke thickness in px (kept consistent across sizes). */
  thickness?: number;
  /** Seconds per full wheel rotation. */
  speed?: number;
  /** Number of spokes/handles. */
  spokes?: number;
};

function cx(...parts: Array<string | undefined | null | false>) {
  return parts.filter(Boolean).join(' ');
}

export const ShipWheelFrame: React.FC<ShipWheelFrameProps> = ({
  size = 80,
  className,
  thickness = 6,
  speed = 4,
  spokes = 8,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const uid = React.useId();

  const pxSize = Number.isFinite(size) ? Math.max(1, size) : 80;
  const pxThickness = Number.isFinite(thickness) ? Math.max(1, thickness) : 6;
  const baseSpeed = Number.isFinite(speed) ? Math.max(0.2, speed) : 4;
  const spokeCount = Math.max(3, Math.round(Number.isFinite(spokes) ? (spokes as number) : 8));

  // Convert px stroke into viewBox units so it stays consistent at any rendered size.
  const vb = 100;
  const strokeOuter = Math.min(18, Math.max(1.2, (pxThickness / pxSize) * vb));
  const strokeInner = Math.max(1, strokeOuter * 0.75);
  const strokeSpoke = Math.max(0.9, strokeOuter * 0.55);

  // Geometry (viewBox 0..100, centered at 50,50)
  const cx0 = 50;
  const cy0 = 50;

  // Handle protrusion beyond the rim (in viewBox units).
  const handleOut = 8.0;
  const handleIn = 4.0;
  const handleH = handleOut + handleIn;
  const handleW = 8.0;

  // Keep everything inside the viewBox.
  const margin = 1.25;
  const outerR = Math.max(18, 50 - handleOut - margin - strokeOuter / 2);
  const innerR = outerR * 0.72;
  const hubR = outerR * 0.24;

  const rimY = cy0 - outerR;
  const handleRectX = cx0 - handleW / 2;
  const handleRectY = rimY - handleOut;

  const spokeStartY = cy0 - hubR * 0.9;
  const spokeEndY = rimY + handleIn * 0.65;

  const sparkR = outerR; // travel along rim
  const sparkC = 2 * Math.PI * sparkR;
  const sparkDash = Math.max(6, sparkC * 0.06);

  const ids = React.useMemo(
    () => ({
      softShadow: `shipwheel-shadow-${uid}`,
      glow: `shipwheel-glow-${uid}`,
      rimGrad: `shipwheel-rimgrad-${uid}`,
      innerGrad: `shipwheel-innergrad-${uid}`,
    }),
    [uid]
  );

  const centerTransformStyle = React.useMemo(
    () =>
      ({
        transformBox: 'fill-box',
        transformOrigin: 'center',
      }) as React.CSSProperties,
    []
  );

  const wheelRotate = prefersReducedMotion ? undefined : { rotate: 360 };
  const wheelTransition = prefersReducedMotion
    ? undefined
    : { duration: baseSpeed, ease: 'linear' as const, repeat: Infinity as const };

  const pulseAnimate = prefersReducedMotion ? undefined : { scale: [1, 1.012, 1] };
  const pulseTransition = prefersReducedMotion
    ? undefined
    : { duration: Math.max(1.8, baseSpeed * 0.9), ease: 'easeInOut' as const, repeat: Infinity as const };

  const sparkAnimate = prefersReducedMotion ? undefined : { strokeDashoffset: [0, -sparkC] };
  const sparkTransition = prefersReducedMotion
    ? undefined
    : { duration: Math.max(0.2, baseSpeed * 0.72), ease: 'linear' as const, repeat: Infinity as const };

  return (
    <svg
      width={pxSize}
      height={pxSize}
      viewBox="0 0 100 100"
      className={cx(
        // Default "wood-ish" look via currentColor; easy to theme by setting text-*.
        'pointer-events-none select-none text-amber-700 drop-shadow-sm',
        className
      )}
      fill="none"
      role="img"
      aria-hidden="true"
      focusable="false"
      shapeRendering="geometricPrecision"
    >
      <defs>
        <filter id={ids.softShadow} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0.6" stdDeviation="0.8" floodColor="black" floodOpacity="0.18" />
        </filter>

        <filter id={ids.glow} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Subtle depth using currentColor opacity shifts */}
        <linearGradient id={ids.rimGrad} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.95" />
          <stop offset="0.55" stopColor="currentColor" stopOpacity="0.68" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.92" />
        </linearGradient>

        <linearGradient id={ids.innerGrad} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.9" />
          <stop offset="0.5" stopColor="currentColor" stopOpacity="0.6" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.85" />
        </linearGradient>
      </defs>

      {/* Micro "wood bounce" pulse (very subtle) */}
      <motion.g style={centerTransformStyle} animate={pulseAnimate} transition={pulseTransition}>
        {/* Continuous wheel rotation */}
        <motion.g style={centerTransformStyle} animate={wheelRotate} transition={wheelTransition} filter={`url(#${ids.softShadow})`}>
          {/* Outer rim */}
          <circle
            cx={cx0}
            cy={cy0}
            r={outerR}
            stroke={`url(#${ids.rimGrad})`}
            strokeWidth={strokeOuter}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.95}
          />
          {/* Outer rim highlight */}
          <circle
            cx={cx0}
            cy={cy0}
            r={outerR}
            stroke="white"
            strokeOpacity={0.22}
            strokeWidth={Math.max(0.8, strokeOuter * 0.22)}
            strokeLinecap="round"
          />

          {/* Inner ring */}
          <circle
            cx={cx0}
            cy={cy0}
            r={innerR}
            stroke={`url(#${ids.innerGrad})`}
            strokeWidth={strokeInner}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.9}
          />
          {/* Hub */}
          <circle
            cx={cx0}
            cy={cy0}
            r={hubR}
            stroke="currentColor"
            strokeOpacity={0.85}
            strokeWidth={Math.max(1, strokeInner * 0.9)}
            strokeLinecap="round"
          />
          <circle
            cx={cx0}
            cy={cy0}
            r={hubR * 0.42}
            stroke="white"
            strokeOpacity={0.18}
            strokeWidth={Math.max(0.8, strokeInner * 0.25)}
          />

          {/* Spokes + handles */}
          {Array.from({ length: spokeCount }).map((_, i) => {
            const angle = (360 / spokeCount) * i;
            return (
              <g key={i} transform={`rotate(${angle} ${cx0} ${cy0})`}>
                {/* Spoke */}
                <line
                  x1={cx0}
                  y1={spokeStartY}
                  x2={cx0}
                  y2={spokeEndY}
                  stroke="currentColor"
                  strokeOpacity={0.92}
                  strokeWidth={strokeSpoke}
                  strokeLinecap="round"
                />

                {/* Small “brace” near inner ring for a wood-joint feel */}
                <line
                  x1={cx0 - innerR * 0.18}
                  y1={cy0 - innerR * 0.03}
                  x2={cx0 + innerR * 0.18}
                  y2={cy0 - innerR * 0.03}
                  stroke="currentColor"
                  strokeOpacity={0.45}
                  strokeWidth={Math.max(0.7, strokeSpoke * 0.55)}
                  strokeLinecap="round"
                />

                {/* Handle (rounded rect) protruding beyond the rim */}
                <rect
                  x={handleRectX}
                  y={handleRectY}
                  width={handleW}
                  height={handleH}
                  rx={handleW * 0.45}
                  ry={handleW * 0.45}
                  stroke="currentColor"
                  strokeOpacity={0.92}
                  strokeWidth={Math.max(0.9, strokeSpoke * 0.9)}
                  fill="white"
                  fillOpacity={0.06}
                />
                {/* Tiny handle highlight */}
                <rect
                  x={handleRectX + handleW * 0.18}
                  y={handleRectY + handleH * 0.18}
                  width={handleW * 0.18}
                  height={handleH * 0.62}
                  rx={handleW * 0.09}
                  fill="white"
                  opacity={0.12}
                />
              </g>
            );
          })}
        </motion.g>
      </motion.g>

      {/* Rim spark highlight (slightly faster than wheel) */}
      <motion.circle
        cx={cx0}
        cy={cy0}
        r={sparkR}
        stroke="white"
        strokeOpacity={0.85}
        strokeWidth={Math.max(1, strokeOuter * 0.28)}
        strokeLinecap="round"
        strokeDasharray={`${sparkDash} ${sparkC}`}
        initial={{ strokeDashoffset: 0 }}
        animate={sparkAnimate}
        transition={sparkTransition}
        filter={`url(#${ids.glow})`}
      />
    </svg>
  );
};

export default ShipWheelFrame;

/**
 * Usage (wrap an avatar; frame only renders the SVG overlay):
 *
 * <div className="relative inline-flex">
 *   <img
 *     src="/avatar.png"
 *     alt="Avatar"
 *     className="h-20 w-20 rounded-full object-cover"
 *   />
 *   <ShipWheelFrame size={80} className="absolute inset-0" />
 * </div>
 */
