import type { Property } from "@/lib/types";
import { listingTypeLabel, propertyTypeLabel, ROOMLESS_TYPES } from "@/lib/properties";

/** Spec table for a property listing (shown on the listing detail page). */
export function PropertySpecs({ property }: { property: Property }) {
  const roomless = ROOMLESS_TYPES.includes(property.propertyType);
  const rows: [string, string][] = [
    ["Listing", listingTypeLabel(property.listingType)],
    ["Type", propertyTypeLabel(property.propertyType)],
    ...(!roomless
      ? ([
          ["Bedrooms", String(property.bedrooms)],
          ["Bathrooms", String(property.bathrooms)],
        ] as [string, string][])
      : []),
    ...(property.squareFeet
      ? ([["Floor area", `${property.squareFeet.toLocaleString()} sq ft`]] as [string, string][])
      : []),
    ...(property.landSize
      ? ([["Land size", `${property.landSize.toLocaleString()} sq ft`]] as [string, string][])
      : []),
  ];

  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-2xl border border-border bg-card p-4 text-sm sm:grid-cols-3">
      {rows.map(([k, v]) => (
        <div key={k} className="min-w-0">
          <dt className="text-xs text-muted">{k}</dt>
          <dd className="truncate font-medium">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
