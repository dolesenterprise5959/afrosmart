"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveNameAction } from "@/app/welcome/actions";

export function NameForm({ next }: { next: string }) {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!firstName.trim()) {
      setError("Please enter your first name.");
      return;
    }
    setPending(true);
    const res = await saveNameAction({ firstName, lastName });
    if (res?.error) {
      setError(res.error);
      setPending(false);
      return;
    }
    router.replace(next);
    router.refresh();
  }

  const field =
    "h-12 w-full rounded-xl border border-border bg-card px-4 text-base outline-none focus:border-brand";

  return (
    <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">First name</span>
        <input
          className={field}
          autoFocus
          autoComplete="given-name"
          placeholder="e.g. Musu"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">
          Last name <span className="text-muted">(optional)</span>
        </span>
        <input
          className={field}
          autoComplete="family-name"
          placeholder="e.g. Kollie"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 w-full items-center justify-center rounded-full bg-brand text-base font-medium text-brand-foreground hover:bg-brand-dark disabled:opacity-50"
      >
        {pending ? "Saving…" : "Continue"}
      </button>
      <p className="text-center text-xs text-muted">You can add a profile photo later in Settings.</p>
    </form>
  );
}
