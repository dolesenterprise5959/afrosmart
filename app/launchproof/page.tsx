import { NameForm } from "@/components/onboarding/NameForm";
import { WalletView } from "@/components/wallet/WalletView";

export const dynamic = "force-dynamic";

// TEMPORARY public proof route — screenshots the referral signup field + wallet UI
// without needing auth. Removed immediately after capture.
export default function LaunchProofPage() {
  const sampleSummary = {
    referralCode: "AF7K9QXM",
    referralCount: 13,
    walletBalance: 5,
    lifetimeEarnings: 5,
  };
  const sampleNotes = [
    {
      id: "1", type: "referral", read: false, createdAt: new Date().toISOString(),
      title: "🎉 You earned US$ 5!",
      body: "That's 10 valid referrals — US$ 5 was added to your wallet.",
    },
    {
      id: "2", type: "referral", read: false, createdAt: new Date().toISOString(),
      title: "🎉 New valid referral!",
      body: "A friend you referred just posted their first listing. You now have 13 valid referrals.",
    },
  ];
  return (
    <div>
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-sm px-4 py-6">
          <h2 className="text-center text-lg font-bold">Signup — referral code entry</h2>
          <NameForm next="/dashboard" defaultReferralCode="AF7K9QXM" />
        </div>
      </div>
      <WalletView summary={sampleSummary} notes={sampleNotes} />
    </div>
  );
}
