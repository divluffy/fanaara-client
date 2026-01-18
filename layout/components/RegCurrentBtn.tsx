"use client";

import { Button } from "@/design";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  signupHref?: string;
  loginHref?: string;
  className?: string;
};

export default function RegCurrentBtn({
  signupHref = "/signup",
  loginHref = "/login",
  className = "",
}: Props) {
  const pathname = usePathname();
  const t = useTranslations("g");

  const isLoginPage = pathname === "/login"; // adjust if your route differs
  const href = isLoginPage ? signupHref : loginHref;
  const label = isLoginPage ? "sign_up" : "login";

  return (
    <Link
      href={href}
      className={`rounded-md px-3 py-2 text-sm font-medium hover:opacity-90 ${className}`}
    >
      <Button variant="gradient" gradient="ocean">
        {t(label)}
      </Button>
    </Link>
  );
}
