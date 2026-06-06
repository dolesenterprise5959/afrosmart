// Generate the category placeholder images with OpenAI Images (gpt-image-1) and
// install them as mobile-optimized WebP under public/placeholders/.
//
// Usage:
//   1. Put your key in .env.local:  OPENAI_API_KEY=sk-...
//   2. node scripts/generate-placeholders.mjs            (all keys)
//      node scripts/generate-placeholders.mjs barber car-sedan   (subset)
//   3. Add the printed keys to AVAILABLE_PLACEHOLDERS in lib/placeholders.ts,
//      then rebuild/redeploy.
//
// Needs macOS `sips` (preinstalled) to convert PNG → WebP. User-uploaded photos
// always override these placeholders at runtime (see ListingImage).

import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import os from "node:os";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "public", "placeholders");
mkdirSync(OUT, { recursive: true });

// Load OPENAI_API_KEY from env or .env.local
let KEY = process.env.OPENAI_API_KEY;
if (!KEY && existsSync(path.join(ROOT, ".env.local"))) {
  const m = readFileSync(path.join(ROOT, ".env.local"), "utf8").match(/^OPENAI_API_KEY=(.+)$/m);
  if (m) KEY = m[1].trim();
}
if (!KEY) {
  console.error("No OPENAI_API_KEY found (env or .env.local). Aborting.");
  process.exit(1);
}

const STYLE =
  "Photorealistic professional marketplace photography, contemporary Liberian / West African context, " +
  "authentic local setting, natural daylight, clean uncluttered composition, muted tones that read well " +
  "on a dark UI, no text or logos, no watermark, high trust and welcoming feel.";

const IMAGES = {
  "food-dishes": "a plate of Liberian jollof rice and grilled fish",
  "food-vegetables": "fresh vegetables — greens, peppers, cassava — on a wooden table",
  "food-market": "a busy open-air food market stall",
  "barber": "a tidy local barber shop interior with chair and mirror",
  "beauty-salon": "a modern hair and beauty salon",
  "phone-repair": "a phone-repair technician at a small workbench",
  "carpenter": "a carpenter working with wood and hand tools",
  "motorbike-taxi": "a motorbike taxi (pen-pen) rider on a city street",
  "taxi": "a yellow taxi car on a Monrovia street",
  "cargo-truck": "a cargo delivery truck loaded with goods",
  "shop-storefront": "a small painted storefront business",
  "shop-market": "a market shop stocked with goods",
  "shop-retail": "a clean small retail store interior",
  "home-modern": "a modern single-family house exterior",
  "apartment": "a contemporary apartment building",
  "land": "an open plot of land for sale with a boundary marker",
  "car-sedan": "a clean used sedan, three-quarter front view",
  "car-suv": "an SUV parked outdoors",
  "car-pickup": "a work-ready pickup truck",
  "smartphone": "a modern smartphone on a neutral surface",
  "electronics": "assorted consumer electronics neatly arranged",
  "rental-home": "a furnished home interior for rent",
  "rental-equipment": "rental tools and equipment, a generator and a ladder",
  "rental-vehicle": "a vehicle for rent with keys on the seat",
  "jobs": "people working together in a bright office",
  "agriculture": "a farmer working in a green field of crops",
  "construction": "a construction site with workers and building materials",
};

const want = process.argv.slice(2);
const keys = want.length ? want : Object.keys(IMAGES);
const done = [];

for (const key of keys) {
  const subject = IMAGES[key];
  if (!subject) { console.warn(`skip unknown key: ${key}`); continue; }
  process.stdout.write(`Generating ${key}… `);
  try {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-image-1", prompt: `${STYLE} Subject: ${subject}.`, size: "1536x1024", n: 1 }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || `HTTP ${res.status}`);
    const b64 = json.data[0].b64_json;
    const tmp = path.join(os.tmpdir(), `${key}.png`);
    writeFileSync(tmp, Buffer.from(b64, "base64"));
    // PNG → mobile-optimized WebP (quality 80) via macOS sips.
    execFileSync("sips", ["-s", "format", "webp", "-s", "formatOptions", "80", tmp, "--out", path.join(OUT, `${key}.webp`)], { stdio: "ignore" });
    rmSync(tmp, { force: true });
    console.log("ok");
    done.push(key);
  } catch (e) {
    console.log(`FAILED: ${e.message}`);
  }
}

console.log(`\nGenerated ${done.length}/${keys.length}.`);
if (done.length) {
  console.log("Add these to AVAILABLE_PLACEHOLDERS in lib/placeholders.ts:");
  console.log(done.map((k) => `"${k}"`).join(", "));
}
