import { getCurrentUser } from "@/lib/auth/dal";
import { getUnlockedPhone } from "@/lib/firestore/threads";

// GET /api/threads/[threadId]/phone — reveal the counterpart's phone number,
// but only once the call has been unlocked. This is the ONLY path that exposes
// a phone number; it never appears in any client-readable document.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ threadId: string }> },
) {
  const session = await getCurrentUser();
  if (!session) return Response.json({ error: "Not signed in" }, { status: 401 });

  const { threadId } = await params;
  const result = await getUnlockedPhone(session, threadId);
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }
  return Response.json(result.data);
}
