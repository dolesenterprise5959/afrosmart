// Mock data for Phase 1 (static UI). No network, no Firebase — everything here
// is replaced by Firestore reads in Phase 4. Photo fields hold Tailwind gradient
// classes so listings render as colourful placeholders with no remote images.

import type { County, Listing, User } from "@/lib/types";
import { ALL_CATEGORIES, getCategory } from "@/lib/categories";

// The category catalog now lives in lib/categories.ts (grouped taxonomy).
export const CATEGORIES = ALL_CATEGORIES;
export { getCategory };

// All 15 counties of Liberia (Montserrado first; the rest alphabetical).
export const COUNTIES: County[] = [
  { id: "montserrado", name: "Montserrado", cities: ["Monrovia", "Paynesville", "Bensonville"] },
  { id: "bomi", name: "Bomi", cities: ["Tubmanburg", "Klay"] },
  { id: "bong", name: "Bong", cities: ["Gbarnga", "Totota", "Salala"] },
  { id: "gbarpolu", name: "Gbarpolu", cities: ["Bopolu", "Belle Yella"] },
  { id: "grand-bassa", name: "Grand Bassa", cities: ["Buchanan", "Edina", "Compound #3"] },
  { id: "grand-cape-mount", name: "Grand Cape Mount", cities: ["Robertsport", "Sinje"] },
  { id: "grand-gedeh", name: "Grand Gedeh", cities: ["Zwedru", "Toe Town"] },
  { id: "grand-kru", name: "Grand Kru", cities: ["Barclayville", "Grand Cess"] },
  { id: "lofa", name: "Lofa", cities: ["Voinjama", "Foya", "Zorzor"] },
  { id: "margibi", name: "Margibi", cities: ["Kakata", "Harbel", "Marshall"] },
  { id: "maryland", name: "Maryland", cities: ["Harper", "Pleebo"] },
  { id: "nimba", name: "Nimba", cities: ["Ganta", "Sanniquellie", "Saclepea"] },
  { id: "river-cess", name: "River Cess", cities: ["Cestos City"] },
  { id: "river-gee", name: "River Gee", cities: ["Fish Town"] },
  { id: "sinoe", name: "Sinoe", cities: ["Greenville"] },
];

export const USERS: User[] = [
  {
    id: "u1",
    displayName: "Joseph Kollie",
    phone: "+231770000001",
    county: "Montserrado",
    city: "Monrovia",
    isBusiness: false,
    ratingAvg: 4.8,
    ratingCount: 32,
    joinedAt: "2025-09-12",
  },
  {
    id: "u2",
    displayName: "Bright Electronics",
    phone: "+231770000002",
    county: "Montserrado",
    city: "Paynesville",
    isBusiness: true,
    ratingAvg: 4.6,
    ratingCount: 118,
    joinedAt: "2024-11-03",
  },
  {
    id: "u3",
    displayName: "Fatu Sherif",
    phone: "+231770000003",
    county: "Nimba",
    city: "Ganta",
    isBusiness: false,
    ratingAvg: 4.9,
    ratingCount: 14,
    joinedAt: "2026-01-20",
  },
  {
    id: "u4",
    displayName: "Kakata Motors",
    phone: "+231770000004",
    county: "Margibi",
    city: "Kakata",
    isBusiness: true,
    ratingAvg: 4.3,
    ratingCount: 57,
    joinedAt: "2025-03-30",
  },
];

export const LISTINGS: Listing[] = [
  {
    id: "l1",
    sellerId: "u4",
    title: "Toyota Corolla 2014 — Clean",
    description:
      "Well maintained Toyota Corolla, low mileage, AC cold, new tyres. Documents complete and ready for transfer. Price slightly negotiable.",
    price: 950000,
    category: "cars",
    county: "Margibi",
    city: "Kakata",
    photos: ["from-sky-400 to-blue-700", "from-slate-400 to-slate-700", "from-cyan-300 to-sky-600"],
    status: "active",
    featured: true,
    createdAt: "2026-06-02",
  },
  {
    id: "l2",
    sellerId: "u2",
    title: "iPhone 13 Pro — 128GB",
    description:
      "Original iPhone 13 Pro, battery health 91%, no scratches. Comes with charger and case. Swap considered for Samsung S22.",
    price: 78000,
    category: "phones",
    county: "Montserrado",
    city: "Paynesville",
    photos: ["from-zinc-300 to-zinc-600", "from-neutral-400 to-neutral-700"],
    status: "active",
    featured: true,
    createdAt: "2026-06-03",
  },
  {
    id: "l3",
    sellerId: "u1",
    title: "HP Laptop — Core i5, 8GB RAM",
    description:
      "HP business laptop, fast SSD, good for school and office work. Battery lasts ~4 hours. Windows 11 installed.",
    price: 52000,
    category: "electronics",
    county: "Montserrado",
    city: "Monrovia",
    photos: ["from-indigo-400 to-violet-700", "from-purple-300 to-indigo-600"],
    status: "active",
    featured: true,
    createdAt: "2026-06-01",
  },
  {
    id: "l4",
    sellerId: "u3",
    title: "2 Bedroom House for Rent",
    description:
      "Self-contained 2 bedroom house in a calm area, running water and generator backup. Yearly rent, serious tenants only.",
    price: 180000,
    category: "property",
    county: "Nimba",
    city: "Ganta",
    photos: ["from-emerald-400 to-green-700", "from-lime-300 to-emerald-600"],
    status: "active",
    featured: false,
    createdAt: "2026-05-30",
  },
  {
    id: "l5",
    sellerId: "u1",
    title: "Generator Repair & Installation",
    description:
      "Professional generator repair, servicing and installation. Same-day service within Monrovia. Honest pricing, warranty on labour.",
    price: 5000,
    category: "services",
    county: "Montserrado",
    city: "Monrovia",
    photos: ["from-amber-400 to-orange-700"],
    status: "active",
    featured: false,
    createdAt: "2026-06-03",
  },
  {
    id: "l6",
    sellerId: "u2",
    title: "Hiring: Shop Sales Assistant",
    description:
      "Electronics shop in Paynesville needs a friendly sales assistant. Experience preferred. Monthly salary plus commission.",
    price: 25000,
    category: "jobs",
    county: "Montserrado",
    city: "Paynesville",
    photos: ["from-rose-400 to-pink-700"],
    status: "active",
    featured: false,
    createdAt: "2026-06-04",
  },
  {
    id: "l7",
    sellerId: "u4",
    title: "Honda Generator 5KVA",
    description:
      "Strong 5KVA Honda generator, barely used, runs quiet. Perfect for home or small business. Cash only.",
    price: 67000,
    category: "general",
    county: "Margibi",
    city: "Kakata",
    photos: ["from-orange-300 to-red-600", "from-amber-300 to-orange-600"],
    status: "active",
    featured: false,
    createdAt: "2026-05-28",
  },
  {
    id: "l8",
    sellerId: "u3",
    title: "Samsung 43\" Smart TV",
    description:
      "Samsung 43 inch smart TV, crisp display, WiFi and Netflix ready. Comes with wall bracket and remote.",
    price: 41000,
    category: "electronics",
    county: "Nimba",
    city: "Ganta",
    photos: ["from-fuchsia-400 to-purple-700"],
    status: "active",
    featured: false,
    createdAt: "2026-06-02",
  },
];

// --- Lookup helpers (stand in for Firestore queries during Phase 1) ---

export function getListing(id: string): Listing | undefined {
  return LISTINGS.find((l) => l.id === id);
}

export function getUser(id: string): User | undefined {
  return USERS.find((u) => u.id === id);
}

export function getListingsByCategory(category: string): Listing[] {
  return LISTINGS.filter((l) => l.category === category && l.status === "active");
}

export function getFeaturedListings(): Listing[] {
  return LISTINGS.filter((l) => l.featured && l.status === "active");
}

export function getRecentListings(): Listing[] {
  return [...LISTINGS]
    .filter((l) => l.status === "active")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Format an LRD amount the way Liberian sellers write it: "L$ 78,000". */
export function formatPrice(amount: number): string {
  // Community listings (churches, beaches, free events) post at no price.
  if (!amount || amount <= 0) return "Free";
  return `L$ ${amount.toLocaleString("en-US")}`;
}
