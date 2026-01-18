// features/signup/utils/emailBlocklist.ts

export const BLOCKED_EMAIL_DOMAINS = [
  "10minutes.email",
  "123mails.org",
  "aboodbab.com",
  "allfreemail.net",
  "allwebemails.com",
  "bareed.ws",
  "besttempmail.com",
  "bltiwd.com",
  "bwmyga.com",
  "daouse.com",
  "deepmails.org",
  "deepyinc.com",
  "disbox.net",
  "disbox.org",
  "easymailer.live",
  "fusioninbox.com",
  "gongjua.com",
  "horizonspost.com",
  "illubd.com",
  "inctart.com",
  "inovic.com",
  // "mailinator.com",
  "inboxorigin.com",
  "justdefinition.com",
  "webxio.pro",
  "linshiyouxiang.net",
  "mailmagnet.co",
  "mailna.co",
  "mailna.in",
  "mailna.me",
  "mailsbay.com",
  "mamabood.com",
  "mediaeast.uk",
  "mediaholy.com",
  "moakl.co",
  "moakt.c",
  "moakt.ws",
  "mohemil.com",
  "mohmal.im",
  "mohmal.in",
  "mozej.com",
  "mrotzis.com",
  "mkzaso.com",
  "mycreativeinbox.com",
  "openmail.pro",
  "oremal.com",
  "ozsaip.com",
  "pdf-cutter.com",
  "rulersonline.com",
  "ruutukf.com",
  "solarnyx.com",
  "swagpapa.com",
  "tmail.ws",
  "teml.net",
  "tmails.net",
  "tmpbox.net",
  "tmpeml.com",
  "tmpmail.net",
  "tmpmail.org",
  "vertexinbox.com",
  "wnbaldwy.com",
  "xkxkud.com",
  "yzcalo.com",
  "zodaq.in",
] as const;

const BLOCKED_SET = new Set<string>(BLOCKED_EMAIL_DOMAINS);

export function extractEmailDomain(email: string): string | null {
  const v = (email ?? "").trim();
  const at = v.lastIndexOf("@");
  if (at <= 0 || at === v.length - 1) return null;
  return v
    .slice(at + 1)
    .trim()
    .toLowerCase();
}

// Blocks exact domain and any subdomain of a blocked domain:
// e.g. "sub.10minutes.email" => blocked
export function isBlockedEmailDomain(domain: string): boolean {
  const d = (domain ?? "").trim().toLowerCase();
  if (!d) return false;
  if (BLOCKED_SET.has(d)) return true;

  // subdomain check
  for (const bad of BLOCKED_SET) {
    if (d.endsWith("." + bad)) return true;
  }
  return false;
}

export function isBlockedEmail(email: string): boolean {
  const domain = extractEmailDomain(email);
  if (!domain) return false;
  return isBlockedEmailDomain(domain);
}
