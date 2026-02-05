"use client";

import * as React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { IoClose } from "react-icons/io5";
import {
  FiBookOpen,
  FiHelpCircle,
  FiLock,
  FiLogOut,
  FiSettings,
  FiUser,
} from "react-icons/fi";
import { RiMoonClearLine, RiTranslate2 } from "react-icons/ri";


import DeModal from "@/design/DeModal";
import { Avatar } from "@/design";
import { cn } from "@/utils/cn";

import { useSupportedLocales } from "@/hooks/use-supported-locales";
import { useLocaleSwitcher } from "@/hooks/use-locale-switcher";
import { FaCrown, FaHatCowboySide } from "react-icons/fa6";

/* ------------------------------------------------------------------ */
/* Types */
/* ------------------------------------------------------------------ */

type User = {
  name: string;
  username: string;
  alt: string;
  src: string;
  blurHash?: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  user: User;

  /** optional */
  profileHref?: string;

  /** call your auth signout here */
  onLogout?: () => void;
};

/* ------------------------------------------------------------------ */
/* Helpers */
/* ------------------------------------------------------------------ */

type ThemeId = "light" | "dark" | "onepiece";

function useIsMounted() {
  const [m, setM] = React.useState(false);
  React.useEffect(() => setM(true), []);
  return m;
}

function resolveThemeId(
  theme?: string | null,
  resolvedTheme?: string | null,
): ThemeId {
  const t = (theme === "system" ? resolvedTheme : theme) ?? "light";
  if (t === "dark" || t === "onepiece") return t;
  return "light";
}

const THEME_OPTIONS: Array<{
  id: ThemeId;
  labelAr: string;
  labelEn: string;
  descriptionAr: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    id: "light",
    labelAr: "فاتح",
    labelEn: "Light",
    descriptionAr: "مظهر نظيف وواضح",
    Icon: FiUser, // (اختياري) غيّرها لأيقونة شمس لو تحب
  },
  {
    id: "dark",
    labelAr: "داكن",
    labelEn: "Dark",
    descriptionAr: "مريح للعين",
    Icon: RiMoonClearLine,
  },
  {
    id: "onepiece",
    labelAr: "ون بيس",
    labelEn: "One Piece",
    descriptionAr: "ستايل ورقي + قبعة القش",
    Icon: FaHatCowboySide ,
  },
];

function ValuePill({ text, isRTL }: { text: string; isRTL: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold",
        "border-border-subtle bg-surface/80 text-foreground-strong",
        "shadow-soft",
        isRTL ? "flex-row-reverse" : "flex-row",
      )}
    >
      <span className="truncate max-w-[10rem]">{text}</span>
      <span className="text-[10px] text-foreground-muted" aria-hidden>
        ▾
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* UI atoms */
/* ------------------------------------------------------------------ */

function QuickActionCard({
  href,
  label,
  Icon,
  onNavigate,
}: {
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "group flex flex-col items-center justify-center gap-2 rounded-2xl border p-3 text-center",
        "border-border-subtle/70 bg-surface/70 shadow-[var(--shadow-sm)]",
        "transition duration-200 ease-out",
        "hover:-translate-y-0.5 hover:bg-surface-soft hover:shadow-[var(--shadow-lg)]",
        "active:translate-y-0 active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring",
      )}
    >
      <span
        className={cn(
          "grid size-10 place-items-center rounded-2xl border",
          "border-border-subtle/70 bg-background/30 text-foreground-strong",
        )}
      >
        <Icon className="size-5" />
      </span>

      <span className="text-[11px] font-semibold text-foreground-strong leading-tight">
        {label}
      </span>
    </Link>
  );
}

function MenuRowButton({
  label,
  Icon,
  endSlot,
  onClick,
  isRTL,
  tone = "default",
}: {
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  endSlot?: React.ReactNode;
  onClick: () => void;
  isRTL: boolean;
  tone?: "default" | "danger";
}) {
  const rowDir = isRTL ? "flex-row-reverse text-right" : "flex-row text-left";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-2xl border px-3 py-3",
        "border-border-subtle/70 bg-surface/70 shadow-[var(--shadow-sm)]",
        "transition duration-200",
        "hover:bg-surface-soft hover:shadow-[var(--shadow-md)]",
        "active:scale-[0.99]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring",
        tone === "danger" && "border-danger/25 hover:border-danger/40",
      )}
    >
      <div className={cn("flex items-center gap-3", rowDir)}>
        {/* right-side icon (RTL) / left-side icon (LTR) */}
        <span
          className={cn(
            "grid size-10 place-items-center rounded-2xl border",
            "border-border-subtle/70 bg-background/30",
            tone === "danger" ? "text-danger" : "text-foreground-strong",
          )}
          aria-hidden
        >
          <Icon className="size-5" />
        </span>

        <div className="min-w-0 flex-1">
          <div
            className={cn(
              "text-sm font-semibold truncate",
              tone === "danger" ? "text-danger" : "text-foreground-strong",
            )}
          >
            {label}
          </div>
        </div>

        {/* left slot in RTL, right slot in LTR */}
        {endSlot ? <div className="shrink-0">{endSlot}</div> : null}
      </div>
    </button>
  );
}

function MenuRowLink({
  label,
  Icon,
  href,
  onNavigate,
  isRTL,
}: {
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  href: string;
  onNavigate?: () => void;
  isRTL: boolean;
}) {
  const rowDir = isRTL ? "flex-row-reverse text-right" : "flex-row text-left";

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "w-full rounded-2xl border px-3 py-3",
        "border-border-subtle/70 bg-surface/70 shadow-[var(--shadow-sm)]",
        "transition duration-200",
        "hover:bg-surface-soft hover:shadow-[var(--shadow-md)]",
        "active:scale-[0.99]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring",
        "block",
      )}
    >
      <div className={cn("flex items-center gap-3", rowDir)}>
        <span
          className={cn(
            "grid size-10 place-items-center rounded-2xl border",
            "border-border-subtle/70 bg-background/30 text-foreground-strong",
          )}
          aria-hidden
        >
          <Icon className="size-5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-foreground-strong truncate">
            {label}
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Nested modals */
/* ------------------------------------------------------------------ */

function LanguageSelectModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { locales, activeLocale } = useSupportedLocales();
  const { currentLocale, isSwitching, switchLocale } = useLocaleSwitcher();

  const isRTL = activeLocale.dir === "rtl";
  const rowDir = isRTL ? "flex-row-reverse text-right" : "flex-row text-left";

  return (
    <DeModal
      open={open}
      onOpenChange={onOpenChange}
      mode={{ desktop: "center", mobile: "sheet" }}
      title="تغيير اللغة"
      subtitle="اختر اللغة المفضلة"
      maxWidthClass="max-w-md"
      sheetCollapsedFraction={0.55}
      sheetFullFraction={0.85}
      sheetAutoFit
    >
      <div className="space-y-2">
        {locales.map((loc) => {
          const active = loc.code === currentLocale;

          return (
            <button
              key={loc.code}
              type="button"
              disabled={isSwitching}
              onClick={() => {
                if (isSwitching) return;
                if (loc.code === currentLocale) {
                  onOpenChange(false);
                  return;
                }
                switchLocale(loc.code);
                onOpenChange(false);
              }}
              className={cn(
                "w-full rounded-2xl border px-3 py-3",
                "transition duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring",
                isSwitching && "opacity-70 cursor-wait",
                active
                  ? "border-accent-border bg-accent-soft"
                  : "border-border-subtle/70 bg-surface/70 hover:bg-surface-soft",
              )}
            >
              <div className={cn("flex items-center gap-3", rowDir)}>
                <span className="text-lg leading-none" aria-hidden>
                  {loc.flag}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-foreground-strong truncate">
                    {loc.label}
                  </div>
                  <div className="text-xs text-foreground-muted truncate">
                    {loc.shortLabel}
                  </div>
                </div>

                <span
                  className={cn(
                    "grid size-6 place-items-center rounded-full border text-xs font-bold",
                    active
                      ? "border-accent-border bg-accent text-accent-foreground"
                      : "border-border-subtle bg-background/30 text-foreground-muted",
                  )}
                  aria-hidden
                >
                  {active ? "✓" : ""}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </DeModal>
  );
}

function ThemeSelectModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const mounted = useIsMounted();

  const { activeLocale } = useSupportedLocales();
  const isRTL = activeLocale.dir === "rtl";
  const rowDir = isRTL ? "flex-row-reverse text-right" : "flex-row text-left";

  const activeTheme: ThemeId = mounted
    ? resolveThemeId(theme, resolvedTheme)
    : "light";

  return (
    <DeModal
      open={open}
      onOpenChange={onOpenChange}
      mode={{ desktop: "center", mobile: "sheet" }}
      title="تغيير الإضاءة"
      subtitle="اختر المظهر"
      maxWidthClass="max-w-md"
      sheetCollapsedFraction={0.55}
      sheetFullFraction={0.85}
      sheetAutoFit
    >
      <div className="space-y-2">
        {THEME_OPTIONS.map((opt) => {
          const active = opt.id === activeTheme;

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                setTheme(opt.id);
                onOpenChange(false);
              }}
              className={cn(
                "w-full rounded-2xl border px-3 py-3",
                "transition duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring",
                active
                  ? "border-accent-border bg-accent-soft"
                  : "border-border-subtle/70 bg-surface/70 hover:bg-surface-soft",
              )}
            >
              <div className={cn("flex items-center gap-3", rowDir)}>
                <span
                  className={cn(
                    "grid size-10 place-items-center rounded-2xl border",
                    "border-border-subtle/70 bg-background/30 text-foreground-strong",
                  )}
                  aria-hidden
                >
                  <opt.Icon className="size-5" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-foreground-strong truncate">
                    {opt.labelAr}{" "}
                    <span className="text-xs text-foreground-muted">
                      ({opt.labelEn})
                    </span>
                  </div>
                  <div className="text-xs text-foreground-muted truncate">
                    {opt.descriptionAr}
                  </div>
                </div>

                <span
                  className={cn(
                    "grid size-6 place-items-center rounded-full border text-xs font-bold",
                    active
                      ? "border-accent-border bg-accent text-accent-foreground"
                      : "border-border-subtle bg-background/30 text-foreground-muted",
                  )}
                  aria-hidden
                >
                  {active ? "✓" : ""}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </DeModal>
  );
}

/* ------------------------------------------------------------------ */
/* Main modal */
/* ------------------------------------------------------------------ */

export function UserMenuModal({
  open,
  onOpenChange,
  user,
  profileHref = "/me",
  onLogout,
}: Props) {
  const { activeLocale } = useSupportedLocales();
  const { theme, resolvedTheme } = useTheme();
  const mounted = useIsMounted();

  const isRTL = activeLocale.dir === "rtl";
  const headDir = isRTL ? "flex-row-reverse text-right" : "flex-row text-left";

  const activeTheme: ThemeId = mounted
    ? resolveThemeId(theme, resolvedTheme)
    : "light";
  const themeText =
    activeTheme === "dark"
      ? "داكن"
      : activeTheme === "onepiece"
        ? "ون بيس"
        : "فاتح";

  const [langOpen, setLangOpen] = React.useState(false);
  const [themeOpen, setThemeOpen] = React.useState(false);

  // إذا أغلقت المينيو، اقفل أي sub modal مفتوح
  React.useEffect(() => {
    if (!open) {
      setLangOpen(false);
      setThemeOpen(false);
    }
  }, [open]);

  const closeAll = React.useCallback(() => onOpenChange(false), [onOpenChange]);

  return (
    <>
      <DeModal
        open={open}
        onOpenChange={onOpenChange}
        preset="comments"
        mode={{ desktop: "center", mobile: "sheet" }}
        overlay="dim"
        maxWidthClass="max-w-xl"
        sheetCollapsedFraction={0.74}
        sheetFullFraction={0.92}
        sheetAutoFit
      >
        <div className="space-y-3">
          {/* Header داخل المودال (بديل للـ DeModal header) */}
          <div
            className={cn("flex items-center justify-between gap-3", headDir)}
          >
            <Link
              href={profileHref}
              onClick={closeAll}
              className={cn(
                "flex min-w-0 items-center gap-3 rounded-2xl p-2",
                "transition hover:bg-surface-soft",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring",
              )}
            >
              <Avatar
                src={user.src}
                alt={user.alt}
                size="10"
                blurHash={user.blurHash}
              />

              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground-strong truncate">
                  {user.name}
                </div>
                <div className="text-xs text-foreground-muted truncate">
                  {user.username}
                </div>
              </div>
            </Link>

            <button
              type="button"
              onClick={closeAll}
              aria-label="إغلاق"
              className={cn(
                "grid size-10 place-items-center rounded-2xl border",
                "border-border-subtle bg-surface/70 text-foreground-strong",
                "transition hover:bg-surface-soft",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring",
              )}
            >
              <IoClose className="size-5" />
            </button>
          </div>

          {/* Quick actions (مثل الصورة) */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <QuickActionCard
              href="/settings"
              label="إعدادات الحساب"
              Icon={FiSettings}
              onNavigate={closeAll}
            />
            <QuickActionCard
              href="/upgrade"
              label="ترقية الحزمة"
              Icon={FaCrown}
              onNavigate={closeAll}
            />
            <QuickActionCard
              href="/creators"
              label="برنامج المبدعين"
              Icon={FiUser}
              onNavigate={closeAll}
            />
            <QuickActionCard
              href="/discover"
              label="التصنيفات"
              Icon={FiBookOpen}
              onNavigate={closeAll}
            />
          </div>

          {/* Rows (مثل الصورة) */}
          <div className="space-y-2 pt-1">
            <MenuRowButton
              label="تغيير اللغة"
              Icon={RiTranslate2}
              isRTL={isRTL}
              endSlot={<ValuePill text={activeLocale.label} isRTL={isRTL} />}
              onClick={() => setLangOpen(true)}
            />

            <MenuRowButton
              label="تغيير الإضاءة"
              Icon={RiMoonClearLine}
              isRTL={isRTL}
              endSlot={
                <ValuePill text={mounted ? themeText : "…"} isRTL={isRTL} />
              }
              onClick={() => setThemeOpen(true)}
            />

            <MenuRowLink
              label="الخصوصية والحماية"
              Icon={FiLock}
              href="/privacy"
              isRTL={isRTL}
              onNavigate={closeAll}
            />

            <MenuRowLink
              label="قواعد وإرشادات"
              Icon={FiBookOpen}
              href="/guidelines"
              isRTL={isRTL}
              onNavigate={closeAll}
            />

            <MenuRowLink
              label="المساعدة والدعم"
              Icon={FiHelpCircle}
              href="/support"
              isRTL={isRTL}
              onNavigate={closeAll}
            />

            {onLogout && (
              <MenuRowButton
                label="تسجيل الخروج"
                Icon={FiLogOut}
                isRTL={isRTL}
                tone="danger"
                onClick={() => {
                  closeAll();
                  onLogout();
                }}
              />
            )}
          </div>
        </div>
      </DeModal>

      {/* Nested modals */}
      <LanguageSelectModal open={langOpen} onOpenChange={setLangOpen} />
      <ThemeSelectModal open={themeOpen} onOpenChange={setThemeOpen} />
    </>
  );
}
