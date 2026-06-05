"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Approve/reject buttons for a single pending verification request.
export function VerificationActions({ uid }: { uid: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function run(body: Record<string, string>) {
    setBusy(true);
    await fetch("/api/admin/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => {});
    setBusy(false);
    router.refresh();
  }

  const btn = "rounded-full border border-border px-3 py-1 text-xs font-medium disabled:opacity-50";

  return (
    <div className="flex flex-wrap gap-2">
      <button className={`${btn} text-brand`} disabled={busy} onClick={() => run({ action: "approve", uid, type: "seller" })}>
        Approve seller
      </button>
      <button className={`${btn} text-blue-700`} disabled={busy} onClick={() => run({ action: "approve", uid, type: "business" })}>
        Approve business
      </button>
      <button className={btn} disabled={busy} onClick={() => run({ action: "reject", uid })}>
        Reject
      </button>
    </div>
  );
}
