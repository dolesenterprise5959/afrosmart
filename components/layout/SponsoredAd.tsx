// Sponsored advertisement slot — a professional placeholder today, ready to host
// business ads, featured sellers, and bank / telecom / real-estate promotions.
export function SponsoredAd() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-accent/40 bg-gradient-to-br from-neutral-900 to-black px-5 py-5 text-white">
      <span className="absolute right-3 top-3 rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
        Sponsored
      </span>
      <p className="text-sm font-semibold">Sponsored Advertisement</p>
      <p className="mt-1 max-w-md text-xs text-white/65">
        Your business, featured listing, or promotion could appear here — reaching buyers across Liberia and abroad.
      </p>
      <p className="mt-3 text-[11px] text-white/40">
        Business ads · Featured sellers · Bank, telecom &amp; real-estate promotions
      </p>
    </div>
  );
}
