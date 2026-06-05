"use client";

// Thin client wrappers around the messaging route handlers. All writes go
// through the server; the client only reads threads/messages via Firestore
// realtime listeners (see the inbox/conversation components).

export async function createThread(
  listingId: string,
): Promise<{ threadId?: string; error?: string; status?: number }> {
  const res = await fetch("/api/threads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ listingId }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error ?? "Failed to start chat", status: res.status };
  return { threadId: data.threadId };
}

export async function sendMessage(
  threadId: string,
  text: string,
): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(`/api/threads/${threadId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: data.error ?? "Failed to send" };
  return { ok: true };
}

export async function fetchUnlockedPhone(
  threadId: string,
): Promise<{ phone?: string; name?: string; error?: string }> {
  const res = await fetch(`/api/threads/${threadId}/phone`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error ?? "Phone not available" };
  return { phone: data.phone, name: data.name };
}
