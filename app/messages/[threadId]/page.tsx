"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  type Timestamp,
} from "firebase/firestore";
import { useAuth } from "@/components/auth/AuthProvider";
import { getDb } from "@/lib/firebase/client";
import { sendMessage, fetchUnlockedPhone } from "@/lib/messaging/client";
import { toLocalPhone } from "@/lib/utils/phone";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";

import { Phone, Lock, Unlock } from "lucide-react";
interface ThreadDoc {
  buyerId: string;
  sellerId: string;
  buyerName: string;
  sellerName: string;
  listingId: string;
  listingTitle: string;
  callUnlocked: boolean;
}

interface MessageDoc {
  id: string;
  senderId: string;
  text: string;
  createdAt?: Timestamp;
}

function clockTime(ts?: Timestamp): string {
  if (!ts) return "";
  return ts.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ThreadPage() {
  const params = useParams<{ threadId: string }>();
  const threadId = params.threadId;
  const { user, loading } = useAuth();

  const [thread, setThread] = useState<ThreadDoc | null>(null);
  const [messages, setMessages] = useState<MessageDoc[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [phone, setPhone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Live thread doc (carries callUnlocked + counterpart names).
  useEffect(() => {
    if (!user || !threadId) return;
    return onSnapshot(doc(getDb(), "threads", threadId), (d) => {
      setThread(d.exists() ? (d.data() as ThreadDoc) : null);
    });
  }, [user, threadId]);

  // Live messages.
  useEffect(() => {
    if (!user || !threadId) return;
    const q = query(
      collection(getDb(), "threads", threadId, "messages"),
      orderBy("createdAt", "asc"),
    );
    return onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as MessageDoc[]);
    });
  }, [user, threadId]);

  // Mark the thread read on open and whenever a new message arrives while viewing.
  useEffect(() => {
    if (!user || !threadId) return;
    fetch(`/api/threads/${threadId}/read`, { method: "POST" }).catch(() => {});
  }, [user, threadId, messages.length]);

  // Reveal the phone once the call is unlocked.
  useEffect(() => {
    if (thread?.callUnlocked && !phone) {
      fetchUnlockedPhone(threadId).then((r) => {
        if (r.phone) setPhone(r.phone);
      });
    }
  }, [thread?.callUnlocked, threadId, phone]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    setSending(true);
    setError(null);
    const result = await sendMessage(threadId, t);
    if (result.ok) setText("");
    else setError(result.error ?? "Could not send");
    setSending(false);
  }

  if (loading) {
    return <div className="mx-auto max-w-2xl px-4 py-10 text-sm text-muted">Loading…</div>;
  }
  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 text-sm text-muted">
        Please <Link href={`/login?next=/messages/${threadId}`} className="text-brand">sign in</Link> to view this chat.
      </div>
    );
  }

  const counterpart = thread
    ? user.uid === thread.buyerId
      ? thread.sellerName
      : thread.buyerName
    : "";

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] w-full max-w-2xl flex-col px-4 py-3">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border pb-3">
        <Link href="/messages" className="text-brand">←</Link>
        <Avatar name={counterpart || "?"} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{counterpart || "Conversation"}</p>
          {thread && (
            <Link href={`/listing/${thread.listingId}`} className="block truncate text-xs text-muted">
              Re: {thread.listingTitle}
            </Link>
          )}
        </div>
        {thread?.callUnlocked && phone ? (
          <a
            href={`tel:${phone}`}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-brand px-4 text-sm font-medium text-brand-foreground"
          >
            <Phone className="mr-1 inline h-4 w-4 align-text-bottom" />Call
          </a>
        ) : (
          <Badge><Lock className="mr-1 inline h-3 w-3" />Call locked</Badge>
        )}
      </div>

      {/* Messages */}
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto py-4">
        {thread?.callUnlocked && (
          <p className="mx-auto rounded-full bg-brand/10 px-3 py-1 text-center text-xs text-brand-dark">
            <Unlock className="mr-1 inline h-4 w-4 align-text-bottom" />Call unlocked{phone ? ` — ${toLocalPhone(phone)}` : ""}. You can now call.
          </p>
        )}
        {messages.length === 0 && (
          <p className="mt-6 text-center text-sm text-muted">
            Say hello to start the conversation. Once they reply, the call button unlocks.
          </p>
        )}
        {messages.map((m) => {
          const mine = m.senderId === user.uid;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                  mine
                    ? "rounded-br-sm bg-brand text-brand-foreground"
                    : "rounded-bl-sm border border-border bg-card"
                }`}
              >
                {m.text}
                <span className={`mt-0.5 block text-[10px] ${mine ? "text-brand-foreground/70" : "text-muted"}`}>
                  {clockTime(m.createdAt)}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      {error && <p className="pb-1 text-center text-xs text-red-600">{error}</p>}
      <form onSubmit={onSend} className="flex items-center gap-2 border-t border-border pt-3">
        <input
          className="h-11 flex-1 rounded-full border border-border bg-card px-4 text-sm outline-none focus:border-brand"
          placeholder="Type a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={1000}
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="inline-flex h-11 items-center rounded-full bg-brand px-5 text-sm font-medium text-brand-foreground disabled:opacity-50"
        >
          {sending ? "…" : "Send"}
        </button>
      </form>
    </div>
  );
}
