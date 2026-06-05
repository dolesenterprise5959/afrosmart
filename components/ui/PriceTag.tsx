import { formatPrice } from "@/lib/mock";

export function PriceTag({
  amount,
  className,
}: {
  amount: number;
  className?: string;
}) {
  return (
    <span className={["font-bold text-brand-dark", className].filter(Boolean).join(" ")}>
      {formatPrice(amount)}
    </span>
  );
}
