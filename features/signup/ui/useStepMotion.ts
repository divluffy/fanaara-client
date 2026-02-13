// features/signup/ui/useStepMotion.ts
import { useMemo } from "react";
import { useReducedMotion } from "framer-motion";

export function useStepMotion() {
  const reduceMotion = useReducedMotion();

  const spring = useMemo(
    () =>
      reduceMotion
        ? { duration: 0 }
        : { type: "spring", stiffness: 340, damping: 30, mass: 0.6 },
    [reduceMotion],
  );

  const v = useMemo(() => {
    const y = (n: number) => (reduceMotion ? 0 : n);
    const x = (n: number) => (reduceMotion ? 0 : n);
    const s = (n: number) => (reduceMotion ? 1 : n);

    const micro = (
      inY: number,
      outY: number,
      inDur: number,
      outDur: number,
    ) => ({
      initial: { opacity: 0, y: y(inY) },
      animate: {
        opacity: 1,
        y: 0,
        transition: reduceMotion ? { duration: 0 } : { duration: inDur },
      },
      exit: {
        opacity: 0,
        y: y(outY),
        transition: reduceMotion ? { duration: 0 } : { duration: outDur },
      },
    });

    return {
      container: {
        hidden: {},
        show: {
          transition: reduceMotion
            ? { staggerChildren: 0 }
            : { staggerChildren: 0.075, delayChildren: 0.03 },
        },
      },
      header: {
        hidden: { opacity: 0, y: y(-12) },
        show: { opacity: 1, y: 0, transition: spring },
      },
      fieldUp: {
        hidden: { opacity: 0, y: y(14), scale: s(0.99) },
        show: { opacity: 1, y: 0, scale: 1, transition: spring },
      },
      fieldLeft: {
        hidden: { opacity: 0, x: x(-16), scale: s(0.99) },
        show: { opacity: 1, x: 0, scale: 1, transition: spring },
      },
      fieldRight: {
        hidden: { opacity: 0, x: x(16), scale: s(0.99) },
        show: { opacity: 1, x: 0, scale: 1, transition: spring },
      },
      scaleIn: {
        hidden: { opacity: 0, scale: s(0.965) },
        show: { opacity: 1, scale: 1, transition: spring },
      },
      cta: {
        hidden: { opacity: 0, y: y(10), scale: s(0.985) },
        show: { opacity: 1, y: 0, scale: 1, transition: spring },
      },
      microMsg: micro(-3, 3, 0.18, 0.12),
      microErr: micro(-4, 4, 0.16, 0.12),
    };
  }, [reduceMotion, spring]);

  return { reduceMotion, v };
}
