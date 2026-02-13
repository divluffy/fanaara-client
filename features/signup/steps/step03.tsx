// features/signup/steps/step03.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Cropper, { Area } from "react-easy-crop";

import { Button } from "@/design";
import { Modal } from "@/components";
import { useAppSelector } from "@/store/hooks";
import { cn } from "@/utils";

import type { SignupStepProps } from "../types";
import { PRESET_AVATARS } from "./data/step03-avatars";
import {
  cropRoundPng,
  gifToStillPngBlob,
  isGif,
  isImageFile,
} from "../utils/avatar-image";

export default function Step03({ onSuccess }: SignupStepProps) {
  const { direction } = useAppSelector((s) => s.state);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [selectedPresetId, setSelectedPresetId] = useState(
    PRESET_AVATARS[0].id,
  );
  const selectedPreset = useMemo(
    () =>
      PRESET_AVATARS.find((p) => p.id === selectedPresetId) ??
      PRESET_AVATARS[0],
    [selectedPresetId],
  );

  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [stillUrl, setStillUrl] = useState<string | null>(null);
  const [croppedUrl, setCroppedUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
    };
  }, [originalUrl]);

  useEffect(() => {
    return () => {
      if (stillUrl) URL.revokeObjectURL(stillUrl);
    };
  }, [stillUrl]);

  useEffect(() => {
    return () => {
      if (croppedUrl) URL.revokeObjectURL(croppedUrl);
    };
  }, [croppedUrl]);

  const hasUpload = Boolean(originalUrl);
  const cropSourceUrl = stillUrl ?? originalUrl;
  const mainAvatarUrl =
    croppedUrl ?? stillUrl ?? originalUrl ?? selectedPreset.src;

  const clearUpload = () => {
    setOriginalUrl(null);
    setStillUrl(null);
    setCroppedUrl(null);
  };

  const openFilePicker = () => inputRef.current?.click();

  const [cropOpen, setCropOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  const openCrop = () => {
    setError(null);
    if (!cropSourceUrl) return;
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedArea(null);
    setCropOpen(true);
  };

  return (
    <div dir={direction} className="space-y-2">
      <div className="rounded-2xl border border-border-subtle bg-background-elevated overflow-hidden">
        <div className="py-4 flex flex-col items-center">
          <div className="h-32 w-32 rounded-full overflow-hidden border border-border-subtle shadow-[var(--shadow-md)] bg-surface-soft">
            <img
              src={mainAvatarUrl}
              alt="avatar"
              className="h-full w-full object-cover"
              draggable={false}
            />
          </div>

          <div className="mt-3 w-full px-3 max-w-sm">
            <div className="grid grid-cols-2 gap-2">
              <Button
                fullWidth
                variant="gradient"
                gradient="aurora"
                elevation="cta"
                onClick={() => {
                  setError(null);
                  openFilePicker();
                }}
              >
                Upload
              </Button>

              <Button
                fullWidth
                variant="gradient"
                gradient="violet"
                elevation="cta"
                disabled={!hasUpload || !cropSourceUrl}
                onClick={openCrop}
              >
                Crop
              </Button>
            </div>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              setError(null);

              const file = e.target.files?.[0];
              e.currentTarget.value = "";
              if (!file) return;

              if (!isImageFile(file)) {
                setError("Please upload an image file.");
                return;
              }

              clearUpload();

              const url = URL.createObjectURL(file);
              setOriginalUrl(url);

              if (isGif(file)) {
                try {
                  const blob = await gifToStillPngBlob(url);
                  setStillUrl(URL.createObjectURL(blob));
                } catch {
                  setStillUrl(null);
                }
              }
            }}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border-subtle bg-background-elevated overflow-hidden">
        <div className="px-3 pt-3 text-sm font-semibold text-foreground-strong">
          Pick an anime avatar
        </div>

        <div className="p-3">
          <div className="grid grid-cols-6 gap-2">
            {PRESET_AVATARS.map((p) => {
              const active = !hasUpload && p.id === selectedPresetId;

              return (
                <button
                  key={p.id}
                  type="button"
                  aria-label="Select avatar"
                  onClick={() => {
                    setError(null);
                    clearUpload();
                    setSelectedPresetId(p.id);
                  }}
                  className={cn(
                    "relative h-12 w-full rounded-xl overflow-hidden bg-surface-soft ring-1",
                    active ? "ring-accent-ring" : "ring-black/10",
                  )}
                >
                  <img
                    src={p.src}
                    alt="preset"
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {error ? <p className="text-sm text-danger-solid">{error}</p> : null}

      <Button
        fullWidth
        variant="gradient"
        gradient="sunset"
        elevation="cta"
        onClick={onSuccess}
      >
        Continue
      </Button>

      <Modal
        open={cropOpen}
        onOpenChange={(open) => {
          if (saving) return;
          setCropOpen(open);
        }}
        title="Crop avatar"
        subtitle="Drag to position, then save."
        mode={{ desktop: "center", mobile: "sheet" }}
        maxWidthClass="max-w-lg"
        footer={
          <div className="flex gap-2">
            <Button
              fullWidth
              variant="outline"
              tone="neutral"
              elevation="none"
              disabled={saving}
              onClick={() => setCropOpen(false)}
            >
              Cancel
            </Button>

            <Button
              fullWidth
              variant="gradient"
              gradient="violet"
              elevation="cta"
              isLoading={saving}
              loadingText="Saving..."
              disabled={!croppedArea || !cropSourceUrl}
              onClick={async () => {
                if (!croppedArea || !cropSourceUrl) return;

                try {
                  setSaving(true);
                  setError(null);

                  const blob = await cropRoundPng(
                    cropSourceUrl,
                    croppedArea,
                    900,
                  );
                  setCroppedUrl(URL.createObjectURL(blob));
                  setCropOpen(false);
                } catch {
                  setError("Crop failed. Please try again.");
                } finally {
                  setSaving(false);
                }
              }}
            >
              Save
            </Button>
          </div>
        }
      >
        {!cropSourceUrl ? (
          <div className="text-sm text-foreground-muted">
            Upload an image first.
          </div>
        ) : (
          <div className="relative h-80 rounded-2xl overflow-hidden bg-black border border-border-subtle">
            <Cropper
              image={cropSourceUrl}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, areaPixels) => setCroppedArea(areaPixels)}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
