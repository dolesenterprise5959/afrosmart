import { getCurrentUser } from "@/lib/auth/dal";
import { createOrGetThread } from "@/lib/firestore/threads";

// POST /api/threads — start (or resume) a conversation about a listing.
export async function POST(request: Request) {
  const session = await getCurrentUser();
  if (!session) return Response.json({ error: "Not signed in" }, { status: 401 });

  let listingId: unknown;
  try {
    ({ listingId } = await request.json());
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (typeof listingId !== "string" || !listingId) {
    return Response.json({ error: "Missing listingId" }, { status: 400 });
  }

  const result = await createOrGetThread(session, listingId);
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }
  return Response.json(result.data);
}
