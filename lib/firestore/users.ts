import "server-only";

// Server-side user data access. Public reads return a DTO that OMITS the phone
// number — phone is only ever revealed through the call-unlock server flow.
// Falls back to sample data when Firebase isn't configured.

import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { USERS as SAMPLE_USERS, getUser as sampleGetUser } from "@/lib/mock";
import type { User } from "@/lib/types";

const COLLECTION = "users";

/** Public-safe profile: everything on User except the private phone number. */
export type PublicProfile = Omit<User, "phone">;

function stripPhone(user: User): PublicProfile {
  // Explicitly pick public fields so the private phone can never leak.
  const { id, displayName, photoURL, county, city, isBusiness, ratingAvg, ratingCount, joinedAt, verified, verifiedType } = user;
  return { id, displayName, photoURL, county, city, isBusiness, ratingAvg, ratingCount, joinedAt, verified, verifiedType };
}

function docToProfile(
  doc: FirebaseFirestore.DocumentSnapshot,
): PublicProfile | null {
  if (!doc.exists) return null;
  const d = doc.data() ?? {};
  return {
    id: doc.id,
    displayName: d.displayName ?? "AfroSmart user",
    photoURL: d.photoURL,
    county: d.county ?? "",
    city: d.city ?? "",
    isBusiness: Boolean(d.isBusiness),
    ratingAvg: typeof d.ratingAvg === "number" ? d.ratingAvg : 0,
    ratingCount: typeof d.ratingCount === "number" ? d.ratingCount : 0,
    joinedAt: typeof d.joinedAt === "string" ? d.joinedAt : "",
    verified: d.verified === true,
    verifiedType: (d.verifiedType as PublicProfile["verifiedType"]) ?? null,
  };
}

export async function getPublicProfile(id: string): Promise<PublicProfile | null> {
  if (!isAdminConfigured()) {
    const u = sampleGetUser(id);
    return u ? stripPhone(u) : null;
  }
  const doc = await adminDb().collection(COLLECTION).doc(id).get();
  return docToProfile(doc);
}

/** Whether an account has been suspended by an admin. */
export async function isSuspended(uid: string): Promise<boolean> {
  if (!isAdminConfigured()) return false;
  const doc = await adminDb().collection(COLLECTION).doc(uid).get();
  return doc.exists && doc.data()?.suspended === true;
}

export async function getBusinesses(): Promise<PublicProfile[]> {
  if (!isAdminConfigured()) {
    return SAMPLE_USERS.filter((u) => u.isBusiness).map(stripPhone);
  }
  const snap = await adminDb()
    .collection(COLLECTION)
    .where("isBusiness", "==", true)
    .limit(50)
    .get();
  return snap.docs
    .map(docToProfile)
    .filter((p): p is PublicProfile => p !== null);
}

// Ensure a minimal user document exists (called when a user first posts). Uses
// merge so it never clobbers an existing profile. Stores phone privately.
export async function ensureUserProfile(
  uid: string,
  details: { phone?: string | null; county?: string; city?: string },
): Promise<void> {
  if (!isAdminConfigured()) return;
  const ref = adminDb().collection(COLLECTION).doc(uid);
  const existing = await ref.get();
  if (existing.exists) return;

  await ref.set(
    {
      displayName: details.phone ? `User ${details.phone.slice(-4)}` : "AfroSmart user",
      phone: details.phone ?? null,
      county: details.county ?? "",
      city: details.city ?? "",
      isBusiness: false,
      ratingAvg: 0,
      ratingCount: 0,
      joinedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}
