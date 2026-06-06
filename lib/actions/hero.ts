"use server";

import { FieldValue } from "firebase-admin/firestore";
import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";

// Lightweight hero-banner analytics → metrics/hero doc:
//   { <slide>: { impressions, clicks, ctaClicks } }
export async function trackHeroEvent(
  slide: string,
  type: "impression" | "click" | "cta",
): Promise<void> {
  if (!isAdminConfigured()) return;
  const field = type === "impression" ? "impressions" : type === "cta" ? "ctaClicks" : "clicks";
  const safe = slide.replace(/[^a-z0-9-]/gi, "").slice(0, 40);
  if (!safe) return;
  try {
    await adminDb()
      .collection("metrics")
      .doc("hero")
      .set({ [safe]: { [field]: FieldValue.increment(1) } }, { merge: true });
  } catch {
    // analytics must never break the UI
  }
}
