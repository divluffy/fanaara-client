// layout/PublicLayout.tsx
import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
import { cn } from "@/utils";
import { getTranslations } from "next-intl/server";
import ClientNavActions from "./components/ClientNavActions";

const AUTH_BG = "https://picfiles.alphacoders.com/573/thumb-1920-573235.jpg";

export default async function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  const t = await getTranslations("g");

  return (
    <div
      className={cn(
        "relative w-full",
        "min-h-screen supports-[height:100dvh]:min-h-dvh",
        "overflow-x-hidden",
      )}
    >
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <Image
          src={AUTH_BG}
          alt="Auth background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/60 md:bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />
      </div>

      <nav className={cn("fixed top-4 z-20 w-full px-4")}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2">
            <Image alt="logo" src="/logo/logo.png" width={30} height={30} />
            <h3 className="text-xl font-semibold text-white drop-shadow">
              {t("platform_name")}
            </h3>
          </Link>

          <ClientNavActions />
        </div>
      </nav>

      <main className="pt-20 md:pt-24">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
