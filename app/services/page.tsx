import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { SearchBar } from "@/components/layout/SearchBar";
import { CountyFilter } from "@/components/layout/CountyFilter";
import { CurrencyFilter } from "@/components/layout/CurrencyFilter";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { StarRating } from "@/components/rating/StarRating";
import { CATEGORY_GROUPS, categoryHref } from "@/lib/categories";
import { isServiceCategory } from "@/lib/services";
import { isBusinessSeller } from "@/lib/sellers";
import { getRecentListings, getFeaturedListings } from "@/lib/firestore/listings";
import { getBusinesses } from "@/lib/firestore/users";

import { Trophy } from "lucide-react";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Services & Businesses",
  description: "Find trusted services and businesses across Liberia — barbers, salons, mechanics, caterers, cleaners, photographers and more.",
};

const servicesGroup = CATEGORY_GROUPS.find((g) => g.id === "services");

export default async function ServicesPage({ searchParams }: PageProps<"/services">) {
  const sp = await searchParams;
  const str = (k: string) => {
    const v = sp[k];
    return typeof v === "string" ? v : "";
  };
  const q = str("q").trim().toLowerCase();
  const county = str("county");
  const currency = str("currency");
  const hasFilters = Boolean(q || county || currency);

  const [recent, featured, businesses] = await Promise.all([
    getRecentListings(),
    getFeaturedListings(),
    getBusinesses(),
  ]);

  const services = recent
    .filter((l) => isServiceCategory(l.category))
    .filter((l) => !q || `${l.title} ${l.description} ${l.service?.businessName ?? ""}`.toLowerCase().includes(q))
    .filter((l) => !county || l.county === county)
    .filter((l) => !currency || (l.currency ?? "LRD") === currency);

  const featuredServices = featured.filter((l) => isServiceCategory(l.category)).slice(0, 4);
  const topRated = [...businesses]
    .sort((a, b) => b.ratingAvg - a.ratingAvg || b.ratingCount - a.ratingCount)
    .slice(0, 6);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-5">
      {/* Hero */}
      <section className="rounded-3xl bg-gradient-to-br from-neutral-900 to-black px-5 py-6 text-white sm:px-8 sm:py-8">
        <h1 className="text-2xl font-bold sm:text-3xl">Services & Businesses</h1>
        <p className="mt-1 max-w-xl text-sm text-white/75">
          Find trusted barbers, salons, mechanics, caterers, cleaners and more — near you in Liberia.
        </p>
      </section>

      {/* Search + filters */}
      <section className="mt-4 space-y-3">
        <SearchBar />
        <div className="flex flex-wrap items-center gap-2">
          <Suspense fallback={null}><CountyFilter /></Suspense>
          <Suspense fallback={null}><CurrencyFilter /></Suspense>
          {hasFilters && <Button href="/services" variant="outline" size="sm">Clear</Button>}
          <span className="ml-auto text-sm text-muted">Nearby? Pick your county above.</span>
        </div>
      </section>

      {/* Service categories */}
      {!hasFilters && servicesGroup && (
        <section className="mt-6">
          <h2 className="mb-3 text-lg font-semibold">Service categories</h2>
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-6">
            {servicesGroup.categories.map((c) => (
              <Link
                key={c.id}
                href={categoryHref(c.id)}
                className="group flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card px-2 py-3 text-center transition-colors hover:border-brand hover:bg-surface"
              >
                <CategoryIcon category={c.id} className="h-6 w-6 text-accent transition-transform group-hover:scale-110" />
                <span className="text-[11px] font-medium leading-tight">{c.label}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured businesses */}
      {!hasFilters && featuredServices.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold">⭐ Featured businesses</h2>
          <ListingGrid listings={featuredServices} />
        </section>
      )}

      {/* Top-rated businesses */}
      {!hasFilters && topRated.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold"><Trophy className="mr-1.5 inline h-5 w-5 align-text-bottom" />Top-rated businesses</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {topRated.map((b) => (
              <Link key={b.id} href={`/u/${b.id}`} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 hover:border-brand">
                <Avatar name={b.displayName} />
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 truncate font-medium">
                    {b.displayName}
                    {b.verified && isBusinessSeller(b) && <VerifiedBadge kind="business" label="Verified" />}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-muted">
                    <StarRating value={b.ratingAvg} /> {b.ratingAvg.toFixed(1)} ({b.ratingCount})
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Service listings */}
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">
          {services.length} {services.length === 1 ? "service" : "services"}
          {hasFilters ? " match your search" : " available"}
        </h2>
        {services.length > 0 ? (
          <ListingGrid listings={services} />
        ) : (
          <EmptyState
            icon="tools"
            title="No services found"
            description={hasFilters ? "Try a different search or county." : "Be the first to list your service."}
            action={<Button href="/listing/new">+ List your service</Button>}
          />
        )}
      </section>
    </div>
  );
}
