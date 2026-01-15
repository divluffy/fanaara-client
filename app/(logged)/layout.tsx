// app/(logged)/layout.tsx
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { serverMe, serverCurrentPath } from "@/lib/server-auth";
import { LoggedLayout } from "@/layout";

export default async function MainLayout({
  children,
}: {
  children: ReactNode;
}) {
  const me = await serverMe();

  if (!me?.user) {
    const path = await serverCurrentPath();
    redirect(`/login?redirect=${encodeURIComponent(path)}`);
  }

  return <LoggedLayout initialUser={me.user}>{children}</LoggedLayout>;
}
