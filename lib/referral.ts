// Pure referral + reward logic — dependency-light and unit-testable (no Firestore).
// The Firestore layer (lib/firestore/referrals.ts) builds on these.

export const REFERRALS_PER_REWARD = 10;
export const REWARD_USD = 5;

// Unambiguous base32 alphabet (no 0/O/1/I) for human-readable, shareable codes.
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

/**
 * Deterministic referral code from a uid, e.g. "AF7K9QXM". Deterministic so the
 * same account always maps to the same code (idempotent assignment); the
 * Firestore layer guards the rare collision by re-generating with a salt.
 */
export function generateReferralCode(uid: string, salt = ""): string {
  const input = `${uid}:${salt}`;
  let h = 0x811c9dc5; // FNV-1a (32-bit)
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += ALPHABET[h & 31];
    h >>>= 5;
    if (h === 0) h = (i + 1) * 0x9e3779b1; // keep entropy if uid is short
    h >>>= 0;
  }
  return `AF${code}`;
}

/** Normalize a user-entered referral code (uppercase, no spaces). */
export function normalizeReferralCode(raw: string): string {
  return (raw ?? "").trim().toUpperCase().replace(/\s+/g, "");
}

/** Total reward earned (USD) for a given number of VALID referrals. */
export function rewardForCount(validCount: number): number {
  return Math.floor(Math.max(0, validCount) / REFERRALS_PER_REWARD) * REWARD_USD;
}

/** Progress toward the next reward — drives the wallet progress tracker. */
export function referralProgress(validCount: number): {
  intoCurrent: number;
  needed: number;
  nextRewardAt: number;
  earnedUsd: number;
} {
  const n = Math.max(0, validCount);
  const intoCurrent = n % REFERRALS_PER_REWARD;
  return {
    intoCurrent,
    needed: REFERRALS_PER_REWARD - intoCurrent,
    nextRewardAt: n + (REFERRALS_PER_REWARD - intoCurrent),
    earnedUsd: rewardForCount(n),
  };
}
