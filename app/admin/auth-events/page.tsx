import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { verifyAdmin } from "@/lib/auth/dal";
import { getRecentAuthEvents, type AuthEventRow } from "@/lib/firestore/auth-log";
import { describeAuthError, describeVerifyError } from "@/lib/auth/otp-errors";

export const dynamic = "force-dynamic";
export const metadata = { title: "Auth events" };

function describeRow(status: string, code: string): { label: string; tone: "ok" | "pending" | "fail"; message: string } {
  if (status === "verified") return { label: "✅ Success", tone: "ok", message: "Signed in" };
  if (status === "sent") return { label: "📤 Code sent", tone: "pending", message: "OTP sent to device" };
  const m = status === "verify_failed" ? describeVerifyError(code) : describeAuthError(code);
  return { label: status === "verify_failed" ? "❌ Verify failed" : "❌ Send failed", tone: "fail", message: m.message };
}

// Compact UTC timestamp: "2026-06-09 06:30:12".
const fmtTime = (iso: string) => (iso ? iso.slice(0, 19).replace("T", " ") : "—");

export default async function AuthEventsPage() {
  await verifyAdmin();
  const events = await getRecentAuthEvents(200);

  const failures = events.filter((e) => e.status === "failed" || e.status === "verify_failed");
  // Top failure reasons (code → count) so you can see WHY users fail at a glance.
  const byCode = new Map<string, number>();
  for (const e of failures) byCode.set(e.code, (byCode.get(e.code) ?? 0) + 1);
  const topReasons = [...byCode.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  const verified = events.filter((e) => e.status === "verified").length;
  const sent = events.filter((e) => e.status === "sent").length;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold">Auth events</h1>
        <Badge tone="brand">Staff</Badge>
        <Link href="/admin" className="ml-auto text-sm text-brand hover:underline">← Admin</Link>
      </div>
      <p className="mt-1 text-sm text-muted">
        Newest first. Phone numbers are masked by design. Times are UTC.
      </p>

      {/* Summary */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4"><p className="text-2xl font-bold">{events.length}</p><p className="text-xs text-muted">Events (last 200)</p></div>
        <div className="rounded-2xl border border-border bg-card p-4"><p className="text-2xl font-bold text-green-600">{verified}</p><p className="text-xs text-muted">Verified (success)</p></div>
        <div className="rounded-2xl border border-border bg-card p-4"><p className="text-2xl font-bold">{sent}</p><p className="text-xs text-muted">Codes sent</p></div>
        <div className="rounded-2xl border border-border bg-card p-4"><p className="text-2xl font-bold text-red-600">{failures.length}</p><p className="text-xs text-muted">Failures</p></div>
      </div>

      {/* Top failure reasons */}
      {topReasons.length > 0 && (
        <div className="mt-4 rounded-2xl border border-border bg-card p-4">
          <p className="text-sm font-semibold">Top failure reasons</p>
          <ul className="mt-2 flex flex-col gap-1.5 text-sm">
            {topReasons.map(([code, count]) => (
              <li key={code} className="flex items-start gap-2">
                <span className="inline-flex min-w-7 justify-center rounded-full bg-red-100 px-1.5 text-xs font-bold text-red-700">{count}</span>
                <span className="font-mono text-xs text-muted">{code}</span>
                <span className="text-xs">{describeVerifyError(code).message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Events table */}
      <div className="mt-5 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-surface text-left text-xs text-muted">
            <tr>
              <th className="px-3 py-2">Time (UTC)</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Phone</th>
              <th className="px-3 py-2">Code</th>
              <th className="px-3 py-2">Message</th>
              <th className="px-3 py-2">Device / browser</th>
              <th className="px-3 py-2">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {events.length === 0 ? (
              <tr><td colSpan={7} className="px-3 py-10 text-center text-muted">No auth events yet. They appear the moment someone attempts login.</td></tr>
            ) : (
              events.map((e: AuthEventRow) => {
                const d = describeRow(e.status, e.code);
                return (
                  <tr key={e.id} className={d.tone === "fail" ? "bg-red-50/40" : ""}>
                    <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">{fmtTime(e.ts)}</td>
                    <td className={`whitespace-nowrap px-3 py-2 text-xs font-semibold ${d.tone === "ok" ? "text-green-700" : d.tone === "fail" ? "text-red-700" : "text-muted"}`}>{d.label}</td>
                    <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">{e.phoneMasked}{e.country ? <span className="ml-1 text-muted">{e.country}</span> : null}</td>
                    <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">{e.code || "—"}</td>
                    <td className="px-3 py-2 text-xs">{d.message}</td>
                    <td className="px-3 py-2 text-xs text-muted" title={e.ua}>
                      {e.inApp ? <span className="font-semibold text-amber-700">📱 {e.inApp}</span> : null}
                      {e.inApp && e.ua ? " · " : null}
                      <span className="inline-block max-w-[260px] truncate align-bottom">{e.ua || "—"}</span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">{e.ip || "—"}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
