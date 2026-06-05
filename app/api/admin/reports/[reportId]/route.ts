import { getCurrentUser } from "@/lib/auth/dal";
import { setReportStatus } from "@/lib/firestore/reports";
import type { ReportStatus } from "@/lib/types";

// POST /api/admin/reports/[reportId] — update a report's status (admin only).
export async function POST(
  request: Request,
  { params }: { params: Promise<{ reportId: string }> },
) {
  const session = await getCurrentUser();
  if (!session) return Response.json({ error: "Not signed in" }, { status: 401 });
  if (!session.admin) return Response.json({ error: "Forbidden" }, { status: 403 });

  const { reportId } = await params;
  let status: unknown;
  try {
    ({ status } = await request.json());
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const result = await setReportStatus(reportId, status as ReportStatus);
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }
  return Response.json({ ok: true });
}
