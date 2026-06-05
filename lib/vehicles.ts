// Shared vehicle catalog — option lists for the create form, filters and labels.

import type { FuelType, Transmission, VehicleCondition } from "@/lib/types";

export const VEHICLE_CONDITIONS: { id: VehicleCondition; label: string }[] = [
  { id: "new", label: "New" },
  { id: "certified", label: "Certified pre-owned" },
  { id: "used", label: "Used" },
];

export const FUEL_TYPES: { id: FuelType; label: string }[] = [
  { id: "petrol", label: "Petrol" },
  { id: "diesel", label: "Diesel" },
  { id: "hybrid", label: "Hybrid" },
  { id: "electric", label: "Electric" },
  { id: "other", label: "Other" },
];

export const TRANSMISSIONS: { id: Transmission; label: string }[] = [
  { id: "automatic", label: "Automatic" },
  { id: "manual", label: "Manual" },
];

export const POPULAR_MAKES = [
  "Toyota", "Nissan", "Honda", "Kia", "Hyundai", "Ford", "Mercedes-Benz",
  "BMW", "Mitsubishi", "Mazda", "Lexus", "Land Rover", "Other",
];

export const VEHICLE_OLDEST_YEAR = 1980;
export const VEHICLE_NEWEST_YEAR = new Date().getFullYear() + 1;

const label = <T extends string>(opts: { id: T; label: string }[], id: T) =>
  opts.find((o) => o.id === id)?.label ?? id;

export const conditionLabel = (id: VehicleCondition) => label(VEHICLE_CONDITIONS, id);
export const fuelLabel = (id: FuelType) => label(FUEL_TYPES, id);
export const transmissionLabel = (id: Transmission) => label(TRANSMISSIONS, id);
