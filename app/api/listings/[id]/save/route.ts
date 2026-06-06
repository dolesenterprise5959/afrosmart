import { getCurrentUser } from "@/lib/auth/dal";
import { trackSave } from "@/lib/firestore/analytics";

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
  let saved = false;
  try {
    ({ saved } = await request.json());
  } catch {
    /* default false */
  }
  await trackSave(id, saved ? 1 : -1);
  return Response.json({ ok: true });
}
