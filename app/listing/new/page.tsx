"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { COUNTIES } from "@/lib/mock";
import { CATEGORY_GROUPS } from "@/lib/categories";
import {
  FUEL_TYPES,
  POPULAR_MAKES,
  TRANSMISSIONS,
  VEHICLE_CONDITIONS,
  VEHICLE_NEWEST_YEAR,
  VEHICLE_OLDEST_YEAR,
} from "@/lib/vehicles";
import { LISTING_TYPES, PROPERTY_TYPES } from "@/lib/properties";
import { isServiceCategory } from "@/lib/services";
import { useAuth } from "@/components/auth/AuthProvider";
import { uploadListingPhotos } from "@/lib/firebase/storage-client";
import { createListingAction } from "@/app/listing/new/actions";

const MAX_PHOTOS = 10;

export default function NewListingPage() {
  const { user, configured } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [category, setCategory] = useState("");
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

    // Require at least one photo (the first becomes the cover image).
    if (files.length === 0) {
      setError("Please add at least one photo of your item.");
      return;
    }

    setPending(true);
    try {
      const form = new FormData(e.currentTarget);

      // Upload photos to Storage first (needs the signed-in user's uid).
      let photos: string[] = [];
      if (files.length > 0 && user) {
        photos = await uploadListingPhotos(files, user.uid);
      }

      const isCar = String(form.get("category") ?? "") === "cars";
      const result = await createListingAction({
        title: String(form.get("title") ?? ""),
        description: String(form.get("description") ?? ""),
        price: String(form.get("price") ?? ""),
        currency: String(form.get("currency") ?? "LRD"),
        category: String(form.get("category") ?? ""),
        county: String(form.get("county") ?? ""),
        city: String(form.get("city") ?? ""),
        photos,
        vehicle: isCar
          ? {
              make: String(form.get("v_make") ?? ""),
              model: String(form.get("v_model") ?? ""),
              year: String(form.get("v_year") ?? ""),
              mileage: String(form.get("v_mileage") ?? ""),
              condition: String(form.get("v_condition") ?? ""),
              fuelType: String(form.get("v_fuelType") ?? ""),
              transmission: String(form.get("v_transmission") ?? ""),
              exteriorColor: String(form.get("v_exteriorColor") ?? ""),
              interiorColor: String(form.get("v_interiorColor") ?? ""),
              vin: String(form.get("v_vin") ?? ""),
            }
          : undefined,
        property:
          String(form.get("category") ?? "") === "property"
            ? {
                listingType: String(form.get("p_listingType") ?? ""),
                propertyType: String(form.get("p_propertyType") ?? ""),
                bedrooms: String(form.get("p_bedrooms") ?? ""),
                bathrooms: String(form.get("p_bathrooms") ?? ""),
                squareFeet: String(form.get("p_squareFeet") ?? ""),
                landSize: String(form.get("p_landSize") ?? ""),
              }
            : undefined,
        service: isServiceCategory(String(form.get("category") ?? ""))
          ? {
              businessName: String(form.get("s_businessName") ?? ""),
              phone: String(form.get("s_phone") ?? ""),
              whatsapp: String(form.get("s_whatsapp") ?? ""),
            }
          : undefined,
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
            Photos <span className="text-muted">(1–{MAX_PHOTOS} required · first photo is the cover)</span>
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
                <Badge key={i} tone={i === 0 ? "accent" : "neutral"}>
                  {i === 0 ? "⭐ Cover · " : "🖼️ "}{f.name.length > 16 ? `${f.name.slice(0, 14)}…` : f.name}
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
            <span className="text-sm font-medium">Price</span>
            <div className="flex gap-2">
              <select name="currency" defaultValue="LRD" className={`${field} w-24 shrink-0`}>
                <option value="LRD">L$ LRD</option>
                <option value="USD">$ USD</option>
              </select>
              <input name="price" className={field} inputMode="numeric" placeholder="0" required />
            </div>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Category</span>
            <select
              name="category"
              className={field}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="" disabled>
                Select
              </option>
              {CATEGORY_GROUPS.map((g) => (
                <optgroup key={g.id} label={`${g.icon} ${g.label}`}>
                  {g.categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
        </div>

        {/* Vehicle details — shown for the Cars category */}
        {category === "cars" && (
          <fieldset className="rounded-2xl border border-border bg-surface p-4">
            <legend className="px-1 text-sm font-semibold">🚗 Vehicle details</legend>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">Make</span>
                <input name="v_make" className={field} list="vehicle-makes" placeholder="Toyota" required />
                <datalist id="vehicle-makes">
                  {POPULAR_MAKES.map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">Model</span>
                <input name="v_model" className={field} placeholder="Corolla" required />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">Year</span>
                <input
                  name="v_year"
                  type="number"
                  min={VEHICLE_OLDEST_YEAR}
                  max={VEHICLE_NEWEST_YEAR}
                  className={field}
                  placeholder="2014"
                  required
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">Mileage (km)</span>
                <input name="v_mileage" type="number" min={0} className={field} placeholder="85000" required />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">Condition</span>
                <select name="v_condition" className={field} defaultValue="used">
                  {VEHICLE_CONDITIONS.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">Fuel type</span>
                <select name="v_fuelType" className={field} defaultValue="petrol">
                  {FUEL_TYPES.map((f) => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">Transmission</span>
                <select name="v_transmission" className={field} defaultValue="automatic">
                  {TRANSMISSIONS.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">VIN <span className="text-muted">(optional)</span></span>
                <input name="v_vin" className={field} placeholder="Chassis / VIN" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">Exterior colour</span>
                <input name="v_exteriorColor" className={field} placeholder="Silver" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">Interior colour</span>
                <input name="v_interiorColor" className={field} placeholder="Black" />
              </label>
            </div>
          </fieldset>
        )}

        {/* Property details — shown for the Real Estate category */}
        {category === "property" && (
          <fieldset className="rounded-2xl border border-border bg-surface p-4">
            <legend className="px-1 text-sm font-semibold">🏠 Property details</legend>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">Listing type</span>
                <select name="p_listingType" className={field} defaultValue="sale">
                  {LISTING_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">Property type</span>
                <select name="p_propertyType" className={field} defaultValue="house">
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">Bedrooms</span>
                <input name="p_bedrooms" type="number" min={0} className={field} placeholder="3" defaultValue="0" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">Bathrooms</span>
                <input name="p_bathrooms" type="number" min={0} className={field} placeholder="2" defaultValue="0" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">Floor area (sq ft)</span>
                <input name="p_squareFeet" type="number" min={0} className={field} placeholder="1200" defaultValue="0" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">Land size (sq ft) <span className="text-muted">(optional)</span></span>
                <input name="p_landSize" type="number" min={0} className={field} placeholder="5000" defaultValue="0" />
              </label>
            </div>
            <p className="mt-2 text-xs text-muted">For rentals, enter the monthly rent in the Price field above.</p>
          </fieldset>
        )}

        {/* Business contact — shown for service categories (public on services) */}
        {isServiceCategory(category) && (
          <fieldset className="rounded-2xl border border-border bg-surface p-4">
            <legend className="px-1 text-sm font-semibold">🏪 Business details</legend>
            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">Business name</span>
                <input name="s_businessName" className={field} placeholder="e.g. Sharp Cuts Barber" />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium">Phone <span className="text-muted">(public)</span></span>
                  <input name="s_phone" type="tel" className={field} placeholder="0770 000 000" />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium">WhatsApp <span className="text-muted">(public)</span></span>
                  <input name="s_whatsapp" type="tel" className={field} placeholder="0770 000 000" />
                </label>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted">
              For services, your phone &amp; WhatsApp are shown publicly so customers can reach you directly.
            </p>
          </fieldset>
        )}

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
