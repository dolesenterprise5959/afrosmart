import type { ReferralSummary } from "@/lib/firestore/referrals";
import type { AppNotification } from "@/lib/firestore/notifications";
import { referralProgress, REFERRALS_PER_REWARD, REWARD_USD } from "@/lib/referral";
import { CopyButton } from "@/components/ui/CopyButton";

const WITHDRAW_MIN = 10; // display-only; withdrawals are out of scope in Phase 1.
const SITE = "https://afrosmart.app";

/** Presentational wallet UI — pure render from data (no auth/IO), so it can be
 *  reused by the real /wallet page and rendered for screenshots/proof. */
export function WalletView({ summary: s, notes }: { summary: ReferralSummary; notes: AppNotification[] }) {
  const p = referralProgress(s.referralCount);
  const pct = Math.round((p.intoCurrent / REFERRALS_PER_REWARD) * 100);
  const eligible = s.walletBalance >= WITHDRAW_MIN;
  const shareUrl = s.referralCode ? `${SITE}/welcome?ref=${s.referralCode}` : SITE;
  const waText = `Join me on AfroSmart — Liberia's marketplace. Use my referral code ${s.referralCode} when you sign up: ${shareUrl}`;

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-6">
      <h1 className="text-2xl font-bold tracking-tight">💳 Wallet</h1>
      <p className="mt-1 text-sm text-muted">
        Earn US$ {REWARD_USD} for every {REFERRALS_PER_REWARD} friends who join with your code and post their first listing.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted">Wallet balance</p>
          <p className="mt-1 text-2xl font-bold">US$ {s.walletBalance.toFixed(2)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted">Lifetime earnings</p>
          <p className="mt-1 text-2xl font-bold">US$ {s.lifetimeEarnings.toFixed(2)}</p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">Next US$ {REWARD_USD} reward</span>
          <span className="text-muted">{p.intoCurrent}/{REFERRALS_PER_REWARD} valid referrals</span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-surface">
          <div className="h-full rounded-full bg-success transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-xs text-muted">
          {p.needed} more valid referral{p.needed === 1 ? "" : "s"} to earn your next US$ {REWARD_USD}.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted">Valid referrals</p>
          <p className="mt-1 text-xl font-bold">{s.referralCount}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted">Withdrawal</p>
          <p className={`mt-1 text-sm font-semibold ${eligible ? "text-success" : "text-muted"}`}>
            {eligible ? "Eligible ✓" : `Opens at US$ ${WITHDRAW_MIN}`}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-accent/40 bg-accent/5 p-4 text-center">
        <p className="text-xs text-muted">Your referral code</p>
        <p className="mt-1 text-2xl font-extrabold tracking-[0.3em] text-foreground">{s.referralCode || "—"}</p>
        {s.referralCode && (
          <div className="mt-3 flex justify-center gap-2">
            <CopyButton
              text={s.referralCode}
              label="📋 Copy code"
              copiedLabel="Copied!"
              className="inline-flex h-10 items-center rounded-full border border-border bg-card px-4 text-sm font-semibold hover:bg-surface"
            />
            <a
              href={`https://wa.me/?text=${encodeURIComponent(waText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-1.5 rounded-full bg-[#25D366] px-4 text-sm font-semibold text-white hover:brightness-95"
            >
              💬 Share
            </a>
          </div>
        )}
        <p className="mt-3 text-xs text-muted">
          When a friend signs up with your code and posts their first listing, it counts toward your next reward.
        </p>
      </div>

      {notes.length > 0 && (
        <div className="mt-4">
          <h2 className="mb-2 text-sm font-semibold text-muted">Recent activity</h2>
          <ul className="flex flex-col gap-2">
            {notes.map((n) => (
              <li key={n.id} className="rounded-xl border border-border bg-card p-3">
                <p className="text-sm font-semibold">{n.title}</p>
                <p className="mt-0.5 text-xs text-muted">{n.body}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
