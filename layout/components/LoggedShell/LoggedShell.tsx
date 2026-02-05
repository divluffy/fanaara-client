// layout/components/LoggedShell/LoggedShell.tsx (SERVER)
import type { ReactNode } from "react";

import MobileTopBar from "./MobileTopBar";
import MobileBottomNav from "./MobileBottomNav";
import DesktopSidebar from "./DesktopSidebar";
import DesktopRightRail from "./DesktopRightRail";

export default function LoggedShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      {/* MOBILE CHROME */}
      <header className="fixed inset-x-0 top-0 z-50 lg:hidden">
        <MobileTopBar />
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-50 lg:hidden">
        <MobileBottomNav />
      </nav>

      {/* LAYOUT GRID */}
      <div className="lg:grid lg:min-h-screen lg:grid-cols-[260px_minmax(0,1fr)_320px]">
        {/* DESKTOP LEFT */}
        <aside className="hidden lg:block lg:sticky lg:top-0 lg:h-screen">
          <DesktopSidebar />
        </aside>

        {/* CONTENT (مرة واحدة فقط) */}
        <main className="pt-14 pb-16 lg:pt-0 lg:pb-0">{children}</main>

        {/* DESKTOP RIGHT */}
        <aside className="hidden lg:block lg:sticky lg:top-0 lg:h-screen">
          <DesktopRightRail />
        </aside>
      </div>
    </div>
  );
}
