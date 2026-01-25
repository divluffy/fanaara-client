// app/(public)/playground/icon-buttons/page.tsx
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
} from "react-icons/fi";

import { IconButton } from "@/design/IconButton";
import { CopyWrap, Toast, useCopyToast } from "../_shared/copy";


function Section({
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
        className={
          "grid grid-cols-6 gap-3 sm:grid-cols-8 md:grid-cols-12 " +
          (bodyClassName ?? "")
        }
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

export default function IconButtonsExamplesPage() {
  const { toast, show } = useCopyToast(1100);

  return (
    <main className="min-h-screen bg-background text-foreground p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-lg font-semibold text-foreground-strong">
            IconButton Examples
          </h1>
          <p className="text-sm text-foreground-muted">
            اضغط على أي زر لنسخ الكود ✅ — أمثلة كثيرة تغطي كل props.
          </p>
        </header>

        <div className="grid gap-6">
          {/* ================= Header / Navbar ================= */}
          <Section
            title="Header / Navbar"
            subtitle="ghost/plain + tooltip + badge + loading + disabled + gradient CTA"
          >
            <C
              onCopied={show}
              code={`<IconButton aria-label="Home" variant="ghost" tooltip="الرئيسية"><FiHome /></IconButton>`}
            >
              <IconButton aria-label="Home" variant="ghost" tooltip="الرئيسية">
                <FiHome />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Search" variant="ghost" tooltip="بحث" tooltipPlacement="bottom"><FiSearch /></IconButton>`}
            >
              <IconButton
                aria-label="Search"
                variant="ghost"
                tooltip="بحث"
                tooltipPlacement="bottom"
              >
                <FiSearch />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Notifications" tooltip="الإشعارات" badgeCount={12} badgeTone="danger"><FiBell /></IconButton>`}
            >
              <IconButton
                aria-label="Notifications"
                tooltip="الإشعارات"
                badgeCount={12}
                badgeTone="danger"
              >
                <FiBell />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Messages" tooltip="رسائل جديدة" showBadgeDot badgeTone="info"><FiMail /></IconButton>`}
            >
              <IconButton
                aria-label="Messages"
                tooltip="رسائل جديدة"
                showBadgeDot
                badgeTone="info"
              >
                <FiMail />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Settings" variant="outline" tooltip="الإعدادات"><FiSettings /></IconButton>`}
            >
              <IconButton
                aria-label="Settings"
                variant="outline"
                tooltip="الإعدادات"
              >
                <FiSettings />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="More" variant="plain" tooltip="المزيد"><FiMoreHorizontal /></IconButton>`}
            >
              <IconButton aria-label="More" variant="plain" tooltip="المزيد">
                <FiMoreHorizontal />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Create" variant="gradient" gradient="aurora" elevation="cta" tooltip="إنشاء"><FiPlus /></IconButton>`}
            >
              <IconButton
                aria-label="Create"
                variant="gradient"
                gradient="aurora"
                elevation="cta"
                tooltip="إنشاء"
              >
                <FiPlus />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Loading" variant="solid" tone="brand" tooltip="تحميل" isLoading><FiBell /></IconButton>`}
            >
              <IconButton
                aria-label="Loading"
                variant="solid"
                tone="brand"
                tooltip="تحميل"
                isLoading
              >
                <FiBell />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Disabled" variant="outline" tooltip="معطّل" disabled><FiSettings /></IconButton>`}
            >
              <IconButton
                aria-label="Disabled"
                variant="outline"
                tooltip="معطّل"
                disabled
              >
                <FiSettings />
              </IconButton>
            </C>
          </Section>

          {/* ================= Variants & Tones ================= */}
          <Section
            title="Variants & Tones"
            subtitle="نفس الشكل/الحجم — اختلاف variant/tone (ألوان كثيرة)"
          >
            <C
              onCopied={show}
              code={`<IconButton aria-label="Solid Brand" variant="solid" tone="brand" tooltip="solid brand"><FiStar /></IconButton>`}
            >
              <IconButton
                aria-label="Solid Brand"
                variant="solid"
                tone="brand"
                tooltip="solid brand"
              >
                <FiStar />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Soft Success" variant="soft" tone="success" tooltip="soft success"><FiCheckCircle /></IconButton>`}
            >
              <IconButton
                aria-label="Soft Success"
                variant="soft"
                tone="success"
                tooltip="soft success"
              >
                <FiCheckCircle />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Outline Danger" variant="outline" tone="danger" tooltip="outline danger"><FiTrash2 /></IconButton>`}
            >
              <IconButton
                aria-label="Outline Danger"
                variant="outline"
                tone="danger"
                tooltip="outline danger"
              >
                <FiTrash2 />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Ghost Warning" variant="ghost" tone="warning" tooltip="ghost warning"><FiAlertTriangle /></IconButton>`}
            >
              <IconButton
                aria-label="Ghost Warning"
                variant="ghost"
                tone="warning"
                tooltip="ghost warning"
              >
                <FiAlertTriangle />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Glass Info" variant="glass" tone="info" tooltip="glass info"><FiGlobe /></IconButton>`}
            >
              <IconButton
                aria-label="Glass Info"
                variant="glass"
                tone="info"
                tooltip="glass info"
              >
                <FiGlobe />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Solid Purple" variant="solid" tone="purple" tooltip="solid purple"><FiHeart /></IconButton>`}
            >
              <IconButton
                aria-label="Solid Purple"
                variant="solid"
                tone="purple"
                tooltip="solid purple"
              >
                <FiHeart />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Soft Pink" variant="soft" tone="pink" tooltip="soft pink"><FiHeart /></IconButton>`}
            >
              <IconButton
                aria-label="Soft Pink"
                variant="soft"
                tone="pink"
                tooltip="soft pink"
              >
                <FiHeart />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Outline Lime" variant="outline" tone="lime" tooltip="outline lime"><FiZap /></IconButton>`}
            >
              <IconButton
                aria-label="Outline Lime"
                variant="outline"
                tone="lime"
                tooltip="outline lime"
              >
                {/* FiZap موجود عندك سابقاً، لو غير موجود استبدله */}
                <FiPlus />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Solid Cyan" variant="solid" tone="cyan" tooltip="solid cyan"><FiCamera /></IconButton>`}
            >
              <IconButton
                aria-label="Solid Cyan"
                variant="solid"
                tone="cyan"
                tooltip="solid cyan"
              >
                <FiCamera />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Gradient Mango" variant="gradient" gradient="mango" elevation="soft" tooltip="gradient mango"><FiStar /></IconButton>`}
            >
              <IconButton
                aria-label="Gradient Mango"
                variant="gradient"
                gradient="mango"
                elevation="soft"
                tooltip="gradient mango"
              >
                <FiStar />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Gradient Neon" variant="gradient" gradient="neon" elevation="cta" tooltip="gradient neon"><FiPlus /></IconButton>`}
            >
              <IconButton
                aria-label="Gradient Neon"
                variant="gradient"
                gradient="neon"
                elevation="cta"
                tooltip="gradient neon"
              >
                <FiPlus />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Gradient Midnight" variant="gradient" gradient="midnight" elevation="strong" tooltip="gradient midnight"><FiShield /></IconButton>`}
            >
              <IconButton
                aria-label="Gradient Midnight"
                variant="gradient"
                gradient="midnight"
                elevation="strong"
                tooltip="gradient midnight"
              >
                <FiShield />
              </IconButton>
            </C>
          </Section>

          {/* ================= Feed / Post Actions ================= */}
          <Section
            title="Feed / Post Actions"
            subtitle="inactive/active + count/dot + tooltip top/bottom"
          >
            <C
              onCopied={show}
              code={`<IconButton aria-label="Like" tooltip="إعجاب"><FiHeart /></IconButton>`}
            >
              <IconButton aria-label="Like" tooltip="إعجاب">
                <FiHeart />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Liked" tone="danger" tooltip="تم الإعجاب"><FiHeart /></IconButton>`}
            >
              <IconButton aria-label="Liked" tone="danger" tooltip="تم الإعجاب">
                <FiHeart />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Rate" tone="warning" tooltip="تقييم" tooltipPlacement="bottom"><FiStar /></IconButton>`}
            >
              <IconButton
                aria-label="Rate"
                tone="warning"
                tooltip="تقييم"
                tooltipPlacement="bottom"
              >
                <FiStar />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Save" tooltip="حفظ"><FiBookmark /></IconButton>`}
            >
              <IconButton aria-label="Save" tooltip="حفظ">
                <FiBookmark />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Comments" tooltip="تعليقات" badgeCount={34} badgeTone="info"><FiMessageCircle /></IconButton>`}
            >
              <IconButton
                aria-label="Comments"
                tooltip="تعليقات"
                badgeCount={34}
                badgeTone="info"
              >
                <FiMessageCircle />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="New comments" tooltip="تعليقات جديدة" showBadgeDot badgeTone="info"><FiMessageCircle /></IconButton>`}
            >
              <IconButton
                aria-label="New comments"
                tooltip="تعليقات جديدة"
                showBadgeDot
                badgeTone="info"
              >
                <FiMessageCircle />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Share" tooltip="مشاركة"><FiShare2 /></IconButton>`}
            >
              <IconButton aria-label="Share" tooltip="مشاركة">
                <FiShare2 />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="More post" variant="ghost" tooltip="المزيد" tooltipPlacement="bottom"><FiMoreHorizontal /></IconButton>`}
            >
              <IconButton
                aria-label="More post"
                variant="ghost"
                tooltip="المزيد"
                tooltipPlacement="bottom"
              >
                <FiMoreHorizontal />
              </IconButton>
            </C>
          </Section>

          {/* ================= Profile Actions ================= */}
          <Section
            title="Profile Actions"
            subtitle="رسالة/تعديل/متابعين + أمان (تبليغ/حظر)"
          >
            <C
              onCopied={show}
              code={`<IconButton aria-label="Followers" tooltip="المتابعين" badgeCount={99} badgeTone="brand"><FiUsers /></IconButton>`}
            >
              <IconButton
                aria-label="Followers"
                tooltip="المتابعين"
                badgeCount={99}
                badgeTone="brand"
              >
                <FiUsers />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Message" tone="info" tooltip="رسالة"><FiMail /></IconButton>`}
            >
              <IconButton aria-label="Message" tone="info" tooltip="رسالة">
                <FiMail />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Edit" variant="outline" tooltip="تعديل"><FiEdit2 /></IconButton>`}
            >
              <IconButton aria-label="Edit" variant="outline" tooltip="تعديل">
                <FiEdit2 />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Private" tone="warning" tooltip="حساب خاص"><FiLock /></IconButton>`}
            >
              <IconButton
                aria-label="Private"
                tone="warning"
                tooltip="حساب خاص"
              >
                <FiLock />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Report" variant="outline" tone="warning" tooltip="تبليغ"><FiFlag /></IconButton>`}
            >
              <IconButton
                aria-label="Report"
                variant="outline"
                tone="warning"
                tooltip="تبليغ"
              >
                <FiFlag />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Block" variant="solid" tone="danger" tooltip="حظر"><FiSlash /></IconButton>`}
            >
              <IconButton
                aria-label="Block"
                variant="solid"
                tone="danger"
                tooltip="حظر"
              >
                <FiSlash />
              </IconButton>
            </C>
          </Section>

          {/* ================= Verification / Status ================= */}
          <Section
            title="Verification / Status"
            subtitle="موثّق/معلّق/بحاجة توثيق/محظور/مشرف"
          >
            <C
              onCopied={show}
              code={`<IconButton aria-label="Verified" tone="brand" tooltip="تم التوثيق"><FiCheckCircle /></IconButton>`}
            >
              <IconButton
                aria-label="Verified"
                tone="brand"
                tooltip="تم التوثيق"
              >
                <FiCheckCircle />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Verified solid" variant="solid" tone="brand" tooltip="موثّق"><FiCheckCircle /></IconButton>`}
            >
              <IconButton
                aria-label="Verified solid"
                variant="solid"
                tone="brand"
                tooltip="موثّق"
              >
                <FiCheckCircle />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Moderator" tone="info" tooltip="مشرف"><FiShield /></IconButton>`}
            >
              <IconButton aria-label="Moderator" tone="info" tooltip="مشرف">
                <FiShield />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Pending" tone="warning" tooltip="قيد المراجعة"><FiClock /></IconButton>`}
            >
              <IconButton
                aria-label="Pending"
                tone="warning"
                tooltip="قيد المراجعة"
              >
                <FiClock />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Need verification" variant="outline" tone="warning" tooltip="بحاجة توثيق"><FiAlertTriangle /></IconButton>`}
            >
              <IconButton
                aria-label="Need verification"
                variant="outline"
                tone="warning"
                tooltip="بحاجة توثيق"
              >
                <FiAlertTriangle />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Banned" variant="solid" tone="danger" tooltip="محظور"><FiXCircle /></IconButton>`}
            >
              <IconButton
                aria-label="Banned"
                variant="solid"
                tone="danger"
                tooltip="محظور"
              >
                <FiXCircle />
              </IconButton>
            </C>
          </Section>

          {/* ================= Utility / Links ================= */}
          <Section
            title="Utility / Links"
            subtitle="روابط + نسخ + فتح خارجي + تحديث + tooltipPlacement"
          >
            <C
              onCopied={show}
              code={`<IconButton aria-label="Copy link" variant="ghost" tooltip="نسخ الرابط"><FiLink /></IconButton>`}
            >
              <IconButton
                aria-label="Copy link"
                variant="ghost"
                tooltip="نسخ الرابط"
              >
                <FiLink />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Copy" variant="soft" tooltip="نسخ" tooltipPlacement="bottom"><FiCopy /></IconButton>`}
            >
              <IconButton
                aria-label="Copy"
                variant="soft"
                tooltip="نسخ"
                tooltipPlacement="bottom"
              >
                <FiCopy />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Open" variant="outline" tooltip="فتح خارجي"><FiExternalLink /></IconButton>`}
            >
              <IconButton
                aria-label="Open"
                variant="outline"
                tooltip="فتح خارجي"
              >
                <FiExternalLink />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Website" variant="soft" tone="info" tooltip="الموقع"><FiGlobe /></IconButton>`}
            >
              <IconButton
                aria-label="Website"
                variant="soft"
                tone="info"
                tooltip="الموقع"
              >
                <FiGlobe />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Refresh" variant="plain" tooltip="تحديث"><FiRefreshCw /></IconButton>`}
            >
              <IconButton aria-label="Refresh" variant="plain" tooltip="تحديث">
                <FiRefreshCw />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Camera" variant="soft" tooltip="كاميرا"><FiCamera /></IconButton>`}
            >
              <IconButton aria-label="Camera" variant="soft" tooltip="كاميرا">
                <FiCamera />
              </IconButton>
            </C>
          </Section>

          {/* ================= Commerce ================= */}
          <Section
            title="Commerce"
            subtitle="سلة + هدية + دفع + كوبون + جدولة + badgeAnchor"
          >
            <C
              onCopied={show}
              code={`<IconButton aria-label="Cart" tone="brand" tooltip="السلة" badgeCount={3} badgeTone="danger"><FiShoppingCart /></IconButton>`}
            >
              <IconButton
                aria-label="Cart"
                tone="brand"
                tooltip="السلة"
                badgeCount={3}
                badgeTone="danger"
              >
                <FiShoppingCart />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Gift" variant="soft" tone="warning" tooltip="هدية"><FiGift /></IconButton>`}
            >
              <IconButton
                aria-label="Gift"
                variant="soft"
                tone="warning"
                tooltip="هدية"
              >
                <FiGift />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Pay" variant="outline" tooltip="الدفع"><FiCreditCard /></IconButton>`}
            >
              <IconButton aria-label="Pay" variant="outline" tooltip="الدفع">
                <FiCreditCard />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Coupon" variant="ghost" tooltip="قسيمة"><FiTag /></IconButton>`}
            >
              <IconButton aria-label="Coupon" variant="ghost" tooltip="قسيمة">
                <FiTag />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Schedule" variant="soft" tooltip="جدولة"><FiCalendar /></IconButton>`}
            >
              <IconButton aria-label="Schedule" variant="soft" tooltip="جدولة">
                <FiCalendar />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Cart badge on button" tone="brand" tooltip="badge على الزر" badgeCount={8} badgeTone="danger" badgeAnchor="button"><FiShoppingCart /></IconButton>`}
            >
              <IconButton
                aria-label="Cart badge on button"
                tone="brand"
                tooltip="badge على الزر"
                badgeCount={8}
                badgeTone="danger"
                badgeAnchor="button"
              >
                <FiShoppingCart />
              </IconButton>
            </C>
          </Section>

          {/* ================= Chat / Messaging ================= */}
          <Section
            title="Chat / Messaging"
            subtitle="plain حول الإدخال + إرسال (loading) + media"
          >
            <C
              onCopied={show}
              code={`<IconButton aria-label="Emoji" variant="plain" tooltip="إيموجي"><FiSmile /></IconButton>`}
            >
              <IconButton aria-label="Emoji" variant="plain" tooltip="إيموجي">
                <FiSmile />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Attach" variant="plain" tooltip="مرفق"><FiUpload /></IconButton>`}
            >
              <IconButton aria-label="Attach" variant="plain" tooltip="مرفق">
                <FiUpload />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Photo" variant="plain" tooltip="صورة"><FiImage /></IconButton>`}
            >
              <IconButton aria-label="Photo" variant="plain" tooltip="صورة">
                <FiImage />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Video" variant="plain" tooltip="فيديو"><FiVideo /></IconButton>`}
            >
              <IconButton aria-label="Video" variant="plain" tooltip="فيديو">
                <FiVideo />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Voice" variant="plain" tooltip="تسجيل"><FiMic /></IconButton>`}
            >
              <IconButton aria-label="Voice" variant="plain" tooltip="تسجيل">
                <FiMic />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Send" variant="solid" tone="brand" tooltip="إرسال" tooltipPlacement="bottom"><FiSend /></IconButton>`}
            >
              <IconButton
                aria-label="Send"
                variant="solid"
                tone="brand"
                tooltip="إرسال"
                tooltipPlacement="bottom"
              >
                <FiSend />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Sending" variant="solid" tone="brand" tooltip="جاري الإرسال" isLoading><FiSend /></IconButton>`}
            >
              <IconButton
                aria-label="Sending"
                variant="solid"
                tone="brand"
                tooltip="جاري الإرسال"
                isLoading
              >
                <FiSend />
              </IconButton>
            </C>
          </Section>

          {/* ================= Sizes & Shapes ================= */}
          <Section
            title="Sizes & Shapes"
            subtitle="xs/sm/md/lg + circle/rounded/square (بدون توليد)"
          >
            <C
              onCopied={show}
              code={`<IconButton aria-label="xs circle" size="xs" shape="circle" tooltip="xs circle"><FiBell /></IconButton>`}
            >
              <IconButton
                aria-label="xs circle"
                size="xs"
                shape="circle"
                tooltip="xs circle"
              >
                <FiBell />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="xs rounded" size="xs" shape="rounded" tooltip="xs rounded"><FiBell /></IconButton>`}
            >
              <IconButton
                aria-label="xs rounded"
                size="xs"
                shape="rounded"
                tooltip="xs rounded"
              >
                <FiBell />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="xs square" size="xs" shape="square" tooltip="xs square"><FiBell /></IconButton>`}
            >
              <IconButton
                aria-label="xs square"
                size="xs"
                shape="square"
                tooltip="xs square"
              >
                <FiBell />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="sm circle" size="sm" shape="circle" tooltip="sm circle"><FiBell /></IconButton>`}
            >
              <IconButton
                aria-label="sm circle"
                size="sm"
                shape="circle"
                tooltip="sm circle"
              >
                <FiBell />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="md rounded" size="md" shape="rounded" tooltip="md rounded"><FiBell /></IconButton>`}
            >
              <IconButton
                aria-label="md rounded"
                size="md"
                shape="rounded"
                tooltip="md rounded"
              >
                <FiBell />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="lg square" size="lg" shape="square" tooltip="lg square"><FiBell /></IconButton>`}
            >
              <IconButton
                aria-label="lg square"
                size="lg"
                shape="square"
                tooltip="lg square"
              >
                <FiBell />
              </IconButton>
            </C>
          </Section>

          {/* ================= Badge Placement ================= */}
          <Section
            title="Badges Placement"
            subtitle="كل الاتجاهات + badgeOffset مثال"
          >
            <C
              onCopied={show}
              code={`<IconButton aria-label="top-right" tooltip="top-right" badgeCount={7} badgeTone="danger" badgePlacement="top-right"><FiBell /></IconButton>`}
            >
              <IconButton
                aria-label="top-right"
                tooltip="top-right"
                badgeCount={7}
                badgeTone="danger"
                badgePlacement="top-right"
              >
                <FiBell />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="top-left" tooltip="top-left" badgeCount={7} badgeTone="danger" badgePlacement="top-left"><FiBell /></IconButton>`}
            >
              <IconButton
                aria-label="top-left"
                tooltip="top-left"
                badgeCount={7}
                badgeTone="danger"
                badgePlacement="top-left"
              >
                <FiBell />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="bottom-right" tooltip="bottom-right" badgeCount={7} badgeTone="danger" badgePlacement="bottom-right"><FiBell /></IconButton>`}
            >
              <IconButton
                aria-label="bottom-right"
                tooltip="bottom-right"
                badgeCount={7}
                badgeTone="danger"
                badgePlacement="bottom-right"
              >
                <FiBell />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="bottom-left" tooltip="bottom-left" badgeCount={7} badgeTone="danger" badgePlacement="bottom-left"><FiBell /></IconButton>`}
            >
              <IconButton
                aria-label="bottom-left"
                tooltip="bottom-left"
                badgeCount={7}
                badgeTone="danger"
                badgePlacement="bottom-left"
              >
                <FiBell />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="left" tooltip="left" badgeCount={7} badgeTone="danger" badgePlacement="left"><FiBell /></IconButton>`}
            >
              <IconButton
                aria-label="left"
                tooltip="left"
                badgeCount={7}
                badgeTone="danger"
                badgePlacement="left"
              >
                <FiBell />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="right" tooltip="right" badgeCount={7} badgeTone="danger" badgePlacement="right"><FiBell /></IconButton>`}
            >
              <IconButton
                aria-label="right"
                tooltip="right"
                badgeCount={7}
                badgeTone="danger"
                badgePlacement="right"
              >
                <FiBell />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="top" tooltip="top" badgeCount={7} badgeTone="danger" badgePlacement="top"><FiBell /></IconButton>`}
            >
              <IconButton
                aria-label="top"
                tooltip="top"
                badgeCount={7}
                badgeTone="danger"
                badgePlacement="top"
              >
                <FiBell />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="bottom" tooltip="bottom" badgeCount={7} badgeTone="danger" badgePlacement="bottom"><FiBell /></IconButton>`}
            >
              <IconButton
                aria-label="bottom"
                tooltip="bottom"
                badgeCount={7}
                badgeTone="danger"
                badgePlacement="bottom"
              >
                <FiBell />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="offset" tooltip="offset +2/-2" badgeCount={7} badgeTone="danger" badgePlacement="top-right" badgeOffset={{x:2,y:-2}}><FiBell /></IconButton>`}
            >
              <IconButton
                aria-label="offset"
                tooltip="offset +2/-2"
                badgeCount={7}
                badgeTone="danger"
                badgePlacement="top-right"
                badgeOffset={{ x: 2, y: -2 }}
              >
                <FiBell />
              </IconButton>
            </C>
          </Section>

          {/* ================= Overlay / Dark ================= */}
          <Section
            title="Overlay / Dark"
            subtitle='variant="inverse" + plain مع iconClassName="text-white"'
            bodyClassName="rounded-2xl bg-black/90 p-4"
          >
            <C
              onCopied={show}
              code={`<IconButton aria-label="Play" variant="inverse" tooltip="تشغيل"><FiPlay /></IconButton>`}
            >
              <IconButton aria-label="Play" variant="inverse" tooltip="تشغيل">
                <FiPlay />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Pause" variant="inverse" tooltip="إيقاف"><FiPause /></IconButton>`}
            >
              <IconButton aria-label="Pause" variant="inverse" tooltip="إيقاف">
                <FiPause />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Volume" variant="inverse" tooltip="الصوت"><FiVolume2 /></IconButton>`}
            >
              <IconButton aria-label="Volume" variant="inverse" tooltip="الصوت">
                <FiVolume2 />
              </IconButton>
            </C>

            <C
              onCopied={show}
              code={`<IconButton aria-label="Plain white icon" variant="plain" iconClassName="text-white" tooltip="plain"><FiMoreHorizontal /></IconButton>`}
            >
              <IconButton
                aria-label="Plain white icon"
                variant="plain"
                iconClassName="text-white"
                tooltip="plain"
              >
                <FiMoreHorizontal />
              </IconButton>
            </C>
          </Section>
        </div>

        {toast && <Toast text={toast} />}
      </div>
    </main>
  );
}
