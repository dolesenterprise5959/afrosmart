"use client";

import { useRouter } from "next/navigation";
import type { Currency } from "@/lib/types";

// Display preference for prices (L$ vs US$), stored in a cookie so the server can
// render the preferred currency first. The seller's original currency is kept;
// the other is shown as an approximate conversion under it.
export function CurrencyPreference({ current }: { current: Currency }) {
  const router = useRouter();

  function choose(c: Currency) {
    // eslint-disable-next-line react-hooks/immutability -- writing a browser cookie
    document.cookie = `afm_ccy=${c};path=/;max-age=31536000;samesite=lax`;
    router.refresh();
  }

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-0.5 text-xs">
      <span className="pl-2 pr-0.5 text-muted">Show in</span>
      {(["LRD", "USD"] as const).map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => choose(c)}
          className={`rounded-full px-2.5 py-1 font-semibold transition-colors ${
            current === c ? "bg-brand text-brand-foreground" : "text-muted hover:text-foreground"
          }`}
        >
          {c === "LRD" ? "L$" : "US$"}
        </button>
      ))}
    </div>
  );
}
