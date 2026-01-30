export type PostToken =
  | { kind: "text"; value: string }
  | { kind: "mention"; raw: string; value: string }
  | { kind: "hashtag"; raw: string; value: string };

const isWhitespace = (ch: string) => /\s/u.test(ch);

// ترقيم شائع نزيله من نهاية التوكن فقط (حتى ما يخرب الرابط)
const TRAIL_PUNCT = new Set([
  ".",
  ",",
  "!",
  "?",
  ";",
  ":",
  "،",
  "؟",
  "؛",
  "…",
  ")",
  "]",
  "}",
  '"',
  "'",
  "”",
  "“",
  "’",
  "‘",
]);

function splitTrailingPunct(raw: string): { core: string; trailing: string } {
  let core = raw;
  let trailing = "";

  while (core.length > 1) {
    const last = core[core.length - 1];
    if (!TRAIL_PUNCT.has(last)) break;
    trailing = last + trailing;
    core = core.slice(0, -1);
  }

  return { core, trailing };
}

export function tokenizePostText(input: string): PostToken[] {
  const text = String(input ?? "");
  const out: PostToken[] = [];

  let buf = "";

  const flush = () => {
    if (buf) out.push({ kind: "text", value: buf });
    buf = "";
  };

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (
      (ch === "@" || ch === "#") &&
      i + 1 < text.length &&
      !isWhitespace(text[i + 1])
    ) {
      flush();

      let j = i + 1;
      // ✅ ينتهي عند أول مساحة أو سطر جديد أو أي whitespace
      while (j < text.length && !isWhitespace(text[j])) j++;

      const raw = text.slice(i, j);
      const { core, trailing } = splitTrailingPunct(raw);

      const value = core.slice(1);
      if (value) {
        out.push({
          kind: ch === "@" ? "mention" : "hashtag",
          raw: core,
          value,
        });
      } else {
        out.push({ kind: "text", value: core });
      }

      if (trailing) out.push({ kind: "text", value: trailing });

      i = j - 1;
      continue;
    }

    buf += ch;
  }

  flush();
  return out;
}

export const stripLeadingAt = (s: string) => s.replace(/^@+/, "");
export const stripLeadingHash = (s: string) => s.replace(/^#+/, "");
