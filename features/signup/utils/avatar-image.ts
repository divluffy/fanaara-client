// features/signup/utils/avatar-image.ts
export type PixelCrop = { x: number; y: number; width: number; height: number };

export function isImageFile(file: File) {
  return file.type.startsWith("image/");
}

export function isGif(file: File) {
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

function canvasToBlob(canvas: HTMLCanvasElement, type: string) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
      type,
    );
  });
}

export async function gifToStillPngBlob(gifUrl: string, maxSize = 1400) {
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

  return canvasToBlob(canvas, "image/png");
}

export async function cropRoundPng(
  imageSrc: string,
  area: PixelCrop,
  outSize = 900,
) {
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
    outSize,
  );

  ctx.restore();

  return canvasToBlob(canvas, "image/png");
}
