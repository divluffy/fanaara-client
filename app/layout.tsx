// app/layout.tsx
import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { createTranslatedMetadata } from "@/lib/seo";
import { Providers } from "./providers";
import StoreProvider from "./StoreProvider";
import { AppLocale, getDirection } from "@/i18n/config";
import "./globals.css";

// Google Fonts
import { Inter, Nunito_Sans, Noto_Sans_Arabic } from "next/font/google";

// إنجليزي (Inter)
const englishFont = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-latin",
});

// تركي (Nunito Sans) مع دعم latin-ext للتركي
const turkishFont = Nunito_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-latin-ext",
});

// عربي (Noto Sans Arabic)
const arabicFont = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-arabic",
});

// لكل لغة الخط الخاص بها
const fontByLocale: Record<AppLocale, string> = {
  en: "font-latin",
  tr: "font-latin-ext",
  ar: "font-arabic",
};
// خط افتراضي لو رجع locale غير مدعوم
const defaultFontClass = "font-latin";

export async function generateMetadata() {
  return createTranslatedMetadata("landing");
}

type RootLayoutProps = {
  children: ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProps) {
  const locale = (await getLocale()) as AppLocale;
  const messages = await getMessages();

  const dir = getDirection(locale);
  const fontClass = fontByLocale[locale] ?? defaultFontClass;

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      className={`${englishFont.variable} ${turkishFont.variable} ${arabicFont.variable}  app-scroll`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&display=swap"
          rel="stylesheet"
        />
      </head>

      <body
        className={`${fontClass} bg-background text-foreground antialiased`}
        style={{ direction: dir }}
      >
        <StoreProvider initialDirection={dir}>
          <Providers>
            <NextIntlClientProvider messages={messages} locale={locale}>
              {children}
            </NextIntlClientProvider>
          </Providers>
        </StoreProvider>
      </body>
    </html>
  );
}
