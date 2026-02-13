import type {
  HistoryEntry,
  MockDb,
  PostEntity,
  SavedSearch,
  UserEntity,
  WorkEntity,
} from "./_types";
import { normalizeText } from "./_lib/search";

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function int(rand: () => number, min: number, max: number) {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function pick<T>(rand: () => number, arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)]!;
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

// Real direct URLs (MyAnimeList CDN). Mixed selection.
const COVER_URLS = [
  "https://cdn.myanimelist.net/images/anime/10/47347.jpg", // Attack on Titan
  "https://cdn.myanimelist.net/images/anime/9/9453.jpg", // Death Note
  "https://cdn.myanimelist.net/images/anime/13/17405.jpg", // Naruto
  // From large public dataset diff (still MAL CDN)
  "https://cdn.myanimelist.net/images/anime/8/8968.jpg",
  "https://cdn.myanimelist.net/images/anime/10/45710.jpg",
  "https://cdn.myanimelist.net/images/anime/1374/110110.jpg",
  "https://cdn.myanimelist.net/images/anime/5/30501.jpg",
  "https://cdn.myanimelist.net/images/anime/7/73542.jpg",
  "https://cdn.myanimelist.net/images/anime/11/21327.jpg",
  "https://cdn.myanimelist.net/images/anime/7/74585.jpg",
  "https://cdn.myanimelist.net/images/anime/1849/94636.jpg",
  "https://cdn.myanimelist.net/images/anime/7/56697.jpg",
  "https://cdn.myanimelist.net/images/anime/10/31023.jpg",
  "https://cdn.myanimelist.net/images/anime/10/32137.jpg",
  "https://cdn.myanimelist.net/images/anime/13/59711.jpg",
  "https://cdn.myanimelist.net/images/anime/13/59631.jpg",
  "https://cdn.myanimelist.net/images/anime/12/56683.jpg",
  "https://cdn.myanimelist.net/images/anime/12/81128.jpg",
  "https://cdn.myanimelist.net/images/anime/5/47062.jpg",
  "https://cdn.myanimelist.net/images/anime/2/65131.jpg",
  "https://cdn.myanimelist.net/images/anime/9/85584.jpg",
  "https://cdn.myanimelist.net/images/anime/12/52163.jpg",
  "https://cdn.myanimelist.net/images/anime/12/71943.jpg",
  "https://cdn.myanimelist.net/images/anime/1162/105836.jpg",
  "https://cdn.myanimelist.net/images/anime/9/70629.jpg",
  "https://cdn.myanimelist.net/images/anime/1572/93453.jpg",
  "https://cdn.myanimelist.net/images/anime/1918/98698.jpg",
  "https://cdn.myanimelist.net/images/anime/1268/107370.jpg",
  "https://cdn.myanimelist.net/images/anime/1575/101999.jpg",
  "https://cdn.myanimelist.net/images/anime/1506/98695.jpg",
  "https://cdn.myanimelist.net/images/anime/1209/107860.jpg",
  "https://cdn.myanimelist.net/images/anime/1416/105573.jpg",
  "https://cdn.myanimelist.net/images/anime/1232/98709.jpg",
  "https://cdn.myanimelist.net/images/anime/1957/110202.jpg",
  "https://cdn.myanimelist.net/images/anime/1411/104116.jpg",
  "https://cdn.myanimelist.net/images/anime/1470/98700.jpg",
  "https://cdn.myanimelist.net/images/anime/1050/105963.jpg",
  "https://cdn.myanimelist.net/images/anime/1191/104117.jpg",
  "https://cdn.myanimelist.net/images/anime/1914/106717.jpg",
];

const FIRST = [
  "Aiden",
  "Mika",
  "Hana",
  "Leo",
  "Sora",
  "Yuki",
  "Kai",
  "Noah",
  "Aria",
  "Rin",
  "Eli",
  "Nina",
  "Zane",
  "Mina",
];
const LAST = [
  "Takeda",
  "Hayashi",
  "Kuroda",
  "Ishikawa",
  "Sato",
  "Kobayashi",
  "Watanabe",
  "Fujimoto",
  "Sakai",
  "Mori",
  "Yamamoto",
];

const USER_ADJ = [
  "cosmic",
  "otaku",
  "pixel",
  "neon",
  "shonen",
  "sliceoflife",
  "mecha",
  "moon",
  "kawaii",
  "senpai",
  "manga",
  "anime",
];
const BIO = [
  "Anime & manga explorer. I collect arcs like trophies.",
  "Posting reviews, hot takes, and spoiler-free impressions.",
  "Creator program member — commissions & collabs open.",
  "I track seasonal anime like it’s a full-time job.",
  "Manga panels > everything. Also: coffee addicted.",
  "Clean UI enjoyer. I judge apps by their search.",
];

const POST_TAGS = [
  "review",
  "discussion",
  "spoiler-free",
  "theory",
  "news",
  "recommendation",
  "ranking",
  "art",
  "cosplay",
  "memes",
];
const POST_TITLES = [
  "Top 10 fights that still give chills",
  "Spoiler-free first impressions",
  "Why this arc works so well",
  "Underrated anime you should watch",
  "Manga vs Anime: the real difference",
  "Studio choices that changed everything",
  "Character writing done right",
  "Seasonal watchlist: my picks",
  "If you liked this, try these",
  "The soundtrack is criminally good",
];

const WORK_ANIME_TITLES = [
  "Attack on Titan",
  "Naruto",
  "One Piece",
  "Jujutsu Kaisen",
  "Demon Slayer",
  "Spy x Family",
  "Vinland Saga",
  "Haikyuu!!",
  "Fullmetal Alchemist: Brotherhood",
  "Death Note",
  "Steins;Gate",
  "Mob Psycho 100",
  "Dr. Stone",
  "Chainsaw Man",
  "Re:ZERO",
  "My Hero Academia",
  "Code Geass",
  "Gintama",
  "Frieren: Beyond Journey’s End",
  "Oshi no Ko",
];

const WORK_MANGA_TITLES = [
  "Berserk",
  "Vagabond",
  "Monster",
  "20th Century Boys",
  "Tokyo Ghoul",
  "Blue Lock",
  "One Punch Man",
  "Kingdom",
  "Dorohedoro",
  "Claymore",
  "Slam Dunk",
  "Bleach",
  "Naruto (Manga)",
  "One Piece (Manga)",
  "Chainsaw Man (Manga)",
  "Jujutsu Kaisen (Manga)",
  "The Promised Neverland",
  "Goodnight Punpun",
  "Vinland Saga (Manga)",
  "Haikyuu!! (Manga)",
];

export const TRENDING_QUERIES = [
  "one piece",
  "jujutsu",
  "attack on titan",
  "spy family",
  "vinland",
  "best opening",
  "manga recommendations",
  "creator program",
];

function makeUsers(): UserEntity[] {
  const rand = mulberry32(42);
  const now = Date.now();

  const out: UserEntity[] = [];
  const total = 80;

  for (let i = 1; i <= total; i++) {
    const first = pick(rand, FIRST);
    const last = pick(rand, LAST);
    const role = i % 6 === 0 ? "creator" : "user";

    const handle =
      `${pick(rand, USER_ADJ)}_${first.toLowerCase()}${pad2(i)}`.toLowerCase();
    const displayName = `${first} ${last}`;
    const avatarUrl = `https://i.pravatar.cc/150?img=${(i % 70) + 1}`;

    const createdAt = now - int(rand, 3, 900) * 24 * 3600 * 1000;
    const updatedAt = createdAt + int(rand, 1, 120) * 24 * 3600 * 1000;

    const followers =
      role === "creator" ? int(rand, 5000, 250000) : int(rand, 50, 80000);
    const bio = pick(rand, BIO);

    const searchText = normalizeText(
      `${displayName} @${handle} ${bio} ${role}`,
    );

    out.push({
      kind: "user",
      id: `u_${i}`,
      username: handle,
      displayName,
      avatarUrl,
      bio,
      role,
      followers,
      createdAt,
      updatedAt,
      searchText,
    });
  }

  return out;
}

function makeWorks(): WorkEntity[] {
  const rand = mulberry32(77);
  const now = Date.now();

  const out: WorkEntity[] = [];
  let id = 1;

  // 60 anime
  for (let i = 0; i < 60; i++) {
    const base = WORK_ANIME_TITLES[i % WORK_ANIME_TITLES.length]!;
    const suffix =
      i >= WORK_ANIME_TITLES.length ? ` (Season ${1 + (i % 4)})` : "";
    const title = `${base}${suffix}`;

    const year = int(rand, 1999, 2026);
    const score = Math.round((6.8 + rand() * 2.8) * 10) / 10;
    const coverUrl = COVER_URLS[i % COVER_URLS.length]!;
    const updatedAt = now - int(rand, 1, 900) * 24 * 3600 * 1000;

    const searchText = normalizeText(`${title} anime ${year}`);

    out.push({
      kind: "work",
      id: `w_${id++}`,
      workType: "anime",
      title,
      year,
      score,
      coverUrl,
      updatedAt,
      searchText,
    });
  }

  // 50 manga
  for (let i = 0; i < 50; i++) {
    const base = WORK_MANGA_TITLES[i % WORK_MANGA_TITLES.length]!;
    const suffix = i >= WORK_MANGA_TITLES.length ? ` Vol. ${1 + (i % 12)}` : "";
    const title = `${base}${suffix}`;

    const year = int(rand, 1995, 2026);
    const score = Math.round((6.6 + rand() * 2.9) * 10) / 10;
    const coverUrl = COVER_URLS[(i + 11) % COVER_URLS.length]!;
    const updatedAt = now - int(rand, 1, 1200) * 24 * 3600 * 1000;

    const searchText = normalizeText(`${title} manga ${year}`);

    out.push({
      kind: "work",
      id: `w_${id++}`,
      workType: "manga",
      title,
      year,
      score,
      coverUrl,
      updatedAt,
      searchText,
    });
  }

  return out;
}

function makePosts(users: UserEntity[]): PostEntity[] {
  const rand = mulberry32(99);
  const now = Date.now();

  const out: PostEntity[] = [];
  const total = 90;

  for (let i = 1; i <= total; i++) {
    const author = pick(rand, users);
    const title = pick(rand, POST_TITLES);

    const tags = Array.from(
      new Set([
        pick(rand, POST_TAGS),
        pick(rand, POST_TAGS),
        pick(rand, POST_TAGS),
      ]),
    ).slice(0, int(rand, 2, 3));

    const createdAt = now - int(rand, 1, 240) * 24 * 3600 * 1000;
    const updatedAt = createdAt + int(rand, 0, 72) * 3600 * 1000;

    const reactions = int(rand, 0, 12000);
    const comments = int(rand, 0, 900);

    const excerpt =
      "Quick breakdown: pacing, characters, and what the anime adaptation nailed (and missed). Drop your thoughts — spoiler tags welcome.";

    const searchText = normalizeText(
      `${title} ${excerpt} ${tags.join(" ")} ${author.displayName} @${author.username}`,
    );

    out.push({
      kind: "post",
      id: `p_${i}`,
      authorId: author.id,
      title,
      excerpt,
      tags,
      reactions,
      comments,
      createdAt,
      updatedAt,
      searchText,
    });
  }

  return out;
}

function makeSuggestionPool(db: {
  users: UserEntity[];
  posts: PostEntity[];
  works: WorkEntity[];
}): string[] {
  const set = new Map<string, string>();

  // Titles
  for (const w of db.works) {
    const n = normalizeText(w.title);
    if (n) set.set(n, w.title);
  }

  // Handles + display names
  for (const u of db.users) {
    const a = normalizeText(u.displayName);
    const b = normalizeText(`@${u.username}`);
    if (a) set.set(a, u.displayName);
    if (b) set.set(b, `@${u.username}`);
  }

  // A few post titles
  for (const p of db.posts.slice(0, 40)) {
    const n = normalizeText(p.title);
    if (n) set.set(n, p.title);
  }

  return Array.from(set.values()).slice(0, 250);
}

export const MOCK_DB: MockDb = (() => {
  const users = makeUsers();
  const works = makeWorks();
  const posts = makePosts(users);

  const usersById: Record<string, UserEntity> = {};
  for (const u of users) usersById[u.id] = u;

  const suggestionPool = makeSuggestionPool({ users, posts, works });

  return { users, posts, works, usersById, suggestionPool };
})();

// Seed history/saved (only used if localStorage is empty)
export const INITIAL_HISTORY: HistoryEntry[] = [
  {
    id: "h_seed_1",
    query: "attack on titan",
    type: "anime",
    executedAt: Date.now() - 3 * 3600 * 1000,
  },
  {
    id: "h_seed_2",
    query: "@neon_mika06",
    type: "users",
    executedAt: Date.now() - 9 * 3600 * 1000,
  },
  {
    id: "h_seed_3",
    query: "manga recommendations",
    type: "all",
    executedAt: Date.now() - 28 * 3600 * 1000,
  },
  {
    id: "h_seed_4",
    query: "spoiler-free first impressions",
    type: "posts",
    executedAt: Date.now() - 2 * 24 * 3600 * 1000,
  },
  {
    id: "h_seed_5",
    query: "creator program",
    type: "creators",
    executedAt: Date.now() - 5 * 24 * 3600 * 1000,
  },
];

export const INITIAL_SAVED: SavedSearch[] = [
  {
    id: "s_seed_1",
    name: "Seasonal picks",
    query: "seasonal watchlist",
    type: "posts",
    createdAt: Date.now() - 10 * 24 * 3600 * 1000,
  },
  {
    id: "s_seed_2",
    name: "Top anime",
    query: "best opening",
    type: "anime",
    createdAt: Date.now() - 18 * 24 * 3600 * 1000,
  },
  {
    id: "s_seed_3",
    name: "Creators to follow",
    query: "creator",
    type: "creators",
    createdAt: Date.now() - 25 * 24 * 3600 * 1000,
  },
];
