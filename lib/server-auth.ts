// lib/server-auth.ts
import { AUTH_COOKIE } from "@/config";
import { UserProfileDTO } from "@/types";
import { cookies, headers } from "next/headers";

const BACKEND = process.env.BACKEND_INTERNAL_URL;

export async function serverMe() {
  console.log("check server");

  const cookieStore = await cookies();

  const token = cookieStore.get(AUTH_COOKIE)?.value;

  if (!token) return null; // ✅ لا طلب للـ backend للزائر

  const h = await headers();
  const cookie = h.get("cookie") ?? "";

  const URL = `${BACKEND}/api/auth/me`;
  console.log("URL: ", URL);

  const res = await fetch(URL, {
    headers: { cookie, accept: "application/json" },
    cache: "no-store",
  });
  console.log("res: ", res);

  if (res.status === 401) return null;
  if (!res.ok) return null;

  return (await res.json()) as { user: UserProfileDTO };
}

export async function serverCurrentPath() {
  const h = await headers();
  return h.get("x-current-path") || "/";
}
