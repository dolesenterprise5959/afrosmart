// Shared (client + server) mapping of Firebase / provider auth errors to a
// stable reason + a clear user-facing message. Keeps login messaging precise
// (CAPTCHA vs network vs quota vs rate-limit vs provider).

export type AuthFailReason =
  | "captcha"
  | "network"
  | "quota"
  | "too-many"
  | "invalid-number"
  | "provider"
  | "unknown";

export function describeAuthError(code?: string): { reason: AuthFailReason; message: string } {
  switch (code) {
    case "auth/captcha-check-failed":
    case "auth/invalid-app-credential":
    case "auth/missing-app-credential":
      return { reason: "captcha", message: "Verification check failed. Try the checkbox below, or get your code by WhatsApp/SMS." };
    case "auth/network-request-failed":
      return { reason: "network", message: "Network problem reaching the verification service. Check your connection, or use WhatsApp/SMS." };
    case "auth/too-many-requests":
      return { reason: "too-many", message: "Too many attempts from this device. Wait a few minutes, or use WhatsApp/SMS." };
    case "auth/quota-exceeded":
      return { reason: "quota", message: "The SMS limit was reached. Please use WhatsApp, or try again later." };
    case "auth/invalid-phone-number":
    case "auth/missing-phone-number":
      return { reason: "invalid-number", message: "That phone number doesn't look valid. Please check it and try again." };
    default:
      return { reason: "unknown", message: "Couldn't send your code. Try the checkbox, or get it by WhatsApp/SMS." };
  }
}

/** +231770001234 → +231•••1234 (never log full numbers). */
export function maskPhone(e164: string): string {
  if (!e164 || e164.length < 8) return "•••";
  return `${e164.slice(0, 4)}•••${e164.slice(-3)}`;
}
