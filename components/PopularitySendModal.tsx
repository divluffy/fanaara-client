// components\PopularitySendModal.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import DeModal, { DeModalProps } from "@/design/DeModal";
import {
  IoAdd,
  IoCartOutline,
  IoChevronForward,
  IoFlash,
  IoTimeOutline,
} from "react-icons/io5";

type PopularityTargetType = "user" | "work" | "live" | "other";

type PopularityTarget = {
  id: string;
  name: string;
  avatarUrl?: string;
  subtitle?: string; // small info under name
};

type PopularityPack = {
  id: string;
  amount: number; // popularity amount to send
  name: string;
  emoji: string; // ✅ emoji per pack
};

type HistoryEntry = {
  id: string;
  packId: string;
  packName: string;
  packEmoji: string;
  amount: number;
  quantity: number;
  total: number;
  timestampISO: string;
};

export type PopularitySendModalProps = Omit<
  DeModalProps,
  "children" | "title" | "subtitle" | "footer"
> & {
  target: PopularityTarget;
  targetType?: PopularityTargetType;

  initialBalance?: number;
  purchaseHref?: string;

  onSend?: (payload: {
    targetId: string;
    targetType: PopularityTargetType;
    packId: string;
    amount: number;
    quantity: number;
    total: number;
  }) => Promise<void> | void;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function clampInt(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function tierKey(amount: number) {
  if (amount < 10) return "t1"; // 1-9
  if (amount < 100) return "t2"; // 10-99
  if (amount < 1000) return "t3"; // 100-999
  if (amount < 10_000) return "t4"; // 1K-9K
  if (amount < 100_000) return "t5"; // 10K-99K
  return "t6"; // 100K+
}

const TIER_STYLES: Record<
  ReturnType<typeof tierKey>,
  {
    chip: string;
    ring: string;
    glow: string;
    aura: string;
  }
> = {
  t1: {
    chip: "bg-extra-pink-soft text-extra-pink border-extra-pink-border",
    ring: "ring-extra-pink-ring",
    glow: "shadow-[var(--shadow-glow-pink)]",
    aura: "bg-extra-pink-soft",
  },
  t2: {
    chip: "bg-extra-cyan-soft text-extra-cyan border-extra-cyan-border",
    ring: "ring-extra-cyan-ring",
    glow: "shadow-[var(--shadow-glow-cyan)]",
    aura: "bg-extra-cyan-soft",
  },
  t3: {
    chip: "bg-extra-purple-soft text-extra-purple border-extra-purple-border",
    ring: "ring-extra-purple-ring",
    glow: "shadow-[var(--shadow-glow-purple)]",
    aura: "bg-extra-purple-soft",
  },
  t4: {
    chip: "bg-accent-soft text-accent border-accent-border",
    ring: "ring-accent-ring",
    glow: "shadow-[var(--shadow-glow-brand)]",
    aura: "bg-accent-soft",
  },
  t5: {
    chip: "bg-warning-soft text-warning-700 border-warning-soft-border",
    ring: "ring-warning-500/50",
    glow: "shadow-[var(--shadow-glow-warning)]",
    aura: "bg-warning-soft",
  },
  t6: {
    chip: "bg-warning-soft text-warning-700 border-warning-soft-border",
    ring: "ring-warning-500/70",
    glow: "shadow-[var(--shadow-glow-warning)]",
    aura: "bg-warning-soft",
  },
};

function formatCompact(n: number, locale: string) {
  try {
    return new Intl.NumberFormat(locale, {
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: 1,
    }).format(n);
  } catch {
    return n.toLocaleString();
  }
}

/* ─────────────────────────────────────────────────────────────
   ✅ 30 packs (1 → 1,000,000) — emoji icons
   ───────────────────────────────────────────────────────────── */

const POPULARITY_PACKS: PopularityPack[] = [
  // 1–9
  { id: "p1", amount: 1, name: "بتلة ساكورا", emoji: "🌸" },
  { id: "p3", amount: 3, name: "وميض تشيبي", emoji: "✨" },
  { id: "p5", amount: 5, name: "كوناي نينجا", emoji: "🗡️" },
  { id: "p8", amount: 8, name: "نجمة سريعة", emoji: "⭐" },

  // 10–99
  { id: "p10", amount: 10, name: "لفافة تدريب", emoji: "📜" },
  { id: "p15", amount: 15, name: "قناع أنمي", emoji: "🎭" },
  { id: "p20", amount: 20, name: "طاقة برق", emoji: "⚡" },
  { id: "p25", amount: 25, name: "رامن", emoji: "🍜" },
  { id: "p50", amount: 50, name: "كاتانا", emoji: "⚔️" },
  { id: "p75", amount: 75, name: "تعويذة", emoji: "🔮" },

  // 100–999
  { id: "p100", amount: 100, name: "شعار البطولة", emoji: "🏷️" },
  { id: "p150", amount: 150, name: "شظية طاقة", emoji: "💠" },
  { id: "p200", amount: 200, name: "درع", emoji: "🛡️" },
  { id: "p300", amount: 300, name: "سيف أسطوري", emoji: "🗡️" },
  { id: "p500", amount: 500, name: "تاج", emoji: "👑" },
  { id: "p800", amount: 800, name: "جوهرة", emoji: "💎" },

  // 1K–9K
  { id: "p1000", amount: 1_000, name: "هالة", emoji: "🌀" },
  { id: "p1500", amount: 1_500, name: "شهاب", emoji: "🌠" },
  { id: "p2000", amount: 2_000, name: "بوابة", emoji: "🌀" },
  { id: "p3000", amount: 3_000, name: "تنين حارس", emoji: "🐉" },
  { id: "p5000", amount: 5_000, name: "كأس المجد", emoji: "🏆" },

  // 10K–99K
  { id: "p10000", amount: 10_000, name: "مجرة", emoji: "🌌" },
  { id: "p15000", amount: 15_000, name: "جناح نور", emoji: "🪽" },
  { id: "p25000", amount: 25_000, name: "تاج الإمارة", emoji: "👑" },
  { id: "p50000", amount: 50_000, name: "نيزك", emoji: "☄️" },
  { id: "p75000", amount: 75_000, name: "شعلة الهيبة", emoji: "🔥" },

  // 100K–1M
  { id: "p100000", amount: 100_000, name: "ملحمة", emoji: "🎇" },
  { id: "p250000", amount: 250_000, name: "أسطورة", emoji: "🏆" },
  { id: "p500000", amount: 500_000, name: "إمبراطور", emoji: "🐲" },
  { id: "p1000000", amount: 1_000_000, name: "القوة المطلقة", emoji: "♾️" },
];

const PACK_BY_ID = new Map<string, PopularityPack>(
  POPULARITY_PACKS.map((p) => [p.id, p]),
);

const TARGET_META: Record<
  PopularityTargetType,
  { label: string; badge?: string }
> = {
  user: { label: "دعم مستخدم" },
  work: { label: "دعم عمل" },
  live: { label: "دعم بث مباشر", badge: "LIVE" },
  other: { label: "دعم" },
};

const DEFAULT_TARGET: PopularityTarget = {
  id: "t-1",
  name: "Kira Senpai",
  subtitle: "صائد الشياطين ⚔️",
  avatarUrl:
    "https://api.dicebear.com/9.x/avataaars/svg?seed=Felix&backgroundColor=ffdfbf",
};

export default function PopularitySendModal({
  open,
  onOpenChange,

  target = DEFAULT_TARGET,
  targetType = "user",

  initialBalance = 0,
  purchaseHref = "/shop",

  onSend,

  dir = "auto",
  ...modalProps
}: PopularitySendModalProps) {
  const router = useRouter();

  const [resolvedDir, setResolvedDir] = useState<"rtl" | "ltr">(
    dir === "rtl" ? "rtl" : dir === "ltr" ? "ltr" : "rtl",
  );

  useEffect(() => {
    if (dir === "rtl" || dir === "ltr") {
      setResolvedDir(dir);
      return;
    }
    const d = document?.documentElement?.dir;
    setResolvedDir(d === "rtl" ? "rtl" : "ltr");
  }, [dir]);

  const isRTL = resolvedDir === "rtl";
  const locale = isRTL ? "ar" : "en";

  const [balance, setBalance] = useState<number>(initialBalance);
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  const [view, setView] = useState<"packs" | "history">("packs");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isSending, setIsSending] = useState(false);

  const [pulse, setPulse] = useState<{
    emoji: string;
    quantity: number;
    total: number;
  } | null>(null);

  const selectedPack = useMemo(
    () => (selectedPackId ? (PACK_BY_ID.get(selectedPackId) ?? null) : null),
    [selectedPackId],
  );

  const total = selectedPack ? selectedPack.amount * quantity : 0;
  const canAfford = selectedPack ? balance >= total : true;

  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setSelectedPackId(null);
        setQuantity(1);
        setView("packs");
        setIsSending(false);
        setPulse(null);
      }, 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    setBalance(initialBalance);
  }, [initialBalance]);

  const goToPurchase = () => {
    onOpenChange(false);
    router.push(purchaseHref);
  };

  const handlePackPress = (packId: string) => {
    setSelectedPackId((prev) => {
      if (prev === packId) {
        setQuantity((q) => clampInt(q + 1, 1, 99)); // ✅ click same pack increments
        return prev;
      }
      setQuantity(1);
      return packId;
    });
  };

  const bumpQuantity = (delta: number) =>
    setQuantity((q) => clampInt(q + delta, 1, 99));
  const setMaxQuantity = () => setQuantity(99);

  const handleSend = async () => {
    if (!selectedPack) return;

    if (!canAfford) {
      goToPurchase();
      return;
    }

    const payload = {
      targetId: target.id,
      targetType,
      packId: selectedPack.id,
      amount: selectedPack.amount,
      quantity,
      total,
    };

    setIsSending(true);
    try {
      await onSend?.(payload);

      setBalance((b) => b - total);

      setHistory((h) => [
        {
          id: `${Date.now()}`,
          packId: selectedPack.id,
          packName: selectedPack.name,
          packEmoji: selectedPack.emoji,
          amount: selectedPack.amount,
          quantity,
          total,
          timestampISO: new Date().toISOString(),
        },
        ...h,
      ]);

      setPulse({ emoji: selectedPack.emoji, quantity, total });
      setTimeout(() => setPulse(null), 650);
    } finally {
      setIsSending(false);
    }
  };

  const headerRowDir = isRTL
    ? "flex-row-reverse text-right"
    : "flex-row text-left";
  const slideFrom = isRTL ? "100%" : "-100%";

  // ✅ Footer: show only when a pack is selected, and only in packs view
  const footer =
    selectedPack && view === "packs" ? (
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 420, damping: 30 }}
        className={cn(
          "flex items-center gap-2",
          isRTL ? "flex-row-reverse" : "flex-row",
        )}
      >
        {/* 3 quick options only */}
        <div
          className={cn(
            "flex items-center gap-2",
            isRTL ? "flex-row-reverse" : "flex-row",
          )}
        >
          <button
            type="button"
            onClick={() => bumpQuantity(10)}
            className={cn(
              "h-11 w-14 rounded-xl border text-sm font-extrabold",
              "bg-surface-soft border-border-subtle text-foreground-strong",
              "hover:bg-surface active:scale-95 transition",
            )}
          >
            +10
          </button>

          <button
            type="button"
            onClick={() => bumpQuantity(25)}
            className={cn(
              "h-11 w-14 rounded-xl border text-sm font-extrabold",
              "bg-surface-soft border-border-subtle text-foreground-strong",
              "hover:bg-surface active:scale-95 transition",
            )}
          >
            +25
          </button>

          <button
            type="button"
            onClick={setMaxQuantity}
            className={cn(
              "h-11 w-14 rounded-xl border text-sm font-extrabold",
              "bg-warning-soft border-warning-soft-border text-warning-700",
              "hover:brightness-105 active:scale-95 transition",
            )}
          >
            MAX
          </button>
        </div>

        {/* Send/Purchase button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={isSending}
          className={cn(
            "relative flex-1 h-11 rounded-xl border px-3 overflow-hidden",
            "transition active:scale-[0.985] disabled:opacity-70 disabled:cursor-not-allowed",
            canAfford
              ? "bg-gradient-to-r from-accent to-extra-purple-solid text-accent-foreground border-accent-border shadow-[var(--shadow-glow-brand)]"
              : "bg-gradient-to-r from-danger-600 to-danger-500 text-danger-foreground border-danger-soft-border shadow-[var(--shadow-glow-danger)]",
          )}
        >
          <div className="flex h-full items-center justify-between gap-3">
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-black leading-none truncate">
                {isSending
                  ? "جارٍ الإرسال..."
                  : canAfford
                    ? "إرسال الشعبية"
                    : "شراء الشعبية"}
              </span>

              <span className="text-[11px] opacity-90 leading-none truncate">
                <span className="me-1">{selectedPack.emoji}</span>
                <span className="font-bold">{selectedPack.name}</span>
                <span className="opacity-70"> • </span>
                <span dir="ltr" className="font-mono tabular-nums">
                  x{quantity}
                </span>
                <span className="opacity-70"> • </span>
                <span dir="ltr" className="font-mono tabular-nums">
                  {total.toLocaleString(locale)}
                </span>{" "}
                <span className="opacity-90">شعبية</span>
                {!canAfford && (
                  <>
                    <span className="opacity-70"> — </span>
                    <span className="opacity-90">
                      تنقصك{" "}
                      <span dir="ltr" className="font-mono tabular-nums">
                        {(total - balance).toLocaleString(locale)}
                      </span>
                    </span>
                  </>
                )}
              </span>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              {canAfford ? (
                <IoFlash className="size-5 opacity-90" />
              ) : (
                <IoCartOutline className="size-5 opacity-90" />
              )}
            </div>
          </div>
        </button>
      </motion.div>
    ) : null;

  return (
    <DeModal
      {...modalProps}
      open={open}
      onOpenChange={onOpenChange}
      dir={dir}
      preset="comments"
      contentPadding="none"
      panelClassName={cn(
        "relative overflow-hidden",
        "rounded-t-3xl sm:rounded-3xl",
      )}
      footer={footer}
    >
      <div className="relative">
        {/* Next-gen background (clean + anime vibe, theme-friendly) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute -top-24 -right-24 size-72 rounded-full bg-extra-cyan-soft blur-3xl opacity-65" />
          <div className="absolute -bottom-24 -left-24 size-72 rounded-full bg-extra-purple-soft blur-3xl opacity-65" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background-elevated/35" />
        </div>

        {/* Header: target info + (history + balance) only */}
        <div
          className={cn(
            "sticky top-0 z-20",
            "bg-background-elevated/88 backdrop-blur-md",
            "border-b border-border-subtle",
          )}
        >
          <div
            className={cn(
              "flex items-center justify-between gap-3 p-4",
              headerRowDir,
            )}
          >
            {/* Target */}
            <div
              className={cn(
                "flex items-center gap-3 min-w-0",
                isRTL ? "flex-row-reverse" : "flex-row",
              )}
            >
              <div className="relative shrink-0">
                <div className="absolute -inset-1 rounded-full bg-accent-soft blur-md opacity-70" />
                {target.avatarUrl ? (
                  <img
                    src={target.avatarUrl}
                    alt={target.name}
                    className="relative size-11 rounded-full border border-border-strong bg-surface object-cover"
                  />
                ) : (
                  <div className="relative size-11 rounded-full border border-border-strong bg-surface-soft" />
                )}

                {TARGET_META[targetType].badge && (
                  <span
                    className={cn(
                      "absolute -bottom-1",
                      isRTL ? "-left-1" : "-right-1",
                      "rounded-full px-2 py-0.5 text-[10px] font-black",
                      "bg-danger-solid text-danger-foreground border border-danger-soft-border",
                      "shadow-[var(--shadow-glow-danger)]",
                    )}
                  >
                    {TARGET_META[targetType].badge}
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <span className="truncate text-sm font-black text-foreground-strong">
                  {target.name}
                </span>

                <div className="mt-1 text-[11px] text-foreground-muted truncate">
                  {TARGET_META[targetType].label}
                  {target.subtitle ? ` • ${target.subtitle}` : ""}
                </div>
              </div>
            </div>

            {/* Actions: History + Balance */}
            <div
              className={cn(
                "flex items-center gap-2 shrink-0",
                isRTL ? "flex-row-reverse" : "flex-row",
              )}
            >
              <button
                type="button"
                onClick={() => setView("history")}
                className={cn(
                  "h-10 rounded-full px-3 border",
                  "bg-surface-soft border-border-subtle",
                  "hover:bg-surface active:scale-95 transition",
                  "flex items-center gap-2",
                )}
                aria-label="History"
              >
                <IoTimeOutline className="size-4 text-foreground-muted" />
                <span className="text-xs font-extrabold text-foreground-strong">
                  السجل
                </span>
              </button>

              <button
                type="button"
                onClick={goToPurchase}
                className={cn(
                  "h-10 rounded-full px-3 border",
                  "bg-surface-soft border-border-subtle",
                  "hover:bg-surface active:scale-95 transition",
                  "flex items-center gap-2",
                )}
                aria-label="Popularity balance"
              >
                <IoFlash className="size-4 text-warning-500" />
                <span
                  dir="ltr"
                  className="text-xs font-black font-mono tabular-nums text-foreground-strong"
                >
                  {balance.toLocaleString(locale)}
                </span>
                <span className="grid size-6 place-items-center rounded-full bg-warning-soft border border-warning-soft-border text-warning-700">
                  <IoAdd className="size-4" />
                </span>
              </button>
            </div>
          </div>

          {/* Tiny note */}
          <div className="px-4 pb-3">
            <div className="text-[11px] text-foreground-muted">
              الشعبية ترفع التفاعل، تدعم العمل/الشخص، وتساعد على تصدّر الرتب
              وتقوية الحساب.
            </div>
          </div>
        </div>

        {/* Packs: ✅ single grid (no sections) */}
        <div className="p-4 pb-24">
          <div
            className={cn(
              "mb-4 text-[11px] text-foreground-soft",
              isRTL ? "text-right" : "text-left",
            )}
          >
            تلميح: اضغط نفس الحزمة أكثر من مرة لزيادة التضاعف تلقائيًا (حتى{" "}
            <span dir="ltr" className="font-mono tabular-nums">
              99
            </span>
            ).
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {POPULARITY_PACKS.map((pack) => {
              const active = selectedPackId === pack.id;
              const tier = tierKey(pack.amount);
              const s = TIER_STYLES[tier];

              return (
                <button
                  key={pack.id}
                  type="button"
                  onClick={() => handlePackPress(pack.id)}
                  className={cn(
                    "group relative rounded-2xl border p-3 text-start overflow-hidden",
                    "transition active:scale-[0.985]",
                    "bg-surface-soft border-border-subtle hover:bg-surface hover:border-border-strong",
                    active &&
                      cn(
                        "bg-surface border-accent-border ring-2",
                        s.ring,
                        s.glow,
                      ),
                  )}
                  aria-pressed={active}
                >
                  {/* Soft aura */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute -top-10 -right-10 size-28 rounded-full blur-2xl opacity-0 transition-opacity",
                      s.aura,
                      active ? "opacity-70" : "group-hover:opacity-45",
                    )}
                  />

                  {/* Quantity badge */}
                  {active && quantity > 1 && (
                    <span
                      className={cn(
                        "absolute top-2",
                        isRTL ? "left-2" : "right-2",
                        "rounded-md px-1.5 py-0.5 text-[10px] font-black",
                        "bg-danger-solid text-danger-foreground border border-danger-soft-border",
                      )}
                      dir="ltr"
                    >
                      x{quantity}
                    </span>
                  )}

                  {/* Emoji icon */}
                  <div
                    className={cn(
                      "mb-3 grid size-12 place-items-center rounded-xl border",
                      s.chip,
                      "shadow-sm",
                      active && s.glow,
                    )}
                  >
                    <span className="text-[26px] leading-none">
                      {pack.emoji}
                    </span>
                  </div>

                  {/* Name */}
                  <div className="text-[11px] font-extrabold text-foreground-strong truncate">
                    {pack.name}
                  </div>

                  {/* Amount pill */}
                  <div
                    className={cn(
                      "mt-2 inline-flex items-center gap-1 rounded-lg border px-2 py-1",
                      "bg-background-elevated border-border-subtle",
                    )}
                  >
                    <IoFlash className="size-3 text-warning-500" />
                    <span
                      dir="ltr"
                      className="text-[11px] font-black font-mono tabular-nums text-foreground-strong"
                    >
                      {formatCompact(pack.amount, locale)}
                    </span>
                    <span className="text-[10px] text-foreground-muted">
                      شعبية
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* History overlay */}
        <AnimatePresence>
          {view === "history" && (
            <motion.div
              className="absolute inset-0 z-30 bg-background-elevated"
              initial={{ x: slideFrom }}
              animate={{ x: 0 }}
              exit={{ x: slideFrom }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
            >
              <div className="sticky top-0 z-20 border-b border-border-subtle bg-background-elevated/92 backdrop-blur-md">
                <div
                  className={cn(
                    "flex items-center justify-between gap-3 p-4",
                    headerRowDir,
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setView("packs")}
                    className={cn(
                      "h-10 w-10 rounded-full border grid place-items-center",
                      "bg-surface-soft border-border-subtle hover:bg-surface active:scale-95 transition",
                    )}
                    aria-label="Back"
                  >
                    <IoChevronForward
                      className={cn("size-5", isRTL ? "" : "rotate-180")}
                    />
                  </button>

                  <div className="min-w-0">
                    <div className="text-sm font-black text-foreground-strong">
                      السجل
                    </div>
                    <div className="text-[11px] text-foreground-muted">
                      آخر عمليات إرسال الشعبية
                    </div>
                  </div>

                  <div className="shrink-0">
                    <div
                      className={cn(
                        "h-10 rounded-full px-3 border",
                        "bg-surface-soft border-border-subtle",
                        "flex items-center gap-2",
                      )}
                    >
                      <IoFlash className="size-4 text-warning-500" />
                      <span
                        dir="ltr"
                        className="text-xs font-black font-mono tabular-nums text-foreground-strong"
                      >
                        {balance.toLocaleString(locale)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4">
                {history.length === 0 ? (
                  <div className="py-14 text-center">
                    <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl border border-border-subtle bg-surface-soft">
                      <IoTimeOutline className="size-8 text-foreground-soft" />
                    </div>
                    <div className="text-sm font-black text-foreground-strong">
                      السجل فارغ
                    </div>
                    <div className="mt-1 text-[11px] text-foreground-muted">
                      أول إرسال لك سيظهر هنا ✨
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {history.map((h) => (
                      <div
                        key={h.id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-border-subtle bg-card px-3 py-3"
                      >
                        <div
                          className={cn(
                            "flex items-center gap-3 min-w-0",
                            isRTL ? "flex-row-reverse" : "flex-row",
                          )}
                        >
                          <div className="grid size-12 place-items-center rounded-xl border border-border-subtle bg-surface-soft">
                            <span className="text-[24px] leading-none">
                              {h.packEmoji}
                            </span>
                          </div>

                          <div className="min-w-0">
                            <div className="truncate text-sm font-extrabold text-foreground-strong">
                              {h.packName}
                            </div>
                            <div className="mt-1 text-[11px] text-foreground-muted">
                              <span
                                dir="ltr"
                                className="font-mono tabular-nums"
                              >
                                x{h.quantity}
                              </span>{" "}
                              •{" "}
                              <span
                                dir="ltr"
                                className="font-mono tabular-nums"
                              >
                                {h.total.toLocaleString(locale)}
                              </span>{" "}
                              شعبية
                            </div>
                          </div>
                        </div>

                        <div
                          dir="ltr"
                          className="shrink-0 text-xs font-black font-mono tabular-nums text-danger-500"
                        >
                          -{h.total.toLocaleString(locale)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Send pulse */}
        <AnimatePresence>
          {pulse && (
            <motion.div
              className="pointer-events-none absolute inset-0 z-40 grid place-items-center bg-black/35 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
              <motion.div
                initial={{ scale: 0.92, y: 10, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 1.06, y: -6, opacity: 0 }}
                transition={{ type: "spring", stiffness: 420, damping: 28 }}
                className={cn(
                  "w-[88%] max-w-sm rounded-3xl border border-border-subtle bg-background-elevated p-5 text-center",
                  "shadow-[var(--shadow-elevated)]",
                )}
              >
                <div className="text-base font-black text-foreground-strong">
                  تم الإرسال {pulse.emoji}
                </div>
                <div className="mt-1 text-[11px] text-foreground-muted">
                  <span dir="ltr" className="font-mono tabular-nums">
                    x{pulse.quantity}
                  </span>{" "}
                  •{" "}
                  <span dir="ltr" className="font-mono tabular-nums">
                    {pulse.total.toLocaleString(locale)}
                  </span>{" "}
                  شعبية إلى {target.name}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DeModal>
  );
}
