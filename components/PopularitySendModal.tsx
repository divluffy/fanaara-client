"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoClose,
  IoTimeOutline,
  IoFlash,
  IoWalletOutline,
  IoChevronForward,
  IoAdd,
  IoRemove,
  IoCartOutline,
} from "react-icons/io5";
import { FaCrown, FaHistory } from "react-icons/fa";
import Modal, { ModalProps } from "./Modal"; // تأكد من مسار الاستيراد

// --- Types & Configuration ---

interface GiftPack {
  id: string;
  name: string;
  cost: number;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

interface User {
  id: string;
  name: string;
  avatar: string;
  title: string;
}

interface HistoryEntry {
  id: number;
  giftName: string;
  giftIcon: string;
  cost: number;
  timestamp: string;
  isCombo?: boolean;
}

interface PopularityModalProps extends Omit<ModalProps, "children"> {
  targetUser?: User;
  initialBalance?: number;
}

// --- Mock Data ---

const MOCK_TARGET_USER: User = {
  id: "u-99",
  name: "Kira Senpai",
  avatar:
    "https://api.dicebear.com/9.x/avataaars/svg?seed=Felix&backgroundColor=ffdfbf",
  title: "صائد الشياطين ⚔️",
};

const GIFT_PACKS: GiftPack[] = [
  { id: "1", name: "كرة أرز", cost: 5, icon: "🍙", rarity: "common" },
  { id: "2", name: "شاي أخضر", cost: 10, icon: "🍵", rarity: "common" },
  { id: "3", name: "رامين", cost: 25, icon: "🍜", rarity: "common" },
  { id: "4", name: "كوناي", cost: 50, icon: "🗡️", rarity: "common" },
  { id: "6", name: "بطاقة طاقة", cost: 150, icon: "⚡", rarity: "rare" },
  { id: "8", name: "سيف كاتانا", cost: 300, icon: "⚔️", rarity: "rare" },
  { id: "10", name: "جوهرة الروح", cost: 800, icon: "💎", rarity: "epic" },
  { id: "12", name: "تنين", cost: 1500, icon: "🐉", rarity: "epic" },
  { id: "15", name: "تاج الملك", cost: 5000, icon: "👑", rarity: "legendary" },
  { id: "16", name: "نيزك", cost: 7000, icon: "☄️", rarity: "legendary" },
  { id: "19", name: "مجرة", cost: 50000, icon: "🌌", rarity: "legendary" },
  {
    id: "20",
    name: "القوة المطلقة",
    cost: 99999,
    icon: "♾️",
    rarity: "legendary",
  },
];

// --- Helper Functions ---

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case "legendary":
      return "border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)] bg-gradient-to-b from-[#2a2d36] to-[#3a2a0d]";
    case "epic":
      return "border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)] bg-gradient-to-b from-[#2a2d36] to-[#240a3a]";
    case "rare":
      return "border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]";
    default:
      return "border-transparent hover:border-white/20";
  }
};

// --- Main Component ---

export default function PopularityModal({
  open,
  onOpenChange,
  targetUser = MOCK_TARGET_USER,
  initialBalance = 1540,
  ...props
}: PopularityModalProps) {
  // State
  const [balance, setBalance] = useState(initialBalance);
  const [selectedGiftId, setSelectedGiftId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1); // Multiplier state
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]); // Start empty to show empty state
  const [isAnimating, setIsAnimating] = useState(false);

  // Sound/Haptic feedback simulation refs could go here

  // Derived State
  const selectedGift = useMemo(
    () => GIFT_PACKS.find((g) => g.id === selectedGiftId),
    [selectedGiftId],
  );
  const totalCost = selectedGift ? selectedGift.cost * quantity : 0;
  const canAfford = balance >= totalCost;

  // Handlers

  const handleNavigateToShop = () => {
    // Logic to navigate to shop page
    console.log("Navigating to shop...");
    // window.location.href = "/shop";
    // Or close modal and open shop modal
  };

  const handleGiftClick = (giftId: string) => {
    if (selectedGiftId === giftId) {
      // Logic 3: Clicking same package increases multiplier
      setQuantity((prev) => Math.min(prev + 1, 99));
    } else {
      setSelectedGiftId(giftId);
      setQuantity(1);
    }
  };

  const handleSend = () => {
    if (!selectedGift) return;

    if (!canAfford) {
      handleNavigateToShop();
      return;
    }

    // Process Transaction
    setIsAnimating(true);
    setBalance((prev) => prev - totalCost);

    // Add to History
    const newEntry: HistoryEntry = {
      id: Date.now(),
      giftName: selectedGift.name,
      giftIcon: selectedGift.icon,
      cost: totalCost,
      timestamp: "الآن",
      isCombo: quantity > 1,
    };
    setHistory((prev) => [newEntry, ...prev]);

    // Reset Animation
    setTimeout(() => {
      setIsAnimating(false);
      // Optional: Reset quantity or keep it for spamming? Usually keep it.
    }, 800);
  };

  const adjustQuantity = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(prev + delta, 999)));
  };

  // Reset on close
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setSelectedGiftId(null);
        setQuantity(1);
        setShowHistory(false);
      }, 300);
    }
  }, [open]);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={null}
      contentPadding="none"
      sheetDragMode="binary"
      // استخدام ألوان داكنة "Anime Theme" مع دعم التغيير
      panelClassName="bg-[#0f1115] text-white h-[90vh] sm:h-[800px] w-full max-w-lg flex flex-col shadow-2xl overflow-hidden border border-white/5 rounded-t-3xl sm:rounded-3xl font-sans"
      {...props}
    >
      <div className="flex flex-col h-full relative" dir="rtl">
        {/* =======================
            HEADER
           ======================= */}
        <div className="shrink-0 p-5 bg-[#16181d] border-b border-white/5 relative z-20 shadow-md">
          <div className="flex items-center justify-between">
            {/* Target User Info */}
            <div className="flex items-center gap-4">
              <div className="relative group cursor-pointer">
                <div className="absolute inset-0 bg-purple-600 rounded-full blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
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
                  دعم الستريمر
                </span>
                <span className="font-bold text-lg leading-none tracking-wide text-white">
                  {targetUser.name}
                </span>
                <span className="text-[11px] text-purple-400 mt-1 flex items-center gap-1">
                  <FaCrown className="text-[10px]" /> {targetUser.title}
                </span>
              </div>
            </div>

            {/* Actions: History & Balance */}
            <div className="flex flex-col items-end gap-2">
              {/* Logic 8: Moved History Button to a logical place (Top Left/Right based on Dir) */}
              <button
                onClick={() => setShowHistory(true)}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                title="سجل الدعم"
              >
                <FaHistory />
              </button>

              <div className="flex items-center gap-2 bg-[#0a0b0e] pl-1 pr-3 py-1 rounded-full border border-white/10">
                <IoFlash className="text-yellow-400 text-base" />
                <span className="font-mono font-bold text-yellow-400 text-sm tracking-wider">
                  {balance.toLocaleString()}
                </span>

                {/* Logic 4: Plus Icon redirects to purchase */}
                <button
                  onClick={handleNavigateToShop}
                  className="w-6 h-6 bg-yellow-500 hover:bg-yellow-400 text-black rounded-full flex items-center justify-center transition-colors ml-1"
                >
                  <IoAdd className="text-sm font-bold" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* =======================
            BODY: GRID
           ======================= */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-[#0f1115] relative">
          {/* Combo/Send Animation Overlay */}
          <AnimatePresence>
            {isAnimating && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.2, filter: "blur(10px)" }}
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
                    {selectedGift?.icon}
                  </div>
                </div>
                <div className="text-center">
                  <h2 className="text-4xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-lg">
                    SEND x{quantity}
                  </h2>
                  <p className="text-white/80 font-medium mt-2">
                    تم الإرسال إلى {targetUser.name}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pb-24">
            {GIFT_PACKS.map((gift) => {
              const isActive = selectedGiftId === gift.id;

              return (
                <button
                  key={gift.id}
                  onClick={() => handleGiftClick(gift.id)}
                  className={`
                    relative group flex flex-col items-center p-3 rounded-2xl border-2 transition-all duration-200
                    ${
                      isActive
                        ? `${getRarityColor(gift.rarity)} -translate-y-1 bg-[#23262f]`
                        : "bg-[#181a20] border-transparent hover:bg-[#23262f] hover:border-white/5"
                    }
                  `}
                >
                  {/* Icon */}
                  <div
                    className={`text-4xl mb-3 transition-transform duration-300 ${isActive ? "scale-110 drop-shadow-lg" : "grayscale-[0.3] group-hover:grayscale-0"}`}
                  >
                    {gift.icon}
                  </div>

                  {/* Info */}
                  <span
                    className={`text-[11px] font-bold text-center w-full truncate mb-1 ${isActive ? "text-white" : "text-gray-400"}`}
                  >
                    {gift.name}
                  </span>

                  <div
                    className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${isActive ? "bg-yellow-500/20 text-yellow-400" : "text-gray-500"}`}
                  >
                    <IoFlash />
                    {gift.cost}
                  </div>

                  {/* Quantity Indicator on Grid Item (Logic 3 visual feedback) */}
                  {isActive && quantity > 1 && (
                    <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-1.5 rounded-md shadow-sm border border-red-400">
                      x{quantity}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* =======================
            FOOTER: CONTROLS
           ======================= */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-[#16181d] border-t border-white/5 z-30">
          <div className="flex items-stretch gap-3">
            {/* Logic 3: Quantity Control (Combo Logic) */}
            <div className="flex items-center bg-[#0a0b0e] rounded-xl border border-white/10 px-1">
              <button
                onClick={() => adjustQuantity(-1)}
                className="w-10 h-full flex items-center justify-center text-gray-400 hover:text-white active:scale-90 transition-transform"
              >
                <IoRemove />
              </button>
              <div className="w-10 text-center font-bold text-lg text-white font-mono">
                {quantity}
              </div>
              <button
                onClick={() => adjustQuantity(1)}
                className="w-10 h-full flex items-center justify-center text-gray-400 hover:text-white active:scale-90 transition-transform"
              >
                <IoAdd />
              </button>
            </div>

            {/* Logic 2: Dynamic Send Button */}
            <button
              disabled={!selectedGift}
              onClick={handleSend}
              className={`flex-1 h-14 rounded-xl font-bold text-base flex flex-col items-center justify-center gap-0.5 shadow-lg transition-all active:scale-95 overflow-hidden relative
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
                // Logic 2: Insufficient funds state
                <>
                  <span className="flex items-center gap-2">
                    شحن الرصيد الآن <IoCartOutline className="text-lg" />
                  </span>
                  <span className="text-[10px] opacity-80 font-normal">
                    تحتاج {totalCost - balance}{" "}
                    <IoFlash className="inline text-[9px]" /> إضافية
                  </span>
                </>
              ) : (
                // Normal Send State
                <>
                  <span className="flex items-center gap-2 text-lg">
                    إرسال
                    {quantity > 1 && (
                      <span className="text-yellow-300 italic">
                        x{quantity}
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] bg-black/20 px-2 rounded-full text-white/90">
                    المجموع: {totalCost.toLocaleString()}{" "}
                    <IoFlash className="inline text-[9px] text-yellow-400" />
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
              {/* Header */}
              <div className="shrink-0 flex items-center gap-3 p-4 border-b border-white/5 bg-[#16181d]">
                <button
                  onClick={() => setShowHistory(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                >
                  <IoChevronForward className="text-xl rotate-180 text-white" />
                </button>
                <h3 className="font-bold text-lg text-white">
                  سجل الدعم والأنشطة
                </h3>
              </div>

              {/* Logic 1: Content & Empty State */}
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {history.length === 0 ? (
                  // Empty State - Anime Style
                  <div
                    className="flex flex-col items-center justify-center h-[70%] text-center opacity-0 animate-fade-in"
                    style={{ animationFillMode: "forwards" }}
                  >
                    <div className="w-24 h-24 mb-6 bg-[#181a20] rounded-full flex items-center justify-center border-2 border-dashed border-gray-700">
                      <IoTimeOutline className="text-5xl text-gray-600" />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2">
                      السجل فارغ تماماً!
                    </h4>
                    <p className="text-gray-400 text-sm max-w-[250px] leading-relaxed">
                      لم يقم أحد بكتابة التاريخ بعد..
                      <br />
                      <span className="text-purple-400">
                        كن أنت الأسطورة الأولى وابدأ بالإرسال.
                      </span>
                    </p>
                  </div>
                ) : (
                  // List
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
                              أرسلت {item.giftName}
                              {item.isCombo && (
                                <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 px-1 rounded">
                                  COMBO
                                </span>
                              )}
                            </span>
                            <span className="text-[10px] text-gray-500">
                              {item.timestamp}
                            </span>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-red-400 text-sm">
                          -{item.cost.toLocaleString()}
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
