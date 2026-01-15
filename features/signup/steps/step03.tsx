// features/signup/steps/step03.tsx
"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FiShuffle, FiUpload } from "react-icons/fi";
import { useLocale } from "next-intl";

import { useAppSelector } from "@/redux/hooks";
import { Button } from "@/design/button";
import { cn } from "@/utils";
import type { SignupStep1Props } from "@/types";

type PresetAvatar = {
  id: string;
  emoji: string;
  gradient: string;
};

const PRESETS: readonly PresetAvatar[] = [
  { id: "kitsune", emoji: "🦊", gradient: "bg-gradient-to-br from-fuchsia-500 via-violet-500 to-sky-500" },
  { id: "oni", emoji: "👹", gradient: "bg-gradient-to-br from-rose-500 via-red-500 to-orange-500" },
  { id: "star", emoji: "⭐", gradient: "bg-gradient-to-br from-emerald-400 via-sky-500 to-indigo-500" },
  { id: "moon", emoji: "🌙", gradient: "bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500" },
];

function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

const COPY = {
  ar: {
    title: "اختيار صورة البروفايل",
    subtitle: "ستايل أنمي ✨ — مرتب، خفيف، ويدعم RTL/LTR",
    upload: "رفع صورة",
    random: "عشوائي",
    remove: "إزالة الرفع",
    uploaded: "تم رفع صورة",
    preset: (id: string) => `Preset: ${id}`,
    hintUpload: "سيتم استخدام الصورة التي رفعتها.",
    hintPreset: "اختر بروفايل لطيف (بدون تعقيد).",
    continue: "متابعة",
    invalidFile: "من فضلك ارفع ملف صورة فقط.",
  },
  en: {
    title: "Pick your avatar",
    subtitle: "Anime vibes ✨ — clean, light, RTL/LTR friendly",
    upload: "Upload image",
    random: "Random",
    remove: "Remove upload",
    uploaded: "Uploaded avatar",
    preset: (id: string) => `Preset: ${id}`,
    hintUpload: "We'll use the image you uploaded.",
    hintPreset: "Pick a cute preset (no fuss).",
    continue: "Continue",
    invalidFile: "Please upload an image file.",
  },
  tr: {
    title: "Avatar seç",
    subtitle: "Anime havası ✨ — temiz, hafif, RTL/LTR uyumlu",
    upload: "Resim yükle",
    random: "Rastgele",
    remove: "Yüklemeyi kaldır",
    uploaded: "Yüklenen avatar",
    preset: (id: string) => `Preset: ${id}`,
    hintUpload: "Yüklediğin görsel kullanılacak.",
    hintPreset: "Sevimli bir preset seç (kolayca).",
    continue: "Devam",
    invalidFile: "Lütfen bir görsel dosyası yükle.",
  },
} as const;

type CopyLocale = keyof typeof COPY;

export default function Step03({ onSuccess }: SignupStep1Props) {
  const reduceMotion = useReducedMotion();
  const locale = useLocale();
  const copy = COPY[(locale as CopyLocale) ?? "en"] ?? COPY.en;

  const { isRTL, direction } = useAppSelector((s) => s.state);

  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [preset, setPreset] = useState<PresetAvatar>(PRESETS[0]);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activePreview = uploadedUrl ? "upload" : "preset";

  useEffect(() => {
    return () => {
      if (uploadedUrl) URL.revokeObjectURL(uploadedUrl);
    };
  }, [uploadedUrl]);

  const pickRandomPreset = useMemo(() => {
    return () => {
      const idx = Math.floor(Math.random() * PRESETS.length);
      return PRESETS[idx]!;
    };
  }, []);

  return (
    <div dir={direction} className="space-y-4">
      <motion.header
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="text-center space-y-1"
      >
        <h2 className="text-[16px] font-extrabold text-foreground-strong">
          <bdi>{copy.title}</bdi>
        </h2>
        <p className="text-[12.5px] text-foreground-muted">
          <bdi>{copy.subtitle}</bdi>
        </p>
      </motion.header>

      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "rounded-3xl border border-border-subtle bg-surface p-4 shadow-[var(--shadow-sm)]",
          "flex items-center gap-4",
          isRTL && "flex-row-reverse"
        )}
      >
        <div
          className={cn(
            "relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl",
            "ring-1 ring-black/5",
            "shadow-[var(--shadow-md)]"
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            {activePreview === "upload" && uploadedUrl ? (
              <motion.img
                key="upload"
                src={uploadedUrl}
                alt="Uploaded avatar"
                className="h-full w-full object-cover"
                initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
                animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.16 }}
              />
            ) : (
              <motion.div
                key="preset"
                className={cn("h-full w-full grid place-items-center", preset.gradient)}
                initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
                animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.16 }}
              >
                <span className="text-3xl drop-shadow">{preset.emoji}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0",
              "bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.35),transparent_60%)]"
            )}
          />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm font-semibold text-foreground-strong">
            <bdi>{uploadedUrl ? copy.uploaded : copy.preset(preset.id)}</bdi>
          </p>
          <p className="text-xs text-foreground-muted">
            <bdi>{uploadedUrl ? copy.hintUpload : copy.hintPreset}</bdi>
          </p>
        </div>
      </motion.section>

      <div className={cn("flex flex-wrap gap-2", isRTL && "flex-row-reverse")}>
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            setError(null);

            const file = e.target.files?.[0];
            if (!file) return;

            if (!isImageFile(file)) {
              setError(copy.invalidFile);
              return;
            }

            if (uploadedUrl) URL.revokeObjectURL(uploadedUrl);
            const url = URL.createObjectURL(file);
            setUploadedUrl(url);
          }}
        />

        <Button
          type="button"
          variant="solid"
          tone="brand"
          leftIcon={<FiUpload aria-hidden />}
          onClick={() => inputRef.current?.click()}
        >
          {copy.upload}
        </Button>

        <Button
          type="button"
          variant="soft"
          tone="neutral"
          leftIcon={<FiShuffle aria-hidden />}
          onClick={() => {
            setError(null);
            setUploadedUrl(null);
            setPreset(pickRandomPreset());
          }}
        >
          {copy.random}
        </Button>

        {uploadedUrl && (
          <Button
            type="button"
            variant="outline"
            tone="neutral"
            onClick={() => {
              setError(null);
              if (uploadedUrl) URL.revokeObjectURL(uploadedUrl);
              setUploadedUrl(null);
            }}
          >
            {copy.remove}
          </Button>
        )}
      </div>

      <AnimatePresence>
        {error ? (
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 6 }}
            className="text-[12px] text-danger-solid"
            role="alert"
          >
            <bdi>{error}</bdi>
          </motion.p>
        ) : null}
      </AnimatePresence>

      <div className="pt-1">
        <Button type="button" variant="gradient" gradient="violet" size="xl" fullWidth onClick={onSuccess}>
          {copy.continue}
        </Button>
      </div>
    </div>
  );
}
