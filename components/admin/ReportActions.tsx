"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ReportTargetType } from "@/lib/types";

// Admin action buttons for a single report. Calls the admin route handlers and
// refreshes the server-rendered queue.
export function ReportActions({
  reportId,
  targetType,
  targetId,
  resolved,
}: {
  reportId: string;
  targetType: ReportTargetType;
  targetId: string;
  resolved: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function run(fn: () => Promise<Response>) {
    setBusy(true);
    await fn().catch(() => {});
    setBusy(false);
    router.refresh();
  }

  const moderate = (action: string) =>
    fetch("/api/admin/moderate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, targetType, targetId }),
    });

  const setStatus = (status: string) =>
    fetch(`/api/admin/reports/${reportId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

  const btn = "rounded-full border border-border px-3 py-1 text-xs font-medium disabled:opacity-50";

  return (
    <div className="flex flex-wrap gap-2">
      {targetType === "listing" ? (
        <button className={btn} disabled={busy} onClick={() => run(() => moderate("removeListing"))}>
          Remove listing
        </button>
      ) : (
        <button className={btn} disabled={busy} onClick={() => run(() => moderate("suspendUser"))}>
          Suspend user
        </button>
      )}
      {!resolved ? (
        <button
          className={`${btn} text-brand`}
          disabled={busy}
          onClick={() => run(() => setStatus("resolved"))}
        >
          Mark resolved
        </button>
      ) : (
        <button
          className={btn}
          disabled={busy}
          onClick={() => run(() => setStatus("open"))}
        >
          Reopen
        </button>
      )}
    </div>
  );
}
