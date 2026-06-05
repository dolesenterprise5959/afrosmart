import { getCurrentUser } from "@/lib/auth/dal";
import { postMessage } from "@/lib/firestore/threads";

// POST /api/threads/[threadId]/messages — send a text message. The server
// re-evaluates the call-unlock condition as part of this write.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ threadId: string }> },
) {
  const session = await getCurrentUser();
  if (!session) return Response.json({ error: "Not signed in" }, { status: 401 });

  const { threadId } = await params;

  let text: unknown;
  try {
    ({ text } = await request.json());
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (typeof text !== "string") {
    return Response.json({ error: "Missing text" }, { status: 400 });
  }

  const result = await postMessage(session, threadId, text);
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }
  return Response.json(result.data);
}
