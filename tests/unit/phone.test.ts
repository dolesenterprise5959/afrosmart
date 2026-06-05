import { describe, expect, it } from "vitest";
import { toE164 } from "@/lib/utils/phone";

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
});
