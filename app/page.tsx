import Link from "next/link";
import { SearchBar } from "@/components/layout/SearchBar";
import { CategoryChips } from "@/components/layout/CategoryChips";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { Button } from "@/components/ui/Button";
import { getFeaturedListings, getRecentListings } from "@/lib/firestore/listings";

// Always reflect the latest listings from Firestore.
export const dynamic = "force-dynamic";

export default async function Home() {
  const [featured, recent] = await Promise.all([
    getFeaturedListings(),
    getRecentListings(),
  ]);
  const recentTop = recent.slice(0, 8);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-10">
      {/* Hero */}
      <section className="mt-4 rounded-3xl bg-gradient-to-br from-brand to-brand-dark px-5 py-8 text-brand-foreground sm:px-8 sm:py-10">
        <h1 className="max-w-xl text-2xl font-bold leading-tight sm:text-3xl">
          Buy & sell anything in Liberia
        </h1>
        <p className="mt-2 max-w-md text-sm text-brand-foreground/85 sm:text-base">
          Cars, phones, electronics, property and services — close to you, from people you can trust.
        </p>
        {/* Inline search on mobile (the header search is hidden there). */}
        <div className="mt-5 md:hidden">
          <SearchBar />
        </div>
      </section>

      {/* Categories */}
      <section className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-muted">Browse by category</h2>
        <CategoryChips />
      </section>

      {/* Featured */}
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">⭐ Featured listings</h2>
          <Link href="/marketplace" className="text-sm font-medium text-brand">
            See all
          </Link>
        </div>
        <ListingGrid listings={featured} />
      </section>

      {/* Recent */}
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">🆕 Recent listings</h2>
          <Link href="/marketplace" className="text-sm font-medium text-brand">
            See all
          </Link>
        </div>
        <ListingGrid listings={recentTop} />
      </section>

      {/* Sell CTA */}
      <section className="mt-10 flex flex-col items-center gap-3 rounded-3xl border border-border bg-card px-6 py-8 text-center">
        <h2 className="text-lg font-semibold">Got something to sell?</h2>
        <p className="max-w-sm text-sm text-muted">
          Post your item in minutes and reach buyers across Liberia. It’s free.
        </p>
        <Button href="/listing/new" size="lg">
          + Post a listing
        </Button>
      </section>
    </div>
  );
}
