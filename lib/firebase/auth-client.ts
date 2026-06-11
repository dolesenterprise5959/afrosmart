"use client";

// Browser-side phone OTP helpers built on the Firebase Web SDK. After a
// successful OTP confirmation we exchange the ID token for a server session
// cookie (POST /api/auth/session) so the server can trust subsequent requests.

import {
  RecaptchaVerifier,
  signInWithCustomToken,
  signInWithPhoneNumber,
  signOut,
  type ConfirmationResult,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { toE164 } from "@/lib/utils/phone";

export { toE164 };

/**
 * Create a reCAPTCHA bound to a container id. Defaults to invisible; pass
 * "normal" for a visible checkbox fallback when invisible fails for a user.
 */
export function createRecaptcha(containerId: string, size: "invisible" | "normal" = "invisible"): RecaptchaVerifier {
  return new RecaptchaVerifier(getFirebaseAuth(), containerId, { size });
}

// Exchange a verified Firebase ID token for the server session cookie. The phone
// is already verified at this point, so a failure here is NOT a wrong code — we
// tag it with a distinct code so the UI doesn't mislabel it as "incorrect code".
async function establishSession(idToken: string): Promise<void> {
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) {
    const err = new Error("Could not establish session") as Error & { code?: string };
    err.code = "auth/session-failed";
    throw err;
  }
}

/** Sign in with a fallback custom token (WhatsApp/SMS path), then set the session cookie. */
export async function signInWithCustomTokenAndSession(token: string): Promise<void> {
  const cred = await signInWithCustomToken(getFirebaseAuth(), token);
  const idToken = await cred.user.getIdToken();
  await establishSession(idToken);
}

/** Send an OTP SMS. Returns a confirmation handle for the verify step. */
export function sendOtp(
  phone: string,
  verifier: RecaptchaVerifier,
): Promise<ConfirmationResult> {
  return signInWithPhoneNumber(getFirebaseAuth(), toE164(phone), verifier);
}

/** Confirm the OTP code, then establish a server session cookie. */
export async function confirmOtp(
  confirmation: ConfirmationResult,
  code: string,
): Promise<void> {
  const credential = await confirmation.confirm(code);
  const idToken = await credential.user.getIdToken();
  await establishSession(idToken);
}

/** Clear both the server session cookie and the client auth state. */
export async function logout(): Promise<void> {
  await fetch("/api/auth/session", { method: "DELETE" });
  await signOut(getFirebaseAuth());
}
