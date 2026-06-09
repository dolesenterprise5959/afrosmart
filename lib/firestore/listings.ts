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
import type { CategoryId, Currency, Listing, ListingStatus, Property, SellerType, ServiceInfo, Vehicle } from "@/lib/types";

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
  publicPhone?: string;
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
    ...(d.publicPhone ? { publicPhone: String(d.publicPhone) } : {}),
  };
}

const byNewest = (a: Listing, b: Listing) => b.createdAt.localeCompare(a.createdAt);

// How many recent listings the substring fallback scans (covers legacy listings
// created before searchTokens existed, plus very recent posts).
const SEARCH_SCAN_LIMIT = 200;

/** Lowercased, deduped keyword tokens for Firestore array-contains search. */
function tokenize(text: string): string[] {
  const words = text.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  return [...new Set(words.filter((w) => w.length >= 2))].slice(0, 40);
}

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
  const col = adminDb().collection(COLLECTION);
  try {
    // Filter active server-side so inactive docs don't eat the page (needs the
    // (status, createdAt) index).
    const snap = await col.where("status", "==", "active").orderBy("createdAt", "desc").limit(FETCH_LIMIT).get();
    return snap.docs.map(docToListing);
  } catch {
    // Index still building — fall back to ordering only + in-memory active filter.
    const snap = await col.orderBy("createdAt", "desc").limit(FETCH_LIMIT).get();
    return snap.docs.map(docToListing).filter((l) => l.status === "active");
  }
}
export const getRecentListings = cached(fetchRecentListings, ["listings:recent"]);

/** Larger active-listing window used as the substring fallback for search. */
async function fetchRecentForSearch(): Promise<Listing[]> {
  if (!isAdminConfigured()) {
    return [...SAMPLE_LISTINGS].filter((l) => l.status === "active").sort(byNewest);
  }
  const col = adminDb().collection(COLLECTION);
  try {
    const snap = await col.where("status", "==", "active").orderBy("createdAt", "desc").limit(SEARCH_SCAN_LIMIT).get();
    return snap.docs.map(docToListing);
  } catch {
    const snap = await col.orderBy("createdAt", "desc").limit(SEARCH_SCAN_LIMIT).get();
    return snap.docs.map(docToListing).filter((l) => l.status === "active");
  }
}
const getRecentForSearch = cached(fetchRecentForSearch, ["listings:search-scan"]);

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

/** Minimal listing index for instant client-side search autocomplete. */
export interface SearchIndexItem {
  id: string;
  title: string;
  category: string;
  price: number;
  currency: string;
  photo: string;
}
const toIndex = (l: Listing): SearchIndexItem => ({
  id: l.id,
  title: l.title,
  category: l.category,
  price: l.price,
  currency: l.currency ?? "LRD",
  photo: l.photos?.[0] ?? "",
});
async function fetchSearchIndex(): Promise<SearchIndexItem[]> {
  if (!isAdminConfigured()) {
    return SAMPLE_LISTINGS.filter((l) => l.status === "active").map(toIndex);
  }
  const col = adminDb().collection(COLLECTION);
  try {
    const snap = await col.where("status", "==", "active").orderBy("createdAt", "desc").limit(300).get();
    return snap.docs.map(docToListing).map(toIndex);
  } catch {
    const snap = await col.orderBy("createdAt", "desc").limit(300).get();
    return snap.docs.map(docToListing).filter((l) => l.status === "active").map(toIndex);
  }
}
export const getSearchIndex = cached(fetchSearchIndex, ["listings:search-index"]);

async function fetchFeaturedListings(): Promise<Listing[]> {
  if (!isAdminConfigured()) {
    return SAMPLE_LISTINGS.filter((l) => l.featured && l.status === "active");
  }
  const col = adminDb().collection(COLLECTION);
  try {
    const snap = await col.where("featured", "==", true).where("status", "==", "active").orderBy("createdAt", "desc").limit(FETCH_LIMIT).get();
    return snap.docs.map(docToListing);
  } catch {
    const snap = await col.where("featured", "==", true).limit(FETCH_LIMIT).get();
    return snap.docs.map(docToListing).filter((l) => l.status === "active").sort(byNewest);
  }
}
export const getFeaturedListings = cached(fetchFeaturedListings, ["listings:featured"]);

async function fetchListingsByCategory(category: string): Promise<Listing[]> {
  if (!isAdminConfigured()) {
    return SAMPLE_LISTINGS.filter(
      (l) => l.category === category && l.status === "active",
    ).sort(byNewest);
  }
  const col = adminDb().collection(COLLECTION);
  try {
    const snap = await col.where("category", "==", category).where("status", "==", "active").orderBy("createdAt", "desc").limit(FETCH_LIMIT).get();
    return snap.docs.map(docToListing);
  } catch {
    const snap = await col.where("category", "==", category).limit(FETCH_LIMIT).get();
    return snap.docs.map(docToListing).filter((l) => l.status === "active").sort(byNewest);
  }
}
export const getListingsByCategory = cached(fetchListingsByCategory, ["listings:category"]);

async function fetchListingsBySeller(sellerId: string): Promise<Listing[]> {
  if (!isAdminConfigured()) {
    return SAMPLE_LISTINGS.filter((l) => l.sellerId === sellerId).sort(byNewest);
  }
  const col = adminDb().collection(COLLECTION);
  try {
    const snap = await col.where("sellerId", "==", sellerId).orderBy("createdAt", "desc").limit(FETCH_LIMIT).get();
    return snap.docs.map(docToListing).filter((l) => l.status !== "removed");
  } catch {
    const snap = await col.where("sellerId", "==", sellerId).limit(FETCH_LIMIT).get();
    return snap.docs.map(docToListing).filter((l) => l.status !== "removed").sort(byNewest);
  }
}
export const getListingsBySeller = cached(fetchListingsBySeller, ["listings:seller"]);

/** Owner-scoped writes (the caller must verify ownership first). */
export async function setListingStatus(id: string, status: ListingStatus): Promise<void> {
  if (!isAdminConfigured()) return;
  await adminDb().collection(COLLECTION).doc(id).set({ status }, { merge: true });
  revalidateTag(LISTINGS_TAG, "max");
}
export async function updateListingFields(
  id: string,
  patch: Partial<Pick<Listing, "title" | "description" | "price" | "currency" | "county" | "city">>,
): Promise<void> {
  if (!isAdminConfigured()) return;
  const clean = Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined));
  await adminDb().collection(COLLECTION).doc(id).set(clean, { merge: true });
  revalidateTag(LISTINGS_TAG, "max");
}

export async function getListing(id: string): Promise<Listing | null> {
  if (!isAdminConfigured()) {
    return sampleGetListing(id) ?? null;
  }
  const doc = await adminDb().collection(COLLECTION).doc(id).get();
  return doc.exists ? docToListing(doc) : null;
}

/**
 * Keyword search across ALL listings (not just the recent 60).
 *
 * Primary path: a Firestore `array-contains` query on the most selective query
 * token against the stored `searchTokens` — this scales to any catalog size.
 * Results are then refined in memory to require every query token. A recent
 * substring scan is unioned in so listings created before `searchTokens` existed
 * (and partial-word matches) stay findable. Empty query → recent listings.
 */
export async function searchListings(query: string): Promise<Listing[]> {
  const q = query.trim().toLowerCase();
  if (!isAdminConfigured()) {
    const all = [...SAMPLE_LISTINGS].filter((l) => l.status === "active").sort(byNewest);
    return q ? all.filter((l) => `${l.title} ${l.description}`.toLowerCase().includes(q)) : all;
  }
  if (!q) return getRecentListings();

  const tokens = tokenize(q);
  const matches = new Map<string, Listing>();

  // 1) Scalable token search across the whole collection (most selective token).
  if (tokens.length) {
    const anchor = [...tokens].sort((a, b) => b.length - a.length)[0];
    try {
      const snap = await adminDb()
        .collection(COLLECTION)
        .where("status", "==", "active")
        .where("searchTokens", "array-contains", anchor)
        .orderBy("createdAt", "desc")
        .limit(100)
        .get();
      for (const d of snap.docs) {
        const l = docToListing(d);
        const hay = `${l.title} ${l.description} ${l.category}`.toLowerCase();
        if (tokens.every((t) => hay.includes(t))) matches.set(l.id, l);
      }
    } catch {
      /* index still building — the substring scan below still returns results */
    }
  }

  // 2) Recent-window substring fallback (legacy/un-tokenized listings + substrings).
  for (const l of await getRecentForSearch()) {
    if (`${l.title} ${l.description}`.toLowerCase().includes(q)) matches.set(l.id, l);
  }

  return [...matches.values()].sort(byNewest);
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
      // Keyword tokens powering scalable array-contains search (see searchListings).
      searchTokens: tokenize(
        `${input.title} ${input.description} ${input.category} ${input.vehicle?.make ?? ""} ${input.vehicle?.model ?? ""}`,
      ),
      createdAt: Timestamp.now(),
      // Firestore rejects `undefined`, so only include the maps when present.
      ...(input.vehicle ? { vehicle: input.vehicle } : {}),
      ...(input.property ? { property: input.property } : {}),
      ...(input.service ? { service: input.service } : {}),
      ...(input.publicPhone ? { publicPhone: input.publicPhone } : {}),
    });
  revalidateTag(LISTINGS_TAG, "max"); // refresh browse caches (stale-while-revalidate)
  return ref.id;
}
