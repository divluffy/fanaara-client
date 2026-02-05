"use client";

import React from "react";
import { Button } from "@/design/DeButton";
import { IoAlertCircleOutline } from "react-icons/io5";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex h-[100svh] w-full items-center justify-center bg-background p-6 text-foreground">
      <div className="w-full max-w-md rounded-3xl border border-border-subtle bg-background-elevated p-5 shadow-[var(--shadow-elevated)]">
        <div className="flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-2xl border border-border-subtle bg-surface-soft">
            <IoAlertCircleOutline className="size-7 text-danger-500" />
          </div>
          <div>
            <div className="text-sm font-extrabold text-foreground-strong">Something went wrong</div>
            <div className="mt-1 text-xs text-foreground-muted">Try again — the UI will recover gracefully.</div>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button variant="solid" tone="brand" className="flex-1" onClick={reset}>
            Try again
          </Button>
          <Button variant="soft" tone="neutral" className="flex-1" onClick={() => location.reload()}>
            Reload
          </Button>
        </div>
      </div>
    </div>
  );
}
