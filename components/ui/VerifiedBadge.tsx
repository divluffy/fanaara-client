// components\ui\VerifiedBadge.tsx
import * as React from "react";

type VerifiedBadgeProps = {
  /** Badge size in px */
  size?: number;
  /** Extra classes (useful for positioning: absolute, etc.) */
  className?: string;
  /** Accessible label */
  label?: string;
};

export function VerifiedBadge({
  size = 18,
  className = "",
  label = "Verified",
}: VerifiedBadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center justify-center rounded-full",
        "shadow-sm",
        className,
      ].join(" ")}
      style={{ width: size, height: size }}
      aria-label={label}
      title={label}
      role="img"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className="block"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer ring */}
        <circle cx="12" cy="12" r="11.25" className="fill-white/90" />
        <circle cx="12" cy="12" r="10.25" fill="url(#animeGrad)" />

        {/* Subtle inner glow */}
        <circle cx="12" cy="12" r="7.25" className="fill-white/10" />

        {/* Brush-stroke check */}
        <path
          d="M7.3 12.5c1.2 1.2 2.2 2.3 3.2 3.5 2.4-3.2 4.8-5.5 7.2-7.4"
          stroke="white"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.98"
        />
        {/* Tiny sparkle star (anime touch) */}
        <path
          d="M6.9 7.1l.55 1.2 1.2.55-1.2.55-.55 1.2-.55-1.2-1.2-.55 1.2-.55.55-1.2z"
          fill="white"
          opacity="0.95"
        />

        {/* Crisp rim */}
        <circle
          cx="12"
          cy="12"
          r="10.25"
          className="stroke-white/40"
          strokeWidth="0.8"
        />

        <defs>
          <linearGradient
            id="animeGrad"
            x1="4"
            y1="20"
            x2="20"
            y2="4"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#06B6D4" />
            <stop offset="0.55" stopColor="#7C3AED" />
            <stop offset="1" stopColor="#F472B6" />
          </linearGradient>
        </defs>
      </svg>
    </span>
  );
}
