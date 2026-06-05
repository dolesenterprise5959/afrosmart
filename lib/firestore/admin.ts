import "server-only";

// Admin moderation actions and dashboard statistics. All callers are gated by
// verifyAdmin() in the route handler / page before reaching here.

import { revalidateTag } from "next/cache";
import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { LISTINGS_TAG } from "@/lib/firestore/listings";

export interface AdminStats {
  listings: number;
  users: number;
  openReports: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  if (!isAdminConfigured()) return { listings: 0, users: 0, openReports: 0 };
  const db = adminDb();
  const [listings, users, openReports] = await Promise.all([
    db.collection("listings").count().get(),
    db.collection("users").count().get(),
    db.collection("reports").where("status", "==", "open").count().get(),
  ]);
  return {
    listings: listings.data().count,
    users: users.data().count,
    openReports: openReports.data().count,
  };
}

export async function removeListing(listingId: string): Promise<void> {
  await adminDb().collection("listings").doc(listingId).update({ status: "removed" });
  revalidateTag(LISTINGS_TAG, "max");
}

export async function restoreListing(listingId: string): Promise<void> {
  await adminDb().collection("listings").doc(listingId).update({ status: "active" });
  revalidateTag(LISTINGS_TAG, "max");
}

export async function setUserSuspended(uid: string, suspended: boolean): Promise<void> {
  await adminDb().collection("users").doc(uid).set({ suspended }, { merge: true });
}
