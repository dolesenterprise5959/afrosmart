"use client";

// Browser-side phone OTP helpers built on the Firebase Web SDK. After a
// successful OTP confirmation we exchange the ID token for a server session
// cookie (POST /api/auth/session) so the server can trust subsequent requests.

import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
  type ConfirmationResult,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { toE164 } from "@/lib/utils/phone";

export { toE164 };

/** Create an invisible reCAPTCHA bound to a container element id. */
export function createRecaptcha(containerId: string): RecaptchaVerifier {
  return new RecaptchaVerifier(getFirebaseAuth(), containerId, {
    size: "invisible",
  });
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

  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) throw new Error("Could not establish session");
}

/** Clear both the server session cookie and the client auth state. */
export async function logout(): Promise<void> {
  await fetch("/api/auth/session", { method: "DELETE" });
  await signOut(getFirebaseAuth());
}
