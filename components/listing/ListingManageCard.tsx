import { ListingCard } from "@/components/listing/ListingCard";
import { ListingMenu } from "@/components/listing/ListingMenu";
import type { Listing } from "@/lib/types";

// Server component: a normal (server-rendered) listing card + status badge, with
// the owner-only ⋮ menu (client) overlaid. Used in My Account → My Listings.
export function ListingManageCard({ listing }: { listing: Listing }) {
  const status = listing.status;
  const badge =
    status === "sold" ? { label: "Sold", cls: "bg-success/20 text-success" }
    : status === "paused" ? { label: "Paused", cls: "bg-accent/25 text-amber-700" }
    : null;

  return (
    <div className="relative">
      <div className={status !== "active" ? "opacity-70" : ""}>
        <ListingCard listing={listing} />
      </div>
      {badge && (
        <span className={`absolute left-2 top-2 z-10 rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge.cls}`}>
          {badge.label}
        </span>
      )}
      <ListingMenu id={listing.id} status={status} />
    </div>
  );
}
