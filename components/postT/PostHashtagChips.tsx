import React from "react";
import Link from "next/link";

type Props = {
  hashtags?: string[];
  max?: number;
};

export function PostHashtagChips({ hashtags, max = 4 }: Props) {
  if (!hashtags?.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {hashtags.slice(0, max).map((tag) => (
        <Link
          key={tag}
          href={`/hashtag/${encodeURIComponent(tag)}`}
          dir="auto"
          className="
            inline-flex items-center
            rounded-full px-3 py-1
            text-xs font-medium
            bg-accent-subtle border border-accent-border
            text-foreground-strong
            hover:bg-accent-soft
            transition
            [unicode-bidi:plaintext]
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring-brand)]
          "
        >
          #{tag}
        </Link>
      ))}
    </div>
  );
}
