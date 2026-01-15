// i18n/config.ts
export const SUPPORTED_LOCALES = ["en", "ar", "tr"] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = "en";
// أي لغة RTL
export const RTL_LOCALES: AppLocale[] = ["ar"];

export type Directions = "ltr" | "rtl";

// اسم الكوكي اللي نستخدمه مع /api/locale و i18n/request.ts
export const LOCALE_COOKIE_NAME = "fanara_lang_detect_locale";

export function getDirection(locale: AppLocale): Directions {
  return RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
}
