// app\(logged)\gallery\_components\_data\galleryMock.ts
import type {
  GalleryAuthor,
  GalleryCategory,
  GalleryFilters,
  GalleryImage,
  GalleryWork,
  SortMode,
  WorkKind,
} from "./galleryTypes";
import { mulberry32, safeLower } from "./galleryUtils";

const DOMINANT = ["#0ea5e9", "#a855f7", "#f97316", "#22c55e", "#e11d48", "#64748b"];

// ✅ صور أنمي مباشرة (AniList CDN)
// ملاحظة: هذه روابط مباشرة لاستخدام UI mock فقط
export const ANIME_IMAGE_POOL: Array<Pick<GalleryImage, "src" | "width" | "height" | "alt" | "dominant">> = [
  { src: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-YCDoj1EkAxFn.jpg", width: 720, height: 1024, alt: "One Piece cover", dominant: DOMINANT[0]! },
  { src: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx20-YJvLbgJQPCoI.jpg", width: 720, height: 1024, alt: "Naruto cover", dominant: DOMINANT[1]! },
  { src: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx1735-80JNLAlnxrKj.png", width: 720, height: 1024, alt: "Naruto Shippuden cover", dominant: DOMINANT[2]! },

  { src: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-bbBWj4pEFseh.jpg", width: 720, height: 1024, alt: "Jujutsu Kaisen cover", dominant: DOMINANT[3]! },
  { src: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx145064-5fa4ZBbW4dqA.jpg", width: 720, height: 1024, alt: "Jujutsu Kaisen S2 cover", dominant: DOMINANT[1]! },

  { src: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-m5ZMNtFioc7j.jpg", width: 720, height: 1024, alt: "Attack on Titan cover", dominant: DOMINANT[4]! },
  { src: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx20958-HuFJyr54Mmir.jpg", width: 720, height: 1024, alt: "Attack on Titan S2 cover", dominant: DOMINANT[4]! },
  { src: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx162314-ocaEhYmvznFO.jpg", width: 720, height: 1024, alt: "Attack on Titan Final cover", dominant: DOMINANT[5]! },

  { src: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-PEn1CTc93blC.jpg", width: 720, height: 1024, alt: "Demon Slayer cover", dominant: DOMINANT[2]! },
  { src: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx166240-PBV7zukIHW7V.png", width: 720, height: 1024, alt: "Demon Slayer: Hashira Training cover", dominant: DOMINANT[2]! },

  { src: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx269-KxkqTIuQgJ6v.png", width: 720, height: 1024, alt: "Bleach cover", dominant: DOMINANT[0]! },
  { src: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx116674-p3zK4PUX2Aag.jpg", width: 720, height: 1024, alt: "Bleach TYBW cover", dominant: DOMINANT[0]! },

  { src: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx11061-NpIIobuQNbJW.png", width: 720, height: 1024, alt: "Hunter x Hunter (2011) cover", dominant: DOMINANT[3]! },

  { src: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx124080-h8EPH92nyRfS.jpg", width: 720, height: 1024, alt: "Horimiya cover", dominant: DOMINANT[5]! },
  { src: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx124080-yXw5kfUubV8s.jpg", width: 720, height: 1024, alt: "Horimiya alt cover", dominant: DOMINANT[5]! },

  { src: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101921-qSV6zMacSDm4.png", width: 720, height: 1024, alt: "Kaguya-sama cover", dominant: DOMINANT[1]! },
  // ✅ Banner (landscape) - يعطي تنويع جميل في masonry
  { src: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/101921-OA1kJf26tBIu.jpg", width: 1700, height: 330, alt: "Kaguya-sama banner", dominant: DOMINANT[1]! },

  { src: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx143338-zhyDVYgEzsm5.png", width: 720, height: 1024, alt: "Otonari no Tenshi cover", dominant: DOMINANT[0]! },
  { src: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154965-vZbBRjtmLp7S.jpg", width: 720, height: 1024, alt: "Yamada-kun Lv999 cover", dominant: DOMINANT[3]! },

  { src: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx166216-JVyN7PHel5K9.jpg", width: 720, height: 1024, alt: "BokuYaba S2 cover", dominant: DOMINANT[4]! },

  { src: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx142838-ECZSqfknAqAT.jpg", width: 720, height: 1024, alt: "Spy x Family Part 2 cover", dominant: DOMINANT[2]! },

  { src: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx140439-gHiXDaZl9zzI.png", width: 720, height: 1024, alt: "Mob Psycho 100 III cover", dominant: DOMINANT[3]! },

  { src: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx9253-x1WUtyzJBXXX.jpg", width: 720, height: 1024, alt: "Steins;Gate cover", dominant: DOMINANT[5]! },

  { src: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx128643-ohNhGx7QDpdg.jpg", width: 720, height: 1024, alt: "Oregairu Kan cover", dominant: DOMINANT[5]! },
  { src: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/nx14813-BC8aanHK9fju.jpg", width: 720, height: 1024, alt: "Oregairu cover", dominant: DOMINANT[5]! },

  { src: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx20727-jgVnxLCHAKqZ.jpg", width: 720, height: 1024, alt: "Kekkai Sensen cover", dominant: DOMINANT[0]! },
  { src: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx170732-PwCMhnnOKdBu.jpg", width: 720, height: 1024, alt: "DanMachi V cover", dominant: DOMINANT[2]! },
  { src: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx169098-Uh57lj9NyLOY.jpg", width: 720, height: 1024, alt: "Hamidashi Creative cover", dominant: DOMINANT[1]! },

  { src: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx139518-GZWYKM8Kg1S2.png", width: 720, height: 1024, alt: "Anime cover", dominant: DOMINANT[0]! },
  { src: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx166873-JC56ExYSC2YB.jpg", width: 720, height: 1024, alt: "Anime cover", dominant: DOMINANT[4]! },
];

export const CATEGORIES: GalleryCategory[] = [
  { id: "all", label: "الكل", cover: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101921-qSV6zMacSDm4.png", aliases: ["all", "كل"] },

  { id: "one_piece", label: "ون بيس", cover: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-YCDoj1EkAxFn.jpg", aliases: ["one piece", "luffy", "لوفي"] },
  { id: "naruto", label: "ناروتو", cover: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx20-YJvLbgJQPCoI.jpg", aliases: ["naruto", "sasuke", "ساسكي"] },
  { id: "jjk", label: "جوجوتسو كايسن", cover: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-bbBWj4pEFseh.jpg", aliases: ["jjk", "gojo", "غوجو"] },
  { id: "aot", label: "هجوم العمالقة", cover: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-m5ZMNtFioc7j.jpg", aliases: ["aot", "eren", "ايرين"] },
  { id: "demon_slayer", label: "قاتل الشياطين", cover: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-PEn1CTc93blC.jpg", aliases: ["kimetsu", "tanjiro", "تانجيرو"] },
  { id: "bleach", label: "بليتش", cover: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx269-KxkqTIuQgJ6v.png", aliases: ["bleach", "ichigo", "ايتشيغو"] },

  { id: "hxh", label: "هنتر x هنتر", cover: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx11061-NpIIobuQNbJW.png", aliases: ["hxh", "gon", "غون"] },
  { id: "spy_family", label: "سباي x فاميلي", cover: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx142838-ECZSqfknAqAT.jpg", aliases: ["anya", "انیا", "spy"] },

  { id: "kaguya", label: "كاغويا ساما", cover: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101921-qSV6zMacSDm4.png", aliases: ["kaguya", "love is war"] },
  { id: "horimiya", label: "هوريميا", cover: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx124080-h8EPH92nyRfS.jpg", aliases: ["hori", "miyamura"] },
  { id: "mob", label: "موب سايكو", cover: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx140439-gHiXDaZl9zzI.png", aliases: ["mob psycho"] },
  { id: "oregairu", label: "أورغايير", cover: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx128643-ohNhGx7QDpdg.jpg", aliases: ["oregairu", "hikki"] },

  { id: "steins_gate", label: "ستاينز;غيت", cover: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx9253-x1WUtyzJBXXX.jpg", aliases: ["steins", "okabe"] },
  { id: "kekkai", label: "كيكّاي سينسن", cover: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx20727-jgVnxLCHAKqZ.jpg", aliases: ["kekkai", "blood blockade"] },

  { id: "danmachi", label: "دانماشي", cover: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx170732-PwCMhnnOKdBu.jpg", aliases: ["danmachi", "bell"] },
];

export const WORK_KINDS: Array<{ id: WorkKind; label: string }> = [
  { id: "all", label: "الكل" },
  { id: "fanart", label: "فان آرت" },
  { id: "wallpaper", label: "خلفيات" },
  { id: "manga_panel", label: "بانلات مانغا" },
  { id: "cosplay", label: "كوسبلاي" },
  { id: "chibi", label: "تشِيبي" },
  { id: "pixel", label: "بيكسل آرت" },
  { id: "concept", label: "Concept Art" },
];

export const TRENDING_KEYWORDS = [
  "Gojo",
  "Luffy",
  "Mikasa",
  "Tanjiro",
  "Sasuke",
  "Ichigo",
  "Anya",
  "Chibi",
  "Neon",
  "MangaPanel",
  "Wallpaper",
  "Cinematic",
  "Lineart",
  "SoftGlow",
] as const;

const AUTHORS: Array<Pick<GalleryAuthor, "name" | "username">> = [
  { name: "Aiko Mori", username: "aiko.mori" },
  { name: "Kaito Sketch", username: "kaito.sketch" },
  { name: "Rin Sora", username: "rinsora" },
  { name: "Yoru Pixel", username: "yoru.pixel" },
  { name: "Hana Ink", username: "hana.ink" },
  { name: "Senpai Frames", username: "senpaiframes" },
  { name: "Nami Lines", username: "nami.lines" },
  { name: "Zed Shonen", username: "zed.shonen" },
  { name: "Sakura Brush", username: "sakura.brush" },
  { name: "MangaHaze", username: "mangahaze" },
];

const TITLE_BITS = [
  "Neon Slash",
  "Silent Panel",
  "Moonlit Cut",
  "Shōnen Pulse",
  "Ink Burst",
  "Soft Glow",
  "Cinematic Frame",
  "Pixel Drift",
  "Chibi Sparks",
  "Arcane Mood",
];

const TAG_POOL = [
  "anime",
  "manga",
  "fanart",
  "panel",
  "neon",
  "lineart",
  "aesthetic",
  "cinematic",
  "glow",
  "soft",
  "vibes",
  "edit",
  "portrait",
  "scene",
];

const BASE_TIME_ISO = "2026-02-12T00:00:00.000Z";
const BASE_TIME = new Date(BASE_TIME_ISO).getTime();

function pickDominant(rnd: () => number) {
  return DOMINANT[Math.floor(rnd() * DOMINANT.length)] ?? "#64748b";
}

function dicebearAvatar(seed: string) {
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4`;
}

function createAuthor(seed: number, rnd: () => number): GalleryAuthor {
  const a = AUTHORS[Math.floor(rnd() * AUTHORS.length)] ?? AUTHORS[0]!;
  const id = `u-${Math.floor(rnd() * 9000) + 1000}`;
  return {
    id,
    name: a.name,
    username: `@${a.username}`,
    avatar: dicebearAvatar(`${a.username}-${seed}`),
    verified: rnd() > 0.78,
    followers: Math.floor(500 + rnd() * 120000),
  };
}

function createWorkImages(seed: number, rnd: () => number, preferLandscape = false): GalleryImage[] {
  // Multi image bias
  const multiBias = rnd();
  const imagesCount = multiBias > 0.7 ? 4 + Math.floor(rnd() * 3) : 1 + Math.floor(rnd() * 2); // 1-2 غالبًا، أحيانًا 4-6

  const dominant = pickDominant(rnd);

  const pool = [...ANIME_IMAGE_POOL];

  // Inject more landscape probability (banner) when needed
  const banner = pool.find((p) => p.src.includes("/banner/"));
  const coverPool = pool.filter((p) => !p.src.includes("/banner/"));

  const images: GalleryImage[] = [];
  for (let i = 0; i < imagesCount; i++) {
    const rr = mulberry32(seed * 999 + i * 37)();

    const useBanner = preferLandscape && banner && (i === 0 ? true : rr > 0.75);
    const picked = useBanner
      ? banner
      : (coverPool[Math.floor(rr * coverPool.length)] ?? coverPool[0])!;

    // We intentionally vary the aspect ratio for masonry feel (cropping via object-cover)
    const ratioPresets: Array<[number, number]> = [
      [920, 1280], // portrait
      [1100, 1100], // square
      [1400, 900], // landscape
      [1200, 1500], // tall
      [1600, 720], // wide
    ];
    const preset = ratioPresets[Math.floor(rr * ratioPresets.length)] ?? [920, 1280];

    images.push({
      src: picked.src,
      width: preset[0],
      height: preset[1],
      alt: picked.alt,
      dominant,
    });
  }

  return images;
}

function createMockDB(total: number, seedStart = 1400) {
  const items: GalleryWork[] = [];
  let seed = seedStart;

  for (let i = 0; i < total; i++) {
    const rnd = mulberry32(seed);
    const category = (CATEGORIES.filter((c) => c.id !== "all")[Math.floor(rnd() * (CATEGORIES.length - 1))] ??
      CATEGORIES[1])!;

    const kinds: Exclude<WorkKind, "all">[] = ["fanart", "wallpaper", "manga_panel", "cosplay", "chibi", "pixel", "concept"];
    const kind = kinds[Math.floor(rnd() * kinds.length)] ?? "fanart";

    const author = createAuthor(seed, rnd);

    const preferLandscape = kind === "manga_panel" || kind === "wallpaper";

    const images = createWorkImages(seed, rnd, preferLandscape);

    const likes = Math.floor(rnd() * 9000);
    const views = likes * 3 + Math.floor(rnd() * 42000);
    const saves = Math.floor(likes * (0.12 + rnd() * 0.25));

    const titleBit = TITLE_BITS[Math.floor(rnd() * TITLE_BITS.length)] ?? "Frame";
    const title = `${titleBit} • ${category.label}`;

    const createdAtISO = new Date(BASE_TIME - Math.floor(rnd() * 1000 * 60 * 60 * 24 * 24)).toISOString();

    const tags = Array.from({ length: 5 })
      .map(() => TAG_POOL[Math.floor(rnd() * TAG_POOL.length)] ?? "anime")
      .filter(Boolean);

    // Add category id as a tag (useful for filtering/searching)
    tags.unshift(category.id.replace(/_/g, ""));
    // Add some “character-ish” tags
    if (rnd() > 0.72) tags.unshift("gojo");
    if (rnd() > 0.78) tags.unshift("luffy");
    if (rnd() > 0.8) tags.unshift("tanjiro");

    items.push({
      id: `art-${seed}`,
      title,
      description: `عمل ${kind === "fanart" ? "فان آرت" : kind === "wallpaper" ? "خلفية" : "ستايل"} بإحساس أنمي — تفاصيل نظيفة + تدرّج إضاءة لطيف.`,
      categoryId: category.id,
      kind,
      images,
      tags: Array.from(new Set(tags.map((t) => safeLower(t)))).slice(0, 10),
      likes,
      views,
      saves,
      createdAtISO,
      author,
    });

    seed++;
  }

  return items;
}

// ✅ DB ثابتة/Deterministic ليدعم deep links مثل ?id=art-1409
const MOCK_DB = createMockDB(220, 1400);

export function scoreTrending(w: GalleryWork) {
  return w.likes * 1.25 + w.saves * 1.85 + w.views * 0.05;
}

export function orientationOfImage(w: number, h: number): "portrait" | "square" | "landscape" {
  const r = w / h;
  if (r < 0.92) return "portrait";
  if (r > 1.15) return "landscape";
  return "square";
}

export function orientationOfWork(work: GalleryWork) {
  const img = work.images[0];
  if (!img) return "square";
  return orientationOfImage(img.width, img.height);
}

function matchesText(work: GalleryWork, q: string) {
  const needle = safeLower(q);
  if (!needle) return true;

  const hay = [
    work.title,
    work.description,
    work.author.name,
    work.author.username,
    work.categoryId,
    work.kind,
    ...work.tags,
  ]
    .map(safeLower)
    .join(" ");

  return hay.includes(needle);
}

function matchesTag(work: GalleryWork, tag: string) {
  const t = safeLower(tag);
  if (!t) return true;
  return work.tags.some((x) => safeLower(x) === t) || safeLower(work.title).includes(t);
}

export type MockFetchWorksArgs = {
  offset: number;
  limit: number;
  filters: GalleryFilters;
  followingAuthorIds?: string[]; // used only when filters.following = true
  delayMs?: number;
  debugFail?: boolean;
};

export async function mockFetchWorks(args: MockFetchWorksArgs): Promise<{ items: GalleryWork[]; total: number }> {
  const { offset, limit, filters, followingAuthorIds = [], delayMs = 650, debugFail } = args;

  // simulate network
  await new Promise((r) => setTimeout(r, delayMs));

  if (debugFail) {
    throw new Error("Mock: failed to load works (debugFail=true).");
  }

  let list = MOCK_DB;

  if (filters.cat !== "all") list = list.filter((w) => w.categoryId === filters.cat);
  if (filters.kind !== "all") list = list.filter((w) => w.kind === filters.kind);
  if (filters.multi) list = list.filter((w) => w.images.length > 1);

  if (filters.verified) list = list.filter((w) => !!w.author.verified);

  if (filters.following) {
    const set = new Set(followingAuthorIds);
    list = list.filter((w) => set.has(w.author.id));
  }

  if (filters.o !== "all") {
    list = list.filter((w) => orientationOfWork(w) === filters.o);
  }

  if (filters.tag) list = list.filter((w) => matchesTag(w, filters.tag));
  if (filters.q) list = list.filter((w) => matchesText(w, filters.q));

  // sort
  const sorted = [...list];
  const sort = filters.sort;

  if (sort === "new") {
    sorted.sort((a, b) => (a.createdAtISO < b.createdAtISO ? 1 : -1));
  } else if (sort === "top") {
    sorted.sort((a, b) => b.likes - a.likes);
  } else {
    sorted.sort((a, b) => scoreTrending(b) - scoreTrending(a));
  }

  const total = sorted.length;
  const items = sorted.slice(offset, offset + limit);

  return { items, total };
}

export async function mockFetchWorkById(args: { id: string; delayMs?: number; debugFail?: boolean }) {
  const { id, delayMs = 450, debugFail } = args;

  await new Promise((r) => setTimeout(r, delayMs));

  if (debugFail) throw new Error("Mock: failed to load details (debugFail=true).");

  const work = MOCK_DB.find((w) => w.id === id);
  if (!work) {
    const err = new Error("NOT_FOUND");
    // @ts-expect-error attach code
    err.code = "NOT_FOUND";
    throw err;
  }
  return work;
}
