# Category placeholder images

These are **fallback** images shown only when a listing/category has no real
photo. **User-uploaded photos always take priority.**

## How to add images (automatic install)

1. Drop your image files in **`public/placeholders/_incoming/`**, named by either:
   - an **image key**: `barber.webp`, `car-sedan.jpg`, `food-market.png` …
   - a **category**: `services.webp`, `cars.jpg`, `food.png`, `real-estate.webp` …
     (a category file fills every key in that category)
   Any format works — **.webp / .jpg / .png** (next/image serves optimized WebP).
2. Run: **`node scripts/install-placeholders.mjs`**
   → places them as `public/placeholders/<key>.<ext>` and rewrites the
   `PLACEHOLDER_FILES` registry in `lib/placeholders.ts` automatically.
3. Rebuild / redeploy. User-uploaded photos always override these placeholders.

## Shared style (prepend to every prompt)

> Photorealistic professional marketplace photography, contemporary Liberian /
> West African context, authentic local setting, natural daylight, clean
> uncluttered composition, slightly muted tones that read well on a dark UI,
> 4:3 aspect ratio, no text or logos, high trust and welcoming feel.

## Keys → subject

| key | subject |
|---|---|
| food-dishes | a plate of Liberian jollof rice and grilled fish |
| food-vegetables | fresh vegetables (greens, peppers, cassava) on a wooden table |
| food-market | a busy open-air food market stall |
| barber | a tidy local barber shop interior, chair and mirror |
| beauty-salon | a modern hair & beauty salon |
| phone-repair | a phone-repair technician at a small workbench |
| carpenter | a carpenter working with wood and tools |
| motorbike-taxi | a motorbike taxi (pen-pen) rider on a city street |
| taxi | a yellow taxi car on a Monrovia street |
| cargo-truck | a cargo/delivery truck loaded with goods |
| shop-storefront | a small painted storefront business |
| shop-market | a market shop stocked with goods |
| shop-retail | a clean small retail store interior |
| home-modern | a modern single-family house exterior |
| apartment | a contemporary apartment building |
| land | an open plot of land for sale with a marker |
| car-sedan | a clean used sedan, 3/4 front view |
| car-suv | an SUV parked outdoors |
| car-pickup | a pickup truck, work-ready |
| smartphone | a modern smartphone on a neutral surface |
| electronics | assorted consumer electronics neatly arranged |
| rental-home | a furnished home interior for rent |
| rental-equipment | rental tools/equipment (generator, ladder) |
| rental-vehicle | a vehicle for rent with keys |
| jobs | people working in an office / job-fair setting |
| agriculture | a farmer in a green field with crops |
| construction | a construction site with workers and materials |

