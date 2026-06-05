"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { COUNTIES } from "@/lib/mock";
import { logout } from "@/lib/firebase/auth-client";
import { Button } from "@/components/ui/Button";
import { updateProfileAction } from "@/app/settings/actions";

interface Props {
  initial: {
    displayName: string;
    county: string;
    city: string;
    isBusiness: boolean;
    phone: string | null;
  };
}

export function SettingsForm({ initial }: Props) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [county, setCounty] = useState(initial.county);
  const [city, setCity] = useState(initial.city);
  const [isBusiness, setIsBusiness] = useState(initial.isBusiness);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const field =
    "h-11 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-brand";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setSaved(false);
    const result = await updateProfileAction({ displayName, county, city, isBusiness });
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSaved(true);
    router.refresh();
  }

  async function onLogout() {
    await logout();
    router.replace("/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Name</span>
        <input className={field} value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
      </label>

      {initial.phone && (
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Phone</span>
          <input className={`${field} text-muted`} value={initial.phone} disabled />
          <span className="text-xs text-muted">Your phone number is private and never shown publicly.</span>
        </label>
      )}

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">County</span>
          <select className={field} value={county} onChange={(e) => setCounty(e.target.value)}>
            <option value="">Select county</option>
            {COUNTIES.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">City</span>
          <input className={field} value={city} onChange={(e) => setCity(e.target.value)} />
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isBusiness}
          onChange={(e) => setIsBusiness(e.target.checked)}
        />
        This is a business account
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm text-brand-dark">✓ Saved.</p>}

      <div className="flex items-center justify-between">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
        <Button type="button" variant="ghost" onClick={onLogout}>
          Log out
        </Button>
      </div>
    </form>
  );
}
