"use client";

import React, { useState } from "react";
import Modal from "@/components/Modal";
import { IconButton } from "@/design/IconButton";
import {
  IoSend,
  IoHeartOutline,
  IoHeart,
  IoChatbubbleOutline,
  IoEllipsisHorizontal,
} from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";

// --- Fake Data ---
const INITIAL_COMMENTS = [
  {
    id: 1,
    user: "LuffyFan_99",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Luffy",
    text: "That last episode's animation was absolutely insane! Studio Mappa really outdid themselves. 😭🔥",
    time: "2h ago",
    likes: 124,
    isLiked: false,
  },
  {
    id: 2,
    user: "Zoro_Swordsman",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Zoro",
    text: "Still waiting for the redemption arc... but the pacing is getting better.",
    time: "5h ago",
    likes: 42,
    isLiked: true,
  },
  {
    id: 3,
    user: "AnimeQueen",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Sakura",
    text: "Does anyone know the name of the OST playing at 14:20? It sounds so familiar!",
    time: "1d ago",
    likes: 12,
    isLiked: false,
  },
];

interface CommentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AnimeCommentsModal({
  open,
  onOpenChange,
}: CommentsModalProps) {
  const [comments, setComments] = useState(INITIAL_COMMENTS);
  const [inputValue, setInputValue] = useState("");

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newComment = {
      id: Date.now(),
      user: "You", // Current user
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix",
      text: inputValue,
      time: "Just now",
      likes: 0,
      isLiked: false,
    };

    setComments([newComment, ...comments]);
    setInputValue("");
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={
        <div className="flex items-center gap-2">
          <span>Comments</span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent">
            {comments.length}
          </span>
        </div>
      }
      preset="comments" // Uses the specific preset from your Modal logic
      maxWidthClass="max-w-xl"
      contentPadding="none"
      footer={
        <div className="flex items-end gap-3 w-full">
          <div className="relative flex-1">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Write a comment..."
              className={cn(
                "w-full resize-none rounded-2xl border border-border-subtle bg-surface-soft px-4 py-2.5 text-sm",
                "focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50",
                "transition-all duration-200 min-h-[44px] max-h-[120px]",
              )}
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
          </div>
          <IconButton
            variant="gradient"
            gradient="sunset" // Using your button-theme gradients
            size="md"
            aria-label="Send comment"
            onClick={handleSend}
            disabled={!inputValue.trim()}
          >
            <IoSend className="translate-x-0.5" />
          </IconButton>
        </div>
      }
    >
      <div className="flex flex-col">
        <AnimatePresence initial={false}>
          {comments.map((comment, index) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              isFirst={index === 0}
            />
          ))}
        </AnimatePresence>
      </div>
    </Modal>
  );
}

// --- Sub-component: Comment Item ---
function CommentItem({ comment, isFirst }: { comment: any; isFirst: boolean }) {
  const [liked, setLiked] = useState(comment.isLiked);

  return (
    <motion.div
      initial={isFirst ? { opacity: 0, y: -20, height: 0 } : false}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      className="group relative flex gap-3 border-b border-border-subtle/30 px-4 py-4 last:border-0 hover:bg-white/[0.02] transition-colors"
    >
      {/* Avatar */}
      <div className="relative h-10 w-10 flex-shrink-0">
        <img
          src={comment.avatar}
          alt={comment.user}
          className="h-full w-full rounded-full border border-border-subtle bg-surface-strong object-cover"
        />
        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background-elevated bg-green-500" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground-strong">
              {comment.user}
            </span>
            <span className="text-[11px] text-foreground-muted">
              {comment.time}
            </span>
          </div>
          <IconButton
            variant="plain"
            size="xs"
            aria-label="More options"
            tone="neutral"
          >
            <IoEllipsisHorizontal className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </IconButton>
        </div>

        <p className="text-sm leading-relaxed text-foreground/90">
          {comment.text}
        </p>

        {/* Actions */}
        <div className="mt-2 flex items-center gap-4">
          <button
            onClick={() => setLiked(!liked)}
            className={cn(
              "flex items-center gap-1.5 text-xs font-medium transition-colors",
              liked
                ? "text-danger"
                : "text-foreground-muted hover:text-foreground",
            )}
          >
            {liked ? (
              <IoHeart className="text-sm" />
            ) : (
              <IoHeartOutline className="text-sm" />
            )}
            {comment.likes + (liked && !comment.isLiked ? 1 : 0)}
          </button>

          <button className="flex items-center gap-1.5 text-xs font-medium text-foreground-muted hover:text-foreground transition-colors">
            <IoChatbubbleOutline className="text-sm" />
            Reply
          </button>
        </div>
      </div>
    </motion.div>
  );
}
