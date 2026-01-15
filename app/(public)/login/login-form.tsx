// app/(public)/login/login-form.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { motion } from "framer-motion";

import { loginSchema, type LoginFormValues } from "@/validation/login-schema";
import { useAppSelector } from "@/redux/hooks";
import { DesignButton } from "@/design/button";
import Input from "@/design/Input";

export function LoginForm() {
  const t = useTranslations("login");
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const { isRTL } = useAppSelector(({ state }) => state);
  console.log("isRtl: ", isRTL);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
    defaultValues: {
      email: "",
      password: "",
      remember_me: true, // ✅ تذكرني مفعّل افتراضياً
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);

    try {
      // TODO: اربط هنا مع API / server action الخاصة بتسجيل الدخول
      console.log("login values: ", values);

      // مثال:
      // await login(values);
      // router.push("/feed");
    } catch (error) {
      console.error(error);
      setServerError(t("generic_error"));
    }
  };

  const emailErrorKey = errors.email?.message as string | undefined;
  const passwordErrorKey = errors.password?.message as string | undefined;

  const iconBaseClass = `pointer-events-none absolute inset-y-0 flex items-center 
  text-foreground-soft transition-transform duration-150
    
    group-focus-within:-translate-y-px group-focus-within:scale-110`;

  const iconPositionClass = isRTL ? "right-3" : "left-3";
  const inputPadding = isRTL ? "pr-9 pl-3" : "pl-9 pr-3";

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      // ✅ className بسطر واحد عشان نزيل اختلاف السيرفر / الكلاينت
      className="login-card group w-full max-w-md rounded-3xl border border-border-subtle bg-surface/95 p-6 shadow-[var(--shadow-elevated)] backdrop-blur-xl transition-shadow sm:p-8"
    >
      {/* العنوان */}
      <div className="mb-6 space-y-2 text-center">
        <h1 className="text-lg font-semibold text-foreground sm:text-xl">
          {t("headline")}
        </h1>
        <p className="text-xs text-foreground-muted sm:text-sm">
          {t("subheadline")}
        </p>
      </div>

      <div className="mb-4 h-px w-full bg-border-subtle/70" />

      {/* خطأ عام من السيرفر */}
      {serverError && (
        <div className="mb-4 rounded-xl border border-danger-soft-border bg-danger-soft px-3 py-2 text-xs text-danger-700">
          {serverError}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
        noValidate
        autoComplete="on"
      >
        <Input
          size="lg"
          label="login.email_label"
          placeholder="login.email_placeholder"
          type="email"
          autoComplete="email"
          icon={<FiMail className="h-4 w-4" />}
          registration={register("email")}
          error={errors.email?.message}
        />

        {/* INPUT: email */}
        <div className="space-y-1">
          <label
            htmlFor="email"
            // ✅ تكبير العنوان
            className="mb-1 block text-sm font-medium text-foreground-muted"
          >
            {t("email_label")}
          </label>

          <div className="group relative">
            <span className={`${iconBaseClass} ${iconPositionClass}`}>
              <FiMail className="h-4 w-4" />
            </span>

            <input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder={t("email_placeholder")}
              {...register("email")}
              aria-invalid={!!errors.email}
              aria-describedby={emailErrorKey ? "email-error" : undefined}
              className={`
                w-full rounded-2xl border bg-background/90 ${inputPadding} py-2.5
                text-sm text-foreground shadow-[var(--shadow-xs)]
                placeholder:text-foreground-soft/70
                transition
                hover:border-accent/70 hover:bg-background
                focus:border-accent focus:bg-background
                focus:ring-2 focus:ring-accent/40 focus:ring-offset-0
                focus:outline-none focus:shadow-[var(--shadow-md)]
                sm:text-sm
                ${
                  errors.email
                    ? "border-danger-500 focus:ring-danger-soft-ring focus:shadow-[var(--shadow-glow-danger)]"
                    : "border-border-subtle"
                }
              `}
            />
          </div>

          {emailErrorKey && (
            <p id="email-error" className="mt-1 text-[11px] text-danger-600">
              {t(emailErrorKey as any)}
            </p>
          )}
        </div>

        <Input
          id="password"
          size="md"
          label="login.password_label"
          placeholder="login.password_placeholder"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          icon={<FiLock className="h-4 w-4" />}
          registration={register("password")}
          error={errors.password?.message}
          btn={
            <DesignButton
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              size="icon-xs"
              shape="circle"
              variant="soft"
              tone="neutral"
              elevation="soft"
              className="bg-surface-muted text-foreground-strong"
              // tooltip={t(showPassword ? "hide_password" : "show_password")}
            >
              {showPassword ? (
                <FiEyeOff className="h-3.5 w-3.5" />
              ) : (
                <FiEye className="h-3.5 w-3.5" />
              )}
            </DesignButton>
          }
        />

        {/* INPUT: password */}
        <div className="space-y-1">
          <label
            htmlFor="password"
            // ✅ تكبير العنوان
            className="mb-1 block text-sm font-medium text-foreground-muted"
          >
            {t("password_label")}
          </label>

          <div className="group relative">
            <span className={`${iconBaseClass} ${iconPositionClass}`}>
              <FiLock className="h-4 w-4" />
            </span>

            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder={t("password_placeholder")}
              {...register("password")}
              aria-invalid={!!errors.password}
              aria-describedby={passwordErrorKey ? "password-error" : undefined}
              className={`
                w-full rounded-2xl border bg-background/90 ${inputPadding} py-2.5
                text-sm text-foreground shadow-[var(--shadow-xs)]
                placeholder:text-foreground-soft/70
                transition
                hover:border-accent/70 hover:bg-background
                focus:border-accent focus:bg-background
                focus:ring-2 focus:ring-accent/40 focus:ring-offset-0
                focus:outline-none focus:shadow-[var(--shadow-md)]
                sm:text-sm
                ${
                  errors.password
                    ? "border-danger-500 focus:ring-danger-soft-ring focus:shadow-[var(--shadow-glow-danger)]"
                    : "border-border-subtle"
                }
              `}
            />
          </div>

          {passwordErrorKey && (
            <p id="password-error" className="mt-1 text-[11px] text-danger-600">
              {t(passwordErrorKey as any)}
            </p>
          )}
        </div>

        {/* remember + forgot */}
        <div className="flex items-center justify-between gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-xs text-foreground-muted">
            <input
              type="checkbox"
              {...register("remember_me")}
              className="h-3.5 w-3.5 rounded border-border-subtle bg-background accent-accent"
            />
            <span>{t("remember_me")}</span>
          </label>

          <Link
            href="/forgot-password"
            className="cursor-pointer text-xs font-medium text-accent hover:underline"
          >
            {t("forgot_password")}
          </Link>
        </div>

        {/* زر تسجيل الدخول */}
        <motion.button
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          whileHover={{ y: -2, scale: 1.01 }}
          whileTap={{ scale: 0.97, y: 0 }}
          // ✅ className بسطر واحد + الشادو فقط في hover / focus
          className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-2xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-[filter,box-shadow,transform] hover:brightness-110 hover:shadow-[var(--shadow-glow-brand)] focus-visible:shadow-[var(--shadow-glow-brand)] disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring"
        >
          <span className="relative z-10 flex items-center gap-2">
            {isSubmitting && (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border border-accent-foreground/40 border-t-transparent" />
            )}
            <span>
              {isSubmitting ? t("primary_button_loading") : t("primary_button")}
            </span>
          </span>
        </motion.button>
      </form>

      {/* فاصل أو */}
      <div className="mt-6 flex items-center gap-3 text-xs text-foreground-muted">
        <div className="h-px flex-1 bg-border-subtle/70" />
        <span>{t("or")}</span>
        <div className="h-px flex-1 bg-border-subtle/70" />
      </div>

      {/* Google */}
      <button
        type="button"
        onClick={() => console.log("login with google")}
        // ✅ className بسطر واحد
        className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-border-subtle bg-surface-soft px-4 py-2.5 text-sm font-medium text-foreground shadow-[var(--shadow-sm)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35"
        aria-label={t("login_with_google")}
      >
        <FcGoogle className="h-5 w-5" />
        <span className="truncate">{t("login_with_google")}</span>
      </button>

      {/* Apple */}
      <button
        type="button"
        onClick={() => console.log("login with apple")}
        // ✅ className بسطر واحد
        className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-border-subtle bg-surface-soft px-4 py-2.5 text-sm font-medium text-foreground shadow-[var(--shadow-sm)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35"
        aria-label={t("login_with_apple")}
      >
        <FaApple className="h-5 w-5" />
        <span className="truncate">{t("login_with_apple")}</span>
      </button>

      {/* رابط التسجيل */}
      <p className="mt-5 text-center text-xs text-foreground-muted">
        {t("no_account")}{" "}
        <Link
          href="/signup"
          className="cursor-pointer font-medium text-accent hover:underline"
        >
          {t("signup_link")}
        </Link>
      </p>
    </motion.div>
  );
}
