import Link from "next/link";
import { SearchBar } from "@/components/layout/SearchBar";
import { MarketplaceHeader } from "@/components/layout/MarketplaceHeader";
import { HeroCarousel } from "@/components/layout/HeroCarousel";
import { CategoryArt } from "@/components/layout/CategoryArt";
import { SponsoredAd } from "@/components/layout/SponsoredAd";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { Button } from "@/components/ui/Button";
import { getFeaturedListings, getRecentListings, getCategoryCounts } from "@/lib/firestore/listings";

// Always reflect the latest listings from Firestore.
export const dynamic = "force-dynamic";

// The top categories shown on the homepage as a horizontal swipe row. Everything
// else lives on the dedicated /categories page ("View All Categories").
// `count` groups the category ids whose active listings are tallied for the badge.
const TOP_CATEGORIES = [
  { id: "free-stuff", label: "Free Stuff", icon: "🎁", href: "/marketplace/free-stuff", count: ["free-stuff"] },
  { id: "wanted", label: "Wanted", icon: "🔎", href: "/marketplace/wanted", count: ["wanted"] },
  { id: "events", label: "Events", icon: "🎟️", href: "/marketplace/events", count: ["events"] },
  { id: "lost-found", label: "Lost & Found", icon: "🧭", href: "/marketplace/lost-found", count: ["lost-found"] },
  { id: "cars", label: "Cars", icon: "🚗", href: "/vehicles", count: ["cars"] },
  { id: "property", label: "Real Estate", icon: "🏠", href: "/properties", count: ["property"] },
  { id: "car-rental", label: "Rentals", icon: "🔑", href: "/marketplace/car-rental", count: ["car-rental", "equipment-rental", "house-rental", "bicycle-rental", "motorbike-rental", "truck-rental"] },
  { id: "land", label: "Land", icon: "🌍", href: "/properties", count: ["land"] },
  { id: "restaurants", label: "Shops", icon: "🛍️", href: "/marketplace/restaurants", count: ["restaurants", "cook-shops", "kobo-shops", "market-stalls", "general"] },
  { id: "sports-fields", label: "Sports", icon: "⚽", href: "/marketplace/sports-fields", count: ["sports-fields", "football", "tournaments"] },
  { id: "clothing", label: "Fashion", icon: "👗", href: "/marketplace/clothing", count: ["clothing", "shoes"] },
  { id: "services", label: "Services", icon: "🛠️", href: "/services", count: ["barber", "hair-braiding", "beauty-salon", "phone-repair", "carpentry", "plumbing", "cleaning", "tailor"] },
];

export default async function Home() {
  const [featured, recent, counts] = await Promise.all([
    getFeaturedListings(),
    getRecentListings(),
    getCategoryCounts(Object.fromEntries(TOP_CATEGORIES.map((c) => [c.id, c.count]))),
  ]);
  const recentTop = recent.slice(0, 8);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-10">
      {/* Compact, expandable marketplace header (collapsed by default) */}
      <section className="mt-3">
        <MarketplaceHeader />
      </section>

      {/* Search bar — above the hero banner */}
      <section className="mt-3">
        <SearchBar placeholder="What are you looking for today?" />
      </section>

      {/* Hero / advertisement banner (rotating Liberia photos + quick chips) */}
      <section className="mt-3">
        <HeroCarousel />
      </section>

      {/* Top categories — ~1.8 visible on mobile, horizontal swipe */}
      <section className="mt-4">
        <div className="mb-2.5 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Browse by category</h2>
          <Link href="/categories" className="shrink-0 text-sm font-medium text-brand">View All →</Link>
        </div>
        <div className="-mx-4 flex snap-x gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TOP_CATEGORIES.map((c) => (
            <Link
              key={c.id}
              href={c.href}
              className="group block w-[55vw] shrink-0 snap-start overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-brand hover:bg-surface sm:w-60"
            >
              <CategoryArt category={c.id} icon={c.icon} label={c.label} count={counts[c.id]} />
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">⭐ Featured listings</h2>
          <Link href="/marketplace" className="shrink-0 text-sm font-medium text-brand">See all</Link>
        </div>
        <ListingGrid listings={featured} />
      </section>

      {/* Sponsored — minimalist native ad slot */}
      <section className="mt-6">
        <SponsoredAd />
      </section>

      {/* Latest */}
      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">🆕 Latest listings</h2>
          <Link href="/marketplace" className="shrink-0 text-sm font-medium text-brand">See all</Link>
        </div>
        <ListingGrid listings={recentTop} />
      </section>

      {/* Sell CTA */}
      <section className="mt-8 flex flex-col items-center gap-3 rounded-3xl border border-border bg-card px-6 py-8 text-center">
        <h2 className="text-2xl font-bold tracking-tight">Got something to sell?</h2>
        <p className="max-w-sm text-sm text-muted">
          Post your item in minutes and reach buyers across Liberia. It&apos;s free.
        </p>
        <Button href="/listing/new" size="lg">+ Post a listing</Button>
      </section>
    </div>
  );
}
