import { NextResponse } from "next/server";
import { respond } from "@/lib/assistant/respond";
import { logConversation } from "@/lib/firestore/assistant";
import { checkRateLimit } from "@/lib/firestore/ratelimit";
import { clientIp } from "@/lib/utils/request-ip";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // Public, unauthenticated endpoint — rate-limit per IP so it can't be used to
  // burn Firestore reads/writes (every call reads the KB and logs a conversation).
  const limit = await checkRateLimit(`assistant_${clientIp(request)}`, "assistant");
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many messages. Please slow down." }, { status: 429 });
  }

  const { message, sessionId } = await request.json().catch(() => ({}));
  const text = String(message ?? "").slice(0, 500);
  if (!text.trim()) return NextResponse.json({ error: "Empty message." }, { status: 400 });

  const result = await respond(text);
  void logConversation(String(sessionId ?? "anon"), text, result.reply, result.matched);

  return NextResponse.json({
    reply: result.reply,
    quickReplies: result.quickReplies,
    listings: result.listings ?? [],
  });
}
