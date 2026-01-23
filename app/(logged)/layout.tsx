// app/(logged)/layout.tsx
import type { ReactNode } from "react";
import { LoggedLayout } from "@/layout";
import { requireUser } from "@/lib/guards";

export default async function MainLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireUser(); // ✅ يمنع guest + يمنع pending
  return <LoggedLayout initialUser={user}>{children}</LoggedLayout>;
}
