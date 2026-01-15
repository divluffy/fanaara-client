"use client";

import { useMemo, useState } from "react";
import {
  useCreateWorkspaceApplicationMutation,
  useMyWorkspaceApplicationsQuery,
  type WorkspaceType,
} from "@/redux/api";

const PROGRAMS: { key: WorkspaceType; title: string }[] = [
  { key: "influencer", title: "Influencer Workspace" },
  { key: "producer", title: "Producer Workspace" },
  { key: "indie", title: "Indie Creator Workspace" },
];

export default function ProgramsApplyPage() {
  const [program, setProgram] = useState<WorkspaceType>("influencer");

  const { data: myApps } = useMyWorkspaceApplicationsQuery();
  console.log('myApps: ', myApps);

  const hasPendingForSelected = useMemo(() => {
    return (myApps ?? []).some(
      (a) => a.workspaceType === program && a.status === "PENDING"
    );
  }, [myApps, program]);

  const [form, setForm] = useState({
    displayName: "",
    bio: "",
    contactEmail: "",
    links: "",
    portfolio: "",
    reason: "",
  });

  const [submit, { isLoading, error, isSuccess }] =
    useCreateWorkspaceApplicationMutation();

  const onSubmit = async () => {
    const res = await submit({
      workspaceType: program,
      payload: {
        displayName: form.displayName.trim(),
        bio: form.bio.trim(),
        contactEmail: form.contactEmail.trim(),
        links: form.links
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
        portfolio: form.portfolio.trim(),
        reason: form.reason.trim(),
      },
    }).unwrap();
    console.log("res: ", res);

    setForm({
      displayName: "",
      bio: "",
      contactEmail: "",
      links: "",
      portfolio: "",
      reason: "",
    });
  };

  return (
    <div className="p-6 space-y-4" dir="rtl">
      <h1 className="text-xl font-semibold">التقديم على Workspace</h1>

      <div className="flex flex-wrap gap-2">
        {PROGRAMS.map((p) => (
          <button
            key={p.key}
            onClick={() => setProgram(p.key)}
            className={`rounded-xl border px-3 py-2 text-sm ${
              program === p.key
                ? "bg-neutral-900 text-white"
                : "hover:bg-neutral-50"
            }`}
          >
            {p.title}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border p-4 space-y-3">
        <div>
          <label className="text-sm font-medium">اسم العرض</label>
          <input
            className="mt-1 w-full rounded-xl border px-3 py-2"
            value={form.displayName}
            onChange={(e) =>
              setForm((s) => ({ ...s, displayName: e.target.value }))
            }
          />
        </div>

        <div>
          <label className="text-sm font-medium">نبذة</label>
          <textarea
            className="mt-1 w-full rounded-xl border px-3 py-2"
            rows={3}
            value={form.bio}
            onChange={(e) => setForm((s) => ({ ...s, bio: e.target.value }))}
          />
        </div>

        <div>
          <label className="text-sm font-medium">إيميل للتواصل</label>
          <input
            className="mt-1 w-full rounded-xl border px-3 py-2"
            value={form.contactEmail}
            onChange={(e) =>
              setForm((s) => ({ ...s, contactEmail: e.target.value }))
            }
          />
        </div>

        <div>
          <label className="text-sm font-medium">روابط (بفاصلة)</label>
          <input
            className="mt-1 w-full rounded-xl border px-3 py-2"
            placeholder="https://youtube..., https://tiktok..."
            value={form.links}
            onChange={(e) => setForm((s) => ({ ...s, links: e.target.value }))}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Portfolio</label>
          <input
            className="mt-1 w-full rounded-xl border px-3 py-2"
            value={form.portfolio}
            onChange={(e) =>
              setForm((s) => ({ ...s, portfolio: e.target.value }))
            }
          />
        </div>

        <div>
          <label className="text-sm font-medium">سبب التقديم</label>
          <textarea
            className="mt-1 w-full rounded-xl border px-3 py-2"
            rows={3}
            value={form.reason}
            onChange={(e) => setForm((s) => ({ ...s, reason: e.target.value }))}
          />
        </div>

        {hasPendingForSelected ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            لديك طلب PENDING لهذا البرنامج.
          </div>
        ) : null}

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            تعذر إرسال الطلب.
          </div>
        ) : null}

        {isSuccess ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            تم إرسال الطلب ✅
          </div>
        ) : null}

        <button
          onClick={onSubmit}
          disabled={isLoading || hasPendingForSelected}
          className="rounded-xl bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-60"
        >
          {isLoading ? "جارٍ الإرسال..." : "إرسال الطلب"}
        </button>
      </div>
    </div>
  );
}
