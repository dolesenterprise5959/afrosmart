import { NextResponse } from "next/server";
import { respond } from "@/lib/assistant/respond";
import { logConversation } from "@/lib/firestore/assistant";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
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
