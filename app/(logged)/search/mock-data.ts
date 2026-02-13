// app/search/mock-data.ts
// Mock-only dataset (NO APIs). Real image URLs for UI testing.

export type UserRole = "user" | "creator" | "influencer";
export type WorkType = "anime" | "manga" | "comic";
export type WorkStatus = "ongoing" | "completed" | "hiatus";
export type PostType = "post" | "review" | "article";

export type UserEntity = {
  kind: "user";
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
  verified?: boolean;
  followers: number;
  bio: string;
  avatarUrl?: string;
};

export type WorkEntity = {
  kind: "work";
  id: string;
  workType: WorkType;
  title: string;
  year?: number;
  studio?: string;
  status?: WorkStatus;
  rating: number; // 0..10
  genres: string[];
  coverUrl: string;
};

export type StudioEntity = {
  kind: "studio";
  id: string;
  name: string;
  country: string;
  verified?: boolean;
  worksCount: number;
  logoUrl?: string;
};

export type CommunityEntity = {
  kind: "community";
  id: string;
  name: string;
  description: string;
  members: number;
  postsPerDay: number;
  isOfficial?: boolean;
  bannerUrl: string;
};

export type PostEntity = {
  kind: "post";
  id: string;
  title: string;
  excerpt: string;
  authorId: string;
  type: PostType;
  createdAt: number;
  reactions: number;
  comments: number;
  tags: string[];
  hasSpoiler?: boolean;
};

export const IMG = {
  // AniList CDN (anime covers)
  onePieceCover:
    "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-YCDoj1EkAxFn.jpg",
  aotCover:
    "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-C6FPmWm59CyP.jpg",
  demonSlayerCover:
    "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-PEn1CTc93blC.jpg",
  jjkAnimeCover:
    "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-bbBWj4pEFseh.jpg",

  // Wikipedia / Wikimedia (manga & comics covers)
  berserkCover:
    "https://upload.wikimedia.org/wikipedia/en/4/4a/Berserk_vol01.png",
  chainsawManCover:
    "https://upload.wikimedia.org/wikipedia/it/c/cb/Chainsaw_Man_Volume_1.jpg",
  onePunchManCover:
    "https://upload.wikimedia.org/wikipedia/en/c/c3/OnePunchMan_manga_cover.png",
  vagabondCover:
    "https://upload.wikimedia.org/wikipedia/en/7/7a/Vagabond_vol01.png",

  killingJokeCover:
    "https://upload.wikimedia.org/wikipedia/en/3/32/Killingjoke.JPG",
  watchmenCover:
    "https://upload.wikimedia.org/wikipedia/en/a/a2/Watchmen%2C_issue_1.jpg",

  // Avatars (Wikimedia Commons / Wikipedia)
  luffyAvatar:
    "https://upload.wikimedia.org/wikipedia/commons/b/bf/Cosplay_-_AWA15_-_Monkey_D._Luffy_%283982426960%29.jpg",
  narutoAvatar:
    "https://upload.wikimedia.org/wikipedia/commons/6/6b/Cosplay_-_AWA15_-_Naruto_Uzumaki_%283982533553%29.jpg",
  mikasaAvatar:
    "https://upload.wikimedia.org/wikipedia/commons/9/9b/New_York_Comic_Con_2013_-_Mikasa_cropped_image_%2810275581946%29.jpg",
  gojoAvatar:
    "https://upload.wikimedia.org/wikipedia/commons/4/4c/Satoru_Goj%C5%8D_cosplay.jpg",

  // Studio logos (Wikimedia Commons)
  toeiLogo:
    "https://upload.wikimedia.org/wikipedia/commons/0/09/Toei_Animation_Logo.png",
  mappaLogo:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/MAPPA_Logo.svg/3840px-MAPPA_Logo.svg.png",
};

export const USERS: UserEntity[] = [
  {
    kind: "user",
    id: "u_1",
    username: "dev.luffy",
    displayName: "dev.luffy",
    role: "creator",
    verified: true,
    followers: 48210,
    bio: "Founder @ Fanaara • Clean Architecture • scaling community systems",
    avatarUrl: IMG.luffyAvatar,
  },
  {
    kind: "user",
    id: "u_2",
    username: "gojo.sensei",
    displayName: "Gojo Sensei",
    role: "influencer",
    verified: true,
    followers: 129004,
    bio: "Edits • weekly reviews • spoiler-safe hot takes",
    avatarUrl: IMG.gojoAvatar,
  },
  {
    kind: "user",
    id: "u_3",
    username: "mikasa.guard",
    displayName: "Mikasa Guard",
    role: "creator",
    verified: false,
    followers: 22140,
    bio: "Panel breakdowns • OST appreciation • rewatch threads",
    avatarUrl: IMG.mikasaAvatar,
  },
  {
    kind: "user",
    id: "u_4",
    username: "naruto.runner",
    displayName: "Naruto Runner",
    role: "user",
    verified: false,
    followers: 2210,
    bio: "I watch anything with great pacing 🔥",
    avatarUrl: IMG.narutoAvatar,
  },
  {
    kind: "user",
    id: "u_5",
    username: "studio.insider",
    displayName: "Studio Insider",
    role: "influencer",
    verified: false,
    followers: 9870,
    bio: "Production nerd • staff tracking • PV breakdowns",
    avatarUrl: IMG.mappaLogo,
  },
  {
    kind: "user",
    id: "u_6",
    username: "manga.lab",
    displayName: "Manga Lab",
    role: "creator",
    verified: true,
    followers: 64210,
    bio: "Seinen & shonen reviews • theory threads (tagged spoilers)",
  },
  {
    kind: "user",
    id: "u_7",
    username: "comic.shelf",
    displayName: "Comic Shelf",
    role: "creator",
    verified: false,
    followers: 13120,
    bio: "Comics recs • character arcs • classic runs",
  },
];

export const WORKS: WorkEntity[] = [
  // Anime
  {
    kind: "work",
    id: "w_a_1",
    workType: "anime",
    title: "One Piece",
    year: 1999,
    studio: "Toei Animation",
    status: "ongoing",
    rating: 9.0,
    genres: ["Adventure", "Action", "Fantasy"],
    coverUrl: IMG.onePieceCover,
  },
  {
    kind: "work",
    id: "w_a_2",
    workType: "anime",
    title: "Attack on Titan",
    year: 2013,
    studio: "Wit Studio",
    status: "completed",
    rating: 8.9,
    genres: ["Action", "Drama", "Dark Fantasy"],
    coverUrl: IMG.aotCover,
  },
  {
    kind: "work",
    id: "w_a_3",
    workType: "anime",
    title: "Demon Slayer: Kimetsu no Yaiba",
    year: 2019,
    studio: "ufotable",
    status: "ongoing",
    rating: 8.6,
    genres: ["Action", "Historical", "Supernatural"],
    coverUrl: IMG.demonSlayerCover,
  },
  {
    kind: "work",
    id: "w_a_4",
    workType: "anime",
    title: "Jujutsu Kaisen",
    year: 2020,
    studio: "MAPPA",
    status: "ongoing",
    rating: 8.5,
    genres: ["Action", "Supernatural"],
    coverUrl: IMG.jjkAnimeCover,
  },

  // Manga
  {
    kind: "work",
    id: "w_m_1",
    workType: "manga",
    title: "Berserk",
    year: 1989,
    studio: "Young Animal",
    status: "hiatus",
    rating: 9.3,
    genres: ["Seinen", "Dark Fantasy", "Drama"],
    coverUrl: IMG.berserkCover,
  },
  {
    kind: "work",
    id: "w_m_2",
    workType: "manga",
    title: "Chainsaw Man",
    year: 2018,
    studio: "Shueisha",
    status: "ongoing",
    rating: 8.7,
    genres: ["Action", "Horror", "Dark Comedy"],
    coverUrl: IMG.chainsawManCover,
  },
  {
    kind: "work",
    id: "w_m_3",
    workType: "manga",
    title: "One-Punch Man",
    year: 2012,
    studio: "Shueisha",
    status: "ongoing",
    rating: 8.5,
    genres: ["Action", "Comedy", "Superhero"],
    coverUrl: IMG.onePunchManCover,
  },
  {
    kind: "work",
    id: "w_m_4",
    workType: "manga",
    title: "Vagabond",
    year: 1998,
    studio: "Kodansha",
    status: "hiatus",
    rating: 9.1,
    genres: ["Seinen", "Historical", "Drama"],
    coverUrl: IMG.vagabondCover,
  },

  // Comics
  {
    kind: "work",
    id: "w_c_1",
    workType: "comic",
    title: "Batman: The Killing Joke",
    year: 1988,
    studio: "DC Comics",
    status: "completed",
    rating: 8.8,
    genres: ["Superhero", "Crime", "Psychological"],
    coverUrl: IMG.killingJokeCover,
  },
  {
    kind: "work",
    id: "w_c_2",
    workType: "comic",
    title: "Watchmen (Issue #1)",
    year: 1986,
    studio: "DC Comics",
    status: "completed",
    rating: 9.0,
    genres: ["Superhero", "Drama", "Mystery"],
    coverUrl: IMG.watchmenCover,
  },
];

export const STUDIOS: StudioEntity[] = [
  {
    kind: "studio",
    id: "s_1",
    name: "Toei Animation",
    country: "JP",
    verified: true,
    worksCount: 250,
    logoUrl: IMG.toeiLogo,
  },
  {
    kind: "studio",
    id: "s_2",
    name: "MAPPA",
    country: "JP",
    verified: true,
    worksCount: 45,
    logoUrl: IMG.mappaLogo,
  },
  {
    kind: "studio",
    id: "s_3",
    name: "Wit Studio",
    country: "JP",
    verified: false,
    worksCount: 18,
  },
  {
    kind: "studio",
    id: "s_4",
    name: "ufotable",
    country: "JP",
    verified: false,
    worksCount: 22,
  },
];

export const COMMUNITIES: CommunityEntity[] = [
  {
    kind: "community",
    id: "c_1",
    name: "Spoiler‑Safe One Piece",
    description:
      "No-spoiler discussions • episode threads • theories (tagged).",
    members: 50210,
    postsPerDay: 146,
    isOfficial: true,
    bannerUrl: IMG.onePieceCover,
  },
  {
    kind: "community",
    id: "c_2",
    name: "JJK Power System Lab",
    description: "Cursed energy breakdowns • domains • staff trivia.",
    members: 18340,
    postsPerDay: 57,
    bannerUrl: IMG.jjkAnimeCover,
  },
  {
    kind: "community",
    id: "c_3",
    name: "Attack on Titan Analysis",
    description: "Rewatch threads • symbolism • soundtrack moments.",
    members: 9250,
    postsPerDay: 18,
    bannerUrl: IMG.aotCover,
  },
  {
    kind: "community",
    id: "c_4",
    name: "Manga Panel Clinic",
    description: "Panel-by-panel critique • composition • pacing.",
    members: 12200,
    postsPerDay: 31,
    bannerUrl: IMG.berserkCover,
  },
];

export const POSTS: PostEntity[] = [
  {
    kind: "post",
    id: "p_1",
    title: "How to read PVs without doomposting (production signals 101)",
    excerpt:
      "A practical guide: staff credits, schedule hints, and what actually matters when judging production.",
    authorId: "u_5",
    type: "article",
    createdAt: Date.now() - 1000 * 60 * 60 * 6,
    reactions: 1280,
    comments: 194,
    tags: ["Production", "Studios", "Guide"],
  },
  {
    kind: "post",
    id: "p_2",
    title: "Jujutsu Kaisen — direction & cuts (spoiler‑safe)",
    excerpt:
      "Why the scene feels fast even with fewer cuts — timing, camera distance, and sound design.",
    authorId: "u_2",
    type: "review",
    createdAt: Date.now() - 1000 * 60 * 60 * 30,
    reactions: 9320,
    comments: 865,
    tags: ["Review", "Anime", "JJK"],
  },
  {
    kind: "post",
    id: "p_3",
    title: "Attack on Titan: ending discussion thread (SPOILERS)",
    excerpt:
      "Themes, character arcs, and why the last stretch is divisive — keep it respectful.",
    authorId: "u_3",
    type: "post",
    createdAt: Date.now() - 1000 * 60 * 60 * 55,
    reactions: 4210,
    comments: 512,
    tags: ["Discussion", "AoT", "Spoilers"],
    hasSpoiler: true,
  },
  {
    kind: "post",
    id: "p_4",
    title: "Best OST moments this week",
    excerpt:
      "A small playlist of scenes where music carried the emotion — drop your picks!",
    authorId: "u_4",
    type: "post",
    createdAt: Date.now() - 1000 * 60 * 120,
    reactions: 740,
    comments: 88,
    tags: ["OST", "Weekly"],
  },
  {
    kind: "post",
    id: "p_5",
    title: "Berserk: why composition matters (chapter spotlight)",
    excerpt:
      "A look at panel rhythm, negative space, and how action reads on the page.",
    authorId: "u_6",
    type: "article",
    createdAt: Date.now() - 1000 * 60 * 60 * 80,
    reactions: 3180,
    comments: 263,
    tags: ["Manga", "Panels", "Berserk"],
  },
];

export const TRENDING_QUERIES: Array<{ q: string; meta: string }> = [
  { q: "One Piece", meta: "Anime" },
  { q: "MAPPA", meta: "Studio" },
  { q: "Berserk", meta: "Manga" },
  { q: "Spoiler‑Safe", meta: "Communities" },
  { q: "production", meta: "Articles" },
];

export const WORK_GENRES = Array.from(
  new Set(WORKS.flatMap((w) => w.genres)),
).sort((a, b) => a.localeCompare(b));

export const WORK_YEARS = Array.from(
  new Set(WORKS.map((w) => w.year).filter(Boolean) as number[]),
).sort((a, b) => b - a);

export const POST_TAGS = Array.from(new Set(POSTS.flatMap((p) => p.tags))).sort(
  (a, b) => a.localeCompare(b),
);

export const STUDIO_COUNTRIES = Array.from(
  new Set(STUDIOS.map((s) => s.country)),
).sort((a, b) => a.localeCompare(b));
