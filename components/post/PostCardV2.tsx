"use client";

import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Bookmark,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Heart,
  Link2,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Send,
  Share2,
  Sparkles,
  UserCheck,
  UserPlus,
  Zap,
  FolderPlus,
} from "lucide-react";

import Modal from "@/components/Modal";
import OptionsSheet from "@/components/OptionsSheet";
import { Avatar } from "@/design";
import { IconButton } from "@/design/IconButton";

/* ============================================================================
   Types (models) — داخل نفس الملف ✅
============================================================================ */

type PostAuthor = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  rank?: string;
};

type PostMedia = {
  id: string;
  url: string;
  alt?: string;
};

type PostModel = {
  id: string;
  author: PostAuthor;
  title?: string;
  body: string;
  hashtags?: string[];
  media?: PostMedia[];
  createdAtLabel?: string;

  stats: {
    likes: number;
    comments: number;
    saves: number;
    boosts: number;
  };

  viewerState: {
    liked: boolean;
    saved: boolean;
    followedAuthor: boolean;
  };
};

type SaveCollection = {
  id: string;
  name: string;
  coverUrl?: string;
  itemsCount: number;
};

/* ============================================================================
   Main Component
============================================================================ */

export default function PostCardV2({
  post = DEMO_POST,
  viewerId = "viewer-1",
}: {
  post?: PostModel;
  viewerId?: string;
}) {
  const [liked, setLiked] = useState(post.viewerState.liked);
  const [saved, setSaved] = useState(post.viewerState.saved);
  const [followed, setFollowed] = useState(post.viewerState.followedAuthor);

  const [likes, setLikes] = useState(post.stats.likes);
  const [saves, setSaves] = useState(post.stats.saves);

  const [optionsOpen, setOptionsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);

  const [viewerIndexOpen, setViewerIndexOpen] = useState<number | null>(null);

  // Read more logic (5 lines + once expand)
  const [expanded, setExpanded] = useState(false);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const canReadMore = useLineClampOverflow(
    bodyRef,
    [post.body, post.title],
    5,
    expanded,
  );

  const media = post.media ?? [];
  const isCoarse = useIsCoarsePointer(); // for “Threads-like” swipe behavior on phone

  const onToggleLike = () => {
    setLiked((v) => !v);
    setLikes((prev) => prev + (liked ? -1 : 1));
  };

  const onToggleSaveQuick = () => {
    setSaved((v) => !v);
    setSaves((prev) => prev + (saved ? -1 : 1));
  };

  const optionsTarget = useMemo(
    () => ({
      kind: "post" as const,
      id: post.id,
      postId: post.id,
      ownerId: post.author.id,
      authorId: post.author.id,
      url: `/post/${post.id}`,
      text: post.body,
      saved,
      followed,
      notificationsOn: false,
      pinned: false,
      archived: false,
      context: "feed" as const,
      tags: post.hashtags?.map((h) => h.replace(/^#/, "")) ?? [],
    }),
    [post.id, post.author.id, post.body, post.hashtags, saved, followed],
  );

  return (
    <article
      dir="rtl"
      className={cx(
        "w-full",
        "rounded-2xl border border-border-subtle bg-background-elevated",
        "shadow-[var(--shadow-elevated)]",
        "overflow-hidden",
        "transition-shadow",
        "hover:shadow-[var(--shadow-xl)]",
      )}
    >
      {/* =========================
         Header
      ========================= */}
      <header className="flex items-start justify-between gap-3 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="relative">
            <Avatar
              src={post.author.avatarUrl}
              name={post.author.name}
              size="12"
              className="ring-2 ring-background-elevated"
              path={`/@${post.author.username.replace(/^@/, "")}`}
            />

            {/* Follow button overlay (على/قرب الـ Avatar) ✅ */}
            <div className="absolute -bottom-2 -left-2">
              <IconButton
                aria-label={followed ? "Following" : "Follow"}
                variant={followed ? "solid" : "soft"}
                tone={followed ? "neutral" : "brand"}
                size="sm"
                className={cx(
                  "shadow-[var(--shadow-sm)]",
                  "border border-border-subtle",
                )}
                onClick={() => setFollowed((v) => !v)}
                tooltip={followed ? "متابع" : "متابعة"}
              >
                {followed ? <UserCheck /> : <UserPlus />}
              </IconButton>
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Link
                href={`/@${post.author.username.replace(/^@/, "")}`}
                className={cx(
                  "truncate text-[15px] font800 font-semibold text-foreground-strong",
                  "hover:text-[var(--brand-solid)] transition-colors",
                )}
              >
                {post.author.name}
              </Link>

              {post.author.rank ? (
                <span
                  className={cx(
                    "shrink-0 rounded-md px-2 py-0.5 text-[10px] font-extrabold",
                    "bg-[var(--brand-soft-bg)] text-[var(--brand-solid)]",
                    "border border-[var(--brand-soft-border)]",
                  )}
                >
                  {post.author.rank}
                </span>
              ) : null}
            </div>

            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-foreground-muted">
              <span className="truncate">{post.author.username}</span>
              <span className="opacity-60">•</span>
              <span className="truncate">{post.createdAtLabel ?? "الآن"}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <IconButton
            aria-label="Options"
            variant="plain"
            tone="neutral"
            size="md"
            onClick={() => setOptionsOpen(true)}
            className="text-foreground-muted hover:text-foreground-strong"
          >
            <MoreHorizontal />
          </IconButton>
        </div>
      </header>

      {/* =========================
         Content
      ========================= */}
      <section className="px-4 sm:px-5 pb-3">
        {post.title ? (
          <h2 className="text-[16px] sm:text-[17px] font-bold text-foreground-strong leading-snug">
            {post.title}
          </h2>
        ) : null}

        <div className={cx("mt-2")}>
          <div
            ref={bodyRef}
            className={cx(
              "text-[14.5px] leading-relaxed text-foreground",
              !expanded && "line-clamp-5",
            )}
          >
            <RichTextWithHashtags text={post.body} />
          </div>

          {/* Read More (only if overflow + once) ✅ */}
          {!expanded && canReadMore ? (
            <button
              type="button"
              className={cx(
                "mt-2 inline-flex items-center gap-2",
                "text-[13px] font-semibold text-[var(--brand-solid)]",
                "hover:underline",
                "active:scale-[0.98] transition-transform",
              )}
              onClick={() => setExpanded(true)}
            >
              قراءة المزيد <ChevronLeft className="size-4" />
            </button>
          ) : null}

          {/* Hashtags pills (optional) */}
          {post.hashtags?.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {post.hashtags.map((tag) => {
                const clean = tag.replace(/^#/, "");
                return (
                  <Link
                    key={tag}
                    href={`/hashtag/${encodeURIComponent(clean)}`}
                    className={cx(
                      "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                      "border border-border-subtle bg-surface-soft/60",
                      "text-foreground-muted hover:text-[var(--brand-solid)]",
                      "hover:border-[var(--brand-soft-border)] hover:bg-[var(--brand-soft-bg)]",
                      "transition-colors",
                    )}
                  >
                    #{clean}
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>
      </section>

      {/* =========================
         Media
      ========================= */}
      {media.length ? (
        <section className="px-3 sm:px-4 pb-3">
          <MediaSection
            items={media}
            isCoarsePointer={isCoarse}
            onOpen={(idx) => setViewerIndexOpen(idx)}
          />
        </section>
      ) : null}

      {/* =========================
         Interactions
      ========================= */}
      <section className="px-3 sm:px-4 pb-2">
        <div
          className={cx(
            "flex items-center justify-between gap-2",
            "rounded-2xl border border-border-subtle bg-surface-soft/50",
            "px-2 py-2",
          )}
        >
          <div className="flex items-center gap-1">
            <ActionIcon
              ariaLabel="Like"
              active={liked}
              activeClass="text-rose-600"
              onClick={onToggleLike}
              icon={<Heart className={cx(liked && "fill-current")} />}
              count={likes}
            />

            <ActionIcon
              ariaLabel="Comments"
              onClick={() => setCommentsOpen(true)}
              icon={<MessageCircle />}
              count={post.stats.comments}
            />

            {/* Save: opens Save modal (Instagram style) ✅ */}
            <ActionIcon
              ariaLabel="Save"
              active={saved}
              onClick={() => setSaveOpen(true)}
              icon={<Bookmark className={cx(saved && "fill-current")} />}
              count={saves}
            />

            {/* Send / Popularity (Zap) — نفس ستايل المشاركة ✅ */}
            <ActionIcon
              ariaLabel="Boost"
              onClick={() => setShareOpen(true)}
              icon={<Zap />}
              count={post.stats.boosts}
              toneHint="amber"
            />
          </div>

          {/* Quick save toggle (optional tiny) */}
          <IconButton
            aria-label="Quick save toggle"
            variant="plain"
            tone="neutral"
            size="sm"
            onClick={onToggleSaveQuick}
            className={cx(
              "text-foreground-muted hover:text-foreground-strong",
              "hidden sm:inline-flex",
            )}
            tooltip={saved ? "محفوظ" : "حفظ سريع"}
          >
            {saved ? <Check /> : <Bookmark />}
          </IconButton>
        </div>
      </section>

      {/* =========================
         Comments preview (reusing Comments component ✅)
      ========================= */}
      <section className="px-4 sm:px-5 pb-3">
        <Comments
          variant="preview"
          postId={post.id}
          onOpenAll={() => setCommentsOpen(true)}
        />
      </section>

      {/* =========================
         Share Section (independent CTA at end) ✅
      ========================= */}
      <section className="px-4 sm:px-5 pb-4">
        <button
          type="button"
          onClick={() => setShareOpen(true)}
          className={cx(
            "w-full rounded-2xl",
            "border border-border-subtle bg-background-elevated",
            "px-4 py-3",
            "flex items-center justify-between gap-3",
            "hover:bg-surface-soft/60 active:scale-[0.99]",
            "transition-[transform,background-color]",
          )}
        >
          <div className="flex items-center gap-2 text-foreground-strong font-semibold">
            <Share2 className="size-4" />
            <span>مشاركة البوست</span>
          </div>
          <span className="text-xs text-foreground-muted">
            نسخ الرابط • إرسال • …
          </span>
        </button>
      </section>

      {/* =========================
         Modals
      ========================= */}

      <ShareModal
        open={shareOpen}
        onOpenChange={setShareOpen}
        url={`/post/${post.id}`}
        title={post.title ?? "Post"}
      />

      <CommentsModal
        open={commentsOpen}
        onOpenChange={setCommentsOpen}
        postId={post.id}
      />

      <SaveModal
        open={saveOpen}
        onOpenChange={setSaveOpen}
        saved={saved}
        onSavedChange={(v) => setSaved(v)}
      />

      <ImageViewerModal
        open={viewerIndexOpen !== null}
        onOpenChange={(o) =>
          setViewerIndexOpen(o ? (viewerIndexOpen ?? 0) : null)
        }
        items={media}
        startIndex={viewerIndexOpen ?? 0}
      />
    </article>
  );
}

/* ============================================================================
   Subcomponents
============================================================================ */

function MediaSection({
  items,
  onOpen,
  isCoarsePointer,
}: {
  items: PostMedia[];
  onOpen: (idx: number) => void;
  isCoarsePointer: boolean;
}) {
  // On phones: use swipe carousel (Threads vibe) ✅
  if (isCoarsePointer) {
    return <SwipeCarousel items={items} onOpen={onOpen} />;
  }

  // Desktop: show logical mosaics by count ✅
  const count = items.length;
  const show = items.slice(0, 4);
  const rest = Math.max(0, count - 4);

  if (count === 1) {
    return (
      <MediaTile
        item={items[0]}
        className="aspect-[16/10] rounded-2xl"
        onClick={() => onOpen(0)}
      />
    );
  }

  if (count === 2) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {items.map((m, idx) => (
          <MediaTile
            key={m.id}
            item={m}
            className="aspect-square rounded-2xl"
            onClick={() => onOpen(idx)}
          />
        ))}
      </div>
    );
  }

  if (count === 3) {
    return (
      <div className="grid grid-cols-2 gap-2">
        <MediaTile
          item={items[0]}
          className="row-span-2 aspect-[4/5] rounded-2xl"
          onClick={() => onOpen(0)}
        />
        <MediaTile
          item={items[1]}
          className="aspect-square rounded-2xl"
          onClick={() => onOpen(1)}
        />
        <MediaTile
          item={items[2]}
          className="aspect-square rounded-2xl"
          onClick={() => onOpen(2)}
        />
      </div>
    );
  }

  // 4+
  return (
    <div className="grid grid-cols-2 gap-2">
      {show.map((m, idx) => (
        <div key={m.id} className="relative">
          <MediaTile
            item={m}
            className="aspect-square rounded-2xl"
            onClick={() => onOpen(idx)}
          />
          {idx === 3 && rest > 0 ? (
            <button
              type="button"
              onClick={() => onOpen(idx)}
              className={cx(
                "absolute inset-0 rounded-2xl",
                "bg-black/40 backdrop-blur-[1px]",
                "flex items-center justify-center",
                "text-white font-extrabold text-xl",
                "hover:bg-black/35 transition-colors",
              )}
              aria-label={`Open +${rest} more images`}
            >
              +{rest}
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function MediaTile({
  item,
  className,
  onClick,
}: {
  item: PostMedia;
  className?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "relative w-full overflow-hidden",
        "border border-border-subtle bg-surface-soft/40",
        "hover:brightness-[1.02] active:scale-[0.995]",
        "transition-[transform,filter]",
        className,
      )}
    >
      <Image
        src={item.url}
        alt={item.alt ?? "Post media"}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 720px"
        priority={false}
      />
      <div className="absolute inset-0 ring-1 ring-black/5" />
    </button>
  );
}

function SwipeCarousel({
  items,
  onOpen,
}: {
  items: PostMedia[];
  onOpen: (idx: number) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onScroll = () => {
      const w = el.clientWidth || 1;
      const i = Math.round(el.scrollLeft / w);
      setIndex(clamp(i, 0, items.length - 1));
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [items.length]);

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className={cx(
          "flex w-full overflow-x-auto no-scrollbar",
          "snap-x snap-mandatory scroll-smooth",
          "rounded-2xl border border-border-subtle bg-surface-soft/40",
        )}
      >
        {items.map((m, idx) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onOpen(idx)}
            className={cx(
              "relative shrink-0 w-full",
              "snap-start",
              "aspect-[16/11]",
            )}
          >
            <Image
              src={m.url}
              alt={m.alt ?? "Post media"}
              fill
              className="object-cover"
              sizes="100vw"
              priority={false}
            />
          </button>
        ))}
      </div>

      {/* Dots */}
      {items.length > 1 ? (
        <div className="mt-2 flex items-center justify-center gap-1.5">
          {items.map((_, i) => (
            <span
              key={i}
              className={cx(
                "h-1.5 w-1.5 rounded-full",
                i === index ? "bg-foreground-strong" : "bg-border-strong/50",
                "transition-colors",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

/* ============================================================================
   Comments (Independent component) + Modal
============================================================================ */

function Comments({
  variant,
  postId,
  onOpenAll,
}: {
  variant: "preview" | "full";
  postId: string;
  onOpenAll?: () => void;
}) {
  // Mock — replace with real data later
  const list = DEMO_COMMENTS;

  if (variant === "preview") {
    const preview = list.slice(0, 2);
    return (
      <div className="rounded-2xl border border-border-subtle bg-surface-soft/35 p-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-bold text-foreground-strong">
            التعليقات
          </div>
          <button
            type="button"
            onClick={onOpenAll}
            className="text-xs font-semibold text-[var(--brand-solid)] hover:underline"
          >
            عرض الكل
          </button>
        </div>

        <div className="mt-2 space-y-2">
          {preview.map((c) => (
            <div key={c.id} className="flex items-start gap-2">
              <Avatar src={c.avatar} name={c.name} size="8" />
              <div className="min-w-0">
                <div className="text-xs font-bold text-foreground-strong">
                  {c.name}{" "}
                  <span className="font-medium text-foreground-muted">
                    {c.username}
                  </span>
                </div>
                <div className="text-[13px] text-foreground leading-relaxed">
                  {c.text}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // full list (used inside modal)
  return (
    <div className="space-y-3">
      {list.map((c) => (
        <div
          key={c.id}
          className={cx(
            "rounded-2xl border border-border-subtle bg-background-elevated",
            "p-3",
          )}
        >
          <div className="flex items-start gap-3">
            <Avatar src={c.avatar} name={c.name} size="10" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="truncate">
                  <span className="text-sm font-bold text-foreground-strong">
                    {c.name}
                  </span>
                  <span className="mx-2 text-foreground-muted">•</span>
                  <span className="text-xs text-foreground-muted">
                    {c.username}
                  </span>
                </div>
                <IconButton
                  aria-label="Comment options"
                  variant="plain"
                  tone="neutral"
                  size="sm"
                >
                  <MoreHorizontal />
                </IconButton>
              </div>

              <div className="mt-1 text-[14px] leading-relaxed text-foreground">
                {c.text}
              </div>

              <div className="mt-2 flex items-center gap-2 text-xs text-foreground-muted">
                <button className="hover:text-foreground-strong transition-colors">
                  رد
                </button>
                <span>•</span>
                <button className="hover:text-foreground-strong transition-colors">
                  إعجاب
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CommentsModal({
  open,
  onOpenChange,
  postId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
}) {
  const [text, setText] = useState("");

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      dir="rtl"
      mode={{ desktop: "center", mobile: "sheet" }}
      maxWidthClass="max-w-xl"
      title="التعليقات"
      subtitle="شارك رأيك 👀"
    >
      <div className="space-y-4">
        <Comments variant="full" postId={postId} />

        {/* Input */}
        <div className="sticky bottom-0 rounded-2xl border border-border-subtle bg-background-elevated p-2">
          <div className="flex items-center gap-2">
            <Avatar src={DEMO_POST.author.avatarUrl} name="You" size="9" />
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="اكتب تعليق..."
              className={cx(
                "flex-1 h-11 rounded-xl px-3",
                "bg-surface-soft/60 border border-border-subtle",
                "text-sm text-foreground outline-none",
                "focus:ring-2 focus:ring-[var(--brand-soft-border)]",
              )}
            />
            {/* Send button uses IconButton (same component style) ✅ */}
            <IconButton
              aria-label="Send comment"
              variant="solid"
              tone="brand"
              size="md"
              onClick={() => setText("")}
              isLoading={false}
              tooltip="إرسال"
            >
              <Send />
            </IconButton>
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ============================================================================
   Share Modal
============================================================================ */

function ShareModal({
  open,
  onOpenChange,
  url,
  title,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  title: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const ok = await safeCopy(url);
    setCopied(ok);
    window.setTimeout(() => setCopied(false), 900);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      dir="rtl"
      mode={{ desktop: "center", mobile: "sheet" }}
      maxWidthClass="max-w-md"
      title="مشاركة"
      subtitle={title}
    >
      <div className="grid grid-cols-2 gap-3">
        <ShareAction
          icon={<Copy />}
          title={copied ? "تم النسخ ✅" : "نسخ الرابط"}
          desc="انسخ رابط البوست"
          onClick={copy}
        />
        <ShareAction
          icon={<Link2 />}
          title="فتح الرابط"
          desc="Preview / Route"
          onClick={() => window.open(url, "_blank")}
        />
        <ShareAction
          icon={<Send />}
          title="إرسال"
          desc="DM / Chat"
          onClick={() => onOpenChange(false)}
        />
        <ShareAction
          icon={<Sparkles />}
          title="Boost"
          desc="زيادة الشعبية"
          onClick={() => onOpenChange(false)}
        />
      </div>

      <div className="mt-4 rounded-2xl border border-border-subtle bg-surface-soft/50 p-3 text-xs text-foreground-muted">
        تقدر تربطها لاحقًا بـ Web Share API على الموبايل أو share intents.
      </div>
    </Modal>
  );
}

function ShareAction({
  icon,
  title,
  desc,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "rounded-2xl border border-border-subtle bg-background-elevated",
        "p-3 text-right",
        "hover:bg-surface-soft/60 active:scale-[0.99]",
        "transition-[transform,background-color]",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-bold text-foreground-strong">{title}</div>
        <div className="grid size-10 place-items-center rounded-xl bg-surface-soft/60 border border-border-subtle">
          {icon}
        </div>
      </div>
      <div className="mt-1 text-xs text-foreground-muted">{desc}</div>
    </button>
  );
}

/* ============================================================================
   Save Modal (Collections like Instagram/TikTok) ✅
============================================================================ */

function SaveModal({
  open,
  onOpenChange,
  saved,
  onSavedChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  saved: boolean;
  onSavedChange: (saved: boolean) => void;
}) {
  const [collections, setCollections] =
    useState<SaveCollection[]>(DEMO_COLLECTIONS);
  const [selected, setSelected] = useState<string>(collections[0]?.id ?? "");
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  const create = () => {
    const name = newName.trim();
    if (!name) return;
    const next: SaveCollection = {
      id: `col-${Math.random().toString(16).slice(2)}`,
      name,
      itemsCount: 0,
      coverUrl: undefined,
    };
    setCollections((c) => [next, ...c]);
    setSelected(next.id);
    setNewName("");
    setCreating(false);
    onSavedChange(true);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      dir="rtl"
      mode={{ desktop: "center", mobile: "sheet" }}
      maxWidthClass="max-w-lg"
      title="حفظ"
      subtitle="اختر مجموعة أو أنشئ واحدة جديدة ✨"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onSavedChange(!saved)}
            className={cx(
              "inline-flex items-center gap-2 rounded-xl px-3 py-2",
              "border border-border-subtle bg-surface-soft/50",
              "text-sm font-semibold text-foreground-strong",
              "hover:bg-surface-soft/70 active:scale-[0.99] transition-[transform,background-color]",
            )}
          >
            <Bookmark className={cx(saved && "fill-current")} />
            {saved ? "محفوظ" : "غير محفوظ"}
          </button>

          <IconButton
            aria-label="Create collection"
            variant="soft"
            tone="brand"
            size="md"
            onClick={() => setCreating(true)}
            tooltip="مجموعة جديدة"
          >
            <FolderPlus />
          </IconButton>
        </div>

        {creating ? (
          <div className="rounded-2xl border border-border-subtle bg-surface-soft/40 p-3">
            <div className="text-sm font-bold text-foreground-strong">
              مجموعة جديدة
            </div>
            <div className="mt-2 flex items-center gap-2">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="اسم المجموعة..."
                className={cx(
                  "flex-1 h-11 rounded-xl px-3",
                  "bg-background-elevated border border-border-subtle",
                  "text-sm text-foreground outline-none",
                  "focus:ring-2 focus:ring-[var(--brand-soft-border)]",
                )}
              />
              <IconButton
                aria-label="Create"
                variant="solid"
                tone="brand"
                size="md"
                onClick={create}
              >
                <Plus />
              </IconButton>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {collections.map((c) => {
            const active = c.id === selected;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setSelected(c.id);
                  onSavedChange(true);
                }}
                className={cx(
                  "rounded-2xl border p-3 text-right",
                  active
                    ? "border-[var(--brand-soft-border)] bg-[var(--brand-soft-bg)]"
                    : "border-border-subtle bg-background-elevated",
                  "hover:bg-surface-soft/60 active:scale-[0.99] transition-[transform,background-color]",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold text-foreground-strong">
                      {c.name}
                    </div>
                    <div className="mt-1 text-xs text-foreground-muted">
                      {c.itemsCount} عناصر
                    </div>
                  </div>
                  <div
                    className={cx(
                      "grid size-10 place-items-center rounded-xl border border-border-subtle bg-surface-soft/60",
                      active && "bg-white/30",
                    )}
                  >
                    {active ? <Check /> : <Bookmark />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="text-xs text-foreground-muted">
          لاحقًا: تربطها بـ backend (SaveItem + SaveCollection) مثل Instagram.
        </div>
      </div>
    </Modal>
  );
}

/* ============================================================================
   Image Viewer Modal (arrows + keyboard + swipe via scroll-snap) ✅
============================================================================ */

function ImageViewerModal({
  open,
  onOpenChange,
  items,
  startIndex,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: PostMedia[];
  startIndex: number;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = useState(startIndex);

  useEffect(() => setIndex(startIndex), [startIndex]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")
        setIndex((i) => clamp(i + 1, 0, items.length - 1));
      if (e.key === "ArrowRight")
        setIndex((i) => clamp(i - 1, 0, items.length - 1));
      if (e.key === "Escape") onOpenChange(false);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, items.length, onOpenChange]);

  // scroll to index
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const w = el.clientWidth || 1;
    el.scrollTo({ left: w * index, behavior: "smooth" });
  }, [index]);

  // update index on user swipe scroll
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onScroll = () => {
      const w = el.clientWidth || 1;
      const i = Math.round(el.scrollLeft / w);
      setIndex(clamp(i, 0, items.length - 1));
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [items.length]);

  if (!items.length) return null;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      dir="rtl"
      mode={{ desktop: "center", mobile: "sheet" }}
      maxWidthClass="max-w-5xl"
      title={`الصور (${index + 1}/${items.length})`}
      subtitle="اسحب للتنقل أو استخدم الأسهم"
      contentPadding="none"
    >
      <div className="relative">
        <div
          ref={scrollerRef}
          className={cx(
            "flex w-full overflow-x-auto no-scrollbar",
            "snap-x snap-mandatory scroll-smooth",
            "bg-black/90",
          )}
          style={{ direction: "ltr" }} // keeps scrollLeft logic consistent
        >
          {items.map((m) => (
            <div
              key={m.id}
              className="relative w-full shrink-0 snap-start aspect-[16/10] sm:aspect-[16/9]"
            >
              <Image
                src={m.url}
                alt={m.alt ?? "Image"}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>
          ))}
        </div>

        {/* Arrows (desktop-friendly) */}
        {items.length > 1 ? (
          <>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 hidden sm:block">
              <IconButton
                aria-label="Prev"
                variant="inverse"
                tone="neutral"
                size="lg"
                onClick={() =>
                  setIndex((i) => clamp(i - 1, 0, items.length - 1))
                }
              >
                <ChevronLeft />
              </IconButton>
            </div>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:block">
              <IconButton
                aria-label="Next"
                variant="inverse"
                tone="neutral"
                size="lg"
                onClick={() =>
                  setIndex((i) => clamp(i + 1, 0, items.length - 1))
                }
              >
                <ChevronRight />
              </IconButton>
            </div>
          </>
        ) : null}

        {/* Dots */}
        {items.length > 1 ? (
          <div className="py-3 flex items-center justify-center gap-1.5 bg-background-elevated">
            {items.map((_, i) => (
              <span
                key={i}
                className={cx(
                  "h-1.5 w-1.5 rounded-full",
                  i === index ? "bg-foreground-strong" : "bg-border-strong/50",
                )}
              />
            ))}
          </div>
        ) : null}
      </div>
    </Modal>
  );
}

/* ============================================================================
   UI helpers
============================================================================ */

function ActionIcon({
  ariaLabel,
  icon,
  count,
  onClick,
  active,
  activeClass,
  toneHint,
}: {
  ariaLabel: string;
  icon: React.ReactNode;
  count: number;
  onClick: () => void;
  active?: boolean;
  activeClass?: string;
  toneHint?: "amber" | "rose" | "brand";
}) {
  const tint =
    toneHint === "amber"
      ? "hover:text-amber-600"
      : toneHint === "rose"
        ? "hover:text-rose-600"
        : toneHint === "brand"
          ? "hover:text-[var(--brand-solid)]"
          : "hover:text-foreground-strong";

  return (
    <div className="flex items-center gap-1">
      <IconButton
        aria-label={ariaLabel}
        variant={active ? "soft" : "plain"}
        tone={active ? "neutral" : "neutral"}
        size="md"
        onClick={onClick}
        className={cx("text-foreground-muted", tint, active && activeClass)}
      >
        {icon}
      </IconButton>

      <span className="min-w-[22px] text-[13px] font-semibold text-foreground-muted">
        {formatCount(count)}
      </span>
    </div>
  );
}

function RichTextWithHashtags({ text }: { text: string }) {
  const parts = useMemo(() => splitHashtags(text), [text]);

  return (
    <>
      {parts.map((p, idx) => {
        if (p.type === "text") return <span key={idx}>{p.value}</span>;
        const clean = p.value.replace(/^#/, "");
        return (
          <Link
            key={idx}
            href={`/hashtag/${encodeURIComponent(clean)}`}
            className="font-semibold text-[var(--brand-solid)] hover:underline"
          >
            #{clean}
          </Link>
        );
      })}
    </>
  );
}

/* ============================================================================
   Utilities (ALL inside same file ✅)
============================================================================ */

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function formatCount(n: number) {
  if (n >= 1_000_000) return `${Math.round(n / 100_000) / 10}M`;
  if (n >= 1_000) return `${Math.round(n / 100) / 10}K`;
  return String(n);
}

async function safeCopy(text: string) {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {}
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

// hashtag split with unicode support
function splitHashtags(
  input: string,
): Array<{ type: "text" | "tag"; value: string }> {
  const re = /#([\p{L}\p{N}_]+)/gu;
  const out: Array<{ type: "text" | "tag"; value: string }> = [];
  let last = 0;

  for (const m of input.matchAll(re)) {
    const idx = m.index ?? 0;
    if (idx > last) out.push({ type: "text", value: input.slice(last, idx) });
    out.push({ type: "tag", value: `#${m[1]}` });
    last = idx + m[0].length;
  }
  if (last < input.length) out.push({ type: "text", value: input.slice(last) });
  return out;
}

function useIsCoarsePointer() {
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(pointer: coarse)");
    const update = () => setCoarse(!!mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return coarse;
}

/**
 * Detect overflow when line-clamped to N lines.
 * - shows Read More only when needed ✅
 * - once expanded => no need to measure
 */
function useLineClampOverflow(
  ref: React.RefObject<HTMLElement>,
  deps: any[],
  lines: number,
  expanded: boolean,
) {
  const [overflow, setOverflow] = useState(false);

  useLayoutEffect(() => {
    if (expanded) return;
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      // Temporarily apply clamp styles to measure
      const prev = el.className;
      if (!prev.includes("line-clamp-")) {
        el.className = `${prev} line-clamp-${lines}`;
      }
      // compare scroll vs client
      const isOverflowing = el.scrollHeight - el.clientHeight > 2;
      setOverflow(isOverflowing);
      el.className = prev; // restore
    };

    measure();

    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded, lines, ref, ...deps]);

  return overflow;
}

/* ============================================================================
   Demo data
============================================================================ */

const DEMO_POST: PostModel = {
  id: "post-101",
  author: {
    id: "u-1",
    name: "Sakura Senpai",
    username: "@sakura_chan",
    avatarUrl:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=1200&auto=format&fit=crop",
    rank: "S-Class",
  },
  title: "The visual evolution of Demon Slayer is absolute insanity! ⚔️🔥",
  body:
    "Just watched the latest arc finale… Ufotable is really flexing hard.\n" +
    "المشهد الأخير كان مجنون من ناحية الإضاءة والـ composition.\n" +
    "حابب أسمع آراءكم، خصوصًا عن القتال الأخير 💥\n\n" +
    "هذا رأيي بخصوص #DemonSlayer و #KimetsuNoYaiba وكمان #Animation و #AnimeCommunity.\n" +
    "هل تتوقعون موسم قادم بنفس الجودة؟",
  hashtags: [
    "#DemonSlayer",
    "#KimetsuNoYaiba",
    "#Animation",
    "#AnimeCommunity",
  ],
  media: [
    {
      id: "m1",
      url: "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?q=80&w=2000&auto=format&fit=crop",
    },
    {
      id: "m2",
      url: "https://images.unsplash.com/photo-1520975661595-6453be3f7070?q=80&w=2000&auto=format&fit=crop",
    },
    {
      id: "m3",
      url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=2000&auto=format&fit=crop",
    },
    {
      id: "m4",
      url: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=2000&auto=format&fit=crop",
    },
    {
      id: "m5",
      url: "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=2000&auto=format&fit=crop",
    },
  ],
  createdAtLabel: "قبل ساعتين",
  stats: { likes: 1240, comments: 45, saves: 220, boosts: 89 },
  viewerState: { liked: false, saved: false, followedAuthor: false },
};

const DEMO_COMMENTS = [
  {
    id: "c1",
    name: "Rin",
    username: "@rin_fox",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=900&auto=format&fit=crop",
    text: "الاتقان كان خرافي 🔥 خصوصًا الـ VFX.",
  },
  {
    id: "c2",
    name: "Kaito",
    username: "@kaito",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=900&auto=format&fit=crop",
    text: "أتفق… بس أتمنى يركزوا أكثر على الـ pacing.",
  },
  {
    id: "c3",
    name: "Mika",
    username: "@mika",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=900&auto=format&fit=crop",
    text: "أنا أحببت الموسيقى أكثر من الصورة 😭",
  },
];

const DEMO_COLLECTIONS: SaveCollection[] = [
  { id: "col-1", name: "مفضلاتي", itemsCount: 18, coverUrl: "" },
  { id: "col-2", name: "أعمال لازم أرجع لها", itemsCount: 7, coverUrl: "" },
  { id: "col-3", name: "إلهام للتصميم", itemsCount: 31, coverUrl: "" },
];
