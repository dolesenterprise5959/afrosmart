import "server-only";

// Seller plan data access. Plan is server-controlled (admin-assigned) — the
// firestore.rules block clients from self-setting `plan`.

import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import type { SellerPlan } from "@/lib/types";

const COLLECTION = "users";

export async function getPlan(uid: string): Promise<SellerPlan> {
  if (!isAdminConfigured()) return "free";
  const doc = await adminDb().collection(COLLECTION).doc(uid).get();
  const plan = doc.exists ? (doc.data()?.plan as SellerPlan | undefined) : undefined;
  return plan ?? "free";
}

/** Set a user's plan (admin only). Business plan implies the business flag. */
export async function setPlan(uid: string, plan: SellerPlan): Promise<void> {
  await adminDb().collection(COLLECTION).doc(uid).set(
    {
      plan,
      ...(plan === "business" ? { isBusiness: true } : {}),
    },
    { merge: true },
  );
}
