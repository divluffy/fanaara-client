"use client";

import * as React from "react";
import Link from "next/link";
import type { IconType } from "react-icons";
import { cn } from "@/utils/cn";
import { Badge } from "./Badge";

const styles = {
  rowBase: cn(
    "group w-full inline-flex items-center gap-3 rounded-2xl px-3 py-2.5",
    "text-sm font-semibold transition duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring",
    "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "cursor-pointer select-none",
  ),
  rowInactive: cn(
    "text-foreground-muted",
    "hover:text-foreground-strong hover:bg-background/50",
    "active:bg-background/60",
  ),
  rowActive: cn(
    "bg-accent-soft/90 text-foreground-strong",
    "border border-accent-border/55 shadow-[var(--shadow-sm)]",
    "hover:bg-accent-soft hover:border-accent-border/70",
  ),
  iconWrapBase: cn(
    "grid size-9 shrink-0 place-items-center rounded-xl",
    "transition duration-200",
  ),
  iconWrapInactive: cn(
    "bg-background/35 text-foreground-muted",
    "group-hover:bg-accent/14 group-hover:text-foreground-strong",
  ),
  iconWrapActive: cn(
    "bg-accent text-accent-foreground",
    "shadow-[var(--shadow-sm)] ring-1 ring-accent-ring/35",
  ),
};

type CommonProps = {
  label: string;
  Icon: IconType;
  active?: boolean;
  badge?: number;
  ariaLabel?: string;
};

type LinkProps = CommonProps & {
  href: string;
  onClick?: never;
};

type ActionProps = CommonProps & {
  onClick: () => void;
  href?: never;
  ariaLabel: string; // required for buttons
};

export const AsideNavItem = React.memo(function AsideNavItem(
  props: LinkProps | ActionProps,
) {
  const active = Boolean(props.active);
  const rowClass = cn(
    styles.rowBase,
    active ? styles.rowActive : styles.rowInactive,
  );

  const iconClass = cn(
    styles.iconWrapBase,
    active ? styles.iconWrapActive : styles.iconWrapInactive,
  );

  const content = (
    <>
      <span className={iconClass} aria-hidden>
        <props.Icon className="size-5" />
      </span>

      <span className="flex-1 truncate text-start">{props.label}</span>

      <Badge value={props.badge} />
    </>
  );

  if ("onClick" in props) {
    return (
      <button
        type="button"
        onClick={props.onClick}
        className={rowClass}
        aria-label={props.ariaLabel}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={props.href}
      className={rowClass}
      aria-current={active ? "page" : undefined}
      aria-label={props.ariaLabel ?? props.label}
    >
      {content}
    </Link>
  );
});
