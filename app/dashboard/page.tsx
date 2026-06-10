import Link from "next/link";
import { Eye, MousePointerClick, MessageCircle, Package, Heart, UserRound, Wallet } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { ListingManageCard } from "@/components/listing/ListingManageCard";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { verifySession } from "@/lib/auth/dal";
import { getListingsBySeller } from "@/lib/firestore/listings";
import { getPublicProfile } from "@/lib/firestore/users";
import { getBusinessAnalytics } from "@/lib/firestore/analytics";
import { planInfo } from "@/lib/premium";

import { MapPin } from "lucide-react";
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await verifySession();
  const [profile, myListings, analytics] = await Promise.all([
    getPublicProfile(session.uid),
    getListingsBySeller(session.uid),
    getBusinessAnalytics(session.uid),
  ]);

  const me = profile ?? {
    displayName: "AfroSmart user",
    firstName: "", photoURL: undefined as string | undefined, phoneVerified: true,
    city: "", county: "", isBusiness: false, ratingAvg: 0, ratingCount: 0,
    verified: false, verifiedType: null, plan: "free" as const, joinedAt: "",
  };
  const plan = me.plan ?? "free";
  const memberSince = me.joinedAt
    ? new Date(me.joinedAt).toLocaleDateString(undefined, { month: "short", year: "numeric" })
    : null;
  const showAnalytics = plan === "business" || plan === "premium";

  const metrics = [
    { label: "Listing views", value: analytics.totalViews, Icon: Eye },
    { label: "Listing clicks", value: analytics.totalClicks, Icon: MousePointerClick },
    { label: "Messages received", value: analytics.messagesReceived, Icon: MessageCircle },
    { label: "Active listings", value: analytics.activeListings, Icon: Package },
    { label: "Saved by buyers", value: analytics.savedCount, Icon: Heart },
    { label: "Profile views", value: analytics.profileViews, Icon: UserRound },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      {/* Premium profile header */}
      <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="bg-gradient-to-br from-neutral-900 to-black px-5 py-6 text-white sm:px-7">
          <div className="flex items-center gap-4">
            <span className="rounded-full ring-2 ring-accent/40">
              <Avatar name={me.displayName} photoURL={me.photoURL} size="lg" />
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-bold leading-tight">{me.displayName}</h1>
              <p className="mt-0.5 truncate text-sm text-white/70">
                <MapPin className="mr-1 inline h-4 w-4 align-text-bottom" />{me.city || "Liberia"}{me.county ? `, ${me.county}` : ""}
                {memberSince && <> · Member since {memberSince}</>}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {me.phoneVerified && <VerifiedBadge kind="phone" label="Phone Verified" />}
                {me.verified && (
                  <VerifiedBadge kind={me.verifiedType === "business" ? "business" : "seller"} />
                )}
                {plan !== "free" && (
                  <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-semibold text-accent ring-1 ring-accent/30">
                    {planInfo(plan).name}
                  </span>
                )}
              </div>
            </div>
            <Button href="/settings" variant="secondary" size="sm">Settings</Button>
          </div>

          {/* Key counts — listings, saved, messages */}
          <div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/10 pt-4 text-center">
            <div>
              <p className="text-xl font-bold">{analytics.activeListings.toLocaleString()}</p>
              <p className="text-[11px] uppercase tracking-wide text-white/55">Listings</p>
            </div>
            <div>
              <p className="text-xl font-bold">{analytics.savedCount.toLocaleString()}</p>
              <p className="text-[11px] uppercase tracking-wide text-white/55">Saved</p>
            </div>
            <div>
              <p className="text-xl font-bold">{analytics.messagesReceived.toLocaleString()}</p>
              <p className="text-[11px] uppercase tracking-wide text-white/55">Messages</p>
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
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted"><m.Icon className="h-3.5 w-3.5" /> {m.label}</p>
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

      {/* My listings — manage each via the ⋮ menu */}
      <div className="mt-8 mb-1 flex items-center justify-between">
        <h2 className="text-lg font-semibold">My listings ({myListings.length})</h2>
        <Button href="/listing/new" size="sm">+ Post</Button>
      </div>
      <p className="mb-3 text-xs text-muted">Tap ⋮ on a listing to edit, mark as sold, pause, or delete.</p>
      {myListings.length > 0 ? (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
          {myListings.map((l) => <ListingManageCard key={l.id} listing={l} />)}
        </div>
      ) : (
        <p className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted">
          You haven&apos;t posted anything yet. <Link href="/listing/new" className="font-medium text-brand">Post your first listing →</Link>
        </p>
      )}

      <div className="mt-8 flex flex-wrap gap-4 text-sm">
        <Link href="/wallet" className="inline-flex items-center gap-1.5 text-brand"><Wallet className="h-4 w-4" /> Wallet &amp; referrals</Link>
        <Link href="/saved" className="inline-flex items-center gap-1.5 text-brand"><Heart className="h-4 w-4" /> Saved listings</Link>
        <Link href="/messages" className="inline-flex items-center gap-1.5 text-brand"><MessageCircle className="h-4 w-4" /> Messages</Link>
      </div>
    </div>
  );
}
