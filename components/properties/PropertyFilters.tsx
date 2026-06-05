"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { LISTING_TYPES, PROPERTY_TYPES } from "@/lib/properties";

export const PROPERTY_SORTS = [
  { id: "newest", label: "Newest" },
  { id: "price-asc", label: "Price: low → high" },
  { id: "price-desc", label: "Price: high → low" },
  { id: "beds-desc", label: "Most bedrooms" },
  { id: "area-desc", label: "Largest area" },
];

const field = "h-10 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-brand";

export function PropertyFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const get = (k: string) => params.get(k) ?? "";

  function apply(next: Record<string, string>) {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v) sp.set(k, v);
      else sp.delete(k);
    }
    router.push(`/properties?${sp.toString()}`);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    apply({
      q: String(f.get("q") ?? ""),
      listingType: String(f.get("listingType") ?? ""),
      propertyType: String(f.get("propertyType") ?? ""),
      minBeds: String(f.get("minBeds") ?? ""),
      minBaths: String(f.get("minBaths") ?? ""),
      minPrice: String(f.get("minPrice") ?? ""),
      maxPrice: String(f.get("maxPrice") ?? ""),
    });
  }

  const hasFilters = ["q", "listingType", "propertyType", "minBeds", "minBaths", "minPrice", "maxPrice"].some((k) => get(k));

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-border bg-card p-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <input name="q" defaultValue={get("q")} className={`${field} col-span-2 sm:col-span-3 lg:col-span-2`} placeholder="Search area, title…" />
        <select name="listingType" defaultValue={get("listingType")} className={field}>
          <option value="">Sale &amp; Rent</option>
          {LISTING_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
        <select name="propertyType" defaultValue={get("propertyType")} className={field}>
          <option value="">Any type</option>
          {PROPERTY_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
        <select name="minBeds" defaultValue={get("minBeds")} className={field}>
          <option value="">Any beds</option>
          {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+ beds</option>)}
        </select>
        <select name="minBaths" defaultValue={get("minBaths")} className={field}>
          <option value="">Any baths</option>
          {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}+ baths</option>)}
        </select>
        <input name="minPrice" defaultValue={get("minPrice")} type="number" className={field} placeholder="Min price L$" />
        <input name="maxPrice" defaultValue={get("maxPrice")} type="number" className={field} placeholder="Max price L$" />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="submit" className="h-10 rounded-full bg-brand px-5 text-sm font-medium text-brand-foreground hover:bg-brand-dark">
          Apply filters
        </button>
        {hasFilters && (
          <button type="button" onClick={() => router.push("/properties")} className="h-10 rounded-full border border-border px-4 text-sm font-medium">
            Clear
          </button>
        )}
        <label className="ml-auto flex items-center gap-2 text-sm">
          <span className="text-muted">Sort</span>
          <select
            defaultValue={get("sort") || "newest"}
            onChange={(e) => apply({ sort: e.target.value })}
            className="h-10 rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-brand"
          >
            {PROPERTY_SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
      </div>
    </form>
  );
}
