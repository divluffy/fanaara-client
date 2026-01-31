// layout\components\LoggedShell\NavbarPhone.tsx
"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { IoIosAdd } from "react-icons/io";
import { LuBell, LuMessagesSquare, LuSearch } from "react-icons/lu";

import { Avatar } from "@/design";
import { cn } from "@/utils/cn";
import { isActivePath } from "./isActivePath";
import { MobileNavItem } from "./MobileIconItem";

export const demoUser = {
  name: "Ibrahim Jomaa",
  username: "@dev.luffy",
  alt: "Profile Avatar Ibrahim jomaa",
  src: "https://images3.alphacoders.com/132/thumbbig-1328396.webp",
  blurHash: "L27dqL?byX~W-BM{00Di9tM{~WIo",
};

type NavbarPhoneProps = {
  user?: typeof demoUser;
  chatUnreadCount?: number;
  notificationsCount?: number;
  onCreatePost?: () => void;
  onOpenSearch?: () => void;
};

export default function NavbarPhone({
  user = demoUser,
  chatUnreadCount = 0,
  notificationsCount = 3,
  onCreatePost,
  onOpenSearch,
}: NavbarPhoneProps) {
  const pathname = usePathname();

  const searchActive = isActivePath(pathname, "/search", true);
  const chatActive = isActivePath(pathname, "/chat");
  const notifActive = isActivePath(pathname, "/notifications");

  const handleCreate = React.useCallback(
    () => onCreatePost?.(),
    [onCreatePost]
  );
  const handleSearch = React.useCallback(
    () => onOpenSearch?.(),
    [onOpenSearch]
  );

  return (
    <header
      className={cn(
        "sticky top-0 z-40",
        "bg-background-elevated/80 backdrop-blur-md supports-[backdrop-filter]:bg-background-elevated/60",
        "border-b border-accent-border/70",
        "pt-[env(safe-area-inset-top)]"
      )}
    >
      <nav
        aria-label="Top actions"
        className="h-14 px-3 flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-2">
          <Avatar
            path="/profile"
            src={user.src}
            alt={user.alt}
            size="10"
            blurHash={user.blurHash}
          />

          <MobileNavItem
            label="إضافة"
            Icon={IoIosAdd}
            onClick={handleCreate}
            variant="primary"
          />
        </div>

        <div className="flex items-center gap-1">
          {/* ✅ مثال DOT (نقطة) + في الزاوية وبزاوية تلقائيًا */}
          <MobileNavItem
            label="بحث"
            Icon={LuSearch}
            onClick={handleSearch}
            active={searchActive}
            dot
          />

          {/* ✅ مثال BADGE (رقم) */}
          <MobileNavItem
            label="الرسائل"
            Icon={LuMessagesSquare}
            href="/chat"
            active={chatActive}
            badge={chatUnreadCount}
            dot
          />

          <MobileNavItem
            label="الإشعارات"
            Icon={LuBell}
            href="/notifications"
            active={notifActive}
            badge={notificationsCount}
          />
        </div>
      </nav>
    </header>
  );
}
