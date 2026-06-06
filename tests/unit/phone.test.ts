import { describe, expect, it } from "vitest";
import { toE164, toLocalPhone, validateLiberianMobile } from "@/lib/utils/phone";

describe("toE164 (Liberia phone normalisation)", () => {
  it("prefixes a local number with the country code", () => {
    expect(toE164("770000001")).toBe("+231770000001");
  });

  it("drops a leading 0 from local format", () => {
    expect(toE164("0770000001")).toBe("+231770000001");
  });

  it("keeps an already-E.164 number, stripping spaces", () => {
    expect(toE164("+231 77 000 0001")).toBe("+231770000001");
  });

  it("strips non-digits from local input", () => {
    expect(toE164("077-000-0001")).toBe("+231770000001");
  });

  it("trims surrounding whitespace", () => {
    expect(toE164("  0770000001 ")).toBe("+231770000001");
  });

  it("does not double the country code when typed without a +", () => {
    expect(toE164("231770000001")).toBe("+231770000001");
    expect(toE164("231 77 000 0001")).toBe("+231770000001");
  });

  it("treats a 00 international prefix like +", () => {
    expect(toE164("00231770000001")).toBe("+231770000001");
  });

  it("converts local numbers across prefixes to E.164", () => {
    expect(toE164("0770000000")).toBe("+231770000000");
    expect(toE164("0880000000")).toBe("+231880000000");
    expect(toE164("88 000 0000")).toBe("+231880000000");
    expect(toE164("0550000000")).toBe("+231550000000");
  });
});

describe("toLocalPhone (display format)", () => {
  it("strips +231 and shows grouped local format", () => {
    expect(toLocalPhone("+231770000001")).toBe("077 000 0001");
  });
  it("returns empty for empty input", () => {
    expect(toLocalPhone("")).toBe("");
  });
  it("leaves a non-Liberian number unchanged", () => {
    expect(toLocalPhone("+15551234567")).toBe("+15551234567");
  });
});

describe("validateLiberianMobile", () => {
  it("accepts valid local mobile numbers (Lonestar 77, Orange 88)", () => {
    expect(validateLiberianMobile("770000001")).toBeNull();
    expect(validateLiberianMobile("881234567")).toBeNull();
    expect(validateLiberianMobile("0770000001")).toBeNull(); // leading 0
    expect(validateLiberianMobile("77 000 0000")).toBeNull(); // spaces
  });
  it("rejects too-short / too-long numbers", () => {
    expect(validateLiberianMobile("7700")).toMatch(/too short/i);
    expect(validateLiberianMobile("7700000000")).toMatch(/too long/i);
  });
  it("rejects numbers that don't start with a mobile prefix", () => {
    expect(validateLiberianMobile("110000000")).toMatch(/start with/i);
  });
  it("asks for a number when empty", () => {
    expect(validateLiberianMobile("")).toMatch(/enter/i);
  });
});
