import "server-only";

import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { maskPhone } from "@/lib/auth/otp-errors";

// Records auth events for monitoring Liberia login health (success + failure, so
// success/failure rates can be computed). Phone numbers are masked; never store
// full numbers. Best-effort (never throws).
export type AuthStatus = "sent" | "failed" | "verified" | "verify_failed";
export interface AuthLogEntry {
  phone: string;       // E.164 (masked before write)
  country: string;     // e.g. "LR +231"
  code: string;        // Firebase error code, "ok", or provider/fallback reason
  provider: string;    // "firebase" | "whatsapp" | "sms"
  status?: AuthStatus; // defaults to "failed"
  ua?: string;         // User-Agent (to spot in-app browsers like Messenger)
  inApp?: string;      // detected in-app browser name, if any
}

export async function logAuthEvent(e: AuthLogEntry): Promise<void> {
  if (!isAdminConfigured()) return;
  try {
    await adminDb().collection("authEvents").add({
      ts: new Date().toISOString(),
      status: e.status ?? "failed",
      country: e.country || "",
      phoneMasked: maskPhone(e.phone),
      code: e.code || "unknown",
      provider: e.provider || "firebase",
      ua: (e.ua || "").slice(0, 300),
      inApp: e.inApp || "",
    });
  } catch {
    /* logging must never block login */
  }
}
