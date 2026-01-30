"use client";

import React, { memo, useMemo, useState } from "react";
import { FiMessageCircle, FiShare } from "react-icons/fi";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { BsBookmarkFill, BsBookmark } from "react-icons/bs";

import ShareModal from "../ShareModal";
import { formatCount } from "./formatCount";
import SavesModal from "../SavesModal";
import NewSaveSheet from "../SavesModal";
import CommentsModal from "../CommentsModal";

type PostFooterProps = {
  postId: string;
  shareUrl: string;
  stats: {
    likes: number;
    comments: number;
    saves: number;
  };
  viewerState: {
    liked: boolean;
    saved: boolean;
  };
  locale: string;
  direction: "rtl" | "ltr";
  onLike?: () => void;
  onComment?: () => void;
  onSave?: () => void;
};

type ActionButtonProps = {
  active?: boolean;
  count?: number;
  locale: string;
  ariaLabel: string;
  onClick?: () => void;
  iconOn?: React.ReactNode; // Filled
  iconOff: React.ReactNode; // Outline
  activeClassName?: string; // e.g. "text-rose-500"
};

const ActionButton = memo(function ActionButton({
  active,
  count,
  locale,
  ariaLabel,
  onClick,
  iconOn,
  iconOff,
  activeClassName = "text-foreground",
}: ActionButtonProps) {
  const formatted = useMemo(() => {
    if (count === undefined) return null;
    return formatCount(count, locale);
  }, [count, locale]);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={!!active}
      className="
        group inline-flex items-center gap-2 rounded-lg px-3 py-2
        transition
        hover:bg-foreground/5 active:scale-95
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring/40
      "
    >
      <span
        className={[
          "text-[20px] transition-colors",
          active
            ? activeClassName
            : "text-foreground-soft group-hover:text-foreground",
        ].join(" ")}
      >
        {active ? (iconOn ?? iconOff) : iconOff}
      </span>

      {formatted !== null && (
        <span
          className={[
            "text-[12px] font-medium leading-none tabular-nums transition-colors",
            active ? "text-foreground-strong" : "text-foreground-soft",
          ].join(" ")}
        >
          {formatted}
        </span>
      )}
    </button>
  );
});

const PostFooter = ({
  postId, // (kept for future usage: optimistic updates / tracking)
  shareUrl,
  stats,
  viewerState,
  locale,
  direction,
  onLike,
}: PostFooterProps) => {
  const [openShare, setOpenShare] = useState(false);
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [open, setOpen] = useState(false);

  return (
    <footer dir={direction} className="mt-3 select-none">
      <div
        className="
          flex w-full items-center justify-between
          rounded-xl border border-card-border
          ring-1 ring-accent-ring/10
          bg-transparent px-1 py-1
        "
      >
        {/* Left: Interactions */}
        <div className="flex items-center gap-0.5">
          <ActionButton
            active={viewerState.liked}
            count={stats.likes}
            locale={locale}
            ariaLabel="Like"
            onClick={onLike}
            iconOff={<AiOutlineHeart />}
            iconOn={<AiFillHeart />} // ✅ Filled when active
            activeClassName="text-rose-500"
          />

          <ActionButton
            count={stats.comments}
            locale={locale}
            ariaLabel="Comment"
            onClick={() => setOpen(true)}
            iconOff={<FiMessageCircle />}
            activeClassName="text-sky-500"
          />

          <ActionButton
            active={viewerState.saved}
            count={stats.saves}
            locale={locale}
            ariaLabel="Save"
            onClick={() => setIsSaveOpen(true)}
            iconOff={<BsBookmark />}
            iconOn={<BsBookmarkFill />} // ✅ Filled when active
            activeClassName="text-amber-500"
          />
        </div>

        {/* Right: Share */}
        <div>
          <ActionButton
            locale={locale}
            ariaLabel="Share"
            onClick={() => setOpenShare(true)}
            iconOff={<FiShare />}
          />
        </div>
      </div>

      <CommentsModal
        open={open}
        onOpenChange={setOpen}
        context={{ title: "Comments", subtitle: "Discuss this episode ✨" }}
      />

      <ShareModal
        open={openShare}
        onOpenChange={setOpenShare}
        shareUrl={shareUrl}
      />

      <NewSaveSheet
        open={isSaveOpen}
        onOpenChange={setIsSaveOpen}
        item={{
          title: "Jujutsu Kaisen",
          subtitle: "Season 2 • Episode 13",
          thumbnail:
            "https://images.unsplash.com/photo-1762446263896-ac93605b47d8?auto=format&fit=crop&fm=jpg&q=80&w=2400",
        }}
        collections={[
          { id: "c_watch_later", name: "أشوفه لاحقًا", emoji: "🕒" },
          { id: "c_fights", name: "قتالات أسطورية", emoji: "⚔️" },
        ]}
        value={"collectionId"}
        onChange={() => null}
        onCreateCollection={(name) => {
          // UI now; later wire to backend
          console.log("create:", name);
        }}
      />
    </footer>
  );
};

export default PostFooter;
