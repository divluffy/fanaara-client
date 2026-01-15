// layout\PublicLayout.tsx
"use client";

import { LanguageMenuToggle, ThemeToggle } from "@/components";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
import RegCurrentBtn from "./components/RegCurrentBtn";
import { cn } from "@/utils";
import { usePathname } from "next/navigation";

const AUTH_BG = "https://picfiles.alphacoders.com/573/thumb-1920-573235.jpg";

const PublicLayout = ({ children }: { children: ReactNode }) => {
  const t = useTranslations("g");
  const pathname = usePathname();

  const isAuthPage =
    pathname === "/signup" ||
    pathname?.startsWith("/signup/") ||
    pathname === "/login" ||
    pathname?.startsWith("/login/");

  return (
    <div className="min-h-screen">
      {/* Auth-only background (fixed, fills viewport always) */}
      {isAuthPage && (
        <div className="pointer-events-none fixed inset-0 -z-10">
          <Image
            src={AUTH_BG}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {/* Blur + dim overlay */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
        </div>
      )}

      <nav
        className={cn(
          "fixed top-4 z-20 w-full",
          "flex items-center justify-between gap-3 px-4"
        )}
      >
        <Link href="/" className="flex gap-2 items-center">
          <Image alt="logo" src="/logo/logo.png" width={30} height={30} />
          <h3 className="font-semibold text-xl text-white">
            {t("platform_name")}
          </h3>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageMenuToggle />
          <RegCurrentBtn />
        </div>
      </nav>

      {/* content */}
      <div className="pt-20 md:pt-24">{children}</div>
    </div>
  );
};

export default PublicLayout;
