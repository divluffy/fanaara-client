// app/dashboard/influencer/layout.client.tsx
"use client";

import { useProgramAccessQuery } from "@/redux/api";

export default function DashboardProgramLayoutClient({
  children,
  program,
}: {
  children: React.ReactNode;
  program: "influencer" | "producer" | "indie";
}) {
  const { data, isLoading } = useProgramAccessQuery({ program });

  if (isLoading) return <div>Loading...</div>;

  // ✅ منع الدخول لو ليس عضو/ليس عنده دور
  if (!data?.isMember) return <div>403 - لا تملك صلاحية دخول هذا البرنامج</div>;

  // ✅ بعدها تعرض Sidebar حسب roles/permissions
  return (
    <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-4">
      {/* Sidebar program-specific */}
      <aside className="rounded-xl border p-3">Sidebar {program}</aside>
      <div className="rounded-xl border p-4">{children}</div>
    </div>
  );
}
