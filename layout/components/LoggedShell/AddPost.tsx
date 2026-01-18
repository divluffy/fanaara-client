// layout/components/AddPost.tsx
"use client";

import * as React from "react";
import {
  AnimatePresence,
  LazyMotion,
  domAnimation,
  m,
  useReducedMotion,
} from "framer-motion";
import { IoIosAdd } from "react-icons/io";
import { useAppSelector } from "@/store/hooks";

import {
  AddPostProps,
  DEFAULT_ITEMS,
  getFabMenuVariants,
  TONE_VARS,
  useFabMenu,
} from "./add-post";
import { useTranslations } from "next-intl";

export default function AddPost({
  onSelect,
  closeOnSelect = true,
}: AddPostProps) {
  const [open, setOpen] = React.useState(false);
  const { isRTL } = useAppSelector((s) => s.state);
  const reduceMotion = useReducedMotion() ?? false;
  const t = useTranslations("publish");
  const items = DEFAULT_ITEMS;

  const { containerVariants, itemVariants, backdropVariants } =
    getFabMenuVariants(reduceMotion);

  const { menuId, fabRef, setItemRef, close, toggle, onMenuKeyDown } =
    useFabMenu({
      open,
      setOpen,
      itemsCount: items.length,
    });

  const handleSelect = (id: string) => {
    console.log("id: ", id);
    onSelect?.(id);
    if (closeOnSelect) close();
  };

  // RTL => FAB LEFT | LTR => FAB RIGHT
  const isOnRight = !isRTL;
  const side = isOnRight ? "right-6" : "left-6";
  const anchor = isOnRight ? "right-0 items-end" : "left-0 items-start";
  const origin = isOnRight ? "origin-bottom-right" : "origin-bottom-left";
  const rowDir = isRTL ? "flex-row-reverse text-right" : "flex-row text-left";

  const closedX = isOnRight ? 18 : -18;
  const plusRotate = isOnRight ? 45 : -45;

  return (
    <LazyMotion features={domAnimation}>
      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <m.button
            type="button"
            aria-label="Close menu"
            tabIndex={-1}
            onClick={close}
            className="fixed inset-0 z-40 cursor-default bg-black/30 backdrop-blur-[8px] "
            initial="closed"
            animate="open"
            exit="closed"
            variants={backdropVariants}
          />
        )}
      </AnimatePresence>

      <div className={`fixed bottom-6 ${side} z-50`}>
        {/* Menu */}
        <AnimatePresence>
          {open && (
            <m.div
              key="menu"
              id={menuId}
              role="menu"
              aria-label="Add content"
              aria-orientation="vertical"
              onKeyDown={onMenuKeyDown}
              initial="closed"
              animate="open"
              exit="closed"
              variants={containerVariants}
              className={`absolute bottom-16 ${anchor} flex flex-col gap-2`}
            >
              {items.map((it, idx) => (
                <m.button
                  key={it.id}
                  ref={setItemRef(idx)}
                  type="button"
                  role="menuitem"
                  onClick={() => handleSelect(it.id)}
                  variants={itemVariants}
                  custom={closedX}
                  whileHover={
                    reduceMotion
                      ? undefined
                      : { y: -2, scale: 1.012, transition: { duration: 0.12 } }
                  }
                  whileTap={{ scale: 0.985 }}
                  style={TONE_VARS[it.tone]}
                  className={`
                    group relative w-fit overflow-hidden cursor-pointer
                    inline-flex ${rowDir} items-center gap-2
                    rounded-full px-4 py-2
                    bg-background-elevated/96
                    border border-border-subtle
                    shadow-[var(--shadow-lg)]
                    ${origin}
                    will-change-[transform,opacity,filter]
                    transition-[background-color,border-color,box-shadow,transform]
                    duration-300 ease-out
                    hover:border-[color:var(--item-border)]
                    hover:shadow-[var(--shadow-2xl)]
                    focus-visible:outline-none focus-visible:ring-2
                    focus-visible:ring-[color:var(--item-ring)]
                    focus-visible:ring-offset-2 focus-visible:ring-offset-background
                  `}
                >
                  {/* Tone wash */}
                  <span
                    aria-hidden
                    className={`
                      pointer-events-none absolute inset-0 opacity-0
                      transition-opacity duration-300 group-hover:opacity-100
                      bg-[radial-gradient(circle_at_20%_20%,var(--item-soft),transparent_62%)]
                    `}
                  />

                  {/* Shine sweep */}
                  <span
                    aria-hidden
                    className={`
                      pointer-events-none absolute inset-0 opacity-0
                      transition-opacity duration-300 group-hover:opacity-100
                    `}
                  >
                    <span
                      className={`
                        absolute -inset-x-16 -inset-y-10 rotate-12
                        bg-gradient-to-r from-transparent via-white/14 to-transparent
                        translate-x-[-42%] group-hover:translate-x-[42%]
                        transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
                      `}
                    />
                  </span>

                  {/* Icon bubble */}
                  <m.span
                    aria-hidden
                    className={`
                      relative grid size-9 place-items-center rounded-full
                      bg-[color:var(--item-solid)] text-[color:var(--item-on)]
                      border border-border-strong/20
                      shadow-[var(--shadow-sm)]
                      transition-[transform,filter,box-shadow] duration-300
                      group-hover:shadow-[var(--item-glow)]
                    `}
                    whileHover={
                      reduceMotion
                        ? undefined
                        : { rotate: isRTL ? -8 : 8, scale: 1.07 }
                    }
                    transition={
                      reduceMotion
                        ? { duration: 0.001 }
                        : { type: "spring", stiffness: 620, damping: 26 }
                    }
                  >
                    <it.Icon className="size-[18px]" />
                    <span
                      className={`
                        pointer-events-none absolute inset-0 rounded-full
                        opacity-0 group-hover:opacity-100
                        ring-2 ring-[color:var(--item-ring)]
                        scale-90 group-hover:scale-110
                        transition-[transform,opacity] duration-300
                      `}
                    />
                  </m.span>

                  {/* Text */}
                  <span className="whitespace-nowrap text-sm leading-none relative">
                    <span className="font-semibold text-foreground-strong">
                      {t(it.title)}
                    </span>
                    <span className="mx-2 text-foreground-soft">•</span>
                    <span className="text-foreground-muted">{t(it.sub)}</span>
                  </span>
                </m.button>
              ))}
            </m.div>
          )}
        </AnimatePresence>

        {/* FAB */}
        <m.button
          ref={fabRef}
          type="button"
          aria-label={open ? "Close add menu" : "Open add menu"}
          aria-haspopup="menu"
          aria-controls={menuId}
          aria-expanded={open}
          onClick={toggle}
          whileHover={
            reduceMotion
              ? undefined
              : { y: -4, scale: 1.06, rotate: isRTL ? -2 : 2 }
          }
          whileTap={{ scale: 0.98 }}
          transition={
            reduceMotion
              ? { duration: 0.001 }
              : { type: "spring", stiffness: 520, damping: 24 }
          }
          className={`
            group relative grid size-12 place-items-center rounded-full
            bg-accent text-accent-foreground
            border border-accent-border
            cursor-pointer
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring
            focus-visible:ring-offset-2 focus-visible:ring-offset-background
          `}
        >
          {/* Aura */}
          <span
            aria-hidden
            className={`
              pointer-events-none absolute -inset-2 rounded-full
              bg-accent/25 blur-md
              transition-opacity duration-300
              ${open ? "opacity-35" : "opacity-80"}
            `}
          />
          {/* Crisp ring */}
          <span
            aria-hidden
            className={`
              pointer-events-none absolute -inset-1 rounded-full
              ring-2 ring-accent-ring/40
              scale-90
              ${open ? "opacity-0" : "opacity-100"}
              transition-all duration-300
              group-hover:scale-100
            `}
          />

          {/* Plus/X */}
          <m.span
            animate={{ rotate: open ? plusRotate : 0 }}
            transition={
              reduceMotion
                ? { duration: 0.001 }
                : { type: "spring", stiffness: 560, damping: 28 }
            }
            className="relative grid place-items-center"
          >
            <IoIosAdd className="size-7" />
          </m.span>
        </m.button>
      </div>
    </LazyMotion>
  );
}
