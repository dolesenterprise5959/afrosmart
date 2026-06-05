"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { COUNTIES } from "@/lib/mock";

// Updates the `county` URL search param while preserving other params (e.g. q).
export function CountyFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const current = params.get("county") ?? "";

  function onChange(value: string) {
    const sp = new URLSearchParams(Array.from(params.entries()));
    if (value) sp.set("county", value);
    else sp.delete("county");
    const qs = sp.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <select
      aria-label="Filter by county"
      value={current}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-full border border-border bg-card px-3 text-sm outline-none focus:border-brand"
    >
      <option value="">All counties</option>
      {COUNTIES.map((c) => (
        <option key={c.id} value={c.name}>
          {c.name}
        </option>
      ))}
    </select>
  );
}
