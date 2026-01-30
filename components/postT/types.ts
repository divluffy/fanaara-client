import { Dir } from "@/types";

export type PostPublisher = {
  id: string;
  name: string;
  username: string;
  avatar: {
    sm: string;
    blurHash?: string;
  };
  rank?: {
    id: string;
    label: string;
  };
  border?: Record<string, any>;
  verified?: boolean;
  country?: string; // لاحقًا نخليها ISO code type
};

export type ImageSource = {
  id: string;
  lg: string;
  md?: string;
  sm?: string;
  alt?: string;
  w?: number;
  h?: number;
  blurHash?: string;
};

export type VideoSource = {
  id: string;
  mp4: string;
  poster?: string;
  alt?: string;
  blurHash?: string;
};

export type PostMedia =
  | { type: "image"; sources: ImageSource[] }
  | { type: "video"; sources: VideoSource[] }; // ✅ فيديو واحد غالبًا

export type PostStats = {
  likes: number;
  comments: number;
  saves: number;
  popularity?: number;
  shares?: number;
};

export type PostViewerState = {
  liked: boolean;
  saved: boolean;
  followed: boolean;
};

export type PostData = {
  publisher: PostPublisher;
  id: string;
  createAt: string;
  title?: string;
  text?: string;
  media?: PostMedia;
  hashtags?: string[];
  stats: PostStats;
  viewerState: PostViewerState;
};

export type PostBoxProps = {
  postData: PostData;
  direction: Dir; // rtl or ltr
  isRTL: boolean;
};
