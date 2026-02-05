"use client";

import * as React from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/utils/cn";
import { Avatar } from "@/design";
import {
  LuAtSign,
  LuBell,
  LuCheck,
  LuChevronRight,
  LuHeart,
  LuMessagesSquare,
  LuSettings,
  LuSparkles,
  LuUserPlus,
  LuX,
} from "react-icons/lu";

type Dir = "rtl" | "ltr";

type NotificationKind =
  | "follow"
  | "mention"
  | "like"
  | "comment"
  | "rank"
  | "system"
  | "feature";

export type NotificationItem = {
  id: string;
  kind: NotificationKind;
  read?: boolean;
  timeLabel: string;
  title: string;
  description?: string;
  meta?: string;
  href?: string;
  avatarSrc?: string;
  section?: "Today" | "Earlier";
};

type PanelStyle = { top: number; left: number; height: number; width: number };

type Props = {
  open: boolean;
  dir: Dir;
  panelRef: React.RefObject<HTMLDivElement>;
  style: PanelStyle;
  onClose: () => void;

  /**
   * If you pass `items`, the panel becomes controlled (read-only UI).
   * If you omit it, it renders demo items + supports "Mark all as read".
   */
  items?: readonly NotificationItem[];
  onMarkAllRead?: () => void;
};

const DEMO_ITEMS: readonly NotificationItem[] = [
  {
    id: "n-1",
    kind: "follow",
    read: false,
    timeLabel: "2m",
    section: "Today",
    title: "Roronoa Zoro started following you",
    description: "Your profile is getting traction in the Swordsmen community.",
    meta: "Followers",
    href: "/profile/zoro",
  },
  {
    id: "n-2",
    kind: "mention",
    read: false,
    timeLabel: "18m",
    section: "Today",
    title: "Nami mentioned you in a comment",
    description: "“Check the new chapter spoilers thread 👀”",
    meta: "Comments",
    href: "/post/123#comment-9",
  },
  {
    id: "n-3",
    kind: "like",
    read: true,
    timeLabel: "1h",
    section: "Today",
    title: "Luffy liked your review",
    description: "One Piece — Episode 1100 review",
    meta: "Reactions",
    href: "/reviews/one-piece-1100",
  },
  {
    id: "n-4",
    kind: "comment",
    read: false,
    timeLabel: "3h",
    section: "Today",
    title: "Sanji commented on your post",
    description: "“That panel composition was insane.”",
    meta: "Post",
    href: "/post/456",
  },
  {
    id: "n-5",
    kind: "rank",
    read: true,
    timeLabel: "Yesterday",
    section: "Earlier",
    title: "Rank up unlocked",
    description:
      "You reached **Swordsman** rank. Keep posting to unlock perks.",
    meta: "Ranks",
    href: "/ranks",
  },
  {
    id: "n-6",
    kind: "feature",
    read: true,
    timeLabel: "2d",
    section: "Earlier",
    title: "Your post was featured in Gallery",
    description: "Your artwork got featured — nice work ✨",
    meta: "Gallery",
    href: "/gallery",
  },
  {
    id: "n-7",
    kind: "system",
    read: true,
    timeLabel: "4d",
    section: "Earlier",
    title: "Community update",
    description: "We improved moderation filters and reporting UX.",
    meta: "System",
    href: "/settings",
  },
];

const KIND_ICON: Record<
  NotificationKind,
  React.ComponentType<{ className?: string }>
> = {
  follow: LuUserPlus,
  mention: LuAtSign,
  like: LuHeart,
  comment: LuMessagesSquare,
  rank: LuSparkles,
  feature: LuSparkles,
  system: LuBell,
};

function groupBySection(items: readonly NotificationItem[]) {
  const grouped: Record<string, NotificationItem[]> = {};
  for (const n of items) {
    const key = n.section ?? "Earlier";
    (grouped[key] ??= []).push(n);
  }
  const order = ["Today", "Earlier"];
  return order
    .filter((k) => grouped[k]?.length)
    .map((title) => ({ title, items: grouped[title] }));
}

type TabKey = "all" | "mentions";

function TabButton({
  active,
  onClick,
  children,
  badge,
}: React.PropsWithChildren<{
  active: boolean;
  onClick: () => void;
  badge?: number;
}>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2",
        "text-[12px] font-semibold transition duration-200",
        active
          ? "bg-background-elevated text-foreground-strong shadow-[var(--shadow-sm)]"
          : "text-foreground-muted hover:text-foreground-strong hover:bg-background/30",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring",
        "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
    >
      <span>{children}</span>
      {typeof badge === "number" && badge > 0 && (
        <span
          className={cn(
            "min-w-[22px] h-[18px] px-1.5 rounded-full",
            "text-[11px] font-bold",
            "bg-accent text-accent-foreground",
          )}
          aria-label={`${badge}`}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </button>
  );
}

const NotificationRow = React.memo(function NotificationRow({
  item,
  isRTL,
  onActivate,
}: {
  item: NotificationItem;
  isRTL: boolean;
  onActivate: (id: string) => void;
}) {
  const Icon = KIND_ICON[item.kind];
  const unread = !item.read;

  const rowClass = cn(
    "group w-full flex items-start gap-3 rounded-2xl p-3",
    "text-start transition duration-150",
    unread
      ? "bg-accent-soft/60 border border-accent-border/25"
      : "hover:bg-background/35",
    "active:bg-background/50",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring",
    "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  );

  const dotPos = isRTL ? "-right-1" : "-left-1";

  const content = (
    <>
      <div className="relative shrink-0">
        {item.avatarSrc ? (
          <Avatar src={item.avatarSrc} alt={item.title} size="10" />
        ) : (
          <span
            className={cn(
              "grid size-10 place-items-center rounded-2xl",
              unread
                ? "bg-accent/14 text-foreground-strong"
                : "bg-background/35 text-foreground-muted",
            )}
            aria-hidden
          >
            <Icon className="size-5" />
          </span>
        )}

        {unread && (
          <span
            className={cn(
              "absolute -top-1 size-2.5 rounded-full",
              dotPos,
              "bg-accent ring-2 ring-background-elevated",
            )}
            aria-hidden
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-foreground-strong leading-snug">
          {item.title}
        </p>

        {item.description && (
          <p className="mt-0.5 text-[12px] text-foreground-muted line-clamp-2 leading-snug">
            {item.description}
          </p>
        )}

        <div className="mt-1 flex items-center gap-2 text-[11px] text-foreground-muted">
          <span>{item.timeLabel}</span>
          {item.meta && (
            <>
              <span aria-hidden>•</span>
              <span className="truncate">{item.meta}</span>
            </>
          )}
        </div>
      </div>

      <span className="shrink-0 text-foreground-muted group-hover:text-foreground-strong">
        <LuChevronRight className="size-4" aria-hidden />
      </span>
    </>
  );

  if (item.href) {
    return (
      <Link
        href={item.href}
        className={rowClass}
        onClick={() => onActivate(item.id)}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={rowClass}
      onClick={() => onActivate(item.id)}
    >
      {content}
    </button>
  );
});

export default function NotificationsPanel({
  open,
  dir,
  panelRef,
  style,
  onClose,
  items: controlledItems,
  onMarkAllRead,
}: Props) {
  const reduceMotion = useReducedMotion();
  const isRTL = dir === "rtl";

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const closeBtnRef = React.useRef<HTMLButtonElement | null>(null);
  React.useEffect(() => {
    if (!open) return;
    const id = window.requestAnimationFrame(() => closeBtnRef.current?.focus());
    return () => window.cancelAnimationFrame(id);
  }, [open]);

  const isControlled = controlledItems != null;

  const [uncontrolledItems, setUncontrolledItems] = React.useState<
    NotificationItem[]
  >(() => DEMO_ITEMS.map((n) => ({ ...n })));

  const items = (
    isControlled ? controlledItems! : uncontrolledItems
  ) as readonly NotificationItem[];

  const [tab, setTab] = React.useState<TabKey>("all");

  const allUnreadCount = React.useMemo(
    () => items.reduce((acc, n) => acc + (n.read ? 0 : 1), 0),
    [items],
  );

  const mentionsUnreadCount = React.useMemo(
    () => items.filter((n) => n.kind === "mention" && !n.read).length,
    [items],
  );

  const visibleItems = React.useMemo(() => {
    if (tab === "mentions") return items.filter((n) => n.kind === "mention");
    return items;
  }, [items, tab]);

  const grouped = React.useMemo(
    () => groupBySection(visibleItems),
    [visibleItems],
  );

  const markAllRead = React.useCallback(() => {
    onMarkAllRead?.();

    if (!isControlled) {
      setUncontrolledItems((prev) =>
        prev.map((n) => (n.read ? n : { ...n, read: true })),
      );
    }
  }, [isControlled, onMarkAllRead]);

  const activateItem = React.useCallback(
    (id: string) => {
      if (!isControlled) {
        setUncontrolledItems((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
        );
      }
      onClose();
    },
    [isControlled, onClose],
  );

  if (!mounted) return null;

  const fromX = reduceMotion ? 0 : isRTL ? 14 : -14;

  const node = (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          dir={dir}
          role="dialog"
          aria-labelledby="notifications-title"
          tabIndex={-1}
          initial={{ opacity: 0, x: fromX }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: fromX }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 430, damping: 36 }
          }
          style={{
            position: "fixed",
            top: 0,
            bottom: 0,
            left: style.left,
            width: style.width,
            height: "100dvh",
          }}
          className={cn(
            "z-50 overflow-hidden outline-none",
            "bg-background-elevated text-foreground",
            "shadow-[var(--shadow-elevated)]",
            "border border-border-subtle",
            "flex flex-col min-h-0",
            isRTL ? "rounded-l-2xl border-r-0" : "rounded-r-2xl border-l-0",
          )}
        >
          {/* Header */}
          <div
            className={cn(
              "px-4 py-3",
              "border-b border-border-subtle",
              "bg-background-elevated/95 supports-[backdrop-filter]:backdrop-blur-xl",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2
                  id="notifications-title"
                  className="text-[15px] font-semibold text-foreground-strong"
                >
                  Notifications
                </h2>

                <p className="mt-0.5 text-[11px] text-foreground-muted">
                  {allUnreadCount > 0
                    ? `${allUnreadCount} new updates`
                    : "You're all caught up."}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={markAllRead}
                  disabled={allUnreadCount === 0}
                  className={cn(
                    "grid size-9 place-items-center rounded-xl",
                    "bg-background/30 text-foreground-muted",
                    "transition duration-200",
                    "hover:bg-background/45 hover:text-foreground-strong",
                    "active:bg-background/55 active:scale-[0.98]",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring",
                    "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  )}
                  aria-label="Mark all as read"
                  title="Mark all as read"
                >
                  <LuCheck className="size-5" aria-hidden />
                </button>

                <Link
                  href="/settings/notifications"
                  className={cn(
                    "grid size-9 place-items-center rounded-xl",
                    "bg-background/30 text-foreground-muted",
                    "transition duration-200",
                    "hover:bg-background/45 hover:text-foreground-strong",
                    "active:bg-background/55 active:scale-[0.98]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring",
                    "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  )}
                  aria-label="Notification settings"
                  title="Notification settings"
                >
                  <LuSettings className="size-5" aria-hidden />
                </Link>

                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={onClose}
                  className={cn(
                    "grid size-9 place-items-center rounded-xl",
                    "bg-background/30 text-foreground-muted",
                    "transition duration-200",
                    "hover:bg-background/45 hover:text-foreground-strong",
                    "active:bg-background/55 active:scale-[0.98]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring",
                    "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  )}
                  aria-label="Close notifications"
                  title="Close"
                >
                  <LuX className="size-5" aria-hidden />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="mt-3 rounded-2xl bg-background/25 p-1">
              <div className="flex items-center gap-1">
                <TabButton
                  active={tab === "all"}
                  onClick={() => setTab("all")}
                  badge={allUnreadCount}
                >
                  All
                </TabButton>

                <TabButton
                  active={tab === "mentions"}
                  onClick={() => setTab("mentions")}
                  badge={mentionsUnreadCount}
                >
                  Mentions
                </TabButton>
              </div>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-2">
            {visibleItems.length === 0 ? (
              <div className="h-full grid place-items-center p-8 text-center">
                <div
                  className={cn(
                    "grid size-14 place-items-center rounded-3xl",
                    "bg-background/35 text-foreground-muted",
                  )}
                  aria-hidden
                >
                  <LuBell className="size-7" />
                </div>
                <p className="mt-3 text-sm font-semibold text-foreground-strong">
                  No notifications
                </p>
                <p className="mt-1 text-xs text-foreground-muted max-w-[22ch]">
                  When something happens, you’ll see it here.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {grouped.map((g) => (
                  <section key={g.title} aria-label={g.title}>
                    <div className="px-2 py-2">
                      <p className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wide">
                        {g.title}
                      </p>
                    </div>

                    <div className="space-y-2">
                      {g.items.map((n) => (
                        <NotificationRow
                          key={n.id}
                          item={n}
                          isRTL={isRTL}
                          onActivate={activateItem}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className={cn(
              "px-4 py-3 border-t border-border-subtle",
              "bg-background-elevated/95 supports-[backdrop-filter]:backdrop-blur-xl",
            )}
          >
            <Link
              href="/notifications"
              className={cn(
                "w-full inline-flex items-center justify-center gap-2 rounded-2xl px-3 py-2.5",
                "bg-accent text-accent-foreground",
                "font-semibold text-sm",
                "transition duration-200",
                "hover:opacity-95 active:scale-[0.99]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring",
                "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              )}
            >
              View all notifications
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(node, document.body);
}
