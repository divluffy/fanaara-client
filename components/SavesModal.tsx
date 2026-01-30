// components/saves/SavesModal.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Modal from "@/components/Modal";
import { IconButton } from "@/design/IconButton";
import { cn } from "@/utils/cn";
import {
  IoAdd,
  IoArrowBack,
  IoCheckmark,
  IoClose,
  IoFolderOpen,
  IoImage,
  IoTrashBin,
} from "react-icons/io5";

// --- Types ---
type SaveItemInput = {
  title: string;
  subtitle?: string;
  thumbnail?: string;
};

type SaveCollection = {
  id: string;
  name: string;
  emoji?: string;
  isSystem?: boolean;
  itemsCount?: number;
};

type SavesModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: SaveItemInput;
  initialCollections?: Array<Pick<SaveCollection, "id" | "name" | "emoji">>;
  initialMembershipIds?: string[];
};

// --- Constants & Helpers ---
const SYSTEM_SAVED_ID = "saved_main";

function slugId(name: string) {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "");
  return `${base || "col"}-${Math.random().toString(36).slice(2, 6)}`;
}

const springSmooth = {
  type: "spring" as const,
  stiffness: 520,
  damping: 38,
  mass: 0.9,
};

const springSnappy = {
  type: "spring" as const,
  stiffness: 780,
  damping: 34,
  mass: 0.85,
};

const EMOJI_POOL = [
  "🔥",
  "⚔️",
  "🌸",
  "🗓️",
  "✅",
  "⭐",
  "🌙",
  "💫",
  "👑",
  "🎴",
  "🎮",
  "🎨",
  "🍙",
  "🧋",
  "🧪",
  "🧠",
  "🪄",
  "🦊",
  "🐉",
  "🐺",
  "🦋",
  "🌊",
  "⚡",
  "❄️",
  "🩸",
  "🪽",
  "🎧",
  "📌",
  "📚",
  "🧩",
  "🎬",
  "🎭",
  "🏆",
  "💎",
];

// --- Component ---
export default function SavesModal({
  open,
  onOpenChange,
  item,
  initialCollections,
  initialMembershipIds,
}: SavesModalProps) {
  // 1) Collections
  const [collections, setCollections] = useState<SaveCollection[]>(() => {
    const defaults = [
      { id: "watched", name: "تمت المشاهدة", emoji: "✅", itemsCount: 42 },
      { id: "planning", name: "خطط مستقبلية", emoji: "🗓️", itemsCount: 12 },
      { id: "best_moments", name: "لحظات أسطورية", emoji: "🔥", itemsCount: 8 },
    ];

    const userCols =
      initialCollections?.map((c) => ({
        ...c,
        itemsCount: Math.floor(Math.random() * 50),
      })) ?? defaults;

    return userCols;
  });

  // ✅ العنصر محفوظ دائمًا: إمّا بتجميعة مخصصة أو بالافتراضية
  const [folderId, setFolderId] = useState<string>(SYSTEM_SAVED_ID);

  // View: list | create
  const [view, setView] = useState<"list" | "create">("list");

  // Create state
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("🗂️");
  const createInputRef = useRef<HTMLInputElement>(null);

  const systemRow = useMemo(
    () => ({
      id: SYSTEM_SAVED_ID,
      name: "المحفوظات (الافتراضية)",
      emoji: "📥",
      itemsCount: 120,
      isSystem: true,
    }),
    [],
  );

  // Reset on open
  useEffect(() => {
    if (!open) return;

    const foundFolder = initialMembershipIds?.find((id) => id !== SYSTEM_SAVED_ID);
    setFolderId(foundFolder ?? SYSTEM_SAVED_ID);

    setView("list");
    setNewName("");
    setNewEmoji("🗂️");
  }, [open, initialMembershipIds]);

  // Focus create input when switching view
  useEffect(() => {
    if (view !== "create") return;
    setTimeout(() => createInputRef.current?.focus(), 120);
  }, [view]);

  const handleDelete = () => {
    onOpenChange(false);
  };

  const enterCreate = () => {
    setNewName("");
    setNewEmoji("🗂️");
    setView("create");
  };

  const handleCreateCollection = (e?: React.FormEvent) => {
    e?.preventDefault();
    const name = newName.trim();
    if (name.length < 2) return;

    const newId = slugId(name);
    const newCol: SaveCollection = {
      id: newId,
      name,
      emoji: newEmoji,
      itemsCount: 1,
    };

    setCollections((prev) => [newCol, ...prev]);
    setFolderId(newId);

    // ✅ بعد الإنشاء نرجع للقائمة (التجميعة صارت محددة)
    setView("list");
    setNewName("");
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      preset="comments"
      contentPadding="none"
      mode={{ desktop: "center", mobile: "sheet" }}
      maxWidthClass="max-w-md"
      sheetInitialState="collapsed"
    >
      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.985 }}
        transition={springSmooth}
        className="relative flex h-full max-h-[85vh] flex-col overflow-hidden text-slate-100"
        dir="rtl"
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#070A14] via-[#0B0F1C] to-[#07171B]" />
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            aria-hidden
            className="absolute -top-[22%] left-1/2 h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-violet-500/25 blur-[110px]"
            animate={{ scale: [1, 1.12, 1], opacity: [0.75, 1, 0.75] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="absolute -bottom-[18%] right-[10%] h-[340px] w-[340px] rounded-full bg-fuchsia-500/20 blur-[120px]"
            animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.95, 0.6] }}
            transition={{ duration: 6.2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="absolute top-[18%] left-[8%] h-[260px] w-[260px] rounded-full bg-cyan-400/14 blur-[110px]"
            animate={{ scale: [1, 1.1, 1], opacity: [0.55, 0.9, 0.55] }}
            transition={{ duration: 6.8, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="absolute inset-0 opacity-[0.08] mix-blend-overlay [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:18px_18px]" />
        </div>

        {/* Header */}
        <div className="relative z-10 shrink-0 border-b border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black text-slate-300">
              <span className="rounded-full bg-white/5 px-2 py-1 ring-1 ring-white/10">
                💾 حفظ
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">
                {view === "list" ? "اختر تجميعة 🎯" : "إنشاء تجميعة ✨"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* ✅ New collection moved here (beside delete) */}
              {view === "list" ? (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  transition={springSnappy}
                  onClick={enterCreate}
                  className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-violet-600/30 via-fuchsia-600/20 to-cyan-500/20 px-3 py-2 text-xs font-black text-white ring-1 ring-inset ring-white/10 hover:ring-white/20"
                  title="تجميعة جديدة"
                >
                  <span className="pointer-events-none absolute -left-1/2 top-0 h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 transition-all duration-700 group-hover:left-[120%] group-hover:opacity-100" />
                  <IoAdd className="text-base" />
                  <span>تجميعة جديدة</span>
                </motion.button>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  transition={springSnappy}
                  onClick={() => setView("list")}
                  className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs font-black text-slate-200 ring-1 ring-inset ring-white/10 hover:bg-white/10 hover:ring-white/20"
                  title="رجوع"
                >
                  <IoArrowBack className="text-base" />
                  <span>رجوع</span>
                </motion.button>
              )}

              <IconButton
                onClick={handleDelete}
                variant="ghost"
                tone="danger"
                size="sm"
                tooltip="إزالة الحفظ"
                className="opacity-75 hover:opacity-100"
              >
                <IoTrashBin />
              </IconButton>

              <IconButton
                onClick={() => onOpenChange(false)}
                variant="ghost"
                tone="neutral"
                size="sm"
                tooltip="إغلاق"
                className="opacity-75 hover:opacity-100"
              >
                <IoClose />
              </IconButton>
            </div>
          </div>

          {/* Item Card */}
          <div className="flex items-start gap-4">
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={springSmooth}
              className="relative aspect-square w-20 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_18px_60px_-25px_rgba(0,0,0,0.8)]"
            >
              {item.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full place-items-center text-white/25">
                  <IoImage size={24} />
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 to-transparent" />
              <div className="absolute bottom-1 right-2 flex items-center gap-1 text-[10px] font-black tracking-wide text-emerald-300">
                <IoCheckmark />
                <span>تم الحفظ</span>
              </div>
            </motion.div>

            <div className="flex min-w-0 flex-1 flex-col justify-center py-1">
              <h2 className="line-clamp-1 text-base font-extrabold text-white">
                {item.title}
              </h2>
              <p className="line-clamp-1 text-xs text-slate-400">
                {item.subtitle || "عنصر جديد"}
              </p>

              {/* Mini hint */}
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-400">
                <span className="rounded-full bg-white/5 px-2 py-1 ring-1 ring-white/10">
                  ⚡ سحب/نقر سريع
                </span>
                <span className="rounded-full bg-white/5 px-2 py-1 ring-1 ring-white/10">
                  🎴 أسلوب أنيمي
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="relative z-10 flex-1 overflow-y-auto p-4 scrollbar-hide">
          <AnimatePresence mode="wait" initial={false}>
            {view === "list" ? (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -14 }}
                transition={springSmooth}
                className="space-y-2"
              >
                <div className="mb-3 px-1 text-xs font-extrabold text-slate-400">
                  اختر تجميعة 🎯
                </div>

                {/* System / Default */}
                <CollectionOption
                  name={systemRow.name}
                  emoji={systemRow.emoji}
                  badge="افتراضي"
                  count={systemRow.itemsCount}
                  isActive={folderId === SYSTEM_SAVED_ID}
                  onClick={() => setFolderId(SYSTEM_SAVED_ID)}
                />

                <div className="my-3 h-px w-full bg-gradient-to-r from-transparent via-white/12 to-transparent" />

                {/* User collections */}
                <AnimatePresence initial={false}>
                  {collections.map((col) => (
                    <CollectionOption
                      key={col.id}
                      name={col.name}
                      emoji={col.emoji}
                      count={col.itemsCount}
                      isActive={folderId === col.id}
                      onClick={() => setFolderId(col.id)}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                key="create"
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 14 }}
                transition={springSmooth}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-extrabold text-slate-300">
                    إنشاء تجميعة جديدة ✨
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500">
                    اختر رمز + اسم
                  </div>
                </div>

                {/* Create panel */}
                <motion.div
                  layout
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-xl"
                >
                  <div className="flex items-center gap-2">
                    {/* Emoji preview */}
                    <div className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500/25 via-fuchsia-500/15 to-cyan-500/15 text-2xl ring-1 ring-inset ring-white/10">
                      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_60%)] opacity-80" />
                      <span className="relative z-10">{newEmoji}</span>
                    </div>

                    <form onSubmit={handleCreateCollection} className="flex flex-1 items-center gap-2">
                      <input
                        ref={createInputRef}
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="اسم التجميعة... (مثال: معارك ⚔️)"
                        className="min-w-0 flex-1 rounded-xl bg-white/5 px-3 py-2 text-sm font-semibold text-white ring-1 ring-inset ring-white/10 outline-none placeholder:text-slate-500 focus:ring-violet-400/60"
                      />

                      <motion.button
                        type="submit"
                        whileTap={{ scale: 0.98 }}
                        transition={springSnappy}
                        disabled={newName.trim().length < 2}
                        className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-black text-white shadow-[0_14px_40px_-24px_rgba(139,92,246,0.9)] transition hover:bg-violet-500 disabled:opacity-50"
                      >
                        إنشاء ✨
                      </motion.button>
                    </form>
                  </div>

                  {/* Emoji grid */}
                  <div className="mt-3">
                    <div className="mb-2 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                      <span>اختر رمزًا 🎴</span>
                      <span className="text-slate-500">({EMOJI_POOL.length})</span>
                    </div>

                    <div className="grid grid-cols-8 gap-2 sm:grid-cols-9">
                      {EMOJI_POOL.map((em) => (
                        <motion.button
                          key={em}
                          type="button"
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.96 }}
                          transition={springSnappy}
                          onClick={() => setNewEmoji(em)}
                          className={cn(
                            "grid aspect-square place-items-center rounded-xl text-lg ring-1 ring-inset transition-all",
                            newEmoji === em
                              ? "bg-violet-500/20 ring-violet-400/50 shadow-[0_10px_30px_-22px_rgba(139,92,246,0.9)]"
                              : "bg-white/5 ring-white/10 hover:ring-white/20",
                          )}
                          aria-label={`emoji-${em}`}
                          title={em}
                        >
                          {em}
                        </motion.button>
                      ))}
                    </div>

                    {/* Quick suggestions */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {[
                        { e: "🔥", t: "هايلايتس" },
                        { e: "⚔️", t: "معارك" },
                        { e: "🌸", t: "رومانسي" },
                        { e: "🎮", t: "ألعاب" },
                        { e: "📚", t: "مانغا" },
                      ].map((x) => (
                        <button
                          key={x.t}
                          type="button"
                          onClick={() => {
                            setNewEmoji(x.e);
                            setNewName((prev) => prev || x.t);
                            setTimeout(() => createInputRef.current?.focus(), 80);
                          }}
                          className="rounded-full bg-white/5 px-3 py-1.5 text-[11px] font-bold text-slate-200 ring-1 ring-inset ring-white/10 hover:bg-white/10"
                        >
                          {x.e} {x.t}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>

                <div className="text-[11px] font-semibold text-slate-500">
                  💡 بعد الإنشاء سيتم تحديد التجميعة تلقائيًا.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </Modal>
  );
}

// --- Sub Component: Row ---
function CollectionOption({
  name,
  emoji,
  count,
  isActive,
  onClick,
  badge,
}: {
  name: string;
  emoji?: string;
  count?: number;
  isActive: boolean;
  onClick: () => void;
  badge?: string;
}) {
  return (
    <motion.button
      layout
      onClick={onClick}
      whileTap={{ scale: 0.985 }}
      transition={springSnappy}
      className={cn(
        "group relative w-full overflow-hidden rounded-2xl p-[1px] text-right",
        isActive
          ? "bg-gradient-to-r from-violet-500/70 via-fuchsia-500/60 to-cyan-400/60 shadow-[0_18px_60px_-40px_rgba(139,92,246,0.9)]"
          : "bg-white/10 hover:bg-white/15",
      )}
    >
      <span className="pointer-events-none absolute -left-1/2 top-0 h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/12 to-transparent opacity-0 transition-all duration-700 group-hover:left-[120%] group-hover:opacity-100" />

      <div
        className={cn(
          "relative flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0B0F1C]/70 p-3 backdrop-blur-xl transition-all",
          isActive ? "bg-[#0E1324]/70" : "hover:bg-[#0D1222]/70",
        )}
      >
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 6 }}
              transition={springSmooth}
              className="absolute inset-y-2 right-2 w-1 rounded-full bg-violet-300/90 shadow-[0_0_18px_2px_rgba(139,92,246,0.55)]"
            />
          )}
        </AnimatePresence>

        <div
          className={cn(
            "relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-2xl text-xl ring-1 ring-inset transition-all",
            isActive
              ? "bg-gradient-to-br from-violet-500/25 via-fuchsia-500/15 to-cyan-500/15 text-white ring-white/15"
              : "bg-white/5 text-slate-200 ring-white/10 group-hover:ring-white/20",
          )}
        >
          <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_60%)] opacity-70" />
          <span className="relative z-10">{emoji || <IoFolderOpen />}</span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "truncate text-sm font-extrabold transition-colors",
                isActive ? "text-white" : "text-slate-200 group-hover:text-white",
              )}
            >
              {name}
            </span>

            {badge && (
              <span className="shrink-0 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-black text-emerald-200 ring-1 ring-inset ring-emerald-400/20">
                {badge} 🌟
              </span>
            )}
          </div>

          <span className="text-[10px] font-semibold text-slate-400">
            {count ?? 0} عنصر
          </span>
        </div>

        <div
          className={cn(
            "shrink-0 rounded-full border-2 p-0.5 transition-all duration-300",
            isActive
              ? "border-violet-300/80 bg-violet-500/40 text-white shadow-[0_0_0_3px_rgba(139,92,246,0.18)]"
              : "border-white/20 bg-transparent text-transparent",
          )}
        >
          <IoCheckmark
            size={12}
            className={cn("transition-transform", isActive ? "scale-100" : "scale-0")}
          />
        </div>
      </div>
    </motion.button>
  );
}
