import React, { useState } from "react";
import type { PostBoxProps } from "./postT/types";
import { Avatar, IconButton } from "@/design";
import FireCometRing from "@/assets/avatar-frames/FireCometRing";
import { FiMoreHorizontal } from "react-icons/fi";
import OptionsSheet from "./OptionsSheet";
import { VerifiedBadge } from "./ui/VerifiedBadge";
import { formatPostDate } from "@/utils/dates/formatPostDate";
import { useLocale } from "next-intl";
import { AppLocale } from "@/i18n/config";
import { FollowBurstButton } from "./ui/FollowBurstButton";
import { PostTextRichClamp } from "./postT/PostTextRichClamp";
import { PostHashtagChips } from "./postT/PostHashtagChips";
import PostFooter from "./postT/PostFooter";
import PostImagesMedia from "./postT/PostImagesMedia";
import PostVideosMedia from "./postT/PostVideosMedia";

const PostBox = ({ postData, direction, isRTL }: PostBoxProps) => {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const locale = useLocale() as AppLocale;

  const {
    publisher,
    id,
    createAt,
    title,
    text,
    media,
    stats,
    hashtags,
    viewerState,
  } = postData;

  return (
    <div
      className="mx-auto w-[98vw] mt-4
        max-w-[620px]   rounded-2xl
        bg-card    border border-card-border
        ring-1 ring-accent-ring/20   shadow-soft
      "
    >
      <div className="p-2">
        {/* post  header */}
        <div className="flex gap-2 items-center">
          {/* avatar */}
          <div className="relative shrink-0">
            <Avatar
              src={publisher?.avatar?.sm}
              blurHash={publisher?.avatar?.sm}
              // Frame={FireCometRing}
              alt={`Profile picture of ${publisher?.name} (@${publisher?.username})`}
              size="12"
              path={`/profile/${publisher?.username}`}
              effects={false}
            />

            {!viewerState?.followed && (
              <div className="absolute left-1/2 bottom-1 -translate-x-1/2 translate-y-1/2">
                <FollowBurstButton userId={publisher.id} />
              </div>
            )}
          </div>

          
          {/* details publisher */}
          <div className="">
            <div className="flex gap-2 items-center">
              <span className="truncate text-sm font-semibold text-foreground-strong">
                {publisher?.name}
              </span>

              {publisher?.verified && <VerifiedBadge />}

              {publisher?.rank?.label && (
                <span
                  className="
                      inline-flex items-center
                      rounded-full px-2 py-0.5
                      text-[11px] font-medium
                      bg-accent-soft border border-accent-border
                      text-foreground-strong
                    "
                  title={publisher?.rank?.label}
                >
                  {publisher?.rank?.label}
                </span>
              )}
            </div>

            <div className="mt-1 flex items-center gap-1 text-xs text-foreground-muted min-w-0">
              <span
                dir="ltr"
                className="truncate text-left [unicode-bidi:plaintext]"
              >
                {publisher?.username}
              </span>
              <span className="text-accent-border">•</span>
              <time
                dateTime={createAt}
                className="whitespace-nowrap text-foreground-soft"
                title={createAt}
              >
                {formatPostDate(createAt, { locale })}
              </time>
            </div>
          </div>

          {/* post options */}
          <div className="shrink-0 ms-auto">
            <IconButton
              aria-label="More post"
              variant="ghost"
              tooltip="المزيد"
              className="opacity-80 hover:opacity-100"
              tooltipPlacement="bottom"
              onClick={() => setIsOptionsOpen(true)}
            >
              <FiMoreHorizontal />
            </IconButton>

            <OptionsSheet
              open={isOptionsOpen}
              onOpenChange={setIsOptionsOpen}
              options={[
                { id: "toggle_save", value: false },
                { id: "toggle_notifications", value: true },
                { id: "copy_link", value: "https://your.app/post/p_1001" },
                { id: "copy_id", value: "p_1001" },
                { id: "copy_text", value: "هذا نص المنشور…" },
                "not_interested",
                "hide",
                "report",
              ]}
              onAction={(id, next) => console.log(id, next)}
            />
          </div>
        </div>

        {/* post  content */}
        <section className="pt-5 space-y-3" dir={direction}>
          {title && (
            <h3 className="text-[15px] font-semibold text-foreground-strong leading-6">
              {title}
            </h3>
          )}

          {text && (
            <PostTextRichClamp
              text={text}
              maxLines={5}
              locale={locale}
              direction={direction}
              // mentionHref={(u) => `/profile/${encodeURIComponent(u)}`} // optional override
              // hashtagHref={(t) => `/hashtag/${encodeURIComponent(t)}`}  // optional override
            />
          )}

          {hashtags && <PostHashtagChips hashtags={hashtags} max={4} />}
        </section>

        {/* post media */}
        <section className="pt-3">
          {media?.type === "image" && media.sources?.length ? (
            <PostImagesMedia
              sources={media.sources}
              direction={direction}
              countryCode={publisher?.country}
              liked={viewerState?.liked}
              onToggleLike={(next) => console.log("toggle like", next)}
              isRTL={isRTL}
            />
          ) : null}

          {media?.type === "video" && media.sources?.length ? (
            <PostVideosMedia
              source={media.sources[0]} // ✅ فيديو واحد فقط
              direction={direction}
              countryCode={publisher?.country}
              liked={viewerState?.liked}
              onToggleLike={(next) => console.log("toggle like", next)}
            />
          ) : null}
        </section>

        <PostFooter
          postId={id}
          locale={locale}
          direction={direction}
          stats={stats}
          viewerState={viewerState}
          shareUrl={`https://example.com/post/${id}`}
          onLike={() => console.log("like")}
          onComment={() => console.log("comment")}
          onSave={() => console.log("save")}
        />
      </div>
    </div>
  );
};

export default PostBox;
