// features/signup/steps/step03.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Cropper, { Area } from "react-easy-crop";
import { useAppSelector } from "@/redux/hooks";
import type { SignupStep1Props } from "@/types";
import { Button } from "@/design/button";
import Modal from "@/components/Modal";

type PresetAvatar = { id: string; src: string };

// ✅ deterministic list (no random in initial render => no hydration mismatch)
const PRESET_GRID: PresetAvatar[] = [
  {
    id: "a1",
    src: "https://avatarfiles.alphacoders.com/367/thumb-350-367476.webp",
  },
  {
    id: "a2",
    src: "https://avatarfiles.alphacoders.com/108/thumb-350-108886.webp",
  },
  {
    id: "a3",
    src: "https://avatarfiles.alphacoders.com/375/thumb-350-375571.webp",
  },
  {
    id: "a4",
    src: "https://avatarfiles.alphacoders.com/108/thumb-350-108839.webp",
  },
  {
    id: "a5",
    src: "https://avatarfiles.alphacoders.com/375/thumb-1920-375593.png",
  },
  {
    id: "a6",
    src: "https://avatarfiles.alphacoders.com/364/thumb-350-364814.webp",
  },
  {
    id: "a7",
    src: "https://avatarfiles.alphacoders.com/375/thumb-350-375165.webp",
  },
  {
    id: "a8",
    src: "https://avatarfiles.alphacoders.com/161/thumb-350-161888.webp",
  },
  {
    id: "a9",
    src: "https://avatarfiles.alphacoders.com/375/thumb-1920-375788.jpeg",
  },
  {
    id: "a10",
    src: "https://avatarfiles.alphacoders.com/375/thumb-1920-375546.png",
  },
  {
    id: "a11",
    src: "https://avatarfiles.alphacoders.com/982/thumb-1920-9825.jpg",
  },
  {
    id: "a12",
    src: "https://avatarfiles.alphacoders.com/364/thumb-1920-364539.jpeg",
  },
  {
    id: "a13",
    src: "https://avatarfiles.alphacoders.com/375/thumb-1920-375115.png",
  },
  {
    id: "a14",
    src: "https://avatarfiles.alphacoders.com/376/thumb-1920-376141.jpeg",
  },
  {
    id: "a15",
    src: "https://avatarfiles.alphacoders.com/354/thumb-1920-354754.jpg",
  },
  {
    id: "a16",
    src: "https://avatarfiles.alphacoders.com/346/thumb-1920-346946.jpg",
  },
  {
    id: "a17",
    src: "https://avatarfiles.alphacoders.com/259/thumb-1920-25909.png",
  },
  {
    id: "a18",
    src: "https://avatarfiles.alphacoders.com/374/thumb-1920-374883.png",
  },
];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function isImageFile(file: File) {
  return file.type.startsWith("image/");
}

function isGif(file: File) {
  return file.type === "image/gif" || file.name.toLowerCase().endsWith(".gif");
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// GIF -> still PNG (so we treat GIF as a normal image)
async function gifToStillPngBlob(
  gifUrl: string,
  maxSize = 1400
): Promise<Blob> {
  const img = await loadImage(gifUrl);

  const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, w, h);

  return await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
      "image/png"
    );
  });
}

// Crop square area -> export ROUND avatar PNG
async function cropRoundPng(
  imageSrc: string,
  area: Area,
  outSize = 900
): Promise<Blob> {
  const img = await loadImage(imageSrc);

  const canvas = document.createElement("canvas");
  canvas.width = outSize;
  canvas.height = outSize;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.clearRect(0, 0, outSize, outSize);

  ctx.save();
  ctx.beginPath();
  ctx.arc(outSize / 2, outSize / 2, outSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  ctx.drawImage(
    img,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    outSize,
    outSize
  );
  ctx.restore();

  return await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
      "image/png"
    );
  });
}

export default function Step03({ onSuccess }: SignupStep1Props) {
  const { direction } = useAppSelector((s) => s.state);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const [error, setError] = useState<string | null>(null);

  // Preset selection
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    PRESET_GRID[0].id
  );
  const selectedPreset = useMemo(
    () => PRESET_GRID.find((p) => p.id === selectedPresetId) ?? PRESET_GRID[0],
    [selectedPresetId]
  );

  // Upload state (original always kept so "crop again" is consistent)
  const [originalUploadUrl, setOriginalUploadUrl] = useState<string | null>(
    null
  );
  const [preparedUploadUrl, setPreparedUploadUrl] = useState<string | null>(
    null
  ); // GIF still
  const [croppedUploadUrl, setCroppedUploadUrl] = useState<string | null>(null);

  const hasUpload = Boolean(originalUploadUrl);
  const cropSourceUrl = preparedUploadUrl ?? originalUploadUrl; // if GIF, use still for crop
  const mainAvatarUrl =
    croppedUploadUrl ??
    preparedUploadUrl ??
    originalUploadUrl ??
    selectedPreset.src;

  // Crop modal state (no zoom UI; pinch/scroll still works)
  const [cropOpen, setCropOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (originalUploadUrl) URL.revokeObjectURL(originalUploadUrl);
      if (preparedUploadUrl) URL.revokeObjectURL(preparedUploadUrl);
      if (croppedUploadUrl) URL.revokeObjectURL(croppedUploadUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openFilePicker = () => inputRef.current?.click();

  const clearUpload = () => {
    if (originalUploadUrl) URL.revokeObjectURL(originalUploadUrl);
    if (preparedUploadUrl) URL.revokeObjectURL(preparedUploadUrl);
    if (croppedUploadUrl) URL.revokeObjectURL(croppedUploadUrl);
    setOriginalUploadUrl(null);
    setPreparedUploadUrl(null);
    setCroppedUploadUrl(null);
  };

  const resetCrop = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedArea(null);
  };

  const openCrop = () => {
    setError(null);
    if (!cropSourceUrl) return;
    resetCrop();
    setCropOpen(true);
  };

  return (
    <div dir={direction} className="space-y-2">
      {/* Big centered avatar (minimal padding/gaps) */}
      <div className="rounded-2xl border border-border-subtle bg-background-elevated overflow-hidden">
        <div className="py-4 flex flex-col items-center">
          <div className="h-32 w-32 rounded-full overflow-hidden border border-border-subtle shadow-[var(--shadow-md)] bg-surface-soft">
            <img
              src={mainAvatarUrl}
              alt="avatar"
              className="h-full w-full object-cover"
            />
          </div>

          {/* Upload + Crop (same line) */}
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

              // replace current upload (no remove button needed)
              clearUpload();

              const url = URL.createObjectURL(file);
              setOriginalUploadUrl(url);

              if (isGif(file)) {
                try {
                  const stillBlob = await gifToStillPngBlob(url);
                  const stillUrl = URL.createObjectURL(stillBlob);
                  setPreparedUploadUrl(stillUrl);
                } catch {
                  setPreparedUploadUrl(null);
                }
              } else {
                setPreparedUploadUrl(null);
              }

              // keep UX simple: user clicks Crop when ready
              setCroppedUploadUrl(null);
            }}
          />
        </div>
      </div>

      {/* Nice title + image-only grid (no icons, no extra header actions) */}
      <div className="rounded-2xl border border-border-subtle bg-background-elevated overflow-hidden">
        <div className="px-3 pt-3 text-sm font-semibold text-foreground-strong">
          Pick an anime avatar
        </div>

        <div className="p-3">
          <div className="grid grid-cols-6 gap-2">
            {PRESET_GRID.map((p) => {
              const active = !hasUpload && p.id === selectedPresetId;

              return (
                <button
                  key={p.id}
                  type="button"
                  aria-label="Select avatar"
                  onClick={() => {
                    setError(null);
                    // selecting preset replaces upload automatically (no remove button)
                    clearUpload();
                    setSelectedPresetId(p.id);
                  }}
                  className={cx(
                    "relative h-12 w-full rounded-xl overflow-hidden bg-surface-soft",
                    active ? "ring-2 ring-accent-ring" : "ring-1 ring-black/10"
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

      {error ? <p className="text-sm text-danger-700">{error}</p> : null}

      <Button
        fullWidth
        variant="gradient"
        gradient="sunset"
        elevation="cta"
        onClick={onSuccess}
      >
        Continue
      </Button>

      {/* Crop modal (no zoom section UI) */}
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
                try {
                  setError(null);
                  if (!croppedArea || !cropSourceUrl) return;

                  setSaving(true);

                  const blob = await cropRoundPng(
                    cropSourceUrl,
                    croppedArea,
                    900
                  );
                  const url = URL.createObjectURL(blob);

                  if (croppedUploadUrl) URL.revokeObjectURL(croppedUploadUrl);
                  setCroppedUploadUrl(url);

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
