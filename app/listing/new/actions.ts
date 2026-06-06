"use server";

import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth/dal";
import { createListing } from "@/lib/firestore/listings";
import { ensureUserProfile, isSuspended } from "@/lib/firestore/users";
import { checkRateLimit, rateLimitMessage } from "@/lib/firestore/ratelimit";
import { getPlan } from "@/lib/firestore/premium";
import { isFeaturedEligible } from "@/lib/premium";
import { validateListingFields, validatePropertyFields, validateVehicleFields } from "@/lib/validation";
import { FUEL_TYPES, TRANSMISSIONS, VEHICLE_CONDITIONS } from "@/lib/vehicles";
import { LISTING_TYPES, PROPERTY_TYPES } from "@/lib/properties";
import type {
  CategoryId, FuelType, ListingType, Property, PropertyType,
  Transmission, Vehicle, VehicleCondition,
} from "@/lib/types";

interface VehiclePayload {
  make?: string;
  model?: string;
  year?: string | number;
  mileage?: string | number;
  condition?: string;
  fuelType?: string;
  transmission?: string;
  exteriorColor?: string;
  interiorColor?: string;
  vin?: string;
}

interface PropertyPayload {
  listingType?: string;
  propertyType?: string;
  bedrooms?: string | number;
  bathrooms?: string | number;
  squareFeet?: string | number;
  landSize?: string | number;
}

const oneOf = <T extends string>(opts: { id: T }[], value: unknown, fallback: T): T =>
  opts.some((o) => o.id === value) ? (value as T) : fallback;

export interface CreateListingResult {
  error?: string;
}

interface CreateListingPayload {
  title: string;
  description: string;
  price: string | number;
  category: string;
  county: string;
  city: string;
  photos: string[];
  vehicle?: VehiclePayload;
  property?: PropertyPayload;
}

// Server-side create. Re-verifies the session (never trusts the client for the
// seller id) and validates all fields before writing to Firestore. On success
// it redirects to the new listing's page.
export async function createListingAction(
  input: CreateListingPayload,
): Promise<CreateListingResult> {
  const session = await verifySession();

  if (await isSuspended(session.uid)) {
    return { error: "Your account is suspended and cannot post listings." };
  }

  const limit = await checkRateLimit(session.uid, "listing");
  if (!limit.ok) {
    return { error: rateLimitMessage("listing", limit.retryAfterSec) };
  }

  const title = input.title?.trim() ?? "";
  const description = input.description?.trim() ?? "";
  const price = Number(input.price);
  const category = input.category as CategoryId;
  const county = input.county?.trim() ?? "";
  const city = input.city?.trim() ?? "";
  const photos = Array.isArray(input.photos) ? input.photos.slice(0, 6) : [];

  const error = validateListingFields({ title, description, price, category, county, city });
  if (error) return { error };

  // Structured vehicle details for car listings.
  let vehicle: Vehicle | undefined;
  if (category === "cars" && input.vehicle) {
    const v = input.vehicle;
    const make = (v.make ?? "").trim();
    const model = (v.model ?? "").trim();
    const year = Math.trunc(Number(v.year));
    const mileage = Math.trunc(Number(v.mileage));
    const vErr = validateVehicleFields({ make, model, year, mileage });
    if (vErr) return { error: vErr };
    vehicle = {
      make,
      model,
      year,
      mileage,
      condition: oneOf<VehicleCondition>(VEHICLE_CONDITIONS, v.condition, "used"),
      fuelType: oneOf<FuelType>(FUEL_TYPES, v.fuelType, "petrol"),
      transmission: oneOf<Transmission>(TRANSMISSIONS, v.transmission, "automatic"),
      exteriorColor: (v.exteriorColor ?? "").trim(),
      interiorColor: (v.interiorColor ?? "").trim(),
      vin: (v.vin ?? "").trim(),
    };
  }

  // Structured property details for real-estate listings.
  let property: Property | undefined;
  if (category === "property" && input.property) {
    const p = input.property;
    const listingType = oneOf<ListingType>(LISTING_TYPES, p.listingType, "sale");
    const propertyType = oneOf<PropertyType>(PROPERTY_TYPES, p.propertyType, "house");
    const bedrooms = Math.max(0, Math.trunc(Number(p.bedrooms) || 0));
    const bathrooms = Math.max(0, Math.trunc(Number(p.bathrooms) || 0));
    const squareFeet = Math.max(0, Math.trunc(Number(p.squareFeet) || 0));
    const landSize = Math.max(0, Math.trunc(Number(p.landSize) || 0));
    const pErr = validatePropertyFields({ listingType, propertyType, bedrooms, bathrooms, squareFeet });
    if (pErr) return { error: pErr };
    property = { listingType, propertyType, bedrooms, bathrooms, squareFeet, landSize };
  }

  await ensureUserProfile(session.uid, { phone: session.phone, county, city });
  // Premium/Business sellers get featured placement automatically.
  const featured = isFeaturedEligible(await getPlan(session.uid));
  const id = await createListing(session.uid, {
    title,
    description,
    price,
    category,
    county,
    city,
    photos,
    vehicle,
    property,
    featured,
  });

  redirect(`/listing/${id}`);
}
