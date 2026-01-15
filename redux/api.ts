// redux/api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setSessionExpired } from "./auth";
import { getCookie } from "@/lib/cookies";

export type WorkspaceType = "influencer" | "producer" | "indie";
export type ApplicationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELED";

export type WorkspaceApplicationRow = {
  id: string;
  applicantId: string;
  workspaceType: WorkspaceType;
  status: ApplicationStatus;
  payload: any;
  reviewNote?: string | null;
  decidedAt?: string | null;
  createdAt: string;

  applicant?: {
    id: string;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
  };
};

export type User = {
  id: string;
  username: string;
  first_name?: string;
  last_name?: string;
  email?: string;
};

export type Program = {
  id: string;
  name: string;
};
export type ProgramAccess = {
  program: string;
  isMember: boolean;
  roles: string[];
  permissions: string[];
};
export type DashboardAccessResponse = {
  programs: ProgramAccess[];
};

export type MeResponse = { user: User };
export type MyProgramsResponse = { programs: Program[] };
export type PermissionsResponse = { permissions: string[] };
export type RolesResponse = { roles: string[] };

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    credentials: "include",
    prepareHeaders: (headers) => {
      // ✅ CSRF header لكل requests اللي تغير بيانات
      const csrf = getCookie("csrf_token");
      if (csrf) headers.set("x-csrf-token", csrf);
      return headers;
    },
  }),
  refetchOnFocus: false, // نوقف الطلبات عند التركيز
  refetchOnReconnect: true,
  tagTypes: ["Me", "Programs", "Permissions", "Roles", "Applications"],
  endpoints: (builder) => ({
    // --- Auth ---

    me: builder.query<MeResponse, void>({
      query: () => "/auth/me",
      providesTags: ["Me"],
    }),

    login: builder.mutation<void, any>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      invalidatesTags: ["Me", "Programs", "Permissions", "Roles"],
    }),

    logout: builder.mutation<void, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          dispatch(api.util.resetApiState());
          dispatch(setSessionExpired(false));
        }
      },
    }),

    // --- Programs ---
    myPrograms: builder.query<MyProgramsResponse, void>({
      query: () => "/programs/my",
      providesTags: ["Programs"],
    }),

    setActiveProgram: builder.mutation<void, { programId: string }>({
      query: (body) => ({ url: "/programs/active", method: "POST", body }),
      invalidatesTags: ["Permissions", "Roles"],
    }),

    // --- RBAC (roles & permissions) ---
    activePermissions: builder.query<PermissionsResponse, void>({
      query: () => "/programs/active/permissions",
      providesTags: ["Permissions"],
    }),

    activeRoles: builder.query<RolesResponse, void>({
      query: () => "/programs/active/roles",
      providesTags: ["Roles"],
    }),

    programAccess: builder.query<
      { roles: string[]; permissions: string[]; isMember: boolean },
      { program: "influencer" | "producer" | "indie" }
    >({
      query: ({ program }) => `/programs/${program}/access`,
      providesTags: (r, e, arg) => [{ type: "Permissions", id: arg.program }],
    }),

    //  workspace and programs ---------------------------****
    createWorkspaceApplication: builder.mutation<
      WorkspaceApplicationRow,
      { workspaceType: WorkspaceType; payload: any }
    >({
      query: (body) => ({
        url: "/workspace-applications",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Applications"],
    }),

    myWorkspaceApplications: builder.query<WorkspaceApplicationRow[], void>({
      query: () => "/workspace-applications/my",
      providesTags: ["Applications"],
    }),

    listWorkspaceApplications: builder.query<
      WorkspaceApplicationRow[],
      { status?: ApplicationStatus } | void
    >({
      query: (arg) => {
        const status = (arg as any)?.status;
        return status
          ? `/workspace-applications?status=${status}`
          : "/workspace-applications";
      },
      providesTags: ["Applications"],
    }),

    decideWorkspaceApplication: builder.mutation<
      any,
      { id: string; decision: "APPROVE" | "REJECT"; note?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/workspace-applications/${id}/decision`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Applications"],
    }),
  }),
});

export const {
  
  useLoginMutation,
  useLogoutMutation,
  useMeQuery,
  useMyProgramsQuery,
  useSetActiveProgramMutation,
  useActivePermissionsQuery,
  useActiveRolesQuery,
  useProgramAccessQuery,
  useCreateWorkspaceApplicationMutation,
  useMyWorkspaceApplicationsQuery,
  useListWorkspaceApplicationsQuery,
  useDecideWorkspaceApplicationMutation,
} = api;
