"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { COUNTIES } from "@/lib/mock";
import { logout } from "@/lib/firebase/auth-client";
import { uploadProfilePhoto } from "@/lib/firebase/storage-client";
import { useAuth } from "@/components/auth/AuthProvider";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { updateProfileAction, setProfilePhotoAction } from "@/app/settings/actions";

interface Props {
  initial: {
    displayName: string;
    photoURL?: string;
    county: string;
    city: string;
    isBusiness: boolean;
    phone: string | null;
  };
}

export function SettingsForm({ initial }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [photoURL, setPhotoURL] = useState<string | undefined>(initial.photoURL);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [county, setCounty] = useState(initial.county);
  const [city, setCity] = useState(initial.city);
  const [isBusiness, setIsBusiness] = useState(initial.isBusiness);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const field =
    "h-11 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-brand";

  async function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setError(null);
    setPhotoBusy(true);
    try {
      const url = await uploadProfilePhoto(file, user.uid);
      const res = await setProfilePhotoAction(url);
      if (res.error) throw new Error(res.error);
      setPhotoURL(url);
      router.refresh();
    } catch {
      setError("Could not upload that photo. Please try a different image.");
    } finally {
      setPhotoBusy(false);
    }
  }

  async function onRemovePhoto() {
    setPhotoBusy(true);
    setError(null);
    await setProfilePhotoAction(null);
    setPhotoURL(undefined);
    setPhotoBusy(false);
    router.refresh();
  }

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
      {/* Profile photo */}
      <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
        <span className="rounded-full ring-2 ring-accent/30">
          <Avatar name={displayName || "AfroSmart user"} photoURL={photoURL} size="lg" />
        </span>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Profile photo</span>
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex h-9 cursor-pointer items-center rounded-full bg-brand px-4 text-sm font-medium text-brand-foreground hover:bg-brand-dark">
              {photoBusy ? "Uploading…" : photoURL ? "Change" : "Upload"}
              <input type="file" accept="image/*" onChange={onPickPhoto} disabled={photoBusy} className="hidden" />
            </label>
            {photoURL && (
              <Button type="button" variant="outline" size="sm" onClick={onRemovePhoto} disabled={photoBusy}>
                Remove
              </Button>
            )}
          </div>
          <span className="text-xs text-muted">A clear photo builds trust. JPG or PNG.</span>
        </div>
      </div>

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
