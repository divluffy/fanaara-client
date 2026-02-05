// layout/LoggedLayout.tsx (SERVER)
import type { ReactNode } from "react";
import { headers } from "next/headers";

import type { UserProfileDTO } from "@/types";
import { isPhoneDevice } from "@/lib/device";

import LoggedLayoutClient from "./LoggedLayoutClient";

export type LoggedLayoutProps = {
  children: ReactNode;
  initialUser?: UserProfileDTO;
};

export default async function LoggedLayout({
  children,
  initialUser,
}: LoggedLayoutProps) {
  const headersList = await headers();
  const initialIsPhone = isPhoneDevice(headersList);

  return (
    <LoggedLayoutClient
      initialUser={initialUser}
      initialIsPhone={initialIsPhone}
    >
      {children}
    </LoggedLayoutClient>
  );
}
