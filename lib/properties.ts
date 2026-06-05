// Shared property catalog — option lists for the create form, filters and labels.

import type { ListingType, PropertyType } from "@/lib/types";

export const LISTING_TYPES: { id: ListingType; label: string }[] = [
  { id: "sale", label: "For Sale" },
  { id: "rent", label: "For Rent" },
];

export const PROPERTY_TYPES: { id: PropertyType; label: string }[] = [
  { id: "house", label: "House" },
  { id: "apartment", label: "Apartment" },
  { id: "land", label: "Land / Plot" },
  { id: "commercial", label: "Commercial" },
  { id: "office", label: "Office" },
  { id: "other", label: "Other" },
];

const label = <T extends string>(opts: { id: T; label: string }[], id: T) =>
  opts.find((o) => o.id === id)?.label ?? id;

export const listingTypeLabel = (id: ListingType) => label(LISTING_TYPES, id);
export const propertyTypeLabel = (id: PropertyType) => label(PROPERTY_TYPES, id);

/** Property types that don't have rooms (so the form/specs can hide bed/bath). */
export const ROOMLESS_TYPES: PropertyType[] = ["land", "commercial", "office"];
