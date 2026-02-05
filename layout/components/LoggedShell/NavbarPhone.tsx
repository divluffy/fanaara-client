// layout/components/LoggedShell/NavbarPhone.tsx
"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { LuBell, LuMessagesSquare, LuSearch } from "react-icons/lu";

import { Avatar } from "@/design";
import { isActivePath } from "./isActivePath";
import { MobileNavItem } from "./MobileIconItem";
import AddPost from "@/components/AddPost";

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
  onOpenSearch,
}: NavbarPhoneProps) {
  const pathname = usePathname();

  const searchActive = isActivePath(pathname, "/search", true);
  const chatActive = isActivePath(pathname, "/chat");
  const notifActive = isActivePath(pathname, "/notifications");

  const handleSearch = React.useCallback(
    () => onOpenSearch?.(),
    [onOpenSearch],
  );

  return (
    <header className="h-full">
      <nav
        aria-label="Top actions"
        className="h-full px-3 flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-2">
          <Avatar
            path="/profile"
            src={user.src}
            alt={user.alt}
            size="10"
            blurHash={user.blurHash}
          />

          <AddPost mode="phone" />
        </div>

        <div className="flex items-center gap-1">
          <MobileNavItem
            label="بحث"
            Icon={LuSearch}
            onClick={handleSearch}
            active={searchActive}
            dot
          />

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
