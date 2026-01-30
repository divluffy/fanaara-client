// app/(public)/playground/options/page.tsx
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
    // اربط API هنا (Optimistic already داخل المودال)
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
      />
    </div>
  );
}

export default function OptionsExamplesPage() {
  const examples = useMemo(
    () => [
      {
        title: "Post (Feed) — toggles + copy + report",
        options: [
          { id: "toggle_save", value: false },
          { id: "toggle_notifications", value: true },
          { id: "copy_link", value: "https://your.app/post/p_1001" },
          { id: "copy_id", value: "p_1001" },
          { id: "copy_text", value: "هذا نص المنشور…" },
          "not_interested",
          "hide",
          "report",
        ] as OptionsSheetOptionInput[],
        code: `import { useState } from "react";
import OptionsSheet from "@/components/OptionsSheet";

export default function Demo() {
  const [open, setOpen] = useState(false);

  const options = [
    { id: "toggle_save", value: false },
    { id: "toggle_notifications", value: true },
    { id: "copy_link", value: "https://your.app/post/p_1001" },
    { id: "copy_id", value: "p_1001" },
    { id: "copy_text", value: "هذا نص المنشور…" },
    "not_interested",
    "hide",
    "report",
  ];

  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      <OptionsSheet
        open={open}
        onOpenChange={setOpen}
        options={options}
        onAction={(id, next) => console.log(id, next)}
      />
    </>
  );
}`,
      },

      {
        title: "User — follow/mute/block + message + copy",
        options: [
          { id: "follow_toggle", value: true },
          { id: "mute_toggle", value: false },
          { id: "block_toggle", value: false },
          "message",
          { id: "copy_link", value: "https://your.app/u/u_2002" },
          { id: "copy_id", value: "u_2002" },
          "report",
        ] as OptionsSheetOptionInput[],
        code: `import { useState } from "react";
import OptionsSheet from "@/components/OptionsSheet";

export default function Demo() {
  const [open, setOpen] = useState(false);

  const options = [
    { id: "follow_toggle", value: true },
    { id: "mute_toggle", value: false },
    { id: "block_toggle", value: false },
    "message",
    { id: "copy_link", value: "https://your.app/u/u_2002" },
    { id: "copy_id", value: "u_2002" },
    "report",
  ];

  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      <OptionsSheet open={open} onOpenChange={setOpen} options={options} />
    </>
  );
}`,
      },

      {
        title: "Chat — pin/mute/archive/read + copy_id",
        options: [
          { id: "pin_toggle", value: true },
          { id: "mute_toggle", value: false },
          { id: "archive_toggle", value: false },
          { id: "mark_read_toggle", value: false },
          { id: "copy_id", value: "ch_5005" },
          "report",
        ] as OptionsSheetOptionInput[],
        code: `import { useState } from "react";
import OptionsSheet from "@/components/OptionsSheet";

export default function Demo() {
  const [open, setOpen] = useState(false);

  const options = [
    { id: "pin_toggle", value: true },
    { id: "mute_toggle", value: false },
    { id: "archive_toggle", value: false },
    { id: "mark_read_toggle", value: false },
    { id: "copy_id", value: "ch_5005" },
    "report",
  ];

  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      <OptionsSheet open={open} onOpenChange={setOpen} options={options} />
    </>
  );
}`,
      },

      {
        title: "Owner actions — edit/delete (no extra logic)",
        options: [
          "edit",
          "delete",
          { id: "copy_id", value: "p_owner" },
        ] as OptionsSheetOptionInput[],
        code: `import { useState } from "react";
import OptionsSheet from "@/components/OptionsSheet";

export default function Demo() {
  const [open, setOpen] = useState(false);

  const options = ["edit", "delete", { id: "copy_id", value: "p_owner" }];

  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      <OptionsSheet open={open} onOpenChange={setOpen} options={options} />
    </>
  );
}`,
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
