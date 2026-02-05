// layout/components/LoggedShell/MobileMenuDrawer.tsx
"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { cn } from "@/utils/cn";
import { useAppSelector } from "@/store/hooks";
import { ThemeToggle, LanguageMenuToggle } from "@/components";
import { MockUser } from "@/constants";

import { ASIDE_ITEMS, AsideNavItem, ProfileCard } from "./aside";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function resolveDir(
  direction: string | undefined,
  isRTL: boolean,
): "rtl" | "ltr" {
  if (direction === "rtl" || direction === "ltr") return direction;
  return isRTL ? "rtl" : "ltr";
}

export default function MobileMenuDrawer({ open, onOpenChange }: Props) {
  const pathname = usePathname();
  const { isRTL, direction } = useAppSelector((s) => s.state);
  const dir = resolveDir(direction, isRTL);

  const close = React.useCallback(() => onOpenChange(false), [onOpenChange]);

  // Close on route change
  React.useEffect(() => {
    if (open) onOpenChange(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // ESC close
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  const side = dir === "rtl" ? "right" : "left";
  const translateClosed =
    side === "right" ? "translate-x-full" : "-translate-x-full";
  const borderSide = side === "right" ? "border-l" : "border-r";

  return (
    <div
      dir={dir}
      className={cn(
        "fixed inset-0 z-[60] md:hidden",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        onClick={close}
        className={cn(
          "absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0",
        )}
      />

      {/* Panel */}
      <div
        className={cn(
          "absolute top-0 bottom-0 w-[min(84vw,340px)]",
          side === "right" ? "right-0" : "left-0",
          "bg-background-elevated",
          borderSide,
          "border-accent-border/70",
          "pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]",
          "transform-gpu transition-transform duration-250 ease-out",
          open ? "translate-x-0" : translateClosed,
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        <div className="flex h-full flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <LanguageMenuToggle />
            </div>

            <button
              type="button"
              onClick={close}
              className="rounded-lg px-3 py-2 text-sm text-foreground-muted hover:bg-background/30"
              aria-label="Close"
              title="Close"
            >
              ✕
            </button>
          </div>

          <nav aria-label="Sidebar">
            <ul className="space-y-1">
              {ASIDE_ITEMS.map((it) => {
                if (it.type === "action") {
                  return (
                    <li key={it.id}>
                      <AsideNavItem
                        label={it.id}
                        Icon={it.Icon}
                        onClick={() => close()}
                        ariaLabel={it.id}
                      />
                    </li>
                  );
                }

                const active = it.exact
                  ? pathname === it.href
                  : pathname === it.href || pathname.startsWith(it.href + "/");

                return (
                  <li key={it.id}>
                    <AsideNavItem
                      label={it.id}
                      Icon={it.Icon}
                      active={active}
                      href={it.href}
                    />
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-auto">
            <ProfileCard
              user={MockUser}
              profileHref="/profile"
              profileAriaLabel="profile"
              openMenuAriaLabel="open profile menu"
              onOpenMenu={() => close()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
