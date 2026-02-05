import type { AppLocale } from "@/i18n/config";

export type LocaleMeta = {
  code: AppLocale;
  label: string;       // native name
  shortLabel: string;  // EN / AR / TR
  flag: string;        // emoji flag
  dir: "ltr" | "rtl";
};

// ✅ One place to edit when you add languages later
export const LOCALE_META = {
  en: { code: "en", label: "English", shortLabel: "EN", flag: "🇺🇸", dir: "ltr" },
  ar: { code: "ar", label: "العربية", shortLabel: "AR", flag: "🇸🇦", dir: "rtl" },
  tr: { code: "tr", label: "Türkçe", shortLabel: "TR", flag: "🇹🇷", dir: "ltr" },
} as const satisfies Record<AppLocale, LocaleMeta>;

export const SUPPORTED_LOCALES = Object.values(LOCALE_META) as LocaleMeta[];

export function getLocaleMeta(locale: AppLocale): LocaleMeta {
  return LOCALE_META[locale] ?? SUPPORTED_LOCALES[0]!;
}

export function getLocaleFlag(locale: AppLocale): string {
  return getLocaleMeta(locale).flag;
}

export function getLocaleShortLabel(locale: AppLocale): string {
  return getLocaleMeta(locale).shortLabel;
}
