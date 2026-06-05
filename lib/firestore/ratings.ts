import "server-only";

// Ratings are written server-side so the ratee's aggregate (count/sum/avg) stays
// correct. One rating per (rater, ratee) pair — re-rating updates it and adjusts
// the aggregate by the delta, inside a Firestore transaction.

import { Timestamp } from "firebase-admin/firestore";
import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { getPublicProfile, ensureUserProfile } from "@/lib/firestore/users";
import { hasUnlockedThreadBetween } from "@/lib/firestore/threads";
import { checkRateLimit, rateLimitMessage } from "@/lib/firestore/ratelimit";
import { validateStars } from "@/lib/validation";
import type { Rating, RatingRole } from "@/lib/types";
import type { SessionUser } from "@/lib/auth/dal";

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string };

export interface RatingInput {
  rateeId: string;
  stars: number;
  comment?: string;
  listingId?: string | null;
  role?: RatingRole;
}

export async function submitRating(
  session: SessionUser,
  input: RatingInput,
): Promise<Result<{ ratingId: string }>> {
  const stars = Math.round(Number(input.stars));
  const starsError = validateStars(stars);
  if (starsError) return { ok: false, status: 400, error: starsError };
  if (!input.rateeId) return { ok: false, status: 400, error: "Missing rateeId" };
  if (input.rateeId === session.uid) {
    return { ok: false, status: 400, error: "You can't rate yourself" };
  }

  // Interaction gate: you may only rate someone you've actually transacted with,
  // i.e. you messaged them and they replied (the thread's call is unlocked).
  const eligible = await hasUnlockedThreadBetween(session.uid, input.rateeId);
  if (!eligible) {
    return {
      ok: false,
      status: 403,
      error: "You can only rate someone after you've messaged them and they've replied.",
    };
  }

  const limit = await checkRateLimit(session.uid, "rating");
  if (!limit.ok) {
    return { ok: false, status: 429, error: rateLimitMessage("rating", limit.retryAfterSec) };
  }

  const comment = (input.comment ?? "").trim().slice(0, 500);

  await ensureUserProfile(session.uid, { phone: session.phone });
  const raterProfile = await getPublicProfile(session.uid);
  const raterName =
    raterProfile?.displayName ??
    (session.phone ? `User ${session.phone.slice(-4)}` : "Buyer");

  const db = adminDb();
  const ratingId = `${session.uid}__${input.rateeId}`;
  const ratingRef = db.collection("ratings").doc(ratingId);
  const userRef = db.collection("users").doc(input.rateeId);

  await db.runTransaction(async (tx) => {
    const [ratingSnap, userSnap] = await Promise.all([tx.get(ratingRef), tx.get(userRef)]);
    const prevStars = ratingSnap.exists ? (ratingSnap.data()?.stars ?? 0) : 0;
    const isNew = !ratingSnap.exists;

    const u = userSnap.data() ?? {};
    const prevCount: number = u.ratingCount ?? 0;
    // Derive the running sum (seeded users only have avg+count).
    const prevSum: number =
      typeof u.ratingSum === "number" ? u.ratingSum : (u.ratingAvg ?? 0) * prevCount;

    const count = prevCount + (isNew ? 1 : 0);
    const sum = prevSum - prevStars + stars;
    const avg = count > 0 ? Math.round((sum / count) * 10) / 10 : 0;

    tx.set(
      ratingRef,
      {
        raterId: session.uid,
        raterName,
        rateeId: input.rateeId,
        listingId: input.listingId ?? null,
        role: input.role ?? "buyer",
        stars,
        comment,
        createdAt: Timestamp.now(),
      },
      { merge: true },
    );
    tx.set(userRef, { ratingCount: count, ratingSum: sum, ratingAvg: avg }, { merge: true });
  });

  return { ok: true, data: { ratingId } };
}

function toIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === "string") return value;
  return new Date().toISOString();
}

/** Recent reviews for a user (newest first, sorted in memory — no index). */
export async function getRatings(rateeId: string): Promise<Rating[]> {
  if (!isAdminConfigured()) return [];
  const snap = await adminDb()
    .collection("ratings")
    .where("rateeId", "==", rateeId)
    .limit(20)
    .get();
  return snap.docs
    .map((d) => {
      const data = d.data();
      return {
        id: d.id,
        raterId: data.raterId ?? "",
        raterName: data.raterName ?? "AfroSmart user",
        rateeId: data.rateeId ?? rateeId,
        listingId: data.listingId ?? null,
        role: (data.role ?? "buyer") as RatingRole,
        stars: data.stars ?? 0,
        comment: data.comment ?? "",
        createdAt: toIso(data.createdAt),
      } satisfies Rating;
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
