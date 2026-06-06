"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

/** Currency filter (LRD / USD) synced to the `currency` URL param. */
export function CurrencyFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const current = params.get("currency") ?? "";

  function set(value: string) {
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
      aria-label="Filter by currency"
      className="h-10 shrink-0 rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-brand"
    >
      <option value="">All currencies</option>
      <option value="LRD">L$ LRD</option>
      <option value="USD">$ USD</option>
    </select>
  );
}
