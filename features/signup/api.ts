// store/api/authApi.ts

import { api } from "@/redux/api";

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    signup: builder.mutation<void, any>({
      query: (body) => ({ url: "/auth/signup", method: "POST", body }),
    }),

    checkUsername: builder.query<{ available: boolean }, string>({
      query: (username) => `/users/check-username?username=${username}`,
    }),

    updateProfile: builder.mutation<any, any>({
      query: (body) => ({
        url: "/users/me",
        method: "PATCH",
        body,
      }),
    }),
  }),
});

export const {
  useSignupMutation,
  useUpdateProfileMutation,
  useLazyCheckUsernameQuery,
} = authApi;
