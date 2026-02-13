import { api } from "@/store/api";
import type {
  AnalyzerPageJson,
  AnalyzerChapterDetail,
  AnalyzerChaptersListResponse,
} from "./types";

export const comicsAnalyzerApi = api.injectEndpoints({
  endpoints: (build) => ({
    // Chapters
    createChapter: build.mutation<AnalyzerChapterDetail, FormData>({
      query: (formData) => ({
        url: `/comics-analyzer/chapters`,
        method: "POST",
        body: formData,
      }),
    }),

    getChapters: build.query<AnalyzerChaptersListResponse, { limit?: number }>({
      query: ({ limit = 10 }) => `/comics-analyzer/chapters?limit=${limit}`,
    }),

    getChapter: build.query<AnalyzerChapterDetail, { chapterId: string }>({
      query: ({ chapterId }) =>
        `/comics-analyzer/chapters/${encodeURIComponent(chapterId)}`,
    }),

    // Pages
    analyzePage: build.mutation<AnalyzerPageJson, { pageId: string }>({
      query: ({ pageId }) => ({
        url: `/comics-analyzer/pages/${encodeURIComponent(pageId)}/analyze`,
        method: "POST",
      }),
    }),

    getPage: build.query<AnalyzerPageJson, { pageId: string }>({
      query: ({ pageId }) =>
        `/comics-analyzer/pages/${encodeURIComponent(pageId)}`,
    }),

    savePage: build.mutation<
      AnalyzerPageJson,
      { pageId: string; body: AnalyzerPageJson }
    >({
      query: ({ pageId, body }) => ({
        url: `/comics-analyzer/pages/${encodeURIComponent(pageId)}`,
        method: "PUT",
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateChapterMutation,
  useGetChaptersQuery,
  useGetChapterQuery,

  useAnalyzePageMutation,
  useGetPageQuery,
  useLazyGetPageQuery,
  useSavePageMutation,
} = comicsAnalyzerApi;
