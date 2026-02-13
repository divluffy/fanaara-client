import ChapterShell from "./_components/ChapterShell";

export default function ChapterPage({
  params,
}: {
  params: { chapterId: string };
}) {
  return <ChapterShell chapterId={params.chapterId} />;
}
