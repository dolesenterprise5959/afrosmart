import "server-only";

import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { DEFAULT_KB, type KBEntry } from "@/lib/assistant/knowledge";

const KB_COLL = "assistantKnowledge";
const CONV_COLL = "assistantConversations";

// Knowledge base = admin-edited Firestore entries, falling back to the seeded
// defaults when none exist yet (so the bot works out of the box).
export async function getKnowledge(): Promise<KBEntry[]> {
  if (!isAdminConfigured()) return DEFAULT_KB;
  try {
    const snap = await adminDb().collection(KB_COLL).get();
    if (snap.empty) return DEFAULT_KB;
    const custom = snap.docs.map((d) => {
      const x = d.data();
      return {
        id: d.id,
        title: String(x.title ?? ""),
        keywords: Array.isArray(x.keywords) ? x.keywords.map(String) : [],
        answer: String(x.answer ?? ""),
        quickReplies: Array.isArray(x.quickReplies) ? x.quickReplies.map(String) : [],
      } satisfies KBEntry;
    });
    // Merge: custom entries override defaults by id; defaults fill the rest.
    const byId = new Map<string, KBEntry>(DEFAULT_KB.map((e) => [e.id, e]));
    for (const e of custom) byId.set(e.id, e);
    return [...byId.values()];
  } catch {
    return DEFAULT_KB;
  }
}

export async function saveKnowledgeEntry(entry: KBEntry): Promise<void> {
  if (!isAdminConfigured()) return;
  await adminDb().collection(KB_COLL).doc(entry.id).set({
    title: entry.title,
    keywords: entry.keywords,
    answer: entry.answer,
    quickReplies: entry.quickReplies ?? [],
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteKnowledgeEntry(id: string): Promise<void> {
  if (!isAdminConfigured()) return;
  await adminDb().collection(KB_COLL).doc(id).delete();
}

const UNANSWERED = new Set(["fallback", "search-empty"]);

// Best-effort conversation logging (never blocks a reply). `answered` flags
// whether the bot had a real answer — unanswered questions feed the admin report.
export async function logConversation(sessionId: string, message: string, reply: string, matched: string): Promise<void> {
  if (!isAdminConfigured()) return;
  try {
    await adminDb().collection(CONV_COLL).add({
      sessionId: sessionId.slice(0, 64),
      ts: new Date().toISOString(),
      message: message.slice(0, 500),
      reply: reply.slice(0, 1000),
      matched,
      answered: !UNANSWERED.has(matched),
    });
  } catch {
    /* ignore */
  }
}

export interface QuestionStat { question: string; count: number; unanswered: number }

// Aggregate the most-asked questions (case-insensitive) from recent conversations.
export async function getTopQuestions(limit = 20): Promise<{ top: QuestionStat[]; unansweredTotal: number; sampleSize: number }> {
  if (!isAdminConfigured()) return { top: [], unansweredTotal: 0, sampleSize: 0 };
  try {
    const snap = await adminDb().collection(CONV_COLL).orderBy("ts", "desc").limit(1000).get();
    const map = new Map<string, QuestionStat>();
    let unansweredTotal = 0;
    for (const d of snap.docs) {
      const x = d.data();
      const raw = String(x.message ?? "").trim();
      if (!raw) continue;
      const key = raw.toLowerCase().replace(/\s+/g, " ").slice(0, 80);
      const isUnanswered = x.answered === false;
      if (isUnanswered) unansweredTotal++;
      const cur = map.get(key) ?? { question: raw, count: 0, unanswered: 0 };
      cur.count++;
      if (isUnanswered) cur.unanswered++;
      map.set(key, cur);
    }
    const top = [...map.values()].sort((a, b) => b.count - a.count).slice(0, limit);
    return { top, unansweredTotal, sampleSize: snap.size };
  } catch {
    return { top: [], unansweredTotal: 0, sampleSize: 0 };
  }
}
