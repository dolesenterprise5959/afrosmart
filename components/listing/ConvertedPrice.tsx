import { cookies } from "next/headers";
import { formatPrice } from "@/lib/mock";
import { getUsdLrdRate, convertPrice } from "@/lib/exchange";
import type { Currency } from "@/lib/types";

// Shows a price plus its approximate conversion in the other currency, e.g.
//   L$ 5,000
//   ≈ US$ 25
// The seller's original currency is always stored; the user's display preference
// (cookie afm_ccy) decides which currency is shown first.
export async function ConvertedPrice({
  amount,
  currency = "LRD",
  className,
}: {
  amount: number;
  currency?: Currency;
  className?: string;
}) {
  if (!amount || amount <= 0) {
    return <span className={["font-bold text-foreground", className].filter(Boolean).join(" ")}>Free</span>;
  }

  const pref: Currency = (await cookies()).get("afm_ccy")?.value === "USD" ? "USD" : "LRD";
  const rate = await getUsdLrdRate();
  const other: Currency = currency === "USD" ? "LRD" : "USD";

  const valueIn = (c: Currency) => (c === currency ? amount : convertPrice(amount, currency, rate).value);
  const top = pref;
  const bottom: Currency = pref === "LRD" ? "USD" : "LRD";

  return (
    <span className="inline-flex flex-col leading-tight">
      <span className={["font-bold text-foreground", className].filter(Boolean).join(" ")}>
        {top !== currency ? "≈ " : ""}{formatPrice(valueIn(top), top)}
      </span>
      <span className="text-xs font-normal text-muted">
        {bottom !== currency ? "≈ " : ""}{formatPrice(valueIn(bottom), bottom)}
      </span>
      <span className="sr-only">Original currency: {currency} ({other} approximate)</span>
    </span>
  );
}
