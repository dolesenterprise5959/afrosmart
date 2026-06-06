# Category placeholder images

These are **fallback** images shown only when a listing/category has no real
photo. **User-uploaded photos always take priority.**

## How to add an image (drop-in)

1. Generate the image using the shared style + the subject for its key (below).
2. Save it here as `<key>.webp` — **4:3, ~1200×900, WebP, < 150 KB**, no text/logos.
3. Add `"<key>"` to `AVAILABLE_PLACEHOLDERS` in `lib/placeholders.ts`.
4. Rebuild/redeploy. Until a key is listed there, the app shows the neutral
   category placeholder (no broken images).

Optimize quickly with:
`cwebp -q 80 input.jpg -o <key>.webp` (or any image tool that exports WebP).

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
