import type { Variants } from "framer-motion";

export function getFabMenuVariants(reduceMotion: boolean) {
  const containerVariants: Variants = {
    open: {
      transition: reduceMotion
        ? { duration: 0.001 }
        : { staggerChildren: 0.085, delayChildren: 0.03 },
    },
    closed: {
      transition: reduceMotion
        ? { duration: 0.001 }
        : { staggerChildren: 0.06, staggerDirection: -1 },
    },
  };

  // ✅ Perf: transform + opacity فقط (بدون filter blur)
  const itemVariants: Variants = {
    open: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: reduceMotion
        ? { duration: 0.001 }
        : { type: "spring", stiffness: 760, damping: 42, mass: 0.9 },
    },
    closed: (x: number) => ({
      opacity: 0,
      y: 14,
      x,
      scale: 0.98,
      transition: reduceMotion
        ? { duration: 0.001 }
        : { duration: 0.16, ease: [0.2, 0.9, 0.2, 1] },
    }),
  };

  const backdropVariants: Variants = {
    open: { opacity: 1, transition: { duration: reduceMotion ? 0.001 : 0.16 } },
    closed: {
      opacity: 0,
      transition: { duration: reduceMotion ? 0.001 : 0.12 },
    },
  };

  return { containerVariants, itemVariants, backdropVariants };
}
