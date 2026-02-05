// design/DeAvatar.tsx
import * as React from "react";
import Image, { ImageProps } from "next/image";
import Link from "next/link";
import { blurhashToImageCssObject } from "@unpic/placeholder";
import { cn } from "@/utils/cn";

type FrameComponent = React.ComponentType<{ size: number; className?: string }>;

export type AvatarBottomBadge =
  | { type: "level"; value: number; label?: string }
  | { type: "rank"; label: string }
  | { type: "custom"; node: React.ReactNode };

export type AvatarProps = Omit<
  ImageProps,
  "src" | "alt" | "width" | "height" | "fill" | "placeholder" | "blurDataURL"
> & {
  /** Image */
  src?: ImageProps["src"];
  alt?: string;
  name?: string;

  /** Size token ("12" => 48px) OR px number. Default: "12" */
  size?: number | `${number}` | "px" | "auto";

  /** Circle by default */
  rounded?: boolean;

  /** Wrapper classes */
  className?: string;

  /** Image classes */
  imageClassName?: string;

  /** Link wrapper */
  href?: string;
  /** Back-compat */
  path?: string;
  prefetch?: boolean;

  /** Blurhash placeholder */
  blurHash?: string;

  /**
   * Frame around avatar:
   * - frameSrc: image (png/webp/svg)
   * - Frame: react component (svg)
   */
  frameSrc?: ImageProps["src"];
  /** Back-compat */
  rankBorder?: ImageProps["src"];
  Frame?: FrameComponent;

  /**
   * Thickness of frame ring (px).
   * This is "padding space" between frame and image => frame is OUTSIDE image.
   */
  frameThickness?: number;

  /** Hover micro-interaction */
  effects?: boolean;

  /** Bottom badge (level/rank/custom) */
  bottomBadge?: AvatarBottomBadge;

  /**
   * Badge offset outside the avatar (px). If omitted, auto computed.
   * Helps ensure badge never covers the face.
   */
  badgeOffset?: number;

  /** Optional top-right overlay (verified/mod/etc.) */
  topRight?: React.ReactNode;

  /** Optional fallback node if src missing */
  fallback?: React.ReactNode;
};

// -------------------------
// utils
// -------------------------
function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function resolveSizePx(size: AvatarProps["size"]): number {
  if (typeof size === "number") return Math.max(0, Math.round(size));

  if (typeof size === "string") {
    if (size === "px") return 1;
    if (size === "auto") return 128;

    const n = Number(size);
    // Tailwind spacing scale: 1 => 4px (0.25rem)
    if (Number.isFinite(n)) return Math.max(0, Math.round(n * 4));
  }

  return 48;
}

function extractDataUrlFromCssBackgroundImage(
  backgroundImage?: string,
): string | undefined {
  if (!backgroundImage) return;

  const match = backgroundImage.match(/url\((['"]?)(.*?)\1\)/);
  const url = match?.[2];
  return url?.startsWith("data:") ? url : undefined;
}

// -------------------------
// blurhash cache (perf)
// -------------------------
const BLUR_CACHE_LIMIT = 300;
const blurCache = new Map<
  string,
  { style?: React.CSSProperties; dataURL?: string }
>();

function getBlurPlaceholder(blurHash: string, px: number) {
  const safePx = clamp(Math.round(px / 2), 8, 32);
  const key = `${blurHash}|${safePx}`;

  const cached = blurCache.get(key);
  if (cached) return cached;

  try {
    const style = blurhashToImageCssObject(blurHash, safePx, safePx);
    const dataURL = extractDataUrlFromCssBackgroundImage(style.backgroundImage);

    const value = { style, dataURL };
    blurCache.set(key, value);

    // simple FIFO trim
    if (blurCache.size > BLUR_CACHE_LIMIT) {
      const firstKey = blurCache.keys().next().value as string | undefined;
      if (firstKey) blurCache.delete(firstKey);
    }

    return value;
  } catch {
    const value = { style: undefined, dataURL: undefined };
    blurCache.set(key, value);
    return value;
  }
}

// -------------------------
// UI bits
// -------------------------
function BottomBadge({ badge }: { badge: AvatarBottomBadge }) {
  if (badge.type === "custom") return badge.node;

  if (badge.type === "level") {
    const label = badge.label ?? `Lv. ${badge.value}`;
    return (
      <span className="inline-flex items-center rounded-full border border-white/10 bg-black/75 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm backdrop-blur">
        {label}
      </span>
    );
  }

  // rank
  return (
    <span className="inline-flex items-center rounded-full border border-black/10 bg-amber-300 px-2 py-0.5 text-[10px] font-extrabold tracking-wide text-slate-950 shadow-sm">
      {badge.label}
    </span>
  );
}

// -------------------------
// Avatar
// -------------------------
export function Avatar({
  // basics
  src,
  alt,
  name,
  size = "12",
  rounded = true,
  className,
  imageClassName,

  // link
  href,
  path,
  prefetch,

  // placeholder
  blurHash,

  // frame
  frameSrc,
  rankBorder,
  Frame,
  frameThickness,

  // interactions
  effects = true,

  // overlays
  bottomBadge,
  badgeOffset,
  topRight,

  fallback,

  // image props
  sizes,
  style,
  priority,
  loading,
  ...imgProps
}: AvatarProps) {
  const finalHref = href ?? path;
  const finalFrameSrc = frameSrc ?? rankBorder;

  const outerPx = resolveSizePx(size);
  const hasFrame = Boolean(finalFrameSrc || Frame);

  const ringPx = hasFrame
    ? frameThickness ?? clamp(Math.round(outerPx * 0.1), 3, 12)
    : 0;

  // image MUST not be covered by frame => we inset image with padding = ringPx
  const innerPx = Math.max(0, outerPx - ringPx * 2);

  const finalAlt = alt ?? (name ? `Avatar of ${name}` : "User avatar");
  const shapeClass = rounded ? "rounded-full" : "rounded-2xl";

  const { style: blurStyle, dataURL } =
    blurHash && blurHash.trim().length > 6 && innerPx > 0
      ? getBlurPlaceholder(blurHash, innerPx)
      : { style: undefined, dataURL: undefined };

  // badge outside image (and outside avatar container slightly)
  const computedBadgeOffset =
    badgeOffset ?? clamp(ringPx + Math.round(outerPx * 0.08), 8, 22);

  const WrapperClass = cn(
    "relative inline-grid shrink-0 place-items-center overflow-visible select-none",
    shapeClass,
    effects &&
      "transform-gpu transition duration-200 ease-out hover:scale-[1.03] hover:shadow-lg",
    finalHref &&
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
    className,
  );

  const photoNode =
    src && innerPx > 0 ? (
      <Image
        src={src}
        alt={finalAlt}
        fill
        placeholder={dataURL ? "blur" : "empty"}
        blurDataURL={dataURL}
        sizes={sizes ?? `${innerPx}px`}
        className={cn(
          "pointer-events-none select-none object-cover",
          shapeClass,
          imageClassName,
        )}
        style={style}
        priority={priority}
        loading={loading}
        {...imgProps}
      />
    ) : (
      <div
        className={cn(
          "grid h-full w-full place-items-center bg-white/5 text-xs font-semibold text-white/80",
          shapeClass,
        )}
      >
        {fallback ?? (name?.[0]?.toUpperCase() ?? "？")}
      </div>
    );

  const content = (
    <>
      {/* Photo area (inset) => frame is OUTSIDE the image */}
      <div
        className={cn(
          "relative z-0 overflow-hidden bg-white/5",
          shapeClass,
        )}
        style={{
          width: innerPx,
          height: innerPx,
          ...(blurStyle ?? {}),
        }}
      >
        {photoNode}
      </div>

      {/* Frame overlay covers the whole outer box (but image is inset) */}
      {hasFrame ? (
        <div className="pointer-events-none absolute inset-0 z-10">
          {/* ring background layer (optional subtle) */}
          <div
            className={cn(
              "absolute inset-0",
              shapeClass,
              "bg-gradient-to-br from-white/10 to-white/0",
            )}
          />
          {finalFrameSrc ? (
            <Image
              src={finalFrameSrc}
              alt=""
              aria-hidden="true"
              fill
              sizes={`${outerPx}px`}
              className={cn("object-contain drop-shadow-sm")}
            />
          ) : Frame ? (
            <Frame size={outerPx} className="h-full w-full drop-shadow-sm" />
          ) : null}
        </div>
      ) : null}

      {/* Top-right overlay */}
      {topRight ? (
        <div className="pointer-events-none absolute right-0 top-0 z-20 -translate-y-1/4 translate-x-1/4">
          {topRight}
        </div>
      ) : null}

      {/* Bottom-center badge (OUTSIDE image) */}
      {bottomBadge ? (
        <div
          className="pointer-events-none absolute left-1/2 z-20 -translate-x-1/2"
          style={{ bottom: -computedBadgeOffset }}
        >
          <BottomBadge badge={bottomBadge} />
        </div>
      ) : null}
    </>
  );

  // Outer box size fixed
  const outerStyle: React.CSSProperties = {
    width: outerPx,
    height: outerPx,
    padding: ringPx,
  };

  return finalHref ? (
    <Link
      href={finalHref}
      prefetch={prefetch}
      aria-label={finalAlt}
      className={WrapperClass}
      style={outerStyle}
    >
      {content}
    </Link>
  ) : (
    <div className={WrapperClass} style={outerStyle}>
      {content}
    </div>
  );
}

// -------------------------
// AvatarGroup (stack)
// -------------------------
export type AvatarGroupUser = {
  id: string;
  name?: string;
  src?: ImageProps["src"];
  blurHash?: string;
  href?: string;

  frameSrc?: ImageProps["src"];
  rankBorder?: ImageProps["src"];

  bottomBadge?: AvatarBottomBadge;
  topRight?: React.ReactNode;
};

export type AvatarGroupProps = {
  users: AvatarGroupUser[];

  /** Size for each avatar */
  size?: AvatarProps["size"];

  /** Max visible avatars */
  max?: number;

  /**
   * Total count (useful when you only have first few avatars loaded).
   * Example: show 3 avatars but totalCount=8 => "+5"
   */
  totalCount?: number;

  /** Overlap in px (default computed) */
  overlap?: number;

  /** Add outline ring to separate overlaps */
  outlined?: boolean;

  className?: string;
  avatarClassName?: string;

  /** Frame ring thickness for group avatars */
  frameThickness?: number;

  /** If true, disable hover effects on avatars (recommended in stacks) */
  disableEffects?: boolean;

  /** Optional link for the +N bubble */
  plusHref?: string;
};

export function AvatarGroup({
  users,
  size = "10",
  max = 3,
  totalCount,
  overlap,
  outlined = true,
  className,
  avatarClassName,
  frameThickness,
  disableEffects = true,
  plusHref,
}: AvatarGroupProps) {
  const basePx = resolveSizePx(size);
  const computedOverlap = overlap ?? clamp(Math.round(basePx * 0.28), 8, 16);

  const shown = users.slice(0, max);
  const extra =
    typeof totalCount === "number"
      ? Math.max(0, totalCount - shown.length)
      : Math.max(0, users.length - shown.length);

  const ariaNames = shown
    .map((u) => u.name)
    .filter(Boolean)
    .join(", ");

  const plusBubble = extra > 0 && (
    <div
      className="relative"
      style={{
        marginInlineStart: shown.length === 0 ? 0 : -computedOverlap,
        zIndex: shown.length + 1,
      }}
    >
      {plusHref ? (
        <Link
          href={plusHref}
          className={cn(
            "grid place-items-center rounded-full ring-2 ring-slate-950",
            "bg-gradient-to-br from-fuchsia-500/25 via-white/10 to-cyan-500/25",
            "text-[11px] font-bold text-white shadow-sm backdrop-blur",
          )}
          style={{ width: basePx, height: basePx }}
          aria-label={`+${extra} more`}
        >
          +{extra}
        </Link>
      ) : (
        <div
          className={cn(
            "grid place-items-center rounded-full ring-2 ring-slate-950",
            "bg-gradient-to-br from-fuchsia-500/25 via-white/10 to-cyan-500/25",
            "text-[11px] font-bold text-white shadow-sm backdrop-blur",
          )}
          style={{ width: basePx, height: basePx }}
          aria-label={`+${extra} more`}
        >
          +{extra}
        </div>
      )}
    </div>
  );

  return (
    <div
      className={cn("flex items-center", className)}
      aria-label={ariaNames ? `Avatars: ${ariaNames}` : "Avatars"}
    >
      {shown.map((u, i) => (
        <div
          key={u.id}
          className="relative"
          style={{
            marginInlineStart: i === 0 ? 0 : -computedOverlap,
            zIndex: i + 1,
          }}
        >
          <Avatar
            src={u.src}
            blurHash={u.blurHash}
            name={u.name}
            href={u.href}
            size={size}
            effects={!disableEffects}
            frameSrc={u.frameSrc ?? u.rankBorder}
            frameThickness={frameThickness}
            topRight={u.topRight}
            bottomBadge={u.bottomBadge}
            className={cn(outlined && "ring-2 ring-slate-950", avatarClassName)}
          />
        </div>
      ))}

      {plusBubble}
    </div>
  );
}
