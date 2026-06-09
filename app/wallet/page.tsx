import type { Metadata } from "next";
import { verifySession } from "@/lib/auth/dal";
import { getReferralSummary } from "@/lib/firestore/referrals";
import { getRecentNotifications } from "@/lib/firestore/notifications";
import { WalletView } from "@/components/wallet/WalletView";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Wallet" };

export default async function WalletPage() {
  const session = await verifySession();
  const [summary, notes] = await Promise.all([
    getReferralSummary(session.uid),
    getRecentNotifications(session.uid, 8),
  ]);
  return <WalletView summary={summary} notes={notes} />;
}
