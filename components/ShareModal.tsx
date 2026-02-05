// components\ShareModal.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  IoClose,
  IoSearch,
  IoCheckmark,
  IoArrowBack,
  IoCopyOutline,
  IoDownloadOutline,
  IoPaperPlane,
  IoQrCodeOutline,
  IoLogoWhatsapp,
  IoLogoTwitter,
  IoLogoFacebook,
  IoLogoLinkedin,
  IoLogoReddit,
  IoMailOutline,
  IoChatbubbleEllipsesOutline,
  IoShareSocial,
} from "react-icons/io5";
import { FaDiscord, FaTelegramPlane } from "react-icons/fa";

import DeModal, { type DeModalProps } from "@/design/DeModal";

// ---------------------------------------------
// Types
// ---------------------------------------------
type Dir = "rtl" | "ltr";

type User = {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  status?: "online" | "offline";
  lastMessage?: string;
  lastTime?: string; // keep as string for UI (ex: "2m", "Yesterday")
  unread?: number;
};

type ShareModalProps = Omit<
  DeModalProps,
  "children" | "title" | "subtitle" | "footer"
> & {
  shareUrl: string;
  shareTitle?: string;

  /** optional: pass real recent chats from backend */
  recentUsers?: User[];

  /** optional: when user sends to selected chat */
  onSendToUser?: (payload: {
    userId: string;
    message: string;
    shareUrl: string;
  }) => void;

  /** optional: logo in QR center (ex: /logo-mark.png) */
  qrLogoSrc?: string;
};

// ---------------------------------------------
// Mock (fallback) recent chats
// ---------------------------------------------
const MOCK_RECENTS: User[] = Array.from({ length: 16 }).map((_, i) => ({
  id: `u-${i}`,
  name: i === 0 ? "You" : `Nakama ${i}`,
  handle: `@user_${i}`,
  avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${i + 10}&backgroundColor=b6e3f4`,
  status: Math.random() > 0.75 ? "online" : "offline",
  lastMessage:
    i % 3 === 0
      ? "Bro… this panel is insane 🔥"
      : i % 3 === 1
        ? "Send me the link pls"
        : "Luffy energy 💀",
  lastTime: i < 3 ? `${i + 1}m` : i < 7 ? "Today" : "Yesterday",
  unread: i % 5 === 0 ? 2 : 0,
}));

// ---------------------------------------------
// Main Component
// ---------------------------------------------
export default function ShareModal({
  open,
  onOpenChange,
  shareUrl,
  shareTitle = "Check this out!",
  recentUsers,
  onSendToUser,
  qrLogoSrc,
  ...modalProps
}: ShareModalProps) {
  const [view, setView] = useState<"share" | "qr">("share");

  // Header search
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  // Selection (single user as requested)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Composer
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  // dir
  const dir: Dir = useMemo(() => {
    if (typeof document === "undefined") return "ltr";
    const d = (
      document.documentElement.getAttribute("dir") || "ltr"
    ).toLowerCase();
    return d === "rtl" ? "rtl" : "ltr";
  }, []);
  const isRTL = dir === "rtl";

  const users = recentUsers?.length ? recentUsers : MOCK_RECENTS;

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(s) ||
        u.handle.toLowerCase().includes(s) ||
        (u.lastMessage || "").toLowerCase().includes(s),
    );
  }, [q, users]);

  const selectedUser = useMemo(() => {
    if (!selectedUserId) return null;
    return users.find((u) => u.id === selectedUserId) || null;
  }, [selectedUserId, users]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setView("share");
        setSearchOpen(false);
        setQ("");
        setSelectedUserId(null);
        setMessage("");
        setCopied(false);
      }, 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Focus search when opened
  useEffect(() => {
    if (searchOpen) {
      const t = setTimeout(() => searchRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [searchOpen]);

  const close = () => onOpenChange(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 900);
    } catch {
      // fallback: do nothing (or show toast in your system)
      setCopied(false);
    }
  };

  const sendToUser = () => {
    if (!selectedUserId) return;
    const text = message.trim();
    if (!text) return;

    onSendToUser?.({ userId: selectedUserId, message: text, shareUrl });

    // UX: clear message but keep selection (or close modal if you prefer)
    setMessage("");
  };

  const quickSuggestions = useMemo(() => {
    // Keep it short + anime vibe but professional
    return [
      "🔥 This is a must-see",
      "Thoughts?",
      "No spoilers 😄",
      "Look at this panel",
      "This is peak",
      "Save it for later",
    ];
  }, []);

  const openUrl = (url: string) =>
    window.open(url, "_blank", "noopener,noreferrer");

  const shareTargets = useMemo(() => {
    const encUrl = encodeURIComponent(shareUrl);
    const encTitle = encodeURIComponent(shareTitle);

    return [
      {
        key: "copy",
        label: copied ? "Copied" : "Copy",
        icon: IoCopyOutline,
        onClick: copyLink,
      },
      {
        key: "qr",
        label: "QR",
        icon: IoQrCodeOutline,
        onClick: () => setView("qr"),
      },
      {
        key: "whatsapp",
        label: "WhatsApp",
        icon: IoLogoWhatsapp,
        onClick: () =>
          openUrl(
            `https://wa.me/?text=${encodeURIComponent(`${shareTitle} ${shareUrl}`)}`,
          ),
      },
      {
        key: "telegram",
        label: "Telegram",
        icon: FaTelegramPlane,
        onClick: () =>
          openUrl(`https://t.me/share/url?url=${encUrl}&text=${encTitle}`),
      },
      {
        key: "twitter",
        label: "X",
        icon: IoLogoTwitter,
        onClick: () =>
          openUrl(
            `https://twitter.com/intent/tweet?url=${encUrl}&text=${encTitle}`,
          ),
      },
      {
        key: "facebook",
        label: "Facebook",
        icon: IoLogoFacebook,
        onClick: () =>
          openUrl(`https://www.facebook.com/sharer/sharer.php?u=${encUrl}`),
      },
      {
        key: "linkedin",
        label: "LinkedIn",
        icon: IoLogoLinkedin,
        onClick: () =>
          openUrl(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encUrl}`,
          ),
      },
      {
        key: "reddit",
        label: "Reddit",
        icon: IoLogoReddit,
        onClick: () =>
          openUrl(
            `https://www.reddit.com/submit?url=${encUrl}&title=${encTitle}`,
          ),
      },
      {
        key: "discord",
        label: "Discord",
        icon: FaDiscord,
        onClick: copyLink,
      },
      {
        key: "email",
        label: "Email",
        icon: IoMailOutline,
        onClick: () =>
          openUrl(
            `mailto:?subject=${encTitle}&body=${encodeURIComponent(`${shareTitle}\n\n${shareUrl}`)}`,
          ),
      },
      {
        key: "sms",
        label: "SMS",
        icon: IoChatbubbleEllipsesOutline,
        onClick: () =>
          openUrl(
            `sms:&body=${encodeURIComponent(`${shareTitle} ${shareUrl}`)}`,
          ),
      },
      {
        key: "more",
        label: "More",
        icon: IoShareSocial,
        onClick: async () => {
          // Web Share API
          try {
            // @ts-expect-error - navigator.share may not exist in TS lib
            if (navigator.share) {
              // @ts-expect-error
              await navigator.share({
                title: shareTitle,
                url: shareUrl,
                text: shareTitle,
              });
              return;
            }
          } catch {
            // ignore
          }
          copyLink();
        },
      },
    ];
  }, [copied, shareTitle, shareUrl]);

  return (
    <DeModal
      open={open}
      onOpenChange={onOpenChange}
      dir="auto"
      contentPadding="none"
      sheetDragMode="binary"
      sheetAutoFit
      panelClassName="bg-background-elevated w-full max-w-lg h-[82vh] sm:h-[680px] flex flex-col overflow-hidden"
      preset="comments"
      {...modalProps}
    >
      <div className="flex h-full flex-col" dir={dir}>
        {/* ---------------------------
            VIEW: SHARE
        ---------------------------- */}
        <AnimatePresence mode="wait">
          {view === "share" && (
            <motion.div
              key="share-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full flex-col"
            >
              {/* Header (small) */}
              <div className="shrink-0 border-b border-border-subtle bg-background-elevated px-3 pt-2 pb-2">
                <div
                  className={[
                    "flex items-center gap-2",
                    isRTL ? "flex-row-reverse" : "flex-row",
                  ].join(" ")}
                >
                  <DeIconButton
                    ariaLabel="Close"
                    onClick={close}
                    icon={<IoClose className="size-5" />}
                  />

                  <div className="flex-1 min-w-0">
                    <AnimatePresence mode="popLayout" initial={false}>
                      {!searchOpen ? (
                        <motion.div
                          key="title"
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className={[
                            "text-sm font-semibold text-foreground-strong",
                            isRTL ? "text-right" : "text-left",
                          ].join(" ")}
                        >
                          Share
                        </motion.div>
                      ) : (
                        <motion.div
                          key="search"
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="w-full"
                        >
                          <DeInput
                            ref={searchRef}
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder={
                              isRTL
                                ? "ابحث بالاسم أو @..."
                                : "Search name or @..."
                            }
                            startIcon={<IoSearch className="size-4" />}
                            endIcon={
                              <button
                                type="button"
                                onClick={() => {
                                  setSearchOpen(false);
                                  setQ("");
                                }}
                                className="grid size-7 place-items-center rounded-full hover:bg-surface-muted"
                                aria-label="Clear search"
                              >
                                <IoClose className="size-4" />
                              </button>
                            }
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {!searchOpen && (
                    <DeIconButton
                      ariaLabel="Search"
                      onClick={() => setSearchOpen(true)}
                      icon={<IoSearch className="size-5" />}
                    />
                  )}
                </div>
              </div>

              {/* Content: users grid */}
              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
                <div className="px-3 py-3">
                  <motion.div
                    className="grid grid-cols-4 sm:grid-cols-5 gap-3"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      visible: { transition: { staggerChildren: 0.03 } },
                    }}
                  >
                    {filtered.map((u) => {
                      const active = u.id === selectedUserId;
                      return (
                        <UserTile
                          key={u.id}
                          user={u}
                          active={active}
                          onClick={() =>
                            setSelectedUserId((prev) =>
                              prev === u.id ? null : u.id,
                            )
                          }
                        />
                      );
                    })}
                  </motion.div>

                  {filtered.length === 0 && (
                    <div className="grid place-items-center py-10 text-sm text-foreground-muted">
                      {isRTL ? "لا يوجد نتائج" : "No results found."}
                    </div>
                  )}
                </div>
              </div>

              {/* Composer (smooth) when selected */}
              <AnimatePresence>
                {selectedUser && (
                  <motion.div
                    key="composer"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 14 }}
                    transition={{ type: "spring", damping: 22, stiffness: 260 }}
                    className="shrink-0 border-t border-border-subtle bg-background-elevated px-3 py-3"
                  >
                    {/* To */}
                    <div
                      className={[
                        "mb-2 flex items-center justify-between gap-2",
                        isRTL ? "flex-row-reverse" : "flex-row",
                      ].join(" ")}
                    >
                      <div className="min-w-0">
                        <div
                          className={[
                            "text-xs text-foreground-muted",
                            isRTL ? "text-right" : "text-left",
                          ].join(" ")}
                        >
                          {isRTL ? "إرسال إلى" : "Sending to"}
                        </div>
                        <div
                          className={[
                            "text-sm font-semibold text-foreground-strong truncate",
                            isRTL ? "text-right" : "text-left",
                          ].join(" ")}
                        >
                          {selectedUser.name}{" "}
                          <span className="text-foreground-muted font-medium">
                            {selectedUser.handle}
                          </span>
                        </div>
                      </div>

                      <DeButton
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedUserId(null)}
                      >
                        {isRTL ? "تغيير" : "Change"}
                      </DeButton>
                    </div>

                    {/* Suggestions */}
                    <div className="mb-2 flex gap-2 overflow-x-auto no-scrollbar py-1">
                      {quickSuggestions.map((s) => (
                        <DeChip
                          key={s}
                          onClick={() =>
                            setMessage((prev) => (prev ? `${prev} ${s}` : s))
                          }
                        >
                          {s}
                        </DeChip>
                      ))}
                    </div>

                    {/* Input + send */}
                    <div
                      className={[
                        "flex items-end gap-2",
                        isRTL ? "flex-row-reverse" : "flex-row",
                      ].join(" ")}
                    >
                      <div className="flex-1 min-w-0">
                        <DeInput
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder={
                            isRTL ? "اكتب رسالة قصيرة..." : "Write a note..."
                          }
                        />
                      </div>

                      <DeButton
                        variant="solid"
                        onClick={sendToUser}
                        disabled={!message.trim()}
                        startIcon={<IoPaperPlane className="size-4" />}
                      >
                        {isRTL ? "إرسال" : "Send"}
                      </DeButton>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Footer: share targets (mobile swipe, desktop 2-row grid) */}
              <div className="shrink-0 border-t border-border-subtle bg-background-elevated pb-[env(safe-area-inset-bottom)]">
                <div className="px-3 py-3">
                  <div
                    className={[
                      // mobile: swipe row
                      "flex gap-2 overflow-x-auto no-scrollbar snap-x snap-mandatory",
                      // desktop: 2-row grid
                      "sm:grid sm:grid-cols-6 sm:gap-2 sm:overflow-visible sm:snap-none",
                      "sm:[grid-auto-rows:minmax(0,1fr)]",
                    ].join(" ")}
                    style={{ WebkitOverflowScrolling: "touch" }}
                  >
                    {shareTargets.map((a) => (
                      <ShareAction
                        key={a.key}
                        icon={a.icon}
                        label={a.label}
                        onClick={a.onClick}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---------------------------
            VIEW: QR (simple)
        ---------------------------- */}
        <AnimatePresence>
          {view === "qr" && (
            <motion.div
              key="qr-view"
              initial={{ x: isRTL ? "-100%" : "100%" }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? "-100%" : "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="absolute inset-0 z-50 flex h-full flex-col bg-background-elevated"
            >
              {/* Small nav */}
              <div className="shrink-0 border-b border-border-subtle bg-background-elevated px-3 pt-2 pb-2">
                <div
                  className={[
                    "flex items-center gap-2",
                    isRTL ? "flex-row-reverse" : "flex-row",
                  ].join(" ")}
                >
                  <DeIconButton
                    ariaLabel="Back"
                    onClick={() => setView("share")}
                    icon={
                      <IoArrowBack
                        className={["size-5", isRTL ? "rotate-180" : ""].join(
                          " ",
                        )}
                      />
                    }
                  />

                  <div className="flex-1 min-w-0">
                    <div
                      className={[
                        "text-sm font-semibold text-foreground-strong",
                        isRTL ? "text-right" : "text-left",
                      ].join(" ")}
                    >
                      {isRTL ? "QR" : "QR"}
                    </div>
                    <div
                      className={[
                        "text-[11px] text-foreground-muted truncate",
                        isRTL ? "text-right" : "text-left",
                      ].join(" ")}
                    >
                      {shareUrl}
                    </div>
                  </div>

                  <DeIconButton
                    ariaLabel="Close"
                    onClick={close}
                    icon={<IoClose className="size-5" />}
                  />
                </div>
              </div>

              {/* QR content */}
              <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="mx-auto w-full max-w-[420px] px-4 py-6">
                  <div className="rounded-2xl border border-border-subtle bg-surface-soft p-4">
                    <AnimeQR value={shareUrl} logoSrc={qrLogoSrc} />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <DeButton
                      variant="soft"
                      onClick={copyLink}
                      startIcon={<IoCopyOutline className="size-4" />}
                    >
                      {copied
                        ? isRTL
                          ? "تم النسخ"
                          : "Copied"
                        : isRTL
                          ? "نسخ"
                          : "Copy"}
                    </DeButton>

                    <DeButton
                      variant="solid"
                      onClick={() => {
                        // triggers AnimeQR download via event
                        window.dispatchEvent(
                          new CustomEvent("fanaara:qr:download"),
                        );
                      }}
                      startIcon={<IoDownloadOutline className="size-4" />}
                    >
                      {isRTL ? "تحميل" : "Download"}
                    </DeButton>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DeModal>
  );
}

// ---------------------------------------------
// Sub Components
// ---------------------------------------------
function UserTile({
  user,
  active,
  onClick,
}: {
  user: { id: string; name: string; handle: string; avatar: string };
  active: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      variants={{
        hidden: { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0 },
      }}
      className="group flex flex-col items-center gap-2 rounded-xl p-2 transition-all active:scale-[0.99]"
    >
      <div className="relative">
        {/* ring */}
        <div
          className={[
            "absolute inset-[-3px] rounded-full border-2 transition-all",
            active
              ? "border-brand-500"
              : "border-transparent group-hover:border-border-subtle",
          ].join(" ")}
        />
        <img
          src={user.avatar}
          alt={user.name}
          className="relative size-14 rounded-full border border-border-subtle bg-surface-muted object-cover"
          loading="lazy"
        />

        {/* selected check */}
        <AnimatePresence>
          {active && (
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              className="absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full bg-brand-500 text-white shadow-sm"
            >
              <IoCheckmark className="size-4" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Username then name */}
      <div className="w-full text-center leading-tight">
        <div className="truncate text-xs font-semibold text-foreground-strong">
          {user.handle}
        </div>
        <div className="truncate text-[10px] text-foreground-muted">
          {user.name}
        </div>
      </div>
    </motion.button>
  );
}

function ShareAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: any;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "snap-start",
        "min-w-[74px] sm:min-w-0",
        "rounded-xl border border-border-subtle bg-background-elevated",
        "px-2 py-2",
        "hover:bg-surface-soft active:scale-[0.98] transition-all",
      ].join(" ")}
    >
      <div className="grid place-items-center">
        <div className="grid size-10 place-items-center rounded-2xl bg-surface-soft text-foreground-strong">
          <Icon className="size-5" />
        </div>
        <div className="mt-1 text-[10px] font-medium text-foreground-muted">
          {label}
        </div>
      </div>
    </button>
  );
}

/**
 * Anime-styled QR (qr-code-styling)
 * - Renders a canvas inside
 * - Supports download via window event: "fanaara:qr:download"
 */
function AnimeQR({ value, logoSrc }: { value: string; logoSrc?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const qrInstanceRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    const DEFAULT_ANIME_FACE_LOGO = (() => {
      // Simple chibi/anime face SVG (safe for CORS + works in canvas download)
      const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#7C3AED"/>
        <stop offset="1" stop-color="#06B6D4"/>
      </linearGradient>
    </defs>

    <circle cx="128" cy="128" r="118" fill="#FFFFFF"/>
    <circle cx="128" cy="128" r="110" fill="url(#g)" opacity="0.18"/>

    <!-- hair -->
    <path d="M52 120c10-52 52-78 76-78s66 26 76 78c-10-18-32-34-76-34s-66 16-76 34Z"
      fill="#0B1220" opacity="0.92"/>

    <!-- face -->
    <circle cx="128" cy="142" r="70" fill="#FFFFFF" opacity="0.96"/>
    <circle cx="104" cy="142" r="18" fill="#0B1220"/>
    <circle cx="152" cy="142" r="18" fill="#0B1220"/>
    <circle cx="110" cy="136" r="6" fill="#FFFFFF" opacity="0.9"/>
    <circle cx="158" cy="136" r="6" fill="#FFFFFF" opacity="0.9"/>

    <!-- blush -->
    <circle cx="78" cy="162" r="10" fill="#FB7185" opacity="0.45"/>
    <circle cx="178" cy="162" r="10" fill="#FB7185" opacity="0.45"/>

    <!-- mouth -->
    <path d="M118 170c6 8 14 8 20 0" stroke="#0B1220" stroke-width="6" stroke-linecap="round" fill="none"/>
  </svg>`;
      return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
    })();

    const init = async () => {
      if (!ref.current) return;

      // dynamic import (prevents SSR issues)
      const mod = await import("qr-code-styling");
      const QRCodeStyling = mod.default;

      if (!mounted) return;

      // Clear container
      ref.current.innerHTML = "";
      const finalLogo = logoSrc || DEFAULT_ANIME_FACE_LOGO;

      const qr = new QRCodeStyling({
        width: 320,
        height: 320,
        type: "canvas",
        data: value,
        margin: 10,
        image: finalLogo,
        qrOptions: {
          errorCorrectionLevel: "H",
        },
        dotsOptions: {
          type: "classy-rounded",
          color: "#0B1220", // keep high contrast (important)
        },
        cornersSquareOptions: {
          type: "extra-rounded",
          color: "#0B1220",
        },
        cornersDotOptions: {
          type: "dot",
          color: "#0B1220",
        },
        backgroundOptions: {
          color: "#ffffff",
        },
        imageOptions: {
          crossOrigin: "anonymous",
          margin: 8,
          imageSize: 0.26, // anime face visible
          hideBackgroundDots: true, // crucial for scan reliability
        },
      });

      qr.append(ref.current);
      qrInstanceRef.current = qr;
    };

    init();

    const onDownload = () => {
      try {
        qrInstanceRef.current?.download?.({
          name: "fanaara-qr",
          extension: "png",
        });
      } catch {
        // ignore
      }
    };

    window.addEventListener("fanaara:qr:download", onDownload);
    return () => {
      mounted = false;
      window.removeEventListener("fanaara:qr:download", onDownload);
    };
  }, [value, logoSrc]);

  return (
    <div className="flex flex-col items-center">
      <div className="rounded-2xl bg-white p-3 shadow-sm border border-black/5">
        <div ref={ref} />
      </div>
      <div className="mt-2 text-[11px] text-foreground-muted">Scan to open</div>
    </div>
  );
}

// ---------------------------------------------
// “New buttons & inputs” (local design wrappers)
// Replace these with your actual design system components if you have them.
// ---------------------------------------------
const DeIconButton = ({
  icon,
  onClick,
  ariaLabel,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  ariaLabel: string;
}) => {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={[
        "grid size-9 place-items-center rounded-full",
        "border border-border-subtle bg-surface-soft/70",
        "text-foreground-strong hover:bg-surface-muted active:scale-[0.98] transition-all",
      ].join(" ")}
    >
      {icon}
    </button>
  );
};

const DeButton = ({
  children,
  onClick,
  disabled,
  variant = "soft",
  size = "md",
  startIcon,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "solid" | "soft" | "ghost";
  size?: "sm" | "md";
  startIcon?: React.ReactNode;
}) => {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none";
  const sizes = size === "sm" ? "h-9 px-3 text-xs" : "h-11 px-4 text-sm";
  const styles =
    variant === "solid"
      ? "bg-brand-500 text-white shadow-[0_10px_30px_rgba(124,58,237,0.25)] hover:brightness-110"
      : variant === "ghost"
        ? "bg-transparent text-foreground-strong hover:bg-surface-soft"
        : "bg-surface-soft text-foreground-strong border border-border-subtle hover:bg-surface-muted";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[base, sizes, styles].join(" ")}
    >
      {startIcon}
      <span className="truncate">{children}</span>
    </button>
  );
};

const DeChip = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium",
      "border border-border-subtle bg-surface-soft text-foreground-strong",
      "hover:bg-surface-muted active:scale-[0.98] transition-all",
    ].join(" ")}
  >
    {children}
  </button>
);

const DeInput = React.forwardRef<
  HTMLInputElement,
  {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
  }
>(function DeInput({ value, onChange, placeholder, startIcon, endIcon }, ref) {
  return (
    <div
      className={[
        "h-11 w-full rounded-xl border border-border-subtle bg-surface-soft",
        "px-3 flex items-center gap-2",
        "focus-within:ring-2 focus-within:ring-brand-500/20 transition-all",
      ].join(" ")}
    >
      {startIcon && <div className="text-foreground-muted">{startIcon}</div>}
      <input
        ref={ref}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="h-full w-full bg-transparent outline-none text-sm text-foreground-strong placeholder:text-foreground-muted"
      />
      {endIcon && <div className="text-foreground-muted">{endIcon}</div>}
    </div>
  );
});
