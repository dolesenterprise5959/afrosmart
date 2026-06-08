// TEMPORARY diagnostic route — public render of the posting wizard to inspect the
// LIVE vehicle dropdowns without auth. Removed immediately after diagnosis.
import { ListingWizard } from "@/components/listing/ListingWizard";

export default function DiagPage() {
  return (
    <div>
      <p data-diag-marker="vehicle-dropdowns-build-v9">DIAG: vehicle-dropdowns build marker</p>
      <ListingWizard />
    </div>
  );
}
