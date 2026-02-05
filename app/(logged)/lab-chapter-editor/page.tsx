import Link from "next/link";

export default function LabChapterEditorHome() {
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Chapter Editor Lab</h1>
      <p className="text-sm text-gray-500">
        Prototype محلي لاختبار المحرر: وضع يدوي + وضع AI (Mock).
      </p>

      <div className="flex gap-3">
        <Link className="px-3 py-2 rounded bg-black text-white" href="/lab-chapter-editor/manual">
          Manual Tools
        </Link>
        <Link className="px-3 py-2 rounded border" href="/lab-chapter-editor/ai">
          AI Mode (Mock)
        </Link>
      </div>
    </main>
  );
}
