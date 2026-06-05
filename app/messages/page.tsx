"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, onSnapshot, query, where, type Timestamp } from "firebase/firestore";
import { useAuth } from "@/components/auth/AuthProvider";
import { getDb } from "@/lib/firebase/client";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

interface ThreadRow {
  id: string;
  buyerId: string;
  sellerId: string;
  buyerName: string;
  sellerName: string;
  listingTitle: string;
  lastMessage: string;
  callUnlocked: boolean;
  lastMessageAt?: Timestamp;
}

function relativeTime(ts?: Timestamp): string {
  if (!ts) return "";
  const diff = Date.now() - ts.toMillis();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default function MessagesPage() {
  const { user, loading, configured } = useAuth();
  const [threads, setThreads] = useState<ThreadRow[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(getDb(), "threads"),
      where("participants", "array-contains", user.uid),
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as ThreadRow[];
        rows.sort(
          (a, b) => (b.lastMessageAt?.toMillis() ?? 0) - (a.lastMessageAt?.toMillis() ?? 0),
        );
        setThreads(rows);
        setReady(true);
      },
      () => setReady(true),
    );
    return unsub;
  }, [user]);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-5">
      <h1 className="text-xl font-bold">Messages</h1>

      {!configured ? (
        <p className="mt-6 text-sm text-muted">
          Sign-in isn’t configured yet. Add your Firebase keys to enable messaging.
        </p>
      ) : loading || (user && !ready) ? (
        <div className="mt-6 space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-card" />
          ))}
        </div>
      ) : !user ? (
        <div className="mt-6">
          <EmptyState
            icon="🔒"
            title="Sign in to see your messages"
            action={<Button href="/login?next=/messages">Sign in</Button>}
          />
        </div>
      ) : threads.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon="💬"
            title="No messages yet"
            description="When you message a seller, your chats show up here."
            action={<Button href="/marketplace">Browse listings</Button>}
          />
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {threads.map((t) => {
            const counterpart = user.uid === t.buyerId ? t.sellerName : t.buyerName;
            return (
              <li key={t.id}>
                <Link href={`/messages/${t.id}`} className="flex items-center gap-3 p-3 hover:bg-surface">
                  <Avatar name={counterpart || "?"} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-medium">{counterpart}</p>
                      <span className="shrink-0 text-xs text-muted">
                        {relativeTime(t.lastMessageAt)}
                      </span>
                    </div>
                    <p className="truncate text-xs text-muted">{t.listingTitle}</p>
                    <p className="truncate text-sm text-muted">
                      {t.lastMessage || "Start the conversation"}
                    </p>
                  </div>
                  {t.callUnlocked && <span title="Call unlocked">📞</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
