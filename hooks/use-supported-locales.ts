"use client";

import { useMemo } from "react";
import { useLocale } from "next-intl";
import type { AppLocale } from "@/i18n/config";
import { getLocaleMeta, SUPPORTED_LOCALES } from "@/i18n/locale-meta";

export function useSupportedLocales() {
  const locale = useLocale() as AppLocale;

  const activeLocale = useMemo(() => getLocaleMeta(locale), [locale]);

  return {
    locale,
    activeLocale,
    locales: SUPPORTED_LOCALES,
  };
}
