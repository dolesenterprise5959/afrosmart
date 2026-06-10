"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Check, Undo2, Play, Pause, Trash2 } from "lucide-react";
import {
  markSold, markAvailable, pauseListing, unpauseListing, deleteListing,
} from "@/app/listing/manage-actions";
import type { ListingStatus } from "@/lib/types";

type ManageResult = { ok?: boolean; error?: string };

// The owner-only ⋮ control overlaid on a listing card. Kept as a thin client
// component so the card itself stays server-rendered.
export function ListingMenu({ id, status }: { id: string; status: ListingStatus }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  async function run(fn: (id: string) => Promise<ManageResult>) {
    setBusy(true);
    setOpen(false);
    const res = await fn(id);
    setBusy(false);
    if (res?.error) { alert(res.error); return; }
    router.refresh();
  }

  return (
    <>
      <div className="absolute right-2 top-2 z-20">
        <button
          type="button"
          aria-label="Manage listing"
          onClick={() => setOpen((o) => !o)}
          className="grid h-8 w-8 place-items-center rounded-full bg-black/55 text-lg leading-none text-white backdrop-blur hover:bg-black/70"
        >
          ⋮
        </button>
        {open && (
          <>
            <button type="button" aria-hidden tabIndex={-1} className="fixed inset-0 z-10 cursor-default" onClick={() => setOpen(false)} />
            <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-xl border border-border bg-card text-sm shadow-lg">
              <Link href={`/listing/${id}/edit`} className="flex items-center gap-2 px-3 py-2.5 hover:bg-surface"><Pencil className="h-4 w-4" /> Edit</Link>
              {status !== "sold" ? (
                <button type="button" disabled={busy} onClick={() => run(markSold)} className="flex w-full items-center gap-2 px-3 py-2.5 text-left hover:bg-surface"><Check className="h-4 w-4" /> Mark as Sold</button>
              ) : (
                <button type="button" disabled={busy} onClick={() => run(markAvailable)} className="flex w-full items-center gap-2 px-3 py-2.5 text-left hover:bg-surface"><Undo2 className="h-4 w-4" /> Mark Available</button>
              )}
              {status === "paused" ? (
                <button type="button" disabled={busy} onClick={() => run(unpauseListing)} className="flex w-full items-center gap-2 px-3 py-2.5 text-left hover:bg-surface"><Play className="h-4 w-4" /> Unpause</button>
              ) : status === "active" ? (
                <button type="button" disabled={busy} onClick={() => run(pauseListing)} className="flex w-full items-center gap-2 px-3 py-2.5 text-left hover:bg-surface"><Pause className="h-4 w-4" /> Pause</button>
              ) : null}
              <button type="button" onClick={() => { setOpen(false); setConfirmDel(true); }} className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-red-600 hover:bg-surface"><Trash2 className="h-4 w-4" /> Delete</button>
            </div>
          </>
        )}
      </div>

      {confirmDel && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 rounded-xl bg-card/95 p-4 text-center">
          <p className="text-sm font-semibold">Delete this listing?</p>
          <p className="text-xs text-muted">Tip: &ldquo;Mark as Sold&rdquo; keeps it in your history and lets you relist later.</p>
          <div className="mt-1 flex gap-2">
            <button type="button" onClick={() => setConfirmDel(false)} className="rounded-full border border-border px-4 py-1.5 text-sm font-medium">Cancel</button>
            <button type="button" disabled={busy} onClick={() => run(deleteListing)} className="rounded-full bg-red-600 px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50">Delete</button>
          </div>
        </div>
      )}
    </>
  );
}
