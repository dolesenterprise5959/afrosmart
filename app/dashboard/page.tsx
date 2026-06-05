import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { verifySession } from "@/lib/auth/dal";
import { getListingsBySeller } from "@/lib/firestore/listings";
import { getPublicProfile } from "@/lib/firestore/users";

export const dynamic = "force-dynamic";

// Signed-in seller's account view. Auth is enforced server-side via the DAL.
// Profile + listings come from Firestore, keyed on the authenticated user's uid.
export default async function DashboardPage() {
  const session = await verifySession();
  const [profile, myListings] = await Promise.all([
    getPublicProfile(session.uid),
    getListingsBySeller(session.uid),
  ]);

  // A brand-new user (hasn't posted yet) may not have a profile doc.
  const me = profile ?? {
    displayName: session.phone ? `User ${session.phone.slice(-4)}` : "AfroSmart user",
    city: "",
    county: "",
    isBusiness: false,
    ratingAvg: 0,
    ratingCount: 0,
  };
  const activeCount = myListings.filter((l) => l.status === "active").length;

  const stats = [
    { label: "Active listings", value: activeCount },
    { label: "Rating", value: `⭐ ${me.ratingAvg.toFixed(1)}` },
    { label: "Reviews", value: me.ratingCount },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <div className="flex items-center gap-4">
        <Avatar name={me.displayName} size="lg" />
        <div className="flex-1">
          <h1 className="text-xl font-bold">{me.displayName}</h1>
          <p className="text-sm text-muted">
            📍 {me.city}, {me.county}
            {session.phone && <> · {session.phone}</>}
          </p>
        </div>
        <Button href="/settings" variant="outline" size="sm">
          Settings
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-4 text-center">
            <p className="text-lg font-bold">{s.value}</p>
            <p className="text-xs text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">My listings</h2>
        <Button href="/listing/new" size="sm">+ Post</Button>
      </div>
      <ListingGrid listings={myListings} />

      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link href="/saved" className="text-brand">♡ Saved listings</Link>
        <Link href="/messages" className="text-brand">💬 Messages</Link>
        {me.isBusiness && <Badge tone="accent">Business account</Badge>}
      </div>
    </div>
  );
}
