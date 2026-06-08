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

// Common models per make (Liberia-relevant). Drives the dependent Model dropdown
// on the create form: pick a Make → its models appear. Makes without a list (or
// "Other") fall back to free text, and every list offers an "Other" escape.
export const MODELS_BY_MAKE: Record<string, string[]> = {
  Toyota: ["Corolla", "Camry", "RAV4", "Hilux", "Land Cruiser", "Land Cruiser Prado", "Yaris", "Highlander", "Avalon", "Tacoma", "Tundra", "4Runner", "Sienna", "Fortuner"],
  Nissan: ["Altima", "Sentra", "Rogue", "Pathfinder", "Patrol", "Frontier", "Murano", "Maxima", "Versa", "X-Trail", "Navara"],
  Honda: ["Civic", "Accord", "CR-V", "Pilot", "Fit", "HR-V", "Odyssey", "Ridgeline", "City"],
  Kia: ["Rio", "Sportage", "Sorento", "Optima", "Soul", "Picanto", "Cerato", "Seltos", "Carnival"],
  Hyundai: ["Elantra", "Sonata", "Tucson", "Santa Fe", "Accent", "Creta", "Palisade", "i10"],
  Ford: ["F-150", "Explorer", "Escape", "Focus", "Ranger", "Edge", "Expedition", "Fusion", "Mustang"],
  "Mercedes-Benz": ["C-Class", "E-Class", "S-Class", "GLE", "GLC", "ML", "GLK", "Sprinter", "A-Class"],
  BMW: ["3 Series", "5 Series", "7 Series", "X1", "X3", "X5", "X6", "328i", "528i"],
  Mitsubishi: ["Pajero", "Outlander", "Lancer", "L200", "Montero", "ASX", "Mirage"],
  Mazda: ["Mazda3", "Mazda6", "CX-5", "CX-7", "CX-9", "BT-50", "Demio"],
  Lexus: ["RX", "ES", "GX", "LX", "IS", "NX"],
  "Land Rover": ["Range Rover", "Range Rover Sport", "Discovery", "Defender", "Freelander", "Evoque"],
};

/** Models for a make (empty when unknown / "Other" → caller uses free text). */
export const modelsForMake = (make: string): string[] => MODELS_BY_MAKE[make] ?? [];

export const VEHICLE_OLDEST_YEAR = 1980;
export const VEHICLE_NEWEST_YEAR = new Date().getFullYear() + 1;

/** Years newest→oldest for the Year dropdown. */
export const VEHICLE_YEARS: number[] = Array.from(
  { length: VEHICLE_NEWEST_YEAR - VEHICLE_OLDEST_YEAR + 1 },
  (_, i) => VEHICLE_NEWEST_YEAR - i,
);

const label = <T extends string>(opts: { id: T; label: string }[], id: T) =>
  opts.find((o) => o.id === id)?.label ?? id;

export const conditionLabel = (id: VehicleCondition) => label(VEHICLE_CONDITIONS, id);
export const fuelLabel = (id: FuelType) => label(FUEL_TYPES, id);
export const transmissionLabel = (id: Transmission) => label(TRANSMISSIONS, id);
