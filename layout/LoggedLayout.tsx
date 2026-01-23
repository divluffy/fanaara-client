// layout/LoggedLayout.tsx
"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { api } from "@/store/api";

import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useFullPath } from "@/hooks/useFullPath";
import { useHideNavbarOnScroll } from "@/hooks/useHideNavbarOnScroll";
import { MQ_DESKTOP } from "@/constants";
import { DesktopLayout, MobileLayout } from "./components";
import { UserProfileDTO } from "@/types";
import { setUser } from "@/store/auth";

export type LoggedLayoutProps = {
  children: ReactNode;
  initialUser?: UserProfileDTO;
};

export default function LoggedLayout({
  children,
  initialUser,
}: LoggedLayoutProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const sessionExpired = useAppSelector((s) => s.auth.sessionExpired);

  const isDesktop = useMediaQuery(MQ_DESKTOP);
  const navHidden = useHideNavbarOnScroll(!isDesktop);

  // ✅ Save server user into Redux once
  useEffect(() => {
    if (!initialUser) return;
    dispatch(setUser(initialUser));
  }, [dispatch, initialUser]);

  // ==== Redirect when session expires ====
  const fullPath = useFullPath();

  useEffect(() => {
    if (!sessionExpired) return;
    router.replace(`/login?redirect=${encodeURIComponent(fullPath)}`);
  }, [sessionExpired, router, fullPath]);

  // منع عرض أي شيء أثناء التحويل
  if (sessionExpired) return null;

  return isDesktop ? (
    <DesktopLayout>{children}</DesktopLayout>
  ) : (
    <MobileLayout navHidden={navHidden}>{children}</MobileLayout>
  );
}
