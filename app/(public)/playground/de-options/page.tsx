// app\(public)\playground\de-options\page.tsx
"use client";

import React, { useMemo, useState } from "react";
import OptionsSheet, {
  OptionsSheetOptionInput,
  ActionId,
} from "@/components/OptionsSheet";

function ExampleBlock(props: {
  title: string;
  options: OptionsSheetOptionInput[];
  code: string;
}) {
  const [open, setOpen] = useState(false);

  const onAction = async (id: ActionId, next?: boolean | string) => {
    console.log("[OptionsAction]", { id, next });

    // مثال: هنا تربط UseCases / API
    // switch (id) { ... }
  };

  return (
    <div className="rounded-2xl border border-border-subtle bg-background-elevated p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="truncate text-sm font-bold text-foreground-strong">
          {props.title}
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="shrink-0 rounded-xl border border-border-subtle bg-surface-soft/70 px-3 py-2 text-sm font-semibold text-foreground-strong hover:bg-surface-soft/90"
        >
          فتح
        </button>
      </div>

      <pre className="mt-3 overflow-auto rounded-xl border border-border-subtle bg-surface-soft/30 p-3 text-xs text-foreground-strong">
        {props.code}
      </pre>

      <OptionsSheet
        open={open}
        onOpenChange={setOpen}
        options={props.options}
        onAction={onAction}
        dir="rtl"
        // t={t} // مرّر translator من نظام i18n عندك
      />
    </div>
  );
}

export default function OptionsExamplesPage() {
  const examples = useMemo(
    () => [
      {
        title: "Post (Viewer) — Save + Share + Copy + Moderation",
        options: [
          { id: "toggle_save", value: false },
          { id: "toggle_notifications", value: true },
          "share",
          { id: "copy_link", value: "https://your.app/post/p_1001" },
          { id: "copy_id", value: "p_1001" },
          { id: "copy_text", value: "هذا نص المنشور…" },
          "show_less_like_this",
          "not_interested",
          "hide",
          { id: "report", separatorBefore: true },
          { id: "block_toggle", value: false },
        ] as OptionsSheetOptionInput[],
        code: `// Post viewer options
const options = [
  { id: "toggle_save", value: false },
  { id: "toggle_notifications", value: true },
  "share",
  { id: "copy_link", value: "https://your.app/post/p_1001" },
  { id: "copy_id", value: "p_1001" },
  { id: "copy_text", value: "هذا نص المنشور…" },
  "show_less_like_this",
  "not_interested",
  "hide",
  { id: "report", separatorBefore: true },
  { id: "block_toggle", value: false },
];`,
      },

      {
        title:
          "Post (Owner/Creator) — Pin/Archive/Edit + Spoiler/NSFW + Delete",
        options: [
          { id: "pin_toggle", value: true },
          { id: "archive_toggle", value: false },
          "edit",
          { id: "toggle_spoiler", value: false },
          { id: "toggle_nsfw", value: false },
          { id: "delete", separatorBefore: true },
          {
            id: "copy_link",
            value: "https://your.app/post/p_owner",
            separatorBefore: true,
          },
        ] as OptionsSheetOptionInput[],
        code: `// Owner post options
const options = [
  { id: "pin_toggle", value: true },
  { id: "archive_toggle", value: false },
  "edit",
  { id: "toggle_spoiler", value: false },
  { id: "toggle_nsfw", value: false },
  { id: "delete", separatorBefore: true },
  { id: "copy_link", value: "https://your.app/post/p_owner", separatorBefore: true },
];`,
      },

      {
        title: "Video Post — Watch later + Share + Report",
        options: [
          { id: "toggle_watch_later", value: true },
          "share",
          { id: "copy_link", value: "https://your.app/video/v_3001" },
          "not_interested",
          { id: "report", separatorBefore: true },
        ] as OptionsSheetOptionInput[],
        code: `// Video options
const options = [
  { id: "toggle_watch_later", value: true },
  "share",
  { id: "copy_link", value: "https://your.app/video/v_3001" },
  "not_interested",
  { id: "report", separatorBefore: true },
];`,
      },

      {
        title: "Profile — Follow/Message/Mute + Block/Report + Copy",
        options: [
          { id: "follow_toggle", value: false },
          "message",
          { id: "mute_toggle", value: false },
          { id: "copy_link", value: "https://your.app/u/u_2002" },
          { id: "copy_id", value: "u_2002" },
          { id: "report", separatorBefore: true },
          { id: "block_toggle", value: false },
        ] as OptionsSheetOptionInput[],
        code: `// Profile options
const options = [
  { id: "follow_toggle", value: false },
  "message",
  { id: "mute_toggle", value: false },
  { id: "copy_link", value: "https://your.app/u/u_2002" },
  { id: "copy_id", value: "u_2002" },
  { id: "report", separatorBefore: true },
  { id: "block_toggle", value: false },
];`,
      },

      {
        title: "Anime Page — Library status + Favorites + Review/Rate + Share",
        options: [
          // status actions (same id repeated => use unique key)
          {
            key: "anime:planned",
            id: "set_library_status",
            value: "anime:planned",
          },
          {
            key: "anime:in_progress",
            id: "set_library_status",
            value: "anime:in_progress",
          },
          {
            key: "anime:completed",
            id: "set_library_status",
            value: "anime:completed",
          },
          {
            key: "anime:on_hold",
            id: "set_library_status",
            value: "anime:on_hold",
          },
          {
            key: "anime:dropped",
            id: "set_library_status",
            value: "anime:dropped",
          },

          { id: "favorite_toggle", value: false, separatorBefore: true },
          "rate",
          "review",
          "add_to_list",
          "share",
          { id: "copy_link", value: "https://your.app/anime/a_9001" },
          { id: "report", separatorBefore: true },
        ] as OptionsSheetOptionInput[],
        code: `// Anime page options
const options = [
  { key: "anime:planned", id: "set_library_status", value: "anime:planned" },
  { key: "anime:in_progress", id: "set_library_status", value: "anime:in_progress" },
  { key: "anime:completed", id: "set_library_status", value: "anime:completed" },
  { key: "anime:on_hold", id: "set_library_status", value: "anime:on_hold" },
  { key: "anime:dropped", id: "set_library_status", value: "anime:dropped" },

  { id: "favorite_toggle", value: false, separatorBefore: true },
  "rate",
  "review",
  "add_to_list",
  "share",
  { id: "copy_link", value: "https://your.app/anime/a_9001" },
  { id: "report", separatorBefore: true },
];`,
      },

      {
        title: "Custom List (Owner) — Private/Public + Share + Delete",
        options: [
          { id: "toggle_private", value: true },
          "share",
          { id: "copy_link", value: "https://your.app/list/l_7777" },
          { id: "delete", separatorBefore: true },
        ] as OptionsSheetOptionInput[],
        code: `// List options
const options = [
  { id: "toggle_private", value: true },
  "share",
  { id: "copy_link", value: "https://your.app/list/l_7777" },
  { id: "delete", separatorBefore: true },
];`,
      },

      {
        title: "Community — Join + Notifications + Share + Report",
        options: [
          { id: "join_toggle", value: true },
          { id: "toggle_notifications", value: false },
          "share",
          { id: "copy_link", value: "https://your.app/c/c_4444" },
          { id: "report", separatorBefore: true },
        ] as OptionsSheetOptionInput[],
        code: `// Community options
const options = [
  { id: "join_toggle", value: true },
  { id: "toggle_notifications", value: false },
  "share",
  { id: "copy_link", value: "https://your.app/c/c_4444" },
  { id: "report", separatorBefore: true },
];`,
      },

      {
        title: "Chat — Pin/Mute/Archive/Read + Copy ID + Report",
        options: [
          { id: "pin_toggle", value: true },
          { id: "mute_toggle", value: false },
          { id: "archive_toggle", value: false },
          { id: "mark_read_toggle", value: false },
          { id: "copy_id", value: "ch_5005" },
          { id: "report", separatorBefore: true },
        ] as OptionsSheetOptionInput[],
        code: `// Chat options
const options = [
  { id: "pin_toggle", value: true },
  { id: "mute_toggle", value: false },
  { id: "archive_toggle", value: false },
  { id: "mark_read_toggle", value: false },
  { id: "copy_id", value: "ch_5005" },
  { id: "report", separatorBefore: true },
];`,
      },
    ],
    [],
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {examples.map((ex) => (
          <ExampleBlock
            key={ex.title}
            title={ex.title}
            options={ex.options}
            code={ex.code}
          />
        ))}
      </div>
    </div>
  );
}
