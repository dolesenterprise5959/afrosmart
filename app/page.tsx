import Link from "next/link";
import { SearchBar } from "@/components/layout/SearchBar";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { Button } from "@/components/ui/Button";
import { getFeaturedListings, getRecentListings } from "@/lib/firestore/listings";

// Always reflect the latest listings from Firestore.
export const dynamic = "force-dynamic";

// Everyday headline categories (not just cars/real estate). Cars/Real Estate have
// dedicated marketplaces; the rest are popular local categories.
const FEATURED_CATEGORIES = [
  { id: "rice", label: "Food", icon: "🍚", href: "/marketplace/rice" },
  { id: "barber", label: "Services", icon: "💈", href: "/services" },
  { id: "motorbike", label: "Transport", icon: "🛵", href: "/marketplace/motorbike" },
  { id: "restaurants", label: "Shops", icon: "🍽️", href: "/marketplace/restaurants" },
  { id: "property", label: "Real Estate", icon: "🏠", href: "/properties" },
  { id: "cars", label: "Cars", icon: "🚗", href: "/vehicles" },
  { id: "phones", label: "Phones", icon: "📱", href: "/marketplace/phones" },
  { id: "car-rental", label: "Rentals", icon: "🔑", href: "/marketplace/car-rental" },
];

export default async function Home() {
  const [featured, recent] = await Promise.all([
    getFeaturedListings(),
    getRecentListings(),
  ]);
  const recentTop = recent.slice(0, 8);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-10">
      {/* Hero — compact on mobile (search-first below) */}
      <section className="mt-4 rounded-3xl bg-gradient-to-br from-neutral-900 to-black px-5 py-6 text-white sm:px-8 sm:py-10">
        <h1 className="max-w-2xl text-2xl font-bold leading-tight sm:text-4xl">
          AfroSmart — Liberia&apos;s community marketplace
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-white/75 sm:text-base">
          For food, services, transport, businesses, real estate, jobs, and everyday commerce.
        </p>
      </section>

      {/* Search — the primary action */}
      <section className="mt-4">
        <SearchBar />
      </section>

      {/* Category cards — high on the page so users browse immediately */}
      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Browse by category</h2>
          <Link href="/marketplace" className="text-sm font-medium text-brand">All categories →</Link>
        </div>
        <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-4 lg:grid-cols-8">
          {FEATURED_CATEGORIES.map((c) => (
            <Link
              key={c.id}
              href={c.href}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-card px-2 py-4 text-center transition-colors hover:border-brand hover:bg-surface"
            >
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent/15 text-xl ring-1 ring-accent/20 transition-transform group-hover:scale-110">
                {c.icon}
              </span>
              <span className="text-xs font-medium">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">⭐ Featured listings</h2>
          <Link href="/marketplace" className="text-sm font-medium text-brand">See all</Link>
        </div>
        <ListingGrid listings={featured} />
      </section>

      {/* Recent */}
      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">🆕 Recent listings</h2>
          <Link href="/marketplace" className="text-sm font-medium text-brand">See all</Link>
        </div>
        <ListingGrid listings={recentTop} />
      </section>

      {/* Sell CTA */}
      <section className="mt-10 flex flex-col items-center gap-3 rounded-3xl border border-border bg-card px-6 py-8 text-center">
        <h2 className="text-lg font-semibold">Got something to sell?</h2>
        <p className="max-w-sm text-sm text-muted">
          Post your item in minutes and reach buyers across Liberia. It&apos;s free.
        </p>
        <Button href="/listing/new" size="lg">+ Post a listing</Button>
      </section>
    </div>
  );
}
