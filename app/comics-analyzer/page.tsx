"use client";

import RecentChapters from "./_components/RecentChapters";
import UploadChapterCard from "./_components/UploadChapterCard";


export default function Dashboard() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold">Comics Analyzer</h1>
          <p className="mt-2 text-sm text-slate-600">
            ارفع صور صفحات الفصل، وبعدها يتم تحويلك تلقائيًا للمحرر (بدون تعديل الصورة الأصلية).
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <UploadChapterCard />
        <RecentChapters />
      </div>
    </main>
  );
}
