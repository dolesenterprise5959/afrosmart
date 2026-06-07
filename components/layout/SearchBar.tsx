"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getCategory, formatPrice } from "@/lib/mock";
import { ListingImage } from "@/components/listing/ListingImage";
import type { Currency } from "@/lib/types";

interface SearchIndexItem {
  id: string;
  title: string;
  category: string;
  price: number;
  currency: string;
  photo: string;
}

// The 9 browsable categories offered as quick suggestions.
const CATEGORY_SUGGESTIONS = [
  { label: "Cars", icon: "🚗", href: "/marketplace/cars" },
  { label: "Real Estate", icon: "🏠", href: "/properties" },
  { label: "Rentals", icon: "🏘", href: "/marketplace/rentals" },
  { label: "Land", icon: "🌍", href: "/marketplace/land" },
  { label: "Phones", icon: "📱", href: "/marketplace/phones" },
  { label: "Shops", icon: "🛍", href: "/marketplace/shops" },
  { label: "Sports", icon: "⚽", href: "/marketplace/sports-fields" },
  { label: "Fashion", icon: "👗", href: "/marketplace/clothing" },
  { label: "Services", icon: "🛠", href: "/services" },
];

const TRENDING = ["Toyota", "iPhone", "House", "Land", "Generator", "Honda"];
const MAX_SUGGESTIONS = 8;
const RECENT_KEY = "afrosmart:recent";
const IMAGE_SEARCH_KEY = "afm:image-search";

// Minimal Web Speech API typing (avoids `any`).
interface SpeechResultLike { results: ArrayLike<ArrayLike<{ transcript: string }>>; }
interface SR {
  lang: string;
  interimResults: boolean;
  onresult: ((e: SpeechResultLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}
type SRCtor = new () => SR;
function getSRCtor(): SRCtor | undefined {
  const w = window as unknown as { SpeechRecognition?: SRCtor; webkitSpeechRecognition?: SRCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

function highlight(text: string, q: string) {
  const i = text.toLowerCase().indexOf(q);
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <span className="font-semibold text-brand-dark">{text.slice(i, i + q.length)}</span>
      {text.slice(i + q.length)}
    </>
  );
}

export function SearchBar({
  placeholder = "Search cars, phones, property…",
  className,
}: {
  placeholder?: string;
  className?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState<SearchIndexItem[] | null>(null);
  const [recent, setRecent] = useState<string[]>([]);
  const [listening, setListening] = useState(false);
  const loadingRef = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SR | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Voice search (mobile speech-to-text) — fills the field; user can edit.
  function startVoice() {
    const Ctor = getSRCtor();
    if (!Ctor) return; // unsupported browser → no-op
    if (!recognitionRef.current) {
      const r = new Ctor();
      r.lang = "en-US";
      r.interimResults = false;
      r.onresult = (e) => {
        const t = e.results[0]?.[0]?.transcript ?? "";
        if (t) { setQuery(t); setOpen(true); void ensureIndex(); }
      };
      r.onend = () => setListening(false);
      r.onerror = () => setListening(false);
      recognitionRef.current = r;
    }
    if (listening) { recognitionRef.current.stop(); setListening(false); }
    else { try { recognitionRef.current.start(); setListening(true); } catch { setListening(false); } }
  }

  // Image search — downscale the chosen photo, stash it, open the visual-search route.
  function onImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const max = 1024;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
        try { sessionStorage.setItem(IMAGE_SEARCH_KEY, canvas.toDataURL("image/jpeg", 0.8)); } catch { /* ignore */ }
        setOpen(false);
        router.push("/search/image");
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  function loadRecent() {
    try {
      const r = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
      if (Array.isArray(r)) setRecent(r.slice(0, 5));
    } catch {
      /* ignore */
    }
  }

  // Load the lightweight index once (on first focus/type), then filter locally
  // for instant (<200ms) suggestions.
  async function ensureIndex() {
    if (index || loadingRef.current) return;
    loadingRef.current = true;
    try {
      const res = await fetch("/api/search-suggest");
      setIndex(res.ok ? await res.json() : []);
    } catch {
      setIndex([]);
    }
  }

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function saveRecent(term: string) {
    const t = term.trim();
    if (!t) return;
    setRecent((prev) => {
      const next = [t, ...prev.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, 5);
      try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }

  function runSearch(term: string) {
    saveRecent(term);
    setOpen(false);
    const t = term.trim();
    router.push(t ? `/marketplace?q=${encodeURIComponent(t)}` : "/marketplace");
  }

  function goto(href: string) {
    setOpen(false);
    router.push(href);
  }

  const q = query.trim().toLowerCase();
  const showSuggest = open && q.length >= 2;
  const showEmpty = open && q.length < 2;
  const cats = showSuggest ? CATEGORY_SUGGESTIONS.filter((c) => c.label.toLowerCase().includes(q)).slice(0, 3) : [];
  const lists = showSuggest
    ? (index ?? []).filter((l) => l.title.toLowerCase().includes(q)).slice(0, MAX_SUGGESTIONS - cats.length)
    : [];
  const noResults = showSuggest && index !== null && cats.length === 0 && lists.length === 0;

  return (
    <div ref={rootRef} className={["relative w-full", className].filter(Boolean).join(" ")}>
      <form onSubmit={(e) => { e.preventDefault(); runSearch(query); }} className="flex items-center gap-2" role="search">
        <div className="flex h-11 flex-1 items-center gap-1 rounded-full border border-border bg-card pl-4 pr-2">
          <span aria-hidden className="text-muted">🔍</span>
          <input
            type="search"
            value={query}
            onChange={(e) => { setQuery(e.target.value); void ensureIndex(); setOpen(true); }}
            onFocus={() => { void ensureIndex(); loadRecent(); setOpen(true); }}
            placeholder={placeholder}
            aria-label="Search listings"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
          />
          <button
            type="button"
            onClick={startVoice}
            aria-label="Voice search"
            title="Voice search"
            className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-base hover:bg-surface ${listening ? "animate-pulse bg-brand/15" : ""}`}
          >
            🎤
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            aria-label="Search by photo"
            title="Search by photo"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-base hover:bg-surface"
          >
            📷
          </button>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onImagePick} />
        </div>
        <button
          type="submit"
          className="inline-flex h-11 items-center rounded-full bg-brand px-5 text-sm font-medium text-brand-foreground hover:bg-brand-dark"
        >
          Search
        </button>
      </form>

      {/* Suggestions (typing ≥ 2 chars) */}
      {showSuggest && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
          <ul className="max-h-[60vh] overflow-y-auto py-1">
            {cats.map((c) => (
              <li key={`cat-${c.label}`}>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); goto(c.href); }}
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm hover:bg-surface"
                >
                  <span aria-hidden className="text-base">{c.icon}</span>
                  <span className="flex-1 truncate">{highlight(c.label, q)}</span>
                  <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted">Category</span>
                </button>
              </li>
            ))}
            {lists.map((l) => (
              <li key={l.id}>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); goto(`/listing/${l.id}`); }}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-surface"
                >
                  <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded">
                    <ListingImage photo={l.photo} category={l.category} alt={l.title} className="h-full w-full" sizes="40px" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">{highlight(l.title, q)}</span>
                    <span className="block text-xs text-muted">{getCategory(l.category)?.label ?? ""}</span>
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-brand-dark">{formatPrice(l.price, (l.currency as Currency) ?? "LRD")}</span>
                </button>
              </li>
            ))}
            {noResults && <li className="px-3 py-3 text-sm text-muted">No matching listings found.</li>}
          </ul>
        </div>
      )}

      {/* Trending + recent (focused, empty) */}
      {showEmpty && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
          {recent.length > 0 && (
            <div className="border-b border-border py-1">
              <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted">Recent searches</p>
              {recent.map((t) => (
                <button
                  key={`recent-${t}`}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); runSearch(t); }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-surface"
                >
                  <span aria-hidden className="text-muted">🕘</span>
                  <span className="flex-1 truncate">{t}</span>
                </button>
              ))}
            </div>
          )}
          <div className="py-2">
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">Trending searches</p>
            <div className="flex flex-wrap gap-1.5 px-3">
              {TRENDING.map((t) => (
                <button
                  key={`trend-${t}`}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); runSearch(t); }}
                  className="rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-foreground hover:bg-brand/10"
                >
                  🔥 {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
