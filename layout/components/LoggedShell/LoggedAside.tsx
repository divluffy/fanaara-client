"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAppSelector } from "@/store/hooks";
import { cn } from "@/utils/cn";
import { MockUser } from "@/constants";
import { useAttachedPanel } from "@/hooks/useAttachedPanel";
import {
  AsideNavItem,
  ProfileCard,
  ASIDE_ITEMS,
  type AsideItemConfig,
} from "./aside";
import { UserMenuModal } from "./UserMenuModal";

const NotificationsPanel = dynamic(
  () => import("@/components/NotificationsPanel"),
  { ssr: false },
);

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

function resolveDir(
  direction: string | undefined,
  isRTL: boolean,
): "rtl" | "ltr" {
  if (direction === "rtl" || direction === "ltr") return direction;
  return isRTL ? "rtl" : "ltr";
}

type ActionKey = Extract<AsideItemConfig, { type: "action" }>["actionKey"];

export default function LoggedAside() {
  const t = useTranslations("aside");
  const pathname = usePathname();

  const { isRTL, direction } = useAppSelector((s) => s.state);
  const dir = resolveDir(direction, isRTL);
  const [menuOpen, setMenuOpen] = React.useState(false);

  // TODO: replace with real counts from store/api
  const notificationsCount = 3;
  const chatUnreadCount = 7;

  const {
    open: notiOpen,
    toggle: toggleNoti,
    close: closeNoti,
    setAnchorRef,
    setTriggerRef,
    panelRef,
    panelStyle,
  } = useAttachedPanel({
    dir,
    panelWidth: 360,
    overlapPx: 1,
    closeOnEscape: true,
  });

  // Close notifications when route changes
  const notiOpenRef = React.useRef(notiOpen);

  React.useEffect(() => {
    notiOpenRef.current = notiOpen;
  }, [notiOpen]);

  React.useEffect(() => {
    if (notiOpenRef.current) closeNoti();
  }, [pathname, closeNoti]);

  // Lazy-mount panel only after first intent (hover/open)
  const [notiMounted, setNotiMounted] = React.useState(false);
  React.useEffect(() => {
    if (notiOpen) setNotiMounted(true);
  }, [notiOpen]);

  const badgeCountByKey = React.useMemo(
    () => ({
      chatUnread: chatUnreadCount,
      notifications: notificationsCount,
    }),
    [chatUnreadCount, notificationsCount],
  );

  const openNotifications = React.useCallback(() => {
    setNotiMounted(true);
    toggleNoti();
  }, [toggleNoti]);

  const actionHandlers = React.useMemo<Record<ActionKey, () => void>>(
    () => ({
      openNotifications,
    }),
    [openNotifications],
  );

  return (
    <>
      <aside
        ref={setAnchorRef}
        dir={dir}
        className={cn(
          "bg-background-elevated w-64 p-4 h-full",
          "flex flex-col gap-3",
          "border-e border-accent-border/80",
        )}
      >
        <nav aria-label="Sidebar">
          <ul className="space-y-0.5">
            {ASIDE_ITEMS.map((it) => {
              const badge = it.badgeKey
                ? badgeCountByKey[it.badgeKey]
                : undefined;

              if (it.type === "action") {
                const isNotifications = it.actionKey === "openNotifications";

                return (
                  <li
                    key={it.id}
                    ref={isNotifications ? setTriggerRef : undefined}
                    onPointerEnter={
                      isNotifications ? () => setNotiMounted(true) : undefined
                    }
                  >
                    <AsideNavItem
                      label={t(it.id)}
                      Icon={it.Icon}
                      badge={badge}
                      onClick={actionHandlers[it.actionKey]}
                      ariaLabel={
                        isNotifications ? t("openNotifications") : t(it.id)
                      }
                    />
                  </li>
                );
              }

              const active = isActive(pathname, it.href, it.exact);

              return (
                <li key={it.id}>
                  <AsideNavItem
                    label={t(it.id)}
                    Icon={it.Icon}
                    active={active}
                    href={it.href}
                    badge={badge}
                    ariaLabel={t(it.id)}
                  />
                </li>
              );
            })}
          </ul>
        </nav>

        <ProfileCard
          user={MockUser}
          profileHref="/profile"
          profileAriaLabel={t("link")}
          openMenuAriaLabel={t("openProfileMenu")}
          onOpenMenu={() => setMenuOpen(true)}
        />

        <UserMenuModal
          open={menuOpen}
          onOpenChange={setMenuOpen}
          user={MockUser}
          profileHref="/me"
          onLogout={() => {
            // TODO: call your auth signout
            // e.g. await signOut()
          }}
        />
      </aside>

      {notiMounted && (
        <NotificationsPanel
          open={notiOpen}
          dir={dir}
          panelRef={panelRef as React.RefObject<HTMLDivElement>}
          style={panelStyle}
          onClose={closeNoti}
        />
      )}
    </>
  );
}
