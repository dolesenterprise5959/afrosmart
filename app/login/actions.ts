"use server";

import { headers } from "next/headers";
import { logAuthEvent, type AuthLogEntry } from "@/lib/firestore/auth-log";

// Called by the login client to record an auth event (sent/failed/verified).
// The phone is masked server-side before storage; the client IP is read from the
// request headers here (clients can't be trusted to report it).
export async function logLoginEvent(entry: AuthLogEntry): Promise<void> {
  let ip = "";
  try {
    const h = await headers();
    ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || (h.get("x-real-ip") ?? "");
  } catch {
    /* headers unavailable — leave IP blank */
  }
  await logAuthEvent({ ...entry, ip });
}
