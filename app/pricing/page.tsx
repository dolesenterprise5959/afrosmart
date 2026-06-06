import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/dal";
import { getPlan } from "@/lib/firestore/premium";
import { PLANS } from "@/lib/premium";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pricing & Plans",
  description: "AfroSmart seller plans — Free, Premium and Business. Sell more with featured placement and verified badges.",
};

function priceLabel(price: number): string {
  return price === 0 ? "Free" : `L$${price.toLocaleString()}`;
}

export default async function PricingPage() {
  const session = await getCurrentUser();
  const currentPlan = session ? await getPlan(session.uid) : null;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold sm:text-3xl">Seller plans</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted">
          Start free and upgrade to sell faster with featured placement, priority search and
          verified badges.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-3xl border bg-card p-6 ${
                plan.highlight ? "border-brand shadow-sm ring-1 ring-brand/20" : "border-border"
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-0.5 text-xs font-semibold text-brand-foreground">
                  Most popular
                </span>
              )}
              <h2 className="text-lg font-bold">{plan.name}</h2>
              <p className="mt-1 text-sm text-muted">{plan.tagline}</p>
              <p className="mt-3">
                <span className="text-3xl font-bold">{priceLabel(plan.price)}</span>
                {plan.price > 0 && <span className="text-sm text-muted"> /month</span>}
              </p>

              <ul className="mt-5 flex-1 space-y-2 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-brand">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                {isCurrent ? (
                  <span className="flex h-12 items-center justify-center rounded-full border border-brand bg-brand/5 text-sm font-medium text-brand-dark">
                    ✓ Your current plan
                  </span>
                ) : plan.id === "free" ? (
                  <Button href="/listing/new" variant="outline" size="lg" className="w-full">
                    Start selling free
                  </Button>
                ) : (
                  <Button href="/contact" size="lg" className="w-full">
                    Upgrade to {plan.name}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-center text-xs text-muted">
        Online payments (mobile money &amp; cards) are coming soon. To upgrade today,{" "}
        <a href="/contact" className="text-brand">contact our team</a> and we&apos;ll activate your plan.
      </p>
    </div>
  );
}
