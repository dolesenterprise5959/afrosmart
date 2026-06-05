import { Suspense } from "react";
import { CategoryChips } from "@/components/layout/CategoryChips";
import { CountyFilter } from "@/components/layout/CountyFilter";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { searchListings } from "@/lib/firestore/listings";

export const dynamic = "force-dynamic";

// In Next.js 16 `searchParams` is a Promise and must be awaited.
export default async function MarketplacePage({
  searchParams,
}: PageProps<"/marketplace">) {
  const { q, county } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";
  const countyFilter = typeof county === "string" ? county : "";

  let listings = await searchListings(query);
  if (countyFilter) listings = listings.filter((l) => l.county === countyFilter);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-5">
      <h1 className="text-xl font-bold">
        {query ? `Results for “${query}”` : "Marketplace"}
      </h1>
      <p className="mt-1 text-sm text-muted">
        {listings.length} {listings.length === 1 ? "listing" : "listings"}
        {countyFilter ? ` in ${countyFilter}` : " across Liberia"}
      </p>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <CategoryChips active="all" />
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
            icon="🔍"
            title="No listings found"
            description="Try a different search or county filter."
            action={
              <Button href="/marketplace" variant="outline">
                Clear filters
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
}
