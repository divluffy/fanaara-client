// app\(public)\layout.tsx
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { serverMe } from "@/lib/server-auth";
import { PublicLayout } from "@/layout";
import { AUTH_COOKIE } from "@/config";

export default async function PublicPagesLayout({
  children,
}: {
  children: ReactNode;
}) {
  console.log("auth from public layout");

  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  console.log("token: ", token);
  console.log("auth from public layout >>> 1");

  if (!token) return <PublicLayout>{children}</PublicLayout>;
  console.log("auth from public layout >>> 2");

  // تحقق فعلي من الجلسة
  const me = await serverMe();
  console.log("auth from public layout >>> 3");

  if (me?.user?.status === "PENDING") {
    redirect("/signup");
  }

  if (me?.user) {
    redirect("/");
  }
  console.log("auth from public layout >>> 4");

  return <PublicLayout>{children}</PublicLayout>;
}
