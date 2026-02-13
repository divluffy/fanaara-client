// features\signup\api.ts

import { api } from "@/store/api";
import { UserProfileDTO } from "@/types";

export type SignupRequest = {
  email: string;
  password: string;
};

export type CheckUsernameResponse = {
  available: boolean;
};

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    signup: builder.mutation<void, SignupRequest>({
      query: (body) => ({ url: "/auth/signup", method: "POST", body }),
    }),

    checkUsername: builder.query<CheckUsernameResponse, string>({
      query: (username) => `/users/check-username?username=${username}`,
    }),

    updateProfile: builder.mutation<UserProfileDTO, Partial<UserProfileDTO>>({
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
