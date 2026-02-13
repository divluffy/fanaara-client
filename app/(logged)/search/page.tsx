"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { HistoryEntry, SavedSearch, SearchType, SortMode } from "./_types";
import {
  MOCK_DB,
  TRENDING_QUERIES,
  INITIAL_HISTORY,
  INITIAL_SAVED,
} from "./mock-data";
import { buildAutoSuggestions, normalizeText, runSearch } from "./_lib/search";
import { readJson, writeJson } from "./_lib/storage";

import SearchHeader from "./_components/SearchHeader";
import LogsPanel from "./_components/LogsPanel";
import ResultsPane from "./_components/ResultsPane";

const HISTORY_KEY = "fanaara.search.history.v2";
const SAVED_KEY = "fanaara.search.saved.v2";

const MAX_HISTORY = 10;

export default function SearchPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const debounceTimerRef = useRef<number | null>(null);

  const [type, setType] = useState<SearchType>("all");
  const [sort, setSort] = useState<SortMode>("relevance");

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [saved, setSaved] = useState<SavedSearch[]>([]);

  // ──────────────────────────────────────────────────────────────
  // Load/Save localStorage
  // ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const h = readJson<HistoryEntry[]>(HISTORY_KEY, INITIAL_HISTORY).slice(
      0,
      MAX_HISTORY,
    );
    const s = readJson<SavedSearch[]>(SAVED_KEY, INITIAL_SAVED);
    setHistory(h);
    setSaved(s);
  }, []);

  useEffect(() => {
    writeJson(HISTORY_KEY, history.slice(0, MAX_HISTORY));
  }, [history]);

  useEffect(() => {
    writeJson(SAVED_KEY, saved);
  }, [saved]);

  // ──────────────────────────────────────────────────────────────
  // Debounce search input (200ms)
  // ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    const trimmed = query.trim();
    if (!trimmed) {
      setDebouncedQuery("");
      return;
    }

    debounceTimerRef.current = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, 200);

    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [query]);

  const commitQuery = useCallback((next: string) => {
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    setQuery(next);
    setDebouncedQuery(next);
  }, []);

  const clearQuery = useCallback(() => {
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    setQuery("");
    setDebouncedQuery("");
    inputRef.current?.focus();
  }, []);

  const isSearching = useMemo(() => {
    const a = normalizeText(query);
    const b = normalizeText(debouncedQuery);
    return Boolean(query.trim()) && a !== b;
  }, [query, debouncedQuery]);

  // ──────────────────────────────────────────────────────────────
  // Suggestions (Auto) – prefix match only
  // ──────────────────────────────────────────────────────────────
  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    return buildAutoSuggestions({
      query,
      history,
      saved,
      trending: TRENDING_QUERIES,
      pool: MOCK_DB.suggestionPool,
      limit: 8,
    });
  }, [query, history, saved]);

  // ──────────────────────────────────────────────────────────────
  // Search Results (mock filtering)
  // ──────────────────────────────────────────────────────────────
  const results = useMemo(() => {
    const q = debouncedQuery.trim();
    if (!q) return null;

    return runSearch({
      query: q,
      type,
      sort,
      db: MOCK_DB,
    });
  }, [debouncedQuery, type, sort]);

  // ──────────────────────────────────────────────────────────────
  // Record search into history (lightweight, debounced value only)
  // ──────────────────────────────────────────────────────────────
  const lastRecordedRef = useRef<{ key: string; at: number } | null>(null);

  useEffect(() => {
    const q = debouncedQuery.trim();
    if (!q || q.length < 2) return;

    const key = `${normalizeText(q)}|${type}`;
    const now = Date.now();

    // prevent duplicates + too-frequent inserts
    if (lastRecordedRef.current?.key === key) return;
    if (lastRecordedRef.current && now - lastRecordedRef.current.at < 800)
      return;

    lastRecordedRef.current = { key, at: now };

    setHistory((prev) => {
      const nq = normalizeText(q);
      const next = prev.filter(
        (h) => !(normalizeText(h.query) === nq && h.type === type),
      );
      const entry: HistoryEntry = {
        id: `h_${now}_${Math.random().toString(16).slice(2)}`,
        query: q,
        type,
        executedAt: now,
      };
      return [entry, ...next].slice(0, MAX_HISTORY);
    });
  }, [debouncedQuery, type]);

  // ──────────────────────────────────────────────────────────────
  // Saved star toggle
  // ──────────────────────────────────────────────────────────────
  const isSaved = useMemo(() => {
    const q = query.trim();
    if (!q) return false;
    const nq = normalizeText(q);
    return saved.some((s) => normalizeText(s.query) === nq && s.type === type);
  }, [saved, query, type]);

  const toggleSave = useCallback(() => {
    const q = query.trim();
    if (!q) return;

    setSaved((prev) => {
      const nq = normalizeText(q);
      const existing = prev.find(
        (s) => normalizeText(s.query) === nq && s.type === type,
      );
      if (existing) return prev.filter((s) => s.id !== existing.id);

      const now = Date.now();
      const name = q.length > 28 ? `${q.slice(0, 28)}…` : q;

      const next: SavedSearch = {
        id: `s_${now}_${Math.random().toString(16).slice(2)}`,
        name,
        query: q,
        type,
        createdAt: now,
      };
      return [next, ...prev];
    });
  }, [query, type]);

  // ──────────────────────────────────────────────────────────────
  // History actions
  // ──────────────────────────────────────────────────────────────
  const removeHistory = useCallback((id: string) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  // ──────────────────────────────────────────────────────────────
  // Saved actions
  // ──────────────────────────────────────────────────────────────
  const deleteSaved = useCallback((id: string) => {
    setSaved((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const renameSaved = useCallback((id: string, name: string) => {
    setSaved((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)));
  }, []);

  const runFromLogs = useCallback(
    (q: string, nextType?: SearchType) => {
      if (nextType) setType(nextType);
      commitQuery(q);
      inputRef.current?.focus();
    },
    [commitQuery],
  );

  const viewAll = useCallback((t: SearchType) => {
    setType(t);
    // keep query as-is; results update instantly
    // optional: scroll to results on mobile
    const el = document.getElementById("search-results-anchor");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <main className="min-h-[100svh] bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        <SearchHeader
          inputRef={inputRef}
          query={query}
          onQueryChange={setQuery}
          onQueryCommit={commitQuery}
          onClear={clearQuery}
          type={type}
          onTypeChange={setType}
          sort={sort}
          onSortChange={setSort}
          isSaved={isSaved}
          onToggleSave={toggleSave}
        />

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Logs / Suggestions */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-6">
              <LogsPanel
                query={query}
                history={history}
                saved={saved}
                suggestions={suggestions}
                onRunQuery={runFromLogs}
                onRemoveHistory={removeHistory}
                onClearHistory={clearHistory}
                onDeleteSaved={deleteSaved}
                onRenameSaved={renameSaved}
              />
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-8" id="search-results-anchor">
            <ResultsPane
              query={query}
              debouncedQuery={debouncedQuery}
              type={type}
              sort={sort}
              isSearching={isSearching}
              results={results}
              usersById={MOCK_DB.usersById}
              onViewAll={viewAll}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
