// components/SenkoGiftModal.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";

import DeModal, { type DeModalProps } from "@/design/DeModal";

import {
  IoCartOutline,
  IoChevronForward,
  IoFlash,
  IoSparkles,
} from "react-icons/io5";
import {
  FaBroadcastTower,
  FaBuilding,
  FaCameraRetro,
  FaChessKnight,
  FaCrown,
  FaDragon,
  FaFeatherAlt,
  FaFire,
  FaFish,
  FaGamepad,
  FaGem,
  FaGhost,
  FaHandshake,
  FaHatWizard,
  FaHeart,
  FaHistory,
  FaInfinity,
  FaLeaf,
  FaMagic,
  FaMeteor,
  FaMoon,
  FaRocket,
  FaScroll,
  FaShieldAlt,
  FaSkullCrossbones,
  FaStar,
  FaSun,
  FaUser,
  FaVideo,
  FaBookOpen,
  FaBolt,
} from "react-icons/fa";

// ===================================
// Types
// ===================================

export type SupportTargetType = "user" | "business" | "live" | "other";

type GiftTier = "common" | "rare" | "epic" | "legendary" | "mythic";
type IconType = React.ComponentType<{ className?: string }>;

type TargetInfo = {
  id: string;
  name: string;
  avatarUrl: string;
  subtitle?: string;
};

type GiftBundle = {
  id: string;
  name: string;
  cost: number; // Senko
  tier: GiftTier;
  Icon: IconType;
};

type HistoryEntry = {
  id: number;
  bundleId: string;
  bundleName: string;
  qty: number;
  totalCost: number;
  tsLabel: string;
};

export type SenkoGiftModalProps = Omit<
  DeModalProps,
  "children" | "title" | "subtitle" | "footer" | "preset"
> & {
  target: TargetInfo;
  targetType: SupportTargetType;

  initialBalance?: number;

  /** إذا الرصيد غير كافي أو المستخدم ضغط زر الرصيد */
  topUpHref?: string;

  /** Optional hook to call your API */
  onSendGift?: (payload: {
    targetId: string;
    targetType: SupportTargetType;
    bundleId: string;
    quantity: number;
    totalCost: number;
  }) => Promise<void> | void;
};

// ===================================
// Data (30+ bundles)
// ===================================

const BUNDLES: GiftBundle[] = [
  // Common (500 -> 5000)
  {
    id: "b-500",
    name: "شرارة ساكورا",
    cost: 500,
    tier: "common",
    Icon: FaLeaf,
  },
  { id: "b-750", name: "نبضة قلب", cost: 750, tier: "common", Icon: FaHeart },
  {
    id: "b-1000",
    name: "نجمة كاوايي",
    cost: 1000,
    tier: "common",
    Icon: FaStar,
  },
  { id: "b-1500", name: "ومضة سرعة", cost: 1500, tier: "common", Icon: FaBolt },
  {
    id: "b-2000",
    name: "ريشة لطيفة",
    cost: 2000,
    tier: "common",
    Icon: FaFeatherAlt,
  },
  { id: "b-2500", name: "لمسة سحر", cost: 2500, tier: "common", Icon: FaMagic },
  { id: "b-3000", name: "حجر بريق", cost: 3000, tier: "common", Icon: FaGem },
  { id: "b-4000", name: "شعلة حماس", cost: 4000, tier: "common", Icon: FaFire },
  { id: "b-5000", name: "قمر هادئ", cost: 5000, tier: "common", Icon: FaMoon },

  // Rare (7500 -> 30000)
  { id: "b-7500", name: "شمس طاقة", cost: 7500, tier: "rare", Icon: FaSun },
  {
    id: "b-10000",
    name: "درع داعم",
    cost: 10000,
    tier: "rare",
    Icon: FaShieldAlt,
  },
  { id: "b-12500", name: "طيف لطيف", cost: 12500, tier: "rare", Icon: FaGhost },
  {
    id: "b-15000",
    name: "تنين صغير",
    cost: 15000,
    tier: "rare",
    Icon: FaDragon,
  },
  {
    id: "b-20000",
    name: "تاج سينباي",
    cost: 20000,
    tier: "rare",
    Icon: FaCrown,
  },
  {
    id: "b-25000",
    name: "صاروخ تشجيع",
    cost: 25000,
    tier: "rare",
    Icon: FaRocket,
  },
  {
    id: "b-30000",
    name: "علامة أرك",
    cost: 30000,
    tier: "rare",
    Icon: FaScroll,
  },

  // Epic (40000 -> 100000)
  {
    id: "b-40000",
    name: "هيبة فارسة",
    cost: 40000,
    tier: "epic",
    Icon: FaChessKnight,
  },
  {
    id: "b-50000",
    name: "قبعة ساحر",
    cost: 50000,
    tier: "epic",
    Icon: FaHatWizard,
  },
  {
    id: "b-60000",
    name: "يد تحية",
    cost: 60000,
    tier: "epic",
    Icon: FaHandshake,
  },
  {
    id: "b-75000",
    name: "وضع لعب",
    cost: 75000,
    tier: "epic",
    Icon: FaGamepad,
  },
  {
    id: "b-100000",
    name: "مشهد فيديو",
    cost: 100000,
    tier: "epic",
    Icon: FaVideo,
  },

  // Legendary (125000 -> 300000)
  {
    id: "b-125000",
    name: "لقطة أسطورية",
    cost: 125000,
    tier: "legendary",
    Icon: FaCameraRetro,
  },
  {
    id: "b-150000",
    name: "مخطوطة قديمة",
    cost: 150000,
    tier: "legendary",
    Icon: FaBookOpen,
  },
  {
    id: "b-200000",
    name: "عاصفة جماجم",
    cost: 200000,
    tier: "legendary",
    Icon: FaSkullCrossbones,
  },
  {
    id: "b-250000",
    name: "نيزك دعم",
    cost: 250000,
    tier: "legendary",
    Icon: FaMeteor,
  },
  {
    id: "b-300000",
    name: "سمكة الحظ",
    cost: 300000,
    tier: "legendary",
    Icon: FaFish,
  },

  // Mythic (400000 -> 1,000,000)
  {
    id: "b-400000",
    name: "شعلة لا تنطفئ",
    cost: 400000,
    tier: "mythic",
    Icon: FaFire,
  },
  {
    id: "b-500000",
    name: "بريق لانهائي",
    cost: 500000,
    tier: "mythic",
    Icon: FaInfinity,
  },
  {
    id: "b-750000",
    name: "تنين القمة",
    cost: 750000,
    tier: "mythic",
    Icon: FaDragon,
  },
  {
    id: "b-1000000",
    name: "تاج المليون",
    cost: 1000000,
    tier: "mythic",
    Icon: FaCrown,
  },
];

// ===================================
// Styling helpers (theme tokens friendly)
// ===================================

const tierStyles: Record<
  GiftTier,
  {
    cardBase: string;
    iconWrap: string;
    dot: string;
    activeRing: string;
  }
> = {
  common: {
    cardBase: "bg-surface hover:bg-surface-soft border-border-subtle",
    iconWrap: "bg-brand-50 text-brand-700 border border-brand-200/40",
    dot: "bg-brand-400",
    activeRing: "ring-brand-400/30 border-brand-400/60",
  },
  rare: {
    cardBase: "bg-surface hover:bg-surface-soft border-border-subtle",
    iconWrap:
      "bg-extra-cyan-soft text-extra-cyan border border-extra-cyan-border/60",
    dot: "bg-extra-cyan",
    activeRing: "ring-extra-cyan/30 border-extra-cyan/70",
  },
  epic: {
    cardBase: "bg-surface hover:bg-surface-soft border-border-subtle",
    iconWrap:
      "bg-extra-purple-soft text-extra-purple border border-extra-purple-border/60",
    dot: "bg-extra-purple",
    activeRing: "ring-extra-purple-ring/40 border-extra-purple/70",
  },
  legendary: {
    cardBase: "bg-surface hover:bg-surface-soft border-border-subtle",
    iconWrap:
      "bg-warning-soft text-warning-foreground border border-warning-soft-border/80",
    dot: "bg-warning-500",
    activeRing: "ring-warning-soft-ring/40 border-warning-500/70",
  },
  mythic: {
    cardBase: "bg-surface hover:bg-surface-soft border-border-subtle",
    iconWrap:
      "bg-gradient-to-br from-brand-400/20 to-extra-pink-soft text-foreground-strong border border-border-subtle",
    dot: "bg-extra-pink",
    activeRing: "ring-brand-400/25 border-brand-400/70",
  },
};

function formatSenko(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

// level indicator (very small + in header)
function computeLevel(totalSentThisSession: number) {
  // بسيطة ومشجّعة، بدون أي ذكر دولار
  const thresholds = [0, 10_000, 50_000, 200_000, 750_000, 1_500_000];
  const labels = ["LV.1", "LV.2", "LV.3", "LV.4", "LV.5", "LV.MAX"];

  let idx = 0;
  for (let i = 0; i < thresholds.length; i++) {
    if (totalSentThisSession >= thresholds[i]) idx = i;
  }
  return { label: labels[idx] };
}

function targetMeta(t: SupportTargetType) {
  switch (t) {
    case "user":
      return { label: "مستخدم", Icon: FaUser };
    case "business":
      return { label: "عمل", Icon: FaBuilding };
    case "live":
      return { label: "بث مباشر", Icon: FaBroadcastTower };
    default:
      return { label: "دعم", Icon: IoSparkles };
  }
}

// ===================================
// Component
// ===================================

export default function SenkoGiftModal({
  open,
  onOpenChange,

  target,
  targetType,

  initialBalance = 1540,
  topUpHref = "/wallet/topup",

  onSendGift,

  // DeModal props passthrough
  overlay = "blur",
  mode,
  dir = "auto",
  sheetDragMode = "binary",
  sheetAutoFit = true,
  closeOnBackdrop = true,
  closeOnEsc = true,

  panelClassName,
  contentClassName,
  ...rest
}: SenkoGiftModalProps) {
  const router = useRouter();

  // wallet
  const [balance, setBalance] = useState(initialBalance);

  // selection
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [qty, setQty] = useState(1);

  // history
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // effects
  const [sendingFx, setSendingFx] = useState<null | {
    name: string;
    qty: number;
    Icon: IconType;
  }>(null);

  const selected = useMemo(
    () => BUNDLES.find((b) => b.id === selectedId) ?? null,
    [selectedId],
  );

  const totalCost = useMemo(
    () => (selected ? selected.cost * qty : 0),
    [selected, qty],
  );

  const canAfford = selected ? balance >= totalCost : false;

  const sessionSent = useMemo(
    () => history.reduce((acc, h) => acc + h.totalCost, 0),
    [history],
  );

  const level = useMemo(() => computeLevel(sessionSent), [sessionSent]);

  const meta = useMemo(() => targetMeta(targetType), [targetType]);

  const goTopUp = () => router.push(topUpHref);

  const onPick = (bundleId: string) => {
    setSelectedId((prev) => {
      if (prev === bundleId) {
        setQty((q) => Math.min(99, q + 1));
        return prev;
      }
      setQty(1);
      return bundleId;
    });
  };

  const setQuick = (n: number) => setQty(Math.max(1, Math.min(99, n)));

  const send = async () => {
    if (!selected) return;

    if (!canAfford) {
      goTopUp();
      return;
    }

    // optimistic UI
    const payload = {
      targetId: target.id,
      targetType,
      bundleId: selected.id,
      quantity: qty,
      totalCost,
    };

    try {
      await onSendGift?.(payload);
    } catch {
      // حتى لو فشل API عندك، UI ما نكبّره هنا
      // الأفضل تربطه بتوست عندك
    }

    setBalance((b) => b - totalCost);

    setHistory((prev) => [
      {
        id: Date.now(),
        bundleId: selected.id,
        bundleName: selected.name,
        qty,
        totalCost,
        tsLabel: "الآن",
      },
      ...prev,
    ]);

    setSendingFx({ name: selected.name, qty, Icon: selected.Icon });
    window.setTimeout(() => setSendingFx(null), 650);
  };

  // Reset on close
  useEffect(() => {
    if (!open) {
      const t = window.setTimeout(() => {
        setSelectedId(null);
        setQty(1);
        setHistoryOpen(false);
        setSendingFx(null);
        setBalance(initialBalance);
        setHistory([]);
      }, 220);
      return () => window.clearTimeout(t);
    }
  }, [open, initialBalance]);

  const slideFromX = dir === "rtl" ? "-100%" : "100%";
  const backIconClass = dir === "rtl" ? "" : "rotate-180";

  return (
    <DeModal
      open={open}
      onOpenChange={onOpenChange}
      overlay={overlay}
      mode={mode}
      dir={dir}
      preset="comments"
      contentPadding="none"
      sheetDragMode={sheetDragMode}
      sheetAutoFit={sheetAutoFit}
      closeOnBackdrop={closeOnBackdrop}
      closeOnEsc={closeOnEsc}
      panelClassName={[
        // modal shell
        "w-full max-w-lg h-[90vh] sm:h-[820px]",
        "bg-background-elevated text-foreground",
        "border border-border-subtle rounded-t-3xl sm:rounded-3xl overflow-hidden",
        "shadow-[var(--shadow-elevated)]",
        panelClassName ?? "",
      ].join(" ")}
      // IMPORTANT: prevent double scroll; we manage scroll inside
      contentClassName={["p-0 overflow-hidden", contentClassName ?? ""].join(
        " ",
      )}
      {...rest}
    >
      <div className="relative h-full flex flex-col">
        {/* Top subtle glow line */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-brand-400/40 to-transparent" />

        {/* =======================
            HEADER (short)
           ======================= */}
        <div className="shrink-0 px-4 pt-4 pb-3 border-b border-border-subtle bg-background-elevated">
          <div className="flex items-center justify-between gap-3">
            {/* Target */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <div className="absolute inset-0 rounded-full blur-md opacity-40 bg-brand-400/40" />
                <img
                  src={target.avatarUrl}
                  alt={target.name}
                  className="relative z-10 size-11 rounded-full border border-border-subtle bg-surface"
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="font-extrabold text-foreground-strong truncate">
                    {target.name}
                  </div>

                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] border border-border-subtle bg-surface-soft text-foreground-muted">
                    <meta.Icon className="text-[11px]" />
                    {meta.label}
                  </span>
                </div>

                {target.subtitle ? (
                  <div className="mt-0.5 text-[11px] text-foreground-muted truncate">
                    {target.subtitle}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Actions: balance + history */}
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goTopUp}
                  className={[
                    "h-10 px-3 rounded-2xl",
                    "border border-border-subtle bg-surface-soft",
                    "hover:bg-surface transition",
                    "flex items-center gap-2",
                  ].join(" ")}
                  title="الرصيد"
                >
                  <IoFlash className="text-warning-500" />
                  <bdi
                    dir="ltr"
                    className="font-mono font-extrabold tabular-nums text-foreground-strong"
                  >
                    {formatSenko(balance)}
                  </bdi>
                  <span className="text-[10px] text-foreground-muted">
                    سينكو
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setHistoryOpen(true)}
                  className={[
                    "size-10 rounded-2xl",
                    "border border-border-subtle bg-surface-soft",
                    "hover:bg-surface transition",
                    "grid place-items-center",
                  ].join(" ")}
                  title="السجل"
                  aria-label="السجل"
                >
                  <FaHistory className="text-foreground-strong" />
                </button>
              </div>

              {/* Current level indicator (tiny) */}
              <div className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] border border-border-subtle bg-surface-soft text-foreground-muted">
                <IoSparkles className="text-brand-500" />
                <span className="font-semibold">{level.label}</span>
              </div>
            </div>
          </div>
        </div>

        {/* =======================
            BODY (packages)
           ======================= */}
        <div className="relative flex-1 min-h-0 overflow-y-auto app-scroll">
          {/* micro note (short + meaningful) */}
          <div className="px-4 pt-3">
            <div className="rounded-2xl border border-border-subtle bg-surface-soft px-3 py-2 text-[12px] text-foreground-muted flex items-start gap-2">
              <IoSparkles className="mt-0.5 text-brand-500 shrink-0" />
              <p className="leading-relaxed">
                دعمك يصنع فرقًا ويعطي دفعة حقيقية للمبدعين والأعمال لإنتاج محتوى
                أفضل واستمرارية أقوى.
              </p>
            </div>
          </div>

          {/* packages grid */}
          <div className={["p-4", selected ? "pb-28" : "pb-6"].join(" ")}>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {BUNDLES.map((b, idx) => {
                const active = b.id === selectedId;
                const s = tierStyles[b.tier];
                const tooExpensiveForSingle = balance < b.cost;

                return (
                  <motion.button
                    key={b.id}
                    type="button"
                    onClick={() => onPick(b.id)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.18,
                      delay: Math.min(0.18, idx * 0.006),
                    }}
                    whileTap={{ scale: 0.98 }}
                    className={[
                      "relative rounded-2xl border p-3 text-center",
                      "transition-[transform,box-shadow,background,border] duration-200",
                      s.cardBase,
                      active
                        ? ["ring-2", s.activeRing, "bg-background"].join(" ")
                        : "ring-0",
                    ].join(" ")}
                  >
                    {/* tier dot */}
                    <span
                      className={[
                        "absolute top-2 start-2 size-2 rounded-full",
                        s.dot,
                        "opacity-80",
                      ].join(" ")}
                    />

                    {/* not enough for 1x (still selectable) */}
                    {tooExpensiveForSingle ? (
                      <span className="absolute top-2 end-2 rounded-full px-2 py-0.5 text-[10px] border border-danger-500/30 bg-danger-soft text-danger-foreground">
                        غير كافٍ
                      </span>
                    ) : null}

                    {/* Icon */}
                    <div
                      className={[
                        "mx-auto mb-2 grid place-items-center",
                        "size-12 rounded-2xl",
                        s.iconWrap,
                      ].join(" ")}
                    >
                      <b.Icon className="text-[20px]" />
                    </div>

                    {/* Name */}
                    <div className="text-[11px] font-bold text-foreground-strong truncate">
                      {b.name}
                    </div>

                    {/* Cost */}
                    <div className="mt-1 text-[10px] text-foreground-muted">
                      <bdi
                        dir="ltr"
                        className="font-mono font-extrabold tabular-nums text-foreground-strong"
                      >
                        {formatSenko(b.cost)}
                      </bdi>{" "}
                      <span className="opacity-80">سينكو</span>
                    </div>

                    {/* Quantity badge for active */}
                    {active && qty > 1 ? (
                      <div className="absolute -bottom-2 end-2 rounded-full px-2 py-0.5 text-[10px] font-extrabold border border-border-subtle bg-surface shadow-[var(--shadow-sm)]">
                        x<bdi dir="ltr">{qty}</bdi>
                      </div>
                    ) : null}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Send FX overlay */}
          <AnimatePresence>
            {sendingFx ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-30 grid place-items-center bg-black/45 backdrop-blur-sm pointer-events-none"
              >
                <motion.div
                  initial={{ scale: 0.92, y: 10 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 1.04, y: -6, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="rounded-3xl border border-white/10 bg-background-elevated px-6 py-5 shadow-[var(--shadow-xl)] text-center"
                >
                  <div className="mx-auto mb-2 size-14 rounded-3xl bg-gradient-to-br from-brand-400/20 to-extra-purple-soft grid place-items-center">
                    <sendingFx.Icon className="text-[26px]" />
                  </div>
                  <div className="text-sm font-extrabold text-foreground-strong">
                    تم الإرسال
                    <span className="ms-2 text-brand-500">
                      x<bdi dir="ltr">{sendingFx.qty}</bdi>
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-foreground-muted truncate max-w-[240px]">
                    {sendingFx.name}
                  </div>
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* =======================
            FOOTER (appears only on selection)
           ======================= */}
        <AnimatePresence>
          {selected ? (
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute inset-x-0 bottom-0 z-20 border-t border-border-subtle bg-background-elevated/95 backdrop-blur-md"
            >
              <div className="px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
                <div className="flex items-stretch gap-3">
                  {/* Send */}
                  <button
                    type="button"
                    onClick={send}
                    className={[
                      "flex-1 rounded-2xl px-4 py-3",
                      "border transition active:scale-[0.99]",
                      "shadow-[var(--shadow-md)]",
                      canAfford
                        ? "border-brand-400/25 bg-gradient-to-r from-brand-500 to-brand-700 text-accent-foreground hover:brightness-110"
                        : "border-danger-500/30 bg-gradient-to-r from-danger-700 to-danger-500 text-danger-foreground hover:brightness-110",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-center gap-2 font-extrabold">
                      {canAfford ? (
                        <>
                          إرسال
                          <span className="opacity-90">
                            x<bdi dir="ltr">{qty}</bdi>
                          </span>
                        </>
                      ) : (
                        <>
                          شحن رصيد
                          <IoCartOutline className="text-lg" />
                        </>
                      )}
                    </div>

                    <div className="mt-1 text-center text-[11px] opacity-90">
                      {canAfford ? (
                        <>
                          المجموع:{" "}
                          <bdi
                            dir="ltr"
                            className="font-mono font-extrabold tabular-nums"
                          >
                            {formatSenko(totalCost)}
                          </bdi>{" "}
                          سينكو
                        </>
                      ) : (
                        <>
                          المطلوب:{" "}
                          <bdi
                            dir="ltr"
                            className="font-mono font-extrabold tabular-nums"
                          >
                            {formatSenko(Math.max(0, totalCost - balance))}
                          </bdi>{" "}
                          سينكو
                        </>
                      )}
                    </div>
                  </button>

                  {/* Multipliers (ONLY 3) */}
                  <div className="w-[92px] flex flex-col gap-2">
                    {[
                      { label: "x10", value: 10 },
                      { label: "x25", value: 25 },
                      { label: "MAX", value: 99 },
                    ].map((m) => {
                      const active = qty === m.value;
                      return (
                        <button
                          key={m.label}
                          type="button"
                          onClick={() => setQuick(m.value)}
                          className={[
                            "h-11 rounded-2xl text-xs font-extrabold",
                            "border transition active:scale-[0.98]",
                            active
                              ? "bg-surface border-brand-400/50 ring-2 ring-brand-400/20 text-foreground-strong"
                              : "bg-surface-soft border-border-subtle text-foreground-muted hover:bg-surface",
                          ].join(" ")}
                        >
                          {m.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* =======================
            HISTORY OVERLAY
           ======================= */}
        <AnimatePresence>
          {historyOpen ? (
            <motion.div
              initial={{ x: slideFromX }}
              animate={{ x: 0 }}
              exit={{ x: slideFromX }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="absolute inset-0 z-40 bg-background flex flex-col"
            >
              <div className="shrink-0 px-4 py-4 border-b border-border-subtle bg-background-elevated">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setHistoryOpen(false)}
                      className="size-10 rounded-2xl border border-border-subtle bg-surface-soft hover:bg-surface transition grid place-items-center"
                      aria-label="رجوع"
                    >
                      <IoChevronForward
                        className={["text-xl", backIconClass].join(" ")}
                      />
                    </button>

                    <div className="flex flex-col">
                      <div className="font-extrabold text-foreground-strong">
                        السجل
                      </div>
                      <div className="text-[11px] text-foreground-muted">
                        الرصيد:{" "}
                        <bdi
                          dir="ltr"
                          className="font-mono font-extrabold tabular-nums text-foreground-strong"
                        >
                          {formatSenko(balance)}
                        </bdi>{" "}
                        سينكو
                      </div>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 border border-border-subtle bg-surface-soft">
                    <IoFlash className="text-warning-500" />
                    <span className="text-[11px] font-bold text-foreground-muted">
                      مستواك:{" "}
                      <span className="text-foreground-strong">
                        {level.label}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto app-scroll p-4">
                {history.length === 0 ? (
                  <div className="h-[70%] grid place-items-center text-center">
                    <div className="rounded-3xl border border-border-subtle bg-surface-soft px-5 py-6 max-w-[320px]">
                      <div className="mx-auto mb-3 size-14 rounded-3xl bg-brand-50 border border-brand-200/40 grid place-items-center">
                        <IoSparkles className="text-2xl text-brand-600" />
                      </div>
                      <div className="font-extrabold text-foreground-strong">
                        السجل فارغ
                      </div>
                      <div className="mt-1 text-[12px] text-foreground-muted">
                        اختر حزمة وابدأ دعمك — تأثيره يبان فورًا.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {history.map((h) => (
                      <div
                        key={h.id}
                        className="rounded-2xl border border-border-subtle bg-surface px-4 py-3 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-foreground-strong truncate">
                            {h.bundleName}{" "}
                            <span className="text-brand-500">
                              x<bdi dir="ltr">{h.qty}</bdi>
                            </span>
                          </div>
                          <div className="text-[11px] text-foreground-muted">
                            {h.tsLabel}
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <div className="text-[11px] text-foreground-muted">
                            الإجمالي
                          </div>
                          <div className="font-mono font-extrabold tabular-nums text-danger-foreground">
                            -<bdi dir="ltr">{formatSenko(h.totalCost)}</bdi>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </DeModal>
  );
}
