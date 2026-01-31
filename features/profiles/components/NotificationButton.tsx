"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FiBell, FiBellOff } from "react-icons/fi";
import { cn } from "@/utils";
import { IconButton } from "@/design";

type NotificationMode = "off" | "default" | "all";

// ترتيب التبديل بالضغط المتكرر
const CYCLE_ORDER: NotificationMode[] = ["default", "all", "off"];
// ترتيب العرض في الخيارات
const MENU_ORDER: NotificationMode[] = ["off", "default", "all"];

const MODE_LABEL: Record<NotificationMode, string> = {
  off: "إيقاف",
  default: "افتراضي",
  all: "الكل",
};

const MODE_DESC: Record<NotificationMode, string> = {
  off: "لن تصلك أي إشعارات.",
  default: "إشعارات مهمة/مقترحة حسب الإعدادات.",
  all: "كل الإشعارات بدون فلترة.",
};

function nextMode(current: NotificationMode): NotificationMode {
  const idx = CYCLE_ORDER.indexOf(current);
  return CYCLE_ORDER[(idx + 1) % CYCLE_ORDER.length];
}

function useDocumentDir(explicit?: "rtl" | "ltr") {
  const [dir, setDir] = React.useState<"rtl" | "ltr">(explicit ?? "ltr");

  React.useEffect(() => {
    if (explicit) {
      setDir(explicit);
      return;
    }
    if (typeof document === "undefined") return;

    const read = () =>
      document.documentElement.getAttribute("dir") === "rtl" ? "rtl" : "ltr";

    setDir(read());

    const obs = new MutationObserver(() => setDir(read()));
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["dir"],
    });

    return () => obs.disconnect();
  }, [explicit]);

  return dir;
}

function BellAllIcon({ small }: { small?: boolean }) {
  const reduce = useReducedMotion();

  const iconSize = small ? "h-4 w-4" : "h-5 w-5";
  const waveSize = small ? "h-2 w-2" : "h-2.5 w-2.5";
  const left = small ? "-left-1.5" : "-left-2";
  const right = small ? "-right-1.5" : "-right-2";

  return (
    <div className="relative">
      <motion.div
        animate={reduce ? undefined : { rotate: [0, -12, 12, -12, 0] }}
        transition={
          reduce
            ? { duration: 0 }
            : {
                duration: 0.55,
                repeat: Infinity,
                repeatDelay: 2.2,
                ease: "easeInOut",
              }
        }
        className="relative z-10"
      >
        <FiBell className={iconSize} />
      </motion.div>

      {!reduce && (
        <>
          <motion.span
            aria-hidden
            className={cn(
              "absolute top-1/2 -translate-y-1/2 rounded-full border border-current opacity-40",
              waveSize,
              left,
            )}
            animate={{ scale: [0.7, 1.3, 0.7], opacity: [0, 0.45, 0] }}
            transition={{ duration: 1.15, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.span
            aria-hidden
            className={cn(
              "absolute top-1/2 -translate-y-1/2 rounded-full border border-current opacity-40",
              waveSize,
              right,
            )}
            animate={{ scale: [0.7, 1.3, 0.7], opacity: [0, 0.45, 0] }}
            transition={{
              duration: 1.15,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.15,
            }}
          />
        </>
      )}
    </div>
  );
}

type NotificationButtonProps = {
  value?: NotificationMode;
  defaultValue?: NotificationMode;
  onChange?: (mode: NotificationMode) => void;
  dir?: "rtl" | "ltr";
  className?: string;
};

export function NotificationButton({
  value,
  defaultValue = "default",
  onChange,
  dir: dirProp,
  className,
}: NotificationButtonProps) {
  const reduceMotion = useReducedMotion();
  const dir = useDocumentDir(dirProp);
  const layoutId = React.useId();

  const isControlled = value !== undefined;
  const [internalMode, setInternalMode] =
    React.useState<NotificationMode>(defaultValue);

  const mode = isControlled ? (value as NotificationMode) : internalMode;

  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  const closeTimer = React.useRef<number | null>(null);

  const spring = React.useMemo(
    () =>
      reduceMotion
        ? { duration: 0 }
        : { type: "spring", stiffness: 520, damping: 28, mass: 0.9 },
    [reduceMotion],
  );

  const scheduleAutoClose = React.useCallback(() => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), 2200);
  }, []);

  React.useEffect(() => {
    return () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    };
  }, []);

  React.useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) setOpen(false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const commitMode = React.useCallback(
    (
      next: NotificationMode,
      opts?: { close?: boolean; openHint?: boolean },
    ) => {
      if (!isControlled) setInternalMode(next);
      onChange?.(next);

      const shouldOpen = opts?.openHint ?? true;
      if (shouldOpen) {
        setOpen(true);
        scheduleAutoClose();
      } else {
        setOpen(false);
      }

      if (opts?.close) setOpen(false);
    },
    [isControlled, onChange, scheduleAutoClose],
  );

  // ✅ الضغط: يبدّل للحالة التالية + يظهر الخيارات الثلاثة
  const handleMainClick = () => {
    commitMode(nextMode(mode), { openHint: true });
  };

  const buttonTone = cn(
    "relative h-10 w-10 overflow-hidden border backdrop-blur transition-all duration-300 ease-out",
    "active:scale-95",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
    mode === "off" &&
      "bg-zinc-950/35 border-zinc-700/50 text-zinc-400 hover:bg-zinc-900/60 hover:border-zinc-600/60 hover:text-zinc-200",
    mode === "default" &&
      "bg-white/5 border-white/10 text-zinc-200 hover:bg-white/10 hover:border-white/20",
    mode === "all" &&
      "bg-indigo-500/15 border-indigo-500/30 text-indigo-200 hover:bg-indigo-500/25 hover:border-indigo-400/50 shadow-[0_0_18px_-6px_rgba(99,102,241,0.45)]",
    open && "ring-1 ring-white/15",
  );

  const shineDirection =
    dir === "rtl" ? "before:bg-gradient-to-l" : "before:bg-gradient-to-r";

  const iconVariants = {
    initial: { scale: 0.6, opacity: 0, rotate: -18 },
    animate: { scale: 1, opacity: 1, rotate: 0 },
    exit: {
      scale: 0.6,
      opacity: 0,
      rotate: 18,
      transition: { duration: 0.12 },
    },
  } as const;

  const cornerDotPos = dir === "rtl" ? "left-0 -ml-1" : "right-0 -mr-1";

  return (
    <div ref={rootRef} className={cn("relative inline-flex", className)}>
      <IconButton
        onClick={handleMainClick}
        aria-label={`Notifications: ${MODE_LABEL[mode]}`}
        aria-haspopup="menu"
        aria-expanded={open}
        size="md"
        shape="square"
        variant="ghost"
        className={cn(
          buttonTone,
          "group",
          "before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-300",
          "before:from-white/10 before:to-transparent",
          shineDirection,
          "group-hover:before:opacity-100",
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={mode}
            variants={iconVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={spring}
            className="relative flex items-center justify-center"
          >
            {mode === "off" && <FiBellOff className="h-5 w-5" />}

            {mode === "default" && (
              <div className="relative">
                <FiBell className="h-5 w-5" />
                {/* نقطة تنبيه صغيرة حسب اتجاه الصفحة */}
                <span
                  className={cn(
                    "absolute top-0 -mt-1 flex h-2.5 w-2.5",
                    cornerDotPos,
                  )}
                >
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-zinc-200/40" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-zinc-200/70 ring-2 ring-zinc-950/70" />
                </span>
              </div>
            )}

            {mode === "all" && <BellAllIcon />}

            {/* Glow للحالة all */}
            {mode === "all" && !reduceMotion && (
              <motion.div
                aria-hidden
                className="absolute inset-0 rounded-full bg-indigo-400/20 blur-md"
                animate={{ scale: [1, 1.25, 1], opacity: [0.35, 0.05, 0.35] }}
                transition={{
                  duration: 2.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </IconButton>

      {/* خيارات 3 حالات + وصف بسيط */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.98 }}
            animate={{ opacity: 1, y: -50, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={spring}
            className={cn(
              "absolute z-50 mt-2",
              dir === "rtl"
                ? "right-0 origin-top-right"
                : "left-0 origin-top-left",
            )}
            role="menu"
          >
            <div className="w-[240px] rounded-2xl border border-white/10 bg-zinc-950/70 p-1 backdrop-blur-xl shadow-[0_18px_60px_-20px_rgba(0,0,0,0.85)]">
              <div className="grid grid-cols-3 gap-1">
                {MENU_ORDER.map((m) => {
                  const selected = m === mode;

                  const optionTone = cn(
                    "relative flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2",
                    "text-[11px] font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/40",
                    !selected && "text-zinc-300 hover:bg-white/5",
                    selected && "text-white",
                  );

                  const selectedBg = cn(
                    "absolute inset-0 rounded-xl ring-1 ring-white/10",
                    m === "off" && "bg-zinc-800/50",
                    m === "default" && "bg-white/10",
                    m === "all" && "bg-indigo-500/25",
                  );

                  return (
                    <button
                      key={m}
                      type="button"
                      role="menuitem"
                      className={optionTone}
                      onClick={() =>
                        commitMode(m, { close: true, openHint: false })
                      }
                    >
                      {selected && (
                        <motion.div
                          layoutId={`notif-pill-${layoutId}`}
                          className={selectedBg}
                        />
                      )}

                      <span className="relative z-10">
                        {m === "off" && <FiBellOff className="h-4 w-4" />}
                        {m === "default" && <FiBell className="h-4 w-4" />}
                        {m === "all" && <BellAllIcon small />}
                      </span>

                      <span className="relative z-10 leading-none">
                        {MODE_LABEL[m]}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="px-3 pb-2 pt-2">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p
                    key={mode}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={
                      reduceMotion ? { duration: 0 } : { duration: 0.16 }
                    }
                    className="text-[11px] leading-relaxed text-zinc-400"
                  >
                    {MODE_DESC[mode]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
