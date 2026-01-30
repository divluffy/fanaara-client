// app/(public)/playground/button/page.tsx
"use client";

import type { ReactNode } from "react";
import {
  FiHome,
  FiSearch,
  FiBell,
  FiMail,
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
  FiPlay,
  FiPause,
  FiVolume2,
  FiUpload,
  FiImage,
  FiVideo,
  FiMic,
  FiSend,
  FiSmile,
  FiArrowLeft,
  FiArrowRight,
  FiLogIn,
  FiDownload,
  FiCheck,
} from "react-icons/fi";

import { Button } from "@/design/DeButton";
import { CopyWrap, Toast, useCopyToast } from "../_shared/copy";
import { useAppSelector } from "@/store/hooks";

function Section({
  title,
  subtitle,
  children,
  bodyClassName,
  layout = "grid",
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  bodyClassName?: string;
  layout?: "grid" | "row";
}) {
  return (
    <section className="space-y-3 rounded-3xl border border-border-subtle bg-surface p-5 shadow-[var(--shadow-sm)]">
      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-foreground-strong">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-foreground-muted">{subtitle}</p>
        )}
      </div>

      <div
        className={cn(
          layout === "grid"
            ? "grid grid-cols-6 gap-3 sm:grid-cols-8 md:grid-cols-12"
            : "flex flex-wrap items-center gap-3",
          bodyClassName,
        )}
      >
        {children}
      </div>
    </section>
  );
}

function C({
  code,
  onCopied,
  children,
}: {
  code: string;
  onCopied: (ok: boolean) => void;
  children: ReactNode;
}) {
  return (
    <CopyWrap code={code} onCopied={onCopied}>
      {children}
    </CopyWrap>
  );
}

// local cn to avoid extra import in snippet (remove if you already have cn in scope)
function cn(...v: Array<string | undefined | false | null>) {
  return v.filter(Boolean).join(" ");
}

export default function UnifiedButtonsExamplesPage() {
  const { isRTL } = useAppSelector(({ state }) => state);
  const dir: "rtl" | "ltr" = isRTL ? "rtl" : "ltr";

  const ArrowEnd = isRTL ? FiArrowLeft : FiArrowRight;
  const ArrowStart = isRTL ? FiArrowRight : FiArrowLeft;

  const ArrowEndName = isRTL ? "FiArrowLeft" : "FiArrowRight";
  const ArrowStartName = isRTL ? "FiArrowRight" : "FiArrowLeft";

  const { toast, show } = useCopyToast(1200);

  return (
    <main dir={dir} className="min-h-screen bg-background text-foreground p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-lg font-semibold text-foreground-strong">
            Unified Button Examples
          </h1>
          <p className="text-sm text-foreground-muted">
            مكوّن واحد يغطي: Button + IconButton ✅ — اضغط على أي زر لنسخ JSX.
          </p>
        </header>

        <div className="grid gap-6">
          {/* ================= Quick Start ================= */}
          <Section
            title="Quick Start"
            subtitle="أكثر 3 حالات عملية: CTA / Icon-only / Secondary"
            layout="row"
          >
            <C
              onCopied={show}
              code={`<Button tone="brand" variant="solid" leftIcon={<FiPlus />} rightIcon={<${ArrowEndName} />}>ابدأ الآن</Button>`}
            >
              <Button
                tone="brand"
                variant="solid"
                leftIcon={<FiPlus />}
                rightIcon={<ArrowEnd />}
              >
                ابدأ الآن
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="Notifications" variant="ghost" tooltip="الإشعارات" badgeCount={12} badgeTone="danger"><FiBell /></Button>`}
            >
              <Button
                iconOnly
                aria-label="Notifications"
                variant="ghost"
                tooltip="الإشعارات"
                badgeCount={12}
                badgeTone="danger"
              >
                <FiBell />
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button variant="soft" tone="neutral" leftIcon={<FiSearch />}>بحث</Button>`}
            >
              <Button variant="soft" tone="neutral" leftIcon={<FiSearch />}>
                بحث
              </Button>
            </C>
          </Section>

          {/* ================= Header / Navbar ================= */}
          <Section
            title="Header / Navbar"
            subtitle="ghost/plain + tooltip + badge + loading + disabled + gradient CTA"
          >
            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="Home" variant="ghost" tooltip="الرئيسية"><FiHome /></Button>`}
            >
              <Button
                iconOnly
                aria-label="Home"
                variant="ghost"
                tooltip="الرئيسية"
              >
                <FiHome />
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="Search" variant="ghost" tooltip="بحث" tooltipPlacement="bottom"><FiSearch /></Button>`}
            >
              <Button
                iconOnly
                aria-label="Search"
                variant="ghost"
                tooltip="بحث"
                tooltipPlacement="bottom"
              >
                <FiSearch />
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="Notifications" tooltip="الإشعارات" badgeCount={12} badgeTone="danger"><FiBell /></Button>`}
            >
              <Button
                iconOnly
                aria-label="Notifications"
                tooltip="الإشعارات"
                badgeCount={12}
                badgeTone="danger"
              >
                <FiBell />
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="Messages" tooltip="رسائل جديدة" showBadgeDot badgeTone="info"><FiMail /></Button>`}
            >
              <Button
                iconOnly
                aria-label="Messages"
                tooltip="رسائل جديدة"
                showBadgeDot
                badgeTone="info"
              >
                <FiMail />
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="Settings" variant="outline" tooltip="الإعدادات"><FiSettings /></Button>`}
            >
              <Button
                iconOnly
                aria-label="Settings"
                variant="outline"
                tooltip="الإعدادات"
              >
                <FiSettings />
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="More" variant="plain" tooltip="المزيد"><FiMoreHorizontal /></Button>`}
            >
              <Button
                iconOnly
                aria-label="More"
                variant="plain"
                tooltip="المزيد"
              >
                <FiMoreHorizontal />
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="Create" variant="gradient" gradient="aurora" elevation="cta" tooltip="إنشاء"><FiPlus /></Button>`}
            >
              <Button
                iconOnly
                aria-label="Create"
                variant="gradient"
                gradient="aurora"
                elevation="cta"
                tooltip="إنشاء"
              >
                <FiPlus />
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="Loading" variant="solid" tone="brand" tooltip="تحميل" isLoading><FiBell /></Button>`}
            >
              <Button
                iconOnly
                aria-label="Loading"
                variant="solid"
                tone="brand"
                tooltip="تحميل"
                isLoading
              >
                <FiBell />
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="Disabled" variant="outline" tooltip="معطّل" disabled><FiSettings /></Button>`}
            >
              <Button
                iconOnly
                aria-label="Disabled"
                variant="outline"
                tooltip="معطّل"
                disabled
              >
                <FiSettings />
              </Button>
            </C>
          </Section>

          {/* ================= Variants ================= */}
          <Section
            title="All Variants"
            subtitle="Regular + Icon-only لكل variant"
            layout="row"
          >
            {(
              [
                "solid",
                "soft",
                "outline",
                "ghost",
                "glass",
                "gradient",
                "plain",
              ] as const
            ).map((v) => (
              <C
                key={v}
                onCopied={show}
                code={
                  v === "gradient"
                    ? `<Button variant="gradient" gradient="violet">gradient</Button>`
                    : `<Button variant="${v}" tone="brand">${v}</Button>`
                }
              >
                <Button
                  variant={v === "gradient" ? "gradient" : (v as any)}
                  gradient={v === "gradient" ? "violet" : undefined}
                  tone="brand"
                  leftIcon={<FiStar />}
                >
                  {v}
                </Button>
              </C>
            ))}

            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="inverse" variant="inverse" tooltip="inverse"><FiPlay /></Button>`}
            >
              <Button
                iconOnly
                aria-label="inverse"
                variant="inverse"
                tooltip="inverse"
              >
                <FiPlay />
              </Button>
            </C>
          </Section>

          {/* ================= Tones ================= */}
          <Section
            title="All Tones"
            subtitle="solid + leftIcon (منصة اجتماعية: brand/neutral/semantic + extra tones)"
            layout="row"
          >
            {(
              [
                "brand",
                "neutral",
                "success",
                "danger",
                "warning",
                "info",
                "purple",
                "pink",
                "lime",
                "cyan",
              ] as const
            ).map((t) => (
              <C
                key={t}
                onCopied={show}
                code={`<Button variant="solid" tone="${t}" leftIcon={<FiPlus />}>${t}</Button>`}
              >
                <Button variant="solid" tone={t} leftIcon={<FiPlus />}>
                  {t}
                </Button>
              </C>
            ))}
          </Section>

          {/* ================= Sizes & Shapes ================= */}
          <Section
            title="Sizes (Regular + Icon-only)"
            subtitle="xs/sm/md/lg/xl"
            layout="row"
          >
            {(["xs", "sm", "md", "lg", "xl"] as const).map((s) => (
              <C
                key={s}
                onCopied={show}
                code={`<Button variant="soft" tone="neutral" size="${s}">size ${s}</Button>`}
              >
                <Button variant="soft" tone="neutral" size={s}>
                  size {s}
                </Button>
              </C>
            ))}

            {(["xs", "sm", "md", "lg", "xl"] as const).map((s) => (
              <C
                key={`i-${s}`}
                onCopied={show}
                code={`<Button iconOnly aria-label="${s}" size="${s}" variant="soft" tooltip="${s}"><FiBell /></Button>`}
              >
                <Button
                  iconOnly
                  aria-label={s}
                  size={s}
                  variant="soft"
                  tooltip={s}
                >
                  <FiBell />
                </Button>
              </C>
            ))}
          </Section>

          <Section
            title="Shapes"
            subtitle="rounded / pill / square + icon-only circle/rounded/square"
            layout="row"
          >
            <C
              onCopied={show}
              code={`<Button variant="outline" tone="brand" shape="rounded">rounded</Button>`}
            >
              <Button variant="outline" tone="brand" shape="rounded">
                rounded
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button variant="outline" tone="brand" shape="pill">pill</Button>`}
            >
              <Button variant="outline" tone="brand" shape="pill">
                pill
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button variant="outline" tone="brand" shape="square">square</Button>`}
            >
              <Button variant="outline" tone="brand" shape="square">
                square
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="circle" shape="circle" tooltip="circle"><FiStar /></Button>`}
            >
              <Button
                iconOnly
                aria-label="circle"
                shape="circle"
                tooltip="circle"
              >
                <FiStar />
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="rounded" shape="rounded" tooltip="rounded"><FiStar /></Button>`}
            >
              <Button
                iconOnly
                aria-label="rounded"
                shape="rounded"
                tooltip="rounded"
              >
                <FiStar />
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="square" shape="square" tooltip="square"><FiStar /></Button>`}
            >
              <Button
                iconOnly
                aria-label="square"
                shape="square"
                tooltip="square"
              >
                <FiStar />
              </Button>
            </C>
          </Section>

          {/* ================= Elevations ================= */}
          <Section
            title="Elevations"
            subtitle="solid + tone=brand"
            layout="row"
          >
            {(["none", "soft", "medium", "strong", "glow", "cta"] as const).map(
              (e) => (
                <C
                  key={e}
                  onCopied={show}
                  code={`<Button variant="solid" tone="brand" elevation="${e}">${e}</Button>`}
                >
                  <Button variant="solid" tone="brand" elevation={e}>
                    {e}
                  </Button>
                </C>
              ),
            )}
          </Section>

          {/* ================= RTL/LTR icon logic ================= */}
          <Section
            title="RTL / LTR (Start/End icons)"
            subtitle="أسهم تتبدّل حسب الاتجاه"
            layout="row"
          >
            <C
              onCopied={show}
              code={`<Button tone="brand" variant="solid" leftIcon={<FiLogIn />}>تسجيل الدخول</Button>`}
            >
              <Button tone="brand" variant="solid" leftIcon={<FiLogIn />}>
                تسجيل الدخول
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button tone="brand" variant="solid" rightIcon={<${ArrowEndName} />}>التالي</Button>`}
            >
              <Button tone="brand" variant="solid" rightIcon={<ArrowEnd />}>
                التالي
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button tone="neutral" variant="ghost" leftIcon={<${ArrowStartName} />}>رجوع</Button>`}
            >
              <Button tone="neutral" variant="ghost" leftIcon={<ArrowStart />}>
                رجوع
              </Button>
            </C>
          </Section>

          {/* ================= States ================= */}
          <Section
            title="States"
            subtitle="disabled / loading / fullWidth / long content"
            layout="row"
          >
            <C
              onCopied={show}
              code={`<Button tone="neutral" variant="outline" disabled>Disabled</Button>`}
            >
              <Button tone="neutral" variant="outline" disabled>
                Disabled
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button tone="brand" variant="solid" isLoading loadingText="جاري التنزيل..." leftIcon={<FiDownload />}>تنزيل</Button>`}
            >
              <Button
                tone="brand"
                variant="solid"
                isLoading
                loadingText="جاري التنزيل..."
                leftIcon={<FiDownload />}
              >
                تنزيل
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button tone="danger" variant="solid" leftIcon={<FiTrash2 />}>حذف</Button>`}
            >
              <Button tone="danger" variant="solid" leftIcon={<FiTrash2 />}>
                حذف
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button variant="gradient" gradient="aurora" elevation="cta" fullWidth>CTA Full width</Button>`}
            >
              <div className="w-full max-w-sm">
                <Button
                  variant="gradient"
                  gradient="aurora"
                  elevation="cta"
                  fullWidth
                >
                  CTA Full width
                </Button>
              </div>
            </C>

            <C
              onCopied={show}
              code={`<Button tone="brand" variant="soft" size="xl">زر طويل جداً لتجربة المساحات والـ layout داخل التصميم</Button>`}
            >
              <Button tone="brand" variant="soft" size="xl">
                زر طويل جداً لتجربة المساحات والـ layout داخل التصميم
              </Button>
            </C>
          </Section>

          {/* ================= Feed / Post Actions ================= */}
          <Section
            title="Feed / Post Actions"
            subtitle="أزرار أيقونات: إعجاب/حفظ/تعليقات/مشاركة"
          >
            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="Like" tooltip="إعجاب"><FiHeart /></Button>`}
            >
              <Button iconOnly aria-label="Like" tooltip="إعجاب">
                <FiHeart />
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="Liked" tone="danger" tooltip="تم الإعجاب"><FiHeart /></Button>`}
            >
              <Button
                iconOnly
                aria-label="Liked"
                tone="danger"
                tooltip="تم الإعجاب"
              >
                <FiHeart />
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="Save" tooltip="حفظ"><FiBookmark /></Button>`}
            >
              <Button iconOnly aria-label="Save" tooltip="حفظ">
                <FiBookmark />
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="Comments" tooltip="تعليقات" badgeCount={34} badgeTone="info"><FiMessageCircle /></Button>`}
            >
              <Button
                iconOnly
                aria-label="Comments"
                tooltip="تعليقات"
                badgeCount={34}
                badgeTone="info"
              >
                <FiMessageCircle />
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="New comments" tooltip="تعليقات جديدة" showBadgeDot badgeTone="info"><FiMessageCircle /></Button>`}
            >
              <Button
                iconOnly
                aria-label="New comments"
                tooltip="تعليقات جديدة"
                showBadgeDot
                badgeTone="info"
              >
                <FiMessageCircle />
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="Share" tooltip="مشاركة"><FiShare2 /></Button>`}
            >
              <Button iconOnly aria-label="Share" tooltip="مشاركة">
                <FiShare2 />
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="More" variant="ghost" tooltip="المزيد" tooltipPlacement="bottom"><FiMoreHorizontal /></Button>`}
            >
              <Button
                iconOnly
                aria-label="More"
                variant="ghost"
                tooltip="المزيد"
                tooltipPlacement="bottom"
              >
                <FiMoreHorizontal />
              </Button>
            </C>
          </Section>

          {/* ================= Profile / Moderation ================= */}
          <Section
            title="Profile / Moderation"
            subtitle="متابعة/رسالة/تعديل + تبليغ/حظر"
          >
            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="Followers" tooltip="المتابعين" badgeCount={99} badgeTone="brand"><FiUsers /></Button>`}
            >
              <Button
                iconOnly
                aria-label="Followers"
                tooltip="المتابعين"
                badgeCount={99}
                badgeTone="brand"
              >
                <FiUsers />
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button tone="info" variant="soft" leftIcon={<FiMail />}>رسالة</Button>`}
            >
              <Button tone="info" variant="soft" leftIcon={<FiMail />}>
                رسالة
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button variant="outline" leftIcon={<FiEdit2 />}>تعديل</Button>`}
            >
              <Button variant="outline" leftIcon={<FiEdit2 />}>
                تعديل
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="Private" tone="warning" tooltip="حساب خاص"><FiLock /></Button>`}
            >
              <Button
                iconOnly
                aria-label="Private"
                tone="warning"
                tooltip="حساب خاص"
              >
                <FiLock />
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="Report" variant="outline" tone="warning" tooltip="تبليغ"><FiFlag /></Button>`}
            >
              <Button
                iconOnly
                aria-label="Report"
                variant="outline"
                tone="warning"
                tooltip="تبليغ"
              >
                <FiFlag />
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button tone="danger" variant="solid" leftIcon={<FiSlash />}>حظر</Button>`}
            >
              <Button tone="danger" variant="solid" leftIcon={<FiSlash />}>
                حظر
              </Button>
            </C>
          </Section>

          {/* ================= Verification / Status ================= */}
          <Section
            title="Verification / Status"
            subtitle="موثّق/معلّق/بحاجة توثيق/محظور/مشرف"
          >
            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="Verified" tone="brand" tooltip="تم التوثيق"><FiCheckCircle /></Button>`}
            >
              <Button
                iconOnly
                aria-label="Verified"
                tone="brand"
                tooltip="تم التوثيق"
              >
                <FiCheckCircle />
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="Moderator" tone="info" tooltip="مشرف"><FiShield /></Button>`}
            >
              <Button
                iconOnly
                aria-label="Moderator"
                tone="info"
                tooltip="مشرف"
              >
                <FiShield />
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="Pending" tone="warning" tooltip="قيد المراجعة"><FiClock /></Button>`}
            >
              <Button
                iconOnly
                aria-label="Pending"
                tone="warning"
                tooltip="قيد المراجعة"
              >
                <FiClock />
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="Need verification" variant="outline" tone="warning" tooltip="بحاجة توثيق"><FiAlertTriangle /></Button>`}
            >
              <Button
                iconOnly
                aria-label="Need verification"
                variant="outline"
                tone="warning"
                tooltip="بحاجة توثيق"
              >
                <FiAlertTriangle />
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="Banned" variant="solid" tone="danger" tooltip="محظور"><FiXCircle /></Button>`}
            >
              <Button
                iconOnly
                aria-label="Banned"
                variant="solid"
                tone="danger"
                tooltip="محظور"
              >
                <FiXCircle />
              </Button>
            </C>
          </Section>

          {/* ================= Utility / Links ================= */}
          <Section title="Utility / Links" subtitle="نسخ/روابط/فتح خارجي/تحديث">
            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="Copy link" variant="ghost" tooltip="نسخ الرابط"><FiLink /></Button>`}
            >
              <Button
                iconOnly
                aria-label="Copy link"
                variant="ghost"
                tooltip="نسخ الرابط"
              >
                <FiLink />
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="Copy" variant="soft" tooltip="نسخ" tooltipPlacement="bottom"><FiCopy /></Button>`}
            >
              <Button
                iconOnly
                aria-label="Copy"
                variant="soft"
                tooltip="نسخ"
                tooltipPlacement="bottom"
              >
                <FiCopy />
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="Open" variant="outline" tooltip="فتح خارجي"><FiExternalLink /></Button>`}
            >
              <Button
                iconOnly
                aria-label="Open"
                variant="outline"
                tooltip="فتح خارجي"
              >
                <FiExternalLink />
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="Website" variant="soft" tone="info" tooltip="الموقع"><FiGlobe /></Button>`}
            >
              <Button
                iconOnly
                aria-label="Website"
                variant="soft"
                tone="info"
                tooltip="الموقع"
              >
                <FiGlobe />
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="Refresh" variant="plain" tooltip="تحديث"><FiRefreshCw /></Button>`}
            >
              <Button
                iconOnly
                aria-label="Refresh"
                variant="plain"
                tooltip="تحديث"
              >
                <FiRefreshCw />
              </Button>
            </C>
          </Section>

          {/* ================= Commerce ================= */}
          <Section
            title="Commerce"
            subtitle="سلة/هدية/دفع/كوبون/جدولة + badgeAnchor"
          >
            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="Cart" tone="brand" tooltip="السلة" badgeCount={3} badgeTone="danger"><FiShoppingCart /></Button>`}
            >
              <Button
                iconOnly
                aria-label="Cart"
                tone="brand"
                tooltip="السلة"
                badgeCount={3}
                badgeTone="danger"
              >
                <FiShoppingCart />
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button variant="soft" tone="warning" leftIcon={<FiGift />}>هدية</Button>`}
            >
              <Button variant="soft" tone="warning" leftIcon={<FiGift />}>
                هدية
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button variant="outline" leftIcon={<FiCreditCard />}>الدفع</Button>`}
            >
              <Button variant="outline" leftIcon={<FiCreditCard />}>
                الدفع
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="Coupon" variant="ghost" tooltip="قسيمة"><FiTag /></Button>`}
            >
              <Button
                iconOnly
                aria-label="Coupon"
                variant="ghost"
                tooltip="قسيمة"
              >
                <FiTag />
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="Schedule" variant="soft" tooltip="جدولة"><FiCalendar /></Button>`}
            >
              <Button
                iconOnly
                aria-label="Schedule"
                variant="soft"
                tooltip="جدولة"
              >
                <FiCalendar />
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="Cart badge on button" tone="brand" tooltip="badge على الزر" badgeCount={8} badgeTone="danger" badgeAnchor="button"><FiShoppingCart /></Button>`}
            >
              <Button
                iconOnly
                aria-label="Cart badge on button"
                tone="brand"
                tooltip="badge على الزر"
                badgeCount={8}
                badgeTone="danger"
                badgeAnchor="button"
              >
                <FiShoppingCart />
              </Button>
            </C>
          </Section>

          {/* ================= Chat composer ================= */}
          <Section
            title="Chat / Composer"
            subtitle="plain حول الإدخال + إرسال (loading) + media"
          >
            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="Emoji" variant="plain" tooltip="إيموجي"><FiSmile /></Button>`}
            >
              <Button
                iconOnly
                aria-label="Emoji"
                variant="plain"
                tooltip="إيموجي"
              >
                <FiSmile />
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="Attach" variant="plain" tooltip="مرفق"><FiUpload /></Button>`}
            >
              <Button
                iconOnly
                aria-label="Attach"
                variant="plain"
                tooltip="مرفق"
              >
                <FiUpload />
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="Photo" variant="plain" tooltip="صورة"><FiImage /></Button>`}
            >
              <Button
                iconOnly
                aria-label="Photo"
                variant="plain"
                tooltip="صورة"
              >
                <FiImage />
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="Video" variant="plain" tooltip="فيديو"><FiVideo /></Button>`}
            >
              <Button
                iconOnly
                aria-label="Video"
                variant="plain"
                tooltip="فيديو"
              >
                <FiVideo />
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="Voice" variant="plain" tooltip="تسجيل"><FiMic /></Button>`}
            >
              <Button
                iconOnly
                aria-label="Voice"
                variant="plain"
                tooltip="تسجيل"
              >
                <FiMic />
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="Send" variant="solid" tone="brand" tooltip="إرسال" tooltipPlacement="bottom"><FiSend /></Button>`}
            >
              <Button
                iconOnly
                aria-label="Send"
                variant="solid"
                tone="brand"
                tooltip="إرسال"
                tooltipPlacement="bottom"
              >
                <FiSend />
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="Sending" variant="solid" tone="brand" tooltip="جاري الإرسال" isLoading><FiSend /></Button>`}
            >
              <Button
                iconOnly
                aria-label="Sending"
                variant="solid"
                tone="brand"
                tooltip="جاري الإرسال"
                isLoading
              >
                <FiSend />
              </Button>
            </C>
          </Section>

          {/* ================= Badge Placement (RTL-safe + legacy) ================= */}
          <Section
            title="Badges Placement"
            subtitle="Direction-aware + legacy + offset"
          >
            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="top-end" tooltip="top-end" badgeCount={7} badgeTone="danger" badgePlacement="top-end"><FiBell /></Button>`}
            >
              <Button
                iconOnly
                aria-label="top-end"
                tooltip="top-end"
                badgeCount={7}
                badgeTone="danger"
                badgePlacement="top-end"
              >
                <FiBell />
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="top-start" tooltip="top-start" badgeCount={7} badgeTone="danger" badgePlacement="top-start"><FiBell /></Button>`}
            >
              <Button
                iconOnly
                aria-label="top-start"
                tooltip="top-start"
                badgeCount={7}
                badgeTone="danger"
                badgePlacement="top-start"
              >
                <FiBell />
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="bottom-end" tooltip="bottom-end" badgeCount={7} badgeTone="danger" badgePlacement="bottom-end"><FiBell /></Button>`}
            >
              <Button
                iconOnly
                aria-label="bottom-end"
                tooltip="bottom-end"
                badgeCount={7}
                badgeTone="danger"
                badgePlacement="bottom-end"
              >
                <FiBell />
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="bottom-start" tooltip="bottom-start" badgeCount={7} badgeTone="danger" badgePlacement="bottom-start"><FiBell /></Button>`}
            >
              <Button
                iconOnly
                aria-label="bottom-start"
                tooltip="bottom-start"
                badgeCount={7}
                badgeTone="danger"
                badgePlacement="bottom-start"
              >
                <FiBell />
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="start" tooltip="start" badgeCount={7} badgeTone="danger" badgePlacement="start"><FiBell /></Button>`}
            >
              <Button
                iconOnly
                aria-label="start"
                tooltip="start"
                badgeCount={7}
                badgeTone="danger"
                badgePlacement="start"
              >
                <FiBell />
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="end" tooltip="end" badgeCount={7} badgeTone="danger" badgePlacement="end"><FiBell /></Button>`}
            >
              <Button
                iconOnly
                aria-label="end"
                tooltip="end"
                badgeCount={7}
                badgeTone="danger"
                badgePlacement="end"
              >
                <FiBell />
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="offset" tooltip="offset +2/-2" badgeCount={7} badgeTone="danger" badgePlacement="top-end" badgeOffset={{x:2,y:-2}}><FiBell /></Button>`}
            >
              <Button
                iconOnly
                aria-label="offset"
                tooltip="offset +2/-2"
                badgeCount={7}
                badgeTone="danger"
                badgePlacement="top-end"
                badgeOffset={{ x: 2, y: -2 }}
              >
                <FiBell />
              </Button>
            </C>
          </Section>

          {/* ================= Segmented Controls ================= */}
          <Section
            title="Segmented Controls (Group)"
            subtitle='استخدم group="start/middle/end" — ممتاز للفلاتر والتبديل'
            layout="row"
          >
            <C
              onCopied={show}
              code={`<Button group="start" variant="outline" tone="neutral">All</Button>`}
            >
              <div className="inline-flex">
                <Button group="start" variant="outline" tone="neutral">
                  All
                </Button>
                <Button group="middle" variant="outline" tone="neutral">
                  Anime
                </Button>
                <Button group="end" variant="outline" tone="neutral">
                  Manga
                </Button>
              </div>
            </C>

            <C
              onCopied={show}
              code={`<Button iconOnly group="start" aria-label="list" variant="soft"><FiMoreHorizontal /></Button>`}
            >
              <div className="inline-flex">
                <Button
                  iconOnly
                  group="start"
                  aria-label="list"
                  variant="soft"
                  tooltip="List"
                >
                  <FiMoreHorizontal />
                </Button>
                <Button
                  iconOnly
                  group="middle"
                  aria-label="grid"
                  variant="soft"
                  tooltip="Grid"
                >
                  <FiStar />
                </Button>
                <Button
                  iconOnly
                  group="end"
                  aria-label="compact"
                  variant="soft"
                  tooltip="Compact"
                >
                  <FiBookmark />
                </Button>
              </div>
            </C>
          </Section>

          {/* ================= Overlay / Dark ================= */}
          <Section
            title="Overlay / Media Controls"
            subtitle='variant="inverse" + plain icon coloring'
            bodyClassName="rounded-2xl bg-black/90 p-4"
          >
            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="Play" variant="inverse" tooltip="تشغيل"><FiPlay /></Button>`}
            >
              <Button
                iconOnly
                aria-label="Play"
                variant="inverse"
                tooltip="تشغيل"
              >
                <FiPlay />
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="Pause" variant="inverse" tooltip="إيقاف"><FiPause /></Button>`}
            >
              <Button
                iconOnly
                aria-label="Pause"
                variant="inverse"
                tooltip="إيقاف"
              >
                <FiPause />
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="Volume" variant="inverse" tooltip="الصوت"><FiVolume2 /></Button>`}
            >
              <Button
                iconOnly
                aria-label="Volume"
                variant="inverse"
                tooltip="الصوت"
              >
                <FiVolume2 />
              </Button>
            </C>

            <C
              onCopied={show}
              code={`<Button iconOnly aria-label="Plain" variant="plain" iconClassName="text-white" tooltip="plain"><FiMoreHorizontal /></Button>`}
            >
              <Button
                iconOnly
                aria-label="Plain"
                variant="plain"
                iconClassName="text-white"
                tooltip="plain"
              >
                <FiMoreHorizontal />
              </Button>
            </C>
          </Section>
        </div>

        {toast && <Toast text={toast} />}
      </div>
    </main>
  );
}
