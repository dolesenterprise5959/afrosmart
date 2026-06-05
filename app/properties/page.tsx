import type { Metadata } from "next";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { PropertyFilters } from "@/components/properties/PropertyFilters";
import { getListingsByCategory } from "@/lib/firestore/listings";
import type { Listing } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Real Estate",
  description: "Houses, apartments and land for sale and rent across Liberia.",
};

const num = (v: string): number | null => {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

function sortProperties(list: Listing[], sort: string): Listing[] {
  const arr = [...list];
  switch (sort) {
    case "price-asc": return arr.sort((a, b) => a.price - b.price);
    case "price-desc": return arr.sort((a, b) => b.price - a.price);
    case "beds-desc": return arr.sort((a, b) => (b.property?.bedrooms ?? 0) - (a.property?.bedrooms ?? 0));
    case "area-desc": return arr.sort((a, b) => (b.property?.squareFeet ?? 0) - (a.property?.squareFeet ?? 0));
    default: return arr.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

export default async function PropertiesPage({ searchParams }: PageProps<"/properties">) {
  const sp = await searchParams;
  const str = (k: string) => {
    const v = sp[k];
    return typeof v === "string" ? v : "";
  };

  const all = await getListingsByCategory("property");

  const q = str("q").trim().toLowerCase();
  const listingType = str("listingType");
  const propertyType = str("propertyType");
  const minBeds = num(str("minBeds"));
  const minBaths = num(str("minBaths"));
  const minPrice = num(str("minPrice"));
  const maxPrice = num(str("maxPrice"));
  const sort = str("sort") || "newest";

  const hasFilters = Boolean(
    q || listingType || propertyType || minBeds !== null || minBaths !== null || minPrice !== null || maxPrice !== null,
  );

  const results = sortProperties(
    all.filter((l) => {
      const p = l.property;
      if (q && !`${l.title} ${l.description} ${l.city} ${l.county}`.toLowerCase().includes(q)) return false;
      if (listingType && p?.listingType !== listingType) return false;
      if (propertyType && p?.propertyType !== propertyType) return false;
      if (minBeds !== null && (p?.bedrooms ?? 0) < minBeds) return false;
      if (minBaths !== null && (p?.bathrooms ?? 0) < minBaths) return false;
      if (minPrice !== null && l.price < minPrice) return false;
      if (maxPrice !== null && l.price > maxPrice) return false;
      return true;
    }),
    sort,
  );

  const featured = all.filter((l) => l.featured).slice(0, 4);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      {/* Hero */}
      <section className="rounded-3xl bg-gradient-to-br from-brand to-brand-dark px-5 py-7 text-brand-foreground sm:px-8">
        <h1 className="text-2xl font-bold sm:text-3xl">🏠 Real Estate</h1>
        <p className="mt-1 max-w-md text-sm text-brand-foreground/85">
          Houses, apartments and land for sale and rent across Liberia.
        </p>
        <div className="mt-4">
          <Button href="/listing/new" variant="secondary" size="md">+ List your property</Button>
        </div>
      </section>

      {/* Featured (only on the unfiltered view) */}
      {!hasFilters && featured.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 text-lg font-semibold">⭐ Featured properties</h2>
          <ListingGrid listings={featured} />
        </section>
      )}

      {/* Filters */}
      <section className="mt-6">
        <PropertyFilters />
      </section>

      {/* Results */}
      <section className="mt-6">
        <h2 className="mb-3 text-lg font-semibold">
          {results.length} {results.length === 1 ? "property" : "properties"}
          {hasFilters ? " match your filters" : " available"}
        </h2>
        {results.length > 0 ? (
          <ListingGrid listings={results} />
        ) : (
          <EmptyState
            icon="🏠"
            title="No properties found"
            description={hasFilters ? "Try widening your filters." : "Be the first to list a property."}
          />
        )}
      </section>
    </div>
  );
}
