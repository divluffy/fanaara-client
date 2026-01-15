// i18n/request.ts
import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  type AppLocale,
} from "@/i18n/config";

export default getRequestConfig<AppLocale>(async ({ requestLocale }) => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value as
    | AppLocale
    | undefined;

  let locale: AppLocale;

  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)) {
    // 1) اختيار المستخدم من الكوكي
    locale = cookieLocale;
  } else if (
    requestLocale &&
    SUPPORTED_LOCALES.includes(requestLocale as AppLocale)
  ) {
    // 2) requestLocale من next-intl (لو عندك i18n routing مستقبلاً)
    locale = requestLocale as AppLocale;
  } else {
    // 3) fallback
    locale = DEFAULT_LOCALE;
  }

  const messages = (await import(`../messages/${locale}.json`)).default;

  return {
    locale,
    messages,
  };
});
