// features/signup/ui/StepCard.tsx
import type { ReactNode } from "react";

export default function StepCard({ children }: { children: ReactNode }) {
  return (
    <section className="bg-background relative w-full max-w-[460px] rounded-3xl border border-border-subtle/70 px-4 py-5 sm:px-6 sm:py-6">
      {children}
    </section>
  );
}
