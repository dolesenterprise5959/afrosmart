import Link from "next/link";
import { verifyAdmin } from "@/lib/auth/dal";
import { getKnowledge, getTopQuestions } from "@/lib/firestore/assistant";
import { KnowledgeEditor } from "@/components/admin/KnowledgeEditor";

export const dynamic = "force-dynamic";

// Admins only — edit the AI Assistant knowledge base + see what users ask.
export default async function AdminAssistantPage() {
  await verifyAdmin();
  const [kb, stats] = await Promise.all([getKnowledge(), getTopQuestions(20)]);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <Link href="/admin" className="text-sm text-brand">← Admin</Link>
      <h1 className="mt-2 text-xl font-bold">AI Assistant</h1>

      {/* Top questions report */}
      <section className="mt-4 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Top 20 questions</h2>
          <span className="text-xs text-muted">{stats.sampleSize} recent · {stats.unansweredTotal} unanswered</span>
        </div>
        {stats.top.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No conversations logged yet.</p>
        ) : (
          <ol className="mt-2 space-y-1 text-sm">
            {stats.top.map((q, i) => (
              <li key={i} className="flex items-center justify-between gap-2 border-b border-border/50 py-1 last:border-0">
                <span className="min-w-0 flex-1 truncate">{i + 1}. {q.question}</span>
                <span className="shrink-0 text-xs text-muted">
                  ×{q.count}{q.unanswered > 0 && <span className="ml-1 font-medium text-red-600">({q.unanswered} unanswered)</span>}
                </span>
              </li>
            ))}
          </ol>
        )}
        <p className="mt-2 text-[11px] text-muted">Red = the bot had no good answer — add a knowledge entry below to cover it.</p>
      </section>

      <h2 className="mt-6 text-base font-semibold">Knowledge base</h2>
      <p className="mt-1 text-sm text-muted">
        Edit what the assistant says. Changes apply instantly (no deploy). Keywords (comma-separated)
        decide when an answer is shown; quick replies are tappable follow-up chips.
      </p>
      <KnowledgeEditor entries={kb} />
    </div>
  );
}
