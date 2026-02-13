// features/signup/hooks/useSignupStep.ts
import { useEffect, useState } from "react";
import type { UserProfileDTO } from "@/types";

export function resolveSignupStep(user: UserProfileDTO | null) {
  if (!user) return 1;

  if (user.status === "PENDING") {
    return user.username ? 3 : 2;
  }

  return 1;
}

export function useSignupStep(user: UserProfileDTO | null) {
  const [step, setStep] = useState<number>(() => resolveSignupStep(user));

  useEffect(() => {
    setStep(resolveSignupStep(user));
  }, [user?.status, user?.username]);

  const next = () => setStep((s) => (s < 6 ? s + 1 : s));
  const goTo = (n: number) => setStep(Math.min(6, Math.max(1, n)));

  return { step, next, goTo };
}
