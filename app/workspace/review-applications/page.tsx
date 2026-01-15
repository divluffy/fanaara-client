"use client";

import {
  useDecideWorkspaceApplicationMutation,
  useListWorkspaceApplicationsQuery,
} from "@/redux/api";

export default function ReviewApplicationsPage() {
  const { data, isLoading, error } = useListWorkspaceApplicationsQuery({
    status: "PENDING",
  });
  const [decide, { isLoading: deciding }] =
    useDecideWorkspaceApplicationMutation();

  if (isLoading) return <div className="p-6">Loading...</div>;

  if (error) {
    return (
      <div className="p-6" dir="rtl">
        تعذر تحميل الطلبات.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4" dir="rtl">
      <h1 className="text-xl font-semibold">طلبات الانضمام (مؤقت للاختبار)</h1>

      <div className="rounded-2xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="p-3 text-right">المستخدم</th>
              <th className="p-3 text-right">البرنامج</th>
              <th className="p-3 text-right">البيانات</th>
              <th className="p-3 text-right">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((a) => (
              <tr key={a.id} className="border-t align-top">
                <td className="p-3">
                  <div className="font-medium">{a.applicant?.username}</div>
                  <div className="text-xs text-neutral-600">
                    {a.applicant?.email}
                  </div>
                </td>

                <td className="p-3">{a.workspaceType}</td>

                <td className="p-3">
                  <pre className="text-xs whitespace-pre-wrap bg-neutral-50 rounded-xl p-2 border">
                    {JSON.stringify(a.payload, null, 2)}
                  </pre>
                </td>

                <td className="p-3">
                  <div className="flex gap-2">
                    <button
                      disabled={deciding}
                      onClick={() =>
                        decide({ id: a.id, decision: "APPROVE" }).unwrap()
                      }
                      className="rounded-xl bg-emerald-600 px-3 py-1.5 text-white disabled:opacity-60"
                    >
                      قبول
                    </button>

                    <button
                      disabled={deciding}
                      onClick={() =>
                        decide({
                          id: a.id,
                          decision: "REJECT",
                          note: "رفض للتجربة",
                        }).unwrap()
                      }
                      className="rounded-xl bg-red-600 px-3 py-1.5 text-white disabled:opacity-60"
                    >
                      رفض
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {!data || data.length === 0 ? (
              <tr>
                <td className="p-4 text-neutral-600" colSpan={4}>
                  لا توجد طلبات PENDING الآن
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
