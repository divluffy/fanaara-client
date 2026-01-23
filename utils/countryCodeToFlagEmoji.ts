export function countryCodeToFlagEmoji(code: string) {
  if (!code) return "";
  const cc = code.trim().toUpperCase();

  // لازم يكون حرفين A-Z
  if (!/^[A-Z]{2}$/.test(cc)) return "";

  const OFFSET = 0x1f1e6 - "A".charCodeAt(0);
  const first = cc.charCodeAt(0) + OFFSET;
  const second = cc.charCodeAt(1) + OFFSET;

  return String.fromCodePoint(first, second);
}
