import { describe, expect, it } from "vitest";
import {
  CATEGORIES,
  COUNTIES,
  formatPrice,
  getCategory,
  getFeaturedListings,
  getListing,
  getListingsByCategory,
  getRecentListings,
  getUser,
} from "@/lib/mock";

describe("catalog", () => {
  it("defines all 7 PRD categories", () => {
    expect(CATEGORIES.map((c) => c.id).sort()).toEqual(
      ["cars", "electronics", "general", "jobs", "phones", "property", "services"].sort(),
    );
  });

  it("defines the 6 initial counties from the PRD", () => {
    expect(COUNTIES).toHaveLength(6);
    expect(COUNTIES.map((c) => c.name)).toContain("Montserrado");
  });

  it("looks up a category by id", () => {
    expect(getCategory("cars")?.label).toBe("Cars");
    expect(getCategory("nope")).toBeUndefined();
  });
});

describe("formatPrice", () => {
  it("formats LRD with thousands separators", () => {
    expect(formatPrice(78000)).toBe("L$ 78,000");
    expect(formatPrice(950000)).toBe("L$ 950,000");
  });
});

describe("sample-data lookups (fallback source)", () => {
  it("getListing returns a known listing and undefined for unknown", () => {
    expect(getListing("l1")?.category).toBe("cars");
    expect(getListing("missing")).toBeUndefined();
  });

  it("getUser returns a known user", () => {
    expect(getUser("u1")?.displayName).toBe("Joseph Kollie");
  });

  it("getListingsByCategory returns only active listings of that category", () => {
    const phones = getListingsByCategory("phones");
    expect(phones.length).toBeGreaterThan(0);
    expect(phones.every((l) => l.category === "phones" && l.status === "active")).toBe(true);
  });

  it("getFeaturedListings only returns featured + active", () => {
    const featured = getFeaturedListings();
    expect(featured.every((l) => l.featured && l.status === "active")).toBe(true);
  });

  it("getRecentListings is sorted newest-first", () => {
    const recent = getRecentListings();
    for (let i = 1; i < recent.length; i++) {
      expect(recent[i - 1].createdAt >= recent[i].createdAt).toBe(true);
    }
  });
});
