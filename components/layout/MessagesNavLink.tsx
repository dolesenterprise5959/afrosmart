"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { useUnread } from "@/components/messaging/UnreadProvider";

/** Header messages icon with a live unread-count badge. */
export function MessagesNavLink() {
  const { user } = useAuth();
  const { unreadCount } = useUnread();
  if (!user) return null;

  return (
    <Link
      href="/messages"
      aria-label={unreadCount > 0 ? `Messages (${unreadCount} unread)` : "Messages"}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface"
    >
      <span className="text-xl leading-none" aria-hidden>💬</span>
      {unreadCount > 0 && (
        <span className="absolute right-1 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
