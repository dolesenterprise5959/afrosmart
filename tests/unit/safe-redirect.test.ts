import { describe, it, expect } from "vitest";
import { safeNextPath } from "@/lib/utils/safe-redirect";

describe("safeNextPath", () => {
  it("allows normal same-origin paths", () => {
    expect(safeNextPath("/dashboard")).toBe("/dashboard");
    expect(safeNextPath("/listing/abc123")).toBe("/listing/abc123");
    expect(safeNextPath("/marketplace?cat=cars&sort=new")).toBe("/marketplace?cat=cars&sort=new");
  });

  it("falls back for empty / missing input", () => {
    expect(safeNextPath(null)).toBe("/dashboard");
    expect(safeNextPath(undefined)).toBe("/dashboard");
    expect(safeNextPath("")).toBe("/dashboard");
  });

  it("blocks protocol-relative open redirects", () => {
    expect(safeNextPath("//evil.com")).toBe("/dashboard");
    expect(safeNextPath("//evil.com/path")).toBe("/dashboard");
  });

  it("blocks backslash-smuggled redirects", () => {
    expect(safeNextPath("/\\evil.com")).toBe("/dashboard");
  });

  it("blocks absolute URLs", () => {
    expect(safeNextPath("https://evil.com")).toBe("/dashboard");
    expect(safeNextPath("http://evil.com")).toBe("/dashboard");
    expect(safeNextPath("javascript:alert(1)")).toBe("/dashboard");
  });

  it("blocks paths with embedded scheme or control chars", () => {
    expect(safeNextPath("/redirect?to=https://evil.com")).toBe("/dashboard");
    expect(safeNextPath("/foo\nbar")).toBe("/dashboard");
  });

  it("honours a custom fallback", () => {
    expect(safeNextPath("//evil.com", "/")).toBe("/");
  });
});
