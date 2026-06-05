import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth } from "@/lib/firebase/admin";
import { SESSION_COOKIE } from "@/lib/auth/constants";

export interface SessionUser {
  uid: string;
  phone: string | null;
  /** True when the Admin SDK custom claim `admin` is set. */
  admin: boolean;
}

// Securely resolve the current user from the session cookie. Verified against
// Firebase on every request (with revocation check). Memoised per-request with
// React `cache` so multiple callers in one render share a single verification.
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const cookie = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!cookie) return null;

  try {
    const decoded = await adminAuth().verifySessionCookie(cookie, true);
    return {
      uid: decoded.uid,
      phone: decoded.phone_number ?? null,
      admin: decoded.admin === true,
    };
  } catch {
    // Expired/revoked/invalid cookie, or Admin SDK not configured.
    return null;
  }
});

/** Require a signed-in user; redirect to /login otherwise. */
export async function verifySession(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Require an admin; redirect non-admins away. */
export async function verifyAdmin(): Promise<SessionUser> {
  const user = await verifySession();
  if (!user.admin) redirect("/");
  return user;
}
