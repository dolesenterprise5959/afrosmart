"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { COUNTIES } from "@/lib/mock";
import { updateListing } from "@/app/listing/manage-actions";

interface Initial {
  title: string;
  description: string;
  price: string;
  currency: string;
  county: string;
  city: string;
}

const field = "h-12 w-full rounded-xl border border-border bg-card px-4 text-base outline-none focus:border-brand";

export function EditListingForm({ id, initial }: { id: string; initial: Initial }) {
  const router = useRouter();
  const [f, setF] = useState<Initial>(initial);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof Initial, v: string) => setF((p) => ({ ...p, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const res = await updateListing(id, f);
    setPending(false);
    if (res?.error) { setError(res.error); return; }
    router.push(`/listing/${id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-3">
      <input className={field} placeholder="Title" value={f.title} onChange={(e) => set("title", e.target.value)} />
      <div className="flex gap-2">
        <select className={`${field} w-24 shrink-0`} value={f.currency} onChange={(e) => set("currency", e.target.value)}>
          <option value="LRD">L$</option>
          <option value="USD">US$</option>
        </select>
        <input className={field} type="number" inputMode="numeric" placeholder="Price" value={f.price} onChange={(e) => set("price", e.target.value)} />
      </div>
      <div className="flex gap-2">
        <select className={`${field} flex-1`} value={f.county} onChange={(e) => set("county", e.target.value)}>
          <option value="">County</option>
          {COUNTIES.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
        <input className={`${field} flex-1`} placeholder="City / Town" value={f.city} onChange={(e) => set("city", e.target.value)} />
      </div>
      <textarea className="min-h-[100px] w-full rounded-xl border border-border bg-card px-4 py-3 text-base outline-none focus:border-brand" placeholder="Description" value={f.description} onChange={(e) => set("description", e.target.value)} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3">
        <Link href={`/listing/${id}`} className="inline-flex h-12 flex-1 items-center justify-center rounded-full border border-border text-base font-semibold hover:bg-surface">Cancel</Link>
        <button type="submit" disabled={pending} className="inline-flex h-12 flex-[2] items-center justify-center rounded-full bg-brand text-base font-semibold text-brand-foreground hover:bg-brand-dark disabled:opacity-50">
          {pending ? "Saving…" : "Save changes"}
        </button>
      </div>
      <p className="text-center text-xs text-muted">Photos &amp; category aren&apos;t editable here — delete &amp; repost to change those.</p>
    </form>
  );
}
