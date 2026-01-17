// features/signup/steps/step02.tsx
"use client";

import React from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import type { IconType } from "react-icons";
import { FaUser } from "react-icons/fa";
import { CiAt } from "react-icons/ci";
import { FiCheck, FiLoader, FiSearch, FiX } from "react-icons/fi";

import { AppInput } from "@/design/Input";
import { Button } from "@/design/button";
import { cn } from "@/utils";

import { SimpleDatePicker } from "@/design/DatePicker";
import {
  LocalizedSelect,
  type SelectOption as DesignSelectOption,
} from "@/design/Select";
import GenderSelectGrid from "@/components/GenderSelect";
import useCountryOptions from "@/hooks/useCountryOptions";

import { useLazyCheckUsernameQuery, useUpdateProfileMutation } from "../api";
import { SignupStep1Props } from "@/types";

type Gender = "male" | "female" | "na";

type Step02FormValues = {
  username: string;
  first_name: string;
  last_name: string;
  dob: Date | null;
  country: string | null;
  gender: Gender | null;
};

type UpdateProfileDto = {
  username: string;
  firstName: string;
  lastName: string;
  dob: string | null;
  country: string | null;
  gender: Gender | null;
};

const USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_]{3,31}$/;

function toDto(values: Step02FormValues): UpdateProfileDto {
  return {
    username: values.username.trim(),
    firstName: values.first_name.trim(),
    lastName: values.last_name.trim(),
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

  // preserve previous fallback behavior
  return Boolean(res);
}

function normalizeToDesignOptions(raw: unknown): DesignSelectOption[] {
  if (!Array.isArray(raw)) return [];
  const out: DesignSelectOption[] = [];

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

  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [triggerCheckUsername] = useLazyCheckUsernameQuery();

  const rawCountryOptions = useCountryOptions();
  const countryOptions = React.useMemo(
    () => normalizeToDesignOptions(rawCountryOptions),
    [rawCountryOptions]
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
        lastResultRef.current.available ? "available" : "taken"
      );
      return;
    }

    // valid format but not checked yet / changed since last check
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
      }
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
    [triggerCheckUsername, clearErrors, setError, setFocus, t]
  );

  // Auto-check after debounce (no focus stealing, no committing captions)
  React.useEffect(() => {
    const v = normalizeUsername(debouncedUsername);
    if (!v) return;
    if (!USERNAME_REGEX.test(v)) return;
    if (lastResultRef.current?.username === v) return;

    void checkUsernameAvailability(v, { commitToField: false });
  }, [debouncedUsername, checkUsernameAvailability]);

  const canManualCheck = isFormatValid && usernameStatus !== "checking";

  const usernameDescription =
    usernameStatus === "checking" ? (
      <span className="text-[11px] text-foreground-muted">جاري التحقق…</span>
    ) : usernameStatus === "available" ? (
      <span className="text-[11px] text-foreground-muted">متاح ✅</span>
    ) : null;

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

    const available = await checkUsernameAvailability(values.username, {
      commitToField: true,
      keepFocus: true,
      hardFail: true,
    });

    if (available !== true) {
      setFocus("username");
      return;
    }

    try {
      const dto = toDto(values);
      await updateProfile(dto).unwrap();
      onSuccess?.();
    } catch {
      setError("username", {
        type: "validate",
        message: "حدث خطأ أثناء حفظ البيانات. حاول مرة أخرى.",
      });
      setFocus("username");
    }
  };

  const inputBase = { register, errors } as const;

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="relative space-y-3">
        <header className="text-center space-y-1">
          <h2 className="text-[18px] sm:text-[20px] font-extrabold leading-tight text-foreground-strong">
            {t("title")}
          </h2>
          <p className="text-[12px] sm:text-[13px] text-foreground-muted">
            {t("subtitle")}
          </p>
        </header>

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
            pattern: { value: USERNAME_REGEX, message: t("username.invalid") },
            onBlur: async () => {
              const v = normalizeUsername(usernameRaw);
              if (!USERNAME_REGEX.test(v)) return;
              await checkUsernameAvailability(v, { commitToField: true });
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                value: /^[A-Za-z\u0600-\u06FF][A-Za-z\u0600-\u06FF\s'-]{1,}$/u,
                message: t("first_name.invalid"),
              },
            }}
          />

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
                value: /^[A-Za-z\u0600-\u06FF][A-Za-z\u0600-\u06FF\s'-]{1,}$/u,
                message: t("last_name.invalid"),
              },
            }}
          />
        </div>

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
              />
              {errors.dob?.message ? (
                <p className="mt-1 text-xs text-red-500">
                  {String(errors.dob.message)}
                </p>
              ) : null}
            </div>
          )}
        />

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
              {errors.country?.message ? (
                <p className="mt-1 text-xs text-red-500">
                  {String(errors.country.message)}
                </p>
              ) : null}
            </div>
          )}
        />

        <Controller
          control={control}
          name="gender"
          defaultValue={null}
          rules={{ required: t("gender.required") }}
          render={({ field }) => (
            <div className="mt-1 space-y-1">
              <div className="text-sm font-medium text-foreground-strong">
                {t("gender.label")}
              </div>

              <GenderSelectGrid
                value={field.value ?? null}
                onChange={(v) => field.onChange(v)}
              />

              {errors.gender?.message ? (
                <p className="mt-1 text-xs text-red-500">
                  {String(errors.gender.message)}
                </p>
              ) : null}
            </div>
          )}
        />

        <div className="pt-1">
          <Button
            type="submit"
            variant="solid"
            tone="brand"
            size="xl"
            elevation="cta"
            fullWidth
            isLoading={isSubmitting || isUpdating}
            loadingText={t("submit.loading")}
            disabled={
              !isValid || usernameStatus === "checking" || !isUsernameAvailable
            }
            className={cn(
              "shadow-[var(--shadow-glow-brand)]",
              "hover:brightness-[1.05] active:brightness-[0.98]",
              "disabled:shadow-none"
            )}
          >
            {t("submit.continue")}
          </Button>
        </div>
      </form>
    </div>
  );
}
