"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUnread } from "@/components/messaging/UnreadProvider";

const items = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/marketplace", label: "Browse", icon: "🛒" },
  { href: "/listing/new", label: "Post", icon: "➕" },
  { href: "/messages", label: "Chats", icon: "💬" },
  { href: "/dashboard", label: "Account", icon: "👤" },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const { unreadCount } = useUnread();

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  return (
    <nav className="sticky bottom-0 z-40 border-t border-border bg-card md:hidden">
      <ul className="mx-auto flex max-w-6xl items-stretch justify-between">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
                  active ? "text-brand" : "text-muted"
                }`}
              >
                <span aria-hidden className="relative text-lg leading-none">
                  {item.icon}
                  {item.href === "/messages" && unreadCount > 0 && (
                    <span className="absolute -right-2 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
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
