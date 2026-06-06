// Category placeholder artwork.
//
// User-uploaded photos ALWAYS take priority (see ListingImage). These images are
// only shown when a listing/category has no real photo yet.
//
// HOW TO ADD IMAGES (drop-in):
//   1. Generate the image (see public/placeholders/README.md for keys + prompts).
//   2. Save it as  public/placeholders/<key>.webp  (4:3, ~1200×900, WebP, <150KB).
//   3. Add "<key>" to AVAILABLE_PLACEHOLDERS below and redeploy.
// Until a key is listed in AVAILABLE_PLACEHOLDERS, the app falls back to the
// clean neutral category placeholder — so nothing ever shows a broken image.

/** Image keys whose files actually exist in public/placeholders/. */
export const AVAILABLE_PLACEHOLDERS = new Set<string>([
  // e.g. "barber", "car-sedan", "home-modern" — add keys here as files are added.
]);

/** All image keys the design expects (subjects documented in the README). */
export const PLACEHOLDER_KEYS = [
  "food-dishes", "food-vegetables", "food-market",
  "barber", "beauty-salon", "phone-repair", "carpenter",
  "motorbike-taxi", "taxi", "cargo-truck",
  "shop-storefront", "shop-market", "shop-retail",
  "home-modern", "apartment", "land",
  "car-sedan", "car-suv", "car-pickup",
  "smartphone", "electronics",
  "rental-home", "rental-equipment", "rental-vehicle",
  // Newly-requested top-level categories (Beauty reuses "beauty-salon")
  "jobs", "agriculture", "construction",
] as const;

/** Category id → placeholder image key. Unmapped categories use the neutral fallback. */
const CATEGORY_IMAGE: Record<string, string> = {
  // Food & agriculture
  rice: "food-dishes", drinks: "food-dishes", water: "food-dishes",
  "food-crops": "food-vegetables", vegetables: "food-vegetables", farm: "food-vegetables",
  "market-food": "food-market",
  // Services
  barber: "barber", "hair-braiding": "beauty-salon", "beauty-salon": "beauty-salon",
  "makeup-artist": "beauty-salon", "beauty-supply": "beauty-salon",
  "phone-repair": "phone-repair", "computer-repair": "phone-repair",
  carpentry: "carpenter", masonry: "carpenter", welding: "carpenter",
  // Transport
  motorbike: "motorbike-taxi", "motorbike-rental": "motorbike-taxi",
  taxi: "taxi", trucks: "cargo-truck", "truck-rental": "cargo-truck",
  // Shops & business
  restaurants: "shop-storefront", "cook-shops": "shop-storefront", "kobo-shops": "shop-storefront",
  "market-stalls": "shop-market", general: "shop-retail",
  // Real estate
  property: "home-modern",
  // Vehicles
  cars: "car-sedan",
  // Phones / electronics
  phones: "smartphone", electronics: "electronics",
  // Rentals
  "car-rental": "rental-vehicle", "equipment-rental": "rental-equipment",
  "house-rental": "rental-home", "bicycle-rental": "rental-vehicle",
  // Jobs / Agriculture / Construction / Beauty
  jobs: "jobs", "job-listings": "jobs",
  agriculture: "agriculture", livestock: "agriculture", "farm-produce": "agriculture",
  construction: "construction", "building-materials": "construction", plumbing: "construction",
  beauty: "beauty-salon", cosmetics: "beauty-salon",
};

/** Returns the placeholder image path for a category, or null to use the fallback. */
export function placeholderImage(category: string): string | null {
  const key = CATEGORY_IMAGE[category];
  if (key && AVAILABLE_PLACEHOLDERS.has(key)) return `/placeholders/${key}.webp`;
  return null;
}
