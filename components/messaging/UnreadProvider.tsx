"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { collection, onSnapshot, query, where, type Timestamp } from "firebase/firestore";
import { useAuth } from "@/components/auth/AuthProvider";
import { getDb } from "@/lib/firebase/client";

export interface ThreadRow {
  id: string;
  buyerId: string;
  sellerId: string;
  buyerName: string;
  sellerName: string;
  listingTitle: string;
  lastMessage: string;
  lastSenderId?: string;
  callUnlocked: boolean;
  lastMessageAt?: Timestamp;
  lastReadBy?: Record<string, Timestamp>;
}

interface UnreadState {
  threads: ThreadRow[];
  ready: boolean;
  unreadCount: number;
  isUnread: (t: ThreadRow) => boolean;
}

const UnreadContext = createContext<UnreadState>({
  threads: [],
  ready: false,
  unreadCount: 0,
  isUnread: () => false,
});

/** A thread is unread for `uid` when the last message came from someone else and
 *  arrived after the user last read the thread. */
function makeIsUnread(uid: string | undefined) {
  return (t: ThreadRow): boolean => {
    if (!uid || !t.lastMessage || !t.lastSenderId || t.lastSenderId === uid) return false;
    const lastAt = t.lastMessageAt?.toMillis() ?? 0;
    const readAt = t.lastReadBy?.[uid]?.toMillis() ?? 0;
    return lastAt > readAt;
  };
}

export function UnreadProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [threads, setThreads] = useState<ThreadRow[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(getDb(), "threads"),
      where("participants", "array-contains", user.uid),
    );
    return onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as ThreadRow[];
        rows.sort((a, b) => (b.lastMessageAt?.toMillis() ?? 0) - (a.lastMessageAt?.toMillis() ?? 0));
        setThreads(rows);
        setReady(true);
      },
      () => setReady(true),
    );
  }, [user]);

  // Mask any state left over from a previous session when signed out.
  const safeThreads = user ? threads : [];
  const isUnread = makeIsUnread(user?.uid);
  const unreadCount = safeThreads.filter(isUnread).length;

  // Tab-title notification, e.g. "(2) AfroSmart".
  useEffect(() => {
    if (typeof document === "undefined") return;
    const base = document.title.replace(/^\(\d+\)\s*/, "");
    document.title = unreadCount > 0 ? `(${unreadCount}) ${base}` : base;
  }, [unreadCount]);

  return (
    <UnreadContext.Provider value={{ threads: safeThreads, ready: user ? ready : false, unreadCount, isUnread }}>
      {children}
    </UnreadContext.Provider>
  );
}

export function useUnread(): UnreadState {
  return useContext(UnreadContext);
}
