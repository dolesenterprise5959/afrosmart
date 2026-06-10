// Category icons — a single, consistent SVG set (lucide-react). Every category
// resolves to a real line icon: a specific match where one exists, otherwise its
// group's icon, otherwise a neutral Tag. No emoji is ever rendered.

import { createElement } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Megaphone, Wrench, Store, ShoppingBag, Building2, KeyRound, Bike, Car, Home, Briefcase,
  Apple, Gift, Search, Ticket, Compass, HandHeart, Users, Package, Map,
  Trophy, Shirt, Footprints, Sparkles, Laptop, Smartphone, Droplets, Fish, Drumstick, Egg,
  Carrot, CupSoda, Droplet, Wheat, Scissors, Camera, Video, Utensils, Headphones, Guitar,
  SprayCan, Plug, Hammer, Flame, Paintbrush, Settings, Snowflake, Zap, Shield, Truck,
  ShoppingCart, Wallet, Phone, Church, School, TreePalm, Clapperboard, Beef, Tag,
} from "lucide-react";
import { CATEGORY_GROUPS } from "@/lib/categories";

// Per-group default (used when a category has no specific icon below).
const GROUP_ICON: Record<string, LucideIcon> = {
  "community-board": Megaphone,
  food: Apple,
  services: Wrench,
  business: Store,
  retail: ShoppingBag,
  community: Building2,
  rentals: KeyRound,
  transport: Bike,
  vehicles: Car,
  "real-estate": Home,
  more: Briefcase,
};

// Specific matches (cleanly mappable items). Anything not here falls back to its
// group's icon — so e.g. produce without a dedicated glyph still reads as "food".
const ITEM_ICON: Record<string, LucideIcon> = {
  // community-board
  "free-stuff": Gift, wanted: Search, events: Ticket, "lost-found": Compass, donations: HandHeart, volunteers: Users,
  // food & agriculture
  rice: Wheat, "fresh-fish": Fish, "dry-fish": Fish, chicken: Drumstick, goat: Beef, cow: Beef, pig: Beef,
  eggs: Egg, fruits: Apple, vegetables: Carrot, drinks: CupSoda, water: Droplet, livestock: Beef,
  // services
  barber: Scissors, "hair-braiding": Scissors, "beauty-salon": Sparkles, "makeup-artist": Sparkles,
  photography: Camera, videography: Video, catering: Utensils, "dj-services": Headphones, musicians: Guitar,
  cleaning: SprayCan, "house-cleaning": SprayCan, laundry: SprayCan, plumbing: Droplets, "electrical-repair": Plug,
  carpentry: Hammer, masonry: Hammer, welding: Flame, painting: Paintbrush, mechanics: Wrench, "auto-parts": Settings,
  "car-wash": Droplets, "ac-repair": Snowflake, "generator-repair": Zap, "phone-repair": Smartphone,
  "computer-repair": Laptop, tailor: Scissors, "security-services": Shield, "delivery-services": Truck, services: Wrench,
  // business & shops
  restaurants: Utensils, "cook-shops": Utensils, "market-stalls": Store, "kobo-shops": ShoppingCart,
  "mobile-money": Wallet, "phone-services": Phone, beauty: Sparkles, "water-suppliers": Truck, "ice-suppliers": Snowflake,
  // retail
  clothing: Shirt, shoes: Footprints, cosmetics: Sparkles, electronics: Laptop, phones: Smartphone,
  "sim-cards": Smartphone, "scratch-cards": Ticket,
  // community
  churches: Church, schools: School, beaches: TreePalm, "sports-fields": Trophy, entertainment: Clapperboard,
  tournaments: Trophy, football: Trophy,
  // rentals & transport
  "car-rental": Car, "truck-rental": Truck, "motorbike-rental": Bike, "bicycle-rental": Bike,
  "equipment-rental": Wrench, motorbike: Bike, taxi: Car,
  // vehicles / real estate / more
  cars: Car, property: Home, land: Map, jobs: Briefcase, general: Package,
};

// id → group id (derived once from the taxonomy).
const GROUP_OF: Record<string, string> = {};
for (const g of CATEGORY_GROUPS) for (const c of g.categories) GROUP_OF[c.id] = g.id;

function iconFor(category: string): LucideIcon {
  return ITEM_ICON[category] ?? GROUP_ICON[GROUP_OF[category] ?? ""] ?? Tag;
}

export function CategoryIcon({ category, className }: { category: string; className?: string }) {
  // createElement (not <Icon/>) so the lint rule doesn't flag a stable lookup as a
  // component "created during render".
  return createElement(iconFor(category), { className, strokeWidth: 1.75, "aria-hidden": true });
}

/** Every category now has a real icon. */
export function hasCategoryIcon(): boolean {
  return true;
}
