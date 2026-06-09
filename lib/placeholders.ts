// Category placeholder artwork.
//
// IMPORTANT: these are STATIC IMPORTS, not /public path strings. Firebase App
// Hosting does not reliably serve files from /public (raw /public/*.webp 404s on
// the live deployment, and the next/image optimizer is unavailable there). Static
// imports are bundled + fingerprinted into /_next/static/media, which IS served —
// so the images actually load. User-uploaded listing photos (Firebase Storage
// URLs) are unaffected and always take priority (see ListingImage).

import type { StaticImageData } from "next/image";

import agriculture from "../public/placeholders/agriculture.webp";
import apartment from "../public/placeholders/apartment.webp";
import barber from "../public/placeholders/barber.webp";
import beautySalon from "../public/placeholders/beauty-salon.webp";
import carPickup from "../public/placeholders/car-pickup.webp";
import carSedan from "../public/placeholders/car-sedan.webp";
import carSuv from "../public/placeholders/car-suv.webp";
import cargoTruck from "../public/placeholders/cargo-truck.webp";
import carpenter from "../public/placeholders/carpenter.webp";
import construction from "../public/placeholders/construction.webp";
import electronics from "../public/placeholders/electronics.webp";
import foodDishes from "../public/placeholders/food-dishes.webp";
import foodMarket from "../public/placeholders/food-market.webp";
import foodVegetables from "../public/placeholders/food-vegetables.webp";
import homeModern from "../public/placeholders/home-modern.webp";
import jobs from "../public/placeholders/jobs.webp";
import land from "../public/placeholders/land.webp";
import motorbikeTaxi from "../public/placeholders/motorbike-taxi.webp";
import phoneRepair from "../public/placeholders/phone-repair.webp";
import rentalEquipment from "../public/placeholders/rental-equipment.webp";
import rentalHome from "../public/placeholders/rental-home.webp";
import rentalVehicle from "../public/placeholders/rental-vehicle.webp";
import services from "../public/placeholders/services.webp";
import fashion from "../public/placeholders/fashion.webp";
import sports from "../public/placeholders/sports.webp";
import shopMarket from "../public/placeholders/shop-market.webp";
import shopRetail from "../public/placeholders/shop-retail.webp";
import shopStorefront from "../public/placeholders/shop-storefront.webp";
import smartphone from "../public/placeholders/smartphone.webp";
import taxi from "../public/placeholders/taxi.webp";

/** Placeholder key → bundled image. */
const IMAGES: Record<string, StaticImageData> = {
  "food-dishes": foodDishes, "food-vegetables": foodVegetables, "food-market": foodMarket,
  barber, "beauty-salon": beautySalon, "phone-repair": phoneRepair, carpenter,
  "motorbike-taxi": motorbikeTaxi, taxi, "cargo-truck": cargoTruck,
  "shop-storefront": shopStorefront, "shop-market": shopMarket, "shop-retail": shopRetail,
  "home-modern": homeModern, apartment, land,
  "car-sedan": carSedan, "car-suv": carSuv, "car-pickup": carPickup,
  smartphone, electronics,
  "rental-home": rentalHome, "rental-equipment": rentalEquipment, "rental-vehicle": rentalVehicle,
  jobs, agriculture, construction, sports, fashion, services,
};

/** Hero/ad images reused by HeroCarousel + SponsoredAd (kept here so all bundled
 *  artwork lives in one module). */
export const HERO_IMAGES = {
  shopStorefront, cargoTruck, carSuv, homeModern, rentalVehicle, services,
};

/** Category id → placeholder image key. Unmapped categories use the icon fallback. */
const CATEGORY_IMAGE: Record<string, string> = {
  rice: "food-dishes", drinks: "food-dishes", water: "food-dishes",
  "food-crops": "food-vegetables", vegetables: "food-vegetables", farm: "food-vegetables",
  "market-food": "food-market",
  barber: "barber", "hair-braiding": "beauty-salon", "beauty-salon": "beauty-salon",
  "makeup-artist": "beauty-salon", "beauty-supply": "beauty-salon",
  "phone-repair": "phone-repair", "computer-repair": "phone-repair",
  carpentry: "carpenter", masonry: "carpenter", welding: "carpenter",
  motorbike: "motorbike-taxi", "motorbike-rental": "motorbike-taxi",
  taxi: "taxi", trucks: "cargo-truck", "truck-rental": "cargo-truck",
  restaurants: "shop-storefront", "cook-shops": "shop-storefront", "kobo-shops": "shop-storefront",
  "market-stalls": "shop-market", general: "shop-retail",
  property: "home-modern",
  cars: "car-sedan",
  phones: "smartphone", electronics: "electronics",
  "car-rental": "rental-vehicle", "equipment-rental": "rental-equipment",
  "house-rental": "rental-home", "bicycle-rental": "rental-vehicle",
  jobs: "jobs", "job-listings": "jobs",
  agriculture: "agriculture", livestock: "agriculture", "farm-produce": "agriculture",
  construction: "construction", "building-materials": "construction", plumbing: "construction",
  beauty: "beauty-salon", cosmetics: "beauty-salon",
  services: "services", "general-services": "services",
  "sports-fields": "sports", tournaments: "sports", football: "sports", sports: "sports",
  clothing: "fashion", shoes: "fashion", fashion: "fashion",
  land: "land",
};

/** Bundled placeholder image for a category, or null to use the icon fallback. */
export function placeholderImage(category: string): StaticImageData | null {
  const key = CATEGORY_IMAGE[category];
  return key ? IMAGES[key] ?? null : null;
}
