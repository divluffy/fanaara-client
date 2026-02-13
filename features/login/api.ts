// features/login/api.ts
import { api } from "@/store/api"; // <-- adjust to your actual base api slice

type LoginRequest = { identifier: string; password: string };
type LoginResponse = { ok: true }; // <-- adjust

export const loginApi = api.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: "/api/auth/login", // <-- adjust to your backend route
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useLoginMutation } = loginApi;
