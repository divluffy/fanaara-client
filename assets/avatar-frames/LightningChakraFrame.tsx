"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

export type LightningChakraFrameProps = {
  size?: number; // default 78
  className?: string;
  thickness?: number; // default 6
  speed?: number; // default 2.6
  bolts?: number; // default 6
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

// Deterministic tiny RNG (stable between renders)
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function polar(cx: number, cy: number, r: number, aRad: number) {
  return { x: cx + r * Math.cos(aRad), y: cy + r * Math.sin(aRad) };
}

function lightningArcPath(params: {
  cx: number;
  cy: number;
  r: number;
  a0: number;
  a1: number;
  jag: number;
  steps: number;
  seed: number;
}) {
  const { cx, cy, r, a0, a1, jag, steps, seed } = params;
  const rand = mulberry32(seed);

  const pts: Array<{ x: number; y: number }> = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = a0 + (a1 - a0) * t;

    // alternate radius in/out + slight randomness to feel "electric"
    const alt = i % 2 === 0 ? -1 : 1;
    const jitter = (rand() - 0.5) * jag * 0.45;
    const rr = r + alt * jag + jitter;

    pts.push(polar(cx, cy, rr, a));
  }

  // "M x y L x y ..."
  return pts.reduce((d, p, idx) => d + `${idx === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)} `, "").trim();
}

export function LightningChakraFrame({
  size = 78,
  className,
  thickness = 6,
  speed = 2.6,
  bolts = 6,
}: LightningChakraFrameProps) {
  const reduce = useReducedMotion();
  const gid = React.useId();

  const boltCount = clamp(Math.round(bolts), 3, 18);
  const strokeW = clamp(thickness, 3, 10);

  // SVG coordinate space
  const cx = 50;
  const cy = 50;

  // ring radius
  const r = 50 - strokeW / 2 - 2;

  // ring segmentation
  const full = Math.PI * 2;
  const seg = full / boltCount;
  const gap = seg * 0.22; // gap between segments
  const arcSpan = seg - gap;

  // lightning jaggedness (in SVG units)
  const jag = clamp(2 + strokeW * 0.35, 2.5, 6);

  const boltPaths = React.useMemo(() => {
    const out: Array<{ d: string; idx: number }> = [];
    for (let i = 0; i < boltCount; i++) {
      const a0 = i * seg + gap * 0.5;
      const a1 = a0 + arcSpan;

      // Build a short jagged stroke along the rim
      const d = lightningArcPath({
        cx,
        cy,
        r,
        a0,
        a1,
        jag,
        steps: 6,
        seed: 1000 + i * 17,
      });

      out.push({ d, idx: i });
    }
    return out;
  }, [boltCount, seg, gap, arcSpan, cx, cy, r, jag]);

  const arcsCount = boltCount >= 6 ? 3 : 2;
  const arcs = React.useMemo(() => {
    // fixed relative positions so it feels designed, not random
    const anchors = arcsCount === 3 ? [0.14, 0.53, 0.83] : [0.22, 0.72];

    return anchors.map((k, i) => {
      const aMid = k * full;
      const span = seg * (0.42 + i * 0.06);

      // Tiny “jump” sits slightly outside the ring and zigzags
      const rr = r + strokeW * 0.35;
      const d = lightningArcPath({
        cx,
        cy,
        r: rr,
        a0: aMid - span * 0.5,
        a1: aMid + span * 0.5,
        jag: jag * 0.85,
        steps: 4,
        seed: 2200 + i * 31,
      });

      return { d, idx: i };
    });
  }, [arcsCount, full, seg, cx, cy, r, strokeW, jag]);

  // Animation timing
  const rotDuration = clamp(speed * 2.15, 1.6, 8.5);
  const flickerDuration = clamp(speed * 0.9, 0.9, 6);
  const arcBlinkDuration = clamp(speed * 0.55, 0.65, 4.5);

  const baseClass =
    "pointer-events-none select-none will-change-transform";
  const svgClass = [baseClass, className].filter(Boolean).join(" ");

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={svgClass}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${gid}-bolt`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9AE6FF" stopOpacity="0.95" />
          <stop offset="0.55" stopColor="#FDE68A" stopOpacity="0.95" />
          <stop offset="1" stopColor="#60A5FA" stopOpacity="0.9" />
        </linearGradient>

        <linearGradient id={`${gid}-soft`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FDE68A" stopOpacity="0.22" />
          <stop offset="1" stopColor="#93C5FD" stopOpacity="0.16" />
        </linearGradient>
      </defs>

      {/* Subtle base ring to keep the frame readable even between flickers */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={`url(#${gid}-soft)`}
        strokeWidth={Math.max(1, strokeW * 0.9)}
        opacity={0.85}
      />

      {/* Rotating segmented lightning layer */}
      <motion.g
        style={{ transformOrigin: "50px 50px" }}
        animate={
          reduce
            ? undefined
            : { rotate: 360 }
        }
        transition={
          reduce
            ? undefined
            : { duration: rotDuration, ease: "linear", repeat: Infinity }
        }
      >
        {boltPaths.map(({ d, idx }) => {
          const delay = (idx / boltCount) * (flickerDuration * 0.55);

          return (
            <g key={idx}>
              {/* faux glow stroke (no filters) */}
              <motion.path
                d={d}
                fill="none"
                stroke={`url(#${gid}-bolt)`}
                strokeWidth={strokeW + 2}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={reduce ? 0.35 : 0.18}
                animate={
                  reduce
                    ? undefined
                    : {
                        opacity: [0.12, 0.28, 0.12],
                        scale: [1, 1.02, 1],
                      }
                }
                transform={`translate(${cx} ${cy}) translate(${-cx} ${-cy})`}
                transition={
                  reduce
                    ? undefined
                    : {
                        duration: flickerDuration,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay,
                      }
                }
              />

              {/* main lightning stroke */}
              <motion.path
                d={d}
                fill="none"
                stroke={`url(#${gid}-bolt)`}
                strokeWidth={strokeW}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={reduce ? 0.95 : 0.75}
                animate={
                  reduce
                    ? undefined
                    : {
                        opacity: [0.5, 1, 0.45, 0.95],
                        scale: [1, 1.035, 1, 1.02],
                      }
                }
                transform={`translate(${cx} ${cy}) translate(${-cx} ${-cy})`}
                transition={
                  reduce
                    ? undefined
                    : {
                        duration: flickerDuration,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay,
                      }
                }
              />
            </g>
          );
        })}
      </motion.g>

      {/* Small electric arcs that blink sequentially */}
      <g>
        {arcs.map(({ d, idx }) => {
          const seqDelay = idx * (arcBlinkDuration * 0.55);
          return (
            <motion.path
              key={idx}
              d={d}
              fill="none"
              stroke={`url(#${gid}-bolt)`}
              strokeWidth={Math.max(1.6, strokeW * 0.55)}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={reduce ? 0.65 : 0}
              animate={
                reduce
                  ? undefined
                  : { opacity: [0, 1, 0] }
              }
              transition={
                reduce
                  ? undefined
                  : {
                      duration: arcBlinkDuration,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: seqDelay,
                      repeatDelay: arcBlinkDuration * 0.55,
                    }
              }
            />
          );
        })}
      </g>

      {/*
        Usage:
        <div className="relative h-20 w-20">
          <img src="/avatar.png" className="h-full w-full rounded-full object-cover" />
          <LightningChakraFrame className="absolute inset-0" />
        </div>
      */}
    </svg>
  );
}

export default LightningChakraFrame;
