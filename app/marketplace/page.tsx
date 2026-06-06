import { Suspense } from "react";
import { cookies } from "next/headers";
import { CountyFilter } from "@/components/layout/CountyFilter";
import { CurrencyFilter } from "@/components/layout/CurrencyFilter";
import { CurrencyPreference } from "@/components/layout/CurrencyPreference";
import { CategoryBrowser } from "@/components/layout/CategoryBrowser";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { searchListings } from "@/lib/firestore/listings";
import type { Currency } from "@/lib/types";

export const dynamic = "force-dynamic";

// In Next.js 16 `searchParams` is a Promise and must be awaited.
export default async function MarketplacePage({
  searchParams,
}: PageProps<"/marketplace">) {
  const { q, county, currency } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";
  const countyFilter = typeof county === "string" ? county : "";
  const currencyFilter = typeof currency === "string" ? currency : "";

  let listings = await searchListings(query);
  if (countyFilter) listings = listings.filter((l) => l.county === countyFilter);
  if (currencyFilter) listings = listings.filter((l) => (l.currency ?? "LRD") === currencyFilter);

  const browsing = !query && !countyFilter && !currencyFilter;
  const displayCurrency: Currency = (await cookies()).get("afm_ccy")?.value === "USD" ? "USD" : "LRD";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-5">
      <h1 className="text-xl font-bold">
        {query ? `Results for “${query}”` : "Marketplace"}
      </h1>
      <p className="mt-1 text-sm text-muted">
        {listings.length} {listings.length === 1 ? "listing" : "listings"}
        {countyFilter ? ` in ${countyFilter}` : " across Liberia"}
      </p>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Suspense fallback={null}>
          <CountyFilter />
        </Suspense>
        <Suspense fallback={null}>
          <CurrencyFilter />
        </Suspense>
        {!browsing && (
          <Button href="/marketplace" variant="outline" size="sm">Clear</Button>
        )}
        <span className="ml-auto"><CurrencyPreference current={displayCurrency} /></span>
      </div>

      {/* One unified place to reach every category (shown when not searching). */}
      {browsing && (
        <section className="mt-6">
          <h2 className="mb-3 text-lg font-semibold">Shop by category</h2>
          <CategoryBrowser />
        </section>
      )}

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">
          {browsing ? "Latest listings" : "Results"}
        </h2>
        {listings.length > 0 ? (
          <ListingGrid listings={listings} />
        ) : (
          <EmptyState
            icon="🔍"
            title="No listings found"
            description="Try a different search, county or currency."
            action={
              <Button href="/marketplace" variant="outline">Clear filters</Button>
            }
          />
        )}
      </section>
    </div>
  );
}
