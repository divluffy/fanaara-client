// lib/device.ts
type HeadersLike = Pick<Headers, "get">;

export function isPhoneDevice(headersLike: HeadersLike) {
  const chMobile = headersLike.get("sec-ch-ua-mobile");
  if (chMobile === "?1") return true;
  if (chMobile === "?0") return false;

  const ua = headersLike.get("user-agent") ?? "";
  return /Android.*Mobile|iPhone|iPod|IEMobile|Windows Phone|Mobile/i.test(ua);
}
