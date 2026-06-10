import { describe, it, expect } from "vitest";
import { isAllowedImageUrl } from "@/lib/utils/image-url";

describe("isAllowedImageUrl", () => {
  it("allows real Firebase Storage download URLs", () => {
    expect(
      isAllowedImageUrl(
        "https://firebasestorage.googleapis.com/v0/b/afrosmart.appspot.com/o/listings%2Fu1%2F1.jpg?alt=media&token=abc",
      ),
    ).toBe(true);
    expect(isAllowedImageUrl("https://storage.googleapis.com/afrosmart/x.jpg")).toBe(true);
  });

  it("rejects arbitrary external hosts", () => {
    expect(isAllowedImageUrl("https://evil.com/malware.jpg")).toBe(false);
    expect(isAllowedImageUrl("https://attacker.example/a.png")).toBe(false);
  });

  it("rejects SSRF-style internal targets", () => {
    expect(isAllowedImageUrl("https://169.254.169.254/latest/meta-data/")).toBe(false);
    expect(isAllowedImageUrl("https://metadata.google.internal/")).toBe(false);
  });

  it("rejects non-https and malformed input", () => {
    expect(isAllowedImageUrl("http://firebasestorage.googleapis.com/x.jpg")).toBe(false);
    expect(isAllowedImageUrl("javascript:alert(1)")).toBe(false);
    expect(isAllowedImageUrl("not a url")).toBe(false);
    expect(isAllowedImageUrl("")).toBe(false);
    expect(isAllowedImageUrl(null)).toBe(false);
    expect(isAllowedImageUrl(42)).toBe(false);
  });

  it("rejects hostname-suffix spoofing", () => {
    expect(isAllowedImageUrl("https://firebasestorage.googleapis.com.evil.com/x.jpg")).toBe(false);
  });
});
