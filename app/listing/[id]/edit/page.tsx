import { notFound, redirect } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { EditListingForm } from "@/components/listing/EditListingForm";
import { verifySession } from "@/lib/auth/dal";
import { getListing } from "@/lib/firestore/listings";

export const dynamic = "force-dynamic";

export default async function EditListingPage({ params }: PageProps<"/listing/[id]/edit">) {
  const { id } = await params;
  const session = await verifySession(); // redirects to /login if signed out
  const listing = await getListing(id);
  if (!listing) notFound();
  if (listing.sellerId !== session.uid) redirect(`/listing/${id}`); // owner only

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-6">
      <Breadcrumbs
        items={[
          { label: "My account", href: "/dashboard" },
          { label: listing.title, href: `/listing/${id}` },
          { label: "Edit" },
        ]}
      />
      <h1 className="mt-2 text-xl font-bold">Edit listing</h1>
      <EditListingForm
        id={id}
        initial={{
          title: listing.title,
          description: listing.description,
          price: String(listing.price),
          currency: listing.currency ?? "LRD",
          county: listing.county,
          city: listing.city,
        }}
      />
    </div>
  );
}
