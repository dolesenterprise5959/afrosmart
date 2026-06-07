"use server";

import { logAuthEvent, type AuthLogEntry } from "@/lib/firestore/auth-log";

// Called by the login client to record an auth event (sent/failed/verified).
// The phone is masked server-side before storage.
export async function logLoginEvent(entry: AuthLogEntry): Promise<void> {
  await logAuthEvent(entry);
}
