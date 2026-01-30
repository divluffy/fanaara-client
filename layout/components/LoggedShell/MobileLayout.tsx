// layout\components\LoggedShell\MobileLayout.tsx
import type { ReactNode } from "react";

import NavbarPhone from "./NavbarPhone";
import FooterPhone from "./FooterPhone";

import { MOBILE_FOOTER_H, MOBILE_NAV_H } from "@/constants";

type CSSVars = React.CSSProperties & { [key: `--${string}`]: string };

type Props = {
  children: ReactNode;
  navHidden: boolean;
};

export function MobileLayout({ children, navHidden }: Props) {
  const style: CSSVars = {
    "--mobile-nav-h": `${MOBILE_NAV_H}px`,
    "--mobile-footer-h": `${MOBILE_FOOTER_H}px`,
  };

  return (
    <div className="min-h-[100dvh] w-full bg-background-elevated" style={style}>
      {/* Navbar */}
      <div
        className={[
          "fixed left-0 right-0 top-0 z-50",
          "pt-[env(safe-area-inset-top)]",
          "transform-gpu will-change-transform",
          "transition-transform duration-300 ease-out motion-reduce:transition-none",
          navHidden ? "-translate-y-full" : "translate-y-0",
        ].join(" ")}
      >
        <div className="h-[var(--mobile-nav-h)] border-b border-border/60 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
          <NavbarPhone />
        </div>
      </div>

      {/* Main */}
      <main className="min-h-[100dvh] w-full pt-[calc(var(--mobile-nav-h)+env(safe-area-inset-top))] pb-[calc(var(--mobile-footer-h)+env(safe-area-inset-bottom))]">
        {children}
      </main>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)]">
        <div className="h-[var(--mobile-footer-h)] border-t border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
          <FooterPhone />
        </div>
      </div>
    </div>
  );
}
