"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoSearch,
  IoClose,
  IoCopyOutline,
  IoQrCodeOutline,
  IoPaperPlane,
  IoArrowBack,
  IoDownloadOutline,
  IoLogoTwitter,
  IoLogoFacebook,
  IoLogoWhatsapp,
  IoLogoLinkedin,
  IoLogoReddit,
  IoCheckmark,
  IoShareSocial,
} from "react-icons/io5";
import { FaDiscord, FaTelegramPlane } from "react-icons/fa";
import Modal, { ModalProps } from "./Modal";

// --- Configuration & Types ---

interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  status?: "online" | "offline";
}

interface ShareModalProps extends Omit<ModalProps, "children"> {
  shareUrl?: string;
  shareTitle?: string;
}

// Generates 20 mock users
const MOCK_USERS: User[] = Array.from({ length: 24 }).map((_, i) => ({
  id: `u-${i}`,
  name: i === 0 ? "You" : `Nakama ${i}`,
  handle: `@user_${i}`,
  avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${i + 10}&backgroundColor=b6e3f4`,
  status: Math.random() > 0.7 ? "online" : "offline",
}));

// --- Sub-Components ---

/**
 * Social Action Button
 * Renders differently based on screen size (handled by parent CSS Grid/Flex)
 */
const SocialAction = ({
  icon: Icon,
  label,
  color,
  bg,
  onClick,
}: {
  icon: any;
  label: string;
  color: string;
  bg: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="group flex flex-col items-center gap-2 min-w-[72px] sm:min-w-0 sm:w-full p-2 rounded-xl transition-all hover:bg-surface-soft active:scale-95"
  >
    <div
      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-transparent transition-all group-hover:scale-110 ${bg} ${color}`}
    >
      <Icon />
    </div>
    <span className="text-[10px] sm:text-xs font-medium text-fg-muted group-hover:text-fg-strong">
      {label}
    </span>
  </button>
);

// --- Main Component ---

export default function ShareModal({
  open,
  onOpenChange,
  shareUrl = "https://your-anime-platform.com/post/8823",
  shareTitle = "Check this out!",
  ...props
}: ShareModalProps) {
  // State
  const [view, setView] = useState<"share" | "qr">("share");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Reset State on Close
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setView("share");
        setIsSearchActive(false);
        setSearchQuery("");
        setSelectedUsers([]);
        setMessage("");
      }, 300);
    }
  }, [open]);

  // Focus Input when Search Becomes Active
  useEffect(() => {
    if (isSearchActive && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchActive]);

  // Filter Users
  const filteredUsers = useMemo(() => {
    if (!searchQuery) return MOCK_USERS;
    const q = searchQuery.toLowerCase();
    return MOCK_USERS.filter(
      (u) =>
        u.name.toLowerCase().includes(q) || u.handle.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  // Handlers
  const toggleUser = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    // Add toast notification logic here
  };

  // --- Render ---

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={null}
      contentPadding="none"
      sheetDragMode="binary"
      panelClassName="bg-bg-elevated h-[85vh] sm:h-[680px] w-full max-w-lg flex flex-col shadow-2xl overflow-hidden"
      {...props}
    >
      <div className="flex flex-col h-full relative font-sans">
        {/* =======================
            VIEW: SHARE (MAIN)
           ======================= */}
        <AnimatePresence mode="wait">
          {view === "share" && (
            <motion.div
              key="view-share"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full"
            >
              {/* --- Header: Adaptive Search --- */}
              <div className="shrink-0 px-5 pt-5 pb-2 z-20 bg-bg-elevated">
                <div className="h-12 flex items-center justify-between relative">
                  {/* Title (Hides when searching) */}
                  <AnimatePresence>
                    {!isSearchActive && (
                      <motion.h2
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10, position: "absolute" }}
                        className="text-xl font-bold text-fg-strong tracking-tight"
                      >
                        Share to...
                      </motion.h2>
                    )}
                  </AnimatePresence>

                  {/* Search Interaction */}
                  <motion.div
                    layout
                    className={`flex items-center bg-surface-soft rounded-2xl transition-all ${isSearchActive ? "w-full ring-2 ring-brand-500/20" : "w-10 h-10 bg-transparent hover:bg-surface-soft"}`}
                  >
                    {/* Search Icon / Toggle */}
                    <button
                      onClick={() => setIsSearchActive(true)}
                      className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-full text-fg-strong ${isSearchActive ? "pointer-events-none" : ""}`}
                    >
                      <IoSearch className="text-xl" />
                    </button>

                    {/* Input Field */}
                    {isSearchActive && (
                      <motion.input
                        ref={searchInputRef}
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "100%" }}
                        exit={{ opacity: 0, width: 0 }}
                        type="text"
                        placeholder="Search name or @handle..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent h-full w-full outline-none text-sm text-fg-strong placeholder:text-fg-muted min-w-0"
                      />
                    )}

                    {/* Close Search Button */}
                    {isSearchActive && (
                      <button
                        onClick={() => {
                          setIsSearchActive(false);
                          setSearchQuery("");
                        }}
                        className="shrink-0 w-10 h-10 flex items-center justify-center text-fg-muted hover:text-fg-strong"
                      >
                        <IoClose className="text-lg" />
                      </button>
                    )}
                  </motion.div>
                </div>
              </div>

              {/* --- Body: User Grid --- */}
              <div
                className="flex-1 overflow-y-auto custom-scrollbar px-4 py-2"
                style={{ contain: "content" }}
              >
                <motion.div
                  className="grid grid-cols-4 sm:grid-cols-5 gap-y-6 gap-x-2 pb-4"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { transition: { staggerChildren: 0.03 } },
                  }}
                >
                  {filteredUsers.map((user) => {
                    const isSelected = selectedUsers.includes(user.id);
                    return (
                      <motion.button
                        key={user.id}
                        variants={{
                          hidden: { opacity: 0, y: 10 },
                          visible: { opacity: 1, y: 0 },
                        }}
                        onClick={() => toggleUser(user.id)}
                        className="group flex flex-col items-center gap-2 relative p-1 outline-none"
                      >
                        {/* Avatar Wrapper */}
                        <div className="relative w-[60px] h-[60px] sm:w-[68px] sm:h-[68px]">
                          <div
                            className={`absolute inset-0 rounded-full border-2 transition-all duration-300 ${isSelected ? "border-brand-500 scale-105" : "border-transparent group-hover:bg-surface-soft"}`}
                          />
                          <img
                            src={user.avatar}
                            className="relative w-full h-full rounded-full object-cover p-1"
                            alt={user.name}
                            loading="lazy"
                          />

                          {/* Online Status */}
                          {user.status === "online" && !isSelected && (
                            <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-success-500 border-2 border-bg-elevated rounded-full" />
                          )}

                          {/* Selection Indicator (Animated) */}
                          <AnimatePresence>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="absolute bottom-0 right-0 bg-brand-500 text-white rounded-full p-1 border-2 border-bg-elevated shadow-md z-10"
                              >
                                <IoCheckmark className="text-xs stroke-2" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Name */}
                        <div className="text-center w-full px-1">
                          <p
                            className={`text-xs font-medium truncate transition-colors ${isSelected ? "text-brand-600" : "text-fg-strong"}`}
                          >
                            {user.name}
                          </p>
                          <p className="text-[10px] text-fg-muted truncate opacity-80">
                            {user.handle}
                          </p>
                        </div>
                      </motion.button>
                    );
                  })}
                </motion.div>

                {/* Empty State */}
                {filteredUsers.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-40 text-fg-muted">
                    <p className="text-sm">No users found.</p>
                  </div>
                )}
              </div>

              {/* --- Footer: Dynamic Bottom Sheet --- */}
              <div className="shrink-0 bg-bg-elevated border-t border-border-subtle z-30 pb-[env(safe-area-inset-bottom)] shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
                <AnimatePresence mode="wait">
                  {/* MODE 1: SEND MESSAGE (When users selected) */}
                  {selectedUsers.length > 0 ? (
                    <motion.div
                      key="send-mode"
                      initial={{ y: "100%", opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: "100%", opacity: 0, position: "absolute" }}
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.4,
                      }}
                      className="p-4 w-full"
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-brand-600 bg-brand-500/10 px-2 py-0.5 rounded-md">
                            {selectedUsers.length} Selected
                          </span>
                          <button
                            onClick={() => setSelectedUsers([])}
                            className="text-fg-muted hover:text-fg-strong transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                        <div className="flex items-end gap-2">
                          <div className="flex-1 relative">
                            <input
                              type="text"
                              placeholder="Add a message..."
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              className="w-full bg-surface-soft h-12 pl-4 pr-4 rounded-full text-sm text-fg-strong focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                              autoFocus
                            />
                          </div>
                          <button className="h-12 px-6 bg-brand-solid text-white rounded-full font-semibold shadow-glow-brand flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all">
                            <span>Send</span>
                            <IoPaperPlane />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    /* MODE 2: SOCIAL ACTIONS (Default) */
                    <motion.div
                      key="social-mode"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 20, opacity: 0 }}
                      className="w-full"
                    >
                      {/* Responsive Layout: 
                         - Mobile: Flex Row + Horizontal Scroll (snap-x)
                         - Desktop (sm+): Grid Layout (All visible)
                     */}
                      <div className="p-4">
                        <div className="flex sm:grid sm:grid-cols-4 gap-3 overflow-x-auto sm:overflow-visible no-scrollbar snap-x">
                          {/* Copy Link */}
                          <SocialAction
                            icon={IoCopyOutline}
                            label="Copy Link"
                            bg="bg-surface-muted"
                            color="text-fg-strong"
                            onClick={handleCopy}
                          />

                          {/* QR Code */}
                          <SocialAction
                            icon={IoQrCodeOutline}
                            label="QR Card"
                            bg="bg-neutral-charcoal"
                            color="text-brand-aqua"
                            onClick={() => setView("qr")}
                          />

                          {/* WhatsApp */}
                          <SocialAction
                            icon={IoLogoWhatsapp}
                            label="WhatsApp"
                            bg="bg-[#25D366]/10"
                            color="text-[#25D366]"
                            onClick={() =>
                              window.open(
                                `https://wa.me/?text=${shareUrl}`,
                                "_blank",
                              )
                            }
                          />

                          {/* Twitter / X */}
                          <SocialAction
                            icon={IoLogoTwitter}
                            label="Twitter"
                            bg="bg-black/5 dark:bg-white/10"
                            color="text-fg-strong"
                            onClick={() =>
                              window.open(
                                `https://twitter.com/intent/tweet?url=${shareUrl}`,
                                "_blank",
                              )
                            }
                          />

                          {/* Telegram */}
                          <SocialAction
                            icon={FaTelegramPlane}
                            label="Telegram"
                            bg="bg-[#0088cc]/10"
                            color="text-[#0088cc]"
                            onClick={() =>
                              window.open(
                                `https://t.me/share/url?url=${shareUrl}`,
                                "_blank",
                              )
                            }
                          />

                          {/* Discord (Copy mainly) */}
                          <SocialAction
                            icon={FaDiscord}
                            label="Discord"
                            bg="bg-[#5865F2]/10"
                            color="text-[#5865F2]"
                            onClick={handleCopy}
                          />

                          {/* More Generic */}
                          <div className="sm:hidden snap-start min-w-[72px] flex items-center justify-center">
                            <button className="w-12 h-12 rounded-full border border-dashed border-fg-muted/40 flex items-center justify-center text-fg-muted">
                              <IoShareSocial />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =======================
            VIEW: QR CODE (OVERLAY)
           ======================= */}
        <AnimatePresence>
          {view === "qr" && (
            <motion.div
              key="view-qr"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute inset-0 z-50 bg-bg-elevated flex flex-col"
            >
              {/* Nav */}
              <div className="flex items-center justify-between px-4 py-4 bg-bg-elevated/80 backdrop-blur-md z-10">
                <button
                  onClick={() => setView("share")}
                  className="w-10 h-10 rounded-full bg-surface-soft flex items-center justify-center hover:bg-surface-muted transition-colors"
                >
                  <IoArrowBack className="text-xl" />
                </button>
                <span className="font-bold text-fg-strong">Identity Card</span>
                <div className="w-10" />
              </div>

              {/* Anime Card Content */}
              <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
                {/* Cyber Background Elements */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(3,190,200,0.08),transparent_70%)]" />
                <div className="absolute top-10 right-[-20px] w-32 h-32 border border-brand-500/20 rounded-full opacity-50" />
                <div className="absolute bottom-20 left-[-20px] w-48 h-48 border border-dashed border-accent-amber/20 rounded-full opacity-50" />

                {/* The Card */}
                <motion.div
                  initial={{ scale: 0.95, opacity: 0, rotateX: 10 }}
                  animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                  transition={{ delay: 0.1, type: "spring" }}
                  className="relative w-full max-w-[320px] bg-gradient-to-b from-surface-soft to-bg-elevated border border-white/10 rounded-[24px] shadow-2xl p-6 overflow-hidden backdrop-blur-3xl"
                >
                  {/* Holographic Top Border */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-80" />

                  {/* Profile Header */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className="relative">
                      <img
                        src={MOCK_USERS[0].avatar}
                        className="w-14 h-14 rounded-full border-2 border-bg-elevated bg-surface-muted"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-brand-500 text-[9px] font-bold text-white px-1.5 py-0.5 rounded-md">
                        LVL.99
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-fg-strong">
                        {MOCK_USERS[0].name}
                      </h3>
                      <p className="text-xs text-brand-400 font-mono tracking-wider uppercase">
                        Operative ID: 8X-22
                      </p>
                    </div>
                  </div>

                  {/* Real QR Code Area */}
                  <div className="relative bg-white p-4 rounded-xl shadow-inner mb-6 mx-auto w-full aspect-square flex items-center justify-center group overflow-hidden">
                    {/* Corner Brackets */}
                    <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-neutral-900 rounded-tl-sm" />
                    <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-neutral-900 rounded-tr-sm" />
                    <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-neutral-900 rounded-bl-sm" />
                    <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-neutral-900 rounded-br-sm" />

                    {/* The QR Image (Live Generation) */}
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(shareUrl)}&bgcolor=ffffff`}
                      alt="QR Code"
                      className="w-full h-full object-contain mix-blend-multiply opacity-90"
                    />

                    {/* Scanning Laser Effect */}
                    <motion.div
                      animate={{ top: ["0%", "100%", "0%"] }}
                      transition={{
                        duration: 4,
                        ease: "linear",
                        repeat: Infinity,
                      }}
                      className="absolute left-0 right-0 h-1.5 bg-brand-500/60 shadow-[0_0_15px_rgba(3,190,200,0.8)] z-10"
                    />
                  </div>

                  <div className="text-center">
                    <p className="text-[10px] text-fg-muted uppercase tracking-[0.2em] mb-1">
                      Scan to Sync
                    </p>
                    <p className="text-xs text-fg-strong font-medium">
                      Connect via AnimeVerse Net
                    </p>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-[320px]">
                  <button className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-surface-soft text-fg-strong font-semibold hover:bg-surface-muted transition-colors active:scale-95">
                    <IoCopyOutline /> Copy
                  </button>
                  <button className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-brand-solid text-white font-semibold shadow-glow-brand hover:brightness-110 transition-all active:scale-95">
                    <IoDownloadOutline /> Save
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}
