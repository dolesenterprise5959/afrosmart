"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import type { ReportReason, ReportTargetType } from "@/lib/types";

const REASONS: { id: ReportReason; label: string }[] = [
  { id: "scam", label: "Scam" },
  { id: "spam", label: "Spam" },
  { id: "fake", label: "Fake item" },
  { id: "wrong_category", label: "Wrong category" },
];

// Lightweight expanding report panel (no modal library). Posts to /api/reports.
export function ReportDialog({
  targetType,
  targetId,
  label = "Report",
}: {
  targetType: ReportTargetType;
  targetId: string;
  label?: string;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | "">("");
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (done) {
    return <p className="text-center text-xs text-muted">✓ Reported. Thank you.</p>;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          if (!user) {
            router.push(`/login?next=/`);
            return;
          }
          setOpen(true);
        }}
        className="text-center text-xs text-muted underline"
      >
        🚩 {label}
      </button>
    );
  }

  async function submit() {
    if (!reason) {
      setError("Please choose a reason.");
      return;
    }
    setPending(true);
    setError(null);
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetType, targetId, reason, note }),
    });
    const data = await res.json().catch(() => ({}));
    setPending(false);
    if (!res.ok) {
      setError(data.error ?? "Could not submit report");
      return;
    }
    setDone(true);
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-3 text-sm">
      <p className="font-medium">Report this {targetType}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {REASONS.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setReason(r.id)}
            className={`rounded-full border px-3 py-1 text-xs ${
              reason === r.id
                ? "border-brand bg-brand text-brand-foreground"
                : "border-border bg-card text-foreground"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
      <textarea
        className="mt-2 min-h-16 w-full rounded-xl border border-border bg-card p-2 text-sm outline-none focus:border-brand"
        placeholder="Add details (optional)"
        value={note}
        maxLength={500}
        onChange={(e) => setNote(e.target.value)}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="inline-flex h-9 items-center rounded-full bg-brand px-4 text-xs font-medium text-brand-foreground disabled:opacity-50"
        >
          {pending ? "Sending…" : "Submit report"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="inline-flex h-9 items-center rounded-full px-3 text-xs text-muted"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
