"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PLANS } from "@/lib/premium";
import type { SellerPlan } from "@/lib/types";

// Admin-only: set a user's seller plan from their profile page.
export function PlanControls({ uid, current }: { uid: string; current: SellerPlan }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function setPlan(plan: SellerPlan) {
    if (plan === current) return;
    setBusy(true);
    await fetch("/api/admin/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, plan }),
    }).catch(() => {});
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface p-4">
      <p className="text-xs font-semibold text-muted">ADMIN · Seller plan</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {PLANS.map((p) => (
          <button
            key={p.id}
            disabled={busy}
            onClick={() => setPlan(p.id)}
            className={`rounded-full border px-3 py-1 text-xs font-medium disabled:opacity-50 ${
              current === p.id ? "border-brand bg-brand/10 text-brand-dark" : "border-border"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>
    </div>
  );
}
