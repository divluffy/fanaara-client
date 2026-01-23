// app/(logged)/workspace/layout.tsx
import type { ReactNode } from "react";
import { requireUser } from "@/lib/guards";

export default async function WorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireUser({ roles: ["CREATOR", "ADMIN"] });
  return <>{children}</>;
}
