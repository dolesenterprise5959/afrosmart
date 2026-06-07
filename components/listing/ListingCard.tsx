import Link from "next/link";
import { ListingImage } from "@/components/listing/ListingImage";
import { ConvertedPrice } from "@/components/listing/ConvertedPrice";
import { Badge } from "@/components/ui/Badge";
import type { Listing } from "@/lib/types";

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
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
        <ConvertedPrice amount={listing.price} currency={listing.currency} className="text-base" />
        <p className="mt-auto flex items-center gap-1.5 pt-1 text-xs text-muted">
          <span className="truncate">📍 {listing.city}, {listing.county}</span>
          {listing.sellerType === "business" && (
            <span className="shrink-0 rounded bg-brand/10 px-1 font-medium text-brand-dark">🏢</span>
          )}
        </p>
      </div>
    </Link>
  );
}
