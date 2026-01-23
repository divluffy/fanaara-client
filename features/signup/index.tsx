// features/signup/index.tsx
"use client";

import { useEffect, useState } from "react";
import { cn } from "@/utils";
import Step01 from "./steps/step01";
import Step02 from "./steps/step02";
import Step03 from "./steps/step03";
import Step04 from "./steps/step04";
import Step05 from "./steps/step05";
import Step06 from "./steps/step06";
import { UserProfileDTO } from "@/types";

function resolveStep(user: UserProfileDTO | null) {
  if (!user) return 1;

  if (user.status === "PENDING") {
    return user.username ? 3 : 2;
  }

  return 1;
}

export default function SignupFeature({
  initialUser,
}: {
  initialUser: UserProfileDTO | null;
}) {
  // ✅ هذا يشتغل قبل أول رندر (حتى على السيرفر) => ما في فلاش
  const [step, setStep] = useState<number>(() => resolveStep(initialUser));

  // اختياري: لو initialUser ممكن يتغيّر لاحقًا (refetch) حدّث الستيب
  useEffect(() => {
    setStep(resolveStep(initialUser));
    // setStep(3);
  }, [initialUser?.status, initialUser?.username]);

  return (
    <div
      className={cn(
        "relative z-10 mx-auto w-full max-w-md px-4 pb-6",
        "flex flex-col justify-center",
        "min-h-[calc(100dvh-5rem)] md:min-h-[calc(100dvh-6rem)]",
      )}
    >
      <main
        className={cn(
          "bg-background",
          "relative w-full max-w-[460px] rounded-3xl",
          "border border-border-subtle/70",
          "px-4 py-5 sm:px-6 sm:py-6",
        )}
      >
        {step === 1 && <Step01 onSuccess={() => setStep(2)} />}
        {step === 2 && <Step02 onSuccess={() => setStep(3)} />}
        {step === 3 && <Step03 onSuccess={() => setStep(4)} />}
        {step === 4 && <Step04 onSuccess={() => setStep(5)} />}
        {step === 5 && <Step05 onSuccess={() => setStep(6)} />}
        {step === 6 && <Step06 />}
      </main>
    </div>
  );
}
