"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { trackHeroEvent } from "@/lib/actions/hero";

// Rotating sponsored banner. Each slide names its advertiser (minimalist
// "Advertiser · Sponsored" label) — the image does the selling. Categories live
// in the "Browse by category" section below; the search bar sits above.
const BG = [
  { id: "ecobank", img: "/placeholders/shop-storefront.webp", advertiser: "Ecobank Liberia" },
  { id: "lonestar", img: "/placeholders/cargo-truck.webp", advertiser: "LoneStar Storage" },
  { id: "cars", img: "/placeholders/car-suv.webp", advertiser: "Liberia Auto Mart" },
  { id: "real-estate", img: "/placeholders/home-modern.webp", advertiser: "Monrovia Realty" },
  { id: "rentals", img: "/placeholders/rental-vehicle.webp", advertiser: "EasyRent Liberia" },
  { id: "services", img: "/placeholders/services.webp", advertiser: "ProServe Liberia" },
];

const ROTATE_MS = 6000;
const SWIPE_PX = 40;

export function HeroCarousel() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const seen = useRef<Set<number>>(new Set());
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((p) => (p + 1) % BG.length), ROTATE_MS);
    return () => clearInterval(t);
  }, [paused]);

  useEffect(() => {
    if (seen.current.has(i)) return;
    seen.current.add(i);
    void trackHeroEvent(BG[i].id, "impression");
  }, [i]);

  function onTouchStart(e: React.TouchEvent) { touchX.current = e.touches[0].clientX; }
  function onTouchEnd(e: React.TouchEvent) {
    const start = touchX.current; touchX.current = null;
    if (start == null) return;
    const dx = e.changedTouches[0].clientX - start;
    if (Math.abs(dx) > SWIPE_PX) setI((p) => (dx < 0 ? (p + 1) % BG.length : (p - 1 + BG.length) % BG.length));
  }

  return (
    <div
      className="relative h-36 w-full overflow-hidden rounded-xl sm:h-48"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {BG.map((b, idx) => (
        <Image
          key={b.id}
          src={b.img}
          alt=""
          aria-hidden
          fill
          sizes="(max-width:1024px) 100vw, 1024px"
          priority={idx === 0}
          className={`object-cover transition-opacity duration-700 ${idx === i ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      {/* Business name overlay — bold and clearly legible over any banner image. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 via-black/35 to-transparent px-4 pb-3 pt-12">
        <span className="inline-flex items-center gap-2">
          <span className="text-lg font-bold leading-tight text-white drop-shadow sm:text-xl">
            {BG[i].advertiser}
          </span>
          <span className="rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white/90">
            Sponsored
          </span>
        </span>
      </div>

      {/* Rotation dots — bottom-right, clear of the business name. */}
      <div className="absolute bottom-3 right-3 z-20 flex gap-1.5">
        {BG.map((b, idx) => (
          <button
            key={b.id}
            type="button"
            aria-label={`Show image ${idx + 1}`}
            onClick={() => setI(idx)}
            className={`h-1.5 rounded-full transition-all ${idx === i ? "w-5 bg-white" : "w-1.5 bg-white/50"}`}
          />
        ))}
      </div>
    </div>
  );
}
