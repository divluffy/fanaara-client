"use client";

import React, { useMemo, useState } from "react";
import { Avatar } from "@/design";
import { IconButton } from "@/design/IconButton";
import { Send } from "lucide-react";

type CommentUser = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  rank?: string;
};

export type PostComment = {
  id: string;
  user: CommentUser;
  text: string;
  createdAtLabel: string; // e.g. "2h"
};

export type PostCommentsProps = {
  postId: string;
  comments: PostComment[];
  totalCount?: number;

  variant?: "inline" | "modal";
  maxVisibleInline?: number;

  showComposer?: boolean;
  onSubmit?: (text: string) => void;

  onViewAll?: () => void; // useful for inline variant
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function PostComments({
  postId,
  comments,
  totalCount,
  variant = "inline",
  maxVisibleInline = 2,
  showComposer = variant === "modal",
  onSubmit,
  onViewAll,
}: PostCommentsProps) {
  const [draft, setDraft] = useState("");

  const visible = useMemo(() => {
    if (variant === "modal") return comments;
    return comments.slice(0, Math.max(0, maxVisibleInline));
  }, [comments, maxVisibleInline, variant]);

  const count = totalCount ?? comments.length;

  const handleSubmit = () => {
    const text = draft.trim();
    if (!text) return;
    onSubmit?.(text);
    setDraft("");
  };

  return (
    <section className="w-full">
      {variant === "inline" && count > visible.length && (
        <button
          type="button"
          onClick={onViewAll}
          className="mb-2 text-sm font-semibold text-foreground-muted hover:text-foreground-strong"
        >
          عرض كل التعليقات ({count})
        </button>
      )}

      <div className={cx("space-y-3", variant === "inline" ? "mt-1" : "mt-0")}>
        {visible.map((c) => (
          <div key={c.id} className="flex items-start gap-2">
            <Avatar
              src={c.user.avatarUrl}
              name={c.user.name}
              size="9"
              className="shrink-0"
              path={`/u/${c.user.id}`}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="min-w-0 truncate text-sm font-bold text-foreground-strong">
                  {c.user.name}
                  <span className="mx-1 font-medium text-foreground-muted" dir="ltr">
                    @{c.user.username}
                  </span>
                </div>

                {c.user.rank ? (
                  <span className="shrink-0 rounded-md bg-[var(--brand-soft-bg)] px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[var(--brand-solid)]">
                    {c.user.rank}
                  </span>
                ) : null}

                <span className="ml-auto shrink-0 text-xs text-foreground-muted">
                  {c.createdAtLabel}
                </span>
              </div>

              <p className="mt-0.5 break-words text-[14px] leading-relaxed text-foreground">
                {c.text}
              </p>
            </div>
          </div>
        ))}

        {visible.length === 0 && (
          <div className="rounded-2xl border border-border-subtle bg-surface-soft/60 p-4 text-sm text-foreground-muted">
            لا توجد تعليقات بعد… كن أول من يعلّق ✨
          </div>
        )}
      </div>

      {showComposer && (
        <div className="mt-4 flex items-end gap-2 rounded-2xl border border-border-subtle bg-background-elevated p-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="اكتب تعليقك…"
            rows={2}
            className="min-h-[44px] w-full resize-none bg-transparent text-sm text-foreground outline-none placeholder:text-foreground-muted"
          />
          <IconButton
            aria-label="Send comment"
            variant="solid"
            tone="neutral"
            size="md"
            onClick={handleSubmit}
            className="bg-[var(--brand-solid)] text-white shadow-[var(--shadow-glow-brand)]"
            disabled={!draft.trim()}
          >
            <Send className="text-white" />
          </IconButton>
        </div>
      )}
    </section>
  );
}
