import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CategoryChips } from "@/components/layout/CategoryChips";
import { CountyFilter } from "@/components/layout/CountyFilter";
import { CurrencyFilter } from "@/components/layout/CurrencyFilter";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { CATEGORIES, getCategory } from "@/lib/mock";
import { getListingsByCategory } from "@/lib/firestore/listings";

export const dynamic = "force-dynamic";

// Group aliases — virtual category pages that aggregate several real categories
// (used by the hero banner links so /marketplace/land and /marketplace/shops work).
const CATEGORY_ALIASES: Record<string, { id: string; label: string; icon: string; ids: string[] }> = {
  land: { id: "land", label: "Land for Sale", icon: "🌍", ids: ["property"] },
  shops: { id: "shops", label: "Shops & Retail", icon: "🛍️", ids: ["restaurants", "cook-shops", "kobo-shops", "market-stalls", "general"] },
};

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
  const { county, currency } = await searchParams;
  const alias = CATEGORY_ALIASES[category];
  const meta = alias ?? getCategory(category);
  if (!meta) notFound();

  const countyFilter = typeof county === "string" ? county : "";
  const currencyFilter = typeof currency === "string" ? currency : "";
  let listings = alias
    ? (await Promise.all(alias.ids.map((id) => getListingsByCategory(id)))).flat()
    : await getListingsByCategory(category);
  if (countyFilter) listings = listings.filter((l) => l.county === countyFilter);
  if (currencyFilter) listings = listings.filter((l) => (l.currency ?? "LRD") === currencyFilter);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-5">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Marketplace", href: "/marketplace" },
          { label: meta.label },
        ]}
      />
      <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
        <span aria-hidden>{meta.icon}</span> {meta.label}
      </h1>
      <p className="mt-1 text-sm text-muted">
        {listings.length} {listings.length === 1 ? "listing" : "listings"}
        {countyFilter ? ` in ${countyFilter}` : ""}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1 basis-full sm:basis-auto">
          <CategoryChips active={meta.id} />
        </div>
        <Suspense fallback={null}>
          <CountyFilter />
        </Suspense>
        <Suspense fallback={null}>
          <CurrencyFilter />
        </Suspense>
      </div>

      <div className="mt-6">
        {listings.length > 0 ? (
          <ListingGrid listings={listings} />
        ) : (
          <EmptyState
            icon={meta.icon}
            title={countyFilter ? `No ${meta.label.toLowerCase()} listings in ${countyFilter}` : "No listings yet"}
            description={countyFilter ? "Try another county, or be the first to post." : "Be the first to post."}
            action={<Button href="/listing/new">+ Post a listing</Button>}
          />
        )}
      </div>
    </div>
  );
}
