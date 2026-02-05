// layout\components\LoggedShell\aside\ProfileCard.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { FiMenu } from "react-icons/fi";
import { Avatar } from "@/design";
import { cn } from "@/utils/cn";

type User = {
  name: string;
  username: string;
  alt: string;
  src: string;
  blurHash?: string;
};

type Props = {
  user: User;
  profileHref: string;
  profileAriaLabel: string;
  openMenuAriaLabel: string;
  onOpenMenu: () => void;
};

export const ProfileCard = React.memo(function ProfileCard({
  user,
  profileHref,
  profileAriaLabel,
  openMenuAriaLabel,
  onOpenMenu,
}: Props) {
  return (
    <div
      className={cn(
        "mt-auto rounded-2xl px-2.5 py-2",
        "bg-accent-soft border border-accent-border/35",
        "shadow-[var(--shadow-sm)]",
        "transition duration-200 ease-out",
        "hover:border-accent-border/60 hover:shadow-[var(--shadow-lg)]",
        "hover:bg-accent-soft/95",
      )}
    >
      <div className="flex items-center gap-2">
        <Link
          href={profileHref}
          aria-label={profileAriaLabel}
          className={cn(
            "flex-1 min-w-0 flex items-center gap-2 rounded-xl p-1.5",
            "transition duration-200",
            "hover:bg-background/25 active:bg-background/35",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring",
            "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
        >
          <Avatar
            src={user.src}
            alt={user.alt}
            size="10"
            blurHash={user.blurHash}
          />

          <div className="min-w-0 text-start">
            <p className="text-[13px] font-semibold text-foreground-strong truncate leading-tight">
              {user.name}
            </p>
            <span className="text-[11px] text-foreground-muted truncate block leading-tight">
              {user.username}
            </span>
          </div>
        </Link>

        <button
          type="button"
          onClick={onOpenMenu}
          aria-label={openMenuAriaLabel}
          aria-haspopup="menu"
          className={cn(
            "grid size-10 place-items-center rounded-xl",
            "bg-background/25 text-foreground-muted",
            "transition duration-200 ease-out",
            "hover:bg-accent/18 hover:text-foreground-strong hover:shadow-[var(--shadow-lg)]",
            "active:bg-accent/28 active:scale-[0.96]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring",
            "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "cursor-pointer",
          )}
        >
          <FiMenu className="size-5" />
        </button>
      </div>
    </div>
  );
});
