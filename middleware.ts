// middleware.ts
import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = process.env.AUTH_COOKIE_NAME || "access_token";

const PUBLIC_PREFIXES = [
  "/",
  "/login",
  "/signup",
  "/forgot",
  "/general-questions",
  "/support-and-help",
  "/playground",
  "/landing",
  "/policy-terms-center",
  "/creator",
];

const testingPages = ["/creator"];

function isPublicFile(pathname: string) {
  return /\.[a-zA-Z0-9]+$/.test(pathname);
}

function isPublicPath(pathname: string) {
  return PUBLIC_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}
function isTestingPages(pathname: string) {
  return testingPages.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}
export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  console.log("pathname: ", pathname);

  if (isTestingPages(pathname)) {
    console.log("testingggggggg");
    return NextResponse.next();
  }

  // ✅ السماح للملفات الثابتة
  if (isPublicFile(pathname)) return NextResponse.next();

  // ✅ السماح لطلبات OPTIONS
  if (req.method === "OPTIONS") return NextResponse.next();

  // 🔹 التحقق المبدئي من وجود الكوكي
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  const hasCookie = Boolean(token);

  // 🔹 تمرير المسار الحالي للـ Server Components
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-current-path", pathname + search);

  // ❌ المستخدم بدون كوكي يحاول دخول صفحة محمية → redirect
  if (!hasCookie && !isPublicPath(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname + search);
    return NextResponse.redirect(url);
  }

  // ✅ الكوكي موجود → تمرير الطلب للـ serverMe للتحقق النهائي
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
