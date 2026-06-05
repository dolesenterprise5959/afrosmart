// Seeds Firestore with AfroSmart sample data. Run once after configuring
// Firebase:  npm run seed
//
// Reads service-account credentials from .env.local (FIREBASE_PROJECT_ID,
// FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY). Safe to re-run — it overwrites
// the sample docs by id without touching real listings users create later.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { applicationDefault, cert, initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// --- Minimal .env.local loader (no dependency on dotenv) ---
function loadEnv() {
  let raw;
  try {
    raw = readFileSync(join(root, ".env.local"), "utf8");
  } catch {
    console.error("Missing .env.local — copy .env.local.example and fill it in.");
    process.exit(1);
  }
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let value = m[2];
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (!(m[1] in process.env)) process.env[m[1]] = value;
  }
}
loadEnv();

// Credentials, in order of preference (mirrors lib/firebase/admin.ts):
//   1. Explicit service-account env vars (FIREBASE_*) — paste a downloaded key.
//   2. Application Default Credentials (ADC) — key-free, via
//      `gcloud auth application-default login` + GOOGLE_CLOUD_PROJECT=afrosmart.
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
const projectId =
  process.env.FIREBASE_PROJECT_ID ||
  process.env.GOOGLE_CLOUD_PROJECT ||
  process.env.GCLOUD_PROJECT ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

if (clientEmail && privateKey && projectId) {
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
} else if (projectId) {
  // No explicit key — rely on ADC. Requires `gcloud auth application-default login`.
  initializeApp({ credential: applicationDefault(), projectId });
} else {
  console.error(
    "No credentials. Either set FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY in .env.local,\n" +
      "or run `gcloud auth application-default login` and set GOOGLE_CLOUD_PROJECT=afrosmart for the ADC path.",
  );
  process.exit(1);
}
const db = getFirestore();

const USERS = [
  { id: "u1", displayName: "Joseph Kollie", phone: "+231770000001", county: "Montserrado", city: "Monrovia", isBusiness: false, ratingAvg: 4.8, ratingCount: 32, joinedAt: "2025-09-12" },
  { id: "u2", displayName: "Bright Electronics", phone: "+231770000002", county: "Montserrado", city: "Paynesville", isBusiness: true, ratingAvg: 4.6, ratingCount: 118, joinedAt: "2024-11-03" },
  { id: "u3", displayName: "Fatu Sherif", phone: "+231770000003", county: "Nimba", city: "Ganta", isBusiness: false, ratingAvg: 4.9, ratingCount: 14, joinedAt: "2026-01-20" },
  { id: "u4", displayName: "Kakata Motors", phone: "+231770000004", county: "Margibi", city: "Kakata", isBusiness: true, ratingAvg: 4.3, ratingCount: 57, joinedAt: "2025-03-30" },
];

const LISTINGS = [
  { id: "l1", sellerId: "u4", title: "Toyota Corolla 2014 — Clean", description: "Well maintained Toyota Corolla, low mileage, AC cold, new tyres. Documents complete and ready for transfer. Price slightly negotiable.", price: 950000, category: "cars", county: "Margibi", city: "Kakata", photos: ["from-sky-400 to-blue-700", "from-slate-400 to-slate-700", "from-cyan-300 to-sky-600"], status: "active", featured: true, createdAt: "2026-06-02" },
  { id: "l2", sellerId: "u2", title: "iPhone 13 Pro — 128GB", description: "Original iPhone 13 Pro, battery health 91%, no scratches. Comes with charger and case. Swap considered for Samsung S22.", price: 78000, category: "phones", county: "Montserrado", city: "Paynesville", photos: ["from-zinc-300 to-zinc-600", "from-neutral-400 to-neutral-700"], status: "active", featured: true, createdAt: "2026-06-03" },
  { id: "l3", sellerId: "u1", title: "HP Laptop — Core i5, 8GB RAM", description: "HP business laptop, fast SSD, good for school and office work. Battery lasts ~4 hours. Windows 11 installed.", price: 52000, category: "electronics", county: "Montserrado", city: "Monrovia", photos: ["from-indigo-400 to-violet-700", "from-purple-300 to-indigo-600"], status: "active", featured: true, createdAt: "2026-06-01" },
  { id: "l4", sellerId: "u3", title: "2 Bedroom House for Rent", description: "Self-contained 2 bedroom house in a calm area, running water and generator backup. Yearly rent, serious tenants only.", price: 180000, category: "property", county: "Nimba", city: "Ganta", photos: ["from-emerald-400 to-green-700", "from-lime-300 to-emerald-600"], status: "active", featured: false, createdAt: "2026-05-30" },
  { id: "l5", sellerId: "u1", title: "Generator Repair & Installation", description: "Professional generator repair, servicing and installation. Same-day service within Monrovia. Honest pricing, warranty on labour.", price: 5000, category: "services", county: "Montserrado", city: "Monrovia", photos: ["from-amber-400 to-orange-700"], status: "active", featured: false, createdAt: "2026-06-03" },
  { id: "l6", sellerId: "u2", title: "Hiring: Shop Sales Assistant", description: "Electronics shop in Paynesville needs a friendly sales assistant. Experience preferred. Monthly salary plus commission.", price: 25000, category: "jobs", county: "Montserrado", city: "Paynesville", photos: ["from-rose-400 to-pink-700"], status: "active", featured: false, createdAt: "2026-06-04" },
  { id: "l7", sellerId: "u4", title: "Honda Generator 5KVA", description: "Strong 5KVA Honda generator, barely used, runs quiet. Perfect for home or small business. Cash only.", price: 67000, category: "general", county: "Margibi", city: "Kakata", photos: ["from-orange-300 to-red-600", "from-amber-300 to-orange-600"], status: "active", featured: false, createdAt: "2026-05-28" },
  { id: "l8", sellerId: "u3", title: 'Samsung 43" Smart TV', description: "Samsung 43 inch smart TV, crisp display, WiFi and Netflix ready. Comes with wall bracket and remote.", price: 41000, category: "electronics", county: "Nimba", city: "Ganta", photos: ["from-fuchsia-400 to-purple-700"], status: "active", featured: false, createdAt: "2026-06-02" },
];

async function seed() {
  const batch = db.batch();

  for (const u of USERS) {
    const { id, ...data } = u;
    batch.set(db.collection("users").doc(id), data, { merge: true });
  }

  for (const l of LISTINGS) {
    const { id, createdAt, ...data } = l;
    batch.set(
      db.collection("listings").doc(id),
      { ...data, createdAt: Timestamp.fromDate(new Date(createdAt)) },
      { merge: true },
    );
  }

  await batch.commit();
  console.log(`Seeded ${USERS.length} users and ${LISTINGS.length} listings.`);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
