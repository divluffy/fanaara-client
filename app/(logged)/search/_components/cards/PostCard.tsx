"use client";

import React, { memo } from "react";
import Link from "next/link";
import type { PostEntity, UserEntity } from "../../_types";
import { timeAgo } from "../../_lib/time";
import { cn } from "../ui";

type Props = {
  post: PostEntity;
  author?: UserEntity;
};

function PostCardImpl({ post, author }: Props) {
  return (
    <Link
      href={`/posts/${encodeURIComponent(post.id)}`}
      className={cn(
        "block rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm transition",
        "hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 dark:focus-visible:ring-zinc-700",
      )}
    >
      <div className="flex items-start gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={author?.avatarUrl ?? "https://i.pravatar.cc/150?img=1"}
          alt={author?.displayName ?? "User"}
          loading="lazy"
          width={40}
          height={40}
          className="h-10 w-10 rounded-xl border border-zinc-200 object-cover dark:border-zinc-800"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-extrabold">{post.title}</div>
              <div className="mt-0.5 text-xs text-zinc-500">
                {author?.displayName ?? "Unknown"} • {timeAgo(post.createdAt)}
              </div>
            </div>

            <div className="text-xs font-semibold text-zinc-500">
              ✨ {post.reactions.toLocaleString()}
            </div>
          </div>

          <div className="mt-2 line-clamp-2 text-xs text-zinc-600 dark:text-zinc-300">{post.excerpt}</div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {post.tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
              >
                #{t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}

const PostCard = memo(PostCardImpl);
export default PostCard;
