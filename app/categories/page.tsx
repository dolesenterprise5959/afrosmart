import type { Metadata } from "next";
import Link from "next/link";
import { SearchBar } from "@/components/layout/SearchBar";
import { CATEGORY_GROUPS, categoryHref } from "@/lib/categories";

export const metadata: Metadata = {
  title: "All Categories",
  description: "Browse everything on AfroSmart — food & agriculture, services, retail, transportation, community and more across Liberia.",
};

export default function CategoriesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <h1 className="text-2xl font-bold sm:text-3xl">Browse all categories</h1>
      <p className="mt-1 text-sm text-muted">From local food to services, retail and community — find it near you.</p>

      <div className="mt-4 md:hidden">
        <SearchBar />
      </div>

      <div className="mt-6 space-y-8">
        {CATEGORY_GROUPS.map((group) => (
          <section key={group.id}>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
              <span aria-hidden>{group.icon}</span> {group.label}
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {group.categories.map((c) => (
                <Link
                  key={c.id}
                  href={categoryHref(c.id)}
                  className="group flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 transition-colors hover:border-brand hover:bg-surface"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-xl transition-transform group-hover:scale-110">
                    {c.icon}
                  </span>
                  <span className="min-w-0 truncate text-sm font-medium">{c.label}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
