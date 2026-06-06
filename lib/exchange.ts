import "server-only";
import { cache } from "react";
import type { Currency } from "@/lib/types";

// Live USD→LRD exchange rate with caching + fallback. Used to show an approximate
// conversion under every price so Liberians at home and abroad understand pricing.

/** Fallback rate (LRD per 1 USD) if the live service is unavailable. */
export const FALLBACK_USD_LRD = 190;

let memo: { rate: number; at: number } | null = null;
const TTL_MS = 6 * 60 * 60 * 1000; // refresh at most every 6h

async function fetchRate(): Promise<number> {
  if (memo && Date.now() - memo.at < TTL_MS) return memo.rate;
  try {
    // Free, no-key endpoint; Next caches the fetch for 6h as well.
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 21600 },
    });
    if (res.ok) {
      const json = (await res.json()) as { rates?: Record<string, number> };
      const rate = json.rates?.LRD;
      if (typeof rate === "number" && rate > 1) {
        memo = { rate, at: Date.now() };
        return rate;
      }
    }
  } catch {
    // fall through to memo/fallback
  }
  return memo?.rate ?? FALLBACK_USD_LRD;
}

/** Cached per-request via React cache(); module memo persists across requests. */
export const getUsdLrdRate = cache(fetchRate);

/** Convert an amount to the other currency. Returns the converted whole number. */
export function convertPrice(amount: number, from: Currency, rate: number): { currency: Currency; value: number } {
  if (from === "USD") return { currency: "LRD", value: Math.round(amount * rate) };
  return { currency: "USD", value: Math.round(amount / rate) };
}
