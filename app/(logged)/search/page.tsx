"use client";

import React, { useMemo, useRef, useState } from "react";
import {
  SmartChatInput,
  ChatInputHandle,
  MentionOption,
} from "@/components/editor/AnimePostComposer";
import { cn } from "@/utils";
import { MessageSquareText, PenSquare, Send } from "lucide-react";

const MOCK_USERS: MentionOption[] = [
  { id: "u1", username: "naruto_uzumaki", displayName: "Naruto" },
  { id: "u2", username: "luffy_gear5", displayName: "Monkey D. Luffy" },
  { id: "u3", username: "ichigo_kurosaki", displayName: "Ichigo" },
  { id: "u4", username: "gojo_satoru", displayName: "Gojo" },
  { id: "u5", username: "eren_yeager", displayName: "Eren" },
  { id: "u6", username: "mikasa_ack", displayName: "Mikasa" },
  { id: "u7", username: "nami_catburglar", displayName: "Nami" },
];

type LogItem = {
  id: string;
  kind: "comment" | "message" | "post";
  text: string;
  mentions: string[];
  time: string;
};

function nowTime() {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function SmartChatInputExamplesPage() {
  const [isSending, setIsSending] = useState(false);
  const [logs, setLogs] = useState<LogItem[]>([]);

  const commentRef = useRef<ChatInputHandle>(null);
  const messageRef = useRef<ChatInputHandle>(null);
  const postRef = useRef<ChatInputHandle>(null);

  const addLog = (kind: LogItem["kind"], text: string, mentions: string[]) => {
    setLogs((prev) => [
      {
        id: Math.random().toString(36).slice(2),
        kind,
        text,
        mentions,
        time: nowTime(),
      },
      ...prev,
    ]);
  };

  const simulateSend = async (
    kind: LogItem["kind"],
    text: string,
    mentions: string[],
  ) => {
    setIsSending(true);
    await new Promise((r) => setTimeout(r, 600));
    addLog(kind, text, mentions);
    setIsSending(false);
  };

  const layoutCard =
    "bg-zinc-950 border border-zinc-800/70 rounded-2xl p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]";

  const help = useMemo(
    () => [
      "Type @ to open mentions popup",
      "ArrowUp/ArrowDown to navigate",
      "Enter/Tab to pick",
      "Escape to close",
    ],
    [],
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            SmartChatInput — Multi Cases
          </h1>
          <p className="text-sm text-zinc-400">
            Mentions popup uses{" "}
            <span className="text-zinc-200 font-medium">fixed positioning</span>{" "}
            to avoid overflow clipping ✅
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {help.map((t) => (
              <span
                key={t}
                className="text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300"
              >
                {t}
              </span>
            ))}
          </div>
        </header>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CASE 1: Comment */}
          <section className={layoutCard}>
            <div className="flex items-center gap-2 mb-3">
              <MessageSquareText className="text-cyan-400" size={18} />
              <h2 className="font-semibold">Case 1 — Comment</h2>
              <span className="ml-auto text-[11px] text-zinc-500">
                Enter sends
              </span>
            </div>

            <p className="text-sm text-zinc-400 mb-4">
              Default setup: emoji + send button. Mentions popup opens above
              input.
            </p>

            <SmartChatInput
              ref={commentRef}
              placeholder="Add a comment... (try: @lu)"
              mentionOptions={MOCK_USERS}
              mentionPopupStrategy="fixed"
              mentionPopupWidth="input"
              submitHotkey="enter"
              isSending={isSending}
              onSendMessage={(text, mentions) =>
                simulateSend("comment", text, mentions)
              }
            />

            <div className="mt-4 flex gap-2">
              <button
                className="text-xs px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
                onClick={() => commentRef.current?.setValue("Nice take @go")}
              >
                Prefill
              </button>
              <button
                className="text-xs px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
                onClick={() => commentRef.current?.focus()}
              >
                Focus
              </button>
            </div>
          </section>

          {/* CASE 2: Message (no emoji, icon send) */}
          <section className={layoutCard}>
            <div className="flex items-center gap-2 mb-3">
              <Send className="text-purple-400" size={18} />
              <h2 className="font-semibold">Case 2 — Direct Message</h2>
              <span className="ml-auto text-[11px] text-zinc-500">
                Minimal actions
              </span>
            </div>

            <p className="text-sm text-zinc-400 mb-4">
              No emoji button. Still supports mentions + Enter send.
            </p>

            {/* This wrapper simulates overflow containers */}
            <div className="rounded-2xl bg-black/40 border border-zinc-800 p-3 overflow-hidden">
              <div className="text-xs text-zinc-500 mb-2">
                Container has{" "}
                <span className="text-zinc-300">overflow-hidden</span> — popup
                still works ✅
              </div>

              <SmartChatInput
                ref={messageRef}
                placeholder="Message... (try: @nar)"
                mentionOptions={MOCK_USERS}
                mentionPopupStrategy="fixed"
                mentionPopupWidth={360}
                submitHotkey="enter"
                showEmojiButton={false}
                isSending={isSending}
                onSendMessage={(text, mentions) =>
                  simulateSend("message", text, mentions)
                }
              />
            </div>

            <div className="mt-4 flex gap-2">
              <button
                className="text-xs px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
                onClick={() => messageRef.current?.insertText("🔥")}
              >
                Insert 🔥
              </button>
              <button
                className="text-xs px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
                onClick={() => messageRef.current?.clear()}
              >
                Clear
              </button>
            </div>
          </section>

          {/* CASE 3: Post composer (Ctrl+Enter, pill send, counter, clear) */}
          <section className={cn(layoutCard, "lg:col-span-2")}>
            <div className="flex items-center gap-2 mb-3">
              <PenSquare className="text-emerald-400" size={18} />
              <h2 className="font-semibold">Case 3 — Create Post</h2>
              <span className="ml-auto text-[11px] text-zinc-500">
                Ctrl+Enter sends
              </span>
            </div>

            <p className="text-sm text-zinc-400 mb-4">
              Bigger composer behavior: multi-line by default,{" "}
              <span className="text-zinc-200">Ctrl+Enter</span> to post, pill
              button, char limit, clear button, mentions popup.
            </p>

            <SmartChatInput
              ref={postRef}
              placeholder="Write a post... Mention friends with @ (try: @luf)"
              mentionOptions={MOCK_USERS}
              mentionPopupStrategy="fixed"
              mentionPopupWidth="input"
              submitHotkey="ctrlEnter"
              maxLength={420}
              minRows={3}
              maxHeight={220}
              showClearButton
              sendButtonVariant="pill"
              sendButtonText="Post"
              isSending={isSending}
              onSendMessage={(text, mentions) =>
                simulateSend("post", text, mentions)
              }
            />

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                className="text-xs px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
                onClick={() =>
                  postRef.current?.setValue(
                    "Hot take: @gojo_satoru would solo this arc.\nWhat do you think?",
                  )
                }
              >
                Prefill Post
              </button>
              <button
                className="text-xs px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
                onClick={() => postRef.current?.insertEmoji("✨")}
              >
                Insert ✨
              </button>
              <button
                className="text-xs px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
                onClick={() => postRef.current?.focus()}
              >
                Focus
              </button>
            </div>
          </section>
        </div>

        {/* Logs */}
        <section className={layoutCard}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Send Logs</h3>
            <button
              className="text-xs px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
              onClick={() => setLogs([])}
            >
              Clear Logs
            </button>
          </div>

          {logs.length === 0 ? (
            <div className="text-sm text-zinc-500">
              No sends yet. Try sending something with mentions 🙂
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((l) => (
                <div
                  key={l.id}
                  className="rounded-xl bg-black/40 border border-zinc-800 p-3"
                >
                  <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
                    <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-300">
                      {l.kind.toUpperCase()}
                    </span>
                    <span>{l.time}</span>
                    <span className="ml-auto">
                      Mentions:{" "}
                      <span className="text-zinc-300">
                        {l.mentions.length ? l.mentions.join(", ") : "—"}
                      </span>
                    </span>
                  </div>
                  <div className="text-sm text-zinc-200 whitespace-pre-wrap">
                    {l.text}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
