"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/marketplace", label: "Browse", icon: "🛒" },
  { href: "/listing/new", label: "Post", icon: "➕" },
  { href: "/messages", label: "Chats", icon: "💬" },
  { href: "/dashboard", label: "Account", icon: "👤" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

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
                <span aria-hidden className="text-lg leading-none">
                  {item.icon}
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
