import Image, { type StaticImageData } from "next/image";
import ecobank from "../../public/ads/ecobank.png";
import lonestar from "../../public/ads/lonestar.png";

// Approved minimalist advertisement format:
//
//   Ecobank Liberia • Sponsored
//   [ advertisement image ]
//
// Rules (deliberate): show only the advertiser name + a small "Sponsored" label,
// then let the image do the selling. No headlines, no CTA buttons, no extra
// logos, no promotional copy — so ads feel native to the marketplace.
//
// To go live: drop a creative in /public/ads (e.g. ecobank.webp) and set `image`.
export interface Sponsor {
  /** Advertiser name shown above the creative. */
  name: string;
  /** Bundled creative (static import → served from /_next/static/media). */
  image?: StaticImageData;
  /** Optional click-through to the advertiser. */
  href?: string;
}

const SPONSORS: Sponsor[] = [
  { name: "Ecobank Liberia", image: ecobank },
  { name: "LoneStar Storage", image: lonestar },
];

export function SponsoredAd({ sponsor }: { sponsor?: Sponsor }) {
  // Rotate sponsors by day so the slot isn't static (deterministic for SSR).
  const ad = sponsor ?? SPONSORS[new Date().getUTCDay() % SPONSORS.length];

  const card = (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* Advertiser + small Sponsored label — the only text. */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <span className="text-sm font-semibold text-foreground">{ad.name}</span>
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted">Sponsored</span>
      </div>
      {/* The creative does the selling. Until a real image is supplied, a clean
          branded panel keeps the slot looking intentional (never an empty box). */}
      <div className="relative aspect-[16/9] w-full">
        {ad.image ? (
          <Image
            src={ad.image}
            alt={ad.name}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-900 to-black">
            <span className="text-lg font-semibold tracking-tight text-white/90">{ad.name}</span>
          </div>
        )}
      </div>
    </div>
  );

  if (!ad.href) return card;
  return (
    <a href={ad.href} target="_blank" rel="noopener noreferrer sponsored" className="block">
      {card}
    </a>
  );
}
