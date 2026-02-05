import type { IconType } from "react-icons";
import { AiFillHome } from "react-icons/ai";
import {
  LuBell,
  LuBot,
  LuBookOpen,
  LuCrown,
  LuImages,
  LuMessagesSquare,
  LuSearch,
  LuSparkles,
  LuSwords,
} from "react-icons/lu";

export type BadgeKey = "chatUnread" | "notifications";
export type ActionKey = "openNotifications";

export type AsideItemConfig =
  | {
      id: string;
      type: "link";
      href: string;
      Icon: IconType;
      exact?: boolean;
      badgeKey?: BadgeKey;
    }
  | {
      id: string;
      type: "action";
      Icon: IconType;
      actionKey: ActionKey;
      badgeKey?: BadgeKey;
    };

export const ASIDE_ITEMS = [
  { id: "home", type: "link", href: "/", Icon: AiFillHome, exact: true },
  { id: "anime", type: "link", href: "/anime", Icon: LuSwords },
  { id: "comics", type: "link", href: "/comics", Icon: LuBookOpen },
  { id: "swipes", type: "link", href: "/swipes", Icon: LuSparkles },
  { id: "gallery", type: "link", href: "/gallery", Icon: LuImages },
  { id: "ranks", type: "link", href: "/ranks", Icon: LuCrown },
  {
    id: "chat",
    type: "link",
    href: "/chat",
    Icon: LuMessagesSquare,
    badgeKey: "chatUnread",
  },
  { id: "ai", type: "link", href: "/ai-service", Icon: LuBot },
  { id: "search", type: "link", href: "/search", Icon: LuSearch },
  {
    id: "notifications",
    type: "action",
    Icon: LuBell,
    badgeKey: "notifications",
    actionKey: "openNotifications",
  },
] as const satisfies readonly AsideItemConfig[];
