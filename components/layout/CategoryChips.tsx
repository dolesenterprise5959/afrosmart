import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { CATEGORIES } from "@/lib/mock";

/** Horizontally scrollable category links. `active` highlights the current one. */
export function CategoryChips({ active }: { active?: string }) {
  return (
    <div className="-mx-4 overflow-x-auto px-4">
      <div className="flex w-max gap-2">
        <Link
          href="/marketplace"
          className={chipClass(active === undefined || active === "all")}
        >
          <LayoutGrid className="h-4 w-4" aria-hidden /> All
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c.id}
            href={`/marketplace/${c.id}`}
            className={chipClass(active === c.id)}
          >
            <CategoryIcon category={c.id} className="h-4 w-4" /> {c.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function chipClass(active: boolean) {
  return [
    "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors",
    active
      ? "border-brand bg-brand text-brand-foreground"
      : "border-border bg-card text-foreground hover:bg-surface",
  ].join(" ");
}
