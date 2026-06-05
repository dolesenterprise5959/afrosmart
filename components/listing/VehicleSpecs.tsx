import type { Vehicle } from "@/lib/types";
import { conditionLabel, fuelLabel, transmissionLabel } from "@/lib/vehicles";

/** Spec table for a vehicle listing (shown on the listing detail page). */
export function VehicleSpecs({ vehicle }: { vehicle: Vehicle }) {
  const rows: [string, string][] = [
    ["Make", vehicle.make || "—"],
    ["Model", vehicle.model || "—"],
    ["Year", vehicle.year ? String(vehicle.year) : "—"],
    ["Mileage", vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : "—"],
    ["Condition", conditionLabel(vehicle.condition)],
    ["Fuel", fuelLabel(vehicle.fuelType)],
    ["Transmission", transmissionLabel(vehicle.transmission)],
    ["Exterior", vehicle.exteriorColor || "—"],
    ["Interior", vehicle.interiorColor || "—"],
    ...(vehicle.vin ? ([["VIN", vehicle.vin]] as [string, string][]) : []),
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
