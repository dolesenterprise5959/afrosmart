import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { ReportActions } from "@/components/admin/ReportActions";
import { VerificationActions } from "@/components/admin/VerificationActions";
import { verifyAdmin } from "@/lib/auth/dal";
import { getAdminStats } from "@/lib/firestore/admin";
import { listReports } from "@/lib/firestore/reports";
import { listPendingVerifications } from "@/lib/firestore/verification";
import { TEST_PHONE_NUMBERS } from "@/lib/testNumbers";

export const dynamic = "force-dynamic";

const reasonLabel: Record<string, string> = {
  scam: "Scam",
  spam: "Spam",
  fake: "Fake item",
  wrong_category: "Wrong category",
};

// Admins only — enforced server-side via the DAL custom-claim check.
export default async function AdminPage() {
  await verifyAdmin();

  const [stats, reports, pendingVerifications] = await Promise.all([
    getAdminStats(),
    listReports(),
    listPendingVerifications(),
  ]);

  const statCards = [
    { label: "Total listings", value: stats.listings },
    { label: "Users", value: stats.users },
    { label: "Open reports", value: stats.openReports },
    { label: "Pending verifications", value: pendingVerifications.length },
  ];

  const typeLabel: Record<string, string> = { seller: "Seller", business: "Business" };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold">Admin dashboard</h1>
        <Badge tone="brand">Staff</Badge>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Link href="/admin/assistant" className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-sm font-medium hover:bg-surface">
          ✨ AI Assistant — knowledge base &amp; top questions
        </Link>
        <Link href="/admin/auth-events" className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-sm font-medium hover:bg-surface">
          🔐 Auth events — login success/failure log
        </Link>
      </div>

      {/* Stats */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-4">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tester access — test login without real SMS */}
      <h2 className="mb-1 mt-8 text-lg font-semibold">🔑 Tester access (test login)</h2>
      <p className="mb-3 text-sm text-muted">
        These are Firebase <strong>test phone numbers</strong> — they don&apos;t send a real SMS and
        always accept the fixed code below. Real OTP codes are sent by Firebase and never exposed,
        so use these to verify the login flow.
      </p>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-xs text-muted">
            <tr>
              <th className="px-3 py-2">Enter in login</th>
              <th className="px-3 py-2">Stored number</th>
              <th className="px-3 py-2">Code</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {TEST_PHONE_NUMBERS.map((t) => (
              <tr key={t.phone}>
                <td className="px-3 py-2 font-medium">{t.local}</td>
                <td className="px-3 py-2 text-muted">{t.phone}</td>
                <td className="px-3 py-2 font-mono font-semibold text-brand-dark">{t.code}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-muted">
        To test with a <strong>real</strong> Liberian number, just enter it on the login page — a
        real SMS is sent (billed on the Blaze plan). Login &amp; sign-up are the same page: <code>/login</code>.
      </p>

      {/* Verification requests */}
      <h2 className="mb-3 mt-8 text-lg font-semibold">Verification requests</h2>
      {pendingVerifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted">
          No pending verifications.
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {pendingVerifications.map((v) => (
            <li key={v.uid} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  <Link href={`/u/${v.uid}`} className="hover:text-brand">{v.displayName}</Link>
                </p>
                <p className="flex items-center gap-1.5 text-xs text-muted">
                  Applying for <Badge tone="accent">{typeLabel[v.requestedType] ?? v.requestedType}</Badge>
                  {v.note && <span className="truncate">· “{v.note}”</span>}
                </p>
              </div>
              <VerificationActions uid={v.uid} />
            </li>
          ))}
        </ul>
      )}

      {/* Reports queue */}
      <h2 className="mb-3 mt-8 text-lg font-semibold">Reports queue</h2>
      {reports.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted">
          No reports. 🎉
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {reports.map((r) => (
            <li key={r.id} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {r.targetType === "listing" ? (
                    <Link href={`/listing/${r.targetId}`} className="hover:text-brand">
                      {r.targetLabel}
                    </Link>
                  ) : (
                    <Link href={`/u/${r.targetId}`} className="hover:text-brand">
                      {r.targetLabel}
                    </Link>
                  )}
                </p>
                <p className="flex items-center gap-1.5 text-xs text-muted">
                  {r.targetType} ·{" "}
                  <Badge tone="accent">{reasonLabel[r.reason] ?? r.reason}</Badge>
                  {r.note && <span className="truncate">· “{r.note}”</span>}
                </p>
              </div>
              <Badge tone={r.status === "open" ? "accent" : "neutral"}>{r.status}</Badge>
              <ReportActions
                reportId={r.id}
                targetType={r.targetType}
                targetId={r.targetId}
                resolved={r.status === "resolved"}
              />
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex flex-wrap gap-3 text-sm text-muted">
        <span>Categories &amp; counties are managed in code for now.</span>
      </div>
    </div>
  );
}
