import "server-only";

// Server-side referral + wallet logic. Rewards are server-controlled — clients
// can never set referralCount / walletBalance / lifetimeEarnings directly.

import { FieldValue } from "firebase-admin/firestore";
import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import {
  generateReferralCode,
  normalizeReferralCode,
  REFERRALS_PER_REWARD,
  REWARD_USD,
} from "@/lib/referral";

const USERS = "users";

export interface ReferralSummary {
  referralCode: string;
  referralCount: number;
  walletBalance: number;
  lifetimeEarnings: number;
}

/** Assign a unique referral code if the user doesn't have one. Idempotent. */
export async function assignReferralCode(uid: string): Promise<string | null> {
  if (!isAdminConfigured()) return null;
  const ref = adminDb().collection(USERS).doc(uid);
  const snap = await ref.get();
  const existing = snap.data()?.referralCode as string | undefined;
  if (existing) return existing;

  let code = generateReferralCode(uid);
  for (let attempt = 1; attempt <= 5; attempt++) {
    const dup = await adminDb().collection(USERS).where("referralCode", "==", code).limit(1).get();
    if (dup.empty) break;
    code = generateReferralCode(uid, String(attempt));
  }
  await ref.set({ referralCode: code }, { merge: true });
  return code;
}

/** Resolve a referral code → the referrer's uid (or null if unknown). */
export async function resolveReferralCode(code: string): Promise<string | null> {
  if (!isAdminConfigured()) return null;
  const norm = normalizeReferralCode(code);
  if (!norm) return null;
  const snap = await adminDb().collection(USERS).where("referralCode", "==", norm).limit(1).get();
  return snap.empty ? null : snap.docs[0].id;
}

/** Record who referred a new account — once, ignoring self-referral / invalid codes. */
export async function setReferredBy(uid: string, code: string): Promise<boolean> {
  if (!isAdminConfigured()) return false;
  const norm = normalizeReferralCode(code);
  if (!norm) return false;
  const ref = adminDb().collection(USERS).doc(uid);
  const snap = await ref.get();
  if (snap.data()?.referredBy) return false; // already referred
  const referrerUid = await resolveReferralCode(norm);
  if (!referrerUid || referrerUid === uid) return false; // unknown code or self
  await ref.set({ referredBy: norm }, { merge: true });
  return true;
}

export interface ReferralValidationResult {
  credited: boolean;
  referrerUid?: string;
  rewardAdded?: number;
  newCount?: number;
}

/**
 * Call after a user posts their first listing. A referral becomes VALID only once
 * the referred account has: phone verified + profile completed (name) + a listing.
 * Credits the referrer exactly once (guarded by `referralCredited`): +1 referral,
 * and on every Nth valid referral, +$5 to wallet & lifetime earnings.
 */
export async function markReferralValidOnFirstListing(
  uid: string,
): Promise<ReferralValidationResult> {
  if (!isAdminConfigured()) return { credited: false };
  const db = adminDb();
  const userRef = db.collection(USERS).doc(uid);

  const pre = (await userRef.get()).data() ?? {};
  // Already credited, or not referred, or hasn't met the validity bar yet.
  if (pre.referralCredited === true || !pre.referredBy) return { credited: false };
  if (pre.phoneVerified === false || !pre.firstName) return { credited: false };

  const referrerUid = await resolveReferralCode(pre.referredBy as string);
  if (!referrerUid || referrerUid === uid) {
    await userRef.set({ referralCredited: true }, { merge: true }); // close out invalid
    return { credited: false };
  }
  const referrerRef = db.collection(USERS).doc(referrerUid);

  return db.runTransaction(async (tx) => {
    const [userSnap, referrerSnap] = await Promise.all([tx.get(userRef), tx.get(referrerRef)]);
    if (userSnap.data()?.referralCredited === true) return { credited: false }; // race re-check

    const newCount = (referrerSnap.data()?.referralCount ?? 0) + 1;
    const rewardAdded = newCount % REFERRALS_PER_REWARD === 0 ? REWARD_USD : 0;

    tx.set(userRef, { referralCredited: true }, { merge: true });
    tx.set(
      referrerRef,
      {
        referralCount: newCount,
        ...(rewardAdded
          ? {
              walletBalance: FieldValue.increment(rewardAdded),
              lifetimeEarnings: FieldValue.increment(rewardAdded),
            }
          : {}),
      },
      { merge: true },
    );
    return { credited: true, referrerUid, rewardAdded, newCount };
  });
}

/** Wallet/referral summary for the current user (defaults for new accounts). */
export async function getReferralSummary(uid: string): Promise<ReferralSummary> {
  const fallback = { referralCode: "", referralCount: 0, walletBalance: 0, lifetimeEarnings: 0 };
  if (!isAdminConfigured()) return fallback;
  const code = (await assignReferralCode(uid)) ?? "";
  const d = (await adminDb().collection(USERS).doc(uid).get()).data() ?? {};
  return {
    referralCode: code,
    referralCount: d.referralCount ?? 0,
    walletBalance: d.walletBalance ?? 0,
    lifetimeEarnings: d.lifetimeEarnings ?? 0,
  };
}
