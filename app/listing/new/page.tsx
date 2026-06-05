"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { CATEGORIES, COUNTIES } from "@/lib/mock";
import { useAuth } from "@/components/auth/AuthProvider";
import { uploadListingPhotos } from "@/lib/firebase/storage-client";
import { createListingAction } from "@/app/listing/new/actions";

const MAX_PHOTOS = 6;

export default function NewListingPage() {
  const { user, configured } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const field =
    "h-11 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-brand";

  function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []).slice(0, MAX_PHOTOS);
    setFiles(picked);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const form = new FormData(e.currentTarget);

      // Upload photos to Storage first (needs the signed-in user's uid).
      let photos: string[] = [];
      if (files.length > 0 && user) {
        photos = await uploadListingPhotos(files, user.uid);
      }

      const result = await createListingAction({
        title: String(form.get("title") ?? ""),
        description: String(form.get("description") ?? ""),
        price: String(form.get("price") ?? ""),
        category: String(form.get("category") ?? ""),
        county: String(form.get("county") ?? ""),
        city: String(form.get("city") ?? ""),
        photos,
      });

      // On success the action redirects; only errors return here.
      if (result?.error) setError(result.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <h1 className="text-xl font-bold">Post a listing</h1>
      <p className="mt-1 text-sm text-muted">
        Reach buyers across Liberia. Posting is free.
      </p>

      {!configured && (
        <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          ⚠️ Firebase isn’t configured yet, so posting is disabled. See{" "}
          <code>.env.local.example</code>.
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">
            Photos <span className="text-muted">(up to {MAX_PHOTOS})</span>
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={onPickFiles}
            className="text-sm"
          />
          {files.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-2">
              {files.map((f, i) => (
                <Badge key={i} tone="neutral">
                  🖼️ {f.name.length > 18 ? `${f.name.slice(0, 16)}…` : f.name}
                </Badge>
              ))}
            </div>
          )}
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Title</span>
          <input name="title" className={field} placeholder="e.g. Toyota Corolla 2014" required />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Description</span>
          <textarea
            name="description"
            className="min-h-28 w-full rounded-xl border border-border bg-card p-3 text-sm outline-none focus:border-brand"
            placeholder="Describe your item, condition, and what's included"
            required
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Price (L$)</span>
            <input name="price" className={field} inputMode="numeric" placeholder="0" required />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Category</span>
            <select name="category" className={field} defaultValue="" required>
              <option value="" disabled>
                Select
              </option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">County</span>
            <select name="county" className={field} defaultValue="" required>
              <option value="" disabled>
                Select county
              </option>
              {COUNTIES.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">City</span>
            <input name="city" className={field} placeholder="e.g. Monrovia" required />
          </label>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={pending || !configured}
          className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-full bg-brand text-base font-medium text-brand-foreground hover:bg-brand-dark disabled:opacity-50"
        >
          {pending ? "Posting…" : "Post listing"}
        </button>
      </form>
    </div>
  );
}
