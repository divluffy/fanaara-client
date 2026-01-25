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
  country: "ps",
  dob: new Date("25/08/2000"),
  gender: "male",
  rank_title: "new_otaku",
  avatar: {
    md: "https://avatarfiles.alphacoders.com/367/thumb-350-367476.webp",
    blurHash: "L27dqL?byX~W-BM{00Di9tM{~WIo",
  },
  bg: {
    lg: "https://images3.alphacoders.com/132/thumbbig-1323165.webp",
    blurHash: "L+SPFEe.%joznRaekVkCtAj[WRaf",
  },
  border: {},
  verified: true,
};

type TabKey =
  | "overview"
  | "anime"
  | "comics"
  | "activity"
  | "popularity"
  | "collections"
  | "achievements"
  | "reviews";

const UserProfileFeature = () => {
  const [tab, setTab] = useState<TabKey>("overview");

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
          <IconButton aria-label="Inverse" variant="inverse">
            <SlOptions />
          </IconButton>

          <IconButton aria-label="Inverse" variant="inverse">
            <FiShare />
          </IconButton>
        </div>

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
              <h2 className="tracking-tight sm:text-3xl text-white">
                {user?.first_name} {user?.last_name}
              </h2>
              {user?.verified && <VerifiedBadge size={28} />}
            </div>

            <div className="flex gap-2 text-white">
              <span className="">@{user?.username}</span>
              <p>|</p>
              <span className="">
                {flag} {t(`countries.${user?.country.toUpperCase()}`)}
              </span>
            </div>
          </div>

          {/* Rank pill */}
          <div className="flex"></div>

          {/* Buttons row */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              variant="solid"
              tone="neutral"
              leftIcon={<FiUserPlus />}
              className="h-9 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm"
            >
              Follow
            </Button>

            <Button
              variant="solid"
              tone="neutral"
              leftIcon={<FiMessageCircle />}
              className="h-9 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm"
            >
              Chat
            </Button>

            <Button
              variant="solid"
              tone="neutral"
              leftIcon={<BsFire />}
              className="h-9 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm"
            >
              send popularity
            </Button>

            <IconButton
              aria-label="Get Notifications"
              size="md"
              shape="square"
              variant="solid"
              tooltip="Get Notifications"
              className="h-9 w-9 sm:h-10 sm:w-10"
            >
              <FiBell />
            </IconButton>
          </div>
        </div>
      </header>

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
    </main>
  );
};

export default UserProfileFeature;
