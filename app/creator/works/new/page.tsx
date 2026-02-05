// app\creator\works\new\page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArtStyleCategory,
  WorkType,
  useCreateCreatorChapterMutation,
  useCreateCreatorWorkMutation,
} from "@/store/api.creatorComics.inject";

export default function NewWorkClient() {
  const router = useRouter();

  const [workType, setWorkType] = useState<WorkType>("MANGA");
  const [artStyleCategory, setArtStyleCategory] =
    useState<ArtStyleCategory>("BW_MANGA");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [chapterTitle, setChapterTitle] = useState("Chapter 1");

  const [createWork, { isLoading: wLoading }] = useCreateCreatorWorkMutation();
  const [createChapter, { isLoading: cLoading }] =
    useCreateCreatorChapterMutation();
  const busy = wLoading || cLoading;

  async function createDraft() {
    try {
      const work = await createWork({
        workType,
        artStyleCategory,
        title,
        description: description || undefined,
        defaultLang: "ar",
      }).unwrap();
      const chapter = await createChapter({
        workId: work.id,
        body: { title: chapterTitle },
      }).unwrap();

      // IMPORTANT: route should be /setup not /draft (after we add alias)
      router.push(`/creator/works/${work.id}/chapters/${chapter.id}/setup`);
    } catch (e) {
      console.error("createDraft failed", e);
      alert("Failed to create draft. Check console/logs.");
    }
  }

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold">New Work</h1>
        <div className="ml-auto">
          <button
            className="px-3 py-2 rounded border"
            onClick={() => router.push("/creator/works")}
          >
            Back
          </button>
        </div>
      </div>

      <section className="border rounded p-4 bg-white space-y-3">
        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="text-xs text-gray-500">Work Type</div>
            <select
              className="w-full border rounded px-2 py-2"
              value={workType}
              onChange={(e) => setWorkType(e.target.value as any)}
            >
              <option value="MANGA">Manga</option>
              <option value="MANHWA">Manhwa</option>
              <option value="MANHUA">Manhua</option>
              <option value="COMIC">Comic</option>
              <option value="WEBTOON">Webtoon</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-gray-500">Art Style</div>
            <select
              className="w-full border rounded px-2 py-2"
              value={artStyleCategory}
              onChange={(e) => setArtStyleCategory(e.target.value as any)}
            >
              <option value="BW_MANGA">Black & White Manga</option>
              <option value="FULL_COLOR">Full Color</option>
              <option value="WESTERN_COMIC">Western Comic</option>
              <option value="SEMI_REALISTIC">Semi Realistic</option>
              <option value="REALISTIC">Realistic</option>
              <option value="CHIBI">Chibi</option>
              <option value="PIXEL_ART">Pixel Art</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="text-xs text-gray-500">Title</div>
            <input
              className="w-full border rounded px-2 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <div className="text-xs text-gray-500">Chapter Title</div>
            <input
              className="w-full border rounded px-2 py-2"
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-gray-500">Description</div>
          <textarea
            className="w-full border rounded px-2 py-2 min-h-[90px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
          disabled={busy || title.trim().length < 2}
          onClick={createDraft}
        >
          {busy ? "Creating..." : "Create Draft & Continue"}
        </button>
      </section>
    </main>
  );
}
