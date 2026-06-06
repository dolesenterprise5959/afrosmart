import Link from "next/link";
import { CATEGORY_GROUPS, categoryHref } from "@/lib/categories";

/** Compact grouped category browser — all categories reachable from one place. */
export function CategoryBrowser() {
  return (
    <div className="space-y-6">
      {CATEGORY_GROUPS.map((group) => (
        <section key={group.id}>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted">
            <span aria-hidden>{group.icon}</span> {group.label}
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {group.categories.map((c) => (
              <Link
                key={c.id}
                href={categoryHref(c.id)}
                className="group flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 transition-colors hover:border-brand hover:bg-surface"
              >
                <span className="text-lg" aria-hidden>{c.icon}</span>
                <span className="min-w-0 truncate text-xs font-medium">{c.label}</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
