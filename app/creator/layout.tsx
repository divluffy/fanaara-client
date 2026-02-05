// app\creator\layout.tsx
import Link from "next/link";
import type { ReactNode } from "react";

export default async function PublicPagesLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div>
      <nav>
        <Link href="/creator/works">works</Link>
        |||
        <Link href="/creator/works/new">new work</Link>
      </nav>
      <br />
      <hr />
      {children}
    </div>
  );
}
