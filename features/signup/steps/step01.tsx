// features/signup/steps/step01.tsx
"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { AnimatePresence, LazyMotion, domAnimation, m } from "framer-motion";
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
} from "react-icons/hi";
import { useTranslations } from "next-intl";

import { Button, IconButton, AppInput } from "@/design";
import { cn } from "@/utils";
import { AppleIcon, GoogleIcon, MicrosoftIcon } from "@/assets";
import { useAppSelector } from "@/store/hooks";
import { useEmailDomainBlocklist } from "@/hooks/useEmailDomainBlocklist";
import { EMAIL_RE, PASSWORD_RE } from "@/constants";

import { useSignupMutation } from "../api";
import type { SignupStepProps } from "../types";
import { FOCUS_RING } from "../constants";
import { useStepMotion } from "../ui/useStepMotion";

type FormValues = {
  email: string;
  password: string;
  agree: boolean;
};

const ERR_BLOCKED_DOMAIN = "blocked_domain";

export default function Step01({ onSuccess }: SignupStepProps) {
  const t = useTranslations("");
  const { isRTL } = useAppSelector((s) => s.state);
  const { isBlocked } = useEmailDomainBlocklist();

  const { reduceMotion, v } = useStepMotion();

  const [signup, { isLoading: isMutating }] = useSignupMutation();
  const [showPass, setShowPass] = useState(false);
  const checkboxId = useId();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid, touchedFields, submitCount },
    watch,
    setError,
    clearErrors,
  } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: { email: "", password: "", agree: false },
  });

  const email = watch("email");
  const password = watch("password");
  const agree = watch("agree");

  useEffect(() => {
    if (
      errors.email?.type === ERR_BLOCKED_DOMAIN &&
      email &&
      !isBlocked(email)
    ) {
      clearErrors("email");
    }
  }, [email, errors.email?.type, isBlocked, clearErrors]);

  const busy = isSubmitting || isMutating;
  const canSubmit = isValid && agree && !busy;

  const toggleShowPass = useCallback(() => setShowPass((x) => !x), []);

  const emailRules = useMemo(
    () => ({
      required: t("messages.signup.email.required"),
      pattern: { value: EMAIL_RE, message: t("messages.signup.email.invalid") },
    }),
    [t],
  );

  const passwordRules = useMemo(
    () => ({
      required: t("messages.signup.password.string"),
      minLength: { value: 8, message: t("messages.signup.password.min") },
      pattern: {
        value: PASSWORD_RE,
        message: t("messages.signup.password.pattern"),
      },
    }),
    [t],
  );

  const passwordError =
    typeof errors.password?.message === "string" ? errors.password.message : "";

  const passwordTouched =
    Boolean(touchedFields.password) || submitCount > 0 || password.length > 0;

  const passwordCaption = useMemo(() => {
    if (!passwordTouched) return undefined;

    const content = passwordError ? (
      <span className="text-danger-solid">{passwordError}</span>
    ) : (
      <span>{t("signup_steps.password.hint")}</span>
    );

    return (
      <AnimatePresence mode="wait" initial={false}>
        <m.span
          key={passwordError ? "err" : "hint"}
          initial={v.microMsg.initial}
          animate={v.microMsg.animate}
          exit={v.microMsg.exit}
        >
          {content}
        </m.span>
      </AnimatePresence>
    );
  }, [passwordTouched, passwordError, t, v.microMsg]);

  const onSubmit = async (values: FormValues) => {
    if (isBlocked(values.email)) {
      setError("email", {
        type: ERR_BLOCKED_DOMAIN,
        message: t("messages.signup.email.temp_not_allowed"),
      });
      return;
    }

    try {
      await signup({
        email: values.email,
        password: values.password,
        agree: values.agree,
      }).unwrap();
      onSuccess();
    } catch (e: any) {
      console.log("e: ", e);
      setError("email", {
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

  return (
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
          <h1 className={titleCls}>{t("signup_steps.title")}</h1>
          <p
            className={cn(
              "mx-auto mt-1.5 max-w-[40ch] leading-relaxed",
              subtitleCls,
            )}
          >
            {t("signup_steps.subtitle")}
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
            name="email"
            register={register}
            errors={errors}
            label={t("signup_steps.email.label")}
            placeholder={t("signup_steps.email.placeholder")}
            autoComplete="email"
            inputMode="email"
            startIcon={HiOutlineMail}
            variant="outline"
            size="lg"
            registerOptions={emailRules}
          />

          <AppInput<FormValues>
            name="password"
            register={register}
            errors={errors}
            label={t("signup_steps.password.label")}
            placeholder={t("signup_steps.password.placeholder")}
            autoComplete="new-password"
            type={showPass ? "text" : "password"}
            startIcon={HiOutlineLockClosed}
            variant="outline"
            size="lg"
            description={passwordCaption}
            registerOptions={passwordRules}
            action={{
              ariaLabel: showPass
                ? t("signup_steps.password.hide")
                : t("signup_steps.password.show"),
              onClick: toggleShowPass,
              icon: showPass ? HiOutlineEyeOff : HiOutlineEye,
              tone: "neutral",
              appearance: "outline",
            }}
            helperClassName={
              passwordError ? "text-danger-solid" : "text-foreground-muted"
            }
          />
        </m.div>

        <m.div
          className="mt-2 space-y-1 transform-gpu"
          variants={v.scaleIn}
          style={
            reduceMotion ? undefined : { willChange: "transform, opacity" }
          }
        >
          <label
            htmlFor={checkboxId}
            className={cn(
              "group flex min-w-0 items-center gap-2 rounded-xl border bg-surface/60 px-3 py-2 transition hover:bg-background-elevated/60",
              errors.agree?.message
                ? "border-danger-soft-border"
                : "border-border-subtle",
            )}
          >
            <input
              id={checkboxId}
              type="checkbox"
              className={cn(
                "h-4 w-4 rounded border border-border-strong bg-surface accent-[var(--color-accent)]",
                FOCUS_RING,
              )}
              {...register("agree", {
                required: t("signup_steps.terms.required"),
              })}
            />

            <span className="min-w-0 truncate whitespace-nowrap text-[12.5px] leading-5 text-foreground-muted">
              {t("signup_steps.terms.text")}{" "}
              <Link
                href="/policy-terms-center"
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  "rounded-md text-foreground underline decoration-border-strong underline-offset-4 hover:opacity-90",
                  FOCUS_RING,
                )}
              >
                {t("signup_steps.terms.link")}
              </Link>
            </span>
          </label>

          <AnimatePresence initial={false}>
            {errors.agree?.message ? (
              <m.p
                key="agree-err"
                className="text-[12px] leading-4 text-danger-solid"
                initial={v.microErr.initial}
                animate={v.microErr.animate}
                exit={v.microErr.exit}
              >
                {t("signup_steps.terms.required")}
              </m.p>
            ) : null}
          </AnimatePresence>
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
            loadingText={t("signup_steps.submit.loading")}
            disabled={!canSubmit}
            className={cn(
              "shadow-[var(--shadow-glow-brand)] hover:brightness-[1.05] active:brightness-[0.98] disabled:shadow-none",
              FOCUS_RING,
            )}
          >
            {t("signup_steps.submit.button")}
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
            {t("signup_steps.divider")}
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
            tooltip={t("signup_steps.social.google")}
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
            tooltip={t("signup_steps.social.apple")}
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
            tooltip={t("signup_steps.social.microsoft")}
            onClick={() => onSocial("microsoft")}
            shape="rounded"
          >
            <MicrosoftIcon className="h-4 w-4" />
          </IconButton>
        </m.div>
      </m.form>
    </LazyMotion>
  );
}
