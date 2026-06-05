import { getCurrentUser } from "@/lib/auth/dal";
import { submitRating } from "@/lib/firestore/ratings";

// POST /api/ratings — rate another user (1–5 stars + optional comment).
export async function POST(request: Request) {
  const session = await getCurrentUser();
  if (!session) return Response.json({ error: "Not signed in" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const result = await submitRating(session, {
    rateeId: String(body.rateeId ?? ""),
    stars: Number(body.stars),
    comment: typeof body.comment === "string" ? body.comment : "",
    listingId: typeof body.listingId === "string" ? body.listingId : null,
    role: body.role === "seller" ? "seller" : "buyer",
  });
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }
  return Response.json(result.data);
}
