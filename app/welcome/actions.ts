"use server";

import { verifySession } from "@/lib/auth/dal";
import { setUserName } from "@/lib/firestore/users";
import { setReferredBy } from "@/lib/firestore/referrals";

export async function saveNameAction(input: {
  firstName: string;
  lastName: string;
  referralCode?: string;
}): Promise<{ ok?: true; error?: string }> {
  const session = await verifySession();
  const first = (input.firstName ?? "").trim();
  if (!first) return { error: "Please enter your first name." };
  if (first.length > 40) return { error: "That name is too long." };
  await setUserName(session.uid, first, input.lastName ?? "", session.phone);
  // Capture the referrer (once) if a code was entered — best-effort, never blocks signup.
  if (input.referralCode?.trim()) {
    try { await setReferredBy(session.uid, input.referralCode); } catch { /* ignore */ }
  }
  return { ok: true };
}
