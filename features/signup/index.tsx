// features/signup/index.tsx
"use client";

import { cn } from "@/utils";
import { Step01, Step02, Step03, Step04, Step05, Step06 } from "./steps";
import { UserProfileDTO } from "@/types";
import { useSignupStep } from "./hooks/useSignupStep";
import StepCard from "./ui/StepCard";

export default function SignupFeature({
  initialUser,
}: {
  initialUser: UserProfileDTO | null;
}) {
  const { step, next } = useSignupStep(initialUser);

  return (
    <div
      className={cn(
        "relative z-10 mx-auto w-full max-w-md px-4 pb-6",
        "flex flex-col justify-center",
        "min-h-[calc(100dvh-5rem)] md:min-h-[calc(100dvh-6rem)]",
      )}
    >
      <StepCard>
        {step === 1 && <Step01 onSuccess={next} />}
        {step === 2 && <Step02 onSuccess={next} />}
        {step === 3 && <Step03 onSuccess={next} />}
        {step === 4 && <Step04 onSuccess={next} />}
        {step === 5 && <Step05 onSuccess={next} />}
        {step === 6 && <Step06 />}
      </StepCard>
    </div>
  );
}
