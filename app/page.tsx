import Link from "next/link";
import { SearchBar } from "@/components/layout/SearchBar";
import { MarketplaceHeader } from "@/components/layout/MarketplaceHeader";
import { SponsoredAd } from "@/components/layout/SponsoredAd";
import { CategoryArt } from "@/components/layout/CategoryArt";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { Button } from "@/components/ui/Button";
import { getFeaturedListings, getRecentListings } from "@/lib/firestore/listings";

// Always reflect the latest listings from Firestore.
export const dynamic = "force-dynamic";

// The top categories shown on the homepage as a horizontal swipe row. Everything
// else lives on the dedicated /categories page ("View All Categories").
const TOP_CATEGORIES = [
  { id: "cars", label: "Cars", icon: "🚗", href: "/vehicles" },
  { id: "property", label: "Real Estate", icon: "🏠", href: "/properties" },
  { id: "car-rental", label: "Rentals", icon: "🔑", href: "/marketplace/car-rental" },
  { id: "land", label: "Land", icon: "🌍", href: "/properties" },
  { id: "restaurants", label: "Shops", icon: "🛍️", href: "/marketplace/restaurants" },
  { id: "sports-fields", label: "Sports", icon: "⚽", href: "/marketplace/sports-fields" },
  { id: "clothing", label: "Fashion", icon: "👗", href: "/marketplace/clothing" },
  { id: "services", label: "Services", icon: "🛠️", href: "/services" },
];

export default async function Home() {
  const [featured, recent] = await Promise.all([
    getFeaturedListings(),
    getRecentListings(),
  ]);
  const recentTop = recent.slice(0, 8);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-10">
      {/* Compact, expandable marketplace header (collapsed by default) */}
      <section className="mt-3">
        <MarketplaceHeader />
      </section>

      {/* Search — the primary focus of the home screen */}
      <section className="mt-3">
        <SearchBar />
      </section>

      {/* Sponsored advertisement slot */}
      <section className="mt-3">
        <SponsoredAd />
      </section>

      {/* Top categories — horizontal swipe row; full list on /categories */}
      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Browse by category</h2>
          <Link href="/categories" className="text-sm font-medium text-brand">View All Categories →</Link>
        </div>
        <div className="-mx-4 flex snap-x gap-2.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TOP_CATEGORIES.map((c) => (
            <Link
              key={c.id}
              href={c.href}
              className="group block w-[78px] shrink-0 snap-start overflow-hidden rounded-2xl border border-border bg-card text-center transition-colors hover:border-brand hover:bg-surface sm:w-24"
            >
              <CategoryArt category={c.id} icon={c.icon} label={c.label} />
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">⭐ Featured listings</h2>
          <Link href="/marketplace" className="text-sm font-medium text-brand">See all</Link>
        </div>
        <ListingGrid listings={featured} />
      </section>

      {/* Latest */}
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">🆕 Latest listings</h2>
          <Link href="/marketplace" className="text-sm font-medium text-brand">See all</Link>
        </div>
        <ListingGrid listings={recentTop} />
      </section>

      {/* Sell CTA */}
      <section className="mt-8 flex flex-col items-center gap-3 rounded-3xl border border-border bg-card px-6 py-8 text-center">
        <h2 className="text-lg font-semibold">Got something to sell?</h2>
        <p className="max-w-sm text-sm text-muted">
          Post your item in minutes and reach buyers across Liberia. It&apos;s free.
        </p>
        <Button href="/listing/new" size="lg">+ Post a listing</Button>
      </section>
    </div>
  );
}
