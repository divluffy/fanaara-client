// app/(examples)/inputs/page.tsx
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  FiMail,
  FiLock,
  FiUser,
  FiEye,
  FiEyeOff,
  FiSearch,
  FiX,
  FiCheck,
  FiTrash2,
  FiInfo,
  FiUsers,
  FiLink,
  FiHash,
  FiEdit3,
  FiUploadCloud,
  FiSend,
  FiGlobe,
  FiAtSign,
  FiDollarSign,
  FiFlag,
  FiAlertTriangle,
  FiShield,
  FiStar,
  FiMessageCircle,
  FiBell,
  FiCopy,
  FiKey,
} from "react-icons/fi";

import { cn } from "@/utils";
import { useAppSelector } from "@/store/hooks";
import { AppInput } from "@/design/DeInput";
import { Button } from "@/design/DeButton";

/* ---------------------------------------------
 * Utilities
 * -------------------------------------------- */

function sleep(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

type ToastState = { open: boolean; title: string; message?: string };

function useToast(autoCloseMs = 2600) {
  const [toast, setToast] = React.useState<ToastState>({
    open: false,
    title: "",
    message: "",
  });

  const timerRef = React.useRef<number | null>(null);

  const close = React.useCallback(() => {
    setToast((s) => ({ ...s, open: false }));
  }, []);

  const notify = React.useCallback(
    (title: string, message?: string) => {
      setToast({ open: true, title, message });
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => close(), autoCloseMs);
    },
    [autoCloseMs, close],
  );

  React.useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  return { toast, notify, close };
}

function Toast({
  state,
  onClose,
  isRTL,
}: {
  state: ToastState;
  onClose: () => void;
  isRTL: boolean;
}) {
  const reduce = useReducedMotion();
  const enterX = reduce ? 0 : isRTL ? -18 : 18;

  return (
    <AnimatePresence>
      {state.open ? (
        <motion.div
          key="toast"
          className={cn("fixed bottom-5 z-50", "[inset-inline-end:1.25rem]")}
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: reduce ? 0 : 10, x: enterX }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: reduce ? 0 : 10, x: enterX }}
          transition={{ duration: 0.2 }}
        >
          <div
            className={cn(
              "w-[min(92vw,420px)] rounded-2xl p-4",
              "border border-border-subtle bg-background-elevated",
              "shadow-[var(--shadow-md)]",
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "mt-0.5 h-9 w-9 rounded-xl",
                  "flex items-center justify-center",
                  "bg-surface border border-border-subtle text-foreground",
                )}
                aria-hidden
              >
                <FiInfo className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {state.title}
                </p>
                {state.message ? (
                  <p className="mt-1 text-xs text-foreground-muted">
                    {state.message}
                  </p>
                ) : null}
              </div>

              <Button
                iconOnly
                aria-label="إغلاق"
                variant="plain"
                tone="neutral"
                size="sm"
                onClick={onClose}
              >
                <FiX />
              </Button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={cn(
        "rounded-2xl p-6",
        "border border-border-subtle bg-background-elevated",
        "shadow-[var(--shadow-md)]",
        className,
      )}
      whileHover={reduce ? undefined : { y: -2 }}
      transition={{ duration: 0.18 }}
    >
      {children}
    </motion.div>
  );
}

function SectionShell({
  title,
  subtitle,
  children,
  variants,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  variants: {
    hidden: Record<string, unknown>;
    show: Record<string, unknown>;
  };
}) {
  return (
    <motion.section variants={variants} className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          {subtitle ? (
            <p className="mt-1 text-sm text-foreground-muted">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {children}
    </motion.section>
  );
}

/* ---------------------------------------------
 * Forms
 * -------------------------------------------- */

type SignupValues = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type DiscoveryValues = {
  globalSearch: string;
  tag: string;
  handle: string;
};

type ComposerValues = {
  postText: string;
  link: string;
};

type CommunityAdminValues = {
  communityName: string;
  communitySlug: string;
  inviteCode: string;
  announcement: string;
};

type ProgramsValues = {
  portfolioUrl: string;
  couponCode: string;
  tipAmount: string;
};

type ModerationValues = {
  reportReason: string;
  evidenceUrl: string;
  modNote: string;
};

type AdvancedValues = {
  otp: string;
  priceMin: string;
  priceMax: string;
  topic: string;
};

/* ---------------------------------------------
 * Page
 * -------------------------------------------- */

export default function InputsExamplePage() {
  const appState = useAppSelector((s) => s.state);
  const reduce = useReducedMotion();
  const { toast, notify, close } = useToast(2600);

  // ✅ Preview controls (for examples only)
  const [previewDir, setPreviewDir] = React.useState<"rtl" | "ltr">(
    (appState.direction as "rtl" | "ltr") ?? "rtl",
  );
  const [previewDark, setPreviewDark] = React.useState(false);

  const sectionVariants = React.useMemo(() => {
    const enterX = reduce ? 0 : previewDir === "rtl" ? 18 : -18;
    return {
      hidden: { opacity: 0, y: reduce ? 0 : 10, x: enterX },
      show: { opacity: 1, y: 0, x: 0, transition: { duration: 0.28 } },
    } as const;
  }, [previewDir, reduce]);

  // --- Auth (real validation)
  const [showPassword, setShowPassword] = React.useState(false);

  const signupSchema = React.useMemo(
    () =>
      z
        .object({
          username: z
            .string()
            .min(3, "اسم المستخدم لازم يكون 3 أحرف على الأقل"),
          email: z.string().email("البريد الإلكتروني غير صحيح"),
          password: z.string().min(8, "كلمة المرور لازم تكون 8 أحرف على الأقل"),
          confirmPassword: z
            .string()
            .min(8, "تأكيد كلمة المرور لازم يكون 8 أحرف على الأقل"),
        })
        .refine((v) => v.password === v.confirmPassword, {
          path: ["confirmPassword"],
          message: "كلمتا المرور غير متطابقتين",
        }),
    [],
  );

  const signupForm = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    mode: "onTouched",
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSignup = async (values: SignupValues) => {
    console.log("Signup:", values);
    notify("تم إرسال النموذج", "صفحة أمثلة فقط.");
  };

  // --- Discovery
  const discovery = useForm<DiscoveryValues>({
    mode: "onChange",
    defaultValues: {
      globalSearch: "",
      tag: "one-piece",
      handle: "@luffy",
    },
  });

  const [searching, setSearching] = React.useState(false);
  const runSearch = React.useCallback(async () => {
    if (searching) return;
    setSearching(true);
    notify("بحث", "جارِ تنفيذ بحث تجريبي…");
    await sleep(900);
    setSearching(false);
    notify("تم", "نتائج البحث جاهزة (تجريبي).");
  }, [notify, searching]);

  // --- Composer
  const composer = useForm<ComposerValues>({
    mode: "onChange",
    defaultValues: { postText: "", link: "" },
  });

  const postText = composer.watch("postText");
  const postLen = postText?.length ?? 0;
  const postMax = 420;

  const [publishing, setPublishing] = React.useState(false);
  const publishPost = React.useCallback(async () => {
    if (publishing) return;
    setPublishing(true);
    notify("نشر", "جارِ نشر المنشور…");
    await sleep(1000);
    setPublishing(false);
    notify("تم النشر", "تم نشر المنشور (تجريبي).");
  }, [notify, publishing]);

  // --- Community Admin
  const community = useForm<CommunityAdminValues>({
    mode: "onChange",
    defaultValues: {
      communityName: "Manga Hub",
      communitySlug: "manga-hub",
      inviteCode: "OP-2026",
      announcement: "فتحنا برنامج Producers 🎬",
    },
  });

  const [inviteChecking, setInviteChecking] = React.useState(false);
  const [inviteOk, setInviteOk] = React.useState(false);

  const checkInvite = React.useCallback(async () => {
    if (inviteChecking) return;
    setInviteOk(false);
    setInviteChecking(true);
    notify("فحص كود الدعوة", "جارِ التحقق…");
    await sleep(900);
    setInviteChecking(false);
    setInviteOk(true);
    notify("كود صحيح", "تم قبول الكود (تجريبي).");
  }, [inviteChecking, notify]);

  // --- Programs + Monetization
  const programs = useForm<ProgramsValues>({
    mode: "onChange",
    defaultValues: {
      portfolioUrl: "https://example.com/portfolio",
      couponCode: "FANAARA-10",
      tipAmount: "5",
    },
  });

  const [couponApplying, setCouponApplying] = React.useState(false);
  const [couponOk, setCouponOk] = React.useState(false);

  const applyCoupon = React.useCallback(async () => {
    if (couponApplying) return;
    setCouponOk(false);
    setCouponApplying(true);
    notify("كوبون", "جارِ تطبيق الكوبون…");
    await sleep(900);
    setCouponApplying(false);
    setCouponOk(true);
    notify("تم", "تم تطبيق الخصم (تجريبي).");
  }, [couponApplying, notify]);

  // --- Moderation
  const moderation = useForm<ModerationValues>({
    mode: "onChange",
    defaultValues: {
      reportReason: "",
      evidenceUrl: "",
      modNote: "ملاحظة داخلية للموديريشن فقط.",
    },
  });

  // --- Advanced patterns
  const advanced = useForm<AdvancedValues>({
    mode: "onChange",
    defaultValues: {
      otp: "",
      priceMin: "5",
      priceMax: "25",
      topic: "",
    },
  });

  const [resendingOtp, setResendingOtp] = React.useState(false);
  const resendOtp = React.useCallback(async () => {
    if (resendingOtp) return;
    setResendingOtp(true);
    notify("OTP", "جارِ إرسال رمز جديد…");
    await sleep(900);
    setResendingOtp(false);
    notify("OTP", "تم إرسال رمز جديد (تجريبي).");
  }, [notify, resendingOtp]);

  const pageContainer = cn(
    "min-h-dvh w-full px-6 py-10",
    "bg-background text-foreground",
    "bg-[radial-gradient(1200px_600px_at_50%_-20%,rgba(120,90,255,0.14),transparent_60%)]",
    previewDark && "dark",
  );

  return (
    <div dir={previewDir} className={pageContainer}>
      <Toast state={toast} onClose={close} isRTL={previewDir === "rtl"} />

      <motion.div
        className="mx-auto w-full max-w-6xl space-y-10"
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: reduce ? undefined : { staggerChildren: 0.08 },
          },
        }}
      >
        {/* Header + controls */}
        <motion.header variants={sectionVariants} className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold">Inputs Showcase</h1>
              <p className="text-sm text-foreground-muted">
                أمثلة “حقيقية” لمنصة مجتمعية: Auth، بحث، Composer، إدارة مجتمع،
                برامج، Monetization، Moderation، وأنماط متقدمة.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="soft"
                tone="neutral"
                size="sm"
                leftIcon={<FiStar />}
                onClick={() => setPreviewDark((v) => !v)}
              >
                {previewDark ? "Light" : "Dark"}
              </Button>

              <Button
                variant="soft"
                tone="neutral"
                size="sm"
                leftIcon={<FiUsers />}
                onClick={() =>
                  setPreviewDir((d) => (d === "rtl" ? "ltr" : "rtl"))
                }
              >
                {previewDir.toUpperCase()}
              </Button>
            </div>
          </div>
        </motion.header>

        {/* 1) Auth */}
        <motion.section variants={sectionVariants}>
          <Card>
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Auth & Security</h2>
              <p className="mt-1 text-sm text-foreground-muted">
                zod errors + password reveal action (داخل الـ Input عبر Button).
              </p>
            </div>

            <form
              onSubmit={signupForm.handleSubmit(onSignup)}
              className="space-y-4"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <AppInput<SignupValues>
                  name="username"
                  register={signupForm.register}
                  errors={signupForm.formState.errors}
                  label="اسم المستخدم"
                  placeholder="مثال: لوفي"
                  description="يظهر في الملف الشخصي ونتائج البحث."
                  startIcon={FiUser}
                  size="lg"
                  variant="soft"
                  shape="rounded"
                  autoComplete="username"
                />

                <AppInput<SignupValues>
                  name="email"
                  register={signupForm.register}
                  errors={signupForm.formState.errors}
                  label="البريد الإلكتروني"
                  placeholder="email@example.com"
                  startIcon={FiMail}
                  type="email"
                  autoComplete="email"
                  dir="ltr"
                  variant="outline"
                  shape="rounded"
                  action={{
                    icon: FiBell,
                    label: "تنبيه",
                    ariaLabel: "تنبيه",
                    appearance: "soft",
                    tone: "brand",
                    onClick: () => notify("تنبيه", "تم الضغط على زر الإجراء."),
                  }}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <AppInput<SignupValues>
                  name="password"
                  register={signupForm.register}
                  errors={signupForm.formState.errors}
                  label="كلمة المرور"
                  placeholder="••••••••"
                  startIcon={FiLock}
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  variant="filled"
                  dir="ltr"
                  action={{
                    icon: showPassword ? FiEyeOff : FiEye,
                    ariaLabel: showPassword
                      ? "إخفاء كلمة المرور"
                      : "إظهار كلمة المرور",
                    appearance: "outline",
                    tone: "neutral",
                    onClick: () => setShowPassword((v) => !v),
                  }}
                />

                <AppInput<SignupValues>
                  name="confirmPassword"
                  register={signupForm.register}
                  errors={signupForm.formState.errors}
                  label="تأكيد كلمة المرور"
                  placeholder="••••••••"
                  startIcon={FiLock}
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  variant="outline"
                  shape="rounded"
                  dir="ltr"
                />
              </div>

              <Button
                type="submit"
                tone="brand"
                variant="solid"
                size="lg"
                fullWidth
                leftIcon={<FiSend />}
                isLoading={signupForm.formState.isSubmitting}
              >
                إنشاء حساب
              </Button>
            </form>
          </Card>
        </motion.section>

        {/* 2) Discovery */}
        <SectionShell
          title="Search & Discovery"
          subtitle="Global search + Tag + Handle (RTL/LTR). حالات action: loading / clear / add."
          variants={sectionVariants}
        >
          <Card>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="grid gap-5 md:grid-cols-2"
            >
              <AppInput<DiscoveryValues>
                name="globalSearch"
                register={discovery.register}
                errors={discovery.formState.errors}
                label="بحث المنصة"
                placeholder="ابحث عن: One Piece, Anime, Posts…"
                description="يشمل: منشورات + صفحات أنمي/مانغا + Creators."
                startIcon={FiSearch}
                size="xl"
                variant="filled"
                shape="rounded"
                action={{
                  icon: FiSearch,
                  label: searching ? "جارِ البحث..." : "بحث",
                  ariaLabel: "بحث",
                  appearance: "soft",
                  tone: "brand",
                  loading: searching,
                  onClick: () => void runSearch(),
                }}
              />

              <AppInput<DiscoveryValues>
                name="tag"
                register={discovery.register}
                errors={discovery.formState.errors}
                label="Tag"
                placeholder="one-piece"
                description="مثال: إضافة tag لتصفية المحتوى."
                startIcon={FiHash}
                dir="ltr"
                size="md"
                variant="soft"
                shape="pill"
                action={{
                  icon: FiCheck,
                  ariaLabel: "إضافة",
                  appearance: "outline",
                  tone: "success",
                  onClick: () => notify("Tags", "تمت إضافة التاغ (تجريبي)."),
                }}
              />

              <AppInput<DiscoveryValues>
                name="handle"
                register={discovery.register}
                errors={discovery.formState.errors}
                label="Handle"
                placeholder="@luffy"
                description="بحث عن Creator/Moderator."
                startIcon={FiAtSign}
                dir="ltr"
                variant="outline"
                shape="rounded"
                action={{
                  icon: FiX,
                  ariaLabel: "مسح",
                  appearance: "soft",
                  tone: "danger",
                  onClick: () => discovery.setValue("handle", ""),
                }}
              />

              <AppInput<DiscoveryValues>
                name="handle"
                register={discovery.register}
                errors={discovery.formState.errors}
                label="Readonly"
                description="Readonly — مناسب لحالات عرض بيانات."
                readOnly
                startIcon={FiInfo}
                variant="outline"
                shape="rounded"
                defaultValue="قيمة للعرض فقط"
              />
            </form>
          </Card>
        </SectionShell>

        {/* 3) Composer */}
        <SectionShell
          title="Post Composer / Comments"
          subtitle="Textarea + counter + publish action + link LTR."
          variants={sectionVariants}
        >
          <Card>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="grid gap-5 md:grid-cols-2"
            >
              <div className="md:col-span-2">
                <AppInput<ComposerValues>
                  name="postText"
                  register={composer.register}
                  errors={composer.formState.errors}
                  as="textarea"
                  label="اكتب منشورًا"
                  placeholder="شارك رأيك… اذكر @mentions و #tags"
                  description={
                    <span className="flex items-center justify-between">
                      <span>نصيحة: استخدم Tags للانتشار.</span>
                      <span
                        className={cn(
                          "tabular-nums",
                          postLen > postMax
                            ? "text-danger-500"
                            : "text-foreground-muted",
                        )}
                      >
                        {postLen}/{postMax}
                      </span>
                    </span>
                  }
                  startIcon={FiMessageCircle}
                  variant="soft"
                  shape="rounded"
                  intent={postLen > postMax ? "warning" : "brand"}
                  action={{
                    icon: FiSend,
                    label: publishing ? "جارِ النشر..." : "نشر",
                    ariaLabel: "نشر",
                    appearance: "solid",
                    tone: "brand",
                    loading: publishing,
                    onClick: () => void publishPost(),
                  }}
                />
              </div>

              <AppInput<ComposerValues>
                name="link"
                register={composer.register}
                errors={composer.formState.errors}
                label="رابط (اختياري)"
                placeholder="https://..."
                description="روابط خارجية — الأفضل LTR."
                startIcon={FiGlobe}
                dir="ltr"
                variant="outline"
                shape="rounded"
                action={{
                  icon: FiTrash2,
                  ariaLabel: "مسح الرابط",
                  appearance: "soft",
                  tone: "danger",
                  onClick: () => composer.setValue("link", ""),
                }}
              />

              <AppInput<ComposerValues>
                name="link"
                register={composer.register}
                errors={composer.formState.errors}
                label="Upload flow (مثال)"
                placeholder="upload://asset_id"
                description="ربط مودال/صفحة رفع."
                startIcon={FiUploadCloud}
                dir="ltr"
                variant="filled"
                shape="pill"
                action={{
                  icon: FiUploadCloud,
                  label: "رفع",
                  ariaLabel: "رفع",
                  appearance: "soft",
                  tone: "brand",
                  onClick: () => notify("Upload", "افتح مودال رفع (تجريبي)."),
                }}
              />
            </form>
          </Card>
        </SectionShell>

        {/* 4) Community Admin */}
        <SectionShell
          title="Community Admin"
          subtitle="اسم/slug/invite/announcement + verify invite -> success intent."
          variants={sectionVariants}
        >
          <Card>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="grid gap-5 md:grid-cols-2"
            >
              <AppInput<CommunityAdminValues>
                name="communityName"
                register={community.register}
                errors={community.formState.errors}
                label="اسم المجتمع"
                placeholder="Manga Hub"
                description="يظهر في الصفحة الرئيسية ونتائج البحث."
                startIcon={FiUsers}
                variant="soft"
                shape="rounded"
                action={{
                  icon: FiEdit3,
                  ariaLabel: "تعديل",
                  appearance: "soft",
                  tone: "neutral",
                  onClick: () => notify("Edit", "فتح مودال التعديل (تجريبي)."),
                }}
              />

              <AppInput<CommunityAdminValues>
                name="communitySlug"
                register={community.register}
                errors={community.formState.errors}
                label="Slug"
                placeholder="manga-hub"
                dir="ltr"
                description="يفضل LTR."
                startIcon={FiLink}
                variant="outline"
                shape="pill"
                action={{
                  icon: FiCopy,
                  ariaLabel: "نسخ",
                  appearance: "outline",
                  tone: "brand",
                  onClick: () => notify("Copy", "تم النسخ (تجريبي)."),
                }}
              />

              <AppInput<CommunityAdminValues>
                name="inviteCode"
                register={community.register}
                errors={community.formState.errors}
                label="Invite Code"
                placeholder="OP-2026"
                dir="ltr"
                description="يتحول إلى Success بعد التحقق."
                startIcon={FiKey}
                variant="filled"
                shape="rounded"
                intent={inviteOk ? "success" : "brand"}
                action={{
                  icon: inviteOk ? FiCheck : FiHash,
                  label: inviteChecking
                    ? "جارِ الفحص..."
                    : inviteOk
                      ? "صحيح"
                      : "تحقق",
                  ariaLabel: "تحقق",
                  appearance: inviteOk ? "solid" : "outline",
                  tone: inviteOk ? "success" : "brand",
                  loading: inviteChecking,
                  onClick: () => void checkInvite(),
                }}
              />

              <AppInput<CommunityAdminValues>
                name="announcement"
                register={community.register}
                errors={community.formState.errors}
                as="textarea"
                label="إعلان مثبت"
                placeholder="اكتب إعلان..."
                description="Pinned announcement للأعضاء."
                startIcon={FiBell}
                variant="soft"
                shape="rounded"
                action={{
                  icon: FiSend,
                  label: "نشر",
                  ariaLabel: "نشر",
                  appearance: "solid",
                  tone: "brand",
                  onClick: () => notify("Announcement", "تم النشر (تجريبي)."),
                }}
              />
            </form>
          </Card>
        </SectionShell>

        {/* 5) Programs + Monetization */}
        <SectionShell
          title="Creator Program + Monetization"
          subtitle="Portfolio URL + Coupon apply + Tips. success intent بعد القبول."
          variants={sectionVariants}
        >
          <Card>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="grid gap-5 md:grid-cols-2"
            >
              <AppInput<ProgramsValues>
                name="portfolioUrl"
                register={programs.register}
                errors={programs.formState.errors}
                label="Portfolio URL"
                placeholder="https://..."
                description="أفضل LTR."
                startIcon={FiGlobe}
                dir="ltr"
                variant="outline"
                shape="rounded"
                action={{
                  icon: FiCheck,
                  ariaLabel: "تحقق",
                  appearance: "soft",
                  tone: "info",
                  onClick: () => notify("Portfolio", "تم التحقق (تجريبي)."),
                }}
              />

              <AppInput<ProgramsValues>
                name="couponCode"
                register={programs.register}
                errors={programs.formState.errors}
                label="Coupon"
                placeholder="FANAARA-10"
                dir="ltr"
                description="Apply coupon + success intent."
                startIcon={FiDollarSign}
                variant="soft"
                shape="rounded"
                intent={couponOk ? "success" : "brand"}
                action={{
                  icon: couponOk ? FiCheck : FiDollarSign,
                  label: couponApplying
                    ? "جارِ التطبيق..."
                    : couponOk
                      ? "مفعل"
                      : "تطبيق",
                  ariaLabel: "تطبيق",
                  appearance: couponOk ? "solid" : "soft",
                  tone: couponOk ? "success" : "brand",
                  loading: couponApplying,
                  onClick: () => void applyCoupon(),
                }}
              />

              <AppInput<ProgramsValues>
                name="tipAmount"
                register={programs.register}
                errors={programs.formState.errors}
                label="Tip Amount"
                placeholder="5"
                dir="ltr"
                inputMode="decimal"
                description="مثال Monetization: دعم مباشر."
                startIcon={FiDollarSign}
                variant="filled"
                shape="pill"
                action={{
                  icon: FiSend,
                  ariaLabel: "إرسال",
                  appearance: "solid",
                  tone: "brand",
                  onClick: () => notify("Tip", "تم إرسال الدعم (تجريبي)."),
                }}
              />

              <AppInput<ProgramsValues>
                name="tipAmount"
                register={programs.register}
                errors={programs.formState.errors}
                label="Disabled مثال"
                disabled
                startIcon={FiLock}
                variant="outline"
                shape="rounded"
                defaultValue="معطل"
              />
            </form>
          </Card>
        </SectionShell>

        {/* 6) Moderation */}
        <SectionShell
          title="Moderation & Trust/Safety"
          subtitle="بلاغ + دليل + ملاحظة داخلية. Intent warning/danger/info."
          variants={sectionVariants}
        >
          <Card>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="grid gap-5 md:grid-cols-2"
            >
              <AppInput<ModerationValues>
                name="reportReason"
                register={moderation.register}
                errors={moderation.formState.errors}
                label="سبب البلاغ"
                placeholder="مثال: سبويلر بدون تحذير"
                description="سبب واضح يساعد الموديريشن."
                startIcon={FiFlag}
                variant="soft"
                shape="rounded"
                intent="warning"
                action={{
                  icon: FiAlertTriangle,
                  ariaLabel: "تحذير",
                  appearance: "soft",
                  tone: "warning",
                  onClick: () => notify("Report", "تم تسجيل البلاغ (تجريبي)."),
                }}
              />

              <AppInput<ModerationValues>
                name="evidenceUrl"
                register={moderation.register}
                errors={moderation.formState.errors}
                label="Evidence URL"
                placeholder="https://..."
                description="أفضل LTR."
                startIcon={FiLink}
                dir="ltr"
                variant="outline"
                shape="rounded"
                action={{
                  icon: FiX,
                  ariaLabel: "مسح",
                  appearance: "soft",
                  tone: "danger",
                  onClick: () => moderation.setValue("evidenceUrl", ""),
                }}
              />

              <div className="md:col-span-2">
                <AppInput<ModerationValues>
                  name="modNote"
                  register={moderation.register}
                  errors={moderation.formState.errors}
                  as="textarea"
                  label="ملاحظة للموديريشن (Internal)"
                  placeholder="اكتب ملاحظة..."
                  description="هذه لا تظهر للمستخدم."
                  startIcon={FiShield}
                  variant="filled"
                  shape="rounded"
                  intent="neutral"
                  action={{
                    icon: FiTrash2,
                    label: "مسح",
                    ariaLabel: "مسح",
                    appearance: "outline",
                    tone: "danger",
                    onClick: () => moderation.setValue("modNote", ""),
                  }}
                />
              </div>
            </form>
          </Card>
        </SectionShell>

        {/* 7) Advanced patterns */}
        <SectionShell
          title="Advanced Input Patterns"
          subtitle="OTP + Price range + Topic add. نفس AppInput مع props مختلفة."
          variants={sectionVariants}
        >
          <Card>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="grid gap-5 md:grid-cols-2"
            >
              <AppInput<AdvancedValues>
                name="otp"
                register={advanced.register}
                errors={advanced.formState.errors}
                label="OTP Code"
                placeholder="123456"
                description="Numeric + maxLength (LTR)."
                startIcon={FiKey}
                dir="ltr"
                inputMode="numeric"
                maxLength={6}
                variant="outline"
                shape="rounded"
                size="md"
                intent="info"
                action={{
                  icon: FiSend,
                  label: resendingOtp ? "جارِ الإرسال..." : "إعادة إرسال",
                  ariaLabel: "إعادة إرسال OTP",
                  appearance: "soft",
                  tone: "info",
                  loading: resendingOtp,
                  onClick: () => void resendOtp(),
                }}
              />

              <AppInput<AdvancedValues>
                name="topic"
                register={advanced.register}
                errors={advanced.formState.errors}
                label="Add Topic"
                placeholder="مثال: Ending discussion"
                description="استخدمها في Community topics أو Collections."
                startIcon={FiHash}
                variant="soft"
                shape="pill"
                action={{
                  icon: FiCheck,
                  ariaLabel: "إضافة",
                  appearance: "solid",
                  tone: "success",
                  onClick: () => notify("Topic", "تمت الإضافة (تجريبي)."),
                }}
              />

              <div className="grid grid-cols-2 gap-3 md:col-span-2">
                <AppInput<AdvancedValues>
                  name="priceMin"
                  register={advanced.register}
                  errors={advanced.formState.errors}
                  label="Min Price"
                  placeholder="5"
                  dir="ltr"
                  inputMode="decimal"
                  startIcon={FiDollarSign}
                  variant="filled"
                  shape="rounded"
                  size="sm"
                />
                <AppInput<AdvancedValues>
                  name="priceMax"
                  register={advanced.register}
                  errors={advanced.formState.errors}
                  label="Max Price"
                  placeholder="25"
                  dir="ltr"
                  inputMode="decimal"
                  startIcon={FiDollarSign}
                  variant="filled"
                  shape="rounded"
                  size="sm"
                  action={{
                    icon: FiX,
                    ariaLabel: "مسح",
                    appearance: "soft",
                    tone: "danger",
                    onClick: () => {
                      advanced.setValue("priceMin", "");
                      advanced.setValue("priceMax", "");
                    },
                  }}
                />
              </div>
            </form>
          </Card>
        </SectionShell>

        {/* 8) Matrix */}
        <SectionShell
          title="Matrix"
          subtitle="xs..xl / outline-soft-filled / shapes / textarea / loading"
          variants={sectionVariants}
        >
          <Card>
            <div className="grid gap-5 md:grid-cols-2">
              <AppInput<DiscoveryValues>
                name="tag"
                register={discovery.register}
                errors={discovery.formState.errors}
                label="xs + outline + square"
                placeholder="..."
                startIcon={FiInfo}
                size="xs"
                variant="outline"
                shape="square"
              />

              <AppInput<DiscoveryValues>
                name="globalSearch"
                register={discovery.register}
                errors={discovery.formState.errors}
                label="sm + soft + pill + action"
                placeholder="بحث..."
                startIcon={FiSearch}
                size="sm"
                variant="soft"
                shape="pill"
                action={{
                  icon: FiSearch,
                  ariaLabel: "بحث",
                  appearance: "outline",
                  tone: "brand",
                  onClick: () => void runSearch(),
                }}
              />

              <AppInput<DiscoveryValues>
                name="handle"
                register={discovery.register}
                errors={discovery.formState.errors}
                label="md + filled + rounded (LTR)"
                placeholder="@name"
                startIcon={FiAtSign}
                dir="ltr"
                size="md"
                variant="filled"
                shape="rounded"
              />

              <AppInput<ModerationValues>
                name="modNote"
                register={moderation.register}
                errors={moderation.formState.errors}
                label="lg + textarea + soft + danger action"
                placeholder="اكتب..."
                as="textarea"
                startIcon={FiUser}
                size="lg"
                variant="soft"
                shape="rounded"
                action={{
                  icon: FiTrash2,
                  label: "مسح",
                  ariaLabel: "مسح",
                  appearance: "soft",
                  tone: "danger",
                  onClick: () => moderation.setValue("modNote", ""),
                }}
              />

              <AppInput<DiscoveryValues>
                name="globalSearch"
                register={discovery.register}
                errors={discovery.formState.errors}
                label="xl + loading (no action)"
                placeholder="..."
                startIcon={FiSearch}
                loading
                size="xl"
                variant="filled"
                shape="rounded"
              />

              <AppInput<DiscoveryValues>
                name="tag"
                register={discovery.register}
                errors={discovery.formState.errors}
                label="Intent success"
                placeholder="..."
                startIcon={FiCheck}
                variant="outline"
                shape="rounded"
                intent="success"
              />
            </div>
          </Card>
        </SectionShell>
      </motion.div>
    </div>
  );
}
