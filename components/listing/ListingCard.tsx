import Link from "next/link";
import { ListingImage } from "@/components/listing/ListingImage";
import { PriceTag } from "@/components/ui/PriceTag";
import { Badge } from "@/components/ui/Badge";
import type { Listing } from "@/lib/types";

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/3]">
        <ListingImage
          photo={listing.photos[0]}
          category={listing.category}
          alt={listing.title}
          className="h-full w-full"
        />
        {listing.featured && (
          <span className="absolute left-2 top-2">
            <Badge tone="accent">⭐ Featured</Badge>
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-medium text-foreground group-hover:text-brand-dark">
          {listing.title}
        </h3>
        <div className="flex items-baseline gap-1.5">
          <PriceTag amount={listing.price} currency={listing.currency} className="text-base" />
          {listing.price > 0 && (
            <span className="rounded bg-surface px-1 text-[10px] font-semibold text-muted">
              {listing.currency ?? "LRD"}
            </span>
          )}
        </div>
        <p className="mt-auto pt-1 text-xs text-muted">
          📍 {listing.city}, {listing.county}
        </p>
      </div>
    </Link>
  );
}
