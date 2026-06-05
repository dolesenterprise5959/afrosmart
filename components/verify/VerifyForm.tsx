"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { requestVerificationAction } from "@/app/verify/actions";

export function VerifyForm() {
  const router = useRouter();
  const [type, setType] = useState("seller");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const res = await requestVerificationAction({ type, note }).catch(() => ({
      error: "Something went wrong. Try again.",
    }));
    setPending(false);
    if (res?.error) setError(res.error);
    else router.refresh();
  }

  const field =
    "w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-brand";

  return (
    <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">What are you applying for?</span>
        <select className={field} value={type} onChange={(e) => setType(e.target.value)}>
          <option value="seller">Verified Seller — individual</option>
          <option value="business">Verified Business — shop or company</option>
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Tell us about yourself</span>
        <textarea
          className={`${field} min-h-28`}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={500}
          placeholder="Your business name, what you sell, how long you've been trading, or anything that helps us verify you."
        />
        <span className="text-xs text-muted">{note.length}/500</span>
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 w-full items-center justify-center rounded-full bg-brand text-base font-medium text-brand-foreground hover:bg-brand-dark disabled:opacity-50"
      >
        {pending ? "Submitting…" : "Submit verification request"}
      </button>
    </form>
  );
}
