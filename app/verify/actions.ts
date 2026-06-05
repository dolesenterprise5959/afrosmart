"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/auth/dal";
import { ensureUserProfile, isSuspended } from "@/lib/firestore/users";
import { requestVerification } from "@/lib/firestore/verification";
import { checkRateLimit, rateLimitMessage } from "@/lib/firestore/ratelimit";

export interface VerifyResult {
  error?: string;
  ok?: boolean;
}

// Submit a verification request. The verified status itself is only ever granted
// by an admin (server-side) — this just marks the request pending.
export async function requestVerificationAction(input: {
  type: string;
  note: string;
}): Promise<VerifyResult> {
  const session = await verifySession();

  if (await isSuspended(session.uid)) {
    return { error: "Your account is suspended." };
  }

  const limit = await checkRateLimit(session.uid, "verification");
  if (!limit.ok) {
    return { error: rateLimitMessage("verification", limit.retryAfterSec) };
  }

  const type = input.type === "business" ? "business" : "seller";
  const note = (input.note ?? "").trim().slice(0, 500);

  await ensureUserProfile(session.uid, { phone: session.phone });
  await requestVerification(session.uid, type, note);
  revalidatePath("/verify");
  return { ok: true };
}
