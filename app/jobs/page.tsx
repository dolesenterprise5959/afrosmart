import { ListingGrid } from "@/components/listing/ListingGrid";
import { getListingsByCategory } from "@/lib/firestore/listings";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const jobs = await getListingsByCategory("jobs");
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <h1 className="text-xl font-bold">💼 Jobs</h1>
      <p className="mt-1 text-sm text-muted">Find work and hire across Liberia.</p>
      <div className="mt-6">
        <ListingGrid listings={jobs} />
      </div>
    </div>
  );
}
