"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { uploadListingPhotos } from "@/lib/firebase/storage-client";
import { createListingAction } from "@/app/listing/new/actions";
import { COUNTIES, formatPrice } from "@/lib/mock";
import { townsForCounty, OTHER_TOWN } from "@/lib/liberia-towns";
import { VEHICLE_CONDITIONS } from "@/lib/vehicles";
import { LISTING_TYPES, PROPERTY_TYPES } from "@/lib/properties";
import type { Currency } from "@/lib/types";

type Kind = "vehicle" | "property" | "rental" | "phone" | "service" | "general" | "community";

const QUICK: { id: string; label: string; icon: string; kind: Kind }[] = [
  { id: "cars", label: "Cars", icon: "🚗", kind: "vehicle" },
  { id: "property", label: "Real Estate", icon: "🏠", kind: "property" },
  { id: "rentals", label: "Rentals", icon: "🏘", kind: "rental" },
  { id: "phones", label: "Phones", icon: "📱", kind: "phone" },
  { id: "services", label: "Services", icon: "🛠", kind: "service" },
  { id: "general", label: "Other", icon: "📦", kind: "general" },
  // Community board — these post without a price (handled as "Free").
  { id: "free-stuff", label: "Free Stuff", icon: "🎁", kind: "community" },
  { id: "wanted", label: "Wanted", icon: "🔎", kind: "community" },
  { id: "events", label: "Events", icon: "🎟️", kind: "community" },
  { id: "lost-found", label: "Lost & Found", icon: "🧭", kind: "community" },
  { id: "donations", label: "Donations", icon: "🤝", kind: "community" },
  { id: "volunteers", label: "Volunteers", icon: "🙌", kind: "community" },
];

const DRAFT_KEY = "afm:listing-draft";
const MAX_PHOTOS = 10;
const STEPS = ["Photos", "Category", "Details", "Review"];

const emptyData = {
  category: "", kind: "" as Kind | "",
  title: "", description: "", price: "", currency: "LRD" as Currency,
  county: "", city: "",
  v_make: "", v_model: "", v_year: "", v_condition: "new",
  p_listingType: "sale", p_propertyType: "house", p_bedrooms: "",
  ph_condition: "",
  s_businessName: "", s_phone: "", s_whatsapp: "",
  showPhone: false,
  manualCity: false,
};
type Data = typeof emptyData;

const field = "h-12 w-full rounded-xl border border-border bg-card px-4 text-base outline-none focus:border-brand";

export function ListingWizard() {
  const { user, configured } = useAuth();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Data>(emptyData);
  const [photos, setPhotos] = useState<{ file: File; url: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);
  const [copied, setCopied] = useState(false);
  const [boost, setBoost] = useState<string | null>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const hydrated = useRef(false);

  // Restore the text draft on mount (photos aren't serialisable), then auto-save.
  useEffect(() => {
    queueMicrotask(() => {
      try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          if (saved && (saved.title || saved.category)) { setData({ ...emptyData, ...saved }); setRestored(true); }
        }
      } catch { /* ignore */ }
      hydrated.current = true;
    });
  }, []);
  useEffect(() => {
    if (!hydrated.current) return; // don't clobber the saved draft before restore
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); } catch { /* ignore */ }
  }, [data]);

  const set = (k: keyof Data, v: string) => setData((d) => ({ ...d, [k]: v }) as Data);
  const [detecting, setDetecting] = useState(false);

  // Auto-detect county/city from GPS (keyless reverse geocode); manual override stays.
  function detectLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          const j = await res.json();
          const sub = String(j.principalSubdivision ?? "").replace(/ County$/i, "").trim();
          const match = COUNTIES.find((c) => c.name.toLowerCase() === sub.toLowerCase());
          setData((d) => {
            const county = match ? match.name : d.county;
            const city = j.city || j.locality || d.city;
            const known = townsForCounty(county).includes(city);
            return { ...d, county, city, manualCity: Boolean(city) && !known };
          });
        } catch { /* ignore */ } finally { setDetecting(false); }
      },
      () => setDetecting(false),
      { timeout: 8000, enableHighAccuracy: false },
    );
  }

  function addFiles(list: FileList | null) {
    const arr = Array.from(list ?? []);
    if (arr.length === 0) return;
    setPhotos((prev) => [...prev, ...arr.slice(0, MAX_PHOTOS - prev.length).map((f) => ({ file: f, url: URL.createObjectURL(f) }))]);
    setError(null);
  }
  function removePhoto(i: number) {
    setPhotos((prev) => { URL.revokeObjectURL(prev[i]?.url); return prev.filter((_, j) => j !== i); });
  }

  function pickCategory(c: (typeof QUICK)[number]) {
    setData((d) => ({ ...d, category: c.id, kind: c.kind }));
    setError(null);
    setStep(2); // Photos(0) → Category(1) → Details(2)
  }

  function validateDetails(): string | null {
    if (data.title.trim().length < 3) return "Add a title (at least 3 characters).";
    if (data.description.trim().length < 10) return "Add a short description (at least 10 characters).";
    // Community posts (free stuff, wanted, events…) don't need a price.
    if (data.kind !== "community" && !(Number(data.price) > 0)) return "Enter a valid price.";
    if (!data.county) return "Choose a county.";
    if (!data.city.trim()) return "Enter your city or town.";
    if (data.kind === "vehicle") {
      if (data.v_make.trim().length < 2) return "Enter the car make (e.g. Toyota).";
      if (!data.v_model.trim()) return "Enter the model.";
      const y = Number(data.v_year);
      if (!(y >= 1980 && y <= new Date().getFullYear() + 1)) return "Enter a valid year.";
    }
    return null;
  }

  function next() {
    setError(null);
    if (step === 0 && photos.length === 0) { setError("Add at least one photo."); return; }
    if (step === 1 && !data.category) { setError("Choose a category."); return; }
    if (step === 2) { const e = validateDetails(); if (e) { setError(e); return; } }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  async function publish() {
    if (!user) { setError("Please sign in to post."); return; }
    const e = validateDetails();
    if (e) { setError(e); setStep(2); return; }
    setError(null);
    setPending(true);
    try {
      const urls = await uploadListingPhotos(photos.map((p) => p.file), user.uid);
      const desc = data.kind === "phone" && data.ph_condition
        ? `${data.description}\nCondition: ${data.ph_condition}`
        : data.description;
      const result = await createListingAction({
        title: data.title, description: desc, price: data.price, currency: data.currency,
        category: data.category, county: data.county, city: data.city, photos: urls,
        vehicle: data.kind === "vehicle"
          ? { make: data.v_make, model: data.v_model, year: data.v_year, mileage: "0", condition: data.v_condition, fuelType: "", transmission: "", exteriorColor: "", interiorColor: "", vin: "" }
          : undefined,
        property: data.kind === "property"
          ? { listingType: data.p_listingType, propertyType: data.p_propertyType, bedrooms: data.p_bedrooms || "0", bathrooms: "0", squareFeet: "0", landSize: "0" }
          : undefined,
        service: data.kind === "service"
          ? { businessName: data.s_businessName, phone: data.s_phone, whatsapp: data.s_whatsapp }
          : undefined,
        showPhone: data.showPhone,
      });
      if (result?.error) { setError(result.error); setPending(false); return; }
      try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
      setCreatedId(result.id ?? "");
    } catch {
      setError("Something went wrong. Please try again.");
      setPending(false);
    }
  }

  function startOver() {
    photos.forEach((p) => URL.revokeObjectURL(p.url));
    setPhotos([]); setData(emptyData); setCreatedId(null); setStep(0); setError(null); setPending(false);
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
  }

  if (!configured) {
    return (
      <div className="mx-auto w-full max-w-xl px-4 py-10">
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          Posting is temporarily unavailable. Please try again shortly.
        </div>
      </div>
    );
  }

  // ---- Success ----
  if (createdId) {
    const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/listing/${createdId}` : "";
    const BOOSTS = [
      { id: "featured", icon: "⭐", title: "Featured Listing", desc: "Show in the Featured row on the homepage." },
      { id: "top", icon: "🔝", title: "Top Search Placement", desc: "Appear first in search & category results." },
      { id: "7day", icon: "🚀", title: "7-Day Boost", desc: "Maximum visibility for a full week." },
    ];
    async function copyLink() {
      try { await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* ignore */ }
    }
    return (
      <div className="mx-auto w-full max-w-xl px-4 py-8 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success/15 text-3xl">✅</div>
        <h1 className="mt-4 text-2xl font-bold">Your listing is live!</h1>
        <p className="mt-1 text-sm text-muted">Share it to sell faster.</p>

        {/* Share */}
        <div className="mt-5 grid grid-cols-3 gap-2">
          <a href={`https://wa.me/?text=${encodeURIComponent(`${data.title} — ${formatPrice(Number(data.price) || 0, data.currency)}\nOn AfroSmart: ${shareUrl}`)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card py-3 text-xs font-medium hover:bg-surface">
            <span className="text-xl">💬</span> WhatsApp
          </a>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card py-3 text-xs font-medium hover:bg-surface">
            <span className="text-xl">📘</span> Facebook
          </a>
          <button type="button" onClick={copyLink} className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card py-3 text-xs font-medium hover:bg-surface">
            <span className="text-xl">🔗</span> {copied ? "Copied!" : "Copy link"}
          </button>
        </div>

        {/* Boost */}
        <div className="mt-6 rounded-xl border border-accent/40 bg-accent/5 p-4 text-left">
          <p className="text-sm font-bold">🚀 Boost your listing — sell even faster</p>
          <div className="mt-3 flex flex-col gap-2">
            {BOOSTS.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setBoost(b.id)}
                className={`flex items-center gap-3 rounded-lg border bg-card p-3 text-left transition-colors ${boost === b.id ? "border-brand ring-1 ring-brand" : "border-border hover:border-brand"}`}
              >
                <span className="text-xl">{b.icon}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{b.title}</span>
                  <span className="block text-xs text-muted">{b.desc}</span>
                </span>
                <span aria-hidden className="text-muted">{boost === b.id ? "●" : "○"}</span>
              </button>
            ))}
          </div>
          {boost && (
            <p className="mt-3 rounded-lg bg-surface px-3 py-2 text-center text-xs text-muted">
              Paid boosts launch soon — we&apos;ll notify you. Your listing stays live for free in the meantime.
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Link href={`/listing/${createdId}`} className="inline-flex h-12 items-center justify-center rounded-full bg-brand text-base font-semibold text-brand-foreground hover:bg-brand-dark">
            View my listing
          </Link>
          <button type="button" onClick={startOver} className="inline-flex h-12 items-center justify-center rounded-full border border-border text-base font-semibold hover:bg-surface">
            + Post another
          </button>
        </div>
      </div>
    );
  }

  const cover = photos[0]?.url;
  const catLabel = QUICK.find((c) => c.id === data.category)?.label ?? "Listing";

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-5">
      {/* Progress */}
      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-muted">
          <span>{STEPS[step]}</span>
          <span>Step {step + 1} of {STEPS.length}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-surface">
          <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>
      </div>

      {restored && (
        <div className="mb-3 flex items-center justify-between gap-2 rounded-lg bg-brand/5 px-3 py-2 text-xs text-muted">
          <span>📝 Draft recovered — your earlier details were restored.</span>
          <button type="button" onClick={startOver} className="shrink-0 font-medium text-brand">Start fresh</button>
        </div>
      )}

      {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      {/* Step 2 — Category */}
      {step === 1 && (
        <div>
          <h1 className="text-xl font-bold">What are you posting?</h1>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {QUICK.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => pickCategory(c)}
                className={`flex flex-col items-center gap-2 rounded-xl border bg-card py-6 text-center transition-colors hover:border-brand hover:bg-surface ${data.category === c.id ? "border-brand ring-1 ring-brand" : "border-border"}`}
              >
                <span className="text-3xl">{c.icon}</span>
                <span className="text-base font-semibold">{c.label}</span>
              </button>
            ))}
          </div>
          <p className="mt-4 rounded-lg bg-success/5 px-3 py-2 text-center text-xs text-muted">
            🛡️ <span className="font-medium text-foreground">Verified Seller</span> badges are coming soon — build buyer trust.
          </p>
        </div>
      )}

      {/* Step 1 — Photos */}
      {step === 0 && (
        <div>
          <h1 className="text-xl font-bold">Add photos</h1>
          <p className="mt-1 text-sm text-muted">Clear photos sell faster. The first photo is your cover.</p>
          <button
            type="button"
            onClick={() => galleryRef.current?.click()}
            className="mt-4 flex h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-surface text-muted hover:border-brand"
          >
            <span className="text-4xl">🖼️</span>
            <span className="text-sm font-medium">Tap to choose photos</span>
          </button>
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand text-base font-semibold text-brand-foreground hover:bg-brand-dark"
          >
            📷 Take a photo
          </button>
          <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
          {photos.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {photos.map((p, i) => (
                <div key={p.url} className="relative aspect-square overflow-hidden rounded-lg border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt="" className="h-full w-full object-cover" />
                  {i === 0 && <span className="absolute left-1 top-1 rounded bg-accent px-1.5 text-[10px] font-semibold text-[#1a1a1a]">Cover</span>}
                  <button type="button" onClick={() => removePhoto(i)} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-xs text-white">✕</button>
                </div>
              ))}
            </div>
          )}
          <p className="mt-2 text-xs text-muted">{photos.length}/{MAX_PHOTOS} photos</p>
        </div>
      )}

      {/* Step 3 — Details */}
      {step === 2 && (
        <div className="flex flex-col gap-3">
          <h1 className="text-xl font-bold">Details</h1>
          <input className={field} placeholder="Title (e.g. Toyota Corolla 2014)" value={data.title} onChange={(e) => set("title", e.target.value)} />
          {/* Price — hidden for community posts (free stuff, wanted, events…), which are priceless. */}
          {data.kind === "community" ? (
            <p className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">
              💚 No price needed — this post is shown as <span className="font-medium text-foreground">Free</span>.
            </p>
          ) : (
            /* Price is the primary field: currency ~25%, amount ~75% */
            <div className="flex gap-2">
              <select className={`${field} shrink-0 basis-1/4 px-2`} value={data.currency} onChange={(e) => set("currency", e.target.value)}>
                <option value="LRD">L$</option>
                <option value="USD">US$</option>
              </select>
              <input
                className={`${field} min-w-0 flex-1`}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="Price"
                value={data.price}
                onChange={(e) => set("price", e.target.value.replace(/[^\d]/g, ""))}
              />
            </div>
          )}
          <button type="button" onClick={detectLocation} disabled={detecting} className="inline-flex h-10 w-fit items-center gap-1.5 rounded-full border border-border px-3 text-sm font-medium hover:border-brand disabled:opacity-50">
            📍 {detecting ? "Detecting…" : "Use my location"}
          </button>
          {/* County → City/Town: pick from a list (less typing), or Other for manual */}
          <div className="flex gap-2">
            <select
              className={`${field} min-w-0 flex-1`}
              value={data.county}
              onChange={(e) => setData((d) => ({ ...d, county: e.target.value, city: "", manualCity: false }))}
            >
              <option value="">County</option>
              {COUNTIES.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
            <select
              className={`${field} min-w-0 flex-1`}
              disabled={!data.county}
              value={data.manualCity ? OTHER_TOWN : data.city}
              onChange={(e) => {
                const v = e.target.value;
                if (v === OTHER_TOWN) setData((d) => ({ ...d, manualCity: true, city: "" }));
                else setData((d) => ({ ...d, manualCity: false, city: v }));
              }}
            >
              <option value="">{data.county ? "City / Town" : "Select county first"}</option>
              {townsForCounty(data.county).map((t) => <option key={t} value={t}>{t}</option>)}
              {data.county && <option value={OTHER_TOWN}>Other Town/Village…</option>}
            </select>
          </div>
          {data.manualCity && (
            <input className={field} placeholder="Enter your town or village" value={data.city} onChange={(e) => set("city", e.target.value)} />
          )}
          <textarea className="min-h-[88px] w-full rounded-xl border border-border bg-card px-4 py-3 text-base outline-none focus:border-brand" placeholder="Description (condition, details, contact…)" value={data.description} onChange={(e) => set("description", e.target.value)} />

          {data.kind === "vehicle" && (
            <div className="grid grid-cols-2 gap-2">
              <input className={field} placeholder="Make (Toyota)" value={data.v_make} onChange={(e) => set("v_make", e.target.value)} />
              <input className={field} placeholder="Model (Corolla)" value={data.v_model} onChange={(e) => set("v_model", e.target.value)} />
              <input className={field} type="text" inputMode="numeric" placeholder="Year" value={data.v_year} onChange={(e) => set("v_year", e.target.value.replace(/[^\d]/g, ""))} />
              <select className={field} value={data.v_condition} onChange={(e) => set("v_condition", e.target.value)}>
                {VEHICLE_CONDITIONS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
          )}
          {data.kind === "property" && (
            <div className="grid grid-cols-2 gap-2">
              <select className={field} value={data.p_listingType} onChange={(e) => set("p_listingType", e.target.value)}>
                {LISTING_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
              <select className={field} value={data.p_propertyType} onChange={(e) => set("p_propertyType", e.target.value)}>
                {PROPERTY_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
              <input className={`${field} col-span-2`} type="text" inputMode="numeric" placeholder="Bedrooms (optional)" value={data.p_bedrooms} onChange={(e) => set("p_bedrooms", e.target.value.replace(/[^\d]/g, ""))} />
            </div>
          )}
          {data.kind === "service" && (
            <div className="grid grid-cols-1 gap-2">
              <input className={field} placeholder="Business name (optional)" value={data.s_businessName} onChange={(e) => set("s_businessName", e.target.value)} />
              <div className="grid grid-cols-2 gap-2">
                <input className={field} type="tel" placeholder="Phone (public)" value={data.s_phone} onChange={(e) => set("s_phone", e.target.value)} />
                <input className={field} type="tel" placeholder="WhatsApp (public)" value={data.s_whatsapp} onChange={(e) => set("s_whatsapp", e.target.value)} />
              </div>
            </div>
          )}
          {data.kind === "phone" && (
            <select className={field} value={data.ph_condition} onChange={(e) => set("ph_condition", e.target.value)}>
              <option value="">Condition (optional)</option>
              <option value="New">New</option>
              <option value="Used">Used</option>
            </select>
          )}

          {/* Phone visibility toggle */}
          <button
            type="button"
            onClick={() => setData((d) => ({ ...d, showPhone: !d.showPhone }))}
            className="mt-1 flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left"
          >
            <span className="min-w-0">
              <span className="block text-sm font-medium">Show my phone number to buyers</span>
              <span className="block text-xs text-muted">{data.showPhone ? "Buyers can call you directly." : "Buyers message you in-app; number stays private."}</span>
            </span>
            <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${data.showPhone ? "bg-brand" : "bg-border"}`}>
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${data.showPhone ? "left-[22px]" : "left-0.5"}`} />
            </span>
          </button>
        </div>
      )}

      {/* Step 4 — Review */}
      {step === 3 && (
        <div>
          <h1 className="text-xl font-bold">Review &amp; publish</h1>
          <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card">
            <div className="relative aspect-[4/3] w-full bg-surface">
              {cover && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cover} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <div className="p-3">
              <p className="text-base font-bold">{data.title || "Untitled"}</p>
              <p className="mt-0.5 text-lg font-bold text-foreground">{formatPrice(Number(data.price) || 0, data.currency)}</p>
              <p className="mt-0.5 text-sm text-muted">📍 {data.city}, {data.county} · {catLabel} · {photos.length} photo{photos.length === 1 ? "" : "s"}</p>
              <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm text-muted">{data.description}</p>
            </div>
          </div>
          <button type="button" onClick={() => setStep(2)} className="mt-3 text-sm font-medium text-brand">← Edit details</button>
        </div>
      )}

      {/* Nav buttons */}
      <div className="mt-6 flex gap-3">
        {step > 0 && (
          <button type="button" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={pending} className="inline-flex h-12 flex-1 items-center justify-center rounded-full border border-border text-base font-semibold hover:bg-surface disabled:opacity-50">
            Back
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button type="button" onClick={next} className="inline-flex h-12 flex-[2] items-center justify-center rounded-full bg-brand text-base font-semibold text-brand-foreground hover:bg-brand-dark">
            Continue
          </button>
        ) : (
          <button type="button" onClick={publish} disabled={pending} className="inline-flex h-12 flex-[2] items-center justify-center rounded-full bg-brand text-base font-semibold text-brand-foreground hover:bg-brand-dark disabled:opacity-50">
            {pending ? "Publishing…" : "Publish listing"}
          </button>
        )}
      </div>
    </div>
  );
}
