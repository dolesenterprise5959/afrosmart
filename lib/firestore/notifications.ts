import "server-only";

// Minimal in-app notifications, stored per user at users/{uid}/notifications.
// Written only by server code (Admin SDK); read by the owner (see firestore.rules).

import { Timestamp } from "firebase-admin/firestore";
import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export async function addNotification(
  uid: string,
  n: { type: string; title: string; body: string; data?: Record<string, unknown> },
): Promise<void> {
  if (!isAdminConfigured()) return;
  try {
    await adminDb().collection("users").doc(uid).collection("notifications").add({
      type: n.type,
      title: n.title,
      body: n.body,
      data: n.data ?? {},
      read: false,
      createdAt: Timestamp.now(),
    });
  } catch {
    /* notifications are best-effort and must never break the caller */
  }
}

/** Notify a referrer that one of their referrals became valid (and maybe paid out). */
export async function notifyReferralValid(
  referrerUid: string,
  info: { newCount: number; rewardAdded: number },
): Promise<void> {
  const paid = info.rewardAdded > 0;
  await addNotification(referrerUid, {
    type: "referral",
    title: paid ? `🎉 You earned US$ ${info.rewardAdded}!` : "🎉 New valid referral!",
    body: paid
      ? `That's ${info.newCount} valid referrals — US$ ${info.rewardAdded} was added to your wallet.`
      : `A friend you referred just posted their first listing. You now have ${info.newCount} valid referral${info.newCount === 1 ? "" : "s"}.`,
    data: { newCount: info.newCount, rewardAdded: info.rewardAdded },
  });
}

const toIso = (v: unknown): string =>
  v instanceof Timestamp ? v.toDate().toISOString() : typeof v === "string" ? v : new Date().toISOString();

export async function getRecentNotifications(uid: string, max = 10): Promise<AppNotification[]> {
  if (!isAdminConfigured()) return [];
  try {
    const snap = await adminDb()
      .collection("users").doc(uid).collection("notifications")
      .orderBy("createdAt", "desc").limit(max).get();
    return snap.docs.map((d) => {
      const x = d.data();
      return { id: d.id, type: x.type ?? "", title: x.title ?? "", body: x.body ?? "", read: Boolean(x.read), createdAt: toIso(x.createdAt) };
    });
  } catch {
    return [];
  }
}
