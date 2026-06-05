import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { getBusinesses } from "@/lib/firestore/users";

export const dynamic = "force-dynamic";

export default async function BusinessesPage() {
  const businesses = await getBusinesses();
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <h1 className="text-xl font-bold">🏢 Businesses</h1>
      <p className="mt-1 text-sm text-muted">Verified shops and companies on AfroSmart.</p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {businesses.map((b) => (
          <li key={b.id}>
            <Link
              href={`/u/${b.id}`}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 hover:bg-surface"
            >
              <Avatar name={b.displayName} />
              <div>
                <p className="flex items-center gap-2 font-medium">
                  {b.displayName} <Badge tone="accent">Business</Badge>
                </p>
                <p className="text-xs text-muted">
                  ⭐ {b.ratingAvg.toFixed(1)} ({b.ratingCount}) · {b.city}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
