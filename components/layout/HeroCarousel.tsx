"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { trackHeroEvent } from "@/lib/actions/hero";

// Rotating Liberia photos as the backdrop for a search-first hero.
const BG = [
  { id: "cars", img: "/placeholders/car-suv.webp" },
  { id: "real-estate", img: "/placeholders/home-modern.webp" },
  { id: "rentals", img: "/placeholders/rental-vehicle.webp" },
  { id: "land", img: "/placeholders/land.webp" },
  { id: "shops", img: "/placeholders/shop-storefront.webp" },
  { id: "services", img: "/placeholders/services.webp" },
];

// Quick-search chips → direct category destinations.
const CHIPS = [
  { id: "cars", label: "Cars", icon: "🚗", href: "/marketplace/cars" },
  { id: "real-estate", label: "Real Estate", icon: "🏠", href: "/properties" },
  { id: "rentals", label: "Rentals", icon: "🏘", href: "/marketplace/rentals" },
  { id: "phones", label: "Phones", icon: "📱", href: "/marketplace/phones" },
  { id: "shops", label: "Shops", icon: "🛍", href: "/marketplace/shops" },
  { id: "services", label: "Services", icon: "🛠", href: "/services" },
];

const ROTATE_MS = 6000;
const SWIPE_PX = 40;

export function HeroCarousel() {
  const router = useRouter();
  const [i, setI] = useState(0);
  const [q, setQ] = useState("");
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

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    void trackHeroEvent("search", "click");
    router.push(term ? `/marketplace?q=${encodeURIComponent(term)}` : "/marketplace");
  }

  function onTouchStart(e: React.TouchEvent) { touchX.current = e.touches[0].clientX; }
  function onTouchEnd(e: React.TouchEvent) {
    const start = touchX.current; touchX.current = null;
    if (start == null) return;
    const dx = e.changedTouches[0].clientX - start;
    if (Math.abs(dx) > SWIPE_PX) setI((p) => (dx < 0 ? (p + 1) % BG.length : (p - 1 + BG.length) % BG.length));
  }

  return (
    <div
      className="relative h-56 w-full overflow-hidden rounded-3xl sm:h-64"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Rotating background photos + dark overlay for legibility */}
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/60 to-black/40" />

      {/* Foreground: search + quick chips (persistent over the rotation) */}
      <div className="absolute inset-0 flex flex-col justify-center gap-3 p-5 sm:p-8">
        <h2 className="text-lg font-bold text-white sm:text-2xl">Find anything in Liberia</h2>
        <form onSubmit={onSearch} className="flex max-w-xl gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="What are you looking for today?"
            aria-label="Search the marketplace"
            className="h-11 min-w-0 flex-1 rounded-full border border-white/20 bg-white/95 px-4 text-base text-[#1a1a1a] outline-none placeholder:text-neutral-500 focus:bg-white"
          />
          <button type="submit" className="h-11 shrink-0 rounded-full bg-accent px-5 text-sm font-semibold text-[#1a1a1a] hover:brightness-95">
            Search
          </button>
        </form>
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CHIPS.map((c) => (
            <Link
              key={c.id}
              href={c.href}
              onClick={() => void trackHeroEvent(c.id, "cta")}
              className="shrink-0 whitespace-nowrap rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition-colors hover:bg-white/30"
            >
              {c.icon} {c.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Rotation dots */}
      <div className="absolute inset-x-0 bottom-2.5 z-10 flex justify-center gap-1.5">
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
