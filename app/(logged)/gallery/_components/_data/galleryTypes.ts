// app\(logged)\gallery\_components\_data\galleryTypes.ts
export type WorkKind =
  | "all"
  | "fanart"
  | "wallpaper"
  | "manga_panel"
  | "cosplay"
  | "chibi"
  | "pixel"
  | "concept";

export type SortMode = "trending" | "new" | "top";
export type Orientation = "all" | "portrait" | "square" | "landscape";

export type GalleryCategory = {
  id: string;
  label: string;
  cover: string; // thumbnail/cover
  aliases?: string[];
};

export type GalleryAuthor = {
  id: string;
  name: string;
  username: string;
  avatar: string; // (dicebear svg url) - we will render it with <img> for safety
  verified?: boolean;
  followers: number;
};

export type GalleryImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
  dominant: string;
};

export type GalleryWork = {
  id: string;
  title: string;
  description: string;

  categoryId: string;
  kind: Exclude<WorkKind, "all">;

  images: GalleryImage[];
  tags: string[];

  likes: number;
  views: number;
  saves: number;

  createdAtISO: string;
  author: GalleryAuthor;
};

export type GalleryFilters = {
  q: string; // search query
  tag: string; // selected keyword/tag
  cat: string; // categoryId or "all"
  kind: WorkKind; // kind or "all"
  sort: SortMode;
  o: Orientation;

  verified: boolean;
  following: boolean;
  multi: boolean;
};

export type GalleryQueryState = GalleryFilters & {
  id: string | null; // selected work id
  page: number; // ✅ NEW: pagination via query param
};
