// Shared domain types for AfroSmart. These mirror the Firestore schema planned
// in the architecture doc, so Phase 1 mock data slots straight into the real
// data layer later without changing component props.

// Category ids are catalog-driven (see lib/categories.ts), so this is an open
// string. The special-cased ids "cars" and "property" have dedicated
// marketplaces (/vehicles, /properties).
export type CategoryId = string;

export interface Category {
  id: CategoryId;
  label: string;
}

export interface County {
  id: string;
  name: string;
  cities: string[];
}

/** Kinds of admin-approved verification. */
export type VerifiedType = "seller" | "business";
/** Lifecycle of a verification request. */
export type VerificationStatus = "none" | "pending" | "verified" | "rejected";
/** Seller subscription tier. */
export type SellerPlan = "free" | "premium" | "business";

export interface User {
  id: string;
  displayName: string;
  /** Name parts captured at onboarding (first required, last optional). */
  firstName?: string;
  lastName?: string;
  /** Stored only on the seller; never exposed publicly (call-unlock protects it). */
  phone: string;
  photoURL?: string;
  /** True once the user completed OTP sign-in (every account is phone-verified). */
  phoneVerified?: boolean;
  county: string;
  city: string;
  isBusiness: boolean;
  ratingAvg: number;
  ratingCount: number;
  /** ISO date string. */
  joinedAt: string;
  /** Admin-approved verification (server-controlled; clients can't self-set). */
  verified?: boolean;
  verifiedType?: VerifiedType | null;
  verificationStatus?: VerificationStatus;
  /** Seller subscription tier (server-controlled). Defaults to "free". */
  plan?: SellerPlan;

  // --- Referral & wallet (Phase 1) ---
  /** Unique shareable referral code, assigned once at account creation. */
  referralCode?: string;
  /** Referral code of the user who referred this account (set once at signup). */
  referredBy?: string;
  /** True once THIS account became a valid referral (phone+profile+first listing),
   *  so the referrer is only ever credited once. Server-controlled. */
  referralCredited?: boolean;
  /** Count of this user's referrals that have become valid. Server-controlled. */
  referralCount?: number;
  /** Spendable wallet balance in USD. Server-controlled. */
  walletBalance?: number;
  /** Total rewards ever earned in USD. Server-controlled. */
  lifetimeEarnings?: number;
}

export type ListingStatus = "active" | "paused" | "sold" | "removed";

/** Listings are priced in Liberian Dollars (LRD) or US Dollars (USD). */
export type Currency = "LRD" | "USD";

/** Whether a listing's seller is an individual or a business. */
export type SellerType = "individual" | "business";

export type VehicleCondition = "new" | "used" | "certified";
export type FuelType = "petrol" | "diesel" | "hybrid" | "electric" | "other";
export type Transmission = "automatic" | "manual";

/** Structured vehicle details, present on listings in the `cars` category. */
export interface Vehicle {
  make: string;
  model: string;
  year: number;
  mileage: number;
  condition: VehicleCondition;
  fuelType: FuelType;
  transmission: Transmission;
  exteriorColor: string;
  interiorColor: string;
  /** Vehicle Identification Number (optional). */
  vin: string;
}

export type ListingType = "sale" | "rent";
export type PropertyType = "house" | "apartment" | "land" | "commercial" | "office" | "other";

/** Structured property details, present on listings in the `property` category. */
export interface Property {
  listingType: ListingType;
  propertyType: PropertyType;
  bedrooms: number;
  bathrooms: number;
  /** Building floor area, in square feet. */
  squareFeet: number;
  /** Land/plot size, in square feet (0 when not applicable). */
  landSize: number;
}

/** Public business contact for service listings (shown openly, unlike the
 *  privacy-protected peer marketplace where phone is call-unlocked). */
export interface ServiceInfo {
  businessName: string;
  /** Public contact phone (E.164). */
  phone: string;
  /** Public WhatsApp number (E.164). */
  whatsapp: string;
}

export interface Listing {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  /** Price amount. For rentals this is the monthly rent. */
  price: number;
  /** Currency of `price`. Defaults to LRD for legacy listings. */
  currency?: Currency;
  /** Seller type, denormalised from the seller's account at post time. */
  sellerType?: SellerType;
  category: CategoryId;
  county: string;
  city: string;
  /** Placeholder colour pairs stand in for photos in Phase 1. */
  photos: string[];
  status: ListingStatus;
  featured: boolean;
  /** ISO date string. */
  createdAt: string;
  /** Structured vehicle spec, present when category === "cars". */
  vehicle?: Vehicle;
  /** Structured property spec, present when category === "property". */
  property?: Property;
  /** Public business contact, present on service-category listings. */
  service?: ServiceInfo;
  /** Seller's phone shown publicly on this listing when they opt in (E.164). */
  publicPhone?: string;
}

// --- Messaging ---
//
// A thread is a 1:1 conversation between a buyer and a seller about one listing.
// Counterpart names + a listing summary are denormalised onto the thread so the
// client can render the inbox/conversation without reading other users' docs
// (which the security rules forbid, to protect private phone numbers).
export interface Thread {
  id: string;
  /** [buyerId, sellerId] — used for the array-contains inbox query + rules. */
  participants: string[];
  buyerId: string;
  sellerId: string;
  buyerName: string;
  sellerName: string;
  listingId: string;
  listingTitle: string;
  listingPhoto: string;
  /** Server-owned: clients can never set this. Flips true once both sides have messaged. */
  callUnlocked: boolean;
  lastMessage: string;
  /** ISO date string. */
  lastMessageAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  /** ISO date string. */
  createdAt: string;
}

// --- Ratings & Reports ---

export type RatingRole = "buyer" | "seller";

export interface Rating {
  id: string;
  raterId: string;
  raterName: string;
  rateeId: string;
  listingId: string | null;
  role: RatingRole;
  /** 1–5. */
  stars: number;
  comment: string;
  /** ISO date string. */
  createdAt: string;
}

export type ReportReason = "scam" | "spam" | "fake" | "wrong_category";
export type ReportTargetType = "listing" | "user";
export type ReportStatus = "open" | "reviewed" | "resolved";

export interface Report {
  id: string;
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  /** Denormalised label (listing title or user name) for the admin queue. */
  targetLabel: string;
  reason: ReportReason;
  note: string;
  status: ReportStatus;
  /** ISO date string. */
  createdAt: string;
}
