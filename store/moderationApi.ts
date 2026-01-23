import { api } from "@/store/api";

export const moderationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    moderateText: builder.mutation<
      any,
      { items: Array<{ text: string; context?: string }> }
    >({
      query: (body) => ({ url: "/moderation/text", method: "POST", body }),
    }),
  }),
});

export const { useModerateTextMutation } = moderationApi;
