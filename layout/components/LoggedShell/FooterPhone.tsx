"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { FiMenu } from "react-icons/fi";
import { LuBookOpen, LuSparkles, LuSwords } from "react-icons/lu";

import { cn } from "@/utils/cn";
import { MobileNavItem } from "./MobileIconItem";
import { AiFillHome } from "react-icons/ai";
import { isActivePath } from "./isActivePath";

type FooterPhoneProps = {
  onOpenMenu?: () => void;
};

export default function FooterPhone({ onOpenMenu }: FooterPhoneProps) {
  const pathname = usePathname();
  const handleMenu = React.useCallback(() => onOpenMenu?.(), [onOpenMenu]);

  return (
    <footer
      className={cn(
        "sticky bottom-0 z-40",
        "bg-background-elevated/80 backdrop-blur-md supports-[backdrop-filter]:bg-background-elevated/60",
        "border-t border-accent-border/70",
        "pb-[env(safe-area-inset-bottom)]"
      )}
    >
      <nav aria-label="Bottom tabs" className="h-16 px-3">
        <ul className="h-full grid grid-cols-5 place-items-center">
          <li>
            <MobileNavItem
              label="الرئيسية"
              Icon={AiFillHome} // ✅ نفس ستايل بقية الأيقونات (اختياري لكنه يوازن الـUI)
              href="/"
              active={isActivePath(pathname, "/", true)}
            />
          </li>

          <li>
            <MobileNavItem
              label="أنمي"
              Icon={LuSwords}
              href="/anime"
              active={isActivePath(pathname, "/anime")}
            />
          </li>

          <li>
            <MobileNavItem
              label="كوميكس"
              Icon={LuBookOpen}
              href="/comics"
              active={isActivePath(pathname, "/comics")}
            />
          </li>

          <li>
            <MobileNavItem
              label="سوايبس"
              Icon={LuSparkles}
              href="/swipes"
              active={isActivePath(pathname, "/swipes")}
            />
          </li>

          <li>
            <MobileNavItem label="القائمة" Icon={FiMenu} onClick={handleMenu} />
          </li>
        </ul>
      </nav>
    </footer>
  );
}
