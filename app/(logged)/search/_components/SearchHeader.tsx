"use client";

import React, { useEffect } from "react";
import type { SearchType, SortMode } from "../_types";
import { cn, IconButton, Kbd, PillButton } from "./ui";

type Props = {
  inputRef: React.RefObject<HTMLInputElement | null>;
  query: string;
  onQueryChange: (v: string) => void;
  onQueryCommit: (v: string) => void;
  onClear: () => void;

  type: SearchType;
  onTypeChange: (t: SearchType) => void;

  sort: SortMode;
  onSortChange: (s: SortMode) => void;

  isSaved: boolean;
  onToggleSave: () => void;
};

const TYPES: Array<{ id: SearchType; label: string }> = [
  { id: "all", label: "All" },
  { id: "users", label: "Users" },
  { id: "posts", label: "Posts" },
  { id: "anime", label: "Anime" },
  { id: "manga", label: "Manga" },
  { id: "creators", label: "Creators" },
];

export default function SearchHeader({
  inputRef,
  query,
  onQueryChange,
  onQueryCommit,
  onClear,
  type,
  onTypeChange,
  sort,
  onSortChange,
  isSaved,
  onToggleSave,
}: Props) {
  // "/" to focus input (optional shortcut)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "/") return;
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      e.preventDefault();
      inputRef.current?.focus();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [inputRef]);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      {/* line 1: search + sort */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950">
          <span className="text-zinc-500">🔎</span>

          <input
            ref={(el) => {
              inputRef.current = el;
            }}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onQueryCommit(query);
              if (e.key === "Escape") onClear();
            }}
            placeholder="Search users, posts, anime, manga..."
            className="w-full flex-1 bg-transparent text-sm outline-none"
            aria-label="Search"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />

          {query.trim() ? (
            <IconButton onClick={onClear} aria-label="Clear search" title="Clear">
              ✕
            </IconButton>
          ) : (
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span className="hidden sm:inline">Focus</span>
              <Kbd>/</Kbd>
            </div>
          )}

          {query.trim() ? (
            <IconButton
              active={isSaved}
              onClick={onToggleSave}
              aria-label={isSaved ? "Unsave search" : "Save search"}
              title={isSaved ? "Saved" : "Save"}
              className={cn(isSaved ? "text-yellow-600 dark:text-yellow-400" : "text-zinc-600 dark:text-zinc-300")}
            >
              {isSaved ? "★" : "☆"}
            </IconButton>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Sort</label>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortMode)}
            className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
            aria-label="Sort"
          >
            <option value="relevance">Relevance</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      {/* line 2: type tabs */}
      <div className="mt-3 flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <PillButton key={t.id} active={type === t.id} onClick={() => onTypeChange(t.id)}>
            {t.label}
          </PillButton>
        ))}
      </div>
    </div>
  );
}
