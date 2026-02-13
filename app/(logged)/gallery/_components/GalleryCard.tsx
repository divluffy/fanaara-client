// app\(logged)\gallery\_components\GalleryCard.tsx
"use client";

import React, { memo, useMemo } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  IoAlbumsOutline,
  IoBookmark,
  IoBookmarkOutline,
  IoHeart,
  IoHeartOutline,
  IoShareSocialOutline,
} from "react-icons/io5";

import type { GalleryWork } from "./_data/galleryTypes";
import { cn, formatCompact } from "./_data/galleryUtils";
import { FollowBurstButton } from "@/components/ui/FollowBurstButton";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";

type Props = {
  work: GalleryWork;
  width: number;

  isLiked: boolean;
  isSaved: boolean;
  isFollowing: boolean;

  onOpen: (id: string) => void;
  onToggleLike: (id: string) => void;
  onToggleSave: (id: string) => void;
  onShare: (id: string) => void;

  onFollowRequest: (args: {
    userId: string;
    follow: boolean;
    signal?: AbortSignal;
  }) => Promise<void>;
};

export default memo(function GalleryCard({
  work,
  width,
  isLiked,
  isSaved,
  isFollowing,
  onOpen,
  onToggleLike,
  onToggleSave,
  onShare,
  onFollowRequest,
}: Props) {
  const reduce = useReducedMotion();
  const img = work.images[0];

  const sizes = useMemo(() => `${Math.round(width)}px`, [width]);

  const aspect = img ? `${img.width}/${img.height}` : "4/5";

  return (
    <motion.article
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-border-subtle bg-background-elevated",
        "shadow-[var(--shadow-xs)] transition-shadow hover:shadow-[var(--shadow-elevated)]",
      )}
      whileTap={reduce ? undefined : { scale: 0.99 }}
      transition={
        reduce
          ? { duration: 0 }
          : { type: "spring", stiffness: 520, damping: 34 }
      }
    >
      {/* Clickable media */}
      <button
        type="button"
        onClick={() => onOpen(work.id)}
        className="relative block w-full text-start"
        aria-label={`Open ${work.title}`}
      >
        <div
          className="relative w-full overflow-hidden bg-surface-soft"
          style={{
            aspectRatio: aspect,
            backgroundColor: img?.dominant ?? "#64748b",
          }}
        >
          <motion.div
            layoutId={`work-${work.id}-cover`}
            className="absolute inset-0"
          >
            <Image
              src={img?.src ?? work.images[0]?.src}
              alt={img?.alt ?? work.title}
              fill
              sizes={sizes}
              className={cn(
                "object-cover",
                !reduce &&
                  "transition-transform duration-700 ease-out group-hover:scale-[1.06]",
              )}
              quality={70}
              priority={false}
            />
          </motion.div>

          {/* cinematic overlays */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.10] [background:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.20)_1px,transparent_1px)] [background-size:18px_18px]" />

          {/* Multi badge */}
          {work.images.length > 1 && (
            <div className="absolute top-3 start-3 flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-2.5 py-1 text-[11px] font-black text-white backdrop-blur-md">
              <IoAlbumsOutline className="text-[14px]" />
              <span dir="ltr">{work.images.length}</span>
            </div>
          )}

          {/* Quick actions (hover) */}
          <div className="absolute top-3 end-3 flex flex-col gap-2 opacity-0 -translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
            <button
              type="button"
              className="grid size-10 place-items-center rounded-2xl border border-white/15 bg-black/35 text-white backdrop-blur-md hover:bg-black/45"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleLike(work.id);
              }}
              aria-label="Like"
            >
              {isLiked ? (
                <IoHeart className="text-[18px]" />
              ) : (
                <IoHeartOutline className="text-[18px]" />
              )}
            </button>

            <button
              type="button"
              className="grid size-10 place-items-center rounded-2xl border border-white/15 bg-black/35 text-white backdrop-blur-md hover:bg-black/45"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleSave(work.id);
              }}
              aria-label="Save"
            >
              {isSaved ? (
                <IoBookmark className="text-[18px]" />
              ) : (
                <IoBookmarkOutline className="text-[18px]" />
              )}
            </button>

            <button
              type="button"
              className="grid size-10 place-items-center rounded-2xl border border-white/15 bg-black/35 text-white backdrop-blur-md hover:bg-black/45"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onShare(work.id);
              }}
              aria-label="Share"
            >
              <IoShareSocialOutline className="text-[18px]" />
            </button>
          </div>

          {/* Title */}
          <div className="absolute bottom-16 inset-x-3">
            <div className="line-clamp-2 text-[12px] font-black text-white drop-shadow">
              {work.title}
            </div>

            <div className="mt-2 flex items-center gap-3 text-[11px] text-white/85">
              <span className="rounded-full border border-white/15 bg-black/25 px-2.5 py-1 font-black">
                ❤️{" "}
                <span dir="ltr" className="font-mono tabular-nums">
                  {formatCompact(work.likes)}
                </span>
              </span>
              <span className="rounded-full border border-white/15 bg-black/25 px-2.5 py-1 font-black">
                👁️{" "}
                <span dir="ltr" className="font-mono tabular-nums">
                  {formatCompact(work.views)}
                </span>
              </span>
            </div>
          </div>

          {/* Author (Bottom-Center) */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                {/* Use <img> for dicebear SVG remote safety */}
                <img
                  src={work.author.avatar}
                  alt={work.author.name}
                  className="size-12 rounded-full border border-white/25 bg-black/20 object-cover shadow-[var(--shadow-sm)]"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />

                {/* Follow on avatar (not standalone) */}
                <div className="absolute -bottom-1 -end-1">
                  <FollowBurstButton
                    userId={work.author.id}
                    following={isFollowing}
                    request={onFollowRequest}
                    size={26}
                    autoHideOnFollow={false}
                    shimmer
                    ripple
                    burst
                    idlePulse
                    showSpinner
                    ariaLabels={{
                      follow: "Follow user",
                      following: "Following",
                    }}
                  />
                </div>
              </div>

              <div className="max-w-[220px] text-center">
                <div className="inline-flex items-center justify-center gap-1.5">
                  <span className="truncate text-[12px] font-black text-white drop-shadow">
                    {work.author.name}
                  </span>
                  {work.author.verified && <VerifiedBadge size={16} />}
                </div>
                <div className="truncate text-[11px] text-white/75">
                  {work.author.username}
                </div>
              </div>
            </div>
          </div>
        </div>
      </button>
    </motion.article>
  );
});
