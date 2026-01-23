import { api } from "@/store/api";

export const uploadsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    presignUpload: builder.mutation<
      {
        token: string;
        key: string;
        uploadUrl: string;
        expiresInSeconds: number;
      },
      {
        purpose: "avatar" | "post_image" | "cover" | "attachment";
        mimeType: string;
        fileName: string;
        fileSize: number;
      }
    >({
      query: (body) => ({ url: "/uploads/presign", method: "POST", body }),
    }),

    completeUpload: builder.mutation<
      { status: "APPROVED" | "PENDING"; key?: string; url?: string },
      { token: string }
    >({
      query: (body) => ({ url: "/uploads/complete", method: "POST", body }),
    }),

    abortUpload: builder.mutation<{ ok: boolean }, { token: string }>({
      query: (body) => ({ url: "/uploads/abort", method: "POST", body }),
    }),
  }),
});

export const {
  usePresignUploadMutation,
  useCompleteUploadMutation,
  useAbortUploadMutation,
} = uploadsApi;
