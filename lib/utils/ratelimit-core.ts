// Pure fixed-window rate-limit decision, separated from Firestore so it can be
// unit-tested. checkRateLimit() applies this inside a transaction.

export interface RateLimitState {
  windowStart: number;
  count: number;
}

export type RateLimitOutcome =
  | { allowed: true; next: RateLimitState }
  | { allowed: false; retryAfterSec: number };

/**
 * @param now       current time (ms)
 * @param state     previous window state, or null if none
 * @param max       max actions allowed per window
 * @param windowMs  window length (ms)
 */
export function evaluateRateLimit(
  now: number,
  state: RateLimitState | null,
  max: number,
  windowMs: number,
): RateLimitOutcome {
  // No state, or the previous window has elapsed → start a fresh window.
  if (!state || now - state.windowStart >= windowMs) {
    return { allowed: true, next: { windowStart: now, count: 1 } };
  }
  // Within the window but over the limit → reject with a retry hint.
  if (state.count >= max) {
    const retryAfterSec = Math.max(1, Math.ceil((state.windowStart + windowMs - now) / 1000));
    return { allowed: false, retryAfterSec };
  }
  // Within the window and under the limit → count this action.
  return { allowed: true, next: { windowStart: state.windowStart, count: state.count + 1 } };
}
