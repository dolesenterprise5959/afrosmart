import Link from "next/link";
import { SearchBar } from "@/components/layout/SearchBar";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { Button } from "@/components/ui/Button";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { FOUNDER } from "@/lib/founder";
import { getFeaturedListings, getRecentListings } from "@/lib/firestore/listings";

// Always reflect the latest listings from Firestore.
export const dynamic = "force-dynamic";

// The six headline categories. "Real Estate" maps to the `property` category id;
// Cars has a dedicated vehicle marketplace at /vehicles.
const FEATURED_CATEGORIES = [
  { id: "cars", label: "Cars", icon: "🚗", href: "/vehicles" },
  { id: "property", label: "Real Estate", icon: "🏠", href: "/properties" },
  { id: "electronics", label: "Electronics", icon: "💻", href: "/marketplace/electronics" },
  { id: "phones", label: "Phones", icon: "📱", href: "/marketplace/phones" },
  { id: "jobs", label: "Jobs", icon: "💼", href: "/marketplace/jobs" },
  { id: "services", label: "Services", icon: "🛠️", href: "/marketplace/services" },
];

export default async function Home() {
  const [featured, recent] = await Promise.all([
    getFeaturedListings(),
    getRecentListings(),
  ]);
  const recentTop = recent.slice(0, 8);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-10">
      {/* Hero */}
      <section className="mt-4 rounded-3xl bg-gradient-to-br from-brand to-brand-dark px-5 py-9 text-brand-foreground sm:px-8 sm:py-12">
        <h1 className="max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">
          Buy. Sell. Connect Across Africa.
        </h1>
        <p className="mt-3 max-w-xl text-sm text-brand-foreground/85 sm:text-base">
          Liberia&apos;s trusted marketplace for vehicles, real estate, electronics, phones,
          jobs and services — close to you, from people you can trust.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button href="/marketplace" variant="secondary" size="lg">Browse marketplace</Button>
          <Button
            href="/listing/new"
            size="lg"
            className="bg-brand-foreground/15 text-brand-foreground ring-1 ring-brand-foreground/30 hover:bg-brand-foreground/25"
          >
            + Post a listing
          </Button>
        </div>
        {/* Inline search on mobile (the header search is hidden there). */}
        <div className="mt-6 md:hidden">
          <SearchBar />
        </div>
      </section>

      {/* Category cards */}
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Browse by category</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {FEATURED_CATEGORIES.map((c) => (
            <Link
              key={c.id}
              href={c.href}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-card px-3 py-5 text-center transition-colors hover:border-brand hover:bg-surface"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand/10 text-2xl transition-transform group-hover:scale-110">
                {c.icon}
              </span>
              <span className="text-sm font-medium">{c.label}</span>
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

      {/* Founder card */}
      <section className="mt-12">
        <Link
          href="/founder"
          className="flex flex-col items-start gap-4 rounded-3xl border border-border bg-card p-6 transition-colors hover:border-brand sm:flex-row sm:items-center sm:gap-6"
        >
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-dark text-xl font-bold text-brand-foreground">
            {FOUNDER.initials}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">{FOUNDER.name}</span>
              <VerifiedBadge kind="founder" />
            </div>
            <p className="text-sm text-muted">{FOUNDER.title}</p>
            <p className="mt-1.5 line-clamp-2 text-sm text-foreground/80">{FOUNDER.bio}</p>
          </div>
          <span className="ml-auto hidden shrink-0 text-sm font-medium text-brand sm:inline">Meet the founder →</span>
        </Link>
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
