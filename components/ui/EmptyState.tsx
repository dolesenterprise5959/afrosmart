import type { ReactNode } from "react";
import {
  Inbox, Search, Lock, MessageCircle, Heart, Home, Wrench, Car, Package, Star,
  ShoppingBag, type LucideIcon,
} from "lucide-react";

// Semantic icon keys → lucide (keeps empty states on the same SVG system as the
// rest of the app; callers pass a key, not an emoji). A non-string `icon` (a
// React node) is rendered as-is for full flexibility.
const KEYS: Record<string, LucideIcon> = {
  inbox: Inbox, search: Search, locked: Lock, chat: MessageCircle, heart: Heart,
  home: Home, tools: Wrench, car: Car, box: Package, star: Star, bag: ShoppingBag,
};

export function EmptyState({
  icon = "inbox",
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  const Lucide = typeof icon === "string" ? KEYS[icon] : undefined;
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
      <div className="text-muted">{Lucide ? <Lucide className="h-10 w-10" strokeWidth={1.5} /> : icon}</div>
      <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
