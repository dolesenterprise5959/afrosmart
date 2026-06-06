// AfroSmart category taxonomy — grouped for browsing, flattened for the catalog.
// The flat list (ALL_CATEGORIES) drives listing categories, routing, validation
// and chips; CATEGORY_GROUPS drives the grouped browse + create-form optgroups.

import type { Category } from "@/lib/types";

export interface CategoryGroup {
  id: string;
  label: string;
  icon: string;
  categories: Category[];
}

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: "vehicles",
    label: "Vehicles",
    icon: "🚗",
    categories: [{ id: "cars", label: "Cars", icon: "🚗" }],
  },
  {
    id: "real-estate",
    label: "Real Estate",
    icon: "🏠",
    categories: [{ id: "property", label: "Real Estate", icon: "🏠" }],
  },
  {
    id: "food",
    label: "Food & Agriculture",
    icon: "🌾",
    categories: [
      { id: "cassava", label: "Cassava", icon: "🥔" },
      { id: "cassava-leaves", label: "Cassava Leaves", icon: "🌿" },
      { id: "gari", label: "Gari", icon: "🍚" },
      { id: "rice", label: "Rice", icon: "🌾" },
      { id: "palm-oil", label: "Palm Oil", icon: "🛢️" },
      { id: "pepper", label: "Pepper", icon: "🌶️" },
      { id: "groundnuts", label: "Groundnuts", icon: "🥜" },
      { id: "dry-fish", label: "Dry Fish", icon: "🐟" },
      { id: "fresh-fish", label: "Fresh Fish", icon: "🐠" },
      { id: "vegetables", label: "Vegetables", icon: "🥬" },
      { id: "fruits", label: "Fruits", icon: "🍌" },
      { id: "livestock", label: "Livestock", icon: "🐐" },
    ],
  },
  {
    id: "services",
    label: "Services",
    icon: "🛠️",
    categories: [
      { id: "services", label: "General Services", icon: "🛠️" },
      { id: "barber", label: "Barber", icon: "💈" },
      { id: "hair-braiding", label: "Hair Braiding", icon: "💇🏾" },
      { id: "tailor", label: "Tailor", icon: "🧵" },
      { id: "cleaning", label: "Cleaning Services", icon: "🧹" },
      { id: "landscaping", label: "Landscaping", icon: "🌳" },
      { id: "mechanics", label: "Mechanics", icon: "🔧" },
      { id: "tire-shops", label: "Tire Shops", icon: "🛞" },
      { id: "auto-parts", label: "Auto Parts", icon: "⚙️" },
      { id: "car-wash", label: "Car Wash", icon: "🚿" },
      { id: "mobile-money", label: "Mobile Money Agents", icon: "📲" },
    ],
  },
  {
    id: "retail",
    label: "Retail",
    icon: "🛍️",
    categories: [
      { id: "clothing", label: "Clothing", icon: "👕" },
      { id: "shoes", label: "Shoes", icon: "👟" },
      { id: "beauty", label: "Beauty Products", icon: "💅" },
      { id: "cosmetics", label: "Cosmetics", icon: "💄" },
      { id: "electronics", label: "Electronics", icon: "💻" },
      { id: "phones", label: "Phones", icon: "📱" },
      { id: "sim-cards", label: "SIM Cards", icon: "📶" },
      { id: "scratch-cards", label: "Scratch Cards", icon: "🎫" },
    ],
  },
  {
    id: "transport",
    label: "Transportation",
    icon: "🛵",
    categories: [
      { id: "motorbike", label: "Motorbike Riders", icon: "🏍️" },
      { id: "taxi", label: "Taxi Services", icon: "🚕" },
      { id: "car-rental", label: "Car Rental", icon: "🚙" },
    ],
  },
  {
    id: "community",
    label: "Community",
    icon: "🏘️",
    categories: [
      { id: "schools", label: "Schools", icon: "🏫" },
      { id: "churches", label: "Churches", icon: "⛪" },
      { id: "events", label: "Events", icon: "🎉" },
      { id: "football", label: "Football Tournaments", icon: "⚽" },
      { id: "beaches", label: "Beaches", icon: "🏖️" },
      { id: "entertainment", label: "Entertainment Centers", icon: "🎬" },
    ],
  },
  {
    id: "more",
    label: "Jobs & More",
    icon: "💼",
    categories: [
      { id: "jobs", label: "Jobs", icon: "💼" },
      { id: "general", label: "General", icon: "📦" },
    ],
  },
];

export const ALL_CATEGORIES: Category[] = CATEGORY_GROUPS.flatMap((g) => g.categories);

export function getCategory(id: string): Category | undefined {
  return ALL_CATEGORIES.find((c) => c.id === id);
}

/** Browse URL for a category (cars/property have dedicated marketplaces). */
export function categoryHref(id: string): string {
  if (id === "cars") return "/vehicles";
  if (id === "property") return "/properties";
  return `/marketplace/${id}`;
}
