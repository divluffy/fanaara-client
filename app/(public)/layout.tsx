// app/(public)/layout.tsx
import type { ReactNode } from "react";
import { PublicLayout } from "@/layout";
import { redirectIfAuthed } from "@/lib/guards";

export default async function PublicPagesLayout({
  children,
}: {
  children: ReactNode;
}) {
  await redirectIfAuthed();
  return <PublicLayout>{children}</PublicLayout>;
}
