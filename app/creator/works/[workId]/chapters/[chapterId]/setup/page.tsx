// app\creator\works\[workId]\chapters\[chapterId]\setup\page.tsx
import DraftWizardClient from "../draft/_components/DraftWizardClient";

export default async function Page({ params }: { params: any }) {
  const resolved = typeof params?.then === "function" ? await params : params;

  const workId = resolved?.workId as string | undefined;
  const chapterId = resolved?.chapterId as string | undefined;



  return <DraftWizardClient workId={workId!} chapterId={chapterId!} />;
}
