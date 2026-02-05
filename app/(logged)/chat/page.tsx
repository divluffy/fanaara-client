// app\(logged)\chat\page.tsx
"use client";

import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  IoAddOutline,
  IoChevronBackOutline,
  IoCloseOutline,
  IoEllipsisHorizontal,
  IoSearchOutline,
  IoCallOutline,
  IoVideocamOutline,
  IoTrophyOutline,
  IoChatbubbleEllipsesOutline,
  IoPeopleOutline,
  IoImageOutline,
  IoPlayCircleOutline,
  IoLinkOutline,
  IoCopyOutline,
  IoTrashOutline,
  IoReturnUpBackOutline,
  IoHappyOutline,
  IoSendOutline,
  IoAttachOutline,
  IoCheckmarkDoneOutline,
  IoCheckmarkOutline,
  IoAlertCircleOutline,
} from "react-icons/io5";

import { cn } from "@/utils/cn";
import { Avatar } from "@/design/DeAvatar";
import { Button } from "@/design/DeButton";
import Modal from "@/design/DeModal";
import OptionsSheet, {
  type OptionsSheetOptionInput,
  type ActionId,
} from "@/design/DeOptions";

import {
  ME_ID,
  mentionOptions as defaultMentionOptions,
  type ChatTab,
  type Conversation,
  type Media,
  type Message as SeedMessage,
  type Seed,
  type User,
  seedMessagesData,
} from "./_data/mockChat";

/** =========================================================
 *  Helpers
 *  ========================================================= */

type Dir = "rtl" | "ltr";

function useAppDir(defaultDir: Dir = "rtl") {
  const [dir, setDir] = useState<Dir>(defaultDir);
  useEffect(() => {
    const d = (document?.documentElement?.getAttribute("dir") || "rtl") as Dir;
    setDir(d === "ltr" ? "ltr" : "rtl");
  }, []);
  return dir;
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return matches;
}

function formatTime(iso: string, dir: Dir) {
  try {
    const locale = dir === "rtl" ? "ar" : "en";
    return new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

function dayKey(iso: string) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const da = d.getDate();
  return `${y}-${String(m).padStart(2, "0")}-${String(da).padStart(2, "0")}`;
}

function dayLabel(iso: string, dir: Dir) {
  const d = new Date(iso);
  const now = new Date();
  const same =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  const y = new Date(now);
  y.setDate(now.getDate() - 1);
  const isYesterday =
    d.getFullYear() === y.getFullYear() &&
    d.getMonth() === y.getMonth() &&
    d.getDate() === y.getDate();

  if (same) return dir === "rtl" ? "اليوم" : "Today";
  if (isYesterday) return dir === "rtl" ? "أمس" : "Yesterday";

  try {
    const locale = dir === "rtl" ? "ar" : "en";
    return new Intl.DateTimeFormat(locale, {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(d);
  } catch {
    return d.toDateString();
  }
}

function isOutbound(m: SeedMessage) {
  return m.fromId === ME_ID;
}

function isInbound(m: SeedMessage) {
  return m.fromId !== ME_ID && m.fromId !== "system";
}

function snippetOf(m?: SeedMessage) {
  if (!m) return "";
  if (m.type === "text") return m.text ?? "";
  if (m.type === "image") return m.text ? `🖼️ ${m.text}` : "🖼️ صورة";
  if (m.type === "video") return m.text ? `🎬 ${m.text}` : "🎬 فيديو";
  if (m.type === "share") return `🔗 ${m.share?.title ?? "مشاركة"}`;
  if (m.type === "sticker") return "✨ ملصق";
  if (m.type === "system") return m.text ?? "";
  return "";
}

/** =========================================================
 *  Types (client extension)
 *  ========================================================= */

type ChatMessage = SeedMessage & { replyToId?: string | null };

type Pane = "list" | "chat";

type SheetCtx =
  | { type: "user"; userId: string }
  | { type: "conv"; convId: string }
  | { type: "msg"; convId: string; msgId: string }
  | null;

/** =========================================================
 *  Main
 *  ========================================================= */

export default function MessagesClient() {
  const seed = seedMessagesData;
  const dir = useAppDir("rtl");
  const rtl = dir === "rtl";
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const reduceMotion = useReducedMotion();

  const [pane, setPane] = useState<Pane>("list");
  const [tab, setTab] = useState<ChatTab>("friends");
  const [q, setQ] = useState("");

  // stateful data (mock)
  const [users, setUsers] = useState<User[]>(seed.users);
  const [convs, setConvs] = useState<Conversation[]>(seed.conversations);

  // messages in state so we can react/reply/send
  const [messages, setMessages] = useState<ChatMessage[]>(
    seed.messages as ChatMessage[],
  );

  // active chat
  const initialActive = useMemo(() => {
    const friendsPinned = seed.conversations.find(
      (c) => c.category === "friends" && c.pinned,
    );
    return (
      friendsPinned?.id ??
      seed.conversations.find((c) => c.category === "friends")?.id ??
      seed.conversations[0]?.id ??
      ""
    );
  }, [seed.conversations]);

  const [activeConvId, setActiveConvId] = useState<string>(initialActive);

  // sheets / modals
  const [sheetOpen, setSheetOpen] = useState(false);
  const sheetCtxRef = useRef<SheetCtx>(null);
  const [sheetTitle, setSheetTitle] = useState<string>("");
  const [sheetOptions, setSheetOptions] = useState<OptionsSheetOptionInput[]>(
    [],
  );

  const [newModalOpen, setNewModalOpen] = useState(false);
  const [pickUserOpen, setPickUserOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);

  const [lightbox, setLightbox] = useState<Media | null>(null);
  const [videoBox, setVideoBox] = useState<{
    src: string;
    title: string;
  } | null>(null);

  // reply state
  const [replyTo, setReplyTo] = useState<{
    convId: string;
    msgId: string;
  } | null>(null);

  // group creator state
  const [groupName, setGroupName] = useState("");
  const [groupMembers, setGroupMembers] = useState<string[]>([]);

  // maps
  const usersById = useMemo(() => {
    const m = new Map<string, User>();
    for (const u of users) m.set(u.id, u);
    return m;
  }, [users]);

  const convById = useMemo(() => {
    const m = new Map<string, Conversation>();
    for (const c of convs) m.set(c.id, c);
    return m;
  }, [convs]);

  const messagesByConv = useMemo(() => {
    const m: Record<string, ChatMessage[]> = {};
    for (const msg of messages) {
      (m[msg.conversationId] ||= []).push(msg);
    }
    for (const k of Object.keys(m)) {
      m[k].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
    }
    return m;
  }, [messages]);

  const convMetaById = useMemo(() => {
    const meta: Record<
      string,
      {
        last?: ChatMessage;
        lastAt?: string;
        unread: number;
      }
    > = {};

    for (const c of convs) {
      const list = messagesByConv[c.id] ?? [];
      const last = list[list.length - 1];
      const unread = list.filter(
        (m) => isInbound(m) && !m.readAt && m.type !== "system",
      ).length;
      meta[c.id] = { last, lastAt: last?.createdAt, unread };
    }
    return meta;
  }, [convs, messagesByConv]);

  const tabCounts = useMemo(() => {
    const count = { friends: 0, public: 0, requests: 0 };
    for (const c of convs) count[c.category]++;
    return count;
  }, [convs]);

  const filteredConvs = useMemo(() => {
    const qn = q.trim().toLowerCase();
    const list = convs
      .filter((c) => c.category === tab)
      .filter((c) => {
        if (!qn) return true;
        const title = c.title.toLowerCase();
        if (title.includes(qn)) return true;

        if (c.kind === "dm" && c.peerId) {
          const u = usersById.get(c.peerId);
          if (!u) return false;
          return (
            u.name.toLowerCase().includes(qn) ||
            u.handle.toLowerCase().includes(qn)
          );
        }
        return false;
      });

    list.sort((a, b) => {
      const ma = convMetaById[a.id];
      const mb = convMetaById[b.id];
      const ap = a.pinned ? 1 : 0;
      const bp = b.pinned ? 1 : 0;
      if (ap !== bp) return bp - ap;

      const au = ma?.unread ?? 0;
      const bu = mb?.unread ?? 0;
      if (au !== bu) return bu - au;

      const at = ma?.lastAt ? Date.parse(ma.lastAt) : 0;
      const bt = mb?.lastAt ? Date.parse(mb.lastAt) : 0;
      return bt - at;
    });

    return list;
  }, [convs, tab, q, usersById, convMetaById]);

  const activeConv = convById.get(activeConvId) ?? null;
  const activeMessages =
    (activeConv ? messagesByConv[activeConv.id] : []) ?? [];
  const activeMeta = activeConv ? convMetaById[activeConv.id] : undefined;

  // Ensure pane behavior on desktop/mobile
  useEffect(() => {
    if (isDesktop) setPane("list");
  }, [isDesktop]);

  const openConversation = useCallback(
    (convId: string) => {
      setActiveConvId(convId);
      setReplyTo(null);
      if (!isDesktop) setPane("chat");
    },
    [isDesktop],
  );

  /** ---------- Options Sheets ---------- */

  const openUserSheet = useCallback(
    (userId: string) => {
      const u = usersById.get(userId);
      sheetCtxRef.current = { type: "user", userId };
      setSheetTitle(u ? u.name : "User");

      // Use your DeOptions registry ids
      setSheetOptions([
        { id: "follow_toggle", value: true }, // just demo
        { id: "mute_toggle", value: false },
        { id: "block_toggle", value: false, separatorBefore: true },
        { id: "copy_id", value: userId },
        { id: "report", separatorBefore: true },
      ]);

      setSheetOpen(true);
    },
    [usersById],
  );

  const openConvSheet = useCallback(
    (convId: string) => {
      sheetCtxRef.current = { type: "conv", convId };
      setSheetTitle("خيارات المحادثة");
      const c = convById.get(convId);
      setSheetOptions([
        { id: "pin_toggle", value: Boolean(c?.pinned) },
        { id: "mute_toggle", value: Boolean(c?.muted) },
        { id: "archive_toggle", value: false, separatorBefore: true },
        { id: "mark_read_toggle", value: false },
      ]);
      setSheetOpen(true);
    },
    [convById],
  );

  const openMsgSheet = useCallback(
    (convId: string, msgId: string) => {
      sheetCtxRef.current = { type: "msg", convId, msgId };
      setSheetTitle("خيارات الرسالة");

      const msg = (messagesByConv[convId] ?? []).find((m) => m.id === msgId);
      const isMedia = msg?.type === "image" || msg?.type === "video";

      setSheetOptions([
        { id: "copy_text", value: msg?.text ?? "" },
        ...(isMedia ? (["download_media"] as const).map((id) => ({ id })) : []),
        { id: "delete", separatorBefore: true },
        { id: "report" },
      ]);

      setSheetOpen(true);
    },
    [messagesByConv],
  );

  const onSheetAction = useCallback(
    async (id: ActionId, next?: boolean | string) => {
      const ctx = sheetCtxRef.current;

      // Conversation level toggles
      if (ctx?.type === "conv") {
        setConvs((prev) =>
          prev.map((c) => {
            if (c.id !== ctx.convId) return c;
            if (id === "pin_toggle") return { ...c, pinned: Boolean(next) };
            if (id === "mute_toggle") return { ...c, muted: Boolean(next) };
            return c;
          }),
        );
        return;
      }

      // Message actions
      if (ctx?.type === "msg") {
        if (id === "delete") {
          setMessages((prev) =>
            prev.filter(
              (m) => !(m.conversationId === ctx.convId && m.id === ctx.msgId),
            ),
          );
        }
        return;
      }

      // User actions demo (follow/mute/block handled elsewhere in real app)
      void next;
    },
    [],
  );

  /** ---------- New (Add) flow ---------- */

  const openNewModal = () => setNewModalOpen(true);

  const openPickUser = () => {
    setNewModalOpen(false);
    setPickUserOpen(true);
  };

  const openCreateGroup = () => {
    setNewModalOpen(false);
    setGroupOpen(true);
  };

  const startDmWith = useCallback(
    (userId: string) => {
      setPickUserOpen(false);

      // find existing
      const existing = convs.find(
        (c) =>
          c.kind === "dm" && c.peerId === userId && c.category !== "requests",
      );
      if (existing) {
        openConversation(existing.id);
        return;
      }

      const u = usersById.get(userId);
      const id = `dm_${userId}_${Math.random().toString(16).slice(2, 8)}`;

      const newConv: Conversation = {
        id,
        kind: "dm",
        category: "friends",
        title: u?.name ?? "DM",
        peerId: userId,
        memberIds: [ME_ID, userId],
        pinned: false,
        muted: false,
        lastReadMessageId: null,
      };

      setConvs((p) => [newConv, ...p]);

      // seed first system message
      setMessages((p) => [
        ...p,
        {
          id: `${id}_m0`,
          conversationId: id,
          fromId: "system",
          type: "system",
          text: "تم بدء محادثة جديدة ✨",
          createdAt: new Date().toISOString(),
          readAt: new Date().toISOString(),
        },
      ]);

      openConversation(id);
    },
    [convs, openConversation, usersById],
  );

  const createGroup = useCallback(() => {
    const members = Array.from(new Set([ME_ID, ...groupMembers])).filter(
      Boolean,
    );
    if (members.length < 3) return; // me + at least 2 members

    const id = `grp_${Math.random().toString(16).slice(2, 10)}`;
    const title = groupName.trim() || "مجموعة جديدة";

    const newConv: Conversation = {
      id,
      kind: "group",
      category: "friends",
      title,
      memberIds: members,
      pinned: false,
      muted: false,
      lastReadMessageId: null,
    };

    setConvs((p) => [newConv, ...p]);
    setMessages((p) => [
      ...p,
      {
        id: `${id}_m0`,
        conversationId: id,
        fromId: "system",
        type: "system",
        text: `تم إنشاء المجموعة: ${title}`,
        createdAt: new Date().toISOString(),
        readAt: new Date().toISOString(),
      },
    ]);

    setGroupOpen(false);
    setGroupName("");
    setGroupMembers([]);
    openConversation(id);
  }, [groupMembers, groupName, openConversation]);

  /** ---------- Requests actions ---------- */
  const acceptRequest = useCallback(
    (convId: string) => {
      setConvs((prev) =>
        prev.map((c) =>
          c.id === convId ? { ...c, category: "friends", isRequest: false } : c,
        ),
      );
      setTab("friends");
    },
    [setConvs],
  );

  const declineRequest = useCallback(
    (convId: string) => {
      setConvs((prev) => prev.filter((c) => c.id !== convId));
      setMessages((prev) => prev.filter((m) => m.conversationId !== convId));
      if (activeConvId === convId) setActiveConvId(initialActive);
    },
    [activeConvId, initialActive],
  );

  /** ---------- Messaging actions ---------- */

  const sendText = useCallback(
    async (convId: string, text: string, mentions: string[]) => {
      const clean = text.trim();
      if (!clean) return;

      const nowIso = new Date().toISOString();
      const id = `${convId}_me_${Math.random().toString(16).slice(2, 10)}`;

      const replyToId = replyTo?.convId === convId ? replyTo.msgId : null;
      setReplyTo(null);

      const msg: ChatMessage = {
        id,
        conversationId: convId,
        fromId: ME_ID,
        type: "text",
        text: clean,
        createdAt: nowIso,
        status: "sent",
        replyToId,
      };

      // if mentions exist, just keep them in text for now
      if (mentions.length > 0) {
        msg.text = clean; // keep clean (mentions already in text)
      }

      setMessages((p) => [...p, msg]);

      // fake delivery tick
      window.setTimeout(() => {
        setMessages((p) =>
          p.map((m) => (m.id === id ? { ...m, status: "delivered" } : m)),
        );
      }, 450);
    },
    [replyTo],
  );

  const toggleReaction = useCallback(
    (convId: string, msgId: string, emoji: string) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m.conversationId !== convId || m.id !== msgId) return m;
          const reactions = m.reactions ? [...m.reactions] : [];

          const idx = reactions.findIndex((r) => r.emoji === emoji);
          if (idx === -1) {
            reactions.push({ emoji, count: 1, byMe: true });
          } else {
            const r = reactions[idx];
            // toggle byMe
            if (r.byMe) {
              const nextCount = Math.max(0, r.count - 1);
              if (nextCount === 0) reactions.splice(idx, 1);
              else reactions[idx] = { ...r, count: nextCount, byMe: false };
            } else {
              reactions[idx] = { ...r, count: r.count + 1, byMe: true };
            }
          }
          return { ...m, reactions };
        }),
      );
    },
    [],
  );

  const markConvReadAtBottom = useCallback(
    (convId: string) => {
      const now = new Date().toISOString();

      // Mark inbound unread messages read
      setMessages((prev) =>
        prev.map((m) => {
          if (m.conversationId !== convId) return m;
          if (!isInbound(m)) return m;
          if (m.type === "system") return m;
          if (m.readAt) return m;
          return { ...m, readAt: now };
        }),
      );

      // Update lastReadMessageId to the latest inbound message we now consider read
      const list = messagesByConv[convId] ?? [];
      const lastInbound = [...list]
        .reverse()
        .find((m) => isInbound(m) && m.type !== "system");
      setConvs((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                lastReadMessageId:
                  lastInbound?.id ?? c.lastReadMessageId ?? null,
              }
            : c,
        ),
      );
    },
    [messagesByConv],
  );

  /** ---------- Mentions ---------- */
  const mentionOptions = useMemo(() => {
    // you can swap this with real server-provided mention options
    return defaultMentionOptions.filter((o) => o.id !== ME_ID);
  }, []);

  /** ---------- Render ---------- */

  return (
    <div className="relative h-[100svh] w-full overflow-hidden bg-background text-foreground">
      <MangaBackdrop />

      <div className="relative flex h-full min-h-0 w-full gap-2 p-2 md:gap-3 md:p-3">
        {isDesktop ? (
          <>
            <Sidebar
              dir={dir}
              rtl={rtl}
              tab={tab}
              setTab={setTab}
              q={q}
              setQ={setQ}
              convs={filteredConvs}
              activeConvId={activeConvId}
              metaById={convMetaById}
              usersById={usersById}
              onOpenConversation={openConversation}
              onOpenNew={openNewModal}
              onOpenUserSheet={openUserSheet}
              onOpenConvSheet={openConvSheet}
              tabCounts={tabCounts}
            />

            <ChatPanel
              dir={dir}
              rtl={rtl}
              conv={activeConv}
              usersById={usersById}
              messages={activeMessages}
              meta={activeMeta}
              onBack={() => setPane("list")}
              onOpenUserSheet={openUserSheet}
              onOpenConvSheet={openConvSheet}
              onOpenMsgSheet={openMsgSheet}
              onReact={toggleReaction}
              onReply={(msgId) =>
                setReplyTo(activeConv ? { convId: activeConv.id, msgId } : null)
              }
              onCancelReply={() => setReplyTo(null)}
              replyTo={
                replyTo && activeConv?.id === replyTo.convId ? replyTo : null
              }
              onSend={(text, mentions) =>
                activeConv ? sendText(activeConv.id, text, mentions) : undefined
              }
              mentionOptions={mentionOptions}
              onViewImage={(m) => setLightbox(m)}
              onViewVideo={(src, title) => setVideoBox({ src, title })}
              onReachedBottom={() =>
                activeConv ? markConvReadAtBottom(activeConv.id) : undefined
              }
              onAcceptRequest={() => activeConv && acceptRequest(activeConv.id)}
              onDeclineRequest={() =>
                activeConv && declineRequest(activeConv.id)
              }
            />
          </>
        ) : (
          <AnimatePresence initial={false} mode="wait">
            {pane === "list" ? (
              <motion.div
                key="pane_list"
                className="h-full min-h-0 w-full"
                initial={{ opacity: 0, x: rtl ? 18 : -18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: rtl ? -18 : 18 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 260, damping: 26 }
                }
              >
                <Sidebar
                  dir={dir}
                  rtl={rtl}
                  tab={tab}
                  setTab={setTab}
                  q={q}
                  setQ={setQ}
                  convs={filteredConvs}
                  activeConvId={activeConvId}
                  metaById={convMetaById}
                  usersById={usersById}
                  onOpenConversation={openConversation}
                  onOpenNew={openNewModal}
                  onOpenUserSheet={openUserSheet}
                  onOpenConvSheet={openConvSheet}
                  tabCounts={tabCounts}
                />
              </motion.div>
            ) : (
              <motion.div
                key="pane_chat"
                className="h-full min-h-0 w-full"
                initial={{ opacity: 0, x: rtl ? -18 : 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: rtl ? 18 : -18 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 260, damping: 26 }
                }
              >
                <ChatPanel
                  dir={dir}
                  rtl={rtl}
                  conv={activeConv}
                  usersById={usersById}
                  messages={activeMessages}
                  meta={activeMeta}
                  onBack={() => setPane("list")}
                  onOpenUserSheet={openUserSheet}
                  onOpenConvSheet={openConvSheet}
                  onOpenMsgSheet={openMsgSheet}
                  onReact={toggleReaction}
                  onReply={(msgId) =>
                    setReplyTo(
                      activeConv ? { convId: activeConv.id, msgId } : null,
                    )
                  }
                  onCancelReply={() => setReplyTo(null)}
                  replyTo={
                    replyTo && activeConv?.id === replyTo.convId
                      ? replyTo
                      : null
                  }
                  onSend={(text, mentions) =>
                    activeConv
                      ? sendText(activeConv.id, text, mentions)
                      : undefined
                  }
                  mentionOptions={mentionOptions}
                  onViewImage={(m) => setLightbox(m)}
                  onViewVideo={(src, title) => setVideoBox({ src, title })}
                  onReachedBottom={() =>
                    activeConv ? markConvReadAtBottom(activeConv.id) : undefined
                  }
                  onAcceptRequest={() =>
                    activeConv && acceptRequest(activeConv.id)
                  }
                  onDeclineRequest={() =>
                    activeConv && declineRequest(activeConv.id)
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Options Sheet */}
      <OptionsSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        options={sheetOptions}
        onAction={onSheetAction}
        dir={dir}
      />

      {/* New (+) modal */}
      <Modal
        open={newModalOpen}
        onOpenChange={setNewModalOpen}
        dir={dir}
        mode={{ desktop: "center", mobile: "sheet" }}
        preset="comments"
        title={dir === "rtl" ? "إنشاء" : "New"}
        subtitle={
          dir === "rtl"
            ? "ابدأ محادثة أو أنشئ مجموعة"
            : "Start a chat or create a group"
        }
        maxWidthClass="max-w-sm"
      >
        <div className="p-3 space-y-2">
          <ActionCard
            dir={dir}
            icon={<IoChatbubbleEllipsesOutline className="size-5" />}
            title={dir === "rtl" ? "رسالة جديدة" : "New message"}
            desc={
              dir === "rtl"
                ? "اختر عضو وابدأ DM"
                : "Pick a member and start a DM"
            }
            onClick={openPickUser}
          />
          <ActionCard
            dir={dir}
            icon={<IoPeopleOutline className="size-5" />}
            title={dir === "rtl" ? "إنشاء مجموعة" : "Create group"}
            desc={
              dir === "rtl"
                ? "مجموعة خاصة من الأصدقاء"
                : "Private group with friends"
            }
            onClick={openCreateGroup}
          />
        </div>
      </Modal>

      {/* Pick user modal */}
      <Modal
        open={pickUserOpen}
        onOpenChange={setPickUserOpen}
        dir={dir}
        mode={{ desktop: "center", mobile: "sheet" }}
        preset="comments"
        title={dir === "rtl" ? "اختر مستخدم" : "Pick a user"}
        maxWidthClass="max-w-sm"
      >
        <div className="p-3">
          <div className="mb-2 flex items-center gap-2 rounded-2xl border border-border-subtle bg-surface-soft px-3 py-2">
            <IoSearchOutline className="size-4 text-foreground-soft" />
            <input
              className="w-full bg-transparent text-sm outline-none placeholder:text-foreground-soft"
              placeholder={
                dir === "rtl"
                  ? "ابحث بالاسم أو اليوزر…"
                  : "Search name/username…"
              }
              onChange={() => void 0}
            />
          </div>

          <div className="max-h-[50vh] overflow-y-auto app-scroll has-scroll space-y-1">
            {users
              .filter((u) => u.id !== ME_ID)
              .filter((u) => !u.handle.includes("new") || true)
              .map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => startDmWith(u.id)}
                  className={cn(
                    "w-full rounded-2xl border border-border-subtle bg-background-elevated px-3 py-2",
                    "hover:bg-surface-soft active:bg-surface-muted",
                    "flex items-center gap-3",
                    rtl ? "flex-row-reverse text-right" : "flex-row text-left",
                  )}
                >
                  <Avatar src={u.avatarUrl} name={u.name} size="10" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-extrabold text-foreground-strong">
                      {u.name}
                    </div>
                    <div className="truncate text-xs text-foreground-muted">
                      {u.handle}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-accent">
                    {dir === "rtl" ? "ابدأ" : "Start"}
                  </span>
                </button>
              ))}
          </div>
        </div>
      </Modal>

      {/* Group create modal */}
      <Modal
        open={groupOpen}
        onOpenChange={setGroupOpen}
        dir={dir}
        mode={{ desktop: "center", mobile: "sheet" }}
        preset="comments"
        title={dir === "rtl" ? "إنشاء مجموعة" : "Create group"}
        subtitle={
          dir === "rtl"
            ? "اختر الأعضاء واسم المجموعة"
            : "Pick members and a name"
        }
        maxWidthClass="max-w-md"
      >
        <div className="p-3 space-y-3">
          <div className="rounded-2xl border border-border-subtle bg-surface-soft px-3 py-2">
            <input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-foreground-soft"
              placeholder={dir === "rtl" ? "اسم المجموعة…" : "Group name…"}
            />
          </div>

          <div className="text-xs font-bold text-foreground-muted">
            {dir === "rtl"
              ? "اختر أعضاء (على الأقل 2)"
              : "Pick members (min 2)"}
          </div>

          <div className="max-h-[42vh] overflow-y-auto app-scroll has-scroll space-y-1 pr-1">
            {users
              .filter((u) => u.id !== ME_ID)
              .map((u) => {
                const selected = groupMembers.includes(u.id);
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() =>
                      setGroupMembers((p) =>
                        selected ? p.filter((x) => x !== u.id) : [...p, u.id],
                      )
                    }
                    className={cn(
                      "w-full rounded-2xl border px-3 py-2",
                      selected
                        ? "border-accent-border bg-accent-soft"
                        : "border-border-subtle bg-background-elevated",
                      "hover:bg-surface-soft active:bg-surface-muted",
                      "flex items-center gap-3",
                      rtl
                        ? "flex-row-reverse text-right"
                        : "flex-row text-left",
                    )}
                  >
                    <Avatar src={u.avatarUrl} name={u.name} size="10" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-extrabold text-foreground-strong">
                        {u.name}
                      </div>
                      <div className="truncate text-xs text-foreground-muted">
                        {u.handle}
                      </div>
                    </div>

                    <div
                      className={cn(
                        "grid size-8 place-items-center rounded-xl border",
                        selected
                          ? "border-accent-border bg-background-elevated"
                          : "border-border-subtle bg-surface-soft",
                      )}
                      aria-hidden="true"
                    >
                      {selected ? (
                        <IoCheckmarkDoneOutline className="size-4 text-accent" />
                      ) : (
                        <IoCheckmarkOutline className="size-4 text-foreground-soft" />
                      )}
                    </div>
                  </button>
                );
              })}
          </div>

          <div className="flex items-center gap-2">
            <Button
              className="flex-1"
              variant="solid"
              tone="brand"
              disabled={groupMembers.length < 2}
              onClick={createGroup}
            >
              {dir === "rtl" ? "إنشاء" : "Create"}
            </Button>
            <Button
              className="flex-1"
              variant="soft"
              tone="neutral"
              onClick={() => setGroupOpen(false)}
            >
              {dir === "rtl" ? "إلغاء" : "Cancel"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Image lightbox */}
      <Modal
        open={Boolean(lightbox)}
        onOpenChange={(o) => !o && setLightbox(null)}
        dir={dir}
        mode={{ desktop: "center", mobile: "center" }}
        preset="comments"
        title=""
        contentPadding="none"
        maxWidthClass="max-w-4xl"
        panelClassName="bg-background-elevated"
      >
        {lightbox && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setLightbox(null)}
              className={cn(
                "absolute top-3 z-10 grid size-10 place-items-center rounded-2xl border border-border-subtle bg-background-elevated/90 shadow-[var(--shadow-md)]",
                rtl ? "left-3" : "right-3",
              )}
              aria-label={dir === "rtl" ? "إغلاق" : "Close"}
            >
              <IoCloseOutline className="size-5 text-foreground-strong" />
            </button>

            <div className="p-3">
              <div className="relative mx-auto aspect-[16/10] w-full overflow-hidden rounded-3xl border border-border-subtle bg-surface-soft">
                <Image
                  src={lightbox.src}
                  alt={lightbox.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 960px"
                  className="object-contain"
                  priority
                />
              </div>
              <div className="mt-2 text-xs text-foreground-muted">
                {lightbox.alt}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Video modal */}
      <Modal
        open={Boolean(videoBox)}
        onOpenChange={(o) => !o && setVideoBox(null)}
        dir={dir}
        mode={{ desktop: "center", mobile: "center" }}
        preset="comments"
        title={videoBox?.title ?? ""}
        maxWidthClass="max-w-3xl"
      >
        {videoBox && (
          <div className="p-3">
            <div className="overflow-hidden rounded-3xl border border-border-subtle bg-black">
              <video controls autoPlay className="w-full" src={videoBox.src} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/** =========================================================
 *  Backdrop (manga tone + brand gradient)
 *  ========================================================= */

function MangaBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {/* soft gradient */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(900px 520px at 12% 12%, color-mix(in srgb, var(--color-brand-400) 35%, transparent) 0%, transparent 60%), radial-gradient(820px 520px at 88% 18%, color-mix(in srgb, var(--color-extra-purple) 22%, transparent) 0%, transparent 62%), radial-gradient(920px 620px at 60% 96%, color-mix(in srgb, var(--color-brand-600) 22%, transparent) 0%, transparent 65%)",
        }}
      />

      {/* halftone dots */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--color-foreground) 24%, transparent) 1px, transparent 0)",
          backgroundSize: "16px 16px",
        }}
      />

      {/* vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(80%_70%_at_50%_30%,transparent_0%,rgba(0,0,0,0.22)_100%)]" />
    </div>
  );
}

/** =========================================================
 *  Sidebar
 *  ========================================================= */

function Sidebar(props: {
  dir: Dir;
  rtl: boolean;
  tab: ChatTab;
  setTab: (t: ChatTab) => void;
  q: string;
  setQ: (v: string) => void;

  convs: Conversation[];
  activeConvId: string;
  metaById: Record<
    string,
    { last?: ChatMessage; lastAt?: string; unread: number }
  >;
  usersById: Map<string, User>;

  onOpenConversation: (id: string) => void;
  onOpenNew: () => void;
  onOpenUserSheet: (userId: string) => void;
  onOpenConvSheet: (convId: string) => void;

  tabCounts: { friends: number; public: number; requests: number };
}) {
  const { dir, rtl } = props;
  const reduceMotion = useReducedMotion();

  return (
    <aside
      className={cn(
        "flex h-full min-h-0 w-full flex-col",
        "rounded-3xl border border-nav-border bg-nav/80 backdrop-blur-xl",
        "shadow-[var(--shadow-glass)]",
        "lg:w-[380px] lg:max-w-[380px]",
      )}
    >
      {/* header */}
      <div className="px-3 pt-3">
        <div
          className={cn(
            "flex items-center justify-between gap-2",
            rtl && "flex-row-reverse",
          )}
        >
          <div
            className={cn("flex items-center gap-2", rtl && "flex-row-reverse")}
          >
            <div className="grid size-10 place-items-center rounded-2xl border border-border-subtle bg-background-elevated shadow-[var(--shadow-sm)]">
              <IoChatbubbleEllipsesOutline className="size-5 text-accent" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-foreground-strong">
                {dir === "rtl" ? "المحادثات" : "Messages"}
              </div>
              <div className="text-xs text-foreground-muted">
                {dir === "rtl"
                  ? "أصدقاء • غرف • طلبات"
                  : "Friends • Rooms • Requests"}
              </div>
            </div>
          </div>

          <Button
            iconOnly
            aria-label={dir === "rtl" ? "إضافة" : "New"}
            size="sm"
            variant="soft"
            tone="brand"
            tooltip={dir === "rtl" ? "إنشاء" : "New"}
            onClick={props.onOpenNew}
          >
            <IoAddOutline className="size-5" />
          </Button>
        </div>

        {/* search */}
        <div className="mt-3 flex items-center gap-2 rounded-2xl border border-border-subtle bg-surface-soft px-3 py-2">
          <IoSearchOutline className="size-4 text-foreground-soft" />
          <input
            value={props.q}
            onChange={(e) => props.setQ(e.target.value)}
            className={cn(
              "w-full bg-transparent text-sm outline-none placeholder:text-foreground-soft",
              rtl && "text-right",
            )}
            placeholder={dir === "rtl" ? "بحث…" : "Search…"}
          />
        </div>

        {/* tabs */}
        <div className="mt-3">
          <Tabs
            dir={dir}
            rtl={rtl}
            value={props.tab}
            onChange={props.setTab}
            counts={props.tabCounts}
            reduceMotion={reduceMotion}
          />
        </div>
      </div>

      {/* list */}
      <div className="mt-2 min-h-0 flex-1 overflow-y-auto app-scroll has-scroll px-2 pb-2">
        {props.convs.length === 0 ? (
          <div className="p-3">
            <div className="rounded-3xl border border-border-subtle bg-background-elevated p-4 text-center">
              <div className="text-sm font-extrabold text-foreground-strong">
                {dir === "rtl" ? "لا توجد نتائج" : "No results"}
              </div>
              <div className="mt-1 text-xs text-foreground-muted">
                {dir === "rtl" ? "جرّب كلمة أخرى." : "Try a different query."}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {props.convs.map((c) => (
              <ConversationRow
                key={c.id}
                dir={dir}
                rtl={rtl}
                conv={c}
                active={c.id === props.activeConvId}
                meta={props.metaById[c.id]}
                usersById={props.usersById}
                onClick={() => props.onOpenConversation(c.id)}
                onOpenUserSheet={() =>
                  c.kind === "dm" && c.peerId && props.onOpenUserSheet(c.peerId)
                }
                onOpenConvSheet={() => props.onOpenConvSheet(c.id)}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

function Tabs(props: {
  dir: Dir;
  rtl: boolean;
  value: ChatTab;
  onChange: (t: ChatTab) => void;
  counts: { friends: number; public: number; requests: number };
  reduceMotion: boolean;
}) {
  const items: Array<{
    id: ChatTab;
    labelAr: string;
    labelEn: string;
    count: number;
  }> = [
    {
      id: "friends",
      labelAr: "الأصدقاء",
      labelEn: "Friends",
      count: props.counts.friends,
    },
    {
      id: "public",
      labelAr: "عام",
      labelEn: "Public",
      count: props.counts.public,
    },
    {
      id: "requests",
      labelAr: "طلبات",
      labelEn: "Requests",
      count: props.counts.requests,
    },
  ];

  return (
    <div className="relative grid grid-cols-3 gap-1 rounded-2xl border border-border-subtle bg-surface-soft p-1">
      {items.map((it) => {
        const active = props.value === it.id;
        return (
          <button
            key={it.id}
            type="button"
            onClick={() => props.onChange(it.id)}
            className={cn(
              "relative z-10 rounded-xl px-2 py-2 text-xs font-extrabold",
              "transition-colors",
              active
                ? "text-accent-foreground"
                : "text-foreground-muted hover:text-foreground-strong",
            )}
          >
            {active && (
              <motion.div
                layoutId="tabs-pill"
                className="absolute inset-0 -z-10 rounded-xl bg-accent shadow-[var(--shadow-glow-brand)]"
                transition={
                  props.reduceMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 360, damping: 28 }
                }
              />
            )}

            <div
              className={cn(
                "flex items-center justify-center gap-2",
                props.rtl && "flex-row-reverse",
              )}
            >
              <span>{props.dir === "rtl" ? it.labelAr : it.labelEn}</span>
              <span
                className={cn(
                  "rounded-full px-2 py-[2px] text-[10px]",
                  active
                    ? "bg-white/15 text-white"
                    : "bg-background-elevated text-foreground-soft",
                )}
              >
                {it.count}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

const ConversationRow = memo(function ConversationRow(props: {
  dir: Dir;
  rtl: boolean;
  conv: Conversation;
  active: boolean;
  meta?: { last?: ChatMessage; lastAt?: string; unread: number };
  usersById: Map<string, User>;
  onClick: () => void;
  onOpenUserSheet: () => void;
  onOpenConvSheet: () => void;
}) {
  const { dir, rtl, conv, meta, active } = props;
  const reduceMotion = useReducedMotion();

  const peer =
    conv.kind === "dm" && conv.peerId ? props.usersById.get(conv.peerId) : null;

  const badge = meta?.unread ? (
    <span className="min-w-6 rounded-full bg-accent px-2 py-1 text-center text-[10px] font-extrabold text-accent-foreground shadow-[var(--shadow-glow-brand)]">
      {meta.unread}
    </span>
  ) : null;

  const time = meta?.lastAt ? formatTime(meta.lastAt, dir) : "";

  return (
    <motion.button
      type="button"
      onClick={props.onClick}
      className={cn(
        "relative w-full overflow-hidden rounded-3xl border px-3 py-2",
        active
          ? "border-accent-border bg-background-elevated"
          : "border-border-subtle bg-background-elevated/70",
        "hover:bg-surface-soft active:bg-surface-muted",
        "transition-colors",
      )}
      whileHover={reduceMotion ? undefined : { y: -1 }}
      whileTap={reduceMotion ? undefined : { scale: 0.99 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 420, damping: 30 }
      }
    >
      {/* subtle accent rail */}
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-y-2 w-1 rounded-full",
          rtl ? "right-2" : "left-2",
          meta?.unread ? "bg-[var(--gradient-brand-soft)]" : "bg-divider",
        )}
      />

      <div
        className={cn(
          "flex items-center gap-3",
          rtl ? "flex-row-reverse text-right" : "flex-row text-left",
        )}
      >
        {/* avatar */}
        <div className="relative">
          {conv.kind === "dm" && peer ? (
            <>
              <Avatar src={peer.avatarUrl} name={peer.name} size="12" />
              <span
                className={cn(
                  "absolute bottom-0.5 right-0.5 size-3 rounded-full border-2 border-background-elevated",
                  peer.presence === "online"
                    ? "bg-success-solid"
                    : peer.presence === "idle"
                      ? "bg-warning-solid"
                      : "bg-surface-muted",
                )}
              />
            </>
          ) : (
            <GroupAvatar
              memberIds={conv.memberIds}
              usersById={props.usersById}
            />
          )}
        </div>

        {/* text */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="truncate text-sm font-extrabold text-foreground-strong">
              {conv.title}
              {peer?.verified && (
                <span className="ms-1 inline-block text-[11px] text-accent">
                  ✓
                </span>
              )}
            </div>
            {conv.pinned && (
              <span className="rounded-full border border-border-subtle bg-surface-soft px-2 py-0.5 text-[10px] font-bold text-foreground-muted">
                {dir === "rtl" ? "مثبت" : "Pinned"}
              </span>
            )}
            {conv.isRequest && (
              <span className="rounded-full border border-warning-soft-border bg-warning-soft px-2 py-0.5 text-[10px] font-bold text-warning-foreground">
                {dir === "rtl" ? "طلب" : "Request"}
              </span>
            )}
          </div>

          <div className="mt-0.5 truncate text-xs text-foreground-muted">
            {snippetOf(meta?.last)}
          </div>
        </div>

        {/* right */}
        <div
          className={cn("flex flex-col items-end gap-2", rtl && "items-start")}
        >
          <div className="text-[10px] font-bold text-foreground-soft">
            {time}
          </div>

          <div
            className={cn("flex items-center gap-2", rtl && "flex-row-reverse")}
          >
            {badge}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (conv.kind === "dm" && conv.peerId) props.onOpenUserSheet();
                else props.onOpenConvSheet();
              }}
              className={cn(
                "grid size-9 place-items-center rounded-2xl border border-border-subtle bg-surface-soft",
                "hover:bg-surface-muted active:bg-surface-muted/80",
              )}
              aria-label={dir === "rtl" ? "خيارات" : "Options"}
            >
              <IoEllipsisHorizontal className="size-5 text-foreground-soft" />
            </button>
          </div>
        </div>
      </div>
    </motion.button>
  );
});

/** =========================================================
 *  Chat Panel
 *  ========================================================= */

function ChatPanel(props: {
  dir: Dir;
  rtl: boolean;

  conv: Conversation | null;
  usersById: Map<string, User>;
  messages: ChatMessage[];
  meta?: { last?: ChatMessage; lastAt?: string; unread: number };

  onBack: () => void;

  onOpenUserSheet: (userId: string) => void;
  onOpenConvSheet: (convId: string) => void;
  onOpenMsgSheet: (convId: string, msgId: string) => void;

  onReact: (convId: string, msgId: string, emoji: string) => void;
  onReply: (msgId: string) => void;

  replyTo: { convId: string; msgId: string } | null;
  onCancelReply: () => void;

  onSend: (text: string, mentions: string[]) => void;

  mentionOptions: Array<{
    id: string;
    username: string;
    displayName?: string;
    avatarUrl?: string;
  }>;

  onViewImage: (media: Media) => void;
  onViewVideo: (src: string, title: string) => void;

  onReachedBottom: () => void;

  onAcceptRequest: () => void;
  onDeclineRequest: () => void;
}) {
  const { dir, rtl, conv } = props;
  const reduceMotion = useReducedMotion();

  if (!conv) {
    return (
      <main
        className={cn(
          "relative flex h-full min-h-0 w-full flex-col",
          "rounded-3xl border border-nav-border bg-nav/80 backdrop-blur-xl",
          "shadow-[var(--shadow-glass)]",
        )}
      >
        <EmptyChatHero dir={dir} rtl={rtl} />
      </main>
    );
  }

  const peer =
    conv.kind === "dm" && conv.peerId ? props.usersById.get(conv.peerId) : null;
  const title = conv.title;

  const isRequest = Boolean(conv.isRequest);

  return (
    <main
      className={cn(
        "relative flex h-full min-h-0 w-full flex-1 flex-col",
        "rounded-3xl border border-nav-border bg-nav/80 backdrop-blur-xl",
        "shadow-[var(--shadow-glass)]",
      )}
    >
      {/* header */}
      <div className="border-b border-border-subtle px-3 py-2">
        <div
          className={cn(
            "flex items-center justify-between gap-2",
            rtl && "flex-row-reverse",
          )}
        >
          <div
            className={cn("flex items-center gap-2", rtl && "flex-row-reverse")}
          >
            {/* back (mobile uses it) */}
            <Button
              iconOnly
              aria-label={dir === "rtl" ? "رجوع" : "Back"}
              size="sm"
              variant="plain"
              tone="neutral"
              onClick={props.onBack}
              className="lg:hidden"
            >
              <IoChevronBackOutline
                className={cn("size-5", rtl && "rotate-180")}
              />
            </Button>

            <div className="relative">
              {conv.kind === "dm" && peer ? (
                <Avatar src={peer.avatarUrl} name={peer.name} size="12" />
              ) : (
                <GroupAvatar
                  memberIds={conv.memberIds}
                  usersById={props.usersById}
                />
              )}
              {peer && (
                <span
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-background-elevated",
                    peer.presence === "online"
                      ? "bg-success-solid"
                      : peer.presence === "idle"
                        ? "bg-warning-solid"
                        : "bg-surface-muted",
                  )}
                />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="truncate text-sm font-extrabold text-foreground-strong">
                  {title}
                </div>
                {peer?.verified && (
                  <span className="text-[11px] font-black text-accent">✓</span>
                )}
                {conv.kind === "group" && (
                  <span className="rounded-full border border-border-subtle bg-surface-soft px-2 py-0.5 text-[10px] font-bold text-foreground-muted">
                    {dir === "rtl"
                      ? `${conv.memberIds.length} أعضاء`
                      : `${conv.memberIds.length} members`}
                  </span>
                )}
              </div>
              <div className="truncate text-xs text-foreground-muted">
                {conv.kind === "dm" && peer
                  ? peer.handle
                  : dir === "rtl"
                    ? "غرفة عامة"
                    : "Public room"}
              </div>
            </div>
          </div>

          {/* actions */}
          <div
            className={cn("flex items-center gap-1", rtl && "flex-row-reverse")}
          >
            <Button
              iconOnly
              aria-label={dir === "rtl" ? "مكالمة صوت" : "Voice call"}
              size="sm"
              variant="soft"
              tone="brand"
              tooltip={dir === "rtl" ? "صوت" : "Voice"}
            >
              <IoCallOutline className="size-5" />
            </Button>

            <Button
              iconOnly
              aria-label={dir === "rtl" ? "مكالمة فيديو" : "Video call"}
              size="sm"
              variant="soft"
              tone="brand"
              tooltip={dir === "rtl" ? "فيديو" : "Video"}
            >
              <IoVideocamOutline className="size-5" />
            </Button>

            <Button
              iconOnly
              aria-label={dir === "rtl" ? "تحدي" : "Challenge"}
              size="sm"
              variant="soft"
              tone="neutral"
              tooltip={dir === "rtl" ? "تحدي" : "Challenge"}
            >
              <IoTrophyOutline className="size-5" />
            </Button>

            <Button
              iconOnly
              aria-label={dir === "rtl" ? "خيارات" : "Options"}
              size="sm"
              variant="plain"
              tone="neutral"
              onClick={() =>
                conv.kind === "dm" && conv.peerId
                  ? props.onOpenUserSheet(conv.peerId)
                  : props.onOpenConvSheet(conv.id)
              }
            >
              <IoEllipsisHorizontal className="size-5" />
            </Button>
          </div>
        </div>

        {/* request banner */}
        {isRequest && (
          <div className="mt-2 rounded-2xl border border-warning-soft-border bg-warning-soft px-3 py-2">
            <div className="text-xs font-extrabold text-warning-foreground">
              {dir === "rtl" ? "طلب محادثة" : "Message request"}
            </div>
            <div className="mt-0.5 text-xs text-foreground-muted">
              {conv.requestNote ??
                (dir === "rtl"
                  ? "هذا المستخدم يرسل لك طلبًا."
                  : "This user sent you a request.")}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Button
                variant="solid"
                tone="brand"
                className="flex-1"
                onClick={props.onAcceptRequest}
              >
                {dir === "rtl" ? "قبول" : "Accept"}
              </Button>
              <Button
                variant="soft"
                tone="danger"
                className="flex-1"
                onClick={props.onDeclineRequest}
              >
                {dir === "rtl" ? "رفض" : "Decline"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* messages */}
      <MessageList
        dir={dir}
        rtl={rtl}
        conv={conv}
        usersById={props.usersById}
        messages={props.messages}
        onReact={props.onReact}
        onReply={props.onReply}
        onOpenMsgSheet={props.onOpenMsgSheet}
        onViewImage={props.onViewImage}
        onViewVideo={props.onViewVideo}
        onReachedBottom={props.onReachedBottom}
      />

      {/* composer */}
      <div className="border-t border-border-subtle p-2">
        <Composer
          dir={dir}
          rtl={rtl}
          disabled={isRequest} // disable until accepted
          onSend={props.onSend}
          mentionOptions={props.mentionOptions}
          replyTo={props.replyTo}
          onCancelReply={props.onCancelReply}
          resolveReplyPreview={(id) =>
            props.messages.find((m) => m.id === id)?.text ?? ""
          }
          reduceMotion={reduceMotion}
        />
      </div>

      {/* subtle hero edge */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-accent-ring/30"
        style={{
          boxShadow: "var(--shadow-glow-brand)",
          opacity: 0.12,
        }}
      />
    </main>
  );
}

function EmptyChatHero({ dir, rtl }: { dir: Dir; rtl: boolean }) {
  return (
    <div className="relative flex h-full min-h-0 flex-col items-center justify-center p-6 text-center">
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(520px 280px at 50% 40%, color-mix(in srgb, var(--color-brand-400) 30%, transparent) 0%, transparent 62%)",
        }}
      />
      <div className="relative">
        <div className="mx-auto grid size-16 place-items-center rounded-3xl border border-border-subtle bg-background-elevated shadow-[var(--shadow-elevated)]">
          <IoChatbubbleEllipsesOutline className="size-8 text-accent" />
        </div>
        <div className="mt-4 text-base font-black text-foreground-strong">
          {dir === "rtl" ? "اختر محادثة" : "Pick a conversation"}
        </div>
        <div className="mt-2 max-w-sm text-sm text-foreground-muted">
          {dir === "rtl"
            ? "واجهة المحادثات هنا full-height مع سكرول مستقل للكونتاكتس والرسائل."
            : "Full-height chat with independent scroll for contacts and messages."}
        </div>

        <div
          className={cn(
            "mt-5 flex items-center justify-center gap-2",
            rtl && "flex-row-reverse",
          )}
        >
          <span className="rounded-full border border-border-subtle bg-surface-soft px-3 py-1 text-xs font-bold text-foreground-muted">
            {dir === "rtl" ? "✨ تفاعل سريع" : "✨ Quick reactions"}
          </span>
          <span className="rounded-full border border-border-subtle bg-surface-soft px-3 py-1 text-xs font-bold text-foreground-muted">
            {dir === "rtl" ? "🖼️ صور" : "🖼️ Images"}
          </span>
          <span className="rounded-full border border-border-subtle bg-surface-soft px-3 py-1 text-xs font-bold text-foreground-muted">
            {dir === "rtl" ? "🔗 مشاركة" : "🔗 Shares"}
          </span>
        </div>
      </div>
    </div>
  );
}

/** =========================================================
 *  Message List (scroll + last-read marker + hover actions)
 *  ========================================================= */

function MessageList(props: {
  dir: Dir;
  rtl: boolean;
  conv: Conversation;
  usersById: Map<string, User>;
  messages: ChatMessage[];

  onReact: (convId: string, msgId: string, emoji: string) => void;
  onReply: (msgId: string) => void;
  onOpenMsgSheet: (convId: string, msgId: string) => void;

  onViewImage: (media: Media) => void;
  onViewVideo: (src: string, title: string) => void;

  onReachedBottom: () => void;
}) {
  const { dir, rtl, conv } = props;
  const reduceMotion = useReducedMotion();
  const scrollerRef = useRef<HTMLDivElement>(null);

  // progressive render
  const [renderCount, setRenderCount] = useState(60);

  // bottom tracking (for smart "jump to new" + mark read)
  const [atBottom, setAtBottom] = useState(true);

  // build quick index
  const byId = useMemo(() => {
    const m = new Map<string, ChatMessage>();
    for (const x of props.messages) m.set(x.id, x);
    return m;
  }, [props.messages]);

  const lastReadId = conv.lastReadMessageId ?? null;

  const lastReadIndex = useMemo(() => {
    if (!lastReadId) return -1;
    return props.messages.findIndex((m) => m.id === lastReadId);
  }, [props.messages, lastReadId]);

  const hasUnread = useMemo(() => {
    // unread = inbound without readAt after lastRead marker
    const start = lastReadIndex >= 0 ? lastReadIndex + 1 : 0;
    for (let i = start; i < props.messages.length; i++) {
      const m = props.messages[i];
      if (isInbound(m) && !m.readAt && m.type !== "system") return true;
    }
    return false;
  }, [props.messages, lastReadIndex]);

  // slice start
  const sliceStart = useMemo(() => {
    const total = props.messages.length;
    let start = Math.max(0, total - renderCount);

    // ensure the last-read marker stays visible if unread exists
    if (hasUnread && lastReadIndex >= 0) {
      start = Math.min(start, Math.max(0, lastReadIndex - 6));
    }
    return start;
  }, [props.messages.length, renderCount, hasUnread, lastReadIndex]);

  const visible = useMemo(
    () => props.messages.slice(sliceStart),
    [props.messages, sliceStart],
  );

  // build render items with day separators + last read marker
  const items = useMemo(() => {
    const out: Array<
      | { kind: "day"; key: string; label: string }
      | { kind: "marker"; key: string }
      | { kind: "msg"; key: string; msg: ChatMessage; idx: number }
    > = [];

    let prevDay = "";
    for (let i = 0; i < visible.length; i++) {
      const msg = visible[i];
      const dk = dayKey(msg.createdAt);
      if (dk !== prevDay) {
        prevDay = dk;
        out.push({
          kind: "day",
          key: `day_${dk}`,
          label: dayLabel(msg.createdAt, props.dir),
        });
      }

      out.push({ kind: "msg", key: msg.id, msg, idx: sliceStart + i });

      // Insert marker AFTER lastRead message (if visible + unread exists)
      if (hasUnread && lastReadId && msg.id === lastReadId) {
        out.push({ kind: "marker", key: `marker_${lastReadId}` });
      }
    }
    return out;
  }, [visible, sliceStart, props.dir, hasUnread, lastReadId]);

  // load more when reaching top
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onScroll = () => {
      const nearTop = el.scrollTop < 40;
      if (nearTop && sliceStart > 0) {
        setRenderCount((c) => c + 40);
      }

      const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
      const isBottom = dist < 60;
      setAtBottom(isBottom);

      if (isBottom) props.onReachedBottom();
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, [sliceStart, props.onReachedBottom]);

  // auto scroll to bottom when switching conv
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    // slight delay so layout settles
    const t = window.setTimeout(() => {
      el.scrollTop = el.scrollHeight;
    }, 0);
    return () => window.clearTimeout(t);
  }, [conv.id]);

  // auto keep bottom when new msgs arrive and user is at bottom
  const prevLenRef = useRef(props.messages.length);
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const prevLen = prevLenRef.current;
    prevLenRef.current = props.messages.length;

    if (props.messages.length > prevLen && atBottom) {
      const t = window.setTimeout(() => {
        el.scrollTop = el.scrollHeight;
      }, 0);
      return () => window.clearTimeout(t);
    }
  }, [props.messages.length, atBottom]);

  const scrollToBottom = () => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  const scrollToMarker = () => {
    // marker is right after last read message; we scroll that message into view
    if (!lastReadId) return;
    const el = document.getElementById(`msg_${lastReadId}`);
    if (!el) return;
    el.scrollIntoView({
      block: "center",
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={scrollerRef}
        className={cn(
          "h-full min-h-0 overflow-y-auto app-scroll has-scroll",
          "px-2 py-3 md:px-3",
        )}
      >
        <div className="mx-auto w-full max-w-3xl space-y-2">
          {items.map((it) => {
            if (it.kind === "day") {
              return (
                <div key={it.key} className="flex justify-center">
                  <span className="rounded-full border border-border-subtle bg-surface-soft px-3 py-1 text-[10px] font-extrabold text-foreground-muted">
                    {it.label}
                  </span>
                </div>
              );
            }

            if (it.kind === "marker") {
              return (
                <div key={it.key} className="flex justify-center">
                  <span className="rounded-full border border-accent-border bg-accent-soft px-3 py-1 text-[10px] font-black text-foreground-strong">
                    {dir === "rtl" ? "آخر ما قرأت" : "Last read"}
                  </span>
                </div>
              );
            }

            const msg = it.msg;
            const fromMe = isOutbound(msg);
            const sender =
              msg.fromId !== "system" ? props.usersById.get(msg.fromId) : null;

            // group: show sender name for inbound
            const showSender =
              conv.kind === "group" && !fromMe && msg.fromId !== "system";

            return (
              <MessageBubble
                key={it.key}
                id={`msg_${msg.id}`}
                dir={dir}
                rtl={rtl}
                convId={conv.id}
                msg={msg}
                fromMe={fromMe}
                sender={sender}
                showSender={showSender}
                replyTo={
                  msg.replyToId ? (byId.get(msg.replyToId) ?? null) : null
                }
                onReact={(emoji) => props.onReact(conv.id, msg.id, emoji)}
                onReply={() => props.onReply(msg.id)}
                onOptions={() => props.onOpenMsgSheet(conv.id, msg.id)}
                onViewImage={props.onViewImage}
                onViewVideo={props.onViewVideo}
              />
            );
          })}
        </div>
      </div>

      {/* smart floating control */}
      <AnimatePresence>
        {!atBottom && (
          <motion.div
            className={cn("absolute bottom-3 z-20", rtl ? "left-3" : "right-3")}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 320, damping: 24 }
            }
          >
            <button
              type="button"
              onClick={hasUnread ? scrollToMarker : scrollToBottom}
              className={cn(
                "flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-black",
                hasUnread
                  ? "border-accent-border bg-accent text-accent-foreground shadow-[var(--shadow-glow-brand)]"
                  : "border-border-subtle bg-background-elevated text-foreground-strong",
              )}
              aria-label={dir === "rtl" ? "الذهاب للأسفل" : "Jump"}
            >
              <span>
                {hasUnread
                  ? dir === "rtl"
                    ? "جديد"
                    : "New"
                  : dir === "rtl"
                    ? "للأسفل"
                    : "Bottom"}
              </span>
              <span className="opacity-90">↓</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const QUICK_REACTIONS = ["✨", "🔥", "😂", "❤️", "😮"] as const;

const MessageBubble = memo(function MessageBubble(props: {
  id: string;
  dir: Dir;
  rtl: boolean;
  convId: string;
  msg: ChatMessage;
  fromMe: boolean;
  sender: User | null;
  showSender: boolean;
  replyTo: ChatMessage | null;

  onReact: (emoji: string) => void;
  onReply: () => void;
  onOptions: () => void;

  onViewImage: (media: Media) => void;
  onViewVideo: (src: string, title: string) => void;
}) {
  const { dir, rtl, msg, fromMe } = props;
  const reduceMotion = useReducedMotion();
  const [hover, setHover] = useState(false);

  const time = formatTime(msg.createdAt, dir);

  // bubble styling
  const bubbleBase =
    "relative rounded-3xl border px-3 py-2 shadow-[var(--shadow-sm)]";
  const bubbleMine = "bg-accent text-accent-foreground border-accent-border";
  const bubbleTheirs =
    "bg-background-elevated text-foreground-strong border-border-subtle";

  const wrapAlign = fromMe
    ? rtl
      ? "justify-start"
      : "justify-end"
    : rtl
      ? "justify-end"
      : "justify-start";

  const contentDir = rtl ? "text-right" : "text-left";

  const onDoubleClick = () => props.onReact("✨");

  return (
    <div
      id={props.id}
      className={cn("relative flex w-full", wrapAlign)}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onDoubleClick={onDoubleClick}
      onContextMenu={(e) => {
        // long-press / right-click feel for mobile/desktop
        e.preventDefault();
        props.onOptions();
      }}
    >
      <div className={cn("max-w-[88%] md:max-w-[76%]")}>
        {props.showSender && props.sender && (
          <div
            className={cn(
              "mb-1 text-[10px] font-black text-foreground-soft",
              contentDir,
            )}
          >
            {props.sender.name}
          </div>
        )}

        <div className={cn("group relative")}>
          {/* Hover action rail */}
          <AnimatePresence>
            {hover && msg.type !== "system" && (
              <motion.div
                className={cn(
                  "absolute -top-10 z-10 flex items-center gap-1",
                  fromMe
                    ? rtl
                      ? "left-0"
                      : "right-0"
                    : rtl
                      ? "right-0"
                      : "left-0",
                )}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 360, damping: 22 }
                }
              >
                <div className="flex items-center gap-1 rounded-full border border-border-subtle bg-background-elevated px-1.5 py-1 shadow-[var(--shadow-md)]">
                  {QUICK_REACTIONS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={props.onReact.bind(null, e)}
                      className="grid size-8 place-items-center rounded-full hover:bg-surface-soft active:bg-surface-muted"
                      aria-label={`react ${e}`}
                    >
                      <span className="text-base">{e}</span>
                    </button>
                  ))}

                  <div className="mx-1 h-5 w-px bg-divider" />

                  <button
                    type="button"
                    onClick={props.onReply}
                    className="grid size-8 place-items-center rounded-full hover:bg-surface-soft active:bg-surface-muted"
                    aria-label={dir === "rtl" ? "رد" : "Reply"}
                  >
                    <IoReturnUpBackOutline className="size-4 text-foreground-soft" />
                  </button>

                  <button
                    type="button"
                    onClick={props.onOptions}
                    className="grid size-8 place-items-center rounded-full hover:bg-surface-soft active:bg-surface-muted"
                    aria-label={dir === "rtl" ? "خيارات" : "Options"}
                  >
                    <IoEllipsisHorizontal className="size-4 text-foreground-soft" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bubble body */}
          {msg.type === "system" ? (
            <div className="flex justify-center">
              <span className="rounded-full border border-border-subtle bg-surface-soft px-3 py-1 text-[10px] font-extrabold text-foreground-muted">
                {msg.text ?? ""}
              </span>
            </div>
          ) : (
            <div
              className={cn(
                bubbleBase,
                fromMe ? bubbleMine : bubbleTheirs,
                contentDir,
              )}
            >
              {/* Reply preview */}
              {props.replyTo && (
                <div
                  className={cn(
                    "mb-2 rounded-2xl border px-2 py-1",
                    fromMe
                      ? "border-white/25 bg-white/12"
                      : "border-border-subtle bg-surface-soft",
                  )}
                >
                  <div className="text-[10px] font-black opacity-90">
                    {dir === "rtl" ? "رد على" : "Replying to"}
                  </div>
                  <div className="truncate text-xs opacity-90">
                    {props.replyTo.text ?? snippetOf(props.replyTo)}
                  </div>
                </div>
              )}

              {/* Content */}
              <MessageContent
                dir={dir}
                rtl={rtl}
                msg={msg}
                onViewImage={props.onViewImage}
                onViewVideo={props.onViewVideo}
                fromMe={fromMe}
              />

              {/* Footer meta */}
              <div
                className={cn(
                  "mt-2 flex items-center gap-2 text-[10px] font-bold opacity-90",
                  fromMe
                    ? rtl
                      ? "justify-start"
                      : "justify-end"
                    : rtl
                      ? "justify-end"
                      : "justify-start",
                )}
              >
                <span>{time}</span>

                {fromMe && (
                  <span className="inline-flex items-center gap-1">
                    {msg.status === "read" ? (
                      <IoCheckmarkDoneOutline className="size-4" />
                    ) : msg.status === "delivered" ? (
                      <IoCheckmarkOutline className="size-4" />
                    ) : (
                      <span className="size-4" />
                    )}
                  </span>
                )}
              </div>

              {/* Reactions */}
              {msg.reactions && msg.reactions.length > 0 && (
                <div
                  className={cn(
                    "mt-2 flex flex-wrap gap-1",
                    fromMe
                      ? rtl
                        ? "justify-start"
                        : "justify-end"
                      : rtl
                        ? "justify-end"
                        : "justify-start",
                  )}
                >
                  {msg.reactions.map((r) => (
                    <button
                      key={r.emoji}
                      type="button"
                      onClick={() => props.onReact(r.emoji)}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-black",
                        r.byMe
                          ? "border-white/35 bg-white/16"
                          : "border-border-subtle bg-surface-soft",
                      )}
                      aria-label={`reaction ${r.emoji}`}
                    >
                      <span>{r.emoji}</span>
                      <span>{r.count}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

function MessageContent(props: {
  dir: Dir;
  rtl: boolean;
  msg: ChatMessage;
  fromMe: boolean;
  onViewImage: (media: Media) => void;
  onViewVideo: (src: string, title: string) => void;
}) {
  const { msg } = props;

  if (msg.type === "text")
    return (
      <div className="whitespace-pre-wrap break-words text-sm font-semibold">
        {msg.text}
      </div>
    );

  if (msg.type === "sticker") {
    return (
      <div className="whitespace-pre-wrap break-words text-base font-black">
        {msg.text}
      </div>
    );
  }

  if (msg.type === "image" && msg.media) {
    return (
      <div>
        <button
          type="button"
          onClick={() => props.onViewImage(msg.media!)}
          className="relative block w-full overflow-hidden rounded-2xl border border-border-subtle bg-surface-soft"
          aria-label={props.dir === "rtl" ? "عرض الصورة" : "View image"}
        >
          <Image
            src={msg.media.src}
            alt={msg.media.alt}
            width={msg.media.width}
            height={msg.media.height}
            className="h-auto w-full object-cover"
            sizes="(max-width: 768px) 90vw, 540px"
          />

          <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_50%,transparent_0%,rgba(0,0,0,0.22)_100%)] opacity-0 hover:opacity-100 transition-opacity" />
          <div className="absolute bottom-2 right-2 rounded-full border border-white/20 bg-black/40 px-2 py-1 text-[10px] font-black text-white">
            {props.dir === "rtl" ? "تكبير" : "Zoom"}
          </div>
        </button>

        {msg.text && (
          <div className="mt-2 text-sm font-semibold">{msg.text}</div>
        )}
      </div>
    );
  }

  if (msg.type === "video" && msg.video) {
    const poster = msg.video.poster;
    return (
      <div>
        <button
          type="button"
          onClick={() => props.onViewVideo(msg.video!.src, msg.video!.title)}
          className="relative block w-full overflow-hidden rounded-2xl border border-border-subtle bg-surface-soft"
          aria-label={props.dir === "rtl" ? "تشغيل الفيديو" : "Play video"}
        >
          {poster ? (
            <Image
              src={poster.src}
              alt={poster.alt}
              width={poster.width}
              height={poster.height}
              className="h-auto w-full object-cover"
              sizes="(max-width: 768px) 90vw, 540px"
            />
          ) : (
            <div className="aspect-video w-full bg-surface-muted" />
          )}

          <div className="absolute inset-0 grid place-items-center">
            <div className="grid size-14 place-items-center rounded-full border border-white/30 bg-black/35 shadow-[var(--shadow-lg)]">
              <IoPlayCircleOutline className="size-8 text-white" />
            </div>
          </div>

          <div className="absolute bottom-2 left-2 rounded-full border border-white/20 bg-black/40 px-2 py-1 text-[10px] font-black text-white">
            {msg.video.durationSec}s
          </div>
        </button>

        {msg.text && (
          <div className="mt-2 text-sm font-semibold">{msg.text}</div>
        )}
      </div>
    );
  }

  if (msg.type === "share" && msg.share) {
    const cover = msg.share.cover;
    return (
      <button
        type="button"
        onClick={() => void 0}
        className={cn(
          "w-full overflow-hidden rounded-2xl border border-border-subtle bg-surface-soft",
          "hover:bg-surface-muted active:bg-surface-muted/80",
          "text-left",
        )}
        aria-label={props.dir === "rtl" ? "فتح المشاركة" : "Open share"}
      >
        <div
          className={cn(
            "flex gap-3 p-2",
            props.rtl && "flex-row-reverse text-right",
          )}
        >
          <div className="relative size-16 overflow-hidden rounded-2xl border border-border-subtle bg-background-elevated">
            {cover ? (
              <Image
                src={cover.src}
                alt={cover.alt}
                fill
                className="object-cover"
                sizes="64px"
              />
            ) : (
              <div className="size-16 bg-surface-muted" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-extrabold text-foreground-strong">
              {msg.share.title}
            </div>
            <div className="truncate text-xs text-foreground-muted">
              {msg.share.subtitle ?? ""}
            </div>

            <div
              className={cn(
                "mt-2 inline-flex items-center gap-2 text-[10px] font-black text-accent",
                props.rtl && "flex-row-reverse",
              )}
            >
              <IoLinkOutline className="size-4" />
              <span>{props.dir === "rtl" ? "عرض" : "Open"}</span>
            </div>
          </div>
        </div>
      </button>
    );
  }

  return null;
}

/** =========================================================
 *  Composer (rich editor: mentions + emoji + hotkeys + counter + reply)
 *  ========================================================= */

type MentionOption = {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
};
type SubmitHotkey = "enter" | "ctrlEnter" | "metaEnter" | "none";

function findMentionQuery(text: string, caret: number) {
  const left = text.slice(0, caret);
  const match = left.match(/(^|[\s\n])@([a-zA-Z0-9_]+)?$/);
  if (!match) return null;

  const query = (match[2] ?? "").toString();
  const end = caret;
  const start = end - (1 + query.length);
  return { query, start, end };
}

function extractMentions(text: string) {
  const matches = text.match(/@([a-zA-Z0-9_]+)/g) ?? [];
  const usernames = matches.map((m) => m.slice(1));
  const seen = new Set<string>();
  const out: string[] = [];
  for (const u of usernames) {
    const k = u.toLowerCase();
    if (!seen.has(k)) {
      seen.add(k);
      out.push(u);
    }
  }
  return out;
}

const DEFAULT_EMOJIS = [
  "😀",
  "😂",
  "😍",
  "😭",
  "🔥",
  "✨",
  "💯",
  "👍",
  "🥹",
  "😤",
  "🫡",
  "🤝",
];

function Composer(props: {
  dir: Dir;
  rtl: boolean;
  disabled?: boolean;

  onSend: (text: string, mentions: string[]) => void;
  mentionOptions: MentionOption[];

  replyTo: { convId: string; msgId: string } | null;
  onCancelReply: () => void;
  resolveReplyPreview: (msgId: string) => string;

  reduceMotion: boolean;

  submitHotkey?: SubmitHotkey;
  maxLength?: number;
}) {
  const { dir, rtl } = props;

  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);

  // textarea autosize
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // mentions
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionIndex, setMentionIndex] = useState(0);

  // emoji
  const [emojiOpen, setEmojiOpen] = useState(false);

  const isComposingRef = useRef(false);

  const filteredMentions = useMemo(() => {
    if (!mentionOpen) return [];
    const q = mentionQuery.trim().toLowerCase();
    const scored = props.mentionOptions
      .map((m) => {
        const u = m.username.toLowerCase();
        const d = (m.displayName ?? "").toLowerCase();
        let score = 0;

        if (!q) score += 1;
        if (u === q) score += 100;
        if (u.startsWith(q)) score += 50;
        if (u.includes(q)) score += 20;
        if (d.startsWith(q)) score += 10;
        if (d.includes(q)) score += 5;

        return { m, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((x) => x.m);

    return scored;
  }, [mentionOpen, mentionQuery, props.mentionOptions]);

  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const max = 160;
    el.style.height = `${Math.min(el.scrollHeight, max)}px`;
  }, []);

  useEffect(() => {
    resize();
  }, [text, resize]);

  const updateMentionFromCaret = () => {
    const el = textareaRef.current;
    if (!el) return;
    const caret = el.selectionStart ?? 0;
    const found = findMentionQuery(text, caret);
    if (found) {
      setMentionOpen(true);
      setMentionQuery(found.query);
      setMentionIndex(0);
    } else {
      setMentionOpen(false);
    }
  };

  const confirmMention = (user: MentionOption) => {
    const el = textareaRef.current;
    if (!el) return;

    const caret = el.selectionStart ?? 0;
    const found = findMentionQuery(text, caret);
    if (!found) return;

    const before = text.substring(0, found.start);
    const after = text.substring(found.end);
    const inserted = `@${user.username} `;

    const next = before + inserted + after;
    setText(next);
    setMentionOpen(false);

    requestAnimationFrame(() => {
      const pos = before.length + inserted.length;
      el.selectionStart = el.selectionEnd = pos;
      el.focus();
    });
  };

  const insertAtCaret = (str: string) => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const next = text.substring(0, start) + str + text.substring(end);
    setText(next);

    requestAnimationFrame(() => {
      const pos = start + str.length;
      el.selectionStart = el.selectionEnd = pos;
      el.focus();
    });
  };

  const canSubmit = !props.disabled && !isSending && text.trim().length > 0;

  const doSend = async () => {
    if (!canSubmit) return;

    setIsSending(true);
    try {
      const mentions = extractMentions(text);
      props.onSend(text, mentions);
      setText("");
      setEmojiOpen(false);
      setMentionOpen(false);
      resize();
    } finally {
      setIsSending(false);
    }
  };

  const submitHotkey = props.submitHotkey ?? "enter";
  const maxLength = props.maxLength ?? 2000;

  const onKeyDown = (e: React.KeyboardEvent) => {
    // mention navigation
    if (mentionOpen) {
      if (filteredMentions.length > 0) {
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setMentionIndex(
            (p) => (p - 1 + filteredMentions.length) % filteredMentions.length,
          );
          return;
        }
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setMentionIndex((p) => (p + 1) % filteredMentions.length);
          return;
        }
        if (e.key === "Enter" || e.key === "Tab") {
          e.preventDefault();
          confirmMention(filteredMentions[mentionIndex]);
          return;
        }
      }

      if (e.key === "Escape") {
        setMentionOpen(false);
        return;
      }
    }

    // submit hotkeys
    if (isComposingRef.current) return;
    if (submitHotkey === "none") return;

    const isEnter = e.key === "Enter";
    if (!isEnter) return;

    const ctrl = e.ctrlKey;
    const meta = e.metaKey;

    const shouldSend =
      (submitHotkey === "enter" && !e.shiftKey) ||
      (submitHotkey === "ctrlEnter" && ctrl) ||
      (submitHotkey === "metaEnter" && meta);

    if (shouldSend) {
      e.preventDefault();
      doSend();
    }
  };

  const hintText = useMemo(() => {
    if (submitHotkey === "enter")
      return dir === "rtl"
        ? "Enter للإرسال • Shift+Enter لسطر جديد"
        : "Enter to send • Shift+Enter for new line";
    if (submitHotkey === "ctrlEnter")
      return dir === "rtl" ? "Ctrl+Enter للإرسال" : "Ctrl+Enter to send";
    if (submitHotkey === "metaEnter")
      return dir === "rtl" ? "⌘+Enter للإرسال" : "⌘+Enter to send";
    return null;
  }, [submitHotkey, dir]);

  const replyPreview = props.replyTo
    ? props.resolveReplyPreview(props.replyTo.msgId)
    : null;

  return (
    <div className="relative w-full">
      {/* Mention Popup */}
      {mentionOpen && (
        <div
          className={cn(
            "absolute bottom-full mb-2 w-[min(360px,calc(100vw-24px))]",
            rtl ? "right-0" : "left-0",
            "rounded-2xl border border-border-subtle bg-background-elevated shadow-[var(--shadow-elevated)] overflow-hidden z-30",
          )}
        >
          <div className="p-2">
            <div className="px-2 pb-2 text-[10px] font-black uppercase tracking-wider text-foreground-soft">
              {dir === "rtl" ? "أعضاء مقترحون" : "Suggested Members"}
            </div>

            {filteredMentions.length === 0 ? (
              <div className="px-2 py-2 text-xs text-foreground-muted">
                {dir === "rtl" ? "لا يوجد نتائج" : "No matches"}
              </div>
            ) : (
              filteredMentions.map((u, i) => (
                <button
                  key={u.id}
                  type="button"
                  onMouseDown={(ev) => ev.preventDefault()}
                  onClick={() => confirmMention(u)}
                  onMouseEnter={() => setMentionIndex(i)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-2 rounded-xl transition-colors",
                    rtl ? "flex-row-reverse text-right" : "text-left",
                    i === mentionIndex
                      ? "bg-accent-soft"
                      : "hover:bg-surface-soft",
                  )}
                >
                  <div className="relative size-8 overflow-hidden rounded-full border border-border-subtle bg-surface-muted">
                    {u.avatarUrl ? (
                      <Image
                        src={u.avatarUrl}
                        alt={u.displayName ?? u.username}
                        fill
                        className="object-cover"
                        sizes="32px"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div
                      className={cn(
                        "truncate text-xs font-extrabold",
                        i === mentionIndex
                          ? "text-foreground-strong"
                          : "text-foreground-strong",
                      )}
                    >
                      {u.displayName ?? u.username}
                    </div>
                    <div className="truncate text-[10px] text-foreground-muted">
                      @{u.username}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Emoji Popup */}
      {emojiOpen && (
        <div
          className={cn(
            "absolute bottom-full mb-2 w-[min(320px,calc(100vw-24px))]",
            rtl ? "right-0" : "left-0",
            "rounded-2xl border border-border-subtle bg-background-elevated shadow-[var(--shadow-elevated)] z-30",
          )}
        >
          <div className="p-2">
            <div className="px-1 pb-2 text-[10px] font-black uppercase tracking-wider text-foreground-soft">
              {dir === "rtl" ? "إيموجي" : "Emojis"}
            </div>
            <div className="grid grid-cols-8 gap-1">
              {DEFAULT_EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onMouseDown={(ev) => ev.preventDefault()}
                  onClick={() => {
                    insertAtCaret(e);
                    setEmojiOpen(false);
                  }}
                  className="grid size-9 place-items-center rounded-xl hover:bg-surface-soft active:bg-surface-muted text-lg"
                  aria-label={`emoji ${e}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reply strip */}
      {props.replyTo && (
        <div className="mb-2 flex items-center justify-between gap-2 rounded-2xl border border-accent-border bg-accent-soft px-3 py-2">
          <div className="min-w-0">
            <div className="text-[10px] font-black text-foreground-strong">
              {dir === "rtl" ? "رد على رسالة" : "Replying"}
            </div>
            <div className="truncate text-xs text-foreground-muted">
              {replyPreview || (dir === "rtl" ? "…" : "…")}
            </div>
          </div>
          <Button
            iconOnly
            aria-label={dir === "rtl" ? "إلغاء الرد" : "Cancel reply"}
            size="sm"
            variant="plain"
            tone="neutral"
            onClick={props.onCancelReply}
          >
            <IoCloseOutline className="size-5" />
          </Button>
        </div>
      )}

      {/* Input row */}
      <div
        className={cn(
          "flex items-end gap-2 rounded-[26px] border border-border-subtle bg-background-elevated px-2 py-2",
          "shadow-[var(--shadow-sm)]",
          rtl ? "flex-row-reverse" : "flex-row",
          props.disabled && "opacity-60 pointer-events-none",
        )}
      >
        <Button
          iconOnly
          aria-label={dir === "rtl" ? "مرفقات" : "Attach"}
          size="sm"
          variant="plain"
          tone="neutral"
          tooltip={dir === "rtl" ? "مرفقات" : "Attach"}
          onClick={() => void 0}
        >
          <IoAttachOutline className="size-5" />
        </Button>

        <Button
          iconOnly
          aria-label={dir === "rtl" ? "إيموجي" : "Emoji"}
          size="sm"
          variant="plain"
          tone="neutral"
          tooltip={dir === "rtl" ? "إيموجي" : "Emoji"}
          onClick={() => setEmojiOpen((v) => !v)}
        >
          <IoHappyOutline className="size-5" />
        </Button>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            const next = e.target.value;
            if (next.length > maxLength) return;
            setText(next);
            requestAnimationFrame(updateMentionFromCaret);
          }}
          onKeyDown={onKeyDown}
          onKeyUp={() => requestAnimationFrame(updateMentionFromCaret)}
          onClick={() => requestAnimationFrame(updateMentionFromCaret)}
          onSelect={() => requestAnimationFrame(updateMentionFromCaret)}
          onFocus={() => requestAnimationFrame(updateMentionFromCaret)}
          onCompositionStart={() => (isComposingRef.current = true)}
          onCompositionEnd={() => (isComposingRef.current = false)}
          rows={1}
          placeholder={dir === "rtl" ? "اكتب رسالة…" : "Write a message…"}
          className={cn(
            "flex-1 resize-none bg-transparent px-1 py-2 text-sm font-semibold outline-none",
            "text-foreground placeholder:text-foreground-soft",
            "max-h-[160px] overflow-y-auto app-scroll",
            rtl && "text-right",
          )}
        />

        <Button
          iconOnly
          aria-label={dir === "rtl" ? "إرسال" : "Send"}
          size="sm"
          variant={canSubmit ? "solid" : "soft"}
          tone="brand"
          disabled={!canSubmit}
          onClick={doSend}
        >
          {isSending ? (
            <span className="size-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <IoSendOutline className="size-5" />
          )}
        </Button>
      </div>

      {/* hint + counter */}
      {(hintText || typeof maxLength === "number") && (
        <div className="mt-1 flex items-center justify-between px-3">
          <div className="text-[10px] text-foreground-soft">
            {hintText ?? ""}
          </div>
          <div className="text-[10px] tabular-nums text-foreground-soft">
            {text.length}/{maxLength}
          </div>
        </div>
      )}
    </div>
  );
}

/** =========================================================
 *  UI bits
 *  ========================================================= */

function GroupAvatar({
  memberIds,
  usersById,
}: {
  memberIds: string[];
  usersById: Map<string, User>;
}) {
  const ids = memberIds.filter((x) => x !== ME_ID).slice(0, 3);
  return (
    <div className="relative size-12">
      <div className="absolute inset-0 rounded-2xl border border-border-subtle bg-surface-soft" />
      {ids.map((id, idx) => {
        const u = usersById.get(id);
        const pos =
          idx === 0
            ? "left-0 top-0"
            : idx === 1
              ? "right-0 top-0"
              : "left-2 bottom-0";
        return (
          <div
            key={id}
            className={cn(
              "absolute size-7 overflow-hidden rounded-full border-2 border-background-elevated bg-surface-muted",
              pos,
            )}
          >
            {u?.avatarUrl ? (
              <Image
                src={u.avatarUrl}
                alt={u.name}
                fill
                className="object-cover"
                sizes="28px"
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function ActionCard(props: {
  dir: Dir;
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={cn(
        "w-full rounded-3xl border border-border-subtle bg-background-elevated px-3 py-3",
        "hover:bg-surface-soft active:bg-surface-muted",
        "text-left",
      )}
    >
      <div
        className={cn(
          "flex items-start gap-3",
          props.dir === "rtl" && "flex-row-reverse text-right",
        )}
      >
        <div className="grid size-12 place-items-center rounded-2xl border border-border-subtle bg-surface-soft text-accent">
          {props.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-extrabold text-foreground-strong">
            {props.title}
          </div>
          <div className="mt-1 text-xs text-foreground-muted">{props.desc}</div>
        </div>
        <div className="grid size-10 place-items-center rounded-2xl border border-border-subtle bg-surface-soft text-foreground-soft">
          <span className={props.dir === "rtl" ? "" : ""}>→</span>
        </div>
      </div>
    </button>
  );
}
