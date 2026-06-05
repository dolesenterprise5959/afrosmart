// Pure input validators shared by the server actions / route handlers. Keeping
// them dependency-light (only the static catalog) makes them unit-testable and
// keeps validation messages consistent across the app.

import { CATEGORIES } from "@/lib/mock";
import type {
  CategoryId,
  ReportReason,
  ReportTargetType,
} from "@/lib/types";

const REPORT_REASONS: ReportReason[] = ["scam", "spam", "fake", "wrong_category"];
const REPORT_TARGETS: ReportTargetType[] = ["listing", "user"];

export interface ListingFields {
  title: string;
  description: string;
  price: number;
  category: string;
  county: string;
  city: string;
}

/** Returns an error message, or null when the listing fields are valid. */
export function validateListingFields(f: ListingFields): string | null {
  if (f.title.trim().length < 3) return "Please enter a title (at least 3 characters).";
  if (f.description.trim().length < 10) return "Please add a longer description.";
  if (!Number.isFinite(f.price) || f.price <= 0) return "Please enter a valid price.";
  if (!CATEGORIES.some((c) => c.id === (f.category as CategoryId))) {
    return "Please choose a category.";
  }
  if (!f.county.trim()) return "Please choose a county.";
  if (!f.city.trim()) return "Please enter a city.";
  return null;
}

export interface VehicleFields {
  make: string;
  model: string;
  year: number;
  mileage: number;
}

/** Returns an error message, or null when the core vehicle fields are valid. */
export function validateVehicleFields(v: VehicleFields): string | null {
  if (v.make.trim().length < 2) return "Please enter the vehicle make.";
  if (v.model.trim().length < 1) return "Please enter the vehicle model.";
  const nextYear = new Date().getFullYear() + 1;
  if (!Number.isInteger(v.year) || v.year < 1980 || v.year > nextYear) {
    return `Please enter a valid year (1980–${nextYear}).`;
  }
  if (!Number.isFinite(v.mileage) || v.mileage < 0) return "Please enter a valid mileage.";
  return null;
}

export interface PropertyFields {
  listingType: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
}

/** Returns an error message, or null when the core property fields are valid. */
export function validatePropertyFields(p: PropertyFields): string | null {
  if (p.listingType !== "sale" && p.listingType !== "rent") return "Please choose Sale or Rent.";
  const types = ["house", "apartment", "land", "commercial", "office", "other"];
  if (!types.includes(p.propertyType)) return "Please choose a property type.";
  if (!Number.isFinite(p.bedrooms) || p.bedrooms < 0) return "Please enter a valid number of bedrooms.";
  if (!Number.isFinite(p.bathrooms) || p.bathrooms < 0) return "Please enter a valid number of bathrooms.";
  if (!Number.isFinite(p.squareFeet) || p.squareFeet < 0) return "Please enter a valid square footage.";
  return null;
}

/** Returns an error message, or null when the star value is valid (1–5). */
export function validateStars(stars: number): string | null {
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    return "Choose between 1 and 5 stars";
  }
  return null;
}

/** Returns an error message, or null when the report fields are valid. */
export function validateReportFields(
  targetType: string,
  reason: string,
): string | null {
  if (!REPORT_TARGETS.includes(targetType as ReportTargetType)) {
    return "Invalid target";
  }
  if (!REPORT_REASONS.includes(reason as ReportReason)) {
    return "Choose a reason";
  }
  return null;
}
