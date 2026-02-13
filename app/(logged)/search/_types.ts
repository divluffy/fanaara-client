export type SearchType =
  | "all"
  | "users"
  | "creators"
  | "posts"
  | "anime"
  | "manga";
export type SortMode = "relevance" | "newest";

export type UserRole = "user" | "creator";

export type UserEntity = {
  kind: "user";
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  role: UserRole;
  followers: number;
  createdAt: number;
  updatedAt: number;

  // precomputed for fast search
  searchText: string;
};

export type PostEntity = {
  kind: "post";
  id: string;
  authorId: string;
  title: string;
  excerpt: string;
  tags: string[];
  reactions: number;
  comments: number;
  createdAt: number;
  updatedAt: number;

  searchText: string;
};

export type WorkEntity = {
  kind: "work";
  id: string;
  workType: "anime" | "manga";
  title: string;
  year: number;
  score: number; // mock rating/score
  coverUrl: string;
  updatedAt: number;

  searchText: string;
};

export type HistoryEntry = {
  id: string;
  query: string;
  type: SearchType;
  executedAt: number;
};

export type SavedSearch = {
  id: string;
  name: string;
  query: string;
  type: SearchType;
  createdAt: number;
};

export type SearchResults = {
  query: string;
  tookMs: number;
  total: number;
  users: UserEntity[];
  creators: UserEntity[];
  posts: PostEntity[];
  anime: WorkEntity[];
  manga: WorkEntity[];
};

export type MockDb = {
  users: UserEntity[];
  posts: PostEntity[];
  works: WorkEntity[];
  usersById: Record<string, UserEntity>;
  suggestionPool: string[];
};
