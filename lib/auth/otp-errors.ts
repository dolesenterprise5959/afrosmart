// Shared (client + server) mapping of Firebase / provider auth errors to a
// stable reason + a clear user-facing message. Keeps login messaging precise
// (CAPTCHA vs network vs quota vs rate-limit vs provider).

export type AuthFailReason =
  | "captcha"
  | "network"
  | "quota"
  | "too-many"
  | "invalid-number"
  | "wrong-code"
  | "expired"
  | "provider"
  | "unknown";

export function describeAuthError(code?: string): { reason: AuthFailReason; message: string } {
  switch (code) {
    case "auth/captcha-check-failed":
    case "auth/invalid-app-credential":
    case "auth/missing-app-credential":
      return { reason: "captcha", message: "Verification couldn't complete in this browser. Open AfroSmart in Chrome or Safari to sign in." };
    case "auth/network-request-failed":
      return { reason: "network", message: "Network problem reaching verification. Check your connection, or open AfroSmart in Chrome/Safari." };
    case "auth/too-many-requests":
      return { reason: "too-many", message: "Too many attempts from this device. Please wait a few minutes and try again." };
    case "auth/quota-exceeded":
      return { reason: "quota", message: "The SMS limit was reached. Please try again shortly." };
    case "auth/invalid-phone-number":
    case "auth/missing-phone-number":
      return { reason: "invalid-number", message: "That phone number doesn't look valid. Please check it and try again." };
    default:
      return { reason: "unknown", message: "Couldn't send your code. Try the checkbox, or get it by WhatsApp/SMS." };
  }
}

/**
 * Map a Firebase error from the VERIFY (code-entry) step to a precise reason +
 * message. Distinguishes a wrong code from an expired code from a device
 * rate-limit — so a rate-limited user isn't told "wrong code" (and vice versa).
 * `lockSeconds` is set when the user should be made to wait (rate-limit).
 */
export function describeVerifyError(code?: string): {
  reason: AuthFailReason;
  message: string;
  lockSeconds?: number;
} {
  switch (code) {
    case "auth/invalid-verification-code":
      return { reason: "wrong-code", message: "That code is incorrect. Check the 6 digits and try again." };
    case "auth/missing-verification-code":
      return { reason: "wrong-code", message: "Please enter the 6-digit code from your SMS." };
    case "auth/code-expired":
    case "auth/session-expired":
      return { reason: "expired", message: "This code expired. Tap “Resend code” to get a fresh one." };
    case "auth/too-many-requests":
      return {
        reason: "too-many",
        message: "Too many attempts from this device — this is Firebase's safety limit, not a wrong code. Wait for the timer, then request a new code.",
        lockSeconds: 120,
      };
    case "auth/network-request-failed":
      return { reason: "network", message: "Network problem. Check your connection and try again." };
    case "auth/credential-already-in-use":
    case "auth/account-exists-with-different-credential":
      return { reason: "provider", message: "This number is already linked to an account. Try signing in again." };
    case "auth/session-failed":
      // Phone verified, but the server couldn't start the session — never a wrong
      // code. Don't penalise the user; tell them what actually happened.
      return { reason: "provider", message: "We verified your phone, but couldn't start your session. Please try again in a moment." };
    default:
      return { reason: "unknown", message: "Couldn’t verify that code. Tap “Resend code” for a fresh one, or open AfroSmart in Chrome/Safari." };
  }
}

/** +231770001234 → +231•••1234 (never log full numbers). */
export function maskPhone(e164: string): string {
  if (!e164 || e164.length < 8) return "•••";
  return `${e164.slice(0, 4)}•••${e164.slice(-3)}`;
}
