// components/theme-toggle.tsx
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const theme = resolvedTheme ?? "light";
  const isDark = theme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  const iconBase =
    "absolute left-1/2 top-1/2 -translate-x-1/2 text-sm transition-transform transition-opacity duration-300 ease-out will-change-transform will-change-opacity";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      className={`
        group relative flex h-8 w-8 items-center justify-center
        rounded-full border border-border-subtle
        bg-surface/90 text-base
        shadow-[var(--shadow-md)]
        overflow-hidden cursor-pointer
        transition
        hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow-warning)]
        active:translate-y-0 active:scale-[0.94] active:shadow-none
        focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-accent-ring focus-visible:ring-offset-2
        focus-visible:ring-offset-background
      `}
    >
      {/* لمعة خفيفة تتحرك مع الهوفر */}
      <span
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0
          bg-[radial-gradient(circle_at_30%_0,var(--warning-soft-bg),transparent_55%)]
          opacity-0 transition-opacity duration-300
          group-hover:opacity-100
        "
      />

      {/* حاوية الأيقونتين + الأنيميشن العمودي */}
      <span className="relative z-10 flex h-5 w-5 items-center justify-center overflow-hidden">
        {/* الشمس: في اللايت بالمنتصف، في الدارك تنزل لتحت وتختفي */}
        <span
          className={
            iconBase +
            " " +
            (isDark
              ? "translate-y-full opacity-0 scale-75 rotate-6 text-warning-500"
              : "-translate-y-1/2 opacity-100 scale-100 rotate-0 text-warning-400")
          }
        >
          ☀️
        </span>

        {/* القمر: في اللايت فوق ومخفي، في الدارك ينزل للمنتصف ويظهر */}
        <span
          className={
            iconBase +
            " " +
            (isDark
              ? "-translate-y-1/2 opacity-100 scale-100 rotate-0 text-info-300"
              : "-translate-y-full opacity-0 scale-75 -rotate-6 text-info-400")
          }
        >
          🌙
        </span>
      </span>
    </button>
  );
}
