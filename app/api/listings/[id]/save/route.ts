import { getCurrentUser } from "@/lib/auth/dal";
import { trackSave } from "@/lib/firestore/analytics";
import { getListing } from "@/lib/firestore/listings";

// POST /api/listings/[id]/save — adjust the listing's saved-count for analytics.
// The actual save lives in the user's own saved/ subcollection (client write);
// this just maintains the aggregate counter for the seller's dashboard.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getCurrentUser();
  if (!session) return Response.json({ error: "Not signed in" }, { status: 401 });

  const { id } = await params;

  // Require an explicit boolean — a malformed/empty body must NOT be treated as
  // "unsave" (that let anyone drive a listing's save count arbitrarily negative).
  const body = await request.json().catch(() => null);
  if (!body || typeof body.saved !== "boolean") {
    return Response.json({ error: "Body must be { saved: boolean }" }, { status: 400 });
  }

  // Only adjust counters for a real listing — stops phantom-doc creation and
  // counter tampering on listing IDs that don't exist.
  const listing = await getListing(id);
  if (!listing) return Response.json({ error: "Listing not found" }, { status: 404 });

  await trackSave(id, body.saved ? 1 : -1);
  return Response.json({ ok: true });
}
