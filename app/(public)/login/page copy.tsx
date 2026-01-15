// app/(public)/login/page.tsx
import { redirect } from "next/navigation";
import { createTranslatedMetadata } from "@/lib/seo";
import Image from "next/image";
import { LanguageMenuToggle } from "@/components";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ThemeToggle } from "@/components";
import { LoginForm } from "./login-form";
import { serverMe } from "@/lib/server-auth";

export async function generateMetadata() {
  return createTranslatedMetadata("login");
}

export default async function LoginPage() {
  const t = await getTranslations("g");

  const user = await serverMe();
  if (user) redirect("/");

  return (
    <main className="relative min-h-screen text-foreground">
      {/* خلفية الأنمي الثابتة لكل الصفحات داخل (public) */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <Image
          src="/images/login_bg.png"
          alt="Fanara anime & manga background"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* طبقة تعتيم فوق الخلفية */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      </div>

      {/* الهيدر (نافبار) فوق الخلفية بدون أي خلفية خاصة به */}
      <nav className="fixed inset-x-0 top-0 z-40 mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        {/* الشعار + الاسم = رابط للصفحة الرئيسية */}
        <Link
          href="/"
          className="flex items-center gap-4 rounded-full  px-4 py-2 backdrop-blur-md transition hover:bg-black/50"
        >
          <Image
            src="/images/logo.png"
            alt="Fanara logo"
            width={22}
            height={22}
            priority
            className="h-7 w-7 rounded-full object-cover"
          />
          <span className="text-xl font-semibold tracking-wide text-slate-50">
            {t("platform_name")}
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageMenuToggle />

          <div className="ml-2 flex items-center gap-2 text-sm">
            <Link
              href="/signup"
              className={`
                relative inline-flex items-center justify-center rounded-full 
                bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 px-5 py-2 text-sm 
                font-semibold text-white shadow-[0_0_24px_rgba(236,72,153,0.7)]
                transition-transform transition-shadow hover:scale-[1.04] 
                hover:shadow-[0_0_34px_rgba(236,72,153,0.9)] focus-visible:outline-none focus-visible:ring-2 
                focus-visible:ring-pink-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
              `}
            >
              {t("sign_up")}
            </Link>
          </div>
        </div>
      </nav>

      <div className="relative z-10 flex min-h-screen flex-col">
        <div className="flex flex-1 items-center justify-center px-4 pb-10 pt-24">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
