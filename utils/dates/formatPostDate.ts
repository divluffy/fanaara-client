export type DateInput = string | number | Date | null | undefined;

type Options = {
  locale?: string; // "ar" | "en" | "tr" | ...
  now?: Date; // للاختبار أو SSR
  relativeDays?: number; // كم يوم نخليها relative قبل التحويل لتاريخ
};

function toDate(input: DateInput): Date | null {
  if (!input) return null;
  if (input instanceof Date) return isNaN(input.getTime()) ? null : input;

  const d = new Date(input);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * - Recent => "قبل ساعة" / "before 2 days" / "2 gün önce"
 * - Older => localized date (same year: "25 Jan", other year: "25 Jan 2025")
 */
export function formatPostDate(input: DateInput, opts: Options = {}): string {
  const { locale = "en", now = new Date(), relativeDays = 7 } = opts;

  const date = toDate(input);
  if (!date) return "";

  const diffMs = date.getTime() - now.getTime(); // + future, - past
  const absSec = Math.abs(diffMs) / 1000;

  const sec = 1;
  const min = 60 * sec;
  const hour = 60 * min;
  const day = 24 * hour;

  const isFuture = diffMs > 0;

  // Relative for up to N days
  if (absSec < relativeDays * day) {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

    const pick = () => {
      if (absSec < 60) return ["second", sec] as const;
      if (absSec < 3600) return ["minute", min] as const;
      if (absSec < 86400) return ["hour", hour] as const;
      return ["day", day] as const;
    };

    const [unit, unitSec] = pick();
    const raw = absSec / unitSec;

    // past => floor (لا يقفز بسرعة)، future => ceil
    const amount = isFuture ? Math.ceil(raw) : Math.floor(raw);
    const signed = isFuture ? amount : -amount;

    return rtf.format(signed, unit);
  }

  // Absolute date
  const sameYear = date.getFullYear() === now.getFullYear();

  const fmt = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
  });

  return fmt.format(date);
}
