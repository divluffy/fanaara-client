"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Bookmark,
  Zap,
  PlayCircle,
} from "lucide-react";

// ============================================================================
// 1. RE-INTEGRATING YOUR PROVIDED COMPONENTS (Mocked Imports for Single File)
// ============================================================================

// In a real app, you would import these:
// import { Avatar } from "@/design/Avatar";
import { IconButton } from "@/design/IconButton";
import { Avatar } from "@/design";
// import { cn } from "@/utils/cn";

// --- TEMPORARY UTILS & MOCKS FOR DEMO PURPOSES ---
const cn = (...classes: (string | undefined | null | false)[]) =>
  classes.filter(Boolean).join(" ");

// --- YOUR AVATAR COMPONENT (Paste from your provided code if this was a real file,
// strictly importing here for the demo structure to work as requested in "one component")
// *Assuming the Avatar code you provided is available in the project* import { Avatar } from "./design/Avatar"; // Adjust path as needed

// ============================================================================
// 2. MOCK DATA (Real Anime Context)
// ============================================================================

const POST_DATA = {
  id: "post-101",
  author: {
    name: "Sakura_Senpai",
    handle: "@sakura_chan",
    avatarUrl:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=1889&auto=format&fit=crop", // Cosplay/Anime style
    rank: "S-Class",
    rankColor: "var(--brand-aqua)",
  },
  content: {
    title: "The visual evolution of Demon Slayer is absolute insanity! ⚔️🔥",
    body: "Just watched the latest Swordsmith Village arc finale. Ufotable is really flexing their budget here. The lighting composition during the mist pillar battle was...",
    image:
      "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?q=80&w=2070&auto=format&fit=crop", // Anime/Cyberpunk aesthetic
    tags: ["#DemonSlayer", "#KimetsuNoYaiba", "#Anime2025", "#Animation"],
    timestamp: "2 hours ago",
    readingTime: "5 min read",
  },
  stats: {
    likes: 1240,
    comments: 45,
    shares: 89,
    isLiked: false,
    isSaved: false,
  },
};

// ============================================================================
// 3. MAIN COMPONENT: AnimePostCard
// ============================================================================

export default function AnimePostCard() {
  const [isLiked, setIsLiked] = useState(POST_DATA.stats.isLiked);
  const [isSaved, setIsSaved] = useState(POST_DATA.stats.isSaved);
  const [likeCount, setLikeCount] = useState(POST_DATA.stats.likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[var(--bg-page)] p-4 font-sans text-[var(--fg-default)]">
      {/* --- CARD CONTAINER --- */}
      <article className="group/card relative w-full max-w-[600px] overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] shadow-[var(--shadow-xl)] transition-all duration-300 hover:shadow-[var(--shadow-glow-brand)] hover:border-[var(--brand-soft-border)]">
        {/* ---------------------------------------------------------
           SECTION 1: HEADER (User Info)
           --------------------------------------------------------- */}
        <header className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            {/* User Avatar with Ring Effect */}
            <div className="relative">
              <div className="absolute -inset-0.5 animate-pulse rounded-full bg-[var(--brand-aqua)] opacity-20 blur-sm"></div>
              <Avatar
                src={POST_DATA.author.avatarUrl}
                name={POST_DATA.author.name}
                size="12"
                className="ring-2 ring-[var(--surface-default)]"
              />
              {/* Online Dot */}
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[var(--surface-default)] bg-[var(--brand-solid)]"></span>
            </div>

            {/* Name & Meta */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-bold text-[var(--fg-strong)] hover:text-[var(--brand-aqua)] cursor-pointer transition-colors">
                  {POST_DATA.author.name}
                </span>
                {/* Rank Badge */}
                <span className="rounded-[4px] bg-[var(--brand-soft-bg)] px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[var(--brand-solid)]">
                  {POST_DATA.author.rank}
                </span>
              </div>
              <span className="text-xs text-[var(--fg-muted)]">
                {POST_DATA.author.handle} • {POST_DATA.content.timestamp}
              </span>
            </div>
          </div>

          {/* Menu Button */}
          <IconButton
            variant="plain"
            tone="neutral"
            size="sm"
            aria-label="More options"
            className="text-[var(--fg-soft)] hover:text-[var(--fg-strong)]"
          >
            <MoreHorizontal />
          </IconButton>
        </header>

        {/* ---------------------------------------------------------
           SECTION 2: CONTENT (Text)
           --------------------------------------------------------- */}
        <div className="px-5 pb-3">
          <h2 className="mb-2 text-lg font-bold leading-tight text-[var(--fg-strong)]">
            {POST_DATA.content.title}
          </h2>
          <p className="mb-3 text-[15px] leading-relaxed text-[var(--fg-muted)] line-clamp-2">
            {POST_DATA.content.body}
            <span className="cursor-pointer font-medium text-[var(--brand-aqua)] hover:underline ml-1">
              Read more
            </span>
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {POST_DATA.content.tags.map((tag) => (
              <span
                key={tag}
                className="cursor-pointer rounded-full border border-[var(--border-subtle)] px-2.5 py-1 text-[11px] font-medium text-[var(--fg-soft)] transition-colors hover:border-[var(--brand-subtle-ring)] hover:bg-[var(--brand-soft-bg)] hover:text-[var(--brand-solid)]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* ---------------------------------------------------------
           SECTION 3: MEDIA (Image + Overlays)
           --------------------------------------------------------- */}
        <div className="relative mt-2 aspect-video w-full overflow-hidden bg-[var(--mono-90)] cursor-pointer group-hover/card:shadow-inner">
          {/* Main Image with Zoom Effect */}
          <div className="relative h-full w-full transition-transform duration-700 ease-out group-hover/card:scale-105">
            <Image
              src={POST_DATA.content.image}
              alt="Anime post content"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 600px"
              priority
            />
          </div>

          {/* Gradient Overlay (For text readability if needed, or style) */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--mono-90)]/60 via-transparent to-transparent opacity-60"></div>

          {/* Type Badge (e.g., REVIEW or VIDEO) */}
          <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-[var(--surface-default)]/90 px-3 py-1.5 text-xs font-bold text-[var(--neutral-charcoal)] shadow-lg backdrop-blur-md">
            <Zap
              size={14}
              className="fill-[var(--accent-yellow)] text-[var(--accent-yellow)]"
            />
            <span>REVIEW</span>
          </div>

          {/* Play/View Overlay on Hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover/card:opacity-100 bg-black/20 backdrop-blur-[2px]">
            <div className="rounded-full bg-[var(--brand-solid)] p-3 text-white shadow-[var(--shadow-glow-brand)] transform scale-90 transition-transform group-hover/card:scale-100">
              <PlayCircle size={32} />
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------
           SECTION 4: ACTIONS (Footer)
           --------------------------------------------------------- */}
        <footer className="flex items-center justify-between border-t border-[var(--border-subtle)] bg-[var(--bg-subtle)]/50 px-4 py-3 backdrop-blur-sm">
          <div className="flex items-center gap-1">
            {/* Like Button */}
            <IconButton
              variant={isLiked ? "soft" : "plain"}
              tone={isLiked ? "danger" : "neutral"}
              size="md"
              aria-label="Like post"
              onClick={handleLike}
              className={cn(isLiked && "bg-[var(--danger-soft-bg)]")}
            >
              <Heart
                className={cn(
                  "transition-all duration-300",
                  isLiked
                    ? "fill-[var(--danger-500)] text-[var(--danger-500)] scale-110"
                    : "text-[var(--fg-soft)]",
                )}
              />
            </IconButton>
            <span
              className={cn(
                "min-w-[20px] text-sm font-semibold",
                isLiked ? "text-[var(--danger-600)]" : "text-[var(--fg-soft)]",
              )}
            >
              {likeCount}
            </span>

            {/* Comment Button */}
            <div className="ml-2 flex items-center gap-1">
              <IconButton
                variant="plain"
                tone="neutral"
                size="md"
                aria-label="Comment"
                className="group/btn"
              >
                <MessageCircle className="text-[var(--fg-soft)] transition-colors group-hover/btn:text-[var(--brand-teal)]" />
              </IconButton>
              <span className="text-sm font-medium text-[var(--fg-soft)]">
                {POST_DATA.stats.comments}
              </span>
            </div>

            {/* Share Button */}
            <IconButton
              variant="plain"
              tone="neutral"
              size="md"
              aria-label="Share"
              className="ml-1 group/btn"
            >
              <Share2 className="text-[var(--fg-soft)] transition-colors group-hover/btn:text-[var(--accent-amber)]" />
            </IconButton>
          </div>

          {/* Save/Bookmark */}
          <IconButton
            variant={isSaved ? "solid" : "plain"}
            tone={isSaved ? "neutral" : "neutral"} // Using brand color manually via class if needed
            size="md"
            aria-label="Save post"
            onClick={() => setIsSaved(!isSaved)}
            className={cn(
              isSaved
                ? "bg-[var(--brand-solid)] text-white shadow-[var(--shadow-glow-brand)]"
                : "text-[var(--fg-soft)] hover:text-[var(--brand-solid)]",
            )}
          >
            <Bookmark className={cn(isSaved ? "fill-white" : "")} />
          </IconButton>
        </footer>
      </article>
    </div>
  );
}
