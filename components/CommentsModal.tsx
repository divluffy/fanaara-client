"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import Modal from "@/components/Modal";
import { IconButton } from "@/design/IconButton";
import {
  IoSend,
  IoHeartOutline,
  IoHeart,
  IoChatbubbleOutline,
  IoEllipsisHorizontal,
  IoSparkles,
  IoFlame,
  IoTimeOutline,
} from "react-icons/io5";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/utils/cn";

/* ---------------------------------------------
  Fake Data (same idea, slightly richer fields)
---------------------------------------------- */
type Comment = {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
  likes: number;
  isLiked: boolean;
  replies?: Comment[];
};

const INITIAL_COMMENTS: Comment[] = [
  {
    id: "c1",
    user: "LuffyFan_99",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Luffy",
    text: "That last episode's animation was absolutely insane! Studio Mappa really outdid themselves. 😭🔥",
    time: "2h ago",
    likes: 124,
    isLiked: false,
    replies: [
      {
        id: "c1-r1",
        user: "Gear5Enjoyer",
        avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Gear5",
        text: "The sakuga cuts were wild. That impact frame 💀✨",
        time: "1h ago",
        likes: 18,
        isLiked: false,
      },
    ],
  },
  {
    id: "c2",
    user: "Zoro_Swordsman",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Zoro",
    text: "Still waiting for the redemption arc... but the pacing is getting better.",
    time: "5h ago",
    likes: 42,
    isLiked: true,
  },
  {
    id: "c3",
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

type SortMode = "new" | "top";

/* ---------------------------------------------
  Small hook: auto-resize textarea (no deps)
---------------------------------------------- */
function useAutoResizeTextarea(value: string) {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  const sync = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    const next = Math.min(el.scrollHeight, 140);
    el.style.height = `${next}px`;
  }, []);

  React.useEffect(() => {
    sync();
  }, [value, sync]);

  return { ref, sync };
}

/* ---------------------------------------------
  Main
---------------------------------------------- */
export default function AnimeCommentsModalV2({
  open,
  onOpenChange,
}: CommentsModalProps) {
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
  const [inputValue, setInputValue] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("new");
  const [replyTo, setReplyTo] = useState<{ id: string; user: string } | null>(
    null,
  );

  const { ref: textareaRef } = useAutoResizeTextarea(inputValue);

  const totalCount = useMemo(() => {
    const repliesCount = comments.reduce(
      (acc, c) => acc + (c.replies?.length ?? 0),
      0,
    );
    return comments.length + repliesCount;
  }, [comments]);

  const sortedComments = useMemo(() => {
    // "new" = current array order (newest on top)
    // "top" = by likes (comments only; replies stay under parent)
    if (sortMode === "new") return comments;

    return [...comments].sort((a, b) => {
      const aScore = a.likes + (a.isLiked ? 1 : 0);
      const bScore = b.likes + (b.isLiked ? 1 : 0);
      return bScore - aScore;
    });
  }, [comments, sortMode]);

  const handleSend = useCallback(() => {
    const text = inputValue.trim();
    if (!text) return;

    const newItem: Comment = {
      id: `c-${Date.now()}`,
      user: "You",
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix",
      text,
      time: "Just now",
      likes: 0,
      isLiked: false,
    };

    setComments((prev) => {
      if (replyTo) {
        return prev.map((c) => {
          if (c.id !== replyTo.id) return c;
          const nextReplies = [newItem, ...(c.replies ?? [])];
          return { ...c, replies: nextReplies };
        });
      }
      return [newItem, ...prev];
    });

    setInputValue("");
    setReplyTo(null);
  }, [inputValue, replyTo]);

  const toggleLike = useCallback((id: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextLiked = !c.isLiked;
          return {
            ...c,
            isLiked: nextLiked,
            likes: c.likes + (nextLiked ? 1 : -1),
          };
        }
        if (c.replies?.length) {
          const idx = c.replies.findIndex((r) => r.id === id);
          if (idx === -1) return c;
          const r = c.replies[idx];
          const nextLiked = !r.isLiked;
          const nextReplies = [...c.replies];
          nextReplies[idx] = {
            ...r,
            isLiked: nextLiked,
            likes: r.likes + (nextLiked ? 1 : -1),
          };
          return { ...c, replies: nextReplies };
        }
        return c;
      }),
    );
  }, []);

  const startReply = useCallback((id: string, user: string) => {
    setReplyTo({ id, user });
  }, []);

  const footerHint = useMemo(() => {
    if (replyTo) return `Replying to @${replyTo.user}`;
    return "Add your take";
  }, [replyTo]);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={
        <div className="flex w-full items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2">
              <IoSparkles className="text-accent" />
              <span className="font-semibold">Comments</span>
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent ring-1 ring-accent/20">
              {totalCount}
            </span>
          </div>

          {/* Sort pills (anime-ish “chip” style) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSortMode("new")}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition",
                "ring-1 ring-border-subtle/40 hover:ring-accent/30",
                sortMode === "new"
                  ? "bg-accent/15 text-accent"
                  : "text-foreground-muted bg-white/[0.03]",
              )}
            >
              <span className="inline-flex items-center gap-1.5">
                <IoTimeOutline className="text-[13px]" />
                New
              </span>
            </button>
            <button
              type="button"
              onClick={() => setSortMode("top")}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition",
                "ring-1 ring-border-subtle/40 hover:ring-accent/30",
                sortMode === "top"
                  ? "bg-accent/15 text-accent"
                  : "text-foreground-muted bg-white/[0.03]",
              )}
            >
              <span className="inline-flex items-center gap-1.5">
                <IoFlame className="text-[13px]" />
                Top
              </span>
            </button>
          </div>
        </div>
      }
      preset="comments"
      maxWidthClass="max-w-2xl"
      contentPadding="none"
      footer={
        <div className="w-full">
          {/* Reply banner */}
          <AnimatePresence>
            {replyTo && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className={cn(
                  "mb-2 flex items-center justify-between gap-3",
                  "rounded-2xl px-3 py-2",
                  "bg-white/[0.04] ring-1 ring-accent/15",
                )}
              >
                <div className="text-xs text-foreground-muted">
                  Replying to{" "}
                  <span className="font-semibold text-foreground">@{replyTo.user}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setReplyTo(null)}
                  className="text-xs font-semibold text-accent hover:opacity-80 transition"
                >
                  Cancel
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Composer */}
          <div className="flex items-end gap-3">
            <div className="relative flex-1">
              {/* Anime glass + subtle gradient ring */}
              <div
                className={cn(
                  "absolute -inset-[1px] rounded-[18px]",
                  "bg-gradient-to-r from-accent/35 via-fuchsia-500/15 to-cyan-400/20",
                  "opacity-70 blur-[1px]",
                )}
                aria-hidden="true"
              />
              <div
                className={cn(
                  "relative rounded-[18px] bg-surface-soft/80",
                  "ring-1 ring-border-subtle/50",
                  "backdrop-blur-md",
                )}
              >
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={`${footerHint}...`}
                  className={cn(
                    "w-full resize-none rounded-[18px] bg-transparent px-4 py-3 text-sm",
                    "text-foreground placeholder:text-foreground-muted/70",
                    "focus:outline-none focus:ring-2 focus:ring-accent/35",
                    "transition min-h-[48px] max-h-[140px]",
                  )}
                  rows={1}
                  onKeyDown={(e) => {
                    // Enter to send, Shift+Enter for newline
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <div className="flex items-center justify-between px-4 pb-2">
                  <span className="text-[11px] text-foreground-muted">
                    Enter to send • Shift+Enter for new line
                  </span>
                  <span className="text-[11px] text-foreground-muted">
                    {Math.min(inputValue.length, 999)}/999
                  </span>
                </div>
              </div>
            </div>

            <IconButton
              variant="gradient"
              gradient="sunset"
              size="md"
              aria-label="Send comment"
              onClick={handleSend}
              disabled={!inputValue.trim()}
            >
              <IoSend className="translate-x-0.5" />
            </IconButton>
          </div>
        </div>
      }
    >
      {/* Body: anime-ish background and better list UX */}
      <div className="relative">
        {/* Decorative backdrop */}
        <div
          className={cn(
            "pointer-events-none absolute inset-0",
            "bg-[radial-gradient(800px_circle_at_20%_10%,rgba(236,72,153,0.10),transparent_55%),radial-gradient(700px_circle_at_90%_30%,rgba(34,211,238,0.10),transparent_55%)]",
          )}
          aria-hidden="true"
        />

        <div className="relative max-h-[62vh] overflow-y-auto">
          {sortedComments.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <div className="mx-auto mb-3 h-10 w-10 rounded-2xl bg-white/[0.05] ring-1 ring-border-subtle/40 grid place-items-center">
                <IoChatbubbleOutline className="text-foreground-muted" />
              </div>
              <div className="text-sm font-semibold">No comments yet</div>
              <div className="text-xs text-foreground-muted mt-1">
                Be the first to drop a spicy take ✨
              </div>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {sortedComments.map((comment, index) => (
                <CommentThread
                  key={comment.id}
                  comment={comment}
                  isFirst={index === 0}
                  onLike={toggleLike}
                  onReply={startReply}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </Modal>
  );
}

/* ---------------------------------------------
  Thread (comment + replies)
---------------------------------------------- */
function CommentThread({
  comment,
  isFirst,
  onLike,
  onReply,
}: {
  comment: Comment;
  isFirst: boolean;
  onLike: (id: string) => void;
  onReply: (id: string, user: string) => void;
}) {
  return (
    <div className="border-b border-border-subtle/30 last:border-0">
      <CommentItem
        comment={comment}
        isFirst={isFirst}
        onLike={onLike}
        onReply={onReply}
        depth={0}
      />

      {!!comment.replies?.length && (
        <div className="pb-3">
          {comment.replies.map((r) => (
            <CommentItem
              key={r.id}
              comment={r}
              isFirst={false}
              onLike={onLike}
              onReply={onReply}
              depth={1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------
  Comment item
---------------------------------------------- */
function CommentItem({
  comment,
  isFirst,
  onLike,
  onReply,
  depth,
}: {
  comment: Comment;
  isFirst: boolean;
  onLike: (id: string) => void;
  onReply: (id: string, user: string) => void;
  depth: 0 | 1;
}) {
  const likeBurst = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.9, opacity: 0 },
  };

  return (
    <motion.div
      initial={isFirst ? { opacity: 0, y: -14 } : false}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group relative flex gap-3 px-4 py-4",
        "hover:bg-white/[0.025] transition-colors",
        depth === 1 && "ml-10 mr-4 rounded-2xl bg-white/[0.02] ring-1 ring-border-subtle/25",
      )}
    >
      {/* Side connector for replies */}
      {depth === 1 && (
        <div
          className="absolute -left-6 top-0 bottom-0 w-px bg-border-subtle/30"
          aria-hidden="true"
        />
      )}

      {/* Avatar (anime-ish ring) */}
      <div className="relative h-10 w-10 flex-shrink-0">
        <div
          className={cn(
            "absolute -inset-[1.5px] rounded-full",
            "bg-gradient-to-br from-accent/40 via-fuchsia-500/20 to-cyan-400/25",
            "blur-[0.5px] opacity-80",
          )}
          aria-hidden="true"
        />
        <img
          src={comment.avatar}
          alt={comment.user}
          className="relative h-full w-full rounded-full border border-border-subtle bg-surface-strong object-cover"
        />
        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background-elevated bg-green-500" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-extrabold text-foreground-strong tracking-tight">
              {comment.user}
            </span>

            {/* Tiny “badge” vibe */}
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/[0.04] ring-1 ring-border-subtle/35 text-foreground-muted">
              senpai
            </span>

            <span className="text-[11px] text-foreground-muted">{comment.time}</span>
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

        <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
          {comment.text}
        </p>

        {/* Actions */}
        <div className="mt-2 flex items-center gap-5">
          <button
            type="button"
            onClick={() => onLike(comment.id)}
            className={cn(
              "relative inline-flex items-center gap-1.5 text-xs font-semibold transition-colors",
              comment.isLiked
                ? "text-danger"
                : "text-foreground-muted hover:text-foreground",
            )}
            aria-pressed={comment.isLiked}
          >
            <span className="inline-flex items-center gap-1.5">
              {comment.isLiked ? (
                <IoHeart className="text-sm" />
              ) : (
                <IoHeartOutline className="text-sm" />
              )}
              {comment.likes}
            </span>

            {/* Small burst when liked */}
            <AnimatePresence>
              {comment.isLiked && (
                <motion.span
                  {...likeBurst}
                  className="pointer-events-none absolute -right-4 -top-3 text-[12px] text-accent"
                >
                  ✨
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <button
            type="button"
            onClick={() => onReply(depth === 1 ? findParentIdFallback() : comment.id, comment.user)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground-muted hover:text-foreground transition-colors"
          >
            <IoChatbubbleOutline className="text-sm" />
            Reply
          </button>
        </div>
      </div>
    </motion.div>
  );

  // NOTE:
  // If you want replies to replies, you’ll pass parentId explicitly.
  // For now, we keep it simple: only reply to top-level threads.
  function findParentIdFallback() {
    return comment.id;
  }
}
