import { notFound } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { isFounder } from "@/lib/founder";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { StarRating } from "@/components/rating/StarRating";
import { RateUserForm } from "@/components/rating/RateUserForm";
import { ReportDialog } from "@/components/report/ReportDialog";
import { getPublicProfile } from "@/lib/firestore/users";
import { getListingsBySeller } from "@/lib/firestore/listings";
import { getRatings } from "@/lib/firestore/ratings";
import { hasUnlockedThreadBetween } from "@/lib/firestore/threads";
import { getCurrentUser } from "@/lib/auth/dal";

export const dynamic = "force-dynamic";

export default async function ProfilePage({ params }: PageProps<"/u/[id]">) {
  const { id } = await params;
  const user = await getPublicProfile(id);
  if (!user) notFound();

  const [listings, ratings, me] = await Promise.all([
    getListingsBySeller(user.id).then((all) => all.filter((l) => l.status === "active")),
    getRatings(user.id),
    getCurrentUser(),
  ]);
  // Eligible to rate only if the viewer has an unlocked conversation with them.
  const canRate =
    me && me.uid !== user.id ? await hasUnlockedThreadBetween(me.uid, user.id) : false;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <div className="flex items-center gap-4">
        <Avatar name={user.displayName} size="lg" />
        <div>
          <h1 className="flex flex-wrap items-center gap-2 text-xl font-bold">
            {user.displayName}
            {isFounder(user.id) ? (
              <VerifiedBadge kind="founder" />
            ) : user.verified ? (
              <VerifiedBadge kind={user.verifiedType === "business" ? "business" : "seller"} />
            ) : null}
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
            <StarRating value={user.ratingAvg} />
            {user.ratingAvg.toFixed(1)} · {user.ratingCount} ratings
          </p>
          <p className="text-sm text-muted">
            📍 {user.city}, {user.county}
            {user.joinedAt && <> · Joined {new Date(user.joinedAt).getFullYear()}</>}
          </p>
        </div>
      </div>

      <h2 className="mb-3 mt-8 text-lg font-semibold">
        Listings ({listings.length})
      </h2>
      {listings.length > 0 ? (
        <ListingGrid listings={listings} />
      ) : (
        <EmptyState icon="📦" title="No active listings" />
      )}

      {/* Reviews */}
      <h2 className="mb-3 mt-10 text-lg font-semibold">Ratings & reviews</h2>
      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-3">
          {ratings.length > 0 ? (
            ratings.map((r) => (
              <div key={r.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{r.raterName}</span>
                  <StarRating value={r.stars} />
                </div>
                {r.comment && <p className="mt-1 text-sm text-muted">{r.comment}</p>}
              </div>
            ))
          ) : (
            <EmptyState icon="⭐" title="No ratings yet" description="Be the first to rate." />
          )}
        </div>
        <div className="flex flex-col gap-3">
          <RateUserForm rateeId={user.id} canRate={canRate} />
          <ReportDialog targetType="user" targetId={user.id} label="Report this user" />
        </div>
      </div>
    </div>
  );
}
