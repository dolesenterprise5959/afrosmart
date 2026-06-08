import type { Metadata } from "next";
import { verifySession } from "@/lib/auth/dal";
import { getReferralSummary } from "@/lib/firestore/referrals";
import { referralProgress, REFERRALS_PER_REWARD, REWARD_USD } from "@/lib/referral";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Wallet" };

// Display-only eligibility threshold — actual withdrawals are out of scope in Phase 1.
const WITHDRAW_MIN = 10;

export default async function WalletPage() {
  const session = await verifySession();
  const s = await getReferralSummary(session.uid);
  const p = referralProgress(s.referralCount);
  const pct = Math.round((p.intoCurrent / REFERRALS_PER_REWARD) * 100);
  const eligible = s.walletBalance >= WITHDRAW_MIN;

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-6">
      <h1 className="text-2xl font-bold tracking-tight">💳 Wallet</h1>
      <p className="mt-1 text-sm text-muted">
        Earn US$ {REWARD_USD} for every {REFERRALS_PER_REWARD} friends who join with your code and post their first listing.
      </p>

      {/* Balance + lifetime earnings */}
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

      {/* Progress tracker toward the next reward */}
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

      {/* Pending count + withdrawal eligibility */}
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

      {/* Shareable referral code */}
      <div className="mt-4 rounded-2xl border border-accent/40 bg-accent/5 p-4 text-center">
        <p className="text-xs text-muted">Your referral code</p>
        <p className="mt-1 text-2xl font-extrabold tracking-[0.3em] text-foreground">{s.referralCode || "—"}</p>
        <p className="mt-2 text-xs text-muted">
          Share it with friends. When they sign up and post their first listing, it counts toward your next reward.
        </p>
      </div>
    </div>
  );
}
