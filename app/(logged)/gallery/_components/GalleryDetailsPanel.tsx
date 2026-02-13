// app\(logged)\gallery\_components\GalleryDetailsPanel.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  IoArrowBack,
  IoArrowForward,
  IoBookmark,
  IoBookmarkOutline,
  IoChevronDown,
  IoChevronUp,
  IoClose,
  IoCopyOutline,
  IoHeart,
  IoHeartOutline,
  IoInformationCircleOutline,
  IoRefreshOutline,
  IoWarningOutline,
} from "react-icons/io5";

import type { GalleryWork } from "./_data/galleryTypes";
import { cn, formatCompact } from "./_data/galleryUtils";
import { FollowBurstButton } from "@/components/ui/FollowBurstButton";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";

type Props = {
  open: boolean;
  dir: "rtl" | "ltr";

  status: "loading" | "ready" | "error" | "not_found";
  work: GalleryWork | null;

  isLiked: boolean;
  isSaved: boolean;
  isFollowing: boolean;

  hiddenByFilters?: boolean;

  onClose: () => void;
  onRetry: () => void;

  onToggleLike: (id: string) => void;
  onToggleSave: (id: string) => void;
  onFollowRequest: (args: {
    userId: string;
    follow: boolean;
    signal?: AbortSignal;
  }) => Promise<void>;

  onTagClick?: (tag: string) => void;
  onRevealInFilters?: () => void;
};

export default function GalleryDetailsPanel({
  open,
  dir,
  status,
  work,
  isLiked,
  isSaved,
  isFollowing,
  hiddenByFilters,
  onClose,
  onRetry,
  onToggleLike,
  onToggleSave,
  onFollowRequest,
  onTagClick,
  onRevealInFilters,
}: Props) {
  const reduce = useReducedMotion();

  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const isDesktop = useMemo(() => {
    if (typeof window === "undefined") return true;
    return window.innerWidth >= 1024;
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    // lock body scroll
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    setActive(0);
    setMobileExpanded(false);
  }, [work?.id]);

  const activeImg = work?.images?.[active] ?? work?.images?.[0] ?? null;

  const goPrevNext = (delta: number) => {
    if (!work) return;
    setActive((a) => {
      const next = a + delta;
      return Math.max(0, Math.min(work.images.length - 1, next));
    });
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  };

  const leftIcon = dir === "rtl" ? <IoArrowForward /> : <IoArrowBack />;
  const rightIcon = dir === "rtl" ? <IoArrowBack /> : <IoArrowForward />;

  const ActionsRow = ({ compact }: { compact?: boolean }) => (
    <div className={cn("grid gap-2", compact ? "grid-cols-3" : "grid-cols-2")}>
      <button
        type="button"
        className={cn(
          "rounded-2xl border px-3 py-3 text-[12px] font-black transition",
          isLiked
            ? "border-transparent bg-danger-500 text-white"
            : "border-border-subtle bg-surface-soft text-foreground-strong hover:bg-surface",
        )}
        onClick={() => work && onToggleLike(work.id)}
        disabled={!work}
      >
        <span className="inline-flex items-center justify-center gap-2">
          {isLiked ? <IoHeart /> : <IoHeartOutline />} إعجاب
        </span>
      </button>

      <button
        type="button"
        className={cn(
          "rounded-2xl border px-3 py-3 text-[12px] font-black transition",
          isSaved
            ? "border-transparent bg-foreground-strong text-background"
            : "border-border-subtle bg-surface-soft text-foreground-strong hover:bg-surface",
        )}
        onClick={() => work && onToggleSave(work.id)}
        disabled={!work}
      >
        <span className="inline-flex items-center justify-center gap-2">
          {isSaved ? <IoBookmark /> : <IoBookmarkOutline />} حفظ
        </span>
      </button>

      {compact && (
        <button
          type="button"
          className="rounded-2xl border border-border-subtle bg-surface-soft px-3 py-3 text-[12px] font-black text-foreground-strong hover:bg-surface"
          onClick={copyLink}
        >
          <span className="inline-flex items-center justify-center gap-2">
            <IoCopyOutline /> {copied ? "تم النسخ" : "نسخ الرابط"}
          </span>
        </button>
      )}
    </div>
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reduce ? { duration: 0 } : { duration: 0.18 }}
            onClick={onClose}
          />

          {/* Fullscreen container */}
          <motion.div
            className="fixed inset-0 z-[90]"
            initial={{ opacity: 0, scale: reduce ? 1 : 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: reduce ? 1 : 0.99 }}
            transition={
              reduce
                ? { duration: 0 }
                : { type: "spring", stiffness: 420, damping: 34 }
            }
            role="dialog"
            aria-modal="true"
            aria-label="Work viewer"
          >
            <div className="absolute inset-0 grid lg:grid-cols-[1fr_420px]">
              {/* Viewer (always full height) */}
              <div className="relative bg-black">
                {/* Top bar */}
                <div className="absolute top-4 inset-x-4 z-20 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="grid size-11 place-items-center rounded-2xl border border-white/15 bg-black/35 text-white backdrop-blur-md hover:bg-black/45"
                    aria-label="Close"
                  >
                    <IoClose className="text-[20px]" />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={copyLink}
                      className="grid size-11 place-items-center rounded-2xl border border-white/15 bg-black/35 text-white backdrop-blur-md hover:bg-black/45"
                      aria-label="Copy link"
                      title="Copy link"
                    >
                      <IoCopyOutline className="text-[18px]" />
                    </button>
                  </div>
                </div>

                {/* Image */}
                <div className="absolute inset-0">
                  {status === "loading" && (
                    <div className="absolute inset-0 grid place-items-center">
                      <div className="h-[52px] w-[220px] rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md animate-pulse" />
                    </div>
                  )}

                  {(status === "error" || status === "not_found") && (
                    <div className="absolute inset-0 grid place-items-center p-6 text-center">
                      <div className="mx-auto mb-4 grid size-16 place-items-center rounded-3xl border border-white/15 bg-white/10 text-white/90">
                        <IoWarningOutline className="text-[28px]" />
                      </div>
                      <div className="text-base font-black text-white">
                        {status === "not_found"
                          ? "هذا العمل غير موجود"
                          : "خطأ أثناء التحميل"}
                      </div>
                      <div className="mt-2 text-[12px] text-white/75">
                        {status === "not_found"
                          ? "الرابط قديم أو ID غير صحيح."
                          : "جرّب Retry."}
                      </div>
                      <div className="mt-4 flex justify-center">
                        <button
                          type="button"
                          onClick={onRetry}
                          className="rounded-2xl bg-white px-4 py-2 text-[12px] font-black text-black hover:opacity-95"
                        >
                          <span className="inline-flex items-center gap-2">
                            <IoRefreshOutline className="text-[16px]" /> Retry
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  {status === "ready" && work && activeImg && (
                    <motion.div
                      layoutId={`work-${work.id}-cover`}
                      className="absolute inset-0"
                    >
                      <Image
                        src={activeImg.src}
                        alt={activeImg.alt ?? work.title}
                        fill
                        className="object-contain"
                        sizes="100vw"
                        priority
                        quality={85}
                      />
                    </motion.div>
                  )}
                </div>

                {/* Prev/Next */}
                {status === "ready" && work && work.images.length > 1 && (
                  <>
                    <button
                      type="button"
                      className={cn(
                        "absolute top-1/2 start-4 z-20 -translate-y-1/2",
                        "grid size-12 place-items-center rounded-2xl border border-white/15 bg-black/35 text-white backdrop-blur-md hover:bg-black/45",
                        active === 0 && "opacity-60",
                      )}
                      onClick={() => goPrevNext(-1)}
                      aria-label="Prev image"
                    >
                      {leftIcon}
                    </button>

                    <button
                      type="button"
                      className={cn(
                        "absolute top-1/2 end-4 z-20 -translate-y-1/2",
                        "grid size-12 place-items-center rounded-2xl border border-white/15 bg-black/35 text-white backdrop-blur-md hover:bg-black/45",
                        active === work.images.length - 1 && "opacity-60",
                      )}
                      onClick={() => goPrevNext(1)}
                      aria-label="Next image"
                    >
                      {rightIcon}
                    </button>

                    <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full border border-white/15 bg-black/35 px-3 py-1 text-[11px] font-black text-white backdrop-blur-md">
                      <span dir="ltr">
                        {active + 1}/{work.images.length}
                      </span>
                    </div>
                  </>
                )}

                {/* Mobile bottom sheet */}
                <div className="lg:hidden">
                  <motion.div
                    className={cn(
                      "absolute inset-x-0 bottom-0 z-30",
                      "rounded-t-3xl border-t border-border-subtle bg-background-elevated/95 backdrop-blur-xl",
                      "shadow-[var(--shadow-elevated)]",
                    )}
                    initial={false}
                    animate={{ height: mobileExpanded ? "72vh" : "168px" }}
                    transition={
                      reduce
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 420, damping: 38 }
                    }
                  >
                    <div className="h-full overflow-hidden">
                      <div className="flex items-center justify-between gap-3 border-b border-border-subtle px-4 py-3">
                        <button
                          type="button"
                          className="text-[12px] font-black text-foreground-strong"
                          onClick={() => setMobileExpanded((v) => !v)}
                        >
                          <span className="inline-flex items-center gap-2">
                            {mobileExpanded ? (
                              <IoChevronDown />
                            ) : (
                              <IoChevronUp />
                            )}
                            {mobileExpanded ? "إخفاء التفاصيل" : "عرض التفاصيل"}
                          </span>
                        </button>

                        {work && (
                          <div className="text-[11px] text-foreground-muted">
                            ❤️{" "}
                            <span dir="ltr" className="font-mono tabular-nums">
                              {formatCompact(work.likes)}
                            </span>{" "}
                            • 👁️{" "}
                            <span dir="ltr" className="font-mono tabular-nums">
                              {formatCompact(work.views)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="app-scroll h-full overflow-y-auto p-4">
                        {status === "ready" && work && (
                          <>
                            {hiddenByFilters && (
                              <div className="mb-4 rounded-3xl border border-border-subtle bg-surface-soft p-4">
                                <div className="flex items-start gap-3">
                                  <div className="mt-0.5 grid size-10 place-items-center rounded-2xl border border-border-subtle bg-background-elevated">
                                    <IoInformationCircleOutline className="text-[18px] text-foreground-muted" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-[12px] font-black text-foreground-strong">
                                      مخفي بسبب الفلاتر الحالية
                                    </div>
                                    <div className="mt-1 text-[11px] text-foreground-muted">
                                      اضغط لعرضه ضمن النتائج.
                                    </div>
                                    {onRevealInFilters && (
                                      <div className="mt-3">
                                        <button
                                          type="button"
                                          onClick={onRevealInFilters}
                                          className="rounded-2xl bg-foreground-strong px-4 py-2 text-[12px] font-black text-background hover:opacity-95"
                                        >
                                          عرض ضمن النتائج
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="space-y-4">
                              <div className="text-lg font-black text-foreground-strong leading-snug line-clamp-2">
                                {work.title}
                              </div>

                              {/* Author + Follow on avatar */}
                              <div className="rounded-3xl border border-border-subtle bg-surface-soft p-4">
                                <div className="flex items-center gap-3">
                                  <div className="relative">
                                    <img
                                      src={work.author.avatar}
                                      alt={work.author.name}
                                      className="size-12 rounded-full border border-border-subtle bg-background-elevated object-cover"
                                      loading="lazy"
                                      referrerPolicy="no-referrer"
                                    />
                                    <div className="absolute -bottom-1 -end-1">
                                      <FollowBurstButton
                                        userId={work.author.id}
                                        following={isFollowing}
                                        request={onFollowRequest}
                                        size={28}
                                        autoHideOnFollow={false}
                                        shimmer
                                        ripple
                                        burst
                                        idlePulse
                                        showSpinner
                                      />
                                    </div>
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className="truncate text-[12px] font-black text-foreground-strong">
                                        {work.author.name}
                                      </span>
                                      {work.author.verified && (
                                        <VerifiedBadge size={16} />
                                      )}
                                    </div>
                                    <div className="truncate text-[11px] text-foreground-muted">
                                      {work.author.username}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <ActionsRow compact />

                              <p className="text-[12px] leading-relaxed text-foreground-muted">
                                {work.description}
                              </p>

                              <div className="flex flex-wrap gap-2">
                                <span className="rounded-full border border-border-subtle bg-surface-soft px-3 py-1 text-[12px] font-black text-foreground-strong">
                                  ❤️{" "}
                                  <span
                                    dir="ltr"
                                    className="font-mono tabular-nums"
                                  >
                                    {formatCompact(work.likes)}
                                  </span>
                                </span>
                                <span className="rounded-full border border-border-subtle bg-surface-soft px-3 py-1 text-[12px] font-black text-foreground-strong">
                                  👁️{" "}
                                  <span
                                    dir="ltr"
                                    className="font-mono tabular-nums"
                                  >
                                    {formatCompact(work.views)}
                                  </span>
                                </span>
                                <span className="rounded-full border border-border-subtle bg-surface-soft px-3 py-1 text-[12px] font-black text-foreground-strong">
                                  🔖{" "}
                                  <span
                                    dir="ltr"
                                    className="font-mono tabular-nums"
                                  >
                                    {formatCompact(work.saves)}
                                  </span>
                                </span>
                              </div>

                              <div>
                                <div className="mb-2 text-[11px] font-black text-foreground-strong">
                                  الوسوم
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {work.tags.slice(0, 18).map((t) => (
                                    <button
                                      key={t}
                                      type="button"
                                      onClick={() => onTagClick?.(t)}
                                      className="rounded-full border border-border-subtle bg-surface-soft px-3 py-1.5 text-[11px] font-black text-foreground-muted hover:bg-accent-soft hover:text-accent hover:border-accent-border"
                                    >
                                      #{t}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="h-10" />
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Desktop details side panel */}
              <aside className="hidden lg:flex flex-col border-s border-border-subtle bg-background-elevated">
                <div className="flex items-center justify-between gap-3 border-b border-border-subtle px-4 py-3">
                  <div className="text-[12px] font-black text-foreground-strong">
                    تفاصيل العمل
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="grid size-10 place-items-center rounded-2xl border border-border-subtle bg-surface-soft hover:bg-surface"
                    aria-label="Close"
                  >
                    <IoClose className="text-[18px]" />
                  </button>
                </div>

                <div className="app-scroll flex-1 overflow-y-auto p-4">
                  {status === "loading" && (
                    <div className="space-y-3">
                      <div className="h-6 w-3/4 rounded-xl bg-surface-soft animate-pulse" />
                      <div className="h-4 w-11/12 rounded-xl bg-surface-soft animate-pulse" />
                      <div className="h-4 w-10/12 rounded-xl bg-surface-soft animate-pulse" />
                      <div className="h-24 rounded-3xl bg-surface-soft animate-pulse" />
                    </div>
                  )}

                  {(status === "error" || status === "not_found") && (
                    <div className="py-10 text-center">
                      <div className="mx-auto mb-4 grid size-16 place-items-center rounded-3xl border border-border-subtle bg-surface-soft">
                        <IoWarningOutline className="text-[28px] text-danger-500" />
                      </div>
                      <div className="text-base font-black text-foreground-strong">
                        {status === "not_found"
                          ? "هذا العمل غير موجود"
                          : "حدث خطأ أثناء التحميل"}
                      </div>
                      <div className="mt-2 text-[12px] text-foreground-muted">
                        جرّب Retry
                      </div>
                      <div className="mt-4 flex justify-center">
                        <button
                          type="button"
                          onClick={onRetry}
                          className="rounded-2xl bg-foreground-strong px-4 py-2 text-[12px] font-black text-background hover:opacity-95"
                        >
                          <span className="inline-flex items-center gap-2">
                            <IoRefreshOutline className="text-[16px]" /> Retry
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  {status === "ready" && work && (
                    <div className="space-y-4">
                      {hiddenByFilters && (
                        <div className="rounded-3xl border border-border-subtle bg-surface-soft p-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 grid size-10 place-items-center rounded-2xl border border-border-subtle bg-background-elevated">
                              <IoInformationCircleOutline className="text-[18px] text-foreground-muted" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-[12px] font-black text-foreground-strong">
                                مخفي بسبب الفلاتر
                              </div>
                              <div className="mt-1 text-[11px] text-foreground-muted">
                                اضغط لعرضه ضمن النتائج.
                              </div>
                              {onRevealInFilters && (
                                <div className="mt-3">
                                  <button
                                    type="button"
                                    onClick={onRevealInFilters}
                                    className="rounded-2xl bg-foreground-strong px-4 py-2 text-[12px] font-black text-background hover:opacity-95"
                                  >
                                    عرض ضمن النتائج
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="text-lg font-black text-foreground-strong leading-snug">
                        {work.title}
                      </div>

                      {/* Author block */}
                      <div className="rounded-3xl border border-border-subtle bg-surface-soft p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={work.author.avatar}
                              alt={work.author.name}
                              className="size-12 rounded-full border border-border-subtle bg-background-elevated object-cover"
                              loading="lazy"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute -bottom-1 -end-1">
                              <FollowBurstButton
                                userId={work.author.id}
                                following={isFollowing}
                                request={onFollowRequest}
                                size={30}
                                autoHideOnFollow={false}
                                shimmer
                                ripple
                                burst
                                idlePulse
                                showSpinner
                              />
                            </div>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="truncate text-[12px] font-black text-foreground-strong">
                                {work.author.name}
                              </span>
                              {work.author.verified && (
                                <VerifiedBadge size={16} />
                              )}
                            </div>
                            <div className="truncate text-[11px] text-foreground-muted">
                              {work.author.username}
                            </div>
                            <div className="mt-2 text-[11px] text-foreground-muted">
                              متابعون:{" "}
                              <span
                                dir="ltr"
                                className="font-mono tabular-nums"
                              >
                                {formatCompact(work.author.followers)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <ActionsRow />

                      <button
                        type="button"
                        className="w-full rounded-2xl border border-border-subtle bg-surface-soft px-3 py-3 text-[12px] font-black text-foreground-strong hover:bg-surface"
                        onClick={copyLink}
                      >
                        <span className="inline-flex items-center justify-center gap-2">
                          <IoCopyOutline /> {copied ? "تم النسخ" : "نسخ الرابط"}
                        </span>
                      </button>

                      <p className="text-[12px] leading-relaxed text-foreground-muted">
                        {work.description}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full border border-border-subtle bg-surface-soft px-3 py-1 text-[12px] font-black text-foreground-strong">
                          ❤️{" "}
                          <span dir="ltr" className="font-mono tabular-nums">
                            {formatCompact(work.likes)}
                          </span>
                        </span>
                        <span className="rounded-full border border-border-subtle bg-surface-soft px-3 py-1 text-[12px] font-black text-foreground-strong">
                          👁️{" "}
                          <span dir="ltr" className="font-mono tabular-nums">
                            {formatCompact(work.views)}
                          </span>
                        </span>
                        <span className="rounded-full border border-border-subtle bg-surface-soft px-3 py-1 text-[12px] font-black text-foreground-strong">
                          🔖{" "}
                          <span dir="ltr" className="font-mono tabular-nums">
                            {formatCompact(work.saves)}
                          </span>
                        </span>
                      </div>

                      <div>
                        <div className="mb-2 text-[11px] font-black text-foreground-strong">
                          الوسوم
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {work.tags.slice(0, 18).map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => onTagClick?.(t)}
                              className="rounded-full border border-border-subtle bg-surface-soft px-3 py-1.5 text-[11px] font-black text-foreground-muted hover:bg-accent-soft hover:text-accent hover:border-accent-border"
                            >
                              #{t}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="h-10" />
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
