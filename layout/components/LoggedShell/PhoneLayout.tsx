// layout/components/LoggedShell/PhoneLayout.tsx
"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";
import { MOBILE_FOOTER_H, MOBILE_NAV_H } from "@/constants";
import { useHideBarsOnScroll } from "@/hooks/useHideBarsOnScroll";
import NavbarPhone from "./NavbarPhone";
import FooterPhone from "./FooterPhone";
import MobileMenuDrawer from "./MobileMenuDrawer";

type CSSVars = CSSProperties & { [key: `--${string}`]: string };

type ChromeMode = "hidden" | "fixed" | "scroll";
function resolvePhoneChrome(pathname: string): {
  header: ChromeMode;
  footer: ChromeMode;
} {
  if (pathname === "/profile" || pathname.startsWith("/profile/")) {
    return { header: "hidden", footer: "hidden" };
  }
  if (pathname === "/search" || pathname.startsWith("/search/")) {
    return { header: "hidden", footer: "fixed" };
  }
  return { header: "scroll", footer: "scroll" };
}

export default function PhoneLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [pathname]);

  const chrome = resolvePhoneChrome(pathname);
  const anyScrollMode =
    chrome.header === "scroll" || chrome.footer === "scroll";

  const hiddenRaw = useHideBarsOnScroll({
    enabled: anyScrollMode && !menuOpen,
    threshold: 14,
    minY: MOBILE_NAV_H + 24,
    resetKey: pathname,
  });

  // ✅ visibility based on route rules
  const headerVisible =
    chrome.header === "hidden"
      ? false
      : chrome.header === "fixed"
        ? true
        : !hiddenRaw;

  const footerVisible =
    chrome.footer === "hidden"
      ? false
      : chrome.footer === "fixed"
        ? true
        : !hiddenRaw;

  // ✅ dynamic padding to remove blank space when hidden
  const style: CSSVars = useMemo(
    () => ({
      "--phone-nav-h": `${MOBILE_NAV_H}px`,
      "--phone-footer-h": `${MOBILE_FOOTER_H}px`,
      "--top-inset": headerVisible ? `${MOBILE_NAV_H}px` : "0px",
      "--bottom-inset": footerVisible ? `${MOBILE_FOOTER_H}px` : "0px",
    }),
    [headerVisible, footerVisible],
  );

  return (
    <div className="min-h-[100dvh] w-full bg-background-elevated" style={style}>
      {/* Header */}
      {chrome.header !== "hidden" && (
        <div
          className={cn(
            "fixed left-0 right-0 top-0 z-50 pt-[env(safe-area-inset-top)]",
            "transform-gpu will-change-transform transition-transform duration-300",
            headerVisible ? "translate-y-0" : "-translate-y-full",
          )}
        >
          <div className="h-[var(--phone-nav-h)] border-b border-border/60 bg-background/90 backdrop-blur">
            <NavbarPhone />
          </div>
        </div>
      )}

      {/* Main — ✅ padding depends on header/footer visibility */}
      <main
        className="
          w-full
          pt-[calc(var(--top-inset)+env(safe-area-inset-top))]
          pb-[calc(var(--bottom-inset)+env(safe-area-inset-bottom))]
        "
      >
        {children}
      </main>

      {/* Footer */}
      {chrome.footer !== "hidden" && (
        <div
          className={cn(
            "fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)]",
            "transform-gpu will-change-transform transition-transform duration-300",
            footerVisible ? "translate-y-0" : "translate-y-full",
          )}
        >
          <div className="h-[var(--phone-footer-h)] border-t border-border/60 bg-background/95 backdrop-blur">
            <FooterPhone onOpenMenu={() => setMenuOpen(true)} />
          </div>
        </div>
      )}

      <MobileMenuDrawer open={menuOpen} onOpenChange={setMenuOpen} />
    </div>
  );
}
