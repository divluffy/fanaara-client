"use client";

import React, { useMemo, useState } from "react";
import type { HistoryEntry, SavedSearch, SearchType } from "../_types";
import { timeAgo } from "../_lib/time";
import { CardShell, cn, IconButton } from "./ui";

type Props = {
  query: string;
  history: HistoryEntry[];
  saved: SavedSearch[];
  suggestions: string[];

  onRunQuery: (q: string, type?: SearchType) => void;

  onRemoveHistory: (id: string) => void;
  onClearHistory: () => void;

  onDeleteSaved: (id: string) => void;
  onRenameSaved: (id: string, name: string) => void;
};

function typeLabel(t: SearchType) {
  switch (t) {
    case "all":
      return "All";
    case "users":
      return "Users";
    case "creators":
      return "Creators";
    case "posts":
      return "Posts";
    case "anime":
      return "Anime";
    case "manga":
      return "Manga";
  }
}

export default function LogsPanel({
  query,
  history,
  saved,
  suggestions,
  onRunQuery,
  onRemoveHistory,
  onClearHistory,
  onDeleteSaved,
  onRenameSaved,
}: Props) {
  const hasQuery = Boolean(query.trim());

  // inline edit for saved name
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");

  const topSavedWhenTyping = useMemo(() => saved.slice(0, 3), [saved]);

  return (
    <CardShell className="p-0">
      <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <div className="text-sm font-extrabold">Search Logs</div>
        <div className="mt-0.5 text-xs text-zinc-500">Recent • Suggestions • Saved</div>
      </div>

      <div className="p-4">
        {/* When user is typing: show Auto Suggestions (and optional small Saved) */}
        {hasQuery ? (
          <div className="space-y-4">
            <section>
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Suggestions</div>
              </div>

              {suggestions.length === 0 ? (
                <div className="mt-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
                  No suggestions. Keep typing…
                </div>
              ) : (
                <ul className="mt-2 space-y-2">
                  {suggestions.map((s) => (
                    <li key={s}>
                      <button
                        type="button"
                        onClick={() => onRunQuery(s)}
                        className={cn(
                          "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-left text-sm transition",
                          "hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 dark:focus-visible:ring-zinc-700",
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate font-semibold">{s}</span>
                          <span className="text-xs text-zinc-500">↵</span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* small saved while typing (optional) */}
            {topSavedWhenTyping.length ? (
              <section>
                <div className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Saved</div>
                <ul className="mt-2 space-y-2">
                  {topSavedWhenTyping.map((s) => (
                    <li key={s.id}>
                      <div className="flex items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950">
                        <button
                          type="button"
                          onClick={() => onRunQuery(s.query, s.type)}
                          className="min-w-0 flex-1 text-left"
                        >
                          <div className="truncate text-sm font-semibold">{s.name}</div>
                          <div className="mt-0.5 truncate text-xs text-zinc-500">
                            {s.query} • {typeLabel(s.type)}
                          </div>
                        </button>

                        <IconButton aria-label="Delete saved" title="Delete" onClick={() => onDeleteSaved(s.id)}>
                          🗑
                        </IconButton>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        ) : (
          // When input empty: show Previous + Custom
          <div className="space-y-6">
            {/* Previous / Global History */}
            <section>
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Recent searches</div>
                {history.length ? (
                  <button
                    type="button"
                    onClick={onClearHistory}
                    className="text-xs font-semibold text-zinc-600 hover:underline dark:text-zinc-300"
                  >
                    Clear all
                  </button>
                ) : null}
              </div>

              {history.length === 0 ? (
                <div className="mt-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
                  No recent searches yet.
                </div>
              ) : (
                <ul className="mt-2 space-y-2">
                  {history.slice(0, 10).map((h) => (
                    <li key={h.id}>
                      <div className="flex items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950">
                        <button
                          type="button"
                          onClick={() => onRunQuery(h.query, h.type)}
                          className="min-w-0 flex-1 text-left"
                        >
                          <div className="truncate text-sm font-semibold">{h.query}</div>
                          <div className="mt-0.5 text-xs text-zinc-500">
                            {timeAgo(h.executedAt)} • {typeLabel(h.type)}
                          </div>
                        </button>

                        <IconButton
                          aria-label="Remove from history"
                          title="Remove"
                          onClick={() => onRemoveHistory(h.id)}
                        >
                          ✕
                        </IconButton>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Custom / Saved */}
            <section>
              <div className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Saved searches</div>

              {saved.length === 0 ? (
                <div className="mt-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
                  Save a search using the ☆ button in the search bar.
                </div>
              ) : (
                <ul className="mt-2 space-y-2">
                  {saved.map((s) => {
                    const editing = editingId === s.id;

                    return (
                      <li key={s.id}>
                        <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950">
                          <div className="flex items-start justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => onRunQuery(s.query, s.type)}
                              className="min-w-0 flex-1 text-left"
                            >
                              {editing ? (
                                <input
                                  value={draftName}
                                  onChange={(e) => setDraftName(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      const name = draftName.trim() || s.name;
                                      onRenameSaved(s.id, name);
                                      setEditingId(null);
                                    }
                                    if (e.key === "Escape") {
                                      setEditingId(null);
                                    }
                                  }}
                                  onBlur={() => {
                                    const name = draftName.trim() || s.name;
                                    onRenameSaved(s.id, name);
                                    setEditingId(null);
                                  }}
                                  className="w-full rounded-lg border border-zinc-200 bg-white px-2 py-1 text-sm font-semibold outline-none dark:border-zinc-800 dark:bg-zinc-900"
                                  autoFocus
                                />
                              ) : (
                                <div className="truncate text-sm font-semibold">{s.name}</div>
                              )}

                              <div className="mt-0.5 truncate text-xs text-zinc-500">
                                {s.query} • {typeLabel(s.type)}
                              </div>
                            </button>

                            <div className="flex items-center gap-2">
                              <IconButton
                                aria-label="Edit saved name"
                                title="Edit name"
                                onClick={() => {
                                  setEditingId(s.id);
                                  setDraftName(s.name);
                                }}
                              >
                                ✎
                              </IconButton>

                              <IconButton aria-label="Delete saved" title="Delete" onClick={() => onDeleteSaved(s.id)}>
                                🗑
                              </IconButton>
                            </div>
                          </div>

                          <div className="mt-2">
                            <button
                              type="button"
                              onClick={() => onRunQuery(s.query, s.type)}
                              className="w-full rounded-lg bg-zinc-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
                            >
                              Run
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>
        )}
      </div>
    </CardShell>
  );
}
