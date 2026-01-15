// app/(examples)/inputs/page.tsx
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FiMail,
  FiLock,
  FiUser,
  FiEye,
  FiEyeOff,
  FiBell,
  FiX,
  FiSearch,
  FiCheck,
  FiTrash2,
  FiInfo,
  FiUsers,
  FiLink,
  FiHash,
  FiEdit3,
  FiUploadCloud,
  FiSend,
} from "react-icons/fi";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { cn } from "@/utils";
import { useAppSelector } from "@/redux/hooks";
import { AppInput } from "@/design/Input";

type SignupValues = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type ActionShowcaseValues = {
  alertAction: string;
  clearAction: string;
  searchAction: string;
  verifyAction: string;
  deleteAction: string;
  readonlyDemo: string;
  disabledDemo: string;
  loadingDemo: string;

  alertActionAlt: string;
  clearActionAlt: string;
  searchActionAlt: string;
  verifyActionAlt: string;
  deleteActionAlt: string;
};

type TextareaDemoValues = {
  comment1: string;
  comment2: string;
  comment3: string;
  comment4: string;
  comment5: string;
  comment6: string;
};

type CommunityWorkspaceValues = {
  communityName: string;
  inviteCode: string;
  topicSearch: string;
  announcement: string;
  creatorNote: string;
  assetSearch: string;
};

type ToastState = { open: boolean; title: string; message?: string };

function sleep(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

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
    [autoCloseMs, close]
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
  const shouldReduceMotion = useReducedMotion();

  const enterX = shouldReduceMotion ? 0 : isRTL ? -18 : 18;

  return (
    <AnimatePresence>
      {state.open ? (
        <motion.div
          key="toast"
          className={cn(
            "fixed bottom-5 z-50",
            // RTL/LTR safe positioning (inline-end)
            "[inset-inline-end:1.25rem]"
          )}
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10, x: enterX }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: shouldReduceMotion ? 0 : 10, x: enterX }}
          transition={{ duration: 0.2 }}
        >
          <div
            className={cn(
              "w-[min(92vw,380px)]",
              "border border-[var(--color-border-subtle)]",
              "bg-[var(--color-background-elevated)]",
              "shadow-[var(--shadow-md)]",
              "rounded-2xl p-4"
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "mt-0.5",
                  "h-9 w-9 rounded-xl",
                  "flex items-center justify-center",
                  "bg-[var(--color-surface)]",
                  "border border-[var(--color-border-subtle)]",
                  "text-[var(--color-foreground)]"
                )}
                aria-hidden
              >
                <FiInfo className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[var(--color-foreground)]">
                  {state.title}
                </p>
                {state.message ? (
                  <p className="mt-1 text-xs text-[var(--color-foreground-muted)]">
                    {state.message}
                  </p>
                ) : null}
              </div>

              <button
                type="button"
                onClick={onClose}
                className={cn(
                  "h-9 w-9 rounded-xl",
                  "flex items-center justify-center",
                  "text-[var(--color-foreground-muted)]",
                  "hover:text-[var(--color-foreground)]",
                  "hover:bg-[var(--color-surface)]",
                  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring-brand)]"
                )}
                aria-label="إغلاق"
              >
                <FiX className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
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
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-[var(--color-foreground-muted)]">
            {subtitle}
          </p>
        ) : null}
      </div>

      {children}
    </motion.section>
  );
}

function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.div
      className={cn(
        "border border-[var(--color-border-subtle)]",
        "bg-[var(--color-background-elevated)]",
        "shadow-[var(--shadow-md)]",
        "rounded-2xl p-6",
        className
      )}
      whileHover={shouldReduceMotion ? undefined : { y: -2 }}
      transition={{ duration: 0.18 }}
    >
      {children}
    </motion.div>
  );
}

export default function InputsExamplePage() {
  const { isRTL, direction } = useAppSelector((s) => s.state);
  const shouldReduceMotion = useReducedMotion();
  const { toast, notify, close } = useToast(2600);

  const pageEnterX = shouldReduceMotion ? 0 : isRTL ? 24 : -24;

  const sectionVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 10, x: pageEnterX },
    show: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: { duration: 0.28 },
    },
  } as const;

  // --------------------------
  // Signup (Error state الحقيقي)
  // --------------------------
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
    []
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
    // demo only
    console.log("Signup:", values);
    notify("تم إرسال النموذج", "هذه مجرد صفحة أمثلة لحالات الإدخال.");
  };

  // --------------------------
  // Action Showcase
  // --------------------------
  const showcase = useForm<ActionShowcaseValues>({
    mode: "onChange",
    defaultValues: {
      alertAction: "",
      clearAction: "Naruto",
      searchAction: "",
      verifyAction: "luffy@onepiece.dev",
      deleteAction: "نص مؤقت للحذف",
      readonlyDemo: "قيمة للقراءة فقط",
      disabledDemo: "قيمة معطلة",
      loadingDemo: "تحميل...",

      alertActionAlt: "",
      clearActionAlt: "One Piece",
      searchActionAlt: "",
      verifyActionAlt: "email@example.com",
      deleteActionAlt: "مؤقت...",
    },
  });

  const textareaDemo = useForm<TextareaDemoValues>({
    mode: "onChange",
    defaultValues: {
      comment1: "",
      comment2: "",
      comment3: "",
      comment4: "",
      comment5: "<تعليق>",
      comment6: "",
    },
  });

  const community = useForm<CommunityWorkspaceValues>({
    mode: "onChange",
    defaultValues: {
      communityName: "Manga Hub",
      inviteCode: "OP-2026",
      topicSearch: "",
      announcement: "أطلقنا مساحة جديدة للـ Producers 🎬",
      creatorNote: "ملاحظات: راجع جودة الترجمة قبل النشر.",
      assetSearch: "",
    },
  });

  const [searching, setSearching] = React.useState(false);
  const [verifying, setVerifying] = React.useState(false);
  const [verified, setVerified] = React.useState(false);

  const [searchingAlt, setSearchingAlt] = React.useState(false);
  const [verifyingAlt, setVerifyingAlt] = React.useState(false);
  const [verifiedAlt, setVerifiedAlt] = React.useState(false);

  const [inviteChecking, setInviteChecking] = React.useState(false);
  const [inviteOk, setInviteOk] = React.useState(false);

  const runSearch = React.useCallback(async () => {
    if (searching) return;
    setSearching(true);
    notify("بدء البحث", "جارِ تنفيذ عملية بحث تجريبية...");
    await sleep(1400);
    setSearching(false);
    notify("انتهى البحث", "تمت العملية بنجاح.");
  }, [notify, searching]);

  const runVerify = React.useCallback(async () => {
    if (verifying) return;
    setVerified(false);
    setVerifying(true);
    notify("بدء التحقق", "جارِ التحقق من البريد...");
    await sleep(1400);
    setVerifying(false);
    setVerified(true);
    notify("تم التحقق", "البريد تم التحقق منه.");
  }, [notify, verifying]);

  const runSearchAlt = React.useCallback(async () => {
    if (searchingAlt) return;
    setSearchingAlt(true);
    await sleep(1200);
    setSearchingAlt(false);
    notify("انتهى البحث", "تمت العملية بنجاح.");
  }, [notify, searchingAlt]);

  const runVerifyAlt = React.useCallback(async () => {
    if (verifyingAlt) return;
    setVerifiedAlt(false);
    setVerifyingAlt(true);
    await sleep(1200);
    setVerifyingAlt(false);
    setVerifiedAlt(true);
    notify("تم التحقق", "البريد تم التحقق منه.");
  }, [notify, verifyingAlt]);

  const runInviteCheck = React.useCallback(async () => {
    if (inviteChecking) return;
    setInviteOk(false);
    setInviteChecking(true);
    notify("فحص الدعوة", "جارِ التحقق من كود الانضمام...");
    await sleep(1100);
    setInviteChecking(false);
    setInviteOk(true);
    notify("كود صحيح", "تم قبول كود الدعوة.");
  }, [inviteChecking, notify]);

  const pageContainer = cn(
    "min-h-dvh w-full",
    "bg-[var(--color-surface)]",
    "text-[var(--color-foreground)]",
    "px-6 py-10",
    // anime background (subtle)
    "bg-[radial-gradient(1200px_600px_at_50%_-20%,rgba(120,90,255,0.14),transparent_60%)]"
  );

  return (
    <div dir={direction} className={pageContainer}>
      <Toast state={toast} onClose={close} isRTL={isRTL} />

      <motion.div
        className="mx-auto w-full max-w-5xl space-y-10"
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: shouldReduceMotion
              ? undefined
              : { staggerChildren: 0.08 },
          },
        }}
      >
        {/* Header */}
        <motion.header
          variants={sectionVariants}
          className="flex flex-col gap-2"
        >
          <h1 className="text-2xl font-semibold">تجربة حقول الإدخال</h1>
          <p className="text-sm text-[var(--color-foreground-muted)]">
            أمثلة UI بطابع أنمي خفيف + حركات Framer Motion مع احترام RTL/LTR و
            Reduced Motion.
          </p>
        </motion.header>

        {/* Signup Card */}
        <motion.section variants={sectionVariants}>
          <Card>
            <div className="mb-6">
              <h2 className="text-xl font-semibold">نموذج تسجيل</h2>
              <p className="mt-1 text-sm text-[var(--color-foreground-muted)]">
                هذا القسم يوضح حالة الأخطاء (Error) بشكل واقعي عبر zod.
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
                  description="يظهر هنا وصف بسيط تحت الحقل."
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
                  placeholder="example@mail.com"
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

              <motion.button
                type="submit"
                disabled={signupForm.formState.isSubmitting}
                className={cn(
                  "mt-2 w-full",
                  "rounded-xl px-4 py-3 text-sm font-semibold",
                  "bg-[var(--color-accent)]",
                  "text-[var(--color-accent-foreground)]",
                  "shadow-[var(--shadow-sm)]",
                  "transition-opacity",
                  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring-brand)]",
                  "disabled:opacity-60 disabled:cursor-not-allowed"
                )}
                whileHover={
                  shouldReduceMotion || signupForm.formState.isSubmitting
                    ? undefined
                    : { scale: 1.01 }
                }
                whileTap={
                  shouldReduceMotion || signupForm.formState.isSubmitting
                    ? undefined
                    : { scale: 0.99 }
                }
              >
                إرسال
              </motion.button>
            </form>
          </Card>
        </motion.section>

        {/* Actions Showcase */}
        <SectionShell
          title="حالات الأزرار داخل الحقل (Action)"
          subtitle="زر بإيقونة فقط / زر بإيقونة + نص / زر Loading / زر Danger / Disabled / Readonly / Loading بدون action."
          variants={sectionVariants}
        >
          <Card>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="grid gap-5 md:grid-cols-2"
            >
              <AppInput<ActionShowcaseValues>
                name="alertAction"
                register={showcase.register}
                errors={showcase.formState.errors}
                label="تنبيه"
                placeholder="اكتب أي شيء..."
                description="زر Action (brand + outline)"
                startIcon={FiSearch}
                variant="outline"
                shape="rounded"
                action={{
                  icon: FiBell,
                  label: "تنبيه",
                  ariaLabel: "تنبيه",
                  appearance: "outline",
                  tone: "brand",
                  onClick: () => notify("تنبيه", "تم الضغط على زر التنبيه."),
                }}
              />

              <AppInput<ActionShowcaseValues>
                name="clearAction"
                register={showcase.register}
                errors={showcase.formState.errors}
                label="مسح سريع"
                placeholder="اكتب اسم أنمي..."
                description="neutral + soft — يمسح القيمة"
                startIcon={FiUser}
                variant="soft"
                shape="pill"
                action={{
                  icon: FiX,
                  ariaLabel: "مسح",
                  appearance: "soft",
                  tone: "neutral",
                  onClick: () => {
                    showcase.setValue("clearAction", "");
                    notify("تم المسح", "تم تفريغ الحقل.");
                  },
                }}
              />

              <AppInput<ActionShowcaseValues>
                name="searchAction"
                register={showcase.register}
                errors={showcase.formState.errors}
                label="بحث (Loading)"
                placeholder="ابحث عن مانغا..."
                description="brand + soft — Loading"
                startIcon={FiSearch}
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

              <AppInput<ActionShowcaseValues>
                name="verifyAction"
                register={showcase.register}
                errors={showcase.formState.errors}
                label="تحقق من البريد"
                placeholder="email@example.com"
                description="زر يتحول إلى Verified + solid"
                startIcon={FiMail}
                variant="outline"
                shape="rounded"
                dir="ltr"
                action={{
                  icon: verified ? FiCheck : FiLock,
                  label: verifying
                    ? "جارِ التحقق..."
                    : verified
                    ? "تم التحقق"
                    : "تحقق",
                  ariaLabel: "تحقق",
                  appearance: verified ? "solid" : "outline",
                  tone: "brand",
                  loading: verifying,
                  onClick: () => void runVerify(),
                }}
              />

              <AppInput<ActionShowcaseValues>
                name="deleteAction"
                register={showcase.register}
                errors={showcase.formState.errors}
                label="حذف (Danger)"
                placeholder="نص للحذف..."
                description="danger + outline — يمسح القيمة"
                startIcon={FiTrash2}
                variant="soft"
                shape="rounded"
                action={{
                  icon: FiTrash2,
                  label: "حذف",
                  ariaLabel: "حذف",
                  appearance: "outline",
                  tone: "danger",
                  onClick: () => {
                    showcase.setValue("deleteAction", "");
                    notify("تم الحذف", "تم تفريغ الحقل.");
                  },
                }}
              />

              <AppInput<ActionShowcaseValues>
                name="readonlyDemo"
                register={showcase.register}
                errors={showcase.formState.errors}
                label="Readonly"
                description="للقراءة فقط (بدون hover)، لكن يظهر focus عند التركيز"
                readOnly
                variant="outline"
                shape="rounded"
                startIcon={FiInfo}
              />

              <AppInput<ActionShowcaseValues>
                name="disabledDemo"
                register={showcase.register}
                errors={showcase.formState.errors}
                label="Disabled + Action"
                description="تعطيل الحقل + تعطيل زر الإجراء تلقائيًا"
                disabled
                variant="outline"
                shape="rounded"
                startIcon={FiLock}
                action={{
                  icon: FiBell,
                  ariaLabel: "معطل",
                  appearance: "outline",
                  tone: "neutral",
                  onClick: () => {},
                }}
              />

              <AppInput<ActionShowcaseValues>
                name="loadingDemo"
                register={showcase.register}
                errors={showcase.formState.errors}
                label="Loading (بدون Action)"
                description="spinner يظهر بدل action"
                loading
                variant="filled"
                shape="pill"
                startIcon={FiSearch}
              />
            </form>

            {/* Alt ideas */}
            <div className="mt-8 border-t border-[var(--color-border-subtle)] pt-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[var(--color-foreground)]">
                  أشكال بديلة لنفس الفكرة
                </h3>
                <span className="text-xs text-[var(--color-foreground-muted)]">
                  (نفس المنطق — UI مختلف)
                </span>
              </div>

              <form
                onSubmit={(e) => e.preventDefault()}
                className="grid gap-5 md:grid-cols-2"
              >
                <AppInput<ActionShowcaseValues>
                  name="alertActionAlt"
                  register={showcase.register}
                  errors={showcase.formState.errors}
                  label="تنبيه (Solid)"
                  placeholder="اكتب أي شيء..."
                  description="brand + solid"
                  startIcon={FiSearch}
                  variant="filled"
                  shape="pill"
                  action={{
                    icon: FiBell,
                    ariaLabel: "تنبيه",
                    appearance: "solid",
                    tone: "brand",
                    onClick: () => notify("تنبيه", "تم الضغط على زر الإجراء."),
                  }}
                />

                <AppInput<ActionShowcaseValues>
                  name="clearActionAlt"
                  register={showcase.register}
                  errors={showcase.formState.errors}
                  label="مسح (Outline + Label)"
                  placeholder="اكتب اسم..."
                  description="neutral + outline + label"
                  startIcon={FiUser}
                  variant="outline"
                  shape="rounded"
                  action={{
                    icon: FiX,
                    label: "مسح",
                    ariaLabel: "مسح",
                    appearance: "outline",
                    tone: "neutral",
                    onClick: () => {
                      showcase.setValue("clearActionAlt", "");
                      notify("تم المسح", "تم تفريغ الحقل.");
                    },
                  }}
                />

                <AppInput<ActionShowcaseValues>
                  name="searchActionAlt"
                  register={showcase.register}
                  errors={showcase.formState.errors}
                  label="بحث (Outline + Loading)"
                  placeholder="ابحث..."
                  description="brand + outline (loading)"
                  startIcon={FiSearch}
                  variant="soft"
                  shape="rounded"
                  action={{
                    icon: FiSearch,
                    ariaLabel: "بحث",
                    appearance: "outline",
                    tone: "brand",
                    loading: searchingAlt,
                    onClick: () => void runSearchAlt(),
                  }}
                />

                <AppInput<ActionShowcaseValues>
                  name="verifyActionAlt"
                  register={showcase.register}
                  errors={showcase.formState.errors}
                  label="تحقق (Soft -> Solid)"
                  placeholder="email@example.com"
                  description="soft ثم solid بعد التحقق"
                  startIcon={FiMail}
                  variant="soft"
                  shape="pill"
                  dir="ltr"
                  action={{
                    icon: verifiedAlt ? FiCheck : FiLock,
                    label: verifyingAlt
                      ? "جارِ التحقق..."
                      : verifiedAlt
                      ? "تم التحقق"
                      : "تحقق",
                    ariaLabel: "تحقق",
                    appearance: verifiedAlt ? "solid" : "soft",
                    tone: "brand",
                    loading: verifyingAlt,
                    onClick: () => void runVerifyAlt(),
                  }}
                />

                <AppInput<ActionShowcaseValues>
                  name="deleteActionAlt"
                  register={showcase.register}
                  errors={showcase.formState.errors}
                  label="حذف (Soft)"
                  placeholder="نص..."
                  description="danger + soft"
                  startIcon={FiTrash2}
                  variant="outline"
                  shape="rounded"
                  action={{
                    icon: FiTrash2,
                    ariaLabel: "حذف",
                    appearance: "soft",
                    tone: "danger",
                    onClick: () => {
                      showcase.setValue("deleteActionAlt", "");
                      notify("تم الحذف", "تم تفريغ الحقل.");
                    },
                  }}
                />
              </form>
            </div>

            {/* Matrix */}
            <div className="mt-8 border-t border-[var(--color-border-subtle)] pt-6">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-[var(--color-foreground)]">
                  Matrix (كل الحالات المهمة)
                </h3>
                <p className="mt-1 text-xs text-[var(--color-foreground-muted)]">
                  sizes / variants / shapes / textarea
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <AppInput<ActionShowcaseValues>
                  name="alertAction"
                  register={showcase.register}
                  errors={showcase.formState.errors}
                  label="sm + outline + square"
                  placeholder="اكتب..."
                  startIcon={FiInfo}
                  size="sm"
                  variant="outline"
                  shape="square"
                />

                <AppInput<ActionShowcaseValues>
                  name="searchAction"
                  register={showcase.register}
                  errors={showcase.formState.errors}
                  label="md + soft + rounded + action"
                  placeholder="بحث..."
                  startIcon={FiSearch}
                  size="md"
                  variant="soft"
                  shape="rounded"
                  action={{
                    icon: FiSearch,
                    ariaLabel: "بحث",
                    appearance: "outline",
                    tone: "brand",
                    onClick: () => void runSearch(),
                  }}
                />

                <AppInput<ActionShowcaseValues>
                  name="verifyAction"
                  register={showcase.register}
                  errors={showcase.formState.errors}
                  label="lg + filled + pill"
                  placeholder="البريد..."
                  startIcon={FiMail}
                  size="lg"
                  variant="filled"
                  shape="pill"
                  dir="ltr"
                />

                <AppInput<ActionShowcaseValues>
                  name="deleteAction"
                  register={showcase.register}
                  errors={showcase.formState.errors}
                  label="textarea + soft + action"
                  placeholder="اكتب تعليق..."
                  description="as='textarea' + action chip"
                  as="textarea"
                  startIcon={FiUser}
                  variant="soft"
                  shape="rounded"
                  action={{
                    icon: FiTrash2,
                    label: "مسح",
                    ariaLabel: "مسح",
                    appearance: "soft",
                    tone: "danger",
                    onClick: () => showcase.setValue("deleteAction", ""),
                  }}
                />
              </div>
            </div>
          </Card>
        </SectionShell>

        {/* Community + Producers Workspace (new examples) */}
        <SectionShell
          title="أمثلة مجتمع + Workspace للـ Producers"
          subtitle="نفس AppInput لكن بسيناريوهات أقرب لمنصة أنمي/مانغا: إنشاء مجتمع، كود دعوة، بحث مواضيع، ملاحظات إنتاج، بحث أصول."
          variants={sectionVariants}
        >
          <Card>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="grid gap-5 md:grid-cols-2"
            >
              <AppInput<CommunityWorkspaceValues>
                name="communityName"
                register={community.register}
                errors={community.formState.errors}
                label="اسم المجتمع"
                placeholder="مثال: Manga Hub"
                description="اسم يظهر للأعضاء + داخل نتائج البحث."
                startIcon={FiUsers}
                variant="soft"
                shape="rounded"
                action={{
                  icon: FiEdit3,
                  ariaLabel: "تعديل الاسم",
                  appearance: "soft",
                  tone: "neutral",
                  onClick: () =>
                    notify("تعديل", "مثال: افتح مودال تحرير الاسم."),
                }}
              />

              <AppInput<CommunityWorkspaceValues>
                name="inviteCode"
                register={community.register}
                errors={community.formState.errors}
                label="كود الدعوة"
                placeholder="OP-2026"
                description="للانضمام السريع (أفضل LTR لو الكود لاتيني)."
                startIcon={FiLink}
                dir="ltr"
                variant="outline"
                shape="pill"
                action={{
                  icon: inviteOk ? FiCheck : FiHash,
                  label: inviteChecking
                    ? "جارِ الفحص..."
                    : inviteOk
                    ? "صحيح"
                    : "تحقق",
                  ariaLabel: "تحقق من كود الدعوة",
                  appearance: inviteOk ? "solid" : "outline",
                  tone: "brand",
                  loading: inviteChecking,
                  onClick: () => void runInviteCheck(),
                }}
              />

              <AppInput<CommunityWorkspaceValues>
                name="topicSearch"
                register={community.register}
                errors={community.formState.errors}
                label="بحث مواضيع المجتمع"
                placeholder="ابحث عن: One Piece"
                description="Stagger في الصفحة + hover على الحقل."
                startIcon={FiSearch}
                variant="filled"
                shape="rounded"
                action={{
                  icon: FiSearch,
                  ariaLabel: "بحث",
                  appearance: "soft",
                  tone: "brand",
                  onClick: () => notify("بحث", "مثال: افتح صفحة نتائج البحث."),
                }}
              />

              <AppInput<CommunityWorkspaceValues>
                name="assetSearch"
                register={community.register}
                errors={community.formState.errors}
                label="بحث أصول الإنتاج"
                placeholder="Asset: background_01..."
                description="مثال Producers: بحث عن ملفات/صور."
                startIcon={FiUploadCloud}
                dir="ltr"
                variant="soft"
                shape="rounded"
                action={{
                  icon: FiSend,
                  ariaLabel: "فتح النتائج",
                  appearance: "outline",
                  tone: "neutral",
                  onClick: () => notify("فتح", "مثال: انتقل لصفحة الأصول."),
                }}
              />

              <AppInput<CommunityWorkspaceValues>
                name="announcement"
                register={community.register}
                errors={community.formState.errors}
                as="textarea"
                label="إعلان للمجتمع"
                placeholder="اكتب إعلان..."
                description="مثال Admin: إعلان مثبت للأعضاء."
                startIcon={FiBell}
                variant="soft"
                shape="rounded"
                action={{
                  icon: FiSend,
                  label: "نشر",
                  ariaLabel: "نشر الإعلان",
                  appearance: "solid",
                  tone: "brand",
                  onClick: () => notify("نشر", "تم نشر الإعلان (تجريبي)."),
                }}
              />

              <AppInput<CommunityWorkspaceValues>
                name="creatorNote"
                register={community.register}
                errors={community.formState.errors}
                as="textarea"
                label="ملاحظة للـ Producers"
                placeholder="ملاحظات..."
                description="ملاحظات إنتاج داخل Workspace."
                startIcon={FiInfo}
                variant="outline"
                shape="rounded"
                action={{
                  icon: FiTrash2,
                  label: "مسح",
                  ariaLabel: "مسح الملاحظة",
                  appearance: "soft",
                  tone: "danger",
                  onClick: () => {
                    community.setValue("creatorNote", "");
                    notify("تم المسح", "تم تفريغ الملاحظة.");
                  },
                }}
              />
            </form>
          </Card>
        </SectionShell>

        {/* Textarea Examples */}
        <SectionShell
          title="أمثلة Textarea"
          subtitle="نفس النصوص — اختلاف UI فقط + مثال Action داخل textarea."
          variants={sectionVariants}
        >
          <Card>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="grid gap-5 md:grid-cols-2"
            >
              <AppInput<TextareaDemoValues>
                name="comment1"
                register={textareaDemo.register}
                errors={textareaDemo.formState.errors}
                as="textarea"
                label="تعليق"
                placeholder="اكتب هنا..."
                description="outline + rounded"
                startIcon={FiUser}
                variant="outline"
                shape="rounded"
                size="md"
              />

              <AppInput<TextareaDemoValues>
                name="comment2"
                register={textareaDemo.register}
                errors={textareaDemo.formState.errors}
                as="textarea"
                label="تعليق"
                placeholder="اكتب هنا..."
                description="soft + rounded"
                startIcon={FiUser}
                variant="soft"
                shape="rounded"
                size="md"
              />

              <AppInput<TextareaDemoValues>
                name="comment3"
                register={textareaDemo.register}
                errors={textareaDemo.formState.errors}
                as="textarea"
                label="تعليق"
                placeholder="اكتب هنا..."
                description="filled + pill"
                startIcon={FiUser}
                variant="filled"
                shape="pill"
                size="md"
              />

              <AppInput<TextareaDemoValues>
                name="comment4"
                register={textareaDemo.register}
                errors={textareaDemo.formState.errors}
                as="textarea"
                label="تعليق"
                placeholder="اكتب هنا..."
                description="textarea + action (danger)"
                startIcon={FiUser}
                variant="soft"
                shape="rounded"
                size="md"
                action={{
                  icon: FiTrash2,
                  label: "مسح",
                  ariaLabel: "مسح",
                  appearance: "soft",
                  tone: "danger",
                  onClick: () => textareaDemo.setValue("comment4", ""),
                }}
              />

              <AppInput<TextareaDemoValues>
                name="comment5"
                register={textareaDemo.register}
                errors={textareaDemo.formState.errors}
                as="textarea"
                label="تعليق"
                placeholder="اكتب هنا..."
                description="sm + square"
                startIcon={FiUser}
                variant="outline"
                shape="square"
                size="sm"
              />

              <AppInput<TextareaDemoValues>
                name="comment6"
                register={textareaDemo.register}
                errors={textareaDemo.formState.errors}
                as="textarea"
                label="تعليق"
                placeholder="اكتب هنا..."
                description="lg + filled + action solid"
                startIcon={FiUser}
                variant="filled"
                shape="rounded"
                size="lg"
                action={{
                  icon: FiCheck,
                  label: "إرسال",
                  ariaLabel: "إرسال",
                  appearance: "solid",
                  tone: "brand",
                  onClick: () =>
                    notify("إرسال", "تم الضغط على إرسال (تجريبي)."),
                }}
              />
            </form>
          </Card>
        </SectionShell>
      </motion.div>
    </div>
  );
}
