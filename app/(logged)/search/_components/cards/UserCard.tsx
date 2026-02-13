"use client";

import React, { memo, useState } from "react";
import Link from "next/link";
import type { UserEntity } from "../../_types";
import { cn } from "../ui";

type Props = {
  user: UserEntity;
};

function UserCardImpl({ user }: Props) {
  const [following, setFollowing] = useState(false);

  return (
    <Link
      href={`/u/${encodeURIComponent(user.username)}`}
      className={cn(
        "block rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm transition",
        "hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 dark:focus-visible:ring-zinc-700",
      )}
    >
      <div className="flex items-center gap-3">
        {/* avatar fixed size to prevent CLS */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={user.avatarUrl}
          alt={user.displayName}
          loading="lazy"
          width={44}
          height={44}
          className="h-11 w-11 rounded-xl border border-zinc-200 object-cover dark:border-zinc-800"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="truncate text-sm font-extrabold">{user.displayName}</div>
            {user.role === "creator" ? (
              <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] font-bold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
                Creator
              </span>
            ) : null}
          </div>

          <div className="mt-0.5 truncate text-xs text-zinc-500">
            @{user.username} • {user.followers.toLocaleString()} followers
          </div>

          <div className="mt-2 line-clamp-2 text-xs text-zinc-600 dark:text-zinc-300">{user.bio}</div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setFollowing((v) => !v);
          }}
          className={cn(
            "shrink-0 rounded-xl px-3 py-2 text-xs font-bold transition",
            following
              ? "bg-zinc-200 text-zinc-900 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-600"
              : "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100",
          )}
        >
          {following ? "Following" : "Follow"}
        </button>
      </div>
    </Link>
  );
}

const UserCard = memo(UserCardImpl);
export default UserCard;
