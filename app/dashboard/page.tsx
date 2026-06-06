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
    verified: false, verifiedType: null, plan: "free" as const, joinedAt: "",
  };
  const plan = me.plan ?? "free";
  const memberSince = me.joinedAt
    ? new Date(me.joinedAt).toLocaleDateString(undefined, { month: "short", year: "numeric" })
    : null;
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
      {/* Premium profile header */}
      <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="bg-gradient-to-br from-neutral-900 to-black px-5 py-6 text-white sm:px-7">
          <div className="flex items-center gap-4">
            <span className="rounded-full ring-2 ring-accent/40">
              <Avatar name={me.displayName} size="lg" />
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="flex flex-wrap items-center gap-2 text-xl font-bold leading-tight">
                {me.displayName}
                {me.verified && (
                  <VerifiedBadge kind={me.verifiedType === "business" ? "business" : "seller"} />
                )}
                {plan !== "free" && (
                  <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-semibold text-accent ring-1 ring-accent/30">
                    {planInfo(plan).name}
                  </span>
                )}
              </h1>
              <p className="mt-0.5 truncate text-sm text-white/70">
                📍 {me.city || "Liberia"}{me.county ? `, ${me.county}` : ""}
                {memberSince && <> · Member since {memberSince}</>}
              </p>
            </div>
            <Button href="/settings" variant="secondary" size="sm">Settings</Button>
          </div>

          {/* Key counts */}
          <div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/10 pt-4 text-center">
            <div>
              <p className="text-xl font-bold">{analytics.activeListings.toLocaleString()}</p>
              <p className="text-[11px] uppercase tracking-wide text-white/55">Listings</p>
            </div>
            <div>
              <p className="text-xl font-bold">{analytics.messagesReceived.toLocaleString()}</p>
              <p className="text-[11px] uppercase tracking-wide text-white/55">Messages</p>
            </div>
            <div>
              <p className="text-xl font-bold">{analytics.profileViews.toLocaleString()}</p>
              <p className="text-[11px] uppercase tracking-wide text-white/55">Profile views</p>
            </div>
          </div>
        </div>

        {/* Status strip */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-3 text-sm sm:px-7">
          <span>
            <span className="text-muted">Verification: </span>
            <span className="font-semibold">{me.verified ? "Verified ✓" : "Not verified"}</span>
            {!me.verified && <Link href="/verify" className="ml-2 font-medium text-brand">Get verified</Link>}
          </span>
          <span>
            <span className="text-muted">Membership: </span>
            <span className="font-semibold">{planInfo(plan).name}</span>
            {plan === "free" && <Link href="/pricing" className="ml-2 font-medium text-brand">Upgrade</Link>}
          </span>
          <span className="ml-auto text-muted">⭐ {me.ratingAvg.toFixed(1)} ({me.ratingCount})</span>
        </div>
      </section>

      {/* Business analytics */}
      <div className="mt-8 flex items-center gap-2">
        <h2 className="text-lg font-semibold">Business analytics</h2>
        <Badge tone="brand">Business</Badge>
      </div>

      {showAnalytics ? (
        <>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {metrics.map((m) => (
              <div key={m.label} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <p className="text-2xl font-bold">{m.value.toLocaleString()}</p>
                <p className="mt-0.5 text-xs text-muted">{m.icon} {m.label}</p>
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
