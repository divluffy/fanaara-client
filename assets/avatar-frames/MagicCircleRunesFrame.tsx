'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export type MagicCircleRunesFrameProps = {
  /** Pixel size of the SVG */
  size?: number;
  className?: string;
  /** Stroke thickness in SVG units (viewBox is 0..100). Default looks good for size ~84px. */
  thickness?: number;
  /** Base animation speed in seconds (lower = faster) */
  speed?: number;
  /** Number of runes distributed around the ring */
  runeCount?: number;
};

/**
 * MagicCircleRunesFrame
 * - SVG overlay only (no background)
 * - Outer/inner rings + rotating rune ring
 * - Inner ring pulses
 * - Small “activation” spark travels around (dashoffset)
 *
 * Usage (example):
 * // <div className="relative h-20 w-20">
 * //   <img className="h-full w-full rounded-full object-cover" src="/avatar.png" alt="" />
 * //   <MagicCircleRunesFrame className="absolute inset-0 text-cyan-300/90" />
 * // </div>
 */
export default function MagicCircleRunesFrame({
  size = 84,
  className,
  thickness = 5,
  speed = 6,
  runeCount = 16,
}: MagicCircleRunesFrameProps) {
  const reduceMotion = useReducedMotion();

  const safeRuneCount = Math.max(4, Math.floor(runeCount || 0));
  const safeSpeed = Math.max(0.2, Number.isFinite(speed) ? speed : 6);
  const t = Math.max(1, Number.isFinite(thickness) ? thickness : 5);

  // Geometry (viewBox 0..100)
  const pad = 1;
  const outerR = Math.max(10, 50 - t / 2 - pad);
  const innerR = Math.max(6, outerR - t * 2.2);
  const sparkR = Math.max(6, outerR - t * 0.35);
  const runeR = Math.max(6, outerR - t * 1.15);

  const circumference = 2 * Math.PI * sparkR;
  const sparkLen = Math.max(6, t * 1.8);
  const runeStroke = Math.max(1, t * 0.35);

  const ringStrokeClass = 'stroke-current';
  const subtleStrokeClass = 'stroke-current';
  const fillNone = 'fill-none';

  const runePatterns = React.useCallback(
    (idx: number) => {
      const s = 6.8; // rune "size"
      const a = s * 0.55;
      const b = s * 0.2;

      // Simple glyphs built from lines + dots (no fonts)
      switch (idx % 8) {
        case 0:
          // Staff + two dots
          return (
            <>
              <path d={`M 0 ${-a} L 0 ${a}`} />
              <circle cx={-b * 1.6} cy={-a * 0.25} r={0.9} />
              <circle cx={b * 1.6} cy={a * 0.25} r={0.9} />
            </>
          );
        case 1:
          // Triangle + dot
          return (
            <>
              <path d={`M 0 ${-a} L ${a * 0.9} ${a} L ${-a * 0.9} ${a} Z`} />
              <circle cx={0} cy={-a * 0.15} r={0.9} />
            </>
          );
        case 2:
          // Diagonal cross + dot
          return (
            <>
              <path d={`M ${-a} ${-a} L ${a} ${a}`} />
              <path d={`M ${-a} ${a} L ${a} ${-a}`} />
              <circle cx={0} cy={0} r={0.8} />
            </>
          );
        case 3:
          // Hook arc + dot
          return (
            <>
              <path d={`M ${-a * 0.9} ${-a * 0.2} Q 0 ${-a} ${a * 0.9} ${-a * 0.2}`} />
              <path d={`M 0 ${-a * 0.2} L 0 ${a}`} />
              <circle cx={a * 0.9} cy={a * 0.3} r={0.85} />
            </>
          );
        case 4:
          // Fork (Y) + base dot
          return (
            <>
              <path d={`M 0 ${a} L 0 ${-a * 0.15}`} />
              <path d={`M 0 ${-a * 0.15} L ${-a * 0.85} ${-a}`} />
              <path d={`M 0 ${-a * 0.15} L ${a * 0.85} ${-a}`} />
              <circle cx={0} cy={a * 0.75} r={0.8} />
            </>
          );
        case 5:
          // Diamond + small ticks
          return (
            <>
              <path d={`M 0 ${-a} L ${a} 0 L 0 ${a} L ${-a} 0 Z`} />
              <path d={`M ${-a * 1.05} 0 L ${-a * 0.65} 0`} />
              <path d={`M ${a * 0.65} 0 L ${a * 1.05} 0`} />
            </>
          );
        case 6:
          // Zigzag + dot
          return (
            <>
              <path d={`M ${-a} ${-a} L ${-a * 0.2} ${-a * 0.2} L ${-a * 0.9} ${a * 0.5} L ${a} ${a}`} />
              <circle cx={a * 0.65} cy={-a * 0.55} r={0.85} />
            </>
          );
        default:
          // Bar + three dots (constellation)
          return (
            <>
              <path d={`M ${-a} 0 L ${a} 0`} />
              <circle cx={-a * 0.5} cy={-a * 0.65} r={0.85} />
              <circle cx={a * 0.5} cy={-a * 0.2} r={0.85} />
              <circle cx={0} cy={a * 0.75} r={0.85} />
            </>
          );
      }
    },
    []
  );

  const runes = React.useMemo(() => {
    return Array.from({ length: safeRuneCount }, (_, i) => {
      const ang = (i / safeRuneCount) * Math.PI * 2;
      const x = 50 + Math.cos(ang) * runeR;
      const y = 50 + Math.sin(ang) * runeR;
      const rotDeg = (i / safeRuneCount) * 360 + 90; // tangent-ish

      return (
        <g key={i} transform={`translate(${x} ${y}) rotate(${rotDeg})`} className={fillNone}>
          <g
            className={`${subtleStrokeClass} ${fillNone}`}
            strokeWidth={runeStroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            opacity={0.95}
          >
            {runePatterns(i)}
          </g>
        </g>
      );
    });
  }, [safeRuneCount, runeR, runeStroke, runePatterns]);

  const rotateAnim = reduceMotion ? undefined : { rotate: 360 };
  const pulseAnim = reduceMotion ? undefined : { scale: [1, 1.06, 1], opacity: [0.6, 1, 0.6] };
  const sparkAnim = reduceMotion ? undefined : { strokeDashoffset: [0, -circumference] };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={['pointer-events-none', 'select-none', className].filter(Boolean).join(' ')}
      aria-hidden="true"
    >
      {/* Outer ring */}
      <circle
        cx="50"
        cy="50"
        r={outerR}
        className={`${ringStrokeClass} ${fillNone}`}
        strokeWidth={t}
        opacity={0.75}
        vectorEffect="non-scaling-stroke"
      />

      {/* Subtle inner detailing (static) */}
      <circle
        cx="50"
        cy="50"
        r={outerR - t * 0.9}
        className={`${ringStrokeClass} ${fillNone}`}
        strokeWidth={Math.max(1, t * 0.35)}
        opacity={0.45}
        vectorEffect="non-scaling-stroke"
        strokeDasharray="1.6 3.6"
      />

      {/* Inner ring (pulsing group) */}
      <motion.g
        style={{ transformOrigin: '50% 50%', transformBox: 'fill-box' as any }}
        animate={pulseAnim}
        transition={
          reduceMotion
            ? undefined
            : {
                duration: Math.max(1.2, safeSpeed * 0.55),
                repeat: Infinity,
                ease: 'easeInOut',
              }
        }
      >
        <circle
          cx="50"
          cy="50"
          r={innerR}
          className={`${ringStrokeClass} ${fillNone}`}
          strokeWidth={Math.max(1, t * 0.7)}
          opacity={0.85}
          vectorEffect="non-scaling-stroke"
        />
        <circle
          cx="50"
          cy="50"
          r={innerR - t * 0.85}
          className={`${ringStrokeClass} ${fillNone}`}
          strokeWidth={Math.max(1, t * 0.25)}
          opacity={0.35}
          vectorEffect="non-scaling-stroke"
          strokeDasharray="3 4"
        />
      </motion.g>

      {/* Rotating rune ring */}
      <motion.g
        style={{ transformOrigin: '50% 50%', transformBox: 'fill-box' as any }}
        animate={rotateAnim}
        transition={reduceMotion ? undefined : { duration: safeSpeed, repeat: Infinity, ease: 'linear' }}
      >
        {runes}
      </motion.g>

      {/* Activation spark traveling along the outer perimeter */}
      <motion.circle
        cx="50"
        cy="50"
        r={sparkR}
        className={`${ringStrokeClass} ${fillNone}`}
        strokeWidth={Math.max(1, t * 0.6)}
        opacity={0.9}
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
        strokeDasharray={`${sparkLen} ${Math.max(1, circumference - sparkLen)}`}
        animate={sparkAnim}
        transition={
          reduceMotion
            ? undefined
            : {
                duration: Math.max(0.8, safeSpeed * 0.9),
                repeat: Infinity,
                ease: 'linear',
              }
        }
      />

      {/* Tiny cardinal ticks (static) */}
      <g
        className={`${subtleStrokeClass} ${fillNone}`}
        strokeWidth={Math.max(1, t * 0.35)}
        opacity={0.55}
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
      >
        {/* N */}
        <path d={`M 50 ${50 - outerR} L 50 ${50 - outerR + t * 0.9}`} />
        {/* E */}
        <path d={`M ${50 + outerR} 50 L ${50 + outerR - t * 0.9} 50`} />
        {/* S */}
        <path d={`M 50 ${50 + outerR} L 50 ${50 + outerR - t * 0.9}`} />
        {/* W */}
        <path d={`M ${50 - outerR} 50 L ${50 - outerR + t * 0.9} 50`} />
      </g>
    </svg>
  );
}
