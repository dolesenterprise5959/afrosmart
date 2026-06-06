import "server-only";

// Lightweight analytics: counters denormalised onto listing/user docs via
// FieldValue.increment (no separate events collection). Reads are aggregated
// per-seller for the Business dashboard.

import { FieldValue } from "firebase-admin/firestore";
import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import type { SellerPlan, VerifiedType } from "@/lib/types";

export interface BusinessAnalytics {
  totalViews: number;
  totalClicks: number; // "Message seller" / contact intents
  messagesReceived: number; // threads where the user is the seller
  activeListings: number;
  savedCount: number; // times this seller's listings were saved
  profileViews: number;
  verified: boolean;
  verifiedType: VerifiedType | null;
  plan: SellerPlan;
  perListing: { id: string; title: string; views: number }[];
}

const EMPTY: BusinessAnalytics = {
  totalViews: 0, totalClicks: 0, messagesReceived: 0, activeListings: 0,
  savedCount: 0, profileViews: 0, verified: false, verifiedType: null,
  plan: "free", perListing: [],
};

export async function getBusinessAnalytics(uid: string): Promise<BusinessAnalytics> {
  if (!isAdminConfigured()) return EMPTY;
  const db = adminDb();
  const [listingsSnap, userSnap, threadsCount] = await Promise.all([
    db.collection("listings").where("sellerId", "==", uid).limit(300).get(),
    db.collection("users").doc(uid).get(),
    db.collection("threads").where("sellerId", "==", uid).count().get(),
  ]);

  let totalViews = 0, totalClicks = 0, savedCount = 0, activeListings = 0;
  const perListing: { id: string; title: string; views: number }[] = [];
  listingsSnap.docs.forEach((d) => {
    const x = d.data();
    const views = Number(x.views) || 0;
    totalViews += views;
    totalClicks += Number(x.contactClicks) || 0;
    savedCount += Number(x.saves) || 0;
    if ((x.status ?? "active") === "active") activeListings += 1;
    perListing.push({ id: d.id, title: x.title ?? "Listing", views });
  });
  perListing.sort((a, b) => b.views - a.views);

  const u = userSnap.data() ?? {};
  return {
    totalViews, totalClicks,
    messagesReceived: threadsCount.data().count,
    activeListings, savedCount,
    profileViews: Number(u.profileViews) || 0,
    verified: u.verified === true,
    verifiedType: (u.verifiedType as VerifiedType) ?? null,
    plan: (u.plan as SellerPlan) ?? "free",
    perListing: perListing.slice(0, 8),
  };
}

// --- Counter writers (fire-and-forget; errors swallowed) ---

export async function incrementListingView(id: string): Promise<void> {
  if (!isAdminConfigured()) return;
  await adminDb().collection("listings").doc(id).update({ views: FieldValue.increment(1) }).catch(() => {});
}

export async function incrementProfileView(uid: string): Promise<void> {
  if (!isAdminConfigured()) return;
  await adminDb().collection("users").doc(uid).update({ profileViews: FieldValue.increment(1) }).catch(() => {});
}

export async function trackSave(id: string, delta: 1 | -1): Promise<void> {
  if (!isAdminConfigured()) return;
  await adminDb().collection("listings").doc(id).update({ saves: FieldValue.increment(delta) }).catch(() => {});
}
