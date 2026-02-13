"use client";

import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Button } from "@/design";
import { LocalizedSelect, type SelectOption } from "@/design/DeSelect";
import { cn } from "@/utils";
import { useAppSelector } from "@/store/hooks";
import type { SignupStep1Props } from "@/types";
import { GENRES_DATA, INTERESTS_DATA, PURPOSE_DATA } from "./data/step04.data";

type Step04Values = {
  purpose: string[];
  interests: string[];
  genres: string[];
};

const MIN = {
  purpose: 1,
  interests: 3,
  genres: 3,
} as const;

function normalizeMultiValue(value: string | string[] | null): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export default function Step04({ onSuccess }: SignupStep1Props) {
  const reduceMotion = useReducedMotion();
  const { isRTL, direction } = useAppSelector((s) => s.state);

  const t = useTranslations("signup.step04");

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<Step04Values>({
    mode: "onChange",
    defaultValues: { purpose: [], interests: [], genres: [] },
  });

  const purposeOptions = React.useMemo<SelectOption[]>(
    () =>
      PURPOSE_DATA.map(({ value, group }) => ({
        value,
        group: t(`groups.purpose.${group}`),
        label: t(`options.purpose.${value}.label`),
        description: t(`options.purpose.${value}.description`),
      })),
    [t],
  );

  const interestsOptions = React.useMemo<SelectOption[]>(
    () =>
      INTERESTS_DATA.map(({ value, group }) => ({
        value,
        group: t(`groups.interests.${group}`),
        label: t(`options.interests.${value}.label`),
        description: t(`options.interests.${value}.description`),
      })),
    [t],
  );

  const genresOptions = React.useMemo<SelectOption[]>(
    () =>
      GENRES_DATA.map(({ value, group }) => ({
        value,
        group: t(`groups.genres.${group}`),
        label: t(`options.genres.${value}.label`),
        description: t(`options.genres.${value}.description`),
      })),
    [t],
  );

  const onSubmit: SubmitHandler<Step04Values> = async () => {
    onSuccess?.();
  };

  return (
    <div dir={direction} className="space-y-4">
      <motion.header
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="text-center space-y-1"
      >
        <h2 className="text-[18px] sm:text-[20px] font-extrabold text-foreground-strong">
          <bdi>{t("title")}</bdi>
        </h2>
        <p className="text-[12.5px] text-foreground-muted">
          <bdi>{t("subtitle")}</bdi>
        </p>
      </motion.header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* Purpose (multi min 1, no search) */}
        <Controller
          control={control}
          name="purpose"
          rules={{
            validate: (v) =>
              Array.isArray(v) && v.length >= MIN.purpose
                ? true
                : t("validation.min1"),
          }}
          render={({ field }) => (
            <div>
              <LocalizedSelect
                label={t("fields.purpose")}
                options={purposeOptions}
                value={field.value}
                multiple
                searchable={false}
                variant="solid"
                onChange={(val) => field.onChange(normalizeMultiValue(val))}
              />
              {errors.purpose?.message ? (
                <p className="mt-1 text-xs text-danger-solid">
                  <bdi>{String(errors.purpose.message)}</bdi>
                </p>
              ) : null}
            </div>
          )}
        />

        {/* Interests (multi min 3, no search) */}
        <Controller
          control={control}
          name="interests"
          rules={{
            validate: (v) =>
              Array.isArray(v) && v.length >= MIN.interests
                ? true
                : t("validation.min3"),
          }}
          render={({ field }) => (
            <div>
              <LocalizedSelect
                label={t("fields.interests")}
                options={interestsOptions}
                value={field.value}
                multiple
                searchable={false}
                variant="solid"
                onChange={(val) => field.onChange(normalizeMultiValue(val))}
              />
              {errors.interests?.message ? (
                <p className="mt-1 text-xs text-danger-solid">
                  <bdi>{String(errors.interests.message)}</bdi>
                </p>
              ) : null}
            </div>
          )}
        />

        {/* Genres (multi min 3, keep search ON because list is big) */}
        <Controller
          control={control}
          name="genres"
          rules={{
            validate: (v) =>
              Array.isArray(v) && v.length >= MIN.genres
                ? true
                : t("validation.min3"),
          }}
          render={({ field }) => (
            <div>
              <LocalizedSelect
                label={t("fields.genres")}
                options={genresOptions}
                value={field.value}
                multiple
                searchable
                variant="solid"
                onChange={(val) => field.onChange(normalizeMultiValue(val))}
              />
              {errors.genres?.message ? (
                <p className="mt-1 text-xs text-danger-solid">
                  <bdi>{String(errors.genres.message)}</bdi>
                </p>
              ) : null}
            </div>
          )}
        />

        <div className="pt-1">
          <Button
            type="submit"
            variant="gradient"
            gradient="aurora"
            size="xl"
            fullWidth
            isLoading={isSubmitting}
            loadingText={t("actions.loading")}
            disabled={!isValid}
            className={cn("shadow-[var(--shadow-glow-brand)]")}
          >
            {t("actions.continue")}
          </Button>
        </div>

        <div
          className={cn(
            "rounded-2xl border border-border-subtle bg-surface/60 p-3 text-[12px] text-foreground-muted",
            isRTL && "text-right",
          )}
        >
          <bdi>{t("tip")}</bdi>
        </div>
      </form>
    </div>
  );
}
