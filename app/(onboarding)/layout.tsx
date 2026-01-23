// app/(onboarding)/layout.tsx
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { serverMe } from "@/lib/server-auth";
import { PublicLayout } from "@/layout";

export default async function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  const me = await serverMe();

  // ✅ لو مكتمل التسجيل لا تسمح بدخول /signup
  if (me?.user && me.user.status !== "PENDING") redirect("/");

  return <PublicLayout>{children}</PublicLayout>;
}
