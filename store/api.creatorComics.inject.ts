// store\api.creatorComics.inject.ts
import { api } from "./api";

export type WorkType =
  | "MANGA"
  | "MANHWA"
  | "MANHUA"
  | "COMIC"
  | "WEBTOON"
  | "OTHER";
export type ArtStyleCategory =
  | "BW_MANGA"
  | "FULL_COLOR"
  | "WESTERN_COMIC"
  | "SEMI_REALISTIC"
  | "REALISTIC"
  | "CHIBI"
  | "PIXEL_ART"
  | "OTHER";

export type WorkListItem = {
  id: string;
  title: string;
  workType: WorkType;
  artStyleCategory: ArtStyleCategory;
  updatedAt: string;

  latestChapter: null | {
    id: string;
    title: string;
    number: number | null;
    totalPages: number;
    analyzedPages: number;
    latestJob: null | {
      id: string;
      status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
      updatedAt: string;
    };
    coverUrl?: string | null;
  };

  // computed state for UI
  state: "DRAFT_NO_PAGES" | "PAGES_UPLOADED" | "ANALYZING" | "READY";
};

export type EditorPayload = {
  work: {
    id: string;
    title: string;
    workType: string;
    artStyleCategory: string;
  };
  chapter: { id: string; title: string; number: number | null };

  stats: { totalPages: number; analyzedPages: number };

  latestJob: null | {
    id: string;
    status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
    progress?: any;
    updatedAt: string;
    error?: string | null;
  };

  pages: Array<{
    id: string;
    orderIndex: number;
    image: {
      url: string;
      width: number;
      height: number;
      originalFilename: string;
      s3Key: string;
    };
    analysis: any | null;
    annotations: any | null;
  }>;
};

export const creatorComicsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Works List
    listCreatorWorks: builder.query<{ works: WorkListItem[] }, void>({
      query: () => "/creator/works/my",
      providesTags: ["CreatorWorks"],
    }),

    // ✅ Step 1: Create Draft Work
    createCreatorWork: builder.mutation<
      any,
      {
        workType: WorkType;
        artStyleCategory: ArtStyleCategory;
        title: string;
        description?: string;
        defaultLang?: string;
      }
    >({
      query: (body) => ({ url: "/creator/works", method: "POST", body }),
      invalidatesTags: ["CreatorWorks"],
    }),

    // ✅ Step 1: Create Draft Chapter
    createCreatorChapter: builder.mutation<
      any,
      { workId: string; body: { title: string; number?: number } }
    >({
      query: ({ workId, body }) => ({
        url: `/creator/works/${workId}/chapters`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["CreatorWorks"],
    }),

    // ✅ Setup/Editor payload (fresh signed URLs)
    getCreatorChapterDraft: builder.query<EditorPayload, { chapterId: string }>(
      {
        query: ({ chapterId }) => `/creator/chapters/${chapterId}/editor`,
        providesTags: (r, e, arg) => [
          { type: "CreatorDraft", id: arg.chapterId },
        ],
      },
    ),

    // ✅ Presign uploads
    presignCreatorUploads: builder.mutation<
      any,
      {
        workId: string;
        chapterId: string;
        files: Array<{
          clientFileId: string;
          filename: string;
          contentType: string;
        }>;
      }
    >({
      query: (body) => ({
        url: "/creator/uploads/presign",
        method: "POST",
        body,
      }),
    }),

    // ✅ Register pages in DB
    createCreatorPages: builder.mutation<
      any,
      {
        chapterId: string;
        pages: Array<{
          orderIndex: number;
          objectKey: string;
          originalFilename: string;
          width: number;
          height: number;
        }>;
      }
    >({
      query: ({ chapterId, pages }) => ({
        url: `/creator/chapters/${chapterId}/pages`,
        method: "POST",
        body: { pages },
      }),
      invalidatesTags: (r, e, arg) => [
        { type: "CreatorDraft", id: arg.chapterId },
        "CreatorWorks",
      ],
    }),

    // ✅ Reorder pages (persist)
    reorderCreatorPages: builder.mutation<
      any,
      {
        chapterId: string;
        order: Array<{ pageId: string; orderIndex: number }>;
      }
    >({
      query: ({ chapterId, order }) => ({
        url: `/creator/chapters/${chapterId}/pages/reorder`,
        method: "PATCH",
        body: { order },
      }),
      invalidatesTags: (r, e, arg) => [
        { type: "CreatorDraft", id: arg.chapterId },
      ],
    }),

    // ✅ Start analysis
    startCreatorAnalysis: builder.mutation<
      any,
      {
        chapterId: string;
        model?: string;
        detail?: "low" | "high";
        force?: boolean;
      }
    >({
      query: ({ chapterId, ...body }) => ({
        url: `/creator/chapters/${chapterId}/analyze`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["CreatorAnalysisJob", "CreatorWorks"],
    }),

    // ✅ Poll analysis job
    getCreatorAnalysisJob: builder.query<any, { jobId: string }>({
      query: ({ jobId }) => `/creator/analysis-jobs/${jobId}`,
      providesTags: (r, e, arg) => [
        { type: "CreatorAnalysisJob", id: arg.jobId },
      ],
    }),

    // ✅ Autosave annotations
    saveCreatorPageAnnotations: builder.mutation<
      any,
      { pageId: string; annotations: any }
    >({
      query: ({ pageId, annotations }) => ({
        url: `/creator/pages/${pageId}/annotations`,
        method: "PATCH",
        body: { annotations },
      }),
      invalidatesTags: ["CreatorAnnotations"],
    }),

    deleteCreatorWork: builder.mutation<{ ok: true }, { workId: string }>({
      query: ({ workId }) => ({
        url: `/creator/works/${workId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CreatorWorks"],
    }),
  }),

  overrideExisting: false,
});

export const {
  useListCreatorWorksQuery,
  useCreateCreatorWorkMutation,
  useCreateCreatorChapterMutation,
  useGetCreatorChapterDraftQuery,
  usePresignCreatorUploadsMutation,
  useCreateCreatorPagesMutation,
  useReorderCreatorPagesMutation,
  useStartCreatorAnalysisMutation,
  useGetCreatorAnalysisJobQuery,
  useSaveCreatorPageAnnotationsMutation,
  useDeleteCreatorWorkMutation,
} = creatorComicsApi;
