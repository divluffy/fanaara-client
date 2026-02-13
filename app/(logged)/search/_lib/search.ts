import type { HistoryEntry, MockDb, SavedSearch, SearchResults, SearchType, SortMode, UserEntity, WorkEntity, PostEntity } from "../_types";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u064B-\u065F]/g, "") // Arabic diacritics (future-proof)
    .replace(/[^\p{L}\p{N}\s@._-]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function splitTerms(q: string): string[] {
  return normalizeText(q).split(" ").filter(Boolean);
}

/**
 * Fast relevance score:
 * - strict AND across terms (all must match)
 * - boosts exact/prefix matches
 */
function scoreText(haystack: string, terms: string[]): number {
  if (!terms.length) return 0;
  const h = haystack;

  let score = 0;
  for (const t of terms) {
    if (!t) continue;

    if (h === t) score += 90;
    else if (h.startsWith(t)) score += 45;
    else if (h.includes(` ${t}`)) score += 30;
    else if (h.includes(t)) score += 18;
    else return 0;
  }

  // small bonus for shorter strings
  score += clamp(18 - Math.floor(h.length / 18), 0, 18);
  return score;
}

type Match<T> = { item: T; score: number };

function sortByRelevance<T extends { updatedAt: number }>(matches: Match<T>[], tie: (a: T, b: T) => number) {
  matches.sort((a, b) => b.score - a.score || tie(a.item, b.item) || b.item.updatedAt - a.item.updatedAt);
}

function sortByNewest<T extends { updatedAt: number }>(matches: Match<T>[], tie?: (a: T, b: T) => number) {
  matches.sort((a, b) => b.item.updatedAt - a.item.updatedAt || (tie ? tie(a.item, b.item) : 0) || b.score - a.score);
}

function filterUsers(users: UserEntity[], query: string, role: "user" | "creator", sort: SortMode): UserEntity[] {
  const terms = splitTerms(query);

  const matches: Match<UserEntity>[] = [];
  for (const u of users) {
    if (u.role !== role) continue;
    const s = scoreText(u.searchText, terms);
    if (s > 0) matches.push({ item: u, score: s });
  }

  if (sort === "newest") {
    sortByNewest(matches, (a, b) => b.followers - a.followers);
  } else {
    sortByRelevance(matches, (a, b) => b.followers - a.followers);
  }

  return matches.map((m) => m.item);
}

function filterPosts(posts: PostEntity[], query: string, sort: SortMode): PostEntity[] {
  const terms = splitTerms(query);

  const matches: Match<PostEntity>[] = [];
  for (const p of posts) {
    const s = scoreText(p.searchText, terms);
    if (s > 0) matches.push({ item: p, score: s });
  }

  if (sort === "newest") {
    sortByNewest(matches, (a, b) => b.reactions - a.reactions);
  } else {
    sortByRelevance(matches, (a, b) => b.reactions - a.reactions);
  }

  return matches.map((m) => m.item);
}

function filterWorks(works: WorkEntity[], query: string, workType: "anime" | "manga", sort: SortMode): WorkEntity[] {
  const terms = splitTerms(query);

  const matches: Match<WorkEntity>[] = [];
  for (const w of works) {
    if (w.workType !== workType) continue;
    const s = scoreText(w.searchText, terms);
    if (s > 0) matches.push({ item: w, score: s });
  }

  if (sort === "newest") {
    sortByNewest(matches, (a, b) => b.score - a.score);
  } else {
    sortByRelevance(matches, (a, b) => b.score - a.score);
  }

  return matches.map((m) => m.item);
}

export function runSearch(args: {
  query: string;
  type: SearchType;
  sort: SortMode;
  db: MockDb;
}): SearchResults {
  const t0 = typeof performance !== "undefined" ? performance.now() : Date.now();

  const q = args.query.trim();
  const { db, type, sort } = args;

  let users: UserEntity[] = [];
  let creators: UserEntity[] = [];
  let posts: PostEntity[] = [];
  let anime: WorkEntity[] = [];
  let manga: WorkEntity[] = [];

  if (type === "all" || type === "users") users = filterUsers(db.users, q, "user", sort);
  if (type === "all" || type === "creators") creators = filterUsers(db.users, q, "creator", sort);
  if (type === "all" || type === "posts") posts = filterPosts(db.posts, q, sort);
  if (type === "all" || type === "anime") anime = filterWorks(db.works, q, "anime", sort);
  if (type === "all" || type === "manga") manga = filterWorks(db.works, q, "manga", sort);

  // If specific type, keep others empty by design
  if (type !== "all") {
    if (type !== "users") users = [];
    if (type !== "creators") creators = [];
    if (type !== "posts") posts = [];
    if (type !== "anime") anime = [];
    if (type !== "manga") manga = [];
  }

  const total = users.length + creators.length + posts.length + anime.length + manga.length;

  const tookMs =
    typeof performance !== "undefined"
      ? Math.max(1, Math.round(performance.now() - t0))
      : Math.max(1, Math.round(Date.now() - t0));

  return { query: q, tookMs, total, users, creators, posts, anime, manga };
}

/**
 * Auto suggestions:
 * - only when typing (caller ensures query is non-empty)
 * - prefix match on normalized text
 * - short list, no layers
 */
export function buildAutoSuggestions(args: {
  query: string;
  history: HistoryEntry[];
  saved: SavedSearch[];
  trending: string[];
  pool: string[];
  limit: number;
}): string[] {
  const q = normalizeText(args.query);
  if (!q) return [];

  const candidates = new Map<string, string>(); // normalized -> original

  // Priority sources first
  for (const h of args.history) candidates.set(normalizeText(h.query), h.query);
  for (const s of args.saved) candidates.set(normalizeText(s.query), s.query);
  for (const t of args.trending) candidates.set(normalizeText(t), t);

  // Entity pool (titles, usernames, etc.)
  for (const p of args.pool) candidates.set(normalizeText(p), p);

  const picked: Array<{ label: string; n: string }> = [];
  for (const [n, label] of candidates.entries()) {
    if (n.startsWith(q)) picked.push({ label, n });
  }

  // Rank: shortest first, then alphabetic (simple and predictable)
  picked.sort((a, b) => a.n.length - b.n.length || a.n.localeCompare(b.n));

  return picked.slice(0, args.limit).map((x) => x.label);
}
