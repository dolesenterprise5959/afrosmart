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
    id: "food",
    label: "Food & Agriculture",
    icon: "🌾",
    categories: [
      { id: "rice", label: "Rice", icon: "🌾" },
      { id: "cassava", label: "Cassava", icon: "🥔" },
      { id: "cassava-leaves", label: "Cassava Leaves", icon: "🌿" },
      { id: "potato-greens", label: "Potato Greens", icon: "🍠" },
      { id: "okra", label: "Okra", icon: "🥒" },
      { id: "bitterball", label: "Bitterball", icon: "🍆" },
      { id: "garden-eggs", label: "Garden Eggs", icon: "🍆" },
      { id: "pepper", label: "Pepper", icon: "🌶️" },
      { id: "groundnuts", label: "Groundnuts", icon: "🥜" },
      { id: "palm-oil", label: "Palm Oil", icon: "🛢️" },
      { id: "red-oil", label: "Red Oil", icon: "🫗" },
      { id: "gari", label: "Gari", icon: "🍚" },
      { id: "fresh-fish", label: "Fresh Fish", icon: "🐠" },
      { id: "dry-fish", label: "Dry Fish", icon: "🐟" },
      { id: "chicken", label: "Chicken", icon: "🐔" },
      { id: "goat", label: "Goat", icon: "🐐" },
      { id: "cow", label: "Cow", icon: "🐄" },
      { id: "pig", label: "Pig", icon: "🐖" },
      { id: "eggs", label: "Eggs", icon: "🥚" },
      { id: "fruits", label: "Fruits", icon: "🍌" },
      { id: "vegetables", label: "Vegetables", icon: "🥬" },
      { id: "drinks", label: "Drinks", icon: "🥤" },
      { id: "water", label: "Water", icon: "💧" },
      { id: "livestock", label: "Other Livestock", icon: "🐏" },
    ],
  },
  {
    id: "services",
    label: "Services",
    icon: "🛠️",
    categories: [
      { id: "barber", label: "Barber", icon: "💈" },
      { id: "hair-braiding", label: "Hair Braiding", icon: "💇🏾" },
      { id: "beauty-salon", label: "Beauty Salon", icon: "💅" },
      { id: "makeup-artist", label: "Makeup Artist", icon: "💄" },
      { id: "beauty-supply", label: "Beauty Supply", icon: "🧴" },
      { id: "photography", label: "Photography", icon: "📷" },
      { id: "videography", label: "Videography", icon: "🎥" },
      { id: "event-planning", label: "Event Planning", icon: "🎉" },
      { id: "catering", label: "Catering", icon: "🍽️" },
      { id: "dj-services", label: "DJ Services", icon: "🎧" },
      { id: "musicians", label: "Musicians", icon: "🎸" },
      { id: "traditional-services", label: "Traditional / Native Services", icon: "🥁" },
      { id: "cleaning", label: "Cleaning Services", icon: "🧹" },
      { id: "house-cleaning", label: "House Cleaning", icon: "🧽" },
      { id: "laundry", label: "Laundry Services", icon: "🧺" },
      { id: "grass-cutting", label: "Grass Cutting", icon: "🌾" },
      { id: "landscaping", label: "Landscaping", icon: "🌳" },
      { id: "plumbing", label: "Plumbing", icon: "🚰" },
      { id: "electrical-repair", label: "Electrical", icon: "🔌" },
      { id: "carpentry", label: "Carpentry", icon: "🪚" },
      { id: "masonry", label: "Masonry", icon: "🧱" },
      { id: "welding", label: "Welding", icon: "🔥" },
      { id: "painting", label: "Painting", icon: "🖌️" },
      { id: "mechanics", label: "Mechanic", icon: "🔧" },
      { id: "tire-shops", label: "Tire Shop", icon: "🛞" },
      { id: "auto-parts", label: "Auto Parts", icon: "⚙️" },
      { id: "car-wash", label: "Car Wash", icon: "🚿" },
      { id: "ac-repair", label: "AC Repair", icon: "❄️" },
      { id: "generator-repair", label: "Generator Repair", icon: "⚡" },
      { id: "phone-repair", label: "Phone Repair", icon: "📱" },
      { id: "computer-repair", label: "Computer Repair", icon: "💻" },
      { id: "tailor", label: "Tailoring", icon: "🧵" },
      { id: "security-services", label: "Security Services", icon: "🛡️" },
      { id: "delivery-services", label: "Delivery Services", icon: "📦" },
      { id: "services", label: "General Services", icon: "🛠️" },
    ],
  },
  {
    id: "business",
    label: "Business & Shops",
    icon: "🏪",
    categories: [
      { id: "restaurants", label: "Restaurants", icon: "🍽️" },
      { id: "cook-shops", label: "Cook Shops", icon: "🍲" },
      { id: "market-stalls", label: "Market Stalls", icon: "🏬" },
      { id: "kobo-shops", label: "Kobo Shops", icon: "🛒" },
      { id: "mobile-money", label: "Mobile Money", icon: "📲" },
      { id: "phone-services", label: "Phone Services", icon: "📞" },
      { id: "beauty", label: "Beauty Products", icon: "💄" },
      { id: "water-suppliers", label: "Water Suppliers", icon: "🚚" },
      { id: "ice-suppliers", label: "Ice Suppliers", icon: "🧊" },
    ],
  },
  {
    id: "retail",
    label: "Shops & Retail",
    icon: "🛍️",
    categories: [
      { id: "clothing", label: "Clothing", icon: "👕" },
      { id: "shoes", label: "Shoes", icon: "👟" },
      { id: "cosmetics", label: "Cosmetics", icon: "💅" },
      { id: "electronics", label: "Electronics", icon: "💻" },
      { id: "phones", label: "Phones", icon: "📱" },
      { id: "sim-cards", label: "SIM Cards", icon: "📶" },
      { id: "scratch-cards", label: "Scratch Cards", icon: "🎫" },
    ],
  },
  {
    id: "community",
    label: "Community",
    icon: "🏘️",
    categories: [
      { id: "churches", label: "Churches", icon: "⛪" },
      { id: "schools", label: "Schools", icon: "🏫" },
      { id: "beaches", label: "Beaches", icon: "🏖️" },
      { id: "sports-fields", label: "Sports Fields", icon: "🥅" },
      { id: "entertainment", label: "Entertainment Centers", icon: "🎬" },
      { id: "events", label: "Events", icon: "🎉" },
      { id: "tournaments", label: "Tournaments", icon: "🏆" },
      { id: "football", label: "Football Tournaments", icon: "⚽" },
    ],
  },
  {
    id: "rentals",
    label: "Rentals",
    icon: "🔑",
    categories: [
      { id: "car-rental", label: "Car Rental", icon: "🚙" },
      { id: "truck-rental", label: "Truck Rental", icon: "🚚" },
      { id: "motorbike-rental", label: "Motorbike Rental", icon: "🏍️" },
      { id: "bicycle-rental", label: "Bicycle Rental", icon: "🚲" },
      { id: "equipment-rental", label: "Equipment Rental", icon: "🛠️" },
    ],
  },
  {
    id: "transport",
    label: "Transportation",
    icon: "🛵",
    categories: [
      { id: "motorbike", label: "Motorbike Riders", icon: "🏍️" },
      { id: "taxi", label: "Taxi Services", icon: "🚕" },
    ],
  },
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
