import { getCurrentUser } from "@/lib/auth/dal";
import { removeListing, restoreListing, setUserSuspended } from "@/lib/firestore/admin";

type ModerateAction = "removeListing" | "restoreListing" | "suspendUser" | "unsuspendUser";

// POST /api/admin/moderate — act on a listing or user (admin only).
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

  const action = body.action as ModerateAction;
  const targetId = String(body.targetId ?? "");
  if (!targetId) return Response.json({ error: "Missing targetId" }, { status: 400 });

  switch (action) {
    case "removeListing":
      await removeListing(targetId);
      break;
    case "restoreListing":
      await restoreListing(targetId);
      break;
    case "suspendUser":
      await setUserSuspended(targetId, true);
      break;
    case "unsuspendUser":
      await setUserSuspended(targetId, false);
      break;
    default:
      return Response.json({ error: "Unknown action" }, { status: 400 });
  }

  return Response.json({ ok: true });
}
