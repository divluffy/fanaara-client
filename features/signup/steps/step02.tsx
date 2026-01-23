// features/signup/steps/step02.tsx
"use client";

import React from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import type { IconType } from "react-icons";
import { FaUser } from "react-icons/fa";
import { CiAt } from "react-icons/ci";
import { FiCheck, FiLoader, FiSearch, FiX } from "react-icons/fi";
import {
  AnimatePresence,
  LazyMotion,
  domAnimation,
  m,
  useReducedMotion,
} from "framer-motion";
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
import { Gender, SignupStep1Props, UserProfileDTO } from "@/types";

type Step02FormValues = {
  username: string;
  first_name: string;
  last_name: string;
  dob: Date | null;
  country: string | null;
  gender: Gender | null;
};

const USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_]{3,31}$/;

function toDto(values: Step02FormValues): UserProfileDTO {
  return {
    username: values.username.trim(),
    first_name: values.first_name.trim(),
    last_name: values.last_name.trim(),
    dob: values.dob ? values.dob.toISOString() : null,
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

type UsernameStatus =
  | "idle"
  | "invalid"
  | "checking"
  | "available"
  | "taken"
  | "error";

function normalizeUsername(raw: string) {
  return (raw ?? "").trim();
}

type UnknownRecord = Record<string, unknown>;
function isRecord(v: unknown): v is UnknownRecord {
  return typeof v === "object" && v !== null;
}

function parseAvailability(res: unknown): boolean {
  if (typeof res === "boolean") return res;

  if (isRecord(res)) {
    const a = res["available"];
    if (typeof a === "boolean") return a;

    const ia = res["isAvailable"];
    if (typeof ia === "boolean") return ia;
  }

  return Boolean(res);
}

function normalizeToDesignOptions(raw: unknown): SelectOption[] {
  if (!Array.isArray(raw)) return [];
  const out: SelectOption[] = [];

  for (const item of raw) {
    if (!isRecord(item)) continue;
    const value = item["value"];
    const label = item["label"];
    if (typeof value !== "string" || typeof label !== "string") continue;

    const description =
      typeof item["description"] === "string" ? item["description"] : undefined;
    const group = typeof item["group"] === "string" ? item["group"] : undefined;
    const disabled =
      typeof item["disabled"] === "boolean" ? item["disabled"] : undefined;

    out.push({ value, label, description, group, disabled });
  }

  return out;
}

export default function Step02({ onSuccess }: SignupStep1Props) {
  const t = useTranslations("signup_steps_02");
  const reduceMotion = useReducedMotion();

  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [triggerCheckUsername] = useLazyCheckUsernameQuery();

  const rawCountryOptions = useCountryOptions();
  const countryOptions = React.useMemo(
    () => normalizeToDesignOptions(rawCountryOptions),
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
  } = useForm<Step02FormValues>({
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

  const lastResultRef = React.useRef<{
    username: string;
    available: boolean;
  } | null>(null);
  const requestIdRef = React.useRef(0);

  const usernameRaw = watch("username") ?? "";
  const usernameTrimmed = normalizeUsername(usernameRaw);
  const debouncedUsername = useDebouncedValue(usernameRaw, 500);

  const isFormatValid =
    usernameTrimmed.length > 0 && USERNAME_REGEX.test(usernameTrimmed);

  // ---------- Unified typography (section headings) ----------
  const sectionTitleCls =
    "text-[18px] sm:text-[20px] font-extrabold leading-tight text-foreground-strong";
  const sectionSubtitleCls = "text-[12px] sm:text-[13px] text-foreground-muted";
  // match the visual tone of other field labels
  const sectionLabelCls =
    "text-sm font-medium text-foreground-strong leading-none";

  // ---------- Motion (fast + smooth) ----------
  const spring = React.useMemo(
    () =>
      reduceMotion
        ? { duration: 0 }
        : { type: "spring", stiffness: 340, damping: 30, mass: 0.6 },
    [reduceMotion],
  );

  const v = React.useMemo(() => {
    const y = (n: number) => (reduceMotion ? 0 : n);
    const x = (n: number) => (reduceMotion ? 0 : n);
    const s = (n: number) => (reduceMotion ? 1 : n);

    return {
      container: {
        hidden: {},
        show: {
          transition: reduceMotion
            ? { staggerChildren: 0 }
            : { staggerChildren: 0.075, delayChildren: 0.03 },
        },
      },
      header: {
        hidden: { opacity: 0, y: y(-12) },
        show: { opacity: 1, y: 0, transition: spring },
      },
      fieldUp: {
        hidden: { opacity: 0, y: y(14), scale: s(0.99) },
        show: { opacity: 1, y: 0, scale: 1, transition: spring },
      },
      fieldLeft: {
        hidden: { opacity: 0, x: x(-16), scale: s(0.99) },
        show: { opacity: 1, x: 0, scale: 1, transition: spring },
      },
      fieldRight: {
        hidden: { opacity: 0, x: x(16), scale: s(0.99) },
        show: { opacity: 1, x: 0, scale: 1, transition: spring },
      },
      scaleIn: {
        hidden: { opacity: 0, scale: s(0.965) },
        show: { opacity: 1, scale: 1, transition: spring },
      },
      cta: {
        hidden: { opacity: 0, y: y(10), scale: s(0.985) },
        show: { opacity: 1, y: 0, scale: 1, transition: spring },
      },
      microMsg: {
        initial: { opacity: 0, y: y(-3) },
        animate: {
          opacity: 1,
          y: 0,
          transition: reduceMotion ? { duration: 0 } : { duration: 0.18 },
        },
        exit: {
          opacity: 0,
          y: y(3),
          transition: reduceMotion ? { duration: 0 } : { duration: 0.12 },
        },
      },
      microErr: {
        initial: { opacity: 0, y: y(-4) },
        animate: {
          opacity: 1,
          y: 0,
          transition: reduceMotion ? { duration: 0 } : { duration: 0.16 },
        },
        exit: {
          opacity: 0,
          y: y(4),
          transition: reduceMotion ? { duration: 0 } : { duration: 0.12 },
        },
      },
    };
  }, [reduceMotion, spring]);

  // Keep status coherent while typing
  React.useEffect(() => {
    if (errors.username?.type === "availability") {
      clearErrors("username");
    }

    if (!usernameTrimmed) {
      setUsernameStatus("idle");
      lastResultRef.current = null;
      return;
    }

    if (!USERNAME_REGEX.test(usernameTrimmed)) {
      setUsernameStatus("invalid");
      return;
    }

    if (lastResultRef.current?.username === usernameTrimmed) {
      setUsernameStatus(
        lastResultRef.current.available ? "available" : "taken",
      );
      return;
    }

    if (usernameStatus !== "checking") setUsernameStatus("idle");
  }, [usernameTrimmed, errors.username?.type, clearErrors, usernameStatus]);

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

  const checkUsernameAvailability = React.useCallback(
    async (
      raw: string,
      opts?: {
        commitToField?: boolean;
        keepFocus?: boolean;
        hardFail?: boolean;
      },
    ): Promise<boolean | null> => {
      const v = normalizeUsername(raw);

      if (!v) {
        setUsernameStatus("idle");
        lastResultRef.current = null;
        clearErrors("username");
        return null;
      }

      if (!USERNAME_REGEX.test(v)) {
        setUsernameStatus("invalid");
        return null;
      }

      if (lastResultRef.current?.username === v) {
        const cached = lastResultRef.current.available;
        setUsernameStatus(cached ? "available" : "taken");

        if (opts?.commitToField) {
          if (cached) clearErrors("username");
          else {
            setError("username", {
              type: "availability",
              message: t("username.taken"),
            });
          }
        }

        return cached;
      }

      const myId = ++requestIdRef.current;
      setUsernameStatus("checking");

      try {
        const res = await triggerCheckUsername(v).unwrap();
        if (myId !== requestIdRef.current) return null;

        const available = parseAvailability(res);
        lastResultRef.current = { username: v, available };
        setUsernameStatus(available ? "available" : "taken");

        if (opts?.commitToField) {
          if (available) clearErrors("username");
          else
            setError("username", {
              type: "availability",
              message: t("username.taken"),
            });
        }

        if (opts?.keepFocus) {
          window.setTimeout(() => setFocus("username"), 0);
        }

        return available;
      } catch {
        if (myId !== requestIdRef.current) return null;

        setUsernameStatus("error");

        if (opts?.commitToField || opts?.hardFail) {
          setError("username", {
            type: "availability",
            message: "تعذّر التحقق من توفر اسم المستخدم. حاول مرة أخرى.",
          });
        }

        if (opts?.keepFocus) {
          window.setTimeout(() => setFocus("username"), 0);
        }

        return null;
      }
    },
    [triggerCheckUsername, clearErrors, setError, setFocus, t],
  );

  // Auto-check after debounce (no focus stealing, no committing captions)
  React.useEffect(() => {
    const v2 = normalizeUsername(debouncedUsername);
    if (!v2) return;
    if (!USERNAME_REGEX.test(v2)) return;
    if (lastResultRef.current?.username === v2) return;

    void checkUsernameAvailability(v2, { commitToField: false });
  }, [debouncedUsername, checkUsernameAvailability]);

  const canManualCheck = isFormatValid && usernameStatus !== "checking";

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

  const isUsernameAvailable =
    isFormatValid &&
    usernameStatus === "available" &&
    lastResultRef.current?.username === usernameTrimmed;

  const onSubmit: SubmitHandler<Step02FormValues> = async (values) => {
    const ok = await trigger("username");
    if (!ok) {
      setFocus("username");
      return;
    }

    try {
      const dto = toDto(values);
      const res = await updateProfile(dto).unwrap();
      console.log("res update: ", res);
      onSuccess?.();
    } catch (err) {
      console.log("err update: ", err);
      setError("username", {
        type: "validate",
        message: "حدث خطأ أثناء حفظ البيانات. حاول مرة أخرى.",
      });
      setFocus("username");
    }
  };

  const inputBase = { register, errors } as const;

  return (
    <LazyMotion features={domAnimation}>
      <div className="w-full">
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
            <h2 className={sectionTitleCls}>{t("title")}</h2>
            <p className={sectionSubtitleCls}>{t("subtitle")}</p>
          </m.header>

          <m.div
            variants={v.fieldUp}
            className="transform-gpu"
            style={
              reduceMotion ? undefined : { willChange: "transform, opacity" }
            }
          >
            <AppInput<Step02FormValues>
              {...inputBase}
              name="username"
              label={t("username.label")}
              placeholder={t("username.placeholder")}
              autoComplete="off"
              startIcon={CiAt}
              description={usernameDescription}
              registerOptions={{
                required: t("username.required"),
                pattern: {
                  value: USERNAME_REGEX,
                  message: t("username.invalid"),
                },
                onBlur: async () => {
                  const v2 = normalizeUsername(usernameRaw);
                  if (!USERNAME_REGEX.test(v2)) return;
                  await checkUsernameAvailability(v2, { commitToField: true });
                },
              }}
              action={{
                icon: usernameIcon,
                ariaLabel: "فحص توفر اسم المستخدم",
                appearance: "outline",
                tone: "brand",
                loading: usernameStatus === "checking",
                disabled: !canManualCheck,
                onClick: async () => {
                  const valid = await trigger("username");
                  if (!valid) {
                    setFocus("username");
                    return;
                  }

                  await checkUsernameAvailability(usernameRaw, {
                    commitToField: true,
                    keepFocus: true,
                  });
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
              <AppInput<Step02FormValues>
                {...inputBase}
                name="first_name"
                label={t("first_name.label")}
                placeholder={t("first_name.placeholder")}
                autoComplete="given-name"
                inputMode="text"
                startIcon={FaUser}
                registerOptions={{
                  required: t("first_name.required"),
                  pattern: {
                    value:
                      /^[A-Za-z\u0600-\u06FF][A-Za-z\u0600-\u06FF\s'-]{1,}$/u,
                    message: t("first_name.invalid"),
                  },
                }}
              />
            </m.div>

            <m.div variants={v.fieldRight} className="transform-gpu">
              <AppInput<Step02FormValues>
                {...inputBase}
                name="last_name"
                label={t("last_name.label")}
                placeholder={t("last_name.placeholder")}
                autoComplete="family-name"
                inputMode="text"
                startIcon={FaUser}
                registerOptions={{
                  required: t("last_name.required"),
                  pattern: {
                    value:
                      /^[A-Za-z\u0600-\u06FF][A-Za-z\u0600-\u06FF\s'-]{1,}$/u,
                    message: t("last_name.invalid"),
                  },
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
              defaultValue={null}
              rules={{ required: t("dob.required") }}
              render={({ field }) => (
                <div className="mt-1">
                  <SimpleDatePicker
                    label={t("dob.label")}
                    value={field.value}
                    onChange={field.onChange}
                    withTime={false}
                    minDate={new Date(new Date().getFullYear(), 0, 1)}
                    maxDate={new Date(new Date().getFullYear(), 11, 31, 23, 59)}
                    size="sm"
                    variant="solid"
                  />

                  <AnimatePresence initial={false}>
                    {errors.dob?.message ? (
                      <m.p
                        key="dob-err"
                        className="mt-1 text-xs text-red-500"
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
              defaultValue={null}
              rules={{ required: t("country.required") }}
              render={({ field }) => (
                <div className="mt-1">
                  <LocalizedSelect
                    label={t("country.label")}
                    placeholder={t("country.placeholder")}
                    options={countryOptions}
                    value={field.value}
                    onChange={(val) => {
                      field.onChange(typeof val === "string" ? val : null);
                    }}
                    searchable
                    variant="solid"
                  />

                  <AnimatePresence initial={false}>
                    {errors.country?.message ? (
                      <m.p
                        key="country-err"
                        className="mt-1 text-xs text-red-500"
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
              defaultValue={null}
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
                        className="mt-1 text-xs text-red-500"
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
              isLoading={isSubmitting || isUpdating}
              loadingText={t("submit.loading")}
              // disabled={
              //   !isValid ||
              //   usernameStatus === "checking" ||
              //   !isUsernameAvailable
              // }
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
      </div>
    </LazyMotion>
  );
}
