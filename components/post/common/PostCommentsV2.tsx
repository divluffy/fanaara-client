"use client";

import * as React from "react";
import { cn } from "@/utils/cn";
import { Avatar } from "@/design/Avatar";
import { IconButton } from "@/design/IconButton";

export type PostComment = {
  id: string;
  user: { id: string; name: string; handle: string; avatar: string };
  time: string;
  text: string;
};

export function PostComments({
  postId,
  viewer,
  initialComments,
  onAddComment,
}: {
  postId: string;
  viewer: { id: string; name: string; handle: string; avatar: string };
  initialComments: PostComment[];
  onAddComment?: (postId: string, text: string) => void | Promise<void>;
}) {
  const [items, setItems] = React.useState<PostComment[]>(initialComments);
  const [text, setText] = React.useState("");

  const submit = async () => {
    const v = text.trim();
    if (!v) return;

    const newItem: PostComment = {
      id: `tmp_${Date.now()}`,
      user: viewer,
      time: "الآن",
      text: v,
    };

    setItems((prev) => [newItem, ...prev]);
    setText("");
    await onAddComment?.(postId, v);
  };

  return (
    <div className="space-y-4">
      {/* Composer */}
      <div className={cn("rounded-2xl border border-border-subtle bg-surface-soft p-3")}>
        <div className="flex items-start gap-3">
          <Avatar src={viewer.avatar} name={viewer.name} size="10" />
          <div className="flex-1">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="اكتب تعليقك… ✍️"
              rows={3}
              className={cn(
                "w-full resize-none rounded-xl border border-border-subtle bg-background-elevated px-3 py-2",
                "text-sm text-foreground outline-none",
                "focus:ring-2 focus:ring-accent/40",
              )}
            />
            <div className="mt-2 flex items-center justify-between">
              <div className="text-xs text-foreground-muted">@{viewer.handle.replace(/^@/, "")}</div>
              <button
                type="button"
                onClick={submit}
                className={cn(
                  "rounded-xl px-4 py-2 text-xs font-semibold",
                  "bg-accent text-accent-foreground",
                  "hover:opacity-95 active:opacity-90",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                )}
              >
                نشر 🚀
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="text-sm text-foreground-muted">لا توجد تعليقات بعد.</div>
        ) : (
          items.map((c) => (
            <div
              key={c.id}
              className={cn(
                "rounded-2xl border border-border-subtle bg-background-elevated p-3",
                "shadow-[var(--shadow-xs)]",
              )}
            >
              <div className="flex items-start gap-3">
                <Avatar src={c.user.avatar} name={c.user.name} size="10" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-sm font-semibold text-foreground-strong">{c.user.name}</div>
                    <div className="text-xs text-foreground-muted">{c.user.handle}</div>
                    <span className="text-xs text-foreground-soft">•</span>
                    <div className="text-xs text-foreground-muted">{c.time}</div>
                  </div>
                  <div className="mt-1 whitespace-pre-line text-sm text-foreground">{c.text}</div>
                </div>

                {/* lightweight action (optional) */}
                <IconButton aria-label="Like comment" variant="plain" tone="neutral" size="sm" tooltip="إعجاب">
                  <span className="text-[16px]">💜</span>
                </IconButton>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
