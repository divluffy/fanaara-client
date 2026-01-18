// app/workspace/page.tsx
"use client";

import Link from "next/link";
import React from "react";

import { useMeQuery, useMyWorkspaceApplicationsQuery } from "@/store/api";
import { ProgramSlug } from "@/lib/programs";

type AppStatus = "PENDING" | "APPROVED" | "REJECTED";

type MyWorkspaceApplication = {
  id: string;
  workspaceType: ProgramSlug;
  status: AppStatus;
  workspaceId: string | null;
  createdAt: string;
  updatedAt: string;
  reviewNote?: string | null;
  payload?: {
    displayName?: string;
    contactEmail?: string;
  };
};

function programLabel(p: ProgramSlug) {
  if (p === "influencer") return "Influencer Program";
  if (p === "producer") return "Producer Program";
  return "Indie Creator Program";
}

function statusLabel(s: AppStatus) {
  if (s === "APPROVED") return "مقبول";
  if (s === "REJECTED") return "مرفوض";
  return "قيد المراجعة";
}

function statusBadgeClass(s: AppStatus) {
  if (s === "APPROVED")
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
  if (s === "REJECTED") return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
  return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
}

function formatDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("ar", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border bg-white p-4 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-2">
          <div className="h-6 w-40 animate-pulse rounded bg-neutral-200" />
          <div className="h-4 w-64 animate-pulse rounded bg-neutral-200" />
        </div>
        <div className="h-10 w-28 animate-pulse rounded-xl bg-neutral-200" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <div className="h-5 w-44 animate-pulse rounded bg-neutral-200" />
                <div className="h-4 w-32 animate-pulse rounded bg-neutral-200" />
              </div>
              <div className="h-6 w-20 animate-pulse rounded-full bg-neutral-200" />
            </div>
            <div className="mt-4 h-9 w-28 animate-pulse rounded-xl bg-neutral-200" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ✅ محاولة “ذكية” لاستخراج مساحات العمل من meData مهما كان شكلها
function extractMyWorkspaces(meData: any) {
  const raw =
    meData?.workspaces ??
    meData?.memberships ??
    meData?.roles ??
    meData?.data?.workspaces ??
    meData?.data?.memberships ??
    [];

  if (!Array.isArray(raw)) return [];

  return raw
    .map((item: any) => {
      const ws = item?.workspace ?? item; // memberships: {workspace, role} أو workspaces: {id,...}
      if (!ws?.id) return null;

      const name =
        ws?.name ?? ws?.title ?? ws?.displayName ?? ws?.slug ?? "Workspace";
      const type = ws?.type ?? ws?.workspaceType ?? ws?.workspace_kind ?? "";
      const role =
        item?.role ??
        item?.accessRole ??
        item?.permission ??
        (ws?.ownerId ? "OWNER" : "MEMBER");

      return {
        id: ws.id as string,
        name: String(name),
        type: type ? String(type) : "",
        role: String(role),
      };
    })
    .filter(Boolean) as Array<{
    id: string;
    name: string;
    type: string;
    role: string;
  }>;
}

function roleLabel(role: string) {
  const r = role.toUpperCase();
  if (r.includes("OWNER")) return "مالك";
  if (r.includes("ADMIN")) return "أدمن";
  if (r.includes("MOD")) return "مشرف";
  return "عضو";
}

function roleBadgeClass(role: string) {
  const r = role.toUpperCase();
  if (r.includes("OWNER")) return "bg-neutral-900 text-white";
  if (r.includes("ADMIN"))
    return "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200";
  if (r.includes("MOD")) return "bg-sky-50 text-sky-700 ring-1 ring-sky-200";
  return "bg-neutral-50 text-neutral-700 ring-1 ring-neutral-200";
}

export default function DashboardPage() {
  const { data: meData, isLoading: meLoading } = useMeQuery();
  const {
    data: myAppsRaw,
    isLoading: appsLoading,
    isError,
  } = useMyWorkspaceApplicationsQuery();

  const myApps = (myAppsRaw ?? []) as MyWorkspaceApplication[];

  const approved = myApps.filter((a) => a.status === "APPROVED");
  const pending = myApps.filter((a) => a.status === "PENDING");
  const rejected = myApps.filter((a) => a.status === "REJECTED");

  const myWorkspaces = extractMyWorkspaces(meData);

  if (meLoading || appsLoading) return <Skeleton />;

  if (isError) {
    return (
      <div className="p-6 space-y-3">
        <div className="font-semibold">تعذر تحميل البيانات</div>
        <div className="text-sm text-neutral-600">
          جرّب تفتح صفحة البرامج أو حدّث الصفحة.
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            className="rounded-xl bg-neutral-900 px-4 py-2 text-sm text-white"
            href="/dashboard/programs"
          >
            الذهاب لصفحة البرامج
          </Link>
          <Link
            className="rounded-xl border px-4 py-2 text-sm hover:bg-neutral-50"
            href="/dashboard/access"
          >
            عرض أدواري وصلاحياتي
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">لوحة التحكم</h1>
          <p className="text-sm text-neutral-600">
            أهلاً {meData?.user?.username ?? "👋"} — خلّينا نرتّب شغلك.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/programs"
            className="rounded-xl bg-neutral-900 px-4 py-2 text-sm text-white"
          >
            انضم لبرنامج
          </Link>

          <Link
            href="/dashboard/access"
            className="rounded-xl border px-4 py-2 text-sm hover:bg-neutral-50"
          >
            أدواري وصلاحياتي
          </Link>
        </div>
      </div>

      {/* Section: Workspaces / Roles */}
      <div className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">مساحات العمل</h2>
            <p className="text-sm text-neutral-600">
              المساحات التي لديك فيها دور (مالك/أدمن/مشرف…).
            </p>
          </div>
        </div>

        {myWorkspaces.length === 0 ? (
          <Card className="flex flex-col gap-2">
            <div className="font-medium">لا توجد مساحات عمل بعد</div>
            <div className="text-sm text-neutral-600">
              أول مساحة عمل تظهر هنا بعد قبولك في برنامج أو بعد إنشاء مساحة.
            </div>
            <div className="pt-2">
              <Link
                href="/dashboard/programs"
                className="inline-flex rounded-xl bg-neutral-900 px-4 py-2 text-sm text-white"
              >
                استعرض البرامج
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {myWorkspaces.map((ws) => (
              <Card key={ws.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{ws.name}</div>
                    <div className="mt-1 text-sm text-neutral-600">
                      {ws.type ? `النوع: ${ws.type}` : "نوع غير محدد"}
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs ${roleBadgeClass(
                      ws.role
                    )}`}
                  >
                    {roleLabel(ws.role)}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    // ✅ عدل هذا لو مسارك مختلف
                    href={`/dashboard/workspaces/${ws.id}`}
                    className="rounded-xl border px-3 py-2 text-sm hover:bg-neutral-50"
                  >
                    فتح المساحة
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Section: Program Applications */}
      <div className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">برامجي وطلبات الانضمام</h2>
            <p className="text-sm text-neutral-600">
              متابعة حالة طلباتك (مقبول/قيد المراجعة/مرفوض).
            </p>
          </div>

          <div className="text-sm text-neutral-600">{myApps.length} إجمالي</div>
        </div>

        {myApps.length === 0 ? (
          <Card className="flex flex-col gap-2">
            <div className="font-medium">ما عندك أي طلبات انضمام</div>
            <div className="text-sm text-neutral-600">
              ابدأ بالانضمام لبرنامج مناسب، وبعد القبول راح تظهر مساحة العمل.
            </div>
            <div className="pt-2">
              <Link
                href="/dashboard/programs"
                className="inline-flex rounded-xl bg-neutral-900 px-4 py-2 text-sm text-white"
              >
                انضم الآن
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {myApps
              .slice()
              .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
              .map((app) => {
                const title = programLabel(app.workspaceType);
                const created = formatDate(app.createdAt);
                const canOpenWorkspace =
                  app.status === "APPROVED" && !!app.workspaceId;

                return (
                  <Card key={app.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate font-semibold">{title}</div>
                        <div className="mt-1 text-sm text-neutral-600">
                          {created ? `تاريخ الطلب: ${created}` : "—"}
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs ${statusBadgeClass(
                          app.status
                        )}`}
                      >
                        {statusLabel(app.status)}
                      </span>
                    </div>

                    {app.status === "REJECTED" && app.reviewNote ? (
                      <div className="mt-3 rounded-xl bg-neutral-50 p-3 text-sm text-neutral-700">
                        <div className="font-medium">ملاحظة المراجعة</div>
                        <div className="mt-1">{app.reviewNote}</div>
                      </div>
                    ) : null}

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        href="/dashboard/programs"
                        className="rounded-xl border px-3 py-2 text-sm hover:bg-neutral-50"
                      >
                        عرض البرامج
                      </Link>

                      {canOpenWorkspace ? (
                        <Link
                          // ✅ عدل هذا لو مسارك مختلف
                          href={`/dashboard/workspaces/${app.workspaceId}`}
                          className="rounded-xl bg-neutral-900 px-3 py-2 text-sm text-white"
                        >
                          فتح مساحة العمل
                        </Link>
                      ) : (
                        <span className="rounded-xl bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
                          {app.status === "PENDING"
                            ? "بانتظار القرار"
                            : app.status === "REJECTED"
                            ? "يمكنك إعادة التقديم"
                            : "تم القبول لكن بدون workspaceId"}
                        </span>
                      )}
                    </div>
                  </Card>
                );
              })}
          </div>
        )}

        {/* ملخص سريع للحالات */}
        <div className="grid gap-3 sm:grid-cols-3">
          <Card>
            <div className="text-sm text-neutral-600">مقبول</div>
            <div className="mt-1 text-2xl font-semibold">{approved.length}</div>
          </Card>
          <Card>
            <div className="text-sm text-neutral-600">قيد المراجعة</div>
            <div className="mt-1 text-2xl font-semibold">{pending.length}</div>
          </Card>
          <Card>
            <div className="text-sm text-neutral-600">مرفوض</div>
            <div className="mt-1 text-2xl font-semibold">{rejected.length}</div>
          </Card>
        </div>
      </div>
    </div>
  );
}
