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
  it("includes the core categories plus the expanded local-market catalog", () => {
    const ids = CATEGORIES.map((c) => c.id);
    for (const id of ["cars", "property", "phones", "electronics", "services", "jobs", "general"]) {
      expect(ids).toContain(id);
    }
    // Local-market / everyday additions across the new groups.
    for (const id of ["rice", "barber", "restaurants", "motorbike", "churches", "truck-rental"]) {
      expect(ids).toContain(id);
    }
    expect(ids.length).toBeGreaterThan(40);
    expect(new Set(ids).size).toBe(ids.length); // no duplicate ids
  });

  it("defines all 15 counties of Liberia", () => {
    expect(COUNTIES).toHaveLength(15);
    const names = COUNTIES.map((c) => c.name);
    expect(names).toContain("Montserrado");
    expect(names).toContain("Maryland");
  });

  it("looks up a category by id", () => {
    expect(getCategory("cars")?.label).toBe("Cars");
    expect(getCategory("nope")).toBeUndefined();
  });
});

describe("formatPrice", () => {
  it("formats LRD with thousands separators", () => {
    expect(formatPrice(78000)).toBe("L$ 78,000");
    expect(formatPrice(950000, "LRD")).toBe("L$ 950,000");
  });
  it("formats USD with a $ sign", () => {
    expect(formatPrice(1850, "USD")).toBe("$1,850");
  });
  it("shows Free for a zero/empty price", () => {
    expect(formatPrice(0)).toBe("Free");
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
