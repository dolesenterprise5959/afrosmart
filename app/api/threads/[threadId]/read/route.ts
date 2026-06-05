import { getCurrentUser } from "@/lib/auth/dal";
import { markThreadRead } from "@/lib/firestore/threads";

// POST /api/threads/[threadId]/read — mark the thread read by the current user.
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ threadId: string }> },
) {
  const session = await getCurrentUser();
  if (!session) return Response.json({ error: "Not signed in" }, { status: 401 });

  const { threadId } = await params;
  const result = await markThreadRead(session, threadId);
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }
  return Response.json(result.data);
}
