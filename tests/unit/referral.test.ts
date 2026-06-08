import { describe, it, expect } from "vitest";
import {
  generateReferralCode,
  normalizeReferralCode,
  rewardForCount,
  referralProgress,
  REFERRALS_PER_REWARD,
  REWARD_USD,
} from "@/lib/referral";

describe("referral rewards", () => {
  it("pays $5 per 10 valid referrals", () => {
    expect(rewardForCount(0)).toBe(0);
    expect(rewardForCount(9)).toBe(0);
    expect(rewardForCount(10)).toBe(5);
    expect(rewardForCount(19)).toBe(5);
    expect(rewardForCount(20)).toBe(10);
    expect(rewardForCount(105)).toBe(50);
  });

  it("tracks progress toward the next reward", () => {
    expect(referralProgress(0)).toMatchObject({ intoCurrent: 0, needed: 10, nextRewardAt: 10, earnedUsd: 0 });
    expect(referralProgress(7)).toMatchObject({ intoCurrent: 7, needed: 3, nextRewardAt: 10, earnedUsd: 0 });
    expect(referralProgress(10)).toMatchObject({ intoCurrent: 0, needed: 10, nextRewardAt: 20, earnedUsd: 5 });
    expect(referralProgress(23)).toMatchObject({ intoCurrent: 3, needed: 7, earnedUsd: 10 });
  });

  it("generates stable, prefixed, unambiguous codes", () => {
    const a = generateReferralCode("user-abc");
    expect(a).toBe(generateReferralCode("user-abc")); // deterministic
    expect(a).toMatch(/^AF[2-9A-HJ-NP-Z]{6}$/); // no 0/1/I/O
    expect(generateReferralCode("user-xyz")).not.toBe(a); // different uid → different code
  });

  it("normalizes user-entered codes", () => {
    expect(normalizeReferralCode("  af7k9q xm ")).toBe("AF7K9QXM");
    expect(normalizeReferralCode("")).toBe("");
  });

  it("exposes the documented reward constants", () => {
    expect(REFERRALS_PER_REWARD).toBe(10);
    expect(REWARD_USD).toBe(5);
  });
});
