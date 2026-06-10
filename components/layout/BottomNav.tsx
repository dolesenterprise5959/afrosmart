"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Store, PlusCircle, MessageCircle, Wallet, User } from "lucide-react";
import { useUnread } from "@/components/messaging/UnreadProvider";

const items = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/marketplace", label: "Browse", Icon: Store },
  { href: "/listing/new", label: "Post", Icon: PlusCircle },
  { href: "/messages", label: "Chats", Icon: MessageCircle },
  { href: "/wallet", label: "Wallet", Icon: Wallet },
  { href: "/dashboard", label: "Account", Icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const { unreadCount } = useUnread();

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  return (
    <nav className="sticky bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-1">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 px-1 pb-1.5 pt-2 text-[11px] font-medium transition-colors ${
                  active ? "text-brand" : "text-muted hover:text-foreground"
                }`}
              >
                <span
                  aria-hidden
                  className={`relative grid h-8 w-12 place-items-center rounded-full transition-colors ${
                    active ? "bg-brand/10" : ""
                  }`}
                >
                  <item.Icon className="h-5 w-5" strokeWidth={2} />
                  {item.href === "/messages" && unreadCount > 0 && (
                    <span className="absolute right-1.5 top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
