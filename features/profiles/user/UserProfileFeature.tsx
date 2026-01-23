import React from "react";
import Image from "next/image";
import { UserProfileDTO } from "@/types";
import { Button } from "@/design/Button";
import { IconButton } from "@/design/IconButton";
import { Avatar } from "@/design/Avatar";
import {
  FiBell,
  FiEdit2,
  FiHeart,
  FiMail,
  FiMessageCircle,
  FiMoreHorizontal,
  FiSettings,
  FiShare,
  FiUpload,
  FiUser,
  FiUserPlus,
} from "react-icons/fi";
import { SlOptions } from "react-icons/sl";
import { cn } from "@/utils/cn";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import CosmicNebulaVipFrame from "@/assets/avatar-frames/CosmicNebulaVipFrame";
import LightningChakraFrame from "@/assets/avatar-frames/LightningChakraFrame";
import SakuraPetalsOrbitFrame from "@/assets/avatar-frames/SakuraPetalsOrbitFrame";
import WaterBreathingWaveFrame from "@/assets/avatar-frames/WaterBreathingWaveFrame";
import DragonAuraCoilFrame from "@/assets/avatar-frames/DragonAuraCoilFrame";
import MagicCircleRunesFrame from "@/assets/avatar-frames/MagicCircleRunesFrame";
import SwordSlashArcFrame from "@/assets/avatar-frames/SwordSlashArcFrame";
import ShipWheelFrame from "@/assets/avatar-frames/ShipWheelFrame";
import FireCometRing from "@/assets/avatar-frames/FireCometRing";
import { BsFire } from "react-icons/bs";
import { countryCodeToFlagEmoji } from "@/utils/countryCodeToFlagEmoji";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { IoIosAdd } from "react-icons/io";
import { IoAdd } from "react-icons/io5";

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

const UserProfileFeature = async () => {
  const flag = countryCodeToFlagEmoji(user?.country);
  const t = await getTranslations();

  return (
    <main>
      <header className="relative w-full overflow-hidden   h-48 sm:h-52 md:h-64 lg:h-80 xl:h-96  p-2">
        <Image
          src={user.bg.lg}
          fill
          alt={`Profile Background for user ${user?.username}`}
          className="object-cover object-center"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-linear-to-t from-black/90 to-black/30" />

        {/* Top actions */}
        <div className="w-full flex justify-between">
          <IconButton aria-label="Inverse" variant="inverse">
            <SlOptions />
          </IconButton>

          <IconButton aria-label="Inverse" variant="inverse">
            <FiShare />
          </IconButton>
        </div>

        {/* Profile center block */}
        <div className="relative p-2 flex items-center justify-center text-center gap-2 flex-col h-full">
          {/* Avatar + rank border */}
          <div className="">
            <Avatar
              Frame={FireCometRing} // بدون size ولا className
              src={user?.avatar.md}
              alt={`${user?.username} avatar`}
              blurHash={user?.avatar?.blurHash}
              size="28"
              effects={false}
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
          <div className="flex gap-2">
            <Button
              variant="gradient"
              gradient="aurora"
              elevation="cta"
              leftIcon={<FiUserPlus />}
            >
              Follow
            </Button>

            <Button
              variant="solid"
              tone="neutral"
              leftIcon={<FiMessageCircle />}
            >
              Chat
            </Button>

            <Button variant="solid" tone="neutral" leftIcon={<BsFire />}>
              send popularity
            </Button>

            <IconButton
              aria-label="Size md square"
              size="md"
              shape="square"
              variant="soft"
              tooltip="Get Notifications"
            >
              <FiBell />
            </IconButton>
          </div>
        </div>
      </header>
      tabs here
    </main>
  );
};

export default UserProfileFeature;
