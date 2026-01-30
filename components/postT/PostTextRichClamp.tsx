"use client";

import React from "react";
import Link from "next/link";
import {
  tokenizePostText,
  stripLeadingAt,
  stripLeadingHash,
} from "./tokenizePostText";

type Props = {
  text?: string | null;
  maxLines?: number; // default 5
  locale: string; // useLocale()
  direction?: "rtl" | "ltr"; // from store
  mentionHref?: (username: string) => string; // default /profile/:username
  hashtagHref?: (tag: string) => string; // default /hashtag/:tag
};

const READ_MORE: Record<string, string> = {
  ar: "قراءة المزيد",
  en: "Read more",
  tr: "Daha fazla",
};

function px(n: string) {
  const v = parseFloat(n);
  return Number.isFinite(v) ? v : 0;
}

function safeCutAtWhitespace(s: string, idx: number) {
  if (idx <= 0) return "";
  const sub = s.slice(0, idx);

  // ابحث عن آخر whitespace قبل القطع
  const lastWs = sub.search(/\s(?!.*\s)/u); // last whitespace index (rough)
  if (lastWs > 0) return sub.slice(0, lastWs).trimEnd();

  return sub.trimEnd();
}

export function PostTextRichClamp({
  text,
  maxLines = 5,
  locale,
  direction = "ltr",
  mentionHref,
  hashtagHref,
}: Props) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const measureRef = React.useRef<HTMLDivElement | null>(null);

  const [expanded, setExpanded] = React.useState(false);
  const [canExpand, setCanExpand] = React.useState(false);
  const [collapsedText, setCollapsedText] = React.useState<string>("");

  // long-press copy (touch only)
  const pressTimer = React.useRef<number | null>(null);
  const didLongPress = React.useRef(false);
  const skipNextClick = React.useRef(false);

  const labelMore = READ_MORE[locale] ?? READ_MORE.en;

  const toMentionHref =
    mentionHref ??
    ((u: string) => `/profile/${encodeURIComponent(stripLeadingAt(u))}`);

  const toHashtagHref =
    hashtagHref ??
    ((t: string) => `/hashtag/${encodeURIComponent(stripLeadingHash(t))}`);

  const fullText = String(text ?? "");

  const renderRich = React.useCallback(
    (value: string) => {
      const tokens = tokenizePostText(value);
      return tokens.map((tok, idx) => {
        if (tok.kind === "text")
          return <React.Fragment key={idx}>{tok.value}</React.Fragment>;

        if (tok.kind === "mention") {
          const username = stripLeadingAt(tok.value);
          return (
            <Link
              key={idx}
              href={toMentionHref(username)}
              dir="ltr"
              className="
                text-foreground-strong
                hover:underline underline-offset-2
                [unicode-bidi:plaintext] text-left
              "
              onClick={(e) => e.stopPropagation()}
            >
              @{username}
            </Link>
          );
        }

        const tag = stripLeadingHash(tok.value);
        return (
          <Link
            key={idx}
            href={toHashtagHref(tag)}
            dir="auto"
            className="
              text-foreground-strong
              hover:underline underline-offset-2
              [unicode-bidi:plaintext]
            "
            onClick={(e) => e.stopPropagation()}
          >
            #{tag}
          </Link>
        );
      });
    },
    [toMentionHref, toHashtagHref],
  );

  const recompute = React.useCallback(() => {
    if (!containerRef.current || !measureRef.current) return;
    if (expanded) return;

    const width = containerRef.current.getBoundingClientRect().width;
    if (width <= 0) return;

    const measureEl = measureRef.current;

    // اجعل القياس بنفس عرض الأب
    measureEl.style.width = `${Math.floor(width)}px`;

    // احسب line-height الحقيقي
    const cs = getComputedStyle(measureEl);
    const lineHeight =
      cs.lineHeight === "normal" ? px(cs.fontSize) * 1.5 : px(cs.lineHeight);

    const maxHeight = lineHeight * maxLines + 1;

    const suffix = `… ${labelMore}`;

    // 1) جرّب النص الكامل
    measureEl.textContent = fullText;
    const fitsFull = measureEl.scrollHeight <= maxHeight;

    if (fitsFull) {
      setCanExpand(false);
      setCollapsedText(fullText);
      return;
    }

    // 2) لازم truncation
    setCanExpand(true);

    // Binary search على طول النص (مع suffix)
    let lo = 0;
    let hi = fullText.length;

    const test = (mid: number) => {
      const cut = safeCutAtWhitespace(fullText, mid);
      measureEl.textContent = cut + suffix;
      return measureEl.scrollHeight <= maxHeight;
    };

    // اجعل البداية لا تعتمد على text، لكن القياس دائمًا على عرض الأب
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      if (test(mid)) lo = mid;
      else hi = mid - 1;
    }

    // لو نهاية البحث ما زالت لا تكفي (نص قصير جدًا مع suffix)
    let finalCut = safeCutAtWhitespace(fullText, lo);
    measureEl.textContent = finalCut + suffix;
    while (finalCut.length > 0 && measureEl.scrollHeight > maxHeight) {
      finalCut = safeCutAtWhitespace(
        finalCut,
        Math.max(0, finalCut.length - 10),
      );
      measureEl.textContent = finalCut + suffix;
    }

    setCollapsedText(finalCut);
  }, [expanded, fullText, labelMore, maxLines]);

  React.useLayoutEffect(() => {
    recompute();
    if (!containerRef.current) return;

    const ro = new ResizeObserver(() => recompute());
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [recompute]);

  const expand = () => {
    if (!expanded && canExpand) setExpanded(true);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    didLongPress.current = false;
    skipNextClick.current = false;

    if (e.pointerType !== "touch") return;
    if (!fullText) return;

    pressTimer.current = window.setTimeout(async () => {
      didLongPress.current = true;
      skipNextClick.current = true;

      try {
        await navigator.clipboard.writeText(fullText);
      } catch {
        // ignore
      }
    }, 520);
  };

  const clearPress = () => {
    if (pressTimer.current) {
      window.clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  if (!fullText) return null;

  const shownText = expanded ? fullText : collapsedText;

  return (
    <div
      ref={containerRef}
      dir={direction}
      className="relative"
      onClickCapture={(e) => {
        const target = e.target as HTMLElement;
        if (target?.closest("a")) return;
        if (skipNextClick.current) {
          // منع التوسيع بعد long press
          skipNextClick.current = false;
          return;
        }
        expand();
      }}
      onPointerDown={onPointerDown}
      onPointerUp={clearPress}
      onPointerCancel={clearPress}
      onPointerLeave={clearPress}
    >
      {/* النص المعروض */}
      <p
        className="
          text-sm leading-6 text-foreground
          whitespace-pre-wrap break-words
          select-text
        "
      >
        {renderRich(shownText)}

        {/* ✅ قراءة المزيد inline مباشرة بعد … داخل نفس السطر الخامس */}
        {!expanded && canExpand && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              expand();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                expand();
              }
            }}
            className="
              cursor-pointer select-none
              text-foreground-soft
              opacity-80
              ms-1
              hover:opacity-100
              transition
            "
          >
            … {labelMore}
          </span>
        )}
      </p>

      {/* عنصر قياس مخفي (نقيس عليه 5 أسطر بعرض الأب) */}
      <div
        ref={measureRef}
        dir={direction}
        className="
          pointer-events-none select-none
          invisible absolute -left-[9999px] top-0
          text-sm leading-6
          whitespace-pre-wrap break-words
        "
        aria-hidden="true"
      />
    </div>
  );
}
