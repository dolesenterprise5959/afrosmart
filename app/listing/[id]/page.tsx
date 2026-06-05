import Link from "next/link";
import { notFound } from "next/navigation";
import { ListingGallery } from "@/components/listing/ListingGallery";
import { VehicleSpecs } from "@/components/listing/VehicleSpecs";
import { PropertySpecs } from "@/components/listing/PropertySpecs";
import { PriceTag } from "@/components/ui/PriceTag";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { isFounder } from "@/lib/founder";
import { MessageSellerButton } from "@/components/messaging/MessageSellerButton";
import { SaveButton } from "@/components/listing/SaveButton";
import { ReportDialog } from "@/components/report/ReportDialog";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { getCategory } from "@/lib/mock";
import { getListing } from "@/lib/firestore/listings";
import { getPublicProfile } from "@/lib/firestore/users";
import { getCurrentUser } from "@/lib/auth/dal";

export const dynamic = "force-dynamic";

export default async function ListingDetailPage({
  params,
}: PageProps<"/listing/[id]">) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) notFound();

  const [seller, me] = await Promise.all([
    getPublicProfile(listing.sellerId),
    getCurrentUser(),
  ]);
  const category = getCategory(listing.category);
  const isOwner = me?.uid === listing.sellerId;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-5">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Marketplace", href: "/marketplace" },
          ...(category
            ? [{ label: category.label, href: `/marketplace/${category.id}` }]
            : []),
          { label: listing.title },
        ]}
      />

      <div className="mt-3 grid gap-6 md:grid-cols-2">
        {/* Gallery */}
        <ListingGallery photos={listing.photos} category={listing.category} />

        {/* Details */}
        <div className="flex flex-col gap-4">
          <div>
            {category && <Badge tone="brand">{category.icon} {category.label}</Badge>}
            <h1 className="mt-2 text-2xl font-bold leading-tight">{listing.title}</h1>
            <PriceTag amount={listing.price} className="mt-1 block text-2xl" />
            <p className="mt-1 text-sm text-muted">
              📍 {listing.city}, {listing.county} County
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-muted">Description</h2>
            <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">
              {listing.description}
            </p>
          </div>

          {listing.vehicle && (
            <div>
              <h2 className="mb-1.5 text-sm font-semibold text-muted">Vehicle details</h2>
              <VehicleSpecs vehicle={listing.vehicle} />
            </div>
          )}

          {listing.property && (
            <div>
              <h2 className="mb-1.5 text-sm font-semibold text-muted">Property details</h2>
              <PropertySpecs property={listing.property} />
            </div>
          )}

          {/* Seller */}
          {seller && (
            <Link
              href={`/u/${seller.id}`}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 hover:bg-surface"
            >
              <Avatar name={seller.displayName} />
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-1.5 font-medium">
                  {seller.displayName}
                  {isFounder(seller.id) ? (
                    <VerifiedBadge kind="founder" label="Founder" />
                  ) : seller.verified ? (
                    <VerifiedBadge
                      kind={seller.verifiedType === "business" ? "business" : "seller"}
                      label={seller.verifiedType === "business" ? "Business" : "Verified"}
                    />
                  ) : null}
                </p>
                <p className="text-xs text-muted">
                  ⭐ {seller.ratingAvg.toFixed(1)} ({seller.ratingCount}) · {seller.city}
                </p>
              </div>
              <span className="ml-auto text-muted">›</span>
            </Link>
          )}

          {/* Actions */}
          {isOwner ? (
            <div className="rounded-2xl border border-border bg-surface p-4 text-sm text-muted">
              This is your listing.{" "}
              <Link href="/dashboard" className="font-medium text-brand">
                Manage it →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <MessageSellerButton listingId={listing.id} />
              <div className="flex gap-2">
                <span className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-border bg-surface text-sm font-medium text-muted">
                  🔒 Call unlocks in chat
                </span>
                <SaveButton
                  listing={{
                    id: listing.id,
                    title: listing.title,
                    price: listing.price,
                    photo: listing.photos[0] ?? "",
                    category: listing.category,
                    county: listing.county,
                    city: listing.city,
                  }}
                />
              </div>
              <p className="text-center text-xs text-muted">
                For your safety, the phone number unlocks inside the chat after you
                message the seller and they reply.
              </p>
            </div>
          )}

          {/* Report */}
          {!isOwner && (
            <ReportDialog targetType="listing" targetId={listing.id} label="Report this listing" />
          )}
        </div>
      </div>
    </div>
  );
}
