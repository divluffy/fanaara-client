// hooks\useEmailDomainBlocklist.ts
"use client";

import { extractEmailDomain, isBlockedEmail } from "@/utils";
import { useCallback } from "react";

export function useEmailDomainBlocklist() {
  const getDomain = useCallback(
    (email: string) => extractEmailDomain(email),
    [],
  );
  const isBlocked = useCallback((email: string) => isBlockedEmail(email), []);

  return { getDomain, isBlocked };
}
