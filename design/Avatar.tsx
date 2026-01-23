import Image, { ImageProps } from "next/image";
import { blurhashToImageCssObject } from "@unpic/placeholder";
import { cn } from "@/utils/cn";
import Link from "next/link";

const AVATAR_SIZES = {
  "0": { className: "h-0 w-0", px: 0 },
  px: { className: "h-px w-px", px: 1 },

  "0.5": { className: "h-0.5 w-0.5", px: 2 },
  "1": { className: "h-1 w-1", px: 4 },
  "1.5": { className: "h-1.5 w-1.5", px: 6 },
  "2": { className: "h-2 w-2", px: 8 },
  "2.5": { className: "h-2.5 w-2.5", px: 10 },
  "3": { className: "h-3 w-3", px: 12 },
  "3.5": { className: "h-3.5 w-3.5", px: 14 },
  "4": { className: "h-4 w-4", px: 16 },
  "5": { className: "h-5 w-5", px: 20 },
  "6": { className: "h-6 w-6", px: 24 },
  "7": { className: "h-7 w-7", px: 28 },
  "8": { className: "h-8 w-8", px: 32 },
  "9": { className: "h-9 w-9", px: 36 },
  "10": { className: "h-10 w-10", px: 40 },
  "11": { className: "h-11 w-11", px: 44 },
  "12": { className: "h-12 w-12", px: 48 },
  "14": { className: "h-14 w-14", px: 56 },
  "16": { className: "h-16 w-16", px: 64 },
  "20": { className: "h-20 w-20", px: 80 },
  "24": { className: "h-24 w-24", px: 96 },
  "28": { className: "h-28 w-28", px: 112 },
  "32": { className: "h-32 w-32", px: 128 },
  "36": { className: "h-36 w-36", px: 144 },
  "40": { className: "h-40 w-40", px: 160 },
  "44": { className: "h-44 w-44", px: 176 },
  "48": { className: "h-48 w-48", px: 192 },
  "52": { className: "h-52 w-52", px: 208 },
  "56": { className: "h-56 w-56", px: 224 },
  "60": { className: "h-60 w-60", px: 240 },
  "64": { className: "h-64 w-64", px: 256 },
  "72": { className: "h-72 w-72", px: 288 },
  "80": { className: "h-80 w-80", px: 320 },
  "96": { className: "h-96 w-96", px: 384 },
} as const;

export type AvatarSize = keyof typeof AVATAR_SIZES;

type AvatarProps = Omit<
  ImageProps,
  "placeholder" | "alt" | "width" | "height"
> & {
  alt?: string;
  blurHash?: string;
  rounded?: boolean;
  className?: string;
  name?: string;
  Frame?: any;
  /** Tailwind token from default spacing scale (and px) */
  size?: AvatarSize;
  path?: string;
  effects?: boolean;
};

export function Avatar({
  blurHash,
  rounded = true,
  className = "",
  name,
  style,
  src,
  Frame,
  size = "12",
  path,
  effects = true,
}: AvatarProps) {
  const { className: sizeClass, px } = AVATAR_SIZES[size];

  const finalAlt = name ? `Avatar of ${name}` : "User avatar";

  // blurHash -> CSS placeholder
  let placeholderStyle: React.CSSProperties | undefined;
  if (blurHash && blurHash.trim().length > 6 && px > 0) {
    const auto = Math.min(32, Math.max(8, Math.round(px / 2)));

    try {
      placeholderStyle = blurhashToImageCssObject(blurHash, auto, auto);
    } catch {
      // blurHash غير صالح -> تجاهل بدون كسر الرندر
      placeholderStyle = undefined;
    }
  }

  const content = (
    <>
      {/* clipping wrapper (عشان الصورة تتقص صح) */}
      <div
        className={cn(
          "relative h-full w-full overflow-hidden",
          rounded ? "rounded-full" : "rounded",
        )}
      >
        <Image
          src={src}
          alt={finalAlt}
          fill
          placeholder="empty"
          sizes={`${px}px`}
          className={cn("object-cover", rounded ? "rounded-full" : undefined)}
          style={{ ...(placeholderStyle ?? {}), ...(style ?? {}) }}
        />
      </div>

      {/* rank border overlay (ما ينقص لأنه برا clipping wrapper) */}
      {Frame ? (
        <div className="pointer-events-none absolute inset-0 scale-120">
          <Frame size={AVATAR_SIZES[size]?.px} className="absolute inset-0" />
        </div>
      ) : null}
    </>
  );

  const WrapperClass = cn(
    "relative inline-flex overflow-visible",
    sizeClass,
    className,
    rounded ? "rounded-full" : "rounded",
    effects &&
      "transform-gpu transition duration-200 ease-out hover:scale-105 hover:shadow-lg",
  );

  return path ? (
    <Link href={path} className={WrapperClass}>
      {content}
    </Link>
  ) : (
    <div className={WrapperClass}>{content}</div>
  );
}
