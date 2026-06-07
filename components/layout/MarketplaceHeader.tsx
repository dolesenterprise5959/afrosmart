"use client";

import { useState } from "react";

// Compact, expandable marketplace header — collapsed by default to save screen
// space on mobile; expands to show the full AfroSmart tagline.
export function MarketplaceHeader() {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 px-3.5 py-2 text-left"
      >
        <span className="flex items-center gap-1.5 text-sm font-semibold">
          <span aria-hidden className="text-base">🇱🇷</span> Liberia Marketplace
        </span>
        <span aria-hidden className={`text-xs text-muted transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>
      {open && (
        <div className="border-t border-border px-3.5 py-2.5">
          <p className="text-sm font-semibold">AfroSmart — Liberia&apos;s Community Marketplace</p>
          <p className="mt-1 text-sm text-muted">Buy • Sell • Connect Across Liberia</p>
          <p className="mt-0.5 text-sm text-muted">Food, Cars, Real Estate, Jobs, Services</p>
        </div>
      )}
    </div>
  );
}
