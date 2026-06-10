"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getCategory, formatPrice } from "@/lib/mock";
import { ListingImage } from "@/components/listing/ListingImage";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import type { Currency } from "@/lib/types";

import { Clock, Flame } from "lucide-react";
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
  { id: "cars", label: "Cars", href: "/marketplace/cars" },
  { id: "property", label: "Real Estate", href: "/properties" },
  { id: "rentals", label: "Rentals", href: "/marketplace/rentals" },
  { id: "land", label: "Land", href: "/marketplace/land" },
  { id: "phones", label: "Phones", href: "/marketplace/phones" },
  { id: "retail", label: "Shops", href: "/marketplace/shops" },
  { id: "sports-fields", label: "Sports", href: "/marketplace/sports-fields" },
  { id: "clothing", label: "Fashion", href: "/marketplace/clothing" },
  { id: "services", label: "Services", href: "/services" },
];

const TRENDING = ["Toyota", "iPhone", "House", "Land", "Generator", "Honda"];
const MAX_SUGGESTIONS = 8;
const RECENT_KEY = "afrosmart:recent";

// Minimal Web Speech API typing (avoids `any`).
interface SpeechResult extends ArrayLike<{ transcript: string }> { isFinal: boolean }
interface SpeechResultEvent { resultIndex: number; results: ArrayLike<SpeechResult> }
interface SpeechErrorEvent { error: string }
interface SR {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: SpeechResultEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: SpeechErrorEvent) => void) | null;
  start: () => void;
  stop: () => void;
}
type SRCtor = new () => SR;
function getSRCtor(): SRCtor | undefined {
  const w = window as unknown as { SpeechRecognition?: SRCtor; webkitSpeechRecognition?: SRCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

// Clean line icons (Amazon-style) — monochrome, inherit currentColor.
function IconSearch({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className} aria-hidden>
      <circle cx="11" cy="11" r="7" /><path d="m20 20-3.4-3.4" />
    </svg>
  );
}
function IconMic({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="9" y="2.5" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0" /><path d="M12 18v3" />
    </svg>
  );
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
  const [micDenied, setMicDenied] = useState(false);
  const loadingRef = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SR | null>(null);
  // Voice-search session state that must survive `onend` (which fires often).
  const listeningRef = useRef(false);
  const finalText = useRef("");
  const silenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const SILENCE_MS = 2500;  // stop ~2.5s after the user stops speaking
  const FIRST_MS = 7000;    // give the user time to start speaking
  const MAX_MS = 30000;     // hard safety cap on a session

  function clearVoiceTimers() {
    if (silenceTimer.current) clearTimeout(silenceTimer.current);
    if (maxTimer.current) clearTimeout(maxTimer.current);
    silenceTimer.current = maxTimer.current = null;
  }
  function resetSilence(ms: number) {
    if (silenceTimer.current) clearTimeout(silenceTimer.current);
    silenceTimer.current = setTimeout(() => stopVoice(), ms);
  }
  function stopVoice() {
    listeningRef.current = false;
    clearVoiceTimers();
    try { recognitionRef.current?.stop(); } catch { /* ignore */ }
    setListening(false);
  }

  // Voice search: keeps listening through pauses, fills the field live, and stops
  // when the user pauses (~2.5s) or taps the mic again. (continuous + interim are
  // the fix for the "stops after a few seconds" cut-off.)
  function startVoice() {
    const Ctor = getSRCtor();
    if (!Ctor) return; // unsupported browser → no-op
    if (listeningRef.current) { stopVoice(); return; } // tap again = stop

    const r = recognitionRef.current ?? new Ctor();
    r.lang = "en-US";
    r.continuous = true;       // don't end after the first utterance/pause
    r.interimResults = true;   // live partial text → fill box + "Listening…"
    r.maxAlternatives = 1;
    finalText.current = query ? query.trim() + " " : "";

    r.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        const txt = res[0]?.transcript ?? "";
        if (res.isFinal) finalText.current += txt + " ";
        else interim += txt;
      }
      setQuery((finalText.current + interim).replace(/\s+/g, " ").trim());
      setOpen(true);
      void ensureIndex();
      resetSilence(SILENCE_MS); // user spoke → restart the stop countdown
    };
    r.onerror = (ev) => {
      if (ev.error === "not-allowed" || ev.error === "service-not-allowed") { setMicDenied(true); stopVoice(); }
      // "no-speech"/"aborted" → let onend decide (restart if still active)
    };
    r.onend = () => {
      // Browsers (esp. Android/iOS) end sessions periodically; restart while the
      // user still intends to dictate, so it doesn't cut off mid-sentence.
      if (listeningRef.current) { try { r.start(); } catch { stopVoice(); } }
      else setListening(false);
    };
    recognitionRef.current = r;

    setMicDenied(false);
    listeningRef.current = true;
    setListening(true);
    try { r.start(); } catch { stopVoice(); return; }
    resetSilence(FIRST_MS);
    maxTimer.current = setTimeout(() => stopVoice(), MAX_MS);
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
        <div className="flex h-14 flex-1 items-center gap-2.5 rounded-2xl border border-border bg-card pl-4 pr-2 shadow-md transition focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15">
          <IconSearch className="h-[22px] w-[22px] shrink-0 text-muted" />
          {listening && (
            <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-red-600">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-600" />
              Listening…
            </span>
          )}
          <input
            type="search"
            value={query}
            onChange={(e) => { setQuery(e.target.value); void ensureIndex(); setOpen(true); }}
            onFocus={() => { void ensureIndex(); loadRecent(); setOpen(true); }}
            placeholder={listening ? "Speak now…" : placeholder}
            aria-label="Search listings"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted"
          />
          <button
            type="button"
            onClick={startVoice}
            aria-label={listening ? "Stop voice search" : "Voice search"}
            title={listening ? "Tap to stop" : "Voice search"}
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition ${listening ? "animate-pulse bg-red-100 text-red-600" : "text-muted hover:bg-surface hover:text-foreground"}`}
          >
            <IconMic className="h-5 w-5" />
          </button>
        </div>
        {/* Hidden submit so Enter / the mobile keyboard's search key submits. */}
        <button type="submit" aria-label="Search" className="sr-only">Search</button>
      </form>

      {micDenied && (
        <p className="mt-1 px-2 text-xs text-red-600">
          Microphone access is blocked. Allow it in your browser/site settings to use voice search.
        </p>
      )}

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
                  <CategoryIcon category={c.id} className="h-4 w-4 text-muted" />
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
                  <Clock className="h-4 w-4 text-muted" aria-hidden />
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
                  <Flame className="inline h-3.5 w-3.5" /> {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
