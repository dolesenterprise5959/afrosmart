import type { Metadata } from "next";
import Link from "next/link";
import { verifySession } from "@/lib/auth/dal";
import { getMyVerification } from "@/lib/firestore/verification";
import { VerifyForm } from "@/components/verify/VerifyForm";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Get Verified",
  description: "Apply for a Verified Seller or Verified Business badge on AfroSmart.",
};

const benefits = [
  "A trust badge shown on your profile and every listing",
  "Higher buyer confidence and more responses",
  "Eligibility for featured placement (Premium)",
];

export default async function VerifyPage() {
  const session = await verifySession();
  const v = await getMyVerification(session.uid);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold">Get Verified</h1>
      <p className="mt-1 text-sm text-muted">
        Build trust with buyers across Liberia with a verified badge.
      </p>

      {v.verified ? (
        <div className="mt-6 rounded-2xl border border-brand/30 bg-brand/5 p-5">
          <div className="flex items-center gap-2">
            <VerifiedBadge kind={v.verifiedType === "business" ? "business" : "seller"} />
            <span className="text-sm font-medium">You&apos;re verified 🎉</span>
          </div>
          <p className="mt-2 text-sm text-muted">
            Your badge now appears on your <Link href={`/u/${session.uid}`} className="text-brand">profile</Link>{" "}
            and listings.
          </p>
        </div>
      ) : v.status === "pending" ? (
        <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-800">
          <p className="text-sm font-semibold">Your request is under review ⏳</p>
          <p className="mt-1 text-sm">
            Our team reviews verification requests regularly. You&apos;ll see your badge here once
            you&apos;re approved.
          </p>
        </div>
      ) : (
        <>
          {v.status === "rejected" && (
            <div className="mt-6 rounded-xl border border-border bg-surface p-3 text-sm text-muted">
              Your previous request wasn&apos;t approved. You&apos;re welcome to apply again with
              more detail.
            </div>
          )}
          <div className="mt-6 rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">Why get verified?</h2>
            <ul className="mt-2 space-y-1.5 text-sm text-muted">
              {benefits.map((b) => (
                <li key={b} className="flex gap-2">
                  <span className="text-brand">✓</span>
                  {b}
                </li>
              ))}
            </ul>
            <VerifyForm />
          </div>
        </>
      )}
    </div>
  );
}
