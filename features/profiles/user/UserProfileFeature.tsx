"use client";
import React, { useState } from "react";
import Image from "next/image";
import { UserProfileDTO } from "@/types";
import { Button } from "@/design/Button";
import { IconButton } from "@/design/IconButton";
import { Avatar } from "@/design/Avatar";
import {
  FiActivity,
  FiBell,
  FiBellOff,
  FiBookOpen,
  FiCamera,
  FiEdit2,
  FiHeart,
  FiMail,
  FiMessageCircle,
  FiMoreHorizontal,
  FiPause,
  FiPlus,
  FiSettings,
  FiShare,
  FiShield,
  FiStar,
  FiTrendingUp,
  FiTv,
  FiUpload,
  FiUser,
  FiUserPlus,
} from "react-icons/fi";
import { SlOptions } from "react-icons/sl";
import { cn } from "@/utils/cn";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import FireCometRing from "@/assets/avatar-frames/FireCometRing";
import { BsFire } from "react-icons/bs";
import { countryCodeToFlagEmoji } from "@/utils/countryCodeToFlagEmoji";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { IoIosAdd } from "react-icons/io";
import { IoAdd } from "react-icons/io5";
import {
  LayoutGrid,
  Library,
  MessageSquareText,
  TrendingUp,
  Trophy,
} from "lucide-react";
import ShareModal from "@/components/ShareModal";
import SenkoGiftModal from "@/components/SenkoGiftModal";
import { FaGift } from "react-icons/fa";
import { useRouter } from "next/navigation";
import AnimePostCard from "@/components/post/AnimePostCard";
import AnimePostMockCard from "@/components/post/AnimePostMockCard";
import EnhancedAnimePost from "@/components/post/EnhancedAnimePost";
import AnimePostCardSimple from "@/components/post/AnimePostCardSimple";
import AnimePostMobileOptimized from "@/components/post/AnimePostMobileOptimized";
import AnimePostCardV2 from "@/components/post/AnimePostCardV2";
import AnimePostHUD from "@/components/post/AnimePostHUD";
import PostCard from "@/components/post/PostCard";
import PostCardV2 from "@/components/post/PostCardV2";
import PostV2 from "@/components/post/PostCard";
import PostBox from "@/components/PostBox";
import { useAppSelector } from "@/store/hooks";
import { NotificationButton } from "../components/NotificationButton";
import PopularitySendModal from "@/components/PopularitySendModal";

/** ✅ rank borders */
const RanksBorders = {
  new_otaku: "/borders/wolf.png",
} as const;

/** ✅ mock */
const user: any = {
  id: "1",
  username: "dev_luffy",
  first_name: "ibrahim",
  last_name: "jomaa",
  country: "PS",
  dob: new Date("25/08/2000"),
  gender: "male",
  rank_title: "new_otaku",
  avatar: {
    md: "https://avatarfiles.alphacoders.com/367/thumb-350-367476.webp",
    blurHash: "L27dqL?byX~W-BM{00Di9tM{~WIo",
  },
  bg: {
    // lg: "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExZjU1MTV5OWxqNGNya2d1dHN5bWV6ODM1NXQ4dGx6Zjg3ZmR6bW0yMSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/2Pk9newN8fkbu/200.webp",
    lg: "https://images3.alphacoders.com/132/thumbbig-1323165.webp",
    blurHash: "L+SPFEe.%joznRaekVkCtAj[WRaf",
  },
  border: {},
  verified: true,
};
// Fake friendsList (User[])
export const friendsList = Array.from({ length: 28 }).map((_, i) => ({
  id: `u-${i + 1}`,
  name:
    [
      "Rin",
      "Kaito",
      "Mika",
      "Hana",
      "Sora",
      "Yuki",
      "Kenji",
      "Aoi",
      "Nana",
      "Toshi",
      "Luna",
      "Hiro",
      "Mei",
      "Ren",
      "Akira",
      "Saya",
      "Jin",
      "Ema",
      "Noa",
      "Riku",
      "Aya",
      "Kai",
      "Momo",
      "Haru",
      "Fuyu",
      "Yuna",
      "Shin",
      "Kyo",
    ][i] ?? `Nakama ${i + 1}`,
  handle: `@nakama_${String(i + 1).padStart(2, "0")}`,
  avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${i + 101}&backgroundColor=b6e3f4`,
  status: Math.random() > 0.65 ? "online" : "offline",
})) satisfies Array<{
  id: string;
  name: string;
  handle: string;
  avatar: string;
  status?: "online" | "offline";
}>;

type TabKey =
  | "overview"
  | "anime"
  | "comics"
  | "activity"
  | "popularity"
  | "collections"
  | "achievements"
  | "reviews";

type ResponsiveActionProps = {
  label: string;
  icon: React.ReactNode;

  // لو عندك props مختلفة للزرين
  onClick?: () => void;
  disabled?: boolean;

  // Button props الأساسية (عدّلها حسب Button عندك)
  variant?: "solid" | "outline" | "ghost" | "inverse";
  tone?: "neutral" | "brand" | "danger" | string;

  className?: string;
};

function ResponsiveActionButton({
  label,
  icon,
  onClick,
  disabled,
  variant = "solid",
  tone = "neutral",
  className,
}: ResponsiveActionProps) {
  return (
    <>
      {/* Mobile: IconButton فقط */}
      <span className="contents sm:hidden">
        <IconButton
          aria-label={label}
          tooltip={label}
          onClick={onClick}
          disabled={disabled}
          size="md"
          shape="square"
          variant={variant}
          className={cn("h-9 w-9 sm:hidden", className)}
        >
          {icon}
        </IconButton>
      </span>

      {/* >= sm: Button عادي فقط */}
      <span className="hidden sm:contents">
        <Button
          onClick={onClick}
          disabled={disabled}
          variant={variant as any}
          tone={tone as any}
          leftIcon={icon}
          className={cn("hidden sm:inline-flex h-10 px-4 text-sm", className)}
        >
          {label}
        </Button>
      </span>
    </>
  );
}

const UserProfileFeature = () => {
  const router = useRouter();
  const { isRTL, direction } = useAppSelector(({ state }) => state);

  const [tab, setTab] = useState<TabKey>("overview");
  const [open, setOpen] = useState(false);
  const [openGitf, setOpenGitf] = useState(false);
  const [openShare, setOpenShare] = useState(false);
  const [openPopularity, setOpenPopularity] = useState(false);
  const flag = countryCodeToFlagEmoji(user?.country);
  const t = useTranslations();

  const TABS: Array<{ key: TabKey; label: string; icon: React.ReactNode }> = [
    {
      key: "overview",
      label: "Overview",
      icon: <LayoutGrid className="h-4 w-4" />,
    },
    { key: "anime", label: "Anime List", icon: <FiTv className="h-4 w-4" /> },
    {
      key: "comics",
      label: "Comics List",
      icon: <FiBookOpen className="h-4 w-4" />,
    },
    {
      key: "activity",
      label: "Activity",
      icon: <FiActivity className="h-4 w-4" />,
    },
    {
      key: "popularity",
      label: "Popularity",
      icon: <FiTrendingUp className="h-4 w-4" />,
    },

    {
      key: "collections",
      label: "Collections",
      icon: <Library className="h-4 w-4" />,
    },

    {
      key: "achievements",
      label: "Achievements",
      icon: <Trophy className="h-4 w-4" />,
    },

    {
      key: "reviews",
      label: "Reviews",
      icon: <MessageSquareText className="h-4 w-4" />,
    },
  ];

  const eventTitle = "Anime Night — مشاهدة جماعية";
  const eventUrl = "https://your-domain.com/events/123";

  return (
    <main className="mx-auto w-full overflow-x-hidden">
      {/* <header className="relative w-full overflow-hidden   h-48 sm:h-52 md:h-64 lg:h-80 xl:h-96  p-2"> */}
      <header
        className="relative isolate w-full overflow-hidden ring-1 ring-white/10
                   h-[clamp(18rem,40vw,26rem)] px-3 pt-3 pb-5"
      >
        <Image
          src={user.bg.lg}
          fill
          alt={`Profile Background for user ${user?.username}`}
          className="object-cover object-center"
          loading="lazy"
        />

        {/* <div className="absolute inset-0 bg-linear-to-t from-black/90 to-black/30" /> */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/15" />

        {/* Top actions */}
        <div className="absolute inset-x-0 top-0 z-20 flex justify-between p-3">
          {/* <div className="w-full flex justify-between"> */}
          <IconButton
            aria-label="Inverse"
            variant="inverse"
            onClick={() => setOpen(true)}
          >
            <SlOptions />
          </IconButton>

          <IconButton
            onClick={() => setOpenShare(true)}
            aria-label="Inverse"
            variant="inverse"
          >
            <FiShare />
          </IconButton>
        </div>

        <ShareModal
          open={openShare}
          onOpenChange={setOpenShare}
          shareUrl="https://example.com/awesome-post"
        />

        {/* Profile center block */}
        <div className="relative z-10 flex h-full flex-col items-center justify-end gap-3 pt-10 text-center">
          {/* Avatar + rank border */}
          <div className="">
            <Avatar
              Frame={FireCometRing} // بدون size ولا className
              src={user?.avatar.md}
              alt={`${user?.username} avatar`}
              blurHash={user?.avatar?.blurHash}
              size="auto"
              effects={false}
              className="h-[clamp(5rem,10vw,8rem)] w-[clamp(5rem,10vw,8rem)]"
              sizes="(max-width: 640px) 80px, (max-width: 1024px) 112px, 128px"
            />
          </div>

          {/* Name + username */}
          <div className="flex flex-col gap-2 items-center">
            <div className="flex gap-2 items-center">
              <h2 className="tracking-tight sm:text-3xl font-bold text-white">
                {user?.first_name} {user?.last_name}
              </h2>
              {user?.verified && <VerifiedBadge size={28} />}
            </div>

            <div dir="ltr" className="flex gap-2 text-white">
              <span dir="ltr" className="">
                @{user?.username}
              </span>
              <span className="">{flag}</span>
            </div>
          </div>

          {/* Rank pill */}
          <div className="flex"></div>

          {/* Buttons row */}

          <div className="flex flex-wrap items-center justify-center gap-2">
            <ResponsiveActionButton
              label="Follow"
              icon={<FiUserPlus />}
              variant="solid"
              tone="neutral"
              onClick={() => {
                // follow logic
              }}
            />

            <ResponsiveActionButton
              label="Chat"
              icon={<FiMessageCircle />}
              variant="solid"
              tone="neutral"
              onClick={() => {
                router.push(`/chat/${user?.username}`);
              }}
            />

            <ResponsiveActionButton
              label="send gift"
              icon={<FaGift />}
              variant="solid"
              tone="neutral"
              onClick={() => {
                setOpenGitf(true);
              }}
            />

            <ResponsiveActionButton
              label="send popularity"
              icon={<BsFire />}
              variant="solid"
              tone="neutral"
              onClick={() => {
                setOpenPopularity(true);
              }}
            />

            <NotificationButton defaultValue="default" />
          </div>
        </div>
      </header>

      <PopularitySendModal
        open={openPopularity}
        onOpenChange={setOpenPopularity}
        target={{
          id: "u1",
          name: "User Name",
          avatarUrl:  "https://avatarfiles.alphacoders.com/174/thumb-350-174164.webp",
          subtitle: "ملك القراصنة 🏴‍☠️",
        }}
        targetType="user" // or "work" | "live" | "other"
        initialBalance={1540}
        purchaseHref="/shop" // عدّلها لمسار شراء الشعبية عندك
      />
      <SenkoGiftModal
        open={openGitf}
        onOpenChange={setOpenGitf}
        target={{
          id: "u-10",
          name: "Luffy Dev",
          avatar:  "https://avatarfiles.alphacoders.com/174/thumb-350-174164.webp",
          subtitle: "ملك القراصنة 🏴‍☠️",
          level: 55,
        }}
        initialBalance={1540}
      />
      {/* tabs profile */}
      <section className="w-full">
        <div
          className={cn(
            "w-fullbg-white/3 backdrop-blur no-scrollbar",
            "flex gap-2 overflow-x-auto px-4 py-2 sm:px-0 justify-evenly",
            "border-b border-nav-border bg-nav p-2 backdrop-blur",
          )}
        >
          {TABS.map((t) => {
            const active = t.key === tab;

            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "group relative flex shrink-0 items-center justify-center rounded-xl font-semibold transition",
                  "gap-2 px-3 py-2 text-sm",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-(--ring-brand)",
                  "cursor-pointer",
                  active
                    ? "text-foreground-strong"
                    : "text-foreground-muted hover:text-foreground-strong",
                )}
              >
                <span
                  className={cn(
                    "inline-flex items-center justify-center transition",
                    active
                      ? "text-(--brand-aqua)"
                      : "text-zinc-400 group-hover:text-(--brand-aqua)",
                  )}
                >
                  {t.icon}
                </span>

                <span>{t.label}</span>

                {active && (
                  <motion.span
                    layoutId="tab-underline"
                    className="absolute inset-x-3 -bottom-[6px] h-[2px] rounded-full bg-[color:var(--brand-aqua)] shadow-[var(--shadow-glow-brand)]"
                    transition={{
                      type: "spring",
                      stiffness: 520,
                      damping: 34,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* ✅ section under tabs (DARK MODE) */}
      <section className="w-full py-4">
        <div className="w-full border-b border-white/12 bg-white/[0.03] px-4 py-4 backdrop-blur sm:px-0">
          <p className="text-sm font-medium text-zinc-300">
            Current tab:
            <span className="ml-2 font-semibold text-[color:var(--brand-aqua)]">
              {TABS.find((t) => t.key === tab)?.label}
            </span>
          </p>
        </div>
      </section>

      <PostBox
        isRTL={isRTL}
        direction={direction}
        postData={{
          publisher: {
            id: "u1",
            name: "Yumi Kisaragi",
            username: "@kisaragi.yumi",
            avatar: {
              sm: "https://avatarfiles.alphacoders.com/367/thumb-350-367476.webp",
              blurHash: "L27dqL?byX~W-BM{00Di9tM{~WIo",
            },
            rank: {
              id: "s_rank",
              label: "S-Rank",
            },
            border: {},
            verified: true,
            country: "PS",
          },
          // post deatils
          id: "p_01",
          createAt: "2026-01-25T10:30:00Z",
          title: "Paneling tip for action pages",
          text: "Panel tip: use one wide ‘anchor’ frame for geography,i meet @dev.luffy last day with #event_anime and #expo then cut to hands/eyes/impact frames for speed.\n#Manga #Panels #Art\nWhat’s your favorite action page? now we can go to new country to check if we can create a new anime comics manga we love all things here around us i also need yopu baby to go with me to gaza i mess al nabolsia and shaowrma plus man plzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz",
          hashtags: ["anime", "love", "expo2025", "attach_on_titen"],
          //        media: {
          //   type: "image",
          //   sources: [
          //     {
          //       id: "1",
          //       sm: "...w=640",
          //       md: "...w=1200",
          //       lg: "...w=2400",
          //       w: 2400,
          //       h: 1600,
          //       alt: "....",
          //       blurDataURL: "data:image/jpeg;base64,..." // optional
          //     }
          //   ]
          // }
          media: {
            type: "image",
            sources: [
              {
                id: "1",
                lg: "https://images.unsplash.com/photo-1762446263896-ac93605b47d8?auto=format&fit=crop&fm=jpg&q=80&w=2400",
                alt: "Manga pages spread open",
              },
              {
                id: "2",
                lg: "https://images.unsplash.com/photo-1750365866655-e712abd3ad46?auto=format&fit=crop&fm=jpg&q=80&w=2400",
                alt: "Neon street in Tokyo at night",
              },
              {
                id: "3",
                lg: "https://images.unsplash.com/photo-1760954076011-d7ba1f26b71c?auto=format&fit=crop&fm=jpg&q=80&w=2400",
                alt: "Torii gate at a shrine at night",
              },
              {
                id: "4",
                lg: "https://avatarfiles.alphacoders.com/367/thumb-350-367476.webp",
                alt: "Anime vibes",
              },
              {
                id: "5",
                lg: "https://wallpapers.com/images/featured/anime-iphone-psdmm565oizldbbg.jpg",
                alt: "Anime vibes",
              },
            ],
          },
          stats: {
            likes: 18320,
            comments: 286,
            saves: 2210,
            popularity: 412,
            shares: 980,
          },
          viewerState: {
            liked: false,
            saved: false,
            followed: false,
          },
        }}
      />

      <PostBox
        isRTL={isRTL}
        direction={direction}
        postData={{
          publisher: {
            id: "u1",
            name: "Yumi Kisaragi",
            username: "@kisaragi.yumi",
            avatar: {
              sm: "https://avatarfiles.alphacoders.com/367/thumb-350-367476.webp",
              blurHash: "L27dqL?byX~W-BM{00Di9tM{~WIo",
            },
            rank: {
              id: "s_rank",
              label: "S-Rank",
            },
            border: {},
            verified: true,
            country: "JP",
          },
          // post deatils
          id: "p_01",
          createAt: "2026-01-25T10:30:00Z",
          title: "Paneling tip for action pages",
          text: "Panel tip: use one wide ‘anchor’ frame for geography,i meet @dev.luffy last day with #event_anime and #expo then cut to hands/eyes/impact frames for speed.\n#Manga #Panels #Art\nWhat’s your favorite action page? now we can go to new country to check if we can create a new anime comics manga we love all things here around us i also need yopu baby to go with me to gaza i mess al nabolsia and shaowrma plus man plzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz",
          hashtags: ["anime", "love", "expo2025", "attach_on_titen"],
          media: {
            type: "image",
            sources: [
              {
                id: "1",
                lg: "https://mfiles.alphacoders.com/100/thumb-350-1008214.png",
                alt: "Manga pages spread open",
                blurHash: "L27dqL?byX~W-BM{00Di9tM{~WIo",
              },
              {
                id: "2",
                lg: "https://mfiles.alphacoders.com/101/thumb-350-1013144.png",
                alt: "Neon street in Tokyo at night",
                blurHash: "L27dqL?byX~W-BM{00Di9tM{~WIo",
              },
              {
                id: "3",
                lg: "https://mfiles.alphacoders.com/101/thumb-350-1012864.png",
                alt: "Torii gate at a shrine at night",
                blurHash: "L27dqL?byX~W-BM{00Di9tM{~WIo",
              },
              {
                id: "4",
                lg: "https://mfiles.alphacoders.com/101/thumb-350-1012748.png",
                alt: "Anime vibes",
                blurHash: "L27dqL?byX~W-BM{00Di9tM{~WIo",
              },
              {
                id: "5",
                lg: "https://mfiles.alphacoders.com/101/thumb-350-1012645.png",
                alt: "Anime vibes",
                blurHash: "L27dqL?byX~W-BM{00Di9tM{~WIo",
              },
              {
                id: "6",
                lg: "https://mfiles.alphacoders.com/101/thumb-350-1012400.png",
                alt: "Anime vibes",
                blurHash: "L27dqL?byX~W-BM{00Di9tM{~WIo",
              },
            ],
          },
          stats: {
            likes: 18320,
            comments: 286,
            saves: 2210,
            popularity: 412,
            shares: 980,
          },
          viewerState: {
            liked: false,
            saved: false,
            followed: false,
          },
        }}
      />
      <PostBox
        isRTL={isRTL}
        direction={direction}
        postData={{
          publisher: {
            id: "u1",
            name: "Yumi Kisaragi",
            username: "@kisaragi.yumi",
            avatar: {
              sm: "https://avatarfiles.alphacoders.com/367/thumb-350-367476.webp",
              blurHash: "L27dqL?byX~W-BM{00Di9tM{~WIo",
            },
            rank: {
              id: "s_rank",
              label: "S-Rank",
            },
            border: {},
            verified: true,
            country: "SA",
          },
          // post deatils
          id: "p_01",
          createAt: "2026-01-25T10:30:00Z",
          title: "Paneling tip for action pages",
          media: {
            type: "video",
            sources: [
              {
                id: "1",
                mp4: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                poster:
                  "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg",
                alt: "Manga pages spread open",
              },
            ],
          },
          stats: {
            likes: 18320,
            comments: 286,
            saves: 2210,
            popularity: 412,
            shares: 980,
          },
          viewerState: {
            liked: true,
            saved: true,
            followed: true,
          },
        }}
      />
      <PostBox
        isRTL={isRTL}
        direction={direction}
        postData={{
          publisher: {
            id: "u1",
            name: "Yumi Kisaragi",
            username: "@kisaragi.yumi",
            avatar: {
              sm: "https://avatarfiles.alphacoders.com/367/thumb-350-367476.webp",
              blurHash: "L27dqL?byX~W-BM{00Di9tM{~WIo",
            },
            rank: {
              id: "s_rank",
              label: "S-Rank",
            },
            border: {},
            verified: true,
            country: "ps",
          },
          // post deatils
          id: "p_01",
          createAt: "2026-01-25T10:30:00Z",
          title: "love you guys ♥",
          text: "",
          hashtags: [],
          media: {
            type: "image",
            // type: "video",
            sources: [
              {
                id: "1",
                lg: "https://images.unsplash.com/photo-1762446263896-ac93605b47d8?auto=format&fit=crop&fm=jpg&q=80&w=2400",
                alt: "Manga pages spread open",
              },
            ],
          },
          stats: {
            likes: 18320,
            comments: 286,
            saves: 2210,
            popularity: 412,
            shares: 980,
          },
          viewerState: {
            liked: true,
            saved: true,
            followed: true,
          },
        }}
      />

      <PostBox
        isRTL={isRTL}
        direction={direction}
        postData={{
          publisher: {
            id: "u1",
            name: "Yumi Kisaragi",
            username: "@kisaragi.yumi",
            avatar: {
              sm: "https://avatarfiles.alphacoders.com/367/thumb-350-367476.webp",
              blurHash: "L27dqL?byX~W-BM{00Di9tM{~WIo",
            },
            rank: {
              id: "s_rank",
              label: "S-Rank",
            },
            border: {},
            verified: true,
            country: "ps",
          },
          // post deatils
          id: "p_01",
          createAt: "2026-01-25T10:30:00Z",
          title: "love you guys ♥ :)",
          text: "",
          hashtags: [],
          stats: {
            likes: 18320,
            comments: 286,
            saves: 2210,
            popularity: 412,
            shares: 980,
          },
          viewerState: {
            liked: true,
            saved: true,
            followed: true,
          },
        }}
      />
      <PostBox
        isRTL={isRTL}
        direction={direction}
        postData={{
          publisher: {
            id: "u1",
            name: "Yumi Kisaragi",
            username: "@kisaragi.yumi",
            avatar: {
              sm: "https://avatarfiles.alphacoders.com/367/thumb-350-367476.webp",
              blurHash: "L27dqL?byX~W-BM{00Di9tM{~WIo",
            },
            rank: {
              id: "biggener_otaku",
              label: "Biggener Otaku",
            },
            border: {},
            verified: true,
            country: "ps",
          },
          id: "p_01",
          createAt: "2026-01-25T10:30:00Z",
          media: {
            type: "image",
            sources: [
              {
                id: "2",
                lg: "https://images.unsplash.com/photo-1760954076011-d7ba1f26b71c?auto=format&fit=crop&fm=jpg&q=80&w=2400",
                alt: "Torii gate at a shrine at night",
              },
              {
                id: "4",
                lg: "https://images.unsplash.com/photo-1520975869010-3ff97dfbef6b?auto=format&fit=crop&fm=jpg&q=80&w=2400",
                alt: "Anime vibes",
              },
            ],
          },
          stats: {
            likes: 0,
            comments: 0,
            saves: 0,
            popularity: 0,
            shares: 0,
          },
          viewerState: {
            liked: false,
            saved: false,
            followed: false,
          },
        }}
      />
      <br />
      <hr />
      <br />
      <h1>111</h1>
      <br />
      <PostV2
        post={{
          id: "p_01",
          user: {
            id: "u1",
            name: "Yumi Kisaragi",
            handle: "@kisaragi.yumi",
            avatar:
              "https://images.unsplash.com/photo-1742299899537-c765ac3fda5c?auto=format&fit=crop&fm=jpg&q=80&w=600",
            rank: { label: "S-Rank Creator", tone: "brand" },
          },
          time: "Today • 9:14 PM",
          title: "Paneling tip for action pages",
          text: "Panel tip: use one wide ‘anchor’ frame for geography, then cut to hands/eyes/impact frames for speed.\n\n#Manga #Panels #Art\n\nWhat’s your favorite action page?",
          media: [
            {
              src: "https://images.unsplash.com/photo-1762446263896-ac93605b47d8?auto=format&fit=crop&fm=jpg&q=80&w=2400",
              alt: "Manga pages spread open",
            },
            {
              src: "https://images.unsplash.com/photo-1750365866655-e712abd3ad46?auto=format&fit=crop&fm=jpg&q=80&w=2400",
              alt: "Neon street in Tokyo at night",
            },
            {
              src: "https://images.unsplash.com/photo-1760954076011-d7ba1f26b71c?auto=format&fit=crop&fm=jpg&q=80&w=2400",
              alt: "Torii gate at a shrine at night",
            },
            {
              src: "https://images.unsplash.com/photo-1520975869010-3ff97dfbef6b?auto=format&fit=crop&fm=jpg&q=80&w=2400",
              alt: "Anime vibes",
            },
          ],
          stats: {
            likes: 18320,
            comments: 286,
            saves: 2210,
            popularity: 412,
            shares: 980,
          },
          viewerState: { liked: false, saved: true, followed: false },
          url: "https://fanaara.com/post/p_01",
        }}
        viewerId="viewer_01"
        className="max-w-2xl mx-auto"
      />
      <br />
      <hr />
      <br />
      <h1>2222</h1>
      <br />
      <PostCardV2 />
      <br />
      <hr />
      <br />
      <AnimePostHUD />
      <br />
      <hr />
      <br />
      <AnimePostCard />
      <br />
      <hr />
      <br />
      <AnimePostMockCard />
      <br />
      <hr />
      <br />
      <EnhancedAnimePost />
      <br />
      <hr />
      <br />
      <AnimePostCardSimple />
      <br />
      <hr />
      <br />
      <AnimePostMobileOptimized />
      <br />
      <hr />
      <br />
      <AnimePostCardV2 />
      <br />
      <hr />
      <br />
      <br />
      <hr />
      <br />
    </main>
  );
};

export default UserProfileFeature;
