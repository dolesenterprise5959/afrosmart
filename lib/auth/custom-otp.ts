import "server-only";

import { createHash, randomInt } from "crypto";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

// Fallback OTP store for the WhatsApp/SMS path. Codes are hashed at rest, expire
// in 5 minutes, and lock after too many wrong tries. On success we mint a
// Firebase custom token bound to the SAME uid as the phone (so the fallback and
// primary Firebase Phone Auth resolve to one account — no duplicates).

const COLL = "otpCodes";
const TTL_MS = 5 * 60 * 1000;
const MAX_VERIFY = 5;

const hash = (phone: string, code: string) =>
  createHash("sha256").update(`${phone}:${code}`).digest("hex");

export function generateCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export async function storeCode(phone: string, code: string): Promise<void> {
  await adminDb().collection(COLL).doc(phone).set({
    hash: hash(phone, code),
    expiresAt: Date.now() + TTL_MS,
    attempts: 0,
    createdAt: Date.now(),
  });
}

export async function verifyCode(phone: string, code: string): Promise<{ ok: boolean; error?: string }> {
  const ref = adminDb().collection(COLL).doc(phone);
  const snap = await ref.get();
  if (!snap.exists) return { ok: false, error: "no_code" };
  const d = snap.data() as { hash: string; expiresAt: number; attempts?: number };
  if (Date.now() > d.expiresAt) { await ref.delete(); return { ok: false, error: "expired" }; }
  if ((d.attempts ?? 0) >= MAX_VERIFY) { await ref.delete(); return { ok: false, error: "too_many" }; }
  if (d.hash !== hash(phone, code)) {
    await ref.update({ attempts: (d.attempts ?? 0) + 1 });
    return { ok: false, error: "wrong_code" };
  }
  await ref.delete();
  return { ok: true };
}

/** Stable uid for the phone (reuse the Firebase phone-auth account) + custom token. */
export async function mintCustomToken(phone: string): Promise<string> {
  let uid: string;
  try {
    uid = (await adminAuth().getUserByPhoneNumber(phone)).uid;
  } catch {
    uid = (await adminAuth().createUser({ phoneNumber: phone })).uid;
  }
  return adminAuth().createCustomToken(uid, { phone_number: phone, via: "fallback" });
}
