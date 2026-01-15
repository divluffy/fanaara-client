// app/api/locale/route.ts
import { NextResponse } from "next/server";
import {
  SUPPORTED_LOCALES,
  LOCALE_COOKIE_NAME,
  type AppLocale,
} from "@/i18n/config";

export async function POST(request: Request) {
  const { locale } = (await request.json()) as { locale?: AppLocale };

  if (!locale || !SUPPORTED_LOCALES.includes(locale)) {
    return NextResponse.json(
      { ok: false, error: "Unsupported locale" },
      { status: 400 }
    );
  }

  const response = NextResponse.json({ ok: true });

  // نخزن اللغة في الكوكي
  response.cookies.set(LOCALE_COOKIE_NAME, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // سنة
  });

  return response;
}
