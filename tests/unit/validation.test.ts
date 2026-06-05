import { describe, expect, it } from "vitest";
import {
  validateListingFields,
  validateStars,
  validateReportFields,
  type ListingFields,
} from "@/lib/validation";

const goodListing: ListingFields = {
  title: "Toyota Corolla 2014",
  description: "Well maintained, documents complete.",
  price: 950000,
  category: "cars",
  county: "Margibi",
  city: "Kakata",
};

describe("validateListingFields", () => {
  it("accepts a valid listing", () => {
    expect(validateListingFields(goodListing)).toBeNull();
  });

  it("rejects a short title", () => {
    expect(validateListingFields({ ...goodListing, title: "ab" })).toMatch(/title/i);
  });

  it("rejects a short description", () => {
    expect(validateListingFields({ ...goodListing, description: "short" })).toMatch(/description/i);
  });

  it("rejects non-positive or non-finite prices", () => {
    expect(validateListingFields({ ...goodListing, price: 0 })).toMatch(/price/i);
    expect(validateListingFields({ ...goodListing, price: -5 })).toMatch(/price/i);
    expect(validateListingFields({ ...goodListing, price: NaN })).toMatch(/price/i);
  });

  it("rejects an unknown category", () => {
    expect(validateListingFields({ ...goodListing, category: "spaceships" })).toMatch(/category/i);
  });

  it("requires county and city", () => {
    expect(validateListingFields({ ...goodListing, county: "" })).toMatch(/county/i);
    expect(validateListingFields({ ...goodListing, city: "  " })).toMatch(/city/i);
  });
});

describe("validateStars", () => {
  it("accepts 1 through 5", () => {
    for (const s of [1, 2, 3, 4, 5]) expect(validateStars(s)).toBeNull();
  });

  it("rejects out-of-range and non-integer values", () => {
    expect(validateStars(0)).not.toBeNull();
    expect(validateStars(6)).not.toBeNull();
    expect(validateStars(3.5)).not.toBeNull();
  });
});

describe("validateReportFields", () => {
  it("accepts valid reason + target", () => {
    expect(validateReportFields("listing", "scam")).toBeNull();
    expect(validateReportFields("user", "spam")).toBeNull();
  });

  it("rejects an invalid target type", () => {
    expect(validateReportFields("comment", "scam")).toMatch(/target/i);
  });

  it("rejects an invalid reason", () => {
    expect(validateReportFields("listing", "rude")).toMatch(/reason/i);
  });
});
