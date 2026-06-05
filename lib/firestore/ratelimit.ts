import "server-only";

// Firestore-backed fixed-window rate limiter. A shared counter doc per
// (uid, action) means limits hold across serverless instances without any extra
// infrastructure. Each check is one transactional read+write.

import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { evaluateRateLimit, type RateLimitState } from "@/lib/utils/ratelimit-core";

export type RateAction = "message" | "report" | "listing" | "thread" | "rating" | "verification";

// Tuned for normal use while blocking spam. Windows are per-user.
export const RATE_LIMITS: Record<RateAction, { max: number; windowMs: number }> = {
  message: { max: 30, windowMs: 60_000 }, // 30 messages / minute
  report: { max: 5, windowMs: 60 * 60_000 }, // 5 reports / hour
  listing: { max: 10, windowMs: 60 * 60_000 }, // 10 new listings / hour
  thread: { max: 20, windowMs: 60 * 60_000 }, // 20 new conversations / hour
  rating: { max: 20, windowMs: 60 * 60_000 }, // 20 ratings / hour
  verification: { max: 3, windowMs: 24 * 60 * 60_000 }, // 3 verification requests / day
};

export interface RateLimitDecision {
  ok: boolean;
  retryAfterSec: number;
}

export async function checkRateLimit(
  uid: string,
  action: RateAction,
): Promise<RateLimitDecision> {
  // No Firestore (dev without creds) → don't block.
  if (!isAdminConfigured()) return { ok: true, retryAfterSec: 0 };

  const { max, windowMs } = RATE_LIMITS[action];
  const ref = adminDb().collection("rateLimits").doc(`${uid}__${action}`);
  const now = Date.now();

  return adminDb().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const state: RateLimitState | null = snap.exists
      ? { windowStart: snap.data()?.windowStart ?? 0, count: snap.data()?.count ?? 0 }
      : null;

    const outcome = evaluateRateLimit(now, state, max, windowMs);
    if (!outcome.allowed) {
      return { ok: false, retryAfterSec: outcome.retryAfterSec };
    }
    tx.set(ref, outcome.next);
    return { ok: true, retryAfterSec: 0 };
  });
}

/** Human-friendly "try again" message. */
export function rateLimitMessage(action: RateAction, retryAfterSec: number): string {
  const noun =
    action === "message"
      ? "sending messages"
      : action === "report"
        ? "submitting reports"
        : action === "listing"
          ? "posting listings"
          : action === "rating"
            ? "submitting ratings"
            : action === "verification"
              ? "requesting verification"
              : "starting conversations";
  const wait =
    retryAfterSec >= 60 ? `${Math.ceil(retryAfterSec / 60)} minute(s)` : `${retryAfterSec} second(s)`;
  return `You're ${noun} too fast. Please wait ${wait} and try again.`;
}
