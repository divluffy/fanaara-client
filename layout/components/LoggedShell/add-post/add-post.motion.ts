// layout/components/add-post/add-post.motion.ts
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

  const itemVariants: Variants = {
    open: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: reduceMotion
        ? { duration: 0.001 }
        : { type: "spring", stiffness: 760, damping: 40, mass: 0.9 },
    },
    closed: (x: number) => ({
      opacity: 0,
      y: 12,
      x,
      scale: 0.965,
      filter: "blur(2.5px)",
      transition: reduceMotion
        ? { duration: 0.001 }
        : { duration: 0.18, ease: [0.2, 0.9, 0.2, 1] },
    }),
  };

  const backdropVariants: Variants = {
    open: { opacity: 1, transition: { duration: reduceMotion ? 0.001 : 0.18 } },
    closed: {
      opacity: 0,
      transition: { duration: reduceMotion ? 0.001 : 0.14 },
    },
  };

  return { containerVariants, itemVariants, backdropVariants };
}
