"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, MessageCircle, Share2, MoreHorizontal, 
  Bookmark, Zap, PlayCircle, Flame, ShieldCheck 
} from "lucide-react";
import { cn } from "@/utils/cn";
import { Avatar } from "@/design/Avatar";
import { IconButton } from "@/design/IconButton";

// --- Advanced Animation Variants ---
const postVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  hover: { scale: 1.01, transition: { duration: 0.2 } }
};

const heartVariants = {
  liked: { scale: [1, 1.4, 1], transition: { duration: 0.3 } },
  unliked: { scale: 1 }
};

export default function EnhancedAnimePost() {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  // --- Follow Mouse Spotlight Effect ---
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-page)] p-6">
      <motion.article
        ref={cardRef}
        onMouseMove={handleMouseMove}
        variants={postVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        className="group relative w-full max-w-[550px] overflow-hidden rounded-[2.5rem] border border-[var(--border-strong)] bg-[var(--bg-elevated)] shadow-[var(--shadow-2xl)]"
      >
        {/* --- Interactive Spotlight Glow --- */}
        <div 
          className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, var(--brand-soft-bg), transparent 40%)`,
          }}
        />

        {/* --- Header: User Identity --- */}
        <header className="relative z-10 flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <div className="group/avatar relative cursor-pointer">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-[var(--brand-aqua)] to-[var(--accent-orange)] opacity-0 blur transition-opacity duration-300 group-hover/avatar:opacity-60" />
              <Avatar 
                src="https://images.unsplash.com/photo-1578632292335-df3abbb0d586?q=80&w=1000&auto=format&fit=crop" 
                size="14" 
                className="relative border-2 border-[var(--bg-elevated)]"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-[15px] font-black tracking-tight text-[var(--fg-strong)]">TASH_DESIGN</h3>
                <ShieldCheck size={14} className="text-[var(--brand-aqua)]" />
              </div>
              <p className="text-xs font-medium text-[var(--fg-muted)]">Pro Artist • 12m ago</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
             <span className="flex items-center gap-1 rounded-full bg-[var(--warning-soft-bg)] px-2 py-1 text-[10px] font-bold text-[var(--warning-600)]">
                <Flame size={12} /> TRENDING
             </span>
             <IconButton variant="plain" aria-label="Menu" size="sm"><MoreHorizontal /></IconButton>
          </div>
        </header>

        {/* --- Visual Content Section --- */}
        <div className="relative mx-3 overflow-hidden rounded-[2rem] bg-black">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
            className="relative aspect-[4/5] w-full"
          >
            <Image
              src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1000&auto=format&fit=crop"
              alt="Anime Artwork"
              fill
              className="object-cover opacity-90 transition-opacity duration-300 group-hover:opacity-100"
            />
            
            {/* Overlay Badges */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6">
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex items-center gap-2 text-white"
              >
                <div className="h-1 w-12 rounded-full bg-[var(--brand-aqua)]" />
                <span className="text-sm font-bold tracking-widest uppercase">Cyberpunk Series</span>
              </motion.div>
            </div>

            {/* Floating Play Hint */}
            <div className="absolute right-4 top-4">
               <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-transform hover:scale-110 active:scale-95">
                  <PlayCircle size={20} />
               </div>
            </div>
          </motion.div>
        </div>

        {/* --- Content Description --- */}
        <div className="relative z-10 px-6 py-4">
          <p className="text-[15px] leading-relaxed text-[var(--fg-default)]">
            Finally finished this commission piece! The neon aesthetics of 
            <span className="mx-1 font-bold text-[var(--brand-teal)]">#NeoTokyo</span> 
            always hit different. What do you think of the line work? ⚡️
          </p>
        </div>

        {/* --- Modern Footer Action Bar --- */}
        <footer className="relative z-10 flex items-center justify-between border-t border-[var(--border-subtle)] bg-[var(--surface-soft)]/30 px-5 py-4 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            {/* Heart with Pop Animation */}
            <div className="flex items-center gap-1.5">
              <motion.div
                animate={isLiked ? "liked" : "unliked"}
                variants={heartVariants}
                onClick={() => setIsLiked(!isLiked)}
                className="cursor-pointer"
              >
                <IconButton
                  variant={isLiked ? "soft" : "plain"}
                  tone={isLiked ? "danger" : "neutral"}
                  aria-label="Like"
                  size="md"
                >
                  <Heart className={cn(isLiked && "fill-current")} />
                </IconButton>
              </motion.div>
              <span className={cn("text-xs font-bold", isLiked ? "text-[var(--danger-600)]" : "text-[var(--fg-soft)]")}>
                1.2k
              </span>
            </div>

            {/* Comment */}
            <div className="flex items-center gap-1.5">
              <IconButton variant="plain" aria-label="Comment" size="md">
                <MessageCircle />
              </IconButton>
              <span className="text-xs font-bold text-[var(--fg-soft)]">84</span>
            </div>

            <IconButton variant="plain" aria-label="Share" size="md">
              <Share2 />
            </IconButton>
          </div>

          <motion.div whileTap={{ y: -5 }}>
            <IconButton
              variant={isSaved ? "gradient" : "plain"}
              gradient="sunset"
              aria-label="Save"
              size="md"
              onClick={() => setIsSaved(!isSaved)}
              className={cn(isSaved ? "text-white" : "text-[var(--fg-soft)]")}
            >
              <Bookmark className={cn(isSaved && "fill-current")} />
            </IconButton>
          </motion.div>
        </footer>

        {/* --- Progress Bar (Bottom Edge) --- */}
        <div className="absolute bottom-0 h-[3px] w-full bg-[var(--border-subtle)]">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 3, repeat: Infinity }}
            className="h-full bg-gradient-to-r from-[var(--brand-aqua)] via-[var(--purple-500)] to-[var(--brand-aqua)]"
          />
        </div>
      </motion.article>
    </div>
  );
}