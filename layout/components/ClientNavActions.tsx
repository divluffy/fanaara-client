"use client";

import { LanguageMenuToggle, ThemeToggle } from "@/components";
import RegCurrentBtn from "./RegCurrentBtn";

export default function ClientNavActions() {
  return (
    <div className="flex items-center gap-2">
      <ThemeToggle />
      <LanguageMenuToggle />
      <RegCurrentBtn />
    </div>
  );
}
