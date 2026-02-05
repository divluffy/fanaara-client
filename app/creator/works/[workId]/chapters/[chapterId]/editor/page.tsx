// app\creator\works\[workId]\chapters\[chapterId]\editor\page.tsx
import ChapterEditorClient from "./_components/ChapterEditorClient";

export default async function Page({ params }: { params: any }) {
  const resolved = typeof params?.then === "function" ? await params : params;

  const workId = resolved?.workId as string ;
  const chapterId = resolved?.chapterId as string ;

  return <ChapterEditorClient workId={workId} chapterId={chapterId} />;
}
