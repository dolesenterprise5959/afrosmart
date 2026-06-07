import { ListingWizard } from "@/components/listing/ListingWizard";

export const dynamic = "force-dynamic";

// Fast, mobile-first listing creation (category → photos → details → review).
export default function NewListingPage() {
  return <ListingWizard />;
}
