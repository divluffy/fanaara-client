"use client";

import * as React from "react";
import Link from "next/link";
import type { IconType } from "react-icons";
import { cn } from "@/utils/cn";

type Variant = "default" | "primary";

type CommonProps = {
  label: string;
  Icon: IconType;
  active?: boolean;

  /** رقم (0 = لا يظهر) */
  badge?: number;

  /** نقطة بدل الرقم */
  dot?: boolean;

  variant?: Variant;
  className?: string;
};

type LinkProps = CommonProps & {
  href: string;
  prefetch?: boolean;
  onClick?: never;
};
type ButtonProps = CommonProps & {
  onClick: () => void;
  href?: never;
  prefetch?: never;
};
type Props = LinkProps | ButtonProps;

function formatBadge(value?: number) {
  const n = typeof value === "number" ? Math.max(0, value) : 0;
  if (n <= 0) return null;
  return n > 99 ? "99+" : String(n);
}

function UnderIconBadge({ badge, dot }: { badge?: number; dot?: boolean }) {
  const text = formatBadge(badge);
  const show = Boolean(dot) || Boolean(text);
  if (!show) return null;

  return (
    <span
      aria-hidden="true"
      className={cn(
        // ✅ أسفل يمين الأيقونة (داخل الزر في المنتصف)
        "absolute top-2 left-0 translate-x-[55%] translate-y-[55%]",
        // ✅ بزاوية بسيطة (اختياري)
        "rotate-12 origin-top-left",

        // ✅ dot vs badge
        dot ? "size-2" : "h-4 min-w-4 px-1",

        // ✅ شكل/ستايل
        "rounded-full grid place-items-center",
        "text-[9px] font-bold leading-none",
        "bg-accent text-accent-foreground",
        "ring-2 ring-background",
        "shadow-[var(--shadow-sm)]",
        "pointer-events-none"
      )}
    >
      {dot ? "" : text}
    </span>
  );
}

const base =
  "relative overflow-visible grid place-items-center size-11 rounded-2xl " +
  "select-none touch-manipulation cursor-pointer border border-transparent " +
  "transition duration-200 ease-out active:scale-[0.96] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring " +
  "focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
  "[-webkit-tap-highlight-color:transparent]";

const variants = {
  // الحالة العادية
  idle:
    "bg-background/12 text-foreground-muted " +
    "hover:bg-background/22 hover:text-foreground-strong hover:border-accent-border/55 " +
    "hover:shadow-[var(--shadow-sm)] active:bg-background/28",

  // ✅ Active: خلفية واضحة + لون أيقونة واضح
  active: "bg-accent text-accent-foreground " + "shadow-[var(--shadow-sm)]",

  // زر Primary (مثلاً إضافة)
  primary:
    "bg-accent/14 text-foreground-strong " +
    "hover:bg-accent/18 hover:border-accent-border/70 hover:shadow-[var(--shadow-lg)] " +
    "active:bg-accent/22",
} as const;

function buildAriaLabel(label: string, badge?: number, dot?: boolean) {
  const text = formatBadge(badge);
  const extra = text ? `، ${text} جديد` : dot ? "، جديد" : "";
  return `${label}${extra}`;
}

export const MobileNavItem = React.memo(function MobileNavItem(props: Props) {
  const variant: Variant = props.variant ?? "default";
  const active = Boolean(props.active);

  const ariaLabel = buildAriaLabel(props.label, props.badge, props.dot);

  const className = cn(
    base,
    variant === "primary"
      ? variants.primary
      : active
      ? variants.active
      : variants.idle,
    props.className
  );

  const content = (
    <>
      {/* ✅ badge/dot تحت الأيقونة */}
      <span
        className="relative grid place-items-center size-5"
        aria-hidden="true"
      >
        <props.Icon className="size-5" />
        <UnderIconBadge badge={props.badge} dot={props.dot} />
      </span>
      <span className="sr-only">{ariaLabel}</span>
    </>
  );

  return "onClick" in props ? (
    <button
      type="button"
      onClick={props.onClick}
      className={className}
      aria-label={ariaLabel}
      title={props.label}
    >
      {content}
    </button>
  ) : (
    <Link
      href={props.href}
      prefetch={props.prefetch}
      className={className}
      aria-label={ariaLabel}
      title={props.label}
      aria-current={active ? "page" : undefined}
    >
      {content}
    </Link>
  );
});
