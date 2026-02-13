import EditorShell from "../../_components/EditorShell";

export default function ComicsAnalyzerEditorPage({
  params,
  searchParams,
}: {
  params: { pageId: string };
  searchParams?: { chapterId?: string };
}) {
  const chapterId =
    typeof searchParams?.chapterId === "string"
      ? searchParams.chapterId
      : undefined;
  return <EditorShell pageId={params.pageId} chapterId={chapterId} />;
}
