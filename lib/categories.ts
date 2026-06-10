// AfroSmart category taxonomy — grouped for browsing, flattened for the catalog.
// The flat list (ALL_CATEGORIES) drives listing categories, routing, validation
// and chips; CATEGORY_GROUPS drives the grouped browse + create-form optgroups.

import type { Category } from "@/lib/types";

export interface CategoryGroup {
  id: string;
  label: string;
  categories: Category[];
}

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: "community-board",
    label: "Free, Wanted & Community",
    categories: [
      { id: "free-stuff", label: "Free Stuff" },
      { id: "wanted", label: "Wanted / Looking For" },
      { id: "events", label: "Events" },
      { id: "lost-found", label: "Lost & Found" },
      { id: "donations", label: "Donations" },
      { id: "volunteers", label: "Volunteers" },
    ],
  },
  {
    id: "food",
    label: "Food & Agriculture",
    categories: [
      { id: "rice", label: "Rice" },
      { id: "cassava", label: "Cassava" },
      { id: "cassava-leaves", label: "Cassava Leaves" },
      { id: "potato-greens", label: "Potato Greens" },
      { id: "okra", label: "Okra" },
      { id: "bitterball", label: "Bitterball" },
      { id: "garden-eggs", label: "Garden Eggs" },
      { id: "pepper", label: "Pepper" },
      { id: "groundnuts", label: "Groundnuts" },
      { id: "palm-oil", label: "Palm Oil" },
      { id: "red-oil", label: "Red Oil" },
      { id: "gari", label: "Gari" },
      { id: "fresh-fish", label: "Fresh Fish" },
      { id: "dry-fish", label: "Dry Fish" },
      { id: "chicken", label: "Chicken" },
      { id: "goat", label: "Goat" },
      { id: "cow", label: "Cow" },
      { id: "pig", label: "Pig" },
      { id: "eggs", label: "Eggs" },
      { id: "fruits", label: "Fruits" },
      { id: "vegetables", label: "Vegetables" },
      { id: "drinks", label: "Drinks" },
      { id: "water", label: "Water" },
      { id: "livestock", label: "Other Livestock" },
    ],
  },
  {
    id: "services",
    label: "Services",
    categories: [
      { id: "barber", label: "Barber" },
      { id: "hair-braiding", label: "Hair Braiding" },
      { id: "beauty-salon", label: "Beauty Salon" },
      { id: "makeup-artist", label: "Makeup Artist" },
      { id: "beauty-supply", label: "Beauty Supply" },
      { id: "photography", label: "Photography" },
      { id: "videography", label: "Videography" },
      { id: "event-planning", label: "Event Planning" },
      { id: "catering", label: "Catering" },
      { id: "dj-services", label: "DJ Services" },
      { id: "musicians", label: "Musicians" },
      { id: "traditional-services", label: "Traditional / Native Services" },
      { id: "cleaning", label: "Cleaning Services" },
      { id: "house-cleaning", label: "House Cleaning" },
      { id: "laundry", label: "Laundry Services" },
      { id: "grass-cutting", label: "Grass Cutting" },
      { id: "landscaping", label: "Landscaping" },
      { id: "plumbing", label: "Plumbing" },
      { id: "electrical-repair", label: "Electrical" },
      { id: "carpentry", label: "Carpentry" },
      { id: "masonry", label: "Masonry" },
      { id: "welding", label: "Welding" },
      { id: "painting", label: "Painting" },
      { id: "mechanics", label: "Mechanic" },
      { id: "tire-shops", label: "Tire Shop" },
      { id: "auto-parts", label: "Auto Parts" },
      { id: "car-wash", label: "Car Wash" },
      { id: "ac-repair", label: "AC Repair" },
      { id: "generator-repair", label: "Generator Repair" },
      { id: "phone-repair", label: "Phone Repair" },
      { id: "computer-repair", label: "Computer Repair" },
      { id: "tailor", label: "Tailoring" },
      { id: "security-services", label: "Security Services" },
      { id: "delivery-services", label: "Delivery Services" },
      { id: "services", label: "General Services" },
    ],
  },
  {
    id: "business",
    label: "Business & Shops",
    categories: [
      { id: "restaurants", label: "Restaurants" },
      { id: "cook-shops", label: "Cook Shops" },
      { id: "market-stalls", label: "Market Stalls" },
      { id: "kobo-shops", label: "Kobo Shops" },
      { id: "mobile-money", label: "Mobile Money" },
      { id: "phone-services", label: "Phone Services" },
      { id: "beauty", label: "Beauty Products" },
      { id: "water-suppliers", label: "Water Suppliers" },
      { id: "ice-suppliers", label: "Ice Suppliers" },
    ],
  },
  {
    id: "retail",
    label: "Shops & Retail",
    categories: [
      { id: "clothing", label: "Clothing" },
      { id: "shoes", label: "Shoes" },
      { id: "cosmetics", label: "Cosmetics" },
      { id: "electronics", label: "Electronics" },
      { id: "phones", label: "Phones" },
      { id: "sim-cards", label: "SIM Cards" },
      { id: "scratch-cards", label: "Scratch Cards" },
    ],
  },
  {
    id: "community",
    label: "Community",
    categories: [
      { id: "churches", label: "Churches" },
      { id: "schools", label: "Schools" },
      { id: "beaches", label: "Beaches" },
      { id: "sports-fields", label: "Sports Fields" },
      { id: "entertainment", label: "Entertainment Centers" },
      { id: "tournaments", label: "Tournaments" },
      { id: "football", label: "Football Tournaments" },
    ],
  },
  {
    id: "rentals",
    label: "Rentals",
    categories: [
      { id: "car-rental", label: "Car Rental" },
      { id: "truck-rental", label: "Truck Rental" },
      { id: "motorbike-rental", label: "Motorbike Rental" },
      { id: "bicycle-rental", label: "Bicycle Rental" },
      { id: "equipment-rental", label: "Equipment Rental" },
    ],
  },
  {
    id: "transport",
    label: "Transportation",
    categories: [
      { id: "motorbike", label: "Motorbike Riders" },
      { id: "taxi", label: "Taxi Services" },
    ],
  },
  {
    id: "vehicles",
    label: "Vehicles",
    categories: [{ id: "cars", label: "Cars" }],
  },
  {
    id: "real-estate",
    label: "Real Estate",
    categories: [{ id: "property", label: "Real Estate" }],
  },
  {
    id: "more",
    label: "Jobs & More",
    categories: [
      { id: "jobs", label: "Jobs" },
      { id: "general", label: "General" },
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

// Community-board categories aren't sales: free giveaways, "looking for" requests,
// events, lost & found, donations and volunteer calls all post without a price.
// For these we allow a 0 price (rendered as "Free") instead of requiring one.
export const PRICELESS_CATEGORIES = new Set<string>([
  "free-stuff",
  "wanted",
  "events",
  "lost-found",
  "donations",
  "volunteers",
]);

/** True for categories posted without a price (free giveaways, requests, events…). */
export function isPricelessCategory(id: string): boolean {
  return PRICELESS_CATEGORIES.has(id);
}

/** True for the Free Stuff category (drives the green FREE badge on cards). */
export function isFreeStuffCategory(id: string): boolean {
  return id === "free-stuff";
}
