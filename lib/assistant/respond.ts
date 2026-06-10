import "server-only";

import { getKnowledge } from "@/lib/firestore/assistant";
import { getSearchIndex } from "@/lib/firestore/listings";
import { GREETING_QUICK_REPLIES, type KBEntry } from "@/lib/assistant/knowledge";

export interface AssistantListing {
  id: string;
  title: string;
  price: number;
  currency: string;
  photo: string;
  category: string;
}
export interface AssistantReply {
  reply: string;
  quickReplies: string[];
  listings?: AssistantListing[];
  matched: string;
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
const SEARCH_HINTS = ["find", "looking", "look for", "search", "buy", "want", "need", "show me", "where can i get", "do you have", "any "];
const GREETINGS = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "start", "help"];

function scoreEntry(q: string, e: KBEntry): number {
  let score = 0;
  for (const kw of e.keywords) if (q.includes(norm(kw))) score += kw.includes(" ") ? 3 : 2;
  for (const w of norm(e.title).split(" ")) if (w.length > 3 && q.includes(w)) score += 1;
  return score;
}

async function searchListings(q: string): Promise<AssistantListing[]> {
  const index = await getSearchIndex();
  const tokens = q.split(" ").filter((t) => t.length > 2);
  const scored = index
    .map((l) => {
      const t = norm(`${l.title} ${l.category}`);
      const hits = tokens.filter((tok) => t.includes(tok)).length;
      return { l, hits };
    })
    .filter((x) => x.hits > 0)
    .sort((a, b) => b.hits - a.hits)
    .slice(0, 4)
    .map((x) => ({ id: x.l.id, title: x.l.title, price: x.l.price, currency: x.l.currency, photo: x.l.photo, category: x.l.category }));
  return scored;
}

export async function respond(rawMessage: string): Promise<AssistantReply> {
  const q = norm(rawMessage);
  if (!q) {
    return {
      reply: "Hi! I'm the AfroSmart Assistant. I can help you find items, post a listing, log in, and stay safe. What do you need?",
      quickReplies: GREETING_QUICK_REPLIES,
      matched: "greeting",
    };
  }

  // Greeting
  if (GREETINGS.includes(q)) {
    return {
      reply: "Hi! I'm the AfroSmart Assistant. Ask me how to post, log in, contact a seller, or tell me what you want to buy.",
      quickReplies: GREETING_QUICK_REPLIES,
      matched: "greeting",
    };
  }

  const kb = await getKnowledge();
  const best = kb.map((e) => ({ e, s: scoreEntry(q, e) })).sort((a, b) => b.s - a.s)[0];

  // Product-search intent: a search hint, OR a low KB match that looks like a product query.
  const looksLikeSearch = SEARCH_HINTS.some((h) => q.includes(h));
  if (looksLikeSearch || (best && best.s < 2)) {
    const cleaned = q
      .replace(/\b(find|looking|look|for|search|buy|want|need|show|me|do|you|have|any|a|an|the|i|im|some|where|can|get|to)\b/g, " ")
      .split(" ").filter((w) => w.length > 1).join(" ").trim();
    const listings = cleaned ? await searchListings(cleaned) : [];
    if (listings.length > 0) {
      return {
        reply: `Here are some listings that match "${cleaned}". Tap one to see details, or browse all results.`,
        quickReplies: ["Browse all results", "How to contact a seller", "Safety tips"],
        listings,
        matched: "search",
      };
    }
    if (looksLikeSearch) {
      return {
        reply: `I couldn't find a live listing for "${cleaned || rawMessage}" right now. Try a different word, or browse the categories.`,
        quickReplies: ["Marketplace categories", "How to post an item"],
        matched: "search-empty",
      };
    }
  }

  // Knowledge-base answer
  if (best && best.s >= 2) {
    return {
      reply: best.e.answer,
      quickReplies: best.e.quickReplies?.length ? best.e.quickReplies : GREETING_QUICK_REPLIES,
      matched: best.e.id,
    };
  }

  // Fallback
  return {
    reply:
      "I'm not sure about that yet, but I can help with: creating an account, logging in, posting & editing listings, contacting sellers, categories, safety, and finding products. What would you like?",
    quickReplies: GREETING_QUICK_REPLIES,
    matched: "fallback",
  };
}
