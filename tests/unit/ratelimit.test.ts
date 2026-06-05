import { describe, expect, it } from "vitest";
import { evaluateRateLimit } from "@/lib/utils/ratelimit-core";

const WINDOW = 60_000;
const MAX = 3;

describe("evaluateRateLimit (fixed window)", () => {
  it("allows and opens a fresh window when there is no prior state", () => {
    const out = evaluateRateLimit(1000, null, MAX, WINDOW);
    expect(out).toEqual({ allowed: true, next: { windowStart: 1000, count: 1 } });
  });

  it("increments within the window while under the limit", () => {
    const out = evaluateRateLimit(1500, { windowStart: 1000, count: 1 }, MAX, WINDOW);
    expect(out).toEqual({ allowed: true, next: { windowStart: 1000, count: 2 } });
  });

  it("rejects once the limit is reached within the window", () => {
    const now = 1000 + 20_000;
    const out = evaluateRateLimit(now, { windowStart: 1000, count: MAX }, MAX, WINDOW);
    expect(out.allowed).toBe(false);
    if (!out.allowed) {
      // remaining = (1000 + 60000 - 21000)/1000 = 40s
      expect(out.retryAfterSec).toBe(40);
    }
  });

  it("starts a new window once the previous one elapses", () => {
    const now = 1000 + WINDOW + 5;
    const out = evaluateRateLimit(now, { windowStart: 1000, count: MAX }, MAX, WINDOW);
    expect(out).toEqual({ allowed: true, next: { windowStart: now, count: 1 } });
  });

  it("never reports a retry below 1 second", () => {
    const now = 1000 + WINDOW - 1; // 1ms left
    const out = evaluateRateLimit(now, { windowStart: 1000, count: MAX }, MAX, WINDOW);
    expect(out.allowed).toBe(false);
    if (!out.allowed) expect(out.retryAfterSec).toBeGreaterThanOrEqual(1);
  });
});
