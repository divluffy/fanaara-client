"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  IoAdd,
  IoChevronForward,
  IoFlash,
  IoRemove,
  IoSearch,
  IoStar,
  IoStarOutline,
  IoTimeOutline,
  IoCartOutline,
  IoSparkles,
} from "react-icons/io5";
import { FaCrown, FaHistory } from "react-icons/fa";
import Modal, { ModalProps } from "./Modal";

// ===================================
// Types
// ===================================

type Rarity = "common" | "rare" | "epic" | "legendary";
type GiftCategory = "all" | "stickers" | "power" | "scene" | "legendary";

interface GiftItem {
  id: string;
  name: string;
  cost: number; // Senko
  icon: string; // emoji for now
  rarity: Rarity;
  category: Exclude<GiftCategory, "all">;
  aura: number; // تأثير/نقاط دعم (غير العملة)
  tagline: string;
  limitedUntil?: string; // ISO date string
}

interface User {
  id: string;
  name: string;
  avatar: string;
  title: string;
}

interface HistoryEntry {
  id: number;
  giftId: string;
  giftName: string;
  giftIcon: string;
  quantity: number;
  cost: number; // total
  aura: number; // total
  timestamp: string;
  isCombo?: boolean;
}

interface SenkoGiftModalProps extends Omit<ModalProps, "children"> {
  targetUser?: User;
  initialBalance?: number;
}

// ===================================
// Currency
// ===================================

const CURRENCY = {
  nameAr: "سينكو",
  nameEn: "Senko",
  code: "SNK",
  icon: <IoFlash className="text-yellow-400 text-base" />,
};

// ===================================
// Mock
// ===================================

const MOCK_TARGET_USER: User = {
  id: "u-99",
  name: "Kira Senpai",
  avatar:
    "https://api.dicebear.com/9.x/avataaars/svg?seed=Felix&backgroundColor=ffdfbf",
  title: "صائد الشياطين ⚔️",
};

/**
 * أفكار جديدة:
 * - تصنيفات Gifts Tabs
 * - مفضلة ⭐ (تحفظ محلياً)
 * - هدايا “محدودة الوقت” مع عدّاد
 * - “Aura” كنقاط تأثير منفصلة عن العملة
 * - Quick Multipliers +/-
 */

const GIFT_ITEMS: GiftItem[] = [
  // Stickers
  {
    id: "st-1",
    name: "ملصق تشيبي",
    cost: 6,
    icon: "🧸",
    rarity: "common",
    category: "stickers",
    aura: 3,
    tagline: "لطيف وسريع… يرفع المزاج!",
  },
  {
    id: "st-2",
    name: "ملصق كاوايي",
    cost: 12,
    icon: "🌸",
    rarity: "common",
    category: "stickers",
    aura: 6,
    tagline: "وردي لطيف… للكلام الحلو.",
  },
  {
    id: "st-3",
    name: "ملصق ناروتو ستايل",
    cost: 30,
    icon: "🌀",
    rarity: "rare",
    category: "stickers",
    aura: 15,
    tagline: "طاقة واندفاع… زي النينجا!",
  },

  // Power
  {
    id: "pw-1",
    name: "شحنة طاقة",
    cost: 40,
    icon: "⚡",
    rarity: "common",
    category: "power",
    aura: 25,
    tagline: "دفعه بسيطة… بس محسوسة.",
  },
  {
    id: "pw-2",
    name: "بوستر Hype",
    cost: 120,
    icon: "🔥",
    rarity: "rare",
    category: "power",
    aura: 80,
    tagline: "خلي الشات يولّع!",
  },
  {
    id: "pw-3",
    name: "كرة روح",
    cost: 350,
    icon: "🔮",
    rarity: "epic",
    category: "power",
    aura: 260,
    tagline: "هالة قوية… واضحة للجميع.",
  },

  // Scene (مؤثرات/مشاهد)
  {
    id: "sc-1",
    name: "سحاب سرعة",
    cost: 55,
    icon: "💨",
    rarity: "common",
    category: "scene",
    aura: 35,
    tagline: "إرسال سريع… ويمرّق!",
  },
  {
    id: "sc-2",
    name: "نجمة لامعة",
    cost: 180,
    icon: "✨",
    rarity: "rare",
    category: "scene",
    aura: 130,
    tagline: "تأثير لامع… مناسب للّحظات الحلوة.",
  },
  {
    id: "sc-3",
    name: "بوابة آرك",
    cost: 650,
    icon: "🌀",
    rarity: "epic",
    category: "scene",
    aura: 520,
    tagline: "إعلان دخول… وكأنه بداية آرك جديد.",
  },

  // Legendary
  {
    id: "lg-1",
    name: "تاج السينباي",
    cost: 2200,
    icon: "👑",
    rarity: "legendary",
    category: "legendary",
    aura: 2000,
    tagline: "الهيبة وصلت… خلها تنكتب بالسجل.",
  },
  {
    id: "lg-2",
    name: "تنين الهالة",
    cost: 6000,
    icon: "🐉",
    rarity: "legendary",
    category: "legendary",
    aura: 6500,
    tagline: "أسطوري… وتستاهلها اللحظة.",
  },
  {
    id: "lg-3",
    name: "سوبرنوفا",
    cost: 12000,
    icon: "☄️",
    rarity: "legendary",
    category: "legendary",
    aura: 14000,
    tagline: "انفجار دعم… يغير مود البث.",
    // مثال محدود الوقت (غيّرها حسب نظامك)
    limitedUntil: "2026-12-31T23:59:59.000Z",
  },
];

// ===================================
// Helpers
// ===================================

const getRarityTheme = (rarity: Rarity) => {
  switch (rarity) {
    case "legendary":
      return "border-yellow-500 shadow-[0_0_18px_rgba(234,179,8,0.35)] bg-gradient-to-b from-[#2a2d36] to-[#3a2a0d]";
    case "epic":
      return "border-purple-500 shadow-[0_0_16px_rgba(168,85,247,0.35)] bg-gradient-to-b from-[#2a2d36] to-[#240a3a]";
    case "rare":
      return "border-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.25)]";
    default:
      return "border-transparent hover:border-white/20";
  }
};

const formatCompact = (n: number) => n.toLocaleString();

const msLeft = (iso?: string) => {
  if (!iso) return null;
  const left = new Date(iso).getTime() - Date.now();
  return left;
};

const formatRemaining = (ms: number) => {
  const sec = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);

  if (d > 0) return `${d}ي ${h}س`;
  if (h > 0) return `${h}س ${m}د`;
  return `${m}د`;
};

// ===================================
// Component
// ===================================

export default function SenkoGiftModal({
  open,
  onOpenChange,
  targetUser = MOCK_TARGET_USER,
  initialBalance = 1540,
  ...props
}: SenkoGiftModalProps) {
  // Wallet
  const [balance, setBalance] = useState(initialBalance);

  // Selection
  const [selectedGiftId, setSelectedGiftId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  // UX
  const [showHistory, setShowHistory] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // New ideas
  const [tab, setTab] = useState<GiftCategory>("all");
  const [query, setQuery] = useState("");
  const [sessionAura, setSessionAura] = useState(0);

  // Favorites (local)
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const favoritesLoaded = useRef(false);

  // History
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Limited gifts countdown ticker
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Load favorites
  useEffect(() => {
    if (favoritesLoaded.current) return;
    favoritesLoaded.current = true;

    try {
      const raw = localStorage.getItem("gift_favorites_v1");
      if (raw) {
        const arr: string[] = JSON.parse(raw);
        setFavorites(new Set(arr));
      }
    } catch {
      // ignore
    }
  }, []);

  // Save favorites
  useEffect(() => {
    if (!favoritesLoaded.current) return;
    try {
      localStorage.setItem(
        "gift_favorites_v1",
        JSON.stringify(Array.from(favorites)),
      );
    } catch {
      // ignore
    }
  }, [favorites]);

  const selectedGift = useMemo(
    () => GIFT_ITEMS.find((g) => g.id === selectedGiftId),
    [selectedGiftId],
  );

  const totalCost = selectedGift ? selectedGift.cost * quantity : 0;
  const totalAura = selectedGift ? selectedGift.aura * quantity : 0;
  const canAfford = balance >= totalCost;

  const filteredGifts = useMemo(() => {
    const q = query.trim().toLowerCase();

    const byTab = (g: GiftItem) => {
      if (tab === "all") return true;
      return g.category === tab;
    };

    const byQuery = (g: GiftItem) => {
      if (!q) return true;
      return (
        g.name.toLowerCase().includes(q) ||
        g.tagline.toLowerCase().includes(q) ||
        g.rarity.toLowerCase().includes(q)
      );
    };

    const notExpired = (g: GiftItem) => {
      const left = msLeft(g.limitedUntil);
      return left === null ? true : left > 0;
    };

    const list = GIFT_ITEMS.filter(
      (g) => byTab(g) && byQuery(g) && notExpired(g),
    );

    // Favorites first (idea جديدة)
    list.sort((a, b) => {
      const af = favorites.has(a.id) ? 1 : 0;
      const bf = favorites.has(b.id) ? 1 : 0;
      if (af !== bf) return bf - af;
      return a.cost - b.cost;
    });

    return list;
  }, [tab, query, favorites, tick]);

  const handleNavigateToShop = () => {
    // TODO: اربطها بصفحة الشحن/المتجر عندك
    console.log("Navigate to shop / top-up balance");
  };

  const handleGiftClick = (giftId: string) => {
    if (selectedGiftId === giftId) {
      // نفس فكرة الشعبية: الضغط على نفس الهدية يزيد الكومبو
      setQuantity((prev) => Math.min(prev + 1, 99));
    } else {
      setSelectedGiftId(giftId);
      setQuantity(1);
    }
  };

  const adjustQuantity = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(prev + delta, 999)));
  };

  const setQuickQty = (value: number) => {
    setQuantity(Math.max(1, Math.min(value, 999)));
  };

  const toggleFavorite = (giftId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(giftId)) next.delete(giftId);
      else next.add(giftId);
      return next;
    });
  };

  const handleSend = () => {
    if (!selectedGift) return;

    if (!canAfford) {
      handleNavigateToShop();
      return;
    }

    setIsAnimating(true);
    setBalance((prev) => prev - totalCost);
    setSessionAura((prev) => prev + totalAura);

    const newEntry: HistoryEntry = {
      id: Date.now(),
      giftId: selectedGift.id,
      giftName: selectedGift.name,
      giftIcon: selectedGift.icon,
      quantity,
      cost: totalCost,
      aura: totalAura,
      timestamp: "الآن",
      isCombo: quantity > 1,
    };
    setHistory((prev) => [newEntry, ...prev]);

    setTimeout(() => setIsAnimating(false), 850);
  };

  // Reset on close
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setSelectedGiftId(null);
        setQuantity(1);
        setShowHistory(false);
        setQuery("");
        setTab("all");
      }, 250);
    }
  }, [open]);

  const auraProgress = useMemo(() => {
    // فكرة جديدة بسيطة: “رتبة” داخل الجلسة حسب Aura
    // غيّر thresholds حسب نظامك
    const thresholds = [0, 250, 800, 2000, 5000, 12000];
    const labels = ["مبتدئ", "داعِم", "مشعل", "أسطوري", "مجرة", "ميتافي"];
    const idx =
      thresholds.findIndex(
        (t, i) => i < thresholds.length - 1 && sessionAura < thresholds[i + 1],
      ) === -1
        ? thresholds.length - 1
        : thresholds.findIndex(
            (t, i) =>
              i < thresholds.length - 1 && sessionAura < thresholds[i + 1],
          );

    const currentMin = thresholds[idx];
    const nextMin = thresholds[Math.min(idx + 1, thresholds.length - 1)];
    const pct =
      nextMin === currentMin
        ? 100
        : Math.min(
            100,
            Math.floor(
              ((sessionAura - currentMin) / (nextMin - currentMin)) * 100,
            ),
          );

    return { label: labels[idx], pct, nextMin };
  }, [sessionAura]);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={null}
      contentPadding="none"
      sheetDragMode="binary"
      panelClassName="bg-[#0f1115] text-white h-[90vh] sm:h-[820px] w-full max-w-lg flex flex-col shadow-2xl overflow-hidden border border-white/5 rounded-t-3xl sm:rounded-3xl font-sans"
      {...props}
    >
      <div className="flex flex-col h-full relative" dir="rtl">
        {/* =======================
            HEADER
           ======================= */}
        <div className="shrink-0 p-5 bg-[#16181d] border-b border-white/5 relative z-20 shadow-md">
          <div className="flex items-start justify-between gap-4">
            {/* Target */}
            <div className="flex items-center gap-4">
              <div className="relative group cursor-pointer">
                <div className="absolute inset-0 bg-purple-600 rounded-full blur opacity-35 group-hover:opacity-55 transition-opacity" />
                <img
                  src={targetUser.avatar}
                  className="w-14 h-14 rounded-full border-2 border-purple-500 relative z-10 bg-[#0f1115]"
                  alt={targetUser.name}
                />
                <div className="absolute -bottom-1 -right-1 z-20 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg">
                  LV.99
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-xs text-gray-400 mb-0.5">
                  إرسال هدايا
                </span>
                <span className="font-bold text-lg leading-none tracking-wide text-white">
                  {targetUser.name}
                </span>
                <span className="text-[11px] text-purple-400 mt-1 flex items-center gap-1">
                  <FaCrown className="text-[10px]" /> {targetUser.title}
                </span>

                {/* Aura mini rank */}
                <div className="mt-2 w-[220px] max-w-[55vw]">
                  <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                    <span className="flex items-center gap-1">
                      <IoSparkles className="text-yellow-300" />
                      رتبتك في الجلسة:{" "}
                      <span className="text-white font-bold">
                        {auraProgress.label}
                      </span>
                    </span>
                    <span className="text-gray-500">{auraProgress.pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-black/40 border border-white/5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
                      style={{ width: `${auraProgress.pct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={() => setShowHistory(true)}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                title="سجل الهدايا"
              >
                <FaHistory />
              </button>

              <div className="flex items-center gap-2 bg-[#0a0b0e] pl-2 pr-3 py-1.5 rounded-full border border-white/10">
                {CURRENCY.icon}
                <span className="font-mono font-bold text-yellow-400 text-sm tracking-wider">
                  {formatCompact(balance)}
                </span>
                <span className="text-[10px] text-yellow-300/90 font-semibold">
                  {CURRENCY.nameEn}
                </span>

                <button
                  onClick={handleNavigateToShop}
                  className="w-7 h-7 bg-yellow-500 hover:bg-yellow-400 text-black rounded-full flex items-center justify-center transition-colors mr-1"
                  title="شحن الرصيد"
                >
                  <IoAdd className="text-sm font-bold" />
                </button>
              </div>
            </div>
          </div>

          {/* Search + Tabs */}
          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 bg-[#0a0b0e] border border-white/10 rounded-xl px-3 py-2">
              <IoSearch className="text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث عن هدية…"
                className="w-full bg-transparent outline-none text-sm placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {[
              { key: "all", label: "الكل" },
              { key: "stickers", label: "ملصقات" },
              { key: "power", label: "طاقة" },
              { key: "scene", label: "مشاهد" },
              { key: "legendary", label: "أسطوري" },
            ].map((t) => {
              const active = tab === (t.key as GiftCategory);
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key as GiftCategory)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors whitespace-nowrap
                    ${
                      active
                        ? "bg-white/10 border-white/15 text-white"
                        : "bg-black/30 border-white/5 text-gray-400 hover:text-white hover:border-white/10"
                    }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* =======================
            BODY
           ======================= */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-[#0f1115] relative">
          {/* Send Animation Overlay */}
          <AnimatePresence>
            {isAnimating && selectedGift && (
              <motion.div
                initial={{ opacity: 0, scale: 0.86, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.15, filter: "blur(10px)" }}
                className="absolute inset-0 z-40 flex flex-col items-center justify-center pointer-events-none bg-black/60 backdrop-blur-sm"
              >
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-0 -m-10 border-2 border-dashed border-purple-500/30 rounded-full"
                  />
                  <div className="text-9xl mb-4 drop-shadow-[0_0_30px_rgba(168,85,247,0.6)]">
                    {selectedGift.icon}
                  </div>
                </div>
                <div className="text-center">
                  <h2 className="text-4xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-lg">
                    GIFT x{quantity}
                  </h2>
                  <p className="text-white/80 font-medium mt-2">
                    تم الإرسال إلى {targetUser.name}
                  </p>
                  <p className="text-[11px] text-yellow-200/80 mt-2">
                    +{formatCompact(totalAura)} Aura
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Grid */}
          {filteredGifts.length === 0 ? (
            <div className="h-[60%] flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 mb-6 bg-[#181a20] rounded-full flex items-center justify-center border-2 border-dashed border-gray-700">
                <IoSearch className="text-4xl text-gray-600" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">
                ما لقينا شيء
              </h4>
              <p className="text-gray-400 text-sm max-w-[260px] leading-relaxed">
                جرّب كلمة مختلفة أو غيّر التصنيف.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pb-44">
              {filteredGifts.map((gift) => {
                const isActive = selectedGiftId === gift.id;
                const isFav = favorites.has(gift.id);
                const left = msLeft(gift.limitedUntil);
                const isLimited = left !== null;
                const limitedText =
                  left !== null ? formatRemaining(left) : null;

                return (
                  <button
                    key={gift.id}
                    onClick={() => handleGiftClick(gift.id)}
                    className={`
                      relative group flex flex-col items-center p-3 rounded-2xl border-2 transition-all duration-200
                      ${
                        isActive
                          ? `${getRarityTheme(gift.rarity)} -translate-y-1 bg-[#23262f]`
                          : "bg-[#181a20] border-transparent hover:bg-[#23262f] hover:border-white/5"
                      }
                    `}
                  >
                    {/* Fav */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(gift.id);
                      }}
                      className="absolute top-2 left-2 w-8 h-8 rounded-full bg-black/40 border border-white/10 flex items-center justify-center hover:bg-black/55"
                      title={isFav ? "إزالة من المفضلة" : "إضافة للمفضلة"}
                    >
                      {isFav ? (
                        <IoStar className="text-yellow-300" />
                      ) : (
                        <IoStarOutline className="text-gray-300/70" />
                      )}
                    </button>

                    {/* Limited Badge */}
                    {isLimited && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-500/15 border border-red-500/25 text-red-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        <IoTimeOutline className="text-[12px]" />
                        {limitedText}
                      </div>
                    )}

                    {/* Icon */}
                    <div
                      className={`text-4xl mb-3 transition-transform duration-300 ${
                        isActive
                          ? "scale-110 drop-shadow-lg"
                          : "grayscale-[0.25] group-hover:grayscale-0"
                      }`}
                    >
                      {gift.icon}
                    </div>

                    {/* Name */}
                    <span
                      className={`text-[11px] font-bold text-center w-full truncate mb-1 ${
                        isActive ? "text-white" : "text-gray-300/80"
                      }`}
                    >
                      {gift.name}
                    </span>

                    {/* Cost */}
                    <div
                      className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isActive
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "text-gray-500 bg-black/20"
                      }`}
                    >
                      <IoFlash />
                      {gift.cost}{" "}
                      <span className="opacity-80">{CURRENCY.code}</span>
                    </div>

                    {/* Aura */}
                    <div className="mt-2 text-[10px] text-purple-200/80 bg-purple-500/10 border border-purple-500/15 px-2 py-0.5 rounded-full">
                      +{gift.aura} Aura
                    </div>

                    {/* Quantity badge */}
                    {isActive && quantity > 1 && (
                      <div className="absolute -bottom-2 right-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm border border-blue-400/40">
                        x{quantity}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* =======================
            FOOTER: Selected + Controls
           ======================= */}
        <div className="absolute bottom-0 left-0 right-0 bg-[#16181d] border-t border-white/5 z-30">
          {/* Selected Preview */}
          <div className="px-4 pt-4">
            <div className="rounded-2xl bg-[#0a0b0e] border border-white/10 p-3">
              {!selectedGift ? (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    اختر هدية… وخلّها تنكتب في السجل ✨
                  </div>
                  <div className="text-[10px] text-gray-500">
                    العملة:{" "}
                    <span className="text-yellow-300 font-bold">
                      {CURRENCY.nameEn}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#181a20] border border-white/5 flex items-center justify-center text-2xl">
                      {selectedGift.icon}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">
                          {selectedGift.name}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-300">
                          {selectedGift.rarity.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                        {selectedGift.tagline}
                      </span>
                      <div className="mt-2 flex items-center gap-2 text-[11px]">
                        <span className="text-yellow-300 font-bold">
                          {formatCompact(selectedGift.cost)} {CURRENCY.code}
                        </span>
                        <span className="text-gray-500">×</span>
                        <span className="text-white font-bold">{quantity}</span>
                        <span className="text-gray-500">=</span>
                        <span className="text-yellow-200 font-extrabold">
                          {formatCompact(totalCost)} {CURRENCY.code}
                        </span>
                        <span className="text-gray-600">|</span>
                        <span className="text-purple-200/90">
                          +{formatCompact(totalAura)} Aura
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick qty */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 5, 10].map((n) => (
                        <button
                          key={n}
                          onClick={() => setQuickQty(n)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors
                            ${
                              quantity === n
                                ? "bg-white/10 border-white/15 text-white"
                                : "bg-black/25 border-white/5 text-gray-400 hover:text-white hover:border-white/10"
                            }`}
                        >
                          x{n}
                        </button>
                      ))}
                      <button
                        onClick={() => setQuickQty(99)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors
                          ${
                            quantity === 99
                              ? "bg-white/10 border-white/15 text-white"
                              : "bg-black/25 border-white/5 text-gray-400 hover:text-white hover:border-white/10"
                          }`}
                        title="أقصى كومبو سريع"
                      >
                        MAX
                      </button>
                    </div>

                    <div className="flex items-center bg-black/25 border border-white/10 rounded-xl px-1">
                      <button
                        onClick={() => adjustQuantity(-1)}
                        className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-white active:scale-90 transition-transform"
                        title="تقليل"
                      >
                        <IoRemove />
                      </button>
                      <div className="w-10 text-center font-bold text-lg text-white font-mono">
                        {quantity}
                      </div>
                      <button
                        onClick={() => adjustQuantity(1)}
                        className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-white active:scale-90 transition-transform"
                        title="زيادة"
                      >
                        <IoAdd />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Send Button */}
          <div className="p-4 pt-3">
            <button
              disabled={!selectedGift}
              onClick={handleSend}
              className={`w-full h-14 rounded-2xl font-bold text-base flex flex-col items-center justify-center gap-0.5 shadow-lg transition-all active:scale-95 overflow-hidden relative
                ${
                  !selectedGift
                    ? "bg-[#23262f] text-gray-600 cursor-not-allowed border border-white/5"
                    : !canAfford
                      ? "bg-gradient-to-r from-red-900 to-red-700 text-red-100 border border-red-500/30 hover:brightness-110"
                      : "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-purple-500/25 hover:shadow-purple-500/40 border border-purple-400/20"
                }
              `}
            >
              {!selectedGift ? (
                <span className="flex items-center gap-2 text-sm">
                  اختر هدية للبدء
                </span>
              ) : !canAfford ? (
                <>
                  <span className="flex items-center gap-2">
                    شحن رصيد {CURRENCY.nameAr}{" "}
                    <IoCartOutline className="text-lg" />
                  </span>
                  <span className="text-[10px] opacity-85 font-normal">
                    تحتاج{" "}
                    <span className="font-bold text-yellow-200">
                      {formatCompact(totalCost - balance)} {CURRENCY.nameAr}
                    </span>{" "}
                    إضافية
                  </span>
                </>
              ) : (
                <>
                  <span className="flex items-center gap-2 text-lg">
                    إرسال الهدية
                    {quantity > 1 && (
                      <span className="text-yellow-300 italic">
                        x{quantity}
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] bg-black/20 px-2 rounded-full text-white/90">
                    المجموع: {formatCompact(totalCost)} {CURRENCY.code} • +
                    {formatCompact(totalAura)} Aura
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* =======================
            HISTORY OVERLAY
           ======================= */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute inset-0 z-50 bg-[#0f1115] flex flex-col"
            >
              <div className="shrink-0 flex items-center gap-3 p-4 border-b border-white/5 bg-[#16181d]">
                <button
                  onClick={() => setShowHistory(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                >
                  <IoChevronForward className="text-xl rotate-180 text-white" />
                </button>
                <div className="flex flex-col">
                  <h3 className="font-bold text-lg text-white">سجل الهدايا</h3>
                  <span className="text-[11px] text-gray-400">
                    رصيدك الحالي:{" "}
                    <span className="text-yellow-300 font-bold">
                      {formatCompact(balance)} {CURRENCY.code}
                    </span>{" "}
                    • Aura في الجلسة:{" "}
                    <span className="text-purple-200 font-bold">
                      {formatCompact(sessionAura)}
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {history.length === 0 ? (
                  <div
                    className="flex flex-col items-center justify-center h-[70%] text-center opacity-0 animate-fade-in"
                    style={{ animationFillMode: "forwards" }}
                  >
                    <div className="w-24 h-24 mb-6 bg-[#181a20] rounded-full flex items-center justify-center border-2 border-dashed border-gray-700">
                      <IoTimeOutline className="text-5xl text-gray-600" />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2">
                      السجل فارغ!
                    </h4>
                    <p className="text-gray-400 text-sm max-w-[250px] leading-relaxed">
                      أول هدية منك بتصير “لحظة” في المجتمع.
                      <br />
                      <span className="text-purple-400">
                        اختار هدية وابدأ 👑
                      </span>
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-[#181a20] border border-white/5 hover:border-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-[#23262f] flex items-center justify-center text-2xl shadow-inner">
                            {item.giftIcon}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-white flex items-center gap-2">
                              {item.giftName}{" "}
                              {item.quantity > 1 && (
                                <span className="text-[10px] bg-blue-500/15 text-blue-200 border border-blue-500/20 px-2 rounded-full">
                                  x{item.quantity}
                                </span>
                              )}
                              {item.isCombo && (
                                <span className="text-[9px] bg-red-500/15 text-red-200 border border-red-500/20 px-1.5 rounded">
                                  COMBO
                                </span>
                              )}
                            </span>
                            <span className="text-[10px] text-gray-500">
                              {item.timestamp} • +{formatCompact(item.aura)}{" "}
                              Aura
                            </span>
                          </div>
                        </div>

                        <span className="font-mono font-bold text-red-300 text-sm">
                          -{formatCompact(item.cost)} {CURRENCY.code}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}
