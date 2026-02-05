import type { AppLocale } from "@/i18n/config";

export async function persistLocalePreference(nextLocale: AppLocale) {
  const res = await fetch("/api/locale", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ locale: nextLocale }),
  });

  if (!res.ok) {
    throw new Error("Failed to persist locale preference");
  }
}
