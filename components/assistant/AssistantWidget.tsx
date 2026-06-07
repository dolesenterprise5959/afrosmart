"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ListingImage } from "@/components/listing/ListingImage";
import { formatPrice } from "@/lib/mock";
import { GREETING_QUICK_REPLIES } from "@/lib/assistant/knowledge";
import type { Currency } from "@/lib/types";

interface Listing { id: string; title: string; price: number; currency: string; photo: string; category: string }
interface Msg { role: "user" | "bot"; text: string; quickReplies?: string[]; listings?: Listing[] }

// Renders *bold* markers + preserves newlines.
function rich(text: string) {
  return text.split(/(\*[^*]+\*)/g).map((part, i) =>
    part.startsWith("*") && part.endsWith("*")
      ? <strong key={i}>{part.slice(1, -1)}</strong>
      : <span key={i}>{part}</span>,
  );
}

export function AssistantWidget() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const sessionId = useRef<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);

  function openPanel() {
    if (!sessionId.current) {
      try { sessionId.current = localStorage.getItem("afm:assistant") ?? ""; } catch { /* ignore */ }
      if (!sessionId.current) {
        sessionId.current = `s_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
        try { localStorage.setItem("afm:assistant", sessionId.current); } catch { /* ignore */ }
      }
    }
    if (msgs.length === 0) {
      setMsgs([{
        role: "bot",
        text: "Hi, I'm the AfroSmart Assistant. I can help you find listings, post items, and answer questions.",
        quickReplies: GREETING_QUICK_REPLIES,
      }]);
    }
    setOpen(true);
  }

  async function send(text: string) {
    const t = text.trim();
    if (!t || busy) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", text: t }]);
    setBusy(true);
    requestAnimationFrame(() => scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight));
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: t, sessionId: sessionId.current }),
      });
      const data = await res.json().catch(() => ({}));
      setMsgs((m) => [...m, { role: "bot", text: data.reply ?? "Sorry, I had trouble. Please try again.", quickReplies: data.quickReplies ?? [], listings: data.listings ?? [] }]);
    } catch {
      setMsgs((m) => [...m, { role: "bot", text: "Network problem — please try again." }]);
    } finally {
      setBusy(false);
      requestAnimationFrame(() => scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight));
    }
  }

  function onQuick(text: string) {
    if (text === "Browse all results") { setOpen(false); router.push("/marketplace"); return; }
    void send(text);
  }

  return (
    <>
      {/* Launcher */}
      {!open && (
        <button
          type="button"
          onClick={openPanel}
          aria-label="Open AfroSmart Assistant"
          className="fixed bottom-20 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-brand px-4 py-3 text-sm font-semibold text-brand-foreground shadow-lg hover:bg-brand-dark"
        >
          <span className="text-base">✨</span> Ask AI
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:items-end sm:justify-end sm:p-4">
          <button type="button" aria-label="Close" className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="relative flex max-h-[82vh] w-full flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-2xl sm:h-[600px] sm:max-h-[80vh] sm:w-96 sm:rounded-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-brand/10 text-base">✨</span>
                <div>
                  <p className="text-sm font-semibold leading-tight">AfroSmart Assistant</p>
                  <p className="text-[11px] text-muted">Buy • Sell • Get help</p>
                </div>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-surface">✕</button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
              {msgs.map((m, i) => (
                <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  <div className={`max-w-[85%] ${m.role === "user" ? "rounded-2xl rounded-br-sm bg-brand px-3 py-2 text-sm text-brand-foreground" : "w-full"}`}>
                    {m.role === "bot" ? (
                      <>
                        <div className="rounded-2xl rounded-bl-sm bg-surface px-3 py-2 text-sm leading-relaxed whitespace-pre-line">{rich(m.text)}</div>
                        {m.listings && m.listings.length > 0 && (
                          <div className="mt-2 space-y-1.5">
                            {m.listings.map((l) => (
                              <Link key={l.id} href={`/listing/${l.id}`} onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-xl border border-border bg-card p-1.5 hover:bg-surface">
                                <span className="h-11 w-11 shrink-0 overflow-hidden rounded-lg">
                                  <ListingImage photo={l.photo} category={l.category} className="h-full w-full" sizes="44px" />
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate text-xs font-medium">{l.title}</span>
                                  <span className="block text-xs font-semibold text-foreground">{formatPrice(l.price, l.currency as Currency)}</span>
                                </span>
                              </Link>
                            ))}
                          </div>
                        )}
                        {m.quickReplies && m.quickReplies.length > 0 && i === msgs.length - 1 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {m.quickReplies.map((qr) => (
                              <button key={qr} type="button" onClick={() => onQuick(qr)} className="rounded-full border border-brand/40 bg-brand/5 px-3 py-1 text-xs font-medium text-brand hover:bg-brand/10">
                                {qr}
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      m.text
                    )}
                  </div>
                </div>
              ))}
              {busy && <div className="flex justify-start"><div className="rounded-2xl bg-surface px-3 py-2 text-sm text-muted">…</div></div>}
            </div>

            {/* Input */}
            <form onSubmit={(e) => { e.preventDefault(); void send(input); }} className="flex items-center gap-2 border-t border-border p-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything…"
                aria-label="Message the assistant"
                className="h-11 min-w-0 flex-1 rounded-full border border-border bg-card px-4 text-sm outline-none focus:border-brand"
              />
              <button type="submit" disabled={busy || !input.trim()} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand text-brand-foreground disabled:opacity-50" aria-label="Send">
                ➤
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
