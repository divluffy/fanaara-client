"use client";

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Loader2, SendHorizontal, Smile, X } from "lucide-react";
import { cn } from "@/utils";

// -------------------- Types --------------------

export type MentionOption = {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
};

export type ChatInputHandle = {
  clear: () => void;
  setValue: (v: string) => void;
  focus: () => void;
  insertText: (text: string) => void;
  insertEmoji: (emoji: string) => void;
};

export type SubmitHotkey = "enter" | "ctrlEnter" | "metaEnter" | "none";
export type MentionPopupStrategy = "absolute" | "fixed";

export type SmartChatInputProps = {
  // Core
  onSendMessage?: (text: string, mentions: string[]) => Promise<void> | void;
  placeholder?: string;
  className?: string;

  // Controlled / Uncontrolled
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;

  // State
  isSending?: boolean;
  disabled?: boolean;

  // UX options
  minRows?: number;
  maxHeight?: number;
  maxLength?: number;

  // Sending
  showSendButton?: boolean;
  sendButtonVariant?: "icon" | "pill";
  sendButtonText?: string; // used with "pill"
  submitHotkey?: SubmitHotkey;

  // Emoji
  showEmojiButton?: boolean;
  emojiMode?: "internal" | "external"; // external => use onEmojiClick
  onEmojiClick?: () => void;
  emojiList?: string[]; // internal picker

  // Clear
  showClearButton?: boolean;

  // Mentions
  enableMentions?: boolean;
  mentionOptions?: MentionOption[];
  mentionResultsLimit?: number;
  mentionHeaderText?: string;
  mentionNoResultsText?: string;
  mentionPopupStrategy?: MentionPopupStrategy; // fixed is best to avoid overflow clipping
  mentionPopupWidth?: number | "input"; // fixed only (or used for clamping)
  onMentionPick?: (user: MentionOption) => void;

  // Small hint under input
  showHint?: boolean;
};

// -------------------- Helpers --------------------

const DEFAULT_MAX_HEIGHT = 160;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Finds an active mention query just before caret.
 * Supports: "@", "@na", "hello @na"
 * Only triggers at start OR after whitespace/newline.
 */
function findMentionQuery(text: string, caret: number) {
  const left = text.slice(0, caret);
  const match = left.match(/(^|[\s\n])@([a-zA-Z0-9_]*)$/);
  if (!match) return null;

  const full = match[0]; // includes optional whitespace + "@query"
  const lead = match[1] ?? ""; // whitespace or ""
  const query = match[2] ?? "";
  const end = caret;

  // mention "@" start position = end - ("@"+query).length
  const mentionStart = end - (1 + query.length);
  // If there is whitespace included in the match, ensure start excludes it
  const start = mentionStart; // correct for replacement

  return { query, start, end, leadLen: lead.length, fullLen: full.length };
}

function extractMentions(text: string) {
  const matches = text.match(/@([a-zA-Z0-9_]+)/g) ?? [];
  const usernames = matches.map((m) => m.slice(1));
  // de-dupe while preserving order
  const seen = new Set<string>();
  const out: string[] = [];
  for (const u of usernames) {
    if (!seen.has(u.toLowerCase())) {
      seen.add(u.toLowerCase());
      out.push(u);
    }
  }
  return out;
}

const DEFAULT_EMOJIS = [
  "😀",
  "😂",
  "😍",
  "😭",
  "🔥",
  "✨",
  "💯",
  "👍",
  "🥹",
  "😤",
  "🫡",
  "🤝",
];

// -------------------- Component --------------------

export const SmartChatInput = forwardRef<ChatInputHandle, SmartChatInputProps>(
  (
    {
      onSendMessage,
      placeholder = "Write...",
      className,

      value,
      defaultValue,
      onChange,

      isSending = false,
      disabled = false,

      minRows = 1,
      maxHeight = DEFAULT_MAX_HEIGHT,
      maxLength,

      showSendButton = true,
      sendButtonVariant = "icon",
      sendButtonText = "Send",
      submitHotkey = "enter",

      showEmojiButton = true,
      emojiMode = "internal",
      onEmojiClick,
      emojiList = DEFAULT_EMOJIS,

      showClearButton = false,

      enableMentions = true,
      mentionOptions = [],
      mentionResultsLimit = 6,
      mentionHeaderText = "Suggested Members",
      mentionNoResultsText = "No matches",
      mentionPopupStrategy = "fixed",
      mentionPopupWidth = 320,
      onMentionPick,

      showHint = true,
    },
    ref,
  ) => {
    const isControlled = typeof value === "string";
    const [innerText, setInnerText] = useState(defaultValue ?? "");
    const text = isControlled ? (value as string) : innerText;

    const wrapperRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // IME composition guard (avoid sending on Enter mid-composition)
    const isComposingRef = useRef(false);

    // Mention state
    const [mentionOpen, setMentionOpen] = useState(false);
    const [mentionQuery, setMentionQuery] = useState("");
    const [mentionIndex, setMentionIndex] = useState(0);

    // Emoji popover
    const [emojiOpen, setEmojiOpen] = useState(false);

    // Fixed popup positioning (best for overflow containers)
    const [popupStyle, setPopupStyle] = useState<React.CSSProperties | null>(
      null,
    );

    const setText = (v: string) => {
      if (!isControlled) setInnerText(v);
      onChange?.(v);
    };

    // Auto-resize textarea
    const resize = () => {
      const el = textareaRef.current;
      if (!el) return;

      el.style.height = "auto";
      const next = Math.min(el.scrollHeight, maxHeight);
      el.style.height = `${next}px`;
    };

    useEffect(() => {
      resize();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [text, maxHeight]);

    // expose methods
    const insertTextAtCaret = (str: string, moveCursor = true) => {
      const el = textareaRef.current;
      if (!el) return;

      const start = el.selectionStart ?? 0;
      const end = el.selectionEnd ?? 0;
      const newText = text.substring(0, start) + str + text.substring(end);

      setText(newText);

      if (moveCursor) {
        requestAnimationFrame(() => {
          const pos = start + str.length;
          el.selectionStart = el.selectionEnd = pos;
          el.focus();
        });
      }
    };

    useImperativeHandle(ref, () => ({
      clear: () => {
        setText("");
        setMentionOpen(false);
        setEmojiOpen(false);
        resize();
      },
      setValue: (v) => {
        setText(v);
        setMentionOpen(false);
        resize();
      },
      focus: () => textareaRef.current?.focus(),
      insertText: (t) => insertTextAtCaret(t),
      insertEmoji: (emoji) => insertTextAtCaret(emoji),
    }));

    // -------- Mentions filtering (with lightweight ranking) --------

    const filteredMentions = useMemo(() => {
      if (!mentionOpen) return [];
      const q = mentionQuery.trim().toLowerCase();

      const scored = mentionOptions
        .map((m) => {
          const u = m.username.toLowerCase();
          const d = (m.displayName ?? "").toLowerCase();
          let score = 0;

          if (!q) score += 1;
          if (u === q) score += 100;
          if (u.startsWith(q)) score += 50;
          if (u.includes(q)) score += 20;
          if (d.startsWith(q)) score += 10;
          if (d.includes(q)) score += 5;

          return { m, score };
        })
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, mentionResultsLimit)
        .map(({ m }) => m);

      return scored;
    }, [mentionOpen, mentionQuery, mentionOptions, mentionResultsLimit]);

    const updateMentionFromCaret = () => {
      if (!enableMentions) return;
      const el = textareaRef.current;
      if (!el) return;

      const caret = el.selectionStart ?? 0;
      const found = findMentionQuery(text, caret);

      if (found) {
        setMentionOpen(true);
        setMentionQuery(found.query);
        setMentionIndex(0);
      } else {
        setMentionOpen(false);
      }
    };

    const confirmMention = (user: MentionOption) => {
      const el = textareaRef.current;
      if (!el) return;

      const caret = el.selectionStart ?? 0;
      const found = findMentionQuery(text, caret);
      if (!found) return;

      const before = text.substring(0, found.start);
      const after = text.substring(found.end);

      // replace "@query" with "@username " (ensure trailing space)
      const inserted = `@${user.username} `;
      const next = before + inserted + after;

      setText(next);
      setMentionOpen(false);
      onMentionPick?.(user);

      requestAnimationFrame(() => {
        const pos = before.length + inserted.length;
        el.selectionStart = el.selectionEnd = pos;
        el.focus();
      });
    };

    // Compute popup position for fixed strategy
    const computePopupPosition = () => {
      if (mentionPopupStrategy !== "fixed") return;
      const wrap = wrapperRef.current;
      if (!wrap) return;

      const rect = wrap.getBoundingClientRect();

      const desiredWidth =
        mentionPopupWidth === "input"
          ? rect.width
          : typeof mentionPopupWidth === "number"
            ? mentionPopupWidth
            : 320;

      const w = clamp(desiredWidth, 240, Math.max(240, window.innerWidth - 16));
      const left = clamp(rect.left, 8, window.innerWidth - w - 8);

      // place ABOVE input (bottom aligned to wrapper top)
      const bottom = window.innerHeight - rect.top + 8;

      setPopupStyle({
        position: "fixed",
        left,
        bottom,
        width: w,
        zIndex: 60,
      });
    };

    useEffect(() => {
      if (!mentionOpen) return;

      computePopupPosition();

      const onScrollOrResize = () => computePopupPosition();
      window.addEventListener("resize", onScrollOrResize);
      window.addEventListener("scroll", onScrollOrResize, true);

      return () => {
        window.removeEventListener("resize", onScrollOrResize);
        window.removeEventListener("scroll", onScrollOrResize, true);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mentionOpen, mentionPopupStrategy, mentionPopupWidth, text]);

    // click outside => close popovers
    useEffect(() => {
      const handler = (e: MouseEvent) => {
        const wrap = wrapperRef.current;
        if (!wrap) return;

        if (!wrap.contains(e.target as Node)) {
          setMentionOpen(false);
          setEmojiOpen(false);
        }
      };

      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, []);

    // -------- Submit --------

    const canInteract = !disabled && !isSending;
    const canSubmit = canInteract && !!text.trim() && !!onSendMessage;

    const handleSubmit = async () => {
      if (!canSubmit) return;

      const payload = text;
      const mentions = extractMentions(payload);

      await onSendMessage?.(payload, mentions);

      setText("");
      setMentionOpen(false);
      setEmojiOpen(false);
      resize();
    };

    const hintText = useMemo(() => {
      if (!showHint) return null;
      if (submitHotkey === "enter")
        return "Enter to send • Shift+Enter for new line";
      if (submitHotkey === "ctrlEnter")
        return "Ctrl+Enter to send • Enter for new line";
      if (submitHotkey === "metaEnter")
        return "⌘+Enter to send • Enter for new line";
      return null;
    }, [submitHotkey, showHint]);

    // -------- Events --------

    const handleKeyDown = (e: React.KeyboardEvent) => {
      // Mention navigation
      if (mentionOpen) {
        if (filteredMentions.length > 0) {
          if (e.key === "ArrowUp") {
            e.preventDefault();
            setMentionIndex(
              (p) =>
                (p - 1 + filteredMentions.length) % filteredMentions.length,
            );
            return;
          }
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setMentionIndex((p) => (p + 1) % filteredMentions.length);
            return;
          }
          if (e.key === "Enter" || e.key === "Tab") {
            e.preventDefault();
            confirmMention(filteredMentions[mentionIndex]);
            return;
          }
        }

        if (e.key === "Escape") {
          setMentionOpen(false);
          return;
        }
      }

      // Submit hotkeys
      if (isComposingRef.current) return;
      if (!onSendMessage) return;
      if (submitHotkey === "none") return;

      const isEnter = e.key === "Enter";
      if (!isEnter) return;

      const ctrl = e.ctrlKey;
      const meta = e.metaKey;

      const shouldSend =
        (submitHotkey === "enter" && !e.shiftKey) ||
        (submitHotkey === "ctrlEnter" && ctrl) ||
        (submitHotkey === "metaEnter" && meta);

      if (shouldSend) {
        e.preventDefault();
        handleSubmit();
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const next = e.target.value;
      if (typeof maxLength === "number" && next.length > maxLength) return;

      setText(next);
      requestAnimationFrame(updateMentionFromCaret);
    };

    const handleCaretEvents = () => {
      requestAnimationFrame(updateMentionFromCaret);
    };

    // -------- Emoji --------

    const onClickEmoji = () => {
      if (!canInteract) return;
      if (!showEmojiButton) return;

      if (emojiMode === "external") {
        onEmojiClick?.();
        return;
      }
      setEmojiOpen((v) => !v);
    };

    const pickEmoji = (emoji: string) => {
      insertTextAtCaret(emoji);
      setEmojiOpen(false);
    };

    // -------------------- UI --------------------

    return (
      <div ref={wrapperRef} className={cn("relative w-full group", className)}>
        {/* Mention Popup */}
        {enableMentions && mentionOpen && (
          <div
            className={cn(
              "rounded-xl shadow-2xl overflow-hidden border border-zinc-800 bg-zinc-950",
              "animate-in fade-in slide-in-from-bottom-2",
            )}
            style={
              mentionPopupStrategy === "fixed"
                ? (popupStyle ?? undefined)
                : undefined
            }
          >
            <div className="p-1">
              <div className="px-2 py-1 text-[10px] uppercase text-zinc-500 font-bold tracking-wider">
                {mentionHeaderText}
              </div>

              {filteredMentions.length === 0 ? (
                <div className="px-2 py-2 text-xs text-zinc-500">
                  {mentionNoResultsText}
                </div>
              ) : (
                filteredMentions.map((user, i) => (
                  <button
                    key={user.id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()} // keep textarea focused
                    onClick={() => confirmMention(user)}
                    onMouseEnter={() => setMentionIndex(i)}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left transition-colors",
                      i === mentionIndex
                        ? "bg-cyan-500/10"
                        : "hover:bg-zinc-900",
                    )}
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] text-white font-bold shrink-0">
                      {user.username[0]?.toUpperCase()}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span
                        className={cn(
                          "text-xs font-semibold truncate",
                          i === mentionIndex
                            ? "text-cyan-300"
                            : "text-zinc-100",
                        )}
                      >
                        {user.displayName || user.username}
                      </span>
                      <span className="text-[10px] text-zinc-500 truncate">
                        @{user.username}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Emoji Popup (internal) */}
        {showEmojiButton && emojiMode === "internal" && emojiOpen && (
          <div className="absolute bottom-full left-0 mb-2 w-[min(320px,calc(100vw-24px))] bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2">
            <div className="p-2">
              <div className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider px-1 pb-2">
                Emojis
              </div>
              <div className="grid grid-cols-8 gap-1">
                {emojiList.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onMouseDown={(ev) => ev.preventDefault()}
                    onClick={() => pickEmoji(e)}
                    className="h-8 w-8 rounded-lg hover:bg-white/5 text-lg flex items-center justify-center"
                    aria-label={`emoji ${e}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input */}
        <div
          className={cn(
            "flex items-end gap-2 p-2 rounded-[24px] bg-zinc-900/80 border border-white/5",
            "focus-within:border-white/10 focus-within:ring-1 focus-within:ring-white/10 transition-all",
            (!canInteract || disabled) && "opacity-60 pointer-events-none",
          )}
        >
          {/* Left actions */}
          {showEmojiButton && (
            <button
              type="button"
              onClick={onClickEmoji}
              className="p-2.5 text-zinc-400 hover:text-cyan-400 hover:bg-white/5 rounded-full transition-colors shrink-0"
              aria-label="Emoji"
            >
              <Smile size={20} />
            </button>
          )}

          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onKeyUp={handleCaretEvents}
            onClick={handleCaretEvents}
            onSelect={handleCaretEvents}
            onFocus={handleCaretEvents}
            onCompositionStart={() => (isComposingRef.current = true)}
            onCompositionEnd={() => (isComposingRef.current = false)}
            placeholder={placeholder}
            rows={minRows}
            className="flex-1 bg-transparent resize-none outline-none py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 overflow-y-auto"
            style={{ minHeight: "44px", maxHeight }}
          />

          {/* Clear button */}
          {showClearButton && text.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setText("");
                setMentionOpen(false);
                setEmojiOpen(false);
                textareaRef.current?.focus();
                resize();
              }}
              className="p-2.5 text-zinc-500 hover:text-zinc-200 hover:bg-white/5 rounded-full transition-colors shrink-0"
              aria-label="Clear"
            >
              <X size={18} />
            </button>
          )}

          {/* Send button */}
          {showSendButton && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={cn(
                "shrink-0 transition-all duration-300",
                sendButtonVariant === "icon"
                  ? "p-2.5 rounded-full"
                  : "px-4 h-11 rounded-full",
                canSubmit
                  ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20 hover:scale-[1.03] active:scale-95"
                  : "bg-white/5 text-zinc-600 hover:text-zinc-400",
              )}
              aria-label="Send"
            >
              {isSending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : sendButtonVariant === "icon" ? (
                <SendHorizontal size={18} />
              ) : (
                <span className="text-sm font-semibold">{sendButtonText}</span>
              )}
            </button>
          )}
        </div>

        {/* Footer row (hint + counter) */}
        {(hintText || typeof maxLength === "number") && (
          <div className="mt-1 flex items-center justify-between px-3">
            <div className="text-[10px] text-zinc-600 opacity-0 group-focus-within:opacity-100 transition-opacity">
              {hintText ?? ""}
            </div>
            {typeof maxLength === "number" && (
              <div className="text-[10px] text-zinc-600 tabular-nums">
                {text.length}/{maxLength}
              </div>
            )}
          </div>
        )}
      </div>
    );
  },
);

SmartChatInput.displayName = "SmartChatInput";
