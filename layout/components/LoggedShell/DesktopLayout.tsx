// layout/components/LoggedShell/DesktopLayout.tsx
import type { ReactNode } from "react";
import LoggedAside from "./LoggedAside";
import AddPost from "@/components/AddPost";
import AddPostGate from "./AddPostGate";

type Props = { children: ReactNode };

export function DesktopLayout({ children }: Props) {
  return (
    <div className="min-h-dvh w-full bg-background-elevated">
      <div className="flex w-full">
        {/* ✅ Aside ثابت طول الصفحة */}
        <div className="shrink-0 sticky top-0 h-dvh">
          <LoggedAside />
        </div>

        {/* ✅ الصفحة هي اللي تسكرول */}
        <main className="min-w-0 flex-1">{children}</main>

        <div className="shrink-0 sticky top-0 h-dvh">
          <AddPostGate />
        </div>


      </div>
    </div>
  );
}
