
// app\(logged)\chat\_data\mockChat.ts

export type ChatTab = "friends" | "public" | "requests";
export type Presence = "online" | "idle" | "offline";
export type ConversationKind = "dm" | "group";

export type User = {
  id: string;
  name: string;
  handle: string; // e.g. "@amina_art"
  avatarUrl: string;
  presence: Presence;
  verified?: boolean;
  role?: "member" | "creator" | "mod";
};

export type Media = {
  src: string; // can be data-uri
  width: number;
  height: number;
  alt: string;
};

export type SharedItem = {
  kind: "anime" | "manga" | "post";
  title: string;
  subtitle?: string;
  cover?: Media;
};

export type VideoItem = {
  src: string;
  title: string;
  durationSec: number;
  poster?: Media;
};

export type Reaction = { emoji: string; count: number; byMe?: boolean };

export type MessageType =
  | "text"
  | "image"
  | "video"
  | "share"
  | "sticker"
  | "system";

export type Message = {
  id: string;
  conversationId: string;
  fromId: string;
  type: MessageType;

  text?: string;
  media?: Media;
  video?: VideoItem;
  share?: SharedItem;

  createdAt: string;
  readAt?: string | null;

  // only for outgoing
  status?: "sent" | "delivered" | "read";

  reactions?: Reaction[];
};

export type Conversation = {
  id: string;
  kind: ConversationKind;
  category: ChatTab;

  // dm: title is user's name
  // group: title is room name
  title: string;

  peerId?: string; // dm
  memberIds: string[];

  pinned?: boolean;
  muted?: boolean;

  // used to draw "Last read" marker inside messages when unread exists
  lastReadMessageId?: string | null;

  // requests-only
  isRequest?: boolean;
  requestNote?: string;
};

export type MentionOption = {
  id: string;
  username: string; // without "@"
  displayName?: string;
  avatarUrl?: string;
};

export type Seed = {
  me: User;
  users: User[];
  conversations: Conversation[];
  messages: Message[];
};

export const ME_ID = "me";

/** ---------- Tiny deterministic helpers ---------- */

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(r: () => number, arr: T[]) {
  return arr[Math.floor(r() * arr.length)];
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

const BASE_MS = Date.parse("2026-02-04T12:00:00.000Z");
function isoFromBaseMinutesAgo(minAgo: number) {
  return new Date(BASE_MS - minAgo * 60_000).toISOString();
}
function isoAddMinutes(iso: string, addMin: number) {
  const ms = Date.parse(iso) + addMin * 60_000;
  return new Date(ms).toISOString();
}

/** ---------- Inline media (data-uri SVG) to avoid Next/Image remote config issues ---------- */

function svgDataUri(opts: {
  w: number;
  h: number;
  label: string;
  mood?: "aqua" | "purple" | "amber";
}) {
  const { w, h, label, mood = "aqua" } = opts;

  const palettes: Record<string, { a: string; b: string; ink: string }> = {
    aqua: { a: "#03bec8", b: "#15637b", ink: "#0b1220" },
    purple: { a: "#7c3aed", b: "#03bec8", ink: "#0b1220" },
    amber: { a: "#febf08", b: "#f54c00", ink: "#0b1220" },
  };

  const p = palettes[mood];

  const safeLabel = label.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${p.a}"/>
      <stop offset="100%" stop-color="${p.b}"/>
    </linearGradient>

    <pattern id="dots" width="18" height="18" patternUnits="userSpaceOnUse">
      <circle cx="3" cy="3" r="1.8" fill="rgba(255,255,255,0.25)" />
      <circle cx="12" cy="12" r="1.2" fill="rgba(255,255,255,0.18)" />
    </pattern>

    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="12" />
    </filter>
  </defs>

  <rect width="100%" height="100%" fill="url(#g)"/>
  <rect width="100%" height="100%" fill="url(#dots)" opacity="0.75"/>

  <g opacity="0.25" filter="url(#soft)">
    <circle cx="${Math.round(w * 0.2)}" cy="${Math.round(h * 0.25)}" r="${Math.round(Math.min(w, h) * 0.22)}" fill="white"/>
    <circle cx="${Math.round(w * 0.78)}" cy="${Math.round(h * 0.7)}" r="${Math.round(Math.min(w, h) * 0.18)}" fill="white"/>
  </g>

  <rect x="${Math.round(w * 0.06)}" y="${Math.round(h * 0.72)}" width="${Math.round(w * 0.88)}" height="${Math.round(h * 0.18)}" rx="20"
    fill="rgba(11,18,32,0.42)" stroke="rgba(255,255,255,0.22)" />

  <text x="${Math.round(w * 0.1)}" y="${Math.round(h * 0.82)}"
    font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto"
    font-weight="800" font-size="${clamp(Math.round(w * 0.05), 20, 42)}"
    fill="white">${safeLabel}</text>

  <text x="${Math.round(w * 0.1)}" y="${Math.round(h * 0.9)}"
    font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto"
    font-weight="600" font-size="${clamp(Math.round(w * 0.028), 12, 22)}"
    fill="rgba(255,255,255,0.85)">Fanaara • preview</text>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function makeMedia(
  label: string,
  w: number,
  h: number,
  mood?: "aqua" | "purple" | "amber",
): Media {
  return {
    src: svgDataUri({ w, h, label, mood }),
    width: w,
    height: h,
    alt: label,
  };
}

/** ---------- Users ---------- */

export const me: User = {
  id: ME_ID,
  name: "dev.luffy",
  handle: "@dev_luffy",
  avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
  presence: "online",
  verified: true,
  role: "creator",
};

const friendUsers: User[] = [
  {
    id: "u_am",
    name: "Amina",
    handle: "@amina_art",
    avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg",
    presence: "online",
    verified: true,
    role: "creator",
  },
  {
    id: "u_ke",
    name: "Kenji",
    handle: "@kenji_edits",
    avatarUrl: "https://randomuser.me/api/portraits/men/68.jpg",
    presence: "idle",
    role: "creator",
  },
  {
    id: "u_sa",
    name: "Sara",
    handle: "@sara_manga",
    avatarUrl: "https://randomuser.me/api/portraits/women/25.jpg",
    presence: "online",
    role: "creator",
  },
  {
    id: "u_om",
    name: "Omar",
    handle: "@omar_op",
    avatarUrl: "https://randomuser.me/api/portraits/men/14.jpg",
    presence: "offline",
    role: "member",
  },
  {
    id: "u_yu",
    name: "Yuki",
    handle: "@yuki_cos",
    avatarUrl: "https://randomuser.me/api/portraits/women/63.jpg",
    presence: "idle",
    role: "creator",
  },
  {
    id: "u_ha",
    name: "Hana",
    handle: "@hana_panel",
    avatarUrl: "https://randomuser.me/api/portraits/women/81.jpg",
    presence: "online",
    role: "member",
  },
  {
    id: "u_fa",
    name: "Fatima",
    handle: "@fatima_mod",
    avatarUrl: "https://randomuser.me/api/portraits/women/12.jpg",
    presence: "online",
    verified: true,
    role: "mod",
  },
  {
    id: "u_mi",
    name: "Mina",
    handle: "@mina_ui",
    avatarUrl: "https://randomuser.me/api/portraits/women/52.jpg",
    presence: "offline",
    role: "creator",
  },
  {
    id: "u_lu",
    name: "Lucas",
    handle: "@lucas_scan",
    avatarUrl: "https://randomuser.me/api/portraits/men/22.jpg",
    presence: "idle",
    role: "member",
  },
  {
    id: "u_ma",
    name: "Maria",
    handle: "@maria_cos",
    avatarUrl: "https://randomuser.me/api/portraits/women/90.jpg",
    presence: "online",
    role: "creator",
  },
  {
    id: "u_ry",
    name: "Ryo",
    handle: "@ryo_sfx",
    avatarUrl: "https://randomuser.me/api/portraits/men/49.jpg",
    presence: "offline",
    role: "member",
  },
  {
    id: "u_ay",
    name: "Aya",
    handle: "@aya_reviews",
    avatarUrl: "https://randomuser.me/api/portraits/women/36.jpg",
    presence: "online",
    verified: true,
    role: "creator",
  },
];

const requestUsers: User[] = [
  {
    id: "u_li",
    name: "Lina",
    handle: "@lina_new",
    avatarUrl: "https://randomuser.me/api/portraits/women/7.jpg",
    presence: "online",
    role: "member",
  },
  {
    id: "u_no",
    name: "Noah",
    handle: "@noah_gg",
    avatarUrl: "https://randomuser.me/api/portraits/men/8.jpg",
    presence: "offline",
    role: "member",
  },
  {
    id: "u_zi",
    name: "Ziad",
    handle: "@ziad_clip",
    avatarUrl: "https://randomuser.me/api/portraits/men/77.jpg",
    presence: "idle",
    role: "member",
  },
  {
    id: "u_hi",
    name: "Hikari",
    handle: "@hikari_wave",
    avatarUrl: "https://randomuser.me/api/portraits/women/18.jpg",
    presence: "online",
    role: "member",
  },
];

const extraUsers: User[] = [
  {
    id: "u_za",
    name: "Zara",
    handle: "@zara_color",
    avatarUrl: "https://randomuser.me/api/portraits/women/58.jpg",
    presence: "online",
    role: "creator",
  },
  {
    id: "u_ka",
    name: "Kaito",
    handle: "@kaito_ink",
    avatarUrl: "https://randomuser.me/api/portraits/men/38.jpg",
    presence: "idle",
    role: "creator",
  },
  {
    id: "u_re",
    name: "Reem",
    handle: "@reem_story",
    avatarUrl: "https://randomuser.me/api/portraits/women/33.jpg",
    presence: "offline",
    role: "member",
  },
  {
    id: "u_ji",
    name: "Jin",
    handle: "@jin_frames",
    avatarUrl: "https://randomuser.me/api/portraits/men/51.jpg",
    presence: "online",
    role: "creator",
  },
];

export const users: User[] = [
  me,
  ...friendUsers,
  ...requestUsers,
  ...extraUsers,
];

/** ---------- Conversations ---------- */

function makeDmConv(
  u: User,
  category: ChatTab,
  opts?: Partial<Conversation>,
): Conversation {
  return {
    id: `${category === "requests" ? "req" : "dm"}_${u.id}`,
    kind: "dm",
    category,
    title: u.name,
    peerId: u.id,
    memberIds: [ME_ID, u.id],
    isRequest: category === "requests",
    ...opts,
  };
}

function makeGroupConv(
  id: string,
  title: string,
  memberIds: string[],
  opts?: Partial<Conversation>,
): Conversation {
  return {
    id,
    kind: "group",
    category: "public",
    title,
    memberIds,
    ...opts,
  };
}

const dmFriends: Conversation[] = friendUsers.map((u) =>
  makeDmConv(u, "friends"),
);

dmFriends[0] = { ...dmFriends[0], pinned: true }; // pin Amina
dmFriends[6] = { ...dmFriends[6], muted: true }; // mute Fatima (just for variety)

const dmRequests: Conversation[] = requestUsers.map((u, idx) =>
  makeDmConv(u, "requests", {
    requestNote:
      idx === 0
        ? "مرحبًا! ممكن اسأل عن نظام المجموعات؟"
        : idx === 1
          ? "I saw your post about moderation — can I join?"
          : idx === 2
            ? "عندي فكرة كولاب AMV!"
            : "Hey! quick question 🙌",
  }),
);

const groupPublic: Conversation[] = [
  makeGroupConv(
    "room_grandline",
    "Grand Line • One Piece",
    [ME_ID, "u_om", "u_ay", "u_ke", "u_ka", "u_re", "u_za"],
    { pinned: true },
  ),
  makeGroupConv("room_manga_club", "Manga Club • Weekly Picks", [
    ME_ID,
    "u_sa",
    "u_ha",
    "u_lu",
    "u_ji",
    "u_re",
  ]),
  makeGroupConv("room_art_lab", "Art Lab • Panels & Coloring", [
    ME_ID,
    "u_am",
    "u_za",
    "u_ka",
    "u_mi",
    "u_ji",
  ]),
  makeGroupConv("room_amv", "AMV Arena", [
    ME_ID,
    "u_ke",
    "u_zi",
    "u_ry",
    "u_ji",
  ]),
  makeGroupConv("room_cosplay", "Cosplay Corner", [
    ME_ID,
    "u_yu",
    "u_ma",
    "u_fa",
    "u_re",
  ]),
];

export const conversations: Conversation[] = [
  ...dmFriends,
  ...groupPublic,
  ...dmRequests,
];

/** ---------- Messages generator ---------- */

const EMOJIS_QUICK = ["✨", "🔥", "😂", "❤️", "😮", "🫡"] as const;

const TEXT_ME = [
  "تمام! خلّينا نرتّبها 👌",
  "أعطني 5 دقايق وأرجع لك.",
  "الفكرة ممتازة… بس نحتاج نضبط الـflow.",
  "هذا اللي كنت أقصده بالضبط ✅",
  "خلّها clean وبسيطة، والباقي iterative.",
  "حلو… طيب وش رأيك لو نستخدم CTA واضح؟",
  "أرسل لي مثال على الحالة اللي تواجهك.",
  "ممكن نحلها بـ optimistic UI + retry.",
];

const TEXT_THEM = [
  "ههههه نفس الشي خطر ببالي 😂",
  "شفت التصميم… رهيب!",
  "بصراحة الـscroll عندي كان يخرب كل شيء.",
  "ممكن نخلي الصور تتفتح lightbox؟",
  "كيف راح تكون خيارات التفاعل على الرسائل؟",
  "أبغى زر تحدي في الهيدر 🔥",
  "عندي اقتراح: نخلي آخر رسالة مقروءة بعلامة.",
  "متى نضيف group creation؟",
];

const TEXT_GROUP = [
  "🔥 مين متحمس للفصل الجديد؟",
  "تذكير: بدون سبويلرز في العنوان لو سمحتم 🙏",
  "الـart هنا يطير العقل!",
  "حد عنده توصية manga قصيرة؟",
  "الـpanel هذا legendary ✨",
  "خلونا نرتّب تحدي أسبوعي.",
  "مين يشاركنا رأيه؟",
];

function buildMessagesForConversation(conv: Conversation) {
  const r = mulberry32(hashSeed(conv.id));

  const total =
    conv.category === "friends"
      ? 18 + Math.floor(r() * 8)
      : conv.category === "public"
        ? 22 + Math.floor(r() * 10)
        : 8 + Math.floor(r() * 4);

  const createdStart =
    conv.category === "requests"
      ? isoFromBaseMinutesAgo(60 * 6 + Math.floor(r() * 240))
      : conv.category === "public"
        ? isoFromBaseMinutesAgo(60 * 24 * 2 + Math.floor(r() * 60 * 24))
        : isoFromBaseMinutesAgo(60 * 20 + Math.floor(r() * 60 * 36));

  const members = conv.memberIds.length ? conv.memberIds : [ME_ID];

  // unread tail (only inbound messages)
  const unreadTail =
    conv.category === "requests"
      ? Math.min(5, total - 2)
      : conv.category === "public"
        ? Math.floor(r() * 4)
        : Math.floor(r() * 3);

  const messages: Message[] = [];

  // system message first
  messages.push({
    id: `${conv.id}_m0`,
    conversationId: conv.id,
    fromId: "system",
    type: "system",
    text:
      conv.kind === "group"
        ? "تم إنشاء الغرفة • قوانين بسيطة: بدون سبويلرز + احترام الجميع."
        : "تم تأمين المحادثة — تفاعلاتك محفوظة ✨",
    createdAt: createdStart,
    readAt: createdStart,
  });

  const forceShowcase = conv.id === "dm_u_am" || conv.id === "room_grandline";

  for (let i = 1; i < total; i++) {
    const t = isoAddMinutes(createdStart, i * 7 + Math.floor(r() * 3));

    // who sends
    let fromId = ME_ID;
    if (conv.category === "requests") {
      // requesters talk first
      fromId = i < total - 2 ? (conv.peerId as string) : ME_ID;
    } else if (conv.kind === "group") {
      // group: mostly others
      fromId =
        r() < 0.28
          ? ME_ID
          : pick(
              r,
              members.filter((x) => x !== ME_ID),
            );
    } else {
      fromId = r() < 0.52 ? ME_ID : (conv.peerId as string);
    }

    // message type
    let type: MessageType = "text";

    const roll = r();

    if (forceShowcase) {
      // Inject a few diverse types so UI showcases image/video/share/sticker
      if (i === 4) type = "image";
      else if (i === 8) type = "share";
      else if (i === 12) type = "video";
      else if (i === 15) type = "sticker";
      else
        type =
          roll < 0.72
            ? "text"
            : roll < 0.82
              ? "image"
              : roll < 0.9
                ? "share"
                : "text";
    } else {
      type =
        roll < 0.72
          ? "text"
          : roll < 0.84
            ? "image"
            : roll < 0.92
              ? "share"
              : roll < 0.97
                ? "sticker"
                : "video";
    }

    const base: Message = {
      id: `${conv.id}_m${i}`,
      conversationId: conv.id,
      fromId,
      type,
      createdAt: t,
    };

    // content
    if (type === "text") {
      base.text =
        fromId === ME_ID
          ? pick(r, TEXT_ME)
          : conv.kind === "group"
            ? pick(r, TEXT_GROUP)
            : pick(r, TEXT_THEM);
    }

    if (type === "sticker") {
      base.text = pick(r, [
        "(╯°□°）╯︵ ┻━┻",
        "✨",
        "💀",
        "٩(ˊᗜˋ*)و",
        "🧠⚡",
        "🍜",
        "🏴‍☠️",
      ]);
    }

    if (type === "image") {
      const label =
        conv.kind === "group"
          ? pick(r, [
              "Panel drop",
              "Coloring WIP",
              "Manga mood",
              "Cosplay shot",
              "AMV frame",
            ])
          : pick(r, ["Screenshot", "Draft", "Reference", "Idea"]);
      base.media = makeMedia(
        label,
        840,
        560,
        roll < 0.34 ? "aqua" : roll < 0.67 ? "purple" : "amber",
      );
      base.text =
        r() < 0.35
          ? pick(r, ["شوف هذا 👀", "لقطة سريعة", "هذا اللي أقصده", "🔥🔥"])
          : undefined;
    }

    if (type === "video") {
      base.video = {
        src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
        title: conv.kind === "group" ? "Clip preview" : "Quick clip",
        durationSec: 12,
        poster: makeMedia("Video preview", 960, 540, "aqua"),
      };
      base.text = r() < 0.3 ? "شغّله وشوف 😄" : undefined;
    }

    if (type === "share") {
      const k = pick(r, ["anime", "manga", "post"] as const);
      base.share = {
        kind: k,
        title:
          k === "anime"
            ? pick(r, ["One Piece — EP 1100", "Frieren — S1", "JJK — Season 2"])
            : k === "manga"
              ? pick(r, ["Sakamoto Days", "Blue Lock", "Oshi no Ko"])
              : pick(r, [
                  "نظام المجموعات في Fanaara",
                  "قائمة أفضل OSTs",
                  "تحدي الأسبوع",
                ]),
        subtitle:
          k === "post"
            ? "مشاركة داخلية • اضغط للفتح"
            : k === "anime"
              ? "Anime page • متابعة/مراجعة"
              : "Manga page • إضافة للمكتبة",
        cover: makeMedia(
          k.toUpperCase(),
          320,
          220,
          k === "post" ? "purple" : "aqua",
        ),
      };
    }

    // reactions (random)
    if (r() < 0.22 && type !== "system") {
      base.reactions = [
        {
          emoji: pick(r, [...EMOJIS_QUICK]),
          count: 1 + Math.floor(r() * 3),
          byMe: r() < 0.35,
        },
        ...(r() < 0.25
          ? [{ emoji: pick(r, [...EMOJIS_QUICK]), count: 1 }]
          : []),
      ];
    }

    // readAt/status logic
    const isInbound = fromId !== ME_ID && fromId !== "system";
    const isUnread = isInbound && i >= total - unreadTail;

    if (isInbound) {
      base.readAt = isUnread ? null : isoAddMinutes(t, 1 + Math.floor(r() * 7));
    } else if (fromId === ME_ID) {
      // outgoing status (fake)
      base.status = i >= total - 2 ? "delivered" : "read";
    }

    messages.push(base);
  }

  // compute lastReadMessageId for marker
  let lastReadMessageId: string | null = null;
  if (unreadTail > 0) {
    // find last inbound read message before unread sequence
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.fromId !== ME_ID && m.fromId !== "system" && m.readAt) {
        lastReadMessageId = m.id;
        break;
      }
    }
  }

  return { messages, lastReadMessageId };
}

export const seedMessagesData: Seed = (() => {
  const byConv: Record<
    string,
    { messages: Message[]; lastReadMessageId: string | null }
  > = {};
  const updatedConvs: Conversation[] = conversations.map((c) => {
    const built = buildMessagesForConversation(c);
    byConv[c.id] = built;
    return {
      ...c,
      lastReadMessageId: built.lastReadMessageId ?? c.lastReadMessageId ?? null,
    };
  });

  const allMessages = Object.values(byConv)
    .flatMap((x) => x.messages)
    .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));

  return {
    me,
    users,
    conversations: updatedConvs,
    messages: allMessages,
  };
})();

export const mentionOptions: MentionOption[] = users
  .filter((u) => u.id !== ME_ID && u.handle.startsWith("@"))
  .map((u) => ({
    id: u.id,
    username: u.handle.replace(/^@/, ""),
    displayName: u.name,
    avatarUrl: u.avatarUrl,
  }));



