import "server-only";

// Server-side listing data access. Reads from Firestore via the Admin SDK when
// configured; otherwise falls back to the in-repo sample data so the app stays
// usable in development before Firebase is set up (and before `npm run seed`).
//
// Queries are deliberately index-free: at most one equality/orderBy filter hits
// Firestore, and any remaining filtering/sorting is done in memory. This avoids
// requiring composite indexes for the MVP. Revisit when listing volume grows.

import { revalidateTag, unstable_cache } from "next/cache";
import { Timestamp } from "firebase-admin/firestore";
import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import {
  LISTINGS as SAMPLE_LISTINGS,
  getListing as sampleGetListing,
} from "@/lib/mock";
import type { CategoryId, Currency, Listing, Property, SellerType, ServiceInfo, Vehicle } from "@/lib/types";

const COLLECTION = "listings";
const FETCH_LIMIT = 60;

// Browse reads are cached across requests (Next data cache) to cut Firestore
// reads and latency on the always-dynamic browse pages. Busted immediately on
// create/moderation via revalidateTag(LISTINGS_TAG). Short TTL bounds staleness.
export const LISTINGS_TAG = "listings";
const CACHE_TTL_SECONDS = 30;

export interface NewListingInput {
  title: string;
  description: string;
  price: number;
  currency: Currency;
  sellerType: SellerType;
  category: CategoryId;
  county: string;
  city: string;
  photos: string[];
  vehicle?: Vehicle;
  property?: Property;
  service?: ServiceInfo;
  /** Premium/Business sellers get featured placement. */
  featured?: boolean;
}

type FirestoreDoc = FirebaseFirestore.QueryDocumentSnapshot | FirebaseFirestore.DocumentSnapshot;

function toIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === "string") return value;
  return new Date().toISOString();
}

function docToVehicle(v: unknown): Vehicle | undefined {
  if (!v || typeof v !== "object") return undefined;
  const r = v as Record<string, unknown>;
  return {
    make: String(r.make ?? ""),
    model: String(r.model ?? ""),
    year: Number(r.year) || 0,
    mileage: Number(r.mileage) || 0,
    condition: (r.condition as Vehicle["condition"]) ?? "used",
    fuelType: (r.fuelType as Vehicle["fuelType"]) ?? "petrol",
    transmission: (r.transmission as Vehicle["transmission"]) ?? "manual",
    exteriorColor: String(r.exteriorColor ?? ""),
    interiorColor: String(r.interiorColor ?? ""),
    vin: String(r.vin ?? ""),
  };
}

function docToProperty(p: unknown): Property | undefined {
  if (!p || typeof p !== "object") return undefined;
  const r = p as Record<string, unknown>;
  return {
    listingType: (r.listingType as Property["listingType"]) ?? "sale",
    propertyType: (r.propertyType as Property["propertyType"]) ?? "house",
    bedrooms: Number(r.bedrooms) || 0,
    bathrooms: Number(r.bathrooms) || 0,
    squareFeet: Number(r.squareFeet) || 0,
    landSize: Number(r.landSize) || 0,
  };
}

function docToService(s: unknown): ServiceInfo | undefined {
  if (!s || typeof s !== "object") return undefined;
  const r = s as Record<string, unknown>;
  return {
    businessName: String(r.businessName ?? ""),
    phone: String(r.phone ?? ""),
    whatsapp: String(r.whatsapp ?? ""),
  };
}

function docToListing(doc: FirestoreDoc): Listing {
  const d = doc.data() ?? {};
  return {
    id: doc.id,
    sellerId: d.sellerId ?? "",
    title: d.title ?? "",
    description: d.description ?? "",
    price: typeof d.price === "number" ? d.price : Number(d.price) || 0,
    currency: d.currency === "USD" ? "USD" : "LRD",
    sellerType: d.sellerType === "business" ? "business" : "individual",
    category: d.category ?? "general",
    county: d.county ?? "",
    city: d.city ?? "",
    photos: Array.isArray(d.photos) ? d.photos : [],
    status: d.status ?? "active",
    featured: Boolean(d.featured),
    createdAt: toIso(d.createdAt),
    ...(d.vehicle ? { vehicle: docToVehicle(d.vehicle) } : {}),
    ...(d.property ? { property: docToProperty(d.property) } : {}),
    ...(d.service ? { service: docToService(d.service) } : {}),
  };
}

const byNewest = (a: Listing, b: Listing) => b.createdAt.localeCompare(a.createdAt);

// Cache wrapper: tag + TTL applied uniformly. Args become part of the cache key.
function cached<A extends unknown[], R>(
  fn: (...args: A) => Promise<R>,
  keyParts: string[],
) {
  return unstable_cache(fn, keyParts, {
    tags: [LISTINGS_TAG],
    revalidate: CACHE_TTL_SECONDS,
  });
}

/** Most recent active listings, newest first. */
async function fetchRecentListings(): Promise<Listing[]> {
  if (!isAdminConfigured()) {
    return [...SAMPLE_LISTINGS].filter((l) => l.status === "active").sort(byNewest);
  }
  const snap = await adminDb()
    .collection(COLLECTION)
    .orderBy("createdAt", "desc")
    .limit(FETCH_LIMIT)
    .get();
  return snap.docs.map(docToListing).filter((l) => l.status === "active");
}
export const getRecentListings = cached(fetchRecentListings, ["listings:recent"]);

/**
 * Count active listings per group of category ids (for homepage category cards).
 * Uses Firestore count() aggregation when configured; otherwise tallies samples.
 */
export async function getCategoryCounts(
  groups: Record<string, string[]>,
): Promise<Record<string, number>> {
  const out: Record<string, number> = {};
  if (!isAdminConfigured()) {
    for (const [key, ids] of Object.entries(groups)) {
      out[key] = SAMPLE_LISTINGS.filter((l) => l.status === "active" && ids.includes(l.category)).length;
    }
    return out;
  }
  await Promise.all(
    Object.entries(groups).map(async ([key, ids]) => {
      try {
        const snap = await adminDb()
          .collection(COLLECTION)
          .where("status", "==", "active")
          .where("category", "in", ids.slice(0, 30))
          .count()
          .get();
        out[key] = snap.data().count;
      } catch {
        out[key] = 0;
      }
    }),
  );
  return out;
}

async function fetchFeaturedListings(): Promise<Listing[]> {
  if (!isAdminConfigured()) {
    return SAMPLE_LISTINGS.filter((l) => l.featured && l.status === "active");
  }
  const snap = await adminDb()
    .collection(COLLECTION)
    .where("featured", "==", true)
    .limit(FETCH_LIMIT)
    .get();
  return snap.docs.map(docToListing).filter((l) => l.status === "active").sort(byNewest);
}
export const getFeaturedListings = cached(fetchFeaturedListings, ["listings:featured"]);

async function fetchListingsByCategory(category: string): Promise<Listing[]> {
  if (!isAdminConfigured()) {
    return SAMPLE_LISTINGS.filter(
      (l) => l.category === category && l.status === "active",
    ).sort(byNewest);
  }
  const snap = await adminDb()
    .collection(COLLECTION)
    .where("category", "==", category)
    .limit(FETCH_LIMIT)
    .get();
  return snap.docs.map(docToListing).filter((l) => l.status === "active").sort(byNewest);
}
export const getListingsByCategory = cached(fetchListingsByCategory, ["listings:category"]);

async function fetchListingsBySeller(sellerId: string): Promise<Listing[]> {
  if (!isAdminConfigured()) {
    return SAMPLE_LISTINGS.filter((l) => l.sellerId === sellerId).sort(byNewest);
  }
  const snap = await adminDb()
    .collection(COLLECTION)
    .where("sellerId", "==", sellerId)
    .limit(FETCH_LIMIT)
    .get();
  return snap.docs.map(docToListing).sort(byNewest);
}
export const getListingsBySeller = cached(fetchListingsBySeller, ["listings:seller"]);

export async function getListing(id: string): Promise<Listing | null> {
  if (!isAdminConfigured()) {
    return sampleGetListing(id) ?? null;
  }
  const doc = await adminDb().collection(COLLECTION).doc(id).get();
  return doc.exists ? docToListing(doc) : null;
}

/** Simple substring search over recent listings (in-memory for the MVP). */
export async function searchListings(query: string): Promise<Listing[]> {
  const all = await getRecentListings();
  const q = query.trim().toLowerCase();
  if (!q) return all;
  return all.filter((l) => `${l.title} ${l.description}`.toLowerCase().includes(q));
}

/** Create a listing owned by `sellerId`. Returns the new document id. */
export async function createListing(
  sellerId: string,
  input: NewListingInput,
): Promise<string> {
  const ref = await adminDb()
    .collection(COLLECTION)
    .add({
      sellerId,
      title: input.title,
      description: input.description,
      price: input.price,
      currency: input.currency,
      sellerType: input.sellerType,
      category: input.category,
      county: input.county,
      city: input.city,
      photos: input.photos,
      status: "active",
      featured: input.featured ?? false,
      createdAt: Timestamp.now(),
      // Firestore rejects `undefined`, so only include the maps when present.
      ...(input.vehicle ? { vehicle: input.vehicle } : {}),
      ...(input.property ? { property: input.property } : {}),
      ...(input.service ? { service: input.service } : {}),
    });
  revalidateTag(LISTINGS_TAG, "max"); // refresh browse caches (stale-while-revalidate)
  return ref.id;
}
