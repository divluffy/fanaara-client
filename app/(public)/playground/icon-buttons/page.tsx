// app\(public)\playground\icon-buttons\page.tsx
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { motion } from "framer-motion";
import {
  FiHome,
  FiSearch,
  FiBell,
  FiMail,
  FiUser,
  FiSettings,
  FiMoreHorizontal,
  FiPlus,
  FiHeart,
  FiStar,
  FiBookmark,
  FiMessageCircle,
  FiShare2,
  FiEdit2,
  FiUsers,
  FiLock,
  FiFlag,
  FiSlash,
  FiTrash2,
  FiEye,
  FiZap,
  FiChevronLeft,
  FiChevronRight,
  FiPlay,
  FiPause,
  FiVolume2,
  FiUpload,
  FiImage,
  FiVideo,
  FiMic,
  FiSend,
  FiSmile,
  // extra (عامّة + حالات توثيق)
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
  FiShield,
  FiXCircle,
  FiLink,
  FiCopy,
  FiExternalLink,
  FiGlobe,
  FiShoppingCart,
  FiGift,
  FiCreditCard,
  FiCalendar,
  FiTag,
  FiRefreshCw,
  FiCamera,
} from "react-icons/fi";

import { IconButton, type IconButtonProps } from "@/design/IconButton";
import { cn } from "@/utils";

type Sample = {
  props: Omit<IconButtonProps, "children">;
  icon: ReactNode;
  code: string;
};

const V = {
  card: {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: "easeOut" },
    },
  },
  grid: {
    hidden: {},
    show: { transition: { staggerChildren: 0.035, delayChildren: 0.05 } },
  },
  item: {
    hidden: { opacity: 0, y: 10, scale: 0.985 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.2, ease: "easeOut" },
    },
  },
} as const;

const ICONS = {
  home: { name: "FiHome", node: <FiHome /> },
  search: { name: "FiSearch", node: <FiSearch /> },
  bell: { name: "FiBell", node: <FiBell /> },
  mail: { name: "FiMail", node: <FiMail /> },
  user: { name: "FiUser", node: <FiUser /> },
  settings: { name: "FiSettings", node: <FiSettings /> },
  more: { name: "FiMoreHorizontal", node: <FiMoreHorizontal /> },
  plus: { name: "FiPlus", node: <FiPlus /> },

  heart: { name: "FiHeart", node: <FiHeart /> },
  star: { name: "FiStar", node: <FiStar /> },
  bookmark: { name: "FiBookmark", node: <FiBookmark /> },
  comment: { name: "FiMessageCircle", node: <FiMessageCircle /> },
  share: { name: "FiShare2", node: <FiShare2 /> },

  edit: { name: "FiEdit2", node: <FiEdit2 /> },
  users: { name: "FiUsers", node: <FiUsers /> },
  lock: { name: "FiLock", node: <FiLock /> },
  flag: { name: "FiFlag", node: <FiFlag /> },
  slash: { name: "FiSlash", node: <FiSlash /> },
  trash: { name: "FiTrash2", node: <FiTrash2 /> },
  eye: { name: "FiEye", node: <FiEye /> },
  zap: { name: "FiZap", node: <FiZap /> },

  left: { name: "FiChevronLeft", node: <FiChevronLeft /> },
  right: { name: "FiChevronRight", node: <FiChevronRight /> },

  play: { name: "FiPlay", node: <FiPlay /> },
  pause: { name: "FiPause", node: <FiPause /> },
  volume: { name: "FiVolume2", node: <FiVolume2 /> },

  upload: { name: "FiUpload", node: <FiUpload /> },
  image: { name: "FiImage", node: <FiImage /> },
  video: { name: "FiVideo", node: <FiVideo /> },
  mic: { name: "FiMic", node: <FiMic /> },
  send: { name: "FiSend", node: <FiSend /> },
  smile: { name: "FiSmile", node: <FiSmile /> },

  // status / verified
  verified: { name: "FiCheckCircle", node: <FiCheckCircle /> },
  pending: { name: "FiClock", node: <FiClock /> },
  alert: { name: "FiAlertTriangle", node: <FiAlertTriangle /> },
  shield: { name: "FiShield", node: <FiShield /> },
  banned: { name: "FiXCircle", node: <FiXCircle /> },

  // utility / commerce
  link: { name: "FiLink", node: <FiLink /> },
  copy: { name: "FiCopy", node: <FiCopy /> },
  external: { name: "FiExternalLink", node: <FiExternalLink /> },
  globe: { name: "FiGlobe", node: <FiGlobe /> },
  cart: { name: "FiShoppingCart", node: <FiShoppingCart /> },
  gift: { name: "FiGift", node: <FiGift /> },
  card: { name: "FiCreditCard", node: <FiCreditCard /> },
  calendar: { name: "FiCalendar", node: <FiCalendar /> },
  tag: { name: "FiTag", node: <FiTag /> },
  refresh: { name: "FiRefreshCw", node: <FiRefreshCw /> },
  camera: { name: "FiCamera", node: <FiCamera /> },
} as const;

type IconKey = keyof typeof ICONS;

function propsToJsx(props: Record<string, unknown>) {
  return Object.entries(props)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => {
      if (typeof v === "boolean") return v ? k : `${k}={false}`;
      if (typeof v === "number") return `${k}={${v}}`;
      if (typeof v === "string") return `${k}=${JSON.stringify(v)}`;
      return `${k}={${JSON.stringify(v)}}`;
    })
    .join(" ");
}

function S(
  icon: IconKey,
  aria: string,
  p: Partial<Omit<IconButtonProps, "children" | "aria-label">> = {},
): Sample {
  const { name, node } = ICONS[icon];
  const props = { "aria-label": aria, ...p } as Omit<
    IconButtonProps,
    "children"
  >;
  return {
    props,
    icon: node,
    code: `<IconButton ${propsToJsx(props)}><${name} /></IconButton>`,
  };
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const el = document.createElement("textarea");
      el.value = text;
      el.style.position = "fixed";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.focus();
      el.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(el);
      return ok;
    } catch {
      return false;
    }
  }
}

function Toast({ text }: { text: string }) {
  return (
    <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full border border-border-subtle bg-background-elevated/95 px-4 py-2 text-xs text-foreground shadow-[var(--shadow-md)]">
      {text}
    </div>
  );
}

function CopyBtn({
  sample,
  onCopied,
}: {
  sample: Sample;
  onCopied: (ok: boolean) => void;
}) {
  const onClick = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      onCopied(await copyToClipboard(sample.code));
    },
    [sample.code, onCopied],
  );

  return (
    <IconButton {...sample.props} type="button" onClick={onClick}>
      {sample.icon}
    </IconButton>
  );
}

function Card({
  title,
  subtitle,
  children,
  bodyClassName,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  bodyClassName?: string;
}) {
  return (
    <motion.section
      variants={V.card}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      className="space-y-3 rounded-3xl border border-border-subtle bg-surface p-5 shadow-[var(--shadow-sm)]"
    >
      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-foreground-strong">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-foreground-muted">{subtitle}</p>
        )}
      </div>

      <motion.div
        variants={V.grid}
        className={cn(
          "grid grid-cols-6 gap-3 sm:grid-cols-8 md:grid-cols-12",
          bodyClassName,
        )}
      >
        {children}
      </motion.div>
    </motion.section>
  );
}

function AnimatedSamples({
  samples,
  onCopied,
}: {
  samples: Sample[];
  onCopied: (ok: boolean) => void;
}) {
  return samples.map((s, i) => (
    <motion.div key={i} variants={V.item} className="inline-flex">
      <CopyBtn sample={s} onCopied={onCopied} />
    </motion.div>
  ));
}

// ================== SAMPLES (مختصرة + متنوعة) ==================
const headerSamples: Sample[] = [
  S("home", "Home", { variant: "ghost", tooltip: "الرئيسية" }),
  S("search", "Search", {
    variant: "ghost",
    tooltip: "بحث",
    tooltipPlacement: "bottom",
  }),
  S("bell", "Notifications", {
    tooltip: "الإشعارات",
    badgeCount: 12,
    badgeTone: "danger",
  }),
  S("mail", "Messages", {
    tooltip: "رسائل جديدة",
    showBadgeDot: true,
    badgeTone: "info",
  }),
  S("settings", "Settings", { variant: "outline", tooltip: "الإعدادات" }),
  S("more", "More", { variant: "plain", tooltip: "المزيد" }),
  S("plus", "Create", {
    variant: "gradient",
    gradient: "aurora",
    elevation: "cta",
    tooltip: "إنشاء",
  }),
  S("bell", "Loading", {
    variant: "solid",
    tone: "brand",
    tooltip: "تحميل",
    isLoading: true,
  }),
  S("settings", "Disabled", {
    variant: "outline",
    tooltip: "معطّل",
    disabled: true,
  }),
];

const postSamples: Sample[] = [
  S("heart", "Like", { tooltip: "إعجاب" }),
  S("heart", "Liked", { tone: "danger", tooltip: "تم الإعجاب" }),
  S("star", "Rate", { tone: "warning", tooltip: "تقييم" }),
  S("bookmark", "Save", { tooltip: "حفظ" }),
  S("comment", "Comments", {
    tooltip: "تعليقات",
    badgeCount: 34,
    badgeTone: "info",
  }),
  S("comment", "New comments", {
    tooltip: "تعليقات جديدة",
    showBadgeDot: true,
    badgeTone: "info",
  }),
  S("share", "Share", { tooltip: "مشاركة" }),
  S("more", "More post", {
    variant: "ghost",
    tooltip: "المزيد",
    tooltipPlacement: "bottom",
  }),
];

const profileSamples: Sample[] = [
  S("users", "Followers", {
    tooltip: "المتابعين",
    badgeCount: 99,
    badgeTone: "brand",
  }),
  S("mail", "Message", { tone: "info", tooltip: "رسالة" }),
  S("edit", "Edit", { variant: "outline", tooltip: "تعديل" }),
  S("lock", "Private", { tone: "warning", tooltip: "حساب خاص" }),
  S("flag", "Report", {
    variant: "outline",
    tone: "warning",
    tooltip: "تبليغ",
  }),
  S("slash", "Block", { variant: "solid", tone: "danger", tooltip: "حظر" }),
];

const verifySamples: Sample[] = [
  S("verified", "Verified soft", { tone: "brand", tooltip: "تم التوثيق" }),
  S("verified", "Verified solid", {
    variant: "solid",
    tone: "brand",
    tooltip: "موثّق",
  }),
  S("shield", "Moderator", { tone: "info", tooltip: "مشرف" }),
  S("pending", "Pending", { tone: "warning", tooltip: "قيد المراجعة" }),
  S("alert", "Need verification", {
    variant: "outline",
    tone: "warning",
    tooltip: "بحاجة توثيق",
  }),
  S("banned", "Banned", { variant: "solid", tone: "danger", tooltip: "محظور" }),
];

const utilitySamples: Sample[] = [
  S("link", "Copy link", { variant: "ghost", tooltip: "نسخ الرابط" }),
  S("copy", "Copy", { variant: "soft", tooltip: "نسخ" }),
  S("external", "Open", { variant: "outline", tooltip: "فتح خارجي" }),
  S("globe", "Website", { variant: "soft", tone: "info", tooltip: "الموقع" }),
  S("refresh", "Refresh", { variant: "plain", tooltip: "تحديث" }),
  S("camera", "Camera", { variant: "soft", tooltip: "كاميرا" }),
];

const commerceSamples: Sample[] = [
  S("cart", "Cart", {
    tone: "brand",
    tooltip: "السلة",
    badgeCount: 3,
    badgeTone: "danger",
  }),
  S("gift", "Gift", { variant: "soft", tone: "warning", tooltip: "هدية" }),
  S("card", "Pay", { variant: "outline", tooltip: "الدفع" }),
  S("tag", "Coupon", { variant: "ghost", tooltip: "قسيمة" }),
  S("calendar", "Schedule", { variant: "soft", tooltip: "جدولة" }),
];

const chatSamples: Sample[] = [
  S("smile", "Emoji", { variant: "plain", tooltip: "إيموجي" }),
  S("upload", "Attach", { variant: "plain", tooltip: "مرفق" }),
  S("image", "Photo", { variant: "plain", tooltip: "صورة" }),
  S("video", "Video", { variant: "plain", tooltip: "فيديو" }),
  S("mic", "Voice", { variant: "plain", tooltip: "تسجيل" }),
  S("send", "Send", {
    variant: "solid",
    tone: "brand",
    tooltip: "إرسال",
    tooltipPlacement: "bottom",
  }),
  S("send", "Sending", {
    variant: "solid",
    tone: "brand",
    tooltip: "جاري الإرسال",
    isLoading: true,
  }),
];

const sizes: IconButtonProps["size"][] = ["xs", "sm", "md", "lg"];
const shapes: IconButtonProps["shape"][] = ["circle", "rounded", "square"];

const sizeShapeSamples: Sample[] = sizes.flatMap((size) =>
  shapes.map((shape) =>
    S("bell", `Size ${size} ${shape}`, {
      size,
      shape,
      variant: "soft",
      tooltip: `${size} • ${shape}`,
    }),
  ),
);

const badgePlacementSamples: Sample[] = (
  [
    "top-right",
    "top-left",
    "bottom-right",
    "bottom-left",
    "left",
    "right",
    "top",
    "bottom",
  ] as const
).map((placement) =>
  S("bell", `badge ${placement}`, {
    tooltip: placement,
    badgeCount: 7,
    badgeTone: "danger",
    badgePlacement: placement,
  }),
);

const overlayDarkSamples: Sample[] = [
  S("left", "Back", {
    variant: "plain",
    tooltip: "رجوع",
    iconClassName: "text-white",
  }),
  S("right", "Next", {
    variant: "plain",
    tooltip: "التالي",
    iconClassName: "text-white",
  }),
  S("play", "Play", { variant: "inverse", tooltip: "تشغيل" }),
  S("pause", "Pause", { variant: "inverse", tooltip: "إيقاف" }),
  S("volume", "Volume", { variant: "inverse", tooltip: "الصوت" }),
  S("upload", "Upload", { variant: "inverse", tooltip: "رفع" }),
];

const imageBgSamples: Sample[] = [
  S("more", "Plain white", {
    variant: "plain",
    iconClassName: "text-white",
    tooltip: "plain",
  }),
  S("bell", "Inverse", { variant: "inverse", tooltip: "inverse" }),
  S("verified", "Glass", { variant: "glass", tooltip: "glass" }),
  S("link", "Outline", {
    variant: "outline",
    tone: "neutral",
    tooltip: "outline",
  }),
  S("heart", "Soft brand", { variant: "soft", tone: "brand", tooltip: "soft" }),
  S("trash", "Solid danger", {
    variant: "solid",
    tone: "danger",
    tooltip: "solid",
  }),
  S("plus", "Gradient CTA", {
    variant: "gradient",
    gradient: "aurora",
    elevation: "cta",
    tooltip: "CTA",
  }),
];

export default function IconButtonsExamplesPage() {
  const [toast, setToast] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  const onCopied = useCallback((ok: boolean) => {
    setToast(ok ? "✅ تم نسخ الكود" : "❌ فشل النسخ");
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setToast(null), 1100);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-lg font-semibold text-foreground-strong">
            IconButton Examples
          </h1>
          <p className="text-sm text-foreground-muted">
            اضغط على أي أيقونة لنسخ كودها ✅ — مع Animation عند الظهور + Tooltip
            متمركز فوق/تحت.
          </p>
        </header>

        <div className="grid gap-6">
          <Card
            title="Header / Navbar"
            subtitle="تنقّل + إشعارات + loading/disabled + CTA"
          >
            <AnimatedSamples samples={headerSamples} onCopied={onCopied} />
          </Card>

          <Card
            title="Feed / Post Actions"
            subtitle="inactive/active + count/dot + مشاركة"
          >
            <AnimatedSamples samples={postSamples} onCopied={onCopied} />
          </Card>

          <Card
            title="Profile Actions"
            subtitle="رسالة/تعديل/متابعين + أمان (تبليغ/حظر)"
          >
            <AnimatedSamples samples={profileSamples} onCopied={onCopied} />
          </Card>

          <Card
            title="Verification / Status"
            subtitle="أمثلة كثيرة لنفس السيناريو: موثّق/معلق/بحاجة توثيق/محظور/مشرف"
          >
            <AnimatedSamples samples={verifySamples} onCopied={onCopied} />
          </Card>

          <Card
            title="Utility / Links"
            subtitle="روابط + نسخ + فتح خارجي + تحديث"
          >
            <AnimatedSamples samples={utilitySamples} onCopied={onCopied} />
          </Card>

          <Card title="Commerce" subtitle="سلة + هدية + دفع + كوبون + جدولة">
            <AnimatedSamples samples={commerceSamples} onCopied={onCopied} />
          </Card>

          <Card
            title="Chat / Messaging"
            subtitle="plain حول الإدخال + إرسال (loading)"
          >
            <AnimatedSamples samples={chatSamples} onCopied={onCopied} />
          </Card>

          <Card
            title="Sizes & Shapes"
            subtitle="xs/sm/md/lg + circle/rounded/square (أمثلة تولد تلقائياً)"
          >
            <AnimatedSamples samples={sizeShapeSamples} onCopied={onCopied} />
          </Card>

          <Card
            title="Badges Placement"
            subtitle="كل اتجاهات الـ badge على نفس الزر"
          >
            <AnimatedSamples
              samples={badgePlacementSamples}
              onCopied={onCopied}
            />
          </Card>

          <Card
            title="Overlay / Dark"
            subtitle='plain + iconClassName="text-white" و variant="inverse" على خلفية داكنة'
            bodyClassName="rounded-2xl bg-black/90 p-4"
          >
            <AnimatedSamples samples={overlayDarkSamples} onCopied={onCopied} />
          </Card>

          <Card
            title="Image Background Showcase"
            subtitle="خلفية صورة + أيقونات بدرجات مختلفة + بدون خلفية"
          >
            <motion.div
              variants={V.item}
              className="col-span-full overflow-hidden rounded-2xl border border-border-subtle"
            >
              <div className="relative">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url(https://images3.alphacoders.com/132/thumbbig-1323165.webp)",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/55" />
                <div className="relative z-10 p-4">
                  <motion.div
                    variants={V.grid}
                    className="grid grid-cols-6 gap-3 sm:grid-cols-8 md:grid-cols-12"
                  >
                    <AnimatedSamples
                      samples={imageBgSamples}
                      onCopied={onCopied}
                    />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </Card>
        </div>

        {toast && <Toast text={toast} />}
      </div>
    </main>
  );
}
