"use client";

import React, { useMemo } from "react";
import type { SearchResults, SearchType, SortMode, UserEntity } from "../_types";
import { CardShell, cn, Skeleton } from "./ui";

import UserCard from "./cards/UserCard";
import PostCard from "./cards/PostCard";
import WorkCard from "./cards/WorkCard";

type Props = {
  query: string;
  debouncedQuery: string;
  type: SearchType;
  sort: SortMode;
  isSearching: boolean;
  results: SearchResults | null;
  usersById: Record<string, UserEntity>;
  onViewAll: (t: SearchType) => void;
};

function sectionTitle(t: SearchType) {
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

function EmptyState({ q }: { q: string }) {
  return (
    <CardShell>
      <div className="text-sm font-extrabold">No results</div>
      <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
        No results for <span className="font-semibold">“{q}”</span>
      </div>
      <div className="mt-3 text-xs text-zinc-500">
        Try a different keyword or pick a different type.
      </div>
    </CardShell>
  );
}

function ResultsSkeleton() {
  return (
    <div className="space-y-3">
      <CardShell>
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-2 h-3 w-64" />
      </CardShell>

      <CardShell>
        <Skeleton className="h-4 w-32" />
        <div className="mt-3 space-y-2">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      </CardShell>
    </div>
  );
}

export default function ResultsPane({ query, debouncedQuery, type, sort, isSearching, results, usersById, onViewAll }: Props) {
  const trimmed = query.trim();
  const hasQuery = Boolean(trimmed);

  const meta = useMemo(() => {
    if (!results) return null;
    return `${results.total} results • ${results.tookMs}ms • ${sectionTitle(type)} • ${sort === "newest" ? "Newest" : "Relevance"}`;
  }, [results, type, sort]);

  if (!hasQuery) {
    return (
      <CardShell>
        <div className="text-sm font-extrabold">Results</div>
        <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          Start typing to see results instantly.
        </div>
        <div className="mt-3 text-xs text-zinc-500">Tip: Press “/” to focus the search input.</div>
      </CardShell>
    );
  }

  if (isSearching) {
    return <ResultsSkeleton />;
  }

  const q = debouncedQuery.trim();
  if (!results || !q) return <ResultsSkeleton />;

  if (results.total === 0) {
    return <EmptyState q={q} />;
  }

  const showSection = (count: number) => count > 0;

  // For All: grouped sections with View all
  if (type === "all") {
    return (
      <div className="space-y-3">
        <CardShell>
          <div className="text-sm font-extrabold">Results for “{results.query}”</div>
          <div className="mt-1 text-xs text-zinc-500">{meta}</div>
        </CardShell>

        {showSection(results.users.length) ? (
          <Section title="Users" count={results.users.length} onViewAll={() => onViewAll("users")}>
            <div className="space-y-2">
              {results.users.slice(0, 4).map((u) => (
                <UserCard key={u.id} user={u} />
              ))}
            </div>
          </Section>
        ) : null}

        {showSection(results.creators.length) ? (
          <Section title="Creators" count={results.creators.length} onViewAll={() => onViewAll("creators")}>
            <div className="space-y-2">
              {results.creators.slice(0, 4).map((u) => (
                <UserCard key={u.id} user={u} />
              ))}
            </div>
          </Section>
        ) : null}

        {showSection(results.posts.length) ? (
          <Section title="Posts" count={results.posts.length} onViewAll={() => onViewAll("posts")}>
            <div className="space-y-2">
              {results.posts.slice(0, 4).map((p) => (
                <PostCard key={p.id} post={p} author={usersById[p.authorId]} />
              ))}
            </div>
          </Section>
        ) : null}

        {showSection(results.anime.length) ? (
          <Section title="Anime" count={results.anime.length} onViewAll={() => onViewAll("anime")}>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {results.anime.slice(0, 4).map((w) => (
                <WorkCard key={w.id} work={w} />
              ))}
            </div>
          </Section>
        ) : null}

        {showSection(results.manga.length) ? (
          <Section title="Manga" count={results.manga.length} onViewAll={() => onViewAll("manga")}>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {results.manga.slice(0, 4).map((w) => (
                <WorkCard key={w.id} work={w} />
              ))}
            </div>
          </Section>
        ) : null}
      </div>
    );
  }

  // For specific type: single clear list
  return (
    <div className="space-y-3">
      <CardShell>
        <div className="text-sm font-extrabold">
          {sectionTitle(type)} results for “{results.query}”
        </div>
        <div className="mt-1 text-xs text-zinc-500">{meta}</div>
      </CardShell>

      {type === "users" ? (
        <div className="space-y-2">
          {results.users.map((u) => (
            <UserCard key={u.id} user={u} />
          ))}
        </div>
      ) : null}

      {type === "creators" ? (
        <div className="space-y-2">
          {results.creators.map((u) => (
            <UserCard key={u.id} user={u} />
          ))}
        </div>
      ) : null}

      {type === "posts" ? (
        <div className="space-y-2">
          {results.posts.map((p) => (
            <PostCard key={p.id} post={p} author={usersById[p.authorId]} />
          ))}
        </div>
      ) : null}

      {type === "anime" ? (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {results.anime.map((w) => (
            <WorkCard key={w.id} work={w} />
          ))}
        </div>
      ) : null}

      {type === "manga" ? (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {results.manga.map((w) => (
            <WorkCard key={w.id} work={w} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Section({
  title,
  count,
  onViewAll,
  children,
}: {
  title: string;
  count: number;
  onViewAll: () => void;
  children: React.ReactNode;
}) {
  return (
    <CardShell>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-extrabold">{title}</div>
          <div className="mt-0.5 text-xs text-zinc-500">{count} results</div>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className={cn(
            "rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-900 transition",
            "hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900",
          )}
        >
          View all
        </button>
      </div>

      <div className="mt-3">{children}</div>
    </CardShell>
  );
}
