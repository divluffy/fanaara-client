// features/signup/steps/step02.tsx
"use client";

import React from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import type { IconType } from "react-icons";
import { FaUser } from "react-icons/fa";
import { CiAt } from "react-icons/ci";
import { FiCheck, FiLoader, FiSearch, FiX } from "react-icons/fi";
import { AnimatePresence, LazyMotion, domAnimation, m } from "framer-motion";

import {
  Button,
  AppInput,
  SimpleDatePicker,
  LocalizedSelect,
  SelectOption,
} from "@/design";
import { cn } from "@/utils";
import { GenderSelect } from "@/components";
import useCountryOptions from "@/hooks/useCountryOptions";

import { useLazyCheckUsernameQuery, useUpdateProfileMutation } from "../api";
import type { SignupStepProps } from "../types";
import { NAME_RE, USERNAME_RE } from "../constants";
import { useStepMotion } from "../ui/useStepMotion";
import type { Gender, UserProfileDTO } from "@/types";

type FormValues = {
  username: string;
  first_name: string;
  last_name: string;
  dob: Date | null;
  country: string | null;
  gender: Gender | null;
};

type UsernameStatus =
  | "idle"
  | "invalid"
  | "checking"
  | "available"
  | "taken"
  | "error";

function toDateOnly(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function toDto(values: FormValues): Partial<UserProfileDTO> {
  return {
    username: values.username.trim(),
    first_name: values.first_name.trim(),
    last_name: values.last_name.trim(),
    dob: values.dob ? toDateOnly(values.dob) : null,
    country: values.country ?? null,
    gender: values.gender ?? null,
  };
}

function useDebouncedValue<T>(value: T, delay = 450) {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function Step02({ onSuccess }: SignupStepProps) {
  const t = useTranslations("signup_steps_02");
  const { reduceMotion, v } = useStepMotion();

  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [triggerCheckUsername] = useLazyCheckUsernameQuery();

  const rawCountryOptions = useCountryOptions();
  const countryOptions = React.useMemo<SelectOption[]>(
    () => (Array.isArray(rawCountryOptions) ? (rawCountryOptions as any) : []),
    [rawCountryOptions],
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isValid },
    setError,
    clearErrors,
    setFocus,
    trigger,
    watch,
  } = useForm<FormValues>({
    mode: "onChange",
    shouldFocusError: true,
    defaultValues: {
      username: "",
      first_name: "",
      last_name: "",
      dob: null,
      country: null,
      gender: null,
    },
  });

  const [usernameStatus, setUsernameStatus] =
    React.useState<UsernameStatus>("idle");

  const lastRef = React.useRef<{ username: string; available: boolean } | null>(
    null,
  );
  const reqIdRef = React.useRef(0);

  const usernameRaw = watch("username") ?? "";
  const username = usernameRaw.trim();
  const debouncedUsername = useDebouncedValue(usernameRaw, 500);

  const formatOk = username.length > 0 && USERNAME_RE.test(username);

  React.useEffect(() => {
    if (errors.username?.type === "availability") clearErrors("username");

    if (!username) {
      setUsernameStatus("idle");
      lastRef.current = null;
      return;
    }

    if (!USERNAME_RE.test(username)) {
      setUsernameStatus("invalid");
      return;
    }

    if (lastRef.current?.username === username) {
      setUsernameStatus(lastRef.current.available ? "available" : "taken");
      return;
    }

    if (usernameStatus !== "checking") setUsernameStatus("idle");
  }, [username, errors.username?.type, clearErrors, usernameStatus]);

  const checkAvailability = React.useCallback(
    async (raw: string, commitToField: boolean) => {
      const u = raw.trim();

      if (!u) {
        setUsernameStatus("idle");
        lastRef.current = null;
        if (commitToField) clearErrors("username");
        return null;
      }

      if (!USERNAME_RE.test(u)) {
        setUsernameStatus("invalid");
        return null;
      }

      if (lastRef.current?.username === u) {
        const available = lastRef.current.available;
        setUsernameStatus(available ? "available" : "taken");

        if (commitToField) {
          if (available) clearErrors("username");
          else
            setError("username", {
              type: "availability",
              message: t("username.taken"),
            });
        }

        return available;
      }

      const myId = ++reqIdRef.current;
      setUsernameStatus("checking");

      try {
        const res = await triggerCheckUsername(u).unwrap();
        if (myId !== reqIdRef.current) return null;

        const available = Boolean(res.available);
        lastRef.current = { username: u, available };
        setUsernameStatus(available ? "available" : "taken");

        if (commitToField) {
          if (available) clearErrors("username");
          else
            setError("username", {
              type: "availability",
              message: t("username.taken"),
            });
        }

        return available;
      } catch {
        if (myId !== reqIdRef.current) return null;

        setUsernameStatus("error");
        if (commitToField) {
          setError("username", {
            type: "availability",
            message: "تعذّر التحقق من توفر اسم المستخدم. حاول مرة أخرى.",
          });
        }
        return null;
      }
    },
    [triggerCheckUsername, clearErrors, setError, t],
  );

  React.useEffect(() => {
    const u = debouncedUsername.trim();
    if (!u || !USERNAME_RE.test(u)) return;
    if (lastRef.current?.username === u) return;
    void checkAvailability(u, false);
  }, [debouncedUsername, checkAvailability]);

  const usernameIcon: IconType =
    usernameStatus === "checking"
      ? (props) => (
          <FiLoader
            {...props}
            className={cn(props.className, "animate-spin")}
          />
        )
      : usernameStatus === "available"
        ? FiCheck
        : usernameStatus === "taken" || usernameStatus === "error"
          ? FiX
          : FiSearch;

  const isUsernameAvailable =
    usernameStatus === "available" &&
    lastRef.current?.username === username &&
    lastRef.current.available;

  const usernameDescription = (
    <AnimatePresence mode="wait" initial={false}>
      {usernameStatus === "checking" ? (
        <m.span
          key="checking"
          className="text-[11px] text-foreground-muted"
          initial={v.microMsg.initial}
          animate={v.microMsg.animate}
          exit={v.microMsg.exit}
        >
          جاري التحقق…
        </m.span>
      ) : usernameStatus === "available" ? (
        <m.span
          key="available"
          className="text-[11px] text-foreground-muted"
          initial={v.microMsg.initial}
          animate={v.microMsg.animate}
          exit={v.microMsg.exit}
        >
          متاح ✅
        </m.span>
      ) : null}
    </AnimatePresence>
  );

  const today = React.useMemo(() => new Date(), []);
  const minDob = React.useMemo(() => new Date(1900, 0, 1), []);
  const maxDob = React.useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear() - 13, d.getMonth(), d.getDate());
  }, []);

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    const ok = await trigger();
    if (!ok) return;

    const available = await checkAvailability(values.username, true);
    if (available !== true) {
      setFocus("username");
      return;
    }

    try {
      await updateProfile(toDto(values)).unwrap();
      onSuccess();
    } catch {
      setError("username", {
        type: "validate",
        message: "حدث خطأ أثناء حفظ البيانات. حاول مرة أخرى.",
      });
      setFocus("username");
    }
  };

  const titleCls =
    "text-[18px] sm:text-[20px] font-extrabold leading-tight text-foreground-strong";
  const subtitleCls = "text-[12px] sm:text-[13px] text-foreground-muted";
  const sectionLabelCls =
    "text-sm font-medium text-foreground-strong leading-none";

  const busy = isSubmitting || isUpdating;

  return (
    <LazyMotion features={domAnimation}>
      <m.form
        onSubmit={handleSubmit(onSubmit)}
        className="relative space-y-3"
        variants={v.container}
        initial="hidden"
        animate="show"
      >
        <m.header
          variants={v.header}
          className="text-center space-y-1 transform-gpu"
          style={
            reduceMotion ? undefined : { willChange: "transform, opacity" }
          }
        >
          <h2 className={titleCls}>{t("title")}</h2>
          <p className={subtitleCls}>{t("subtitle")}</p>
        </m.header>

        <m.div
          variants={v.fieldUp}
          className="transform-gpu"
          style={
            reduceMotion ? undefined : { willChange: "transform, opacity" }
          }
        >
          <AppInput<FormValues>
            name="username"
            register={register}
            errors={errors}
            label={t("username.label")}
            placeholder={t("username.placeholder")}
            autoComplete="off"
            startIcon={CiAt}
            description={usernameDescription}
            registerOptions={{
              required: t("username.required"),
              pattern: { value: USERNAME_RE, message: t("username.invalid") },
              onBlur: async () => {
                if (!USERNAME_RE.test(username.trim())) return;
                await checkAvailability(usernameRaw, true);
              },
            }}
            action={{
              icon: usernameIcon,
              ariaLabel: "فحص توفر اسم المستخدم",
              appearance: "outline",
              tone: "brand",
              loading: usernameStatus === "checking",
              disabled: !formatOk || usernameStatus === "checking",
              onClick: async () => {
                const valid = await trigger("username");
                if (!valid) {
                  setFocus("username");
                  return;
                }
                await checkAvailability(usernameRaw, true);
                window.setTimeout(() => setFocus("username"), 0);
              },
            }}
          />
        </m.div>

        <m.div
          variants={v.scaleIn}
          className="grid grid-cols-1 sm:grid-cols-2 gap-2 transform-gpu"
          style={
            reduceMotion ? undefined : { willChange: "transform, opacity" }
          }
        >
          <m.div variants={v.fieldLeft} className="transform-gpu">
            <AppInput<FormValues>
              name="first_name"
              register={register}
              errors={errors}
              label={t("first_name.label")}
              placeholder={t("first_name.placeholder")}
              autoComplete="given-name"
              inputMode="text"
              startIcon={FaUser}
              registerOptions={{
                required: t("first_name.required"),
                pattern: { value: NAME_RE, message: t("first_name.invalid") },
              }}
            />
          </m.div>

          <m.div variants={v.fieldRight} className="transform-gpu">
            <AppInput<FormValues>
              name="last_name"
              register={register}
              errors={errors}
              label={t("last_name.label")}
              placeholder={t("last_name.placeholder")}
              autoComplete="family-name"
              inputMode="text"
              startIcon={FaUser}
              registerOptions={{
                required: t("last_name.required"),
                pattern: { value: NAME_RE, message: t("last_name.invalid") },
              }}
            />
          </m.div>
        </m.div>

        <m.div
          variants={v.fieldUp}
          className="transform-gpu"
          style={
            reduceMotion ? undefined : { willChange: "transform, opacity" }
          }
        >
          <Controller
            control={control}
            name="dob"
            rules={{ required: t("dob.required") }}
            render={({ field }) => (
              <div className="mt-1">
                <SimpleDatePicker
                  label={t("dob.label")}
                  value={field.value}
                  onChange={field.onChange}
                  withTime={false}
                  minDate={minDob}
                  maxDate={maxDob}
                  size="sm"
                  variant="solid"
                />
                <AnimatePresence initial={false}>
                  {errors.dob?.message ? (
                    <m.p
                      key="dob-err"
                      className="mt-1 text-xs text-danger-solid"
                      initial={v.microErr.initial}
                      animate={v.microErr.animate}
                      exit={v.microErr.exit}
                    >
                      {String(errors.dob.message)}
                    </m.p>
                  ) : null}
                </AnimatePresence>
              </div>
            )}
          />
        </m.div>

        <m.div
          variants={v.fieldUp}
          className="transform-gpu"
          style={
            reduceMotion ? undefined : { willChange: "transform, opacity" }
          }
        >
          <Controller
            control={control}
            name="country"
            rules={{ required: t("country.required") }}
            render={({ field }) => (
              <div className="mt-1">
                <LocalizedSelect
                  label={t("country.label")}
                  placeholder={t("country.placeholder")}
                  options={countryOptions}
                  value={field.value}
                  onChange={(val) =>
                    field.onChange(typeof val === "string" ? val : null)
                  }
                  searchable
                  variant="solid"
                />
                <AnimatePresence initial={false}>
                  {errors.country?.message ? (
                    <m.p
                      key="country-err"
                      className="mt-1 text-xs text-danger-solid"
                      initial={v.microErr.initial}
                      animate={v.microErr.animate}
                      exit={v.microErr.exit}
                    >
                      {String(errors.country.message)}
                    </m.p>
                  ) : null}
                </AnimatePresence>
              </div>
            )}
          />
        </m.div>

        <m.div
          variants={v.scaleIn}
          className="transform-gpu"
          style={
            reduceMotion ? undefined : { willChange: "transform, opacity" }
          }
        >
          <Controller
            control={control}
            name="gender"
            rules={{ required: t("gender.required") }}
            render={({ field }) => (
              <div className="mt-1 space-y-1">
                <div className={sectionLabelCls}>{t("gender.label")}</div>

                <m.div variants={v.fieldUp} className="transform-gpu">
                  <GenderSelect
                    value={field.value ?? null}
                    onChange={(v2) => field.onChange(v2)}
                  />
                </m.div>

                <AnimatePresence initial={false}>
                  {errors.gender?.message ? (
                    <m.p
                      key="gender-err"
                      className="mt-1 text-xs text-danger-solid"
                      initial={v.microErr.initial}
                      animate={v.microErr.animate}
                      exit={v.microErr.exit}
                    >
                      {String(errors.gender.message)}
                    </m.p>
                  ) : null}
                </AnimatePresence>
              </div>
            )}
          />
        </m.div>

        <m.div
          variants={v.cta}
          className="pt-1 transform-gpu"
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
            loadingText={t("submit.loading")}
            disabled={
              !isValid || !isUsernameAvailable || usernameStatus === "checking"
            }
            className={cn(
              "shadow-[var(--shadow-glow-brand)]",
              "hover:brightness-[1.05] active:brightness-[0.98]",
              "disabled:shadow-none",
            )}
          >
            {t("submit.continue")}
          </Button>
        </m.div>
      </m.form>
    </LazyMotion>
  );
}
