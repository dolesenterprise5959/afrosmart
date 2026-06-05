import "server-only";

// Reports are server-mediated: users create them via a route handler, admins
// read/resolve them via the Admin SDK. The listing title / user name is
// denormalised onto the report so the admin queue needs no extra lookups.

import { Timestamp } from "firebase-admin/firestore";
import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { getListing } from "@/lib/firestore/listings";
import { getPublicProfile } from "@/lib/firestore/users";
import { checkRateLimit, rateLimitMessage } from "@/lib/firestore/ratelimit";
import { validateReportFields } from "@/lib/validation";
import type {
  Report,
  ReportReason,
  ReportStatus,
  ReportTargetType,
} from "@/lib/types";
import type { SessionUser } from "@/lib/auth/dal";

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string };

const STATUSES: ReportStatus[] = ["open", "reviewed", "resolved"];

export interface ReportInput {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  note?: string;
}

export async function createReport(
  session: SessionUser,
  input: ReportInput,
): Promise<Result<{ reportId: string }>> {
  const fieldsError = validateReportFields(input.targetType, input.reason);
  if (fieldsError) return { ok: false, status: 400, error: fieldsError };
  if (!input.targetId) return { ok: false, status: 400, error: "Missing target" };
  if (input.targetType === "user" && input.targetId === session.uid) {
    return { ok: false, status: 400, error: "You can't report yourself" };
  }

  const limit = await checkRateLimit(session.uid, "report");
  if (!limit.ok) {
    return { ok: false, status: 429, error: rateLimitMessage("report", limit.retryAfterSec) };
  }

  // Resolve a human-readable label for the admin queue.
  let targetLabel = input.targetId;
  if (input.targetType === "listing") {
    targetLabel = (await getListing(input.targetId))?.title ?? input.targetId;
  } else {
    targetLabel = (await getPublicProfile(input.targetId))?.displayName ?? input.targetId;
  }

  const ref = await adminDb().collection("reports").add({
    reporterId: session.uid,
    targetType: input.targetType,
    targetId: input.targetId,
    targetLabel,
    reason: input.reason,
    note: (input.note ?? "").trim().slice(0, 500),
    status: "open" as ReportStatus,
    createdAt: Timestamp.now(),
  });
  return { ok: true, data: { reportId: ref.id } };
}

function toIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === "string") return value;
  return new Date().toISOString();
}

/** Admin: recent reports, newest first. */
export async function listReports(): Promise<Report[]> {
  if (!isAdminConfigured()) return [];
  const snap = await adminDb()
    .collection("reports")
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      reporterId: data.reporterId ?? "",
      targetType: data.targetType,
      targetId: data.targetId,
      targetLabel: data.targetLabel ?? data.targetId,
      reason: data.reason,
      note: data.note ?? "",
      status: data.status ?? "open",
      createdAt: toIso(data.createdAt),
    } satisfies Report;
  });
}

export async function setReportStatus(
  reportId: string,
  status: ReportStatus,
): Promise<Result<null>> {
  if (!STATUSES.includes(status)) {
    return { ok: false, status: 400, error: "Invalid status" };
  }
  await adminDb().collection("reports").doc(reportId).update({ status });
  return { ok: true, data: null };
}
