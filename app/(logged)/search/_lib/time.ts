export function timeAgo(ts: number, now = Date.now()): string {
  const diff = Math.max(0, now - ts);
  const s = Math.floor(diff / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);

  if (s < 45) return "now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d < 7) return `${d}d ago`;

  const weeks = Math.floor(d / 7);
  if (weeks < 5) return `${weeks}w ago`;

  const months = Math.floor(d / 30);
  if (months < 12) return `${months}mo ago`;

  const years = Math.floor(d / 365);
  return `${years}y ago`;
}
