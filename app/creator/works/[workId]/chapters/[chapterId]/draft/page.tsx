// app\creator\works\[workId]\chapters\[chapterId]\draft\page.tsx
import { redirect } from "next/navigation";

export default async function Page({ params }: { params: any }) {
  const resolved = typeof params?.then === "function" ? await params : params;

  const workId = resolved?.workId as string | undefined;
  const chapterId = resolved?.chapterId as string | undefined;

  redirect(`/creator/works/${workId}/chapters/${chapterId}/setup`);
}
