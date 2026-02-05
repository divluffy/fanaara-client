"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useFullPath } from "@/hooks/useFullPath";
import { setUser } from "@/store/auth";
import type { UserProfileDTO } from "@/types";

import { useIsPhoneViewport } from "@/hooks/useIsPhoneViewport";
import PhoneLayout from "./components/LoggedShell/PhoneLayout";
import { DesktopLayout } from "./components/LoggedShell/DesktopLayout";

export type LoggedLayoutClientProps = {
  children: ReactNode;
  initialUser?: UserProfileDTO;
  initialIsPhone: boolean;
};

export default function LoggedLayoutClient({
  children,
  initialUser,
  initialIsPhone,
}: LoggedLayoutClientProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const sessionExpired = useAppSelector((s) => s.auth.sessionExpired);
  const fullPath = useFullPath();

  // ✅ Responsive switch based on viewport width (fast & smooth)
  const isPhone = useIsPhoneViewport(initialIsPhone);

  // Save server user into Redux once
  useEffect(() => {
    if (!initialUser) return;
    dispatch(setUser(initialUser));
  }, [dispatch, initialUser]);

  // Redirect when session expires
  useEffect(() => {
    if (!sessionExpired) return;
    router.replace(`/login?redirect=${encodeURIComponent(fullPath)}`);
  }, [sessionExpired, router, fullPath]);

  if (sessionExpired) return null;

  return isPhone ? (
    <PhoneLayout>{children}</PhoneLayout>
  ) : (
    <DesktopLayout>{children}</DesktopLayout>
  );
}
