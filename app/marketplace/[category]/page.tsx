import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CategoryChips } from "@/components/layout/CategoryChips";
import { CountyFilter } from "@/components/layout/CountyFilter";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { CATEGORIES, getCategory } from "@/lib/mock";
import { getListingsByCategory } from "@/lib/firestore/listings";

export const dynamic = "force-dynamic";

// Define the known category routes; listings are fetched per request.
export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.id }));
}

// `params`/`searchParams` are Promises in Next.js 16.
export default async function CategoryPage({
  params,
  searchParams,
}: PageProps<"/marketplace/[category]">) {
  const { category } = await params;
  const { county } = await searchParams;
  const meta = getCategory(category);
  if (!meta) notFound();

  const countyFilter = typeof county === "string" ? county : "";
  let listings = await getListingsByCategory(category);
  if (countyFilter) listings = listings.filter((l) => l.county === countyFilter);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-5">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Marketplace", href: "/marketplace" },
          { label: meta.label },
        ]}
      />
      <h1 className="mt-2 flex items-center gap-2 text-xl font-bold">
        <span aria-hidden>{meta.icon}</span> {meta.label}
      </h1>
      <p className="mt-1 text-sm text-muted">
        {listings.length} {listings.length === 1 ? "listing" : "listings"}
        {countyFilter ? ` in ${countyFilter}` : ""}
      </p>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <CategoryChips active={meta.id} />
        </div>
        <Suspense fallback={null}>
          <CountyFilter />
        </Suspense>
      </div>

      <div className="mt-6">
        {listings.length > 0 ? (
          <ListingGrid listings={listings} />
        ) : (
          <EmptyState
            icon={meta.icon}
            title={`No ${meta.label.toLowerCase()} listings${countyFilter ? ` in ${countyFilter}` : " yet"}`}
            description="Be the first to post in this category."
            action={<Button href="/listing/new">+ Post a listing</Button>}
          />
        )}
      </div>
    </div>
  );
}
