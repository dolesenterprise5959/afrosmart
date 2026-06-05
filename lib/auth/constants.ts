// Shared between the proxy (Edge-safe import) and server code. Keep this file
// free of Node/Admin imports so proxy.ts can import it.

export const SESSION_COOKIE = "afrosmart_session";

/** Session lifetime: 14 days (Firebase session cookies allow up to 14d). */
export const SESSION_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;

/** Route prefixes that require a signed-in user. */
export const PROTECTED_PREFIXES = [
  "/dashboard",
  "/messages",
  "/settings",
  "/saved",
  "/listing/new",
  "/admin",
];

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}
