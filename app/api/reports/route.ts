import { getCurrentUser } from "@/lib/auth/dal";
import { createReport } from "@/lib/firestore/reports";
import type { ReportReason, ReportTargetType } from "@/lib/types";

// POST /api/reports — flag a listing or user for admin review.
export async function POST(request: Request) {
  const session = await getCurrentUser();
  if (!session) return Response.json({ error: "Not signed in" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const result = await createReport(session, {
    targetType: body.targetType as ReportTargetType,
    targetId: String(body.targetId ?? ""),
    reason: body.reason as ReportReason,
    note: typeof body.note === "string" ? body.note : "",
  });
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }
  return Response.json(result.data);
}
