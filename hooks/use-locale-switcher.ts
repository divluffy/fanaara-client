"use client";

import { useCallback, useTransition } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import type { AppLocale } from "@/i18n/config";
import { persistLocalePreference } from "@/lib/locale-client";

export function useLocaleSwitcher() {
  const router = useRouter();
  const currentLocale = useLocale() as AppLocale;
  const [isSwitching, startTransition] = useTransition();

  const switchLocale = useCallback(
    (nextLocale: AppLocale) => {
      if (isSwitching) return;
      if (nextLocale === currentLocale) return;

      startTransition(() => {
        void persistLocalePreference(nextLocale)
          .then(() => router.refresh())
          .catch((err) => {
            // Optional: plug into your toast system
            console.error("[locale] switch failed:", err);
          });
      });
    },
    [currentLocale, isSwitching, router],
  );

  return { currentLocale, isSwitching, switchLocale };
}
