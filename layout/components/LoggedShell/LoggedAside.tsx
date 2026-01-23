"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAppSelector } from "@/store/hooks";
import { cn } from "@/utils";
import {
  AsideNavItem,
  ProfileCard,
  ASIDE_ITEMS,
  AsideItemConfig,
} from "./aside";
import { MockUser } from "@/constants";
import { useAttachedPanel } from "@/hooks/useAttachedPanel";
import {
  LanguageMenuToggle,
  NotificationsPanel,
  ThemeToggle,
} from "@/components";

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

export default function LoggedAside() {
  const t = useTranslations("aside");
  const pathname = usePathname();

  const { isRTL, direction } = useAppSelector((s) => s.state);
  const dir = resolveDir(direction, isRTL);

  // placeholders (بدّلها لاحقًا)
  const notificationsCount = 3;
  const chatUnreadCount = 7;

  // ✅ Panel ملتصق بالـ aside
  const noti = useAttachedPanel({
    dir,
    panelWidth: 350,
    overlapPx: 1,
    closeOnEscape: true,
  });

  // إغلاق عند تغيير المسار (لضمان عدم بقاء panel مفتوح بعد التنقل)
  React.useEffect(() => {
    if (noti.open) noti.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const badgeCountByKey = React.useMemo(
    () => ({
      chatUnread: chatUnreadCount,
      notifications: notificationsCount,
    }),
    [chatUnreadCount, notificationsCount],
  );

  const onAction = React.useCallback(
    (
      actionKey: AsideItemConfig extends infer T
        ? T extends { actionKey: infer K }
          ? K
          : never
        : never,
    ) => {
      if (actionKey === "openNotifications") noti.toggle();
    },
    [noti],
  );

  return (
    <>
      <aside
        ref={noti.asideRef as unknown as React.RefObject<HTMLElement>}
        dir={dir}
        className={cn(
          "bg-background-elevated w-64 p-4 h-dvh sticky top-0",
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

              // Notifications action (trigger)
              if (
                it.type === "action" &&
                it.actionKey === "openNotifications"
              ) {
                return (
                  <li
                    key={it.id}
                    ref={
                      noti.triggerRef as unknown as React.RefObject<HTMLLIElement>
                    }
                  >
                    <AsideNavItem
                      label={t(it.id)}
                      Icon={it.Icon}
                      badge={badge}
                      onClick={() => onAction(it.actionKey)}
                      ariaLabel={t("openNotifications")}
                    />
                  </li>
                );
              }

              // any other action (future)
              if (it.type === "action") {
                return (
                  <li key={it.id}>
                    <AsideNavItem
                      label={t(it.id)}
                      Icon={it.Icon}
                      badge={badge}
                      onClick={() => onAction(it.actionKey)}
                      ariaLabel={t(it.id)}
                    />
                  </li>
                );
              }

              // link
              const active = isActive(pathname, it.href, it.exact);

              return (
                <li key={it.id}>
                  <AsideNavItem
                    label={t(it.id)}
                    Icon={it.Icon}
                    active={active}
                    href={it.href}
                    badge={badge}
                  />
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="flex">
          <ThemeToggle />
          <LanguageMenuToggle />
        </div>
        <ProfileCard
          user={MockUser}
          profileHref="/profile"
          profileAriaLabel={t("link")}
          openMenuAriaLabel={t("openProfileMenu")}
          onOpenMenu={() => {
            // لاحقًا: نفس المنطق لبروفايل menu
          }}
        />
      </aside>

      <NotificationsPanel
        open={noti.open}
        dir={dir}
        panelRef={noti.panelRef}
        style={noti.panelStyle}
      />
    </>
  );
}
