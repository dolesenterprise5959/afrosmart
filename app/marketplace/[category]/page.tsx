import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CategoryChips } from "@/components/layout/CategoryChips";
import { CountyFilter } from "@/components/layout/CountyFilter";
import { CurrencyFilter } from "@/components/layout/CurrencyFilter";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { CATEGORIES, getCategory } from "@/lib/mock";
import { getListingsByCategory } from "@/lib/firestore/listings";

export const dynamic = "force-dynamic";

// Group aliases — virtual category pages that aggregate several real categories
// (used by the hero banner links so /marketplace/land and /marketplace/shops work).
const CATEGORY_ALIASES: Record<string, { id: string; label: string; ids: string[] }> = {
  land: { id: "land", label: "Land for Sale", ids: ["property"] },
  shops: { id: "shops", label: "Shops & Retail", ids: ["restaurants", "cook-shops", "kobo-shops", "market-stalls", "general"] },
};

// Define the known category routes; listings are fetched per request.
export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.id }));
}

// Per-category SEO: each category is its own landing page (e.g. "Free Stuff in
// Liberia"), so give it a distinct title/description + Open Graph card instead of
// inheriting the generic root metadata.
export async function generateMetadata({
  params,
}: PageProps<"/marketplace/[category]">): Promise<import("next").Metadata> {
  const { category } = await params;
  const meta = CATEGORY_ALIASES[category] ?? getCategory(category);
  if (!meta) return { title: "Marketplace — AfroSmart" };
  // Bare title — the root layout's title template appends "· AfroSmart".
  const title = `${meta.label} in Liberia`;
  const description = `Browse ${meta.label.toLowerCase()} listings across Liberia on AfroSmart. Buy, sell, and connect with people near you.`;
  const image = "/afrosmart-logo.png";
  return {
    title,
    description,
    openGraph: { title, description, type: "website", images: [{ url: image }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
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
        <CategoryIcon category={meta.id} className="h-7 w-7 text-accent" /> {meta.label}
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
            title={countyFilter ? `No ${meta.label.toLowerCase()} listings in ${countyFilter}` : "No listings yet"}
            description={countyFilter ? "Try another county, or be the first to post." : "Be the first to post."}
            action={<Button href="/listing/new">+ Post a listing</Button>}
          />
        )}
      </div>
    </div>
  );
}
