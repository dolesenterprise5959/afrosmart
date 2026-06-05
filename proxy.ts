import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, isProtectedPath } from "@/lib/auth/constants";

// Next.js 16 renamed Middleware to Proxy. This runs an *optimistic* check only:
// it looks at the presence of the session cookie to redirect unauthenticated
// users away from protected routes. The real verification (cookie validity,
// revocation, admin role) happens server-side in lib/auth/dal.ts — never trust
// this layer alone.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  // Gate protected routes.
  if (isProtectedPath(pathname) && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Already signed in? Skip the login screen.
  if (pathname === "/login" && hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Run on everything except API routes, Next internals and static files.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|ico)$).*)"],
};
