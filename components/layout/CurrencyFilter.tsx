"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const STORAGE_KEY = "afrosmart:currency";

/** Currency selector/filter (LRD / USD) synced to the `currency` URL param and
 *  remembered in localStorage across visits. */
export function CurrencyFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const current = params.get("currency") ?? "";

  // Re-apply the remembered currency when arriving without one set in the URL.
  useEffect(() => {
    if (current) return;
    const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved === "USD" || saved === "LRD") {
      const sp = new URLSearchParams(params.toString());
      sp.set("currency", saved);
      router.replace(`${pathname}?${sp.toString()}`);
    }
  }, [current, params, pathname, router]);

  function set(value: string) {
    if (typeof window !== "undefined") {
      if (value) localStorage.setItem(STORAGE_KEY, value);
      else localStorage.removeItem(STORAGE_KEY);
    }
    const sp = new URLSearchParams(params.toString());
    if (value) sp.set("currency", value);
    else sp.delete("currency");
    const qs = sp.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <select
      value={current}
      onChange={(e) => set(e.target.value)}
      aria-label="Currency"
      className="h-10 shrink-0 rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-brand"
    >
      <option value="">All currencies</option>
      <option value="LRD">L$ LRD</option>
      <option value="USD">$ USD</option>
    </select>
  );
}
