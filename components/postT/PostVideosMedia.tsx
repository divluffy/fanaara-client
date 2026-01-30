"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Dir } from "@/types";
import type { VideoSource } from "./types";
import { CountryBadge, HeartPopup, LikedIndicator } from "./postMediaUi";

export default function PostVideosMedia({
  source,
  direction,
  countryCode,
  liked = false,
  onToggleLike,
}: {
  source: VideoSource;
  direction: Dir;
  countryCode?: string;
  liked?: boolean;
  onToggleLike?: (next: boolean) => void;
}) {
  const [heart, setHeart] = useState(false);

  // ✅ same double tap logic (safe for mobile)
  const lastTapRef = useRef<number>(0);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  function triggerLikeWarm() {
    setHeart(true);
    window.setTimeout(() => setHeart(false), 520);
    onToggleLike?.(!liked);
  }

  function onPointerDown(e: React.PointerEvent) {
    if (e.pointerType === "touch") {
      const now = Date.now();
      const prev = lastTapRef.current;
      const pos = { x: e.clientX, y: e.clientY };
      const prevPos = lastPosRef.current;

      lastTapRef.current = now;
      lastPosRef.current = pos;

      const dt = now - prev;
      const moved = prevPos ? Math.hypot(pos.x - prevPos.x, pos.y - prevPos.y) : 999;

      if (dt > 40 && dt < 260 && moved < 14) {
        triggerLikeWarm();
      }
    }
  }

  const heightClass = "h-[320px] sm:h-[360px] md:h-[420px]";

  return (
    <motion.div
      className={[
        "relative w-full rounded-2xl overflow-hidden",
        "bg-black/10 border border-card-border",
        heightClass,
      ].join(" ")}
      dir={direction}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      onPointerDown={onPointerDown}
      onDoubleClick={(e) => {
        if ((e as any).pointerType !== "touch") triggerLikeWarm();
      }}
    >
      <CountryBadge direction={direction} countryCode={countryCode} />
      <LikedIndicator direction={direction} show={!!liked} />
      <HeartPopup show={heart} />

      {/* ✅ Full width always */}
      <video
        src={source.mp4}
        poster={source.poster}
        controls
        playsInline
        preload="metadata"
        className="w-full h-full object-cover outline-none"
      />
    </motion.div>
  );
}
