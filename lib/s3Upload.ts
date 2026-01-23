export async function uploadToPresignedUrl(
  uploadUrl: string,
  blob: Blob,
  contentType: string,
) {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: blob,
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`S3_UPLOAD_FAILED: ${res.status} ${t}`);
  }
}
