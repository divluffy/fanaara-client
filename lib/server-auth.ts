// lib/server-auth.ts
import { UserProfileDTO } from "@/types";
import { headers } from "next/headers";

const BACKEND = process.env.BACKEND_INTERNAL_URL;

export async function serverMe() {
  console.log("check server");

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
  const data = await res.json();
  console.log("data User AUTH: ", data);

  return data as { user: UserProfileDTO };
}

export async function serverCurrentPath() {
  const h = await headers();
  return h.get("x-current-path") || "/";
}
