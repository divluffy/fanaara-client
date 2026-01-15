// app/dashboard/layout.tsx
import type { ReactNode } from "react";

export default async function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: { programId: string };
}) {
  const { programId } = params;

  return (
    <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-4">
      <div className="rounded-xl border p-4">{children}</div>
    </div>
  );
}
