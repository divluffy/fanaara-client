"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, MessageCircle, Share2, 
  Bookmark, Zap, ShieldCheck, Swords,
  MoreVertical, ChevronRight
} from "lucide-react";
import { cn } from "@/utils/cn";
import { Avatar } from "@/design/Avatar";
import { IconButton } from "@/design/IconButton";

export default function AnimePostMobileOptimized() {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  return (
    <div className="flex min-h-screen items-start justify-center bg-[var(--bg-page)] sm:items-center sm:p-6">
      <motion.article
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "relative flex flex-col bg-[var(--bg-elevated)]",
          "w-full sm:max-w-[480px] sm:rounded-[3rem] sm:border sm:border-[var(--border-strong)] sm:shadow-[var(--shadow-2xl)]",
          "overflow-hidden transition-all duration-300"
        )}
      >
        {/* --- Manga Screen-tone Background (Subtle Texture) --- */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

        {/* --- Header: Identity & Rank --- */}
        <header className="relative z-10 flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar 
                src="https://images.unsplash.com/photo-1541562232579-512a21359920?q=80&w=1000&auto=format&fit=crop" 
                size="12" 
                className="border-2 border-[var(--brand-aqua)] p-0.5"
              />
              <div className="absolute -bottom-1 -right-1 rounded-full bg-[var(--brand-solid)] p-1 text-[8px] text-white ring-2 ring-[var(--bg-elevated)]">
                <Zap size={10} fill="currentColor" />
              </div>
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-sm font-black uppercase tracking-tight text-[var(--fg-strong)]">Jin_Woo</span>
                <ShieldCheck size={14} className="text-[var(--brand-aqua)]" />
              </div>
              {/* Anime Rank Title */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-[var(--brand-teal)] uppercase tracking-widest">S-Rank Shadow Monarch</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <IconButton variant="plain" aria-label="More" size="sm" className="text-[var(--fg-soft)]">
              <MoreVertical size={20} />
            </IconButton>
          </div>
        </header>

        {/* --- Main Image: Cinematic Focus --- */}
        <div className="relative w-full overflow-hidden sm:px-3">
          <div className="relative aspect-[4/5] w-full overflow-hidden sm:rounded-[2rem]">
            <Image
              src="https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=1000&auto=format&fit=crop"
              alt="Solo Leveling Style Art"
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
              priority
            />
            
            {/* Rank Overlay Badge */}
            <div className="absolute top-4 left-4 flex flex-col gap-1">
                <div className="bg-black/80 backdrop-blur-md border-l-4 border-[var(--brand-aqua)] px-3 py-1 text-[10px] font-black text-white italic tracking-tighter">
                   POWER LEVEL: 99,999+
                </div>
            </div>

            {/* Bottom Gradient for Text contrast */}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent" />
            
            <div className="absolute bottom-5 left-6 right-6">
                <h2 className="text-lg font-black text-white leading-tight uppercase italic group-hover:text-[var(--brand-aqua)] transition-colors">
                  The gate has opened.
                </h2>
                <div className="flex items-center gap-2 mt-1">
                   <div className="h-1 w-8 bg-[var(--brand-aqua)] rounded-full" />
                   <span className="text-[10px] font-bold text-gray-300 tracking-widest">DUNGEON RAID • EP 42</span>
                </div>
            </div>
          </div>
        </div>

        {/* --- Simplified Content --- */}
        <div className="px-6 py-4">
          <p className="text-[14px] leading-snug text-[var(--fg-muted)] line-clamp-2">
            The final boss of the C-rank dungeon was actually a disguised Dragon Sovereign. 
            The visual effects in this chapter are peak... 
          </p>
        </div>

        {/* --- Action Bar: Anime-Type Interaction --- */}
        <footer className="flex items-center justify-between px-4 pb-6 pt-2">
          <div className="flex items-center gap-1 bg-[var(--surface-soft)] rounded-full px-2 py-1">
            <div className="flex items-center gap-1">
                <IconButton
                    variant={isLiked ? "soft" : "plain"}
                    tone={isLiked ? "danger" : "neutral"}
                    aria-label="Like"
                    size="md"
                    onClick={() => setIsLiked(!isLiked)}
                    className="hover:bg-transparent"
                >
                    <Heart className={cn(isLiked ? "fill-current scale-110" : "scale-100", "transition-transform")} size={22} />
                </IconButton>
                <span className={cn("text-xs font-black pr-2", isLiked ? "text-[var(--danger-600)]" : "text-[var(--fg-soft)]")}>
                    12.5K
                </span>
            </div>

            <div className="w-px h-4 bg-[var(--border-subtle)]" />

            <div className="flex items-center gap-1">
                <IconButton variant="plain" aria-label="Comment" size="md">
                    <MessageCircle size={22} />
                </IconButton>
                <span className="text-xs font-black text-[var(--fg-soft)] pr-2">432</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <IconButton 
                variant="plain" 
                aria-label="Share" 
                size="md" 
                className="text-[var(--fg-soft)] hover:text-[var(--brand-aqua)]"
            >
                <Share2 size={20} />
            </IconButton>
            
            <div 
                onClick={() => setIsSaved(!isSaved)}
                className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-xl cursor-pointer transition-all duration-300",
                    isSaved ? "bg-[var(--brand-solid)] text-white shadow-[0_0_15px_var(--brand-soft-ring)]" : "bg-[var(--surface-muted)] text-[var(--fg-soft)]"
                )}
            >
                <Bookmark size={20} className={isSaved ? "fill-current" : ""} />
            </div>
          </div>
        </footer>

        {/* --- Visual Accent: Brand Corner --- */}
        <div className="absolute top-0 right-0 overflow-hidden w-16 h-16 pointer-events-none">
            <div className="absolute top-[-25px] right-[-25px] w-[50px] h-[50px] rotate-45 bg-[var(--brand-soft-bg)] border border-[var(--brand-soft-border)]" />
        </div>
      </motion.article>
    </div>
  );
}