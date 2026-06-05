import { getCurrentUser } from "@/lib/auth/dal";
import { approveVerification, rejectVerification } from "@/lib/firestore/verification";
import type { VerifiedType } from "@/lib/types";

// POST /api/admin/verify — approve or reject a user's verification (admin only).
export async function POST(request: Request) {
  const session = await getCurrentUser();
  if (!session) return Response.json({ error: "Not signed in" }, { status: 401 });
  if (!session.admin) return Response.json({ error: "Forbidden" }, { status: 403 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const action = String(body.action ?? "");
  const uid = String(body.uid ?? "");
  if (!uid) return Response.json({ error: "Missing uid" }, { status: 400 });

  if (action === "approve") {
    const type: VerifiedType = body.type === "business" ? "business" : "seller";
    await approveVerification(uid, type);
  } else if (action === "reject") {
    await rejectVerification(uid);
  } else {
    return Response.json({ error: "Unknown action" }, { status: 400 });
  }

  return Response.json({ ok: true });
}
