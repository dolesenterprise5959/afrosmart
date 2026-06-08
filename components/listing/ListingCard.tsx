import Link from "next/link";
import { ListingImage } from "@/components/listing/ListingImage";
import { ConvertedPrice } from "@/components/listing/ConvertedPrice";
import { Badge } from "@/components/ui/Badge";
import { isFreeStuffCategory } from "@/lib/categories";
import type { Listing } from "@/lib/types";

export function ListingCard({ listing }: { listing: Listing }) {
  // Free giveaways get a green FREE badge; either the category or a 0 price qualifies.
  const isFree = isFreeStuffCategory(listing.category) || !listing.price || listing.price <= 0;
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
        {isFree && (
          <span className="absolute left-2 top-2 rounded-full bg-success px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-white shadow-sm">
            Free
          </span>
        )}
        {listing.featured && (
          <span className={isFree ? "absolute right-2 top-2" : "absolute left-2 top-2"}>
            <Badge tone="accent">⭐ Featured</Badge>
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-foreground group-hover:text-brand-dark">
          {listing.title}
        </h3>
        <ConvertedPrice amount={listing.price} currency={listing.currency} className="text-xl" />
        <p className="mt-auto flex items-center gap-1.5 pt-1.5 text-[13px] text-muted">
          <span className="truncate">📍 {listing.city}, {listing.county}</span>
          {listing.sellerType === "business" && (
            <span className="shrink-0 rounded bg-brand/10 px-1 font-medium text-brand-dark">🏢</span>
          )}
        </p>
      </div>
    </Link>
  );
}
