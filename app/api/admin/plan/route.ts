import { getCurrentUser } from "@/lib/auth/dal";
import { setPlan } from "@/lib/firestore/premium";
import type { SellerPlan } from "@/lib/types";

const PLANS: SellerPlan[] = ["free", "premium", "business"];

// POST /api/admin/plan — set a user's seller plan (admin only).
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

  const uid = String(body.uid ?? "");
  const plan = body.plan as SellerPlan;
  if (!uid) return Response.json({ error: "Missing uid" }, { status: 400 });
  if (!PLANS.includes(plan)) return Response.json({ error: "Invalid plan" }, { status: 400 });

  await setPlan(uid, plan);
  return Response.json({ ok: true });
}
