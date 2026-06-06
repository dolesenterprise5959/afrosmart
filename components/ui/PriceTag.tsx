import { formatPrice } from "@/lib/mock";
import type { Currency } from "@/lib/types";

export function PriceTag({
  amount,
  currency = "LRD",
  className,
}: {
  amount: number;
  currency?: Currency;
  className?: string;
}) {
  return (
    <span className={["font-bold text-brand-dark", className].filter(Boolean).join(" ")}>
      {formatPrice(amount, currency)}
    </span>
  );
}
