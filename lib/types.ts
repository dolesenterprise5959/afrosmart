// Shared domain types for AfroSmart. These mirror the Firestore schema planned
// in the architecture doc, so Phase 1 mock data slots straight into the real
// data layer later without changing component props.

export type CategoryId =
  | "cars"
  | "phones"
  | "electronics"
  | "property"
  | "services"
  | "jobs"
  | "general";

export interface Category {
  id: CategoryId;
  label: string;
  /** Emoji used as a lightweight, offline-friendly icon for Phase 1. */
  icon: string;
}

export interface County {
  id: string;
  name: string;
  cities: string[];
}

export interface User {
  id: string;
  displayName: string;
  /** Stored only on the seller; never exposed publicly (call-unlock protects it). */
  phone: string;
  photoURL?: string;
  county: string;
  city: string;
  isBusiness: boolean;
  ratingAvg: number;
  ratingCount: number;
  /** ISO date string. */
  joinedAt: string;
}

export type ListingStatus = "active" | "sold" | "removed";

export interface Listing {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  /** Price in Liberian Dollars (LRD). */
  price: number;
  category: CategoryId;
  county: string;
  city: string;
  /** Placeholder colour pairs stand in for photos in Phase 1. */
  photos: string[];
  status: ListingStatus;
  featured: boolean;
  /** ISO date string. */
  createdAt: string;
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
