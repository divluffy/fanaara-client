// features/signup/utils.ts
export type UnknownRecord = Record<string, unknown>;

export function isRecord(v: unknown): v is UnknownRecord {
  return typeof v === "object" && v !== null;
}

/**
 * RTK Query unwrap غالبًا يرمي:
 * - string
 * - { data: { message } }
 * - { message }
 * - { error }
 */
export function extractErrorMessage(
  err: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (typeof err === "string" && err.trim()) return err;

  if (isRecord(err)) {
    const data = err.data;
    if (isRecord(data)) {
      const msg = data.message;
      if (typeof msg === "string" && msg.trim()) return msg;
    }

    const msg = err.message;
    if (typeof msg === "string" && msg.trim()) return msg;

    const e = err.error;
    if (typeof e === "string" && e.trim()) return e;
  }

  return fallback;
}

/** next-intl قد يرمي خطأ لو key غير موجود حسب إعدادات المشروع */
export type Translator = (
  key: string,
  values?: Record<string, unknown>
) => string;

export function safeT(t: Translator, key: string, fallback: string): string {
  try {
    return t(key);
  } catch {
    return fallback;
  }
}

export type OAuthProvider = "google" | "apple" | "microsoft";

export function buildOAuthStartUrl(
  apiBase: string,
  provider: OAuthProvider
): string {
  // يضمن join صحيح حتى لو apiBase بدون /
  const base = apiBase.endsWith("/") ? apiBase : `${apiBase}/`;
  const url = new URL(`api/auth/oauth/${provider}/start`, base);
  return url.toString();
}
