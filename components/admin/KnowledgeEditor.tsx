"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveEntryAction, deleteEntryAction } from "@/app/admin/assistant/actions";
import type { KBEntry } from "@/lib/assistant/knowledge";

const field = "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-brand";

function EntryForm({ entry, onDone }: { entry?: KBEntry; onDone: () => void }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function action(form: FormData) {
    setPending(true);
    const res = await saveEntryAction(form);
    setPending(false);
    if (res?.error) { setError(res.error); return; }
    router.refresh();
    onDone();
  }

  return (
    <form action={action} className="mt-2 space-y-2 rounded-xl border border-border bg-surface p-3">
      <input type="hidden" name="id" defaultValue={entry?.id ?? ""} />
      <input name="title" defaultValue={entry?.title} placeholder="Title (e.g. How to log in)" className={field} />
      <textarea name="answer" defaultValue={entry?.answer} placeholder="Answer (use *bold* and new lines)" className={`${field} min-h-[90px]`} />
      <input name="keywords" defaultValue={entry?.keywords.join(", ")} placeholder="Keywords, comma-separated (log in, sign in, otp)" className={field} />
      <input name="quickReplies" defaultValue={entry?.quickReplies?.join(", ")} placeholder="Quick replies, comma-separated" className={field} />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-brand-foreground disabled:opacity-50">
          {pending ? "Saving…" : "Save"}
        </button>
        <button type="button" onClick={onDone} className="rounded-full border border-border px-4 py-1.5 text-sm">Cancel</button>
      </div>
    </form>
  );
}

export function KnowledgeEditor({ entries }: { entries: KBEntry[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  async function remove(id: string) {
    if (!confirm("Delete this knowledge entry?")) return;
    await deleteEntryAction(id);
    router.refresh();
  }

  return (
    <div className="mt-5">
      <button type="button" onClick={() => { setAdding((a) => !a); setEditing(null); }} className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground">
        + Add entry
      </button>
      {adding && <EntryForm onDone={() => setAdding(false)} />}

      <ul className="mt-4 space-y-2">
        {entries.map((e) => (
          <li key={e.id} className="rounded-xl border border-border bg-card p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold">{e.title}</p>
                <p className="mt-0.5 line-clamp-2 whitespace-pre-line text-xs text-muted">{e.answer}</p>
                <p className="mt-1 text-[11px] text-muted">Keywords: {e.keywords.join(", ") || "—"}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button type="button" onClick={() => { setEditing(editing === e.id ? null : e.id); setAdding(false); }} className="rounded-full border border-border px-3 py-1 text-xs">Edit</button>
                <button type="button" onClick={() => remove(e.id)} className="rounded-full border border-border px-3 py-1 text-xs text-red-600">Delete</button>
              </div>
            </div>
            {editing === e.id && <EntryForm entry={e} onDone={() => setEditing(null)} />}
          </li>
        ))}
      </ul>
    </div>
  );
}
