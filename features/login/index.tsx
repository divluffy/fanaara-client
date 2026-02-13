// features/login/index.tsx
"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { AnimatePresence, LazyMotion, domAnimation, m } from "framer-motion";
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineUser,
} from "react-icons/hi";
import { useTranslations } from "next-intl";

import { Button, IconButton, AppInput } from "@/design";
import { cn } from "@/utils";
import { AppleIcon, GoogleIcon, MicrosoftIcon } from "@/assets";
import { useAppSelector } from "@/store/hooks";
import { EMAIL_RE } from "@/constants";

// Reuse the exact same motion + focus styles from signup step 1
import { FOCUS_RING } from "../signup/constants";
import { useStepMotion } from "../signup/ui/useStepMotion";

import { useLoginMutation } from "./api";

type FormValues = {
  identifier: string; // email OR username
  password: string;
};

// Keep it permissive (adjust to match backend rules exactly)
const USERNAME_RE = /^[a-zA-Z0-9._]{3,30}$/;

export default function LoginFeature() {
  const t = useTranslations("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo =
    searchParams.get("redirect") || searchParams.get("next") || "/";

  const { isRTL } = useAppSelector((s) => s.state);
  const { reduceMotion, v } = useStepMotion();

  const [login, { isLoading: isMutating }] = useLoginMutation();
  const [showPass, setShowPass] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid, touchedFields, submitCount },
    watch,
    setError,
  } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: { identifier: "", password: "" },
  });

  const identifier = watch("identifier");
  const password = watch("password");

  const busy = isSubmitting || isMutating;
  const canSubmit = isValid && !busy;

  const toggleShowPass = useCallback(() => setShowPass((x) => !x), []);

  const identifierRules = useMemo(
    () => ({
      required: t("messages.login.identifier.required"),
      validate: (value: string) => {
        const v = value.trim();
        if (!v) return t("messages.login.identifier.required");

        // if it looks like an email -> validate as email
        if (v.includes("@")) {
          return (
            EMAIL_RE.test(v) || t("messages.login.identifier.invalid_email")
          );
        }

        // otherwise validate as username
        return (
          USERNAME_RE.test(v) || t("messages.login.identifier.invalid_username")
        );
      },
    }),
    [t],
  );

  // Login should be less strict than signup (avoid blocking valid existing passwords)
  const passwordRules = useMemo(
    () => ({
      required: t("messages.login.password.required"),
      minLength: { value: 6, message: t("messages.login.password.min") },
    }),
    [t],
  );

  const identifierError =
    typeof errors.identifier?.message === "string"
      ? errors.identifier.message
      : "";

  const identifierTouched =
    Boolean(touchedFields.identifier) ||
    submitCount > 0 ||
    identifier.trim().length > 0;

  const identifierCaption = useMemo(() => {
    if (!identifierTouched) return undefined;

    const content = identifierError ? (
      <span className="text-danger-solid">{identifierError}</span>
    ) : (
      <span>{t("login.identifier.hint")}</span>
    );

    return (
      <AnimatePresence mode="wait" initial={false}>
        <m.span
          key={identifierError ? "err" : "hint"}
          initial={v.microMsg.initial}
          animate={v.microMsg.animate}
          exit={v.microMsg.exit}
        >
          {content}
        </m.span>
      </AnimatePresence>
    );
  }, [identifierTouched, identifierError, t, v.microMsg]);

  const onSubmit = async (values: FormValues) => {
    try {
      await login({
        identifier: values.identifier.trim(),
        password: values.password,
      }).unwrap();

      router.replace(redirectTo);
      router.refresh();
    } catch (e: any) {
      // Put server error under identifier to make it immediately visible
      setError("identifier", {
        type: "server",
        message: t(e?.data?.message || "messages.error.unknown"),
      });
    }
  };

  const onSocial = (provider: "google" | "apple" | "microsoft") => {
    const api = process.env.NEXT_PUBLIC_API_URL;
    if (!api) return;
    window.location.assign(`${api}/api/auth/oauth/${provider}/start`);
  };

  const titleCls =
    "text-[18px] sm:text-[20px] font-extrabold leading-tight text-foreground-strong";
  const subtitleCls = "text-[12px] sm:text-[13px] text-foreground-muted";

  const startIcon = identifier.trim().includes("@")
    ? HiOutlineMail
    : HiOutlineUser;

  return (
    <div
      className={cn(
        "relative z-10 mx-auto w-full max-w-md px-4 pb-6",
        "flex flex-col justify-center",
        "min-h-[calc(100dvh-5rem)] md:min-h-[calc(100dvh-6rem)]",
      )}
    >
      <section className="bg-background relative w-full max-w-[460px] rounded-3xl border border-border-subtle/70 px-4 py-5 sm:px-6 sm:py-6">
        <LazyMotion features={domAnimation}>
          <m.form
            onSubmit={handleSubmit(onSubmit)}
            className="relative"
            variants={v.container}
            initial="hidden"
            animate="show"
          >
            <m.header
              className="text-center transform-gpu"
              variants={v.header}
              style={
                reduceMotion ? undefined : { willChange: "transform, opacity" }
              }
            >
              <h1 className={titleCls}>{t("login.title")}</h1>
              <p
                className={cn(
                  "mx-auto mt-1.5 max-w-[44ch] leading-relaxed",
                  subtitleCls,
                )}
              >
                {t("login.subtitle")}
              </p>
            </m.header>

            <m.div
              className="mt-4 space-y-3 transform-gpu"
              variants={v.fieldUp}
              style={
                reduceMotion ? undefined : { willChange: "transform, opacity" }
              }
            >
              <AppInput<FormValues>
                name="identifier"
                register={register}
                errors={errors}
                label={t("login.identifier.label")}
                placeholder={t("login.identifier.placeholder")}
                autoComplete="username"
                startIcon={startIcon}
                variant="outline"
                size="lg"
                description={identifierCaption}
                registerOptions={identifierRules}
                helperClassName={
                  identifierError
                    ? "text-danger-solid"
                    : "text-foreground-muted"
                }
              />

              <AppInput<FormValues>
                name="password"
                register={register}
                errors={errors}
                label={t("login.password.label")}
                placeholder={t("login.password.placeholder")}
                autoComplete="current-password"
                type={showPass ? "text" : "password"}
                startIcon={HiOutlineLockClosed}
                variant="outline"
                size="lg"
                registerOptions={passwordRules}
                action={{
                  ariaLabel: showPass
                    ? t("login.password.hide")
                    : t("login.password.show"),
                  onClick: toggleShowPass,
                  icon: showPass ? HiOutlineEyeOff : HiOutlineEye,
                  tone: "neutral",
                  appearance: "outline",
                }}
              />

              <m.div
                className={cn(
                  "flex items-center justify-between px-1",
                  isRTL && "flex-row-reverse",
                )}
                variants={v.scaleIn}
                style={
                  reduceMotion
                    ? undefined
                    : { willChange: "transform, opacity" }
                }
              >
                <span className="text-[11.5px] text-foreground-muted">
                  {t("login.links.tip")}
                </span>

                <Link
                  href="/forgot-password"
                  className={cn(
                    "rounded-md text-[11.5px] font-medium text-foreground underline decoration-border-strong underline-offset-4 hover:opacity-90",
                    FOCUS_RING,
                  )}
                >
                  {t("login.links.forgot")}
                </Link>
              </m.div>
            </m.div>

            <m.div
              className="mt-3.5 transform-gpu"
              variants={v.cta}
              style={
                reduceMotion ? undefined : { willChange: "transform, opacity" }
              }
              whileHover={reduceMotion ? undefined : { scale: 1.01 }}
              whileTap={reduceMotion ? undefined : { scale: 0.99 }}
            >
              <Button
                type="submit"
                variant="solid"
                tone="brand"
                size="xl"
                elevation="cta"
                fullWidth
                isLoading={busy}
                loadingText={t("login.submit.loading")}
                disabled={!canSubmit}
                className={cn(
                  "shadow-[var(--shadow-glow-brand)] hover:brightness-[1.05] active:brightness-[0.98] disabled:shadow-none",
                  FOCUS_RING,
                )}
              >
                {t("login.submit.button")}
              </Button>
            </m.div>

            <m.div
              className="mt-3.5 flex items-center gap-3 transform-gpu"
              variants={v.fieldUp}
              style={
                reduceMotion ? undefined : { willChange: "transform, opacity" }
              }
            >
              <div className="h-px flex-1 bg-divider" />
              <span className="text-[11px] text-foreground-muted">
                {t("login.divider")}
              </span>
              <div className="h-px flex-1 bg-divider" />
            </m.div>

            <m.div
              className={cn(
                "mt-2 flex items-center justify-center gap-2 p-2 transform-gpu",
                isRTL && "flex-row-reverse",
              )}
              variants={v.scaleIn}
              style={
                reduceMotion ? undefined : { willChange: "transform, opacity" }
              }
            >
              <IconButton
                type="button"
                aria-label="google"
                variant="soft"
                tone="brand"
                tooltip={t("login.social.google")}
                onClick={() => onSocial("google")}
                shape="rounded"
              >
                <GoogleIcon className="h-4 w-4" />
              </IconButton>

              <IconButton
                type="button"
                aria-label="apple"
                variant="soft"
                tone="brand"
                tooltip={t("login.social.apple")}
                onClick={() => onSocial("apple")}
                shape="rounded"
              >
                <AppleIcon className="h-4 w-4 text-foreground-strong" />
              </IconButton>

              <IconButton
                type="button"
                aria-label="microsoft"
                variant="soft"
                tone="brand"
                tooltip={t("login.social.microsoft")}
                onClick={() => onSocial("microsoft")}
                shape="rounded"
              >
                <MicrosoftIcon className="h-4 w-4" />
              </IconButton>
            </m.div>

            <m.div
              className="mt-2 text-center transform-gpu"
              variants={v.scaleIn}
              style={
                reduceMotion ? undefined : { willChange: "transform, opacity" }
              }
            >
              <span className="text-[12px] text-foreground-muted">
                {t("login.footer.text")}{" "}
              </span>
              <Link
                href="/signup"
                className={cn(
                  "rounded-md text-[12px] font-semibold text-foreground underline decoration-border-strong underline-offset-4 hover:opacity-90",
                  FOCUS_RING,
                )}
              >
                {t("login.footer.link")}
              </Link>
            </m.div>
          </m.form>
        </LazyMotion>
      </section>
    </div>
  );
}
