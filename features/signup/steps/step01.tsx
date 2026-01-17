// features/signup/steps/step01.tsx
"use client";

import React, { useId, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { motion, useReducedMotion } from "framer-motion";

import { AppInput } from "@/design/Input";
import { Button } from "@/design/button";
import { IconButton } from "@/design/icon-button";
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
import { useAppSelector } from "@/redux/hooks";
import { SignupStep1Props } from "@/types";

type SignupStep1Values = {
  email: string;
  password: string;
  agree: boolean;
};

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)]";

type UnknownRecord = Record<string, unknown>;
function isRecord(v: unknown): v is UnknownRecord {
  return typeof v === "object" && v !== null;
}

function extractErrorMessage(err: unknown): string {
  if (typeof err === "string") return err;

  if (isRecord(err)) {
    const data = err["data"];
    if (isRecord(data)) {
      const msg = data["message"];
      if (typeof msg === "string" && msg.trim()) return msg;
    }

    const msg = err["message"];
    if (typeof msg === "string" && msg.trim()) return msg;

    const e = err["error"];
    if (typeof e === "string" && e.trim()) return e;
  }

  return "Something went wrong. Please try again.";
}

export default function SignupStep1({ onSuccess }: SignupStep1Props) {
  const reduceMotion = useReducedMotion();
  const { isRTL } = useAppSelector((s) => s.state);

  const [showPass, setShowPass] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const t = useTranslations("signup_steps_01");
  const [signup, { isLoading: isMutating }] = useSignupMutation();

  const checkboxId = useId();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid, touchedFields, submitCount },
    watch,
  } = useForm<SignupStep1Values>({
    mode: "onChange",
    // BUG FIX: لا تضع password افتراضيًا أبدًا في signup
    defaultValues: { email: "", password: "", agree: false },
  });

  const agree = watch("agree");
  const passwordValue = watch("password") ?? "";

  const passwordErrorText =
    typeof errors.password?.message === "string"
      ? errors.password.message
      : undefined;

  const passwordTouched =
    Boolean(touchedFields.password) ||
    submitCount > 0 ||
    passwordValue.length > 0;

  const passwordCaption = passwordErrorText ? (
    <span className="text-danger-solid">{passwordErrorText}</span>
  ) : (
    <span>{t("password.hint")}</span>
  );

  const busy = isSubmitting || isMutating;
  const canSubmit = isValid && agree && !busy;

  async function onSubmit(values: SignupStep1Values) {
    setFormError(null);
    try {
      await signup(values).unwrap();
      onSuccess();
    } catch (e: unknown) {
      setFormError(extractErrorMessage(e));
    }
  }

  function onSocial(provider: "google" | "apple" | "microsoft") {
    const api = process.env.NEXT_PUBLIC_API_URL;
    if (!api) {
      setFormError("Missing NEXT_PUBLIC_API_URL.");
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
            {t("title")}
          </h1>

          <p className="mx-auto mt-1.5 max-w-[40ch] text-[12.8px] sm:text-[13.2px] leading-relaxed text-foreground-muted">
            {t("subtitle")}
          </p>
        </motion.header>

        {formError && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            className={cn(
              "mt-3 rounded-2xl border px-3 py-2 text-[12px] leading-5",
              "border-danger-soft-border bg-danger-soft text-danger-solid"
            )}
            role="alert"
            aria-live="polite"
          >
            <bdi>{formError}</bdi>
          </motion.div>
        )}

        <div className="mt-4 space-y-3">
          <AppInput
            name="email"
            register={register}
            errors={errors}
            label={t("email.label")}
            placeholder={t("email.placeholder")}
            autoComplete="email"
            inputMode="email"
            startIcon={HiOutlineMail}
            variant="outline"
            size="lg"
            registerOptions={{
              required: t("email.required"),
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: t("email.invalid"),
              },
            }}
          />

          <AppInput
            name="password"
            register={register}
            errors={errors}
            label={t("password.label")}
            description={passwordTouched ? passwordCaption : undefined}
            placeholder={t("password.placeholder")}
            autoComplete="new-password"
            type={showPass ? "text" : "password"}
            startIcon={HiOutlineLockClosed}
            variant="outline"
            size="lg"
            action={{
              ariaLabel: showPass ? t("password.hide") : t("password.show"),
              onClick: () => setShowPass((v) => !v),
              icon: showPass ? HiOutlineEyeOff : HiOutlineEye,
              tone: "neutral",
              appearance: "outline",
            }}
            registerOptions={{
              required: t("password.required"),
              minLength: { value: 8, message: t("password.min") },
              pattern: {
                value: /^(?=.*[A-Za-z])(?=.*\d).{8,}$/,
                message: t("password.pattern"),
              },
            }}
            helperClassName={cn(
              passwordErrorText ? "text-danger-solid" : "text-foreground-muted"
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
                : "border-border-subtle"
            )}
          >
            <input
              id={checkboxId}
              type="checkbox"
              className={cn(
                "h-4 w-4 rounded",
                "border border-border-strong bg-surface",
                "accent-[var(--color-accent)]",
                FOCUS_RING
              )}
              {...register("agree", { required: t("terms.required") })}
            />

            <span className="min-w-0 truncate whitespace-nowrap text-[12.5px] leading-5 text-foreground-muted">
              {t("terms.text")}{" "}
              <Link
                href="/policy-terms-center"
                className={cn(
                  "text-foreground underline decoration-border-strong underline-offset-4 hover:opacity-90",
                  "rounded-md",
                  FOCUS_RING
                )}
              >
                {t("terms.link")}
              </Link>
            </span>
          </label>

          {errors.agree?.message ? (
            <p className="text-[12px] leading-4 text-danger-solid">
              {t("terms.required")}
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
            loadingText={t("submit.loading")}
            disabled={!canSubmit}
            className={cn(
              "shadow-[var(--shadow-glow-brand)]",
              "hover:brightness-[1.05] active:brightness-[0.98]",
              "disabled:shadow-none",
              FOCUS_RING
            )}
          >
            {t("submit.button")}
          </Button>
        </div>

        <div className="mt-3.5 flex items-center gap-3">
          <div className="h-px flex-1 bg-divider" />
          <span className="text-[11px] text-foreground-muted">
            {t("divider")}
          </span>
          <div className="h-px flex-1 bg-divider" />
        </div>

        <motion.div
          className={cn(
            "mt-2 flex items-center justify-center gap-2 p-2",
            isRTL && "flex-row-reverse"
          )}
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
        >
          <IconButton
            aria-label="google"
            variant="soft"
            tone="brand"
            tooltip={t("social.google")}
            onClick={() => onSocial("google")}
            shape="rounded"
          >
            <GoogleIcon className="h-4 w-4" />
          </IconButton>

          <IconButton
            aria-label="apple"
            variant="soft"
            tone="brand"
            tooltip={t("social.apple")}
            onClick={() => onSocial("apple")}
            shape="rounded"
          >
            <AppleIcon className="h-4 w-4 text-foreground-strong" />
          </IconButton>

          <IconButton
            aria-label="microsoft"
            variant="soft"
            tone="brand"
            tooltip={t("social.microsoft")}
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
