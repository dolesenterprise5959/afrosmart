import "server-only";

// Trusted server-side messaging logic. All thread/message writes happen here
// (Admin SDK), so the client can never forge a sender id, flip callUnlocked, or
// read a phone number it shouldn't. Used by the /api/threads route handlers.

import { Timestamp } from "firebase-admin/firestore";
import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { getListing } from "@/lib/firestore/listings";
import { getPublicProfile, ensureUserProfile, isSuspended } from "@/lib/firestore/users";
import { isCallUnlocked } from "@/lib/messaging/unlock";
import { checkRateLimit, rateLimitMessage } from "@/lib/firestore/ratelimit";
import type { SessionUser } from "@/lib/auth/dal";

const MAX_MESSAGE_LENGTH = 1000;

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string };

/** Deterministic id makes thread creation idempotent without a query/index. */
function threadIdFor(listingId: string, buyerId: string): string {
  return `${listingId}__${buyerId}`;
}

/** Create (or return the existing) thread for a buyer messaging a listing. */
export async function createOrGetThread(
  session: SessionUser,
  listingId: string,
): Promise<Result<{ threadId: string }>> {
  if (await isSuspended(session.uid)) {
    return { ok: false, status: 403, error: "Your account is suspended" };
  }

  const listing = await getListing(listingId);
  if (!listing) return { ok: false, status: 404, error: "Listing not found" };
  if (listing.sellerId === session.uid) {
    return { ok: false, status: 400, error: "You can't message your own listing" };
  }

  const buyerId = session.uid;
  const sellerId = listing.sellerId;
  const threadId = threadIdFor(listingId, buyerId);
  const ref = adminDb().collection("threads").doc(threadId);

  const snap = await ref.get();
  if (!snap.exists) {
    // Only starting a NEW conversation counts against the rate limit.
    const limit = await checkRateLimit(session.uid, "thread");
    if (!limit.ok) {
      return { ok: false, status: 429, error: rateLimitMessage("thread", limit.retryAfterSec) };
    }
    await ensureUserProfile(buyerId, { phone: session.phone });
    const [buyer, seller] = await Promise.all([
      getPublicProfile(buyerId),
      getPublicProfile(sellerId),
    ]);
    const now = Timestamp.now();
    await ref.set({
      participants: [buyerId, sellerId],
      buyerId,
      sellerId,
      buyerName:
        buyer?.displayName ??
        (session.phone ? `User ${session.phone.slice(-4)}` : "Buyer"),
      sellerName: seller?.displayName ?? "Seller",
      listingId,
      listingTitle: listing.title,
      listingPhoto: listing.photos[0] ?? "",
      callUnlocked: false,
      lastMessage: "",
      lastMessageAt: now,
      createdAt: now,
    });
  }

  return { ok: true, data: { threadId } };
}

/** Append a message and re-evaluate the call-unlock condition. */
export async function postMessage(
  session: SessionUser,
  threadId: string,
  rawText: string,
): Promise<Result<{ callUnlocked: boolean }>> {
  const text = rawText.trim();
  if (!text) return { ok: false, status: 400, error: "Message is empty" };
  if (text.length > MAX_MESSAGE_LENGTH) {
    return { ok: false, status: 400, error: "Message is too long" };
  }

  const ref = adminDb().collection("threads").doc(threadId);
  const snap = await ref.get();
  if (!snap.exists) return { ok: false, status: 404, error: "Thread not found" };

  const data = snap.data()!;
  const participants: string[] = data.participants ?? [];
  if (!participants.includes(session.uid)) {
    return { ok: false, status: 403, error: "Not a participant" };
  }

  const limit = await checkRateLimit(session.uid, "message");
  if (!limit.ok) {
    return { ok: false, status: 429, error: rateLimitMessage("message", limit.retryAfterSec) };
  }

  const messages = ref.collection("messages");
  await messages.add({
    senderId: session.uid,
    text,
    createdAt: Timestamp.now(),
  });

  // Unlock once BOTH participants have sent at least one message.
  let callUnlocked = data.callUnlocked === true;
  if (!callUnlocked) {
    const otherId = participants.find((p) => p !== session.uid);
    const senders = new Set<string>([session.uid]);
    if (otherId) {
      const otherMsgs = await messages.where("senderId", "==", otherId).limit(1).get();
      if (!otherMsgs.empty) senders.add(otherId);
    }
    callUnlocked = isCallUnlocked(participants, senders);
  }

  await ref.update({
    lastMessage: text.slice(0, 140),
    lastMessageAt: Timestamp.now(),
    ...(callUnlocked && data.callUnlocked !== true ? { callUnlocked: true } : {}),
  });

  return { ok: true, data: { callUnlocked } };
}

/** Reveal the counterpart's phone — only after the call has been unlocked. */
export async function getUnlockedPhone(
  session: SessionUser,
  threadId: string,
): Promise<Result<{ phone: string; name: string }>> {
  const ref = adminDb().collection("threads").doc(threadId);
  const snap = await ref.get();
  if (!snap.exists) return { ok: false, status: 404, error: "Thread not found" };

  const data = snap.data()!;
  const participants: string[] = data.participants ?? [];
  if (!participants.includes(session.uid)) {
    return { ok: false, status: 403, error: "Not a participant" };
  }
  if (data.callUnlocked !== true) {
    return { ok: false, status: 403, error: "Call is not unlocked yet" };
  }

  const otherId = participants.find((p) => p !== session.uid);
  if (!otherId) return { ok: false, status: 404, error: "No counterpart" };

  const userDoc = await adminDb().collection("users").doc(otherId).get();
  const phone = userDoc.exists ? (userDoc.data()?.phone as string | undefined) : undefined;
  if (!phone) return { ok: false, status: 404, error: "Phone not available" };

  const name = otherId === data.sellerId ? data.sellerName : data.buyerName;
  return { ok: true, data: { phone, name: name ?? "Seller" } };
}

/**
 * Whether `raterId` is allowed to rate `rateeId`: true only if they share a
 * thread whose call is unlocked — i.e. one messaged the other AND got a reply.
 * This is the rating interaction gate.
 */
export async function hasUnlockedThreadBetween(
  raterId: string,
  rateeId: string,
): Promise<boolean> {
  if (!isAdminConfigured()) return false;
  // Single array-contains filter (no composite index); filter the rest in memory.
  const snap = await adminDb()
    .collection("threads")
    .where("participants", "array-contains", raterId)
    .limit(50)
    .get();
  return snap.docs.some((d) => {
    const data = d.data();
    const participants: string[] = data.participants ?? [];
    return participants.includes(rateeId) && data.callUnlocked === true;
  });
}
