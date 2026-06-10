import type { Metadata } from "next";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { VehicleFilters } from "@/components/vehicles/VehicleFilters";
import { getListingsByCategory } from "@/lib/firestore/listings";
import type { Listing } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vehicles",
  description: "Buy and sell cars across Liberia — search by make, year, price, condition and more.",
};

const num = (v: string): number | null => {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

function sortVehicles(list: Listing[], sort: string): Listing[] {
  const arr = [...list];
  switch (sort) {
    case "price-asc": return arr.sort((a, b) => a.price - b.price);
    case "price-desc": return arr.sort((a, b) => b.price - a.price);
    case "year-desc": return arr.sort((a, b) => (b.vehicle?.year ?? 0) - (a.vehicle?.year ?? 0));
    case "mileage-asc": return arr.sort((a, b) => (a.vehicle?.mileage || Infinity) - (b.vehicle?.mileage || Infinity));
    default: return arr.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

export default async function VehiclesPage({ searchParams }: PageProps<"/vehicles">) {
  const sp = await searchParams;
  const str = (k: string) => {
    const v = sp[k];
    return typeof v === "string" ? v : "";
  };

  const all = await getListingsByCategory("cars");

  const q = str("q").trim().toLowerCase();
  const make = str("make").toLowerCase();
  const condition = str("condition");
  const fuel = str("fuel");
  const transmission = str("transmission");
  const minPrice = num(str("minPrice"));
  const maxPrice = num(str("maxPrice"));
  const minYear = num(str("minYear"));
  const maxYear = num(str("maxYear"));
  const sort = str("sort") || "newest";

  const hasFilters = Boolean(
    q || make || condition || fuel || transmission || minPrice !== null || maxPrice !== null || minYear !== null || maxYear !== null,
  );

  const results = sortVehicles(
    all.filter((l) => {
      const v = l.vehicle;
      if (q && !`${l.title} ${l.description} ${v?.make ?? ""} ${v?.model ?? ""}`.toLowerCase().includes(q)) return false;
      if (make && (v?.make ?? "").toLowerCase() !== make) return false;
      if (condition && v?.condition !== condition) return false;
      if (fuel && v?.fuelType !== fuel) return false;
      if (transmission && v?.transmission !== transmission) return false;
      if (minPrice !== null && l.price < minPrice) return false;
      if (maxPrice !== null && l.price > maxPrice) return false;
      if (minYear !== null && (v?.year ?? 0) < minYear) return false;
      if (maxYear !== null && (v?.year ?? 9999) > maxYear) return false;
      return true;
    }),
    sort,
  );

  const featured = all.filter((l) => l.featured).slice(0, 4);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      {/* Hero */}
      <section className="rounded-3xl bg-gradient-to-br from-neutral-900 to-black px-5 py-7 text-white sm:px-8">
        <h1 className="text-2xl font-bold sm:text-3xl">Vehicles</h1>
        <p className="mt-1 max-w-md text-sm text-white/75">
          Cars, trucks and more across Liberia — search by make, year, price and condition.
        </p>
        <div className="mt-4">
          <Button href="/listing/new" variant="secondary" size="md">+ Sell your vehicle</Button>
        </div>
      </section>

      {/* Featured (only on the unfiltered view) */}
      {!hasFilters && featured.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 text-lg font-semibold">⭐ Featured vehicles</h2>
          <ListingGrid listings={featured} />
        </section>
      )}

      {/* Filters */}
      <section className="mt-6">
        <VehicleFilters />
      </section>

      {/* Results */}
      <section className="mt-6">
        <h2 className="mb-3 text-lg font-semibold">
          {results.length} {results.length === 1 ? "vehicle" : "vehicles"}
          {hasFilters ? " match your filters" : " available"}
        </h2>
        {results.length > 0 ? (
          <ListingGrid listings={results} />
        ) : (
          <EmptyState
            icon="🚗"
            title="No vehicles found"
            description={hasFilters ? "Try widening your filters." : "Be the first to list a vehicle."}
          />
        )}
      </section>
    </div>
  );
}
