// lib/guards.ts
import { redirect } from "next/navigation";
import { serverCurrentPath, serverMe } from "@/lib/server-auth";
import type { UserProfileDTO } from "@/types";

// عدّلها حسب نظامك (role واحد أو array)
type Role = string;

function hasAnyRole(user: UserProfileDTO, roles: Role[]) {
  // @ts-expect-error adapt to your DTO
  const userRoles: string[] = user.roles ?? (user.role ? [user.role] : []);
  return roles.some((r) => userRoles.includes(r));
}

export async function requireUser(opts?: {
  allowPending?: boolean;
  roles?: Role[];
}) {
  const me = await serverMe();

  if (!me?.user) {
    const path = await serverCurrentPath();
    redirect(`/login?redirect=${encodeURIComponent(path)}`);
  }

  const user = me.user;

  if (!opts?.allowPending && user.status === "PENDING") {
    redirect("/signup");
  }

  if (opts?.roles?.length && !hasAnyRole(user, opts.roles)) {
    redirect("/403");
  }

  return user;
}

export async function redirectIfAuthed() {
  const me = await serverMe();
  if (!me?.user) return;

  if (me.user.status === "PENDING") redirect("/signup");
  redirect("/");
}
