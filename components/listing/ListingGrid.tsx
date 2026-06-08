import { ListingCard } from "@/components/listing/ListingCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import type { Listing } from "@/lib/types";

export function ListingGrid({
  listings,
  emptyTitle = "No listings yet",
  emptyDescription = "Be the first to post.",
  emptyIcon = "🛍️",
  showPostAction = true,
}: {
  listings: Listing[];
  /** Copy shown when there are no listings (defaults to the standard prompt). */
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: string;
  /** Show the "+ Post a listing" button in the empty state. */
  showPostAction?: boolean;
}) {
  if (listings.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
        action={showPostAction ? <Button href="/listing/new">+ Post a listing</Button> : undefined}
      />
    );
  }
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
