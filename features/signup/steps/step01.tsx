// features/signup/steps/step01.tsx
"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { motion, useReducedMotion } from "framer-motion";
import { Button, IconButton, AppInput } from "@/design";
import { cn } from "@/utils";
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
} from "react-icons/hi";
import { useTranslations } from "next-intl";
import { AppleIcon, GoogleIcon, MicrosoftIcon } from "@/assets";
import { useSignupMutation } from "../api";
import { useAppSelector } from "@/store/hooks";
import { SignupStep1Props } from "@/types";
import { useEmailDomainBlocklist } from "@/hooks/useEmailDomainBlocklist";
import { EMAIL_RE, PASSWORD_RE } from "@/constants";

type SignupStep1Values = {
  email: string;
  password: string;
  agree: boolean;
};

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)]";

const ERR_BLOCKED_DOMAIN = "blocked_domain";

export default function SignupStep1({ onSuccess }: SignupStep1Props) {
  const reduceMotion = useReducedMotion();
  const { isRTL } = useAppSelector((s) => s.state);
  const { isBlocked } = useEmailDomainBlocklist();

  const [showPass, setShowPass] = useState(false);

  const t = useTranslations("");

  const toggleShowPass = useCallback(() => setShowPass((v) => !v), []);

  const [signup, { isLoading: isMutating }] = useSignupMutation();

  const checkboxId = useId();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid, touchedFields, submitCount },
    watch,
    setError,
    clearErrors,
    control,
  } = useForm<SignupStep1Values>({
    mode: "onChange",
    defaultValues: { email: "", password: "", agree: false },
  });

  const emailValue = useWatch({ control, name: "email" }) ?? "";
  const passwordValue = useWatch({ control, name: "password" }) ?? "";
  const agree = useWatch({ control, name: "agree" }) ?? false;

  useEffect(() => {
    if (errors.email?.type === ERR_BLOCKED_DOMAIN && !isBlocked(emailValue)) {
      clearErrors("email");
    }
  }, [emailValue, errors.email?.type, isBlocked, clearErrors]);

  const passwordErrorText =
    typeof errors.password?.message === "string"
      ? errors.password.message
      : undefined;

  const passwordTouched =
    Boolean(touchedFields.password) ||
    submitCount > 0 ||
    passwordValue.length > 0;

  const passwordCaption = useMemo(() => {
    if (!passwordTouched) return undefined;
    return passwordErrorText ? (
      <span className="text-danger-solid">{passwordErrorText}</span>
    ) : (
      <span>{t("signup_steps.password.hint")}</span>
    );
  }, [passwordTouched, passwordErrorText, t]);

  const busy = isSubmitting || isMutating;
  const canSubmit = isValid && agree && !busy;

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

  const onSubmit = async (values: SignupStep1Values) => {
    // ✅ Temp email check only after clicking submit
    if (isBlocked(values.email)) {
      setError("email", {
        type: ERR_BLOCKED_DOMAIN,
        message: t("messages.signup.email.temp_not_allowed"),
      });
      return;
    }

    try {
      const res = await signup(values).unwrap();
      console.log("res: ", res);
      onSuccess();
    } catch (e: any) {
      console.log("e: ", e);

      setError("email", {
        type: "manual",
        message: t(e?.data?.message || "messages.error.unknown"),
      });
    }
  };

  function onSocial(provider: "google" | "apple" | "microsoft") {
    const api = process.env.NEXT_PUBLIC_API_URL;
    if (!api) {
      // handle error("Missing NEXT_PUBLIC_API_URL.");
      return;
    }
    window.location.href = `${api}/api/auth/oauth/${provider}/start`;
  }

  return (
    <div className="relative">
      <form onSubmit={handleSubmit(onSubmit)} className="relative">
        <motion.header
          className="text-center"
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <h1 className="text-[18px] sm:text-[20px] font-extrabold leading-tight text-foreground-strong">
            {t("signup_steps.title")}
          </h1>

          <p className="mx-auto mt-1.5 max-w-[40ch] text-[12.8px] sm:text-[13.2px] leading-relaxed text-foreground-muted">
            {t("signup_steps.subtitle")}
          </p>
        </motion.header>

        <div className="mt-4 space-y-3">
          <AppInput
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

          <AppInput
            name="password"
            register={register}
            errors={errors}
            label={t("signup_steps.password.label")}
            description={passwordCaption}
            placeholder={t("signup_steps.password.placeholder")}
            autoComplete="new-password"
            type={showPass ? "text" : "password"}
            startIcon={HiOutlineLockClosed}
            variant="outline"
            size="lg"
            action={{
              ariaLabel: showPass
                ? t("signup_steps.password.hide")
                : t("signup_steps.password.show"),
              onClick: toggleShowPass,
              icon: showPass ? HiOutlineEyeOff : HiOutlineEye,
              tone: "neutral",
              appearance: "outline",
            }}
            registerOptions={passwordRules}
            helperClassName={cn(
              passwordErrorText ? "text-danger-solid" : "text-foreground-muted",
            )}
          />
        </div>

        <div className="mt-2 space-y-1">
          <label
            htmlFor={checkboxId}
            className={cn(
              "group flex min-w-0 items-center gap-2 rounded-xl",
              "border bg-surface/60 px-3 py-2",
              "transition hover:bg-background-elevated/60",
              errors.agree?.message
                ? "border-danger-soft-border"
                : "border-border-subtle",
            )}
          >
            <input
              id={checkboxId}
              type="checkbox"
              className={cn(
                "h-4 w-4 rounded",
                "border border-border-strong bg-surface",
                "accent-[var(--color-accent)]",
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
                  "text-foreground underline decoration-border-strong underline-offset-4 hover:opacity-90",
                  "rounded-md",
                  FOCUS_RING,
                )}
              >
                {t("signup_steps.terms.link")}
              </Link>
            </span>
          </label>

          {errors.agree?.message ? (
            <p className="text-[12px] leading-4 text-danger-solid">
              {t("signup_steps.terms.required")}
            </p>
          ) : null}
        </div>

        <div className="mt-3.5">
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
              "shadow-[var(--shadow-glow-brand)]",
              "hover:brightness-[1.05] active:brightness-[0.98]",
              "disabled:shadow-none",
              FOCUS_RING,
            )}
          >
            {t("signup_steps.submit.button")}
          </Button>
        </div>

        <div className="mt-3.5 flex items-center gap-3">
          <div className="h-px flex-1 bg-divider" />
          <span className="text-[11px] text-foreground-muted">
            {t("signup_steps.divider")}
          </span>
          <div className="h-px flex-1 bg-divider" />
        </div>

        <motion.div
          className={cn(
            "mt-2 flex items-center justify-center gap-2 p-2",
            isRTL && "flex-row-reverse",
          )}
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
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
        </motion.div>
      </form>
    </div>
  );
}
