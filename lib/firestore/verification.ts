import "server-only";

// Verification workflow — all writes go through the Admin SDK (server-only), so
// users can never self-grant a verified status. A user requests verification;
// an admin approves (sets `verified` + `verifiedType`) or rejects.

import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import type { VerifiedType, VerificationStatus } from "@/lib/types";

const COLLECTION = "users";

export interface MyVerification {
  status: VerificationStatus;
  verified: boolean;
  verifiedType: VerifiedType | null;
  requestedType: VerifiedType | null;
}

export interface PendingVerification {
  uid: string;
  displayName: string;
  requestedType: VerifiedType;
  note: string;
  requestedAt: string;
}

export async function getMyVerification(uid: string): Promise<MyVerification> {
  const fallback: MyVerification = { status: "none", verified: false, verifiedType: null, requestedType: null };
  if (!isAdminConfigured()) return fallback;
  const doc = await adminDb().collection(COLLECTION).doc(uid).get();
  if (!doc.exists) return fallback;
  const d = doc.data() ?? {};
  return {
    status: (d.verificationStatus as VerificationStatus) ?? (d.verified ? "verified" : "none"),
    verified: d.verified === true,
    verifiedType: (d.verifiedType as VerifiedType) ?? null,
    requestedType: (d.verificationRequestedType as VerifiedType) ?? null,
  };
}

/** Mark a verification request as pending. Idempotent. */
export async function requestVerification(
  uid: string,
  requestedType: VerifiedType,
  note: string,
): Promise<void> {
  await adminDb().collection(COLLECTION).doc(uid).set(
    {
      verificationStatus: "pending",
      verificationRequestedType: requestedType,
      verificationNote: note,
      verificationRequestedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}

export async function listPendingVerifications(): Promise<PendingVerification[]> {
  if (!isAdminConfigured()) return [];
  const snap = await adminDb()
    .collection(COLLECTION)
    .where("verificationStatus", "==", "pending")
    .limit(50)
    .get();
  return snap.docs.map((doc) => {
    const d = doc.data() ?? {};
    return {
      uid: doc.id,
      displayName: d.displayName ?? "AfroSmart user",
      requestedType: (d.verificationRequestedType as VerifiedType) ?? "seller",
      note: d.verificationNote ?? "",
      requestedAt: d.verificationRequestedAt ?? "",
    };
  });
}

export async function approveVerification(uid: string, type: VerifiedType): Promise<void> {
  await adminDb().collection(COLLECTION).doc(uid).set(
    {
      verified: true,
      verifiedType: type,
      verificationStatus: "verified",
      // Keep the business flag in sync so existing business filters still work.
      ...(type === "business" ? { isBusiness: true } : {}),
    },
    { merge: true },
  );
}

export async function rejectVerification(uid: string): Promise<void> {
  await adminDb().collection(COLLECTION).doc(uid).set(
    { verified: false, verifiedType: null, verificationStatus: "rejected" },
    { merge: true },
  );
}
