import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { verifySession } from "@/lib/auth/dal";
import { getListingsBySeller } from "@/lib/firestore/listings";
import { getPublicProfile } from "@/lib/firestore/users";
import { getBusinessAnalytics } from "@/lib/firestore/analytics";
import { planInfo } from "@/lib/premium";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await verifySession();
  const [profile, myListings, analytics] = await Promise.all([
    getPublicProfile(session.uid),
    getListingsBySeller(session.uid),
    getBusinessAnalytics(session.uid),
  ]);

  const me = profile ?? {
    displayName: session.phone ? `User ${session.phone.slice(-4)}` : "AfroSmart user",
    city: "", county: "", isBusiness: false, ratingAvg: 0, ratingCount: 0,
    verified: false, verifiedType: null, plan: "free" as const,
  };
  const plan = me.plan ?? "free";
  const showAnalytics = plan === "business" || plan === "premium";

  const metrics = [
    { label: "Listing views", value: analytics.totalViews, icon: "👁️" },
    { label: "Listing clicks", value: analytics.totalClicks, icon: "👆" },
    { label: "Messages received", value: analytics.messagesReceived, icon: "💬" },
    { label: "Active listings", value: analytics.activeListings, icon: "📦" },
    { label: "Saved by buyers", value: analytics.savedCount, icon: "♥" },
    { label: "Profile views", value: analytics.profileViews, icon: "🧑" },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <div className="flex items-center gap-4">
        <Avatar name={me.displayName} size="lg" />
        <div className="flex-1">
          <h1 className="flex flex-wrap items-center gap-2 text-xl font-bold">
            {me.displayName}
            {me.verified && (
              <VerifiedBadge kind={me.verifiedType === "business" ? "business" : "seller"} />
            )}
          </h1>
          <p className="text-sm text-muted">
            📍 {me.city}, {me.county}
          </p>
        </div>
        <Button href="/settings" variant="outline" size="sm">Settings</Button>
      </div>

      {/* Status row */}
      <div className="mt-5 flex flex-wrap gap-3">
        <div className="rounded-2xl border border-border bg-card px-4 py-3 text-sm">
          <span className="text-muted">Verification: </span>
          <span className="font-semibold">{me.verified ? "Verified ✓" : "Not verified"}</span>
          {!me.verified && <Link href="/verify" className="ml-2 text-brand">Get verified</Link>}
        </div>
        <div className="rounded-2xl border border-border bg-card px-4 py-3 text-sm">
          <span className="text-muted">Membership: </span>
          <span className="font-semibold">{planInfo(plan).name}</span>
          {plan === "free" && <Link href="/pricing" className="ml-2 text-brand">Upgrade</Link>}
        </div>
      </div>

      {/* Business analytics */}
      <div className="mt-8 flex items-center gap-2">
        <h2 className="text-lg font-semibold">Business analytics</h2>
        <Badge tone="brand">Business</Badge>
      </div>

      {showAnalytics ? (
        <>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {metrics.map((m) => (
              <div key={m.label} className="rounded-2xl border border-border bg-card p-4">
                <p className="text-2xl font-bold">{m.value.toLocaleString()}</p>
                <p className="text-xs text-muted">{m.icon} {m.label}</p>
              </div>
            ))}
          </div>
          <h3 className="mb-2 mt-6 text-sm font-semibold text-muted">Listing performance (views)</h3>
          <PerformanceChart data={analytics.perListing} />
        </>
      ) : (
        <div className="mt-3 rounded-2xl border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted">
            Listing views, clicks, saves and a performance chart are part of the{" "}
            <span className="font-semibold text-foreground">Business</span> plan.
          </p>
          <div className="mt-3">
            <Button href="/pricing" size="md">See plans</Button>
          </div>
        </div>
      )}

      {/* My listings */}
      <div className="mt-8 mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">My listings ({analytics.activeListings})</h2>
        <Button href="/listing/new" size="sm">+ Post</Button>
      </div>
      <ListingGrid listings={myListings} />

      <div className="mt-8 flex flex-wrap gap-4 text-sm">
        <Link href="/saved" className="text-brand">♡ Saved listings</Link>
        <Link href="/messages" className="text-brand">💬 Messages</Link>
      </div>
    </div>
  );
}
