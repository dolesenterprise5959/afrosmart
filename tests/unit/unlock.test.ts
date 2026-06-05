import { describe, expect, it } from "vitest";
import { isCallUnlocked } from "@/lib/messaging/unlock";

describe("isCallUnlocked (call-unlock rule)", () => {
  const participants = ["buyer", "seller"];

  it("stays locked when only the buyer has messaged", () => {
    expect(isCallUnlocked(participants, ["buyer"])).toBe(false);
  });

  it("stays locked when only the seller has messaged", () => {
    expect(isCallUnlocked(participants, ["seller"])).toBe(false);
  });

  it("unlocks once both participants have messaged", () => {
    expect(isCallUnlocked(participants, ["buyer", "seller"])).toBe(true);
  });

  it("ignores duplicate senders", () => {
    expect(isCallUnlocked(participants, ["buyer", "buyer"])).toBe(false);
  });

  it("ignores a stranger's messages (not a participant)", () => {
    expect(isCallUnlocked(participants, ["buyer", "stranger"])).toBe(false);
  });

  it("never unlocks with no participants", () => {
    expect(isCallUnlocked([], ["a", "b"])).toBe(false);
  });
});
