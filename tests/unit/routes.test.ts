import { describe, expect, it } from "vitest";
import { isProtectedPath, PROTECTED_PREFIXES, SESSION_COOKIE } from "@/lib/auth/constants";

describe("isProtectedPath (proxy route guards)", () => {
  it("guards the expected protected areas", () => {
    for (const p of ["/dashboard", "/messages", "/settings", "/saved", "/listing/new", "/admin"]) {
      expect(isProtectedPath(p), p).toBe(true);
    }
  });

  it("guards nested paths under a protected prefix", () => {
    expect(isProtectedPath("/messages/abc123")).toBe(true);
    expect(isProtectedPath("/admin/reports")).toBe(true);
  });

  it("leaves public browsing open", () => {
    for (const p of ["/", "/marketplace", "/marketplace/cars", "/listing/l1", "/u/u1", "/login", "/businesses", "/jobs"]) {
      expect(isProtectedPath(p), p).toBe(false);
    }
  });

  it("does not treat /listing/[id] as protected (only /listing/new)", () => {
    expect(isProtectedPath("/listing/some-listing-id")).toBe(false);
    expect(isProtectedPath("/listing/new")).toBe(true);
  });

  it("exposes a stable session cookie name and prefix list", () => {
    expect(SESSION_COOKIE).toBe("afrosmart_session");
    expect(PROTECTED_PREFIXES).toContain("/admin");
  });
});
