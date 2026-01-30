// layout\components\LoggedShell\DesktopLayout.tsx
import type { ReactNode } from "react";

import LoggedAside from "./LoggedAside";
import AddPost from "./AddPost";

type Props = { children: ReactNode };

export function DesktopLayout({ children }: Props) {
  return (
    <div className="min-h-screen w-full bg-background-elevated">
      <div className="flex w-full">
        <aside className="shrink-0 md:sticky md:top-0 md:h-[100dvh]">
          <LoggedAside />
        </aside>

        <main className="min-w-0 flex-1">{children}</main>

        <div className="shrink-0 md:sticky md:top-0 md:h-[100dvh]">
          <AddPost />
        </div>
      </div>
    </div>
  );
}
