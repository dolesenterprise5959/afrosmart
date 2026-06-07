"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";

const IMAGE_SEARCH_KEY = "afm:image-search";

// Visual search route. Today it captures/optimises the photo and shows a preview;
// the AI matching step is stubbed (`analyzeImage`) and ready to wire to a model
// that returns similar listings.
export default function ImageSearchPage() {
  const [img, setImg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Read the photo handed over by the search bar (async to satisfy lint).
    queueMicrotask(() => {
      try { setImg(sessionStorage.getItem(IMAGE_SEARCH_KEY)); } catch { /* ignore */ }
    });
  }, []);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const el = new window.Image();
      el.onload = () => {
        const max = 1024;
        const scale = Math.min(1, max / Math.max(el.width, el.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(el.width * scale);
        canvas.height = Math.round(el.height * scale);
        canvas.getContext("2d")?.drawImage(el, 0, 0, canvas.width, canvas.height);
        const data = canvas.toDataURL("image/jpeg", 0.8);
        try { sessionStorage.setItem(IMAGE_SEARCH_KEY, data); } catch { /* ignore */ }
        setImg(data);
      };
      el.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="text-xl font-bold">📷 Search by photo</h1>
      <p className="mt-1 text-sm text-muted">
        Snap or upload a photo and we&apos;ll find matching listings.
      </p>

      <div className="mt-5 overflow-hidden rounded-xl border border-border bg-card">
        <div className="relative grid aspect-video place-items-center bg-surface">
          {img ? (
            <Image src={img} alt="Your photo" fill sizes="(max-width:768px) 100vw, 640px" className="object-contain" />
          ) : (
            <span className="text-sm text-muted">No photo selected yet.</span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3 border-t border-border p-4">
          <Button type="button" onClick={() => fileRef.current?.click()} size="md">
            {img ? "Choose another photo" : "📷 Take or upload a photo"}
          </Button>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onPick} />
        </div>
      </div>

      {/* Future AI visual search plugs in here (analyzeImage → similar listings). */}
      {img && (
        <div className="mt-5 rounded-xl border border-dashed border-accent/40 bg-accent/5 p-4">
          <p className="text-sm font-semibold">🔎 Visual matching is coming soon</p>
          <p className="mt-1 text-sm text-muted">
            We&apos;ll analyze your photo with AI to surface similar items across AfroSmart. In the
            meantime, browse by category or use text search.
          </p>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <Button href="/categories" variant="outline" size="md">Browse categories</Button>
        <Button href="/marketplace" variant="ghost" size="md">Search by text instead</Button>
      </div>
    </div>
  );
}
